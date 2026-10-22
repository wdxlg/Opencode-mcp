// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/ternarySearchTree.ts
import { compare, compareIgnoreCase, compareSubstring, compareSubstringIgnoreCase } from "./module-0030.mjs";
import { shuffle } from "./module-0007.mjs";
import { assert } from "./module-0009.mjs";


// src/vs/base/common/ternarySearchTree.ts
var StringIterator = class {
  constructor() {
    this._value = "";
    this._pos = 0;
  }
  reset(key3) {
    this._value = key3;
    this._pos = 0;
    return this;
  }
  next() {
    this._pos += 1;
    return this;
  }
  hasNext() {
    return this._pos < this._value.length - 1;
  }
  cmp(a) {
    const aCode = a.charCodeAt(0);
    const thisCode = this._value.charCodeAt(this._pos);
    return aCode - thisCode;
  }
  value() {
    return this._value[this._pos];
  }
};

var ConfigKeysIterator = class {
  constructor(_caseSensitive = true) {
    this._caseSensitive = _caseSensitive;
  }
  reset(key3) {
    this._value = key3;
    this._from = 0;
    this._to = 0;
    return this.next();
  }
  hasNext() {
    return this._to < this._value.length;
  }
  next() {
    this._from = this._to;
    let justSeps = true;
    for (; this._to < this._value.length; this._to++) {
      const ch = this._value.charCodeAt(this._to);
      if (ch === 46 /* Period */) {
        if (justSeps) {
          this._from++;
        } else {
          break;
        }
      } else {
        justSeps = false;
      }
    }
    return this;
  }
  cmp(a) {
    return this._caseSensitive ? compareSubstring(a, this._value, 0, a.length, this._from, this._to) : compareSubstringIgnoreCase(a, this._value, 0, a.length, this._from, this._to);
  }
  value() {
    return this._value.substring(this._from, this._to);
  }
};

var PathIterator = class {
  constructor(_splitOnBackslash = true, _caseSensitive = true) {
    this._splitOnBackslash = _splitOnBackslash;
    this._caseSensitive = _caseSensitive;
  }
  reset(key3) {
    this._from = 0;
    this._to = 0;
    this._value = key3;
    this._valueLen = key3.length;
    for (let pos = key3.length - 1; pos >= 0; pos--, this._valueLen--) {
      const ch = this._value.charCodeAt(pos);
      if (!(ch === 47 /* Slash */ || this._splitOnBackslash && ch === 92 /* Backslash */)) {
        break;
      }
    }
    return this.next();
  }
  hasNext() {
    return this._to < this._valueLen;
  }
  next() {
    this._from = this._to;
    let justSeps = true;
    for (; this._to < this._valueLen; this._to++) {
      const ch = this._value.charCodeAt(this._to);
      if (ch === 47 /* Slash */ || this._splitOnBackslash && ch === 92 /* Backslash */) {
        if (justSeps) {
          this._from++;
        } else {
          break;
        }
      } else {
        justSeps = false;
      }
    }
    return this;
  }
  cmp(a) {
    return this._caseSensitive ? compareSubstring(a, this._value, 0, a.length, this._from, this._to) : compareSubstringIgnoreCase(a, this._value, 0, a.length, this._from, this._to);
  }
  value() {
    return this._value.substring(this._from, this._to);
  }
};

