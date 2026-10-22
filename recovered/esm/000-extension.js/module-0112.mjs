// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-status.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/external-mcp-status.ts
init_define_OPENCODE_BUILD_INFO();

var MISSING_SECRET = "\u5BC6\u94A5\u7F3A\u5931\u6216\u4E0D\u5B8C\u6574\uFF1B\u8BF7\u70B9\u300C\u5BC6\u94A5\u2026\u300D\u8865\u5145\u3002";

var BROKEN = "\u914D\u7F6E\u6216\u51ED\u636E\u7F3A\u5931\uFF0C\u8BF7\u91CD\u65B0\u5BFC\u5165\u3002";

function bridgeStatusOf(server, context) {
  if (!server.enabled || !server.bridgeEnabled) return { status: "disabled", toolCount: 0 };
  if (context.refs === "missing-secret") return { status: "needs-auth", toolCount: 0, reason: MISSING_SECRET };
  if (context.refs === "broken") return { status: "failed", toolCount: 0, reason: BROKEN };
  const health = context.health;
  if (!context.bridgeRunning || !health || health.state === "off") return { status: "stopped", toolCount: 0 };
  if (health.state === "connecting") return { status: health.reconnecting ? "reconnecting" : "connecting", toolCount: 0 };
  if (health.state === "ready") return { status: "running", toolCount: health.toolCount };
  return { status: health.status ?? "failed", toolCount: 0, reason: health.error };
}

function editorStateOf(server, context) {
  if (!context.trusted) return "restricted";
  if (!server.enabled || !server.editorEnabled) return "disabled";
  if (context.refs === "missing-secret" || context.health?.status === "needs-auth") return "needs-auth";
  if (context.refs === "broken") return "failed";
  return "published";
}

function legacyEditorStatus(state) {
  switch (state) {
    case "restricted":
      return "\u53D7\u9650";
    case "disabled":
      return "\u672A\u542F\u7528";
    case "needs-auth":
      return MISSING_SECRET;
    case "failed":
      return "\u914D\u7F6E\u6216\u51ED\u636E\u7F3A\u5931\uFF0C\u8BF7\u91CD\u65B0\u5BFC\u5165";
    case "published":
      return "\u5DF2\u53D1\u5E03\u7ED9\u7F16\u8F91\u5668\uFF08\u6309\u9700\u8FDE\u63A5\uFF09";
  }
}
export { bridgeStatusOf, editorStateOf, legacyEditorStatus, MISSING_SECRET, BROKEN };
