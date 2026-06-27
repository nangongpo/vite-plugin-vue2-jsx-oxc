<script lang="jsx">
export default {
  name: 'SpreadDemo',
  directives: {
    mark: {
      bind(element, binding) {
        element.dataset.mark = String(binding.value)
      }
    }
  },
  data() {
    return { count: 0 }
  },
  render() {
    const vnodeData = {
      class: ['spread-card'],
      attrs: { title: '完整 VNodeData spread', 'data-spread': 'root' },
      on: { dblclick: () => { this.count += 2 } }
    }
    const buttonData = {
      attrs: {
        'data-group': 'attrs spread',
        'aria-label': 'spread demo'
      },
      on: {
        click: () => { this.count += 1 }
      }
    }
    const firstDirectives = [
      { name: 'mark', value: 'first' }
    ]
    const secondDirectives = [
      { name: 'mark', value: 'second', modifiers: { merged: true } }
    ]
    const nodes = [
      <span class="badge" key="a">spread child A</span>,
      <span class="badge" key="b">spread child B</span>
    ]

    return (
      <article {...vnodeData} class="demo-card">
        <span class="case-label">spread merge</span>
        <h3>完整 VNodeData、directives 与 children spread</h3>
        <p>多个 directives 数组会按出现顺序合并为同一个扁平数组。</p>
        <button {...buttonData} class="button">click + 1 / dblclick + 2</button>
        <div
          {...{ directives: firstDirectives }}
          {...{ directives: secondDirectives }}
          class="result-line"
        >
          directives spread 合并结果：data-mark=second
        </div>
        <div class="badge-row">{...nodes}</div>
        <p>count：{this.count}</p>
      </article>
    )
  }
}
</script>
