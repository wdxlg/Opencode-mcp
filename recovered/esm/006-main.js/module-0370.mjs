// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/protocol/electron-main/protocolMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Disposable, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { COI, CacheControlheaders, DocumentPolicyheaders, FileAccess, Schemas, init_network } from "./module-0031.mjs";
import { basename, extname, init_path, normalize } from "./module-0008.mjs";
import { init_platform, isLinux } from "./module-0006.mjs";
import { TernarySearchTree, init_ternarySearchTree } from "./module-0068.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { generateUuid, init_uuid } from "./module-0055.mjs";
import { init_ipcMain, validatedIpcMain } from "./module-0059.mjs";
import { INativeEnvironmentService, init_environment } from "./module-0071.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IUserDataProfilesService, init_userDataProfile } from "./module-0078.mjs";


// src/vs/platform/protocol/electron-main/protocolMainService.ts
import { session as session3 } from "electron";

var ProtocolMainService;

var init_protocolMainService = __esm({
  "src/vs/platform/protocol/electron-main/protocolMainService.ts"() {
    init_lifecycle();
    init_network();
    init_path();
    init_platform();
    init_ternarySearchTree();
    init_uri();
    init_uuid();
    init_ipcMain();
    init_environment();
    init_log();
    init_userDataProfile();
    ProtocolMainService = class extends Disposable {
      // https://github.com/microsoft/vscode/issues/119384
      constructor(environmentService, userDataProfilesService, logService) {
        super();
        this.environmentService = environmentService;
        this.logService = logService;
        this.validRoots = TernarySearchTree.forPaths(!isLinux);
        this.validExtensions = /* @__PURE__ */ new Set([".svg", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".mp4", ".otf", ".ttf"]);
        this.addValidFileRoot(environmentService.appRoot);
        this.addValidFileRoot(environmentService.extensionsPath);
        this.addValidFileRoot(userDataProfilesService.defaultProfile.globalStorageHome.with({ scheme: Schemas.file }).fsPath);
        this.addValidFileRoot(environmentService.workspaceStorageHome.with({ scheme: Schemas.file }).fsPath);
        this.handleProtocols();
      }
      handleProtocols() {
        const { defaultSession } = session3;
        defaultSession.protocol.registerFileProtocol(Schemas.vscodeFileResource, (request, callback) => this.handleResourceRequest(request, callback));
        defaultSession.protocol.interceptFileProtocol(Schemas.file, (request, callback) => this.handleFileRequest(request, callback));
        this._register(toDisposable(() => {
          defaultSession.protocol.unregisterProtocol(Schemas.vscodeFileResource);
          defaultSession.protocol.uninterceptProtocol(Schemas.file);
        }));
      }
      addValidFileRoot(root) {
        const normalizedRoot = normalize(root);
        if (!this.validRoots.get(normalizedRoot)) {
          this.validRoots.set(normalizedRoot, true);
          return toDisposable(() => this.validRoots.delete(normalizedRoot));
        }
        return Disposable.None;
      }
      //#region file://
      handleFileRequest(request, callback) {
        const uri = URI.parse(request.url);
        this.logService.error(`Refused to load resource ${uri.fsPath} from ${Schemas.file}: protocol (original URL: ${request.url})`);
        return callback({
          error: -3
          /* ABORTED */
        });
      }
      //#endregion
      //#region vscode-file://
      handleResourceRequest(request, callback) {
        const path4 = this.requestToNormalizedFilePath(request);
        const pathBasename = basename(path4);
        let headers;
        if (this.environmentService.crossOriginIsolated) {
          if (pathBasename === "workbench.html" || pathBasename === "workbench-dev.html") {
            headers = COI.CoopAndCoep;
          } else {
            headers = COI.getHeadersFromQuery(request.url);
          }
        }
        if (!this.environmentService.isBuilt) {
          headers = {
            ...headers,
            ...CacheControlheaders
          };
        }
        if (pathBasename === "workbench.html" || pathBasename === "workbench-dev.html") {
          headers = {
            ...headers,
            ...DocumentPolicyheaders
          };
        }
        if (this.validRoots.findSubstr(path4)) {
          return callback({ path: path4, headers });
        }
        if (this.validExtensions.has(extname(path4).toLowerCase())) {
          return callback({ path: path4, headers });
        }
        this.logService.error(`${Schemas.vscodeFileResource}: Refused to load resource ${path4} from ${Schemas.vscodeFileResource}: protocol (original URL: ${request.url})`);
        return callback({
          error: -3
          /* ABORTED */
        });
      }
      requestToNormalizedFilePath(request) {
        const requestUri = URI.parse(request.url);
        const unnormalizedFileUri = FileAccess.uriToFileUri(requestUri);
        return normalize(unnormalizedFileUri.fsPath);
      }
      //#endregion
      //#region IPC Object URLs
      createIPCObjectUrl() {
        let obj = void 0;
        const resource = URI.from({
          scheme: "vscode",
          // used for all our IPC communication (vscode:<channel>)
          path: generateUuid()
        });
        const channel = resource.toString();
        const handler = async () => obj;
        validatedIpcMain.handle(channel, handler);
        this.logService.trace(`IPC Object URL: Registered new channel ${channel}.`);
        return {
          resource,
          update: (updatedObj) => obj = updatedObj,
          dispose: () => {
            this.logService.trace(`IPC Object URL: Removed channel ${channel}.`);
            validatedIpcMain.removeHandler(channel);
          }
        };
      }
      //#endregion
    };
    ProtocolMainService = __decorateClass([
      __decorateParam(0, INativeEnvironmentService),
      __decorateParam(1, IUserDataProfilesService),
      __decorateParam(2, ILogService)
    ], ProtocolMainService);
  }
});
export { session3, ProtocolMainService, init_protocolMainService };
