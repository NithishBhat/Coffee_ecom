import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiMessageCircle } from 'react-icons/fi';
import api from '../utils/api';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-16 w-16 bg-coffee-100 rounded-full mx-auto mb-4" />
        <div className="h-8 bg-coffee-100 rounded w-2/3 mx-auto mb-4" />
        <div className="h-4 bg-coffee-100 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-coffee-800 mb-4">Order Not Found</h2>
        <Link to="/" className="text-coffee-600 underline">Go Home</Link>
      </div>
    );
  }

  const whatsappMsg = encodeURIComponent(`Hi, I just placed order #${order.orderId}`);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <FiCheckCircle className="mx-auto text-green-500 mb-4" size={64} />
        <h1 className="font-display text-3xl font-bold text-coffee-800 mb-2">Order Placed Successfully!</h1>
        <p className="text-coffee-500">Order ID: <span className="font-semibold text-coffee-700">{order.orderId}</span></p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-coffee-800 mb-4">Order Details</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-coffee-600">
              <span>{item.name} x{item.quantity}</span>
              <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <hr className="border-coffee-100" />
          <div className="flex justify-between text-sm text-coffee-600">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm text-coffee-600">
            <span>Delivery</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
          </div>
          <div className="flex justify-between font-bold text-coffee-800">
            <span>Total</span>
            <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-coffee-800 mb-3">Delivery Address</h2>
        <p className="text-sm text-coffee-600">
          {order.customer.name}<br />
          {order.customer.address.street}<br />
          {order.customer.address.city}, {order.customer.address.state} — {order.customer.address.pincode}<br />
          Phone: {order.customer.phone}
        </p>
        <p className="text-sm text-coffee-400 mt-3">Estimated delivery: 3-5 business days</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={`https://wa.me/919999999999?text=${whatsappMsg}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          <FiMessageCircle /> Chat on WhatsApp
        </a>
        <Link
          to="/products"
          className="flex-1 text-center border-2 border-coffee-600 text-coffee-600 hover:bg-coffee-600 hover:text-white py-3 rounded-xl font-semibold transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
