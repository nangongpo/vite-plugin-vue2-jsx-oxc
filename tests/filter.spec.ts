import { describe, expect, it } from 'vitest'
import { createVue2JsxFilter, isVueScriptJsxRequest, resolveLanguage } from '../src/filter'
import { normalizeOptions } from '../src/options'

describe('request filter', () => {
  it('matches JSX, TSX and Vue script subrequests', () => {
    const filter = createVue2JsxFilter(normalizeOptions())
    expect(filter('/src/App.jsx')).toBe(true)
    expect(filter('/src/App.tsx')).toBe(true)
    expect(filter('/src/App.vue?vue&type=script&lang.jsx')).toBe(true)
    expect(filter('/src/App.vue?vue&type=script&lang.tsx')).toBe(true)
    expect(filter('/src/App.ts')).toBe(false)
    expect(filter('/node_modules/pkg/index.jsx')).toBe(false)
  })

  it('resolves request languages', () => {
    expect(resolveLanguage('/src/App.tsx')).toBe('tsx')
    expect(resolveLanguage('/src/App.vue?vue&type=script&lang.tsx')).toBe('tsx')
    expect(resolveLanguage('/src/App.jsx')).toBe('jsx')
    expect(isVueScriptJsxRequest('/src/App.vue?vue&type=script&lang.jsx')).toBe(true)
  })
})
