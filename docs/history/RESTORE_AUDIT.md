# Restore Audit - 我的_V1

Source:

- Figma file key: `XVC7JVORbjMJjsh4vPvafC`
- Figma node id: `1:1004`
- Frame size: `375 x 1241`

## Fixed In This Pass

- `1:1201` / `1:1205` arrows: replaced outer-frame SVG exports with the original Figma asset URLs from design context:
  - `967aa5f1-ff94-4c70-9338-0e091839a3e7`
  - `fd405859-0466-4a81-89ab-c3d0b43e1927`
  This removes the white background caused by exporting the frame wrapper.
- Service icons: replaced outer `26 x 26` frame exports with transparent inner vector nodes:
  - `1:1154` order
  - `1:1162` product
  - `1:1141` activity
  - `1:1166` coupon
- Service icons follow-up: the Figma SVG exports for `1:1154`, `1:1162`, `1:1141`, and `1:1166` still contained exported page/background `<rect>` layers. The implementation now uses the real Figma vector paths inline and has no background rects.
- Mailbox card `1:1026`: replaced the hand-composed/rotated texture layer with a local high-resolution Figma node export at `assets/mailbox-card-1-1026@3x.png` (`1005 x 294`, displayed at `335 x 98`). The obsolete `.mailbox-texture` layer is removed from the DOM and CSS.
- Member card top visual: uses a local Figma `scale=3` PNG export for `1:1175 top card_v1` at `assets/member-card-top-1-1175@3x.png` (`1005 x 288`, displayed at `335 x 96`). Removed obsolete hidden texture/shine layers from the DOM/CSS so the top card is driven by the real Figma composite asset only.
- Member card bottom background: corrected to start at Figma `y=298` relative to page, with the progress bar layered above it.

## Text Audit

Figma text styles from design context are mapped as:

- `PingFang_SC:Medium` -> `font-weight: 500`
- `PingFang_SC:Regular` -> `font-weight: 400`
- `PingFang_SC:Light` -> `font-weight: 300`
- `PingFang_SC:Semibold` -> `font-weight: 600`
- `Poppins:Medium` -> `font-weight: 500`

Important text nodes currently aligned by Figma coordinate:

| Node | Text | Figma x/y/w/h | Implementation status |
| --- | --- | --- | --- |
| `1:1172` | `Hi，Shokz会员` | `26/110/176/30` | x/y/size/weight mapped |
| `1:1173` | `一起开放听` | `26/150/70/22` | x/y/size/weight mapped |
| `1:1189` | `V1` | `42/222/22/26` | x/y/size/weight mapped |
| `1:1188` | `新生代` | `68/222/54/26` | x/y/size/weight mapped |
| `1:1191` | `升级进度：138/800` | `42/258/107/18` | x/y/size/weight mapped |
| `1:1194` | `会员章程` | `277/225/48/18` | x/y/size/weight mapped |
| `1:1208` | `可用积分` | `42/322/48/20` | x/y/size/weight mapped |
| `1:1198` | `300` | `42/346/38/22` | x/y/size/weight mapped |
| `1:1200` | `去查看` | `121/347/36/20` | x/y/size/weight mapped |
| `1:1209` | `我的权益` | `209/322/48/20` | x/y/size/weight mapped |
| `1:1207` | `3` | `209/346/12/22` | x/y/size/weight mapped |
| `1:1210` | `项` | `225/349/10/18` | x/y/size/weight mapped |
| `1:1204` | `去使用` | `289/347/36/20` | x/y/size/weight mapped |
| `1:1035` | `我的服务` | `20/416/72/26` | x/y/size/weight mapped |
| `1:1137` - `1:1152` | service labels | y `511`, 12px Light | x/y/size/weight mapped |
| `1:1042` | `积分互动` | `20/698/72/26` | x/y/size/weight mapped |
| `1:1044` - `1:1053` | points rows | row text coordinates mapped by row layout |
| `1:1068` | `韶音信箱` | `20/979/72/26` | x/y/size/weight mapped |
| `1:1031` - `1:1034` | mailbox card text/button | x/y/size/weight mapped |
| `1:1071` - `1:1075` | tab labels | y `1189`, 10px Regular | x/y/size/weight mapped |

Residual risk:

- On Windows, `PingFang SC` may not be installed. CSS asks for it first, but browser fallback can still make weight and glyph shape differ from Figma.
- The page is still manually mapped DOM/CSS, not generated from a normalized full Figma JSON tree. It covers the visible nodes but not every Figma layer.

## Asset Audit

Use exported/real Figma assets:

- Top background `1:1005`: Figma SVG export.
- Member card top `1:1175`: local Figma high-resolution node render at `assets/member-card-top-1-1175@3x.png`, used only as the complex background layer.
- Promo image `1:1040`: Figma image asset.
- Points icons: Figma SVG exports.
- Service icons: transparent inner vector exports.
- Service icons: inline Figma vector paths from `1:1154`, `1:1162`, `1:1141`, and `1:1166`; exported wrapper backgrounds were stripped.
- Tab icons: Figma SVG exports.
- Mailbox card: local high-resolution Figma node export for `1:1026`, preserving its mask/texture/ellipse composition.
- Status bar / mini-program control: Figma assets from design context.

Avoided after this pass:

- No CSS-drawn arrow for `去查看` / `去使用`.
- No outer-frame service icon exports that introduce white background.
- No hand-drawn member-card top gradient.
- No hand-composed mailbox texture layer.

## Remaining Differences To Inspect Visually

- Member card top background is now a Figma high-resolution local render, but it should still be compared visually against the Figma screenshot because the background contains masks, raster texture, and gradients.
- Top background `1:1005` is a large SVG export. If it appears clipped in `file://` preview, inspect whether browser cache is serving the previous CSS or asset URL.
- Some Figma mask/composite layers are represented as local region exports rather than fully inspectable SVG groups.
- The current page uses temporary Figma MCP asset URLs. For stable previews, these should be downloaded into local assets and referenced by file path.
