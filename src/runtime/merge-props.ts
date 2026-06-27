export const PUBLIC_RUNTIME_ID = 'virtual:vue2-jsx-oxc/runtime'
export const RESOLVED_RUNTIME_ID = '\0vue2-jsx-oxc/runtime'

export const runtimeCode = `
const normalMerge = ['attrs', 'props', 'domProps']
const toArrayMerge = ['class', 'style']
const functionalMerge = ['on', 'nativeOn']


function appendDirectives(target, value) {
  if (value == null) return target
  if (!Array.isArray(value)) return target.concat(value)

  for (const directive of value) {
    if (Array.isArray(directive)) {
      target = appendDirectives(target, directive)
    } else if (directive != null) {
      target.push(directive)
    }
  }

  return target
}

function mergeFn(a, b) {
  return function mergedHook() {
    if (a) a.apply(this, arguments)
    if (b) b.apply(this, arguments)
  }
}


export function toNumber(value) {
  const number = Number.parseFloat(value)
  return Number.isNaN(number) ? value : number
}

export function looseEqual(a, b) {
  if (a === b) return true

  const aIsObject = a !== null && typeof a === 'object'
  const bIsObject = b !== null && typeof b === 'object'

  if (aIsObject && bIsObject) {
    try {
      const aIsArray = Array.isArray(a)
      const bIsArray = Array.isArray(b)

      if (aIsArray && bIsArray) {
        return a.length === b.length && a.every((item, index) => looseEqual(item, b[index]))
      }
      if (aIsArray !== bIsArray) return false

      const aKeys = Object.keys(a)
      const bKeys = Object.keys(b)
      return aKeys.length === bKeys.length && aKeys.every(key => looseEqual(a[key], b[key]))
    } catch {
      return false
    }
  }

  if (!aIsObject && !bIsObject) {
    return String(a) === String(b)
  }

  return false
}

export function looseIndexOf(values, value) {
  for (let index = 0; index < values.length; index += 1) {
    if (looseEqual(values[index], value)) return index
  }
  return -1
}

export function checkKeyCodes(eventKeyCode, key, builtInKeyCode, eventKey, builtInKeyName) {
  if (builtInKeyName && eventKey) {
    const names = Array.isArray(builtInKeyName) ? builtInKeyName : [builtInKeyName]
    return names.indexOf(eventKey) < 0
  }

  if (builtInKeyCode != null) {
    const codes = Array.isArray(builtInKeyCode) ? builtInKeyCode : [builtInKeyCode]
    return codes.indexOf(eventKeyCode) < 0
  }

  if (eventKey) {
    return String(eventKey).toLowerCase() !== String(key).toLowerCase()
  }

  return eventKeyCode == null
}

export function mergeVue2JsxData(items) {
  return items.reduce((result, item) => {
    if (!item) return result

    for (const key in item) {
      if (!Object.prototype.hasOwnProperty.call(item, key)) continue
      const value = item[key]

      if (key === 'directives') {
        result.directives = appendDirectives(
          Array.isArray(result.directives) ? result.directives : [],
          value
        )
      } else if (result[key] == null) {
        result[key] = value
      } else if (normalMerge.indexOf(key) >= 0) {
        result[key] = Object.assign({}, result[key], value)
      } else if (toArrayMerge.indexOf(key) >= 0) {
        const previous = Array.isArray(result[key]) ? result[key] : [result[key]]
        const next = Array.isArray(value) ? value : [value]
        result[key] = previous.concat(next)
      } else if (functionalMerge.indexOf(key) >= 0) {
        const target = result[key]
        for (const eventName in value) {
          if (!Object.prototype.hasOwnProperty.call(value, eventName)) continue
          if (target[eventName]) {
            const previous = Array.isArray(target[eventName])
              ? target[eventName]
              : [target[eventName]]
            const next = Array.isArray(value[eventName])
              ? value[eventName]
              : [value[eventName]]
            target[eventName] = previous.concat(next)
          } else {
            target[eventName] = value[eventName]
          }
        }
      } else if (key === 'hook') {
        const target = result[key]
        for (const hookName in value) {
          if (!Object.prototype.hasOwnProperty.call(value, hookName)) continue
          target[hookName] = target[hookName]
            ? mergeFn(target[hookName], value[hookName])
            : value[hookName]
        }
      } else {
        result[key] = value
      }
    }

    return result
  }, {})
}
`
