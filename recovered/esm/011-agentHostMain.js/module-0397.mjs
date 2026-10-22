// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexProviderConfiguration.ts
import { CODEX_AGENT_PROVIDER_ID } from "./module-0048.mjs";
import { localize } from "./module-0012.mjs";
import { URI } from "./module-0023.mjs";
import { join } from "./module-0018.mjs";


// src/vs/platform/agentHost/node/codex/codexProviderConfiguration.ts
function createCodexProviderConfiguration(userHome) {
  return {
    provider: CODEX_AGENT_PROVIDER_ID,
    title: localize(2474, null),
    description: localize(2461, null),
    properties: {
      "codex.personality": { type: "string", title: localize(2466, null), description: localize(2468, null), default: "default", enum: ["default", "friendly", "pragmatic"], enumLabels: [localize(2467, null), localize(2469, null), localize(2470, null)] },
      "codex.autoReviewPolicy": { type: "string", title: localize(2459, null), description: localize(2460, null), default: "" }
    },
    settings: [
      { key: "codex.personality", group: localize(2471, null) },
      { key: "codex.autoReviewPolicy", group: localize(2472, null), kind: "multiline", saveLabel: localize(2473, null) }
    ],
    configurationFile: {
      resource: URI.file(join(userHome.fsPath, ".codex", "config.toml")).toString(),
      title: localize(2465, null),
      description: localize(2462, null),
      openLabel: localize(2464, null),
      documentationUrl: "https://learn.chatgpt.com/docs/config-file/config-basic",
      documentationLabel: localize(2463, null)
    }
  };
}
export { createCodexProviderConfiguration };
