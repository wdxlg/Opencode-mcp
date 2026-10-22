// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/checksum/node/checksumService.ts
import { listenStream } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0057.mjs";


// src/vs/platform/checksum/node/checksumService.ts
import { createHash as createHash2 } from "crypto";

var ChecksumService = class {
  constructor(fileService) {
    this.fileService = fileService;
  }
  async checksum(resource) {
    const stream = (await this.fileService.readFileStream(resource)).value;
    return new Promise((resolve3, reject) => {
      const hash2 = createHash2("sha256");
      listenStream(stream, {
        onData: (data) => hash2.update(data.buffer),
        onError: (error) => reject(error),
        onEnd: () => resolve3(hash2.digest("base64").replace(/=+$/, ""))
      });
    });
  }
};

ChecksumService = __decorateClass([
  __decorateParam(0, IFileService)
], ChecksumService);
export { createHash2, ChecksumService };
