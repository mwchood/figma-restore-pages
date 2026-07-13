# Typhur Restore Audit

Sources:

- Figma file key: `XVC7JVORbjMJjsh4vPvafC`
- `typhur-calendar.html`: node `66:7779`, frame `Frame❤️`, size `393 x 852`
- `typhur-wellness.html`: node `66:8208`, frame `Frame❤️`, size `393 x 1102`
- `typhur-ice-maker.html`: node `66:9531`, frame `Frame`, size `393 x 852`

Implementation notes:

- No page uses a full-frame screenshot as implementation.
- Product/food raster regions use localized Figma assets:
  - `assets/typhur-food-raw-3.jpeg`
  - `assets/typhur-icemaker-66-9534@3x.png`
- Previously hand-drawn Typhur status/nav/tabbar controls have been replaced with localized Figma SVG node exports:
  - `assets/typhur-status-66-7781.svg`
  - `assets/typhur-calendar-header-66-8135.svg`
  - `assets/typhur-status-66-8209.svg`
  - `assets/typhur-wellness-nav-66-8564.svg`
  - `assets/typhur-stats-dots-66-8228.svg`
  - `assets/typhur-stats-center-66-8222.svg`
  - `assets/typhur-stats-arc-66-8223.svg`
  - `assets/typhur-stats-arc-66-8224.svg`
  - `assets/typhur-food-calories-66-8384.svg`
  - `assets/typhur-food-protein-66-8388.svg`
  - `assets/typhur-food-carbs-66-8391.svg`
  - `assets/typhur-food-fats-66-8394.svg`
  - `assets/typhur-add-meal-66-8559.svg`
  - `assets/typhur-tabbar-66-8131.svg`
  - `assets/typhur-status-66-9532.svg`
  - `assets/typhur-ice-nav-66-9551.svg`
- Ice-maker row icons remain inline SVG, but their path data is tied to localized Figma exports with `data-asset-source` markers:
  - `assets/typhur-clean-66-9538.svg`
  - `assets/typhur-calendar-icon-66-9550.svg`
  - `assets/typhur-arrow-66-9537.svg`
- `scripts/audit-typhur-pages.cjs` now checks that these local Figma SVG assets are referenced and blocks the old hand-drawn status/nav icon containers from returning.
- The AI Wellness calorie ring and food-card calorie/macro icons now use split child-node Figma SVG exports instead of CSS/hand-drawn approximations. The audit blocks `data-restoration="approximate"` from remaining on the Wellness page after those assets are available.
- The calorie ring SVG exports had Figma/page background rectangles stripped after localization; the audit now blocks those `#F5F5F5` / page-background fill rectangles from returning in the stats assets.
- The same exported-background rule now applies to the AI Wellness food calorie/macro icons, so gray icon backgrounds cannot return unnoticed.
- The food-card photo selector is scoped to `.food-card > img`; nested SVG icons are sized separately so they cannot be stretched to the photo size.
- The AI Wellness center text frame uses parent-relative coordinates from Figma: node `66:8225` page `x=90`, stats card `x=16`, CSS child `left=74px`. The audit now checks this offset and the `Calories Left` text size/line-height.
- The AI Wellness arc SVGs preserve their exported aspect ratios instead of being stretched to a square: gray track `66:8223` renders `176x161`, green arc `66:8224` renders `173x161`. The audit checks these dimensions so the arc end cap cannot overshoot because of vertical stretching.
- The calorie ring remains a high-risk composed widget: future delivery must include a cropped visual comparison against the Figma reference for scale, center, arc length, dot spacing, and text style. Asset-loading checks alone are not enough for this region.
- The Figma font stack references Helvetica Now, SF Pro, and OPlus Sans. This project does not include those licensed fonts, so these pages use the closest system/open-source-safe stack. Text size, weight, line-height, color, and coordinates are matched from Figma, but exact glyph metrics are not claimed as 1:1 without the real font files.

Verification:

- `node .\scripts\audit-typhur-pages.cjs`
- `node .\scripts\audit-restore-hub.cjs`

Known limitation:

- Full automated pixel-diff visual acceptance is not recorded here because the earlier headless browser path was unstable. The current guarantee is source/path/CSS audit plus local server MIME verification; final visual parity still benefits from in-app browser review.
