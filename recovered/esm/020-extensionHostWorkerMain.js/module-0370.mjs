// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/languageModelToolsConfirmationService.ts
import { createDecorator } from "./module-0038.mjs";


// src/vs/workbench/contrib/chat/common/tools/languageModelToolsConfirmationService.ts
async function computeCombinationKey(toolId, parameters) {
  const input = toolId + ":" + JSON.stringify(parameters);
  const encoded = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashHex = Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return toolId + ":combination:" + hashHex;
}

var ILanguageModelToolsConfirmationService = createDecorator("ILanguageModelToolsConfirmationService");
export { computeCombinationKey, ILanguageModelToolsConfirmationService };