var UriIterator = class {
  constructor(_ignorePathCasing, _ignoreQueryAndFragment) {
    this._ignorePathCasing = _ignorePathCasing;
    this._ignoreQueryAndFragment = _ignoreQueryAndFragment;
    this._states = [];
    this._stateIdx = 0;
  }
  reset(key3) {
    this._value = key3;
    this._states = [];
    if (this._value.scheme) {
      this._states.push(1 /* Scheme */);
    }
    if (this._value.authority) {
      this._states.push(2 /* Authority */);
    }
    if (this._value.path) {
      this._pathIterator = new PathIterator(false, !this._ignorePathCasing(key3));
      this._pathIterator.reset(key3.path);
      if (this._pathIterator.value()) {
        this._states.push(3 /* Path */);
      }
    }
    if (!this._ignoreQueryAndFragment(key3)) {
      if (this._value.query) {
        this._states.push(4 /* Query */);
      }
      if (this._value.fragment) {
        this._states.push(5 /* Fragment */);
      }
    }
    this._stateIdx = 0;
    return this;
  }
  next() {
    if (this._states[this._stateIdx] === 3 /* Path */ && this._pathIterator.hasNext()) {
      this._pathIterator.next();
    } else {
      this._stateIdx += 1;
    }
    return this;
  }
  hasNext() {
    return this._states[this._stateIdx] === 3 /* Path */ && this._pathIterator.hasNext() || this._stateIdx < this._states.length - 1;
  }
  cmp(a) {
    if (this._states[this._stateIdx] === 1 /* Scheme */) {
      return compareIgnoreCase(a, this._value.scheme);
    } else if (this._states[this._stateIdx] === 2 /* Authority */) {
      return compareIgnoreCase(a, this._value.authority);
    } else if (this._states[this._stateIdx] === 3 /* Path */) {
      return this._pathIterator.cmp(a);
    } else if (this._states[this._stateIdx] === 4 /* Query */) {
      return compare(a, this._value.query);
    } else if (this._states[this._stateIdx] === 5 /* Fragment */) {
      return compare(a, this._value.fragment);
    }
    throw new Error();
  }
  value() {
    if (this._states[this._stateIdx] === 1 /* Scheme */) {
      return this._value.scheme;
    } else if (this._states[this._stateIdx] === 2 /* Authority */) {
      return this._value.authority;
    } else if (this._states[this._stateIdx] === 3 /* Path */) {
      return this._pathIterator.value();
    } else if (this._states[this._stateIdx] === 4 /* Query */) {
      return this._value.query;
    } else if (this._states[this._stateIdx] === 5 /* Fragment */) {
      return this._value.fragment;
    }
    throw new Error();
  }
};

var Undef = class _Undef {
  static {
    this.Val = /* @__PURE__ */ Symbol("undefined_placeholder");
  }
  static wrap(value2) {
    return value2 === void 0 ? _Undef.Val : value2;
  }
  static unwrap(value2) {
    return value2 === _Undef.Val ? void 0 : value2;
  }
};

var TernarySearchTreeNode = class {
  constructor() {
    this.height = 1;
    this.value = void 0;
    this.key = void 0;
    this.left = void 0;
    this.mid = void 0;
    this.right = void 0;
  }
  isEmpty() {
    return !this.left && !this.mid && !this.right && this.value === void 0;
  }
  rotateLeft() {
    const tmp = this.right;
    this.right = tmp.left;
    tmp.left = this;
    this.updateHeight();
    tmp.updateHeight();
    return tmp;
  }
  rotateRight() {
    const tmp = this.left;
    this.left = tmp.right;
    tmp.right = this;
    this.updateHeight();
    tmp.updateHeight();
    return tmp;
  }
  updateHeight() {
    this.height = 1 + Math.max(this.heightLeft, this.heightRight);
  }
  balanceFactor() {
    return this.heightRight - this.heightLeft;
  }
  get heightLeft() {
    return this.left?.height ?? 0;
  }
  get heightRight() {
    return this.right?.height ?? 0;
  }
};

