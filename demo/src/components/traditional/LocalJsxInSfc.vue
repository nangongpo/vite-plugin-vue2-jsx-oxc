<template>
  <article class="demo-card">
    <span class="case-label">局部 JSX + template</span>
    <h3>LocalJsxInSfc.vue</h3>
    <LocalBadge :text="message" />
    <p>外层仍使用 template，局部子组件在 script lang="jsx" 中使用 JSX。</p>
    <button class="button" @click="count += 1">更新局部 JSX：{{ count }}</button>
  </article>
</template>

<script lang="jsx">
const LocalBadge = {
  name: 'LocalJsxBadge',
  functional: true,
  props: { text: String },
  render(h, { props }) {
    return <span class="badge">{props.text}</span>
  }
}

export default {
  name: 'LocalJsxInSfc',
  components: { LocalBadge },
  data() {
    return { count: 0 }
  },
  computed: {
    message() {
      return `局部 JSX 计数：${this.count}`
    }
  }
}
</script>
