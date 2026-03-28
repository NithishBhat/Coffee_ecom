const router = require('express').Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { sendOrderStatusUpdate } = require('../utils/emailTemplates');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, try again later' },
});

// POST /api/admin/login
router.post('/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }
  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ success: true, token });
});

// All routes below require auth
router.use(auth);

// GET /api/admin/products — list all products (including inactive)
router.get('/products', async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/products — add product
router.post('/products', async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/products/:id — update product
router.put('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/products/:id — delete product
router.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/orders — list all orders
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/orders/:id — update fulfillment status
router.put('/orders/:id', async (req, res, next) => {
  try {
    const { fulfillmentStatus } = req.body;
    // Fetch current order to compare old status
    const existing = await Order.findOne({ orderId: req.params.id });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const oldStatus = existing.fulfillmentStatus;
    existing.fulfillmentStatus = fulfillmentStatus;
    await existing.save();

    // Only send email if status actually changed
    if (oldStatus !== fulfillmentStatus) {
      sendOrderStatusUpdate(existing, fulfillmentStatus);
    }

    res.json({ success: true, order: existing });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stats — basic stats
router.get('/stats', async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const [totalOrders, totalRevenue, todayOrders, todayRevenue, weekOrders, weekRevenue] =
      await Promise.all([
        Order.countDocuments({ paymentStatus: 'paid' }),
        Order.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Order.countDocuments({ paymentStatus: 'paid', createdAt: { $gte: todayStart } }),
        Order.aggregate([
          { $match: { paymentStatus: 'paid', createdAt: { $gte: todayStart } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Order.countDocuments({ paymentStatus: 'paid', createdAt: { $gte: weekStart } }),
        Order.aggregate([
          { $match: { paymentStatus: 'paid', createdAt: { $gte: weekStart } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
      ]);

    res.json({
      success: true,
      stats: {
        total: { orders: totalOrders, revenue: totalRevenue[0]?.total || 0 },
        today: { orders: todayOrders, revenue: todayRevenue[0]?.total || 0 },
        week: { orders: weekOrders, revenue: weekRevenue[0]?.total || 0 },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
