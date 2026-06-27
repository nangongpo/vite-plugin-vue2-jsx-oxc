# setup() 组合式组件

Vue 2.7 内置 Composition API。默认配置 `compositionAPI: 'native'` 会从 `vue` 导入 JSX render function 所需的 `h`，并对齐 `@vue/babel-sugar-composition-api-render-instance` 的生成代码处理逻辑。

## 两类 `this` 必须区分

### 业务源码中的 `this`

Vue 2.7 调用 `setup()` 时不会把组件实例绑定为 `this`。因此用户源码中的下面写法仍然是编译错误：

```jsx
export default {
  setup() {
    return () => (
      <button onClick={() => this.$emit('submit')}>
        提交
      </button>
    )
  }
}
```

应该使用 setup context：

```jsx
export default {
  setup(_props, { emit }) {
    const submit = () => emit('submit')
    return () => <button onClick={submit}>提交</button>
  }
}
```

插件不会把用户写下的 `this.$emit`、`this.$attrs` 或任意其他 `this.*` 偷偷改写成组件实例。

### JSX sugar 生成的实例辅助调用

Vue 2 JSX 的 `v-model` sugar 为成员表达式生成赋值代码时，会使用 Vue 2 实例辅助方法。例如：

```tsx
setup() {
  const form = reactive({ name: '' })
  return () => <ModelInput vModel={form.name} />
}
```

`v-model` lowering 需要生成等价于下面的回调：

```js
callback: $$v => {
  this.$set(form, 'name', $$v)
}
```

这个 `this` 不是用户源码，而是 JSX sugar 生成的内部代码。`@vue/babel-sugar-composition-api-render-instance` 的职责就是在 `setup()` 中捕获当前实例，并把这类生成代码改为实例变量访问。

本插件在 Vue 2.7 native 模式下输出：

```js
import { getCurrentInstance, h } from 'vue'

setup() {
  const __currentInstance = getCurrentInstance().proxy

  return () => h(ModelInput, {
    model: {
      value: form.name,
      callback: $$v => {
        __currentInstance.$set(form, 'name', $$v)
      }
    }
  })
}
```

::: tip 为什么使用 `.proxy`
旧 Babel sugar 最初输出 `getCurrentInstance()`。Vue 2.7 的 `getCurrentInstance()` 返回 `{ proxy }`，传统 Vue 2 实例方法 `$set`、`_n`、`_q`、`_i`、`_k` 位于 `proxy` 上，因此本插件捕获 `getCurrentInstance().proxy`。
:::

## 对齐范围

实例只在生成代码确实需要时注入：

| JSX 功能 | 生成的 Vue 2 实例辅助方法 |
| --- | --- |
| 成员表达式 `v-model` | `$set` |
| `v-model_number` | `_n` |
| checkbox / radio 比较 | `_q`、`_i` |
| `v-on` 按键过滤 sugar | `_k` |

简单 setup JSX 不会导入 `getCurrentInstance`：

```jsx
setup() {
  return () => <div>plain setup render</div>
}
```

`onClick={() => this.$emit('ping')}` 也不属于 render-instance sugar 的处理范围，它仍会因源码使用 `this` 而报错。

## 转换顺序

```text
识别 setup() 作用域
        ↓
检查用户源码中的 this
        ↓
导入 Composition API h
        ↓
编译 JSX / v-model / v-on
        ↓
发现生成的 $set / _n / _q / _i / _k
        ↓
按需注入 getCurrentInstance().proxy
```

## 完整 render-instance Demo

下面的组件同时覆盖组件 `v-model`、数字修饰符和 checkbox 数组：

<<< ../../demo/src/components/composition/SetupRenderInstanceSfc.vue

## SFC setup render

::: code-group

<<< ../../demo/src/components/composition/SetupSfcJsx.vue [JSX]

<<< ../../demo/src/components/composition/SetupSfcTsx.vue [TSX]

:::

## setup context

<<< ../../demo/src/components/composition/SetupContextSfc.vue

## 独立 setup 模块

::: code-group

<<< ../../demo/src/components/composition/SetupModule.jsx [JSX]

<<< ../../demo/src/components/composition/SetupModule.tsx [TSX]

:::

## Options API 与 setup 的区别

Options API 的 `data`、`computed`、`methods` 和 `render` 仍可以使用组件实例 `this`：

```jsx
export default {
  data() {
    return { count: 0 }
  },
  render() {
    return <button onClick={() => { this.count += 1 }}>{this.count}</button>
  }
}
```
