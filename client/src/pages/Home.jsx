import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiArrowUp, FiTruck, FiCoffee, FiCheckCircle, FiBox } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';

function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTop, setShowTop] = useState(false);
  const heroRef = useRef(null);

  const productsRef = useFadeIn();
  const reviewsRef = useFadeIn();
  const storyRef = useFadeIn();

  useEffect(() => {
    api.get('/products')
      .then((res) => setFeatured(res.data.products.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowTop(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section ref={heroRef} className="relative bg-coffee-900 text-white overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1447933601403-56dc2df6e9c4?w=1600)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-36 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Freshly Roasted.<br />Delivered to Your Door.
          </h1>
          <p className="text-coffee-200 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Premium Indian coffee beans sourced directly from the finest estates in Coorg, Chikmagalur, and beyond.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-coffee-800 px-8 py-3 rounded-full text-lg font-semibold transition-colors shadow-lg"
          >
            Shop Now <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-coffee-50 border-b border-coffee-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-coffee-500 text-sm">
          <span className="flex items-center gap-2">
            <FiCheckCircle size={16} className="text-coffee-400" />
            100% Arabica Beans
          </span>
          <span className="flex items-center gap-2">
            <FiCoffee size={16} className="text-coffee-400" />
            Freshly Roasted to Order
          </span>
          <span className="flex items-center gap-2">
            <FiTruck size={16} className="text-coffee-400" />
            Free Delivery Above ₹500
          </span>
        </div>
      </section>

      {/* Featured Products */}
      <section ref={productsRef} className="fade-in-section max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-coffee-800 mb-2">Featured Coffees</h2>
          <p className="text-coffee-500">Our most popular picks</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-square bg-coffee-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-coffee-100 rounded w-1/3" />
                  <div className="h-5 bg-coffee-100 rounded w-2/3" />
                  <div className="h-4 bg-coffee-100 rounded w-full" />
                  <div className="h-10 bg-coffee-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 border-2 border-coffee-600 text-coffee-600 hover:bg-coffee-600 hover:text-white px-8 py-3 rounded-full font-semibold transition-colors"
          >
            View All Products <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Customer Reviews */}
      <section ref={reviewsRef} className="fade-in-section bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-coffee-800 mb-2">Customers Love Our Coffee</h2>
            <p className="text-coffee-500">Don't just take our word for it</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Priya Sharma', city: 'Bangalore', rating: 5, quote: 'The Coorg Estate blend is hands down the best coffee I\'ve had. Rich, smooth, and the aroma fills the entire kitchen every morning.' },
              { name: 'Rahul Menon', city: 'Kochi', rating: 5, quote: 'Finally, a brand that delivers genuinely fresh roasted beans. You can tell the difference from the very first sip. Will never go back to supermarket coffee.' },
              { name: 'Ananya Iyer', city: 'Chennai', rating: 4, quote: 'Great selection of single-origin beans. The Chikmagalur dark roast is my daily go-to. Fast shipping and beautiful packaging too!' },
            ].map((t) => (
              <div key={t.name} className="bg-coffee-50 rounded-xl p-6">
                <StarRating rating={t.rating} size={16} />
                <p className="text-coffee-600 text-sm leading-relaxed mt-3 mb-4">"{t.quote}"</p>
                <p className="font-semibold text-coffee-800 text-sm">{t.name}</p>
                <p className="text-xs text-coffee-400">{t.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section ref={storyRef} className="fade-in-section py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600"
              alt="Coffee beans being roasted"
              className="rounded-2xl shadow-lg w-full object-cover h-80"
            />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-coffee-800 mb-4">Our Story</h2>
            <p className="text-coffee-600 leading-relaxed mb-4">
              Born from a passion for Indian coffee, Brew Haven partners with small-scale farmers across the Western Ghats. We believe every cup tells a story — from the misty hills of Coorg to the tribal farms of Araku Valley.
            </p>
            <p className="text-coffee-600 leading-relaxed">
              Every batch is freshly roasted in small quantities and shipped within 24 hours, so you always get the freshest coffee possible. No middlemen, no compromises — just pure, honest Indian coffee.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-coffee-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Free Delivery on Orders Above ₹500</h2>
          <p className="text-coffee-200">Fresh beans at your doorstep in 3-5 business days</p>
        </div>
      </section>

      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-coffee-700 hover:bg-coffee-800 text-white shadow-lg flex items-center justify-center transition-colors"
          aria-label="Back to top"
        >
          <FiArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
