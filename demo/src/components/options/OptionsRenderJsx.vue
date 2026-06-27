<script lang="jsx">
export default {
  name: 'OptionsRenderJsx',
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count += 1
    }
  },
  render() {
    return (
      <article class="demo-card">
        <span class="case-label">Options API / JSX</span>
        <h3>script lang="jsx"</h3>
        <p>render() 自动注入 h，并使用 Vue 2 VNodeData 事件结构。</p>
        <button class="button" onClick={this.increment}>JSX 计数：{this.count}</button>
      </article>
    )
  }
}
</script>
