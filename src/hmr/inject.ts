import type { CompilerContext } from '../compiler/context'
import type { ComponentExportAnalysis } from './analyze'

export function injectHmrCode(
  context: CompilerContext,
  analysis: ComponentExportAnalysis
): void {
  if (analysis.components.length === 0) return

  const createRecord = context.requestNamedImport(
    'virtual:vue2-jsx-oxc/hmr-runtime',
    'createRecord',
    '__createRecord'
  )
  const reload = context.requestNamedImport(
    'virtual:vue2-jsx-oxc/hmr-runtime',
    'reload',
    '__reload'
  )

  const registrations = analysis.components
    .map(component => `${component.local}.__hmrId = ${JSON.stringify(component.id)}; ${createRecord}(${JSON.stringify(component.id)}, ${component.local});`)
    .join('\n')

  const updates = analysis.components
    .map(component => {
      const access = component.exported === 'default'
        ? 'mod.default'
        : `mod[${JSON.stringify(component.exported)}]`
      return `const next_${component.id} = ${access}; if (next_${component.id}) ${reload}(${JSON.stringify(component.id)}, next_${component.id});`
    })
    .join('\n')

  context.s.append(`\n${registrations}\nif (import.meta.hot) {\n  import.meta.hot.accept((mod) => {\n    if (!mod) return;\n    ${updates}\n  });\n}\n`)
}
