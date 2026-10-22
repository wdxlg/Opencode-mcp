// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpConfigFileUtils.ts
import { findNodeAtLocation, parseTree } from "./module-0885.mjs";


// src/vs/workbench/contrib/mcp/common/mcpConfigFileUtils.ts
var getMcpServerMapping = (opts) => {
  const tree = parseTree(opts.model.getValue());
  const servers = findNodeAtLocation(tree, opts.pathToServers);
  if (!servers || servers.type !== "object") {
    return /* @__PURE__ */ new Map();
  }
  const result = /* @__PURE__ */ new Map();
  for (const node of servers.children || []) {
    if (node.type !== "property" || node.children?.[0]?.type !== "string") {
      continue;
    }
    const start = opts.model.getPositionAt(node.offset);
    const end = opts.model.getPositionAt(node.offset + node.length);
    result.set(node.children[0].value, {
      uri: opts.model.uri,
      range: {
        startLineNumber: start.lineNumber,
        startColumn: start.column,
        endLineNumber: end.lineNumber,
        endColumn: end.column
      }
    });
  }
  return result;
};
export { getMcpServerMapping };
