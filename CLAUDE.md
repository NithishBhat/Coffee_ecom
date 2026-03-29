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
│       │   ├── AdminNavbar.jsx        # Admin nav: Dashboard, Products, Orders, Customers, Reviews, View Store, Logout
│       │   ├── Footer.jsx             # Site footer (hidden on admin pages)
│       │   ├── ProductCard.jsx        # Product grid card with rating stars, low stock warning, add-to-cart
│       │   ├── CartItem.jsx           # Single cart item row with quantity controls
│       │   ├── AdminRoute.jsx         # JWT guard: client-side expiry check + server-side /admin/verify call on every page load
│       │   └── StarRating.jsx         # Reusable star display/input component
│       ├── pages/
│       │   ├── Home.jsx               # Landing page with hero, featured products
│       │   ├── Products.jsx           # Product grid with roast type filter tabs
│       │   ├── ProductDetail.jsx      # Single product + reviews section
│       │   ├── Cart.jsx               # Cart page with items, totals, checkout button
│       │   ├── Checkout.jsx           # Contact + address form, Razorpay integration, refund modal on stock-out after payment
│       │   ├── OrderConfirmation.jsx  # Post-payment: order details, status tracker (or refund banner if refunded), invoice link, WhatsApp share
│       │   ├── TrackOrder.jsx         # Order tracking by orderId + phone (both required), shows full details + invoice
│       │   ├── Invoice.jsx            # GST tax invoice page with print/download, per-line HSN/tax breakup
│       │   └── admin/
│       │       ├── Login.jsx          # Admin password login
│       │       ├── Dashboard.jsx      # Analytics: line chart (day/month/year toggle), stat cards, recent orders, top products, low stock alert
│       │       ├── ProductsManager.jsx # Product CRUD table with modal form (GST breakup preview), low stock highlighting
│       │       ├── OrdersManager.jsx  # Orders with tabs, time/month filters, search, date range picker, CSV export
│       │       ├── CustomersManager.jsx # Customer table aggregated from orders, expandable order history, search
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
    │   ├── Order.js                   # orderId (random ORD-XXXXXX), customer, items, amounts, Razorpay IDs, payment/fulfillment status (incl. refunded), refundReason, gstBreakdown
    │   └── Review.js                  # productId, customerName, customerPhone, rating, reviewText, isVerified
    ├── routes/
    │   ├── products.js                # Public product listing, detail, reviews CRUD
    │   ├── orders.js                  # Order creation (stock check), payment verification (atomic decrement, refund on failure), GST, tracking, invoice
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
2. `POST /api/orders/create` — validates items, re-fetches prices from DB, **checks stock for all items** (returns `stockErrors` array with name/requested/available if any are insufficient). Creates Razorpay order, saves order with `paymentStatus: pending`
3. Razorpay checkout modal opens with prefilled customer info
4. On payment success, `POST /api/orders/verify`:
   - Verifies HMAC signature
   - Updates order to `paid`, calculates GST breakdown
   - **Atomic stock decrement**: uses `findOneAndUpdate` with `{ stockQuantity: { $gte: qty } }` — only decrements if stock exists
   - **If stock ran out after payment**: rolls back successful decrements, initiates Razorpay refund (`razorpay.payments.refund`), sets `paymentStatus: 'refunded'` with `refundReason`, returns error to frontend
   - If stock OK: checks low stock alerts, sends confirmation email with GST breakup + invoice link
5. Phone saved to localStorage, redirects to `/order/:orderId`
6. OrderConfirmation page loads order, clears cart, shows status tracker, download invoice button. If order is refunded, shows refund banner (reason, payment ID, 5-7 day timeline) instead of progress tracker, and hides invoice/WhatsApp actions.
7. **Frontend handles failures**: stock check errors show toast asking to update cart; refund after payment shows a persistent modal (not a toast) with refund reason and timeline — user must click "OK" which removes the out-of-stock item from cart and redirects to `/cart`

### Order Tracking
- **Order ID + Phone**: `GET /api/orders/track` — requires both `orderId` and `phone`. Returns full order details with "Download Invoice" button for paid orders. Order ID is the primary lookup; phone is the verification factor.
- Phone normalization handles 10-digit, +91, and 91 prefixes via `$or` query

### Admin Panel
1. Login with password → JWT stored in localStorage (24h expiry)
2. Every admin page load: `AdminRoute` validates token server-side via `GET /api/admin/verify`. If invalid/expired → redirect to login. Shows spinner while checking.
3. Global 401 interceptor in `api.js` catches expired tokens mid-session → clears token, redirects to login
4. **Separate admin navbar** (`AdminNavbar`): Dashboard/Products/Orders/Customers/Reviews links, "View Store" (opens public site in new tab), Logout. Shown on all admin pages except login. Public navbar + footer hidden on admin pages.
5. Dashboard: revenue line chart at top with Day/Month/Year toggle (7 days, 12 months, 3 years), stat cards (today/week/month revenue, avg order value, customer count, GST this month), recent orders (5 most recent paid, clickable rows → Orders page), top 5 products, low stock banner (0-stock items shown in red). All stats exclude refunded orders. No manage links — navbar handles navigation.
6. Products: CRUD table, modal form with live GST breakup preview (base price + GST 5% calculated from selling price), low stock rows highlighted orange
7. Orders: 3 tabs (Active/Completed/Failed), time filters (Today/Week/Month/All/Custom date range), month dropdown filter, search by order ID/name/phone, compact rows, CSV export. Month filter resets when switching tabs.
8. Customers: table of unique customers aggregated from orders (name, phone, email, order count, total spent, last order date). Expandable rows show full order history. Search by name/phone/email (server-side). No separate Customer model — all data from Order aggregation.
9. Reviews: list all with product name, delete moderation
9. Status update sends email only for shipped/delivered transitions (not processing or other intermediate statuses)

