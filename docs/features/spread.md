# Spread 合并

## 完整 VNodeData spread

```jsx
const data = {
  class: ['card'],
  attrs: { title: 'title' },
  on: { click: handleClick }
}

return <article {...data} />
```

多个数据段通过虚拟 runtime 按 Vue 2 规则合并：

- `attrs`、`props`、`domProps` 浅合并
- `on`、`nativeOn` 的同名 handler 合并为数组
- `hook` 的同名 hook 合并为顺序调用函数
- `class`、`style` 保留组合顺序
- `directives` 按出现顺序合并并展平为单层数组
- 其他根属性以后出现者为准

## 推荐：分组也放入显式 VNodeData

```jsx
const buttonData = {
  attrs: {
    'aria-label': 'save'
  },
  on: {
    click: save
  }
}

return <button {...buttonData}>保存</button>
```

插件也兼容官方 Babel preset 的 `attrs={attrs}`、`on={listeners}` 分组属性，但 Demo 优先使用完整 data object，避免把业务属性和 VNodeData 分组写法混在一起。

## Children spread

<<< ../../demo/src/components/features/SpreadDemo.vue

## `directives` spread

```jsx
const directives = [
  { name: 'my-dir', value: 123, modifiers: { abc: true } }
]

return <div {...{ directives }} />
```

也可以和其他指令数据及 JSX 指令混用：

```jsx
return (
  <div
    {...{ directives: first }}
    {...{ directives: second }}
    vShow={visible}
  />
)
```

最终 `VNodeData.directives` 始终是扁平数组，不会生成 `[[directiveA], [directiveB]]`。

