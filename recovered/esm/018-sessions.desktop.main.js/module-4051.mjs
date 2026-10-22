// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostClientInfo.ts



// src/vs/platform/agentHost/common/agentHostClientInfo.ts
var EDITOR_WINDOW_CLIENT_NAME = "vscode-editor-window";

var AGENTS_WINDOW_CLIENT_NAME = "vscode-agents-window";

var editorWindowAgentHostClientInfo = Object.freeze({
  name: EDITOR_WINDOW_CLIENT_NAME,
  title: "VS Code"
});

var agentsWindowAgentHostClientInfo = Object.freeze({
  name: AGENTS_WINDOW_CLIENT_NAME,
  title: "VS Code Agents Window"
});

function getAgentHostClientType(clientInfo) {
  switch (clientInfo?.name) {
    case EDITOR_WINDOW_CLIENT_NAME:
      return "editor_window" /* EditorWindow */;
    case AGENTS_WINDOW_CLIENT_NAME:
      return "agents_window" /* AgentsWindow */;
    default:
      return "unknown" /* Unknown */;
  }
}
export { getAgentHostClientType, EDITOR_WINDOW_CLIENT_NAME, AGENTS_WINDOW_CLIENT_NAME, editorWindowAgentHostClientInfo, agentsWindowAgentHostClientInfo };
