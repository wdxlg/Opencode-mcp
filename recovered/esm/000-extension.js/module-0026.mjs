// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/global-skill-settings.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// src/global-skill-settings.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_fs2 = require("node:fs");

var import_node_path2 = __toESM(require("node:path"), 1);

var import_node_crypto = require("node:crypto");

// Version-private path rules remain in place for non-Skills data.
import { safeGlobalSkillPath, readSharedSkillsDirectory, writeSharedSkillsDirectory } from './shared-skills-paths.mjs';

var GlobalSkillSettings = class {
  constructor(file, defaultDirectory) {
    this.file = file;
    this.defaultDirectory = defaultDirectory;
  }
  file;
  defaultDirectory;
  getDirectory() {
    // SHARED_SKILLS_ONLY_V1: never consult version-local settings or legacy libraries.
    const shared = readSharedSkillsDirectory();
    if (shared === undefined) throw new Error("SHARED_SKILLS_CONFIG_REQUIRED：请在技能中心选择共享 Skills 库；不会回退到版本私有库。");
    if (!(0, import_node_fs2.statSync)(shared).isDirectory()) throw new Error("SHARED_SKILLS_DIRECTORY_REQUIRED");
    return shared;
  }
  setDirectory(directory) {
    writeSharedSkillsDirectory(directory);
  }
};
export { import_node_fs2, import_node_path2, import_node_crypto, GlobalSkillSettings };
