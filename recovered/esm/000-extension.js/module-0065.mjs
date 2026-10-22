// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-secret-commands.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { clearAllSecrets, clearSecret, getSecretRefs, replaceArgs, replaceUrl, setProxyMode, setSecret } from "./module-0066.mjs";


// extensions/opencode/src/external-mcp-secret-commands.ts
init_define_OPENCODE_BUILD_INFO();

var vscode2 = __toESM(require("vscode"));


// extensions/opencode/src/external-mcp-secret-commands.ts
function registerExternalMcpSecretCommands(catalog, onChanged) {
  const changing = (run) => async (...args) => {
    await run(...args);
    onChanged();
    return { updated: true };
  };
  return [
    vscode2.commands.registerCommand("opencode.mcp.getSecretRefs", (id) => getSecretRefs(catalog, id)),
    vscode2.commands.registerCommand("opencode.mcp.setSecret", changing((id, kind, name, value) => setSecret(catalog, id, kind, name, value))),
    vscode2.commands.registerCommand("opencode.mcp.clearSecret", changing((id, kind, name) => clearSecret(catalog, id, kind, name))),
    vscode2.commands.registerCommand("opencode.mcp.clearAllSecrets", changing((id) => clearAllSecrets(catalog, id))),
    vscode2.commands.registerCommand("opencode.mcp.replaceUrl", changing((id, url2) => replaceUrl(catalog, id, url2))),
    vscode2.commands.registerCommand("opencode.mcp.replaceArgs", changing((id, args) => replaceArgs(catalog, id, args))),
    vscode2.commands.registerCommand("opencode.mcp.setProxyMode", changing((id, mode, proxy) => setProxyMode(catalog, id, mode, proxy)))
  ];
}
export { registerExternalMcpSecretCommands, vscode2 };
