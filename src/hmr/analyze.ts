import { createHash } from 'node:crypto'
import type { AstNode } from '../compiler/ast'
import type { CompilerContext } from '../compiler/context'
import { containsJsx } from '../compiler/traverse'

export interface ComponentExport {
  local: string
  exported: string
  id: string
}

export interface ComponentExportAnalysis {
  components: ComponentExport[]
}

export function analyzeComponentExports(
  context: CompilerContext
): ComponentExportAnalysis {
  const body = context.ast.body as unknown as AstNode[]
  const declared = new Map<string, AstNode>()
  const components: ComponentExport[] = []

  for (const statement of body) {
    if (statement.type === 'VariableDeclaration') {
      collectComponentDeclarations(statement, declared)
    } else if (statement.type === 'ExportNamedDeclaration' && statement.declaration) {
      const declaration = statement.declaration as AstNode
      if (declaration.type === 'VariableDeclaration') {
        collectComponentDeclarations(declaration, declared)
      }
    }
  }

  for (const statement of body) {
    if (statement.type === 'ExportNamedDeclaration') {
      const declaration = statement.declaration as AstNode | null

      if (declaration?.type === 'VariableDeclaration') {
        for (const declarator of (declaration.declarations ?? []) as AstNode[]) {
          const name = getIdentifierName(declarator.id as AstNode)
          if (name && declared.has(name)) {
            addComponent(components, name, name, context.options.id)
          }
        }
      }

      for (const specifier of (statement.specifiers ?? []) as AstNode[]) {
        if (specifier.type !== 'ExportSpecifier') continue
        const local = getExportName(specifier.local as AstNode)
        const exported = getExportName(specifier.exported as AstNode)
        if (local && exported && declared.has(local)) {
          addComponent(components, local, exported, context.options.id)
        }
      }
      continue
    }

    if (statement.type !== 'ExportDefaultDeclaration') continue
    const declaration = statement.declaration as AstNode

    if (declaration.type === 'Identifier' && typeof declaration.name === 'string') {
      if (declared.has(declaration.name)) {
        addComponent(components, declaration.name, 'default', context.options.id)
      }
      continue
    }

    if (isComponentExpression(declaration)) {
      const local = context.makeUniqueName('__default__')
      context.s.overwrite(statement.start, declaration.start, `const ${local} = `)
      context.s.append(`;\nexport default ${local};\n`)
      declared.set(local, declaration)
      addComponent(components, local, 'default', context.options.id)
    }
  }

  return { components }
}

function collectComponentDeclarations(
  declaration: AstNode,
  output: Map<string, AstNode>
): void {
  for (const declarator of (declaration.declarations ?? []) as AstNode[]) {
    const name = getIdentifierName(declarator.id as AstNode)
    const init = declarator.init as AstNode | null
    if (name && init && isComponentExpression(init, name)) {
      output.set(name, init)
    }
  }
}

function isComponentExpression(node: AstNode, name?: string): boolean {
  if (node.type === 'ObjectExpression') return true

  if (node.type === 'ArrowFunctionExpression') {
    return (!name || /^[A-Z]/.test(name)) && containsJsx(node)
  }

  if (node.type !== 'CallExpression') return false
  const callee = node.callee as AstNode

  if (callee.type === 'Identifier') {
    return callee.name === 'defineComponent'
  }

  if (callee.type === 'MemberExpression') {
    const object = callee.object as AstNode
    const property = callee.property as AstNode
    return (
      object.type === 'Identifier' &&
      object.name === 'Vue' &&
      property.type === 'Identifier' &&
      property.name === 'extend'
    )
  }

  return false
}

function addComponent(
  list: ComponentExport[],
  local: string,
  exported: string,
  id: string
): void {
  if (list.some(item => item.local === local && item.exported === exported)) return
  list.push({
    local,
    exported,
    id: createHash('sha256').update(`${id}:${exported}`).digest('hex').slice(0, 8)
  })
}

function getIdentifierName(node: AstNode | null | undefined): string | null {
  return node?.type === 'Identifier' && typeof node.name === 'string'
    ? node.name
    : null
}

function getExportName(node: AstNode | null | undefined): string | null {
  if (!node) return null
  if (node.type === 'Identifier' && typeof node.name === 'string') return node.name
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value
  return null
}
