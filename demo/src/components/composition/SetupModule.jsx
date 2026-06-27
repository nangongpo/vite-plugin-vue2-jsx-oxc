import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'SetupModuleJsx',
  setup() {
    const active = ref(false)
    return () => (
      <article class={['demo-card', { active: active.value }]}>
        <span class="case-label">setup module / JSX</span>
        <h3>独立 .jsx setup 组件</h3>
        <button class="button" onClick={() => { active.value = !active.value }}>
          active: {String(active.value)}
        </button>
      </article>
    )
  }
})
