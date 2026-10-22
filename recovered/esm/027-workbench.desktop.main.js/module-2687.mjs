// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeStartupFailureCatalog.ts
import { isSimplifiedChinese } from "./module-2646.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeStartupFailureCatalog.ts
var BRIDGE_STARTUP_FAILURE_CODES = [
  "not-licensed",
  "device-unavailable",
  "signed-out",
  "no-workspace",
  "cleanup-in-progress",
  "disposed",
  "cancelled",
  "ngrok-domain-missing",
  "ngrok-domain-invalid",
  "named-config-missing",
  "named-config-invalid",
  "named-token-invalid",
  "cloudflared-missing",
  "cloudflared-install-failed",
  "ngrok-missing",
  "ngrok-config-invalid",
  "stale-tunnel",
  "local-port-in-use",
  "local-health-failed",
  "ngrok-proxy-rejected",
  "ngrok-endpoint-busy",
  "ngrok-start-failed",
  "edge-unreachable",
  "quick-tunnel-tls-failed",
  "quick-tunnel-api-failed",
  "tunnel-exited",
  "named-route-mismatch",
  "public-health-unreachable",
  "public-health-timeout",
  "network-failed",
  "tunnel-retrying",
  "reconnecting",
  "license-renew-failed",
  "access-lost",
  "unknown"
];

var PROXY_TUN_ZH = "Cloudflare \u8FB9\u7F18\u8FDE\u63A5\u4F7F\u7528 7844 \u7AEF\u53E3\uFF1AQUIC \u4E3A UDP\uFF0CHTTP/2 \u4E3A TCP\u3002\u53EA\u6709\u81EA\u52A8\u8DEF\u7531\u6A21\u5F0F\u4E14\u914D\u7F6E\u4E86\u53EF\u7528 HTTP \u4EE3\u7406\u65F6\u624D\u53EF\u80FD\u5C1D\u8BD5 CONNECT \u8F6C\u53D1\uFF0C\u4EE3\u7406\u8FD8\u5FC5\u987B\u5141\u8BB8 7844\uFF1B\u4E0D\u4FDD\u8BC1\u7ED5\u8FC7\u7CFB\u7EDF TUN/fake-ip\u3002\u82E5\u8FB9\u7F18\u57DF\u540D\u89E3\u6790\u5230 198.18.0.0/15 \u6216\u51FA\u73B0 TLS EOF\uFF0C\u8BF7\u7531\u4F60\u6838\u5BF9\u4EE3\u7406\u5DE5\u5177\u7684 argotunnel.com\u3001trycloudflare.com \u76F4\u8FDE\u53CA\u771F\u5B9E DNS \u89C4\u5219\uFF0C\u6216\u624B\u52A8\u9009\u62E9 ngrok\u3002TCP \u63E1\u624B\u6210\u529F\u4E0D\u7B49\u4E8E TLS/QUIC \u6210\u529F\uFF1BOpenCode \u4E0D\u4F1A\u81EA\u52A8\u66F4\u6539\u7CFB\u7EDF\u7F51\u7EDC\u3002";

var PROXY_TUN_EN = "Cloudflare edge connections use port 7844: UDP for QUIC, TCP for HTTP/2. Only automatic route mode with a configured HTTP proxy may try CONNECT; that proxy must allow 7844. This does not guarantee connectivity and does not bypass system-level TUN routing or fake-ip DNS. If edge DNS returns 198.18.0.0/15 or TLS ends in EOF, review direct-routing and real-DNS rules for argotunnel.com and trycloudflare.com in your proxy app, or manually choose ngrok. A TCP handshake is not a TLS/QUIC success. OpenCode does not change system network settings.";

var HEALTH_PROXY_ZH = "\u8BF7\u5148\u786E\u8BA4\u672C\u5730 Bridge \u5065\u5EB7\u3001\u6240\u9009\u96A7\u9053\u5DF2\u6CE8\u518C\u4E14\u516C\u7F51 HTTPS \u53EF\u8FBE\uFF0C\u518D\u6309\u63D0\u4F9B\u65B9\u68C0\u67E5 http.proxy\u3001DNS \u548C TUN/fake-ip \u8DEF\u7531\u3002\u66F4\u6539\u4EE3\u7406\u89C4\u5219\u6216\u4F20\u8F93\u65B9\u5F0F\u9700\u4F60\u786E\u8BA4\uFF1BOpenCode \u4E0D\u4F1A\u81EA\u52A8\u66F4\u6539\u7CFB\u7EDF\u7F51\u7EDC\u3002";

var HEALTH_PROXY_EN = "First confirm local Bridge health, registration of the selected tunnel and public HTTPS reachability. Then check http.proxy, DNS and TUN/fake-ip routing for that provider. Proxy-rule or transport changes require your choice; OpenCode does not change system network settings.";

