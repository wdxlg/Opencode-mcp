// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/textresourceProperties/common/textResourcePropertiesService.ts
import { OS } from "./module-0014.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IStorageService } from "./module-0512.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ITextResourcePropertiesService } from "./module-0204.mjs";


// src/vs/workbench/services/textresourceProperties/common/textResourcePropertiesService.ts
var TextResourcePropertiesService = class {
  constructor(configurationService, remoteAgentService, environmentService, storageService) {
    this.configurationService = configurationService;
    this.environmentService = environmentService;
    this.storageService = storageService;
    this.remoteEnvironment = null;
    remoteAgentService.getEnvironment().then((remoteEnv) => this.remoteEnvironment = remoteEnv);
  }
  getEOL(resource, language2) {
    const eol = this.configurationService.getValue("files.eol", { overrideIdentifier: language2, resource });
    if (eol && typeof eol === "string" && eol !== "auto") {
      return eol;
    }
    const os = this.getOS(resource);
    return os === 3 /* Linux */ || os === 2 /* Macintosh */ ? "\n" : "\r\n";
  }
  getOS(resource) {
    let os = OS;
    const remoteAuthority = this.environmentService.remoteAuthority;
    if (remoteAuthority) {
      if (resource && resource.scheme !== Schemas.file) {
        const osCacheKey = `resource.authority.os.${remoteAuthority}`;
        os = this.remoteEnvironment ? this.remoteEnvironment.os : (
          /* Get it from cache */
          this.storageService.getNumber(osCacheKey, 1 /* WORKSPACE */, OS)
        );
        this.storageService.store(osCacheKey, os, 1 /* WORKSPACE */, 1 /* MACHINE */);
      }
    }
    return os;
  }
};

TextResourcePropertiesService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IRemoteAgentService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IStorageService)
], TextResourcePropertiesService);

registerSingleton(ITextResourcePropertiesService, TextResourcePropertiesService, 1 /* Delayed */);
export { TextResourcePropertiesService };
