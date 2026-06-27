import type { CompilerContext } from '../compiler/context'
import type { ComponentExportAnalysis } from '../hmr/analyze'

export function injectSsrCode(
  context: CompilerContext,
  analysis: ComponentExportAnalysis
): void {
  const locals = [...new Set(analysis.components.map(component => component.local))]
  if (locals.length === 0) return

  const register = context.requestNamedImport(
    'virtual:vue2-jsx-oxc/ssr-register',
    'register',
    '__registerVue2Ssr'
  )

  context.s.append(
    `\n${locals
      .map(local => `${register}(${local}, ${JSON.stringify(context.options.moduleId)});`)
      .join('\n')}\n`
  )
}