var BRIDGE_STARTUP_FAILURE_CATALOG = Object.freeze({
  "not-licensed": {
    severity: "error",
    title: ["\u5C1A\u672A\u53D6\u5F97\u6709\u6548\u7684 Bridge \u6388\u6743", "Bridge access is not active"],
    cause: ["\u8BF7\u5728\u300C\u8D26\u53F7\u4E0E\u6388\u6743\u300D\u4E2D\u767B\u5F55\u5E76\u5237\u65B0\u6388\u6743\u3002\u82E5\u5DF2\u4ED8\u6B3E\uFF0C\u8BF7\u52FF\u91CD\u590D\u8D2D\u4E70\uFF1B\u7F51\u7EDC\u6062\u590D\u540E\u4F1A\u91CD\u65B0\u540C\u6B65\u3002", "Sign in and refresh access in Account & access. If you already paid, do not pay again; access syncs again once the network recovers."],
    actions: ["open-access"]
  },
  "device-unavailable": {
    severity: "error",
    title: ["\u5F53\u524D\u8BBE\u5907\u6388\u6743\u4E0D\u53EF\u7528", "This device's access is unavailable"],
    cause: ["\u8BF7\u5728\u6388\u6743\u540E\u53F0\u68C0\u67E5\u8BBE\u5907\u662F\u5426\u88AB\u64A4\u9500\u6216\u8D85\u8FC7\u7ED1\u5B9A\u6570\u91CF\uFF1B\u5904\u7406\u540E\u5237\u65B0\u6388\u6743\u5373\u53EF\uFF0C\u65E0\u9700\u91CD\u590D\u8D2D\u4E70\u3002", "Check whether this device was revoked or exceeds the device limit, then refresh access. No new purchase is needed."],
    actions: ["open-access"]
  },
  "signed-out": {
    severity: "error",
    title: ["\u767B\u5F55\u72B6\u6001\u5931\u6548\u6216\u5C1A\u672A\u767B\u5F55", "Not signed in, or the session expired"],
    cause: ["\u8BF7\u91CD\u65B0\u767B\u5F55\u539F\u6765\u7684 GitHub \u6216 Gitee \u8D26\u53F7\uFF0C\u5237\u65B0\u6388\u6743\u540E\u518D\u542F\u52A8 Bridge\u3002", "Sign in again with the same GitHub or Gitee account, refresh access, then start Bridge."],
    actions: ["open-access"]
  },
  "no-workspace": {
    severity: "error",
    title: ["\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u9879\u76EE\u6587\u4EF6\u5939", "Open a project folder first"],
    cause: ["Bridge \u7684\u5DE5\u5177\u5728\u5F53\u524D\u7A97\u53E3\u6253\u5F00\u7684\u9879\u76EE\u91CC\u8FD0\u884C\uFF0C\u6CA1\u6709\u6253\u5F00\u6587\u4EF6\u5939\u65F6\u65E0\u6CD5\u542F\u52A8\u3002", "Bridge tools run in the project open in this window, so Bridge cannot start without a folder."],
    actions: ["open-folder"]
  },
  "cleanup-in-progress": {
    severity: "warning",
    title: ["\u6B63\u5728\u6E05\u7406\u4E0A\u6B21\u7684\u96A7\u9053", "Cleaning up the previous tunnel"],
    cause: ["\u6E05\u7406\u5B8C\u6210\u524D\u4E0D\u80FD\u542F\u52A8\uFF0C\u8BF7\u7A0D\u5019\u51E0\u79D2\u518D\u91CD\u8BD5\u3002", "Bridge cannot start until the cleanup finishes. Wait a few seconds, then retry."],
    actions: ["retry"],
    standalone: true
  },
  "disposed": {
    severity: "error",
    title: ["\u672C\u7A97\u53E3\u7684 Bridge \u5DF2\u5173\u95ED", "Bridge was shut down in this window"],
    cause: ["\u5DE5\u4F5C\u533A\u5173\u95ED\u65F6\uFF0C\u672C\u7A97\u53E3\u7684 Bridge \u5DF2\u968F\u4E4B\u91CA\u653E\u3002\u8BF7\u91CD\u65B0\u52A0\u8F7D\u7A97\u53E3\uFF0C\u6216\u91CD\u65B0\u6253\u5F00\u9879\u76EE\u540E\u518D\u542F\u52A8\u3002", "Bridge in this window was released when the workspace closed. Reload the window or reopen the project, then start again."],
    actions: ["reload-window"],
    standalone: true
  },
  "cancelled": {
    severity: "info",
    title: ["\u542F\u52A8\u5DF2\u53D6\u6D88", "Startup cancelled"],
    cause: ["Bridge \u5728\u542F\u52A8\u8FC7\u7A0B\u4E2D\u88AB\u505C\u6B62\u3002\u9700\u8981\u65F6\u53EF\u4EE5\u91CD\u65B0\u542F\u52A8\u3002", "Bridge was stopped while it was starting. Start it again when needed."],
    actions: ["retry"],
    standalone: true
  },
  "ngrok-domain-missing": {
    severity: "error",
    title: ["\u8FD8\u6CA1\u586B\u5199 ngrok \u56FA\u5B9A\u57DF\u540D", "The ngrok reserved domain is missing"],
    cause: ["ngrok \u6A21\u5F0F\u9700\u8981\u4F60\u5728 ngrok \u63A7\u5236\u53F0\u9886\u53D6\u7684\u56FA\u5B9A\u57DF\u540D\u3002\u586B\u5199\u540E\u518D\u542F\u52A8\u3002", "ngrok mode needs the reserved domain from your ngrok dashboard. Enter it, then start."],
    actions: ["open-connection", "ngrok-setup"]
  },
  "ngrok-domain-invalid": {
    severity: "error",
    title: ["ngrok \u56FA\u5B9A\u57DF\u540D\u683C\u5F0F\u4E0D\u5BF9", "The ngrok reserved domain is invalid"],
    cause: ["\u53EA\u586B\u5199\u57DF\u540D\u672C\u8EAB\uFF0C\u4F8B\u5982 example.ngrok-free.app\uFF0C\u4E0D\u8981\u5E26 https://\u3001\u8DEF\u5F84\u6216\u7AEF\u53E3\u3002", "Enter only the domain, such as example.ngrok-free.app, without https://, a path or a port."],
    actions: ["open-connection"]
  },
  "named-config-missing": {
    severity: "error",
    title: ["\u547D\u540D\u96A7\u9053\u8FD8\u6CA1\u914D\u7F6E\u5B8C\u6574", "Named Tunnel setup is incomplete"],
    cause: ["\u8BF7\u5148\u5728\u8FDE\u63A5\u8BBE\u7F6E\u4E2D\u4FDD\u5B58 Cloudflare \u516C\u7F51\u4E3B\u673A\u540D\u548C Tunnel Token\u3002", "Save the Cloudflare public hostname and Tunnel Token in Connection settings first."],
    actions: ["open-connection"]
  },
  "named-config-invalid": {
    severity: "error",
    title: ["\u547D\u540D\u96A7\u9053\u914D\u7F6E\u4E0D\u6B63\u786E", "Named Tunnel settings are invalid"],
    cause: ["\u672C\u5730\u7AEF\u53E3\u5FC5\u987B\u662F 1024\u201365535 \u7684\u6574\u6570\uFF0C\u5E76\u4E0E Cloudflare \u91CC\u7684 Service URL \u4E00\u81F4\u3002", "The local port must be an integer from 1024 to 65535 and match the Service URL in Cloudflare."],
    actions: ["open-connection"]
  },
  "named-token-invalid": {
    severity: "error",
    title: ["Cloudflare \u62D2\u7EDD\u4E86 Tunnel Token", "Cloudflare rejected the Tunnel Token"],
    cause: ["\u4EE4\u724C\u53EF\u80FD\u5DF2\u8F6E\u6362\u6216\u590D\u5236\u4E0D\u5B8C\u6574\u3002\u8BF7\u5728 Cloudflare \u63A7\u5236\u53F0\u91CD\u65B0\u590D\u5236\u4EE4\u724C\uFF0C\u4FDD\u5B58\u540E\u91CD\u8BD5\u3002", "The token may have been rotated or copied incompletely. Copy it again from the Cloudflare dashboard, save it, then retry."],
    actions: ["open-connection", "open-cloudflare-dashboard"]
  },
  "cloudflared-missing": {
    severity: "error",
    title: ["\u672A\u5B89\u88C5 cloudflared", "cloudflared is not installed"],
    cause: ["Cloudflare \u96A7\u9053\u9700\u8981 cloudflared \u7A0B\u5E8F\uFF0C\u672C\u673A\u8FD8\u6CA1\u6709\u5B89\u88C5\u3002", "Cloudflare tunnels need the cloudflared program, which is not installed on this PC."],
    actions: ["install-cloudflared", "check-tunnel"]
  },
  "cloudflared-install-failed": {
    severity: "error",
    title: ["cloudflared \u6CA1\u6709\u5B89\u88C5\u6210\u529F", "cloudflared was not installed"],
    cause: ["\u901A\u8FC7 Winget \u5B89\u88C5\u6CA1\u6709\u6210\u529F\u3002\u53EF\u4EE5\u6253\u5F00\u5B98\u65B9\u4E0B\u8F7D\u9875\u624B\u52A8\u5B89\u88C5\uFF0C\u88C5\u597D\u540E\u91CD\u65B0\u68C0\u6D4B\u3002", "Installing with Winget did not succeed. Install it manually from the official download page, then check again."],
    actions: ["open-cloudflared-download", "check-tunnel"]
  },
  "ngrok-missing": {
    severity: "error",
    title: ["\u672A\u5B89\u88C5 ngrok", "ngrok is not installed"],
    cause: ["ngrok \u6A21\u5F0F\u9700\u8981\u672C\u673A\u5B89\u88C5 ngrok \u5E76\u8BBE\u7F6E authtoken\uFF1B\u4E5F\u53EF\u4EE5\u6539\u7528\u4E0D\u9700\u8981\u8D26\u53F7\u7684 Cloudflare Quick Tunnel\u3002", "ngrok mode needs ngrok installed with an authtoken. You can also switch to Cloudflare Quick Tunnel, which needs no account."],
    actions: ["ngrok-setup", "use-quick-tunnel"]
  },
  "ngrok-config-invalid": {
    severity: "error",
    title: ["ngrok \u914D\u7F6E\u68C0\u67E5\u6CA1\u901A\u8FC7", "ngrok configuration check failed"],
    cause: ["\u5E38\u89C1\u539F\u56E0\u662F\u8FD8\u6CA1\u8BBE\u7F6E authtoken\uFF1A\u5728 PowerShell \u4E2D\u8FD0\u884C ngrok config add-authtoken <\u4F60\u7684 authtoken>\uFF0C\u7136\u540E\u91CD\u8BD5\u3002", "Usually the authtoken is missing: run ngrok config add-authtoken <your authtoken> in PowerShell, then retry."],
    actions: ["ngrok-setup", "use-quick-tunnel"]
  },
  "stale-tunnel": {
    severity: "error",
    title: ["\u4E0A\u6B21\u9057\u7559\u7684\u96A7\u9053\u8FDB\u7A0B\u65E0\u6CD5\u7ED3\u675F", "A leftover tunnel process could not be stopped"],
    cause: ["\u4E0A\u6B21\u5F02\u5E38\u9000\u51FA\u7559\u4E0B\u7684\u96A7\u9053\u8FDB\u7A0B\uFF08pid {pid}\uFF09\u4ECD\u5728\u8FD0\u884C\uFF0COpenCode \u6CA1\u80FD\u81EA\u52A8\u7ED3\u675F\u5B83\u3002\u8BF7\u70B9\u300C\u6E05\u7406\u8FDB\u7A0B\u300D\uFF0C\u6216\u5728\u4EFB\u52A1\u7BA1\u7406\u5668\u4E2D\u7ED3\u675F\u8BE5\u8FDB\u7A0B\u540E\u91CD\u8BD5\u3002", "A tunnel process left by an unclean shutdown (pid {pid}) is still running and OpenCode could not stop it. Click Clean up processes, or end it in Task Manager, then retry."],
    causeWithoutParams: ["\u4E0A\u6B21\u5F02\u5E38\u9000\u51FA\u7559\u4E0B\u7684\u96A7\u9053\u8FDB\u7A0B\u4ECD\u5728\u8FD0\u884C\uFF0COpenCode \u6CA1\u80FD\u81EA\u52A8\u7ED3\u675F\u5B83\u3002\u8BF7\u70B9\u300C\u6E05\u7406\u8FDB\u7A0B\u300D\uFF0C\u6216\u5728\u4EFB\u52A1\u7BA1\u7406\u5668\u4E2D\u7ED3\u675F\u8BE5\u8FDB\u7A0B\u540E\u91CD\u8BD5\u3002", "A tunnel process left by an unclean shutdown is still running and OpenCode could not stop it. Click Clean up processes, or end it in Task Manager, then retry."],
    actions: ["cleanup-processes", "retry", "show-log"]
  },
  "local-port-in-use": {
    severity: "error",
    title: ["\u672C\u5730\u7AEF\u53E3\u5DF2\u88AB\u5360\u7528", "The local port is in use"],
    cause: ["\u547D\u540D\u96A7\u9053\u4F7F\u7528\u56FA\u5B9A\u7684\u672C\u5730\u7AEF\u53E3 {port}\uFF0C\u73B0\u5728\u88AB\u5176\u4ED6\u7A0B\u5E8F\u5360\u7528\u3002\u8BF7\u6362\u4E00\u4E2A\u7AEF\u53E3\uFF0C\u5E76\u540C\u6B65\u4FEE\u6539 Cloudflare \u91CC\u7684 Service URL\uFF1B\u4E0D\u8981\u76F4\u63A5\u7ED3\u675F\u4E0D\u660E\u8FDB\u7A0B\u3002", "Named Tunnel uses the fixed local port {port}, which another program is using. Choose another port and update the Service URL in Cloudflare; do not kill unknown processes."],
    causeWithoutParams: ["\u547D\u540D\u96A7\u9053\u4F7F\u7528\u7684\u56FA\u5B9A\u672C\u5730\u7AEF\u53E3\u88AB\u5176\u4ED6\u7A0B\u5E8F\u5360\u7528\u3002\u8BF7\u6362\u4E00\u4E2A\u7AEF\u53E3\uFF0C\u5E76\u540C\u6B65\u4FEE\u6539 Cloudflare \u91CC\u7684 Service URL\uFF1B\u4E0D\u8981\u76F4\u63A5\u7ED3\u675F\u4E0D\u660E\u8FDB\u7A0B\u3002", "Another program is using the fixed local port of the Named Tunnel. Choose another port and update the Service URL in Cloudflare; do not kill unknown processes."],
    actions: ["open-connection", "show-log"]
  },
  "local-health-failed": {
    severity: "error",
    title: ["\u672C\u5730\u670D\u52A1\u81EA\u68C0\u6CA1\u901A\u8FC7", "The local service self-check failed"],
    cause: ["Bridge \u7684\u672C\u5730\u670D\u52A1\u542F\u52A8\u540E\u6CA1\u6709\u901A\u8FC7\u81EA\u68C0\uFF0C\u53EF\u80FD\u88AB\u5B89\u5168\u8F6F\u4EF6\u6216\u672C\u673A\u9632\u706B\u5899\u62E6\u622A\u4E86 127.0.0.1 \u7684\u8FDE\u63A5\u3002\u8BF7\u91CD\u8BD5\uFF1B\u4ECD\u5931\u8D25\u65F6\u67E5\u770B\u65E5\u5FD7\u3002", "Bridge's local service started but failed its self-check; security software or the local firewall may be blocking connections to 127.0.0.1. Retry, and check the log if it still fails."],
    actions: ["retry", "show-log"]
  },
  "ngrok-proxy-rejected": {
    severity: "error",
    title: ["ngrok \u4E0D\u80FD\u7ECF\u5F53\u524D\u4EE3\u7406\u8FDE\u63A5", "ngrok cannot connect through this proxy"],
    cause: ["ngrok \u8FD4\u56DE ERR_NGROK_9009\uFF1A\u7ECF HTTP \u4EE3\u7406\u8FDE\u63A5\u662F\u4ED8\u8D39\u529F\u80FD\u3002\u8BF7\u5220\u9664 ngrok \u914D\u7F6E\u6587\u4EF6\uFF08%LOCALAPPDATA%\\ngrok\\ngrok.yml\uFF09\u91CC\u7684 proxy_url\uFF0C\u5E76\u786E\u8BA4\u6CA1\u6709\u8BBE\u7F6E http_proxy \u73AF\u5883\u53D8\u91CF\uFF0C\u7136\u540E\u91CD\u8BD5\u3002", "ngrok returned ERR_NGROK_9009: connecting through an HTTP proxy is a paid feature. Remove proxy_url from the ngrok config (%LOCALAPPDATA%\\ngrok\\ngrok.yml) and make sure http_proxy is not set, then retry."],
    actions: ["show-log", "use-quick-tunnel"]
  },
  "ngrok-endpoint-busy": {
    severity: "error",
    title: ["ngrok \u57DF\u540D\u6B63\u88AB\u522B\u5904\u5360\u7528", "The ngrok domain is already online"],
    cause: ["\u8BE5\u57DF\u540D\u5DF2\u6709\u4EE3\u7406\u4F1A\u8BDD\u6216\u4E91\u7AEF\u7AEF\u70B9/\u6D41\u91CF\u7B56\u7565\u5360\u7528\uFF08ERR_NGROK_334\uFF09\uFF0C\u5E76\u4E0D\u8BC1\u660E\u672C\u673A\u6709\u6B8B\u7559\u8FDB\u7A0B\u3002\u8BF7\u5728 ngrok \u63A7\u5236\u53F0\u786E\u8BA4\u5360\u7528\u8005\uFF0C\u4E3A MCP \u6362\u72EC\u7ACB\u57DF\u540D\uFF0C\u6216\u4EC5\u505C\u7528\u786E\u8BA4\u4E0D\u518D\u9700\u8981\u7684\u7AEF\u70B9\u540E\u91CD\u8BD5\u3002\u521A\u5173\u95ED\u7684\u7AEF\u70B9\u53EF\u80FD\u9700\u8981\u7247\u523B\u91CA\u653E\uFF1B\u4E0D\u4F1A\u81EA\u52A8\u53CD\u590D\u91CD\u8BD5\u3001\u5F3A\u6740\u6216\u542F\u7528\u8FDE\u63A5\u6C60\u3002", "An agent session or Cloud Endpoint/traffic policy already owns this domain (ERR_NGROK_334); this does not prove a local orphan exists. Check the owner in the ngrok dashboard and use a dedicated MCP domain, or stop only an endpoint you own and no longer need before retrying. A recently stopped endpoint may need time to release. OpenCode does not repeatedly retry, kill unrelated processes or enable pooling."],
    actions: ["open-ngrok-dashboard", "open-connection", "use-quick-tunnel"]
  },
  "ngrok-start-failed": {
    severity: "error",
    title: ["ngrok \u6CA1\u80FD\u5EFA\u7ACB\u56FA\u5B9A\u57DF\u540D", "ngrok could not open the reserved domain"],
    cause: ["\u8BF7\u67E5\u770B\u6280\u672F\u8BE6\u60C5\u91CC\u7684 ngrok \u9519\u8BEF\u7801\uFF0C\u5E76\u786E\u8BA4\u8FD9\u4E2A\u57DF\u540D\u5C5E\u4E8E\u5F53\u524D authtoken \u5BF9\u5E94\u7684\u8D26\u53F7\u3002", "Check the ngrok error code in the technical details and make sure the domain belongs to the account of the current authtoken."],
    actions: ["show-log", "use-quick-tunnel"]
  },
  "edge-unreachable": {
    severity: "error",
    title: ["\u8FDE\u4E0D\u4E0A Cloudflare \u7F51\u7EDC", "Cannot reach the Cloudflare network"],
    cause: [`cloudflared \u8FDE\u4E0D\u4E0A Cloudflare \u8FB9\u7F18\u8282\u70B9\u3002${PROXY_TUN_ZH}`, `cloudflared cannot reach the Cloudflare edge. ${PROXY_TUN_EN}`],
    actions: ["retry", "open-proxy-settings", "show-log"]
  },
  "quick-tunnel-tls-failed": {
    severity: "error",
    title: ["\u7533\u8BF7\u4E34\u65F6\u5730\u5740\u65F6\u8BC1\u4E66\u4E0D\u53EF\u4FE1", "Certificate verification failed for Quick Tunnel"],
    cause: ["cloudflared \u65E0\u6CD5\u9A8C\u8BC1 api.trycloudflare.com \u7684 TLS \u8BC1\u4E66\u3002\u8BF7\u5206\u522B\u5BF9\u6BD4\u672C\u673A\u4E0E\u53EF\u4FE1\u516C\u5171 DNS \u7684 A\u3001AAAA \u8BB0\u5F55\uFF0C\u5E76\u68C0\u67E5\u7CFB\u7EDF\u4EE3\u7406\u3001TUN/fake-ip\u3001\u8BC1\u4E66\u94FE\u53CA HTTPS \u62E6\u622A\uFF1B\u4E0D\u4EE3\u8868\u4E00\u5B9A\u662F DNS \u6C61\u67D3\u3002\u4FEE\u6B63\u7F51\u7EDC\u73AF\u5883\u540E\u518D\u91CD\u8BD5\uFF0COpenCode \u4E0D\u4F1A\u4FEE\u6539 hosts \u6216\u5173\u95ED\u8BC1\u4E66\u6821\u9A8C\u3002", "cloudflared could not verify the TLS certificate for api.trycloudflare.com. Compare local and trusted public DNS A/AAAA records, and check proxy, TUN/fake-ip, certificate trust and HTTPS interception. DNS hijacking is only one possibility. Fix the network path before retrying; OpenCode will not change hosts or disable certificate verification."],
    actions: ["show-log", "open-proxy-settings", "retry"]
  },
  "quick-tunnel-api-failed": {
    severity: "error",
    title: ["\u6CA1\u80FD\u7533\u8BF7\u5230\u4E34\u65F6\u5730\u5740", "Could not get a temporary address"],
    cause: ["\u5411 api.trycloudflare.com \u7533\u8BF7\u5730\u5740\u65F6\u8FDE\u63A5\u88AB\u4E2D\u65AD\u3002\u82E5\u4EE3\u7406\u8F6F\u4EF6\u4F7F\u7528 fake-ip \u6216\u5168\u5C40\u6A21\u5F0F\uFF0C\u8BF7\u628A *.trycloudflare.com \u8BBE\u4E3A\u76F4\u8FDE\uFF0C\u6216\u6682\u505C\u4EE3\u7406\u540E\u91CD\u8BD5\u3002", "The request to api.trycloudflare.com was interrupted. If your proxy uses fake-ip DNS or global mode, route *.trycloudflare.com directly or pause the proxy, then retry."],
    actions: ["retry", "show-log"]
  },
  "tunnel-exited": {
    severity: "error",
    title: ["\u96A7\u9053\u7A0B\u5E8F\u610F\u5916\u9000\u51FA", "The tunnel program exited unexpectedly"],
    cause: ["\u96A7\u9053\u7A0B\u5E8F\u5728\u542F\u52A8\u8FC7\u7A0B\u4E2D\u9000\u51FA\u4E86\uFF0C\u5177\u4F53\u539F\u56E0\u89C1\u6280\u672F\u8BE6\u60C5\u6216\u65E5\u5FD7\u3002", "The tunnel program exited while starting. See the technical details or the log for the reason."],
    actions: ["retry", "show-log"]
  },
  "named-route-mismatch": {
    severity: "error",
    title: ["\u57DF\u540D\u6CA1\u6709\u6307\u5411\u672C\u673A Bridge", "The hostname does not reach this Bridge"],
    cause: ["\u547D\u540D\u96A7\u9053\u5DF2\u8FDE\u4E0A Cloudflare\uFF0C\u4F46\u516C\u7F51\u4E3B\u673A\u540D {domain} \u7684 Service URL \u9700\u8981\u8BBE\u4E3A {serviceUrl}\u3002", "The Named Tunnel is connected, but the Service URL of {domain} must be set to {serviceUrl}."],
    causeWithoutParams: ["\u547D\u540D\u96A7\u9053\u5DF2\u8FDE\u4E0A Cloudflare\uFF0C\u4F46\u516C\u7F51\u4E3B\u673A\u540D\u6CA1\u6709\u6307\u5411\u672C\u673A Bridge\u3002\u8BF7\u5728 Cloudflare \u4E2D\u68C0\u67E5\u5B83\u7684 Service URL\u3002", "The Named Tunnel is connected, but its public hostname does not reach this Bridge. Check its Service URL in Cloudflare."],
    actions: ["open-cloudflare-dashboard", "copy-service-url", "retry"]
  },
  "public-health-unreachable": {
    severity: "error",
    title: ["\u672C\u673A\u8BBF\u95EE\u4E0D\u5230\u516C\u7F51\u5730\u5740", "This PC cannot reach the public address"],
    cause: [`\u5065\u5EB7\u68C0\u67E5\u8BF7\u6C42\u6CA1\u80FD\u5230\u8FBE\u516C\u7F51\u5730\u5740\u3002${HEALTH_PROXY_ZH}`, `The health check could not reach the public address. ${HEALTH_PROXY_EN}`],
    actions: ["open-proxy-settings", "retry"]
  },
  "public-health-timeout": {
    severity: "error",
    title: ["\u68C0\u67E5\u516C\u7F51\u5730\u5740\u8D85\u65F6", "The public address check timed out"],
    cause: [`\u516C\u7F51\u5730\u5740\u5728\u9650\u5B9A\u65F6\u95F4\u5185\u6CA1\u6709\u54CD\u5E94\u3002${HEALTH_PROXY_ZH}`, `The public address did not answer in time. ${HEALTH_PROXY_EN}`],
    actions: ["open-proxy-settings", "retry"]
  },
  "network-failed": {
    severity: "error",
    title: ["\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25", "Network connection failed"],
    cause: ["\u8FDE\u63A5\u96A7\u9053\u6216\u68C0\u67E5\u516C\u7F51\u5730\u5740\u65F6\u5931\u8D25\u3002\u8BF7\u6309\u65E5\u5FD7\u533A\u5206 DNS\u3001TLS\u3001\u4EE3\u7406\u4E0E\u96A7\u9053\u6CE8\u518C\u9636\u6BB5\uFF1BTUN/fake-ip \u4E5F\u53EF\u80FD\u662F\u539F\u56E0\uFF0C\u4E0D\u5E94\u89C6\u4E3A\u5FC5\u9700\u6761\u4EF6\u3002\u4EE3\u7406\u89C4\u5219\u6216\u4F20\u8F93\u65B9\u5F0F\u9700\u4F60\u624B\u52A8\u786E\u8BA4\uFF0COpenCode \u4E0D\u4F1A\u81EA\u52A8\u66F4\u6539\u7CFB\u7EDF\u7F51\u7EDC\u3002", "Connecting the tunnel or checking its public address failed. Distinguish DNS, TLS, proxy routing and tunnel registration in the logs; TUN/fake-ip may itself be the cause, not a requirement. Choose proxy rules or another transport manually. OpenCode does not change system network settings."],
    actions: ["retry", "open-proxy-settings", "show-log"]
  },
  "tunnel-retrying": {
    severity: "warning",
    title: ["\u96A7\u9053\u6682\u672A\u8FDE\u901A\uFF0C\u6B63\u5728\u81EA\u52A8\u91CD\u8BD5", "Tunnel not connected yet, retrying"],
    cause: ["\u7B2C {attempt}/{total} \u6B21\u5C1D\u8BD5\u5C06\u5728 {seconds} \u79D2\u540E\u5F00\u59CB\uFF0C\u901A\u5E38\u65E0\u9700\u64CD\u4F5C\u3002\u82E5\u4E00\u76F4\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u65E5\u5FD7\u3002", "Attempt {attempt}/{total} starts in {seconds} seconds. Usually no action is needed; if it keeps failing, check the log."],
    causeWithoutParams: ["\u6B63\u5728\u81EA\u52A8\u91CD\u8BD5\uFF0C\u901A\u5E38\u65E0\u9700\u64CD\u4F5C\u3002\u82E5\u4E00\u76F4\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u65E5\u5FD7\u3002", "Retrying automatically. Usually no action is needed; if it keeps failing, check the log."],
    actions: ["show-log"],
    standalone: true
  },
  "reconnecting": {
    severity: "warning",
    title: ["\u96A7\u9053\u65AD\u5F00\uFF0C\u6B63\u5728\u81EA\u52A8\u91CD\u8FDE", "Tunnel dropped, reconnecting"],
    cause: ["\u6B63\u5728\u8FDB\u884C\u7B2C {attempt} \u6B21\u91CD\u8FDE\uFF0C\u672C\u5730\u670D\u52A1\u4FDD\u6301\u8FD0\u884C\uFF0C\u901A\u5E38\u65E0\u9700\u64CD\u4F5C\u3002", "Reconnect attempt {attempt} is in progress. The local service keeps running; usually no action is needed."],
    causeWithoutParams: ["\u6B63\u5728\u81EA\u52A8\u91CD\u8FDE\uFF0C\u672C\u5730\u670D\u52A1\u4FDD\u6301\u8FD0\u884C\uFF0C\u901A\u5E38\u65E0\u9700\u64CD\u4F5C\u3002", "Reconnecting automatically. The local service keeps running; usually no action is needed."],
    actions: ["show-log"],
    standalone: true
  },
  "license-renew-failed": {
    severity: "error",
    title: ["\u6388\u6743\u65E0\u6CD5\u9A8C\u8BC1\uFF0CBridge \u672A\u8FD0\u884C", "License could not be verified; Bridge is not running"],
    cause: ["\u542F\u52A8\u548C\u8FD0\u884C\u4E2D\u7684 Bridge \u90FD\u5FC5\u987B\u6210\u529F\u8054\u7F51\u9A8C\u8BC1\u6388\u6743\uFF1B\u65AD\u7F51\u3001\u4EE3\u7406\u4E0D\u901A\u6216\u6388\u6743\u670D\u52A1\u5668\u65E0\u54CD\u5E94\u65F6\uFF0C\u5373\u4F7F\u672C\u673A\u6709\u7F13\u5B58\u6388\u6743\u4E5F\u4F1A\u88AB\u62D2\u7EDD\u3002\u8BF7\u68C0\u67E5\u7F51\u7EDC/\u4EE3\u7406\uFF0C\u70B9\u51FB\u201C\u5237\u65B0\u6388\u6743\u201D\u6210\u529F\u540E\u518D\u542F\u52A8\uFF1B\u82E5\u521A\u4ED8\u6B3E\uFF0C\u8BF7\u52FF\u91CD\u590D\u8D2D\u4E70\u3002", "Bridge must verify its license online when it starts and while it runs. If the network or proxy is down or the license server does not answer, Bridge is refused even with a cached license. Check the network/proxy, refresh access until it succeeds, then start again. If you just paid, do not pay again."],
    actions: ["open-access", "retry"],
    standalone: true
  },
  "access-lost": {
    severity: "error",
    title: ["\u6388\u6743\u5DF2\u5931\u6548\uFF0CBridge \u5DF2\u505C\u6B62", "Access ended; Bridge stopped"],
    cause: ["\u5237\u65B0\u6388\u6743\u6216\u67E5\u8BE2\u8BA2\u5355\u65F6\u53D1\u73B0\u5F53\u524D\u8D26\u53F7\u6CA1\u6709\u6709\u6548\u6388\u6743\u3002", "Refreshing access or checking an order found no active access for this account."],
    actions: ["open-access"],
    standalone: true
  },
  "unknown": {
    severity: "error",
    title: ["\u539F\u56E0\u672A\u80FD\u8BC6\u522B", "Unrecognized error"],
    cause: ["\u53EF\u4EE5\u5C55\u5F00\u4E0B\u65B9\u6280\u672F\u8BE6\u60C5\u67E5\u770B\u539F\u6587\uFF0C\u6216\u590D\u5236\u8BCA\u65AD\u4FE1\u606F\u540E\u53CD\u9988\u7ED9\u6211\u4EEC\u3002", "Open the technical details below to see the original error, or copy the diagnostics and send them to us."],
    actions: ["retry", "show-log"]
  }
});

