import { FiInstagram, FiMessageCircle } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-coffee-800 text-coffee-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display text-xl font-bold text-white mb-2">Brew Haven</h3>
          <p className="text-sm leading-relaxed">
            Freshly roasted Indian coffee beans, sourced directly from the finest estates across Karnataka, Kerala, and beyond.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="/products" className="hover:text-white transition-colors">Shop All</a></li>
            <li><a href="/cart" className="hover:text-white transition-colors">Cart</a></li>
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
