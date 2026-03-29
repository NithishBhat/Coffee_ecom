import { useState, useEffect } from 'react';
import { FiTrash2, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import StarRating from '../../components/StarRating';

export default function ReviewsManager() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/admin/reviews')
      .then((res) => setReviews(res.data.reviews))
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      toast.success('Review deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-display text-2xl font-bold text-coffee-800">Reviews</h1>
        <span className="text-sm text-coffee-400 ml-auto">{reviews.length} total</span>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl h-24" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-coffee-400 text-lg">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-coffee-800 text-sm">{r.customerName}</span>
                    <span className="text-xs text-coffee-400">{r.customerPhone}</span>
                    {r.isVerified && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <FiCheckCircle size={11} /> Verified
                      </span>
                    )}
                    <span className="text-xs text-coffee-400">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={r.rating} size={14} />
                    <span className="text-xs text-coffee-500 bg-coffee-50 px-2 py-0.5 rounded">
                      {r.productId?.name || 'Unknown product'}
                    </span>
                  </div>
                  <p className="text-sm text-coffee-600">{r.reviewText}</p>
                </div>
                <button
                  onClick={() => handleDelete(r._id)}
                  className="text-red-400 hover:text-red-600 p-1 flex-shrink-0"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
