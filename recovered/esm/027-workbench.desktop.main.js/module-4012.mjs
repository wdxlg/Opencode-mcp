// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/electron-browser/terminalRemote.ts
import { registerTerminalAction } from "./module-3272.mjs";
import { localize2 } from "./module-0001.mjs";
import { IHistoryService } from "./module-1494.mjs";
import { IRemoteAuthorityResolverService } from "./module-0894.mjs";
import { INativeEnvironmentService } from "./module-0508.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/workbench/contrib/terminal/electron-browser/terminalRemote.ts
function registerRemoteContributions() {
  registerTerminalAction({
    id: "workbench.action.terminal.newLocal" /* NewLocal */,
    title: localize2(20369, "Create New Integrated Terminal (Local)"),
    run: async (c, accessor) => {
      const historyService = accessor.get(IHistoryService);
      const remoteAuthorityResolverService = accessor.get(IRemoteAuthorityResolverService);
      const nativeEnvironmentService = accessor.get(INativeEnvironmentService);
      let cwd2;
      try {
        const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(Schemas.vscodeRemote);
        if (activeWorkspaceRootUri) {
          const canonicalUri = await remoteAuthorityResolverService.getCanonicalURI(activeWorkspaceRootUri);
          if (canonicalUri.scheme === Schemas.file) {
            cwd2 = canonicalUri;
          }
        }
      } catch {
      }
      if (!cwd2) {
        cwd2 = nativeEnvironmentService.userHome;
      }
      const instance2 = await c.service.createTerminal({ cwd: cwd2 });
      if (!instance2) {
        return Promise.resolve(void 0);
      }
      c.service.setActiveInstance(instance2);
      return c.groupService.showPanel(true);
    }
  });
}
export { registerRemoteContributions };
