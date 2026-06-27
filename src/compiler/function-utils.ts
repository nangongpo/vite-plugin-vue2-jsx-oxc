import type { AstNode } from './ast'

export interface MethodLike {
  owner: AstNode
  keyName: string | null
  fn: AstNode
  body: AstNode
  params: AstNode[]
}

export function getMethodLike(node: AstNode): MethodLike | null {
  if (node.type === 'Property') {
    const value = node.value as AstNode
    if (!isFunction(value)) return null

    return {
      owner: node,
      keyName: getPropertyName(node.key as AstNode, Boolean(node.computed)),
      fn: value,
      body: value.body as AstNode,
      params: (value.params ?? []) as AstNode[]
    }
  }

  if (node.type === 'MethodDefinition') {
    const value = node.value as AstNode
    if (!isFunction(value)) return null

    return {
      owner: node,
      keyName: getPropertyName(node.key as AstNode, Boolean(node.computed)),
      fn: value,
      body: value.body as AstNode,
      params: (value.params ?? []) as AstNode[]
    }
  }

  return null
}

export function isFunction(node: AstNode | null | undefined): boolean {
  return Boolean(
    node &&
      (node.type === 'FunctionExpression' ||
        node.type === 'FunctionDeclaration' ||
        node.type === 'ArrowFunctionExpression')
  )
}

export function getPropertyName(
  key: AstNode | null | undefined,
  computed = false
): string | null {
  if (!key || computed) return null
  if (key.type === 'Identifier' && typeof key.name === 'string') return key.name
  if (key.type === 'Literal' && typeof key.value === 'string') return key.value
  return null
}

export function firstParamIsH(params: AstNode[]): boolean {
  const first = params[0]
  return Boolean(first?.type === 'Identifier' && first.name === 'h')
}
