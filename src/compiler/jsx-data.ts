import type { AstNode } from './ast'
import type { CompilerContext } from './context'
import { DataSequence } from './data-builder'
import {
  compileDirective,
  isDirectiveName,
  parseDirectiveName
} from './directives'
import {
  getJsxAttributeName,
  getJsxAttributeValue
} from './jsx-attribute'
import { applyVModel, type VModelTagInfo } from './v-model'
import { compileVOn, isVOnDirective } from './v-on'

const ROOT_ATTRIBUTES = new Set([
  'staticClass',
  'class',
  'style',
  'key',
  'ref',
  'refInFor',
  'slot',
  'scopedSlots',
  'model'
])

const PREFIXES = ['props', 'domProps', 'on', 'nativeOn', 'hook', 'attrs'] as const
const DOM_PROPS_VALUE_ELEMENTS = new Set(['input', 'textarea', 'option', 'select'])
const DOM_PROPS_ELEMENTS = new Set([...DOM_PROPS_VALUE_ELEMENTS, 'video'])

export interface JsxDataTagInfo extends VModelTagInfo {
  type: string
}

export function compileJsxData(
  openingElement: AstNode,
  tag: JsxDataTagInfo,
  context: CompilerContext
): string | null {
  const attributes = (openingElement.attributes ?? []) as AstNode[]
  if (attributes.length === 0) return null

  const data = new DataSequence(context)
  const consumed = applyVModel(attributes, tag, data, context)
  const staticType = findStaticType(attributes)

  for (let index = 0; index < attributes.length; index += 1) {
    if (consumed.has(index)) continue
    const attribute = attributes[index]

    if (attribute.type === 'JSXSpreadAttribute') {
      if (!applyOptimizedGroupSpread(attribute.argument as AstNode, data, context)) {
        data.pushSpread(context.renderNode(attribute.argument as AstNode))
      }
      continue
    }

    if (attribute.type !== 'JSXAttribute') {
      context.error(`Unsupported JSX attribute: ${attribute.type}`, attribute)
    }

    const rawName = getJsxAttributeName(attribute)
    if (!rawName) context.error('Unable to read JSX attribute name', attribute)

    const value = getJsxAttributeValue(attribute, context)

    if (context.options.vOn && isVOnDirective(rawName)) {
      const event = compileVOn(
        rawName,
        value.expression ? value.code : null,
        context,
        attribute
      )
      data.segment.addGroup(event.group, event.event, event.handler)
      continue
    }

    if (isVModelName(rawName)) {
      // v-model=false: preserve it as a normal runtime directive.
      const directive = parseDirectiveName(rawName)
      if (directive) data.segment.addDirective(compileDirective(directive, value.code))
      continue
    }

    const parsed = parseAttributeName(rawName)

    if (
      PREFIXES.includes(parsed.base as (typeof PREFIXES)[number]) &&
      rawName === parsed.base &&
      value.isExpression
    ) {
      data.segment.addGroupSpread(parsed.base, value.code)
      continue
    }

    if (ROOT_ATTRIBUTES.has(parsed.name)) {
      data.segment.addRoot(parsed.name, value.code)
      continue
    }

    if (isDirectiveName(parsed.name)) {
      const directive = parseDirectiveName(rawName)
      if (!directive) context.error(`Invalid directive name: ${rawName}`, attribute)
      data.segment.addDirective(compileDirective(directive, value.code))
      continue
    }

    let group = parsed.group
    let name = parsed.name

    if (
      group === 'attrs' &&
      value.isExpression &&
      mustUseDomProps(tag.name, staticType, name)
    ) {
      group = 'domProps'
    }

    name = [name, ...parsed.modifiers].join('_')
    name = name.replace(/^xlink([A-Z])/, (_, letter: string) => `xlink:${letter.toLowerCase()}`)

    data.segment.addGroup(group, name, value.code)
  }

  return data.toCode()
}

function applyOptimizedGroupSpread(
  argument: AstNode,
  data: DataSequence,
  context: CompilerContext
): boolean {
  if (argument.type !== 'ObjectExpression') return false

  const properties = (argument.properties ?? []) as AstNode[]
  const entries: Array<{ group: string; value: AstNode }> = []
  const directiveEntries: AstNode[] = []

  for (const property of properties) {
    if (property.type !== 'Property' || property.computed) return false
    const key = property.key as AstNode & { name?: unknown; value?: unknown }
    const name = key.type === 'Identifier' && typeof key.name === 'string'
      ? key.name
      : key.type === 'Literal' && typeof key.value === 'string'
        ? key.value
        : null
    if (name === 'directives') {
      directiveEntries.push(property.value as AstNode)
      continue
    }
    if (!name || !PREFIXES.includes(name as (typeof PREFIXES)[number])) {
      return false
    }
    entries.push({ group: name, value: property.value as AstNode })
  }

  for (const entry of entries) {
    data.segment.addGroupSpread(entry.group, context.renderNode(entry.value))
  }
  for (const directiveEntry of directiveEntries) {
    data.segment.addDirectiveSpread(context.renderNode(directiveEntry))
  }
  return true
}

function parseAttributeName(rawName: string): {
  base: string
  name: string
  group: string
  argument: string | null
  modifiers: string[]
} {
  const [baseWithArgument, ...modifiers] = rawName.split('_')
  const colonIndex = baseWithArgument.indexOf(':')
  const base = colonIndex >= 0
    ? baseWithArgument.slice(0, colonIndex)
    : baseWithArgument
  const argument = colonIndex >= 0
    ? baseWithArgument.slice(colonIndex + 1)
    : null

  const group = PREFIXES.find(prefix => base.startsWith(prefix)) ?? 'attrs'
  let name = base.replace(new RegExp(`^${group}-?`), '')
  if (!name) name = group
  name = name.charAt(0).toLowerCase() + name.slice(1)

  return { base, name, group, argument, modifiers }
}

function mustUseDomProps(
  tagName: string | null,
  type: string,
  name: string
): boolean {
  if (!tagName || !DOM_PROPS_ELEMENTS.has(tagName)) return false

  return (
    (name === 'value' && DOM_PROPS_VALUE_ELEMENTS.has(tagName) && type !== 'button') ||
    (name === 'selected' && tagName === 'option') ||
    (name === 'checked' && tagName === 'input') ||
    (name === 'muted' && tagName === 'video')
  )
}

function findStaticType(attributes: AstNode[]): string {
  const typeAttribute = attributes.find(
    attribute => getJsxAttributeName(attribute) === 'type'
  )
  const value = typeAttribute?.value as AstNode | null | undefined
  return value?.type === 'Literal' && typeof value.value === 'string'
    ? value.value
    : ''
}

function isVModelName(name: string): boolean {
  return name === 'v-model' || name === 'vModel' || name.startsWith('v-model_') || name.startsWith('vModel_')
}
