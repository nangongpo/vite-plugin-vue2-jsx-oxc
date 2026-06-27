import type { AstNode } from './ast'
import type { CompilerContext } from './context'

const KEY_MODIFIERS = ['ctrl', 'shift', 'alt', 'meta'] as const

const KEY_CODES: Record<string, number | number[]> = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  delete: [8, 46]
}

const KEY_NAMES: Record<string, string | string[]> = {
  esc: ['Esc', 'Escape'],
  tab: 'Tab',
  enter: 'Enter',
  space: ' ',
  up: ['Up', 'ArrowUp'],
  left: ['Left', 'ArrowLeft'],
  right: ['Right', 'ArrowRight'],
  down: ['Down', 'ArrowDown'],
  delete: ['Backspace', 'Delete']
}

export interface CompiledVOn {
  group: 'on' | 'nativeOn'
  event: string
  handler: string
}

export function isVOnDirective(rawName: string): boolean {
  return normalizeVOnName(rawName) !== null
}

export function compileVOn(
  rawName: string,
  expression: string | null,
  context: CompilerContext,
  anchor: AstNode
): CompiledVOn {
  if (expression === null) {
    context.error('Only JSX expression containers are allowed on v-on')
  }

  const normalized = normalizeVOnName(rawName)
  if (!normalized) context.error(`Invalid v-on directive: ${rawName}`)
  const [head, ...initialModifiers] = normalized.split('_')
  let event = head.slice(head.indexOf(':') + 1)
  let modifiers = initialModifiers
  let native = false

  if (event === 'click' && modifiers.includes('right')) {
    event = 'contextmenu'
    modifiers = modifiers.filter(modifier => modifier !== 'right')
  } else if (event === 'click' && modifiers.includes('middle')) {
    event = 'mouseup'
  }

  const guards: string[] = []
  const statements: string[] = []
  const keyFilters: string[] = []

  for (const modifier of modifiers) {
    switch (modifier) {
      case 'stop':
        statements.push('$event.stopPropagation();')
        break
      case 'prevent':
        statements.push('$event.preventDefault();')
        break
      case 'self':
        guards.push('$event.target !== $event.currentTarget')
        break
      case 'ctrl':
      case 'shift':
      case 'alt':
      case 'meta':
        guards.push(`!$event.${modifier}Key`)
        break
      case 'left':
        guards.push(`('button' in $event) && $event.button !== 0`)
        keyFilters.push(modifier)
        break
      case 'middle':
        guards.push(`('button' in $event) && $event.button !== 1`)
        break
      case 'right':
        guards.push(`('button' in $event) && $event.button !== 2`)
        keyFilters.push(modifier)
        break
      case 'exact': {
        const unused = KEY_MODIFIERS.filter(
          keyModifier => !modifiers.includes(keyModifier)
        )
        if (unused.length > 0) {
          guards.push(unused.map(item => `$event.${item}Key`).join(' || '))
        }
        break
      }
      case 'capture':
      case 'once':
      case 'passive':
        break
      case 'native':
        native = true
        break
      default:
        keyFilters.push(modifier)
    }
  }

  if (modifiers.includes('capture')) event = `!${event}`
  if (modifiers.includes('once')) event = `~${event}`
  if (modifiers.includes('passive')) event = `&${event}`

  if (keyFilters.length > 0) {
    guards.unshift(compileKeyFilter(keyFilters, context, anchor))
  }

  if (guards.length === 0 && statements.length === 0) {
    return {
      group: native ? 'nativeOn' : 'on',
      event,
      handler: expression
    }
  }

  const body = [
    ...guards.map(guard => `if (${guard}) return null;`),
    ...statements,
    `return (${expression})($event);`
  ].join(' ')

  return {
    group: native ? 'nativeOn' : 'on',
    event,
    handler: `($event) => { ${body} }`
  }
}

function compileKeyFilter(
  keys: string[],
  context: CompilerContext,
  anchor: AstNode
): string {
  const tests = keys.map(key => compileSingleKeyFilter(key, context, anchor))
  return `!('button' in $event) && (${tests.join(' && ')})`
}

function compileSingleKeyFilter(
  key: string,
  context: CompilerContext,
  anchor: AstNode
): string {
  const numeric = Number.parseInt(key, 10)
  if (Number.isFinite(numeric) && numeric > 0) {
    return `$event.keyCode !== ${numeric}`
  }

  const keyCode = KEY_CODES[key]
  const keyName = KEY_NAMES[key]
  const code = keyCode === undefined ? 'undefined' : JSON.stringify(keyCode)
  const name = keyName === undefined ? 'undefined' : JSON.stringify(keyName)

  if (
    context.options.compositionAPI !== false &&
    context.isInsideSetup(anchor)
  ) {
    const instance = context.requestCompositionRenderInstance(anchor)
    return `${instance}._k($event.keyCode, ${JSON.stringify(key)}, ${code}, $event.key, ${name})`
  }

  const helper = context.requestNamedImport(
    'virtual:vue2-jsx-oxc/runtime',
    'checkKeyCodes',
    '__checkKeyCodes'
  )

  return `${helper}($event.keyCode, ${JSON.stringify(key)}, ${code}, $event.key, ${name})`
}

function normalizeVOnName(rawName: string): string | null {
  const colonIndex = rawName.indexOf(':')
  if (colonIndex < 0) return null
  const head = rawName.slice(0, colonIndex).replace(/-/g, '').toLowerCase()
  if (head !== 'von') return null
  return `v-on:${rawName.slice(colonIndex + 1)}`
}
