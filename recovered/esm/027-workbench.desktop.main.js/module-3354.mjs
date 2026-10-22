// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineRewriter/commandLineCdPrefixRewriter.ts
import { Disposable } from "./module-0012.mjs";
import { extractCdPrefix } from "./module-3320.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineRewriter/commandLineCdPrefixRewriter.ts
var CommandLineCdPrefixRewriter = class extends Disposable {
  rewrite(options3) {
    if (!options3.cwd) {
      return void 0;
    }
    const extracted = extractCdPrefix(options3.commandLine, options3.shell, options3.os);
    if (extracted) {
      let cdDirPath = extracted.directory.replace(/(?:[\\\/])$/, "");
      let cwdFsPath = options3.cwd.fsPath.replace(/(?:[\\\/])$/, "");
      if (options3.os === 1 /* Windows */) {
        cdDirPath = cdDirPath.toLowerCase();
        cwdFsPath = cwdFsPath.toLowerCase();
      }
      if (cdDirPath === cwdFsPath) {
        return { rewritten: extracted.command, reasoning: "Removed redundant cd command" };
      }
    }
    return void 0;
  }
};
export { CommandLineCdPrefixRewriter };
