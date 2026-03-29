import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState('checking'); // checking | valid | invalid

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setStatus('invalid');
      return;
    }

    // Quick client-side expiry check before hitting the server
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('adminToken');
        setStatus('invalid');
        return;
      }
    } catch {
      localStorage.removeItem('adminToken');
      setStatus('invalid');
      return;
    }

    // Verify token with the server on every page load
    api.get('/admin/verify')
      .then(() => setStatus('valid'))
      .catch(() => {
        localStorage.removeItem('adminToken');
        setStatus('invalid');
      });
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-coffee-200 border-t-coffee-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'invalid') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
