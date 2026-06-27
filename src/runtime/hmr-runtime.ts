export const PUBLIC_HMR_RUNTIME_ID = 'virtual:vue2-jsx-oxc/hmr-runtime'
export const RESOLVED_HMR_RUNTIME_ID = '\0vue2-jsx-oxc/hmr-runtime'

export const hmrRuntimeCode = `
const records = Object.create(null)

export function createRecord(id, component) {
  if (records[id]) return false

  let Ctor = null
  let options = component
  if (typeof component === 'function') {
    Ctor = component
    options = component.options
  }
  if (!options) return false

  makeOptionsHot(id, options)
  records[id] = { Ctor, options, instances: [] }
  return true
}

export function isRecorded(id) {
  return typeof records[id] !== 'undefined'
}

export const rerender = tryWrap(function rerenderRecord(id, component) {
  const record = records[id]
  if (!record) return

  let options = component
  if (typeof options === 'function') options = options.options

  if (!options) {
    record.instances.slice().forEach(instance => instance.$forceUpdate())
    return
  }

  if (record.Ctor) {
    record.Ctor.options.render = options.render
    record.Ctor.options.staticRenderFns = options.staticRenderFns

    record.instances.slice().forEach(instance => {
      instance.$options.render = options.render
      instance.$options.staticRenderFns = options.staticRenderFns
      if (instance._staticTrees) instance._staticTrees = []
      if (Array.isArray(record.Ctor.options.cached)) record.Ctor.options.cached = []
      if (Array.isArray(instance.$options.cached)) instance.$options.cached = []
      const restore = patchScopedSlots(instance)
      instance.$forceUpdate()
      if (restore) instance.$nextTick(restore)
    })
    return
  }

  record.options.render = options.render
  record.options.staticRenderFns = options.staticRenderFns

  if (record.options.functional) {
    if (Object.keys(options).length > 2) {
      updateOptions(record.options, options)
    } else {
      const injectStyles = record.options._injectStyles
      if (injectStyles) {
        const render = options.render
        record.options.render = function renderWithStyles(h, ctx) {
          injectStyles.call(ctx)
          return render(h, ctx)
        }
      }
    }
    record.options._Ctor = null
    if (Array.isArray(record.options.cached)) record.options.cached = []
    record.instances.slice().forEach(instance => instance.$forceUpdate())
  }
})

export const reload = tryWrap(function reloadRecord(id, component) {
  const record = records[id]
  if (!record) {
    createRecord(id, component)
    return
  }

  let options = component
  if (typeof options === 'function') options = options.options
  if (!options) return

  makeOptionsHot(id, options)

  if (record.Ctor && record.Ctor.super) {
    const nextCtor = record.Ctor.super.extend(options)
    nextCtor.options._Ctor = record.options._Ctor
    record.Ctor.options = nextCtor.options
    record.Ctor.cid = nextCtor.cid
    record.Ctor.prototype = nextCtor.prototype
    if (nextCtor.release) nextCtor.release()
  } else {
    updateOptions(record.options, options)
  }

  record.instances.slice().forEach(instance => {
    if (instance.$vnode && instance.$vnode.context) {
      instance.$vnode.context.$forceUpdate()
    } else {
      console.warn('Root or manually mounted instance modified. Full reload required.')
    }
  })
})

function makeOptionsHot(id, options) {
  if (options.__vue2JsxHotId === id) return
  Object.defineProperty(options, '__vue2JsxHotId', {
    configurable: true,
    value: id
  })

  if (options.functional) {
    const render = options.render
    options.render = function hotFunctionalRender(h, ctx) {
      const record = records[id]
      if (record && ctx && record.instances.indexOf(ctx.parent) < 0) {
        record.instances.push(ctx.parent)
      }
      return render(h, ctx)
    }
    return
  }

  injectHook(options, 'beforeCreate', function hotBeforeCreate() {
    const record = records[id]
    if (!record) return
    if (!record.Ctor) record.Ctor = this.constructor
    if (record.instances.indexOf(this) < 0) record.instances.push(this)
  })

  injectHook(options, 'beforeDestroy', function hotBeforeDestroy() {
    const record = records[id]
    if (!record) return
    const index = record.instances.indexOf(this)
    if (index >= 0) record.instances.splice(index, 1)
  })
}

function injectHook(options, name, hook) {
  const existing = options[name]
  options[name] = existing
    ? Array.isArray(existing)
      ? existing.concat(hook)
      : [existing, hook]
    : [hook]
}

function tryWrap(fn) {
  return function wrapped(id, value) {
    try {
      return fn(id, value)
    } catch (error) {
      console.error(error)
      console.warn('Something went wrong during Vue component hot-reload. Full reload required.')
    }
  }
}

function updateOptions(oldOptions, newOptions) {
  for (const key in oldOptions) {
    if (!(key in newOptions) && key !== '__vue2JsxHotId') delete oldOptions[key]
  }
  for (const key in newOptions) oldOptions[key] = newOptions[key]
}

function patchScopedSlots(instance) {
  if (!instance._u) return null
  const original = instance._u
  instance._u = function patchedResolveScopedSlots(slots) {
    try {
      return original(slots, true)
    } catch {
      return original(slots, null, true)
    }
  }
  return () => {
    instance._u = original
  }
}
`
