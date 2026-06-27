import type { CompilerContext } from './context'

interface KeyValueEntry {
  key: string
  value: string
}

export class DataSegment {
  private readonly roots = new Map<string, string>()
  private readonly groups = new Map<string, Map<string, string>>()
  private readonly groupSpreads = new Map<string, string[]>()
  private readonly directives: string[] = []
  private readonly directiveSpreads: string[] = []

  get empty(): boolean {
    return (
      this.roots.size === 0 &&
      this.groups.size === 0 &&
      this.groupSpreads.size === 0 &&
      this.directives.length === 0 &&
      this.directiveSpreads.length === 0
    )
  }

  addRoot(key: string, value: string): void {
    this.roots.set(key, value)
  }

  addGroup(group: string, key: string, value: string): void {
    const entries = this.groups.get(group) ?? new Map<string, string>()
    const previous = entries.get(key)

    if (previous && (group === 'on' || group === 'nativeOn')) {
      entries.set(key, mergeArrayValue(previous, value))
    } else if (previous && group === 'hook') {
      entries.set(key, mergeHookValue(previous, value))
    } else {
      entries.set(key, value)
    }

    this.groups.set(group, entries)
  }

  addGroupSpread(group: string, expression: string): void {
    const spreads = this.groupSpreads.get(group) ?? []
    spreads.push(expression)
    this.groupSpreads.set(group, spreads)
  }

  addDirective(value: string): void {
    this.directives.push(value)
  }

  addDirectiveSpread(expression: string): void {
    this.directiveSpreads.push(expression)
  }

  toCode(): string {
    const properties: string[] = []

    for (const [key, value] of this.roots) {
      properties.push(`${quoteKey(key)}: ${value}`)
    }

    const groupNames = new Set([
      ...this.groups.keys(),
      ...this.groupSpreads.keys()
    ])

    for (const group of groupNames) {
      const entries: string[] = []
      for (const spread of this.groupSpreads.get(group) ?? []) {
        entries.push(`...(${spread})`)
      }
      for (const [key, value] of this.groups.get(group) ?? []) {
        entries.push(`${JSON.stringify(key)}: ${value}`)
      }
      properties.push(`${quoteKey(group)}: { ${entries.join(', ')} }`)
    }

    if (this.directives.length > 0 || this.directiveSpreads.length > 0) {
      const entries = [
        ...this.directiveSpreads.map(expression => `...((${expression}) || [])`),
        ...this.directives
      ]
      properties.push(`directives: [${entries.join(', ')}]`)
    }

    return `{ ${properties.join(', ')} }`
  }
}

export class DataSequence {
  private current = new DataSegment()
  private readonly pieces: string[] = []
  private hasDynamicPiece = false

  constructor(private readonly context: CompilerContext) {}

  get segment(): DataSegment {
    return this.current
  }

  pushSpread(expression: string): void {
    this.flush()
    this.pieces.push(expression)
    this.hasDynamicPiece = true
  }

  pushRawDataObject(code: string): void {
    this.flush()
    this.pieces.push(code)
    this.hasDynamicPiece = true
  }

  toCode(): string | null {
    this.flush()
    if (this.pieces.length === 0) return null
    if (!this.hasDynamicPiece && this.pieces.length === 1) return this.pieces[0]

    const helper = this.context.requestNamedImport(
      'virtual:vue2-jsx-oxc/runtime',
      'mergeVue2JsxData',
      '__mergeVue2JsxData'
    )

    return `${helper}([${this.pieces.join(', ')}])`
  }

  private flush(): void {
    if (this.current.empty) return
    this.pieces.push(this.current.toCode())
    this.current = new DataSegment()
  }
}

function quoteKey(key: string): string {
  return /^[$A-Z_a-z][$\w]*$/.test(key) ? key : JSON.stringify(key)
}

function mergeArrayValue(previous: string, next: string): string {
  return `[${previous}, ${next}]`
}

function mergeHookValue(previous: string, next: string): string {
  return `function (...args) { ${previous}.apply(this, args); return ${next}.apply(this, args) }`
}

export function objectCode(entries: KeyValueEntry[]): string {
  return `{ ${entries.map(entry => `${quoteKey(entry.key)}: ${entry.value}`).join(', ')} }`
}
