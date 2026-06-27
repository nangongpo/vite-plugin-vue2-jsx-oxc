/** @vitest-environment jsdom */

import Vue from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import {
  compileVue2Jsx,
  type NormalizedVue2JsxOxcOptions
} from '../src'

const normalized: NormalizedVue2JsxOxcOptions = {
  injectH: true,
  functional: true,
  vModel: true,
  vOn: true,
  compositionAPI: false,
  hmr: false,
  ssr: false,
  fragment: 'error',
  dependencyScan: true
}

function compileComponent(source: string): Record<string, unknown> {
  const result = compileVue2Jsx(source, {
    ...normalized,
    id: '/src/DirectiveRuntime.jsx',
    filename: '/src/DirectiveRuntime.jsx',
    language: 'jsx',
    sourceMap: false,
    isDev: false,
    isSsr: false,
    isVueSfcScript: false,
    moduleId: 'src/DirectiveRuntime.jsx'
  })

  expect(result.code).toContain('directives: [')

  const executable = result.code.replace(/export default\s+/, 'return ')
  return Function(executable)() as Record<string, unknown>
}

Vue.config.productionTip = false
Vue.config.devtools = false

afterEach(() => {
  document.body.innerHTML = ''
})

describe('custom directive runtime integration', () => {
  it('runs directives passed through an explicit VNodeData spread', async () => {
    const component = compileComponent(`
      export default {
        directives: {
          mark: {
            inserted(element, binding) {
              element.setAttribute('data-value', String(binding.value))
              element.setAttribute('data-modifier', String(binding.modifiers.abc))
            }
          }
        },
        render(h) {
          const directives = [
            { name: 'mark', value: 123, modifiers: { abc: true } }
          ]
          return <div {...{ directives }}>directive spread</div>
        }
      }
    `)

    const mountPoint = document.createElement('div')
    document.body.appendChild(mountPoint)

    const vm = new Vue({
      render: h => h(component as never)
    }).$mount(mountPoint)

    await Vue.nextTick()

    const element = document.querySelector('[data-value]')
    expect(element?.getAttribute('data-value')).toBe('123')
    expect(element?.getAttribute('data-modifier')).toBe('true')

    vm.$destroy()
  })

  it('runs the local vFocus inserted hook and focuses the mounted input', async () => {
    const component = compileComponent(`
      export default {
        directives: {
          focus: {
            inserted(element) {
              element.setAttribute('data-focus-inserted', 'true')
              element.focus()
            }
          }
        },
        render(h) {
          return <input vFocus={true} value="directive runtime" />
        }
      }
    `)

    const mountPoint = document.createElement('div')
    document.body.appendChild(mountPoint)

    const vm = new Vue({
      render: h => h(component as never)
    }).$mount(mountPoint)

    await Vue.nextTick()

    const input = document.querySelector('input')
    expect(input).not.toBeNull()
    expect(input?.getAttribute('data-focus-inserted')).toBe('true')
    expect(document.activeElement).toBe(input)

    vm.$destroy()
  })
})
