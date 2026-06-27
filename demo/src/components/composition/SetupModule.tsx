import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'SetupModuleTsx',
  setup() {
    const value = ref<number>(10)
    return () => (
      <article class="demo-card">
        <span class="case-label">setup module / TSX</span>
        <h3>独立 .tsx setup 组件</h3>
        <button class="button" onClick={() => { value.value += 5 }}>
          value: {value.value}
        </button>
      </article>
    )
  }
})
