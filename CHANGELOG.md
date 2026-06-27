# Changelog

## 0.0.0

- 首次公开发布。
- 支持 Vite 8 与 Vue 2.7 的 JSX/TSX 转换。
- 支持 Vue SFC `script lang="jsx"` / `script lang="tsx"`、Options API、函数式组件和 Composition API render。
- 对齐 Vue 2 Babel JSX 的 VNodeData、`v-model`、可选 `v-on`、指令、spread、HMR 与 SSR 语义。
- 支持 Vite 8 冷启动依赖扫描，避免 Vue JSX 被误转换为 React runtime。
- 提供完整测试、Vue 2.7 Demo、VitePress 文档、GitHub Pages 与 npm 发布工作流。
