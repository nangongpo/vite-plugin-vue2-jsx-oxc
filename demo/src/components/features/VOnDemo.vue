<script lang="jsx">
import NativeClickButton from '../shared/NativeClickButton.vue'

export default {
  name: 'VOnDemo',
  components: { NativeClickButton },
  data() {
    return {
      count: 0,
      lastKey: 'none'
    }
  },
  methods: {
    increment() {
      this.count += 1
    },
    stopAndPrevent(event) {
      event.stopPropagation()
      event.preventDefault()
      this.increment()
    },
    submitOnCtrlEnter(event) {
      const exactCtrlEnter =
        event.key === 'Enter' &&
        event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey &&
        !event.metaKey

      if (exactCtrlEnter) {
        this.lastKey = event.key
      }
    }
  },
  render() {
    const nativeData = {
      nativeOn: {
        '~click': this.increment
      }
    }

    return (
      <article
        class="demo-card"
        onMouseenter={() => { this.lastKey = 'mouseenter' }}
        onMouseleave={() => { this.lastKey = 'mouseleave' }}
      >
        <span class="case-label">Vue 2 JSX 事件</span>
        <h3>onClick、显式 nativeOn data 与普通 JavaScript 判断</h3>
        <div class="button-row" onClick={this.increment}>
          <button class="button" onClick={this.stopAndPrevent}>
            stop + prevent
          </button>
          <NativeClickButton {...nativeData}>
            native once
          </NativeClickButton>
        </div>
        <input
          class="control"
          placeholder="Ctrl + Enter"
          onKeyup={this.submitOnCtrlEnter}
        />
        <p>count：{this.count}，最后事件：{this.lastKey}</p>
      </article>
    )
  }
}
</script>
