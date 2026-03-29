# Brew Haven — Coffee E-Commerce

## Project Overview

Indian coffee bean e-commerce store built with the MERN stack. Customers browse products, add to cart, checkout with Razorpay payments, and track orders. GST-compliant with tax invoices. Admins manage products, orders, reviews, and view sales analytics. Email notifications are sent on order events via SMTP.

## Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS, deployed on **Vercel**
- **Backend**: Express.js REST API, deployed on **Render**
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Payments**: Razorpay (test mode)
- **Email**: Nodemailer with configurable SMTP (Gmail or any provider)

The frontend and backend are deployed separately. In development, Vite proxies `/api` to `localhost:5000`. In production, the client uses `VITE_API_URL` (build-time env var) to call the Render backend directly.

## File Structure

```
coffee-shop/
├── CLAUDE.md                          # This file
├── .env                               # All env vars (server + shared)
├── .gitignore
├── package.json                       # Root monorepo scripts (concurrently)
│
├── client/
│   ├── vite.config.js                 # Vite config: React plugin, Tailwind, /api proxy
│   ├── vercel.json                    # SPA rewrite rule for Vercel deployment
│   ├── package.json
│   └── src/
│       ├── main.jsx                   # Entry point, wraps app in CartProvider + BrowserRouter
│       ├── App.jsx                    # All route definitions (public + admin)
│       ├── index.css                  # Tailwind imports + custom coffee color palette
│       ├── context/
│       │   └── CartContext.jsx        # Cart state via useReducer, persisted to localStorage
│       ├── components/
│       │   ├── Navbar.jsx             # Public nav: Home, Shop, Track Order, Cart (mobile responsive)
│       │   ├── AdminNavbar.jsx        # Admin nav: Dashboard, Products, Orders, Reviews, View Store, Logout
│       │   ├── Footer.jsx             # Site footer (hidden on admin pages)
│       │   ├── ProductCard.jsx        # Product grid card with rating stars, add-to-cart
│       │   ├── CartItem.jsx           # Single cart item row with quantity controls
│       │   ├── AdminRoute.jsx         # JWT guard: client-side expiry check + server-side /admin/verify call on every page load
│       │   └── StarRating.jsx         # Reusable star display/input component
│       ├── pages/
│       │   ├── Home.jsx               # Landing page with hero, featured products
│       │   ├── Products.jsx           # Product grid with roast type filter tabs
│       │   ├── ProductDetail.jsx      # Single product + reviews section
│       │   ├── Cart.jsx               # Cart page with items, totals, checkout button
│       │   ├── Checkout.jsx           # Contact + address form, Razorpay integration
│       │   ├── OrderConfirmation.jsx  # Post-payment: order details, status tracker, invoice link, WhatsApp share
│       │   ├── TrackOrder.jsx         # Phone-only (order list with time filter, pagination) or phone+ID (full details + invoice) tracking
│       │   ├── Invoice.jsx            # GST tax invoice page with print/download, per-line HSN/tax breakup
│       │   └── admin/
│       │       ├── Login.jsx          # Admin password login
│       │       ├── Dashboard.jsx      # Analytics: stat cards, revenue chart, top products, low stock alert (no manage links — navbar handles nav)
│       │       ├── ProductsManager.jsx # Product CRUD table with modal form, low stock highlighting
│       │       ├── OrdersManager.jsx  # Orders with tabs, time/month filters, search, date range picker, CSV export
│       │       └── ReviewsManager.jsx # All reviews with delete moderation
│       └── utils/
│           └── api.js                 # Axios instance: baseURL from VITE_API_URL, JWT interceptor, global 401 redirect
│
└── server/
    ├── server.js                      # Express app setup, middleware, route mounting, MongoDB connect
    ├── seed.js                        # Seeds 8 Indian coffee products with Unsplash images
    ├── package.json
    ├── middleware/
    │   └── auth.js                    # JWT verification middleware for admin routes
    ├── models/
    │   ├── Product.js                 # name, price, weight, roastType, origin, imageUrl, stock, lowStockThreshold, lowStockAlertSent
    │   ├── Order.js                   # orderId (random ORD-XXXXXX), customer, items, amounts, Razorpay IDs, payment/fulfillment status, gstBreakdown
    │   └── Review.js                  # productId, customerName, customerPhone, rating, reviewText, isVerified
    ├── routes/
    │   ├── products.js                # Public product listing, detail, reviews CRUD
    │   ├── orders.js                  # Order creation, payment verification, GST calculation, tracking, invoice
    │   ├── admin.js                   # Auth + token verify + all admin CRUD, analytics, low-stock, reviews
    │   └── webhooks.js                # Razorpay webhook backup for payment confirmation
    └── utils/
        ├── email.js                   # Nodemailer transport setup, sendEmail() — skips if no SMTP_HOST
        └── emailTemplates.js          # buildEmail() layout, order confirmation, status update, low stock alert templates
```

