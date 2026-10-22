// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/bridge-quick-tunnel.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/bridge-quick-tunnel.ts
init_define_OPENCODE_BUILD_INFO();

var CLOUDFLARE_EDGE_ROUTE_SETTING = "bridge.cloudflareEdgeRoute";

var QUICK_TUNNEL_CONFIG_NAME = "cloudflared-quick-tunnel.yml";

var QUICK_TUNNEL_CONFIG_TEXT = [
  "# Written by OpenCode for the Bridge Quick Tunnel. cloudflared is started with --config pointing here, so",
  "# ~/.cloudflared/config.yml (ingress rules, tunnel IDs, protocol) does not apply to the Bridge address.",
  "no-autoupdate: true",
  ""
].join("\n");

var QUICK_TUNNEL_DIRECT_PROBE_MS = 45e3;

var QUICK_TUNNEL_EDGE_TIMEOUT_MS = 12e4;

function normalizeEdgeRouteSetting(value) {
  return value === "direct" || value === "proxy" ? value : "auto";
}

function quickTunnelArgs(options) {
  if (!options.configFile) throw new Error("Quick Tunnel needs its own cloudflared config file.");
  const args = ["tunnel", "--config", options.configFile, "--no-autoupdate"];
  if (options.route === "proxy") {
    if (!options.relayPort) throw new Error("Quick Tunnel proxy route needs a relay port.");
    const edge = `127.0.0.1:${options.relayPort}`;
    args.push("--protocol", "http2", "--edge", edge, "--edge", edge);
  } else {
    args.push("--protocol", "auto");
  }
  args.push("--url", `http://127.0.0.1:${options.localPort}`);
  return args;
}

function chooseQuickTunnelRoute(options) {
  if (options.setting !== "auto") return options.setting;
  if (!options.proxyAvailable) return "direct";
  return options.directFailed || options.proxyWorked ? "proxy" : "direct";
}

function quickTunnelEdgeTimeoutMs(options) {
  return options.setting === "auto" && options.route === "direct" && options.proxyAvailable ? QUICK_TUNNEL_DIRECT_PROBE_MS : QUICK_TUNNEL_EDGE_TIMEOUT_MS;
}
export { normalizeEdgeRouteSetting, quickTunnelArgs, chooseQuickTunnelRoute, quickTunnelEdgeTimeoutMs, CLOUDFLARE_EDGE_ROUTE_SETTING, QUICK_TUNNEL_CONFIG_NAME, QUICK_TUNNEL_CONFIG_TEXT, QUICK_TUNNEL_DIRECT_PROBE_MS, QUICK_TUNNEL_EDGE_TIMEOUT_MS };
