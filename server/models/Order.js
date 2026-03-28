const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
      },
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number,
        weight: String,
      },
    ],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    fulfillmentStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const crypto = require('crypto');

orderSchema.statics.getNextOrderId = async function () {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 10; attempt++) {
    const bytes = crypto.randomBytes(6);
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[bytes[i] % chars.length];
    }
    const id = `ORD-${code}`;
    const exists = await this.findOne({ orderId: id }).lean();
    if (!exists) return id;
  }
  throw new Error('Failed to generate unique order ID');
};

module.exports = mongoose.model('Order', orderSchema);
