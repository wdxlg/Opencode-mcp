// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/config.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/config.ts
init_define_OPENCODE_BUILD_INFO();

var vscode10 = __toESM(require("vscode"));

var API_KEY_SECRET = "opencode.apiKey";

async function getOpenCodeModelConfig(context) {
  const config2 = vscode10.workspace.getConfiguration("opencode");
  return {
    baseUrl: config2.get("model.baseUrl", "https://api.openai.com/v1").trim(),
    model: config2.get("model.name", "gpt-5.4").trim(),
    apiKey: await context.secrets.get(API_KEY_SECRET)
  };
}

async function configureOpenCodeModel(context) {
  const current = await getOpenCodeModelConfig(context);
  const baseUrl = await vscode10.window.showInputBox({
    title: "OpenCode Model \xB7 Base URL",
    prompt: "OpenAI Chat Completions-compatible base URL.",
    value: current.baseUrl,
    ignoreFocusOut: true
  });
  if (baseUrl === void 0) return false;
  const model = await vscode10.window.showInputBox({
    title: "OpenCode Model \xB7 Model",
    prompt: "Model identifier sent to the configured endpoint.",
    value: current.model,
    ignoreFocusOut: true
  });
  if (model === void 0) return false;
  const apiKey = await vscode10.window.showInputBox({
    title: "OpenCode Model \xB7 API Key",
    prompt: "Stored in SecretStorage. Leave blank to keep the existing key; enter CLEAR to delete it.",
    password: true,
    ignoreFocusOut: true
  });
  if (apiKey === void 0) return false;
  const config2 = vscode10.workspace.getConfiguration("opencode");
  await Promise.all([
    config2.update("model.baseUrl", baseUrl.trim(), vscode10.ConfigurationTarget.Global),
    config2.update("model.name", model.trim(), vscode10.ConfigurationTarget.Global)
  ]);
  if (apiKey.trim().toUpperCase() === "CLEAR") {
    await context.secrets.delete(API_KEY_SECRET);
  } else if (apiKey.trim()) {
    await context.secrets.store(API_KEY_SECRET, apiKey.trim());
  }
  return true;
}

async function setOpenCodeApiKey(context) {
  const value = await vscode10.window.showInputBox({
    title: "OpenCode API Key",
    password: true,
    ignoreFocusOut: true,
    prompt: "Stored securely in VS Code SecretStorage. Submit an empty value to clear it."
  });
  if (value === void 0) return;
  if (value.trim()) await context.secrets.store(API_KEY_SECRET, value.trim());
  else await context.secrets.delete(API_KEY_SECRET);
  await vscode10.window.showInformationMessage(value.trim() ? "OpenCode API key saved." : "OpenCode API key cleared.");
}
export { getOpenCodeModelConfig, configureOpenCodeModel, setOpenCodeApiKey, vscode10, API_KEY_SECRET };
