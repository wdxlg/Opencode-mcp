// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugHomeView.ts
import { $, EventType, addDisposableListener, append, clearNode, getActiveElement } from "./module-0075.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { AGENT_DEBUG_LOG_FILE_LOGGING_ENABLED_SETTING, AgentHostAgentDebugLogEnabledSettingId } from "./module-0985.mjs";
import { LocalChatSessionUri, getChatSessionType, isUntitledChatSession } from "./module-0961.mjs";
import { localize } from "./module-0001.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { isUUID } from "./module-0190.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0972.mjs";
import { IChatDebugService } from "./module-1456.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IAgentSessionsService } from "./module-1464.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IPreferencesService } from "./module-1294.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugHomeView.ts
var $69 = $;

var PAGE_SIZE = 5;

var ChatDebugHomeView = class extends Disposable {
  constructor(parent, chatService, chatDebugService, chatWidgetService, agentSessionsService, configurationService, preferencesService) {
    super();
    this.chatService = chatService;
    this.chatDebugService = chatDebugService;
    this.chatWidgetService = chatWidgetService;
    this.agentSessionsService = agentSessionsService;
    this.configurationService = configurationService;
    this.preferencesService = preferencesService;
    this._onNavigateToSession = this._register(new Emitter());
    this.onNavigateToSession = this._onNavigateToSession.event;
    this.renderDisposables = this._register(new DisposableStore());
    /** Number of sessions currently visible (grows on "Show More"). */
    this._visibleCount = PAGE_SIZE;
    /** Tracks the number of known sessions so we can detect new ones. */
    this._lastKnownSessionCount = 0;
    this.container = append(parent, $69(".chat-debug-home"));
    this.scrollContent = append(this.container, $69("div.chat-debug-home-content"));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(AGENT_DEBUG_LOG_FILE_LOGGING_ENABLED_SETTING) || e.affectsConfiguration(AgentHostAgentDebugLogEnabledSettingId)) {
        this.render();
      }
    }));
    this._register(this.chatDebugService.onDidAddEvent((e) => {
      const currentCount = this.chatDebugService.getSessionResources().length;
      if (currentCount !== this._lastKnownSessionCount) {
        this._lastKnownSessionCount = currentCount;
        if (this.container.style.display !== "none") {
          this.render();
        }
      }
    }));
    this._register(this.chatDebugService.onDidChangeAvailableSessionResources(() => {
      if (this.container.style.display !== "none") {
        this.render();
      }
    }));
  }
  show() {
    this.container.style.display = "";
    this.render();
  }
  hide() {
    this.container.style.display = "none";
  }
  render() {
    const isEnabled = this._isDebugEnabled();
    this._lastKnownSessionCount = this.chatDebugService.getSessionResources().length;
    const sessionResources = isEnabled ? this._getFilteredSessionResources(this.chatDebugService.getAvailableSessionResources()) : [];
    this._renderWithSessions(sessionResources);
  }
  /**
   * The panel is enabled when either local file logging or agent-host (Copilot
   * CLI) debug logging is on; each provider self-gates on its own setting, so
   * the aggregated session list only contains the sources that are enabled.
   */
  _isDebugEnabled() {
    return this.configurationService.getValue(AGENT_DEBUG_LOG_FILE_LOGGING_ENABLED_SETTING) || this.configurationService.getValue(AgentHostAgentDebugLogEnabledSettingId);
  }
  _getFilteredSessionResources(resources) {
    const cliSessionTypes = /* @__PURE__ */ new Set(["copilotcli"]);
    return [...resources].filter((r2) => !cliSessionTypes.has(getChatSessionType(r2)) || !isUntitledChatSession(r2));
  }
  _renderWithSessions(sessionResources) {
    clearNode(this.scrollContent);
    this.renderDisposables.clear();
    append(this.scrollContent, $69("h2.chat-debug-home-title", void 0, localize(10637, null)));
    const isEnabled = this._isDebugEnabled();
    if (!isEnabled) {
      append(this.scrollContent, $69(
        "p.chat-debug-home-subtitle",
        void 0,
        localize(10628, null)
      ));
      const enableButton = this.renderDisposables.add(new Button(this.scrollContent, { ...defaultButtonStyles, secondary: true }));
      enableButton.element.style.width = "auto";
      enableButton.label = localize(10633, null);
      this.renderDisposables.add(enableButton.onDidClick(() => {
        this.preferencesService.openSettings({ jsonEditor: false, query: "agentDebugLog" });
      }));
      return;
    }
    const activeWidget = this.chatWidgetService.lastFocusedWidget;
    const activeSessionResource = activeWidget?.viewModel?.sessionResource;
    const bubbleToTop = (resource) => {
      if (!resource) {
        return;
      }
      const idx = sessionResources.findIndex((r2) => r2.toString() === resource.toString());
      if (idx > 0) {
        sessionResources.splice(idx, 1);
        sessionResources.unshift(resource);
      }
    };
    bubbleToTop(this._lastOpenedSessionResource);
    bubbleToTop(activeSessionResource);
    append(this.scrollContent, $69(
      "p.chat-debug-home-subtitle",
      void 0,
      sessionResources.length > 0 ? localize(10629, null) : localize(10632, null)
    ));
    if (sessionResources.length > 0) {
      const visibleSessions = sessionResources.slice(0, this._visibleCount);
      const sessionList = append(this.scrollContent, $69(".chat-debug-home-session-list"));
      sessionList.setAttribute("role", "list");
      sessionList.setAttribute("aria-label", localize(10635, null));
      const items = [];
      for (const sessionResource of visibleSessions) {
        const agentSession = this.agentSessionsService.model.getSession(sessionResource);
        const rawTitle = agentSession?.label ?? this.chatService.getSessionTitle(sessionResource);
        const importedTitle = this.chatDebugService.getImportedSessionTitle(sessionResource);
        const historicalTitle = this.chatDebugService.getHistoricalSessionTitle(sessionResource);
        let sessionTitle;
        if (rawTitle && !isUUID(rawTitle)) {
          sessionTitle = rawTitle;
        } else if (historicalTitle) {
          sessionTitle = historicalTitle;
        } else if (importedTitle) {
          sessionTitle = localize(10630, null, importedTitle);
        } else if (LocalChatSessionUri.isLocalSession(sessionResource)) {
          sessionTitle = localize(10631, null);
        } else if (getChatSessionType(sessionResource) === "copilotcli") {
          const pathId = sessionResource.path.replace(/^\//, "").split("-")[0];
          const shortId = pathId || sessionResource.authority || sessionResource.toString();
          sessionTitle = localize(10627, null, shortId);
        } else {
          sessionTitle = localize(10631, null);
        }
        const isActive2 = activeSessionResource !== void 0 && sessionResource.toString() === activeSessionResource.toString();
        const item = append(sessionList, $69("button.chat-debug-home-session-item"));
        item.setAttribute("role", "listitem");
        if (isActive2) {
          item.classList.add("chat-debug-home-session-item-active");
          item.setAttribute("aria-current", "true");
        }
        append(item, $69(`span${ThemeIcon.asCSSSelector(Codicon.comment)}`));
        const titleSpan = append(item, $69("span.chat-debug-home-session-item-title"));
        titleSpan.textContent = sessionTitle;
        const ariaLabel = isActive2 ? localize(10634, null, sessionTitle) : sessionTitle;
        item.setAttribute("aria-label", ariaLabel);
        if (isActive2) {
          append(item, $69("span.chat-debug-home-session-badge", void 0, localize(10626, null)));
        }
        this.renderDisposables.add(addDisposableListener(item, EventType.CLICK, () => {
          this._lastOpenedSessionResource = sessionResource;
          this._onNavigateToSession.fire(sessionResource);
        }));
        items.push(item);
      }
      if (sessionResources.length > this._visibleCount) {
        const remaining = sessionResources.length - this._visibleCount;
        const showMoreButton = this.renderDisposables.add(new Button(this.scrollContent, { ...defaultButtonStyles, secondary: true }));
        showMoreButton.element.classList.add("chat-debug-home-show-more");
        showMoreButton.label = localize(10636, null, remaining);
        this.renderDisposables.add(showMoreButton.onDidClick(() => {
          this._visibleCount += PAGE_SIZE;
          this.render();
        }));
      }
      this.renderDisposables.add(addDisposableListener(sessionList, EventType.KEY_DOWN, (e) => {
        if (items.length === 0) {
          return;
        }
        const focused = getActiveElement();
        const idx = items.indexOf(focused);
        if (idx === -1) {
          return;
        }
        let nextIdx;
        switch (e.key) {
          case "ArrowDown":
            nextIdx = idx + 1 < items.length ? idx + 1 : idx;
            break;
          case "ArrowUp":
            nextIdx = idx - 1 >= 0 ? idx - 1 : idx;
            break;
          case "Home":
            nextIdx = 0;
            break;
          case "End":
            nextIdx = items.length - 1;
            break;
        }
        if (nextIdx !== void 0) {
          e.preventDefault();
          items[nextIdx].focus();
        }
      }));
    }
  }
};

ChatDebugHomeView = __decorateClass([
  __decorateParam(1, IChatService),
  __decorateParam(2, IChatDebugService),
  __decorateParam(3, IChatWidgetService),
  __decorateParam(4, IAgentSessionsService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IPreferencesService)
], ChatDebugHomeView);
export { $69, PAGE_SIZE, ChatDebugHomeView };
