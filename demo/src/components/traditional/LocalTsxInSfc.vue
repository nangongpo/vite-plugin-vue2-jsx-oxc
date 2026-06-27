<template>
  <article class="demo-card">
    <span class="case-label">局部 TSX + template</span>
    <h3>LocalTsxInSfc.vue</h3>
    <LocalMetric :label="label" :value="value" />
    <p>局部函数式子组件带 TypeScript 类型，外层仍是普通 Vue 模板。</p>
    <button class="button" @click="value += 1">value + 1</button>
  </article>
</template>

<script lang="tsx">
type MetricContext = {
  props: { label: string; value: number }
}

const LocalMetric = ({ props }: MetricContext) => (
  <span class="metric">
    <small>{props.label}</small>
    <strong>{props.value}</strong>
  </span>
)

export default {
  name: 'LocalTsxInSfc',
  components: { LocalMetric },
  data(): { label: string; value: number } {
    return { label: '局部 TSX', value: 7 }
  }
}
</script>
