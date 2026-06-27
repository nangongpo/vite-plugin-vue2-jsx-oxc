import type { AstNode } from './ast'
import type { CompilerContext } from './context'
import type { DataSequence } from './data-builder'
import {
  attributeNameEquals,
  getJsxAttributeName,
  getJsxAttributeValue
} from './jsx-attribute'

export interface VModelTagInfo {
  name: string | null
  component: boolean
}

export function applyVModel(
  attributes: AstNode[],
  tag: VModelTagInfo,
  data: DataSequence,
  context: CompilerContext
): Set<number> {
  const consumed = new Set<number>()
  if (!context.options.vModel) return consumed

  const modelIndex = attributes.findIndex(attribute => {
    const name = getJsxAttributeName(attribute)
    return Boolean(name && isVModelName(name))
  })

  if (modelIndex < 0) return consumed

  const modelAttribute = attributes[modelIndex]
  const rawName = getJsxAttributeName(modelAttribute)!
  const value = getJsxAttributeValue(modelAttribute, context)

  if (!value.isExpression || !value.expression) {
    context.error('You have to use a JSX expression inside v-model', modelAttribute)
  }

  consumed.add(modelIndex)
  const modifiers = new Set(rawName.split('_').slice(1))
  const modelExpression = value.code
  const modelNode = value.expression

  if (tag.component) {
    compileComponentModel(modelNode, modelExpression, modifiers, data, context)
    return consumed
  }

  const tagName = tag.name
  if (!tagName) context.error('Unable to resolve the native element used by v-model')

  const type = findStaticType(attributes)

  if (tagName === 'select') {
    compileSelect(modelNode, modifiers, data, context)
  } else if (tagName === 'input' && type === 'checkbox') {
    compileCheckbox(
      attributes,
      consumed,
      modelNode,
      modelExpression,
      modifiers,
      data,
      context
    )
  } else if (tagName === 'input' && type === 'radio') {
    compileRadio(
      attributes,
      consumed,
      modelNode,
      modelExpression,
      modifiers,
      data,
      context
    )
  } else if (tagName === 'input' || tagName === 'textarea') {
    compileDefault(modelNode, modelExpression, modifiers, type, data, context)
  } else {
    context.error(`v-model is not supported on ${tagName}[type=${type}]`)
  }

  data.segment.addDirective(compileModelDirective(modelExpression, modifiers))
  return consumed
}

function isVModelName(name: string): boolean {
  return name === 'v-model' || name === 'vModel' || name.startsWith('v-model_') || name.startsWith('vModel_')
}

function compileComponentModel(
  modelNode: AstNode,
  modelExpression: string,
  modifiers: Set<string>,
  data: DataSequence,
  context: CompilerContext
): void {
  let value = '$$v'

  if (modifiers.has('trim')) {
    value = `(typeof $$v === "string" ? $$v.trim() : $$v)`
  }
  if (modifiers.has('number')) {
    value = toNumber(value, context, modelNode)
  }

  const assignment = compileAssignment(modelNode, value, context)
  data.segment.addRoot(
    'model',
    `{ value: ${modelExpression}, callback: ($$v) => { ${assignment}; } }`
  )
}

function compileSelect(
  modelNode: AstNode,
  modifiers: Set<string>,
  data: DataSequence,
  context: CompilerContext
): void {
  const optionValue = `('_value' in o ? o._value : o.value)`
  const mappedValue = modifiers.has('number')
    ? toNumber(optionValue, context, modelNode)
    : optionValue
  const assignment = compileAssignment(
    modelNode,
    `($event.target.multiple ? $$selectedVal : $$selectedVal[0])`,
    context
  )

  data.segment.addGroup(
    'on',
    'change',
    `($event) => { const $$selectedVal = Array.prototype.filter.call($event.target.options, o => o.selected).map(o => ${mappedValue}); ${assignment}; }`
  )
}

function compileCheckbox(
  attributes: AstNode[],
  consumed: Set<number>,
  modelNode: AstNode,
  modelExpression: string,
  modifiers: Set<string>,
  data: DataSequence,
  context: CompilerContext
): void {
  const value = consumeBinding(attributes, consumed, 'value', context) ?? 'null'
  const trueValue = consumeBinding(attributes, consumed, 'true-value', context) ?? 'true'
  const falseValue = consumeBinding(attributes, consumed, 'false-value', context) ?? 'false'
  const checked = trueValue === 'true'
    ? modelExpression
    : looseEqual(modelExpression, trueValue, context, modelNode)

  data.segment.addGroup(
    'domProps',
    'checked',
    `(Array.isArray(${modelExpression}) ? ${looseIndexOf(modelExpression, value, context, modelNode)} > -1 : ${checked})`
  )

  const normalizedValue = modifiers.has('number')
    ? toNumber(value, context, modelNode)
    : value
  const addAssignment = compileAssignment(
    modelNode,
    `$$a.concat([$$v])`,
    context
  )
  const removeAssignment = compileAssignment(
    modelNode,
    `$$a.slice(0, $$i).concat($$a.slice($$i + 1))`,
    context
  )
  const scalarAssignment = compileAssignment(modelNode, '$$c', context)

  data.segment.addGroup(
    'on',
    'change',
    `($event) => { const $$a = ${modelExpression}; const $$el = $event.target; const $$c = $$el.checked ? ${trueValue} : ${falseValue}; if (Array.isArray($$a)) { const $$v = ${normalizedValue}; const $$i = ${looseIndexOf('$$a', '$$v', context, modelNode)}; if ($$el.checked) { if ($$i < 0) { ${addAssignment}; } } else if ($$i > -1) { ${removeAssignment}; } } else { ${scalarAssignment}; } }`
  )
}

