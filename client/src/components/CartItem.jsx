import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex gap-3 sm:gap-4 bg-white rounded-xl p-3 sm:p-4 shadow-sm">
      <img
        src={item.imageUrl}
        alt={item.name}
        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-coffee-800 truncate text-sm sm:text-base">{item.name}</h3>
        <p className="text-xs sm:text-sm text-coffee-400">{item.weight}</p>
        <p className="font-bold text-coffee-700 mt-1 text-sm sm:text-base">₹{item.price.toLocaleString('en-IN')}</p>
      </div>
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeFromCart(item.productId)}
          className="text-red-400 hover:text-red-600 transition-colors p-1"
        >
          <FiTrash2 size={16} />
        </button>
        <div className="flex items-center bg-coffee-50 rounded-lg">
          <button
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-9 h-9 flex items-center justify-center text-coffee-600 hover:bg-coffee-100 rounded-l-lg disabled:opacity-40"
          >
            <FiMinus size={14} />
          </button>
          <span className="text-sm font-semibold w-7 text-center">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            className="w-9 h-9 flex items-center justify-center text-coffee-600 hover:bg-coffee-100 rounded-r-lg"
          >
            <FiPlus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
