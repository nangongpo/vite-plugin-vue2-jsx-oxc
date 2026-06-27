# 兼容范围

## 运行环境

| 项目 | 范围 |
| --- | --- |
| Node.js | `^20.19.0` 或 `>=22.12.0` |
| Vite | `^8.0.0` |
| Vue | `^2.7.0` |
| TypeScript | 推荐 5.9+ |

## Vue SFC 插件

官方 `@vitejs/plugin-vue2@2.3.4` 只声明 Vite 3–7 peer 范围，并且项目处于非活跃维护状态。本仓库已实际验证它能够完成以下 Vite 8.1 构建：

- Vue 2.7 template SFC
- `script lang="jsx"`
- `script lang="tsx"`
- 客户端生产构建
- SSR 生产构建

这属于经过测试的实际兼容，不等同于上游正式声明支持 Vite 8。

## 不提供的能力

- Babel 插件注入接口
- Vue 3 JSX runtime
- Vue 2.6 SFC 编译
- 把 Vue 2 根 Fragment 自动模拟为 Vue 3 Fragment
