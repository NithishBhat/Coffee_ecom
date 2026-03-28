import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      const { data } = await api.post('/admin/login', { password });
      localStorage.setItem('adminToken', data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold text-coffee-800 text-center mb-6">Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          className="w-full px-4 py-3 rounded-xl border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-400 mb-4"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-coffee-600 hover:bg-coffee-700 disabled:bg-coffee-300 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
