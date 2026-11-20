// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatDeveloperActions.ts
import { URI, isUriComponents } from "./module-0032.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { OpenAgentHostStateFileAction } from "./module-2557.mjs";
import { IChatService } from "./module-0972.mjs";
import { IAgentSessionsService } from "./module-1464.mjs";
import { fromNow } from "./module-0120.mjs";
import { localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { Categories } from "./module-0847.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAgentHostConnectionsService } from "./module-0959.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatDeveloperActions.ts
function uriReplacer(_key, value2) {
  if (URI.isUri(value2)) {
    return value2.toString();
  }
  if (isUriComponents(value2)) {
    return URI.from(value2).toString();
  }
  return value2;
}

function registerChatDeveloperActions() {
  registerAction2(LogChatInputHistoryAction);
  registerAction2(LogChatIndexAction);
  registerAction2(InspectChatModelAction);
  registerAction2(InspectChatModelReferencesAction);
  registerAction2(InspectAgentHostSubscriptionsAction);
  registerAction2(ClearRecentlyUsedLanguageModelsAction);
  registerAction2(OpenAgentHostStateFileAction);
}

function formatChatModelReferenceInspection(accessor) {
  const chatService = accessor.get(IChatService);
  const agentSessionsService = accessor.get(IAgentSessionsService);
  const debugInfo = chatService.getChatModelReferenceDebugInfo();
  const referencedModels = debugInfo.models.filter((model) => model.referenceCount > 0);
  const pendingEditModels = debugInfo.models.filter((model) => model.hasPendingEdits);
  const pendingDisposalModels = debugInfo.models.filter((model) => model.pendingDisposal);
  let output = "# Chat Model References\n\n";
  output += `- Live models: ${debugInfo.totalModels}
`;
  output += `- Live references: ${debugInfo.totalReferences}
`;
  output += `- Models with active references: ${referencedModels.length}
`;
  output += `- Models with pending edits: ${pendingEditModels.length}
`;
  output += `- Models pending disposal: ${pendingDisposalModels.length}

`;
  output += "Created by shows who loaded or created the model. Holders shows who currently keeps the model alive.\n\n";
  if (!debugInfo.models.length) {
    output += "No live chat models.\n";
    return output;
  }
  for (const model of debugInfo.models) {
    const liveModel = chatService.getSession(model.sessionResource);
    const agentSession = agentSessionsService.getSession(model.sessionResource);
    const archived = agentSession ? agentSession.isArchived() : "unknown";
    const age = liveModel ? fromNow(liveModel.timing.created, true, true, true) : "unknown";
    output += `## ${model.title || "(untitled)"}

`;
    output += `- Session: ${model.sessionResource.toString()}
`;
    output += `- Created by: ${model.createdBy}
`;
    output += `- Archived: ${archived}
`;
    output += `- Age: ${age}
`;
    output += `- Initial location: ${model.initialLocation}
`;
    output += `- Imported: ${model.isImported}
`;
    output += `- Pending edits: ${model.hasPendingEdits}
`;
    output += `- Background keep-alive enabled: ${model.willKeepAlive}
`;
    output += `- Pending disposal: ${model.pendingDisposal}
`;
    output += `- Reference count: ${model.referenceCount}
`;
    if (model.holders.length) {
      output += "- Holders:\n";
      for (const holder of model.holders) {
        output += `  - ${holder.holder}: ${holder.count}
`;
      }
    } else {
      output += "- Holders: none\n";
    }
    output += "\n";
  }
  return output;
}

var LogChatInputHistoryAction = class _LogChatInputHistoryAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.logInputHistory";
  }
  constructor() {
    super({
      id: _LogChatInputHistoryAction.ID,
      title: localize2(8637, "Log Chat Input History"),
      icon: Codicon.attach,
      category: Categories.Developer,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor, ...args2) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    chatWidgetService.lastFocusedWidget?.logInputHistory();
  }
};

var LogChatIndexAction = class _LogChatIndexAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.logChatIndex";
  }
  constructor() {
    super({
      id: _LogChatIndexAction.ID,
      title: localize2(8636, "Log Chat Index"),
      icon: Codicon.attach,
      category: Categories.Developer,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor, ...args2) {
    const chatService = accessor.get(IChatService);
    chatService.logChatIndex();
  }
};

var InspectChatModelAction = class _InspectChatModelAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.inspectChatModel";
  }
  constructor() {
    super({
      id: _InspectChatModelAction.ID,
      title: localize2(8634, "Inspect Chat Model"),
      icon: Codicon.inspect,
      category: Categories.Developer,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor, ...args2) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const editorService = accessor.get(IEditorService);
    const widget = chatWidgetService.lastFocusedWidget;
    if (!widget?.viewModel) {
      return;
    }
    const model = widget.viewModel.model;
    const modelData = model.toJSON();
    let output = "# Chat Model Inspection\n\n";
    const requests = modelData.requests;
    if (requests && requests.length > 0) {
      const latestRequest = requests[requests.length - 1];
      if (latestRequest.response) {
        output += "## Latest Response\n\n";
        output += "```json\n" + JSON.stringify(latestRequest.response, uriReplacer, 2) + "\n```\n\n";
      }
    }
    output += "## Full Chat Model\n\n";
    output += "```json\n" + JSON.stringify(modelData, uriReplacer, 2) + "\n```\n";
    await editorService.openEditor({
      resource: void 0,
      contents: output,
      languageId: "markdown",
      options: {
        pinned: true
      }
    });
  }
};

