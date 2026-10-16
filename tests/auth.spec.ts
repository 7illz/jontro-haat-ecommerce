import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const BASE_URL = 'http://localhost:5173';

/**
 * Credentials of a real test user that exists in your database.
 * ⚠️  Update "name" below to match the exact name stored for this account.
 */
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
  name: 'Test User', // ← Change this to the actual name returned by your API
};

// ---------------------------------------------------------------------------
// Reusable helper: log in via the real UI form
// ---------------------------------------------------------------------------
/**
 * Navigates to /login, fills in the email + password fields, and clicks
 * "Sign In". Waits until the browser has redirected away from /login before
 * returning, so the caller can immediately assert post-login state.
 *
 * Use this helper when the test itself is about the login form UX.
 */
async function loginViaUI(
  page: Page,
  email = TEST_USER.email,
  password = TEST_USER.password
) {
  await page.goto(`${BASE_URL}/login`);

  // Label text comes from LoginPage.jsx: "Email Address"
  await page.getByLabel('Email Address').fill(email);

  // Label text: "Password"
  await page.getByLabel('Password').fill(password);

  // Button text for login mode: "Sign In"
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait until we are no longer on /login
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 10_000,
  });
}

// ---------------------------------------------------------------------------
// Reusable helper: inject an authenticated session directly into localStorage
// ---------------------------------------------------------------------------
/**
 * Faster alternative to loginViaUI — calls the backend REST API to get a real
 * JWT, then writes it (and the user object) into localStorage exactly as
 * LoginPage.jsx does, then reloads the page so React picks up the new state.
 *
 * Use this helper when you need a logged-in context as a *precondition* and
 * don't want to test the login form itself.
 *
 * ⚠️  Update the endpoint below if your login route is different.
 */
async function loginViaAPI(
  page: Page,
  email = TEST_USER.email,
  password = TEST_USER.password
) {
  // Navigate to your app first so localStorage is scoped to localhost:5173
  await page.goto(BASE_URL);

  // Call the backend from inside the browser context
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
    { email, password }
  );

  // Mirror exactly what LoginPage.jsx writes to localStorage
  await page.evaluate((d: { token: string; _id: string; name: string; email: string; role?: string; isAdmin?: boolean }) => {
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
  }, data);

  // Reload so React re-reads localStorage and sets the user state
  await page.reload();
  await page.waitForLoadState('networkidle');
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
test.describe('Authentication', () => {

  // -------------------------------------------------------------------------
  // 1. Login page renders the right fields
  // -------------------------------------------------------------------------
  test('login page renders email field, password field, and Sign In button', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // LoginPage.jsx heading text for login mode: "Welcome Back"
    await expect(
      page.getByRole('heading', { name: 'Welcome Back' })
    ).toBeVisible();

    // Email field (matched by its <label> text)
    await expect(page.getByLabel('Email Address')).toBeVisible();

    // Password field
    await expect(page.getByLabel('Password')).toBeVisible();

    // Submit button for login mode
    await expect(
      page.getByRole('button', { name: 'Sign In' })
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 2. User can log in with valid credentials
  // -------------------------------------------------------------------------
  test('user can log in with valid credentials and is redirected to /', async ({ page }) => {
    await loginViaUI(page);

    // LoginPage.jsx: navigate('/') on success
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  // -------------------------------------------------------------------------
  // 3. Navbar shows user name + Logout button after login
  // -------------------------------------------------------------------------
  test('navbar shows the user name and Logout button after login', async ({ page }) => {
    await loginViaAPI(page);

    // Navbar.jsx (logged-in, desktop): <span>{user.name}</span>
    await expect(
      page.getByText(TEST_USER.name, { exact: false }).first()
    ).toBeVisible();

    // Logout button: <button title="Logout">Logout</button>
    await expect(
      page.getByRole('button', { name: 'Logout' })
    ).toBeVisible();

    // "Log In" link must NOT be visible when logged in
    // Navbar.jsx (logged-out): <Link to="/login">Log In</Link>
    await expect(
      page.getByRole('link', { name: 'Log In' })
    ).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 4. /profile redirects unauthenticated users to /login
  // -------------------------------------------------------------------------
  test('unauthenticated user visiting /profile is redirected to /login', async ({ page }) => {
    // Start with a clean, unauthenticated state
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });

    await page.goto(`${BASE_URL}/profile`);

    // ProfilePage.jsx: useEffect → if (!user) navigate('/login')
    await expect(page).toHaveURL(`${BASE_URL}/login`, { timeout: 8_000 });
    await expect(
      page.getByRole('heading', { name: 'Welcome Back' })
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 5. /checkout redirects unauthenticated users to /login
  // -------------------------------------------------------------------------
  test('unauthenticated user visiting /checkout is redirected to /login', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });

    await page.goto(`${BASE_URL}/checkout`);

    // CheckoutPage.jsx: useEffect → if (!user) navigate('/login')
    await expect(page).toHaveURL(`${BASE_URL}/login`, { timeout: 8_000 });
    await expect(
      page.getByRole('heading', { name: 'Welcome Back' })
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 6. Logout clears session and reverts navbar to "Log In" link
  // -------------------------------------------------------------------------
  test('logout clears the session and the navbar shows the Log In link', async ({ page }) => {
    await loginViaAPI(page);

    // Confirm logged-in state first
    await expect(
      page.getByText(TEST_USER.name, { exact: false }).first()
    ).toBeVisible();

    // Click the Logout button in the desktop navbar
    await page.getByRole('button', { name: 'Logout' }).click();

    // StoreContext.logout() removes token + user from localStorage and sets
    // user state to null → Navbar renders "Log In" link again
    await expect(
      page.getByRole('link', { name: 'Log In' })
    ).toBeVisible({ timeout: 5_000 });

    // Logout button should be gone
    await expect(
      page.getByRole('button', { name: 'Logout' })
    ).not.toBeVisible();

    // Verify localStorage was actually cleared
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const user  = await page.evaluate(() => localStorage.getItem('user'));
    expect(token).toBeNull();
    expect(user).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Bonus: Invalid credentials show a red error message
  // -------------------------------------------------------------------------
  test('login with wrong credentials shows an error and stays on /login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.getByLabel('Email Address').fill('nobody@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // We should still be on /login — no redirect
    await expect(page).toHaveURL(`${BASE_URL}/login`);

    // LoginPage.jsx renders the API error message inside a red-tinted div
    // when the `error` state is set
    const errorContainer = page.locator('div.text-red-400');
    await expect(errorContainer).toBeVisible({ timeout: 6_000 });
  });
});