var BRIDGE_STARTUP_FAILURE_ACTION_LABELS = Object.freeze({
  "retry": ["\u91CD\u8BD5\u542F\u52A8", "Retry"],
  "install-cloudflared": ["\u4E00\u952E\u5B89\u88C5 cloudflared", "Install cloudflared"],
  "check-tunnel": ["\u68C0\u67E5\u96A7\u9053", "Check tunnel"],
  "ngrok-setup": ["\u67E5\u770B ngrok \u914D\u7F6E\u6B65\u9AA4", "Show ngrok setup steps"],
  "use-quick-tunnel": ["\u6539\u7528 Cloudflare Quick Tunnel", "Use Cloudflare Quick Tunnel"],
  "open-connection": ["\u6253\u5F00\u8FDE\u63A5\u8BBE\u7F6E", "Open connection settings"],
  "open-access": ["\u6253\u5F00\u8D26\u53F7\u4E0E\u6388\u6743", "Open Account & access"],
  "open-folder": ["\u6253\u5F00\u6587\u4EF6\u5939", "Open Folder"],
  "cleanup-processes": ["\u6E05\u7406\u8FDB\u7A0B", "Clean up processes"],
  "reload-window": ["\u91CD\u65B0\u52A0\u8F7D\u7A97\u53E3", "Reload window"],
  "show-log": ["\u67E5\u770B\u65E5\u5FD7", "Show log"],
  "open-proxy-settings": ["\u6253\u5F00\u4EE3\u7406\u8BBE\u7F6E", "Open proxy settings"],
  "open-ngrok-dashboard": ["\u6253\u5F00 ngrok \u63A7\u5236\u53F0", "Open ngrok dashboard"],
  "open-cloudflare-dashboard": ["\u6253\u5F00 Cloudflare \u63A7\u5236\u53F0", "Open Cloudflare dashboard"],
  "open-cloudflared-download": ["\u6253\u5F00 cloudflared \u4E0B\u8F7D\u9875", "Open cloudflared downloads"],
  "copy-service-url": ["\u590D\u5236 Service URL", "Copy Service URL"],
  "copy-diagnostics": ["\u590D\u5236\u8BCA\u65AD\u4FE1\u606F", "Copy diagnostics"]
});

