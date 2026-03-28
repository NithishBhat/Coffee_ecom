const router = require('express').Router();
const Product = require('../models/Product');

// GET /api/products — list active products, optional roastType filter
router.get('/', async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.roastType) {
      filter.roastType = req.query.roastType;
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
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

module.exports = router;
