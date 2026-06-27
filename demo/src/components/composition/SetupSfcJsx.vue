<script lang="jsx">
import { computed, defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'SetupSfcJsx',
  setup() {
    const count = ref(0)
    const label = computed(() => `setup JSX：${count.value}`)

    return () => (
      <article class="demo-card">
        <span class="case-label">setup() SFC / JSX</span>
        <h3>{label.value}</h3>
        <p>Vue 2.7 原生 ref、computed 与 setup render function。</p>
        <button class="button" onClick={() => { count.value += 1 }}>count + 1</button>
      </article>
    )
  }
})
</script>
