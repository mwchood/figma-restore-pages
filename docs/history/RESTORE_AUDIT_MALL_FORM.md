# Mall And Activity Form Restore Audit

Sources:

- Mall node id: `1:411`, frame name: `商城_未筛选`, frame size: `375 x 1235`
- Activity form node id: `1:3882`, frame name: `活动页 4_信息填写 1_未填写`, frame size: `375 x 907`
- Figma file key: `XVC7JVORbjMJjsh4vPvafC`

Implementation:

- `mall.html` restores node `1:411`.
- `activity-form.html` restores node `1:3882`.
- Both pages preserve `data-figma-id` hooks on key text, image, control, and frame nodes.
- Complex visual regions use Figma MCP assets only when the region is inseparable. Product tiles are restored as layered DOM: gray tile rectangles, structural product groups, then the real product child images at Figma child bounds.
- Mall product images now keep parent structure wrappers `1:517`, `1:521`, `1:529`, and `1:533`, but render child images `1:519`, `1:523`, `1:531`, and `1:535` at their exact Figma bounds. Parent groups are not allowed to become full-size `<img>` elements, and product images use multiply blending so source-image white backgrounds do not appear as square blocks over the gray tile.
- Activity form background now uses the `bg_top / 1:3883` parent export instead of `image 531 / 1:3886`, with no extra CSS opacity.
- Mall tabbar icons are inline SVG nodes; `.mall-tabbar a img` is forbidden by audit.
- Mall Home Indicator renders only vector child `1:442`; the full `Group 6 / 1:440` image is forbidden because it creates an extra full-width visual block.
- The full-page Figma screenshot/export URLs are blocked by `scripts/audit-new-pages.cjs`.

Verification:

```bash
node .\scripts\audit-new-pages.cjs
```

Latest result:

```text
New page audit passed: mall, activity-form.
```

In-app browser verification also confirmed:

- `mall.html`: frame `375 x 1235`, 25 images loaded, 0 failed images, 0 zero-size Figma nodes.
- `activity-form.html`: frame `375 x 907`, 16 images loaded, 0 failed images, 0 zero-size Figma nodes.
- `Noto Sans SC Restore` weights `300`, `400`, `500`, and `600` are available after explicit `document.fonts.load(...)`.
- `scripts/audit-new-pages.cjs` also blocks the regressions found during review: product parent groups used as full-size images, product child images with wrong Figma bounds or missing blend mode, `<img>` tabbar icons, full-width Home Indicator group images, and child-only Activity background assets.

Known limitation:

- The current implementation uses short-lived Figma MCP asset URLs because the sandbox rejected a batch download into local `assets/`.
- These URLs are real Figma assets and work for immediate review, but should be replaced with local files once asset download is explicitly allowed.

Delivery lesson:

- The Mall product issue showed that structure checks alone are not enough: product image ids and bounds can match while the final visual still exposes a white source-image square.
- Future delivery must include a full-frame visual comparison against the Figma screenshot before claiming the page is restored.
- If headless/local verification cannot load Figma MCP images, the result must be described as structurally verified but not visually accepted. Do not rely on "should look correct" wording.
