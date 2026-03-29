import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiSearch, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';

const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];
const STEP_MAP = { pending: 0, processing: 1, shipped: 2, delivered: 3 };

const PAYMENT_COLORS = {
  pending: 'text-yellow-600 bg-yellow-50',
  paid: 'text-green-600 bg-green-50',
  failed: 'text-red-600 bg-red-50',
};

export default function TrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [phone, setPhone] = useState(
    searchParams.get('phone') || localStorage.getItem('customerPhone') || ''
  );
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchOrder = useCallback(async (oid, ph) => {
    setLoading(true);
    setOrder(null);
    try {
      const { data } = await api.get('/orders/track', {
        params: { orderId: oid.trim(), phone: ph },
      });
      setOrder(data.order);
    } catch {
      toast.error('No order found. Check your Order ID and phone number.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  // Auto-search on mount if URL has both params
  useEffect(() => {
    const urlOrderId = searchParams.get('orderId');
    const urlPhone = searchParams.get('phone');
    if (urlOrderId && urlPhone) {
      fetchOrder(urlOrderId, urlPhone);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderId.trim()) return toast.error('Enter your Order ID');
    if (!/^\d{10}$/.test(phone)) return toast.error('Enter a valid 10-digit phone number');

    setSearchParams({ orderId: orderId.trim(), phone });
    fetchOrder(orderId, phone);
  };

  const currentStep = order ? (STEP_MAP[order.fulfillmentStatus] ?? 0) : 0;
  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-coffee-200 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:border-transparent text-sm';

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <FiPackage className="mx-auto text-coffee-500 mb-4" size={48} />
        <h1 className="font-display text-3xl font-bold text-coffee-800 mb-2">Track Your Order</h1>
        <p className="text-coffee-500">
          Enter your Order ID and phone number to view order details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col gap-4">
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Order ID (e.g. ORD-1001)"
            className={inputClass}
            required
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number (10 digits)"
            inputMode="numeric"
            maxLength={10}
            className={inputClass}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-coffee-600 hover:bg-coffee-700 disabled:bg-coffee-300 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            <FiSearch size={18} />
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </div>
      </form>

      {/* No results */}
      {searched && !order && !loading && (
        <div className="text-center py-8 bg-white rounded-xl shadow-sm">
          <p className="text-coffee-500">No orders found. Double-check your details.</p>
        </div>
      )}

      {/* Full order details */}
      {order && (
        <div className="space-y-6">
          {/* Fulfillment Progress */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-coffee-800">Order {order.orderId}</h2>
              <span
                className={`text-xs px-3 py-1 rounded-full capitalize font-medium ${PAYMENT_COLORS[order.paymentStatus]}`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-coffee-100" />
              <div
                className="absolute top-4 left-0 h-0.5 bg-green-500 transition-all duration-500"
                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              />
              {STEPS.map((step, i) => (
                <div key={step} className="relative flex flex-col items-center z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                      i <= currentStep
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-coffee-200 text-coffee-400'
                    }`}
                  >
                    {i < currentStep ? '\u2713' : i + 1}
                  </div>
                  <span
                    className={`text-xs mt-2 ${i <= currentStep ? 'text-green-600 font-semibold' : 'text-coffee-400'}`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-coffee-800 mb-4">Items Ordered</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-coffee-600">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
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

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-coffee-800 mb-3">Delivery Address</h2>
            <p className="text-sm text-coffee-600">
              {order.customer.name}
              <br />
              {order.customer.address.street}
              <br />
              {order.customer.address.city}, {order.customer.address.state} —{' '}
              {order.customer.address.pincode}
              <br />
              Phone: {order.customer.phone}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {order.paymentStatus === 'paid' && (
              <Link
                to={`/invoice/${order.orderId}?phone=${encodeURIComponent(phone)}`}
                className="flex-1 text-center bg-coffee-600 hover:bg-coffee-700 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Download Invoice
              </Link>
            )}
            <Link
              to="/products"
              className="flex-1 text-center border-2 border-coffee-600 text-coffee-600 hover:bg-coffee-600 hover:text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
