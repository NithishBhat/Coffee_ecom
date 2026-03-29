import { useState, useEffect, useMemo } from 'react';
import { FiChevronDown, FiChevronUp, FiDownload, FiSearch } from 'react-icons/fi';
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

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'failed', label: 'Failed / Unpaid' },
];

const TIME_FILTERS = [
  { key: 'all', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'custom', label: 'Custom' },
];

function getTimeRange(key) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (key === 'today') return start;
  if (key === 'week') { start.setDate(start.getDate() - 7); return start; }
  if (key === 'month') { start.setDate(1); return start; }
  return null;
}

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [tab, setTab] = useState('active');
  const [timeFilter, setTimeFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

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
      toast.success(`${orderId} → ${fulfillmentStatus}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Apply time filter + search, then group by tab
  const { grouped, timeFiltered } = useMemo(() => {
    // Time filter
    let list = orders;
    if (timeFilter === 'custom' && (dateFrom || dateTo)) {
      const from = dateFrom ? new Date(dateFrom + 'T00:00:00') : null;
      const to = dateTo ? new Date(dateTo + 'T23:59:59') : null;
      list = list.filter((o) => {
        const d = new Date(o.createdAt);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    } else if (timeFilter !== 'all') {
      const cutoff = getTimeRange(timeFilter);
      if (cutoff) list = list.filter((o) => new Date(o.createdAt) >= cutoff);
    }

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((o) =>
        o.orderId.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
      );
    }

    // Month filter
    if (monthFilter !== 'all') {
      list = list.filter((o) => {
        const d = new Date(o.createdAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthFilter;
      });
    }

    // Group
    const active = [];
    const completed = [];
    const failed = [];
    for (const o of list) {
      if (o.paymentStatus === 'pending' || o.paymentStatus === 'failed') {
        failed.push(o);
      } else if (o.fulfillmentStatus === 'delivered') {
        completed.push(o);
      } else {
        active.push(o);
      }
    }
    return { grouped: { active, completed, failed }, timeFiltered: list };
  }, [orders, timeFilter, dateFrom, dateTo, search, monthFilter]);

  const filtered = grouped[tab] || [];

  // Derive month options from all orders
  const monthOptions = useMemo(() => {
    const seen = new Map();
    for (const o of orders) {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!seen.has(key)) {
        seen.set(key, d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }));
      }
    }
    return [...seen.entries()].map(([key, label]) => ({ key, label }));
  }, [orders]);

  const exportCSV = (rows, filename) => {
    if (rows.length === 0) return toast.error('No orders to export');
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Email', 'Items', 'Subtotal', 'Delivery Fee', 'Total', 'Payment Status', 'Fulfillment Status', 'Address'];
    const csvRows = [header.join(',')];
    for (const o of rows) {
      const items = o.items.map((i) => `${i.name} x${i.quantity}`).join(', ');
      const addr = `${o.customer.address.street}, ${o.customer.address.city}, ${o.customer.address.state} - ${o.customer.address.pincode}`;
      csvRows.push([
        escape(o.orderId),
        escape(new Date(o.createdAt).toLocaleDateString('en-IN')),
        escape(o.customer.name),
        escape(o.customer.phone),
        escape(o.customer.email),
        escape(items),
        o.subtotal,
        o.deliveryFee,
        o.totalAmount,
        escape(o.paymentStatus),
        escape(o.fulfillmentStatus),
        escape(addr),
      ].join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderOrder = (order) => (
    <div key={order._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div
        className="flex flex-wrap items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-coffee-50/50"
        onClick={() => setExpanded(expanded === order._id ? null : order._id)}
      >
        <span className="font-semibold text-coffee-800 text-xs">{order.orderId}</span>
        <span className="text-xs text-coffee-500 truncate max-w-[120px]">{order.customer.name}</span>
        <span className="text-xs font-semibold text-coffee-700">₹{order.totalAmount.toLocaleString('en-IN')}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize leading-none ${PAYMENT_COLORS[order.paymentStatus]}`}>
          {order.paymentStatus}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize leading-none ${STATUS_COLORS[order.fulfillmentStatus]}`}>
          {order.fulfillmentStatus}
        </span>
        <span className="text-[10px] text-coffee-400 ml-auto hidden sm:block">
          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
        {expanded === order._id ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </div>

      {expanded === order._id && (
        <div className="border-t border-coffee-50 px-3 py-3 bg-coffee-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h3 className="text-xs font-semibold text-coffee-700 mb-1.5">Items</h3>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-coffee-600 mb-0.5">
                  <span>{item.name} x{item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <hr className="my-1.5 border-coffee-100" />
              <div className="flex justify-between text-xs text-coffee-500">
                <span>Subtotal: ₹{order.subtotal}</span>
                <span>Delivery: {order.deliveryFee === 0 ? 'Free' : `₹${order.deliveryFee}`}</span>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-coffee-700 mb-1.5">Customer</h3>
              <div className="text-xs text-coffee-600 space-y-0.5">
                <p>{order.customer.name}</p>
                <p>{order.customer.phone} | {order.customer.email}</p>
                <p>{order.customer.address.street}, {order.customer.address.city}</p>
                <p>{order.customer.address.state} — {order.customer.address.pincode}</p>
              </div>
              {order.razorpayPaymentId && (
                <p className="text-[10px] text-coffee-400 mt-1">Payment ID: {order.razorpayPaymentId}</p>
              )}
              {order.paymentStatus === 'paid' && (
                <a
                  href={`/invoice/${order.orderId}?phone=${encodeURIComponent(order.customer.phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-[11px] text-coffee-600 underline hover:text-coffee-800 mt-1.5"
                >
                  View Invoice
                </a>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-coffee-600">Status:</span>
            {['pending', 'processing', 'shipped', 'delivered'].map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(order.orderId, s)}
                className={`text-[11px] px-2.5 py-1 rounded-full capitalize font-medium transition-colors ${
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
  );

  const btnClass = (active) => `text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
    active ? 'bg-coffee-600 text-white' : 'bg-white text-coffee-600 border border-coffee-200 hover:bg-coffee-50'
  }`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h1 className="font-display text-xl font-bold text-coffee-800">Orders</h1>
        <span className="text-xs text-coffee-400 ml-auto">{timeFiltered.length} filtered / {orders.length} total</span>
        <button
          onClick={() => exportCSV(filtered, `orders-${tab}-${new Date().toISOString().slice(0, 10)}.csv`)}
          className="flex items-center gap-1 text-xs text-coffee-600 hover:text-coffee-800 border border-coffee-200 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <FiDownload size={12} /> Export
        </button>
        <button
          onClick={() => exportCSV(orders, `orders-all-${new Date().toISOString().slice(0, 10)}.csv`)}
          className="flex items-center gap-1 text-xs text-coffee-600 hover:text-coffee-800 border border-coffee-200 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <FiDownload size={12} /> Export All
        </button>
      </div>

      {/* Search + Time filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, name, or phone..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-coffee-200 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {TIME_FILTERS.map((tf) => (
            <button
              key={tf.key}
              onClick={() => setTimeFilter(tf.key)}
              className={btnClass(timeFilter === tf.key)}
            >
              {tf.label}
            </button>
          ))}
          {monthOptions.length > 1 && (
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-coffee-200 bg-white text-coffee-700 focus:outline-none focus:ring-2 focus:ring-coffee-400"
            >
              <option value="all">All Months</option>
              {monthOptions.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Custom date range */}
      {timeFilter === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-coffee-200 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-400"
          />
          <span className="text-xs text-coffee-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-coffee-200 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-400"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-coffee-100 rounded-lg p-0.5 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setExpanded(null); setMonthFilter('all'); }}
            className={`flex-1 text-xs font-medium py-2 px-2 rounded-md transition-colors ${
              tab === t.key
                ? 'bg-white text-coffee-800 shadow-sm'
                : 'text-coffee-500 hover:text-coffee-700'
            }`}
          >
            {t.label} ({grouped[t.key]?.length || 0})
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="bg-white rounded-lg h-12" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-coffee-400">No orders match your filters</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(renderOrder)}
        </div>
      )}
    </div>
  );
}
