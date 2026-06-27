# SSR

SSR transform 中，插件为识别到的组件导出注入 module registration。模块 ID 使用相对 Vite root 的规范化路径。

## SSR 入口

<<< ../../demo/src/entry-server.ts

## 构建

```bash
pnpm demo:ssr-build
```

输出目录：

```text
demo/dist-ssr/entry-server.js
```

虚拟 SSR runtime 会合并已有 `beforeCreate` hook，并通过 SSR context 的 `_registeredComponents` 记录模块。


## 实际渲染烟雾测试

SSR bundle 构建后，仓库使用 `vue-server-renderer@2.7.16` 执行整个组件树：

```bash
pnpm demo:ssr-smoke
```

测试会检查传统 SFC、局部 JSX、TSX setup、v-model 和 SVG/Fragment 等关键节点是否出现在最终 HTML 中。
