# Figma 还原流水线

流水线用于 Figma 数据和真实素材已经获取后的自动验收，不会用截图或手绘素材替代 Figma 节点。

## 每个新页面

1. 使用 Figma MCP 读取 `design context`、metadata 和截图。
2. 将真实节点素材下载到 `assets/`。
3. 复制一份 `restore-manifests/*.json`，填写页面、节点、尺寸、素材 natural size 和关键 CSS 坐标。
4. 运行：

```powershell
node scripts/restore-pipeline.cjs restore-manifests/typhur-test-schedule.json
```

流水线会检查：

- Figma file key、node id、源 Frame 尺寸和渲染比例。
- 临时 MCP URL、截图裁切替代、内联手绘 SVG。
- 本地素材是否存在、是否被页面引用、SVG natural size 是否正确。
- SVG 是否夹带常见灰色导出背景。
- 关键元素的 CSS 坐标和尺寸。
- 页面所属项目的审计脚本。
- 通过 Playwright 驱动真实 Chrome/Edge，检查目标视口、画布起点、渲染尺寸、图片加载和页面溢出。

截图输出到 `_figma_tmp/pipeline/`，该目录不会提交到 Git。

## 仍需人工完成

- 判断应该导出哪个语义节点，不能让脚本猜素材。
- 对照 Figma 检查字体观感、复杂图表、圆环端点、渐变和组合图层。
- 真实字体未授权时，明确记录替代字体限制。
- 确认后再提交和部署。
