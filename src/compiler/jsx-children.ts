import type { AstNode } from './ast'
import type { CompilerContext } from './context'
import { compileJsxNode } from './jsx-element'

export function compileJsxChildren(
  children: AstNode[],
  context: CompilerContext
): string[] {
  const output: string[] = []

  for (const child of children) {
    if (child.type === 'JSXText') {
      const value = normalizeJsxText(String(child.value ?? ''))
      if (value !== null) output.push(JSON.stringify(value))
      continue
    }

    if (child.type === 'JSXExpressionContainer') {
      const expression = child.expression as AstNode
      if (!expression || expression.type === 'JSXEmptyExpression') continue
      output.push(context.renderNode(expression))
      continue
    }

    if (child.type === 'JSXSpreadChild') {
      output.push(`...(${context.renderNode(child.expression as AstNode)})`)
      continue
    }

    if (child.type === 'JSXElement' || child.type === 'JSXFragment') {
      output.push(compileJsxNode(child, context))
      continue
    }

    context.error(`Unsupported JSX child: ${child.type}`, child)
  }

  return output
}

export function normalizeJsxText(value: string): string | null {
  const lines = value.split(/\r\n|\n|\r/)
  let lastNonEmptyLine = 0

  for (let index = 0; index < lines.length; index += 1) {
    if (/[^ \t]/.test(lines[index])) lastNonEmptyLine = index
  }

  let result = ''

  for (let index = 0; index < lines.length; index += 1) {
    const firstLine = index === 0
    const lastLine = index === lines.length - 1
    const lastNonEmpty = index === lastNonEmptyLine
    let line = lines[index].replace(/\t/g, ' ')

    if (!firstLine) line = line.replace(/^[ ]+/, '')
    if (!lastLine) line = line.replace(/[ ]+$/, '')

    if (line) {
      if (!lastNonEmpty) line += ' '
      result += line
    }
  }

  return result === '' ? null : result
}