## Environment Variables

### Server (.env in project root)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `RAZORPAY_KEY_ID` | Razorpay API key ID (test or live) |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `ADMIN_PASSWORD` | Single admin password for login |
| `JWT_SECRET` | Secret for signing admin JWT tokens |
| `PORT` | Server port (default 5000) |
| `SMTP_HOST` | SMTP server host (leave empty to disable emails) |
| `SMTP_PORT` | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | SMTP username/email |
| `SMTP_PASS` | SMTP password or app password |
| `SMTP_FROM` | Sender email address (also receives low stock alerts) |
| `FRONTEND_URL` | Frontend URL for email links (e.g. Vercel URL) |

### Client (Vercel environment)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Full backend API URL (e.g. `https://coffee-ecom-l5hs.onrender.com/api`). Embedded at build time. Falls back to `/api` for local dev. |

## Key Flows

### Checkout → Payment → Order
1. Checkout form validates contact + address (Indian states dropdown, 6-digit pincode)
2. `POST /api/orders/create` — validates items, re-fetches prices from DB, creates Razorpay order, saves order to DB with `paymentStatus: pending`
3. Razorpay checkout modal opens with prefilled customer info
4. On payment success, `POST /api/orders/verify` — verifies HMAC signature, updates order to `paid`, calculates GST breakdown (CGST/SGST for Karnataka, IGST for other states), decrements stock, checks low stock alerts, sends confirmation email with GST breakup + invoice link
5. Phone saved to localStorage, redirects to `/order/:orderId`
6. OrderConfirmation page loads order, clears cart, shows status tracker, download invoice button

### Order Tracking
- **Phone only**: `GET /api/orders/track-by-phone` — returns summary list (orderId, date, total, status only). Shows 5 at a time with "Show More" pagination. Filter by Last 7/30/90 days.
- **Phone + Order ID**: `GET /api/orders/track` — returns full order details with "Download Invoice" button for paid orders
- Phone normalization handles 10-digit, +91, and 91 prefixes via `$or` query

### Admin Panel
1. Login with password → JWT stored in localStorage (24h expiry)
2. Every admin page load: `AdminRoute` validates token server-side via `GET /api/admin/verify`. If invalid/expired → redirect to login. Shows spinner while checking.
3. Global 401 interceptor in `api.js` catches expired tokens mid-session → clears token, redirects to login
4. **Separate admin navbar** (`AdminNavbar`): Dashboard/Products/Orders/Reviews links, "View Store" (opens public site in new tab), Logout. Shown on all admin pages except login. Public navbar + footer hidden on admin pages.
5. Dashboard: revenue stats (today/week/month), GST collected this month, avg order value, bar chart (last 7 days), top 5 products, low stock banner. No manage links — navbar handles navigation.
6. Products: CRUD table, modal form, low stock rows highlighted orange
7. Orders: 3 tabs (Active/Completed/Failed), time filters (Today/Week/Month/All/Custom date range), month dropdown filter, search by order ID/name/phone, compact rows, CSV export. Month filter resets when switching tabs.
8. Reviews: list all with product name, delete moderation
9. Status update sends email only if status actually changed (old vs new comparison)

### Email Notifications
- **Order confirmed** (payment verified) → customer email with items, total, GST breakup (CGST/SGST or IGST), address, track button, invoice link
- **Processing** (admin updates) → "being prepared" email
- **Shipped** (admin updates) → shipping notification with tracking link
- **Delivered** (admin updates) → delivery confirmation with "Order Again" link
- **Low stock alert** → sent to SMTP_FROM when product drops below threshold after order (once per product via `lowStockAlertSent` flag, resets on restock)

## API Routes

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List active products (optional `?roastType=` filter), includes avgRating/reviewCount |
| GET | `/api/products/:id` | Single product detail |
| GET | `/api/products/:id/reviews` | Reviews for a product + avgRating + reviewCount |
| POST | `/api/products/:id/reviews` | Submit review (rate-limited, 1 per phone per product) |
| POST | `/api/orders/create` | Create order + Razorpay order |
| POST | `/api/orders/verify` | Verify Razorpay payment |
| GET | `/api/orders/track-by-phone` | Order summaries by phone (`?phone=`) |
| GET | `/api/orders/track` | Full order by ID + phone (`?orderId=&phone=`) |
| GET | `/api/orders/:id/invoice` | Invoice data for paid order (validated by `?phone=`) |
| GET | `/api/orders/:id` | Order details by orderId |
| POST | `/api/webhooks/razorpay` | Razorpay webhook (signature-verified) |

