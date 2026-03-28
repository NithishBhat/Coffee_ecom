import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#3B2919',
              color: '#FDF8F0',
              borderRadius: '8px',
            },
          }}
        />
      </CartProvider>
    </BrowserRouter>
  </StrictMode>
)
