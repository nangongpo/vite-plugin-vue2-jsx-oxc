# TypeScript 与 Source Map

## TSX 两阶段处理

1. 本插件使用 Oxc Parser 解析 TSX，并只转换 JSX 与 Vue 2 语法糖。
2. 类型标注保留在输出中。
3. 返回 `moduleType: 'ts'`。
4. Vite 8 内置 Oxc 继续清除类型和转换目标语法。

<<< ../../demo/src/components/options/OptionsRenderTsx.vue

## Source Map

开发模式和开启 `build.sourcemap` 时使用 MagicString 生成高精度 Source Map。因为只覆盖外层 JSX root，嵌套 JSX 的位置映射不会因重叠修改而损坏。
