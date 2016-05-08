const {methods, shapeSymbol} = require('./iteration')

Symbol.shape = shapeSymbol

Object.assign(Object, methods)
