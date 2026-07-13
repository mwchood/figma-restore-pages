# Service Restore Audit

Source:

- Figma file key: `XVC7JVORbjMJjsh4vPvafC`
- Node id: `1:2078`
- Frame name: `服务_20251023`
- Frame size: `375 x 1317`
- Preview: `http://127.0.0.1:5173/service.html`

Implementation:

- `service.html` restores the page as inspectable DOM with `data-figma-id` hooks.
- The page uses local open-source `Noto Sans SC Restore` font files as a no-copyright-risk substitute for unavailable `PingFang SC`.
- Complex bounded raster regions are local Figma exports:
  - `assets/service-banner-1-2117@3x.png` for node `1:2117`, rendered at `375 x 200`.
  - `assets/service-store-card-1-2202@3x.png` for node `1:2202`, rendered at `335 x 188`.
- Pure vector regions are inline SVG, not exported `<img>` files:
  - product registration icon `1:2083`
  - after-service icon `1:2101`
  - Care+ icon `1:2274`
  - list row arrows `1:2228`, `1:2232`, `1:2240`, `1:2236`, `1:2244`, `1:2248`
  - floating support icon `1:2254`
  - tabbar icons `1:2169`, `1:2142`, `1:2193`, `1:2164`, `1:2154`

Geometry checks:

- Rendered `.service-frame`: `375 x 1317`
- `.service-tabbar` relative y: `1229`, matching Figma node `1:2132`
- Floating support relative y: `1157`
- More-list rows render at relative y positions `907`, `961`, `1015`, `1069`, `1123`, `1177`
- More-list divider lines render at Figma y positions `945`, `999`, `1053`, `1107`, `1161`; the earlier row `border-bottom` implementation placed them `16px` too low.
- Broken images: `0`

Icon checks:

- `node scripts/audit-icons.mjs`: passed
- Service tile, row, support, and tabbar icons use inline SVG.
- Icon SVGs have no exported white or `#F5F5F5` background rectangles.
- Icon classes set `fill: none` to prevent browser default black fills.
- Care+ icon now preserves the complete cleaned Figma `Group 1008` path data instead of a simplified path subset.

Text checks:

- `node scripts/audit-service-text.cjs`: passed
- Covered `28` visible Service text nodes.
- Checked against Figma design context for font size, weight, line-height, color, letter spacing, text bounding boxes, local font loading, and more-list divider positions.
- Font loading check covers `Noto Sans SC Restore` weights `300`, `400`, `500`, `600`.
- Fixed text-node ownership for `购买记录`, `查看更多门店`, and `品牌形象店` so `data-figma-id` now points to the actual text node instead of only the outer frame/button.
- Fixed bottom tab label width to match Figma text boxes and adjusted the active `服务` tab text x-position.

Visual diff:

- Ground truth: `_figma_tmp/service-ground-truth-1-2078.png`
- Rendered frame: `_figma_tmp/service-rendered-frame-375.png`
- Dimensions: both `375 x 1317`
- Mean absolute channel diff: `2.7103`
- Max channel diff: `255`
- Pixels with any channel diff `> 20`: `15,184`
- Percent pixels `> 20`: `3.0745%`

Notes:

- The remaining residual is spread across text, vector antialiasing, thin borders, and small status/navigation shapes. No large bounded raster asset is visibly shifted.
- The visual diff increased slightly after switching from Windows fallback/PingFang assumptions to the open-source Noto Sans SC substitute; this is expected because the glyph metrics are close but not identical to PingFang.
- The service-specific tabbar position is declared after the shared `.tabbar` rule as `.figma-frame.service-frame .service-tabbar { top: 1229px; }` so the shared V1/V3/V5 tabbar top cannot override it again.
