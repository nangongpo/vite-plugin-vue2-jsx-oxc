import { describe, expect, it } from 'vitest'
import vue2JsxOxc from '../src'
import {
  createVue2JsxDependencyScanPlugin,
  type Vue2JsxDependencyScanPlugin
} from '../src/dep-scan'
import { normalizeOptions } from '../src/options'

async function runTransform(
  plugin: Vue2JsxDependencyScanPlugin,
  code: string,
  id: string
) {
  return await plugin.transform(code, id)
}

describe('Vite 8 dependency scanner bridge', () => {
  it('transforms Vue SFC scan virtual modules before React JSX lowering', async () => {
    const plugin = createVue2JsxDependencyScanPlugin(normalizeOptions())
    const result = await runTransform(
      plugin,
      `export default { render() { return <article {...this.data}>scan</article> } }`,
      'virtual-module:/src/SpreadDemo.vue?id=0'
    )

    const output = typeof result === 'string' ? result : result?.code || ''
    expect(output).toContain('h("article"')
    expect(output).not.toContain('<article')
    expect(output).not.toContain('react/jsx-runtime')
    expect(output).not.toContain('react/jsx-dev-runtime')
  })

  it('preserves TypeScript module mode while removing TSX', async () => {
    const plugin = createVue2JsxDependencyScanPlugin(normalizeOptions())
    const result = await runTransform(
      plugin,
      `const count: number = 1; export default { render(h: any) { return <div>{count}</div> } }`,
      '/src/Standalone.tsx'
    )

    expect(typeof result).toBe('object')
    if (!result || typeof result === 'string') return
    expect(result.code).not.toContain('<div>')
    expect(result.code).toContain('count: number')
    expect(result.moduleType).toBe('ts')
  })

  it('injects the scanner bridge through the Vite config hook', async () => {
    const plugin = vue2JsxOxc()
    const hook = plugin.config
    if (!hook) throw new Error('missing config hook')
    const handler = typeof hook === 'function' ? hook : hook.handler
    const config = await handler.call({} as never, {}, {
      command: 'serve',
      mode: 'development',
      isSsrBuild: false,
      isPreview: false
    })

    const plugins = config?.optimizeDeps?.rolldownOptions?.plugins
    expect(Array.isArray(plugins)).toBe(true)
    expect((plugins as Array<{ name?: string }>)[0]?.name).toBe(
      'vite-plugin-vue2-jsx-oxc:dep-scan'
    )
  })
})
