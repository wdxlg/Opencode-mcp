// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/workspace-paths.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// src/workspace-paths.ts
init_define_OPENCODE_BUILD_INFO();

var import_promises3 = require("node:fs/promises");
var import_node_path4 = __toESM(require("node:path"), 1);

var STALE_ROOT_CODES = /* @__PURE__ */ new Set(["ENOENT", "ENOTDIR"]);

async function canonicalizeWorkspaceRoots(roots2, createUnavailableError) {
  if (roots2.length === 0) {
    throw createUnavailableError("No workspace root is configured.");
  }
  const canonical2 = [];
  for (const root of roots2) {
    try {
      canonical2.push(await (0, import_promises3.realpath)(root));
    } catch (error2) {
      const code = error2.code;
      if (code === "ENOENT" && import_node_path4.default.extname(root)) {
        try {
          const parent = await (0, import_promises3.realpath)(import_node_path4.default.dirname(root));
          if ((await (0, import_promises3.stat)(parent)).isDirectory()) {
            canonical2.push(import_node_path4.default.join(parent, import_node_path4.default.basename(root)));
            continue;
          }
        } catch {
        }
      }
      if (code && STALE_ROOT_CODES.has(code)) continue;
      throw error2;
    }
  }
  if (canonical2.length === 0) {
    throw createUnavailableError(
      "No usable workspace root is available; every configured root is missing or no longer a directory."
    );
  }
  return [...new Set(canonical2)];
}

function literalFirstPathSpellings(requestedPath) {
  if (!requestedPath.includes("\\")) {
    return [requestedPath];
  }
  const slashSpelling = requestedPath.replace(/\\/g, "/");
  return slashSpelling === requestedPath ? [requestedPath] : [requestedPath, slashSpelling];
}
export { canonicalizeWorkspaceRoots, literalFirstPathSpellings, import_promises3, STALE_ROOT_CODES };
