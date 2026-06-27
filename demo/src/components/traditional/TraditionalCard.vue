<template>
  <article class="demo-card">
    <span class="case-label">传统 template SFC</span>
    <h3>{{ title }}</h3>
    <p>这个组件完全使用 Vue 2 模板语法，用于证明 JSX 插件不会影响普通 SFC。</p>
    <button class="button" @click="count += 1">模板计数：{{ count }}</button>
  </article>
</template>

<script>
export default {
  name: 'TraditionalCard',
  data() {
    return { title: 'TraditionalCard.vue', count: 0 }
  }
}
</script>
