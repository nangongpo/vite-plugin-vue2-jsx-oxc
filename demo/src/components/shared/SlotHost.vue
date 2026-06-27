<template>
  <article class="slot-host">
    <header><slot name="header">默认标题</slot></header>
    <main><slot :message="message" :count="count">默认内容</slot></main>
    <footer><slot name="footer">默认页脚</slot></footer>
  </article>
</template>

<script>
export default {
  name: 'SlotHost',
  data() {
    return { message: '来自 scoped slot', count: 2 }
  }
}
</script>
