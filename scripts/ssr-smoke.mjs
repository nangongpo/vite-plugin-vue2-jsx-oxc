import { createRenderer } from 'vue-server-renderer'
import { createApp } from '../demo/dist-ssr/entry-server.js'

const renderer = createRenderer()
const app = createApp()
const html = await renderer.renderToString(app)

const expected = [
  'vite-plugin-vue2-jsx-oxc',
  'LocalJsxInSfc.vue',
  'script lang=&quot;tsx&quot;',
  'setup() SFC / TSX',
  'v-model 全类型',
  '直接传递组件 Prop',
  '显式 VNodeData.domProps',
  '使用 setup context，不使用 this',
  'setup() 中的 v-model 运行时辅助',
  'SVG 与嵌套 Fragment 数组',
  'JSX 指令与显式 directives spread',
  'directives spread 合并结果',
  '父组件累计收到 ping'
]

for (const text of expected) {
  if (!html.includes(text)) {
    throw new Error(`SSR smoke test did not render expected text: ${text}`)
  }
}

console.log(`SSR smoke rendered ${html.length} characters.`)
