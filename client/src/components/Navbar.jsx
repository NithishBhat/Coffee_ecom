import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiShoppingBag, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `transition-colors ${isActive ? 'text-coffee-200' : 'text-coffee-100 hover:text-white'}`;

  return (
    <nav className="bg-coffee-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold text-white tracking-wide">
          Brew Haven
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/products" className={linkClass}>Shop</NavLink>
          <NavLink to="/track" className={linkClass}>Track Order</NavLink>
          <NavLink to="/cart" className={linkClass}>
            <span className="relative flex items-center gap-1">
              <FiShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-coffee-400 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {itemCount}
                </span>
              )}
            </span>
          </NavLink>
        </div>

        {/* Mobile: cart icon + hamburger toggle */}
        <div className="flex md:hidden items-center gap-4">
          <Link to="/cart" className="relative text-white p-2 -m-2">
            <FiShoppingBag size={22} />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-coffee-400 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                {itemCount}
              </span>
            )}
          </Link>
          <button className="text-white p-2 -m-2" onClick={() => setOpen(!open)}>
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-coffee-800 border-t border-coffee-700 px-4 pb-4 space-y-3">
          <NavLink to="/" end className="block text-coffee-100 hover:text-white" onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/products" className="block text-coffee-100 hover:text-white" onClick={() => setOpen(false)}>Shop</NavLink>
          <NavLink to="/track" className="block text-coffee-100 hover:text-white" onClick={() => setOpen(false)}>Track Order</NavLink>
        </div>
      )}
    </nav>
  );
}
