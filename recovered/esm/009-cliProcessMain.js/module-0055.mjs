// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/download/common/downloadService.ts
import { CancellationToken } from "./module-0018.mjs";
import { Schemas } from "./module-0025.mjs";
import { IRequestService, asTextOrError } from "./module-0054.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0044.mjs";


// src/vs/platform/download/common/downloadService.ts
var DownloadService = class {
  constructor(requestService, fileService) {
    this.requestService = requestService;
    this.fileService = fileService;
  }
  async download(resource, target, callSite, cancellationToken = CancellationToken.None) {
    if (resource.scheme === Schemas.file || resource.scheme === Schemas.vscodeRemote) {
      await this.fileService.copy(resource, target);
      return;
    }
    const options = { type: "GET", url: resource.toString(true), callSite };
    const context = await this.requestService.request(options, cancellationToken);
    if (context.res.statusCode === 200) {
      await this.fileService.writeFile(target, context.stream);
    } else {
      const message = await asTextOrError(context);
      throw new Error(`Expected 200, got back ${context.res.statusCode} instead.

${message}`);
    }
  }
};

DownloadService = __decorateClass([
  __decorateParam(0, IRequestService),
  __decorateParam(1, IFileService)
], DownloadService);
export { DownloadService };
