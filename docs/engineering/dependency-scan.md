# Vite 8 依赖扫描

## 问题表现

Vite 8 开发服务器冷启动时，可能出现：

```text
Failed to run dependency scan
react/jsx-dev-runtime
```

报错来源通常指向：

```text
Component.vue?id=0
```

这不是 Vue 组件运行阶段的转换错误。Vite 8 的依赖扫描器使用独立的 Rolldown 流水线，它会直接提取 `.vue` 文件中的 `lang="jsx"` / `lang="tsx"` script，并且不会执行普通 Vite 插件的 `transform` 钩子。

如果扫描阶段没有框架专用转换器，扫描器会采用 React automatic runtime，进而生成：

```js
import { jsxDEV } from 'react/jsx-dev-runtime'
```

## 插件处理方式

插件会自动向下面的位置注入扫描转换器：

```ts
optimizeDeps.rolldownOptions.plugins
```

扫描阶段的流程变为：

```text
SFC script / JSX / TSX
        ↓
Vue 2 JSX dependency-scan bridge
        ↓
无 JSX 的 JS / TS
        ↓
Rolldown 收集 bare imports
```

扫描转换器与正常编译使用同一个 `compileVue2Jsx()`，但会关闭：

- HMR 注入
- SSR 注册
- Source Map

扫描阶段只负责移除 JSX，并让 Vite 正确发现 `vue` 等依赖。

## dependencyScan

默认启用：

```ts
vue2JsxOxc({
  dependencyScan: true
})
```

只有在以下情况才建议关闭：

- Vite 后续版本已经原生解决非 React JSX 扫描问题；
- 项目完全关闭依赖自动发现；
- 项目自行提供了等价的 `optimizeDeps.rolldownOptions.plugins` 转换器。

```ts
vue2JsxOxc({
  dependencyScan: false
})
```

## 临时关闭入口扫描

无法立即升级插件时，可以关闭冷启动入口扫描，让依赖在正常模块转换后动态发现：

```ts
export default defineConfig({
  optimizeDeps: {
    entries: []
  }
})
```

该方案会延后依赖发现，首次加载可能触发一次重新优化，因此仅作为旧版本临时方案。

## 清理旧缓存

升级后删除 Vite 缓存，或使用 `--force`：

```bash
rm -rf node_modules/.vite
pnpm dev -- --force
```

仓库中的回归命令会进行真实冷启动扫描：

```bash
pnpm demo:scan-smoke
```
