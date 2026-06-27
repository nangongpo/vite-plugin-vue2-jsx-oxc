import type { FilterPattern, NormalizedVue2JsxOxcOptions } from './options'

const DEFAULT_INCLUDE = /\.[jt]sx$/
const DEFAULT_EXCLUDE = /node_modules/

export function cleanUrl(id: string): string {
  return id.replace(/[?#].*$/, '')
}

export function isVueScriptJsxRequest(id: string): boolean {
  if (!id.includes('?vue&type=script')) return false

  const query = id.slice(id.indexOf('?') + 1)
  return /(?:^|&)lang(?:\.|=)(?:jsx|tsx)(?:&|$)/.test(query)
}

export function resolveLanguage(id: string): 'jsx' | 'tsx' {
  const filename = cleanUrl(id)
  const query = id.includes('?') ? id.slice(id.indexOf('?') + 1) : ''

  return filename.endsWith('.tsx') || /(?:^|&)lang(?:\.|=)tsx(?:&|$)/.test(query)
    ? 'tsx'
    : 'jsx'
}

export function createVue2JsxFilter(
  options: NormalizedVue2JsxOxcOptions
): (id: string) => boolean {
  const include = options.include ?? DEFAULT_INCLUDE
  const exclude = options.exclude ?? DEFAULT_EXCLUDE

  return (id: string) => {
    const filename = cleanUrl(id)
    if (isVueScriptJsxRequest(id)) return !matchesPattern(filename, exclude)
    return (matchesPattern(id, include) || matchesPattern(filename, include)) &&
      !matchesPattern(filename, exclude)
  }
}

function matchesPattern(id: string, pattern: FilterPattern | undefined): boolean {
  if (!pattern) return false
  if (typeof pattern === 'string') return globToRegExp(pattern).test(id)
  if (typeof pattern === 'function') return pattern(id)
  if (pattern instanceof RegExp) {
    pattern.lastIndex = 0
    return pattern.test(id)
  }
  return pattern.some(item => matchesPattern(id, item))
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
      source += char.replace(/[|\{}()[\]^$+?.]/g, '\\$&')
    }
  }

  return new RegExp(`${source}$`)
}
