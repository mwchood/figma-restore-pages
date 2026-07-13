# Restore Audit - 我的_V3

Source:

- Figma file key: `XVC7JVORbjMJjsh4vPvafC`
- Figma node id: `1:1431`
- Frame size: `375 x 1241`

## Lessons Applied

- No full-page screenshot is used as implementation.
- Complex masked/raster regions are local node-level Figma exports:
  - `1:1432` top background -> `assets/v3-top-bg-1-1432@3x.png`
  - `1:1619` top card_v3 -> `assets/v3-member-card-top-1-1619@3x.png`
  - `1:1463` promo banner -> `assets/v3-promo-1-1463@3x.png`
  - `1:1453` mailbox card -> `assets/v3-mailbox-card-1-1453@3x.png`
- Service, points-row, and tabbar icons use inline Figma vector paths, with wrapper/background rectangles removed and SVG default fill reset to `none`.
- Text, rows, buttons, and navigation are DOM elements with `data-figma-id` hooks.

## Important Coordinates

| Node | Purpose | Figma x/y/w/h | Implementation |
| --- | --- | --- | --- |
| `1:1431` | root frame | `0/0/375/1241` | `.figma-frame.v3-frame` |
| `1:1432` | top background | `0/0/375/447` | local image |
| `1:1599` | `Hi，Shokz会员` | `26/110/176/30` | DOM text |
| `1:1619` | V3 member card top | `20/202/335/96` | local image |
| `1:1629` | `V3 悦享家` | `42/222/84/26` | DOM text, `#613a18`, semibold |
| `1:1633` | progress text | `42/258/107/18` | DOM text |
| `1:1637` | progress bar | `20/298/335/6` | DOM bar |
| `1:1563` | service card | `20/462/335/80` | DOM card |
| `1:1463` | promo card | `20/572/335/95` | local image |
| `1:1453` | mailbox card | `20/1025/335/98` | local image + DOM copy/button |
| `1:1496` | tabbar | `0/1153/375/88` | DOM nav |

## Residual Risk

- Some small status/tab/row assets still reference temporary Figma MCP URLs. The main complex areas are local and stable.
- `node scripts/audit-icons.mjs` now guards the repeated icon failure mode by rejecting row/tab icons restored as `<img>`, icon SVGs containing likely exported background rectangles, or icon classes missing `fill: none`.
- Windows fallback fonts can still differ from PingFang SC if the font is not installed.
