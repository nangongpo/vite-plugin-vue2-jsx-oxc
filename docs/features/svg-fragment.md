# SVG 与 Fragment

## SVG

支持 SVG 原生标签以及 `xlinkHref → xlink:href` 映射。

## Fragment

Vue 2 没有与 Vue 3 相同的根 Fragment 语义：

- `fragment: 'error'`：默认报错，要求显式包裹根节点。
- `fragment: 'array'`：转换为 VNode 数组，适合 children 等能够接收数组的位置。

Demo 在普通元素 children 中使用 Fragment：

<<< ../../demo/src/components/features/SvgFragmentDemo.tsx
