import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
};

/**
 * The exact URL that CheckoutPage.jsx POSTs to when placing an order.
 * client.js: fetch(`${API_URL}${path}`) → fetch('http://localhost:5000/api/orders')
 * We use a glob pattern so page.route() intercepts it reliably.
 */
const ORDER_API_URL = 'http://localhost:5000/api/orders';

/**
 * A minimal fake order response that satisfies CheckoutPage.jsx's success path.
 * The page only calls clearCart() and navigate('/') after await createOrder()
 * resolves — it doesn't inspect the returned data — so any 200 body is fine.
 */
const MOCK_ORDER_RESPONSE = {
  _id: 'mock_order_id_123',
  orderItems: [],
  shippingAddress: { address: '123 Test St', city: 'Dhaka', postalCode: '1200', country: 'Bangladesh' },
  paymentMethod: 'Cash on Delivery',
  totalPrice: 100.00,
  isPaid: false,
  isDelivered: false,
  createdAt: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// Reusable helpers
// ---------------------------------------------------------------------------

/**
 * Calls the backend login endpoint from inside the browser context, then writes
 * the JWT + user object to localStorage exactly as LoginPage.jsx does.
 * Reloads so React re-reads localStorage and sets user state.
 */
async function injectAuthSession(page: Page) {
  await page.goto('/');
  const data = await page.evaluate(
    async ({ email, password }) => {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(`Login failed: ${res.status}`);
      return res.json();
    },
    TEST_USER
  );
  await page.evaluate(
    (d: { token: string; _id: string; name: string; email: string; role?: string; isAdmin?: boolean }) => {
      localStorage.setItem('token', d.token);
      localStorage.setItem('user', JSON.stringify({
        id: d._id, name: d.name, email: d.email,
        role: d.role ?? (d.isAdmin ? 'owner' : 'user'),
      }));
    },
    data
  );
  await page.reload();
  await page.waitForLoadState('networkidle');
}

/**
 * Clears all auth + cart state from localStorage.
 * Run in beforeEach so every test starts isolated.
 */
async function clearSessionAndCart(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('appliedCoupon');
  });
}

/**
 * loginAndAddProductToCart()
 *
 * The primary reusable helper requested for this test suite.
 *
 * 1. Injects auth session into localStorage (no UI form — fast).
 * 2. Waits for the homepage product grid to load.
 * 3. Clicks the first in-stock product to open its ProductPage.
 * 4. Clicks "Add to Cart".
 * 5. Returns the product name string.
 *
 * Why ProductPage?
 *   ProductPage has a labeled text button "Add to Cart" (easy to target).
 *   HomePage's add-to-cart is icon-only (ShoppingCart SVG, no text).
 */
async function loginAndAddProductToCart(page: Page): Promise<string> {
  await injectAuthSession(page);

  await page.goto('/');

  // Wait for the 300 ms debounce + API fetch in HomePage.jsx to complete
  // Product cards render: <h3 className="... font-semibold">{product.name}</h3>
  await page.locator('h3.font-semibold').first().waitFor({ state: 'visible', timeout: 15_000 });

  // Read the name before clicking so we can assert on it later
  const productName = (await page.locator('h3.font-semibold').first().textContent())?.trim() ?? '';

  // Click the name link → ProductPage
  // HomePage.jsx: <Link to={`/product/${product._id}`}><h3 ...>{product.name}</h3></Link>
  await page.locator('h3.font-semibold').first().click();
  await expect(page).toHaveURL(/\/product\/[a-f0-9]{24}/, { timeout: 8_000 });

  // Click "Add to Cart"
  // ProductPage.jsx: <button>{product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}</button>
  const addBtn = page.getByRole('button', { name: 'Add to Cart' });
  await expect(addBtn).toBeVisible({ timeout: 8_000 });
  await addBtn.click();

  return productName;
}

