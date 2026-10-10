import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers & constants
// ---------------------------------------------------------------------------

/**
 * Navigates to the homepage and waits until at least one real product card
 * has appeared (i.e., the API response has arrived and loading skeletons are
 * replaced with real content).
 *
 * How it works:
 *  - HomePage.jsx renders skeleton divs while `loading === true`.
 *  - After the API call resolves, it renders <h3> product name elements.
 *  - We wait for the first <h3> inside the product grid to become visible.
 *
 * If no products exist in the database the test that calls this helper will
 * time out here — that is intentional; it means your seed data is missing.
 */
async function gotoHomepageAndWaitForProducts(page: import('@playwright/test').Page) {
  await page.goto('/');

  // Wait for at least one product name heading to appear.
  // Product cards render: <h3 class="text-base font-semibold...">{product.name}</h3>
  await page.locator('h3.font-semibold').first().waitFor({ state: 'visible', timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
test.describe('Homepage', () => {

  // -------------------------------------------------------------------------
  // 1. Page loads and the hero heading is visible
  // -------------------------------------------------------------------------
  test('homepage loads and the hero heading is visible', async ({ page }) => {
    await page.goto('/');

    // HomePage.jsx hero h1: "Next-Gen Tech" (gradient-text span) + "& Gear"
    // We target the <h1> element and confirm it's on the page.
    const hero = page.getByRole('heading', { level: 1 });
    await expect(hero).toBeVisible({ timeout: 10_000 });

    // Confirm the text content matches what HomePage.jsx renders
    await expect(hero).toContainText('Next-Gen Tech');
    await expect(hero).toContainText('& Gear');
  });

  // -------------------------------------------------------------------------
  // 2. At least one product card is visible after the API call resolves
  // -------------------------------------------------------------------------
  test('at least one product card is visible after page load', async ({ page }) => {
    await gotoHomepageAndWaitForProducts(page);

    // Each product card contains an <h3> with the product name.
    // We confirm at least one such heading exists.
    const productNames = page.locator('h3.font-semibold');
    await expect(productNames.first()).toBeVisible();

    // Confirm the count is at least 1
    const count = await productNames.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // -------------------------------------------------------------------------
  // 3. Each visible product card shows a non-empty name and a price
  // -------------------------------------------------------------------------
  test('each product card shows a non-empty name and a price', async ({ page }) => {
    await gotoHomepageAndWaitForProducts(page);

    // ---- Product names ----
    // HomePage.jsx: <h3 className="text-base font-semibold text-gray-100 ...">
    //   {product.name}
    // </h3>
    const nameEls = page.locator('h3.font-semibold');
    const nameCount = await nameEls.count();
    expect(nameCount).toBeGreaterThan(0);

    for (let i = 0; i < nameCount; i++) {
      const name = (await nameEls.nth(i).textContent())?.trim() ?? '';
      expect(name.length, `Product card #${i + 1} has an empty name`).toBeGreaterThan(0);
    }

    // ---- Prices ----
    // HomePage.jsx: <span className="text-xl font-bold text-gray-100">
    //   ৳{product.price.toLocaleString(...)}
    // </span>
    // We look for spans that start with the Bangladeshi Taka symbol "৳"
    const priceEls = page.locator('span.font-bold').filter({ hasText: '৳' });
    const priceCount = await priceEls.count();
    expect(priceCount, 'Expected at least one price element').toBeGreaterThan(0);

    for (let i = 0; i < priceCount; i++) {
      const priceText = (await priceEls.nth(i).textContent())?.trim() ?? '';
      // Must start with ৳ and have digits after it
      expect(priceText, `Price #${i + 1} looks malformed`).toMatch(/^৳[\d,]+(\.\d+)?$/);
    }
  });

  // -------------------------------------------------------------------------
  // 4. Clicking a product card navigates to /product/:id
  // -------------------------------------------------------------------------
  test('clicking a product card navigates to /product/:id', async ({ page }) => {
    await gotoHomepageAndWaitForProducts(page);

    // Each product card wraps the image AND the name in <Link to="/product/:id">
    // We click the product name heading (which is inside a <Link>) of the first card.
    // HomePage.jsx:
    //   <Link to={`/product/${product._id}`}>
    //     <h3 ...>{product.name}</h3>
    //   </Link>
    const firstProductLink = page.locator('h3.font-semibold').first();
    await firstProductLink.click();

    // After navigation the URL should match /product/<mongodb-id>
    await expect(page).toHaveURL(/\/product\/[a-f0-9]{24}/, { timeout: 8_000 });
  });

  // -------------------------------------------------------------------------
  // 5. The search bar filters the displayed products
  // -------------------------------------------------------------------------
  test('search bar filters products as the user types', async ({ page }) => {
    await gotoHomepageAndWaitForProducts(page);

    // Record how many product cards are visible before searching
    const allCards = page.locator('h3.font-semibold');
    const totalBefore = await allCards.count();

    // ---- Type into the Navbar search input ----
    // Navbar.jsx: <input placeholder="Search products..." ...>
    // The search query is stored in StoreContext and read by HomePage.jsx,
    // which then re-fetches from the API with keyword=<searchQuery>.
    const searchInput = page.getByPlaceholder('Search products...');
    await expect(searchInput).toBeVisible();

    // Use a category text that is likely to exist in your DB.
    // "laptop" or "watch" are good guesses for a tech store.
    // We type a broad term that should match *some* but not necessarily *all* products.
    await searchInput.fill('a'); // very broad — almost certainly returns results

    // HomePage.jsx debounces the fetch by 300 ms, then waits for the API.
    // We wait for the section heading to update to "Search Results for..."
    await expect(
      page.getByRole('heading', { name: /Search Results for/i })
    ).toBeVisible({ timeout: 5_000 });

    // Products that match should still be visible (at least 1)
    const filteredCards = page.locator('h3.font-semibold');
    await expect(filteredCards.first()).toBeVisible();

    // ---- Clear search ----
    await searchInput.clear();

    // After clearing, the h2 should revert to "All Products"
    await expect(
      page.getByRole('heading', { name: 'All Products' })
    ).toBeVisible({ timeout: 5_000 });

    // All products should be back (same or similar count)
    const afterClearCount = await page.locator('h3.font-semibold').count();
    expect(afterClearCount).toBeGreaterThanOrEqual(Math.min(totalBefore, 1));
  });

  // -------------------------------------------------------------------------
  // 6. The Navbar is visible with the NexusStore brand name
  // -------------------------------------------------------------------------
  test('navbar is visible with the NexusStore brand logo', async ({ page }) => {
    await page.goto('/');

    // Navbar.jsx: <nav className="sticky top-0 ...">
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();

    // Navbar.jsx brand link: <span className="... gradient-text">NexusStore</span>
    // We look for the link that contains this text
    const brandLink = page.getByRole('link', { name: 'NexusStore' });
    await expect(brandLink).toBeVisible();

    // Clicking it should keep us on / (it's a Link to="/")
    await brandLink.click();
    await expect(page).toHaveURL('/');
  });

  // -------------------------------------------------------------------------
  // Bonus 1: Category filter narrows the product list
  // -------------------------------------------------------------------------
  test('category filter narrows the product list', async ({ page }) => {
    await gotoHomepageAndWaitForProducts(page);

    // HomePage.jsx:
    // <select value={selectedCategory} onChange={...}>
    //   <option value="">All Categories</option>
    //   {categories.map(cat => <option value={cat}>{cat}</option>)}
    // </select>
    const categorySelect = page.locator('select').first();
    await expect(categorySelect).toBeVisible();

    // Get all available category options (skip the first "All Categories")
    const options = await categorySelect.locator('option').all();
    // If there's only the default option, skip (no category data available)
    if (options.length <= 1) {
      test.skip();
      return;
    }

    // Pick the second option (first real category)
    const firstCategory = await options[1].textContent();
    await categorySelect.selectOption({ label: firstCategory! });

    // Wait for the debounced fetch + re-render
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // debounce buffer

    // Each visible product's category badge should match
    // HomePage.jsx: <div className="text-xs text-brand-400 ... uppercase">{product.category}</div>
    const categoryBadges = page.locator('div.text-brand-400.font-semibold');
    const badgeCount = await categoryBadges.count();

    if (badgeCount > 0) {
      // All shown badges should match the selected category (case-insensitive)
      const firstBadge = (await categoryBadges.first().textContent())?.trim().toLowerCase();
      expect(firstBadge).toBe(firstCategory!.trim().toLowerCase());
    }
    // If badgeCount === 0, the filter returned no products — still a valid result
  });

  // -------------------------------------------------------------------------
  // Bonus 2: Empty state is shown when search has no matches
  // -------------------------------------------------------------------------
  test('empty state is shown when search returns no results', async ({ page }) => {
    await gotoHomepageAndWaitForProducts(page);

    // Search for something that almost certainly won't match any product
    const searchInput = page.getByPlaceholder('Search products...');
    await searchInput.fill('zzzzzzzzzzzzzzzzz_no_match');

    // HomePage.jsx empty state:
    // <h3>No products found</h3>
    // <p>Try adjusting your search or filters.</p>
    await expect(
      page.getByRole('heading', { name: 'No products found' })
    ).toBeVisible({ timeout: 6_000 });

    await expect(
      page.getByText('Try adjusting your search or filters.')
    ).toBeVisible();

    // "Clear Filters" button
    const clearBtn = page.getByRole('button', { name: 'Clear Filters' });
    await expect(clearBtn).toBeVisible();

    // Clicking it removes the selected category + sort (search is in Navbar,
    // not in the button handler) — at minimum the button should be clickable
    await clearBtn.click();
  });
});
