# 插件 API

## 默认导出

```ts
import vue2JsxOxc from 'vite-plugin-vue2-jsx-oxc'
```

```ts
function vue2JsxOxc(options?: Vue2JsxOxcOptions): Plugin
```

## 编译器导出

```ts
import { compileVue2Jsx } from 'vite-plugin-vue2-jsx-oxc'
```

可用于测试、工具链集成和与官方 Babel preset 做输出比对。

## Vue2JsxOxcOptions

```ts
interface Vue2JsxOxcOptions {
  include?: FilterPattern
  exclude?: FilterPattern
  injectH?: boolean
  functional?: boolean
  vModel?: boolean
  vOn?: boolean
  compositionAPI?: CompositionAPIOption
  hmr?: boolean
  ssr?: boolean
  fragment?: 'error' | 'array'
  dependencyScan?: boolean
}
```

## CompositionAPIOption

```ts
type CompositionAPIOption =
  | false
  | 'native'
  | 'plugin'
  | 'vue-demi'
  | { importSource: string }
```

| 值 | 导入来源 |
| --- | --- |
| `native` | `vue`，用于 Vue 2.7 |
| `plugin` | `@vue/composition-api` |
| `vue-demi` | `vue-demi` |
| `{ importSource }` | 自定义模块 |
| `false` | 禁用 Composition API 的 `h` 导入 |

## dependencyScan

默认值为 `true`。为 Vite 8 冷启动依赖扫描注入 Vue 2 JSX/TSX 转换器，避免扫描阶段生成 `react/jsx-runtime` 或 `react/jsx-dev-runtime`。

## vOn

默认值为 `true`，兼容官方 `@vue/babel-sugar-v-on` 的 `vOn:*` 属性语法。Demo 显式设为 `false`，使用普通事件属性和显式 VNodeData。

## setup 与 render instance

用户源码在 setup 本体和内部箭头函数中使用 `this` 仍会触发编译错误。

开启 `compositionAPI` 后，编译器会对齐 `@vue/babel-sugar-composition-api-render-instance` 的窄范围行为：只有 `v-model` / `v-on` lowering 生成的 `$set`、`_n`、`_q`、`_i`、`_k` 需要 Vue 2 实例时，才导入 `getCurrentInstance` 并在 setup 开头捕获实例。Vue 2.7 native 模式使用 `getCurrentInstance().proxy`。
