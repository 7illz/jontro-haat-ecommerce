# JontroHaat

JontroHaat is a full-stack e-commerce application with a responsive customer storefront and a protected administration dashboard. Customers can browse and review products, manage a cart, apply coupons, place orders, view order history, and chat with support in real time.

## Live deployment

- **Frontend:** [Open JontroHaat](https://nexus-store-ecommerce.vercel.app)
- **Source:** [github.com/7illz/jontro-haat-ecommerce](https://github.com/7illz/jontro-haat-ecommerce)

The frontend is deployed on Vercel. Features that call the API require `VITE_API_URL` to point to a running deployment of the backend.

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
| Testing | Vitest, Supertest, Playwright, TypeScript |

## Project structure

```text
jontro-haat-ecommerce/
|-- backend/
|   |-- config/          # Environment and CORS configuration
|   |-- controllers/     # HTTP request handlers
|   |-- middleware/      # Authentication, validation, uploads, and errors
|   |-- models/          # Mongoose schemas
|   |-- routes/          # REST API routes
|   |-- services/        # Application and business logic
|   |-- sockets/         # Real-time chat handlers
|   |-- tests/           # Backend API and service integration tests
|   |-- app.js           # Express application
|   `-- server.js        # Database, HTTP, and Socket.IO startup
|-- frontend/
|   `-- src/
|       |-- api/         # API and socket clients
|       |-- components/  # Shared storefront and admin components
|       |-- context/     # Global store state
|       `-- pages/       # Storefront and admin pages
|-- tests/               # Playwright E2E test specs
`-- playwright.config.ts # Playwright test configuration
```

## Getting started

### Prerequisites

- Node.js and npm
- MongoDB Atlas or a local MongoDB replica set
- Optional: Google OAuth credentials and a Cloudinary account

Checkout uses MongoDB transactions, so the configured MongoDB deployment must support replica sets. MongoDB Atlas supports them by default.

### 1. Clone the repository

```bash
git clone https://github.com/7illz/jontro-haat-ecommerce.git
cd jontro-haat-ecommerce
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
| `CURRENCY_CODE` | ISO-style display currency code | `BDT` |
| `CURRENCY_SYMBOL` | Currency symbol returned to the storefront | `৳` |
| `MONGO_URI_TEST` | Isolated replica-set database used by tests | Database name must contain `test` |
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

To import or update the sample product catalog (an existing owner is associated when available):

```bash
cd backend
npm run seed:products
```

## Available scripts

From the repository root:

```bash
npm run dev           # Start backend and frontend together
npm run build         # Build the production frontend
npm run lint          # Check frontend and backend source
npm test              # Run backend integration tests with coverage
npm run test:e2e      # Run Playwright (starts both servers)
npm run test:all      # Run lint, backend tests, and E2E tests
npm run seed:test     # Reset deterministic fixtures in the isolated test DB
```

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

## Testing

JontroHaat includes database-backed API integration tests using Vitest/Supertest and an end-to-end suite built with Playwright. Checkout tests require MongoDB configured as a replica set because production checkout uses transactions.

### Test stack

| Tool | Purpose |
| --- | --- |
| [Playwright](https://playwright.dev/) | Browser automation and E2E test runner |
| Vitest and Supertest | Backend service and HTTP integration tests with coverage |
| TypeScript | Strongly-typed test authoring |

Playwright is installed as a dev dependency at the project root (`@playwright/test`). Backend test dependencies live in `backend/package.json`. Playwright configuration lives in [`playwright.config.ts`](playwright.config.ts), and backend coverage settings live in [`backend/vitest.config.js`](backend/vitest.config.js).

### Prerequisites

Provide `MONGO_URI_TEST` pointing to a replica-set database whose name contains `test`. The fixture command refuses any other database. `npm run seed:test` resets that database and creates deterministic users, products, and coupon states. Credentials can be overridden with `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, `TEST_ADMIN_EMAIL`, and `TEST_ADMIN_PASSWORD`; test-only defaults are documented in `backend/.env.example`.

Playwright starts the backend and frontend automatically. Install its browser binaries once with `npx playwright install`.

### Setup

From the project root:

```bash
# Install project dev dependencies (includes @playwright/test)
npm install

# Download the browser binaries Playwright needs (Chromium, Firefox, WebKit)
npx playwright install

# Reset the isolated test database
npm run seed:test
```

### Running the tests

```bash
# Run backend integration tests and coverage
npm run test:backend

# Run E2E tests across Chromium, Firefox, and WebKit
npm run test:e2e

# Run a specific test file
npx playwright test tests/auth.spec.ts

# Run tests in headed mode (opens a visible browser window)
npx playwright test --headed

# Run tests in a single browser only
npx playwright test --project=chromium

# Run tests with the Playwright UI (interactive mode)
npx playwright test --ui

# View the HTML report after a test run
npx playwright show-report
```

### Test structure

```text
jontro-haat-ecommerce/
|-- backend/
|   `-- tests/
|       `-- api.integration.test.js # Auth, authorization, coupons, pricing, and checkout
|-- tests/
|   |-- auth.spec.ts       # Authentication flows
|   |-- homepage.spec.ts   # Homepage and product browsing
|   |-- cart.spec.ts       # Shopping cart operations
|   |-- checkout.spec.ts   # Checkout and order placement
|   |-- admin.spec.ts      # Admin dashboard access and features
|-- playwright.config.ts   # Playwright configuration
`-- package.json           # Dev dependencies (@playwright/test)
```

### Test coverage

#### `auth.spec.ts` — Authentication (7 tests)

| # | Test | What it verifies |
| --- | --- | --- |
| 1 | Login page renders correctly | Email field, password field, and "Sign In" button are visible |
| 2 | Login with valid credentials | User is redirected to `/` after successful login |
| 3 | Navbar post-login state | User name and "Logout" button appear; "Log In" link is hidden |
| 4 | Protected route `/profile` | Unauthenticated users are redirected to `/login` |
| 5 | Protected route `/checkout` | Unauthenticated users are redirected to `/login` |
| 6 | Logout clears session | Clicking "Logout" clears localStorage and reverts the navbar |
| 7 | Invalid credentials | Wrong email/password shows a red error message and stays on `/login` |

#### `homepage.spec.ts` — Homepage & Product Browsing (8 tests)

| # | Test | What it verifies |
| --- | --- | --- |
| 1 | Hero heading visible | The "Next-Gen Tech & Gear" hero heading renders |
| 2 | Product cards load | At least one product card is visible after the API resolves |
| 3 | Card content | Each card shows a non-empty name and a valid ৳ price |
| 4 | Product navigation | Clicking a card navigates to `/product/:id` |
| 5 | Search filtering | Typing in the search bar filters and shows "Search Results for…" |
| 6 | Navbar brand | JontroHaat brand link is visible and navigates to `/` |
| 7 | Category filter | Selecting a category narrows the product list to matching items |
| 8 | Empty search state | A nonsense query shows "No products found" with a "Clear Filters" button |

#### `cart.spec.ts` — Shopping Cart (8 tests)

| # | Test | What it verifies |
| --- | --- | --- |
| 1 | Add to cart | Product is added from the product page; navbar badge appears |
| 2 | Badge count | Navbar cart badge shows "1" after adding a single item |
| 3 | Cart page shows item | Added product appears in the cart list on `/cart` |
| 4 | Quantity update | Changing the quantity dropdown updates the badge and subtotal |
| 5 | Remove item | Clicking the trash icon removes the item and shows the empty state |
| 6 | Order Summary | Subtotal and total prices are displayed with correct ৳ formatting |
| 7 | Empty cart state | Visiting `/cart` with nothing added shows "Your cart is empty" |
| 8 | Proceed to Checkout | The checkout button navigates a logged-in user to `/checkout` |

#### `checkout.spec.ts` — Checkout & Orders (9 tests)

| # | Test | What it verifies |
| --- | --- | --- |
| 1 | Auth guard | Unauthenticated users are redirected to `/login` |
| 2 | Access checkout | Logged-in user with cart items can reach `/checkout` |
| 3 | Form fields | All shipping fields, payment radios, and "Place Order" button render |
| 4 | Place order (mocked) | Filling the form and submitting redirects to `/` on success |
| 5 | Success toast | "Order placed successfully! 🎉" toast appears after order |
| 6 | Cart cleared | Cart badge disappears and localStorage is emptied after order |
| 7 | Empty cart guard | Visiting `/checkout` with an empty cart shows the empty state |
| 8 | Order Summary panel | Item subtotal, shipping, tax (8%), and total lines are visible |
| 9 | Processing overlay | "Placing Order" overlay appears while the API request is in-flight |

> **Note:** Checkout tests mock the `POST /api/orders` endpoint with `page.route()` so no real orders are created in the database during test runs.

#### `admin.spec.ts` — Admin Dashboard (6 tests)

| # | Test | What it verifies |
| --- | --- | --- |
| 1 | Regular user blocked | A non-owner user visiting `/admin` is redirected to `/` |
| 2 | Admin access | An owner user can access the admin dashboard |
| 3 | Dashboard KPIs | Overview page shows Total Revenue, Total Orders, Pending Deliveries, Total Products, charts, and recent orders |
| 4 | Product management | Admin can navigate to `/admin/products` and see the inventory table |
| 5 | Order management | Admin can navigate to `/admin/orders` and see the order table |
| 6 | Chatbot hidden | The customer chatbot is not rendered for admin/owner users |

### Configuration

The Playwright configuration is defined in [`playwright.config.ts`](playwright.config.ts):

| Setting | Value | Notes |
| --- | --- | --- |
| `testDir` | `./tests` | All test files live here |
| `baseURL` | `http://localhost:5173` | Frontend dev server URL |
| `fullyParallel` | `true` | Tests run in parallel locally |
| `retries` | `0` locally, `2` on CI | Automatic retries in CI only |
| `workers` | Auto locally, `1` on CI | Single worker in CI for stability |
| `reporter` | `html` | Generates an interactive HTML report |
| `trace` | `on-first-retry` | Captures traces on first retry for debugging |
| Browsers | Chromium, Firefox, WebKit | Cross-browser coverage by default |

### Writing new tests

1. Create a new `.spec.ts` file inside the `tests/` directory.
2. Import `test` and `expect` from `@playwright/test`.
3. Use `test.describe()` to group related scenarios.
4. Use reusable helpers like `injectAuthSession()` for tests that need a logged-in user as a precondition (faster than filling the login form every time).
5. Use `page.route()` to mock API endpoints when you want to avoid side effects (e.g., creating real orders).
6. Target elements using accessible selectors: `getByRole()`, `getByLabel()`, `getByText()`, and `getByPlaceholder()`.

### CI integration

To run the test suite in a CI pipeline (e.g., GitHub Actions):

```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npx playwright test
  env:
    CI: true
```

When `CI=true`, Playwright automatically:
- Uses **1 worker** (no parallelism) for deterministic results.
- Retries failed tests **2 times**.
- Fails the build if any `test.only` calls are left in the source.

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

- The frontend is deployed through Vercel using `frontend/` as the project root.
- Set backend `FRONTEND_URL` to `https://nexus-store-ecommerce.vercel.app` (or a replacement custom domain) so browser API and Socket.IO requests pass CORS checks.
- Set frontend `VITE_API_URL` to the public backend URL before triggering a Vercel build.
- Use a strong, private `JWT_SECRET` and never commit `.env` files.
- Use a MongoDB deployment with transaction support.
- Configure Cloudinary before uploading product image files.
