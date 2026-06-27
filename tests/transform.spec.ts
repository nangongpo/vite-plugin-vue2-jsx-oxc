import { parseSync, Severity } from 'oxc-parser'
import { describe, expect, it } from 'vitest'
import { compileVue2Jsx, type NormalizedVue2JsxOxcOptions } from '../src'

const normalized: NormalizedVue2JsxOxcOptions = {
  injectH: true,
  functional: true,
  vModel: true,
  vOn: true,
  compositionAPI: 'native',
  hmr: true,
  ssr: true,
  fragment: 'error',
  dependencyScan: true
}

function compile(
  code: string,
  overrides: Partial<Parameters<typeof compileVue2Jsx>[1]> = {}
) {
  return compileVue2Jsx(code, {
    ...normalized,
    id: '/src/example.jsx',
    filename: '/src/example.jsx',
    language: 'jsx',
    sourceMap: false,
    isDev: false,
    isSsr: false,
    isVueSfcScript: false,
    moduleId: 'src/example.jsx',
    ...overrides
  })
}

function expectParsable(code: string, lang: 'js' | 'ts' = 'js') {
  const result = parseSync(`/output.${lang}`, code, {
    lang,
    sourceType: 'module',
    showSemanticErrors: true
  })
  const errors = result.errors.filter(error => error.severity === Severity.Error)
  expect(errors.map(error => error.message)).toEqual([])
}

describe('Vue 2 JSX compiler', () => {
  it('compiles imported components and Vue 2 VNodeData groups', () => {
    const result = compile(`
      import ElInput from './ElInput'
      export default {
        render() {
          return <ElInput id="name" propsValue={this.name} onInput={this.update} nativeOnClick={this.click} />
        }
      }
    `)

    expect(result.code).toContain('h(ElInput')
    expect(result.code).toContain('attrs: { "id": "name" }')
    expect(result.code).toContain('props: { "value": this.name }')
    expect(result.code).toContain('on: { "input": this.update }')
    expect(result.code).toContain('nativeOn: { "click": this.click }')
    expect(result.code).toContain('import { h } from "vue"')
    expectParsable(result.code)
  })

  it('keeps unbound component names as strings', () => {
    const result = compile(`export default { render(h) { return <GlobalCard /> } }`)
    expect(result.code).toContain('h("GlobalCard")')
  })

  it('merges spread VNodeData through the virtual runtime', () => {
    const result = compile(`export default { render(h) { return <Comp {...this.data} onClick={this.click} /> } }`)
    expect(result.code).toContain('mergeVue2JsxData')
    expect(result.code).toContain('[this.data, { on: { "click": this.click } }]')
  })


  it('supports explicit directives arrays through inline VNodeData spread', () => {
    const result = compile(`
      export default {
        render(h) {
          const directives = [{ name: 'my-dir', value: 123, modifiers: { abc: true } }]
          return <div {...{ directives }} />
        }
      }
    `)

    expect(result.code).toContain('directives: [...((directives) || [])]')
    expect(result.code).not.toContain('attrs: { "directives"')
    expectParsable(result.code)
  })

  it('flattens multiple directives spreads and JSX directives into one VNodeData array', () => {
    const result = compile(`
      export default {
        render(h) {
          const first = [{ name: 'first', value: 1 }]
          const second = [{ name: 'second', value: 2 }]
          return <div {...{ directives: first }} {...{ directives: second }} vShow={this.visible} />
        }
      }
    `)

    expect(result.code).toContain(
      'directives: [...((first) || []), ...((second) || []), { name: "show", value: this.visible }]'
    )
    expectParsable(result.code)
  })

  it('compiles v-on modifiers', () => {
    const result = compile(`export default { render(h) { return <button v-on:click_stop_prevent={this.submit}>Save</button> } }`)
    expect(result.code).toContain('$event.stopPropagation()')
    expect(result.code).toContain('$event.preventDefault()')
    expect(result.code).toContain('return (this.submit)($event)')
  })

  it('compiles component v-model', () => {
    const result = compile(`export default { render(h) { return <MyInput v-model_trim={this.name} /> } }`)
    expect(result.code).toContain('model: { value: this.name')
    expect(result.code).toContain('typeof $$v === "string" ? $$v.trim() : $$v')
  })

  it('compiles native input v-model', () => {
    const result = compile(`export default { render(h) { return <input type="text" v-model_trim={this.name} /> } }`)
    expect(result.code).toContain('domProps: { "value": this.name }')
    expect(result.code).toContain('if ($event.target.composing) return')
    expect(result.code).toContain('this.name = $event.target.value.trim()')
    expect(result.code).toContain('name: "model"')
  })

  it('converts uppercase arrow functions into functional components', () => {
    const result = compile(`export const Badge = props => <span>{props.text}</span>`)
    expect(result.code).toContain('functional: true')
    expect(result.code).toContain('render: (h, props) => h("span", [props.text])')
    expectParsable(result.code)
  })

  it('imports h for setup JSX', () => {
    const result = compile(`export default { setup() { return () => <div /> } }`)
    expect(result.code).toContain('import { h } from "vue"')
    expect(result.code).toContain('return () => h("div")')
  })


  it('does not confuse a nested render(h) parameter with a module h binding', () => {
    const result = compile(`
      const helper = { render(h) { return h('span') } }
      export default { setup() { return () => <div /> } }
    `)
    expect(result.code).toContain('import { h } from "vue"')
  })

  it('preserves TypeScript for the following Oxc stage', () => {
    const result = compile(
      `const value: number = 1; export default { render(h: any) { return <div>{value}</div> } }`,
      {
        id: '/src/example.tsx',
        filename: '/src/example.tsx',
        language: 'tsx'
      }
    )

    expect(result.moduleType).toBe('ts')
    expect(result.code).toContain('value: number')
    expect(result.code).not.toContain('<div>')
    expectParsable(result.code, 'ts')
  })

  it('injects HMR for a direct default component', () => {
    const result = compile(
      `import { defineComponent } from 'vue'; export default defineComponent({ render(){ return <div /> } })`,
      { isDev: true }
    )

    expect(result.code).toContain('const __default__ = defineComponent')
    expect(result.code).toContain('export default __default__')
    expect(result.code).toContain('import.meta.hot.accept')
    expectParsable(result.code)
  })

  it('injects SSR registration', () => {
    const result = compile(
      `import { defineComponent } from 'vue'; export default defineComponent({ render(h){ return <div /> } })`,
      { isSsr: true }
    )

    expect(result.code).toContain('register as __registerVue2Ssr')
    expect(result.code).toContain('__registerVue2Ssr(__default__')
    expectParsable(result.code)
  })
})
