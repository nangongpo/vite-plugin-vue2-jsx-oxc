# vite-plugin-vue2-jsx-oxc

[![npm version](https://img.shields.io/npm/v/vite-plugin-vue2-jsx-oxc.svg)](https://www.npmjs.com/package/vite-plugin-vue2-jsx-oxc)
[![CI](https://github.com/nangongpo/vite-plugin-vue2-jsx-oxc/actions/workflows/ci.yml/badge.svg)](https://github.com/nangongpo/vite-plugin-vue2-jsx-oxc/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/vite-plugin-vue2-jsx-oxc.svg)](./LICENSE)

- [开发文档](https://nangongpo.github.io/vite-plugin-vue2-jsx-oxc/)
- [在线 Demo](https://nangongpo.github.io/vite-plugin-vue2-jsx-oxc/playground/)
- [GitHub](https://github.com/nangongpo/vite-plugin-vue2-jsx-oxc)
- [npm](https://www.npmjs.com/package/vite-plugin-vue2-jsx-oxc)

面向 **Vite 8 + Vue 2.7** 的 JSX/TSX 转换插件。插件使用 `oxc-parser` 解析源码，自行完成 Vue 2 `VNodeData`、指令、语法糖、HMR 和 SSR 转换，再把不含 JSX 的 JavaScript/TypeScript 交回 Vite 8 的 Oxc 流水线。

## 功能

- `.jsx`、`.tsx`
- Vue SFC `<script lang="jsx">` / `<script lang="tsx">`
- 普通 template SFC 与局部 JSX/TSX 混合使用
- Options API render
- Vue 2 functional SFC
- functional arrow component sugar
- Vue 2.7 `setup()` render function
- Vue 2.7 标准 `setup(props, context)`；源码中的 `this` 报错，`v-model` / `v-on` 生成辅助代码按需捕获 render instance
- HTML、SVG、局部组件、全局字符串组件、成员组件
- 推荐使用直接组件 Prop、普通 Attribute、事件属性和显式 `VNodeData` spread
- 兼容官方 Vue 2 Babel JSX 前缀：`propsXxx`、`attrsXxx`、`domPropsXxx`、`onXxx`、`nativeOnXxx`、`hookXxx`
- `class`、`style`、`key`、`ref`、函数 ref、`slot`、`scopedSlots`、`model`，并兼容 `refInFor`
- JSX spread、分组 spread 和 children spread
- 自定义指令、参数与修饰符，以及显式 `VNodeData.directives` spread 与多段合并
- 标准事件属性：`onClick`、`nativeOnClick`、`on`、`nativeOn`
- 可选兼容官方 `@vue/babel-sugar-v-on`；Demo 关闭该 sugar，使用普通事件属性
- 组件和原生表单 `v-model`
- 独立 JSX/TSX 模块 HMR
- Vue SFC HMR 协作
- SSR module registration
- TSX 类型保留与高精度 Source Map
- Vite 8 冷启动依赖扫描桥接，避免误导入 `react/jsx-dev-runtime`

## 环境

- Node.js 22.12 或更高版本
- pnpm 11

## 安装

```bash
pnpm add vue@^2.7.16
pnpm add -D vite@^8 @vitejs/plugin-vue2 vite-plugin-vue2-jsx-oxc
```

> `@vitejs/plugin-vue2@2.3.4` 的 peerDependencies 目前只声明到 Vite 7。本仓库已使用 Vite 8.1 实际完成 Vue SFC 客户端和 SSR 构建，但这不等同于上游正式声明支持 Vite 8。

## Vite 配置

```ts
import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'
import vue2JsxOxc from 'vite-plugin-vue2-jsx-oxc'

export default defineConfig({
  plugins: [
    vue2(),
    vue2JsxOxc({
      compositionAPI: 'native',
      injectH: true,
      functional: true,
      vModel: true,
      // Demo 使用普通事件属性，关闭 vOn:* sugar
      vOn: false,
      hmr: true,
      ssr: true,
      fragment: 'error',
      dependencyScan: true
    })
  ]
})
```

## 转换流程

```text
.jsx / .tsx / Vue SFC script request
                 ↓
             oxc-parser
                 ↓
       AST、绑定与词法作用域分析
                 ↓
 functional / composition / inject-h
                 ↓
 Vue 2 JSX → h(tag, data, children)
                 ↓
       MagicString + Source Map
                 ↓
       HMR / SSR / runtime 注入
                 ↓
 Vite 8 Oxc 继续处理 TS 与目标语法
```



## 语法策略

- `setup()` 源码严格遵循 Vue 2.7 Composition API：setup 本体和内部箭头函数出现组件 `this` 时直接报错。
- 对齐 `@vue/babel-sugar-composition-api-render-instance`：仅为 `v-model` / `v-on` 生成的 `$set`、`_n`、`_q`、`_i`、`_k` 按需注入当前实例；Vue 2.7 使用 `getCurrentInstance().proxy`。
- Demo 优先使用 `value={...}`、`title="..."`、`onClick={...}` 和 `{...vnodeData}`。
- 编译器仍兼容 `@vue/babel-plugin-transform-vue-jsx@1.4.0` 官方文档中的 `propsXxx`、`attrsXxx`、`domPropsXxx`、`nativeOnXxx`、`hookXxx` 与 `refInFor`。
- 测试套件使用真实 `@vue/babel-preset-jsx` 作为参考转换器，防止误把 Vue 3 JSX 规则套用到 Vue 2。

## Vite 8 dependency scan

Vite 8 的冷启动依赖扫描使用独立 Rolldown 流水线，不会执行普通 Vite `transform` 钩子。插件默认向 `optimizeDeps.rolldownOptions.plugins` 注入 Vue 2 JSX 扫描转换器，避免 SFC JSX/TSX 被当成 React automatic runtime 并导入 `react/jsx-dev-runtime`。

升级后建议清理旧缓存：

```bash
rm -rf node_modules/.vite
pnpm dev -- --force
```

可以通过下面的命令执行真实冷启动回归测试：

```bash
pnpm demo:scan-smoke
```

## VitePress 文档

文档站位于 `docs/`，使用独立 Vue 3 依赖，避免与 Demo 的 Vue 2.7 运行时冲突。

```bash
pnpm bootstrap
pnpm docs:dev
pnpm docs:build
pnpm docs:preview
```

文档按以下内容组织：

- 安装、Vite 8 集成、配置和转换流程
- 传统组件、局部 JSX/TSX、Options API、functional、setup、独立模块
- 功能总览、VNodeData、事件、v-model、指令、插槽、spread、SVG 和 Fragment
- HMR、SSR、TypeScript、Source Map、迁移和开发说明

文档中的主要代码片段直接引用 `demo/src` 源文件，避免示例与可运行代码不一致。Demo 主路径不使用 `propsXxx`、`attrsXxx`、`hookXxx` 或 `refInFor`；这些能力保留为官方 Vue 2 Babel JSX 迁移兼容。

## Vue 组件 Demo

Demo 入口使用传统 `App.vue`，包含：

```text
demo/src/components/
├── traditional/    # template 与局部 JSX/TSX
├── options/        # Options API render
├── functional/     # functional SFC 与箭头函数 sugar
├── composition/    # setup SFC、render-instance 与独立 setup 模块
├── modules/        # 独立 JSX/TSX 与 HMR
├── features/       # 全部 JSX 转换功能
└── shared/         # template 辅助组件
```

运行：

```bash
pnpm demo:dev
pnpm demo:build
pnpm demo:ssr-build
```

## 开发验证

首次安装：

```bash
pnpm bootstrap
```

完整验证：

```bash
pnpm verify
```

该命令依次执行：

- 插件和 Demo TypeScript 类型检查
- 编译器、runtime 与 dependency-scan bridge 测试
- Vite 8 冷启动依赖扫描烟雾测试
- 插件 ESM 和类型声明构建
- Vue 2.7 SFC 客户端生产构建
- Vue 2.7 SFC SSR 生产构建
- Vue 2 SSR 实际渲染烟雾测试
- VitePress 文档生产构建

## 与 @vitejs/plugin-vue2-jsx 的主要差异

- 不运行 Babel，不支持 `babelPlugins`。
- TypeScript 保留给 Vite 8 Oxc 后续处理。
- `setup()` 源码中的 `this` 仍然报错；编译器生成的 `v-model` / `v-on` Vue 2 实例辅助调用会按旧 Babel sugar 的窄范围注入 `getCurrentInstance().proxy`。
- 组件标签按词法作用域解析。
- 支持 JSX 属性表达式中的嵌套 JSX。
- Fragment 默认报错，也可配置为 VNode 数组。
- 提供独立 VitePress 文档站和覆盖全部组件形态的 Vue SFC Demo。

## 发布与托管

仓库已经包含：

- `.github/workflows/ci.yml`：提交和 Pull Request 完整验证；
- `.github/workflows/pages.yml`：通过 GitHub Pages 同时部署 VitePress 文档和 Demo；
- `.github/workflows/publish.yml`：通过 npm trusted publishing 发布后续版本；
- `RELEASING.md`：首次发布、Pages 配置和 npm OIDC 配置步骤。

发布前执行：

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm release:check
pnpm pack --dry-run
```

## License

MIT

