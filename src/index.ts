import path from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'
import { normalizePath } from 'vite'
import { compileVue2Jsx } from './compiler'
import { createVue2JsxDependencyScanPlugin } from './dep-scan'
import {
  cleanUrl,
  createVue2JsxFilter,
  isVueScriptJsxRequest,
  resolveLanguage
} from './filter'
import {
  normalizeOptions,
  type Vue2JsxOxcOptions
} from './options'
import {
  PUBLIC_HMR_RUNTIME_ID,
  RESOLVED_HMR_RUNTIME_ID,
  hmrRuntimeCode
} from './runtime/hmr-runtime'
import {
  PUBLIC_RUNTIME_ID,
  RESOLVED_RUNTIME_ID,
  runtimeCode
} from './runtime/merge-props'
import {
  PUBLIC_SSR_RUNTIME_ID,
  RESOLVED_SSR_RUNTIME_ID,
  ssrRuntimeCode
} from './runtime/ssr-register'

export type {
  CompositionAPIOption,
  NormalizedVue2JsxOxcOptions,
  Vue2JsxOxcOptions
} from './options'
export { compileVue2Jsx } from './compiler'

export default function vue2JsxOxc(
  userOptions: Vue2JsxOxcOptions = {}
): Plugin {
  const options = normalizeOptions(userOptions)
  const filter = createVue2JsxFilter(options)
  let config: ResolvedConfig

  return {
    name: 'vite:vue2-jsx-oxc',
    enforce: 'pre',

    config() {
      if (!options.dependencyScan) return null

      return {
        optimizeDeps: {
          rolldownOptions: {
            plugins: [createVue2JsxDependencyScanPlugin(options)]
          }
        }
      }
    },

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    resolveId(id) {
      if (id === PUBLIC_RUNTIME_ID) return RESOLVED_RUNTIME_ID
      if (id === PUBLIC_HMR_RUNTIME_ID) return RESOLVED_HMR_RUNTIME_ID
      if (id === PUBLIC_SSR_RUNTIME_ID) return RESOLVED_SSR_RUNTIME_ID
      return null
    },

    load(id) {
      if (id === RESOLVED_RUNTIME_ID) return runtimeCode
      if (id === RESOLVED_HMR_RUNTIME_ID) return hmrRuntimeCode
      if (id === RESOLVED_SSR_RUNTIME_ID) return ssrRuntimeCode
      return null
    },

    transform(code, id, transformOptions) {
      if (!filter(id)) return null

      const language = resolveLanguage(id)
      const filename = normalizePath(cleanUrl(id))
      const result = compileVue2Jsx(code, {
        ...options,
        id: normalizePath(id),
        filename,
        language,
        sourceMap: config.command === 'serve' || Boolean(config.build.sourcemap),
        isDev: config.command === 'serve' && !config.isProduction,
        isSsr: transformOptions?.ssr === true,
        isVueSfcScript: isVueScriptJsxRequest(id),
        moduleId: normalizePath(path.relative(config.root, filename))
      })

      return {
        code: result.code,
        map: result.map,
        moduleType: result.moduleType
      }
    }
  }
}
