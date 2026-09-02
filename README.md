# Asgard Invest — 3 concepte de landing page

Machete de prezentare pentru **Asgard Invest** (tencuială mecanizată, Republica Moldova).
Trei direcții vizuale cu **același conținut, aceeași structură și aceleași funcționalități** —
scopul este ca clientul să aleagă una singură, care apoi se implementează în React + admin.

## Live

| Variantă | Direcție | Link |
|---|---|---|
| — | Pagina de alegere | https://ghenov54.github.io/asgard-invest-concepte/ |
| V1 | **Șantier Galben** — crem + galben de siguranță, editorial, tipografie masivă | [/v1/](https://ghenov54.github.io/asgard-invest-concepte/v1/) |
| V2 | **Industrial Neon** — dark + lime acid, HUD tehnic, tipografie lată | [/v2/](https://ghenov54.github.io/asgard-invest-concepte/v2/) |
| V3 | **Arhitectural** — dark/light alternat + nisip, minimal premium | [/v3/](https://ghenov54.github.io/asgard-invest-concepte/v3/) |

## Structura paginii (identică în toate trei)

1. Navigare + CTA „Cere ofertă”
2. Hero cu mesaj principal și cifre-cheie (5 echipe · 25 muncitori · 300 m²/zi · MD+UE)
3. Bandă animată cu tipuri de lucrări
4. Despre companie
5. Servicii — 6 poziții
6. De ce noi — 8 avantaje
7. Proces — 6 pași
8. **Comparator „înainte / după”** (perete brut vs. tencuit mecanizat), tras cu mouse-ul
9. Cifre cu contoare animate
10. **Calculator de termen**: m² + număr de echipe → zile de lucru
11. Acoperire: Moldova + țări europene
12. Întrebări frecvente
13. Formular de ofertă + date de contact
14. Footer

## Note tehnice

- **Fonturi self-hosted** (`assets/fonts/*.woff2`, subseturi `latin` + `latin-ext` pentru diacritice).
  Fără `fonts.googleapis.com` — CDN-ul Google e blocat/lent în Moldova și blochează randarea.
- **Zero resurse externe.** Toate vizualurile sunt SVG generat (texturi `feTurbulence`, schițe
  arhitecturale), iconițele sunt SVG desenate special pentru domeniu — nu emoji, nu librării externe.
- Animații: reveal la scroll (IntersectionObserver), contoare, parallax, marquee, comparator,
  cursor personalizat (V3), efecte magnetice și spotlight (V2).
- `prefers-reduced-motion` respectat în toate variantele.
- Responsive verificat la 1440 / 1280 / 1024 / 768 / 390 px, fără scroll orizontal.

## Ce se schimbă după alegerea variantei

- Fotografii reale de pe șantiere (înlocuiesc texturile generate).
- Date de contact reale (acum: `+373 60 000 000` / `contact@asgardinvest.md` — de test).
- Rescriere în **React 18 + Vite + Tailwind**, cu panou `/admin` pentru texte, imagini și contacte.
- SEO (meta, JSON-LD `LocalBusiness`, sitemap, Search Console) + Google Business Profile.
- Deploy pe Cloudflare Pages + domeniu `.md`.

## Unelte (`tools/`)

```bash
node tools/fetch-fonts.mjs   # descarcă woff2-urile de la Google și generează assets/fonts.css
npm i puppeteer
node tools/verify.mjs        # verificare în browser real: erori, fonturi, overflow, screenshot-uri
node tools/textfit.mjs       # verifică titlurile la toate breakpoint-urile
node tools/shots.mjs         # screenshot-uri pe secțiuni
npm uninstall puppeteer
```
