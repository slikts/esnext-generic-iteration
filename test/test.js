const {methods: {
  map,
  filter,
  reduce,
  every,
  some,
  forEach,
}, WrappedIterable} = require('../src/iteration')

require('../src/polyfill')

const assert = require('chai').assert

describe('WrappedIterable', () => {
  let makeIter = x => WrappedIterable(x)[Symbol.iterator]()
  it('should return an iterator', () => {
    let i = makeIter([11,12])
    assert.equal(i.next().value[0], 11)
    assert.equal(i.next().value[0], 12)
    assert.equal(i.next().value[0], undefined)
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
  describe('filter()', () => {
    it('should return Array objects by default', () => {
      assert.isArray(filter('asd', x => x))
    })
    it('should return Array objects by default', () => {
      assert.isArray(filter('asd', x => x))
    })
    it('should reconstruct Map objects', () => {
      assert.instanceOf(filter(new Map([[1,2]]), x => x), Map)
    })
    it('should filter Map object values', () => {
      assert.deepEqual(filter(new Map([[1,null],[3,4]]).values(), x => x)[0], 4)
    })
  })
  describe('reduce()', () => {
    it('should reduce arrays', () => {
      assert.equal(reduce([1,2,3], (a, b) => a + b), 6)
      assert.equal(reduce([1,2,3], (a, b) => a + b, 1), 7)
    })
    it('should reduce Map object values', () => {
      assert.equal(reduce(new Map([[1,2],[3,4]]), (a, b) => a + b), 4)
    })
  })
  describe('every()', () => {
    it('should return true for all truthy values', () => {
      assert.isTrue(every([1,2,3], x => x))
    })
    it('should return false for any falsy values', () => {
      assert.isFalse(every([1,null], x => x))
    })
    it('should stop iterating after a falsy value', () => {
      let i = 0
      every([1,null,3], (x) => { i++; return x })
      assert.equal(i, 2)
    })
    it('break out of endless', () => {
      let endless = {[Symbol.iterator]() { return function*(i = 0) { for(;;) yield i++ }() }}
      let i = 0
      every(endless, x => { i = x; return x < 5 })
      assert.equal(i, 5)
    })
  })
  describe('some()', () => {
    it('should return true for any truthy values', () => {
      assert.isTrue(some([null,1], x => x))
    })
    it('should return false no truthy values', () => {
      assert.isFalse(some([null,null], x => x))
    })
  })
  describe('forEach()', () => {
    it('should apply side-effects', () => {
      let q = []
      forEach([...Array(5)], () => q.push(5))
      assert.deepEqual([5,5,5,5,5], q)
    })
  })
})
