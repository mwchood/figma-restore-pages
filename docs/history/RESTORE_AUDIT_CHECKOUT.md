# Checkout Restore Audit

Source:

- Figma file key: `XVC7JVORbjMJjsh4vPvafC`
- Node id: `1:8900`
- Frame name: `订单结算`
- Frame size: `375 x 984`

Implementation:

- `checkout.html` restores the frame as inspectable DOM with Figma node hooks.
- Vector icons are inline SVGs exported from exact Figma nodes: `1:8902`, `1:8979`, `1:8946`, `1:8977`, `1:8963`, `1:8969`.
- Product images, status icons, and the mini-program capsule use Figma MCP asset URLs from `get_design_context`.
- Bottom Home Indicator is rebuilt as geometry from node `1:8913`, not a screenshot or full-group export.

Verification:

- `scripts/audit-checkout.cjs` checks frame size, key text styles/positions, Figma asset paths, vector icon implementation, and common regressions such as CSS-drawn icons and stale transforms.

Known limitation:

- The Figma MCP asset URLs are real Figma exports but short-lived. Localizing them into `assets/` requires network download approval if the sandbox blocks direct download.
