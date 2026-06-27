import type { CompilerContext } from './context'

export interface ParsedDirective {
  name: string
  argument: string | null
  modifiers: string[]
}

export function isDirectiveName(name: string): boolean {
  return /^v-/.test(name) || /^v[A-Z]/.test(name)
}

export function parseDirectiveName(rawName: string): ParsedDirective | null {
  if (!isDirectiveName(rawName)) return null

  const [baseWithArgument, ...modifiers] = rawName.split('_')
  const colonIndex = baseWithArgument.indexOf(':')
  const base = colonIndex >= 0
    ? baseWithArgument.slice(0, colonIndex)
    : baseWithArgument
  const argument = colonIndex >= 0
    ? baseWithArgument.slice(colonIndex + 1)
    : null

  const withoutV = base.startsWith('v-') ? base.slice(2) : base.slice(1)

  return {
    name: kebabCase(withoutV),
    argument,
    modifiers
  }
}

export function compileDirective(
  directive: ParsedDirective,
  value: string
): string {
  const fields = [
    `name: ${JSON.stringify(directive.name)}`,
    `value: ${value}`
  ]

  if (directive.argument) {
    fields.push(`arg: ${JSON.stringify(directive.argument)}`)
  }

  if (directive.modifiers.length > 0) {
    fields.push(
      `modifiers: { ${directive.modifiers
        .map(modifier => `${JSON.stringify(modifier)}: true`)
        .join(', ')} }`
    )
  }

  return `{ ${fields.join(', ')} }`
}

export function requireDirectiveExpression(
  context: CompilerContext,
  rawName: string,
  expression: string | null
): string {
  if (expression === null) {
    context.error(`Directive ${rawName} requires a JSX expression value`)
  }
  return expression
}

function kebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}
