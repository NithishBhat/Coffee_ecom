import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
};

const PAYMENT_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    api.get('/admin/orders')
      .then((res) => setOrders(res.data.orders))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (orderId, fulfillmentStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}`, { fulfillmentStatus });
      toast.success(`Order ${orderId} updated to ${fulfillmentStatus}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/dashboard" className="text-coffee-500 hover:text-coffee-700"><FiArrowLeft size={20} /></Link>
        <h1 className="font-display text-2xl font-bold text-coffee-800">Orders</h1>
        <span className="text-sm text-coffee-400 ml-auto">{orders.length} total</span>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl h-20" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-coffee-400 text-lg">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                className="flex flex-wrap items-center gap-3 p-4 cursor-pointer hover:bg-coffee-50/50"
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
              >
                <span className="font-semibold text-coffee-800 text-sm">{order.orderId}</span>
                <span className="text-sm text-coffee-500">{order.customer.name}</span>
                <span className="text-sm font-semibold text-coffee-700">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${PAYMENT_COLORS[order.paymentStatus]}`}>
                  {order.paymentStatus}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.fulfillmentStatus]}`}>
                  {order.fulfillmentStatus}
                </span>
                <span className="text-xs text-coffee-400 ml-auto hidden sm:block">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                {expanded === order._id ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </div>

              {expanded === order._id && (
                <div className="border-t border-coffee-50 p-4 bg-coffee-50/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Items */}
                    <div>
                      <h3 className="text-sm font-semibold text-coffee-700 mb-2">Items</h3>
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm text-coffee-600 mb-1">
                          <span>{item.name} x{item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                      <hr className="my-2 border-coffee-100" />
                      <div className="flex justify-between text-sm">
                        <span className="text-coffee-500">Subtotal: ₹{order.subtotal}</span>
                        <span className="text-coffee-500">Delivery: {order.deliveryFee === 0 ? 'Free' : `₹${order.deliveryFee}`}</span>
                      </div>
                    </div>

                    {/* Customer */}
                    <div>
                      <h3 className="text-sm font-semibold text-coffee-700 mb-2">Customer</h3>
                      <div className="text-sm text-coffee-600 space-y-1">
                        <p>{order.customer.name}</p>
                        <p>{order.customer.phone} | {order.customer.email}</p>
                        <p>{order.customer.address.street}, {order.customer.address.city}</p>
                        <p>{order.customer.address.state} — {order.customer.address.pincode}</p>
                      </div>
                      {order.razorpayPaymentId && (
                        <p className="text-xs text-coffee-400 mt-2">Payment ID: {order.razorpayPaymentId}</p>
                      )}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-sm text-coffee-600">Update status:</span>
                    {['pending', 'processing', 'shipped', 'delivered'].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(order.orderId, s)}
                        className={`text-xs px-3 py-1.5 rounded-full capitalize font-medium transition-colors ${
                          order.fulfillmentStatus === s
                            ? STATUS_COLORS[s]
                            : 'bg-white border border-coffee-200 text-coffee-500 hover:bg-coffee-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
