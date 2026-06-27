# 转换流程

```text
.jsx / .tsx / Vue SFC script request
                 ↓
             oxc-parser
                 ↓
       AST、绑定与词法作用域分析
                 ↓
 functional / composition / inject-h
                 ↓
   Vue 2 JSX → h(tag, data, children)
                 ↓
        MagicString + Source Map
                 ↓
         HMR / SSR / runtime 注入
                 ↓
 Vite 8 Oxc 继续处理 TS 与目标语法
```

## 为什么只替换 JSX 根节点

嵌套 JSX 的源码区间会互相包含。编译器只覆盖最外层 JSX root，子 JSX 通过递归渲染生成，避免 MagicString 出现重叠修改。

## 词法组件绑定

- HTML/SVG 标签转换为字符串标签。
- 当前 JSX 词法作用域中存在绑定的 PascalCase 标签转换为标识符。
- 未绑定 PascalCase 标签保留为字符串组件名，交给 Vue 全局组件解析。
- `Kit.Label` 转换为成员表达式。

## TypeScript

TSX 转换后仍保留类型节点，并返回 `moduleType: 'ts'`。后续 Vite 8 Oxc 负责清除类型并执行目标语法转换。
