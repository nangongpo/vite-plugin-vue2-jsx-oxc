type ArrowContext = {
  props: { label: string; value: number }
}

export const FunctionalArrowTsx = ({ props }: ArrowContext) => (
  <article class="demo-card compact-card">
    <span class="case-label">functional sugar / TSX</span>
    <h3>{props.label}</h3>
    <p>类型化 props value：{props.value}</p>
  </article>
)
