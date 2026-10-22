// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/bridge-notices.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/bridge-notices.ts
init_define_OPENCODE_BUILD_INFO();

var vscode7 = __toESM(require("vscode"));

var OPEN_BRIDGE_PAGE_COMMAND = "aiCustomization.openManagementEditor";

var BRIDGE_PAGE_SECTION = "bridge";

var TEXT = {
  licenseRenewFailed: [
    "Bridge \u5DF2\u505C\u6B62\uFF1A\u6388\u6743\u7EED\u671F\u5931\u8D25\u3002\u8BF7\u6253\u5F00 Bridge \u9875\u9762\u5237\u65B0\u6388\u6743\u540E\u518D\u542F\u52A8\uFF1B\u82E5\u521A\u4ED8\u6B3E\uFF0C\u8BF7\u52FF\u91CD\u590D\u8D2D\u4E70\u3002",
    "Bridge stopped: its license could not be renewed. Open the Bridge page, refresh access, then start again. If you just paid, do not pay again."
  ],
  accessLost: [
    "Bridge \u5DF2\u505C\u6B62\uFF1A\u5F53\u524D\u8D26\u6237\u6CA1\u6709\u6709\u6548\u6388\u6743\u3002\u8BF7\u6253\u5F00 Bridge \u9875\u9762\u67E5\u770B\u8D26\u6237\u4E0E\u6388\u6743\u3002",
    "Bridge stopped: this account has no active access. Open the Bridge page to check Account & Access."
  ],
  openBridgePage: ["\u6253\u5F00 Bridge \u9875\u9762", "Open Bridge Page"],
  showLog: ["\u67E5\u770B\u65E5\u5FD7", "Show Log"],
  installingCloudflared: ["\u6B63\u5728\u7528 Winget \u4E3A OpenCode Bridge \u5B89\u88C5 cloudflared\u2026", "Installing cloudflared for OpenCode Bridge\u2026"],
  cloudflaredReady: ["cloudflared \u5DF2\u5C31\u7EEA\uFF1A{0}", "cloudflared is ready: {0}"],
  installed: ["\u5DF2\u5B89\u88C5", "installed"],
  providerFallback: [
    "\u53E6\u4E00\u4E2A OpenCode \u7A97\u53E3\u6B63\u5728\u4F7F\u7528\u300C{0}\u300D\u96A7\u9053\uFF0C\u672C\u7A97\u53E3\u8FD9\u6B21\u6539\u7528 Cloudflare \u5FEB\u901F\u96A7\u9053\uFF08\u4E34\u65F6\u5730\u5740\uFF09\u3002\u8BBE\u7F6E\u91CC\u7684\u96A7\u9053\u65B9\u5F0F\u6CA1\u6709\u6539\u53D8\uFF0C\u90A3\u4E2A\u7A97\u53E3\u505C\u6B62\u540E\u518D\u542F\u52A8\u5373\u53EF\u6062\u590D\u3002",
    'Another OpenCode window is using the "{0}" tunnel, so this window uses a Cloudflare Quick Tunnel (temporary address) this time. The tunnel setting is unchanged; start again after that window stops to use it.'
  ]
};

function isBridgeNoticeChinese(language = vscode7.env.language) {
  const normalized = language.toLowerCase();
  return normalized === "zh-cn" || normalized === "zh-hans" || normalized.startsWith("zh-hans-");
}

function bridgeNoticeText(key, ...args) {
  const [zh, en] = TEXT[key];
  return (isBridgeNoticeChinese() ? zh : en).replace(/\{(\d+)\}/g, (_match, index) => args[Number(index)] ?? "");
}

function showBridgeAccessStopNotice(reason, output2) {
  const openPage = bridgeNoticeText("openBridgePage");
  const showLog = bridgeNoticeText("showLog");
  const message2 = bridgeNoticeText(reason === "license-renew-failed" ? "licenseRenewFailed" : "accessLost");
  void vscode7.window.showWarningMessage(message2, openPage, showLog).then((choice) => {
    if (choice === openPage) void vscode7.commands.executeCommand(OPEN_BRIDGE_PAGE_COMMAND, BRIDGE_PAGE_SECTION);
    else if (choice === showLog) output2.show(true);
  });
}

function showBridgeProviderFallbackNotice(provider, output2) {
  const openPage = bridgeNoticeText("openBridgePage");
  const showLog = bridgeNoticeText("showLog");
  void vscode7.window.showInformationMessage(bridgeNoticeText("providerFallback", provider), openPage, showLog).then((choice) => {
    if (choice === openPage) void vscode7.commands.executeCommand(OPEN_BRIDGE_PAGE_COMMAND, BRIDGE_PAGE_SECTION);
    else if (choice === showLog) output2.show(true);
  });
}
export { isBridgeNoticeChinese, bridgeNoticeText, showBridgeAccessStopNotice, showBridgeProviderFallbackNotice, vscode7, OPEN_BRIDGE_PAGE_COMMAND, BRIDGE_PAGE_SECTION, TEXT };
