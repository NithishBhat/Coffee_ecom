const router = require('express').Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation, sendLowStockAlert } = require('../utils/emailTemplates');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/orders/create — create Razorpay order
router.post('/create', async (req, res, next) => {
  try {
    const { customer, items } = req.body;

    // Validate required fields
    if (!customer?.name || !customer?.email || !customer?.phone) {
      return res.status(400).json({ success: false, message: 'Customer details required' });
    }
    if (!customer?.address?.street || !customer?.address?.city || !customer?.address?.state || !customer?.address?.pincode) {
      return res.status(400).json({ success: false, message: 'Complete address required' });
    }
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Re-fetch prices from DB to prevent manipulation
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });

    if (products.length !== items.length) {
      return res.status(400).json({ success: false, message: 'Some products are unavailable' });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ${item.productId} not found` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ success: false, message: `${product.name} has only ${product.stockQuantity} units in stock` });
      }
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        weight: product.weight,
      });
      subtotal += product.price * item.quantity;
    }

    const deliveryFee = subtotal >= 500 ? 0 : 50;
    const totalAmount = subtotal + deliveryFee;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    // Save order to DB
    const orderId = await Order.getNextOrderId();
    const order = await Order.create({
      orderId,
      customer,
      items: orderItems,
      subtotal,
      deliveryFee,
      totalAmount,
      razorpayOrderId: razorpayOrder.id,
    });

    res.json({
      success: true,
      orderId: order.orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount * 100,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/verify — verify Razorpay payment
router.post('/verify', async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await Order.findOneAndUpdate({ orderId }, { paymentStatus: 'failed' });
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update order
    const order = await Order.findOneAndUpdate(
      { orderId, paymentStatus: 'pending' },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentStatus: 'paid',
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or already processed' });
    }

    // Decrement stock and check low stock
    const lowStockProducts = [];
    for (const item of order.items) {
      const product = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stockQuantity: -item.quantity } },
        { new: true }
      );
      if (
        product &&
        product.stockQuantity <= product.lowStockThreshold &&
        !product.lowStockAlertSent
      ) {
        product.lowStockAlertSent = true;
        await product.save();
        lowStockProducts.push(product);
      }
    }

    // Send emails (non-blocking)
    sendOrderConfirmation(order);
    if (lowStockProducts.length > 0) {
      sendLowStockAlert(lowStockProducts);
    }

    res.json({ success: true, orderId: order.orderId });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/track-by-phone — summary list of orders for a phone number
router.get('/track-by-phone', async (req, res, next) => {
  try {
    const { phone } = req.query;
    console.log('[track-by-phone] query:', req.query);
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    const phone10 = phone.replace(/^\+?91/, '').slice(-10);
    const query = {
      $or: [
        { 'customer.phone': phone10 },
        { 'customer.phone': `+91${phone10}` },
        { 'customer.phone': `91${phone10}` },
      ],
    };
    console.log('[track-by-phone] db query:', JSON.stringify(query));
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .select('orderId createdAt totalAmount fulfillmentStatus');
    console.log('[track-by-phone] found:', orders.length, 'orders');
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/track — public tracking by orderId + phone
router.get('/track', async (req, res, next) => {
  try {
    const { orderId, phone } = req.query;
    console.log('[track] query:', req.query);
    if (!orderId || !phone) {
      return res.status(400).json({ success: false, message: 'Order ID and phone number are required' });
    }
    // Normalize to last 10 digits to handle +91/91 prefix variations
    const phone10 = phone.replace(/^\+?91/, '').slice(-10);
    const query = {
      orderId: orderId.trim(),
      $or: [
        { 'customer.phone': phone10 },
        { 'customer.phone': `+91${phone10}` },
        { 'customer.phone': `91${phone10}` },
      ],
    };
    console.log('[track] db query:', JSON.stringify(query));
    const order = await Order.findOne(query);
    console.log('[track] found:', order ? order.orderId : 'null');
    if (!order) {
      return res.status(404).json({ success: false, message: 'No order found matching that ID and phone number' });
    }
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id — get order details
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
