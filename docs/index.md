---
layout: home

hero:
  name: vite-plugin-vue2-jsx-oxc
  text: Vue 2.7 JSX/TSX for Vite 8
  tagline: 使用 Oxc Parser 完成 Vue 2 VNodeData、语法糖、HMR 与 SSR 转换
  image:
    src: /logo.svg
    alt: Vue 2 JSX Oxc
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看组件 Demo
      link: /components/overview
    - theme: alt
      text: 功能矩阵
      link: /demo/

features:
  - title: 真实 Vue SFC
    details: 支持传统 template、script lang="jsx"、script lang="tsx"，可在同一个 Vue 组件中局部使用 JSX。
  - title: 全组件形态
    details: Options API、显式 functional、函数式语法糖、setup render、独立 JSX 与 TSX 模块。
  - title: Vue 2 语义
    details: 推荐直接 Prop/Attribute 与显式 VNodeData，同时兼容 Vue 2 Babel JSX 的 attrs、props、domProps、nativeOn、hook 等分组语义。
  - title: Oxc 流水线
    details: Oxc Parser 解析，插件完成 Vue 2 JSX lowering，Vite 8 Oxc 继续处理 TypeScript。
  - title: 开发与生产
    details: 支持 JSX/TSX HMR、Vue SFC HMR 协作、SSR module registration 与高精度 Source Map。
  - title: 可验证 Demo
    details: 文档中的主要代码片段直接引用 demo 源文件，确保文档示例可以真实构建运行。
---


## 在线体验

- [打开在线 Demo](https://nangongpo.github.io/vite-plugin-vue2-jsx-oxc/playground/)
- [查看 GitHub 仓库](https://github.com/nangongpo/vite-plugin-vue2-jsx-oxc)
- [查看 npm 包](https://www.npmjs.com/package/vite-plugin-vue2-jsx-oxc)
