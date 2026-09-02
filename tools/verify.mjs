import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const ROOT = 'C:/Users/dmitr/asgard-invest-work';
await fs.mkdir(`${ROOT}/verify`, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const report = [];

for (const v of ['v1', 'v2', 'v3']) {
  for (const [name, vp] of [
    ['desktop', { width: 1440, height: 900 }],
    ['mobile', { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 }],
  ]) {
    const page = await browser.newPage();
    const errs = [], failed = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
    page.on('requestfailed', r => failed.push(r.url().slice(0, 120)));
    await page.setViewport(vp);
    await page.goto(`file:///${ROOT}/${v}/index.html`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
    await page.evaluate(async () => {
      const H = document.body.scrollHeight, vh = window.innerHeight;
      for (let y = 0; y < H + vh; y += Math.round(vh * 0.6)) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 130));
      }
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 400));
    });
    await new Promise(r => setTimeout(r, 800));
    const m = await page.evaluate(() => ({
      hScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
      h: document.body.scrollHeight,
      fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family),
      hidden: [...document.querySelectorAll('.rv,.curtain,.mw,.line-word,.mask-w')].filter(e => !e.classList.contains('in')).length,
      overflowing: [...document.querySelectorAll('body *')]
        .filter(e => e.getBoundingClientRect().right > window.innerWidth + 2 && getComputedStyle(e).overflowX !== 'auto')
        .slice(0, 5).map(e => e.tagName + '.' + (e.className.toString().slice(0, 40))),
    }));
    await page.screenshot({ path: `${ROOT}/verify/${v}-${name}.png`, fullPage: name === 'desktop' });
    report.push({ v, name, ...m, errs: errs.slice(0, 4), failed: failed.slice(0, 4) });
    await page.close();
  }
}
await browser.close();
for (const r of report) {
  console.log(`\n== ${r.v} / ${r.name} ==`);
  console.log(`  scrollW ${r.sw} vs innerW ${r.iw} | hScroll: ${r.hScroll} | pageH: ${r.h}`);
  console.log(`  fonts loaded: ${[...new Set(r.fonts)].join(', ') || 'NONE'}`);
  if (r.hidden) console.log(`  NEREVELATE (inca opacity 0): ${r.hidden}`);
  if (r.overflowing.length) console.log(`  OVERFLOW: ${r.overflowing.join(' | ')}`);
  if (r.errs.length) console.log(`  ERRORS: ${r.errs.join(' | ')}`);
  if (r.failed.length) console.log(`  FAILED REQ: ${r.failed.join(' | ')}`);
}
