# 安装与配置

## 安装依赖

```bash
pnpm add vue@^2.7.16
pnpm add -D vite@^8 @vitejs/plugin-vue2 vite-plugin-vue2-jsx-oxc
```

::: warning Vite 8 peer 范围
`@vitejs/plugin-vue2@2.3.4` 的 peerDependencies 目前只声明到 Vite 7，但本仓库的 Vue SFC Demo 已在 Vite 8.1 完成客户端和 SSR 实际构建。安装器严格校验 peer 时可以使用 overrides，或根据团队策略忽略该声明差异。
:::

## Vite 配置

```ts
import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'
import vue2JsxOxc from 'vite-plugin-vue2-jsx-oxc'

export default defineConfig({
  plugins: [
    vue2(),
    vue2JsxOxc({
      compositionAPI: 'native',
      fragment: 'error'
    })
  ]
})
```

插件使用 `enforce: 'pre'`。Vue SFC 插件负责拆分 `.vue` 文件，本插件负责处理提取出的 JSX/TSX script request。

## 最小组件

::: code-group

```vue [Vue SFC]
<script lang="jsx">
export default {
  render() {
    return <button onClick={() => this.$emit('click')}>Vue 2 JSX</button>
  }
}
</script>
```

```tsx [独立 TSX]
import Vue from 'vue'

export default Vue.extend({
  render() {
    return <div title={this.value}>TSX</div>
  }
})
```

:::

## 运行仓库 Demo

```bash
pnpm install
pnpm demo:dev
pnpm demo:build
pnpm demo:ssr-build
```
