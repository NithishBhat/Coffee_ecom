import { FiInstagram, FiMessageCircle, FiMail, FiPhone } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-coffee-800 text-coffee-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display text-xl font-bold text-white mb-2">Brew Haven</h3>
          <p className="text-sm leading-relaxed">
            From bean to cup — premium Indian coffee roasted fresh and delivered to your doorstep.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
            <li><a href="/products" className="hover:text-white transition-colors">Shop All</a></li>
            <li><a href="/track" className="hover:text-white transition-colors">Track Order</a></li>
            <li><a href="/cart" className="hover:text-white transition-colors">Cart</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-2">Contact Us</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FiMail size={14} />
              <a href="mailto:hello@brewhaven.in" className="hover:text-white transition-colors">hello@brewhaven.in</a>
            </li>
            <li className="flex items-center gap-2">
              <FiPhone size={14} />
              <a href="tel:+919999999999" className="hover:text-white transition-colors">+91 99999 99999</a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-2">Connect</h4>
          <div className="flex gap-4">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <FiInstagram size={22} />
            </a>
            <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <FiMessageCircle size={22} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-coffee-700 text-center text-xs text-coffee-300 py-4">
        &copy; {new Date().getFullYear()} Brew Haven. Made with love in India.
      </div>
    </footer>
  );
}
