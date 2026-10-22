// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/custom-agents.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/custom-agents.ts
init_define_OPENCODE_BUILD_INFO();

var vscode13 = __toESM(require("vscode"));

function registerOpenCodeCustomAgents(context) {
  const askUri = vscode13.Uri.joinPath(context.extensionUri, "agents", "opencode-ask.agent.md");
  const planUri = vscode13.Uri.joinPath(context.extensionUri, "agents", "opencode-plan.agent.md");
  const codeUri = vscode13.Uri.joinPath(context.extensionUri, "agents", "opencode-code.agent.md");
  return vscode13.chat.registerCustomAgentProvider({
    provideCustomAgents: () => [
      { uri: askUri },
      { uri: planUri },
      { uri: codeUri }
    ]
  });
}
export { registerOpenCodeCustomAgents, vscode13 };
