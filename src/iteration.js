const shapeSymbol = Object.assign(Symbol('shape'), {
  entries: Symbol('entries'),
  indexed: Symbol('indexed'),
})

function WrappedIterable(iterable) {
  let shape = iterable[shapeSymbol]
  let origIterator = iterable[Symbol.iterator]()
  let next = (fn) => () => {
    let obj = origIterator.next()
    return Object.assign(obj, {value: fn(obj.value)})
  }
  let iterator = {}
  if (shape === shapeSymbol.indexed) {
    let i = 0
    iterator.next = next((value) => [value, i++, iterable])
  } else if (shape === shapeSymbol.entries) {
    iterator.next = next((value) => [...[].concat(value).slice(2), iterable])
  } else {
    iterator.next = next((value) => [value, null, iterable])
  }
  return {[Symbol.iterator]: () => iterator}
}

const methods = {
  map(iterable, callback, thisArg = null) {
    let result = []
    for (let params of WrappedIterable(iterable)) {
      result.push(callback.call(thisArg, ...params))
    }
    return result
  },
  reduce(iterable, callback, ...initParams) {
    let result
    for (let [value, ...params] of WrappedIterable(iterable)) {
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
    let result = []
    for (let [value, ...params] of WrappedIterable(iterable)) {
      if (callback.call(thisArg, value, ...params)) {
        result.push(value)
      }
    }
    return result
  },
}

module.exports = {methods, shapeSymbol, WrappedIterable}
