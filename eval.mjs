import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const DIR = './screenshots';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // === DESKTOP (1440x900) ===
  await page.setViewportSize({ width: 1440, height: 900 });
  
  // Home page
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${DIR}/UX-01-desktop-home.png`, fullPage: true });

  // Add dish page
  await page.goto(`${BASE}/add`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${DIR}/UX-02-desktop-add-dish.png`, fullPage: true });

  // Meal plan page
  await page.goto(`${BASE}/meal-plan`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/UX-03-desktop-meal-plan.png`, fullPage: true });

  // === TABLET (768x1024) ===
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${DIR}/UX-04-tablet-home.png`, fullPage: true });

  await page.goto(`${BASE}/meal-plan`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/UX-05-tablet-meal-plan.png`, fullPage: true });

  // === MOBILE (375x667) ===
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${DIR}/UX-06-mobile-home.png`, fullPage: true });

  await page.goto(`${BASE}/add`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${DIR}/UX-07-mobile-add-dish.png`, fullPage: true });

  // === DARK MODE ===
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  // Toggle dark mode
  const themeBtn = page.locator('button[aria-label="Toggle theme"]');
  if (await themeBtn.count() > 0) {
    await themeBtn.click();
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: `${DIR}/UX-08-desktop-dark-home.png`, fullPage: true });

  await page.goto(`${BASE}/meal-plan`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/UX-09-desktop-dark-meal-plan.png`, fullPage: true });

  // === DESIGN TOKEN EXTRACTION ===
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const tokens = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    const vars = {};
    const varNames = ['--color-primary', '--color-accent', '--color-bg', '--color-bg-dark', '--color-text', '--color-text-dark', '--color-surface', '--color-surface-dark', '--color-muted', '--color-muted-dark', '--color-border', '--color-border-dark', '--color-danger'];
    for (const v of varNames) {
      vars[v] = styles.getPropertyValue(v).trim();
    }
    return vars;
  });
  console.log('DESIGN_TOKENS:', JSON.stringify(tokens));

  // === TYPOGRAPHY EXTRACTION ===
  const typography = await page.evaluate(() => {
    const els = document.querySelectorAll('h1, h2, h3, p, span, a, button, label');
    const seen = new Set();
    return Array.from(els).map(el => {
      const s = getComputedStyle(el);
      const key = `${s.fontFamily}|${s.fontSize}|${s.fontWeight}`;
      if (seen.has(key)) return null;
      seen.add(key);
      return {
        tag: el.tagName,
        text: el.textContent.substring(0, 40).trim(),
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
        color: s.color,
        backgroundColor: s.backgroundColor
      };
    }).filter(Boolean);
  });
  console.log('TYPOGRAPHY:', JSON.stringify(typography));

  // === WCAG CONTRAST AUDIT ===
  const contrastData = await page.evaluate(() => {
    function hexToRgb(hex) {
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
    }
    function parseColor(str) {
      if (str.startsWith('#')) return hexToRgb(str);
      const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return m ? [+m[1], +m[2], +m[3]] : null;
    }
    function luminance(r, g, b) {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }
    function contrastRatio(c1, c2) {
      const l1 = luminance(...c1);
      const l2 = luminance(...c2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    const results = [];
    document.querySelectorAll('h1, h2, h3, p, span, a, button, label, li').forEach(el => {
      const s = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const fg = parseColor(s.color);
      const bg = parseColor(s.backgroundColor);
      if (!fg || !bg) return;
      const ratio = contrastRatio(fg, bg);
      const fontSize = parseFloat(s.fontSize);
      const isLarge = fontSize >= 24 || (fontSize >= 18.66 && parseFloat(s.fontWeight) >= 700);
      const required = isLarge ? 3 : 4.5;
      results.push({
        tag: el.tagName,
        text: el.textContent.substring(0, 50).trim(),
        fg: s.color,
        bg: s.backgroundColor,
        fontSize,
        ratio: Math.round(ratio * 100) / 100,
        required,
        pass: ratio >= required
      });
    });
    return results;
  });
  console.log('CONTRAST_AUDIT:', JSON.stringify(contrastData));

  // === PERFORMANCE ===
  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const imgs = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src.substring(0, 80),
      naturalW: img.naturalWidth,
      naturalH: img.naturalHeight,
      loading: img.loading
    }));
    return {
      loadTime: Math.round(nav.loadEventEnd - nav.startTime),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
      imageCount: imgs.length,
      images: imgs
    };
  });
  console.log('PERFORMANCE:', JSON.stringify(perf));

  await browser.close();
  console.log('DONE');
})();
