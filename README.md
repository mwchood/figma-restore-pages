# Figma Restore Preview

Sources:

- Figma file key: `XVC7JVORbjMJjsh4vPvafC`
- V1 node id: `1:1004`, frame name: `我的_V1`, frame size: `375 x 1241`
- V3 node id: `1:1431`, frame name: `我的_V3`, frame size: `375 x 1241`
- V5 node id: `1:1847`, frame name: `我的_V5`, frame size: `375 x 1241`

- Service node id: `1:2078`, frame name: `服务_20251023`, frame size: `375 x 1317`

Implementation:

- `index.html` is the online entry page for all restored Figma pages.
- `sy-v1.html` restores V1 as inspectable DOM, not as a full-page screenshot.
- `v3.html` restores V3 with the same rules and local node-level exports for complex visual regions.
- `v5.html` restores V5 with local node-level exports for the top background, member card, promo banner, and mailbox card.
- `service.html` restores Service with local node-level exports for the hero banner and store card, plus cleaned inline SVG icons.
- `assets/fonts/NotoSansSC-*-full.ttf` provides the local open-source font substitute used by Service.
- `styles.css` maps the Figma frame dimensions, absolute positions, typography, gradients, and card styles.
- Restored elements preserve `data-figma-id` hooks so they can be traced back to Figma nodes.
- `server.mjs` is a tiny local preview server using only Node.js built-ins.
- `scripts/audit-icons.mjs` blocks restored V3/V5 service, row, and tab icons from regressing to exported `<img>` assets with hidden backgrounds.
- `scripts/audit-service-text.cjs` checks Service text nodes against Figma font size, weight, line-height, color, letter spacing, bounding boxes, real local font loading, and divider positions.
- `RESTORE_AUDIT_SERVICE.md` records the Service node restore and visual diff.

Preview:

```bash
node server.mjs
```

Then open:

```text
http://127.0.0.1:5173/figma-restore-pages.html
http://127.0.0.1:5173/
http://127.0.0.1:5173/sy-v1.html
http://127.0.0.1:5173/v3.html
http://127.0.0.1:5173/v5.html
http://127.0.0.1:5173/service.html
```

Unified page:

- `figma-restore-pages.html`: one navigation page for all restored Figma pages. The first-level menu is `figma还原页面`; second-level items use the restored page names and preview each page in the same shell.
- `scripts/audit-restore-hub.cjs`: checks the unified page includes all restored page links and labels.

GitHub Pages:

- Publish from the repository root on the default branch.
- Open the Pages root URL to view `index.html`, the grouped navigation entry.
- Temporary screenshots, local audit scripts, restoration notes, and local server files are excluded by `.gitignore`.

Important:

The Figma MCP asset URLs are real exported design assets, but they are short-lived. Important complex regions are downloaded into `assets/`. See `RESTORE_LESSONS.md` before restoring another frame.

Additional restored pages:

- `mall.html`: Figma node `1:411`, frame `商城_未筛选`, size `375 x 1235`.
- `activity-form.html`: Figma node `1:3882`, frame `活动页 4_信息填写 1_未填写`, size `375 x 907`.
- `scripts/audit-new-pages.cjs`: checks the two new pages for frame size, critical text styles/coordinates, font loading, image references, and accidental full-page screenshot/export usage.
- `RESTORE_AUDIT_MALL_FORM.md`: records the restore and verification notes for these two pages.
- `order-detail.html`: Figma node `1:7936`, frame `订单详情-实物_待收货`, size `375 x 856`.
- `scripts/audit-order-detail.cjs`: checks the order detail page for frame size, critical text styles/coordinates, product image bounds/blend, copy icon bounds, and Home Indicator structure.
- `RESTORE_AUDIT_ORDER_DETAIL.md`: records the restore and verification notes for the order detail page.

Asset note:

Mall and Activity form currently use short-lived Figma MCP asset URLs because the sandbox rejected a batch download into local `assets/`. They are real Figma assets and work for immediate review, but should be replaced with local files once asset download is explicitly allowed.
Order detail uses short-lived Figma MCP asset URLs for product and icon/material nodes; these should be localized into `assets/` when asset download is allowed.

Checkout page:

- `checkout.html`: Figma node `1:8900`, frame `订单结算`, size `375 x 984`.
- `scripts/audit-checkout.cjs`: checks checkout frame size, key text styles/coordinates, real Figma asset paths, inline SVG vector icons, and icon/background regressions.
- `RESTORE_AUDIT_CHECKOUT.md`: records the checkout restore and verification notes.

Three additional pages:

- `order-list.html`: Figma node `1:11537`, frame `小程序商城订单`, size `375 x 1292`.
- `order-pay-detail.html`: Figma node `1:11633`, frame `订单详情_待付款`, size `375 x 1278`.
- `product-detail.html`: Figma node `1:8446`, frame `商品详情`, size `375 x 1392`.
- `scripts/audit-three-pages.cjs`: checks the three pages for frame size, donor node ids, text, real Figma asset paths, inline SVG icons, and product/home-indicator regressions.
- `RESTORE_AUDIT_THREE_PAGES.md`: records the restore and verification notes.

Community activity page:

- `community-activity.html`: Figma node `1:16071`, frame `社区活动1_已筛选`, size `375 x 962`.
- `scripts/audit-community-activity.cjs`: checks donor node id, frame size, text, inline Figma SVG icons, card/filter geometry, icon sizes, and Home Indicator structure.
- `RESTORE_AUDIT_COMMUNITY.md`: records the restore and the current asset-localization limitation.

Typhur pages:

- `typhur-calendar.html`: Figma node `66:7779`, frame `Frame❤️`, size `393 x 852`.
- `typhur-wellness.html`: Figma node `66:8208`, frame `Frame❤️`, size `393 x 1102`.
- `typhur-ice-maker.html`: Figma node `66:9531`, frame `Frame`, size `393 x 852`.
- `scripts/audit-typhur-pages.cjs`: checks donor ids, frame sizes, localized real raster assets, inline SVG icons, and key geometry.
- `RESTORE_AUDIT_TYPHUR.md`: records the restore, verification, and font/food-icon limitations.
