# Vite 8 集成

## 插件顺序

```ts
plugins: [
  vue2(),
  vue2JsxOxc()
]
```

`@vitejs/plugin-vue2` 负责 `.vue` 文件的 descriptor、template、style 和 script request。本插件通过以下请求识别局部 JSX：

```text
Component.vue?vue&type=script&lang.jsx
Component.vue?vue&type=script&lang.tsx
```

## 文件处理边界

| 输入 | 处理者 |
| --- | --- |
| `.vue` template/style | `@vitejs/plugin-vue2` |
| `.vue` JSX/TSX script | 本插件 |
| `.jsx` / `.tsx` | 本插件 |
| 转换后的 TypeScript | Vite 8 Oxc |
| 普通 `.js` / `.ts` | Vite 8 |

## 局部使用 JSX

普通 SFC 可以保留 template，只在 script 内声明一个局部 JSX 子组件。参见[SFC 局部 JSX/TSX](../components/local-jsx)。

## include / exclude

默认包括 `.jsx`、`.tsx` 和 Vue JSX/TSX script request，默认排除 `node_modules`。Vue script request 会根据原始 `.vue` 文件路径执行 exclude 判断。

## 冷启动依赖扫描

Vite 8 的依赖扫描运行在独立 Rolldown 流水线中。插件默认通过 `dependencyScan: true` 同步注入扫描转换器，因此 `.jsx`、`.tsx` 以及 SFC `lang="jsx/tsx"` 不会被误转换成 React automatic runtime。详见 [Vite 8 依赖扫描](../engineering/dependency-scan)。
