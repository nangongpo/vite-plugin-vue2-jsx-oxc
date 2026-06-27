<script lang="jsx">
import ModelInput from '../shared/ModelInput.vue'

export default {
  name: 'VNodeDataDemo',

  components: {
    ModelInput
  },

  data() {
    return {
      value: 'VNodeData',
      rows: ['ref-A', 'ref-B'],
      rowRefCount: 0
    }
  },

  created() {
    this._rowElements = []
  },

  methods: {
    setRowRef(index, element) {
      this._rowElements[index] = element || null
    },

    readRowRefs() {
      this.rowRefCount =
        this._rowElements.filter(Boolean).length
    }
  },

  render() {
    const htmlData = {
      domProps: {
        innerHTML:
          '<strong>显式 VNodeData.domProps</strong>'
      }
    }

    return (
      <article class="demo-card">
        <span class="case-label">
          Vue 2 VNodeData
        </span>

        <h3>
          Prop、Attribute、事件和 Data Spread
        </h3>

        <ModelInput
          value={this.value}
          label="直接传递组件 Prop"
          onInput={value => {
            this.value = value
          }}
        />

        <div class="result-box" {...htmlData} />

        <h4>函数 ref</h4>

        <ul>
          {this.rows.map((row, index) => (
            <li
              key={row}
              ref={element => {
                this.setRowRef(index, element)
              }}
            >
              {row}
            </li>
          ))}
        </ul>

        <button
          class="button"
          onClick={this.readRowRefs}
        >
          读取函数 ref
        </button>

        <p>
          已收集 DOM 元素：{this.rowRefCount} 个
        </p>
      </article>
    )
  }
}
</script>
