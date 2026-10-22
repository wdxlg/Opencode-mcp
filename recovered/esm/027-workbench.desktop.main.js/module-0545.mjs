// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/dropOrPasteInto/browser/edit.ts
import { ResourceTextEdit } from "./module-0537.mjs";
import { SnippetParser } from "./module-0544.mjs";


// src/vs/editor/contrib/dropOrPasteInto/browser/edit.ts
function createCombinedWorkspaceEdit(uri5, ranges, edit3) {
  if (typeof edit3.insertText === "string" ? edit3.insertText === "" : edit3.insertText.snippet === "") {
    return {
      edits: edit3.additionalEdit?.edits ?? []
    };
  }
  return {
    edits: [
      ...ranges.map((range2) => new ResourceTextEdit(
        uri5,
        { range: range2, text: typeof edit3.insertText === "string" ? SnippetParser.escape(edit3.insertText) + "$0" : edit3.insertText.snippet, insertAsSnippet: true }
      )),
      ...edit3.additionalEdit?.edits ?? []
    ]
  };
}

function sortEditsByYieldTo(edits) {
  function yieldsTo(yTo, other) {
    if ("mimeType" in yTo) {
      return yTo.mimeType === other.handledMimeType;
    }
    return !!other.kind && yTo.kind.contains(other.kind);
  }
  const yieldsToMap = /* @__PURE__ */ new Map();
  for (const edit3 of edits) {
    for (const yTo of edit3.yieldTo ?? []) {
      for (const other of edits) {
        if (other === edit3) {
          continue;
        }
        if (yieldsTo(yTo, other)) {
          let arr = yieldsToMap.get(edit3);
          if (!arr) {
            arr = [];
            yieldsToMap.set(edit3, arr);
          }
          arr.push(other);
        }
      }
    }
  }
  if (!yieldsToMap.size) {
    return Array.from(edits);
  }
  const visited = /* @__PURE__ */ new Set();
  const tempStack = [];
  function visit2(nodes) {
    if (!nodes.length) {
      return [];
    }
    const node = nodes[0];
    if (tempStack.includes(node)) {
      console.warn("Yield to cycle detected", node);
      return nodes;
    }
    if (visited.has(node)) {
      return visit2(nodes.slice(1));
    }
    let pre = [];
    const yTo = yieldsToMap.get(node);
    if (yTo) {
      tempStack.push(node);
      pre = visit2(yTo);
      tempStack.pop();
    }
    visited.add(node);
    return [...pre, node, ...visit2(nodes.slice(1))];
  }
  return visit2(Array.from(edits));
}
export { createCombinedWorkspaceEdit, sortEditsByYieldTo };
