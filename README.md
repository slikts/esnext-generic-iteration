# Better iteration methods for ES.next

The `Array` [iteration methods][1] added in ES5 offer [advantages][4] over looping constructs in readability and describing intent, but there are certain common pitfalls involved with using the `Array` iteration methods with objects supporting the [iteration protocol][2] (see [Terms][#terms]) added in ES2015:

 * The iterable objects need to be transformed to `Array` objects for the `Array` iteration methods to work (`Function#call()` on the iteration methods with non-`Array`-like contexts doesn't work)
 * Restoring the previous type of the objects after iterating requires an additional transformation
 * No [lazy iteration][3], since the transformation to `Array` is eager unless a looping construct is used
 * The manual transformation calls make the code more complex

Iterators are used in lieu of type-specific iteration methods both in the new types introduced in the core language (`Map`, `Set` and others in ES2015) and in new language constructs like [generators][5] and the upcoming [async functions][6]. Iterators are also added to common `Array`-like objects like `NodeList`. The core language support of iterators has been improved through the addition of the `for..of` looping construct, but this leaves out the users who have become accustomed to the semantics of the `Array` iteration methods added in ES5.

Implementing new iteration methods with generic support for iterable objects would make the language's API more consistent, follow the principle of least surprise for users familiar with `Array` iteration method semantics, and make the language more 'batteries included', as evidenced by the popularity of utility libraries like [lodash][7] that abstract the traversal of collection types in the language.

## Proposal

This document proposes implementing generic iteration methods in the core language with the following characteristics:

 * Similar method and callback signatures to the `Array` iteration methods
   + `method(iterable, callback[, thisArg])` with callback parameters `value`, `key`, `iterable`
   + Returning the input type where applicable and defaulting to `Array` otherwise
 * Support for a minimal protocol to describe the shape of the return values of the iterator, and the construction of the return value of the iteration method
   + Allow describing the shape of the iterator return values as entries (key-value pairs) or indexed to allow populating the `key` callback parameter with the keys or inferred indices
     - Use an empty `key` parameter for all other types
   + Properly support builtin types like Map
   + Use an optional well-known `Symbol` property on the iterable for a method that returns an object that implements the iteration result construction protocol
     - Have a property with the constructed result of the iteration method for returning it
     - Have a method that takes the callback return values and populates the constructed result
     - Use the `Array` return value construction behavior by default

## Code examples

Applying a callback to the values of a `Map` object and returning the same object type:
```
// Using `Array` iteration methods
new Map(Array.from(mapObject).map(callback))

// Using generic iteration methods
map(mapObject, callback)
```

Traversing only part of an infinite iterable:
```
function* count(i = 0) { for(;;) yield i++ }

// Looping constructs and generic iteration methods both allow breaking
every(count(), i => i > 5)
for (let i of count()) if (i > 5) break

 // `Array` transformation hangs, so the `Array` iteration methods can't be used
Array.from(count())
```

[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Iteration_methods
[2]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols
[3]: http://raganwald.com/2015/02/17/lazy-iteratables-in-javascript.html
[4]: https://gist.github.com/robotlolita/7643014
[5]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
[6]: https://github.com/tc39/ecmascript-asyncawait
[7]: https://lodash.com/
