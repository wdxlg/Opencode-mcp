// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/global-skill-catalog.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { globalSkillsDirectory } from "./module-0025.mjs";
import { diagnoseSkillTools, loadSkillTools } from "./module-0028.mjs";


// src/global-skill-catalog.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_fs5 = require("node:fs");

var import_node_path10 = __toESM(require("node:path"), 1);


// src/global-skill-catalog.ts
function validGlobalSkill(directory) {
  try {
    const info = (0, import_node_fs5.lstatSync)(directory);
    return info.isDirectory() && !info.isSymbolicLink() && !(0, import_node_fs5.existsSync)(import_node_path10.default.join(directory, ".opencode-importing"));
  } catch {
    return false;
  }
}

function loadGlobalSkills(log, directory = globalSkillsDirectory()) {
  if (!directory) return [];
  return loadSkillTools(directory, log, { skillsDirectory: directory, validateDirectory: validGlobalSkill }).map((tool) => ({
    ...tool,
    scope: "global",
    // Resolve code relative to its store, but keep execution cwd in the active project.
    command: tool.command.map((token, index) => {
      if (index !== tool.command.length - 1) return token;
      const candidate = import_node_path10.default.resolve(directory, token);
      return candidate.startsWith(directory + import_node_path10.default.sep) && (0, import_node_fs5.existsSync)(candidate) && (0, import_node_fs5.lstatSync)(candidate).isFile() ? candidate : token;
    })
  }));
}

function diagnoseGlobalSkills(log) {
  const directory = globalSkillsDirectory();
  if (!directory) return [];
  return diagnoseSkillTools(directory, log, { skillsDirectory: directory, validateDirectory: validGlobalSkill }).map((item) => ({ ...item, scope: "global", directory: import_node_path10.default.join(directory, item.dirName) }));
}

function globalSkillFolderNames(directory = globalSkillsDirectory()) {
  if (!directory || !(0, import_node_fs5.existsSync)(directory)) return [];
  return (0, import_node_fs5.readdirSync)(directory, { withFileTypes: true }).filter((entry) => !entry.name.startsWith(".") && entry.isDirectory()).map((entry) => entry.name);
}
export { validGlobalSkill, loadGlobalSkills, diagnoseGlobalSkills, globalSkillFolderNames, import_node_fs5, import_node_path10 };
