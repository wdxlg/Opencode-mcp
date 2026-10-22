// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/instantiation/common/graph.ts



// src/vs/platform/instantiation/common/graph.ts
var Node2 = class {
  constructor(key, data2) {
    this.key = key;
    this.data = data2;
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
  removeNode(data2) {
    const key = this._hashFn(data2);
    this._nodes.delete(key);
    for (const node of this._nodes.values()) {
      node.outgoing.delete(key);
      node.incoming.delete(key);
    }
  }
  lookupOrInsertNode(data2) {
    const key = this._hashFn(data2);
    let node = this._nodes.get(key);
    if (!node) {
      node = new Node2(key, data2);
      this._nodes.set(key, node);
    }
    return node;
  }
  lookup(data2) {
    return this._nodes.get(this._hashFn(data2));
  }
  isEmpty() {
    return this._nodes.size === 0;
  }
  toString() {
    const data2 = [];
    for (const [key, value] of this._nodes) {
      data2.push(`${key}
	(-> incoming)[${[...value.incoming.keys()].join(", ")}]
	(outgoing ->)[${[...value.outgoing.keys()].join(",")}]
`);
    }
    return data2.join("\n");
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
      const value = this._findCycle(outgoing, seen);
      if (value) {
        return value;
      }
      seen.delete(id2);
    }
    return void 0;
  }
};
export { Node2, Graph };
