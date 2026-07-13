# Order Detail Restore Audit

Source:

- Figma file key: `XVC7JVORbjMJjsh4vPvafC`
- Node id: `1:7936`
- Frame name: `订单详情-实物_待收货`
- Frame size: `375 x 856`

Implementation:

- `order-detail.html` restores node `1:7936` as inspectable DOM, not as a full-page screenshot.
- The page preserves `data-figma-id` hooks on key text, cards, product image, controls, and status/home-indicator nodes.
- Layout uses Figma metadata bounds for the root frame, header, progress block, address block, product card, logistics row, order info rows, bottom button, and Home Indicator.
- Icon/material nodes use real Figma MCP asset URLs instead of hand-drawn CSS replacements: status bar indicators, mini-program capsule, progress icons, progress line, back arrow, logistics arrow, and copy icon.
- Progress icons, progress line, back arrow, logistics arrow, and copy icon use inline full-node Figma SVG paths, not inner painted-group assets, full-node PNG screenshots, or uninspected external SVG files. The audit blocks the earlier inner asset fragments because they lose the Figma node padding, blocks PNG screenshot exports because vector icons become blurry when scaled, and checks inline SVGs for visible full-size background rectangles.
- The real product image remains a Figma MCP raster asset at node `1:7962` with `mix-blend-mode: darken`, matching the Figma compositing intent over the `#f9f9f9` thumbnail background.

Verification:

```bash
node .\scripts\audit-order-detail.cjs
node .\scripts\audit-icons.mjs
node .\scripts\audit-new-pages.cjs
```

Latest result:

```text
Order detail audit passed.
Icon audit passed.
New page audit passed: mall, activity-form.
```

Delivery-gate notes:

- A full-frame Figma screenshot was fetched for visual comparison before implementation.
- The local/headless browser may fail to load remote Figma MCP assets. That limitation must be documented; it must not be solved by redrawing Figma icons in CSS.
- Product and icon fidelity is verified by node id, bounds, and real Figma MCP asset paths, but still needs final visual confirmation in the user's browser or local asset download.
- Icon fidelity is also checked for Figma outer bounds, inline SVG usage, absence of full-size SVG background rectangles, absence of hand-drawn pseudo-element overlays, and absence of stale transforms such as the earlier flipped back arrow.
- Do not claim full visual acceptance until the real Figma assets are visible in the preview or downloaded into `assets/`.
