import { Link } from 'react-router-dom';
import { FiMinus, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import StarRating from './StarRating';

const roastColors = {
  light: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  dark: 'bg-coffee-700 text-coffee-100',
};

export default function ProductCard({ product }) {
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const outOfStock = product.stockQuantity <= 0;
  const cartItem = items.find((i) => i.productId === product._id);
  const cartQty = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    if (cartQty <= 1) {
      removeFromCart(product._id);
      toast.success(`${product.name} removed from cart`);
    } else {
      updateQuantity(product._id, cartQty - 1);
    }
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.03] transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="aspect-square overflow-hidden bg-coffee-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roastColors[product.roastType]}`}>
            {product.roastType} roast
          </span>
          <span className="text-xs text-coffee-400">{product.weight}</span>
        </div>
        <h3 className="font-semibold text-coffee-800 mb-1 line-clamp-1">{product.name}</h3>
        {product.avgRating > 0 && (
          <div className="flex items-center gap-1.5 mb-1">
            <StarRating rating={product.avgRating} size={13} />
            <span className="text-xs text-coffee-400">({product.reviewCount})</span>
          </div>
        )}
        <p className="text-sm text-coffee-500 line-clamp-2 mb-3 flex-1">{product.description}</p>
        {!outOfStock && product.stockQuantity <= 5 && (
          <p className="text-xs text-red-500 font-semibold mb-2">Only {product.stockQuantity} left!</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-coffee-700">
            ₹{product.price.toLocaleString('en-IN')}
            <span className="text-[10px] font-normal text-coffee-400 ml-1">incl. GST</span>
          </span>
          {outOfStock ? (
            <button
              disabled
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-500 cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : cartQty > 0 ? (
            <div className="flex items-center bg-coffee-600 rounded-lg overflow-hidden">
              <button
                onClick={handleDecrement}
                className="px-3 py-2 text-white hover:bg-coffee-700 transition-colors"
              >
                <FiMinus size={14} />
              </button>
              <span className="px-3 py-2 text-white font-semibold text-sm min-w-[2rem] text-center">
                {cartQty}
              </span>
              <button
                onClick={handleIncrement}
                disabled={cartQty >= product.stockQuantity}
                className="px-3 py-2 text-white hover:bg-coffee-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-coffee-600 text-white hover:bg-coffee-700"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
