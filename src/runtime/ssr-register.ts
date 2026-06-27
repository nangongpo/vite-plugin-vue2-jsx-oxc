export const PUBLIC_SSR_RUNTIME_ID = 'virtual:vue2-jsx-oxc/ssr-register'
export const RESOLVED_SSR_RUNTIME_ID = '\0vue2-jsx-oxc/ssr-register'

export const ssrRuntimeCode = `
export function register(component, filename) {
  if (!component) return component
  const options = typeof component === 'function' ? component.options : component
  if (!options) return component

  const created = options.created
  options.created = function vue2JsxSsrRegister() {
    const ssrContext = this.$ssrContext
    if (ssrContext) {
      ;(ssrContext.modules || (ssrContext.modules = new Set())).add(filename)
    }
    if (created) {
      if (Array.isArray(created)) {
        for (const hook of created) hook.call(this)
      } else {
        created.call(this)
      }
    }
  }

  return component
}
`
