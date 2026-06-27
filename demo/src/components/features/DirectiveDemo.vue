<script lang="jsx">
function scheduleFocus(element, binding) {
  const applyFocus = () => {
    try {
      element.focus({ preventScroll: true })
    } catch {
      element.focus()
    }

    if (typeof binding.value === 'function') {
      binding.value(element)
    }
  }

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(applyFocus)
  } else {
    setTimeout(applyFocus, 0)
  }
}

export default {
  name: 'DirectiveDemo',
  directives: {
    focus: {
      inserted: scheduleFocus
    },
    color: {
      bind(element, binding) {
        element.style[binding.arg || 'color'] = binding.value
        if (binding.modifiers.bold) element.style.fontWeight = '700'
      },
      update(element, binding) {
        element.style[binding.arg || 'color'] = binding.value
      }
    }
  },
  data() {
    return {
      visible: true,
      color: '#dff7eb',
      focusKey: 0,
      focusInserted: false,
      focusActive: false
    }
  },
  methods: {
    handleFocusInserted(element) {
      this.focusInserted = true
      this.focusActive = document.activeElement === element
    },
    handleFocus() {
      this.focusActive = true
    },
    handleBlur() {
      this.focusActive = false
    },
    remountFocusInput() {
      this.focusInserted = false
      this.focusActive = false
      this.focusKey += 1
    }
  },
  render() {
    const focusDirectives = [
      {
        name: 'focus',
        value: this.handleFocusInserted
      }
    ]

    const colorDirectives = [
      {
        name: 'color',
        value: this.color,
        arg: 'background',
        modifiers: { bold: true }
      }
    ]

    return (
      <article class="demo-card">
        <span class="case-label">directives</span>
        <h3>JSX 指令与显式 directives spread</h3>
        <p>
          支持 vShow / vFocus 语法，也支持通过完整 Vue 2 VNodeData
          传入 directives 数组。
        </p>

        <input
          key={this.focusKey}
          class="control"
          {...{ directives: focusDirectives }}
          value="directives spread 自动聚焦"
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
        />

        <p class="result-line">
          inserted：{this.focusInserted ? '已执行' : '等待执行'}；
          当前焦点：{this.focusActive ? '在输入框' : '不在输入框'}
        </p>

        <div class="button-row">
          <button class="button" onClick={this.remountFocusInput}>
            重新挂载并触发 focus 指令
          </button>
          <button class="button secondary" onClick={() => { this.visible = !this.visible }}>
            切换 vShow
          </button>
        </div>

        <p vShow={this.visible}>vShow 与 directives spread 可同时使用</p>
        <p {...{ directives: colorDirectives }}>
          显式 directives：参数 background + 修饰符 bold
        </p>
        <p {...{ directives: colorDirectives }} vShow={this.visible}>
          directives spread 与 JSX 指令合并后仍保持扁平数组
        </p>
      </article>
    )
  }
}
</script>
