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

// Counter schema for auto-incrementing order IDs
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 1000 },
});

const Counter = mongoose.model('Counter', counterSchema);

orderSchema.statics.getNextOrderId = async function () {
  const counter = await Counter.findByIdAndUpdate(
    'orderId',
    { $inc: { seq: 1 }, $setOnInsert: { _id: 'orderId' } },
    { new: true, upsert: true }
  );
  return `ORD-${1000 + counter.seq}`;
};

module.exports = mongoose.model('Order', orderSchema);
