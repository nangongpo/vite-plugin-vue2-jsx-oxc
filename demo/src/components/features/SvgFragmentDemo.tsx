import Vue from 'vue'

export default Vue.extend({
  name: 'SvgFragmentDemo',
  data: () => ({ iconId: '#demo-check' }),
  render(this: any) {
    return (
      <article class="demo-card">
        <span class="case-label">SVG / xlink / Fragment</span>
        <h3>SVG 与嵌套 Fragment 数组</h3>
        <svg width="0" height="0" aria-hidden="true">
          <symbol id="demo-check" viewBox="0 0 24 24">
            <path d="M5 12l4 4L19 6" fill="none" stroke="currentColor" stroke-width="2" />
          </symbol>
        </svg>
        <div class="fragment-row">
          <>
            <svg class="demo-icon" viewBox="0 0 24 24"><use xlinkHref={this.iconId} /></svg>
            <span>Fragment child A</span>
            <span>Fragment child B</span>
          </>
        </div>
      </article>
    )
  }
})
