// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-network-commands.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { diagnoseExternalMcp, formatDiagnosis } from "./module-0108.mjs";


// extensions/opencode/src/external-mcp-network-commands.ts
init_define_OPENCODE_BUILD_INFO();

var vscode5 = __toESM(require("vscode"));

function registerExternalMcpNetworkCommands(catalog, network, output2) {
  return [vscode5.commands.registerCommand("opencode.mcp.diagnose", async (id) => {
    const server = typeof id === "string" ? catalog.snapshot().servers.find((item) => item.id === id) : void 0;
    if (!server) throw new Error("MCP \u670D\u52A1\u5DF2\u53D8\u5316\uFF0C\u8BF7\u5237\u65B0\u3002");
    if (server.transport !== "http") {
      void vscode5.window.showInformationMessage(`\u300C${server.label}\u300D\u662F\u672C\u673A stdio \u670D\u52A1\uFF0C\u4E0D\u7ECF\u7F51\u7EDC\u8FDE\u63A5\uFF1B\u8BF7\u68C0\u67E5\u542F\u52A8\u547D\u4EE4\uFF0C\u6216\u5728\u300C\u5BC6\u94A5\u2026\u300D\u2192\u300C\u7F51\u7EDC\u4EE3\u7406\u2026\u300D\u4E2D\u8C03\u6574\u5B83\u8BBF\u95EE\u7F51\u7EDC\u65F6\u4F7F\u7528\u7684\u4EE3\u7406\u3002`);
      return { cancelled: true };
    }
    const runtime = await catalog.resolve(server);
    const target = new URL(runtime.url);
    const origin = `${target.protocol}//${target.host}`;
    const consent = await vscode5.window.showWarningMessage(`\u5BF9 ${origin} \u505A\u7F51\u7EDC\u8BCA\u65AD\uFF1F`, { modal: true, detail: "\u4F9D\u6B21\u68C0\u67E5\u8DEF\u7531\u3001DNS\u3001\u8FDE\u63A5\uFF08\u6216\u4EE3\u7406\u96A7\u9053\uFF09\u3001TLS \u548C HTTP \u53EF\u8FBE\u6027\u3002\u53EA\u8BBF\u95EE \u534F\u8BAE//\u4E3B\u673A\uFF0C\u4E0D\u53D1\u9001\u4EFB\u4F55\u5BC6\u94A5\u3001\u8DEF\u5F84\u6216\u67E5\u8BE2\u53C2\u6570\u3002" }, "\u5F00\u59CB\u8BCA\u65AD");
    if (consent !== "\u5F00\u59CB\u8BCA\u65AD") return { cancelled: true };
    const report = await diagnoseExternalMcp(origin, network.routeFor(target));
    output2.appendLine(`[external-mcp] ${server.id}: diagnosis ${report.steps.map((step) => `${step.stage}=${step.ok ? "ok" : "fail"}`).join(" ")}`);
    await vscode5.window.showInformationMessage(report.ok ? `\u7F51\u7EDC\u8BCA\u65AD\u5B8C\u6210\uFF1A${origin} \u53EF\u8FBE` : `\u7F51\u7EDC\u8BCA\u65AD\u53D1\u73B0\u95EE\u9898\uFF1A${origin}`, { modal: true, detail: formatDiagnosis(report) });
    return { report };
  })];
}
export { registerExternalMcpNetworkCommands, vscode5 };
