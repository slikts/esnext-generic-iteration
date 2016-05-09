'use strict'

/* The reconstructor objects define how an object may be reconstructed;
   their shape includes an `enter(v[, k])` method and a `result` property.
   Objects that have a @@reconstruct method that returns a Reconstructor
   object support the reconstructible protocol.
   */

const reconstructSymbol = Symbol('Symbol.reconstruct')

const Species = obj => obj.constructor && obj.constructor[Symbol.species]

function ArrayReconstructor() {
  const species = Species(this)
  const result = new (Array.isArray(species) ? species : Array)
  return {
    enter(v) {
      result.push(v)
    },
    result,
  }
}

function MapReconstructor() {
  const species = Species(this)
  const result = new (species instanceof Map ? species : Map)
  return {
    enter(v, k) {
      result.set(v, k)
    },
    result,
  }
}

module.exports = {
  reconstructSymbol,
  ArrayReconstructor,
  MapReconstructor,
}
