// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/remote/browser/remote.contribution.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { AutomaticPortForwarding, ForwardedPortsView, PortRestore, TOGGLE_VIEW_ACTION_ID } from "./module-1546.mjs";
import { localize } from "./module-0001.mjs";
import { IViewsService } from "./module-1246.mjs";
import { TUNNEL_VIEW_ID } from "./module-1414.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { ShowCandidateContribution } from "./module-3486.mjs";
import { TunnelFactoryContribution } from "./module-3487.mjs";
import { RemoteAgentConnectionStatusListener, RemoteMarkers } from "./module-3496.mjs";
import { RemoteStatusIndicator } from "./module-3497.mjs";
import { InitialRemoteConnectionHealthContribution } from "./module-3498.mjs";


// src/vs/workbench/contrib/remote/browser/remote.contribution.ts
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: TOGGLE_VIEW_ACTION_ID,
      title: localize(18478, null)
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    if (viewsService.isViewVisible(TUNNEL_VIEW_ID)) {
      viewsService.closeView(TUNNEL_VIEW_ID);
    } else {
      await viewsService.openView(TUNNEL_VIEW_ID, true);
    }
  }
});

var workbenchContributionsRegistry5 = Registry.as(Extensions10.Workbench);

registerWorkbenchContribution2(ShowCandidateContribution.ID, ShowCandidateContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(TunnelFactoryContribution.ID, TunnelFactoryContribution, WorkbenchPhase.BlockRestore);

workbenchContributionsRegistry5.registerWorkbenchContribution(RemoteAgentConnectionStatusListener, 4 /* Eventually */);

registerWorkbenchContribution2(RemoteStatusIndicator.ID, RemoteStatusIndicator, WorkbenchPhase.BlockStartup);

workbenchContributionsRegistry5.registerWorkbenchContribution(ForwardedPortsView, 3 /* Restored */);

workbenchContributionsRegistry5.registerWorkbenchContribution(PortRestore, 4 /* Eventually */);

workbenchContributionsRegistry5.registerWorkbenchContribution(AutomaticPortForwarding, 4 /* Eventually */);

workbenchContributionsRegistry5.registerWorkbenchContribution(RemoteMarkers, 4 /* Eventually */);

workbenchContributionsRegistry5.registerWorkbenchContribution(InitialRemoteConnectionHealthContribution, 3 /* Restored */);
export { workbenchContributionsRegistry5 };
