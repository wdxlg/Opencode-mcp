// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeMcpStatus.ts



// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeMcpStatus.ts
var MCP_ACTION_LABELS = { enable: "\u542F\u7528", secrets: "\u8BBE\u7F6E\u5BC6\u94A5", diagnose: "\u7F51\u7EDC\u8BCA\u65AD", retry: "\u91CD\u8BD5" };

function failure(status2, reason) {
  if (status2 === "needs-auth") return { status: status2, text: `\u9700\u8981\u8BBE\u7F6E\u5BC6\u94A5${reason ? `\uFF1A${reason}` : ""}`, action: "secrets" };
  if (status2 === "proxy-error") return { status: status2, text: `\u4EE3\u7406\u9519\u8BEF${reason ? `\uFF1A${reason}` : ""}`, action: "diagnose" };
  return { status: status2, text: `\u5931\u8D25${reason ? `\uFF1A${reason}` : ""}`, action: "retry" };
}

function bridgeCell(view) {
  if (!view) return { status: "stopped", text: "\u72B6\u6001\u672A\u77E5\uFF0C\u8BF7\u5237\u65B0" };
  switch (view.status) {
    case "disabled":
      return { status: "disabled", text: "\u5DF2\u505C\u7528", action: "enable" };
    case "stopped":
      return { status: "stopped", text: "\u5F85 Bridge \u542F\u52A8" };
    case "connecting":
      return { status: "connecting", text: "\u8FDE\u63A5\u4E2D" };
    case "reconnecting":
      return { status: "reconnecting", text: "\u8FDE\u63A5\u5DF2\u65AD\u5F00\uFF0C\u6B63\u5728\u91CD\u8FDE" };
    case "running":
      return { status: "running", text: `\u5DF2\u8FDE\u63A5 \xB7 ${view.toolCount} \u4E2A\u5DE5\u5177` };
    default:
      return failure(view.status, view.reason);
  }
}

function editorCell(state, native, bridge) {
  switch (state) {
    case "restricted":
      return { status: "restricted", text: "\u53D7\u9650\uFF08\u5DE5\u4F5C\u533A\u672A\u53D7\u4FE1\u4EFB\uFF09" };
    case "disabled":
      return { status: "disabled", text: "\u5DF2\u505C\u7528", action: "enable" };
    case "needs-auth":
      return failure("needs-auth", bridge?.status === "needs-auth" ? bridge.reason : void 0);
    case "failed":
      return failure("failed", "\u914D\u7F6E\u6216\u51ED\u636E\u7F3A\u5931\uFF0C\u8BF7\u91CD\u65B0\u5BFC\u5165");
    default:
      break;
  }
  switch (native) {
    case "running":
      return { status: "running", text: "\u5DF2\u8FDE\u63A5" };
    case "starting":
      return { status: "connecting", text: "\u8FDE\u63A5\u4E2D" };
    case "undiscovered":
      return { status: "stopped", text: "\u5DF2\u53D1\u5E03\uFF0C\u7B49\u5F85\u539F\u751F\u670D\u52A1\u53D1\u73B0" };
    case "stopped":
      return { status: "stopped", text: "\u5F85\u6309\u9700\u8FDE\u63A5" };
    case "error":
      if (bridge?.status === "needs-auth" || bridge?.status === "proxy-error") return failure(bridge.status, bridge.reason);
      return failure("failed", "\u8FDE\u63A5\u5931\u8D25\uFF08\u53EF\u5728\u4E0B\u65B9\u539F\u751F\u8BE6\u60C5\u67E5\u770B\uFF09");
  }
}
export { failure, bridgeCell, editorCell, MCP_ACTION_LABELS };
