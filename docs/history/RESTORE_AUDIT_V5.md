# Restore Audit - V5

Source:

- Figma file key: `XVC7JVORbjMJjsh4vPvafC`
- Node id: `1:1847`
- Frame name: `我的_V5`
- Frame size: `375 x 1241`

Runtime page:

- `v5.html`
- Preview URL: `http://127.0.0.1:5173/v5.html`

Local node-level assets:

- `assets/v5-top-bg-1-1848@3x.png`
- `assets/v5-member-card-top-1-2035@3x.png`
- `assets/v5-promo-1-1879@3x.png`
- `assets/v5-mailbox-card-1-1869@3x.png`

Icon handling:

- Service icons, points-row icons, bottom tabbar icons, metric arrows, and round enter icons are inline SVG.
- Exported Figma SVGs were inspected and cleaned because they contained `#F5F5F5`, white page rectangles, and canvas background rectangles.
- Inline SVG roots/classes keep `fill: none` where the icon is stroke-only. Intentional filled paths keep explicit `fill`.
- `node scripts/audit-icons.mjs` covers `v3.html` and `v5.html`.

Geometry checks:

- Hero: `x=26 y=110 w=176 h=30`, font `22px`, weight `500`.
- Subtitle: `x=26 y=150 w=70 h=22`, font `14px`, weight `300`.
- Member card: `x=20 y=202 w=335 h=184`.
- Member top art: `x=20 y=202 w=335 h=96`.
- Service card: `x=20 y=462 w=335 h=80`.
- Promo: `x=20 y=572 w=335 h=95`.
- Points list: `x=20 y=731 w=335 h=234`.
- Mailbox card: `x=20 y=1025 w=335 h=98`.
- Tabbar: `x=0 y=1153 w=375 h=88`.

Verification:

- `node scripts/audit-icons.mjs`: passed.
- Browser check: no broken images.
- Browser check: service, row, and tab icon SVGs contain `0` background rects.
- Pixel QA at exact viewport `375 x 1241`: Figma screenshot and rendered frame both `375 x 1241`; mean RGB diff `4.38`; pixels with max-channel diff over `24`: `23662` (`5.08%`).

Notes:

- The remaining pixel diff is mostly browser text/icon antialiasing versus Figma raster output. Complex masked/raster regions use exact local node exports instead of hand-drawn CSS.
