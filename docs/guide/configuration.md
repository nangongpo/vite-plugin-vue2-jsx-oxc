# 配置项

```ts
interface Vue2JsxOxcOptions {
  include?: FilterPattern
  exclude?: FilterPattern
  injectH?: boolean
  functional?: boolean
  vModel?: boolean
  vOn?: boolean
  compositionAPI?: false | 'native' | 'plugin' | 'vue-demi' | { importSource: string }
  hmr?: boolean
  ssr?: boolean
  fragment?: 'error' | 'array'
  dependencyScan?: boolean
}
```

| 选项 | 默认值 | 作用 |
| --- | --- | --- |
| `include` | `/\.[jt]sx$/` | 普通模块匹配规则 |
| `exclude` | `/node_modules/` | 排除规则 |
| `injectH` | `true` | 为 render/setup 注入或导入 `h` |
| `functional` | `true` | 转换大写箭头函数组件 |
| `vModel` | `true` | 转换组件和原生表单 v-model |
| `vOn` | `true` | 兼容官方 `@vue/babel-sugar-v-on` 的 `vOn:*` 语法；Demo 为清晰起见关闭 |
| `compositionAPI` | `'native'` | Composition API 导入来源 |
| `hmr` | `true` | 独立 JSX/TSX 模块 HMR |
| `ssr` | `true` | SSR module registration |
| `fragment` | `'error'` | Fragment 处理方式 |
| `dependencyScan` | `true` | 为 Vite 8 的独立 Rolldown 依赖扫描器注入 Vue 2 JSX 转换 |

完整类型说明参见[插件 API](../reference/options)。

`dependencyScan` 用于解决开发服务器冷启动时扫描器把 Vue JSX 当成 React JSX、进而导入 `react/jsx-dev-runtime` 的问题。参见 [Vite 8 依赖扫描](../engineering/dependency-scan)。

## vOn 兼容选项

`vOn` 对应官方 `@vue/babel-preset-jsx` 中的事件修饰符语法糖。它不是 Vue 核心运行时 API；Demo 为了突出普通事件属性而显式关闭：

```ts
vue2JsxOxc({
  vOn: false
})
```

事件使用 `onClick`、`nativeOnClick`、`on` 和 `nativeOn` 编写。
