import type { AstNode } from './ast'
import type { CompilerContext } from './context'

export function getJsxAttributeName(attribute: AstNode): string | null {
  if (attribute.type !== 'JSXAttribute') return null
  const name = attribute.name as AstNode & { name?: unknown }

  if (name.type === 'JSXIdentifier' && typeof name.name === 'string') {
    return name.name
  }

  if (name.type === 'JSXNamespacedName') {
    const namespace = name.namespace as AstNode & { name?: unknown }
    const local = name.name as AstNode & { name?: unknown }
    if (typeof namespace?.name === 'string' && typeof local?.name === 'string') {
      return `${namespace.name}:${local.name}`
    }
  }

  return null
}

export function getJsxAttributeValue(
  attribute: AstNode,
  context: CompilerContext
): { code: string; expression: AstNode | null; isExpression: boolean } {
  const value = attribute.value as AstNode | null

  if (!value) {
    return { code: 'true', expression: null, isExpression: false }
  }

  if (value.type === 'Literal') {
    const literalValue = (value as AstNode & { value?: unknown }).value
    return {
      code: JSON.stringify(literalValue),
      expression: null,
      isExpression: false
    }
  }

  if (value.type === 'JSXExpressionContainer') {
    const expression = value.expression as AstNode
    if (!expression || expression.type === 'JSXEmptyExpression') {
      return { code: 'undefined', expression: null, isExpression: true }
    }
    return {
      code: context.renderNode(expression),
      expression,
      isExpression: true
    }
  }

  context.error(`Unsupported JSX attribute value: ${value.type}`, value)
}

export function normalizeCamelName(value: string): string {
  return value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

export function attributeNameEquals(actual: string, expected: string): boolean {
  return actual === expected || normalizeCamelName(actual) === normalizeCamelName(expected)
}
