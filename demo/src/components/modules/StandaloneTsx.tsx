import Vue from 'vue'

type State = { count: number }

export default Vue.extend({
  name: 'StandaloneTsx',
  data(): State {
    return { count: 3 }
  },
  render(this: any) {
    const values: number[] = [1, 2, 3]
    return (
      <article class="demo-card">
        <span class="case-label">standalone TSX</span>
        <h3>Standalone .tsx</h3>
        <p>{values.map(value => value * this.count).join(' / ')}</p>
        <button class="button" onClick={() => { this.count += 1 }}>倍数 + 1</button>
      </article>
    )
  }
})
