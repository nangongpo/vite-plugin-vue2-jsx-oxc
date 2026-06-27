# 事件

## 推荐写法

普通元素或组件事件直接使用 `onXxx`：

```jsx
<button onClick={handleClick} />
<input onKeyup={handleKeyup} />
```

需要组件根元素原生事件或带 `once`、`capture`、`passive` 标记时，可以显式传入 VNodeData：

```jsx
const data = {
  nativeOn: {
    '~click': handleOnceClick,
    '!focus': handleCaptureFocus,
    '&scroll': handlePassiveScroll
  }
}

return <MyButton {...data} />
```

Vue 2 事件名前缀：

| 标记 | 含义 |
| --- | --- |
| `!click` | capture |
| `~click` | once |
| `&scroll` | passive |

`stop`、`prevent`、按键和系统键过滤建议直接使用 JavaScript：

```jsx
<button
  onClick={event => {
    event.stopPropagation()
    event.preventDefault()
    submit(event)
  }}
>
  提交
</button>

<input
  onKeyup={event => {
    if (
      event.key === 'Enter' &&
      event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      submit(event)
    }
  }}
/>
```

<<< ../../demo/src/components/features/VOnDemo.vue

## `nativeOnClick`

`nativeOnClick`、`nativeOnDblclick` 等前缀属性由官方 Vue 2 Babel JSX transform 支持。本 Demo 使用显式 `{ nativeOn: ... }` data spread，以便更清楚地区分组件事件和根元素原生事件。

## `vOn:*` 兼容语法

`vOn:click_stop_prevent` 来自官方 `@vue/babel-sugar-v-on`，并且默认包含在 `@vue/babel-preset-jsx` 中。它是 Babel preset 提供的可选语法糖，不是 Vue 2.7 Composition API 或 Vue 核心运行时语法。

本插件默认保留兼容能力；Demo 设置 `vOn: false`，只演示普通事件属性和显式 VNodeData。
