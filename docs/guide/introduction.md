# 插件介绍

`vite-plugin-vue2-jsx-oxc` 面向 **Vite 8 + Vue 2.7**。它不把 JSX 当作 React JSX，而是将其转换为 Vue 2 的 `h(tag, data, children)` 与 `VNodeData`。

## 为什么需要单独转换器

Oxc 自带 JSX 转换主要围绕 React runtime。Vue 2 JSX 还需要处理：

- `attrs`、`props`、`domProps`
- `on`、`nativeOn`、`hook`
- `directives`、`v-model`、事件属性与事件对象
- functional component sugar
- `inject-h` 与 Vue 2.7 Composition API setup render
- Vue 2 HMR 和 SSR 注册

因此本插件采用自定义 Vue 2 JSX 编译阶段，而不是只设置 `jsx.pragma = 'h'`。

## 支持范围

| 分类 | 支持内容 |
| --- | --- |
| 文件 | `.jsx`、`.tsx`、`.vue` 中 `lang="jsx"` / `lang="tsx"` |
| 组件 | template SFC、Options API、functional、setup、独立模块 |
| 数据 | 完整 Vue 2 `VNodeData` 分组与 spread merge |
| 转换能力 | 事件、`v-model`、指令、functional、inject-h |
| 工程 | HMR、SSR、TypeScript 后续转换、Source Map |

下一步请阅读[安装与配置](./getting-started)。
