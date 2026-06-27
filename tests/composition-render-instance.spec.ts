import { transformSync } from '@babel/core'
import vue2JsxPreset from '@vue/babel-preset-jsx'
import { parseSync, Severity } from 'oxc-parser'
import { describe, expect, it } from 'vitest'
import { compileVue2Jsx, type NormalizedVue2JsxOxcOptions } from '../src'

const defaults: NormalizedVue2JsxOxcOptions = {
  injectH: true,
  functional: true,
  vModel: true,
  vOn: true,
  compositionAPI: 'native',
  hmr: false,
  ssr: false,
  fragment: 'error',
  dependencyScan: true
}

function compile(code: string): string {
  return compileVue2Jsx(code, {
    ...defaults,
    id: '/src/composition.jsx',
    filename: '/src/composition.jsx',
    moduleId: 'src/composition.jsx',
    language: 'jsx',
    sourceMap: false,
    isDev: false,
    isSsr: false,
    isVueSfcScript: false
  }).code
}

function babel(code: string): string {
  const result = transformSync(code, {
    babelrc: false,
    configFile: false,
    presets: [[vue2JsxPreset, { compositionAPI: 'native' }]]
  })
  if (!result?.code) throw new Error('Babel returned no code')
  return result.code
}

function expectParsable(code: string): void {
  const result = parseSync('/output.js', code, {
    lang: 'js',
    sourceType: 'module',
    showSemanticErrors: true
  })
  expect(
    result.errors
      .filter(error => error.severity === Severity.Error)
      .map(error => error.message)
  ).toEqual([])
}

describe('@vue/babel-sugar-composition-api-render-instance alignment', () => {
  it('captures getCurrentInstance only when generated v-model code needs it', () => {
    const simple = compile(`export default { setup() { return () => <div /> } }`)
    expect(simple).not.toContain('getCurrentInstance')

    const model = compile(`
      import { reactive } from 'vue'
      export default {
        setup() {
          const form = reactive({ name: '' })
          return () => <Comp vModel={form.name} />
        }
      }
    `)

    expect(model).toContain('getCurrentInstance')
    expect(model).toContain('const __currentInstance = getCurrentInstance().proxy')
    expect(model).toContain('__currentInstance.$set(form, "name", $$v)')
    expectParsable(model)
  })

  it('uses the captured Vue render helpers for v-model modifiers', () => {
    const result = compile(`
      import { reactive } from 'vue'
      export default {
        setup() {
          const form = reactive({ amount: 0, selected: [] })
          return () => <div>
            <Comp vModel_number={form.amount} />
            <input type="checkbox" value="a" vModel={form.selected} />
          </div>
        }
      }
    `)

    expect(result).toContain('__currentInstance._n($$v)')
    expect(result).toContain('__currentInstance._i(form.selected, "a")')
    expect(result).toContain('__currentInstance.$set(form, "amount",')
    expect(result).toContain('__currentInstance.$set(form, "selected",')
    expect(result).not.toContain('__toNumber')
    expect(result).not.toContain('__looseIndexOf')
    expectParsable(result)
  })

  it('uses the captured _k helper for v-on key filters inside setup', () => {
    const result = compile(`
      const submit = () => {}
      export default {
        setup() {
          return () => <input vOn:keyup_enter={submit} />
        }
      }
    `)

    expect(result).toContain('const __currentInstance = getCurrentInstance().proxy')
    expect(result).toContain('__currentInstance._k($event.keyCode, "enter"')
    expect(result).not.toContain('__checkKeyCodes')
    expectParsable(result)
  })

  it('keeps source-level setup this invalid instead of treating it as generated sugar', () => {
    expect(() => compile(`
      export default {
        setup() {
          return () => <button onClick={() => this.$emit('ping')} />
        }
      }
    `)).toThrow('`this` is undefined inside Vue 2.7 setup()')
  })

  it('matches the legacy sugar helper selection and adapts Vue 2.7 through proxy', () => {
    const source = `
      export default {
        setup: function () {
          const form = {}
          return () => <Comp vModel_number={form.amount} />
        }
      }
    `
    const legacy = babel(source)
    const current = compile(source)

    expect(legacy).toContain('const __currentInstance = getCurrentInstance()')
    expect(legacy).toContain('__currentInstance.$set(form, "amount"')
    expect(legacy).toContain('__currentInstance._n($$v)')

    expect(current).toContain('const __currentInstance = getCurrentInstance().proxy')
    expect(current).toContain('__currentInstance.$set(form, "amount"')
    expect(current).toContain('__currentInstance._n($$v)')
  })

  it('supports expression-bodied setup arrows when generated helpers are required', () => {
    const result = compile(`
      const form = { name: '' }
      export default { setup: () => () => <Comp vModel={form.name} /> }
    `)

    expect(result).toContain('setup: () => { const __currentInstance = getCurrentInstance().proxy; return () => h("Comp"')
    expect(result).toContain('__currentInstance.$set(form, "name", $$v)')
    expectParsable(result)
  })
})
