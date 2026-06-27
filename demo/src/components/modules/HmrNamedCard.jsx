import { defineComponent } from 'vue'

export const HmrNamedCard = defineComponent({
  name: 'HmrNamedCard',
  data: () => ({ count: 0 }),
  render() {
    return (
      <article class="demo-card hmr-card">
        <span class="case-label">named export HMR</span>
        <h3>HmrNamedCard.jsx</h3>
        <p>开发模式修改此文件，可验证命名导出组件的热更新。</p>
        <button class="button" onClick={() => { this.count += 1 }}>保留状态：{this.count}</button>
      </article>
    )
  }
})
