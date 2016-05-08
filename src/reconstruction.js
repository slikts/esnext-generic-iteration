'use strict'

const reconstructSymbol = Symbol('Symbol.reconstruct')

const Species = obj => obj.constructor && obj.constructor[Symbol.species]

function ArrayReconstructor() {
  let species = Species(this)
  let result = new (Array.isArray(species) ? species : Array)
  return {
    enter(v) {
      result.push(v)
    },
    result,
  }
}

function MapReconstructor() {
  let species = Species(this)
  let result = new (species instanceof Map ? species : Map)
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
