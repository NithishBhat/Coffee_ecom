import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiTrendingUp, FiAlertTriangle, FiUsers } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const CHART_PERIODS = [
  { key: 'day', label: 'Day' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

function formatLabel(date, period) {
  if (period === 'year') return date;
  if (period === 'month') {
    const [y, m] = date.split('-');
    return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
  }
  return new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('day');

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
        try { const r = await api.get('/admin/stats'); setStats(r.data.stats); } catch {}
        try { const r = await api.get('/admin/low-stock'); setLowStock(r.data.products); } catch {}
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = useMemo(() => {
    if (!stats) return [];
    const src = chartPeriod === 'year' ? stats.yearlyChart
      : chartPeriod === 'month' ? stats.monthlyChart
      : stats.dailyChart;
    return (src || []).map((d) => ({
      ...d,
      label: formatLabel(d.date, chartPeriod),
    }));
  }, [stats, chartPeriod]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-coffee-800 mb-8">Dashboard</h1>
        <div className="bg-white rounded-xl shadow-sm p-6 h-72 mb-8 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-28" />
          ))}
        </div>
      </div>
    );
  }

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
          {/* Revenue chart — top of dashboard */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-coffee-800">Revenue</h2>
              <div className="flex gap-0.5 bg-coffee-100 rounded-lg p-0.5">
                {CHART_PERIODS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setChartPeriod(p.key)}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                      chartPeriod === p.key
                        ? 'bg-white text-coffee-800 shadow-sm'
                        : 'text-coffee-500 hover:text-coffee-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                  <XAxis dataKey="label" tick={{ fill: '#A08D7D', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#A08D7D', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                  <Tooltip
                    formatter={(value) => [fmt(value), 'Revenue']}
                    labelStyle={{ color: '#3E2E1E', fontWeight: 600 }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #E8DDD3', fontSize: 13 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6F4E37"
                    strokeWidth={2.5}
                    dot={{ fill: '#6F4E37', r: 4 }}
                    activeDot={{ r: 6, fill: '#6F4E37' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-coffee-400 text-sm py-12 text-center">No revenue data yet</p>
            )}
          </div>

          {/* Stat cards + Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
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
              <div className="bg-white rounded-xl shadow-sm p-5">
                <FiUsers className="text-coffee-500 mb-2" size={22} />
                <p className="text-xs text-coffee-400">Customers</p>
                <p className="text-xl font-bold text-coffee-800">{stats.totalCustomers}</p>
                <p className="text-xs text-coffee-400 mt-1">unique buyers</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <FiDollarSign className="text-coffee-500 mb-2" size={22} />
                <p className="text-xs text-coffee-400">GST This Month</p>
                <p className="text-xl font-bold text-coffee-800">{fmt(stats.gstCollectedMonth)}</p>
                <p className="text-xs text-coffee-400 mt-1">@ 5% (HSN 0901)</p>
              </div>
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
    </div>
  );
}
