import { chromium } from 'playwright';

const CHROME = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

// ── Intro page ──────────────────────────────────────────────────────────────
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: 'screenshot-intro.png', fullPage: false });
console.log('Saved screenshot-intro.png');

// ── Oracle phase: fill question, submit, then wait for lines ───────────────
await page.fill('textarea', 'What should I focus on in the coming weeks?');
await page.click('button[type="submit"]');

// Wait for the oracle phase to render
await page.waitForSelector('text=The Oracle is Speaking', { timeout: 5000 });
await page.waitForTimeout(800);
await page.screenshot({ path: 'screenshot-oracle.png', fullPage: false });
console.log('Saved screenshot-oracle.png');

// Wait for all 6 lines to generate (~12 seconds max)
await page.waitForSelector('text=The Oracle Has Spoken', { timeout: 20000 });
await page.waitForTimeout(600);
await page.screenshot({ path: 'screenshot-result.png', fullPage: false });
console.log('Saved screenshot-result.png');

// Scroll down to see full result if needed
await page.evaluate(() => window.scrollTo(0, 500));
await page.waitForTimeout(400);
await page.screenshot({ path: 'screenshot-result-scrolled.png', fullPage: false });
console.log('Saved screenshot-result-scrolled.png');

await browser.close();
console.log('Done.');
