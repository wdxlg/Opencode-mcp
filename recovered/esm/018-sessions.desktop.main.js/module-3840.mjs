// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/remote/electron-browser/remoteAgentService.ts
import { AbstractRemoteAgentService } from "./module-3839.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteSocketFactoryService } from "./module-1233.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IProductService } from "./module-0875.mjs";
import { IRemoteAuthorityResolverService, RemoteAuthorityResolverError } from "./module-0896.mjs";
import { ISignService } from "./module-3838.mjs";
import { ILogService } from "./module-0095.mjs";
import { localize } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { URI } from "./module-0032.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/services/remote/electron-browser/remoteAgentService.ts
var RemoteAgentService = class extends AbstractRemoteAgentService {
  constructor(remoteSocketFactoryService, userDataProfileService, environmentService, productService, remoteAuthorityResolverService, signService, logService) {
    super(remoteSocketFactoryService, userDataProfileService, environmentService, productService, remoteAuthorityResolverService, signService, logService);
  }
};

RemoteAgentService = __decorateClass([
  __decorateParam(0, IRemoteSocketFactoryService),
  __decorateParam(1, IUserDataProfileService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IRemoteAuthorityResolverService),
  __decorateParam(5, ISignService),
  __decorateParam(6, ILogService)
], RemoteAgentService);

var RemoteConnectionFailureNotificationContribution = class {
  constructor(_remoteAgentService, notificationService, environmentService, telemetryService, nativeHostService, _remoteAuthorityResolverService, openerService) {
    this._remoteAgentService = _remoteAgentService;
    this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
    this._remoteAgentService.getRawEnvironment().then(void 0, (err) => {
      if (!RemoteAuthorityResolverError.isHandled(err)) {
        const choices = [
          {
            label: localize(23343, null),
            run: () => nativeHostService.openDevTools()
          }
        ];
        const troubleshootingURL = this._getTroubleshootingURL();
        if (troubleshootingURL) {
          choices.push({
            label: localize(23344, null),
            run: () => openerService.open(troubleshootingURL, { openExternal: true })
          });
        }
        notificationService.prompt(
          Severity2.Error,
          localize(23342, null, err ? err.message : ""),
          choices
        );
      }
    });
  }
  static {
    this.ID = "workbench.contrib.nativeRemoteConnectionFailureNotification";
  }
  _getTroubleshootingURL() {
    const remoteAgentConnection = this._remoteAgentService.getConnection();
    if (!remoteAgentConnection) {
      return null;
    }
    const connectionData = this._remoteAuthorityResolverService.getConnectionData(remoteAgentConnection.remoteAuthority);
    if (!connectionData || connectionData.connectTo.type !== 0 /* WebSocket */) {
      return null;
    }
    return URI.from({
      scheme: "http",
      authority: `${connectionData.connectTo.host}:${connectionData.connectTo.port}`,
      path: `/version`
    });
  }
};

RemoteConnectionFailureNotificationContribution = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, INativeHostService),
  __decorateParam(5, IRemoteAuthorityResolverService),
  __decorateParam(6, IOpenerService)
], RemoteConnectionFailureNotificationContribution);

registerWorkbenchContribution2(RemoteConnectionFailureNotificationContribution.ID, RemoteConnectionFailureNotificationContribution, WorkbenchPhase.BlockRestore);
export { RemoteAgentService, RemoteConnectionFailureNotificationContribution };
