import { registerTaskWorkbench } from './task-workbench.mjs';
import { createLocalAssistantSourceLink } from './assistant-source-local.mjs';
import { createAutomationService } from './automation-store.mjs';
import { registerAutomationWorkbench } from './automation-workbench.mjs';
import { initializeBundledDefaults } from './default-bootstrap.mjs';
import { globalSkillsDirectory as bundledSkillsDirectory } from './module-0025.mjs';
// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/extension.ts
import { __export, __toCommonJS, __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { registerSkillCenter } from "./module-0024.mjs";
import { ExternalMcpCenter } from "./module-0058.mjs";
import { IdeToolBroker } from "./module-0165.mjs";
import { BridgeManager } from "./module-0114.mjs";
import { BRIDGE_TASK_CLEANUP_BATCH_LIMIT } from "./module-0144.mjs";
import { WorkspaceHubController } from "./module-0184.mjs";
import { RuntimeClient } from "./module-0183.mjs";
import { OpenCodeLanguageModelProvider } from "./module-0171.mjs";
import { BranchStateStore } from "./module-0163.mjs";
import { registerOpenCodeNativeChat } from "./module-0177.mjs";
import { registerOpenCodeCustomAgents } from "./module-0164.mjs";
import { codexAuthManager, onCodexAuthChange } from "./module-0162.mjs";
import { configureOpenCodeModel, setOpenCodeApiKey } from "./module-0161.mjs";
import { testOpenAIModelsEndpoint } from "./module-0172.mjs";
import { bridgeNoticeText } from "./module-0113.mjs";


// extensions/opencode/src/extension.ts
var extension_exports = {};

__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});

module.exports = __toCommonJS(extension_exports);

init_define_OPENCODE_BUILD_INFO();


// extensions/opencode/src/extension.ts
var vscode22 = __toESM(require("vscode"));


// extensions/opencode/src/extension.ts
var activeBridge;

var activeWorkspaceHub;

