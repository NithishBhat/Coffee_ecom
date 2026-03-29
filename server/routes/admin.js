const router = require('express').Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
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
    // Reset low stock alert if stock is restocked above threshold
    if (product.stockQuantity > product.lowStockThreshold && product.lowStockAlertSent) {
      product.lowStockAlertSent = false;
      await product.save();
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

// GET /api/admin/reviews — all reviews
router.get('/reviews', async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).populate('productId', 'name');
    res.json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/reviews/:id — delete a review
router.delete('/reviews/:id', async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/low-stock — products below threshold
router.get('/low-stock', async (req, res, next) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
      isActive: true,
    }).select('name stockQuantity lowStockThreshold').sort({ stockQuantity: 1 });
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stats — sales analytics
router.get('/stats', async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const paid = { paymentStatus: 'paid' };

    const [
      periodStats,
      dailyRevenue,
      topProducts,
    ] = await Promise.all([
      // Period aggregation: total, today, week, month in one pipeline
      Order.aggregate([
        { $match: paid },
        {
          $facet: {
            total: [
              { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
            ],
            today: [
              { $match: { createdAt: { $gte: todayStart } } },
              { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
            ],
            week: [
              { $match: { createdAt: { $gte: weekStart } } },
              { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
            ],
            month: [
              { $match: { createdAt: { $gte: monthStart } } },
              { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
            ],
          },
        },
      ]),

      // Daily revenue for last 7 days
      Order.aggregate([
        { $match: { ...paid, createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top 5 products by quantity sold
      Order.aggregate([
        { $match: paid },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            totalQty: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalQty: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, name: '$_id', totalQty: 1, totalRevenue: 1 } },
      ]),
    ]);

    const extract = (arr) => ({
      revenue: arr[0]?.revenue || 0,
      orders: arr[0]?.orders || 0,
    });

    const facets = periodStats[0];
    const total = extract(facets.total);
    const today = extract(facets.today);
    const week = extract(facets.week);
    const month = extract(facets.month);

    // Fill in missing days for the chart
    const dailyMap = {};
    for (const d of dailyRevenue) {
      dailyMap[d._id] = d;
    }
    const dailyChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyChart.push({
        date: key,
        revenue: dailyMap[key]?.revenue || 0,
        orders: dailyMap[key]?.orders || 0,
      });
    }

    res.json({
      success: true,
      stats: {
        total,
        today,
        week,
        month,
        avgOrderValue: total.orders > 0 ? Math.round(total.revenue / total.orders) : 0,
        dailyChart,
        topProducts,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
