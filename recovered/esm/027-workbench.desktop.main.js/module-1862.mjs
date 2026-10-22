// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/instantiation/common/graph.ts



// src/vs/platform/instantiation/common/graph.ts
var Node7 = class {
  constructor(key3, data) {
    this.key = key3;
    this.data = data;
    this.incoming = /* @__PURE__ */ new Map();
    this.outgoing = /* @__PURE__ */ new Map();
  }
};

var Graph = class {
  constructor(_hashFn) {
    this._hashFn = _hashFn;
    this._nodes = /* @__PURE__ */ new Map();
  }
  roots() {
    const ret = [];
    for (const node of this._nodes.values()) {
      if (node.outgoing.size === 0) {
        ret.push(node);
      }
    }
    return ret;
  }
  insertEdge(from, to) {
    const fromNode = this.lookupOrInsertNode(from);
    const toNode = this.lookupOrInsertNode(to);
    fromNode.outgoing.set(toNode.key, toNode);
    toNode.incoming.set(fromNode.key, fromNode);
  }
  removeNode(data) {
    const key3 = this._hashFn(data);
    this._nodes.delete(key3);
    for (const node of this._nodes.values()) {
      node.outgoing.delete(key3);
      node.incoming.delete(key3);
    }
  }
  lookupOrInsertNode(data) {
    const key3 = this._hashFn(data);
    let node = this._nodes.get(key3);
    if (!node) {
      node = new Node7(key3, data);
      this._nodes.set(key3, node);
    }
    return node;
  }
  lookup(data) {
    return this._nodes.get(this._hashFn(data));
  }
  isEmpty() {
    return this._nodes.size === 0;
  }
  toString() {
    const data = [];
    for (const [key3, value2] of this._nodes) {
      data.push(`${key3}
	(-> incoming)[${[...value2.incoming.keys()].join(", ")}]
	(outgoing ->)[${[...value2.outgoing.keys()].join(",")}]
`);
    }
    return data.join("\n");
  }
  /**
   * This is brute force and slow and **only** be used
   * to trouble shoot.
   */
  findCycleSlow() {
    for (const [id2, node] of this._nodes) {
      const seen = /* @__PURE__ */ new Set([id2]);
      const res = this._findCycle(node, seen);
      if (res) {
        return res;
      }
    }
    return void 0;
  }
  _findCycle(node, seen) {
    for (const [id2, outgoing] of node.outgoing) {
      if (seen.has(id2)) {
        return [...seen, id2].join(" -> ");
      }
      seen.add(id2);
      const value2 = this._findCycle(outgoing, seen);
      if (value2) {
        return value2;
      }
      seen.delete(id2);
    }
    return void 0;
  }
};
export { Node7, Graph };
