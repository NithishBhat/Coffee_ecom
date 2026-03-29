const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true, trim: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One review per phone per product
reviewSchema.index({ productId: 1, customerPhone: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
