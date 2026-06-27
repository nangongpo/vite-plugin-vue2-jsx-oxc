# JSX/TSX 功能总览

下表将插件能力、Demo 文件和详细文档对应起来。所有列出的 Demo 文件都会参与 Vite 8 客户端构建和 SSR 渲染烟雾测试。

| 功能 | 具体能力 | Demo | 文档 |
| --- | --- | --- | --- |
| 文件类型 | `.jsx`、`.tsx`、Vue SFC `lang="jsx"` / `lang="tsx"` | `demo/src/components` | [组件形态](../components/overview) |
| 标签解析 | HTML、SVG、局部组件、全局字符串组件、成员组件 | `VNodeDataDemo.vue`、`StandaloneJsx.jsx` | [VNodeData 与标签](./vnode-data) |
| 根级数据 | `class`、`style`、`key`、`ref`、函数 ref、`slot`、`scopedSlots`、`model`；兼容 `refInFor` | 多个 feature demo | [VNodeData 与标签](./vnode-data) |
| 数据分组 | 直接 Prop/Attribute、显式 `VNodeData` spread；兼容 `attrs`、`props`、`domProps`、`on`、`nativeOn`、`hook` 前缀 | `VNodeDataDemo.vue` | [VNodeData 与标签](./vnode-data) |
| 事件 | `onClick`、`nativeOnClick`、`on`、`nativeOn` 事件对象 | `VOnDemo.vue` | [事件](./events) |
| 事件行为 | 使用普通 JavaScript 实现 stop、prevent、按键和系统键过滤 | `VOnDemo.vue` | [事件](./events) |
| 组件 v-model | model value/callback、trim、number、成员赋值、`$set` | `VModelDemo.vue` | [v-model](./v-model) |
| 原生 v-model | input、textarea、checkbox、radio、select、multiple、range | `VModelDemo.vue` | [v-model](./v-model) |
| 指令 | 内置指令、自定义指令、arg、modifiers | `DirectiveDemo.vue` | [指令](./directives) |
| 插槽 | 默认插槽、具名插槽、scopedSlots | `SlotsDemo.vue` | [插槽](./slots) |
| Spread | 完整 VNodeData、分组对象、事件合并、children spread | `SpreadDemo.vue` | [Spread 合并](./spread) |
| SVG | SVG 标签、`xlinkHref` | `SvgFragmentDemo.tsx` | [SVG 与 Fragment](./svg-fragment) |
| Fragment | error / array 两种模式 | `SvgFragmentDemo.tsx` | [SVG 与 Fragment](./svg-fragment) |
| inject-h | Options render 注入、Composition API 导入 | Options/setup demos | [Options API](../components/options-api) |
| functional | 显式 functional、箭头函数 sugar、JSX/TSX | functional demos | [函数式组件](../components/functional) |
| Composition API | Vue 2.7 setup render、setup context、源码 `this` 报错；按需捕获 v-model / v-on 生成的实例辅助方法 | `SetupRenderInstanceSfc.vue` 等 | [setup() 组件](../components/composition-api) |
| TypeScript | TSX AST 保留、后续 Oxc 类型清除 | 所有 `.tsx` 文件 | [TypeScript](../engineering/typescript-sourcemap) |
| HMR | 默认/命名导出、functional、SFC 协作 | `HmrNamedCard.jsx` | [HMR](../engineering/hmr) |
| SSR | module registration、existing hook 合并 | `entry-server.ts` | [SSR](../engineering/ssr) |
| Source Map | MagicString hires map | 所有转换模块 | [TypeScript 与 Source Map](../engineering/typescript-sourcemap) |
