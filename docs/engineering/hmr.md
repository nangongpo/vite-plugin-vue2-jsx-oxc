# HMR

## 独立 JSX/TSX 模块

插件分析根级导出组件，支持：

- 默认导出 `defineComponent(...)`
- 命名导出 `defineComponent(...)`
- 变量声明后再导出
- functional component reload
- render-only 更新与完整 reload

<<< ../../demo/src/components/modules/HmrNamedCard.jsx

## Vue SFC

`.vue` 文件的整体 HMR 由 `@vitejs/plugin-vue2` 管理。本插件识别 Vue script request 后不会重复注入独立模块 HMR，避免同一个组件出现两套记录。

## 验证

```bash
pnpm demo:dev
```

修改 `HmrNamedCard.jsx`、`OptionsRenderJsx.vue` 或任意 setup 组件，观察界面更新及局部状态行为。
