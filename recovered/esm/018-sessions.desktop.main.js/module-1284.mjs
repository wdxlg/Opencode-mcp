// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadDownloadService.ts
import { Disposable } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { MainContext } from "./module-0922.mjs";
import { IDownloadService } from "./module-1283.mjs";


// src/vs/workbench/api/browser/mainThreadDownloadService.ts
var MainThreadDownloadService = class extends Disposable {
  constructor(extHostContext, downloadService) {
    super();
    this.downloadService = downloadService;
  }
  $download(uri4, to) {
    return this.downloadService.download(URI.revive(uri4), URI.revive(to), "mainThreadDownloadService.download");
  }
};

MainThreadDownloadService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadDownloadService),
  __decorateParam(1, IDownloadService)
], MainThreadDownloadService);
export { MainThreadDownloadService };
