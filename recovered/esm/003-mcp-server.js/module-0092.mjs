import { __toESM } from "./module-0000.mjs";
// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/runtime/mcp-server.js
// Original module marker: src/workspace-paths.ts



// src/workspace-paths.ts
var import_promises2 = require("node:fs/promises");
var import_node_path2 = __toESM(require("node:path"), 1);

var STALE_ROOT_CODES = /* @__PURE__ */ new Set(["ENOENT", "ENOTDIR"]);

async function canonicalizeWorkspaceRoots(roots, createUnavailableError) {
  if (roots.length === 0) {
    throw createUnavailableError("No workspace root is configured.");
  }
  const canonical = [];
  for (const root of roots) {
    try {
      canonical.push(await (0, import_promises2.realpath)(root));
    } catch (error51) {
      const code = error51.code;
      if (code === "ENOENT" && import_node_path2.default.extname(root)) {
        try {
          const parent = await (0, import_promises2.realpath)(import_node_path2.default.dirname(root));
          if ((await (0, import_promises2.stat)(parent)).isDirectory()) {
            canonical.push(import_node_path2.default.join(parent, import_node_path2.default.basename(root)));
            continue;
          }
        } catch {
        }
      }
      if (code && STALE_ROOT_CODES.has(code)) continue;
      throw error51;
    }
  }
  if (canonical.length === 0) {
    throw createUnavailableError(
      "No usable workspace root is available; every configured root is missing or no longer a directory."
    );
  }
  return [...new Set(canonical)];
}

function literalFirstPathSpellings(requestedPath) {
  if (!requestedPath.includes("\\")) {
    return [requestedPath];
  }
  const slashSpelling = requestedPath.replace(/\\/g, "/");
  return slashSpelling === requestedPath ? [requestedPath] : [requestedPath, slashSpelling];
}
export { canonicalizeWorkspaceRoots, literalFirstPathSpellings, import_promises2, STALE_ROOT_CODES };
