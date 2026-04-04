const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');

// GET /api/products — list active products, optional roastType filter
router.get('/', async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.roastType) {
      filter.roastType = req.query.roastType;
    }
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

    // Attach average rating to each product
    const productIds = products.map((p) => p._id);
    const ratings = await Review.aggregate([
      { $match: { productId: { $in: productIds } } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const ratingMap = {};
    for (const r of ratings) {
      ratingMap[r._id.toString()] = { avgRating: Math.round(r.avgRating * 10) / 10, reviewCount: r.count };
    }
    for (const p of products) {
      const r = ratingMap[p._id.toString()];
      p.avgRating = r?.avgRating || 0;
      p.reviewCount = r?.reviewCount || 0;
    }

    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id — single product
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id/reviews — reviews for a product
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 });
    const stats = await Review.aggregate([
      { $match: { productId: reviews.length > 0 ? reviews[0].productId : null } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    // Recalculate from the fetched reviews if aggregate didn't match
    let avgRating = 0;
    let count = reviews.length;
    if (count > 0) {
      avgRating = Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10;
    }
    res.json({ success: true, reviews, avgRating, reviewCount: count });
  } catch (err) {
    next(err);
  }
});

const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many reviews submitted, try again later' },
});

// POST /api/products/:id/reviews — submit a review (purchase-verified)
router.post('/:id/reviews', reviewLimiter, async (req, res, next) => {
  try {
    const { customerPhone, rating, reviewText } = req.body;

    if (!customerPhone || !rating || !reviewText?.trim()) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
    }
    if (!/^\d{10}$/.test(customerPhone)) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit phone required' });
    }

    // Check product exists
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check for duplicate review
    const existing = await Review.findOne({ productId: req.params.id, customerPhone });
    if (existing) {
      return res.status(400).json({ success: false, message: "You've already reviewed this product." });
    }

    // Verify purchase and get customer name
    const phone10 = customerPhone.replace(/^\+?91/, '').slice(-10);
    const verifiedOrder = await Order.findOne({
      'items.productId': product._id,
      paymentStatus: 'paid',
      $or: [
        { 'customer.phone': phone10 },
        { 'customer.phone': `+91${phone10}` },
        { 'customer.phone': `91${phone10}` },
      ],
    });

    if (!verifiedOrder) {
      return res.status(403).json({ success: false, message: 'You can only review products you\'ve purchased' });
    }

    const review = await Review.create({
      productId: req.params.id,
      customerName: verifiedOrder.customer.name,
      customerPhone,
      rating: Math.round(rating),
      reviewText: reviewText.trim(),
      isVerified: true,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "You've already reviewed this product." });
    }
    next(err);
  }
});

module.exports = router;
