const {methods: {map, filter, reduce}, WrappedIterable} = require('../src/iteration')

require('../src/polyfill')

const assert = require('chai').assert

describe('WrappedIterable', () => {
  let makeIter = x => WrappedIterable(x)[Symbol.iterator]()
  it('should iterate', () => {
    let i = makeIter([1,2])
    assert.equal(i.next().value[0], 1)
    assert.equal(i.next().value[0], 2)
    assert.equal(i.next().value, undefined)
  })
})

describe('methods', () => {
  describe('map()', () => {
    it('should map over strings and arrays', () => {
      let q = x => x + 1
      assert.deepEqual(map([9,8,7], q), [9,8,7].map(q))
      assert.deepEqual(map('asd', x => x), 'asd'.split(''))
    })
    it('should map over iterable indexed Array-likes', () => {
      let z = {0: 'a', 1: 'b', length: 2, [Symbol.iterator]: [][Symbol.iterator]}
      assert.deepEqual(map(z, x => x), Array.from(z))
    })
    it('should return Array objects for Arrays and non-reconstructibles', () => {
      assert.isArray(map('asd', x => x))
      assert.isArray(map([1,2], x => x))
    })
    it('should reconstruct Map objects', () => {
      let m = () => new Map([['a',1],['b',2]])
      let toa = (m) => Array.from(m.entries())
      assert.instanceOf(map(m(), x => x), Map)
      assert.deepEqual(toa(map(m(), x => x)), toa(m()))
    })
  })
})
