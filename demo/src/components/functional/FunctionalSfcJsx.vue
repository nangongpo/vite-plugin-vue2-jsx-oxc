<script lang="jsx">
export default {
  name: 'FunctionalSfcJsx',
  functional: true,
  props: { text: String },
  render(h, context) {
    return (
      <article {...context.data} class={['demo-card', context.data.class]}>
        <span class="case-label">functional SFC / JSX</span>
        <h3>{context.props.text}</h3>
        <p>显式 functional: true，使用 context.props、context.data 与 children。</p>
        {context.children}
      </article>
    )
  }
}
</script>
