import type { AstNode } from './ast'
import type { CompilerContext } from './context'
import { firstParamIsH, getMethodLike } from './function-utils'
import { containsJsx, walk } from './traverse'

export function transformInjectH(context: CompilerContext): void {
  if (!context.options.injectH) return

  // When Composition API mode is enabled, composition-api.ts mirrors the
  // original preset and imports h at module scope.
  if (context.options.compositionAPI !== false) return

  walk(context.ast as unknown as AstNode, (node, state) => {
    if (context.isCovered(node)) return
    if (node.type === 'Property' && !node.method) return

    const method = getMethodLike(node)
    if (!method || method.body.type !== 'BlockStatement') return
    if (!containsJsx(method.fn)) return
    if (firstParamIsH(method.params)) return
    if (isInsideJsxExpression(state.ancestors)) return
    if (hasLocalHBinding(method.fn)) return

    const initializer = method.keyName === 'render'
      ? 'arguments[0]'
      : 'this.$createElement'

    context.s.appendLeft(
      method.body.start + 1,
      `\nconst h = ${initializer};`
    )
  })
}

function isInsideJsxExpression(ancestors: AstNode[]): boolean {
  return ancestors.some(node => node.type === 'JSXExpressionContainer')
}

function hasLocalHBinding(fn: AstNode): boolean {
  for (const parameter of (fn.params ?? []) as AstNode[]) {
    if (patternContainsH(parameter)) return true
  }

  let found = false
  walk(fn.body as AstNode, node => {
    if (node.type === 'VariableDeclarator' && patternContainsH(node.id as AstNode)) {
      found = true
    }
    if (
      (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') &&
      patternContainsH(node.id as AstNode | null)
    ) {
      found = true
    }
  })
  return found
}

function patternContainsH(pattern: AstNode | null | undefined): boolean {
  if (!pattern) return false
  if (pattern.type === 'Identifier') return pattern.name === 'h'
  if (pattern.type === 'RestElement') return patternContainsH(pattern.argument as AstNode)
  if (pattern.type === 'AssignmentPattern') return patternContainsH(pattern.left as AstNode)
  if (pattern.type === 'ArrayPattern') {
    return ((pattern.elements ?? []) as Array<AstNode | null>).some(patternContainsH)
  }
  if (pattern.type === 'ObjectPattern') {
    return ((pattern.properties ?? []) as AstNode[]).some(property =>
      property.type === 'Property'
        ? patternContainsH(property.value as AstNode)
        : patternContainsH(property.argument as AstNode)
    )
  }
  return false
}
