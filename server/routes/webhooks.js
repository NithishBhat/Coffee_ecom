const router = require('express').Router();
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/webhooks/razorpay — backup payment confirmation
router.post('/razorpay', async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ success: false, message: 'No signature' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body.event;
    if (event === 'payment.captured') {
      const payment = req.body.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      const order = await Order.findOneAndUpdate(
        { razorpayOrderId, paymentStatus: 'pending' },
        {
          razorpayPaymentId: payment.id,
          paymentStatus: 'paid',
        },
        { new: true }
      );

      if (order) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stockQuantity: -item.quantity },
          });
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
