# Vue 2.7 全组件形态 Demo

该 Demo 使用真实 Vue 2.7 单文件组件，覆盖：

- 传统 template SFC
- 在普通 SFC 中局部声明 JSX / TSX 组件
- `<script lang="jsx">`、`<script lang="tsx">` 的 Options API render
- 显式 Vue 2 functional SFC
- JSX / TSX 箭头函数 functional sugar
- Vue 2.7 `setup()` 组合式组件
- `@vue/babel-sugar-composition-api-render-instance` 对齐示例：成员 `v-model` 的 `$set/_n/_i` 按需捕获 `getCurrentInstance().proxy`
- `setup(props, context)`，不使用组件 `this`
- 独立 `.jsx`、`.tsx` 组件
- 直接组件 Prop、普通 Attribute、事件属性、函数 ref
- 显式 Vue 2 `VNodeData` spread、v-model、directives、slots、SVG、Fragment
- HMR 与 SSR 构建
- Vite 8 冷启动 dependency scan，不依赖 React runtime

Demo 主路径不使用 `propsXxx`、`attrsXxx`、`hookXxx` 或 `refInFor`。这些写法属于官方 Vue 2 Babel JSX preset 的兼容能力，编译器和参考测试仍然保留。

在仓库根目录运行：

```bash
pnpm demo:dev
pnpm demo:build
pnpm demo:ssr-build
```

插件默认启用 `dependencyScan: true`；Demo 显式设置 `vOn: false`，只演示 `onClick`、显式事件 data 和普通 JavaScript 事件判断。升级后建议删除 `node_modules/.vite`，再使用 `pnpm dev -- --force` 启动。
