<script lang="tsx">
type FunctionalContext = {
  props: { text: string; count: number }
  data: Record<string, unknown>
}

export default {
  name: 'FunctionalSfcTsx',
  functional: true,
  props: {
    text: { type: String, default: '' },
    count: { type: Number, default: 0 }
  },
  render(h: any, context: FunctionalContext) {
    return (
      <article class="demo-card">
        <span class="case-label">functional SFC / TSX</span>
        <h3>{context.props.text}</h3>
        <p>带类型的 functional render，当前外部计数：{context.props.count}</p>
      </article>
    )
  }
}
</script>
