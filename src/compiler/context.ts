import MagicString from 'magic-string'
import type { Program } from 'oxc-parser'
import type { CompileOptions } from './index'
import type { AstNode, ImportRequest, SourceRange } from './ast'
import { collectRootJsxNodes, walk } from './traverse'
import { ScopeAnalyzer } from './scope'

export type JsxCompiler = (node: AstNode, context: CompilerContext) => string

export interface CompilerContextInit {
  code: string
  ast: Program
  magicString: MagicString
  options: CompileOptions
}

interface SetupFunctionRecord {
  fn: AstNode
  body: AstNode
  instanceLocal: string | null
}

export class CompilerContext {
  readonly code: string
  readonly ast: Program
  readonly s: MagicString
  readonly options: CompileOptions
  readonly coveredRanges: SourceRange[] = []

  private readonly usedNames = new Set<string>()
  private readonly boundNames = new Set<string>()
  private readonly topLevelBindings = new Set<string>()
  private readonly imports: ImportRequest[] = []
  private readonly existingNamedImports = new Map<string, Map<string, string>>()
  private readonly renderReplacements: Array<SourceRange & { code: string }> = []
  private readonly setupFunctions: SetupFunctionRecord[] = []
  private readonly scopeAnalyzer: ScopeAnalyzer
  private jsxCompiler: JsxCompiler | null = null

  constructor(init: CompilerContextInit) {
    this.code = init.code
    this.ast = init.ast
    this.s = init.magicString
    this.options = init.options
    this.scopeAnalyzer = new ScopeAnalyzer(init.ast as unknown as AstNode)
    this.analyzeProgram()
  }

  setJsxCompiler(compiler: JsxCompiler): void {
    this.jsxCompiler = compiler
  }

  source(node: AstNode): string {
    return this.code.slice(node.start, node.end)
  }

  error(message: string, node?: AstNode): never {
    const range = node ? `:${node.start}-${node.end}` : ''
    throw new Error(
      `[vite-plugin-vue2-jsx-oxc] ${this.options.filename}${range}\n${message}`
    )
  }

  markCovered(node: AstNode): void {
    this.coveredRanges.push({ start: node.start, end: node.end })
  }

  isCovered(node: AstNode): boolean {
    return this.coveredRanges.some(
      range => node.start >= range.start && node.end <= range.end
    )
  }

  overwrite(node: AstNode, content: string): void {
    this.s.overwrite(node.start, node.end, content)
  }

  renderNode(node: AstNode): string {
    if (!this.jsxCompiler) {
      throw new Error('JSX compiler has not been registered')
    }

    if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
      return this.jsxCompiler(node, this)
    }

    const roots = collectRootJsxNodes(node)
    const replacements: Array<SourceRange & { code: string }> = roots.map(root => ({
      start: root.start,
      end: root.end,
      code: this.jsxCompiler!(root, this)
    }))

    for (const replacement of this.renderReplacements) {
      if (replacement.start < node.start || replacement.end > node.end) continue
      if (roots.some(root => replacement.start >= root.start && replacement.end <= root.end)) {
        continue
      }
      replacements.push(replacement)
    }

    if (replacements.length === 0) return this.source(node)

    let output = this.source(node)
    for (const replacement of replacements
      .map(item => ({
        start: item.start - node.start,
        end: item.end - node.start,
        code: item.code
      }))
      .sort((a, b) => b.start - a.start)) {
      output =
        output.slice(0, replacement.start) +
        replacement.code +
        output.slice(replacement.end)
    }

