'use strict'

const {methods, shapeSymbol} = require('./iteration')
const {reconstructSymbol, ArrayReconstructor, MapReconstructor} = require('./reconstruction')

Symbol.shape = shapeSymbol
Symbol.reconstruct = reconstructSymbol

Object.assign(Object, methods)

Object.assign(Array.prototype, {
  [shapeSymbol]: shapeSymbol.indexed,
  [reconstructSymbol]: ArrayReconstructor,
})
Object.assign(Map.prototype, {
  [shapeSymbol]: shapeSymbol.entries,
  [reconstructSymbol]: MapReconstructor,
})
