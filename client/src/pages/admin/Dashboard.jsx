import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingCart, FiDollarSign, FiTrendingUp, FiAlertTriangle, FiStar } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, lowStockRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/low-stock'),
        ]);
        setStats(statsRes.data.stats);
        setLowStock(lowStockRes.data.products);
      } catch {
        // Individual fallbacks so one failure doesn't block the other
        try { const r = await api.get('/admin/stats'); setStats(r.data.stats); } catch {}
        try { const r = await api.get('/admin/low-stock'); setLowStock(r.data.products); } catch {}
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-coffee-800 mb-8">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-28" />
          ))}
        </div>
      </div>
    );
  }

  const chartData = (stats?.dailyChart || []).map((d) => ({
    ...d,
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-coffee-800 mb-8">Dashboard</h1>

      {/* Low stock warning */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-amber-800 text-sm mb-2">Low Stock Alert</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                {lowStock.map((p) => (
                  <span key={p._id} className="text-sm text-amber-700">
                    {p.name}: <span className="font-bold text-amber-900">{p.stockQuantity}</span> left
                  </span>
                ))}
              </div>
              <Link to="/admin/products" className="text-xs text-amber-600 underline hover:text-amber-800 mt-2 inline-block">Manage Products</Link>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <FiDollarSign className="text-coffee-500 mb-2" size={22} />
              <p className="text-xs text-coffee-400">Today</p>
              <p className="text-xl font-bold text-coffee-800">{fmt(stats.today.revenue)}</p>
              <p className="text-xs text-coffee-400 mt-1">{stats.today.orders} orders</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <FiDollarSign className="text-coffee-500 mb-2" size={22} />
              <p className="text-xs text-coffee-400">This Week</p>
              <p className="text-xl font-bold text-coffee-800">{fmt(stats.week.revenue)}</p>
              <p className="text-xs text-coffee-400 mt-1">{stats.week.orders} orders</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <FiDollarSign className="text-coffee-500 mb-2" size={22} />
              <p className="text-xs text-coffee-400">This Month</p>
              <p className="text-xl font-bold text-coffee-800">{fmt(stats.month.revenue)}</p>
              <p className="text-xs text-coffee-400 mt-1">{stats.month.orders} orders</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <FiTrendingUp className="text-coffee-500 mb-2" size={22} />
              <p className="text-xs text-coffee-400">Avg Order Value</p>
              <p className="text-xl font-bold text-coffee-800">{fmt(stats.avgOrderValue)}</p>
              <p className="text-xs text-coffee-400 mt-1">{stats.total.orders} total orders</p>
            </div>
          </div>

          {/* Revenue chart + Top Products side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            {/* Bar chart — last 7 days */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-coffee-800 mb-4">Daily Revenue (Last 7 Days)</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} barSize={32}>
                    <XAxis dataKey="label" tick={{ fill: '#A08D7D', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#A08D7D', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      formatter={(value) => [fmt(value), 'Revenue']}
                      labelStyle={{ color: '#3E2E1E', fontWeight: 600 }}
                      contentStyle={{ borderRadius: 8, border: '1px solid #E8DDD3' }}
                    />
                    <Bar dataKey="revenue" fill="#6F4E37" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-coffee-400 text-sm py-12 text-center">No revenue data yet</p>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-coffee-800 mb-4">Top Products</h2>
              {stats.topProducts?.length > 0 ? (
                <div className="space-y-3">
                  {stats.topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-coffee-400 w-5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-coffee-800 truncate">{p.name}</p>
                        <p className="text-xs text-coffee-400">{p.totalQty} sold &middot; {fmt(p.totalRevenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-coffee-400 text-sm py-8 text-center">No sales data yet</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Manage links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/products"
          className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow group"
        >
          <FiPackage className="text-coffee-500 mb-3 group-hover:scale-110 transition-transform" size={32} />
          <h2 className="font-semibold text-coffee-800 text-lg">Manage Products</h2>
          <p className="text-sm text-coffee-400">Add, edit, or remove products</p>
        </Link>
        <Link
          to="/admin/orders"
          className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow group"
        >
          <FiShoppingCart className="text-coffee-500 mb-3 group-hover:scale-110 transition-transform" size={32} />
          <h2 className="font-semibold text-coffee-800 text-lg">Manage Orders</h2>
          <p className="text-sm text-coffee-400">View and update order statuses</p>
        </Link>
        <Link
          to="/admin/reviews"
          className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow group"
        >
          <FiStar className="text-coffee-500 mb-3 group-hover:scale-110 transition-transform" size={32} />
          <h2 className="font-semibold text-coffee-800 text-lg">Manage Reviews</h2>
          <p className="text-sm text-coffee-400">View and moderate reviews</p>
        </Link>
      </div>
    </div>
  );
}
