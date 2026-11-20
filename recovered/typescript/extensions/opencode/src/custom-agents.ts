import * as vscode from "vscode";

export function registerOpenCodeCustomAgents(context: vscode.ExtensionContext): vscode.Disposable {
  const askUri = vscode.Uri.joinPath(context.extensionUri, "agents", "opencode-ask.agent.md");
  const planUri = vscode.Uri.joinPath(context.extensionUri, "agents", "opencode-plan.agent.md");
  const codeUri = vscode.Uri.joinPath(context.extensionUri, "agents", "opencode-code.agent.md");

  return vscode.chat.registerCustomAgentProvider({
    provideCustomAgents: () => [
      { uri: askUri },
      { uri: planUri },
      { uri: codeUri },
    ],
  });
}
