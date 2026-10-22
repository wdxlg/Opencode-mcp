// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-network.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { resolveExtensionHostProxy } from "./module-0106.mjs";
import { stdioProxyEnvironment } from "./module-0110.mjs";
import { diagnosisRoute } from "./module-0108.mjs";


// extensions/opencode/src/external-mcp-network.ts
init_define_OPENCODE_BUILD_INFO();

var vscode4 = __toESM(require("vscode"));

var import_node_crypto12 = require("node:crypto");


// extensions/opencode/src/external-mcp-network.ts
var WATCHED = ["http.proxy", "http.noProxy", "http.proxySupport", "http.proxyStrictSSL", "opencode.mcp.extraCaCertificates"];

var RELOAD = ["http.systemCertificates"];

var PROBE = new URL("https://registry.npmjs.org/");

function withoutCredentials(proxy) {
  if (!proxy) return "";
  try {
    const url2 = new URL(proxy);
    return `${url2.protocol}//${url2.host}${url2.username || url2.password ? " (with credentials)" : ""}`;
  } catch {
    return "(invalid)";
  }
}

var ExternalMcpNetwork = class {
  emitter = new vscode4.EventEmitter();
  onDidChange = this.emitter.event;
  subscription;
  /** Shown once in the Skill page's MCP list after a change: 「网络设置已变化，已重连」. */
  lastChange;
  constructor() {
    this.subscription = vscode4.workspace.onDidChangeConfiguration((event) => {
      if (WATCHED.some((key) => event.affectsConfiguration(key))) {
        this.lastChange = Date.now();
        this.emitter.fire();
      }
      if (RELOAD.some((key) => event.affectsConfiguration(key))) {
        void vscode4.window.showInformationMessage("\u8BC1\u4E66\u76F8\u5173\u7684\u7F51\u7EDC\u8BBE\u7F6E\u9700\u8981\u91CD\u65B0\u52A0\u8F7D\u7A97\u53E3\u540E\uFF0C\u5171\u4EAB MCP \u670D\u52A1\u624D\u4F1A\u4F7F\u7528\u65B0\u8BBE\u7F6E\u3002", "\u91CD\u65B0\u52A0\u8F7D\u7A97\u53E3").then((choice) => {
          if (choice) void vscode4.commands.executeCommand("workbench.action.reloadWindow");
        });
      }
    });
  }
  state() {
    const http3 = vscode4.workspace.getConfiguration("http");
    const proxySupport = String(http3.get("proxySupport") ?? "override");
    const configured = http3.get("proxy") || void 0;
    const proxy = proxySupport === "off" ? void 0 : resolveExtensionHostProxy(PROBE, configured)?.replace(/\/$/, "");
    const noProxy = (http3.get("noProxy") ?? []).filter((entry) => typeof entry === "string");
    const extra = vscode4.workspace.getConfiguration("opencode").get("mcp.extraCaCertificates")?.trim() || void 0;
    return { proxySupport, proxy, noProxy, strictSsl: http3.get("proxyStrictSSL") !== false, extraCaCertificates: extra };
  }
  /** Stable across windows; carries no credential (only whether the proxy has one). */
  fingerprint(state = this.state()) {
    const material = JSON.stringify([state.proxySupport, withoutCredentials(state.proxy), state.noProxy, state.strictSsl, state.extraCaCertificates ?? ""]);
    return (0, import_node_crypto12.createHash)("sha256").update(material).digest("hex").slice(0, 16);
  }
  /** Proxy variables for a stdio server, by its proxy mode (the custom URL comes from SecretStorage). */
  stdioEnv(mode, customProxy) {
    const state = this.state();
    return stdioProxyEnvironment({ mode: mode ?? "inherit", proxySupport: state.proxySupport, resolvedProxy: state.proxy, customProxy, noProxy: state.noProxy, extraCaCertificates: state.extraCaCertificates });
  }
  /** Route for the diagnosis of one address: decided by that address, as for real connections. */
  routeFor(target) {
    const state = this.state();
    const configuredProxy = vscode4.workspace.getConfiguration("http").get("proxy") || void 0;
    return diagnosisRoute(target, { proxySupport: state.proxySupport, configuredProxy, noProxy: state.noProxy }, resolveExtensionHostProxy);
  }
  dispose() {
    this.subscription.dispose();
    this.emitter.dispose();
  }
};
export { withoutCredentials, vscode4, import_node_crypto12, WATCHED, RELOAD, PROBE, ExternalMcpNetwork };