    return output
  }

  registerSetupFunction(fn: AstNode, body: AstNode): void {
    this.setupFunctions.push({ fn, body, instanceLocal: null })
  }

  isInsideSetup(node: AstNode): boolean {
    return this.setupFunctions.some(
      setup => node.start >= setup.fn.start && node.end <= setup.fn.end
    )
  }

  requestCompositionRenderInstance(node: AstNode): string {
    const setup = this.setupFunctions.find(
      item => node.start >= item.fn.start && node.end <= item.fn.end
    )

    if (!setup) {
      this.error('Composition render instance requested outside setup()', node)
    }

    if (!setup.instanceLocal) {
      setup.instanceLocal = this.makeUniqueName('__currentInstance')
    }

    return setup.instanceLocal
  }

  finalizeCompositionRenderInstances(importSource: string): void {
    const setups = this.setupFunctions.filter(setup => setup.instanceLocal)
    if (setups.length === 0) return

    const getCurrentInstance = this.requestNamedImport(
      importSource,
      'getCurrentInstance',
      'getCurrentInstance'
    )

    for (const setup of setups) {
      const declaration =
        `const ${setup.instanceLocal} = ${getCurrentInstance}().proxy;`

      if (setup.body.type === 'BlockStatement') {
        this.s.appendLeft(setup.body.start + 1, `\n${declaration}`)
        continue
      }

      if (setup.fn.type === 'ArrowFunctionExpression') {
        this.s.appendLeft(setup.body.start, `{ ${declaration} return `)
        this.s.appendRight(setup.body.end, '; }')
        continue
      }

      this.error(
        'setup() must use a block body when Composition render-instance helpers are required',
        setup.body
      )
    }
  }

  addRenderReplacement(node: AstNode, code: string): void {
    const existing = this.renderReplacements.find(
      replacement => replacement.start === node.start && replacement.end === node.end
    )
    if (existing) {
      existing.code = code
    } else {
      this.renderReplacements.push({ start: node.start, end: node.end, code })
    }
  }

  hasBinding(name: string, node?: AstNode): boolean {
    return node
      ? this.scopeAnalyzer.hasBinding(name, node)
      : this.boundNames.has(name)
  }


  hasTopLevelBinding(name: string): boolean {
    return this.topLevelBindings.has(name)
  }

  makeUniqueName(preferred: string): string {
    let candidate = preferred
    let index = 1

    while (this.usedNames.has(candidate)) {
      candidate = `${preferred}${index}`
      index += 1
    }

    this.usedNames.add(candidate)
    return candidate
  }

  requestExactNamedImport(
    source: string,
    imported: string,
    local: string
  ): string {
    const existing = this.existingNamedImports.get(source)?.get(imported)
    if (existing === local) return local

    const queued = this.imports.find(
      item => item.source === source && item.imported === imported && item.local === local
    )
    if (queued) return queued.local

    this.imports.push({ source, imported, local })
    this.usedNames.add(local)
    this.topLevelBindings.add(local)
    return local
  }

  requestNamedImport(
    source: string,
    imported: string,
    preferredLocal: string
  ): string {
    const existing = this.existingNamedImports.get(source)?.get(imported)
    if (existing) return existing

    const queued = this.imports.find(
      item => item.source === source && item.imported === imported
    )
    if (queued) return queued.local

    const local = this.makeUniqueName(preferredLocal)
    this.imports.push({ source, imported, local })
    return local
  }

  injectImports(): void {
    if (this.imports.length === 0) return

    const grouped = new Map<string, ImportRequest[]>()
    for (const request of this.imports) {
      const list = grouped.get(request.source) ?? []
      list.push(request)
      grouped.set(request.source, list)
    }

    const lines: string[] = []
    for (const [source, requests] of grouped) {
      const specifiers = requests
        .map(request =>
          request.imported === request.local
            ? request.imported
            : `${request.imported} as ${request.local}`
        )
        .join(', ')
      lines.push(`import { ${specifiers} } from ${JSON.stringify(source)};`)
    }

    const insertionPoint = this.code.startsWith('#!')
      ? this.code.indexOf('\n') + 1
      : 0

    this.s.appendLeft(insertionPoint, `${lines.join('\n')}\n`)
  }

  private analyzeProgram(): void {
    walk(this.ast as unknown as AstNode, node => {
      if (node.type === 'Identifier') {
        const name = node.name
        if (typeof name === 'string') this.usedNames.add(name)
      }

      if (node.type === 'VariableDeclarator') {
        this.collectBindingPattern(node.id as AstNode)
      }

      if (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') {
        const id = node.id as AstNode | null
        if (id) this.collectBindingPattern(id)
      }

      if (
        node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression'
      ) {
        for (const parameter of (node.params ?? []) as AstNode[]) {
          this.collectBindingPattern(parameter)
        }
      } else if (node.type === 'CatchClause' && node.param) {
        this.collectBindingPattern(node.param as AstNode)
      }
    })

    for (const statement of this.ast.body as unknown as AstNode[]) {
      this.collectTopLevelStatement(statement)
    }

    for (const statement of this.ast.body as unknown as AstNode[]) {
      if (statement.type !== 'ImportDeclaration') continue

      const sourceNode = statement.source as AstNode & { value?: unknown }
      const source = sourceNode?.value
      if (typeof source !== 'string') continue

      const named = this.existingNamedImports.get(source) ?? new Map<string, string>()
      const specifiers = (statement.specifiers ?? []) as AstNode[]

      for (const specifier of specifiers) {
        const localNode = specifier.local as AstNode & { name?: unknown }
        const local = typeof localNode?.name === 'string' ? localNode.name : null
        if (local) {
          this.boundNames.add(local)
          this.topLevelBindings.add(local)
        }

        if (specifier.type !== 'ImportSpecifier') continue

        const importedNode = specifier.imported as AstNode & { name?: unknown; value?: unknown }
        const imported =
          typeof importedNode?.name === 'string'
            ? importedNode.name
            : typeof importedNode?.value === 'string'
              ? importedNode.value
              : null

        if (imported && local) named.set(imported, local)
      }

      this.existingNamedImports.set(source, named)
    }
  }

  private collectTopLevelStatement(statement: AstNode): void {
    if (statement.type === 'ImportDeclaration') {
      for (const specifier of (statement.specifiers ?? []) as AstNode[]) {
        const local = specifier.local as AstNode | undefined
        if (local?.type === 'Identifier' && typeof local.name === 'string') {
          this.topLevelBindings.add(local.name)
        }
      }
      return
    }

    if (statement.type === 'VariableDeclaration') {
      for (const declarator of (statement.declarations ?? []) as AstNode[]) {
        this.collectTopLevelPattern(declarator.id as AstNode)
      }
      return
    }

    if (statement.type === 'FunctionDeclaration' || statement.type === 'ClassDeclaration') {
      this.collectTopLevelPattern(statement.id as AstNode | null)
      return
    }

    if (statement.type === 'ExportNamedDeclaration' && statement.declaration) {
      this.collectTopLevelStatement(statement.declaration as AstNode)
    }
  }

  private collectTopLevelPattern(pattern: AstNode | null | undefined): void {
    if (!pattern) return
    if (pattern.type === 'Identifier' && typeof pattern.name === 'string') {
      this.topLevelBindings.add(pattern.name)
      return
    }
    if (pattern.type === 'RestElement') {
      this.collectTopLevelPattern(pattern.argument as AstNode)
      return
    }
    if (pattern.type === 'AssignmentPattern') {
      this.collectTopLevelPattern(pattern.left as AstNode)
      return
    }
    if (pattern.type === 'ArrayPattern') {
      for (const element of (pattern.elements ?? []) as Array<AstNode | null>) {
        this.collectTopLevelPattern(element)
      }
      return
    }
    if (pattern.type === 'ObjectPattern') {
      for (const property of (pattern.properties ?? []) as AstNode[]) {
        if (property.type === 'Property') {
          this.collectTopLevelPattern(property.value as AstNode)
        } else if (property.type === 'RestElement') {
          this.collectTopLevelPattern(property.argument as AstNode)
        }
      }
    }
  }
  private collectBindingPattern(pattern: AstNode | null | undefined): void {
    if (!pattern) return

    if (pattern.type === 'Identifier') {
      const name = pattern.name
      if (typeof name === 'string') this.boundNames.add(name)
      return
    }

    if (pattern.type === 'RestElement') {
      this.collectBindingPattern(pattern.argument as AstNode)
      return
    }

    if (pattern.type === 'AssignmentPattern') {
      this.collectBindingPattern(pattern.left as AstNode)
      return
    }

    if (pattern.type === 'ArrayPattern') {
      for (const element of (pattern.elements ?? []) as Array<AstNode | null>) {
        this.collectBindingPattern(element)
      }
      return
    }

    if (pattern.type === 'ObjectPattern') {
      for (const property of (pattern.properties ?? []) as AstNode[]) {
        if (property.type === 'Property') {
          this.collectBindingPattern(property.value as AstNode)
        } else if (property.type === 'RestElement') {
          this.collectBindingPattern(property.argument as AstNode)
        }
      }
    }
  }

}
