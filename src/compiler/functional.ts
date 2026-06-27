import type { AstNode } from './ast'
import type { CompilerContext } from './context'
import { SKIP, walk } from './traverse'

export function transformFunctionalComponents(context: CompilerContext): void {
  if (!context.options.functional) return

  walk(context.ast as unknown as AstNode, node => {
    if (context.isCovered(node)) return SKIP

    if (node.type === 'VariableDeclaration') {
      const declarations = (node.declarations ?? []) as AstNode[]
      if (declarations.length !== 1) return

      const declaration = declarations[0]
      const id = declaration.id as AstNode
      const init = declaration.init as AstNode | null
      const name = id?.type === 'Identifier' && typeof id.name === 'string'
        ? id.name
        : null

      if (
        name &&
        /^[A-Z]/.test(name) &&
        init?.type === 'ArrowFunctionExpression' &&
        hasFunctionalJsx(init)
      ) {
        replaceArrow(init, name, context)
        return SKIP
      }
      return
    }

    if (node.type === 'ExportDefaultDeclaration') {
      const declaration = node.declaration as AstNode
      if (
        declaration?.type === 'ArrowFunctionExpression' &&
        hasFunctionalJsx(declaration)
      ) {
        replaceArrow(declaration, null, context)
        return SKIP
      }
    }
  })
}

function hasFunctionalJsx(root: AstNode): boolean {
  let found = false
  walk(root, (node, state) => {
    if (node !== root && isObjectMethod(node)) return SKIP
    if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
      const nestedInMethod = state.ancestors
        .slice(1)
        .some(isObjectMethod)
      if (!nestedInMethod) found = true
      return SKIP
    }
  })
  return found
}

function isObjectMethod(node: AstNode): boolean {
  return node.type === 'Property' && Boolean(node.method)
}

function replaceArrow(
  arrow: AstNode,
  componentName: string | null,
  context: CompilerContext
): void {
  if (context.isCovered(arrow)) return

  const params = (arrow.params ?? []) as AstNode[]
  const paramsCode = params.map(param => context.source(param))
  if (!(params[0]?.type === 'Identifier' && params[0].name === 'h')) {
    paramsCode.unshift('h')
  }

  const body = arrow.body as AstNode
  const bodyCode = context.renderNode(body)
  const properties: string[] = []

  if (context.options.isDev && componentName) {
    properties.push(`name: ${JSON.stringify(componentName)}`)
  }

  properties.push('functional: true')
  properties.push(`render: (${paramsCode.join(', ')}) => ${bodyCode}`)

  context.overwrite(arrow, `{ ${properties.join(', ')} }`)
  context.markCovered(arrow)
}
