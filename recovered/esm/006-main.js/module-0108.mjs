// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/userDataProfile/electron-main/userDataProfile.ts
import { init_path, join4, resolve2 } from "./module-0008.mjs";
import { env, init_process } from "./module-0007.mjs";
import { init_resources, joinPath } from "./module-0032.mjs";
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { INativeEnvironmentService, init_environment } from "./module-0071.mjs";
import { IFileService, init_files } from "./module-0072.mjs";
import { init_instantiation, refineServiceDecorator } from "./module-0039.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";
import { IUriIdentityService, init_uriIdentity } from "./module-0077.mjs";
import { AGENTS_WINDOW_PROFILE_ID, IUserDataProfilesService, init_userDataProfile } from "./module-0078.mjs";
import { UserDataProfilesService2, init_userDataProfile2 } from "./module-0107.mjs";
import { IStateService, init_state } from "./module-0095.mjs";
import { URI, init_uri } from "./module-0030.mjs";


// src/vs/platform/userDataProfile/electron-main/userDataProfile.ts
function getAgentPluginsPath(args2, userHome) {
  const cliAgentPluginsDir = args2["agent-plugins-dir"];
  if (cliAgentPluginsDir) {
    return resolve2(cliAgentPluginsDir);
  }
  const vscodeAgentPlugins = env["VSCODE_AGENT_PLUGINS"];
  if (vscodeAgentPlugins) {
    return vscodeAgentPlugins;
  }
  const vscodePortable = env["VSCODE_PORTABLE"];
  if (vscodePortable) {
    return join4(vscodePortable, "agent-plugins");
  }
  return joinPath(userHome, "agent-plugins").fsPath;
}

var IUserDataProfilesMainService, UserDataProfilesMainService;

var init_userDataProfile3 = __esm({
  "src/vs/platform/userDataProfile/electron-main/userDataProfile.ts"() {
    init_resources();
    init_environment();
    init_files();
    init_instantiation();
    init_log();
    init_productService();
    init_uriIdentity();
    init_userDataProfile();
    init_userDataProfile2();
    init_state();
    init_uri();
    init_process();
    init_path();
    IUserDataProfilesMainService = refineServiceDecorator(IUserDataProfilesService);
    UserDataProfilesMainService = class extends UserDataProfilesService2 {
      constructor(stateService, uriIdentityService, environmentService, fileService, logService, productService) {
        super(stateService, uriIdentityService, environmentService, fileService, logService);
        this.agentPluginsHome = URI.file(getAgentPluginsPath(environmentService.args, joinPath(environmentService.userHome, productService.dataFolderName)));
      }
      createDefaultProfile() {
        return {
          ...super.createDefaultProfile(),
          agentPluginsHome: this.agentPluginsHome
        };
      }
      async createAgentsWindowProfile() {
        const existing = this.profiles.find((p) => p.id === AGENTS_WINDOW_PROFILE_ID);
        if (existing) {
          return existing;
        }
        return this.createProfile(AGENTS_WINDOW_PROFILE_ID, "Agents");
      }
      getAssociatedEmptyWindows() {
        const emptyWindows = [];
        for (const id2 of this.profilesObject.emptyWindows.keys()) {
          emptyWindows.push({ id: id2 });
        }
        return emptyWindows;
      }
    };
    UserDataProfilesMainService = __decorateClass([
      __decorateParam(0, IStateService),
      __decorateParam(1, IUriIdentityService),
      __decorateParam(2, INativeEnvironmentService),
      __decorateParam(3, IFileService),
      __decorateParam(4, ILogService),
      __decorateParam(5, IProductService)
    ], UserDataProfilesMainService);
  }
});
export { getAgentPluginsPath, IUserDataProfilesMainService, UserDataProfilesMainService, init_userDataProfile3 };
