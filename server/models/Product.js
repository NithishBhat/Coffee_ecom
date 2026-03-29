const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    weight: { type: String, required: true },
    roastType: {
      type: String,
      enum: ['light', 'medium', 'dark'],
      required: true,
    },
    origin: { type: String, required: true },
    imageUrl: { type: String, required: true },
    stockQuantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    lowStockAlertSent: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
