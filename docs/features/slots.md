# 插槽

## 普通具名插槽

通过根级 `slot` 数据指定：

```jsx
<strong slot="header">header slot</strong>
```

## scopedSlots

```jsx
<SlotHost scopedSlots={{
  default: ({ message, count }) => <p>{message} × {count}</p>
}} />
```

## 完整示例

::: code-group

<<< ../../demo/src/components/shared/SlotHost.vue [SlotHost.vue]

<<< ../../demo/src/components/features/SlotsDemo.vue [SlotsDemo.vue]

:::
