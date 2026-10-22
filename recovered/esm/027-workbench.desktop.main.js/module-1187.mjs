// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/prefixTree.ts
import { Iterable } from "./module-0011.mjs";


// src/vs/base/common/prefixTree.ts
var unset = /* @__PURE__ */ Symbol("unset");

var WellDefinedPrefixTree = class {
  constructor() {
    this.root = new Node3();
    this._size = 0;
  }
  /** Tree size, not including the root. */
  get size() {
    return this._size;
  }
  /** Gets the top-level nodes of the tree */
  get nodes() {
    return this.root.children?.values() || Iterable.empty();
  }
  /** Gets the top-level nodes of the tree */
  get entries() {
    return this.root.children?.entries() || Iterable.empty();
  }
  /**
   * Inserts a new value in the prefix tree.
   * @param onNode - called for each node as we descend to the insertion point,
   * including the insertion point itself.
   */
  insert(key3, value2, onNode) {
    this.opNode(key3, (n2) => n2._value = value2, onNode);
  }
  /** Mutates a value in the prefix tree. */
  mutate(key3, mutate) {
    this.opNode(key3, (n2) => n2._value = mutate(n2._value === unset ? void 0 : n2._value));
  }
  /** Mutates nodes along the path in the prefix tree. */
  mutatePath(key3, mutate) {
    this.opNode(key3, () => {
    }, (n2) => mutate(n2));
  }
  /** Deletes a node from the prefix tree, returning the value it contained. */
  delete(key3) {
    const path = this.getPathToKey(key3);
    if (!path) {
      return;
    }
    let i2 = path.length - 1;
    const value2 = path[i2].node._value;
    if (value2 === unset) {
      return;
    }
    this._size--;
    path[i2].node._value = unset;
    for (; i2 > 0; i2--) {
      const { node, part } = path[i2];
      if (node.children?.size || node._value !== unset) {
        break;
      }
      path[i2 - 1].node.children.delete(part);
    }
    return value2;
  }
  /** Deletes a subtree from the prefix tree, returning the values they contained. */
  *deleteRecursive(key3) {
    const path = this.getPathToKey(key3);
    if (!path) {
      return;
    }
    const subtree = path[path.length - 1].node;
    for (let i2 = path.length - 1; i2 > 0; i2--) {
      const parent = path[i2 - 1];
      parent.node.children.delete(path[i2].part);
      if (parent.node.children.size > 0 || parent.node._value !== unset) {
        break;
      }
    }
    for (const node of bfsIterate(subtree)) {
      if (node._value !== unset) {
        this._size--;
        yield node._value;
      }
    }
    if (subtree === this.root) {
      this.root._value = unset;
      this.root.children = void 0;
    }
  }
  /** Gets a value from the tree. */
  find(key3) {
    let node = this.root;
    for (const segment of key3) {
      const next = node.children?.get(segment);
      if (!next) {
        return void 0;
      }
      node = next;
    }
    return node._value === unset ? void 0 : node._value;
  }
  /** Gets whether the tree has the key, or a parent of the key, already inserted. */
  hasKeyOrParent(key3) {
    let node = this.root;
    for (const segment of key3) {
      const next = node.children?.get(segment);
      if (!next) {
        return false;
      }
      if (next._value !== unset) {
        return true;
      }
      node = next;
    }
    return false;
  }
  /** Gets whether the tree has the given key or any children. */
  hasKeyOrChildren(key3) {
    let node = this.root;
    for (const segment of key3) {
      const next = node.children?.get(segment);
      if (!next) {
        return false;
      }
      node = next;
    }
    return true;
  }
  /** Gets whether the tree has the given key. */
  hasKey(key3) {
    let node = this.root;
    for (const segment of key3) {
      const next = node.children?.get(segment);
      if (!next) {
        return false;
      }
      node = next;
    }
    return node._value !== unset;
  }
  getPathToKey(key3) {
    const path = [{ part: "", node: this.root }];
    let i2 = 0;
    for (const part of key3) {
      const node = path[i2].node.children?.get(part);
      if (!node) {
        return;
      }
      path.push({ part, node });
      i2++;
    }
    return path;
  }
  opNode(key3, fn, onDescend) {
    let node = this.root;
    for (const part of key3) {
      if (!node.children) {
        const next = new Node3();
        node.children = /* @__PURE__ */ new Map([[part, next]]);
        node = next;
      } else if (!node.children.has(part)) {
        const next = new Node3();
        node.children.set(part, next);
        node = next;
      } else {
        node = node.children.get(part);
      }
      onDescend?.(node);
    }
    const sizeBefore = node._value === unset ? 0 : 1;
    fn(node);
    const sizeAfter = node._value === unset ? 0 : 1;
    this._size += sizeAfter - sizeBefore;
  }
  /** Returns an iterable of the tree values in no defined order. */
  *values() {
    for (const { _value } of bfsIterate(this.root)) {
      if (_value !== unset) {
        yield _value;
      }
    }
  }
};

function* bfsIterate(root) {
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    yield node;
    if (node.children) {
      for (const child of node.children.values()) {
        stack.push(child);
      }
    }
  }
}

var Node3 = class {
  constructor() {
    this._value = unset;
  }
  get value() {
    return this._value === unset ? void 0 : this._value;
  }
  set value(value2) {
    this._value = value2 === void 0 ? unset : value2;
  }
};
export { bfsIterate, unset, WellDefinedPrefixTree, Node3 };
