# Figma Restore Lessons

These are the rules learned while restoring the first screen. Use them before starting the next frame.

## No Silent Downgrade Rule

- Never silently downgrade fidelity, source authenticity, typography accuracy, visual validation confidence, layout certainty, or asset provenance. This applies beyond the known headless-browser and missing-asset cases: missing fonts, incomplete Figma node data, failed SVG/raster/background export, failed asset download, unavailable browser automation, unsupported masks/blends/blur/material effects, uncertain icon level, uncertain image bounds, or any substituted layout/size/weight/color/effect must be disclosed before delivery.
- If a required source, tool, permission, or validation path is unavailable, stop and report: what is missing, why it matters visually, what mistakes may remain, which options are available, and what permission/file/font/asset the user can provide. Do not hide the limitation behind a CSS approximation, guessed icon, guessed font, guessed gradient, or "script passed" wording.
- Any user-approved fallback must be labeled in the page audit and final handoff as an approximation, including the exact node/region affected and the follow-up needed to make it source-real. A temporary fallback must never be presented as verified Figma fidelity.

## Asset Rules

- Do not export an outer frame for small icons. Figma often includes page/background rectangles in the SVG. Inspect the SVG and strip wrapper `<rect>` layers, or inline only the real vector paths.
- This applies to every pure vector icon, not only service icons: service grid, points rows, tabbar, arrows, badges, and small controls. `get_design_context` image constants are reference hints, not validated production assets.
- Complex masked/raster compositions should be exported as local node-level assets, not hand-drawn in CSS. Examples: member card backgrounds, mailbox texture cards, promo banners, and top background effects.
- Never use a full-page screenshot as the implementation. Local exports are allowed only for bounded art regions that are not practical to rebuild as DOM.
- Download important MCP asset URLs into `assets/`; MCP URLs are temporary.
- If local asset download is blocked, keep using the real MCP asset URL only as a temporary review source, document the limitation, and do not claim the asset has been localized.
- For product tiles, do not assume the parent `png_product` group should become a full-size `<img>`. First preserve the Figma layer split: tile background rectangle, structural product group, then the real product image child at its exact child bounds. A parent export is only correct when the whole region is an inseparable masked/composited visual.
- For product images, never stretch every asset to the tile size. Audit `left/top/width/height` against the child image nodes (`1:519`, `1:523`, `1:531`, `1:535` on Mall). Stretching a small child to `161x161` hides the gray tile background and makes the image blurry.
- Some real product source images contain a white studio background even when the Figma full-frame visual shows no visible square. After placing the real child image, compare the full-frame screenshot: if the white square is not visible in Figma, the image must blend into the gray tile (`mix-blend-mode: multiply`) or be replaced by an exported transparent/localized asset.
- Do not render iOS Home Indicator groups as full-width images. If Figma has a group such as `Group 6 / 1:440`, restore the white bottom area from the tabbar background and render only the black vector child (`1:442`) at its exact bounds.
- Figma icon/material nodes must keep a real material path. Do not replace status icons, mini-program controls, progress icons, copy icons, arrows, tab icons, or similar Figma assets with hand-drawn CSS just because the headless browser cannot load remote MCP URLs. Use the Figma SVG/vector/path data or the Figma MCP asset URL, and prefer localizing that real export into `assets/` when downloads are allowed.
- For icons, the real path must come from the correct Figma node level. Do not use an inner painted group asset when the visible design node is a 20x20/18x18 frame; the inner asset loses padding and becomes visually oversized when fitted into the outer node. Export/use the full Figma node (`1:7994`, `1:8000`, `1:7990`, `1:7953`, etc.) and audit both outer bounds and forbidden inner asset fragments.
- Full-node PNG screenshots are still wrong for vector icons because they can blur under browser/device scaling. For vector/material icons, use full-node SVG exports or inline SVG paths. Audit should block PNG screenshot exports for these nodes.
- If a full-node SVG export shows a pale background, do not keep it as an opaque external file. Export/read the real SVG paths, inline them, and remove any full-viewBox background/helper rects. The audit must check inline SVGs for visible full-size background rectangles.
- Do not treat "inline SVG" as proof of authenticity. Inline SVG is only acceptable when its path data is copied from a Figma export or it is explicitly marked as an approved approximation. If an SVG was drawn by hand because the child node was not found, add `data-restoration="approximate"` and document the missing Figma node before delivery.
- For page-level Figma SVG slices such as status bars, navigation bars, and tabbars, local SVG exports are acceptable when they are bounded nodes rather than full-page screenshots. The audit must reference the exact local file and block old hand-drawn replacement containers from returning.
- A localized SVG file is not enough; the local server must serve it as `image/svg+xml`. If SVG `<img>` elements do not render while files exist, check response headers before redrawing or replacing the asset.
- When exact child-node assets become available, remove old `data-restoration="approximate"` markers and update the audit to fail if the approximate region remains. A stale "known limitation" can hide that the page is still using yesterday's fallback logic.
- Background-rect audits must apply to every icon-sized SVG in the restored page, not only to the asset that failed last time. If one food/tab/service/status icon has a wrapper `<rect fill="#F5F5F5">` or page-background `<rect fill="#F2F2F7">`, the whole icon group should be considered at risk and audited together.
- When replacing one asset level with another, remove old corrective transforms. A transform added to make an inner asset face the right direction can flip the real full-node asset, as happened with the order-detail back arrow.

