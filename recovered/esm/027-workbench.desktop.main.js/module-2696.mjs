// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeMcpSecretsMenu.ts
import { mcpSecretProblem } from "./module-2694.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeMcpSecretsMenu.ts
var PROXY_LABELS = { inherit: "\u8DDF\u968F OpenCode\uFF08\u9ED8\u8BA4\uFF09", none: "\u4E0D\u4F7F\u7528\u4EE3\u7406", custom: "\u81EA\u5B9A\u4E49\u4EE3\u7406\u2026" };

async function manageMcpSecrets(server, commands, quickInput, dialogs) {
  const refs = await commands.executeCommand("opencode.mcp.getSecretRefs", server.id);
  if (!refs) return false;
  const ask = (prompt, password, validate) => quickInput.input({
    prompt,
    password,
    ignoreFocusLost: true,
    validateInput: async (value2) => validate?.(value2)
  });
  const set = async (kind, presetName, bearer = false) => {
    const name = bearer ? "Authorization" : presetName ?? await ask(
      kind === "header" ? "Header \u540D\u79F0\uFF0C\u4F8B\u5982 X-API-Key" : "\u73AF\u5883\u53D8\u91CF\u540D\uFF0C\u4F8B\u5982 API_KEY",
      false,
      (value3) => mcpSecretProblem(kind, value3.trim(), "x")
    );
    if (!name?.trim()) return false;
    const value2 = await ask(
      bearer ? "Bearer \u4EE4\u724C\uFF08\u53EA\u4FDD\u5B58\u5728\u672C\u673A\u5B89\u5168\u5B58\u50A8\uFF0C\u4E0D\u4F1A\u663E\u793A\uFF09" : `\u300C${name.trim()}\u300D\u7684\u503C\uFF08\u53EA\u4FDD\u5B58\u5728\u672C\u673A\u5B89\u5168\u5B58\u50A8\uFF0C\u4E0D\u4F1A\u663E\u793A\uFF09`,
      true,
      (input) => input ? mcpSecretProblem(bearer ? "bearer" : kind, name.trim(), input) : "\u8BF7\u586B\u5199\u5BC6\u94A5\u503C\u3002"
    );
    if (!value2) return false;
    await commands.executeCommand("opencode.mcp.setSecret", server.id, kind, name.trim(), bearer ? `Bearer ${value2}` : value2);
    return true;
  };
  const clear = async (kind, names) => {
    const choice2 = await quickInput.pick(names.map((name) => ({ label: name })), { placeHolder: "\u9009\u62E9\u8981\u6E05\u9664\u7684\u5BC6\u94A5" });
    if (!choice2) return false;
    await commands.executeCommand("opencode.mcp.clearSecret", server.id, kind, choice2.label);
    return true;
  };
  const steps = [];
  if (refs.transport === "http") {
    steps.push({ label: "\u8BBE\u7F6E Bearer \u4EE4\u724C\u2026", description: "\u5199\u5165 Authorization Header", run: () => set("header", void 0, true) });
    steps.push({ label: "\u8BBE\u7F6E\u6216\u66F4\u6362 Header\u2026", run: () => set("header") });
    for (const name of refs.headers) steps.push({ label: `\u66F4\u6362 ${name}\u2026`, description: "\u5DF2\u8BBE\u7F6E\uFF08\u4E0D\u663E\u793A\u503C\uFF09", run: () => set("header", name) });
    if (refs.headers.length) steps.push({ label: "\u6E05\u9664\u67D0\u4E2A Header\u2026", run: () => clear("header", refs.headers) });
    if (refs.urlHasCredential) steps.push({ label: "\u66FF\u6362\u5730\u5740\u2026", description: "\u5730\u5740\u542B\u51ED\u636E\uFF1B\u53EA\u80FD\u6362\u6210\u540C\u4E00\u4E3B\u673A\u4E0B\u7684\u65B0\u5730\u5740", run: async () => {
      const url = await ask("\u65B0\u7684\u5B8C\u6574\u5730\u5740\uFF08\u540C\u4E00\u534F\u8BAE\u548C\u4E3B\u673A\uFF09", true, (value2) => /^https?:\/\//i.test(value2.trim()) ? void 0 : "\u8BF7\u8F93\u5165 http(s):// \u5F00\u5934\u7684\u5730\u5740\u3002");
      if (!url) return false;
      await commands.executeCommand("opencode.mcp.replaceUrl", server.id, url.trim());
      return true;
    } });
  } else {
    steps.push({ label: "\u8BBE\u7F6E\u6216\u66F4\u6362\u73AF\u5883\u53D8\u91CF\u2026", run: () => set("env") });
    for (const name of refs.env) steps.push({ label: `\u66F4\u6362 ${name}\u2026`, description: "\u5DF2\u8BBE\u7F6E\uFF08\u4E0D\u663E\u793A\u503C\uFF09", run: () => set("env", name) });
    if (refs.env.length) steps.push({ label: "\u6E05\u9664\u67D0\u4E2A\u73AF\u5883\u53D8\u91CF\u2026", run: () => clear("env", refs.env) });
    steps.push({ label: "\u66FF\u6362\u53C2\u6570\u2026", description: `\u5F53\u524D ${refs.argsCount} \u4E2A\u53C2\u6570\uFF08\u654F\u611F\u503C\u4E0D\u663E\u793A\uFF09\uFF1B\u547D\u4EE4\u4E0D\u53D8`, run: async () => {
      const raw = await ask('\u65B0\u7684\u53C2\u6570\uFF0CJSON \u6570\u7EC4\uFF0C\u4F8B\u5982 ["-y", "@example/mcp"]', true, (value2) => {
        try {
          const args2 = JSON.parse(value2);
          return Array.isArray(args2) && args2.every((arg) => typeof arg === "string") ? void 0 : "\u8BF7\u8F93\u5165\u5B57\u7B26\u4E32\u6570\u7EC4\u3002";
        } catch {
          return "\u8BF7\u8F93\u5165\u6709\u6548\u7684 JSON \u6570\u7EC4\u3002";
        }
      });
      if (!raw) return false;
      await commands.executeCommand("opencode.mcp.replaceArgs", server.id, JSON.parse(raw));
      return true;
    } });
    steps.push({ label: "\u7F51\u7EDC\u4EE3\u7406\u2026", description: `\u5F53\u524D\uFF1A${PROXY_LABELS[refs.proxyMode ?? "inherit"]}`, run: async () => {
      const pick = await quickInput.pick(["inherit", "none", "custom"].map((mode) => ({ label: PROXY_LABELS[mode], mode })), { placeHolder: "stdio \u670D\u52A1\u8BBF\u95EE\u7F51\u7EDC\u65F6\u4F7F\u7528\u7684\u4EE3\u7406\uFF08\u542B\u51ED\u636E\u7684\u4EE3\u7406\u8BF7\u9009\u62E9\u81EA\u5B9A\u4E49\uFF0C\u6574\u4F53\u5B58\u5165\u5B89\u5168\u5B58\u50A8\uFF09" });
      if (!pick) return false;
      const proxy = pick.mode === "custom" ? await ask("\u4EE3\u7406\u5730\u5740\uFF0C\u4F8B\u5982 http://127.0.0.1:7890 \u6216 socks5://127.0.0.1:1080\uFF08\u53EF\u542B\u7528\u6237\u540D\u5BC6\u7801\uFF09", true, (value2) => /^(https?|socks5h?|socks):\/\//i.test(value2.trim()) ? void 0 : "\u8BF7\u8F93\u5165 http://\u3001https:// \u6216 socks5:// \u5F00\u5934\u7684\u5730\u5740\u3002") : void 0;
      if (pick.mode === "custom" && !proxy) return false;
      await commands.executeCommand("opencode.mcp.setProxyMode", server.id, pick.mode, proxy?.trim());
      return true;
    } });
  }
  if (refs.headers.length || refs.env.length) steps.push({ label: "\u6E05\u9664\u5168\u90E8\u5BC6\u94A5", description: "\u4FDD\u7559\u5730\u5740\u4E0E\u53C2\u6570", run: async () => {
    const { confirmed } = await dialogs.confirm({ message: `\u6E05\u9664\u300C${server.label}\u300D\u7684\u5168\u90E8 Header / \u73AF\u5883\u53D8\u91CF\u5BC6\u94A5\uFF1F`, detail: "\u5730\u5740\u548C\u542F\u52A8\u53C2\u6570\u4F1A\u4FDD\u7559\uFF1B\u6E05\u9664\u540E\u9700\u8981\u91CD\u65B0\u8BBE\u7F6E\u5BC6\u94A5\u624D\u80FD\u8FDE\u63A5\u9700\u8981\u8BA4\u8BC1\u7684\u670D\u52A1\u3002", primaryButton: "\u6E05\u9664" });
    if (!confirmed) return false;
    await commands.executeCommand("opencode.mcp.clearAllSecrets", server.id);
    return true;
  } });
  const choice = await quickInput.pick(steps.map((step) => ({ label: step.label, description: step.description, step })), { placeHolder: `\u300C${server.label}\u300D\u7684\u5BC6\u94A5\uFF1A\u53EA\u663E\u793A\u540D\u79F0\uFF0C\u4E0D\u663E\u793A\u503C` });
  return choice ? choice.step.run() : false;
}
export { manageMcpSecrets, PROXY_LABELS };
