// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/ignoredFiles.ts
import { createDecorator } from "./module-0077.mjs";
import { toDisposable } from "./module-0012.mjs";


// src/vs/workbench/contrib/chat/common/ignoredFiles.ts
var ILanguageModelIgnoredFilesService = createDecorator("languageModelIgnoredFilesService");

var LanguageModelIgnoredFilesService = class {
  constructor() {
    this._providers = /* @__PURE__ */ new Set();
  }
  async fileIsIgnored(uri5, token) {
    const provider = this._providers.values().next().value;
    return provider ? provider.isFileIgnored(uri5, token) : false;
  }
  registerIgnoredFileProvider(provider) {
    this._providers.add(provider);
    return toDisposable(() => {
      this._providers.delete(provider);
    });
  }
};
export { ILanguageModelIgnoredFilesService, LanguageModelIgnoredFilesService };
