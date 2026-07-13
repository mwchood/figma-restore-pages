# Figma 页面还原项目

本项目用于把 Figma 节点还原为可检查、可追溯、可在线访问的前端页面。

## 唯一入口

开始任何还原任务前，只读取下面两份文档：

1. [还原规则.md](./还原规则.md)：允许与禁止事项、优先级、交付标准。
2. [还原流水线.md](./还原流水线.md)：页面清单、自动审计、浏览器截图和发布流程。

`docs/history/` 中的内容全部是历史档案，仅用于追溯问题，不再作为当前规则或操作依据。历史内容与入口文档冲突时，以 `还原规则.md` 和 `还原流水线.md` 为准。

## 项目结构

- `*.html`：已经还原的页面。
- `assets/`：本地化的真实 Figma 素材与授权安全字体。
- `restore-manifests/`：每个页面的节点、素材和关键坐标清单。
- `scripts/restore-pipeline.cjs`：统一验收流水线。
- `scripts/audit-*.cjs`：由流水线调用的专项防回归检查。
- `index.html`：GitHub Pages 统一入口。
- `docs/history/`：旧审计、旧规则、经验记录和周报。

## 在线地址

https://mwchood.github.io/figma-restore-pages/
