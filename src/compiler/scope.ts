import { visitorKeys } from 'oxc-parser'
import type { AstNode } from './ast'
import { isNode } from './ast'

export type ScopeKind = 'program' | 'function' | 'block' | 'catch' | 'class'

export interface LexicalScope {
  kind: ScopeKind
  start: number
  end: number
  parent: LexicalScope | null
  bindings: Set<string>
  children: LexicalScope[]
}

export class ScopeAnalyzer {
  readonly root: LexicalScope
  private readonly nodeScopes = new WeakMap<object, LexicalScope>()

  constructor(program: AstNode) {
    this.root = createScope('program', program, null)
    this.visit(program, this.root, null, true)
  }

  scopeFor(node: AstNode): LexicalScope {
    return this.nodeScopes.get(node) ?? this.findDeepestScope(node.start, this.root)
  }

  hasBinding(name: string, node: AstNode): boolean {
    let scope: LexicalScope | null = this.scopeFor(node)
    while (scope) {
      if (scope.bindings.has(name)) return true
      scope = scope.parent
    }
    return false
  }

  private visit(
    node: AstNode,
    currentScope: LexicalScope,
    parent: AstNode | null,
    isRoot = false
  ): void {
    let scope = currentScope

    if (!isRoot) {
      if (isFunction(node)) {
        if (node.type === 'FunctionDeclaration') {
          addPattern(currentScope, node.id as AstNode | null)
        }

        scope = createScope('function', node, currentScope)
        currentScope.children.push(scope)

        if (node.type !== 'FunctionDeclaration') {
          addPattern(scope, node.id as AstNode | null)
        }
        for (const parameter of (node.params ?? []) as AstNode[]) {
          addPattern(scope, parameter)
        }
      } else if (node.type === 'BlockStatement') {
        scope = createScope('block', node, currentScope)
        currentScope.children.push(scope)
      } else if (node.type === 'CatchClause') {
        scope = createScope('catch', node, currentScope)
        currentScope.children.push(scope)
        addPattern(scope, node.param as AstNode | null)
      } else if (node.type === 'ClassBody' || node.type === 'ClassExpression') {
        scope = createScope('class', node, currentScope)
        currentScope.children.push(scope)
      }
    }

    this.nodeScopes.set(node, scope)
    this.collectDeclaration(node, scope, parent)

    const keys = visitorKeys[node.type] ?? inferVisitorKeys(node)
    for (const key of keys) {
      const value = node[key]
      if (Array.isArray(value)) {
        for (const child of value) {
          if (isNode(child)) this.visit(child, scope, node)
        }
      } else if (isNode(value)) {
        this.visit(value, scope, node)
      }
    }
  }

  private collectDeclaration(
    node: AstNode,
    scope: LexicalScope,
    parent: AstNode | null
  ): void {
    if (node.type === 'ImportDeclaration') {
      for (const specifier of (node.specifiers ?? []) as AstNode[]) {
        addPattern(scope, specifier.local as AstNode | null)
      }
      return
    }

    if (node.type === 'VariableDeclaration') {
      const target = node.kind === 'var' ? findVarScope(scope) : scope
      for (const declaration of (node.declarations ?? []) as AstNode[]) {
        addPattern(target, declaration.id as AstNode | null)
      }
      return
    }

    if (node.type === 'ClassDeclaration') {
      addPattern(scope, node.id as AstNode | null)
      return
    }

    // Function declarations are registered before their own function scope is entered.
    if (node.type === 'FunctionDeclaration' && parent?.type === 'ExportDefaultDeclaration') {
      addPattern(scope.parent ?? scope, node.id as AstNode | null)
    }
  }

  private findDeepestScope(position: number, scope: LexicalScope): LexicalScope {
    for (const child of scope.children) {
      if (position >= child.start && position <= child.end) {
        return this.findDeepestScope(position, child)
      }
    }
    return scope
  }
}

function createScope(
  kind: ScopeKind,
  node: AstNode,
  parent: LexicalScope | null
): LexicalScope {
  return {
    kind,
    start: node.start,
    end: node.end,
    parent,
    bindings: new Set<string>(),
    children: []
  }
}

function findVarScope(scope: LexicalScope): LexicalScope {
  let current: LexicalScope | null = scope
  while (current && current.kind !== 'function' && current.kind !== 'program') {
    current = current.parent
  }
  return current ?? scope
}

function addPattern(scope: LexicalScope, pattern: AstNode | null | undefined): void {
  if (!pattern) return

  if (pattern.type === 'Identifier') {
    if (typeof pattern.name === 'string') scope.bindings.add(pattern.name)
    return
  }

  if (pattern.type === 'RestElement') {
    addPattern(scope, pattern.argument as AstNode)
    return
  }

  if (pattern.type === 'AssignmentPattern') {
    addPattern(scope, pattern.left as AstNode)
    return
  }

  if (pattern.type === 'ArrayPattern') {
    for (const element of (pattern.elements ?? []) as Array<AstNode | null>) {
      addPattern(scope, element)
    }
    return
  }

  if (pattern.type === 'ObjectPattern') {
    for (const property of (pattern.properties ?? []) as AstNode[]) {
      if (property.type === 'Property') {
        addPattern(scope, property.value as AstNode)
      } else if (property.type === 'RestElement') {
        addPattern(scope, property.argument as AstNode)
      }
    }
  }
}

function isFunction(node: AstNode): boolean {
  return (
    node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression'
  )
}

function inferVisitorKeys(node: AstNode): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(node)) {
    if (key === 'start' || key === 'end' || key === 'type') continue
    if (isNode(value) || (Array.isArray(value) && value.some(isNode))) {
      keys.push(key)
    }
  }
  return keys
}
