export interface AstNode {
  type: string
  start: number
  end: number
  [key: string]: unknown
}

export interface ImportRequest {
  source: string
  imported: string
  local: string
}

export interface SourceRange {
  start: number
  end: number
}

export function isNode(value: unknown): value is AstNode {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof (value as AstNode).type === 'string' &&
      typeof (value as AstNode).start === 'number' &&
      typeof (value as AstNode).end === 'number'
  )
}
