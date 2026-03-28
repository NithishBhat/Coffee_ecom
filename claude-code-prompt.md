# Claude Code Prompt — Coffee E-Commerce Site (India)

## Paste this into Claude Code:

---

Build a production-ready coffee bean e-commerce website for the Indian market. Mobile-first, minimal, functional. No over-engineering — keep it clean and shippable.

### Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Payments**: Razorpay (UPI, Google Pay, cards — all handled by Razorpay checkout)

### Environment
- Read all config from `.env` file (already created in root)
- `.env` contains: MONGO_URI, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, ADMIN_PASSWORD, JWT_SECRET, PORT

---

## PAGES & FEATURES

### 1. Landing Page (`/`)
- Clean hero section: brand name, tagline ("Freshly roasted. Delivered to your door."), CTA button → shop
- "Our Story" section — 2-3 lines placeholder + image placeholder
- Featured products section — show top 3 products from DB
- Footer: Instagram link, WhatsApp contact link, basic copyright

### 2. Products Page (`/products`)
- Grid layout (2 columns on mobile, 3-4 on desktop)
- Each card: product image, name, roast type (light/medium/dark), weight, price in ₹, stock status
- "Add to Cart" button on each card (disabled if out of stock)
- Simple filter: All / Light Roast / Medium Roast / Dark Roast

### 3. Product Detail Page (`/products/:id`)
- Large product image
- Name, price, description, roast type, weight, origin
- Quantity selector
- "Add to Cart" button
- Show "Out of Stock" if inventory is 0

### 4. Cart Page (`/cart`)
- List items with image thumbnail, name, price, quantity controls (+/-)
- Remove item button
- Running total with subtotal + flat delivery fee (₹50, free above ₹500)
- "Proceed to Checkout" button
- Empty cart state with "Browse Products" link

### 5. Checkout Page (`/checkout`)
- Form: Full name, phone number, email, delivery address (street, city, state, pincode)
- Order summary sidebar
- "Pay Now" button → triggers Razorpay checkout modal
- Razorpay config: currency INR, prefill customer name/email/phone, enable UPI + cards + netbanking
- On payment success: create order in DB, show confirmation page, clear cart
- On payment failure: show error, let user retry

### 6. Order Confirmation (`/order/:id`)
- "Order placed successfully!" with order ID
- Order summary (items, total, delivery address)
- Estimated delivery: "3-5 business days"
- WhatsApp link: pre-filled message "Hi, I just placed order #ORDER_ID" to your WhatsApp number
- "Continue Shopping" button

### 7. Admin Panel (`/admin`)
- Login page: just a password field (validates against ADMIN_PASSWORD env var, returns JWT)
- Protected dashboard with:

**Products Management:**
- Table: image thumbnail, name, roast type, price, stock quantity, actions
- "Add Product" button → modal/form with: name, description, price (₹), weight (g), roast type (dropdown: light/medium/dark), origin, image URL, stock quantity
- Edit product (inline or modal)
- Delete product (with confirmation)
- Toggle product visibility (active/inactive — inactive products don't show on storefront)

**Orders Dashboard:**
- Table: order ID, customer name, phone, total amount, payment status, order date, fulfillment status
- Click order → expand to see full details (items, address, payment ID)
- Update fulfillment status: Pending → Processing → Shipped → Delivered
- Simple order count + revenue summary at the top (today / this week / total)

---

## API ROUTES

```
# Public
GET    /api/products              → list active products (with optional roast filter)
GET    /api/products/:id          → single product details

# Cart & Orders
POST   /api/orders/create         → create Razorpay order (send amount)
POST   /api/orders/verify         → verify Razorpay payment signature, save order to DB
GET    /api/orders/:id            → get order details (by order ID)

# Admin (all require JWT auth)
POST   /api/admin/login           → validate password, return JWT
GET    /api/admin/products        → list all products (including inactive)
POST   /api/admin/products        → add product
PUT    /api/admin/products/:id    → update product
DELETE /api/admin/products/:id    → delete product
GET    /api/admin/orders          → list all orders (newest first)
PUT    /api/admin/orders/:id      → update fulfillment status
GET    /api/admin/stats           → basic stats (order count, revenue)
```

---

## DATA MODELS

**Product:**
```
name, description, price (Number), weight (String, e.g. "250g"), 
roastType (enum: light/medium/dark), origin (String), 
imageUrl, stockQuantity (Number), isActive (Boolean, default true),
createdAt, updatedAt
```

**Order:**
```
orderId (auto-generated readable ID like "ORD-1001"),
customer: { name, email, phone, address: { street, city, state, pincode } },
items: [{ productId, name, price, quantity }],
subtotal, deliveryFee, totalAmount,
razorpayOrderId, razorpayPaymentId, razorpaySignature,
paymentStatus (enum: pending/paid/failed),
fulfillmentStatus (enum: pending/processing/shipped/delivered),
createdAt, updatedAt
```

---

## RAZORPAY INTEGRATION

- Backend: use `razorpay` npm package to create orders and verify payments
- Frontend: load Razorpay checkout script dynamically
- Flow: Create order on backend → get order_id → open Razorpay modal on frontend → on success, verify signature on backend → save order
- Checkout options: currency "INR", enable UPI, cards, netbanking
- Prefill customer details from checkout form
- After payment: decrement stock quantity for purchased items

---

## DESIGN

- Mobile-first — most users will be on phones
- Color palette: warm earth tones (dark brown, cream, tan) — coffee theme
- Clean typography, generous whitespace
- Product images should be prominent
- All prices shown as ₹XXX format
- Loading states and error states for all async operations
- Toast notifications for add to cart, errors, etc.
- Responsive: works great on 360px mobile up to 1440px desktop

---

## CONSTRAINTS & RULES

- Cart state: React Context + localStorage for persistence
- No user authentication — only admin auth
- No image upload — admin pastes image URLs
- INR currency only
- Flat delivery: ₹50 under ₹500, free above ₹500
- Single monorepo: `/client` and `/server` folders
- Admin route protection: simple JWT middleware
- Validate all inputs on backend
- Handle Razorpay webhook for payment confirmation (POST /api/webhooks/razorpay)
- Use environment variables for all secrets
- Add proper CORS config for frontend ↔ backend

### File Structure
```
/client
  /src
    /components    → Navbar, Footer, ProductCard, CartItem, AdminRoute, Toast
    /pages         → Home, Products, ProductDetail, Cart, Checkout, OrderConfirmation, Admin (Login, Dashboard, ProductsManager, OrdersManager)
    /context       → CartContext.jsx
    /utils         → api.js (axios instance with base URL)
    App.jsx
    main.jsx
/server
  /models          → Product.js, Order.js
  /routes          → products.js, orders.js, admin.js, webhooks.js
  /middleware       → auth.js
  server.js
.env
README.md
```

### Run
```bash
# Server
cd server && npm install && npm run dev

# Client  
cd client && npm install && npm run dev
```

---

Start with plan mode. Outline everything, then build file by file. Make it look like a real business, not a tutorial project.
