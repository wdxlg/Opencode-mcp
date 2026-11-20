import { registerSkillCenter } from "./skill-center.js";
import { ExternalMcpCenter } from './external-mcp-center.js';
import * as vscode from "vscode";
import { bridgeNoticeText } from "./bridge-notices.js";
import { BridgeManager } from "./bridge-server.js";
import { configureOpenCodeModel, setOpenCodeApiKey } from "./config.js";
import { codexAuthManager, onCodexAuthChange } from "./codex-auth.js";
import { BranchStateStore } from "./branch-state.js";
import { registerOpenCodeCustomAgents } from "./custom-agents.js";
import { IdeToolBroker } from "./ide-tool-broker.js";
import { OpenCodeLanguageModelProvider } from "./model-provider.js";
import { testOpenAIModelsEndpoint } from "./model-endpoint-url.mjs";
import { registerOpenCodeNativeChat } from "./native-chat.js";
import { RuntimeClient } from "./runtime-client.js";
import { WorkspaceHubController } from "./workspace-hub.js";

let activeBridge: BridgeManager | undefined;
let activeWorkspaceHub: WorkspaceHubController | undefined;

function bridgeWorkspaceUri(relativePath: string): vscode.Uri {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) throw new Error("No workspace folder is open.");
  const normalized = relativePath.trim().replace(/\\/g, "/").replace(/^\.\//, "");
  if (!normalized || normalized === "." || normalized.startsWith("../") || normalized.includes("/../") || normalized.startsWith("/")) {
    throw new Error(`Invalid Bridge workspace path: ${relativePath}`);
  }
  return vscode.Uri.joinPath(folder.uri, ...normalized.split("/").filter(Boolean));
}