### Email Notifications
- **Order confirmed** (payment verified) → customer email with items, total, GST breakup (CGST/SGST or IGST), address, track button, invoice link
- **Shipped** (admin updates) → shipping notification with tracking link
- **Delivered** (admin updates) → delivery confirmation with "Order Again" link
- **Processing** — no email sent (intermediate status, not customer-facing)
- **Low stock alert** → sent to SMTP_FROM when product drops below threshold after order (once per product via `lowStockAlertSent` flag, resets on restock)

## API Routes

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List active products (optional `?roastType=` filter), includes avgRating/reviewCount |
| GET | `/api/products/:id` | Single product detail |
| GET | `/api/products/:id/reviews` | Reviews for a product + avgRating + reviewCount |
| POST | `/api/products/:id/reviews` | Submit review (rate-limited, 1 per phone per product) |
| POST | `/api/orders/create` | Stock check + create order + Razorpay order. Returns `stockErrors[]` on insufficient stock |
| POST | `/api/orders/verify` | Verify payment, atomic stock decrement, auto-refund on stock failure. Returns `refunded: true` on oversell |
| GET | `/api/orders/track` | Full order by orderId + phone (`?orderId=&phone=`, both required) |
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
| GET | `/api/admin/customers` | Unique customers aggregated from orders (supports `?search=`) |
| GET | `/api/admin/low-stock` | Products where stock <= threshold |
| GET | `/api/admin/stats` | Analytics: period stats, daily/monthly/yearly charts, top products, recent orders, avg order value, customer count, GST this month (all paid-only, excludes refunded) |

## Key Patterns

- **Cart**: `useReducer` in `CartContext`, persisted to `localStorage` key `coffee-cart`
- **Admin auth**: Single password → JWT in `localStorage` key `adminToken`. `AdminRoute` validates on every page load: quick client-side expiry check, then `GET /api/admin/verify` for server-side validation. `auth.js` middleware protects all admin API routes. `api.js` has a global 401 interceptor that clears token and redirects to `/admin/login` if any admin API call fails auth mid-session.
- **Emails**: Async fire-and-forget — `sendEmail()` catches errors and logs, never throws. Entire email system no-ops gracefully if `SMTP_HOST` is empty.
- **Phone normalization**: Tracking routes use `$or` to match phone as 10-digit, +91-prefixed, or 91-prefixed
- **Order IDs**: Random alphanumeric `ORD-XXXXXX` (6 chars from A-Z/2-9, excludes 0/O/1/I). Uniqueness checked before save, `unique: true` index as safety net.
- **Stock management**: Two-phase protection against overselling. Phase 1 (order create): checks all items have sufficient stock, returns detailed `stockErrors` array. Phase 2 (payment verify): atomic `findOneAndUpdate` with `{ stockQuantity: { $gte: qty } }` — if any fails, rolls back all decrements and auto-refunds via Razorpay API. Order gets `paymentStatus: 'refunded'` + `refundReason`. Frontend shows "Only X left!" (red) when stock <= 5, "Out of Stock" when 0.
- **Refund UX**: Refunds after payment show a persistent modal in Checkout (not a toast) — user must acknowledge. TrackOrder and OrderConfirmation replace the fulfillment progress tracker with a refund banner (reason, payment ID, 5-7 day timeline) when `paymentStatus === 'refunded'`. OrderConfirmation hides invoice/WhatsApp actions for refunded orders.
- **Low stock alerts**: `lowStockAlertSent` boolean on Product prevents duplicate emails. Resets when admin restocks above threshold.
- **Review verification**: `isVerified` set to true if `customerPhone` matches a paid order containing that product
- **API client**: Single axios instance (`utils/api.js`) with `baseURL` from `VITE_API_URL` env var, auto-attaches admin JWT, normalizes error messages, global 401 redirect for admin routes
- **Admin UI**: `App.jsx` uses `useLocation` to swap navbars — `AdminNavbar` on admin pages (except login), public `Navbar` elsewhere. Footer hidden on admin pages. Admin pages have no back-arrow links; the admin navbar handles all navigation. Orders page has time filters, month dropdown, and search that all combine with tab filtering.
- **GST compliance**: All product prices are GST-inclusive (5%, HSN 0901). Admin enters one selling price and sees live GST breakup (base price + 5% GST) in the product form — display only, no extra fields. On payment verification, `gstBreakdown` is calculated and stored on the order: base price = subtotal / 1.05, then CGST 2.5% + SGST 2.5% if customer state is Karnataka (intra-state), or IGST 5% if different state (inter-state). Invoice page at `/invoice/:orderId` shows full tax invoice with per-line HSN breakup, printable via `window.print()`. GSTIN placeholder "XXXXXXXXXXXX" in invoice header. "(incl. GST)" labels shown on product cards, detail page, cart, and checkout. Admin dashboard shows GST collected this month.
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
