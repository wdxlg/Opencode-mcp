// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/resourceTree.ts
import { posix } from "./module-0026.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";
import { URI } from "./module-0032.mjs";
import { extUri } from "./module-0034.mjs";
import { PathIterator } from "./module-0268.mjs";


// src/vs/base/common/resourceTree.ts
var Node4 = class {
  constructor(uri4, relativePath2, context2, element = void 0, parent = void 0) {
    this.uri = uri4;
    this.relativePath = relativePath2;
    this.context = context2;
    this.element = element;
    this.parent = parent;
    this._children = /* @__PURE__ */ new Map();
  }
  get childrenCount() {
    return this._children.size;
  }
  get children() {
    return this._children.values();
  }
  get name() {
    return posix.basename(this.relativePath);
  }
  get(path) {
    return this._children.get(path);
  }
  set(path, child) {
    this._children.set(path, child);
  }
  delete(path) {
    this._children.delete(path);
  }
  clear() {
    this._children.clear();
  }
};

__decorateClass([
  memoize
], Node4.prototype, "name", 1);

function collect(node, result) {
  if (typeof node.element !== "undefined") {
    result.push(node.element);
  }
  for (const child of node.children) {
    collect(child, result);
  }
  return result;
}

var ResourceTree = class {
  constructor(context2, rootURI = URI.file("/"), extUri2 = extUri) {
    this.extUri = extUri2;
    this.root = new Node4(rootURI, "", context2);
  }
  static getRoot(node) {
    while (node.parent) {
      node = node.parent;
    }
    return node;
  }
  static collect(node) {
    return collect(node, []);
  }
  static isResourceNode(obj) {
    return obj instanceof Node4;
  }
  add(uri4, element) {
    const key3 = this.extUri.relativePath(this.root.uri, uri4) || uri4.path;
    const iterator = new PathIterator(false).reset(key3);
    let node = this.root;
    let path = "";
    while (true) {
      const name = iterator.value();
      path = path + "/" + name;
      let child = node.get(name);
      if (!child) {
        child = new Node4(
          this.extUri.joinPath(this.root.uri, path),
          path,
          this.root.context,
          iterator.hasNext() ? void 0 : element,
          node
        );
        node.set(name, child);
      } else if (!iterator.hasNext()) {
        child.element = element;
      }
      node = child;
      if (!iterator.hasNext()) {
        return;
      }
      iterator.next();
    }
  }
  delete(uri4) {
    const key3 = this.extUri.relativePath(this.root.uri, uri4) || uri4.path;
    const iterator = new PathIterator(false).reset(key3);
    return this._delete(this.root, iterator);
  }
  _delete(node, iterator) {
    const name = iterator.value();
    const child = node.get(name);
    if (!child) {
      return void 0;
    }
    if (iterator.hasNext()) {
      const result = this._delete(child, iterator.next());
      if (typeof result !== "undefined" && child.childrenCount === 0) {
        node.delete(name);
      }
      return result;
    }
    node.delete(name);
    return child.element;
  }
  clear() {
    this.root.clear();
  }
  getNode(uri4) {
    const key3 = this.extUri.relativePath(this.root.uri, uri4) || uri4.path;
    const iterator = new PathIterator(false).reset(key3);
    let node = this.root;
    while (true) {
      const name = iterator.value();
      const child = node.get(name);
      if (!child || !iterator.hasNext()) {
        return child;
      }
      node = child;
      iterator.next();
    }
  }
};
export { collect, Node4, ResourceTree };