function compileRadio(
  attributes: AstNode[],
  consumed: Set<number>,
  modelNode: AstNode,
  modelExpression: string,
  modifiers: Set<string>,
  data: DataSequence,
  context: CompilerContext
): void {
  let value = consumeBinding(attributes, consumed, 'value', context) ?? 'null'
  if (modifiers.has('number')) value = toNumber(value, context, modelNode)

  data.segment.addGroup(
    'domProps',
    'checked',
    looseEqual(modelExpression, value, context, modelNode)
  )
  data.segment.addGroup(
    'on',
    'change',
    `($event) => { ${compileAssignment(modelNode, value, context)}; }`
  )
}

function compileDefault(
  modelNode: AstNode,
  modelExpression: string,
  modifiers: Set<string>,
  type: string,
  data: DataSequence,
  context: CompilerContext
): void {
  const lazy = modifiers.has('lazy')
  const trim = modifiers.has('trim')
  const number = modifiers.has('number')
  const event = lazy ? 'change' : type === 'range' ? '__r' : 'input'

  let value = '$event.target.value'
  if (trim) value = `${value}.trim()`
  if (number) value = toNumber(value, context, modelNode)

  const statements: string[] = []
  if (!lazy && type !== 'range') {
    statements.push('if ($event.target.composing) return;')
  }
  statements.push(`${compileAssignment(modelNode, value, context)};`)

  data.segment.addGroup('domProps', 'value', modelExpression)
  data.segment.addGroup('on', event, `($event) => { ${statements.join(' ')} }`)

  if (trim || number) {
    data.segment.addGroup(
      'on',
      'blur',
      `($event) => { $event.target.value = ${modelExpression} == null ? "" : ${modelExpression}; }`
    )
  }
}

function compileModelDirective(
  modelExpression: string,
  modifiers: Set<string>
): string {
  const modifierCode = [...modifiers]
    .map(modifier => `${JSON.stringify(modifier)}: true`)
    .join(', ')

  return `{ name: "model", value: ${modelExpression}, modifiers: { ${modifierCode} } }`
}

function compileAssignment(
  modelNode: AstNode,
  value: string,
  context: CompilerContext
): string {
  if (modelNode.type === 'MemberExpression') {
    const object = modelNode.object as AstNode
    const property = modelNode.property as AstNode & { name?: unknown }
    const computed = Boolean(modelNode.computed)

    if (object.type !== 'ThisExpression') {
      const objectCode = context.renderNode(object)
      const propertyCode = computed
        ? context.renderNode(property)
        : JSON.stringify(property.name)
      if (
        context.options.compositionAPI !== false &&
        context.isInsideSetup(modelNode)
      ) {
        const instance = context.requestCompositionRenderInstance(modelNode)
        return `${instance}.$set(${objectCode}, ${propertyCode}, ${value})`
      }
      return `this.$set(${objectCode}, ${propertyCode}, ${value})`
    }
  }

  return `${context.renderNode(modelNode)} = ${value}`
}

function findStaticType(attributes: AstNode[]): string {
  for (const attribute of attributes) {
    if (getJsxAttributeName(attribute) !== 'type') continue
    const value = attribute.value as AstNode | null
    if (value?.type === 'Literal' && typeof value.value === 'string') {
      return value.value
    }
  }
  return ''
}

function consumeBinding(
  attributes: AstNode[],
  consumed: Set<number>,
  expectedName: string,
  context: CompilerContext
): string | null {
  for (let index = 0; index < attributes.length; index += 1) {
    if (consumed.has(index)) continue
    const attribute = attributes[index]
    const name = getJsxAttributeName(attribute)
    if (!name || !attributeNameEquals(name, expectedName)) continue

    consumed.add(index)
    return getJsxAttributeValue(attribute, context).code
  }

  return null
}

function runtimeHelper(
  context: CompilerContext,
  imported: string,
  preferredLocal: string
): string {
  return context.requestNamedImport(
    'virtual:vue2-jsx-oxc/runtime',
    imported,
    preferredLocal
  )
}

function toNumber(
  value: string,
  context: CompilerContext,
  anchor: AstNode
): string {
  const instance = compositionRenderInstance(context, anchor)
  if (instance) return `${instance}._n(${value})`

  const helper = runtimeHelper(context, 'toNumber', '__toNumber')
  return `${helper}(${value})`
}

function looseEqual(
  left: string,
  right: string,
  context: CompilerContext,
  anchor: AstNode
): string {
  const instance = compositionRenderInstance(context, anchor)
  if (instance) return `${instance}._q(${left}, ${right})`

  const helper = runtimeHelper(context, 'looseEqual', '__looseEqual')
  return `${helper}(${left}, ${right})`
}

function looseIndexOf(
  values: string,
  value: string,
  context: CompilerContext,
  anchor: AstNode
): string {
  const instance = compositionRenderInstance(context, anchor)
  if (instance) return `${instance}._i(${values}, ${value})`

  const helper = runtimeHelper(context, 'looseIndexOf', '__looseIndexOf')
  return `${helper}(${values}, ${value})`
}

function compositionRenderInstance(
  context: CompilerContext,
  anchor: AstNode
): string | null {
  if (
    context.options.compositionAPI === false ||
    !context.isInsideSetup(anchor)
  ) {
    return null
  }

  return context.requestCompositionRenderInstance(anchor)
}
