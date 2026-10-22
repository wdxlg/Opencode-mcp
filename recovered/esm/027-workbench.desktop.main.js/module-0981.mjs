// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chat.ts
import { createDecorator } from "./module-0077.mjs";
import { CHAT_PROVIDER_ID } from "./module-0970.mjs";
import { RawContextKey } from "./module-0089.mjs";


// src/vs/workbench/contrib/chat/browser/chat.ts
var IChatWidgetService = createDecorator("chatWidgetService");

var ChatViewPaneTarget = /* @__PURE__ */ Symbol("ChatViewPaneTarget");

var IQuickChatService = createDecorator("quickChatService");

var IChatAccessibilityService = createDecorator("chatAccessibilityService");

function isIChatViewViewContext(context2) {
  return typeof context2.viewId === "string";
}

function isIChatResourceViewContext(context2) {
  return !isIChatViewViewContext(context2);
}

var CHAT_WIDGET_VIEW_STATE_CACHE_LIMIT = 100;

var OPENCODE_CHAT_PARTICIPANT_ID = "opencode.agent";

function isOpenCodeChatWidget(widget) {
  return widget.lockedAgentId === OPENCODE_CHAT_PARTICIPANT_ID || widget.lastSelectedAgent?.id === OPENCODE_CHAT_PARTICIPANT_ID;
}

function setModelPreservingInputTypedWhileLoading(widget, inputBeforeLoad, setModel) {
  const typedWhileLoading = widget.getInput();
  setModel();
  if (typedWhileLoading && typedWhileLoading !== inputBeforeLoad && !widget.getInput()) {
    widget.setInput(typedWhileLoading);
  }
}

var IChatCodeBlockContextProviderService = createDecorator("chatCodeBlockContextProviderService");

var ChatViewId = `workbench.panel.chat.view.${CHAT_PROVIDER_ID}`;

var ChatViewContainerId = "workbench.panel.chat";

var HasInstalledAgentPluginsContext = new RawContextKey("hasInstalledAgentPlugins", false);

var InstalledAgentPluginsViewId = "workbench.views.agentPlugins.installed";

var IChatPasteTargetService = createDecorator("chatPasteTargetService");

var UpdateAgentPluginsCommandId = "workbench.agentPlugins.checkForUpdates";

var ForceUpdateAgentPluginsCommandId = "workbench.agentPlugins.forceUpdate";

var RefreshAgentPluginMarketplacesCommandId = "workbench.agentPlugins.refreshMarketplaces";

var UpdatingAgentPluginsContext = new RawContextKey("agentPluginsUpdating", false);
export { isIChatViewViewContext, isIChatResourceViewContext, isOpenCodeChatWidget, setModelPreservingInputTypedWhileLoading, IChatWidgetService, ChatViewPaneTarget, IQuickChatService, IChatAccessibilityService, CHAT_WIDGET_VIEW_STATE_CACHE_LIMIT, OPENCODE_CHAT_PARTICIPANT_ID, IChatCodeBlockContextProviderService, ChatViewId, ChatViewContainerId, HasInstalledAgentPluginsContext, InstalledAgentPluginsViewId, IChatPasteTargetService, UpdateAgentPluginsCommandId, ForceUpdateAgentPluginsCommandId, RefreshAgentPluginMarketplacesCommandId, UpdatingAgentPluginsContext };
