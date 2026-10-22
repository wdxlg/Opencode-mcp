// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionHoverWidget.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { $, append, clearNode } from "./module-0075.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { renderIcon } from "./module-0467.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { SESSION_META_EHCLI_ADOPTABLE_KEY } from "./module-1007.mjs";
import { ChatViewModel } from "./module-0978.mjs";
import { ChatListWidget } from "./module-2376.mjs";
import { AgentSessionProviders, getAgentSessionProvider, getAgentSessionProviderIcon, getAgentSessionProviderName } from "./module-0982.mjs";
import { fromNow, getDurationString } from "./module-0120.mjs";
import { autorun } from "./module-0052.mjs";
import { getAgentChangesSummary, hasValidDiff } from "./module-1463.mjs";
import { localize } from "./module-0001.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0972.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IAgentSessionsService } from "./module-1464.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionHoverWidget.ts
var HEADER_HEIGHT2 = 60;

var CHAT_LIST_HEIGHT = 240;

var CHAT_HOVER_WIDTH = 500;

var AgentSessionHoverWidget = class extends Disposable {
  constructor(session, chatService, instantiationService, chatWidgetService, agentSessionsService) {
    super();
    this.session = session;
    this.chatService = chatService;
    this.instantiationService = instantiationService;
    this.chatWidgetService = chatWidgetService;
    this.agentSessionsService = agentSessionsService;
    this.domNode = $(".agent-session-hover.interactive-session");
    this.domNode.style.width = `${CHAT_HOVER_WIDTH}px`;
    this.domNode.style.height = `${HEADER_HEIGHT2 + CHAT_LIST_HEIGHT}px`;
    this.domNode.style.overflow = "hidden";
    this.cts = new CancellationTokenSource();
    this._register(toDisposable(() => this.cts.cancel()));
    this.buildHeader();
    this.contentElement = append(this.domNode, $(".agent-session-hover-content"));
    this.loadingElement = append(this.contentElement, $(".agent-session-hover-loading"));
    append(this.loadingElement, renderIcon(ThemeIcon.modify(Codicon.loading, "spin")));
    this.renderScheduler = this._register(new RunOnceScheduler(() => this.render(), 200));
  }
  onRendered() {
    this.modelRef ??= this.loadModel();
    if (this.listWidget) {
      this.listWidget.layout(CHAT_LIST_HEIGHT, CHAT_HOVER_WIDTH);
      this.listWidget.refresh();
      return;
    }
    this.renderScheduler.schedule();
  }
  onHidden() {
    this.renderScheduler.cancel();
  }
  async loadModel() {
    if (this.session.metadata?.[SESSION_META_EHCLI_ADOPTABLE_KEY] === true) {
      this.loadingElement.remove();
      const tooltip = this.buildFallbackTooltip(this.session);
      this.domNode.textContent = typeof tooltip === "string" ? tooltip : tooltip.value;
      return;
    }
    const modelRef = await this.chatService.acquireOrLoadSession(this.session.resource, "panel" /* Chat */, this.cts.token, "AgentSessionHoverWidget#loadModel");
    if (this._store.isDisposed) {
      modelRef?.dispose();
      return;
    }
    if (!modelRef) {
      this.loadingElement.remove();
      const tooltip = this.buildFallbackTooltip(this.session);
      this.domNode.textContent = typeof tooltip === "string" ? tooltip : tooltip.value;
      return;
    }
    this._register(modelRef);
    return modelRef.object;
  }
  async render() {
    this.modelRef ??= this.loadModel();
    const model = await this.modelRef;
    if (!model || this._store.isDisposed || !this.domNode.isConnected) {
      return;
    }
    if (this.listWidget) {
      this.listWidget.layout(CHAT_LIST_HEIGHT, CHAT_HOVER_WIDTH);
      this.listWidget.refresh();
      return;
    }
    this.loadingElement.remove();
    const viewModel = this._register(this.instantiationService.createInstance(
      ChatViewModel,
      model,
      { maxVisibleItems: 2 }
    ));
    const container3 = append(this.contentElement, $(".interactive-list"));
    const listWidget = this._register(this.instantiationService.createInstance(
      ChatListWidget,
      container3,
      {
        rendererOptions: {
          renderStyle: "compact",
          noHeader: true,
          editable: false
        },
        currentChatMode: () => "ask" /* Ask */
      }
    ));
    this.listWidget = listWidget;
    listWidget.layout(CHAT_LIST_HEIGHT, CHAT_HOVER_WIDTH);
    listWidget.setScrollLock(true);
    listWidget.setViewModel(viewModel);
    listWidget.refresh();
    const viewModelScheduler = this._register(new RunOnceScheduler(() => {
      if (this.domNode.isConnected) {
        listWidget.refresh();
      }
    }, 500));
    this._register(viewModel.onDidChange(() => {
      if (this.domNode.isConnected && !viewModelScheduler.isScheduled()) {
        viewModelScheduler.schedule();
      }
    }));
    this._register(listWidget.onDidClickFollowup(async (followup) => {
      const widget = await this.chatWidgetService.openSession(model.sessionResource);
      if (widget) {
        widget.acceptInput(followup.message);
      }
    }));
  }
  buildHeader() {
    const session = this.session;
    const header2 = append(this.domNode, $(".agent-session-hover-header"));
    const titleRow = append(header2, $(".agent-session-hover-title"));
    append(titleRow, $("span", void 0, session.label));
    const detailsRow = append(header2, $(".agent-session-hover-details"));
    const providerType = getAgentSessionProvider(session.providerType);
    const provider = providerType ?? AgentSessionProviders.Local;
    const providerIcon = getAgentSessionProviderIcon(provider);
    append(detailsRow, renderIcon(providerIcon));
    append(detailsRow, $("span", void 0, getAgentSessionProviderName(provider)));
    append(detailsRow, $("span.separator", void 0, "\u2022"));
    if (session.timing.lastRequestEnded && session.timing.lastRequestStarted) {
      const duration = this.toDuration(session.timing.lastRequestStarted, session.timing.lastRequestEnded, true);
      if (duration) {
        append(detailsRow, $("span", void 0, duration));
      }
    } else {
      const startTime = session.timing.lastRequestStarted ?? session.timing.created;
      append(detailsRow, $("span", void 0, fromNow(startTime, true, true)));
    }
    const diffSeparator = append(detailsRow, $("span.separator", void 0, "\u2022"));
    const diffContainer = append(detailsRow, $(".agent-session-hover-diff"));
    diffSeparator.style.display = "none";
    diffContainer.style.display = "none";
    const observed = this.agentSessionsService.model.observeSession(session.resource);
    this._register(autorun((reader) => {
      const latest = observed.read(reader) ?? session;
      const diff4 = getAgentChangesSummary(latest.changes);
      clearNode(diffContainer);
      if (diff4 && hasValidDiff(latest.changes)) {
        diffSeparator.style.display = "";
        diffContainer.style.display = "";
        if (diff4.files > 0) {
          append(diffContainer, $("span", void 0, diff4.files === 1 ? localize(9065, null) : localize(9066, null, diff4.files)));
        }
        if (diff4.insertions > 0) {
          append(diffContainer, $("span.insertions", void 0, `+${diff4.insertions}`));
        }
        if (diff4.deletions > 0) {
          append(diffContainer, $("span.deletions", void 0, `-${diff4.deletions}`));
        }
      } else {
        diffSeparator.style.display = "none";
        diffContainer.style.display = "none";
      }
    }));
    if (session.status !== 1 /* Completed */) {
      append(detailsRow, $("span.separator", void 0, "\u2022"));
      append(detailsRow, $("span", void 0, this.toStatusLabel(session.status)));
    }
    if (session.isArchived()) {
      append(detailsRow, $("span.separator", void 0, "\u2022"));
      append(detailsRow, renderIcon(Codicon.archive));
      append(detailsRow, $("span", void 0, localize(9064, null)));
    }
  }
  buildFallbackTooltip(session) {
    const lines = [];
    lines.push(`**${session.label}**`);
    if (session.tooltip) {
      const tooltip = typeof session.tooltip === "string" ? session.tooltip : session.tooltip.value;
      lines.push(tooltip);
    } else {
      if (session.description) {
        const description = typeof session.description === "string" ? session.description : session.description.value;
        lines.push(description);
      }
      if (session.badge) {
        const badge = typeof session.badge === "string" ? session.badge : session.badge.value;
        lines.push(badge);
      }
    }
    const details = [];
    const providerType = getAgentSessionProvider(session.providerType);
    const provider = providerType ?? AgentSessionProviders.Local;
    const providerIcon = getAgentSessionProviderIcon(provider);
    const providerName = getAgentSessionProviderName(provider);
    let timeLabel;
    if (session.timing.lastRequestEnded && session.timing.lastRequestStarted) {
      const duration = this.toDuration(session.timing.lastRequestStarted, session.timing.lastRequestEnded, true);
      timeLabel = duration ?? fromNow(session.timing.lastRequestStarted, true, true);
    } else {
      const startTime = session.timing.lastRequestStarted ?? session.timing.created;
      timeLabel = fromNow(startTime, true, true);
    }
    details.push(`$(${providerIcon.id}) ${providerName} \u2022 ${timeLabel}`);
    const diff4 = getAgentChangesSummary(session.changes);
    if (diff4 && hasValidDiff(session.changes)) {
      const diffParts = [];
      if (diff4.files > 0) {
        diffParts.push(diff4.files === 1 ? localize(9065, null) : localize(9066, null, diff4.files));
      }
      if (diff4.insertions > 0) {
        diffParts.push(`+${diff4.insertions}`);
      }
      if (diff4.deletions > 0) {
        diffParts.push(`-${diff4.deletions}`);
      }
      if (diffParts.length > 0) {
        details.push(diffParts.join(" "));
      }
    }
    if (session.status !== 1 /* Completed */) {
      details.push(this.toStatusLabel(session.status));
    }
    lines.push(details.join(" \u2022 "));
    if (session.isArchived()) {
      lines.push(`$(archive) ${localize(9064, null)}`);
    }
    return new MarkdownString(lines.join("\n\n"), { supportThemeIcons: true });
  }
  toDuration(startTime, endTime, useFullTimeWords) {
    const elapsed = Math.round((endTime - startTime) / 1e3) * 1e3;
    if (elapsed < 1e3) {
      return void 0;
    }
    return getDurationString(elapsed, useFullTimeWords);
  }
  toStatusLabel(status2) {
    let statusLabel;
    switch (status2) {
      case 3 /* NeedsInput */:
        statusLabel = localize(9063, null);
        break;
      case 2 /* InProgress */:
        statusLabel = localize(9062, null);
        break;
      case 0 /* Failed */:
        statusLabel = localize(9061, null);
        break;
      default:
        statusLabel = localize(9060, null);
    }
    return statusLabel;
  }
};

AgentSessionHoverWidget = __decorateClass([
  __decorateParam(1, IChatService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IChatWidgetService),
  __decorateParam(4, IAgentSessionsService)
], AgentSessionHoverWidget);
export { HEADER_HEIGHT2, CHAT_LIST_HEIGHT, CHAT_HOVER_WIDTH, AgentSessionHoverWidget };
