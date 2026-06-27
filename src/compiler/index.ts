import MagicString from 'magic-string'
import { parseSync, Severity } from 'oxc-parser'
import type { NormalizedVue2JsxOxcOptions } from '../options'
import { analyzeComponentExports, type ComponentExportAnalysis } from '../hmr/analyze'
import { injectHmrCode } from '../hmr/inject'
import { injectSsrCode } from '../ssr/inject'
import type { AstNode } from './ast'
import { finalizeCompositionAPI, transformCompositionAPI } from './composition-api'
import { CompilerContext } from './context'
import { transformFunctionalComponents } from './functional'
import { transformInjectH } from './inject-h'
import { compileJsxNode } from './jsx-element'
import { collectRootJsxNodes } from './traverse'

export interface CompileOptions extends NormalizedVue2JsxOxcOptions {
  id: string
  filename: string
  language: 'jsx' | 'tsx'
  sourceMap: boolean
  isDev: boolean
  isSsr: boolean
  isVueSfcScript: boolean
  moduleId: string
}

export interface CompileResult {
  code: string
  map: ReturnType<MagicString['generateMap']> | null
  moduleType: 'js' | 'ts'
}

export function compileVue2Jsx(
  code: string,
  options: CompileOptions
): CompileResult {
  const parsed = parseSync(options.filename, code, {
    lang: options.language,
    sourceType: 'module',
    preserveParens: true,
    showSemanticErrors: true
  })

  const errors = parsed.errors.filter(error => error.severity === Severity.Error)
  if (errors.length > 0) {
    const details = errors
      .map(error => error.codeframe || error.message)
      .join('\n\n')
    throw new Error(
      `[vite-plugin-vue2-jsx-oxc] Failed to parse ${options.filename}\n${details}`
    )
  }

  const magicString = new MagicString(code)
  const context = new CompilerContext({
    code,
    ast: parsed.program,
    magicString,
    options
  })
  context.setJsxCompiler(compileJsxNode)

  const needsHmr = options.isDev && options.hmr && !options.isVueSfcScript
  const needsSsr = options.isSsr && options.ssr
  const componentAnalysis: ComponentExportAnalysis =
    needsHmr || needsSsr
      ? analyzeComponentExports(context)
      : { components: [] }

  transformFunctionalComponents(context)
  transformCompositionAPI(context)
  transformInjectH(context)

  const roots = collectRootJsxNodes(
    parsed.program as unknown as AstNode,
    context.coveredRanges
  )

  for (const node of roots) {
    context.overwrite(node, compileJsxNode(node, context))
  }

  finalizeCompositionAPI(context)

  if (needsHmr) injectHmrCode(context, componentAnalysis)
  if (needsSsr) injectSsrCode(context, componentAnalysis)

  context.injectImports()

  return {
    code: magicString.toString(),
    map: options.sourceMap
      ? magicString.generateMap({
          source: options.filename,
          includeContent: true,
          hires: true
        })
      : null,
    moduleType: options.language === 'tsx' ? 'ts' : 'js'
  }
}
