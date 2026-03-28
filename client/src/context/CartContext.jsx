import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'coffee-cart';

function loadCart() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.find((i) => i.productId === action.payload.productId);
      if (existing) {
        return state.map((i) =>
          i.productId === action.payload.productId
            ? { ...i, quantity: i.quantity + action.payload.quantity }
            : i
        );
      }
      return [...state, action.payload];
    }
    case 'UPDATE_QUANTITY':
      return state.map((i) =>
        i.productId === action.payload.productId
          ? { ...i, quantity: action.payload.quantity }
          : i
      );
    case 'REMOVE_FROM_CART':
      return state.filter((i) => i.productId !== action.payload);
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, null, loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= 500 ? 0 : subtotal > 0 ? 50 : 0;
  const totalAmount = subtotal + deliveryFee;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        productId: product._id,
        name: product.name,
        price: product.price,
        weight: product.weight,
        imageUrl: product.imageUrl,
        quantity,
      },
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        deliveryFee,
        totalAmount,
        itemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
