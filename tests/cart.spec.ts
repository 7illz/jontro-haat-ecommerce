import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
  name: 'Test User', // ← update to match the exact name in your DB
};

// ---------------------------------------------------------------------------
// Low-level helpers (shared with auth.spec.ts pattern)
// ---------------------------------------------------------------------------

/**
 * Calls the backend login endpoint from inside the browser, then writes the
 * JWT + user object to localStorage exactly as LoginPage.jsx does.
 * Reloads the page so React re-hydrates from the new localStorage state.
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
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Login API failed (${res.status}): ${text}`);
      }
      return res.json();
    },
    { email: TEST_USER.email, password: TEST_USER.password }
  );

  // Mirror LoginPage.jsx — writes both "token" and "user" keys
  await page.evaluate(
    (d: { token: string; _id: string; name: string; email: string; role?: string; isAdmin?: boolean }) => {
      localStorage.setItem('token', d.token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: d._id,
          name: d.name,
          email: d.email,
          role: d.role ?? (d.isAdmin ? 'owner' : 'user'),
        })
      );
    },
    data
  );

  await page.reload();
  await page.waitForLoadState('networkidle');
}

/**
 * Clears auth + cart from localStorage so each test starts with a clean slate.
 * StoreContext reads cartItems from localStorage on mount, so we clear it here.
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
 * Waits for the homepage product grid to finish loading (skeletons → real cards).
 * HomePage.jsx debounces the product fetch by 300 ms, so we wait for an h3.
 */
