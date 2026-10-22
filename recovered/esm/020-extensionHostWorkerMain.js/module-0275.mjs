// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/services/path/common/pathService.ts
import { createDecorator } from "./module-0038.mjs";
import { OS } from "./module-0016.mjs";
import { Schemas } from "./module-0031.mjs";
import { isValidBasename } from "./module-0030.mjs";
import { basename2 } from "./module-0032.mjs";
import { getVirtualWorkspaceScheme } from "./module-0154.mjs";
import { posix, win32 } from "./module-0022.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteAgentService } from "./module-0207.mjs";
import { IWorkbenchEnvironmentService } from "./module-0145.mjs";
import { IWorkspaceContextService } from "./module-0060.mjs";


// src/vs/workbench/services/path/common/pathService.ts
var IPathService = createDecorator("pathService");

var AbstractPathService = class {
  constructor(localUserHome, remoteAgentService, environmentService, contextService) {
    this.localUserHome = localUserHome;
    this.remoteAgentService = remoteAgentService;
    this.environmentService = environmentService;
    this.contextService = contextService;
    this.resolveOS = (async () => {
      const env2 = await this.remoteAgentService.getEnvironment();
      return env2?.os || OS;
    })();
    this.resolveUserHome = (async () => {
      const env2 = await this.remoteAgentService.getEnvironment();
      const userHome = this.maybeUnresolvedUserHome = env2?.userHome ?? localUserHome;
      return userHome;
    })();
  }
  hasValidBasename(resource, arg2, basename3) {
    if (typeof arg2 === "string" || typeof arg2 === "undefined") {
      return this.resolveOS.then((os) => this.doHasValidBasename(resource, os, arg2));
    }
    return this.doHasValidBasename(resource, arg2, basename3);
  }
  doHasValidBasename(resource, os, name2) {
    if (resource.scheme === Schemas.file || resource.scheme === Schemas.vscodeRemote) {
      return isValidBasename(name2 ?? basename2(resource), os === 1 /* Windows */);
    }
    return true;
  }
  get defaultUriScheme() {
    return AbstractPathService.findDefaultUriScheme(this.environmentService, this.contextService);
  }
  static findDefaultUriScheme(environmentService, contextService) {
    if (environmentService.remoteAuthority) {
      return Schemas.vscodeRemote;
    }
    const virtualWorkspace = getVirtualWorkspaceScheme(contextService.getWorkspace());
    if (virtualWorkspace) {
      return virtualWorkspace;
    }
    const firstFolder = contextService.getWorkspace().folders[0];
    if (firstFolder) {
      return firstFolder.uri.scheme;
    }
    const configuration = contextService.getWorkspace().configuration;
    if (configuration) {
      return configuration.scheme;
    }
    return Schemas.file;
  }
  userHome(options2) {
    return options2?.preferLocal ? this.localUserHome : this.resolveUserHome;
  }
  get resolvedUserHome() {
    return this.maybeUnresolvedUserHome;
  }
  get path() {
    return this.resolveOS.then((os) => {
      return os === 1 /* Windows */ ? win32 : posix;
    });
  }
  async fileURI(_path) {
    let authority = "";
    const os = await this.resolveOS;
    if (os === 1 /* Windows */) {
      _path = _path.replace(/\\/g, "/");
    }
    if (_path[0] === "/" && _path[1] === "/") {
      const idx = _path.indexOf("/", 2);
      if (idx === -1) {
        authority = _path.substring(2);
        _path = "/";
      } else {
        authority = _path.substring(2, idx);
        _path = _path.substring(idx) || "/";
      }
    }
    return URI.from({
      scheme: Schemas.file,
      authority,
      path: _path,
      query: "",
      fragment: ""
    });
  }
};

AbstractPathService = __decorateClass([
  __decorateParam(1, IRemoteAgentService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IWorkspaceContextService)
], AbstractPathService);
export { IPathService, AbstractPathService };
