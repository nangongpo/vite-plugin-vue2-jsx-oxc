# v-model

## 组件

组件 v-model 转换为 Vue 2 `data.model`：

```jsx
<ModelInput v-model_trim={this.form.name} />
```

支持成员表达式。Options API 中使用 `this.$set`；setup render 中对齐 composition render-instance sugar，按需注入 `getCurrentInstance().proxy.$set`。

## 原生控件

| 控件 | 支持内容 |
| --- | --- |
| text input | composing guard、lazy、trim、number |
| textarea | lazy、trim、number |
| checkbox | 单值、数组、true-value、false-value |
| radio | value、number |
| select | 单选、多选、number |
| range | input/change 事件策略 |

## 完整示例

<<< ../../demo/src/components/features/VModelDemo.vue


## setup render-instance

当 setup 中的 `v-model` 绑定到成员表达式时，编译器生成的 `$set`、`_n`、`_q`、`_i` 会改为通过捕获的 Vue 2 render instance 调用。业务源码本身不能使用 `this`。

<<< ../../demo/src/components/composition/SetupRenderInstanceSfc.vue
