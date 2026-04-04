import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import StarRating from '../components/StarRating';

const roastColors = {
  light: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  dark: 'bg-coffee-700 text-coffee-100',
};

export default function ProductDetail() {
  const { id } = useParams();
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    customerName: '', customerPhone: localStorage.getItem('customerPhone') || '', rating: 0, reviewText: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(() => {
    api.get(`/products/${id}/reviews`)
      .then((res) => {
        setReviews(res.data.reviews);
        setAvgRating(res.data.avgRating);
        setReviewCount(res.data.reviewCount);
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data.product))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
    loadReviews();
  }, [id, loadReviews]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.customerName.trim()) return toast.error('Name is required');
    if (!/^\d{10}$/.test(reviewForm.customerPhone)) return toast.error('Valid 10-digit phone required');
    if (reviewForm.rating === 0) return toast.error('Please select a rating');
    if (!reviewForm.reviewText.trim()) return toast.error('Please write a review');

    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      setReviewForm({ customerName: '', customerPhone: reviewForm.customerPhone, rating: 0, reviewText: '' });
      loadReviews();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-coffee-100 rounded-2xl" />
          <div className="space-y-4 py-4">
            <div className="h-6 bg-coffee-100 rounded w-1/4" />
            <div className="h-8 bg-coffee-100 rounded w-3/4" />
            <div className="h-4 bg-coffee-100 rounded w-full" />
            <div className="h-4 bg-coffee-100 rounded w-2/3" />
            <div className="h-10 bg-coffee-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-coffee-800 mb-4">Product Not Found</h2>
        <Link to="/products" className="text-coffee-600 underline">Browse products</Link>
      </div>
    );
  }

  const outOfStock = product.stockQuantity <= 0;
  const cartItem = items.find((i) => i.productId === product._id);
  const cartQty = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addToCart(product, quantity);
    toast.success(`${quantity}x ${product.name} added to cart`);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCartIncrement = () => {
    addToCart(product, 1);
  };

  const handleCartDecrement = () => {
    if (cartQty <= 1) {
      removeFromCart(product._id);
      toast.success(`${product.name} removed from cart`);
    } else {
      updateQuantity(product._id, cartQty - 1);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-coffee-200 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:border-transparent text-sm';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/products" className="inline-flex items-center gap-1 text-coffee-500 hover:text-coffee-700 mb-6 transition-colors">
        <FiArrowLeft /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square overflow-hidden rounded-2xl bg-coffee-100 shadow-lg">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="py-2">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${roastColors[product.roastType]}`}>
              {product.roastType} roast
            </span>
            <span className="text-sm text-coffee-400">{product.weight}</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-coffee-800 mb-2">{product.name}</h1>

          {/* Rating summary */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={avgRating} size={18} />
              <span className="text-sm font-semibold text-coffee-700">{avgRating}</span>
              <span className="text-sm text-coffee-400">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
            </div>
          )}

          <p className="text-coffee-400 mb-4">Origin: {product.origin}</p>
          <p className="text-2xl font-bold text-coffee-700 mb-6">₹{product.price.toLocaleString('en-IN')} <span className="text-xs font-normal text-coffee-400">incl. GST</span></p>

          <p className="text-coffee-600 leading-relaxed mb-8">{product.description}</p>

          {outOfStock ? (
            <div className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-semibold text-center">
              Out of Stock
            </div>
          ) : cartQty > 0 ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center bg-coffee-600 rounded-xl overflow-hidden">
                  <button
                    onClick={handleCartDecrement}
                    className="p-3 text-white hover:bg-coffee-700 transition-colors"
                  >
                    <FiMinus />
                  </button>
                  <span className="px-5 font-semibold text-lg text-white min-w-[3rem] text-center">{cartQty}</span>
                  <button
                    onClick={handleCartIncrement}
                    disabled={cartQty >= product.stockQuantity}
                    className="p-3 text-white hover:bg-coffee-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiPlus />
                  </button>
                </div>
                <span className="text-sm text-coffee-500 font-medium">in cart</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center bg-white border border-coffee-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 hover:bg-coffee-50 transition-colors"
                  >
                    <FiMinus />
                  </button>
                  <span className="px-5 font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                    className="p-3 hover:bg-coffee-50 transition-colors"
                  >
                    <FiPlus />
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  className="bg-coffee-600 hover:bg-coffee-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors w-full sm:w-auto"
                >
                  Add to Cart — ₹{(product.price * quantity).toLocaleString('en-IN')}
                </button>
              </div>
            )}

          {!outOfStock && product.stockQuantity <= 5 && (
            <p className="text-sm text-red-500 font-semibold mt-3">Only {product.stockQuantity} left!</p>
          )}
          {!outOfStock && product.stockQuantity > 5 && (
            <p className="text-xs text-coffee-400 mt-3">{product.stockQuantity} in stock</p>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 max-w-3xl">
        <h2 className="font-display text-2xl font-bold text-coffee-800 mb-6">
          Reviews {reviewCount > 0 && <span className="text-coffee-400 font-normal text-lg">({reviewCount})</span>}
        </h2>

        {/* Write a Review */}
        <form onSubmit={handleReviewSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="font-semibold text-coffee-800 mb-4">Write a Review</h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                value={reviewForm.customerName}
                onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                placeholder="Your Name"
                className={inputClass}
              />
              <input
                value={reviewForm.customerPhone}
                onChange={(e) => setReviewForm({ ...reviewForm, customerPhone: e.target.value })}
                placeholder="Phone (10 digits)"
                inputMode="numeric"
                maxLength={10}
                className={inputClass}
              />
            </div>
            <div>
              <p className="text-sm text-coffee-500 mb-2">Your Rating</p>
              <StarRating
                rating={reviewForm.rating}
                size={28}
                interactive
                onRate={(r) => setReviewForm({ ...reviewForm, rating: r })}
              />
            </div>
            <textarea
              value={reviewForm.reviewText}
              onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
              placeholder="Share your experience with this coffee..."
              rows={3}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={submitting}
              className="self-start bg-coffee-600 hover:bg-coffee-700 disabled:bg-coffee-300 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p className="text-coffee-400 text-center py-8">No reviews yet. Be the first to review this coffee!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-coffee-800 text-sm">{review.customerName}</span>
                      {review.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <FiCheckCircle size={11} /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <StarRating rating={review.rating} size={14} />
                  </div>
                  <span className="text-xs text-coffee-400 flex-shrink-0">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-coffee-600 mt-2">{review.reviewText}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