async function waitForProducts(page: Page) {
  await page.locator('h3.font-semibold').first().waitFor({ state: 'visible', timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// ✅ PRIMARY REUSABLE HELPER: loginAndAddProductToCart()
// ---------------------------------------------------------------------------

/**
 * The main helper requested for this test suite.
 *
 * Steps:
 *  1. Injects a real JWT session into localStorage (fast, no UI form).
 *  2. Navigates to the homepage and waits for product cards to load.
 *  3. Clicks the first product card to navigate to its ProductPage.
 *  4. Clicks the "Add to Cart" button (ProductPage.jsx:117).
 *  5. Returns the product name so callers can assert on it.
 *
 * Why ProductPage instead of HomePage's cart icon?
 *  - ProductPage has a labeled "Add to Cart" text button (easy to target).
 *  - HomePage's Add to Cart is an icon-only button (no text label, harder to
 *    distinguish from other icon buttons in a grid).
 */
async function loginAndAddProductToCart(page: Page): Promise<string> {
  // 1. Inject auth session
  await injectAuthSession(page);

  // 2. Go to homepage, wait for products
  await page.goto('/');
  await waitForProducts(page);

  // 3. Click the first product name link to open its ProductPage
  //    HomePage.jsx: <Link to={`/product/${product._id}`}><h3 ...>{product.name}</h3></Link>
  const firstProductName = await page.locator('h3.font-semibold').first().textContent();
  await page.locator('h3.font-semibold').first().click();

  // Confirm we're on the product detail page
  await expect(page).toHaveURL(/\/product\/[a-f0-9]{24}/, { timeout: 8_000 });

  // 4. Wait for the product to load, then click "Add to Cart"
  //    ProductPage.jsx: <button>Add to Cart</button>  (only shown when in stock)
  const addToCartBtn = page.getByRole('button', { name: 'Add to Cart' });
  await expect(addToCartBtn).toBeVisible({ timeout: 8_000 });
  await addToCartBtn.click();

  return firstProductName?.trim() ?? '';
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe('Shopping Cart', () => {

  // Run before every test: clear any leftover session/cart data
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearSessionAndCart(page);
  });

  // -------------------------------------------------------------------------
  // 1. Add a product to the cart
  // -------------------------------------------------------------------------
  test('user can add a product to the cart from the product page', async ({ page }) => {
    const productName = await loginAndAddProductToCart(page);

    // After clicking "Add to Cart", StoreContext.addToCart() adds it to the
    // cartItems array (stored in localStorage). The Navbar badge should now
    // be visible with count ≥ 1.
    //
    // Navbar.jsx: the badge span is only rendered when cartCount > 0.
    // It has class: "absolute -top-2 -right-2.5 ... rounded-full"
    const cartBadge = page.locator('nav a[href="/cart"]:visible span').filter({
      hasText: /^\d+$/,   // contains only digits
    });
    await expect(cartBadge).toBeVisible({ timeout: 5_000 });

    // Optionally confirm the name — the product should be in localStorage
    const cartItemsRaw = await page.evaluate(() => localStorage.getItem('cartItems'));
    const cartItems = JSON.parse(cartItemsRaw ?? '[]');
    const found = cartItems.some((item: { name: string }) =>
      item.name.toLowerCase().includes(productName.toLowerCase().slice(0, 10))
    );
    expect(found, `"${productName}" not found in localStorage cartItems`).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 2. Cart badge count in the Navbar increases after adding a product
  // -------------------------------------------------------------------------
  test('cart badge count in the Navbar increases after adding a product', async ({ page }) => {
    await injectAuthSession(page);
    await page.goto('/');
    await waitForProducts(page);

    // Navbar.jsx: badge only renders when cartCount > 0.
    // Confirm it is NOT visible before we add anything.
    const cartBadge = page.locator('nav a[href="/cart"]:visible span').filter({ hasText: /^\d+$/ });
    await expect(cartBadge).not.toBeVisible();

    // Open the first product page and add to cart
    await page.locator('h3.font-semibold').first().click();
    await expect(page).toHaveURL(/\/product\/[a-f0-9]{24}/, { timeout: 8_000 });

    const addToCartBtn = page.getByRole('button', { name: 'Add to Cart' });
    await expect(addToCartBtn).toBeVisible({ timeout: 8_000 });
    await addToCartBtn.click();

    // Badge should now be visible and show "1"
    // StoreContext: cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0)
    await expect(cartBadge).toBeVisible({ timeout: 5_000 });
    await expect(cartBadge).toHaveText('1');
  });

  // -------------------------------------------------------------------------
  // 3. /cart page shows the added product
  // -------------------------------------------------------------------------
  test('added product appears in the cart list on the /cart page', async ({ page }) => {
    const productName = await loginAndAddProductToCart(page);

    // Navigate to /cart
    await page.goto('/cart');

    // CartPage.jsx heading: <h1>Shopping Cart</h1>
    await expect(
      page.getByRole('heading', { name: 'Shopping Cart' })
    ).toBeVisible();

    // Each cart item renders the product name as a <Link>:
    // <Link to={`/product/${item._id}`} className="text-base font-bold ...">
    //   {item.name}
    // </Link>
    const itemLink = page.getByRole('link', { name: productName, exact: false });
    await expect(itemLink).toBeVisible({ timeout: 5_000 });
  });

  // -------------------------------------------------------------------------
  // 4. Increasing quantity updates the displayed quantity
  // -------------------------------------------------------------------------
  test('increasing the quantity in the cart updates the displayed value', async ({ page }) => {
    await loginAndAddProductToCart(page);
    await page.goto('/cart');

    // CartPage.jsx quantity control:
    // <select value={item.qty || 1} onChange={(e) => addToCart({...item, qty: Number(e.target.value)})}>
    //   {[...Array(item.countInStock).keys()].map(x => <option value={x+1}>{x+1}</option>)}
    // </select>
    //
    // The select sits inside a flex div: "flex items-center bg-white/5 rounded-xl border border-white/10 p-1"
    const qtySelect = page.locator('select').first();
    await expect(qtySelect).toBeVisible({ timeout: 5_000 });

    // Read available options — skip if only qty=1 available (countInStock === 1)
    const options = await qtySelect.locator('option').all();
    if (options.length < 2) {
      test.skip();
      return;
    }

    // Select qty = 2
    await qtySelect.selectOption('2');

    // The select's displayed value should now be "2"
    await expect(qtySelect).toHaveValue('2');

    // StoreContext recalculates cartCount = sum of all qtys.
    // The Navbar badge should now show "2".
    const cartBadge = page.locator('nav a[href="/cart"]:visible span').filter({ hasText: /^\d+$/ });
    await expect(cartBadge).toHaveText('2', { timeout: 5_000 });

    // The Order Summary subtotal text should reflect 2 items:
    // CartPage.jsx: <span>Subtotal ({cartItems.reduce(acc + qty, 0)} items)</span>
    await expect(page.getByText(/Subtotal \(2 items\)/)).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 5. Removing a cart item removes it from the list
  // -------------------------------------------------------------------------
  test('removing a cart item removes it from the cart list', async ({ page }) => {
    const productName = await loginAndAddProductToCart(page);
    await page.goto('/cart');

    // Confirm the item is present first
    await expect(
      page.getByRole('link', { name: productName, exact: false })
    ).toBeVisible({ timeout: 5_000 });

    // CartPage.jsx remove button:
    // <button onClick={() => removeFromCart(item._id)} title="Remove item">
    //   <Trash2 />
    // </button>
    const removeBtn = page.getByRole('button', { name: 'Remove item' });
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();

    // After removal, StoreContext.removeFromCart() filters out the item.
    // CartPage renders the empty-cart state when cartItems.length === 0:
    // <h2>Your cart is empty</h2>
    await expect(
      page.getByRole('heading', { name: 'Your cart is empty' })
    ).toBeVisible({ timeout: 5_000 });

    // The product name link should no longer be in the DOM
    await expect(
      page.getByRole('link', { name: productName, exact: false })
    ).not.toBeVisible();

    // Navbar badge should be gone (cartCount === 0)
    const cartBadge = page.locator('nav a[href="/cart"]:visible span').filter({ hasText: /^\d+$/ });
    await expect(cartBadge).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 6. Cart page shows the subtotal price
  // -------------------------------------------------------------------------
  test('cart page shows the correct subtotal price in the Order Summary', async ({ page }) => {
    await loginAndAddProductToCart(page);
    await page.goto('/cart');

    // CartPage.jsx Order Summary section:
    // <h2>Order Summary</h2>
    await expect(
      page.getByRole('heading', { name: 'Order Summary' })
    ).toBeVisible({ timeout: 5_000 });

    // Subtotal label: <span>Subtotal (N items)</span>
    // CartPage.jsx line 133: Subtotal ({cartItems.reduce((acc, item) => acc + (item.qty || 1), 0)} items)
    await expect(
      page.getByText(/Subtotal \(\d+ items?\)/)
    ).toBeVisible();

    // Subtotal value: <span className="font-medium text-gray-200">৳{subtotal}</span>
    const subtotalValue = page
      .locator('span.font-medium.text-gray-200')
      .filter({ hasText: '৳' });
    await expect(subtotalValue).toBeVisible();

    const subtotalText = await subtotalValue.textContent();
    // Must start with ৳ and have a valid number after
    expect(subtotalText?.trim()).toMatch(/^৳[\d,]+\.\d{2}$/);

    // Total line: <span className="text-3xl font-extrabold gradient-text">৳...</span>
    const totalValue = page.locator('span.font-extrabold.gradient-text');
    await expect(totalValue).toBeVisible();

    const totalText = await totalValue.textContent();
    expect(totalText?.trim()).toMatch(/^৳[\d,]+\.\d{2}$/);

    // The total should equal the subtotal (no discount applied in this test)
    expect(totalText).toBe(subtotalText);
  });

  // -------------------------------------------------------------------------
  // Bonus 1: Empty cart state renders correctly
  // -------------------------------------------------------------------------
  test('empty cart shows the "Your cart is empty" state', async ({ page }) => {
    // Log in but don't add anything to cart
    await injectAuthSession(page);
    await page.goto('/cart');

    // CartPage.jsx empty state:
    // <h2>Your cart is empty</h2>
    // <p>Looks like you haven't added any tech gear to your cart yet.</p>
    // <Link>Start Shopping</Link>
    await expect(
      page.getByRole('heading', { name: 'Your cart is empty' })
    ).toBeVisible({ timeout: 5_000 });

    await expect(
      page.getByText("Looks like you haven't added any tech gear to your cart yet.")
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: 'Start Shopping' })
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Bonus 2: "Proceed to Checkout" button navigates to /checkout when logged in
  // -------------------------------------------------------------------------
  test('"Proceed to Checkout" navigates to /checkout for a logged-in user', async ({ page }) => {
    await loginAndAddProductToCart(page);
    await page.goto('/cart');

    // CartPage.jsx: <button onClick={checkoutHandler}>Proceed to Checkout</button>
    // checkoutHandler: if (user) navigate('/checkout') else navigate('/login?redirect=checkout')
    const checkoutBtn = page.getByRole('button', { name: 'Proceed to Checkout' });
    await expect(checkoutBtn).toBeVisible({ timeout: 5_000 });
    await checkoutBtn.click();

    // Should land on /checkout (user is logged in)
    await expect(page).toHaveURL('/checkout', { timeout: 8_000 });
  });
});
