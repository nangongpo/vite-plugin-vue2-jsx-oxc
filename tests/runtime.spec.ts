import { describe, expect, it, vi } from 'vitest'
import { hmrRuntimeCode } from '../src/runtime/hmr-runtime'
import { runtimeCode } from '../src/runtime/merge-props'
import { ssrRuntimeCode } from '../src/runtime/ssr-register'

function loadRuntime<T>(code: string, names: string[]): T {
  const executable = code
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
  return new Function(`${executable}\nreturn { ${names.join(', ')} };`)() as T
}

describe('virtual runtimes', () => {
  it('provides Vue 2 model and key helpers without a component instance', () => {
    const { toNumber, looseEqual, looseIndexOf, checkKeyCodes } = loadRuntime<{
      toNumber: (value: unknown) => unknown
      looseEqual: (a: unknown, b: unknown) => boolean
      looseIndexOf: (values: unknown[], value: unknown) => number
      checkKeyCodes: (
        eventKeyCode: unknown,
        key: string,
        builtInKeyCode: unknown,
        eventKey: unknown,
        builtInKeyName: unknown
      ) => boolean
    }>(runtimeCode, ['toNumber', 'looseEqual', 'looseIndexOf', 'checkKeyCodes'])

    expect(toNumber('12.5')).toBe(12.5)
    expect(toNumber('value')).toBe('value')
    expect(looseEqual({ id: 1 }, { id: 1 })).toBe(true)
    expect(looseIndexOf([{ id: 1 }, { id: 2 }], { id: 2 })).toBe(1)
    expect(checkKeyCodes(13, 'enter', 13, 'Enter', 'Enter')).toBe(false)
    expect(checkKeyCodes(27, 'enter', 13, 'Escape', 'Enter')).toBe(true)
  })

  it('merges Vue 2 JSX data using Babel-compatible rules', () => {
    const { mergeVue2JsxData } = loadRuntime<{
      mergeVue2JsxData: (items: unknown[]) => Record<string, any>
    }>(runtimeCode, ['mergeVue2JsxData'])

    const first = vi.fn()
    const second = vi.fn()
    const hookA = vi.fn()
    const hookB = vi.fn()

    const result = mergeVue2JsxData([
      {
        attrs: { id: 'a' },
        class: 'first',
        on: { click: first },
        hook: { insert: hookA },
        directives: [{ name: 'first', value: 1 }]
      },
      {
        attrs: { title: 'title' },
        class: ['second'],
        on: { click: second },
        hook: { insert: hookB },
        directives: [[{ name: 'second', value: 2 }], null]
      }
    ])

    expect(result.attrs).toEqual({ id: 'a', title: 'title' })
    expect(result.class).toEqual(['first', 'second'])
    expect(result.on.click).toEqual([first, second])
    expect(result.directives).toEqual([
      { name: 'first', value: 1 },
      { name: 'second', value: 2 }
    ])

    result.hook.insert.call(result, 1)
    expect(hookA).toHaveBeenCalledWith(1)
    expect(hookB).toHaveBeenCalledWith(1)
  })

  it('registers SSR modules and preserves created hooks', () => {
    const { register } = loadRuntime<{
      register: (component: any, filename: string) => any
    }>(ssrRuntimeCode, ['register'])

    const createdA = vi.fn()
    const createdB = vi.fn()
    const component = { created: [createdA, createdB] }
    register(component, 'src/Card.tsx')

    const context = { modules: new Set<string>() }
    const instance = { $ssrContext: context }
    ;(component.created as any).call(instance)

    expect([...context.modules]).toEqual(['src/Card.tsx'])
    expect(createdA).toHaveBeenCalledOnce()
    expect(createdB).toHaveBeenCalledOnce()
  })

  it('creates and reloads Vue 2 HMR component records', () => {
    const { createRecord, reload, isRecorded } = loadRuntime<{
      createRecord: (id: string, component: any) => boolean
      reload: (id: string, component: any) => void
      isRecorded: (id: string) => boolean
    }>(hmrRuntimeCode, ['createRecord', 'reload', 'isRecorded'])

    const original = { render: () => 'old' }
    expect(createRecord('card', original)).toBe(true)
    expect(isRecorded('card')).toBe(true)
    expect(createRecord('card', original)).toBe(false)

    const nextRender = () => 'new'
    reload('card', { render: nextRender })
    expect(original.render).toBe(nextRender)
  })
})
