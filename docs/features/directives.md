# 指令

插件支持 Vue 2 JSX 中的内置指令和自定义运行时指令：

```jsx
<p vShow={visible} />
<input vFocus={onInserted} />
<p vColor:background_bold={color} />
```

## 转换结果

`vFocus={onInserted}` 会转换成 Vue 2 `VNodeData.directives`：

```js
h('input', {
  directives: [
    {
      name: 'focus',
      value: onInserted
    }
  ]
})
```

带参数和修饰符的指令：

```jsx
<p vColor:background_bold={color} />
```

转换为：

```js
h('p', {
  directives: [
    {
      name: 'color',
      value: color,
      arg: 'background',
      modifiers: {
        bold: true
      }
    }
  ]
})
```

该结构与 `@vue/babel-preset-jsx` 的 Vue 2 指令输出保持一致。默认输出字段是：

- `name`
- `value`
- `arg`，存在指令参数时生成
- `modifiers`，存在修饰符时生成

不会额外伪造 `rawName` 或 `expression`。

## 显式 `VNodeData.directives` spread

除了 `vFocus`、`vShow` 等 JSX 指令语法，也支持直接传入 Vue 2 的完整 `VNodeData.directives`：

```jsx
const directives = [
  {
    name: 'my-dir',
    value: 123,
    modifiers: { abc: true }
  }
]

return <div {...{ directives }} />
```

等价输出：

```js
h('div', {
  directives
})
```

指令对象可包含：

- `name`
- `value`
- `arg`
- `modifiers`

### 多段 spread 合并

```jsx
return (
  <div
    {...{ directives: firstDirectives }}
    {...{ directives: secondDirectives }}
    vShow={visible}
  />
)
```

插件会保持出现顺序，将它们合并为一个扁平数组：

```js
h('div', {
  directives: [
    ...firstDirectives,
    ...secondDirectives,
    { name: 'show', value: visible }
  ]
})
```

动态完整 VNodeData 经过运行时合并时，`directives` 也会递归展平，避免出现 Vue 2 无法识别的嵌套数组。

## `vFocus` 示例

Vue 2 自定义聚焦指令应在 `inserted` 钩子中访问 DOM：

```js
function scheduleFocus(element, binding) {
  const applyFocus = () => {
    element.focus()

    if (typeof binding.value === 'function') {
      binding.value(element)
    }
  }

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(applyFocus)
  } else {
    setTimeout(applyFocus, 0)
  }
}

export default {
  directives: {
    focus: {
      inserted: scheduleFocus
    }
  }
}
```

```jsx
<input vFocus={this.handleFocusInserted} />
```

Demo 将聚焦安排到下一帧，并显示两项状态：

- `inserted` 是否已经执行
- 当前 `document.activeElement` 是否为目标输入框

同时提供“重新挂载并触发 vFocus”按钮。这样即使浏览器禁止页面初次加载时的程序化聚焦，也可以在用户点击后重新验证指令。

::: warning 浏览器限制
移动端 Safari、后台标签页、浏览器自动化环境或企业安全策略可能拒绝页面初次加载时的程序化聚焦。这不表示 `directives` 转换失败。应分别检查 `inserted` 是否调用，以及 `document.activeElement` 是否改变。
:::

## 完整示例

<<< ../../demo/src/components/features/DirectiveDemo.vue
