# 完整 Demo

[打开在线 Demo](https://nangongpo.github.io/vite-plugin-vue2-jsx-oxc/playground/)

Demo 的入口是传统 Vue 2 SFC `App.vue`，内部组合全部组件形态和语法功能。

每个功能示例都以独立的 `.demo-card` 呈现；说明、状态、操作结果和插槽内容均渲染在对应功能卡片内部，不在卡片外另行展示。

## 运行

```bash
pnpm install
pnpm demo:dev
```

生产与 SSR：

```bash
pnpm demo:build
pnpm demo:ssr-build
```

## 组件目录

```text
demo/src/components/
├── traditional/    # template 与局部 JSX/TSX
├── options/        # Options API render
├── functional/     # 显式 functional 与箭头函数 sugar
├── composition/    # setup SFC 与独立模块
├── modules/        # 独立 JSX/TSX 与 HMR
├── features/       # 所有 JSX 语法功能
└── shared/         # template 辅助组件
```

## 功能与文件映射

| 功能 | Demo 文件 |
| --- | --- |
| 传统 template | `TraditionalCard.vue` |
| SFC 局部 JSX | `LocalJsxInSfc.vue` |
| SFC 局部 TSX | `LocalTsxInSfc.vue` |
| Options JSX/TSX | `OptionsRenderJsx.vue`、`OptionsRenderTsx.vue` |
| Functional SFC | `FunctionalSfcJsx.vue`、`FunctionalSfcTsx.vue` |
| Functional sugar | `FunctionalArrow.jsx`、`FunctionalArrow.tsx` |
| setup SFC | `SetupSfcJsx.vue`、`SetupSfcTsx.vue` |
| setup context | `SetupContextSfc.vue` |
| setup module | `SetupModule.jsx`、`SetupModule.tsx` |
| 独立 JSX/TSX | `StandaloneJsx.jsx`、`StandaloneTsx.tsx` |
| VNodeData | `VNodeDataDemo.vue` |
| v-model | `VModelDemo.vue` |
| 标准事件属性与事件对象 | `VOnDemo.vue` |
| directives | `DirectiveDemo.vue` |
| slots | `SlotsDemo.vue` |
| spread | `SpreadDemo.vue` |
| SVG / Fragment | `SvgFragmentDemo.tsx` |
| HMR | `HmrNamedCard.jsx` |
| SSR | `entry-server.ts` |

## Vite 配置

<<< ../../demo/vite.config.ts

## 根组件

<<< ../../demo/src/App.vue
