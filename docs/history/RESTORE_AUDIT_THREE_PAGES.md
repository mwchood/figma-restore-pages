# Three Page Restore Audit

Sources:

- `order-list.html`: Figma node `1:11537`, frame `小程序商城订单`, size `375 x 1292`.
- `order-pay-detail.html`: Figma node `1:11633`, frame `订单详情_待付款`, size `375 x 1278`.
- `product-detail.html`: Figma node `1:8446`, frame `商品详情`, size `375 x 1392`.

Implementation notes:

- Text and layout are restored as inspectable DOM with Figma node hooks.
- Pure vector icons are inline SVGs exported from Figma nodes, not CSS drawings or screenshot images.
- Product images and the product detail long image use real Figma MCP asset URLs from `get_design_context`.
- Home indicators are rendered as geometry at the vector child bounds, not as full-width exported group images.

Verification:

- `scripts/audit-three-pages.cjs` checks frame dimensions, donor node ids, critical text, real Figma asset URLs, inline SVG icon usage, product image blend handling, and bottom/home-indicator regressions.
- Follow-up fix: the audit now also blocks the specific regressions found in browser review: broad `.pay-state-card > p` selectors that overlap address text, Home Indicator bars placed at the wrong footer offset, and product detail color thumbnails stacking vertically because of global `img { display: block }`.

Known limitation:

- The Figma MCP asset URLs are real Figma exports but short-lived. They should be localized into `assets/` when network download is explicitly allowed.
