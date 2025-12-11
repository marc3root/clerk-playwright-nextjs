const { test } = require('@playwright/test');
const { setupClerkTestingToken } = require('@clerk/testing/playwright');

test('manual sign in test', async ({ page }) => {
  await setupClerkTestingToken({ page });
  
  await page.goto('http://10.1.0.142:3000/');
  console.log('Page loaded, URL:', page.url());
  
  await page.goto('http://10.1.0.142:3000/protected');
  console.log('After protected redirect, URL:', page.url());
  
  // Wait for sign-in form
  await page.waitForSelector('input[name=identifier]', { timeout: 10000 });
  console.log('Sign-in form loaded');
  
  // Fill in email
  await page.locator('input[name=identifier]').fill(process.env.E2E_CLERK_USER_USERNAME);
  console.log('Filled in email');
  
  // Click continue
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  console.log('Clicked first continue');
  
  // Wait for password field
  await page.waitForSelector('input[name=password]', { timeout: 10000 });
  console.log('Password field appeared');
  
  // Fill in password
  await page.locator('input[name=password]').fill(process.env.E2E_CLERK_USER_PASSWORD);
  console.log('Filled in password');
  
  // Click continue again
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  console.log('Clicked second continue');
  
  // Wait for redirect
  await page.waitForURL('**/protected', { timeout: 30000 });
  console.log('Redirected to protected page, URL:', page.url());
  
  // Check for protected page content
  await page.waitForSelector("h1:has-text('This is a PROTECTED page')", { timeout: 10000 });
  console.log('SUCCESS! Protected page loaded');
});
