# Community Activity Restore Audit

Source:

- Figma file key: `XVC7JVORbjMJjsh4vPvafC`
- Node id: `1:16071`
- Frame name: `社区活动1_已筛选`
- Frame size: `375 x 962`

Implementation:

- `community-activity.html` restores the frame as inspectable DOM, not as a full-page screenshot.
- Text, cards, filters, action buttons, and the Home Indicator preserve `data-figma-id` hooks.
- Status bar, mini-program capsule, back arrow, location icon, sport icon, dropdown arrows, and Home Indicator use inline SVG strings exported directly from the Figma nodes through `use_figma`.
- The full-frame screenshot export URL from `download_assets` is intentionally not used in the implementation.

Source note:

- Local asset download was attempted and blocked by the sandbox network approval path. The page does not depend on those short-lived image URLs: vector assets were re-exported from Figma as inline SVG, which avoids the previous blurry PNG/icon issue.

Verification:

- `node .\scripts\audit-community-activity.cjs`
- Browser render check through `http://127.0.0.1:5173/community-activity.html`: frame `375 x 962`, `imgCount = 0`, `svgCount = 20`, five cards at `x=20 y=168/308/448/588/728 w=335 h=130`, Home Indicator child at `x=121 y=949 w=134 h=5`.
- Existing regressions rechecked: `node .\scripts\audit-three-pages.cjs`, `node .\scripts\audit-icons.mjs`.

Audit coverage:

- Donor node id, frame size, and frame name.
- Required Chinese text content.
- Required inline SVG assets for all small vector/material nodes.
- No full-frame screenshot implementation.
- No full Home Indicator group image.
- Five card rows, five sport tags, and five location rows.
- Key Figma geometry: header top background, filter row, card positions, button bounds, text weights, icon sizes, and Home Indicator offset.
