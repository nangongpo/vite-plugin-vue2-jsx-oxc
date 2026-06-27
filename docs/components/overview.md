# Vue 组件形态覆盖

Demo 使用真实 `.vue` 文件作为入口，并覆盖下列组件形式。

| 组件形态 | 文件示例 | 状态 |
| --- | --- | --- |
| 传统 template SFC | `TraditionalCard.vue` | <span class="feature-complete">完整</span> |
| template + 局部 JSX | `LocalJsxInSfc.vue` | <span class="feature-complete">完整</span> |
| template + 局部 TSX | `LocalTsxInSfc.vue` | <span class="feature-complete">完整</span> |
| Options API JSX render | `OptionsRenderJsx.vue` | <span class="feature-complete">完整</span> |
| Options API TSX render | `OptionsRenderTsx.vue` | <span class="feature-complete">完整</span> |
| 显式 functional SFC | `FunctionalSfcJsx.vue` / `.tsx` | <span class="feature-complete">完整</span> |
| functional arrow sugar | `FunctionalArrow.jsx` / `.tsx` | <span class="feature-complete">完整</span> |
| setup SFC | `SetupSfcJsx.vue` / `.tsx` | <span class="feature-complete">完整</span> |
| setup render-instance | `SetupRenderInstanceSfc.vue` | <span class="feature-complete">完整</span> |
| setup context | `SetupContextSfc.vue` | <span class="feature-complete">完整</span> |
| setup JSX/TSX module | `SetupModule.jsx` / `.tsx` | <span class="feature-complete">完整</span> |
| 独立 Options JSX/TSX | `StandaloneJsx.jsx` / `.tsx` | <span class="feature-complete">完整</span> |
| 命名导出 HMR 组件 | `HmrNamedCard.jsx` | <span class="feature-complete">完整</span> |

`setup()` 示例的业务源码全部遵守 Vue 2.7 标准，不使用组件 `this`。成员表达式 `v-model` 所需的 `$set/_n/_q/_i` 属于编译器生成代码，会按需捕获 `getCurrentInstance().proxy`。

<a class="demo-link-card" href="../demo/">查看完整 Demo 页面和运行命令 →</a>