### Admin (all require `Authorization: Bearer <jwt>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Login (rate-limited) |
| GET | `/api/admin/verify` | Validate JWT token is still valid (used by AdminRoute on every page load) |
| GET | `/api/admin/products` | All products including inactive |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/:id` | Update product (resets lowStockAlertSent if restocked) |
| DELETE | `/api/admin/products/:id` | Delete product |
| GET | `/api/admin/orders` | All orders |
| PUT | `/api/admin/orders/:id` | Update fulfillment status (triggers email if changed) |
| GET | `/api/admin/reviews` | All reviews (populated with product name) |
| DELETE | `/api/admin/reviews/:id` | Delete review |
| GET | `/api/admin/low-stock` | Products where stock <= threshold |
| GET | `/api/admin/stats` | Analytics: period stats, daily chart, top products, avg order value, GST collected this month |

## Key Patterns

- **Cart**: `useReducer` in `CartContext`, persisted to `localStorage` key `coffee-cart`
- **Admin auth**: Single password → JWT in `localStorage` key `adminToken`. `AdminRoute` validates on every page load: quick client-side expiry check, then `GET /api/admin/verify` for server-side validation. `auth.js` middleware protects all admin API routes. `api.js` has a global 401 interceptor that clears token and redirects to `/admin/login` if any admin API call fails auth mid-session.
- **Emails**: Async fire-and-forget — `sendEmail()` catches errors and logs, never throws. Entire email system no-ops gracefully if `SMTP_HOST` is empty.
- **Phone normalization**: Tracking routes use `$or` to match phone as 10-digit, +91-prefixed, or 91-prefixed
- **Order IDs**: Random alphanumeric `ORD-XXXXXX` (6 chars from A-Z/2-9, excludes 0/O/1/I). Uniqueness checked before save, `unique: true` index as safety net.
- **Low stock alerts**: `lowStockAlertSent` boolean on Product prevents duplicate emails. Resets when admin restocks above threshold.
- **Review verification**: `isVerified` set to true if `customerPhone` matches a paid order containing that product
- **API client**: Single axios instance (`utils/api.js`) with `baseURL` from `VITE_API_URL` env var, auto-attaches admin JWT, normalizes error messages, global 401 redirect for admin routes
- **Admin UI**: `App.jsx` uses `useLocation` to swap navbars — `AdminNavbar` on admin pages (except login), public `Navbar` elsewhere. Footer hidden on admin pages. Admin pages have no back-arrow links; the admin navbar handles all navigation. Orders page has time filters, month dropdown, and search that all combine with tab filtering. Customer TrackOrder page also has a month filter dropdown for the order list view.
- **GST compliance**: All product prices are GST-inclusive (5%, HSN 0901). On payment verification, `gstBreakdown` is calculated and stored on the order: base price = subtotal / 1.05, then CGST 2.5% + SGST 2.5% if customer state is Karnataka (intra-state), or IGST 5% if different state (inter-state). Invoice page at `/invoice/:orderId` shows full tax invoice with per-line HSN breakup, printable via `window.print()`. GSTIN placeholder "XXXXXXXXXXXX" in invoice header. "(incl. GST)" labels shown on product cards, detail page, cart, and checkout. Admin dashboard shows GST collected this month.
- **Server static files**: Only served if `client/dist/` exists (checked with `fs.existsSync`), otherwise returns API health JSON at `/`

## Deployment

### Frontend (Vercel)
- Source: `client/` directory
- Build: `npm run build` (Vite)
- Env var: `VITE_API_URL=https://coffee-ecom-l5hs.onrender.com/api`
- SPA routing via `vercel.json` rewrites

### Backend (Render)
- Source: `server/` directory
- Start: `node server.js`
- All `.env` variables configured in Render dashboard
- No `client/dist` on Render — server runs API-only mode

## Development

```bash
# From project root
npm run dev          # Starts both server (nodemon) and client (vite) concurrently

# Or separately
cd server && npm run dev
cd client && npm run dev

# Seed products
cd server && npm run seed
```

## When Making Changes

- **Adding an API route**: Update both the server route file AND any client pages that call it. Check if the route needs auth middleware.
- **Modifying models**: Check all routes that read/write that model. Check seed.js if adding required fields.
- **Changing env vars**: Update both `.env` locally and the deployment platform (Vercel for `VITE_` vars, Render for server vars). `VITE_` vars require a rebuild.
- **Email changes**: Templates are in `emailTemplates.js`, transport in `email.js`. Test with SMTP_HOST empty to ensure no-op behavior.
- **Admin features**: Need route in `admin.js`, component in `pages/admin/`, route in `App.jsx`, and nav link in `AdminNavbar.jsx`.
