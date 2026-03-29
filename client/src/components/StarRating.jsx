import { FiStar } from 'react-icons/fi';

export default function StarRating({ rating, size = 16, interactive, onRate }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(star)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            <FiStar
              size={size}
              className={filled ? 'fill-amber-400 text-amber-400' : 'text-coffee-300'}
            />
          </button>
        );
      })}
    </div>
  );
}