function bridgeWorkspaceUri(relativePath) {
  const folder = vscode22.workspace.workspaceFolders?.[0];
  if (!folder) throw new Error("No workspace folder is open.");
  const normalized = relativePath.trim().replace(/\\/g, "/").replace(/^\.\//, "");
  if (!normalized || normalized === "." || normalized.startsWith("../") || normalized.includes("/../") || normalized.startsWith("/")) {
    throw new Error(`Invalid Bridge workspace path: ${relativePath}`);
  }
  return vscode22.Uri.joinPath(folder.uri, ...normalized.split("/").filter(Boolean));
}

function bridgeDiffSnippet(diff, filePath) {
  const lines = diff.split(/\r?\n/);
  let active = !filePath;
  const before = [];
  const after = [];
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

async function activate(context) {
  const output2 = vscode22.window.createOutputChannel("OpenCode");
  registerSkillCenter(context, output2);
  const externalMcp = new ExternalMcpCenter(context, output2);
  // Optional defaults must not abort activation before Bridge commands exist.
  // Keep failures visible; do not reset configuration or bypass tool guards.
  await initializeBundledDefaults(context,externalMcp.catalog,bundledSkillsDirectory,message=>output2.appendLine(message)).catch(error => {
    const detail = error instanceof Error ? error.message : String(error);
    output2.appendLine('[defaults] initialization failed; continuing Bridge activation: ' + detail);
    void vscode22.window.showWarningMessage('OpenCode 默认组件初始化失败：' + detail + '。Bridge 将继续初始化；请在输出面板查看详情。');
  });
  const ideToolBroker = new IdeToolBroker();
  const automation = createAutomationService(context, vscode22);
  await automation.initialize().catch(error => {
    output2.appendLine('[automation] ' + error.message);
    void vscode22.window.showWarningMessage('规则数据未初始化：' + error.message + '。原数据不会被重置，工作区操作将保持受限。');
  });
  const bridge = new BridgeManager(context, output2, ideToolBroker, externalMcp.catalog, automation);
  registerAutomationWorkbench(context, bridge, output2);
  externalMcp.attachBridge(bridge);
  activeBridge = bridge;
  const performanceItem=vscode22.window.createStatusBarItem(vscode22.StatusBarAlignment.Left,10);
  performanceItem.name='OpenCode AI scheduling';performanceItem.command='opencode.bridge.showConcurrency';
  const updatePerformance=()=>{const c=bridge.getConcurrencyStatus();const text=`$(pulse) AI ${c.active+c.external.active} | 队列 ${c.waiting+c.external.waiting}`;if(performanceItem.text!==text)performanceItem.text=text;performanceItem.tooltip=`内置 ${c.active}/${c.limit}; 外部 ${c.external.active}/${c.external.limit}; 最近排队 ${c.lastTiming.queueWaitMs||0}ms / 执行 ${c.lastTiming.executionMs||0}ms`;};
  updatePerformance();performanceItem.show();const performanceTimer=setInterval(updatePerformance,2000);performanceTimer.unref?.();
  context.subscriptions.push(performanceItem,{dispose(){clearInterval(performanceTimer);}},vscode22.commands.registerCommand('opencode.bridge.showConcurrency',()=>{const c=bridge.getConcurrencyStatus();output2.appendLine('[scheduler] '+JSON.stringify(c));output2.show(true);return c;}));
  const bridgeReady = bridge.initialize();
  const workspaceHub = new WorkspaceHubController(context, bridge, output2);
  activeWorkspaceHub = workspaceHub;
  context.subscriptions.push(createLocalAssistantSourceLink(context, { bridge, workspaceHub, trusted: () => vscode22.workspace.isTrusted, log: message => output2.appendLine(message) }));
  registerTaskWorkbench(context, output2, { bridge, workspaceHub });
  const runtime = new RuntimeClient(
    context,
    output2,
    ideToolBroker,
    (name, args, ownerId, signal) => bridge.dispatchChatTool(name, args, ownerId, signal),
    automation
  );
  const apiModelProvider = new OpenCodeLanguageModelProvider(context, "api");
  const codexModelProvider = new OpenCodeLanguageModelProvider(context, "codex");
  const branchStore = new BranchStateStore(context, output2);
  const participant = registerOpenCodeNativeChat(context, runtime, output2, {
    opencode: apiModelProvider,
    "opencode-codex": codexModelProvider
  }, branchStore, bridge);
  const customAgents = registerOpenCodeCustomAgents(context);
  const customAgentDiscoveryCts = new vscode22.CancellationTokenSource();
  context.subscriptions.push(
    output2,
    automation,
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
    vscode22.lm.registerLanguageModelChatProvider("opencode", apiModelProvider),
    vscode22.lm.registerLanguageModelChatProvider("opencode-codex", codexModelProvider),
    vscode22.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("opencode.model")) apiModelProvider.refresh();
    }),
    onCodexAuthChange(() => codexModelProvider.refresh()),
    vscode22.commands.registerCommand("opencode.codex.openView", async () => {
      await vscode22.commands.executeCommand("aiCustomization.openManagementEditor", "codex");
    }),
    vscode22.commands.registerCommand("opencode.configureModel", async () => {
      const changed = await configureOpenCodeModel(context);
      if (changed) {
        apiModelProvider.refresh();
        await vscode22.window.showInformationMessage("OpenCode model configuration saved.");
      }
    }),
    vscode22.commands.registerCommand("opencode.setApiKey", () => setOpenCodeApiKey(context)),
    vscode22.commands.registerCommand("opencode.branch.getGroupState", async (groupId) => {
      if (typeof groupId !== "string" || !groupId) return void 0;
      await branchStore.ensureLoaded();
      return branchStore.getState(groupId);
    }),
    vscode22.commands.registerCommand("opencode.branch.adoptVariant", async (groupId, variantId) => {
      if (typeof groupId !== "string" || typeof variantId !== "string" || !groupId || !variantId) return;
      await branchStore.ensureLoaded();
      branchStore.adopt(groupId, variantId);
    }),
    vscode22.commands.registerCommand("opencode.branch.setActiveVariant", async (groupId, variantId) => {
      if (typeof groupId !== "string" || typeof variantId !== "string" || !groupId || !variantId) return;
      await branchStore.ensureLoaded();
      branchStore.setActiveVariant(groupId, variantId);
    }),
    vscode22.commands.registerCommand("opencode.pickMergeModel", async () => {
      const models = await vscode22.lm.selectChatModels({ vendor: "opencode" });
      const codexModels = await vscode22.lm.selectChatModels({ vendor: "opencode-codex" });
      const all = [...models, ...codexModels];
      if (all.length === 0) {
        await vscode22.window.showWarningMessage("No OpenCode models available to pick as the merge model.");
        return;
      }
      const current = vscode22.workspace.getConfiguration("opencode").get("multiModel.mergeModel", "");
      const picked = await vscode22.window.showQuickPick(
        all.map((model) => ({
          label: model.name,
          description: `${model.vendor}/${model.id}`,
          detail: current === `${model.vendor}/${model.id}` ? "Current merge model" : void 0,
          vendor: model.vendor,
          id: model.id
        })),
        { title: "Multi-Model Rounds \xB7 Select Merge Model", placeHolder: "Select the model that verifies and summarizes the branch plans" }
      );
      if (!picked) return;
      await vscode22.workspace.getConfiguration("opencode").update(
        "multiModel.mergeModel",
        `${picked.vendor}/${picked.id}`,
        vscode22.ConfigurationTarget.Global
      );
      await vscode22.window.showInformationMessage(`Merge model set to ${picked.label} (${picked.vendor}/${picked.id})`);
    }),
    vscode22.commands.registerCommand("opencode.testApiEndpoint", async (input = {}) => {
      const baseUrl = typeof input?.baseUrl === "string" ? input.baseUrl.trim() : "";
      const apiKey = typeof input?.apiKey === "string" ? input.apiKey.trim() : "";
      if (!baseUrl) return { ok: false, error: "Missing API endpoint URL." };
      return testOpenAIModelsEndpoint(baseUrl, apiKey, input.protocol, (diagnostic) => output2.appendLine(diagnostic));
    }),
    vscode22.commands.registerCommand("opencode.codex.login", async () => {
      const status = await codexAuthManager.getStatus();
      if (status.signedIn) {
        void vscode22.window.showWarningMessage(
          `Already signed in to Codex as ${status.account?.email ?? status.account?.accountId}. Sign out first to switch accounts.`,
          "OK"
        );
        return;
      }
      try {
        await vscode22.window.withProgress(
          {
            location: vscode22.ProgressLocation.Notification,
            title: "Codex sign-in: complete the authorization in your browser\u2026",
            cancellable: true
          },
          async (_progress, progressToken) => {
            const account = await codexAuthManager.startLogin(progressToken);
            codexModelProvider.refresh();
            void vscode22.window.showInformationMessage(
              `Signed in to Codex as ${account.email ?? account.accountId}${account.planType ? ` (${account.planType})` : ""}. Codex models are now available in the Chat model picker.`
            );
          }
        );
      } catch (error2) {
        if (error2 instanceof vscode22.CancellationError) return;
        void vscode22.window.showErrorMessage(`Codex sign-in failed: ${error2 instanceof Error ? error2.message : String(error2)}`);
      }
    }),
    vscode22.commands.registerCommand("opencode.codex.logout", async () => {
      const status = await codexAuthManager.getStatus();
      if (!status.signedIn) {
        void vscode22.window.showInformationMessage("Not signed in to Codex.");
        return;
      }
      const choice = await vscode22.window.showWarningMessage(
        `Sign out of Codex as ${status.account?.email ?? status.account?.accountId}? This also signs out the official Codex CLI.`,
        { modal: true },
        "Sign Out"
      );
      if (choice !== "Sign Out") return;
      try {
        await codexAuthManager.signOut();
        codexModelProvider.refresh();
        void vscode22.window.showInformationMessage("Signed out of Codex.");
      } catch (error2) {
        void vscode22.window.showErrorMessage(`Failed to sign out of Codex: ${error2 instanceof Error ? error2.message : String(error2)}`);
      }
    }),
    vscode22.commands.registerCommand("opencode.codex.relogin", async () => {
      const status = await codexAuthManager.getStatus();
      if (status.signedIn) {
        const choice = await vscode22.window.showWarningMessage(
          `Sign in to Codex again as a different account? This signs out ${status.account?.email ?? status.account?.accountId} and the official Codex CLI first.`,
          { modal: true },
          "Sign In Again"
        );
        if (choice !== "Sign In Again") return;
        try {
          await codexAuthManager.signOut();
        } catch (error2) {
          void vscode22.window.showErrorMessage(`Failed to prepare Codex sign-in: ${error2 instanceof Error ? error2.message : String(error2)}`);
          return;
        }
      }
      await vscode22.commands.executeCommand("opencode.codex.login");
    }),
    vscode22.commands.registerCommand("opencode.codex.getStatus", () => codexAuthManager.getStatus()),
    vscode22.commands.registerCommand("opencode.codex.status", async () => {
      const status = await codexAuthManager.getStatus();
      if (!status.signedIn) {
        await vscode22.window.showInformationMessage("Not signed in to Codex. Run 'OpenCode: Sign in with Codex' to use ChatGPT subscription models.");
        return;
      }
      const account = status.account;
      const expiry = status.expiresAt ? new Date(status.expiresAt * 1e3).toLocaleString() : void 0;
      await vscode22.window.showInformationMessage(
        `Signed in to Codex as ${account?.email ?? account?.accountId}${account?.planType ? ` \xB7 ${account.planType}` : ""}${expiry ? ` \xB7 access token expires ${expiry}` : ""}.`
      );
    }),
    vscode22.commands.registerCommand("opencode.restartRuntime", async () => {
      try {
        const hello = await runtime.restart();
        await vscode22.window.showInformationMessage(
          `OpenCode Runtime restarted \xB7 pid ${hello.pid} \xB7 protocol ${hello.protocolVersion} \xB7 ${hello.tools.length} tools`
        );
      } catch (error2) {
        await vscode22.window.showErrorMessage(`Failed to restart OpenCode Runtime: ${error2 instanceof Error ? error2.message : String(error2)}`);
      }
    }),
    vscode22.commands.registerCommand("opencode.showRuntimeStatus", async () => {
      try {
        const hello = await runtime.hello();
        await vscode22.window.showInformationMessage(
          `OpenCode Runtime connected \xB7 pid ${hello.pid} \xB7 protocol ${hello.protocolVersion} \xB7 ${hello.tools.length} tools`
        );
      } catch (error2) {
        await vscode22.window.showErrorMessage(`OpenCode Runtime unavailable: ${error2 instanceof Error ? error2.message : String(error2)}`);
      }
    }),
    vscode22.commands.registerCommand("opencode.openChat", async () => {
      await vscode22.commands.executeCommand("workbench.action.chat.open");
      await vscode22.commands.executeCommand("_opencode.bridge.showChat");
    }),
    vscode22.commands.registerCommand("opencode.bridge.openSession", async () => {
      await vscode22.commands.executeCommand("workbench.action.chat.open");
      await vscode22.commands.executeCommand("_opencode.bridge.showSession");
    }),
    vscode22.commands.registerCommand("opencode.bridge.getStatus", async () => {
      await bridgeReady;
      return bridge.getStatus();
    }),
    vscode22.commands.registerCommand("opencode.bridge.openResource", async (value) => {
      const input = value && typeof value === "object" ? value : {};
      if (typeof input.path !== "string") throw new Error("Bridge resource path is required.");
      const uri = bridgeWorkspaceUri(input.path);
      if (input.folder === true) {
        await vscode22.commands.executeCommand("revealInExplorer", uri);
        return;
      }
      const line = typeof input.line === "number" && input.line > 0 ? input.line : 1;
      const column = typeof input.column === "number" && input.column > 0 ? input.column : 1;
      const position = new vscode22.Position(line - 1, column - 1);
      await vscode22.window.showTextDocument(uri, { preview: true, selection: new vscode22.Range(position, position) });
    }),
    vscode22.commands.registerCommand("opencode.bridge.openDiff", async (value) => {
      const input = value && typeof value === "object" ? value : {};
      if (typeof input.diff !== "string" || !input.diff.trim()) throw new Error("Bridge diff content is required.");
      const filePath = typeof input.path === "string" ? input.path : void 0;
      const snippet = bridgeDiffSnippet(input.diff, filePath);
      const before = await vscode22.workspace.openTextDocument({ content: snippet.before });
      const after = await vscode22.workspace.openTextDocument({ content: snippet.after });
      await vscode22.commands.executeCommand("vscode.diff", before.uri, after.uri, `${filePath ?? "Bridge edit"} \xB7 Before \u2194 After`, { preview: true });
    }),
    vscode22.commands.registerCommand("opencode.bridge.openTerminal", async (terminalId) => {
      if (typeof terminalId !== "string" || !terminalId) throw new Error("Bridge terminal id is required.");
      if (!ideToolBroker.revealTerminal(terminalId)) {
        await vscode22.window.showInformationMessage("That OpenCode terminal is no longer available.");
      }
    }),
    vscode22.commands.registerCommand("opencode.bridge.configure", async (domain) => {
      await bridgeReady;
      if (typeof domain !== "string") throw new Error("Bridge ngrok domain must be a string.");
      return bridge.configure(domain);
    }),
    vscode22.commands.registerCommand("opencode.bridge.configureNamedTunnel", async (value) => {
      await bridgeReady;
      const input = value && typeof value === "object" ? value : {};
      if (typeof input.domain !== "string") throw new Error("Cloudflare Named Tunnel hostname must be a string.");
      if (input.token !== void 0 && typeof input.token !== "string") throw new Error("Cloudflare Tunnel Token must be a string.");
      if (typeof input.localPort !== "number") throw new Error("Cloudflare Named Tunnel local port must be a number.");
      return bridge.configureNamedTunnel({
        domain: input.domain,
        token: input.token,
        localPort: input.localPort
      });
    }),
    vscode22.commands.registerCommand("opencode.bridge.clearNamedTunnelToken", async () => {
      await bridgeReady;
      return bridge.clearNamedTunnelToken();
    }),
    vscode22.commands.registerCommand("opencode.bridge.setTunnelProvider", async (provider) => {
      await bridgeReady;
      if (typeof provider !== "string") throw new Error("Bridge tunnel provider must be a string.");
      return bridge.setTunnelProvider(provider);
    }),
    vscode22.commands.registerCommand("opencode.bridge.start", async (domain) => {
      await bridgeReady;
      if (domain !== void 0 && typeof domain !== "string") throw new Error("Bridge domain must be a string.");
      const status = await bridge.start(domain);
      await vscode22.commands.executeCommand("workbench.action.chat.open");
      await vscode22.commands.executeCommand("_opencode.bridge.showSession");
      return status;
    }),
    vscode22.commands.registerCommand("opencode.bridge.stop", async () => {
      await bridgeReady;
      return bridge.stop();
    }),
    vscode22.commands.registerCommand("opencode.bridge.cleanupProcesses", async () => {
      await bridgeReady;
      return bridge.cleanupOrphanTunnel();
    }),
    vscode22.commands.registerCommand("opencode.bridge.checkNgrok", async () => {
      await bridgeReady;
      return bridge.checkNgrok();
    }),
    vscode22.commands.registerCommand("opencode.bridge.checkTunnel", async () => {
      await bridgeReady;
      return bridge.checkTunnel();
    }),
    // Bridge 页启动失败提示里的「查看日志」：显示 OpenCode 输出通道。
    vscode22.commands.registerCommand("opencode.bridge.showLog", () => output2.show(true)),
    vscode22.commands.registerCommand("opencode.bridge.checkHealth", async () => {
      await bridgeReady;
      return bridge.checkHealth();
    }),
    vscode22.commands.registerCommand("opencode.bridge.answerTaskQuestion", async (input) => {
      await bridgeReady;
      const args = input && typeof input === "object" && !Array.isArray(input) ? input : {};
      if (typeof args.taskId !== "string" || typeof args.questionId !== "string" ||
          (args.optionId !== undefined && typeof args.optionId !== "string") ||
          (args.customText !== undefined && typeof args.customText !== "string")) {
        throw new Error("无效的任务提问回答。");
      }
      const task = (bridge.getStatus().tasks ?? []).find((item) => item.id === args.taskId);
      if (!task?.questions?.some((q) => q.id === args.questionId && q.status === "pending")) {
        throw new Error("任务问题已失效；请刷新任务板块。");
      }
      return bridge.answerTaskQuestion(args.taskId, args.questionId, args.optionId, args.customText);
    }),
    vscode22.commands.registerCommand("opencode.bridge.clearActivityLog", async () => {
      await bridgeReady;
      return bridge.clearActivityLog();
    }),
    vscode22.commands.registerCommand("opencode.bridge.clearTasksConfirmed", async (input) => {
      await bridgeReady;
      const args = input && typeof input === "object" && !Array.isArray(input) ? input : {};
      const requests = args.requests;
      if (!Array.isArray(requests) || requests.length < 1 || requests.length > BRIDGE_TASK_CLEANUP_BATCH_LIMIT || requests.some(
        (item) => !item || typeof item !== "object" || typeof item.id !== "string" || !item.id || !Number.isSafeInteger(item.revision)
      )) throw new Error("Select a bounded list of tasks to clear.");
      const seen = new Set(requests.map((item) => item.id));
      if (seen.size !== requests.length) throw new Error("Duplicate tasks cannot be cleared.");
      const allowAttention = args.allowAttention === true;
      const tasks = bridge.getStatus().tasks ?? [];
      for (const request of requests) {
        const task = tasks.find((candidate) => candidate.id === request.id && candidate.revision === request.revision);
        if (!task) throw new Error("A task changed or expired; refresh the task list before confirming cleanup.");
        if (!["completed", "cancelled", "cleared"].includes(task.state) && !(allowAttention && ["blocked", "interrupted"].includes(task.state))) {
          throw new Error("Running, planning and awaiting-sync tasks cannot be cleared locally.");
        }
      }
      const zh = vscode22.env.language.startsWith("zh");
      const confirmLabel = zh ? "\u6C38\u4E45\u6E05\u7406\u4EFB\u52A1" : "Permanently clear tasks";
      const choice = await vscode22.window.showWarningMessage(
        allowAttention ? zh ? `\u6C38\u4E45\u6E05\u7406 ${requests.length} \u9879\u963B\u585E\u6216\u4E2D\u65AD\u7684 Bridge \u4EFB\u52A1\uFF1F\u8FD9\u4E9B\u5DE5\u4F5C\u53EF\u80FD\u5C1A\u672A\u5B8C\u6210\u3002` : `Permanently clear ${requests.length} blocked or interrupted Bridge task(s)? Their work may be unfinished.` : zh ? `\u6C38\u4E45\u6E05\u7406 ${requests.length} \u9879\u5DF2\u7ED3\u675F\u7684 Bridge \u4EFB\u52A1\uFF1F` : `Permanently clear ${requests.length} finished Bridge task(s)?`,
        { modal: true, detail: zh ? "\u65E7 task_id \u5C06\u5931\u6548\uFF1B\u5DE5\u5177\u6D3B\u52A8\u65E5\u5FD7\u4E0D\u53D7\u5F71\u54CD\u3002\u9690\u85CF\u4EFB\u52A1\u53EF\u4EE5\u64A4\u9500\uFF0C\u6C38\u4E45\u6E05\u7406\u4E0D\u80FD\u64A4\u9500\u3002" : "Old task_id handles will stop working. This does not clear tool activity. Hiding a task is reversible; permanent cleanup is not." },
        confirmLabel
      );
      if (choice !== confirmLabel) return bridge.getStatus();
      return bridge.clearTasks(requests, allowAttention);
    }),
    vscode22.commands.registerCommand("opencode.bridge.interruptStaleTasksConfirmed", async (input) => {
      await bridgeReady;
      const args = input && typeof input === "object" && !Array.isArray(input) ? input : {};
      const requests = args.requests;
      if (!Array.isArray(requests) || requests.length < 1 || requests.length > BRIDGE_TASK_CLEANUP_BATCH_LIMIT || requests.some(
        (item) => !item || typeof item !== "object" || typeof item.id !== "string" || !item.id || !Number.isSafeInteger(item.revision)
      )) throw new Error("Select a bounded list of stale tasks to mark interrupted.");
      const seen = new Set(requests.map((item) => item.id));
      if (seen.size !== requests.length) throw new Error("Duplicate tasks cannot be interrupted.");
      const tasks = bridge.getStatus().tasks ?? [];
      for (const request of requests) {
        const task = tasks.find((candidate) => candidate.id === request.id && candidate.revision === request.revision);
        if (!task) throw new Error("A task changed or expired; refresh the task list before confirming interruption.");
        if (task.state !== "awaiting_sync") throw new Error("Only tasks waiting for sync can be marked interrupted here.");
      }
      const zh = vscode22.env.language.startsWith("zh");
      const confirmLabel = zh ? "\u4EC5\u672C\u673A\u6807\u8BB0\u4E3A\u4E2D\u65AD" : "Mark interrupted locally";
      const choice = await vscode22.window.showWarningMessage(
        zh ? `\u5C06 ${requests.length} \u9879\u7B49\u5F85\u540C\u6B65\u7684\u4EFB\u52A1\u6807\u8BB0\u4E3A\u201C\u5DF2\u4E2D\u65AD\u201D\uFF1F` : `Mark ${requests.length} waiting-for-sync task(s) interrupted?`,
        {
          modal: true,
          detail: zh ? "\u8FD9\u53EA\u4F1A\u7ED3\u675F OpenCode \u672C\u673A\u4EFB\u52A1\u8DDF\u8E2A\u5E76\u4FDD\u7559\u5386\u53F2\u8BB0\u5F55\uFF1B\u4E0D\u4F1A\u505C\u6B62\u3001\u53D6\u6D88\u6216\u63A7\u5236\u5916\u90E8 AI/MCP \u5BA2\u6237\u7AEF\u6B63\u5728\u8FDB\u884C\u7684\u5DE5\u4F5C\u3002\u5916\u90E8\u6267\u884C\u53EF\u80FD\u7EE7\u7EED\uFF0C\u8BF7\u5230\u76F8\u5E94\u5916\u90E8\u5BA2\u6237\u7AEF\u6838\u5B9E\u3002" : "This only ends OpenCode local task tracking and preserves its history. It does not stop, cancel, or control work running in the external AI/MCP client. That execution may continue; verify it in the external client."
        },
        confirmLabel
      );
      if (choice !== confirmLabel) return bridge.getStatus();
      return bridge.interruptStaleTasks(requests);
    }),
    vscode22.commands.registerCommand("opencode.bridge.installCloudflared", async () => {
      await bridgeReady;
      const status = await vscode22.window.withProgress({
        location: vscode22.ProgressLocation.Notification,
        title: bridgeNoticeText("installingCloudflared"),
        cancellable: false
      }, () => bridge.installCloudflared());
      void vscode22.window.showInformationMessage(bridgeNoticeText("cloudflaredReady", status.tunnelVersion ?? bridgeNoticeText("installed")));
      return status;
    }),
    vscode22.commands.registerCommand("opencode.bridge.rotateEndpoint", async () => {
      await bridgeReady;
      return bridge.rotateEndpoint();
    }),
    vscode22.commands.registerCommand("opencode.bridge.customTools.toggle", async (name) => {
      await bridgeReady;
      return bridge.toggleCustomTool(typeof name === "string" && name.trim() ? name.trim() : void 0);
    }),
    vscode22.commands.registerCommand("opencode.bridge.customTools.delete", async (name) => {
      await bridgeReady;
      return bridge.deleteCustomTool(typeof name === "string" && name.trim() ? name.trim() : void 0);
    }),
    // Deprecated since 0.7.7: kept for old callers, Skill folders or supported archives, same pipeline as opencode.skills.import.
    vscode22.commands.registerCommand("opencode.bridge.skills.import", async (source) => {
      await bridgeReady;
      if (typeof source !== "string" || !source.trim()) throw new Error("Skill source must be a non-empty path.");
      output2.appendLine("[skills] opencode.bridge.skills.import is deprecated; use opencode.skills.import (Skill folders or supported archives).");
      return bridge.importSkill(source.trim());
    }),
    vscode22.commands.registerCommand("opencode.bridge.skills.diagnose", async () => {
      await bridgeReady;
      return bridge.diagnoseSkills();
    }),
    vscode22.commands.registerCommand("opencode.bridge.skills.generateRunner", async (name) => {
      await bridgeReady;
      if (typeof name !== "string" || !name.trim()) throw new Error("Skill name must be a non-empty string.");
      return bridge.generateSkillRunner(name.trim());
    })
  );
  output2.appendLine("[extension] native Chat participant registered: opencode.agent");
  output2.appendLine("[extension] native Language Model provider registered: opencode");
  output2.appendLine("[extension] first-party modes registered: OpenCode Ask, OpenCode Plan, OpenCode Code");
  output2.appendLine("[extension] IDE tool broker registered: list_directory, run_command, get_command_output, cancel_command, send_command_input, get_diagnostics, lsp");
  output2.appendLine("[extension] Bridge registered: Streamable HTTP MCP + Cloudflare Quick/Named Tunnel + ngrok + report_progress");
  if (vscode22.workspace.getConfiguration("opencode.bridge").get("persistentMode", false)) {
    output2.appendLine("[extension] persistent Bridge mode enabled; opening Chat and waiting for the rendered view to start Bridge");
    setTimeout(() => {
      void vscode22.commands.executeCommand("workbench.action.chat.open").then(void 0, (error2) => {
        output2.appendLine(`[extension] failed to open Chat for persistent Bridge mode: ${error2 instanceof Error ? error2.message : String(error2)}`);
      });
    }, 100);
  }
  if (process.env.OPENCODE_TERMINAL_SMOKE === "1") {
    void ideToolBroker.runTerminalSmokeTest().then(
      (result) => output2.appendLine(`[terminal-smoke] PASS
${result}`),
      (error2) => output2.appendLine(`[terminal-smoke] FAIL ${error2 instanceof Error ? error2.stack ?? error2.message : String(error2)}`)
    );
  }
  if (process.env.OPENCODE_LSP_SMOKE === "1") {
    void ideToolBroker.runLspSmokeTest().then(
      (result) => output2.appendLine(`[lsp-smoke] PASS
${result}`),
      (error2) => output2.appendLine(`[lsp-smoke] FAIL ${error2 instanceof Error ? error2.stack ?? error2.message : String(error2)}`)
    );
  }
  const bridgeSmokeDomain = process.env.OPENCODE_BRIDGE_SMOKE_DOMAIN?.trim();
  const bridgeLocalSmoke = process.env.OPENCODE_BRIDGE_SMOKE_LOCAL === "1";
  if (bridgeSmokeDomain || bridgeLocalSmoke) {
    void bridgeReady.then(() => bridgeLocalSmoke ? bridge.startLocalSmoke() : bridge.start(bridgeSmokeDomain)).then(
      (status) => output2.appendLine(`[bridge-smoke] READY local=${status.localUrl ?? "missing"} public=${status.publicUrl ?? "missing"}`),
      (error2) => output2.appendLine(`[bridge-smoke] FAIL ${error2 instanceof Error ? error2.stack ?? error2.message : String(error2)}`)
    );
  }
  void vscode22.chat.getCustomAgents(customAgentDiscoveryCts.token).then(
    (agents) => output2.appendLine(`[extension] custom agents discovered: ${agents.map((agent) => agent.name).join(", ") || "none"}`),
    (error2) => output2.appendLine(`[extension] custom agent discovery failed: ${error2 instanceof Error ? error2.message : String(error2)}`)
  );
}

async function deactivate() {
  const hub = activeWorkspaceHub;
  activeWorkspaceHub = void 0;
  const bridge = activeBridge;
  activeBridge = void 0;
  let firstError;
  try {
    if (bridge) await bridge.disposeAsync();
  } catch (error2) {
    firstError = error2;
  }
  try {
    if (hub) await hub.disposeAsync();
  } catch (error2) {
    firstError ??= error2;
  }
  if (firstError) throw firstError;
}

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
export { bridgeWorkspaceUri, bridgeDiffSnippet, activate, deactivate, extension_exports, vscode22, activeBridge, activeWorkspaceHub };