var InspectChatModelReferencesAction = class _InspectChatModelReferencesAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.inspectChatModelReferences";
  }
  constructor() {
    super({
      id: _InspectChatModelReferencesAction.ID,
      title: localize2(8635, "Inspect Chat Model References"),
      icon: Codicon.inspect,
      category: Categories.Developer,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor) {
    const instantiationService = accessor.get(IInstantiationService);
    const editorService = accessor.get(IEditorService);
    await editorService.openEditor({
      resource: void 0,
      contents: instantiationService.invokeFunction(formatChatModelReferenceInspection),
      languageId: "markdown",
      options: {
        pinned: true
      }
    });
  }
};

function subscriptionKindLabel(kind) {
  switch (kind) {
    case 0 /* Root */:
      return "root";
    case 1 /* Session */:
      return "session";
    case 3 /* Terminal */:
      return "terminal";
    case 4 /* Changeset */:
      return "changeset";
    default:
      return `unknown(${kind})`;
  }
}

function escapeMarkdownTableCell(value2) {
  return value2.replace(/\r?\n/g, "<br>").replace(/\|/g, "\\|");
}

function formatConnectionSubscriptions(label3, details, connection) {
  let output = `## ${label3}

`;
  output += `- ${details}
`;
  if (!connection) {
    output += "- Not connected.\n\n";
    return output;
  }
  const root = connection.rootState.value;
  if (root === void 0) {
    output += "- Root state: pending (no snapshot yet)\n";
  } else if (root instanceof Error) {
    output += `- Root state: error (${root.message})
`;
  } else {
    const agents = root.agents?.map((a) => a.displayName).join(", ") || "none";
    output += `- Root state: agents=[${agents}], activeSessions=${root.activeSessions ?? 0}, terminals=${root.terminals?.length ?? 0}
`;
  }
  const subscriptions = connection.getActiveSubscriptions();
  output += `- Active subscriptions: ${subscriptions.length}

`;
  if (subscriptions.length) {
    const sorted = [...subscriptions].sort((a, b) => a.resource.toString().localeCompare(b.resource.toString()));
    output += "| Resource | Kind | Refs | Holders | Status |\n";
    output += "| --- | --- | --- | --- | --- |\n";
    for (const subscription of sorted) {
      const holders = subscription.holders.length ? subscription.holders.map((h3) => h3.count > 1 ? `${h3.owner} (${h3.count})` : h3.owner).join(", ") : "(none)";
      const cells = [
        subscription.resource.toString(),
        subscriptionKindLabel(subscription.kind),
        String(subscription.refCount),
        holders,
        subscription.status
      ].map(escapeMarkdownTableCell);
      output += `| ${cells.join(" | ")} |
`;
    }
    output += "\n";
  }
  return output;
}

function formatAgentHostSubscriptionsInspection(accessor) {
  const connectionsService = accessor.get(IAgentHostConnectionsService);
  const connections = connectionsService.connections;
  const remoteCount = connections.filter((c) => !c.isAmbient).length;
  let output = "# Agent Host Subscriptions\n\n";
  output += `- Connections: ${connections.length} (1 ambient, ${remoteCount} remote)
`;
  output += "Lists every resource each connected agent host is currently subscribed to. The always-live root state is summarized separately from the per-resource subscription table.\n\n";
  for (const info of connections) {
    const heading2 = info.isAmbient ? "Ambient agent host" : `Remote: ${info.name}`;
    const details = [
      ...info.address ? [`address: ${info.address}`] : [],
      `clientId: ${info.connection?.clientId || "(none)"}`
    ].join(" \xB7 ");
    output += formatConnectionSubscriptions(heading2, details, info.connection);
  }
  return output;
}

var InspectAgentHostSubscriptionsAction = class _InspectAgentHostSubscriptionsAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.inspectAgentHostSubscriptions";
  }
  constructor() {
    super({
      id: _InspectAgentHostSubscriptionsAction.ID,
      title: localize2(8633, "Inspect Agent Host Subscriptions"),
      icon: Codicon.inspect,
      category: Categories.Developer,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor) {
    const instantiationService = accessor.get(IInstantiationService);
    const editorService = accessor.get(IEditorService);
    await editorService.openEditor({
      resource: void 0,
      contents: instantiationService.invokeFunction(formatAgentHostSubscriptionsInspection),
      languageId: "markdown",
      options: {
        pinned: true
      }
    });
  }
};

var ClearRecentlyUsedLanguageModelsAction = class _ClearRecentlyUsedLanguageModelsAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.clearRecentlyUsedLanguageModels";
  }
  constructor() {
    super({
      id: _ClearRecentlyUsedLanguageModelsAction.ID,
      title: localize2(8632, "Clear Recently Used Language Models"),
      category: Categories.Developer,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  run(accessor) {
    accessor.get(ILanguageModelsService).clearRecentlyUsedList();
  }
};

export { uriReplacer, registerChatDeveloperActions, formatChatModelReferenceInspection, subscriptionKindLabel, escapeMarkdownTableCell, formatConnectionSubscriptions, formatAgentHostSubscriptionsInspection, LogChatInputHistoryAction, LogChatIndexAction, InspectChatModelAction, InspectChatModelReferencesAction, InspectAgentHostSubscriptionsAction, ClearRecentlyUsedLanguageModelsAction };
