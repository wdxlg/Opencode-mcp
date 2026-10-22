// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/model/graph.ts



// src/vs/editor/contrib/inlineCompletions/browser/model/graph.ts
var DirectedGraph = class _DirectedGraph {
  constructor() {
    this._nodes = /* @__PURE__ */ new Set();
    this._outgoingEdges = /* @__PURE__ */ new Map();
  }
  static from(nodes, getOutgoing) {
    const graph = new _DirectedGraph();
    for (const node of nodes) {
      graph._nodes.add(node);
    }
    for (const node of nodes) {
      const outgoing = getOutgoing(node);
      if (outgoing.length > 0) {
        const outgoingSet = /* @__PURE__ */ new Set();
        for (const target of outgoing) {
          outgoingSet.add(target);
        }
        graph._outgoingEdges.set(node, outgoingSet);
      }
    }
    return graph;
  }
  /**
   * After this, the graph is guaranteed to have no cycles.
   */
  removeCycles() {
    const foundCycles = [];
    const visited = /* @__PURE__ */ new Set();
    const recursionStack = /* @__PURE__ */ new Set();
    const toRemove = [];
    const dfs3 = (node) => {
      visited.add(node);
      recursionStack.add(node);
      const outgoing = this._outgoingEdges.get(node);
      if (outgoing) {
        for (const neighbor of outgoing) {
          if (!visited.has(neighbor)) {
            dfs3(neighbor);
          } else if (recursionStack.has(neighbor)) {
            foundCycles.push(neighbor);
            toRemove.push({ from: node, to: neighbor });
          }
        }
      }
      recursionStack.delete(node);
    };
    for (const node of this._nodes) {
      if (!visited.has(node)) {
        dfs3(node);
      }
    }
    for (const { from, to } of toRemove) {
      const outgoingSet = this._outgoingEdges.get(from);
      if (outgoingSet) {
        outgoingSet.delete(to);
      }
    }
    return { foundCycles };
  }
  getOutgoing(node) {
    const outgoing = this._outgoingEdges.get(node);
    return outgoing ? Array.from(outgoing) : [];
  }
};
export { DirectedGraph };
