export const FunctionalArrowJsx = ({ props, listeners }) => (
  <article class="demo-card compact-card">
    <span class="case-label">functional sugar / JSX</span>
    <h3>{props.label}</h3>
    <button class="button" onClick={listeners.activate}>触发父组件事件</button>
  </article>
)
