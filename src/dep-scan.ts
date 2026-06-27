import { compileVue2Jsx } from './compiler'
import { cleanUrl } from './filter'
import type { NormalizedVue2JsxOxcOptions } from './options'

const VIRTUAL_MODULE_PREFIX = 'virtual-module:'
const VUE_SCAN_SCRIPT_RE = /\.vue\?id=\d+$/

/**
 * Vite 8 dependency scanning runs in an isolated Rolldown pipeline and does
 * not execute normal Vite transform hooks. Without this plugin, Rolldown's
 * scanner treats JSX/TSX as React automatic-runtime code and injects
 * react/jsx-runtime or react/jsx-dev-runtime.
 */
export interface Vue2JsxDependencyScanTransformResult {
  code: string
  moduleType: 'js' | 'ts'
}

/**
 * Minimal structural type required by Vite 8's optimizeDeps Rolldown pipeline.
 * Keeping this type local avoids making `rolldown` a direct dependency.
 */
export interface Vue2JsxDependencyScanPlugin {
  name: string
  transform(
    code: string,
    id: string
  ): Vue2JsxDependencyScanTransformResult | null
}

export function createVue2JsxDependencyScanPlugin(
  options: NormalizedVue2JsxOxcOptions
): Vue2JsxDependencyScanPlugin {
  return {
    name: 'vite-plugin-vue2-jsx-oxc:dep-scan',

    transform(code, id) {
      const request = resolveDependencyScanRequest(id)
      if (!request || isExcluded(request.filename, options.exclude)) {
        return null
      }

      const result = compileVue2Jsx(code, {
        ...options,
        id,
        filename: request.filename,
        language: request.language,
        sourceMap: false,
        isDev: false,
        isSsr: false,
        isVueSfcScript: request.isVueSfcScript,
        moduleId: request.filename,
        // Dependency scanning only needs import discovery. Component HMR and
        // SSR registration belong to the regular Vite transform pipeline.
        hmr: false,
        ssr: false
      })

      return {
        code: result.code,
        moduleType: result.moduleType
      }
    }
  }
}

interface DependencyScanRequest {
  filename: string
  language: 'jsx' | 'tsx'
  isVueSfcScript: boolean
}

function resolveDependencyScanRequest(
  id: string
): DependencyScanRequest | null {
  const normalizedId = id.startsWith(VIRTUAL_MODULE_PREFIX)
    ? id.slice(VIRTUAL_MODULE_PREFIX.length)
    : id

  if (VUE_SCAN_SCRIPT_RE.test(normalizedId)) {
    return {
      filename: normalizedId.replace(/\?id=\d+$/, ''),
      // The scanner removes the original SFC lang attribute from the virtual
      // request id. TSX is a safe superset for both JSX and TSX scripts.
      language: 'tsx',
      isVueSfcScript: true
    }
  }

  const filename = cleanUrl(normalizedId)

  if (filename.endsWith('.tsx')) {
    return {
      filename,
      language: 'tsx',
      isVueSfcScript: false
    }
  }

  if (filename.endsWith('.jsx')) {
    return {
      filename,
      language: 'jsx',
      isVueSfcScript: false
    }
  }

  return null
}

function isExcluded(
  id: string,
  pattern: NormalizedVue2JsxOxcOptions['exclude']
): boolean {
  if (!pattern) return false
  if (typeof pattern === 'string') return globToRegExp(pattern).test(id)
  if (typeof pattern === 'function') return pattern(id)
  if (pattern instanceof RegExp) {
    pattern.lastIndex = 0
    return pattern.test(id)
  }
  return pattern.some(item => isExcluded(id, item))
}

function globToRegExp(glob: string): RegExp {
  let source = '^'

  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index]

    if (char === '*') {
      const next = glob[index + 1]
      if (next === '*') {
        source += '.*'
        index += 1
      } else {
        source += '[^/]*'
      }
    } else if (char === '?') {
      source += '.'
    } else {
      source += char.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
    }
  }

  return new RegExp(`${source}$`)
}
