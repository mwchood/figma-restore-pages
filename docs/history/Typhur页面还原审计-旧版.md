# Typhur 页面还原审计

## 来源

- Figma file key：`XVC7JVORbjMJjsh4vPvafC`
- `typhur-calendar.html`
  - 节点：`66:7779`
  - frame：`Frame`
  - 尺寸：`393 x 852`
- `typhur-wellness.html`
  - 节点：`66:8208`
  - frame：`Frame`
  - 尺寸：`393 x 1102`
- `typhur-ice-maker.html`
  - 节点：`66:9531`
  - frame：`Frame`
  - 尺寸：`393 x 852`

## 实现说明

- 没有使用整页截图作为实现。
- 产品图和食物图使用本地化 Figma 素材：
  - `assets/typhur-food-raw-3.jpeg`
  - `assets/typhur-icemaker-66-9534@3x.png`
- 原本手绘的 Typhur 状态栏、导航、tabbar 等控件，已替换为本地化 Figma SVG 节点导出：
  - `assets/typhur-status-66-7781.svg`
  - `assets/typhur-calendar-header-66-8135.svg`
  - `assets/typhur-status-66-8209.svg`
  - `assets/typhur-wellness-nav-66-8564.svg`
  - `assets/typhur-add-meal-66-8559.svg`
  - `assets/typhur-tabbar-66-8131.svg`
  - `assets/typhur-status-66-9532.svg`
  - `assets/typhur-ice-nav-66-9551.svg`

## AI Wellness 页面重点修复

统计卡片和食物卡片已从近似绘制改为真实 Figma 子节点素材：

- `assets/typhur-stats-dots-66-8228.svg`
- `assets/typhur-stats-center-66-8222.svg`
- `assets/typhur-stats-arc-66-8223.svg`
- `assets/typhur-stats-arc-66-8224.svg`
- `assets/typhur-food-calories-66-8384.svg`
- `assets/typhur-food-protein-66-8388.svg`
- `assets/typhur-food-carbs-66-8391.svg`
- `assets/typhur-food-fats-66-8394.svg`

已处理的问题：

- SVG 文件存在但页面不显示：
  - 原因是旧本地服务把 `.svg` 返回成了错误 MIME。
  - 现在服务端已按 `image/svg+xml` 返回。
- 统计环区域出现浅灰方块：
  - 原因是 Figma SVG 导出文件里带了包装背景矩形和页面背景矩形。
  - 已剥离 `#F5F5F5` 和页面背景相关矩形。
  - 审计脚本会阻止这些背景矩形再次出现。
- 食物卡片小图标尺寸异常：
  - 原因是 `.food-card img` 选择器过宽，把食物照片的 `118x118` 规则套到了小图标上。
  - 已改为 `.food-card > img` 只控制食物照片，小图标单独设置尺寸。

## Ice Maker 页面说明

Ice Maker 行图标仍以内联 SVG 形式存在，但路径来源绑定到本地 Figma 导出，并保留 `data-asset-source` 标记：

- `assets/typhur-clean-66-9538.svg`
- `assets/typhur-calendar-icon-66-9550.svg`
- `assets/typhur-arrow-66-9537.svg`

后续如果继续优化，应优先改成可直接追溯的真实 SVG 资产或更细粒度的 Figma 节点导出。

## 字体说明

Figma 字体栈包含：

- Helvetica Now
- SF Pro
- OPlus Sans

当前项目没有包含这些授权字体，因此页面使用接近的系统/开源安全字体栈。字号、字重、行高、颜色、坐标按 Figma 尽量匹配，但在没有真实字体文件前，不声明文字字形达到 1:1。

## 审计规则

`scripts/audit-typhur-pages.cjs` 当前会检查：

- 页面是否引用正确 Figma donor node id。
- 页面尺寸是否符合 Figma frame。
- 关键文本是否存在。
- 关键本地素材是否存在并被引用。
- 页面不能依赖临时 MCP URL。
- 状态栏、导航栏、tabbar 不能退回手绘容器。
- Wellness 页面不能保留 `data-restoration="approximate"`。
- Wellness 统计环 SVG 不能包含导出的灰底/页面背景矩形。
- 食物照片和食物小图标的 CSS 选择器必须分开。

## 验证命令

```powershell
node .\scripts\audit-typhur-pages.cjs
node .\scripts\audit-restore-hub.cjs
```

最近一次验证结果：

- Typhur pages audit passed.
- Restore hub audit passed.
- 浏览器实际检查 `failedImages: []`。
- 状态栏、导航、Add Meal、tabbar、统计环、食物小图标均能加载。
- 更新后截图确认统计环浅灰方块已消失。

## 已知限制

- 当前没有记录完整自动像素 diff 视觉验收，因为之前 headless 浏览器链路不稳定。
- 当前保证是：真实素材路径检查、CSS 尺寸检查、本地服务 MIME 检查、应用内浏览器加载检查。
- 最终 1:1 视觉仍建议继续用应用内浏览器或稳定的浏览器自动化做人工/截图对比。

## 本次规则升级

- `scripts/audit-typhur-pages.cjs` 已升级：AI Wellness 的 food calorie/macro 图标也会检查导出背景矩形，不再只检查统计环 SVG。
- 已剥离以下 food icon SVG 里的灰底/页面背景矩形：
  - `assets/typhur-food-calories-66-8384.svg`
  - `assets/typhur-food-protein-66-8388.svg`
  - `assets/typhur-food-carbs-66-8391.svg`
  - `assets/typhur-food-fats-66-8394.svg`
- 统计环这类多层组合视觉被标记为高风险区域。后续不能只用“素材加载成功”作为验收依据，必须做局部截图对比，检查比例、圆心、弧线、点阵、文字和层级。
- 如果暂时没有稳定的视觉 diff 工具，应在交付中明确说明统计环等组合区域“尚未完成局部视觉验收”。
- AI Wellness 中心文字框已按 Figma 父级相对坐标修正：`66:8225` 页面 x 为 `90`，统计卡片 x 为 `16`，因此 CSS `left` 为 `74px`。审计脚本会检查这个偏移和副标题字号/行高。
- AI Wellness 圆弧 SVG 已按导出素材自身比例渲染：灰色轨道 `66:8223` 为 `176x161`，绿色弧线 `66:8224` 为 `173x161`，不再强行拉伸成 `176x176`。审计脚本会检查这两个尺寸。
- Custom Time 页面发生过违规降级：Pork/Seafood/Poultry/Eggs 四个缺失图标曾被局部截图裁图替代。该做法已禁止并撤回；后续如果 Figma MCP 没有返回真实 SVG/图片节点，必须明确说明素材缺失，不能裁截图、不能手绘 CSS、不能自制 SVG。审计脚本已加入 `figma-crop-fallback` 和 `-crop.png` 拦截。
- Custom Time 页面发生过纵向对齐偏差：Name 输入框和 Main Ingredient 网格曾整体偏下。后续对这类表单页必须用局部截图对比检查标题、输入框、卡片顶边的 y 坐标，不能只看整页 diff 或脚本通过。