var BRIDGE_STARTUP_FAILURE_CHROME = Object.freeze({
  failedHeading: ["Bridge \u542F\u52A8\u5931\u8D25\uFF1A{0}", "Bridge failed to start: {0}"],
  sentence: ["{0}\u3002{1}", "{0}. {1}"],
  details: ["\u67E5\u770B\u6280\u672F\u8BE6\u60C5\uFF08\u8BF7\u52FF\u5206\u4EAB\u51ED\u636E\uFF09", "Technical details (do not share credentials)"],
  noDetail: ["\u6682\u672A\u6536\u5230\u8BE6\u7EC6\u9519\u8BEF\u3002", "No detailed error was received."],
  hidden: ["\u5DF2\u9690\u85CF", "hidden"],
  openBridgePage: ["\u6253\u5F00 Bridge \u9875\u9762", "Open Bridge page"]
});

var KNOWN_CODES = new Set(BRIDGE_STARTUP_FAILURE_CODES);

function isBridgeStartupFailureCode(value2) {
  return typeof value2 === "string" && KNOWN_CODES.has(value2);
}

function bridgeStartupFailureCopy(pair, ...args2) {
  const text2 = isSimplifiedChinese() ? pair[0] : pair[1];
  return text2.replace(/\{(\d+)\}/g, (match2, index2) => args2[Number(index2)] ?? match2);
}
export { isBridgeStartupFailureCode, bridgeStartupFailureCopy, BRIDGE_STARTUP_FAILURE_CODES, PROXY_TUN_ZH, PROXY_TUN_EN, HEALTH_PROXY_ZH, HEALTH_PROXY_EN, BRIDGE_STARTUP_FAILURE_CATALOG, BRIDGE_STARTUP_FAILURE_ACTION_LABELS, BRIDGE_STARTUP_FAILURE_CHROME, KNOWN_CODES };
