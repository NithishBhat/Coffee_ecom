import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiArrowUp, FiTruck, FiCoffee, FiHeart } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

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

  const featuresRef = useFadeIn();
  const storyRef = useFadeIn();
  const productsRef = useFadeIn();

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
            backgroundImage: 'url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600)',
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

      {/* Features */}
      <section ref={featuresRef} className="fade-in-section max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <FiCoffee className="mx-auto text-coffee-500 mb-3" size={32} />
            <h3 className="font-semibold text-coffee-800 mb-1">Single Origin</h3>
            <p className="text-sm text-coffee-500">Traceable beans from India's best coffee-growing regions</p>
          </div>
          <div className="text-center p-6">
            <FiTruck className="mx-auto text-coffee-500 mb-3" size={32} />
            <h3 className="font-semibold text-coffee-800 mb-1">Free Delivery</h3>
            <p className="text-sm text-coffee-500">On all orders above ₹500, delivered in 3-5 business days</p>
          </div>
          <div className="text-center p-6">
            <FiHeart className="mx-auto text-coffee-500 mb-3" size={32} />
            <h3 className="font-semibold text-coffee-800 mb-1">Roasted with Love</h3>
            <p className="text-sm text-coffee-500">Small-batch roasting to ensure peak freshness in every cup</p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section ref={storyRef} className="fade-in-section bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600"
              alt="Coffee plantation"
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
