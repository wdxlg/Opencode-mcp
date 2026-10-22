// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/extHostVariableResolverService.ts
import { ExtHostVariableResolverProviderService } from "./module-0313.mjs";


// src/vs/workbench/api/node/extHostVariableResolverService.ts
import { homedir as homedir3 } from "os";

var NodeExtHostVariableResolverProviderService = class extends ExtHostVariableResolverProviderService {
  homeDir() {
    return homedir3();
  }
};
export { homedir3, NodeExtHostVariableResolverProviderService };
