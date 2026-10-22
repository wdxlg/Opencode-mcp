// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/files/electron-main/diskFileSystemProviderServer.ts
import { __esm } from "./module-0000.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { init_platform, isWindows2 } from "./module-0006.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { createFileSystemProviderError, init_files } from "./module-0072.mjs";
import { basename, init_path, normalize } from "./module-0008.mjs";
import { AbstractDiskFileSystemProviderChannel, AbstractSessionFileWatcher, init_diskFileSystemProviderServer } from "./module-0190.mjs";
import { DefaultURITransformer, init_uriIpc } from "./module-0191.mjs";
import { init_errorMessage, toErrorMessage } from "./module-0047.mjs";


// src/vs/platform/files/electron-main/diskFileSystemProviderServer.ts
import { shell as shell2 } from "electron";

var DiskFileSystemProviderChannel, SessionFileWatcher;

var init_diskFileSystemProviderServer2 = __esm({
  "src/vs/platform/files/electron-main/diskFileSystemProviderServer.ts"() {
    init_nls();
    init_platform();
    init_uri();
    init_files();
    init_path();
    init_diskFileSystemProviderServer();
    init_uriIpc();
    init_errorMessage();
    DiskFileSystemProviderChannel = class extends AbstractDiskFileSystemProviderChannel {
      constructor(provider, logService, environmentService) {
        super(provider, logService);
        this.environmentService = environmentService;
      }
      getUriTransformer(ctx) {
        return DefaultURITransformer;
      }
      transformIncoming(uriTransformer, _resource) {
        return URI.revive(_resource);
      }
      //#region Delete: override to support Electron's trash support
      async delete(uriTransformer, _resource, opts) {
        if (!opts.useTrash) {
          return super.delete(uriTransformer, _resource, opts);
        }
        const resource = this.transformIncoming(uriTransformer, _resource);
        const filePath = normalize(resource.fsPath);
        try {
          await shell2.trashItem(filePath);
        } catch (error) {
          throw createFileSystemProviderError(isWindows2 ? localize(3046, null, basename(filePath), toErrorMessage(error)) : localize(3047, null, basename(filePath), toErrorMessage(error)), "Unknown" /* Unknown */);
        }
      }
      //#endregion
      //#region File Watching
      createSessionFileWatcher(uriTransformer, emitter) {
        return new SessionFileWatcher(uriTransformer, emitter, this.logService, this.environmentService);
      }
      //#endregion
    };
    SessionFileWatcher = class extends AbstractSessionFileWatcher {
      watch(req, resource, opts) {
        if (opts.recursive) {
          throw createFileSystemProviderError("Recursive file watching is not supported from main process for performance reasons.", "Unavailable" /* Unavailable */);
        }
        return super.watch(req, resource, opts);
      }
    };
  }
});
export { shell2, DiskFileSystemProviderChannel, SessionFileWatcher, init_diskFileSystemProviderServer2 };
