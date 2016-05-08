'use strict'

const {reconstructSymbol, ArrayReconstructor} = require('./reconstruction')

const shapeSymbol = Object.assign(Symbol('Symbol.shape'), {
  entries: Symbol('Symbol.shape.entries'),
  indexed: Symbol('Symbol.shape.indexed'),
})

function WrappedIterable(iterable) {
  const shape = iterable[shapeSymbol]
  const origIterator = iterable[Symbol.iterator]()
  const next = (fn) => () => {
    const obj = origIterator.next()
    return Object.assign(obj, {value: fn(obj.value)})
  }
  const iterator = {}
  if (shape === shapeSymbol.indexed) {
    let i = 0
    iterator.next = next((value) => [value, i++])
  } else if (shape === shapeSymbol.entries) {
    iterator.next = next((value = []) => value.slice(0, 2))
  } else {
    iterator.next = next((value) => [value, null])
  }
  return {[Symbol.iterator]: () => iterator}
}

const Reconstructor = obj => (obj[reconstructSymbol] || ArrayReconstructor).call(obj)

const methods = {
  map(iterable, callback, thisArg = null) {
    const {result, enter} = Reconstructor(iterable)
    for (const [value, key] of WrappedIterable(iterable)) {
      enter(callback.call(thisArg, value, key, iterable), key)
    }
    return result
  },
  reduce(iterable, callback, ...initParams) {
    let result
    for (const [value, ...params] of WrappedIterable(iterable)) {
      if (initParams) {
        if (initParams.length) {
          result = callback(initParams[0], value, ...params)
        } else {
          result = value
        }
        initParams = null
      } else {
        result = callback(result, value, ...params)
      }
    }
    return result
  },
  filter(iterable, callback, thisArg = null) {
    const {result, enter} = Reconstructor(iterable)
    for (const [value, key] of WrappedIterable(iterable)) {
      if (callback.call(thisArg, value, key, iterable)) {
        enter(value, key)
      }
    }
    return result
  },
}

module.exports = {
  methods,
  shapeSymbol,
  WrappedIterable,
}
