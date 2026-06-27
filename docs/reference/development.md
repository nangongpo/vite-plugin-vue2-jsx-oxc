# 参与开发

## 目录

```text
src/
├── compiler/       # AST、作用域和 Vue 2 JSX lowering
├── hmr/            # 组件导出分析与 HMR 注入
├── runtime/        # spread、HMR、SSR 虚拟模块
├── ssr/            # SSR 注入
├── filter.ts
├── options.ts
└── index.ts

demo/               # Vue 2.7 全组件形态 Demo
docs/               # VitePress 文档站
tests/              # 编译、runtime、dependency scan 与 Babel reference 测试
```

## 命令

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm demo:build
pnpm demo:ssr-build
pnpm demo:ssr-smoke
pnpm docs:build
pnpm verify
```

## 新增功能检查表

1. 为编译器增加 fixture 或转换测试；涉及 Vue 2 JSX 既有语义时，同时增加 `@vue/babel-preset-jsx` reference test。
2. 检查 JSX 和 TSX 两种 parser 语言。
3. 在 Vue SFC script request 中验证。
4. 在独立 JSX/TSX 模块中验证。
5. 更新 Demo 组件。
6. 更新对应 VitePress 页面和功能矩阵。


## Babel reference test

开发依赖中保留 `@vue/babel-preset-jsx@1.4.0`。`tests/babel-reference.spec.ts` 会对同一段 JSX 分别运行官方 Babel preset 和本编译器，校验：

- `propsXxx`、`attrsXxx`、`domPropsXxx` 等 VNodeData 分组
- 直接组件属性进入 `attrs`，由 Vue 运行时提取声明的 Prop
- PascalCase 标签的词法绑定行为
- `onHook:mounted` 不会被错误宣传为完整 `hook:mounted` 事件名

这样可以把“Vue 2 Babel JSX 兼容规则”和“Vue 3 JSX 规则”明确分开。
