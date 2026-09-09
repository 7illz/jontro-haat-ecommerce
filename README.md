# Nexus Store

Nexus Store is a full-stack e-commerce application with a responsive customer storefront and a protected administration dashboard. Customers can browse and review products, manage a cart, apply coupons, place orders, view order history, and chat with support in real time.

## Features

- Product browsing with search, category filters, sorting, stock status, and reviews
- Email/password authentication and Google sign-in
- Persistent shopping cart and coupon support
- Server-validated checkout, pricing, inventory, and order history
- Cash-on-delivery and online-payment selections
- Role-protected owner dashboard
- Product and image management with Cloudinary support
- Order management, delivery tracking, and dashboard analytics
- Real-time customer support chat with Socket.IO
- API security with Helmet, CORS, rate limiting, validation, and centralized error handling

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS, Recharts, Lucide React |
| Backend | Node.js, Express 5, Socket.IO |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt, Google OAuth |
| Media | Multer, Cloudinary |
| Email | Resend, Nodemailer |

## Project structure

```text
my-ecommerce-site/
|-- backend/
|   |-- config/          # Environment and CORS configuration
|   |-- controllers/     # HTTP request handlers
|   |-- middleware/      # Authentication, validation, uploads, and errors
|   |-- models/          # Mongoose schemas
|   |-- routes/          # REST API routes
|   |-- services/        # Application and business logic
|   |-- sockets/         # Real-time chat handlers
|   |-- app.js           # Express application
|   `-- server.js        # Database, HTTP, and Socket.IO startup
`-- frontend/
    `-- src/
        |-- api/         # API and socket clients
        |-- components/  # Shared storefront and admin components
        |-- context/     # Global store state
        `-- pages/       # Storefront and admin pages
```

## Getting started

### Prerequisites

- Node.js and npm
- MongoDB Atlas or a local MongoDB replica set
- Optional: Google OAuth credentials and a Cloudinary account

Checkout uses MongoDB transactions, so the configured MongoDB deployment must support replica sets. MongoDB Atlas supports them by default.

### 1. Clone the repository

```bash
git clone https://github.com/7illz/nexus-store-ecommerce.git
cd nexus-store-ecommerce
```

### 2. Configure and run the backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, copy the environment file with:

```powershell
Copy-Item .env.example .env
```

Update `backend/.env` with your own values:

| Variable | Purpose | Example/default |
| --- | --- | --- |
| `PORT` | Backend HTTP port | `5000` |
| `MONGO_URI` | MongoDB connection string | Local replica set URI |
| `JWT_SECRET` | Secret used to sign authentication tokens | Use a long random value |
| `FRONTEND_URL` | Allowed frontend origin; comma-separate multiple origins | `http://localhost:5173` |
| `FLAT_SHIPPING_PRICE` | Flat shipping charge | `10` |
| `TAX_RATE` | Tax rate as a decimal | `0.08` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Optional for URL-only images |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Optional for URL-only images |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Optional for URL-only images |
| `RESEND_API_KEY` | Resend key for order emails | Optional |

The backend runs at `http://localhost:5000` by default.

### 3. Configure and run the frontend

Open another terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Update `frontend/.env` as needed:

| Variable | Purpose | Default/example |
| --- | --- | --- |
| `VITE_API_URL` | Backend base URL | `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth web client ID | Google client ID |

The storefront runs at `http://localhost:5173` by default.

## Owner account and sample products

Public registration creates a customer account. To bootstrap the first owner, register normally and change that user's `role` from `user` to `owner` directly in MongoDB. Once an owner exists, the protected owner-registration endpoint can create additional owners.

To import or update the sample product catalog after creating an owner:

```bash
cd backend
npm run seed:products
```

## Available scripts

### Backend

```bash
npm run dev            # Start with Nodemon
npm start              # Start with Node.js
npm run seed:products  # Upsert the sample catalog
```

### Frontend

```bash
npm run dev      # Start the Vite development server
npm run build    # Create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

## API overview

| Base path | Description |
| --- | --- |
| `/api/auth` | Registration, login, Google authentication, and owner registration |
| `/api/products` | Catalog browsing and owner product management |
| `/api/products/:id/reviews` | Authenticated product reviews |
| `/api/coupons` | Coupon validation and application |
| `/api/orders` | Checkout, customer order history, and owner order management |
| `/api/chat` | Owner access to active support sessions |

Authenticated requests use a bearer token:

```http
Authorization: Bearer <token>
```

## Production notes

- Set `FRONTEND_URL` to the deployed frontend origin.
- Set `VITE_API_URL` before building the frontend.
- Use a strong, private `JWT_SECRET` and never commit `.env` files.
- Use a MongoDB deployment with transaction support.
- Configure Cloudinary before uploading product image files.
