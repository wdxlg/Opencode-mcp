// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/mcp/common/mcpGalleryManifestServiceIpc.ts
import { Disposable } from "./module-0013.mjs";
import { Emitter, Event } from "./module-0018.mjs";
import { Barrier } from "./module-0029.mjs";


// src/vs/platform/mcp/common/mcpGalleryManifestServiceIpc.ts
var McpGalleryManifestIPCService = class extends Disposable {
  constructor(server) {
    super();
    this._onDidChangeMcpGalleryManifest = this._register(new Emitter());
    this.onDidChangeMcpGalleryManifest = this._onDidChangeMcpGalleryManifest.event;
    this._onDidChangeMcpGalleryManifestStatus = this._register(new Emitter());
    this.onDidChangeMcpGalleryManifestStatus = this._onDidChangeMcpGalleryManifestStatus.event;
    this.barrier = new Barrier();
    server.registerChannel("mcpGalleryManifest", {
      listen: () => Event.None,
      call: async (context, command, args) => {
        switch (command) {
          case "setMcpGalleryManifest": {
            const manifest = Array.isArray(args) ? args[0] : null;
            return Promise.resolve(this.setMcpGalleryManifest(manifest));
          }
        }
        throw new Error("Invalid call");
      }
    });
  }
  get mcpGalleryManifestStatus() {
    return this._mcpGalleryManifest ? "available" /* Available */ : "unavailable" /* Unavailable */;
  }
  async getMcpGalleryManifest() {
    await this.barrier.wait();
    return this._mcpGalleryManifest ?? null;
  }
  setMcpGalleryManifest(manifest) {
    this._mcpGalleryManifest = manifest;
    this._onDidChangeMcpGalleryManifest.fire(manifest);
    this._onDidChangeMcpGalleryManifestStatus.fire(this.mcpGalleryManifestStatus);
    this.barrier.open();
  }
};
export { McpGalleryManifestIPCService };
