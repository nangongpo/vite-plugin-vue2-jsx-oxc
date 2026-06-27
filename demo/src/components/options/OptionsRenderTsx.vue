<script lang="tsx">
type DemoState = { count: number; message: string }

export default {
  name: 'OptionsRenderTsx',
  data(): DemoState {
    return { count: 1, message: 'TypeScript 类型会保留给 Vite Oxc 处理' }
  },
  render(this: any) {
    const doubled: number = this.count * 2
    return (
      <article class="demo-card">
        <span class="case-label">Options API / TSX</span>
        <h3>script lang="tsx"</h3>
        <p>{this.message}</p>
        <button class="button" onClick={() => { this.count += 1 }}>
          {this.count} × 2 = {doubled}
        </button>
      </article>
    )
  }
}
</script>
