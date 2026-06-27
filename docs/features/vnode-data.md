# 属性、VNodeData 与标签

Vue 2 JSX 最终会生成 `h(tag, data, children)`。日常组件开发建议优先使用直观属性；只有需要直接控制 Vue 2 `VNodeData` 时，再使用 data object 或官方 Babel preset 的分组前缀。

## 推荐：组件 Prop 和普通 Attribute 直接书写

```jsx
<ModelInput
  value={this.value}
  label="名称"
  placeholder="请输入"
  onInput={value => { this.value = value }}
/>
```

这与官方 `@vue/babel-plugin-transform-vue-jsx` 的行为一致：未带特殊前缀的属性先进入 `data.attrs`。Vue 2 创建组件时会从 `data.attrs` 中提取组件声明的 Prop，因此 `value`、`label` 会成为组件 Prop，未声明的 `placeholder` 则保留为 Attribute。

原生元素的 `value`、`checked`、`selected`、`muted` 等 must-use property 会自动进入 `domProps`。

## 推荐：低层 VNodeData 使用显式对象 spread

```jsx
const data = {
  domProps: {
    innerHTML: '<strong>HTML</strong>'
  },
  nativeOn: {
    dblclick: handleDblclick
  }
}

return <ModelInput {...data} />
```

这种写法明确表示传入的是完整 Vue 2 VNodeData，不会把普通业务属性和 data 分组混在一起。

## 官方 Vue 2 Babel JSX 兼容语法

为了兼容 `@vue/babel-preset-jsx@1.4.0`，插件仍支持其文档和源码中定义的前缀语法：

| JSX | 输出 |
| --- | --- |
| `propsValue={value}` | `data.props.value` |
| `attrsTitle="title"` | `data.attrs.title` |
| `domPropsInnerHTML={html}` | `data.domProps.innerHTML` |
| `onClick={handler}` | `data.on.click` |
| `nativeOnClick={handler}` | `data.nativeOn.click` |
| `hookInsert={handler}` | `data.hook.insert` |
| `refInFor` | `data.refInFor = true` |

这些属于 **Vue 2 Babel JSX preset 的兼容语法**，不是 Vue 3 JSX 规则。Demo 主路径不依赖 `propsXxx`、`attrsXxx`、`hookXxx` 或 `refInFor`，以减少隐式分组；编译器则保留它们，确保旧项目可以迁移。

## ref 推荐写法

Vue 2.7 支持函数 ref。循环中可以显式收集元素：

```jsx
{rows.map((row, index) => (
  <li
    key={row.id}
    ref={element => { this.rowElements[index] = element }}
  >
    {row.label}
  </li>
))}
```

## 组件生命周期事件

监听子组件的 Vue 生命周期事件时，显式传入 `on['hook:mounted']`：

```jsx
const data = {
  on: {
    'hook:mounted': handleMounted
  }
}

return <ModelInput {...data} />
```

不要使用 `onHook:mounted` 猜测式写法：官方 Vue 2 Babel JSX transform 不会把它可靠地编译成完整的 `hook:mounted` 事件名。组件 hook 事件与低层 VNode patch hook `data.hook.insert` 是两种不同机制。

## 标签解析

- HTML、SVG 和小写/连字符标签按字符串标签处理。
- PascalCase 标签在当前词法作用域有绑定时生成标识符。
- 未绑定的 PascalCase 标签保持字符串，用于 Vue 2 全局组件解析。
- `Kit.Label` 等成员标签生成成员表达式。

## 完整示例

<<< ../../demo/src/components/features/VNodeDataDemo.vue

## 上游参考

- [`@vue/babel-plugin-transform-vue-jsx` README](https://www.npmjs.com/package/@vue/babel-plugin-transform-vue-jsx)
- [`@vue/babel-preset-jsx` README](https://www.npmjs.com/package/@vue/babel-preset-jsx)
