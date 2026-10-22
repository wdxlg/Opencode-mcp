// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/views/explorerDecorationsProvider.ts
import { localize } from "./module-0001.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { listDeemphasizedForeground, listInvalidItemForeground } from "./module-0232.mjs";
import { Emitter } from "./module-0017.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { explorerRootErrorEmitter } from "./module-2124.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/workbench/contrib/files/browser/views/explorerDecorationsProvider.ts
function provideDecorations(fileStat) {
  if (fileStat.isRoot && fileStat.error) {
    return {
      tooltip: localize(16001, null, toErrorMessage(fileStat.error)),
      letter: "!",
      color: listInvalidItemForeground
    };
  }
  if (fileStat.isSymbolicLink) {
    return {
      tooltip: localize(16003, null),
      letter: "\u2937"
    };
  }
  if (fileStat.isUnknown) {
    return {
      tooltip: localize(16004, null),
      letter: "?"
    };
  }
  if (fileStat.isExcluded) {
    return {
      color: listDeemphasizedForeground
    };
  }
  return void 0;
}

var ExplorerDecorationsProvider = class {
  constructor(explorerService, contextService) {
    this.explorerService = explorerService;
    this.label = localize(16002, null);
    this._onDidChange = new Emitter();
    this.toDispose = new DisposableStore();
    this.toDispose.add(this._onDidChange);
    this.toDispose.add(contextService.onDidChangeWorkspaceFolders((e4) => {
      this._onDidChange.fire(e4.changed.concat(e4.added).map((wf) => wf.uri));
    }));
    this.toDispose.add(explorerRootErrorEmitter.event(((resource) => {
      this._onDidChange.fire([resource]);
    })));
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  async provideDecorations(resource) {
    const fileStat = this.explorerService.findClosest(resource);
    if (!fileStat) {
      throw new Error("ExplorerItem not found");
    }
    return provideDecorations(fileStat);
  }
  dispose() {
    this.toDispose.dispose();
  }
};

ExplorerDecorationsProvider = __decorateClass([
  __decorateParam(1, IWorkspaceContextService)
], ExplorerDecorationsProvider);
export { provideDecorations, ExplorerDecorationsProvider };
