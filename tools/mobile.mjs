import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const ROOT = 'C:/Users/dmitr/asgard-invest-work';
await fs.mkdir(`${ROOT}/verify/mob`, { recursive: true });

const WIDTHS = [360, 390, 430];
const SECTIONS = {
  v1: [['hero', '.hero-card'], ['despre', '.about'], ['servicii', '.srv'], ['why', '.why'],
       ['proces', '.steps'], ['ba', '.ba-wrap'], ['cifre', '.nums'], ['calc', '.calc'],
       ['geo', '.geo'], ['faq', '.faq'], ['cta', '.cta'], ['footer', 'footer .f-grid']],
  v2: [['hero', '.hero-grid'], ['stats', '.hero-stats'], ['despre', '.about'], ['ops', '.ops'],
       ['adv', '.adv'], ['track', '.track'], ['ba', '.ba-wrap'], ['calc', '.calc'],
       ['geo', '.geo'], ['faq', '.faq'], ['cta', '.cta'], ['form', '.form-sec'], ['footer', 'footer .f-grid']],
  v3: [['hero', '.hero'], ['despre', '.about'], ['strip', '.strip-out'], ['adv', '.adv'],
       ['proces', '.proc'], ['ba', '.ba-wrap'], ['quote', '.quote'], ['calc', '.calc'],
       ['geo', '.geo'], ['faq', '.faq'], ['cont', '.cont'], ['footer', 'footer .f-grid']],
};

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const problems = [];

for (const v of ['v1', 'v2', 'v3']) {
  for (const w of WIDTHS) {
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.setViewport({ width: w, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto(`file:///${ROOT}/${v}/index.html`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
    await page.evaluate(async () => {
      const H = document.body.scrollHeight, vh = window.innerHeight;
      for (let y = 0; y < H + vh; y += Math.round(vh * 0.45)) {
        window.scrollTo(0, y); await new Promise(r => setTimeout(r, 200));
      }
      window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 500));
    });

    const m = await page.evaluate(() => {
      const vw = window.innerWidth;
      const out = { hScroll: document.documentElement.scrollWidth > vw + 1, sw: document.documentElement.scrollWidth, vw };
      // elemente care ies din ecran (ignoram containerele cu scroll propriu si copiii lor)
      const scrollable = new Set();
      document.querySelectorAll('*').forEach(e => {
        const s = getComputedStyle(e);
        if (s.overflowX === 'auto' || s.overflowX === 'scroll' || s.overflowX === 'hidden') scrollable.add(e);
      });
      const inScroller = e => { let p = e.parentElement; while (p) { if (scrollable.has(p)) return true; p = p.parentElement; } return false; };
      out.overflow = [...document.querySelectorAll('body *')]
        .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > vw + 2 || r.left < -2) && !inScroller(e) && !scrollable.has(e); })
        .slice(0, 6).map(e => e.tagName + '.' + String(e.className).slice(0, 34) + ' [' + Math.round(e.getBoundingClientRect().left) + '..' + Math.round(e.getBoundingClientRect().right) + ']');
      // text prea mic
      out.tinyText = [...document.querySelectorAll('p,li,span,b,a,label,input,button,td')]
        .filter(e => e.offsetParent !== null && (e.textContent || '').trim().length > 12 && parseFloat(getComputedStyle(e).fontSize) < 12)
        .slice(0, 6).map(e => getComputedStyle(e).fontSize + ' ' + e.tagName + '.' + String(e.className).slice(0, 24));
      // tinte de atingere mici
      out.smallTap = [...document.querySelectorAll('a,button,input,select,[role="button"]')]
        .filter(e => { const r = e.getBoundingClientRect(); return e.offsetParent !== null && r.width > 0 && (r.height < 40 || r.width < 40); })
        .slice(0, 8).map(e => { const r = e.getBoundingClientRect(); return e.tagName + '.' + String(e.className).slice(0, 22) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height); });
      // titluri care depasesc
      out.textOverflow = [...document.querySelectorAll('h1,h2,h3,b,.calc-val,.big')]
        .filter(e => e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 2)
        .slice(0, 6).map(e => e.tagName + '"' + (e.textContent || '').trim().slice(0, 26) + '" ' + e.scrollWidth + '>' + e.clientWidth);
      out.hidden = [...document.querySelectorAll('.rv,.curtain,.mw,.line-word,.mask-w')].filter(e => !e.classList.contains('in')).length;
      return out;
    });
    if (w === 390) {
      await page.screenshot({ path: `${ROOT}/verify/mob/${v}-full.png`, fullPage: true });
      for (const [n, sel] of SECTIONS[v]) {
        const el = await page.$(sel);
        if (el) { try { await el.screenshot({ path: `${ROOT}/verify/mob/${v}-${n}.png` }); } catch {} }
      }
      // meniu mobil deschis
      await page.evaluate(() => { window.scrollTo(0, 0); document.getElementById('burger').click(); });
      await new Promise(r => setTimeout(r, 600));
      await page.screenshot({ path: `${ROOT}/verify/mob/${v}-menu.png` });
    }
    problems.push({ v, w, errs, ...m });
    await page.close();
  }
}
await browser.close();

for (const r of problems) {
  const flags = [];
  if (r.hScroll) flags.push(`H-SCROLL ${r.sw}>${r.vw}`);
  if (r.overflow.length) flags.push('OVERFLOW: ' + r.overflow.join(' | '));
  if (r.tinyText.length) flags.push('TEXT MIC: ' + r.tinyText.join(' | '));
  if (r.smallTap.length) flags.push('TAP MIC: ' + r.smallTap.join(' | '));
  if (r.textOverflow.length) flags.push('TITLU IESE: ' + r.textOverflow.join(' | '));
  if (r.hidden) flags.push('NEREVELATE: ' + r.hidden);
  if (r.errs.length) flags.push('ERORI: ' + r.errs.slice(0, 3).join(' | '));
  console.log(`\n== ${r.v} @ ${r.w}px ==`);
  console.log(flags.length ? flags.map(f => '  ' + f).join('\n') : '  OK');
}
