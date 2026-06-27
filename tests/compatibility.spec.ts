import { parseSync, Severity } from 'oxc-parser'
import { describe, expect, it } from 'vitest'
import { compileVue2Jsx, type NormalizedVue2JsxOxcOptions } from '../src'

const defaults: NormalizedVue2JsxOxcOptions = {
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
    ...defaults,
    id: '/project/src/example.jsx',
    filename: '/project/src/example.jsx',
    moduleId: 'src/example.jsx',
    language: 'jsx',
    sourceMap: false,
    isDev: false,
    isSsr: false,
    isVueSfcScript: false,
    ...overrides
  })
}

function expectParsable(code: string, lang: 'js' | 'ts' = 'js') {
  const result = parseSync(`/output.${lang}`, code, {
    lang,
    sourceType: 'module',
    showSemanticErrors: true
  })
  expect(
    result.errors
      .filter(error => error.severity === Severity.Error)
      .map(error => error.message)
  ).toEqual([])
}

describe('Babel Vue 2 JSX compatibility', () => {
  it('resolves component identifiers using the JSX lexical scope', () => {
    const result = compile(`
      function unrelated() { const Card = 1; return Card }
      export default { render(h) { return <Card /> } }
    `)
    expect(result.code).toContain('h("Card")')

    const local = compile(`
      export function render(Card) { return <Card /> }
    `)
    expect(local.code).toContain('h(Card)')
  })

  it('optimizes grouped object spread without the merge runtime', () => {
    const result = compile(`
      export default { render(h) { return <Comp {...{ attrs: this.attrs, on: this.listeners }} /> } }
    `)
    expect(result.code).toContain('attrs: { ...(this.attrs) }')
    expect(result.code).toContain('on: { ...(this.listeners) }')
    expect(result.code).not.toContain('mergeVue2JsxData')
  })

  it('optimizes direct on/attrs object attributes', () => {
    const result = compile(`
      export default { render(h) { return <Comp on={this.listeners} attrs={this.attrs} /> } }
    `)
    expect(result.code).toContain('on: { ...(this.listeners) }')
    expect(result.code).toContain('attrs: { ...(this.attrs) }')
  })

  it('compiles custom directives with argument and modifiers', () => {
    const result = compile(`
      export default { render(h) { return <Comp vMyDirective:field_trim_lazy={this.value} /> } }
    `)
    expect(result.code).toContain('name: "my-directive"')
    expect(result.code).toContain('arg: "field"')
    expect(result.code).toContain('"trim": true')
    expect(result.code).toContain('"lazy": true')
  })

  it('compiles namespaced xlink attributes', () => {
    const result = compile(`export default { render(h) { return <use xlinkHref={this.href} /> } }`)
    expect(result.code).toContain('"xlink:href": this.href')
  })

  it('keeps native/capture/once/passive event prefixes in nativeOn', () => {
    const result = compile(`
      export default { render(h) { return <Comp vOn:click_native_capture_once_passive={this.click} /> } }
    `)
    expect(result.code).toContain('nativeOn: { "&~!click": this.click }')
  })

  it('compiles keyboard and exact event guards', () => {
    const result = compile(`
      export default { render(h) { return <input vOn:keyup_enter_ctrl_exact={this.submit} /> } }
    `)
    expect(result.code).toContain('__checkKeyCodes($event.keyCode, "enter"')
    expect(result.code).toContain('!$event.ctrlKey')
    expect(result.code).toContain('$event.shiftKey || $event.altKey || $event.metaKey')
  })

  it('compiles checkbox v-model including true/false values', () => {
    const result = compile(`
      export default { render(h) { return <input type="checkbox" value={this.item} true-value="yes" false-value="no" v-model={this.value} /> } }
    `)
    expect(result.code).toContain('Array.isArray(this.value)')
    expect(result.code).toContain('__looseIndexOf(this.value, this.item)')
    expect(result.code).toContain('$$el.checked ? "yes" : "no"')
    expect(result.code).toContain('name: "model"')
  })

  it('compiles radio and select v-model', () => {
    const radio = compile(`
      export default { render(h) { return <input type="radio" value={this.item} v-model_number={this.value} /> } }
    `)
    expect(radio.code).toContain('__looseEqual(this.value, __toNumber(this.item))')

    const select = compile(`
      export default { render(h) { return <select v-model_number={this.value}><option value="1">one</option></select> } }
    `)
    expect(select.code).toContain('Array.prototype.filter.call')
    expect(select.code).toContain("'_value' in o ? o._value : o.value")
  })

  it('uses this.$set for non-this member model assignments', () => {
    const result = compile(`
      export default { render(h) { return <MyInput v-model={this.form.name} /> } }
    `)
    expect(result.code).toContain('this.$set(this.form, "name", $$v)')
  })

  it('rejects this inside block-bodied setup functions', () => {
    expect(() => compile(`
      export default {
        setup() {
          return () => <button onClick={() => this.$emit('ping')} />
        }
      }
    `)).toThrow('`this` is undefined inside Vue 2.7 setup()')
  })

  it('rejects this inside expression-bodied setup functions', () => {
    expect(() => compile(`
      export default { setup: () => <button onClick={() => this.$emit('ping')} /> }
    `)).toThrow('`this` is undefined inside Vue 2.7 setup()')
  })


  it('allows this owned by a nested normal function inside setup', () => {
    const result = compile(`
      export default {
        setup() {
          function read() { return this && this.value }
          return () => <div>{read.call({ value: 1 })}</div>
        }
      }
    `)
    expect(result.code).toContain('return this && this.value')
    expectParsable(result.code)
  })

  it('captures the setup render instance for generated v-model helpers', () => {
    const result = compile(`
      import { reactive } from 'vue'
      export default {
        setup(_props, { emit }) {
          const form = reactive({ name: '' })
          return () => <MyInput v-model={form.name} onClick={() => emit('ping')} />
        }
      }
    `)
    expect(result.code).toContain('getCurrentInstance')
    expect(result.code).toContain('const __currentInstance = getCurrentInstance().proxy')
    expect(result.code).toContain('__currentInstance.$set(form, "name", $$v)')
    expect(result.code).toContain("emit('ping')")
    expect(result.code).not.toContain('this.')
    expectParsable(result.code)
  })

  it('uses local inject-h when Composition API mode is disabled', () => {
    const result = compile(
      `export default { render() { return <div /> }, methods: { cell() { return <span /> } } }`,
      { compositionAPI: false }
    )
    expect(result.code).toContain('const h = arguments[0]')
    expect(result.code).toContain('const h = this.$createElement')
    expect(result.code).not.toContain('from "vue"')
  })

  it('does not convert arrows whose JSX only exists inside an object method', () => {
    const result = compile(`
      const Factory = () => ({ render() { return <div /> } })
      export { Factory }
    `)
    expect(result.code).not.toContain('functional: true')
  })

  it('supports fragments in array mode and errors by default', () => {
    const result = compile(`export default { render(h) { return <><span />text</> } }`, {
      fragment: 'array'
    })
    expect(result.code).toContain('[h("span"), "text"]')

    expect(() => compile(`export default { render(h) { return <><span /></> } }`))
      .toThrow('Vue 2 does not support JSX fragments')
  })

  it('supports nested JSX in attribute expressions', () => {
    const result = compile(`
      export default { render(h) { return <Comp scopedSlots={{ default: () => <span>slot</span> }} /> } }
    `)
    expect(result.code).toContain('default: () => h("span", ["slot"])')
    expectParsable(result.code)
  })

  it('supports JSX spread children', () => {
    const result = compile(`export default { render(h) { return <div>{...this.nodes}</div> } }`)
    expect(result.code).toContain('[...(this.nodes)]')
  })

  it('injects named-export HMR metadata', () => {
    const result = compile(`
      import { defineComponent } from 'vue'
      export const Card = defineComponent({ render(h) { return <div /> } })
    `, { isDev: true })
    expect(result.code).toContain('Card.__hmrId =')
    expect(result.code).toContain('mod["Card"]')
    expectParsable(result.code)
  })

  it('uses root-relative module IDs for SSR registration', () => {
    const result = compile(`
      import { defineComponent } from 'vue'
      export default defineComponent({ render(h) { return <div /> } })
    `, { isSsr: true, moduleId: 'src/pages/Home.tsx' })
    expect(result.code).toContain('"src/pages/Home.tsx"')
  })
})
