import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiShoppingCart, FiDollarSign, FiLogOut } from 'react-icons/fi';
import api from '../../utils/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const StatCard = ({ icon: Icon, label, value, sub }) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <Icon className="text-coffee-500 mb-2" size={24} />
      <p className="text-sm text-coffee-400">{label}</p>
      <p className="text-2xl font-bold text-coffee-800">{value}</p>
      {sub && <p className="text-xs text-coffee-400 mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-coffee-800">Admin Dashboard</h1>
        <button onClick={logout} className="flex items-center gap-2 text-coffee-500 hover:text-red-500 transition-colors">
          <FiLogOut /> Logout
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-28" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FiDollarSign} label="Total Revenue" value={`₹${stats.total.revenue.toLocaleString('en-IN')}`} />
          <StatCard icon={FiShoppingCart} label="Total Orders" value={stats.total.orders} />
          <StatCard icon={FiDollarSign} label="This Week" value={`₹${stats.week.revenue.toLocaleString('en-IN')}`} sub={`${stats.week.orders} orders`} />
          <StatCard icon={FiShoppingCart} label="Today" value={`₹${stats.today.revenue.toLocaleString('en-IN')}`} sub={`${stats.today.orders} orders`} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>
    </div>
  );
}
