// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/iterator.ts
import { isIterable } from "./module-0010.mjs";


// src/vs/base/common/iterator.ts
var Iterable;

((Iterable2) => {
  function is(thing) {
    return !!thing && typeof thing === "object" && typeof thing[Symbol.iterator] === "function";
  }
  Iterable2.is = is;
  const _empty2 = Object.freeze([]);
  function empty() {
    return _empty2;
  }
  Iterable2.empty = empty;
  function* single(element) {
    yield element;
  }
  Iterable2.single = single;
  function wrap(iterableOrElement) {
    if (is(iterableOrElement)) {
      return iterableOrElement;
    } else {
      return single(iterableOrElement);
    }
  }
  Iterable2.wrap = wrap;
  function from(iterable) {
    return iterable ?? _empty2;
  }
  Iterable2.from = from;
  function* reverse(array3) {
    for (let i2 = array3.length - 1; i2 >= 0; i2--) {
      yield array3[i2];
    }
  }
  Iterable2.reverse = reverse;
  function isEmpty(iterable) {
    return !iterable || iterable[Symbol.iterator]().next().done === true;
  }
  Iterable2.isEmpty = isEmpty;
  function first2(iterable) {
    return iterable[Symbol.iterator]().next().value;
  }
  Iterable2.first = first2;
  function some(iterable, predicate) {
    let i2 = 0;
    for (const element of iterable) {
      if (predicate(element, i2++)) {
        return true;
      }
    }
    return false;
  }
  Iterable2.some = some;
  function every(iterable, predicate) {
    let i2 = 0;
    for (const element of iterable) {
      if (!predicate(element, i2++)) {
        return false;
      }
    }
    return true;
  }
  Iterable2.every = every;
  function find2(iterable, predicate) {
    for (const element of iterable) {
      if (predicate(element)) {
        return element;
      }
    }
    return void 0;
  }
  Iterable2.find = find2;
  function* filter2(iterable, predicate) {
    for (const element of iterable) {
      if (predicate(element)) {
        yield element;
      }
    }
  }
  Iterable2.filter = filter2;
  function* map(iterable, fn) {
    let index2 = 0;
    for (const element of iterable) {
      yield fn(element, index2++);
    }
  }
  Iterable2.map = map;
  function* flatMap(iterable, fn) {
    let index2 = 0;
    for (const element of iterable) {
      yield* fn(element, index2++);
    }
  }
  Iterable2.flatMap = flatMap;
  function* concat4(...iterables) {
    for (const item of iterables) {
      if (isIterable(item)) {
        yield* item;
      } else {
        yield item;
      }
    }
  }
  Iterable2.concat = concat4;
  function reduce(iterable, reducer, initialValue) {
    let value2 = initialValue;
    for (const element of iterable) {
      value2 = reducer(value2, element);
    }
    return value2;
  }
  Iterable2.reduce = reduce;
  function length(iterable) {
    let count2 = 0;
    for (const _ of iterable) {
      count2++;
    }
    return count2;
  }
  Iterable2.length = length;
  function* slice(arr, from2, to = arr.length) {
    if (from2 < -arr.length) {
      from2 = 0;
    }
    if (from2 < 0) {
      from2 += arr.length;
    }
    if (to < 0) {
      to += arr.length;
    } else if (to > arr.length) {
      to = arr.length;
    }
    for (; from2 < to; from2++) {
      yield arr[from2];
    }
  }
  Iterable2.slice = slice;
  function consume(iterable, atMost = Number.POSITIVE_INFINITY) {
    const consumed = [];
    if (atMost === 0) {
      return [consumed, iterable];
    }
    const iterator = iterable[Symbol.iterator]();
    for (let i2 = 0; i2 < atMost; i2++) {
      const next = iterator.next();
      if (next.done) {
        return [consumed, Iterable2.empty()];
      }
      consumed.push(next.value);
    }
    return [consumed, { [Symbol.iterator]() {
      return iterator;
    } }];
  }
  Iterable2.consume = consume;
  async function asyncToArray(iterable) {
    const result = [];
    for await (const item of iterable) {
      result.push(item);
    }
    return result;
  }
  Iterable2.asyncToArray = asyncToArray;
  async function asyncToArrayFlat(iterable) {
    let result = [];
    for await (const item of iterable) {
      result = result.concat(item);
    }
    return result;
  }
  Iterable2.asyncToArrayFlat = asyncToArrayFlat;
})(Iterable || (Iterable = {}));
export { Iterable };
