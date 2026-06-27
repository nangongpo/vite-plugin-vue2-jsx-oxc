# 独立 JSX/TSX 模块

不使用 `.vue` 也可以直接导出 Vue 2 组件。

::: code-group

<<< ../../demo/src/components/modules/StandaloneJsx.jsx [StandaloneJsx.jsx]

<<< ../../demo/src/components/modules/StandaloneTsx.tsx [StandaloneTsx.tsx]

:::

Demo 使用 `<global-badge />` 查找全局注册组件。插件也与官方 Babel preset 一样进行词法绑定分析：已导入或局部声明的 PascalCase 标签生成标识符，未绑定的标签保留为字符串交给 Vue 2 运行时解析。
