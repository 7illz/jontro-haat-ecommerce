import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const REGULAR_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
};

const ADMIN_USER = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'AdminPass123!',
};

// ---------------------------------------------------------------------------
// Reusable helpers
// ---------------------------------------------------------------------------

/**
 * Injects a session into localStorage.
 * 
 * @param page The Playwright Page object.
 * @param credentials The user credentials to log in with.
 */
async function injectAuthSession(page: Page, credentials: { email: string, password: string }) {
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
    credentials
  );

  await page.evaluate(
    (d: { token: string; _id: string; name: string; email: string; role?: string; isAdmin?: boolean }) => {
      localStorage.setItem('token', d.token);
      localStorage.setItem('user', JSON.stringify({
        id: d._id, name: d.name, email: d.email,
        role: d.role ?? (d.isAdmin ? 'owner' : 'user'), // Ensure owner role is set correctly if backend relies on isAdmin
      }));
    },
    data
  );
  await page.reload();
  await page.waitForLoadState('networkidle');
}

/**
 * Clears all auth state from localStorage.
 */
async function clearSession(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cartItems');
  });
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe('Admin Panel', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearSession(page);
  });

  // -------------------------------------------------------------------------
  // 1. Regular user visiting /admin is redirected
  // -------------------------------------------------------------------------
  test('regular user is redirected away from /admin', async ({ page }) => {
    // Log in as a regular user
    await injectAuthSession(page, REGULAR_USER);
    
    // Attempt to access admin dashboard
    await page.goto('/admin');
    
    // AdminRoute.jsx redirects to '/' if user is not 'owner'
    // <Navigate to="/" replace />
    await expect(page).toHaveURL('/', { timeout: 8_000 });

    // Verify we see the storefront hero, not the admin dashboard
    await expect(page.getByRole('heading', { name: 'Next-Gen Tech' })).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 2. Admin user can log in and access /admin
  // -------------------------------------------------------------------------
  test('admin user can access the admin dashboard', async ({ page }) => {
    await injectAuthSession(page, ADMIN_USER);
    
    await page.goto('/admin');
    
    // Verify we are still on the admin route
    await expect(page).toHaveURL('/admin');

    // AdminDashboard.jsx header: "Admin Panel"
    await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 3. Admin dashboard home is visible with KPI stats/cards
  // -------------------------------------------------------------------------
  test('admin dashboard home shows KPI stats and overview', async ({ page }) => {
    await injectAuthSession(page, ADMIN_USER);
    await page.goto('/admin');

    // DashboardHome.jsx header
    await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();

    // The four main KPI cards (using exact text from DashboardHome.jsx)
    await expect(page.getByText('Total Revenue', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Orders', { exact: true })).toBeVisible();
    await expect(page.getByText('Pending Deliveries', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Products', { exact: true })).toBeVisible();

    // Chart / Table headers
    await expect(page.getByRole('heading', { name: 'Revenue Overview' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recent Orders' })).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 4. Admin can navigate to /admin/products and see a product list
  // -------------------------------------------------------------------------
  test('admin can navigate to products and see the product list', async ({ page }) => {
    await injectAuthSession(page, ADMIN_USER);
    
    // Start at dashboard home and navigate via sidebar
    await page.goto('/admin');
    
    // Click "Products" in the sidebar
    await page.getByRole('link', { name: 'Products' }).click();

    // Verify URL
    await expect(page).toHaveURL('/admin/products');

    // AdminProducts.jsx header
    await expect(page.getByRole('heading', { name: 'Manage Products' })).toBeVisible();

    // Check for product table columns
    await expect(page.getByRole('columnheader', { name: 'Product' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Price' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Stock Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();

    // Check for the product creation button
    await expect(page.getByRole('button', { name: 'Add Product' })).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 5. Admin can navigate to /admin/orders and see an order list
  // -------------------------------------------------------------------------
  test('admin can navigate to orders and see the order list', async ({ page }) => {
    await injectAuthSession(page, ADMIN_USER);
    
    // Start at dashboard home and navigate via sidebar
    await page.goto('/admin');
    
    // Click "Orders" in the sidebar
    await page.getByRole('link', { name: 'Orders' }).click();

    // Verify URL
    await expect(page).toHaveURL('/admin/orders');

    // AdminOrders.jsx header
    await expect(page.getByRole('heading', { name: 'Manage Orders' })).toBeVisible();

    // Check for order table columns
    await expect(page.getByRole('columnheader', { name: 'Order ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Customer' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Total' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Delivery' })).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 6. Admin panel does NOT show the Chatbot component
  // -------------------------------------------------------------------------
  test('chatbot component is not rendered for admin users', async ({ page }) => {
    // Chatbot.jsx logic: if (!user || user.role === 'owner') return null;
    
    await injectAuthSession(page, ADMIN_USER);
    await page.goto('/admin');

    // The chatbot renders a button with an SVG inside a `.fixed.bottom-6.right-6` div.
    // The easiest way to check is to look for the floating chat button.
    // We can use a generic Locator that targets the Chatbot's root or button.
    
    // The button has a child with class `glow-ring` and `bg-gradient-to-r`.
    // It also contains the MessageSquare icon.
    // We will ensure that no button containing the MessageSquare is floating.
    
    // Searching for the floating button wrapper
    const chatbotWrapper = page.locator('.fixed.bottom-6.right-6');
    await expect(chatbotWrapper).not.toBeVisible();
  });
});
