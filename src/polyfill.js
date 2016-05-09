'use strict'

const {methods, shapeSymbol} = require('./iteration')
const {reconstructSymbol, ArrayReconstructor, MapReconstructor} = require('./reconstruction')

/* Define support for generic iterators on native objects.

   The iterator methods are stored as properties of the Object constructor.
   A typical usage could be such: `const {map, reduce, filter} = Object`
   */

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
