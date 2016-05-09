'use strict'

const {reconstructSymbol, ArrayReconstructor} = require('./reconstruction')

const shapeSymbol = Object.assign(Symbol('Symbol.shape'), {
  entries: Symbol('Symbol.shape.entries'),
  indexed: Symbol('Symbol.shape.indexed'),
})

/* Creates a new object with an @@iterator method that wraps the original
   and 'normalizes' its return values based on the @@shape property of
   the original iterable object
   */
function WrappedIterable(iterable) {
  const shape = iterable[shapeSymbol]
  const origIterator = iterable[Symbol.iterator]()
  const next = (fn) => () => {
    const result = origIterator.next()
    // Apply callback to the value
    return Object.assign(result, {value: fn(result.value)})
  }
  const iterator = {}
  // Determine how to construct the return value based on the @@shape property
  if (shape === shapeSymbol.indexed) {
    let i = 0
    iterator.next = next((value) => [value, i++])
  } else if (shape === shapeSymbol.entries) {
    // Original iterator returns key and value pairs
    iterator.next = next((value = []) => value.slice(0, 2))
  } else {
    // Default shape, values wihout keys
    iterator.next = next((value) => [value, null])
  }
  return {[Symbol.iterator]: () => iterator}
}

const Reconstructor = obj => (obj[reconstructSymbol] || ArrayReconstructor).call(obj)

/* Generic methods for iterating over iterable objects; the method singature
   matches that of the Array.prototype methods. The return values are
   of the same type as the input for objects that support the 'reconstructible'
   protocol (based on the @@reconstruct method), otherwise the return values
   are Array objects.
   */
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
  every(iterable, callback, thisArg = null) {
    for (const [value, key] of WrappedIterable(iterable)) {
      if (!callback.call(thisArg, value, key, iterable)) {
        return false
      }
    }
    return true
  },
  some(iterable, callback, thisArg = null) {
    for (const [value, key] of WrappedIterable(iterable)) {
      if (callback.call(thisArg, value, key, iterable)) {
        return true
      }
    }
    return false
  },
  forEach(iterable, callback, thisArg = null) {
    for (const [value, key] of WrappedIterable(iterable)) {
      callback.call(thisArg, value, key, iterable)
    }
  },
}

module.exports = {
  methods,
  shapeSymbol,
  WrappedIterable,
}
