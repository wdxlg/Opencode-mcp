// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/search/node/ripgrepSearchUtils.ts
import { SearchRange } from "./module-0247.mjs";
import { Range4 } from "./module-0246.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0062.mjs";


// src/vs/workbench/services/search/node/ripgrepSearchUtils.ts
function anchorGlob(glob) {
  return glob.startsWith("**") || glob.startsWith("/") ? glob : `/${glob}`;
}

function rangeToSearchRange(range) {
  return new SearchRange(range.start.line, range.start.character, range.end.line, range.end.character);
}

function searchRangeToRange(range) {
  return new Range4(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
}

var OutputChannel = class {
  constructor(prefix, logService) {
    this.prefix = prefix;
    this.logService = logService;
  }
  appendLine(msg) {
    this.logService.debug(`${this.prefix}#search`, msg);
  }
};

OutputChannel = __decorateClass([
  __decorateParam(1, ILogService)
], OutputChannel);
export { anchorGlob, rangeToSearchRange, searchRangeToRange, OutputChannel };
