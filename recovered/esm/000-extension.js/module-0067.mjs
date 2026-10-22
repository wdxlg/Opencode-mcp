// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-oauth-commands.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { ExternalMcpOAuth } from "./module-0068.mjs";
import { OAuthActionError } from "./module-0069.mjs";
import { EXTERNAL_MCP_OAUTH_PATH, EXTERNAL_MCP_OAUTH_PORT, parseExternalMcpOAuth } from "./module-0061.mjs";
import { validateSecretValue } from "./module-0063.mjs";


// extensions/opencode/src/external-mcp-oauth-commands.ts
init_define_OPENCODE_BUILD_INFO();

var vscode3 = __toESM(require("vscode"));


// extensions/opencode/src/external-mcp-oauth-commands.ts
function createExternalMcpOAuth(catalog, changed) {
  const oauth = new ExternalMcpOAuth(catalog, {
    trusted: () => vscode3.workspace.isTrusted,
    changed,
    openAuthorization: async (url2, resource) => {
      if (!vscode3.workspace.isTrusted) return false;
      const scope = (url2.searchParams.get("scope") ?? "\u7531\u670D\u52A1\u8BF7\u6C42").slice(0, 1e3);
      const confirm = await vscode3.window.showInformationMessage(
        `\u4E3A MCP ${resource.origin} \u6253\u5F00 OAuth \u6388\u6743\u9875\u9762\uFF1F`,
        { modal: true, detail: `\u8BA4\u8BC1\u7AD9\u70B9\uFF1A${url2.origin}
\u8BF7\u6C42\u6743\u9650\uFF1A${scope}
\u6388\u6743\u51ED\u636E\u5C06\u7531\u672C\u673A\u7F16\u8F91\u5668\u4E0E\u5DF2\u542F\u7528\u7684 Bridge \u5171\u7528\u3002\u8BF7\u81EA\u884C\u5B8C\u6210\u6D4F\u89C8\u5668\u767B\u5F55\uFF0C\u4E0D\u8981\u628A\u6388\u6743\u7801\u6216\u4EE4\u724C\u7C98\u8D34\u7ED9\u667A\u80FD\u4F53\u3002` },
        "\u6253\u5F00\u6D4F\u89C8\u5668\u6388\u6743"
      );
      return confirm === "\u6253\u5F00\u6D4F\u89C8\u5668\u6388\u6743" && vscode3.workspace.isTrusted && await vscode3.env.openExternal(vscode3.Uri.parse(url2.toString()));
    }
  });
  const disposables = [oauth];
  const command = (name, fn) => disposables.push(vscode3.commands.registerCommand(name, fn));
  const idOf = (id) => {
    if (typeof id !== "string") throw new Error("MCP \u670D\u52A1 ID \u65E0\u6548\u3002");
    return id;
  };
  command("opencode.mcp.oauth.authorize", async (input) => {
    const id = idOf(input);
    return vscode3.window.withProgress({ location: vscode3.ProgressLocation.Notification, title: "MCP OAuth\uFF1A\u8BF7\u5728\u672C\u673A\u6D4F\u89C8\u5668\u5B8C\u6210\u6388\u6743", cancellable: true }, async (_progress, cancellation) => {
      const controller = new AbortController();
      const subscription = cancellation.onCancellationRequested(() => controller.abort());
      if (cancellation.isCancellationRequested) controller.abort();
      try {
        return await oauth.authorize(id, controller.signal);
      } catch (error2) {
        if (error2 instanceof OAuthActionError && error2.code === "OAUTH_CANCELLED") return { cancelled: true, authorized: false };
        throw error2;
      } finally {
        subscription.dispose();
      }
    });
  });
  command("opencode.mcp.oauth.cancel", (id) => {
    oauth.cancel(idOf(id));
    return { cancelled: true };
  });
  command("opencode.mcp.oauth.logout", async (input) => {
    const id = idOf(input);
    const answer = await vscode3.window.showWarningMessage("\u9000\u51FA\u6B64 MCP \u7684\u672C\u673A OAuth \u6388\u6743\uFF1F", { modal: true, detail: "\u7F16\u8F91\u5668\u4E0E Bridge \u90FD\u5C06\u505C\u6B62\u4F7F\u7528\u672C\u673A\u4FDD\u5B58\u7684\u4EE4\u724C\uFF1B\u4E0D\u4F1A\u81EA\u52A8\u64A4\u9500\u8BA4\u8BC1\u670D\u52A1\u7AEF\u7684\u6388\u6743\u3002\u5982\u9700\u5F7B\u5E95\u64A4\u9500\uFF0C\u8BF7\u540C\u65F6\u524D\u5F80\u8BE5\u670D\u52A1\u7684\u8D26\u53F7\u8BBE\u7F6E\u3002" }, "\u9000\u51FA\u672C\u673A\u6388\u6743");
    if (answer !== "\u9000\u51FA\u672C\u673A\u6388\u6743") return { cancelled: true };
    await oauth.logout(id);
    return { signedOut: true };
  });
  command("opencode.mcp.oauth.configure", async (input) => {
    if (!vscode3.workspace.isTrusted) throw new Error("\u8BF7\u5148\u4FE1\u4EFB\u5DE5\u4F5C\u533A\u3002");
    const id = idOf(input), server = catalog.snapshot().servers.find((item) => item.id === id);
    if (!server || server.transport !== "http") throw new Error("\u8BF7\u9009\u62E9 HTTP/SSE MCP \u670D\u52A1\u3002");
    const clientId = await vscode3.window.showInputBox({ title: "OAuth Client ID\uFF08\u53EF\u9009\uFF09", prompt: "\u7559\u7A7A\u4F7F\u7528\u670D\u52A1\u7AEF\u52A8\u6001\u5BA2\u6237\u7AEF\u6CE8\u518C\uFF1B\u4E0D\u652F\u6301\u81EA\u52A8\u6CE8\u518C\u65F6\u9700\u586B\u5199\u670D\u52A1\u63D0\u4F9B\u7684 Client ID\u3002", value: server.oauth?.clientId ?? "", ignoreFocusOut: true });
    if (clientId === void 0) return { cancelled: true };
    const scope = await vscode3.window.showInputBox({ title: "OAuth Scope\uFF08\u53EF\u9009\uFF09", prompt: "\u4EE5\u7A7A\u683C\u5206\u9694\uFF1B\u7559\u7A7A\u91C7\u7528\u670D\u52A1\u7AEF\u516C\u5E03\u7684\u6743\u9650\u3002", value: server.oauth?.scope ?? "", ignoreFocusOut: true });
    if (scope === void 0) return { cancelled: true };
    const port = await vscode3.window.showInputBox({ title: "OAuth \u672C\u673A\u56DE\u8C03\u7AEF\u53E3", prompt: `\u56DE\u8C03\u5730\u5740\u4E3A http://127.0.0.1:\u7AEF\u53E3${EXTERNAL_MCP_OAUTH_PATH}\uFF1B\u624B\u52A8\u6CE8\u518C\u5BA2\u6237\u7AEF\u65F6\u987B\u767B\u8BB0\u8FD9\u4E2A\u5730\u5740\u3002`, value: String(server.oauth?.redirectPort ?? EXTERNAL_MCP_OAUTH_PORT), ignoreFocusOut: true });
    if (port === void 0) return { cancelled: true };
    let clientSecret;
    if (clientId.trim()) {
      const secret = await vscode3.window.showInputBox({ title: "OAuth Client Secret\uFF08\u53EF\u9009\uFF09", prompt: "\u516C\u5171\u5BA2\u6237\u7AEF\u7559\u7A7A\uFF1B\u540C\u4E00 Client ID \u7559\u7A7A\u4F1A\u4FDD\u7559\u5DF2\u914D\u7F6E\u7684\u5BC6\u94A5\u3002\u5BC6\u94A5\u53EA\u8FDB\u5165\u7CFB\u7EDF\u5B89\u5168\u5B58\u50A8\u3002", password: true, ignoreFocusOut: true });
      if (secret === void 0) return { cancelled: true };
      if (secret) clientSecret = validateSecretValue("header", secret);
    }
    const parsed = parseExternalMcpOAuth({ authType: "oauth", oauth: { clientId, scope, redirectPort: port }, ...clientSecret ? { oauthClientSecret: clientSecret } : {} });
    await oauth.configure(id, parsed.options, clientSecret);
    return { configured: true, needsAuthorization: true };
  });
  command("_opencode.mcp.oauthToken", (handle, resource, staleStamp) => oauth.editorToken(handle, resource, staleStamp));
  return { oauth, disposables };
}
export { createExternalMcpOAuth, vscode3 };
