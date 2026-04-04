import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiMessageCircle, FiCopy, FiFileText, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];
const STEP_MAP = { pending: 0, processing: 1, shipped: 2, delivered: 3 };

export default function OrderConfirmation() {
  const { id } = useParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const cleared = useRef(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => {
        setOrder(res.data.order);
        if (!cleared.current && res.data.order.paymentStatus === 'paid') {
          clearCart();
          cleared.current = true;
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, clearCart]);

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

  const currentStep = STEP_MAP[order.fulfillmentStatus] ?? 0;

  const whatsappMsg = encodeURIComponent(
    `Hi! My order details:\nOrder ID: ${order.orderId}\nTotal: ₹${order.totalAmount.toLocaleString('en-IN')}\nItems: ${order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}`
  );

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    toast.success('Order ID copied!');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {order.paymentStatus === 'refunded' ? (
        <>
          <div className="text-center mb-8">
            <FiAlertTriangle className="mx-auto text-red-500 mb-4" size={64} />
            <h1 className="font-display text-3xl font-bold text-coffee-800 mb-2">Order Refunded</h1>
            <p className="text-coffee-500">Order ID: <span className="font-semibold text-coffee-700">{order.orderId}</span></p>
          </div>

          {/* Refund Banner */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-red-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-coffee-800">Refund Details</h2>
              <span className="text-xs px-3 py-1 rounded-full font-medium text-red-700 bg-red-100">
                Refunded
              </span>
            </div>
            <div className="flex items-start gap-3 bg-red-50 rounded-lg p-4">
              <FiAlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="space-y-2 text-sm">
                {order.refundReason && (
                  <p className="text-red-700 font-medium">{order.refundReason}</p>
                )}
                <p className="text-red-600">Refund will reflect in your account within 5-7 business days.</p>
                {order.razorpayPaymentId && (
                  <p className="text-coffee-500 text-xs">Payment ID: {order.razorpayPaymentId}</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="text-center mb-8">
            <FiCheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h1 className="font-display text-3xl font-bold text-coffee-800 mb-2">Order Placed Successfully!</h1>
            <p className="text-coffee-500">Order ID: <span className="font-semibold text-coffee-700">{order.orderId}</span></p>
          </div>

          {/* Save Order ID banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-3">
            <p className="text-sm text-amber-800">
              Save your order ID: <span className="font-bold">{order.orderId}</span> to track your order
            </p>
            <button onClick={copyOrderId} className="flex-shrink-0 text-amber-700 hover:text-amber-900 transition-colors">
              <FiCopy size={18} />
            </button>
          </div>

          {/* Fulfillment Progress */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-coffee-800 mb-5">Order Status</h2>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-coffee-100" />
              <div
                className="absolute top-4 left-0 h-0.5 bg-green-500 transition-all duration-500"
                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              />
              {STEPS.map((step, i) => (
                <div key={step} className="relative flex flex-col items-center z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    i <= currentStep
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-coffee-200 text-coffee-400'
                  }`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs mt-2 ${i <= currentStep ? 'text-green-600 font-semibold' : 'text-coffee-400'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Order Details */}
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
          <div className="flex justify-between text-sm text-coffee-600">
            <span>Payment</span>
            <span className={`capitalize font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : order.paymentStatus === 'refunded' ? 'text-red-600' : 'text-yellow-600'}`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
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
        {order.paymentStatus !== 'refunded' && (
          <>
            <Link
              to={`/invoice/${order.orderId}?phone=${encodeURIComponent(order.customer.phone)}`}
              className="flex-1 flex items-center justify-center gap-2 bg-coffee-600 hover:bg-coffee-700 text-white min-h-[44px] py-3 rounded-xl font-semibold transition-colors"
            >
              <FiFileText /> Download Invoice
            </Link>
            <a
              href={`https://wa.me/?text=${whatsappMsg}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white min-h-[44px] py-3 rounded-xl font-semibold transition-colors"
            >
              <FiMessageCircle /> Share on WhatsApp
            </a>
          </>
        )}
        <Link
          to={order.paymentStatus === 'refunded' ? '/products' : `/track?orderId=${encodeURIComponent(order.orderId)}&phone=${encodeURIComponent(order.customer.phone)}`}
          className="flex-1 text-center border-2 border-coffee-600 text-coffee-600 hover:bg-coffee-600 hover:text-white min-h-[44px] py-3 rounded-xl font-semibold transition-colors"
        >
          {order.paymentStatus === 'refunded' ? 'Continue Shopping' : 'Track Order'}
        </Link>
      </div>
    </div>
  );
}
