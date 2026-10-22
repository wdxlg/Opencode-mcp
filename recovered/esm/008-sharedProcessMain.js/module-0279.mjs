// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionGalleryManifestServiceIpc.ts
import { ExtensionGalleryManifestService } from "./module-0278.mjs";
import { Emitter, Event } from "./module-0018.mjs";
import { Barrier } from "./module-0029.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0044.mjs";
import { IProductService } from "./module-0045.mjs";


// src/vs/platform/extensionManagement/common/extensionGalleryManifestServiceIpc.ts
var ExtensionGalleryManifestIPCService = class extends ExtensionGalleryManifestService {
  constructor(server, logService, productService) {
    super(productService);
    this.logService = logService;
    this._onDidChangeExtensionGalleryManifest = this._register(new Emitter());
    this.onDidChangeExtensionGalleryManifest = this._onDidChangeExtensionGalleryManifest.event;
    this._onDidChangeExtensionGalleryManifestStatus = this._register(new Emitter());
    this.onDidChangeExtensionGalleryManifestStatus = this._onDidChangeExtensionGalleryManifestStatus.event;
    this.barrier = new Barrier();
    server.registerChannel("extensionGalleryManifest", {
      listen: () => Event.None,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      call: async (context, command, args) => {
        switch (command) {
          case "setExtensionGalleryManifest":
            return Promise.resolve(this.setExtensionGalleryManifest(args[0]));
        }
        throw new Error("Invalid call");
      }
    });
  }
  get extensionGalleryManifestStatus() {
    return this._extensionGalleryManifest ? "available" /* Available */ : "unavailable" /* Unavailable */;
  }
  async getExtensionGalleryManifest() {
    await this.barrier.wait();
    return this._extensionGalleryManifest ?? null;
  }
  setExtensionGalleryManifest(manifest) {
    this.logService.trace(`[Marketplace] Setting manifest ${manifest ? "available" : "unavailable"}`);
    this._extensionGalleryManifest = manifest;
    this._onDidChangeExtensionGalleryManifest.fire(manifest);
    this._onDidChangeExtensionGalleryManifestStatus.fire(this.extensionGalleryManifestStatus);
    this.barrier.open();
  }
};

ExtensionGalleryManifestIPCService = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, IProductService)
], ExtensionGalleryManifestIPCService);
export { ExtensionGalleryManifestIPCService };