var TernarySearchTree = class _TernarySearchTree {
  static forUris(ignorePathCasing = () => false, ignoreQueryAndFragment = () => false) {
    return new _TernarySearchTree(new UriIterator(ignorePathCasing, ignoreQueryAndFragment));
  }
  static forPaths(ignorePathCasing = false) {
    return new _TernarySearchTree(new PathIterator(void 0, !ignorePathCasing));
  }
  static forStrings() {
    return new _TernarySearchTree(new StringIterator());
  }
  static forConfigKeys() {
    return new _TernarySearchTree(new ConfigKeysIterator());
  }
  constructor(segments) {
    this._iter = segments;
  }
  clear() {
    this._root = void 0;
  }
  fill(values, keys) {
    if (keys) {
      const arr = keys.slice(0);
      shuffle(arr);
      for (const k of arr) {
        this.set(k, values);
      }
    } else {
      const arr = values.slice(0);
      shuffle(arr);
      for (const entry of arr) {
        this.set(entry[0], entry[1]);
      }
    }
  }
  set(key3, element) {
    const iter = this._iter.reset(key3);
    let node;
    if (!this._root) {
      this._root = new TernarySearchTreeNode();
      this._root.segment = iter.value();
    }
    const stack = [];
    node = this._root;
    while (true) {
      const val = iter.cmp(node.segment);
      if (val > 0) {
        if (!node.left) {
          node.left = new TernarySearchTreeNode();
          node.left.segment = iter.value();
        }
        stack.push([-1 /* Left */, node]);
        node = node.left;
      } else if (val < 0) {
        if (!node.right) {
          node.right = new TernarySearchTreeNode();
          node.right.segment = iter.value();
        }
        stack.push([1 /* Right */, node]);
        node = node.right;
      } else if (iter.hasNext()) {
        iter.next();
        if (!node.mid) {
          node.mid = new TernarySearchTreeNode();
          node.mid.segment = iter.value();
        }
        stack.push([0 /* Mid */, node]);
        node = node.mid;
      } else {
        break;
      }
    }
    const oldElement = Undef.unwrap(node.value);
    node.value = Undef.wrap(element);
    node.key = key3;
    for (let i2 = stack.length - 1; i2 >= 0; i2--) {
      const node2 = stack[i2][1];
      node2.updateHeight();
      const bf = node2.balanceFactor();
      if (bf < -1 || bf > 1) {
        const d1 = stack[i2][0];
        const d2 = stack[i2 + 1][0];
        if (d1 === 1 /* Right */ && d2 === 1 /* Right */) {
          stack[i2][1] = node2.rotateLeft();
        } else if (d1 === -1 /* Left */ && d2 === -1 /* Left */) {
          stack[i2][1] = node2.rotateRight();
        } else if (d1 === 1 /* Right */ && d2 === -1 /* Left */) {
          node2.right = stack[i2 + 1][1] = stack[i2 + 1][1].rotateRight();
          stack[i2][1] = node2.rotateLeft();
        } else if (d1 === -1 /* Left */ && d2 === 1 /* Right */) {
          node2.left = stack[i2 + 1][1] = stack[i2 + 1][1].rotateLeft();
          stack[i2][1] = node2.rotateRight();
        } else {
          throw new Error();
        }
        if (i2 > 0) {
          switch (stack[i2 - 1][0]) {
            case -1 /* Left */:
              stack[i2 - 1][1].left = stack[i2][1];
              break;
            case 1 /* Right */:
              stack[i2 - 1][1].right = stack[i2][1];
              break;
            case 0 /* Mid */:
              stack[i2 - 1][1].mid = stack[i2][1];
              break;
          }
        } else {
          this._root = stack[0][1];
        }
      }
    }
    return oldElement;
  }
  get(key3) {
    return Undef.unwrap(this._getNode(key3)?.value);
  }
  _getNode(key3) {
    const iter = this._iter.reset(key3);
    let node = this._root;
    while (node) {
      const val = iter.cmp(node.segment);
      if (val > 0) {
        node = node.left;
      } else if (val < 0) {
        node = node.right;
      } else if (iter.hasNext()) {
        iter.next();
        node = node.mid;
      } else {
        break;
      }
    }
    return node;
  }
  has(key3) {
    const node = this._getNode(key3);
    return !(node?.value === void 0 && node?.mid === void 0);
  }
  delete(key3) {
    return this._delete(key3, false);
  }
  deleteSuperstr(key3) {
    return this._delete(key3, true);
  }
  _delete(key3, superStr) {
    const iter = this._iter.reset(key3);
    const stack = [];
    let node = this._root;
    while (node) {
      const val = iter.cmp(node.segment);
      if (val > 0) {
        stack.push([-1 /* Left */, node]);
        node = node.left;
      } else if (val < 0) {
        stack.push([1 /* Right */, node]);
        node = node.right;
      } else if (iter.hasNext()) {
        iter.next();
        stack.push([0 /* Mid */, node]);
        node = node.mid;
      } else {
        break;
      }
    }
    if (!node) {
      return;
    }
    if (superStr) {
      node.left = void 0;
      node.mid = void 0;
      node.right = void 0;
      node.height = 1;
    } else {
      node.key = void 0;
      node.value = void 0;
    }
    if (!node.mid && !node.value) {
      if (node.left && node.right) {
        const stack2 = [[1 /* Right */, node]];
        const min = this._min(node.right, stack2);
        if (min.key) {
          node.key = min.key;
          node.value = min.value;
          node.segment = min.segment;
          const newChild = min.right;
          if (stack2.length > 1) {
            const [dir, parent] = stack2[stack2.length - 1];
            switch (dir) {
              case -1 /* Left */:
                parent.left = newChild;
                break;
              case 0 /* Mid */:
                assert(false);
              case 1 /* Right */:
                assert(false);
            }
          } else {
            node.right = newChild;
          }
          const newChild2 = this._balanceByStack(stack2);
          if (stack.length > 0) {
            const [dir, parent] = stack[stack.length - 1];
            switch (dir) {
              case -1 /* Left */:
                parent.left = newChild2;
                break;
              case 0 /* Mid */:
                parent.mid = newChild2;
                break;
              case 1 /* Right */:
                parent.right = newChild2;
                break;
            }
          } else {
            this._root = newChild2;
          }
        }
      } else {
        const newChild = node.left ?? node.right;
        if (stack.length > 0) {
          const [dir, parent] = stack[stack.length - 1];
          switch (dir) {
            case -1 /* Left */:
              parent.left = newChild;
              break;
            case 0 /* Mid */:
              parent.mid = newChild;
              break;
            case 1 /* Right */:
              parent.right = newChild;
              break;
          }
        } else {
          this._root = newChild;
        }
      }
    }
    this._root = this._balanceByStack(stack) ?? this._root;
  }
  _min(node, stack) {
    while (node.left) {
      stack.push([-1 /* Left */, node]);
      node = node.left;
    }
    return node;
  }
  _balanceByStack(stack) {
    for (let i2 = stack.length - 1; i2 >= 0; i2--) {
      const node = stack[i2][1];
      node.updateHeight();
      const bf = node.balanceFactor();
      if (bf > 1) {
        if (node.right.balanceFactor() >= 0) {
          stack[i2][1] = node.rotateLeft();
        } else {
          node.right = node.right.rotateRight();
          stack[i2][1] = node.rotateLeft();
        }
      } else if (bf < -1) {
        if (node.left.balanceFactor() <= 0) {
          stack[i2][1] = node.rotateRight();
        } else {
          node.left = node.left.rotateLeft();
          stack[i2][1] = node.rotateRight();
        }
      }
      if (i2 > 0) {
        switch (stack[i2 - 1][0]) {
          case -1 /* Left */:
            stack[i2 - 1][1].left = stack[i2][1];
            break;
          case 1 /* Right */:
            stack[i2 - 1][1].right = stack[i2][1];
            break;
          case 0 /* Mid */:
            stack[i2 - 1][1].mid = stack[i2][1];
            break;
        }
      } else {
        return stack[0][1];
      }
    }
    return void 0;
  }
  findSubstr(key3) {
    const iter = this._iter.reset(key3);
    let node = this._root;
    let candidate = void 0;
    while (node) {
      const val = iter.cmp(node.segment);
      if (val > 0) {
        node = node.left;
      } else if (val < 0) {
        node = node.right;
      } else if (iter.hasNext()) {
        iter.next();
        candidate = Undef.unwrap(node.value) || candidate;
        node = node.mid;
      } else {
        break;
      }
    }
    return node && Undef.unwrap(node.value) || candidate;
  }
  findSuperstr(key3) {
    return this._findSuperstrOrElement(key3, false);
  }
  _findSuperstrOrElement(key3, allowValue) {
    const iter = this._iter.reset(key3);
    let node = this._root;
    while (node) {
      const val = iter.cmp(node.segment);
      if (val > 0) {
        node = node.left;
      } else if (val < 0) {
        node = node.right;
      } else if (iter.hasNext()) {
        iter.next();
        node = node.mid;
      } else {
        if (!node.mid) {
          if (allowValue) {
            return Undef.unwrap(node.value);
          } else {
            return void 0;
          }
        } else {
          return this._entries(node.mid);
        }
      }
    }
    return void 0;
  }
  hasElementOrSubtree(key3) {
    return this._findSuperstrOrElement(key3, true) !== void 0;
  }
  forEach(callback) {
    for (const [key3, value2] of this) {
      callback(value2, key3);
    }
  }
  *[Symbol.iterator]() {
    yield* this._entries(this._root);
  }
  _entries(node) {
    const result = [];
    this._dfsEntries(node, result);
    return result[Symbol.iterator]();
  }
  _dfsEntries(node, bucket) {
    if (!node) {
      return;
    }
    if (node.left) {
      this._dfsEntries(node.left, bucket);
    }
    if (node.value !== void 0) {
      bucket.push([node.key, Undef.unwrap(node.value)]);
    }
    if (node.mid) {
      this._dfsEntries(node.mid, bucket);
    }
    if (node.right) {
      this._dfsEntries(node.right, bucket);
    }
  }
  // for debug/testing
  _isBalanced() {
    const nodeIsBalanced = (node) => {
      if (!node) {
        return true;
      }
      const bf = node.balanceFactor();
      if (bf < -1 || bf > 1) {
        return false;
      }
      return nodeIsBalanced(node.left) && nodeIsBalanced(node.right);
    };
    return nodeIsBalanced(this._root);
  }
};
export { StringIterator, ConfigKeysIterator, PathIterator, UriIterator, Undef, TernarySearchTreeNode, TernarySearchTree };
