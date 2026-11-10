// Renders each illustration SVG to a 1200x630 JPEG share card (social platforms do not accept SVG).
// Usage: node artifacts/signal24/scripts/rasterize-illustrations.cjs   (needs Playwright + Chromium)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '../public/illustrations');
const out = path.join(dir, 'og');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.svg'))) {
    const svg = fs.readFileSync(path.join(dir, file)).toString('base64');
    await page.setContent(`<html><body style="margin:0;background:#f3efe8"><img src="data:image/svg+xml;base64,${svg}" style="width:1200px;height:630px;object-fit:cover;display:block"></body></html>`);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(out, file.replace(/\.svg$/, '.jpg')), type: 'jpeg', quality: 86 });
  }
  await browser.close();
})();
