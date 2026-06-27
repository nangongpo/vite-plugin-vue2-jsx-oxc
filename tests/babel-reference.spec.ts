import { transformSync } from '@babel/core'
import vue2JsxPreset from '@vue/babel-preset-jsx'
import { describe, expect, it } from 'vitest'
import { compileVue2Jsx, type NormalizedVue2JsxOxcOptions } from '../src'

const options: NormalizedVue2JsxOxcOptions = {
  injectH: false,
  functional: false,
  vModel: false,
  vOn: false,
  compositionAPI: false,
  hmr: false,
  ssr: false,
  fragment: 'error',
  dependencyScan: true
}

function compileWithOxc(code: string): string {
  return compileVue2Jsx(code, {
    ...options,
    id: '/src/reference.jsx',
    filename: '/src/reference.jsx',
    moduleId: 'src/reference.jsx',
    language: 'jsx',
    sourceMap: false,
    isDev: false,
    isSsr: false,
    isVueSfcScript: false
  }).code
}

function compileWithBabel(code: string): string {
  const result = transformSync(code, {
    babelrc: false,
    configFile: false,
    presets: [[vue2JsxPreset, options]]
  })
  if (!result?.code) throw new Error('Babel reference transform returned no code')
  return result.code
}

function expectBothContain(code: string, fragments: string[]): void {
  const babel = compileWithBabel(code)
  const oxc = compileWithOxc(code)

  for (const fragment of fragments) {
    expect(babel, `Babel output should contain ${fragment}`).toContain(fragment)
    expect(oxc, `Oxc output should contain ${fragment}`).toContain(fragment)
  }
}

describe('official @vue/babel-preset-jsx reference behavior', () => {
  it('supports the documented Vue 2 VNodeData prefixes', () => {
    const code = `
      export default {
        render(h) {
          return <Comp
            propsValue={this.value}
            attrsTitle="title"
            domPropsInnerHTML={this.html}
            onClick={this.click}
            nativeOnDblclick={this.dblclick}
            hookInsert={this.insert}
            refInFor
          />
        }
      }
    `

    expectBothContain(code, [
      'props',
      '"value"',
      'attrs',
      '"title"',
      'domProps',
      '"innerHTML"',
      'on',
      '"click"',
      'nativeOn',
      '"dblclick"',
      'hook',
      '"insert"',
      'refInFor'
    ])
  })

  it('places direct component attributes in attrs for Vue runtime prop extraction', () => {
    const code = `
      import ModelInput from './ModelInput'
      export default {
        render(h) {
          return <ModelInput value={this.value} label="Name" placeholder="Input" />
        }
      }
    `

    const babel = compileWithBabel(code)
    const oxc = compileWithOxc(code)

    expect(babel).toContain('"attrs"')
    expect(babel).toContain('"value"')
    expect(babel).toContain('"label"')
    expect(babel).toContain('"placeholder"')
    expect(oxc).toContain('attrs:')
    expect(oxc).toContain('"value": this.value')
    expect(oxc).toContain('"label": "Name"')
    expect(oxc).toContain('"placeholder": "Input"')
  })

  it('requires explicit data for hook:mounted component events', () => {
    const code = `
      export default {
        render(h) {
          return <Comp onHook:mounted={this.mounted} />
        }
      }
    `

    const babel = compileWithBabel(code)
    const oxc = compileWithOxc(code)

    expect(babel).toContain('"hook"')
    expect(oxc).toContain('"hook"')
    expect(babel).not.toContain('"hook:mounted"')
    expect(oxc).not.toContain('"hook:mounted"')
  })

  it('uses lexical binding analysis for PascalCase component tags', () => {
    const bound = `
      import Card from './Card'
      export default { render(h) { return <Card /> } }
    `
    const unbound = `export default { render(h) { return <Card /> } }`

    expect(compileWithBabel(bound)).toContain('h(Card)')
    expect(compileWithOxc(bound)).toContain('h(Card)')
    expect(compileWithBabel(unbound)).toContain('h("Card")')
    expect(compileWithOxc(unbound)).toContain('h("Card")')
  })
})
