import Vue from 'vue'

export default Vue.extend({
  name: 'StandaloneJsx',
  data: () => ({ message: 'Standalone .jsx' }),
  render() {
    return (
      <article class="demo-card">
        <span class="case-label">standalone JSX</span>
        <h3>{this.message}</h3>
        <global-badge text="全局字符串组件标签" />
      </article>
    )
  }
})
