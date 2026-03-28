import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

const roastColors = {
  light: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  dark: 'bg-coffee-700 text-coffee-100',
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const outOfStock = product.stockQuantity <= 0;

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
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
        <p className="text-sm text-coffee-500 line-clamp-2 mb-3 flex-1">{product.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-coffee-700">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              outOfStock
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-coffee-600 text-white hover:bg-coffee-700'
            }`}
          >
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