## Layout Rules

- Figma node bounds are the source of truth. Use Figma x/y/w/h first, then style.
- Keep `data-figma-id` on restored elements so browser comments can be traced back to the original node.
- Put text node ids on the actual text element, not on a parent badge/card/background. If a Figma text layer sits inside a colored frame, restore the frame and the text as separate DOM nodes.
- When a browser screenshot or DOM bbox disagrees with Figma, trust Figma metadata and inspect the layer tree.

## Visual Rules

- Fonts map as: `PingFang_SC:Light` -> `300`, `Regular` -> `400`, `Medium` -> `500`, `Semibold` -> `600`, `Poppins:Medium` -> `500`.
- CSS font parameters are not enough. Before restoring a page, inventory all Figma font families/weights and either load licensed project fonts or explicitly choose an open-source substitute. Add a browser `document.fonts.check(...)` audit so the page cannot silently fall back to Windows fonts.
- When using an open-source substitute for an unavailable commercial/system font, keep size/weight/line-height/color exact, but allow small text-width differences caused by different glyph metrics. Do not claim 1:1 font fidelity without the real font file.
- If a background has masks, light streaks, texture, or ellipse glow, export the exact local node instead of approximating gradients.
- Do not keep hidden experimental layers in DOM/CSS; they are easy to re-enable and cause repeated drift.
- Verify icons for accidental white/gray backgrounds by checking whether the final SVG contains background rectangles.
- When inlining SVG icons, set the SVG class/root to `fill: none`. Browser SVG default fill is black, so stroke-only paths become black blobs unless the default fill is explicitly cleared.
- For boolean/fill icons, do not simplify the path data by hand. Strip only the exported page/background layers and preserve the complete Figma icon group paths. Simplifying these paths changes perceived stroke weight.
- Some Figma SVG exports use CSS-variable paint values such as `var(--fill-0, #333333)`. If those render as broken external `<img>` assets, inline the SVG and replace the paint with the explicit fallback color from Figma.
- Add a project audit whenever this class of mistake happens. For this project, `node scripts/audit-icons.mjs` blocks row/tab/service icons from regressing back to `<img>` or background-filled SVGs.
- Page-specific audits must encode the actual mistake that occurred. For Mall, `scripts/audit-new-pages.cjs` now blocks product parent groups rendered as full-size images, verifies product child image bounds and blend mode, blocks full-width Home Indicator group images, and forbids any `<img>` icons inside `.mall-tabbar a`; for Activity form it blocks using `image 531 / 1:3886` instead of `bg_top / 1:3883`.
- Restore separator lines from explicit Figma line nodes, not from container `border-bottom` unless the line is actually at the row bottom. In the Service page the text rows are spaced every `54px`, but the divider line is at `textTop + 38px`; using `article height: 54px; border-bottom` put the line `16px` too low.
- Do not use broad structural selectors such as `.card > p` when a card has multiple text roles. The Order Pay Detail address overlapped the countdown because `.pay-state-card > p` matched both the countdown and `.pay-address`; selectors must target semantic classes or exclude other roles.
- Global reset rules can break Figma row layout. This project has `.figma-frame img { display: block; }`, so any horizontal inline image row must explicitly set `display: inline-block`, flex, or absolute positions and be audited in rendered layout.
- Broad descendant selectors can corrupt nested real assets. In Typhur Wellness, `.food-card img` applied the food-photo `118x118` absolute positioning to calorie/macro SVG icons. Scope large raster rules to direct children such as `.food-card > img`, then add explicit rules for nested icons.
- Complex composed widgets such as circular charts, progress rings, nutrition charts, gauges, and multi-layer badges must not pass review only because each child image loads. They require a local crop comparison against the Figma reference for center, scale, arc length, dot radius, text size/weight, and layer alignment. If that crop comparison is unavailable, report the widget as visually unverified.
- Figma SVG exports can be tight-cropped to the painted bbox instead of the visible Figma node frame. Do not stretch a tight-cropped arc/path SVG into the node's square frame; preserve the SVG's own viewBox/natural aspect ratio unless you have a full-frame export with the original padding. In Typhur Wellness, `66:8223`/`66:8224` are `176x161` and `173x161`; forcing them to `176x176` made the green arc visually overshoot the gray track.
- For children inside an absolute card/frame, convert Figma page coordinates to parent-relative coordinates before writing CSS. In Typhur Wellness the text frame `66:8225` is at page `x=90`, but the stats card starts at `x=16`, so the CSS child offset is `left: 74px`, not `90px`. Add audits for any corrected parent-relative offset.
- Home Indicator coordinates must be checked relative to the actual Figma footer/group node, not copied from a different page. `1:11711` is `79px` below `1:11707`; `1:8533` is `89px` below `1:8504`. Reusing a `top: 21px` rule put the black bar through the button row.

