import type { AstNode } from './ast'
import type { CompilerContext } from './context'
import { compileJsxChildren } from './jsx-children'
import { compileJsxData } from './jsx-data'
import { isNativeTag } from './native-tags'

export function compileJsxNode(
  node: AstNode,
  context: CompilerContext
): string {
  if (node.type === 'JSXFragment') {
    return compileFragment(node, context)
  }

  if (node.type !== 'JSXElement') {
    context.error(`Expected JSXElement or JSXFragment, received ${node.type}`, node)
  }

  const openingElement = node.openingElement as AstNode
  const nameNode = openingElement.name as AstNode
  const tag = compileTag(nameNode, context)
  const data = compileJsxData(
    openingElement,
    {
      name: tag.rawName,
      component: tag.component,
      type: tag.code
    },
    context
  )
  const children = compileJsxChildren((node.children ?? []) as AstNode[], context)

  const args = [tag.code]
  if (data) args.push(data)
  if (children.length > 0) args.push(`[${children.join(', ')}]`)

  return `h(${args.join(', ')})`
}

function compileFragment(node: AstNode, context: CompilerContext): string {
  if (context.options.fragment === 'error') {
    context.error(
      'Vue 2 does not support JSX fragments as a single VNode. Wrap the children in an element or set fragment: "array".',
      node
    )
  }

  const children = compileJsxChildren((node.children ?? []) as AstNode[], context)
  return `[${children.join(', ')}]`
}

function compileTag(
  node: AstNode,
  context: CompilerContext
): { code: string; rawName: string | null; component: boolean } {
  if (node.type === 'JSXIdentifier') {
    const name = String(node.name)
    const native = isNativeTag(name)
    const bound = context.hasBinding(name, node)
    const code = native || !bound ? JSON.stringify(name) : name

    return {
      code,
      rawName: name,
      component: !native
    }
  }

  if (node.type === 'JSXMemberExpression') {
    return {
      code: compileMemberExpression(node, context),
      rawName: null,
      component: true
    }
  }

  if (node.type === 'JSXNamespacedName') {
    const namespace = node.namespace as AstNode & { name?: unknown }
    const name = node.name as AstNode & { name?: unknown }
    const value = `${String(namespace.name)}:${String(name.name)}`
    return { code: JSON.stringify(value), rawName: value, component: false }
  }

  context.error(`Unsupported JSX tag type: ${node.type}`, node)
}

function compileMemberExpression(
  node: AstNode,
  context: CompilerContext
): string {
  const object = node.object as AstNode
  const property = node.property as AstNode & { name?: unknown }
  const objectCode = object.type === 'JSXMemberExpression'
    ? compileMemberExpression(object, context)
    : object.type === 'JSXIdentifier'
      ? String(object.name)
      : context.renderNode(object)

  return `${objectCode}.${String(property.name)}`
}