/**
 * Fills in all required shipping fields in the checkout form.
 * Uses getByLabel() with the exact label text from CheckoutPage.jsx.
 *
 * Real labels in CheckoutPage.jsx:
 *   "Street Address"  (name="address",    placeholder="123 Main St")
 *   "City"            (name="city",        placeholder="New York")
 *   "Postal Code"     (name="postalCode",  placeholder="10001")
 *   "Country"         (name="country",     placeholder="United States")
 *
 * NOTE: There is NO "Full Name" field in the actual form.
 */
async function fillShippingForm(page: Page) {
  await page.getByLabel('Street Address').fill('123 Test Street');
  await page.getByLabel('City').fill('Dhaka');
  await page.getByLabel('Postal Code').fill('1200');
  await page.getByLabel('Country').fill('Bangladesh');
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe('Checkout', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearSessionAndCart(page);
  });

  // -------------------------------------------------------------------------
  // 1. Unauthenticated user is redirected to /login
  // -------------------------------------------------------------------------
  test('unauthenticated user visiting /checkout is redirected to /login', async ({ page }) => {
    // Make absolutely sure there's no session
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });

    await page.goto('/checkout');

    // CheckoutPage.jsx: useEffect → if (!user) navigate('/login')
    await expect(page).toHaveURL('/login', { timeout: 8_000 });

    // Confirm we're on the login page (LoginPage.jsx heading)
    await expect(
      page.getByRole('heading', { name: 'Welcome Back' })
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 2. Logged-in user with items in cart can access /checkout
  // -------------------------------------------------------------------------
  test('logged-in user with items in cart can access the checkout page', async ({ page }) => {
    await loginAndAddProductToCart(page);

    await page.goto('/checkout');

    // CheckoutPage.jsx: <h1>Checkout</h1>
    await expect(
      page.getByRole('heading', { name: 'Checkout' })
    ).toBeVisible({ timeout: 8_000 });

    // Should NOT be redirected away
    await expect(page).toHaveURL('/checkout');
  });

  // -------------------------------------------------------------------------
  // 3. Checkout form has all required fields visible
  // -------------------------------------------------------------------------
  test('checkout form renders all required shipping fields', async ({ page }) => {
    await loginAndAddProductToCart(page);
    await page.goto('/checkout');

    await expect(
      page.getByRole('heading', { name: 'Checkout' })
    ).toBeVisible({ timeout: 8_000 });

    // ---- Section headings ----
    // CheckoutPage.jsx: <h2>Shipping Address</h2>  and  <h2>Payment Method</h2>
    await expect(
      page.getByRole('heading', { name: 'Shipping Address' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Payment Method' })
    ).toBeVisible();

    // ---- Shipping fields (matched by exact <label> text from CheckoutPage.jsx) ----
    await expect(page.getByLabel('Street Address')).toBeVisible();
    await expect(page.getByLabel('City')).toBeVisible();
    await expect(page.getByLabel('Postal Code')).toBeVisible();
    await expect(page.getByLabel('Country')).toBeVisible();

    // ---- Payment radio buttons ----
    // CheckoutPage.jsx radio values: "Cash on Delivery" / "Online Payment"
    await expect(page.getByRole('radio', { name: 'Cash on Delivery' })).toBeVisible();
    await expect(page.getByRole('radio', { name: /Online Payment/i })).toBeVisible();

    // "Cash on Delivery" should be pre-selected (default state in CheckoutPage.jsx)
    await expect(page.getByRole('radio', { name: 'Cash on Delivery' })).toBeChecked();

    // ---- Place Order button ----
    // CheckoutPage.jsx:
    //   <button type="submit" form="checkout-form">Place Order</button>
    //   (lives in the Order Summary panel, linked to the form via the `form` attribute)
    await expect(
      page.getByRole('button', { name: 'Place Order' })
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 4. Filling the form and clicking "Place Order" submits successfully
  //    (API call is mocked so the test doesn't create real database records)
  // -------------------------------------------------------------------------
  test('filling the checkout form and clicking Place Order submits successfully', async ({ page }) => {
    await loginAndAddProductToCart(page);

    // ---- Mock the create-order API ----
    // client.js sends: POST http://localhost:5000/api/orders
    // We intercept it and return a 201 success response without hitting the DB.
    await page.route(`${ORDER_API_URL}`, async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_ORDER_RESPONSE),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/checkout');
    await expect(
      page.getByRole('heading', { name: 'Checkout' })
    ).toBeVisible({ timeout: 8_000 });

    // Fill in the shipping form
    await fillShippingForm(page);

    // Verify fields are filled before submitting
    await expect(page.getByLabel('Street Address')).toHaveValue('123 Test Street');
    await expect(page.getByLabel('City')).toHaveValue('Dhaka');
    await expect(page.getByLabel('Postal Code')).toHaveValue('1200');
    await expect(page.getByLabel('Country')).toHaveValue('Bangladesh');

    // Click "Place Order"
    // CheckoutPage.jsx: <button type="submit" form="checkout-form">Place Order</button>
    await page.getByRole('button', { name: 'Place Order' }).click();

    // While the mocked API request is in-flight, CheckoutPage shows a modal:
    // <h3>Placing Order</h3>  (processingPayment === true)
    // It may flash briefly — just wait for it to disappear (it goes away on success)
    // We don't strictly require it to be visible since the mock resolves instantly.

    // On success, CheckoutPage.jsx calls:
    //   showToast('Order placed successfully! 🎉')
    //   clearCart()
    //   navigate('/')
    // So we expect to end up back on the homepage.
    await expect(page).toHaveURL('/', { timeout: 10_000 });
  });

  // -------------------------------------------------------------------------
  // 5. Success message (toast) is shown after placing the order
  // -------------------------------------------------------------------------
  test('a success toast appears after placing the order', async ({ page }) => {
    await loginAndAddProductToCart(page);

    // Mock the order creation endpoint
    await page.route(`${ORDER_API_URL}`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_ORDER_RESPONSE),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/checkout');
    await expect(
      page.getByRole('heading', { name: 'Checkout' })
    ).toBeVisible({ timeout: 8_000 });

    await fillShippingForm(page);
    await page.getByRole('button', { name: 'Place Order' }).click();

    // CheckoutPage.jsx on success: showToast('Order placed successfully! 🎉')
    //
    // App.jsx renders the toast via <ToastNotification>:
    //   <div className="fixed top-6 right-6 z-[100] animate-slide-up">
    //     <div className="glass-strong px-6 py-3 rounded-xl ...">
    //       {toast}   ← "Order placed successfully! 🎉"
    //     </div>
    //   </div>
    //
    // The toast auto-dismisses after 3 seconds (StoreContext.showToast),
    // so we need to catch it quickly.
    const toast = page.getByText('Order placed successfully! 🎉');
    await expect(toast).toBeVisible({ timeout: 8_000 });
  });

  // -------------------------------------------------------------------------
  // 6. Cart is cleared after a successful order
  // -------------------------------------------------------------------------
  test('cart is cleared and the cart badge disappears after placing the order', async ({ page }) => {
    await loginAndAddProductToCart(page);

    // Confirm cart is not empty before checkout
    const cartBadge = page.locator('nav a[href="/cart"]:visible span').filter({ hasText: /^\d+$/ });
    await expect(cartBadge).toBeVisible({ timeout: 5_000 });

    // Mock the order API
    await page.route(`${ORDER_API_URL}`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_ORDER_RESPONSE),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/checkout');
    await expect(
      page.getByRole('heading', { name: 'Checkout' })
    ).toBeVisible({ timeout: 8_000 });

    await fillShippingForm(page);
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Wait for redirect back to homepage
    await expect(page).toHaveURL('/', { timeout: 10_000 });

    // CheckoutPage.jsx calls clearCart() on success.
    // StoreContext.clearCart() sets cartItems = [] and clears localStorage.
    // The Navbar badge only renders when cartCount > 0 — so it should be gone.
    await expect(cartBadge).not.toBeVisible({ timeout: 5_000 });

    // Double-check localStorage was actually cleared
    const cartItemsRaw = await page.evaluate(() => localStorage.getItem('cartItems'));
    const cartItems = JSON.parse(cartItemsRaw ?? '[]');
    expect(cartItems.length).toBe(0);
  });

  // -------------------------------------------------------------------------
  // Bonus 1: Empty-cart guard — redirected user sees the empty cart message
  // -------------------------------------------------------------------------
  test('navigating to /checkout with an empty cart shows the empty cart state', async ({ page }) => {
    // Log in but deliberately skip adding anything to the cart
    await injectAuthSession(page);

    // Ensure cart is empty
    await page.evaluate(() => localStorage.removeItem('cartItems'));
    await page.goto('/checkout');

    // CheckoutPage.jsx renders when !cartItems || cartItems.length === 0:
    // <h2>Your cart is empty</h2>
    // <button>Go back to shopping</button>
    await expect(
      page.getByRole('heading', { name: 'Your cart is empty' })
    ).toBeVisible({ timeout: 8_000 });

    await expect(
      page.getByRole('button', { name: 'Go back to shopping' })
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Bonus 2: Order Summary panel shows item details, shipping and tax lines
  // -------------------------------------------------------------------------
  test('Order Summary panel shows item line, shipping price and tax', async ({ page }) => {
    await loginAndAddProductToCart(page);
    await page.goto('/checkout');

    await expect(
      page.getByRole('heading', { name: 'Checkout' })
    ).toBeVisible({ timeout: 8_000 });

    // CheckoutPage.jsx: <h2>Order Summary</h2>
    await expect(
      page.getByRole('heading', { name: 'Order Summary' })
    ).toBeVisible();

    // Pricing breakdown lines
    // CheckoutPage.jsx: "Items Subtotal", "Shipping", "Tax (8%)", "Total"
    await expect(page.getByText('Items Subtotal')).toBeVisible();
    await expect(page.getByText('Shipping')).toBeVisible();
    await expect(page.getByText('Tax (8%)')).toBeVisible();

    // Total label
    await expect(page.getByText('Total')).toBeVisible();

    // Total value: <span className="text-2xl font-extrabold gradient-text">৳...</span>
    const totalEl = page.locator('span.font-extrabold.gradient-text');
    await expect(totalEl).toBeVisible();
    await expect(totalEl).toContainText('৳');
  });

  // -------------------------------------------------------------------------
  // Bonus 3: "Placing Order" processing overlay appears on submit
  //          (uses a slow mock so the overlay has time to render)
  // -------------------------------------------------------------------------
  test('"Placing Order" overlay is shown while the order is being processed', async ({ page }) => {
    await loginAndAddProductToCart(page);

    // Use a delayed mock — 1 second delay — so the overlay is visible long enough
    await page.route(`${ORDER_API_URL}`, async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise((resolve) => setTimeout(resolve, 1_000));
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_ORDER_RESPONSE),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/checkout');
    await expect(
      page.getByRole('heading', { name: 'Checkout' })
    ).toBeVisible({ timeout: 8_000 });

    await fillShippingForm(page);
    await page.getByRole('button', { name: 'Place Order' }).click();

    // CheckoutPage.jsx sets processingPayment = true → renders the overlay:
    // <h3>Placing Order</h3>
    // <p>The server is verifying prices, coupon eligibility, and stock.</p>
    await expect(
      page.getByRole('heading', { name: 'Placing Order' })
    ).toBeVisible({ timeout: 3_000 });

    await expect(
      page.getByText('The server is verifying prices, coupon eligibility, and stock.')
    ).toBeVisible();

    // Wait for the mock to resolve and the redirect to complete
    await expect(page).toHaveURL('/', { timeout: 10_000 });
  });
});
