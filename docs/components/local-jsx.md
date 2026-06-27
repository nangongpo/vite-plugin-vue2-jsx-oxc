# SFC 局部 JSX/TSX

局部使用 JSX 不要求整个 SFC 都改成 render。外层可以继续使用 template，只在 `script` 中声明并注册局部 JSX 子组件。

## template + 局部 JSX

<<< ../../demo/src/components/traditional/LocalJsxInSfc.vue

## template + 局部 TSX

<<< ../../demo/src/components/traditional/LocalTsxInSfc.vue

这种模式适合表格单元格、局部图标、动态内容渲染器等需要 JSX 表达力，但仍希望保留 template 可读性的组件。
