# 函数式组件

## 显式 functional SFC

::: code-group

<<< ../../demo/src/components/functional/FunctionalSfcJsx.vue [JSX]

<<< ../../demo/src/components/functional/FunctionalSfcTsx.vue [TSX]

:::

## 箭头函数语法糖

大写变量名、箭头函数、直接返回 JSX 的声明会转换为 `{ functional: true, render }`。

::: code-group

<<< ../../demo/src/components/functional/FunctionalArrow.jsx [JSX]

<<< ../../demo/src/components/functional/FunctionalArrow.tsx [TSX]

:::

普通 `items.map(item => <li />)` 不会被误判为 functional component。
