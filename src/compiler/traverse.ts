import { visitorKeys } from 'oxc-parser'
import type { AstNode, SourceRange } from './ast'
import { isNode } from './ast'

export const SKIP = Symbol('skip')

export interface WalkState {
  parent: AstNode | null
  ancestors: AstNode[]
}

export type WalkVisitor = (
  node: AstNode,
  state: WalkState
) => void | typeof SKIP

export function walk(
  root: AstNode,
  visitor: WalkVisitor,
  parent: AstNode | null = null,
  ancestors: AstNode[] = []
): void {
  const result = visitor(root, { parent, ancestors })
  if (result === SKIP) return

  const keys = visitorKeys[root.type] ?? inferVisitorKeys(root)
  const nextAncestors = [...ancestors, root]

  for (const key of keys) {
    const value = root[key]

    if (Array.isArray(value)) {
      for (const child of value) {
        if (isNode(child)) walk(child, visitor, root, nextAncestors)
      }
    } else if (isNode(value)) {
      walk(value, visitor, root, nextAncestors)
    }
  }
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

export function isJsxNode(node: AstNode): boolean {
  return node.type === 'JSXElement' || node.type === 'JSXFragment'
}

export function collectRootJsxNodes(
  root: AstNode,
  coveredRanges: SourceRange[] = []
): AstNode[] {
  const roots: AstNode[] = []

  walk(root, (node, state) => {
    if (isCovered(node, coveredRanges)) return SKIP
    if (!isJsxNode(node)) return

    const hasJsxAncestor = state.ancestors.some(isJsxNode)
    if (!hasJsxAncestor) {
      roots.push(node)
      return SKIP
    }
  })

  return roots
}

export function containsJsx(root: AstNode): boolean {
  let found = false
  walk(root, node => {
    if (isJsxNode(node)) {
      found = true
      return SKIP
    }
  })
  return found
}

export function isCovered(node: AstNode, ranges: SourceRange[]): boolean {
  return ranges.some(range => node.start >= range.start && node.end <= range.end)
}

export function findNearestAncestor(
  ancestors: AstNode[],
  predicate: (node: AstNode) => boolean
): AstNode | null {
  for (let index = ancestors.length - 1; index >= 0; index -= 1) {
    if (predicate(ancestors[index])) return ancestors[index]
  }
  return null
}
