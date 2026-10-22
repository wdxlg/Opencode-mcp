// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/download/common/downloadIpc.ts
import { URI } from "./module-0032.mjs";


// src/vs/platform/download/common/downloadIpc.ts
var DownloadServiceChannel = class {
  constructor(service) {
    this.service = service;
  }
  listen(_, event, arg) {
    throw new Error("Invalid listen");
  }
  call(context2, command4, args2) {
    switch (command4) {
      case "download":
        return this.service.download(URI.revive(args2[0]), URI.revive(args2[1]), args2[2] ?? "downloadIpc");
    }
    throw new Error("Invalid call");
  }
};
export { DownloadServiceChannel };
