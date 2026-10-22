// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/output/common/outputLinkComputerMain.js
// Original module marker: src/vs/workbench/contrib/output/common/outputLinkComputer.ts
import { WorkerTextModelSyncServer } from "./module-0031.mjs";
import { URI } from "./module-0005.mjs";
import { escapeRegExpCharacters, format2, rtrim, splitLines } from "./module-0021.mjs";
import { joinPath } from "./module-0024.mjs";
import { Schemas } from "./module-0023.mjs";
import { isWindows } from "./module-0002.mjs";
import { toSlashes } from "./module-0022.mjs";
import { Range } from "./module-0026.mjs";


// src/vs/workbench/contrib/output/common/outputLinkComputer.ts
var OutputLinkComputer = class _OutputLinkComputer {
  constructor(workerServer) {
    this._requestHandlerBrand = void 0;
    this.workerTextModelSyncServer = new WorkerTextModelSyncServer();
    this.patterns = /* @__PURE__ */ new Map();
    this.workerTextModelSyncServer.bindToServer(workerServer);
  }
  $setWorkspaceFolders(workspaceFolders) {
    this.computePatterns(workspaceFolders);
  }
  computePatterns(_workspaceFolders) {
    const workspaceFolders = _workspaceFolders.sort((resourceStrA, resourceStrB) => resourceStrB.length - resourceStrA.length).map((resourceStr) => URI.parse(resourceStr));
    for (const workspaceFolder of workspaceFolders) {
      const patterns = _OutputLinkComputer.createPatterns(workspaceFolder);
      this.patterns.set(workspaceFolder, patterns);
    }
  }
  getModel(uri) {
    return this.workerTextModelSyncServer.getModel(uri);
  }
  $computeLinks(uri) {
    const model = this.getModel(uri);
    if (!model) {
      return [];
    }
    const links = [];
    const lines = splitLines(model.getValue());
    for (const [folderUri, folderPatterns] of this.patterns) {
      const resourceCreator = {
        toResource: (folderRelativePath) => {
          if (typeof folderRelativePath === "string") {
            return joinPath(folderUri, folderRelativePath);
          }
          return null;
        }
      };
      for (let i = 0, len = lines.length; i < len; i++) {
        links.push(..._OutputLinkComputer.detectLinks(lines[i], i + 1, folderPatterns, resourceCreator));
      }
    }
    return links;
  }
  static createPatterns(workspaceFolder) {
    const patterns = [];
    const workspaceFolderPath = workspaceFolder.scheme === Schemas.file ? workspaceFolder.fsPath : workspaceFolder.path;
    const workspaceFolderVariants = [workspaceFolderPath];
    if (isWindows && workspaceFolder.scheme === Schemas.file) {
      workspaceFolderVariants.push(toSlashes(workspaceFolderPath));
    }
    for (const workspaceFolderVariant of workspaceFolderVariants) {
      const validPathCharacterPattern = `[^\\s\\(\\):<>'"]`;
      const validPathCharacterOrSpacePattern = `(?:${validPathCharacterPattern}| ${validPathCharacterPattern})`;
      const pathPattern = `${validPathCharacterOrSpacePattern}+\\.${validPathCharacterPattern}+`;
      const strictPathPattern = `${validPathCharacterPattern}+`;
      patterns.push(new RegExp(escapeRegExpCharacters(workspaceFolderVariant) + `(${pathPattern}) on line ((\\d+)(, column (\\d+))?)`, "gi"));
      patterns.push(new RegExp(escapeRegExpCharacters(workspaceFolderVariant) + `(${pathPattern}):line ((\\d+)(, column (\\d+))?)`, "gi"));
      patterns.push(new RegExp(escapeRegExpCharacters(workspaceFolderVariant) + `(${pathPattern})(\\s?\\((\\d+)(,(\\d+))?)\\)`, "gi"));
      patterns.push(new RegExp(escapeRegExpCharacters(workspaceFolderVariant) + `(${strictPathPattern})(:(\\d+))?(:(\\d+))?`, "gi"));
    }
    return patterns;
  }
  /**
   * Detect links. Made static to allow for tests.
   */
  static detectLinks(line, lineIndex, patterns, resourceCreator) {
    const links = [];
    patterns.forEach((pattern) => {
      pattern.lastIndex = 0;
      let match;
      let offset = 0;
      while ((match = pattern.exec(line)) !== null) {
        const folderRelativePath = rtrim(match[1], ".").replace(/\\/g, "/");
        let resourceString;
        try {
          const resource = resourceCreator.toResource(folderRelativePath);
          if (resource) {
            resourceString = resource.toString();
          }
        } catch (error) {
          continue;
        }
        if (match[3]) {
          const lineNumber = match[3];
          if (match[5]) {
            const columnNumber = match[5];
            resourceString = format2("{0}#{1},{2}", resourceString, lineNumber, columnNumber);
          } else {
            resourceString = format2("{0}#{1}", resourceString, lineNumber);
          }
        }
        const fullMatch = rtrim(match[0], ".");
        const index = line.indexOf(fullMatch, offset);
        offset = index + fullMatch.length;
        const linkRange = {
          startColumn: index + 1,
          startLineNumber: lineIndex,
          endColumn: index + 1 + fullMatch.length,
          endLineNumber: lineIndex
        };
        if (links.some((link) => Range.areIntersectingOrTouching(link.range, linkRange))) {
          return;
        }
        links.push({
          range: linkRange,
          url: resourceString
        });
      }
    });
    return links;
  }
};

function create(workerServer) {
  return new OutputLinkComputer(workerServer);
}
export { create, OutputLinkComputer };
