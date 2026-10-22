// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/history.ts
import { ArrayNavigator } from "./module-0598.mjs";
import { SetWithKey } from "./module-0003.mjs";


// src/vs/base/common/history.ts
var HistoryNavigator = class {
  constructor(_history = /* @__PURE__ */ new Set(), limit = 10) {
    this._history = _history;
    this._limit = limit;
    this._onChange();
    if (this._history.onDidChange) {
      this._disposable = this._history.onDidChange(() => this._onChange());
    }
  }
  getHistory() {
    return this._elements;
  }
  add(t2) {
    this._history.delete(t2);
    this._history.add(t2);
    this._onChange();
  }
  next() {
    return this._navigator.next();
  }
  previous() {
    if (this._currentPosition() !== 0) {
      return this._navigator.previous();
    }
    return null;
  }
  current() {
    return this._navigator.current();
  }
  first() {
    return this._navigator.first();
  }
  last() {
    return this._navigator.last();
  }
  isFirst() {
    return this._currentPosition() === 0;
  }
  isLast() {
    return this._currentPosition() >= this._elements.length - 1;
  }
  isNowhere() {
    return this._navigator.current() === null;
  }
  has(t2) {
    return this._history.has(t2);
  }
  clear() {
    this._history.clear();
    this._onChange();
  }
  _onChange() {
    this._reduceToLimit();
    const elements = this._elements;
    this._navigator = new ArrayNavigator(elements, 0, elements.length, elements.length);
  }
  _reduceToLimit() {
    const data = this._elements;
    if (data.length > this._limit) {
      const replaceValue = data.slice(data.length - this._limit);
      if (this._history.replace) {
        this._history.replace(replaceValue);
      } else {
        this._history = new Set(replaceValue);
      }
    }
  }
  _currentPosition() {
    const currentElement = this._navigator.current();
    if (!currentElement) {
      return -1;
    }
    return this._elements.indexOf(currentElement);
  }
  get _elements() {
    const elements = [];
    this._history.forEach((e4) => elements.push(e4));
    return elements;
  }
  dispose() {
    if (this._disposable) {
      this._disposable.dispose();
      this._disposable = void 0;
    }
  }
};

var HistoryNavigator2 = class {
  constructor(history, capacity = 10, identityFn = (t2) => t2) {
    this.capacity = capacity;
    this.identityFn = identityFn;
    if (history.length < 1) {
      throw new Error("not supported");
    }
    this._size = 1;
    this.head = this.tail = this.cursor = {
      value: history[0],
      previous: void 0,
      next: void 0
    };
    this.valueSet = new SetWithKey([history[0]], identityFn);
    for (let i2 = 1; i2 < history.length; i2++) {
      this.add(history[i2]);
    }
  }
  get size() {
    return this._size;
  }
  add(value2) {
    const node = {
      value: value2,
      previous: this.tail,
      next: void 0
    };
    this.tail.next = node;
    this.tail = node;
    this.cursor = this.tail;
    this._size++;
    if (this.valueSet.has(value2)) {
      this._deleteFromList(value2);
    } else {
      this.valueSet.add(value2);
    }
    while (this._size > this.capacity) {
      this.valueSet.delete(this.head.value);
      this.head = this.head.next;
      this.head.previous = void 0;
      this._size--;
    }
  }
  /**
   * @returns old last value
   */
  replaceLast(value2) {
    if (this.identityFn(this.tail.value) === this.identityFn(value2)) {
      return value2;
    }
    const oldValue = this.tail.value;
    this.valueSet.delete(oldValue);
    this.tail.value = value2;
    if (this.valueSet.has(value2)) {
      this._deleteFromList(value2);
    } else {
      this.valueSet.add(value2);
    }
    return oldValue;
  }
  prepend(value2) {
    if (this._size === this.capacity || this.valueSet.has(value2)) {
      return;
    }
    const node = {
      value: value2,
      previous: void 0,
      next: this.head
    };
    this.head.previous = node;
    this.head = node;
    this._size++;
    this.valueSet.add(value2);
  }
  isAtEnd() {
    return this.cursor === this.tail;
  }
  current() {
    return this.cursor.value;
  }
  previous() {
    if (this.cursor.previous) {
      this.cursor = this.cursor.previous;
    }
    return this.cursor.value;
  }
  next() {
    if (this.cursor.next) {
      this.cursor = this.cursor.next;
    }
    return this.cursor.value;
  }
  has(t2) {
    return this.valueSet.has(t2);
  }
  resetCursor() {
    this.cursor = this.tail;
    return this.cursor.value;
  }
  *[Symbol.iterator]() {
    let node = this.head;
    while (node) {
      yield node.value;
      node = node.next;
    }
  }
  _deleteFromList(value2) {
    let temp = this.head;
    const valueKey = this.identityFn(value2);
    while (temp !== this.tail) {
      if (this.identityFn(temp.value) === valueKey) {
        if (temp === this.head) {
          this.head = this.head.next;
          this.head.previous = void 0;
        } else {
          temp.previous.next = temp.next;
          temp.next.previous = temp.previous;
        }
        this._size--;
      }
      temp = temp.next;
    }
  }
};
export { HistoryNavigator, HistoryNavigator2 };