function bridgeDiffSnippet(diff: string, filePath?: string): { before: string; after: string } {
  const lines = diff.split(/\r?\n/);
  let active = !filePath;
  const before: string[] = [];
  const after: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith("--- ")) {
      const oldPath = line.slice(4).replace(/^a\//, "");
      const next = lines[index + 1]?.startsWith("+++ ") ? lines[index + 1].slice(4).replace(/^b\//, "") : "";
      active = !filePath || oldPath === filePath || next === filePath;
      continue;
    }
    if (!active || line.startsWith("+++ ") || line.startsWith("@@") || line === "\\ No newline at end of file") continue;
    if (line.startsWith("-")) before.push(line.slice(1));
    else if (line.startsWith("+")) after.push(line.slice(1));
    else if (line.startsWith(" ")) {
      before.push(line.slice(1));
      after.push(line.slice(1));
    }
  }
  return { before: before.join("\n"), after: after.join("\n") };
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(vscode.commands.registerCommand("opencode.openIndependentGuide", () => vscode.commands.executeCommand("markdown.showPreview", vscode.Uri.joinPath(context.extensionUri,"GUIDE.md"))));
  const output = vscode.window.createOutputChannel("OpenCode");
  registerSkillCenter(context, output);
  const externalMcp = new ExternalMcpCenter(context, output);
  const ideToolBroker = new IdeToolBroker();
  const bridge = new BridgeManager(context, output, ideToolBroker, externalMcp.catalog);
  externalMcp.attachBridge(bridge);
  activeBridge = bridge;
  const bridgeReady = bridge.initialize();
  const workspaceHub = new WorkspaceHubController(context, bridge, output);
  activeWorkspaceHub = workspaceHub;
  const runtime = new RuntimeClient(context, output, ideToolBroker,
    (name, args, ownerId, signal) => bridge.dispatchChatTool(name, args, ownerId, signal));
  const apiModelProvider = new OpenCodeLanguageModelProvider(context, "api");
  const codexModelProvider = new OpenCodeLanguageModelProvider(context, "codex");
  const branchStore = new BranchStateStore(context, output);
  const participant = registerOpenCodeNativeChat(context, runtime, output, {
    opencode: apiModelProvider,
    "opencode-codex": codexModelProvider,
  }, branchStore, bridge);
  const customAgents = registerOpenCodeCustomAgents(context);
  const customAgentDiscoveryCts = new vscode.CancellationTokenSource();

  context.subscriptions.push(
    output,
    ideToolBroker,
    externalMcp,
    bridge,
    workspaceHub,
    runtime,
    apiModelProvider,
    codexModelProvider,
    branchStore,
    participant,
    customAgents,
    customAgentDiscoveryCts,
    vscode.lm.registerLanguageModelChatProvider("opencode", apiModelProvider),
    vscode.lm.registerLanguageModelChatProvider("opencode-codex", codexModelProvider),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("opencode.model")) apiModelProvider.refresh();
    }),
    onCodexAuthChange(() => codexModelProvider.refresh()),
    vscode.commands.registerCommand("opencode.codex.openView", async () => {
      await vscode.commands.executeCommand("aiCustomization.openManagementEditor", "codex");
    }),
    vscode.commands.registerCommand("opencode.configureModel", async () => {
      const changed = await configureOpenCodeModel(context);
      if (changed) {
        apiModelProvider.refresh();
        await vscode.window.showInformationMessage("OpenCode model configuration saved.");
      }
    }),
    vscode.commands.registerCommand("opencode.setApiKey", () => setOpenCodeApiKey(context)),
    vscode.commands.registerCommand("opencode.branch.getGroupState", async (groupId: unknown) => {
      if (typeof groupId !== "string" || !groupId) return undefined;
      await branchStore.ensureLoaded();
      return branchStore.getState(groupId);
    }),
    vscode.commands.registerCommand("opencode.branch.adoptVariant", async (groupId: unknown, variantId: unknown) => {
      if (typeof groupId !== "string" || typeof variantId !== "string" || !groupId || !variantId) return;
      await branchStore.ensureLoaded();
      branchStore.adopt(groupId, variantId);
    }),
    vscode.commands.registerCommand("opencode.branch.setActiveVariant", async (groupId: unknown, variantId: unknown) => {
      if (typeof groupId !== "string" || typeof variantId !== "string" || !groupId || !variantId) return;
      await branchStore.ensureLoaded();
      branchStore.setActiveVariant(groupId, variantId);
    }),
    vscode.commands.registerCommand("opencode.pickMergeModel", async () => {
      const models = await vscode.lm.selectChatModels({ vendor: "opencode" });
      const codexModels = await vscode.lm.selectChatModels({ vendor: "opencode-codex" });
      const all = [...models, ...codexModels];
      if (all.length === 0) {
        await vscode.window.showWarningMessage("No OpenCode models available to pick as the merge model.");
        return;
      }
      const current = vscode.workspace.getConfiguration("opencode").get<string>("multiModel.mergeModel", "");
      const picked = await vscode.window.showQuickPick(
        all.map((model) => ({
          label: model.name,
          description: `${model.vendor}/${model.id}`,
          detail: current === `${model.vendor}/${model.id}` ? "Current merge model" : undefined,
          vendor: model.vendor,
          id: model.id,
        })),
        { title: "Multi-Model Rounds · Select Merge Model", placeHolder: "Select the model that verifies and summarizes the branch plans" },
      );
      if (!picked) return;
      await vscode.workspace.getConfiguration("opencode").update(
        "multiModel.mergeModel", `${picked.vendor}/${picked.id}`, vscode.ConfigurationTarget.Global,
      );
      await vscode.window.showInformationMessage(`Merge model set to ${picked.label} (${picked.vendor}/${picked.id})`);
    }),
    vscode.commands.registerCommand("opencode.pickBranchModels", async () => {
      const models = await vscode.lm.selectChatModels({ vendor: "opencode" });
      const codexModels = await vscode.lm.selectChatModels({ vendor: "opencode-codex" });
      const all = [...models, ...codexModels];
      if (all.length === 0) {
        await vscode.window.showWarningMessage("没有可用的 OpenCode 模型，无法设置多模型分支。");
        return;
      }
      const configuration = vscode.workspace.getConfiguration("opencode");
      const current = configuration.get<unknown>("multiModel.branchModels", []);
      const currentList = Array.isArray(current) ? current.filter((item): item is string => typeof item === "string") : [];
      const picked = await vscode.window.showQuickPick(
        all.map((model) => {
          const identifier = `${model.vendor}/${model.id}`;
          return { label: model.name, description: identifier, picked: currentList.includes(identifier), identifier };
        }),
        { title: "多模型博弈 · 选择一键分支模型", placeHolder: "勾选点击「多模型分支」时依次作答的模型（首答模型会自动跳过）", canPickMany: true },
      );
      if (!picked) return;
      const order = all.map((model) => `${model.vendor}/${model.id}`);
      const chosen = picked.map((item) => item.identifier);
      const kept = currentList.filter((identifier) => chosen.includes(identifier));
      const added = chosen.filter((identifier) => !kept.includes(identifier)).sort((a, b) => order.indexOf(a) - order.indexOf(b));
      await configuration.update("multiModel.branchModels", [...kept, ...added], vscode.ConfigurationTarget.Global);
    }),
    vscode.commands.registerCommand("opencode.testApiEndpoint", async (input: { baseUrl?: unknown; apiKey?: unknown; protocol?: unknown } = {}) => {
      const baseUrl = typeof input?.baseUrl === "string" ? input.baseUrl.trim() : "";
      const apiKey = typeof input?.apiKey === "string" ? input.apiKey.trim() : "";
      if (!baseUrl) return { ok: false, error: "Missing API endpoint URL." };
      return testOpenAIModelsEndpoint(baseUrl, apiKey, input.protocol, diagnostic => output.appendLine(diagnostic));
    }),
    vscode.commands.registerCommand("opencode.codex.login", async () => {
      const status = await codexAuthManager.getStatus();
      if (status.signedIn) {
        void vscode.window.showWarningMessage(
          `Already signed in to Codex as ${status.account?.email ?? status.account?.accountId}. Sign out first to switch accounts.`,
          "OK",
        );
        return;
      }
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Codex sign-in: complete the authorization in your browser…",
            cancellable: true,
          },
          async (_progress, progressToken) => {
            const account = await codexAuthManager.startLogin(progressToken);
            codexModelProvider.refresh();
            void vscode.window.showInformationMessage(
              `Signed in to Codex as ${account.email ?? account.accountId}${account.planType ? ` (${account.planType})` : ""}. Codex models are now available in the Chat model picker.`,
            );
          },
        );
      } catch (error) {
        if (error instanceof vscode.CancellationError) return;
        void vscode.window.showErrorMessage(`Codex sign-in failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
    vscode.commands.registerCommand("opencode.codex.logout", async () => {
      const status = await codexAuthManager.getStatus();
      if (!status.signedIn) {
        void vscode.window.showInformationMessage("Not signed in to Codex.");
        return;
      }
      const choice = await vscode.window.showWarningMessage(
        `Sign out of Codex as ${status.account?.email ?? status.account?.accountId}? This also signs out the official Codex CLI.`,
        { modal: true },
        "Sign Out",
      );
      if (choice !== "Sign Out") return;
      try {
        await codexAuthManager.signOut();
        codexModelProvider.refresh();
        void vscode.window.showInformationMessage("Signed out of Codex.");
      } catch (error) {
        void vscode.window.showErrorMessage(`Failed to sign out of Codex: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
    vscode.commands.registerCommand("opencode.codex.relogin", async () => {
      const status = await codexAuthManager.getStatus();
      if (status.signedIn) {
        const choice = await vscode.window.showWarningMessage(
          `Sign in to Codex again as a different account? This signs out ${status.account?.email ?? status.account?.accountId} and the official Codex CLI first.`,
          { modal: true },
          "Sign In Again",
        );
        if (choice !== "Sign In Again") return;
        try {
          await codexAuthManager.signOut();
        } catch (error) {
          void vscode.window.showErrorMessage(`Failed to prepare Codex sign-in: ${error instanceof Error ? error.message : String(error)}`);
          return;
        }
      }
      await vscode.commands.executeCommand("opencode.codex.login");
    }),
    vscode.commands.registerCommand("opencode.codex.getStatus", () => codexAuthManager.getStatus()),
    vscode.commands.registerCommand("opencode.codex.status", async () => {
      const status = await codexAuthManager.getStatus();
      if (!status.signedIn) {
        await vscode.window.showInformationMessage("Not signed in to Codex. Run 'OpenCode: Sign in with Codex' to use ChatGPT subscription models.");
        return;
      }
      const account = status.account;
      const expiry = status.expiresAt ? new Date(status.expiresAt * 1000).toLocaleString() : undefined;
      await vscode.window.showInformationMessage(
        `Signed in to Codex as ${account?.email ?? account?.accountId}${account?.planType ? ` · ${account.planType}` : ""}${expiry ? ` · access token expires ${expiry}` : ""}.`,
      );
    }),
    vscode.commands.registerCommand("opencode.restartRuntime", async () => {
      try {
        const hello = await runtime.restart();
        await vscode.window.showInformationMessage(
          `OpenCode Runtime restarted · pid ${hello.pid} · protocol ${hello.protocolVersion} · ${hello.tools.length} tools`,
        );
      } catch (error) {
        await vscode.window.showErrorMessage(`Failed to restart OpenCode Runtime: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
    vscode.commands.registerCommand("opencode.showRuntimeStatus", async () => {
      try {
        const hello = await runtime.hello();
        await vscode.window.showInformationMessage(
          `OpenCode Runtime connected · pid ${hello.pid} · protocol ${hello.protocolVersion} · ${hello.tools.length} tools`,
        );
      } catch (error) {
        await vscode.window.showErrorMessage(`OpenCode Runtime unavailable: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
    vscode.commands.registerCommand("opencode.openChat", async () => {
      await vscode.commands.executeCommand("workbench.action.chat.open");
      await vscode.commands.executeCommand("_opencode.bridge.showChat");
    }),
    vscode.commands.registerCommand("opencode.bridge.openSession", async () => {
      await vscode.commands.executeCommand("workbench.action.chat.open");
      await vscode.commands.executeCommand("_opencode.bridge.showSession");
    }),
    vscode.commands.registerCommand("opencode.bridge.getStatus", async () => {
      await bridgeReady;
      return bridge.getStatus();
    }),
    vscode.commands.registerCommand("opencode.bridge.openResource", async (value: unknown) => {
      const input = value && typeof value === "object" ? value as { path?: unknown; line?: unknown; column?: unknown; folder?: unknown } : {};
      if (typeof input.path !== "string") throw new Error("Bridge resource path is required.");
      const uri = bridgeWorkspaceUri(input.path);
      if (input.folder === true) {
        await vscode.commands.executeCommand("revealInExplorer", uri);
        return;
      }
      const line = typeof input.line === "number" && input.line > 0 ? input.line : 1;
      const column = typeof input.column === "number" && input.column > 0 ? input.column : 1;
      const position = new vscode.Position(line - 1, column - 1);
      await vscode.window.showTextDocument(uri, { preview: true, selection: new vscode.Range(position, position) });
    }),
    vscode.commands.registerCommand("opencode.bridge.openDiff", async (value: unknown) => {
      const input = value && typeof value === "object" ? value as { diff?: unknown; path?: unknown } : {};
      if (typeof input.diff !== "string" || !input.diff.trim()) throw new Error("Bridge diff content is required.");
      const filePath = typeof input.path === "string" ? input.path : undefined;
      const snippet = bridgeDiffSnippet(input.diff, filePath);
      const before = await vscode.workspace.openTextDocument({ content: snippet.before });
      const after = await vscode.workspace.openTextDocument({ content: snippet.after });
      await vscode.commands.executeCommand("vscode.diff", before.uri, after.uri, `${filePath ?? "Bridge edit"} · Before ↔ After`, { preview: true });
    }),
    vscode.commands.registerCommand("opencode.bridge.openTerminal", async (terminalId: unknown) => {
      if (typeof terminalId !== "string" || !terminalId) throw new Error("Bridge terminal id is required.");
      if (!ideToolBroker.revealTerminal(terminalId)) {
        await vscode.window.showInformationMessage("That OpenCode terminal is no longer available.");
      }
    }),
    vscode.commands.registerCommand("opencode.bridge.configure", async (domain: unknown) => {
      await bridgeReady;
      if (typeof domain !== "string") throw new Error("Bridge ngrok domain must be a string.");
      return bridge.configure(domain);
    }),
    vscode.commands.registerCommand("opencode.bridge.configureNamedTunnel", async (value: unknown) => {
      await bridgeReady;
      const input = value && typeof value === "object"
        ? value as { domain?: unknown; token?: unknown; localPort?: unknown }
        : {};
      if (typeof input.domain !== "string") throw new Error("Cloudflare Named Tunnel hostname must be a string.");
      if (input.token !== undefined && typeof input.token !== "string") throw new Error("Cloudflare Tunnel Token must be a string.");
      if (typeof input.localPort !== "number") throw new Error("Cloudflare Named Tunnel local port must be a number.");
      return bridge.configureNamedTunnel({
        domain: input.domain,
        token: input.token,
        localPort: input.localPort,
      });
    }),
    vscode.commands.registerCommand("opencode.bridge.clearNamedTunnelToken", async () => {
      await bridgeReady;
      return bridge.clearNamedTunnelToken();
    }),
    vscode.commands.registerCommand("opencode.bridge.setTunnelProvider", async (provider: unknown) => {
      await bridgeReady;
      if (typeof provider !== "string") throw new Error("Bridge tunnel provider must be a string.");
      return bridge.setTunnelProvider(provider);
    }),
    vscode.commands.registerCommand("opencode.bridge.start", async (domain?: unknown) => {
      await bridgeReady;
      if (domain !== undefined && typeof domain !== "string") throw new Error("Bridge domain must be a string.");
      const status = await bridge.start(domain as string | undefined);
      await vscode.commands.executeCommand("workbench.action.chat.open");
      await vscode.commands.executeCommand("_opencode.bridge.showSession");
      return status;
    }),
    vscode.commands.registerCommand("opencode.bridge.stop", async () => {
      await bridgeReady;
      return bridge.stop();
    }),
    vscode.commands.registerCommand("opencode.bridge.cleanupProcesses", async () => {
      await bridgeReady;
      return bridge.cleanupOrphanTunnel();
    }),
    vscode.commands.registerCommand("opencode.bridge.checkNgrok", async () => {
      await bridgeReady;
      return bridge.checkNgrok();
    }),
    vscode.commands.registerCommand("opencode.bridge.checkTunnel", async () => {
      await bridgeReady;
      return bridge.checkTunnel();
    }),
    // Bridge 页启动失败提示里的「查看日志」：显示 OpenCode 输出通道。
    vscode.commands.registerCommand("opencode.bridge.showLog", () => output.show(true)),
    vscode.commands.registerCommand("opencode.bridge.checkHealth", async () => {
      await bridgeReady;
      return bridge.checkHealth();
    }),
    vscode.commands.registerCommand("opencode.bridge.clearActivityLog", async () => {
      await bridgeReady;
      return bridge.clearActivityLog();
    }),
    vscode.commands.registerCommand("opencode.bridge.clearTasksConfirmed", async (input: unknown) => {
      await bridgeReady;
      const args = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {};
      const requests = args.requests;
      if (!Array.isArray(requests) || requests.length < 1 || requests.length > 32 || requests.some(item =>
        !item || typeof item !== 'object' || typeof item.id !== 'string' || !item.id || !Number.isSafeInteger(item.revision)
      )) throw new Error('Select a bounded list of tasks to clear.');
      const seen = new Set(requests.map(item => item.id));
      if (seen.size !== requests.length) throw new Error('Duplicate tasks cannot be cleared.');
      const allowAttention = args.allowAttention === true;
      const tasks = bridge.getStatus().tasks ?? [];
      for (const request of requests) {
        const task = tasks.find(candidate => candidate.id === request.id && candidate.revision === request.revision);
        if (!task) throw new Error('A task changed or expired; refresh the task list before confirming cleanup.');
        if (!['completed', 'cancelled', 'cleared'].includes(task.state)
          && !(allowAttention && ['blocked', 'interrupted'].includes(task.state))) {
          throw new Error('Running, planning and awaiting-sync tasks cannot be cleared locally.');
        }
      }
      const zh = vscode.env.language.startsWith('zh');
      const confirmLabel = zh ? '永久清理任务' : 'Permanently clear tasks';
      const choice = await vscode.window.showWarningMessage(
        allowAttention
          ? (zh ? `永久清理 ${requests.length} 项阻塞或中断的 Bridge 任务？这些工作可能尚未完成。` : `Permanently clear ${requests.length} blocked or interrupted Bridge task(s)? Their work may be unfinished.`)
          : (zh ? `永久清理 ${requests.length} 项已结束的 Bridge 任务？` : `Permanently clear ${requests.length} finished Bridge task(s)?`),
        { modal: true, detail: zh
          ? '旧 task_id 将失效；工具活动日志不受影响。隐藏任务可以撤销，永久清理不能撤销。'
          : 'Old task_id handles will stop working. This does not clear tool activity. Hiding a task is reversible; permanent cleanup is not.' },
        confirmLabel
      );
      if (choice !== confirmLabel) return bridge.getStatus();
      // The store rechecks all revisions and states synchronously after the modal closes.
      return bridge.clearTasks(requests, allowAttention);
    }),
    vscode.commands.registerCommand("opencode.bridge.installCloudflared", async () => {
      await bridgeReady;
      const status = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: bridgeNoticeText("installingCloudflared"),
        cancellable: false,
      }, () => bridge.installCloudflared());
      void vscode.window.showInformationMessage(bridgeNoticeText("cloudflaredReady", status.tunnelVersion ?? bridgeNoticeText("installed")));
      return status;
    }),
    vscode.commands.registerCommand("opencode.bridge.rotateEndpoint", async () => {
      await bridgeReady;
      return bridge.rotateEndpoint();
    }),
    vscode.commands.registerCommand("opencode.bridge.customTools.toggle", async (name?: unknown) => {
      await bridgeReady;
      return bridge.toggleCustomTool(typeof name === "string" && name.trim() ? name.trim() : undefined);
    }),
    vscode.commands.registerCommand("opencode.bridge.customTools.delete", async (name?: unknown) => {
      await bridgeReady;
      return bridge.deleteCustomTool(typeof name === "string" && name.trim() ? name.trim() : undefined);
    }),
    // Deprecated since 0.7.7: kept for old callers, Skill folders or supported archives, same pipeline as opencode.skills.import.
    vscode.commands.registerCommand("opencode.bridge.skills.import", async (source: unknown) => {
      await bridgeReady;
      if (typeof source !== "string" || !source.trim()) throw new Error("Skill source must be a non-empty path.");
      output.appendLine("[skills] opencode.bridge.skills.import is deprecated; use opencode.skills.import (Skill folders or supported archives).");
      return bridge.importSkill(source.trim());
    }),
    vscode.commands.registerCommand("opencode.bridge.skills.diagnose", async () => {
      await bridgeReady;
      return bridge.diagnoseSkills();
    }),
    vscode.commands.registerCommand("opencode.bridge.skills.generateRunner", async (name: unknown) => {
      await bridgeReady;
      if (typeof name !== "string" || !name.trim()) throw new Error("Skill name must be a non-empty string.");
      return bridge.generateSkillRunner(name.trim());
    }),
  );

  output.appendLine("[extension] native Chat participant registered: opencode.agent");
  output.appendLine("[extension] native Language Model provider registered: opencode");
  output.appendLine("[extension] first-party modes registered: OpenCode Ask, OpenCode Plan, OpenCode Code");
  output.appendLine("[extension] IDE tool broker registered: list_directory, run_command, get_command_output, cancel_command, send_command_input, get_diagnostics, lsp");
  output.appendLine("[extension] Bridge registered: Streamable HTTP MCP + Cloudflare Quick/Named Tunnel + ngrok + report_progress");
  if (vscode.workspace.getConfiguration("opencode.bridge").get<boolean>("persistentMode", false)) {
    output.appendLine("[extension] persistent Bridge mode enabled; opening Chat and waiting for the rendered view to start Bridge");
    setTimeout(() => {
      void vscode.commands.executeCommand("workbench.action.chat.open").then(undefined, (error) => {
        output.appendLine(`[extension] failed to open Chat for persistent Bridge mode: ${error instanceof Error ? error.message : String(error)}`);
      });
    }, 100);
  }
  if (process.env.OPENCODE_TERMINAL_SMOKE === "1") {
    void ideToolBroker.runTerminalSmokeTest().then(
      (result) => output.appendLine(`[terminal-smoke] PASS\n${result}`),
      (error) => output.appendLine(`[terminal-smoke] FAIL ${error instanceof Error ? error.stack ?? error.message : String(error)}`),
    );
  }
  if (process.env.OPENCODE_LSP_SMOKE === "1") {
    void ideToolBroker.runLspSmokeTest().then(
      (result) => output.appendLine(`[lsp-smoke] PASS\n${result}`),
      (error) => output.appendLine(`[lsp-smoke] FAIL ${error instanceof Error ? error.stack ?? error.message : String(error)}`),
    );
  }
  const bridgeSmokeDomain = process.env.OPENCODE_BRIDGE_SMOKE_DOMAIN?.trim();
  const bridgeLocalSmoke = process.env.OPENCODE_BRIDGE_SMOKE_LOCAL === "1";
  if (bridgeSmokeDomain || bridgeLocalSmoke) {
    void bridgeReady.then(() => bridgeLocalSmoke ? bridge.startLocalSmoke() : bridge.start(bridgeSmokeDomain)).then(
      (status) => output.appendLine(`[bridge-smoke] READY local=${status.localUrl ?? "missing"} public=${status.publicUrl ?? "missing"}`),
      (error) => output.appendLine(`[bridge-smoke] FAIL ${error instanceof Error ? error.stack ?? error.message : String(error)}`),
    );
  }
  void vscode.chat.getCustomAgents(customAgentDiscoveryCts.token).then(
    (agents) => output.appendLine(`[extension] custom agents discovered: ${agents.map((agent) => agent.name).join(", ") || "none"}`),
    (error) => output.appendLine(`[extension] custom agent discovery failed: ${error instanceof Error ? error.message : String(error)}`),
  );
}

export async function deactivate(): Promise<void> {
  const hub = activeWorkspaceHub;
  activeWorkspaceHub = undefined;
  const bridge = activeBridge;
  activeBridge = undefined;
  // The bridge owns the tunnel child process: dispose it FIRST so a hub
  // teardown failure can never skip the ngrok/cloudflared kill (orphaned
  // tunnel after quit). Each stage is guarded so one failure cannot skip
  // the other; the first error still surfaces to the caller.
  let firstError: unknown;
  try {
    if (bridge) await bridge.disposeAsync();
  } catch (error) {
    firstError = error;
  }
  try {
    if (hub) await hub.disposeAsync();
  } catch (error) {
    firstError ??= error;
  }
  if (firstError) throw firstError;
}
