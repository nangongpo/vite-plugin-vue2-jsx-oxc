<script lang="jsx">
import SlotHost from '../shared/SlotHost.vue'

export default {
  name: 'SlotsDemo',
  components: { SlotHost },
  render() {
    return (
      <article class="demo-card">
        <span class="case-label">slots / scopedSlots</span>
        <h3>普通插槽与作用域插槽</h3>
        <SlotHost scopedSlots={{
          default: ({ message, count }) => <p>{message} × {count}</p>
        }}>
          <strong slot="header">header slot</strong>
          <small slot="footer">footer slot</small>
        </SlotHost>
      </article>
    )
  }
}
</script>
