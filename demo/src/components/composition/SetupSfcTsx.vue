<script lang="tsx">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'SetupSfcTsx',
  setup() {
    const items = ref<string[]>(['Oxc', 'Vue 2.7'])
    const addItem = (): void => {
      items.value.push(`item-${items.value.length + 1}`)
    }

    return () => (
      <article class="demo-card">
        <span class="case-label">setup() SFC / TSX</span>
        <h3>类型化 setup render</h3>
        <ul>{items.value.map(item => <li key={item}>{item}</li>)}</ul>
        <button class="button" onClick={addItem}>添加项目</button>
      </article>
    )
  }
})
</script>
