// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeStartupFailureActions.ts
import { bridgeStartupFailureDiagnostics } from "./module-2690.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeStartupFailureActions.ts
var BRIDGE_SHOW_LOG_COMMAND = "opencode.bridge.showLog";

var OPEN_SETTINGS_COMMAND3 = "workbench.action.openSettings";

var RELOAD_WINDOW_COMMAND = "workbench.action.reloadWindow";

var BRIDGE_STARTUP_FAILURE_LINKS = Object.freeze({
  ngrokDashboard: "https://dashboard.ngrok.com/endpoints",
  cloudflareDashboard: "https://one.dash.cloudflare.com/",
  cloudflaredDownload: "https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
});

var ACTIONS = {
  "retry": (_failure, host) => host.retryStart(),
  "install-cloudflared": (_failure, host) => host.installCloudflared(),
  "check-tunnel": (_failure, host) => host.checkTunnel(),
  "ngrok-setup": (_failure, host) => host.revealNgrokSetup(),
  "use-quick-tunnel": (_failure, host) => host.selectQuickTunnel(),
  "open-connection": (failure2, host) => host.openConnectionSettings(bridgeConnectionFieldFor(failure2.code, host.context())),
  "open-access": (_failure, host) => host.openAccess(),
  "open-folder": (_failure, host) => host.openFolder(),
  "cleanup-processes": (_failure, host) => host.cleanupProcesses(),
  "reload-window": (_failure, host) => host.executeCommand(RELOAD_WINDOW_COMMAND),
  "show-log": (_failure, host) => host.executeCommand(BRIDGE_SHOW_LOG_COMMAND),
  "open-proxy-settings": (_failure, host) => host.executeCommand(OPEN_SETTINGS_COMMAND3, "http.proxy"),
  "open-ngrok-dashboard": (_failure, host) => host.openExternal(BRIDGE_STARTUP_FAILURE_LINKS.ngrokDashboard),
  "open-cloudflare-dashboard": (_failure, host) => host.openExternal(BRIDGE_STARTUP_FAILURE_LINKS.cloudflareDashboard),
  "open-cloudflared-download": (_failure, host) => host.openExternal(BRIDGE_STARTUP_FAILURE_LINKS.cloudflaredDownload),
  "copy-service-url": (failure2, host) => typeof failure2.params.serviceUrl === "string" ? host.copyText(failure2.params.serviceUrl) : void 0,
  "copy-diagnostics": (failure2, host) => host.copyText(bridgeStartupFailureDiagnostics(failure2, host.context()))
};

function runBridgeStartupFailureAction(action, failure2, host) {
  return ACTIONS[action](failure2, host);
}

function bridgeConnectionFieldFor(code, context2) {
  switch (code) {
    case "ngrok-domain-missing":
    case "ngrok-domain-invalid":
    case "ngrok-endpoint-busy":
      return "ngrok-domain";
    case "named-config-missing":
      return context2.namedDomainConfigured ? "named-token" : "named-domain";
    case "named-token-invalid":
      return "named-token";
    case "named-config-invalid":
    case "local-port-in-use":
      return "named-port";
    default:
      return void 0;
  }
}
export { runBridgeStartupFailureAction, bridgeConnectionFieldFor, BRIDGE_SHOW_LOG_COMMAND, OPEN_SETTINGS_COMMAND3, RELOAD_WINDOW_COMMAND, BRIDGE_STARTUP_FAILURE_LINKS, ACTIONS };
