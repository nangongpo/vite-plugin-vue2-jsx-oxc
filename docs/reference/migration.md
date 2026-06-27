# 从 @vitejs/plugin-vue2-jsx 迁移

## 配置替换

```diff
-import vue2Jsx from '@vitejs/plugin-vue2-jsx'
+import vue2JsxOxc from 'vite-plugin-vue2-jsx-oxc'

 plugins: [
   vue2(),
-  vue2Jsx()
+  vue2JsxOxc({ compositionAPI: 'native' })
 ]
```

## 保持兼容的官方 Vue 2 JSX 语义

- `propsXxx`、`attrsXxx`、`domPropsXxx`
- `onXxx`、`nativeOnXxx`、`hookXxx`
- `refInFor`、`scopedSlots`、`model`
- `vModel` sugar
- functional arrow component
- Options API render
- JSX spread merge

这些能力来自 `@vue/babel-plugin-transform-vue-jsx` / `@vue/babel-preset-jsx`。为了让 Demo 更容易阅读，示例优先使用直接 Prop/Attribute 和显式 VNodeData spread，但旧写法仍受支持。

## setup render-instance 对齐

本插件对齐 `@vue/babel-sugar-composition-api-render-instance` 的核心目的，但区分用户源码与编译器生成代码：

- 用户在 setup 中直接或通过箭头函数使用 `this`：编译错误。
- `v-model` / `v-on` lowering 生成的 `$set`、`_n`、`_q`、`_i`、`_k`：按需改为捕获的 render instance。
- 旧 sugar 输出 `getCurrentInstance()`；Vue 2.7 返回 `{ proxy }`，因此 native 模式输出 `getCurrentInstance().proxy`。
- 普通事件继续使用 `context.emit`；attrs/listeners/slots 使用 setup 第二个参数。

## `vOn:*` sugar

`vOn:click_stop` 是官方 `@vue/babel-sugar-v-on` 的可选语法糖。本插件默认保留迁移兼容；新代码可以设置 `vOn: false`，改用 `onClick`、显式事件对象和普通 JavaScript 判断。

## 需要调整

- 删除 `babelPlugins` 等 Babel 专用选项。
- 不要配置 React automatic JSX runtime。
- Fragment 根据项目情况设置为 `error` 或 `array`。
- 使用 `.vue` 时保留 Vue 2 SFC 插件。
