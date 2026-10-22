// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadLocalization.ts
import { Disposable } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { MainContext } from "./module-0922.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILanguagePackService } from "./module-0924.mjs";


// src/vs/workbench/api/browser/mainThreadLocalization.ts
var MainThreadLocalization = class extends Disposable {
  constructor(extHostContext, fileService, languagePackService) {
    super();
    this.fileService = fileService;
    this.languagePackService = languagePackService;
  }
  async $fetchBuiltInBundleUri(id2, language2) {
    try {
      const uri4 = await this.languagePackService.getBuiltInExtensionTranslationsUri(id2, language2);
      return uri4;
    } catch (e4) {
      return void 0;
    }
  }
  async $fetchBundleContents(uriComponents) {
    const contents = await this.fileService.readFile(URI.revive(uriComponents));
    return contents.value.toString();
  }
};

MainThreadLocalization = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadLocalization),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILanguagePackService)
], MainThreadLocalization);
export { MainThreadLocalization };
