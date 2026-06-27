<script lang="jsx">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'SetupContextSfc',
  inheritAttrs: false,
  props: {
    pingTotal: { type: Number, default: 0 }
  },
  setup(props, { attrs, emit, listeners, slots }) {
    const count = ref(0)

    const emitPing = () => {
      count.value += 1
      emit('ping', count.value)
    }

    return () => {
      const rootData = { attrs }

      return (
        <article {...rootData} class="demo-card">
          <span class="case-label">setup(props, context)</span>
          <h3>使用 setup context，不使用 this</h3>
          <p>emit、attrs、listeners 和 slots 都从 setup 的第二个参数取得。</p>
          <p>父级监听器：{Object.keys(listeners).join(', ') || 'none'}</p>
          <p class="result-line">父组件累计收到 ping：{props.pingTotal}</p>
          {slots.default ? slots.default() : null}
          <button class="button" onClick={emitPing}>emit ping：{count.value}</button>
        </article>
      )
    }
  }
})
</script>