## Workflow

- Read `get_metadata` for node bounds.
- Read `get_design_context` for fonts, fills, and original image assets.
- Download local exports for complex bounded regions.
- Implement inspectable DOM for text, controls, list rows, and navigation.
- Run targeted browser checks: local asset load, exact image dimensions, real font loading, no unwanted `<rect>` layers in icons, key element positions, explicit separator positions, and no `<img>` for pure vector icon regions.

## Delivery Gate

Before saying a restored page is done, do not stop at "the node id and coordinates match." Run this self-check and report any item that cannot be verified.

- Hard stop on visual validation: if headless screenshot, browser automation, or in-app visual inspection cannot be completed, do not claim the page is visually restored. Tell the user the consequence clearly: obvious issues such as overlap, wrong row direction, misplaced Home Indicator, blurry assets, or wrong spacing may remain. Then ask for the needed path: permission to control Chrome/Edge, permission to repair/install browser automation such as Playwright, or explicit user acceptance of manual review via browser comments.
- Hard stop on real assets: if a Figma material/icon/background/product asset cannot be obtained from metadata, `get_design_context`, `use_figma` SVG export, or MCP asset download, do not silently replace it with CSS drawing or an approximation. State the missing node/asset, explain the risk, and offer choices: keep trying Figma export, allow asset download/localization, have the user provide the asset, or explicitly approve a marked temporary approximation.
- Any fallback must be explicit and labeled. If the user approves CSS/approximate artwork, mark it in the page audit as non-source-real and add a follow-up item. Never let a temporary approximation look like a verified real Figma asset.
- Compare the restored full page against the Figma full-frame screenshot, not only against individual node metadata. Node-correct output can still be visually wrong after asset compositing.
- For any composed chart or icon cluster rebuilt from multiple Figma children, compare a cropped browser screenshot to the cropped Figma reference before delivery. DOM asset-loading checks are not enough for these regions.
- Inspect each high-risk visual region manually: product images, card textures, gradients, masked photos, banners, tabbar icons, badges, arrows, and home indicators.
- For every raster/product area, verify three things together: Figma layer structure, CSS bounds, and final blended appearance. Watch for white squares, missing gray backgrounds, clipped gradients, stretched/blurry images, and unexpected wrapper backgrounds.
- Treat "script passed" as necessary but not sufficient. If a user-visible mistake happens, encode that exact class of mistake into a project audit before the next delivery.
- Add geometry checks for the things users can spot instantly: no overlapping text blocks in the same card, horizontal image rows stay horizontal despite global CSS, footer buttons do not intersect the Home Indicator, and Home Indicator bars sit in the bottom safe area at the Figma child-node offset.
- If the local/headless browser cannot load remote Figma MCP assets, do not claim full visual acceptance. Say clearly that structure and CSS were verified, but visual asset fidelity still needs browser/Figma confirmation or local asset download.
- A remote asset loading failure is not permission to redraw the asset. Keep the true Figma asset path, add an audit for that path/node id, and document the loading limitation separately.
- When converting a hand-drawn temporary icon back to a real Figma asset, remove or override all old `::before`/`::after` CSS. Real asset images must not have hand-drawn pseudo-element overlays.
- Preserve evidence for the handoff: name the Figma node ids checked, the audit commands run, and any unverified visual risks.
