// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/custom-tool-migration.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { CUSTOM_TOOLS_DIR_NAME, LEGACY_SKILLS_DIR_NAME } from "./module-0029.mjs";


// src/custom-tool-migration.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_fs14 = require("node:fs");

var import_node_path19 = __toESM(require("node:path"), 1);

var migratedLegacyRoots = /* @__PURE__ */ new Set();

function migrateLegacySkillDirs(root, log) {
  const key = import_node_path19.default.resolve(root);
  if (migratedLegacyRoots.has(key)) return [];
  migratedLegacyRoots.add(key);
  const legacyDir = import_node_path19.default.join(root, LEGACY_SKILLS_DIR_NAME);
  let names;
  try {
    names = (0, import_node_fs14.readdirSync)(legacyDir, { withFileTypes: true }).filter((entry) => entry.isDirectory() && !entry.name.startsWith(".")).map((entry) => entry.name).sort();
  } catch {
    return [];
  }
  const moved = [];
  for (const name of names) {
    const from = import_node_path19.default.join(legacyDir, name);
    const to = import_node_path19.default.join(root, CUSTOM_TOOLS_DIR_NAME, name);
    if ((0, import_node_fs14.existsSync)(to)) {
      log?.(`[custom-tools] legacy skill "${name}" stays in ${LEGACY_SKILLS_DIR_NAME}: a same-named folder already exists in ${CUSTOM_TOOLS_DIR_NAME}.`);
      continue;
    }
    try {
      (0, import_node_fs14.mkdirSync)(import_node_path19.default.dirname(to), { recursive: true });
      (0, import_node_fs14.renameSync)(from, to);
      moved.push(name);
      log?.(`[custom-tools] migrated skill "${name}" from ${LEGACY_SKILLS_DIR_NAME} into ${CUSTOM_TOOLS_DIR_NAME}.`);
    } catch (error2) {
      log?.(`[custom-tools] failed to migrate legacy skill "${name}": ${error2 instanceof Error ? error2.message : String(error2)}.`);
    }
  }
  try {
    (0, import_node_fs14.rmdirSync)(legacyDir);
  } catch {
  }
  return moved;
}
export { migrateLegacySkillDirs, import_node_fs14, import_node_path19, migratedLegacyRoots };
