# Brew Haven - Indian Coffee E-Commerce

**Live demo:** https://coffee-ecom-rho.vercel.app

A full-stack coffee bean e-commerce store built with the MERN stack. Customers browse products, add to cart, checkout with Razorpay payments, and track orders. GST-compliant with tax invoices. Admins manage products, orders, reviews, and view sales analytics.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Express.js REST API
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Payments**: Razorpay
- **Email**: Nodemailer (SMTP)
- **Deployment**: Vercel (frontend) + Render (backend)

## Features

### Customer-Facing
- Product browsing with roast type filters and star ratings
- Cart with localStorage persistence
- Checkout with Razorpay payment integration
- GST-compliant tax invoices (5% GST, HSN 0901, CGST/SGST or IGST)
- Order tracking by Order ID + phone number
- Product reviews with verified purchase badges
- WhatsApp order sharing
- Stock-out protection with automatic refunds

### Admin Panel
- Revenue dashboard with day/month/year line charts
- Stat cards: revenue, avg order value, customer count, GST collected
- Recent orders and top products at a glance
- Low stock alerts (out-of-stock items highlighted in red)
- Product CRUD with live GST breakup preview
- Order management with status updates (triggers email notifications)
- Customer list aggregated from orders with search
- Review moderation
- CSV export for orders

### Order & Payment
- Two-phase stock protection against overselling
- Atomic stock decrement on payment verification
- Automatic Razorpay refund if stock runs out after payment
- Persistent refund modal (not a dismissable toast) with cart cleanup
- Refund banners on order tracking and confirmation pages
- Email notifications: order confirmed, processing, shipped, delivered, low stock alerts

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Razorpay account (test mode works)

### Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_connection_string
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_jwt_secret
PORT=5000

# Optional - leave SMTP_HOST empty to disable emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
FRONTEND_URL=http://localhost:5173
```

For the client (only needed in production / Vercel):
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### Installation

```bash
# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Running Locally

```bash
# From project root - starts both server and client
npm run dev

# Or separately
cd server && npm run dev    # Backend on port 5000
cd client && npm run dev    # Frontend on port 5173
```

### Seed Data

```bash
cd server && npm run seed   # Seeds 8 Indian coffee products
```

### Admin Access

Navigate to `/admin/login` and enter the `ADMIN_PASSWORD` you set in `.env`.

## Deployment

### Frontend (Vercel)
- Root directory: `client/`
- Build command: `npm run build`
- Set `VITE_API_URL` environment variable to your backend URL

### Backend (Render)
- Root directory: `server/`
- Start command: `node server.js`
- Set all `.env` variables in the Render dashboard

## API Overview

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (optional `?roastType=` filter) |
| GET | `/api/products/:id` | Product detail |
| POST | `/api/products/:id/reviews` | Submit review |
| POST | `/api/orders/create` | Create order + Razorpay payment |
| POST | `/api/orders/verify` | Verify payment + process order |
| GET | `/api/orders/track` | Track order by ID + phone |
| GET | `/api/orders/:id/invoice` | Invoice data (phone-verified) |

### Admin Endpoints (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/stats` | Dashboard analytics |
| GET/POST/PUT/DELETE | `/api/admin/products` | Product CRUD |
| GET/PUT | `/api/admin/orders` | Order management |
| GET | `/api/admin/customers` | Customer list |
| GET/DELETE | `/api/admin/reviews` | Review moderation |

## License

MIT
