// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/multiDiffEditor/browser/multiDiffSourceResolverService.ts
import { createDecorator } from "./module-0077.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { toDisposable } from "./module-0012.mjs";


// src/vs/workbench/contrib/multiDiffEditor/browser/multiDiffSourceResolverService.ts
var IMultiDiffSourceResolverService = createDecorator("multiDiffSourceResolverService");

var MultiDiffEditorItem = class {
  constructor(originalUri, modifiedUri, goToFileUri, goToFileEditorTitle, contextKeys) {
    this.originalUri = originalUri;
    this.modifiedUri = modifiedUri;
    this.goToFileUri = goToFileUri;
    this.goToFileEditorTitle = goToFileEditorTitle;
    this.contextKeys = contextKeys;
    if (!originalUri && !modifiedUri) {
      throw new BugIndicatingError("Invalid arguments");
    }
  }
  getKey() {
    return JSON.stringify([this.modifiedUri?.toString(), this.originalUri?.toString()]);
  }
};

var MultiDiffSourceResolverService = class {
  constructor() {
    this._resolvers = /* @__PURE__ */ new Set();
  }
  registerResolver(resolver) {
    if (this._resolvers.has(resolver)) {
      throw new BugIndicatingError("Duplicate resolver");
    }
    this._resolvers.add(resolver);
    return toDisposable(() => this._resolvers.delete(resolver));
  }
  resolve(uri5) {
    for (const resolver of this._resolvers) {
      if (resolver.canHandleUri(uri5)) {
        return resolver.resolveDiffSource(uri5);
      }
    }
    return Promise.resolve(void 0);
  }
};
export { IMultiDiffSourceResolverService, MultiDiffEditorItem, MultiDiffSourceResolverService };
