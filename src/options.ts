export type FilterPattern =
  | string
  | RegExp
  | ((id: string) => boolean)
  | readonly FilterPattern[]

export type CompositionAPIOption =
  | false
  | 'native'
  | 'plugin'
  | 'vue-demi'
  | { importSource: string }

export interface Vue2JsxOxcOptions {
  include?: FilterPattern
  exclude?: FilterPattern
  injectH?: boolean
  functional?: boolean
  vModel?: boolean
  vOn?: boolean
  compositionAPI?: CompositionAPIOption
  hmr?: boolean
  ssr?: boolean
  fragment?: 'error' | 'array'
  /** Enable the Vite 8 dependency-scanner bridge. Default: true. */
  dependencyScan?: boolean
}

export interface NormalizedVue2JsxOxcOptions {
  include?: FilterPattern
  exclude?: FilterPattern
  injectH: boolean
  functional: boolean
  vModel: boolean
  vOn: boolean
  compositionAPI: CompositionAPIOption
  hmr: boolean
  ssr: boolean
  fragment: 'error' | 'array'
  dependencyScan: boolean
}

export function normalizeOptions(
  options: Vue2JsxOxcOptions = {}
): NormalizedVue2JsxOxcOptions {
  return {
    include: options.include,
    exclude: options.exclude,
    injectH: options.injectH ?? true,
    functional: options.functional ?? true,
    vModel: options.vModel ?? true,
    vOn: options.vOn ?? true,
    compositionAPI: options.compositionAPI ?? 'native',
    hmr: options.hmr ?? true,
    ssr: options.ssr ?? true,
    fragment: options.fragment ?? 'error',
    dependencyScan: options.dependencyScan ?? true
  }
}

export function resolveCompositionImportSource(
  option: CompositionAPIOption
): string | null {
  if (option === false) return null
  if (option === 'native') return 'vue'
  if (option === 'plugin') return '@vue/composition-api'
  if (option === 'vue-demi') return 'vue-demi'
  return option.importSource
}
