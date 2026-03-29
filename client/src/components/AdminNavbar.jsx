import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiExternalLink, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const linkClass = ({ isActive }) =>
    `transition-colors text-sm ${isActive ? 'text-white font-semibold' : 'text-coffee-300 hover:text-white'}`;

  return (
    <nav className="bg-coffee-900 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <NavLink to="/admin/dashboard" className="font-display text-lg font-bold text-white tracking-wide">
            Brew Haven <span className="text-coffee-400 font-normal text-sm">Admin</span>
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/admin/dashboard" end className={linkClass}>Dashboard</NavLink>
            <NavLink to="/admin/products" className={linkClass}>Products</NavLink>
            <NavLink to="/admin/orders" className={linkClass}>Orders</NavLink>
            <NavLink to="/admin/customers" className={linkClass}>Customers</NavLink>
            <NavLink to="/admin/reviews" className={linkClass}>Reviews</NavLink>
          </div>
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm text-coffee-300 hover:text-white transition-colors"
          >
            View Store <FiExternalLink size={13} />
          </a>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-coffee-300 hover:text-red-400 transition-colors"
          >
            <FiLogOut size={15} /> Logout
          </button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-coffee-900 border-t border-coffee-800 px-4 pb-4 space-y-3">
          <NavLink to="/admin/dashboard" end className="block text-coffee-200 hover:text-white text-sm" onClick={() => setOpen(false)}>Dashboard</NavLink>
          <NavLink to="/admin/products" className="block text-coffee-200 hover:text-white text-sm" onClick={() => setOpen(false)}>Products</NavLink>
          <NavLink to="/admin/orders" className="block text-coffee-200 hover:text-white text-sm" onClick={() => setOpen(false)}>Orders</NavLink>
          <NavLink to="/admin/customers" className="block text-coffee-200 hover:text-white text-sm" onClick={() => setOpen(false)}>Customers</NavLink>
          <NavLink to="/admin/reviews" className="block text-coffee-200 hover:text-white text-sm" onClick={() => setOpen(false)}>Reviews</NavLink>
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-coffee-200 hover:text-white text-sm">
            View Store <FiExternalLink size={13} />
          </a>
          <button onClick={logout} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm">
            <FiLogOut size={15} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
