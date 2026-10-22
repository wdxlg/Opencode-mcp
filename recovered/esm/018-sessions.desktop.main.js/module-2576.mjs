// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugOverviewView.ts
import { $, append, clearNode, hide, show } from "./module-0075.mjs";
import { safeIntl } from "./module-0120.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { BreadcrumbsWidget } from "./module-2008.mjs";
import { Codicon } from "./module-0085.mjs";
import { defaultBreadcrumbsWidgetStyles, defaultButtonStyles } from "./module-0513.mjs";
import { TextBreadcrumbItem, setupBreadcrumbKeyboardNavigation } from "./module-2570.mjs";
import { LocalChatSessionUri, getChatSessionType } from "./module-0962.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Button } from "./module-0546.mjs";
import { IChatSessionsService, localChatSessionType } from "./module-0961.mjs";
import { isChatDebugLoggingEnabledForSession, renderChatDebugLoggingDisabledMessage } from "./module-2574.mjs";
import { isAgentHostSession } from "./module-2573.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatDebugService } from "./module-1455.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IPreferencesService } from "./module-1293.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugOverviewView.ts
var $69 = $;

var numberFormatter = safeIntl.NumberFormat();

var aicFormatter = safeIntl.NumberFormat(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

var NANO_AIU_PER_AIC = 1e9;

var ChatDebugOverviewView = class extends Disposable {
  constructor(parent, chatService, chatDebugService, chatWidgetService, chatSessionsService, configurationService, preferencesService) {
    super();
    this.chatService = chatService;
    this.chatDebugService = chatDebugService;
    this.chatWidgetService = chatWidgetService;
    this.chatSessionsService = chatSessionsService;
    this.configurationService = configurationService;
    this.preferencesService = preferencesService;
    this._onNavigate = this._register(new Emitter());
    this.onNavigate = this._onNavigate.event;
    this.loadDisposables = this._register(new DisposableStore());
    this.isFirstLoad = true;
    this.container = append(parent, $69(".chat-debug-overview"));
    hide(this.container);
    this.refreshScheduler = this._register(new RunOnceScheduler(() => this.doRefresh(), 100));
    const breadcrumbContainer = append(this.container, $69(".chat-debug-breadcrumb"));
    this.breadcrumbWidget = this._register(new BreadcrumbsWidget(breadcrumbContainer, 3, void 0, Codicon.chevronRight, defaultBreadcrumbsWidgetStyles));
    this._register(setupBreadcrumbKeyboardNavigation(breadcrumbContainer, this.breadcrumbWidget));
    this._register(this.breadcrumbWidget.onDidSelectItem((e4) => {
      if (e4.type === "select" && e4.item instanceof TextBreadcrumbItem) {
        this.breadcrumbWidget.setSelection(void 0);
        const items = this.breadcrumbWidget.getItems();
        const idx = items.indexOf(e4.item);
        if (idx === 0) {
          this._onNavigate.fire("home" /* Home */);
        }
      }
    }));
    this.content = append(this.container, $69(".chat-debug-overview-content"));
  }
  setSession(sessionResource) {
    this.currentSessionResource = sessionResource;
    this.isFirstLoad = true;
  }
  show() {
    show(this.container);
    this.load();
  }
  hide() {
    hide(this.container);
    this.refreshScheduler.cancel();
  }
  refresh() {
    if (this.container.style.display !== "none") {
      if (!this.refreshScheduler.isScheduled()) {
        this.refreshScheduler.schedule();
      }
    }
  }
  doRefresh() {
    if (this.metricsContainer && this.currentSessionResource) {
      clearNode(this.metricsContainer);
      const events = this.chatDebugService.getEvents(this.currentSessionResource);
      this.renderMetricsContent(this.metricsContainer, events);
      this.isFirstLoad = false;
    } else {
      this.load();
    }
  }
  updateBreadcrumb() {
    if (!this.currentSessionResource) {
      return;
    }
    const sessionTitle = this.chatService.getSessionTitle(this.currentSessionResource) || LocalChatSessionUri.parseLocalSessionId(this.currentSessionResource) || this.currentSessionResource.toString();
    this.breadcrumbWidget.setItems([
      new TextBreadcrumbItem(localize(10735, null), true),
      new TextBreadcrumbItem(sessionTitle)
    ]);
  }
  load() {
    clearNode(this.content);
    this.loadDisposables.clear();
    this.updateBreadcrumb();
    if (!this.currentSessionResource) {
      return;
    }
    const sessionTitle = this.chatService.getSessionTitle(this.currentSessionResource) || LocalChatSessionUri.parseLocalSessionId(this.currentSessionResource) || this.currentSessionResource.toString();
    const titleRow = append(this.content, $69(".chat-debug-overview-title-row"));
    const titleEl = append(titleRow, $69("h2.chat-debug-overview-title"));
    append(titleEl, $69(`span${ThemeIcon.asCSSSelector(Codicon.comment)}`));
    titleEl.append(sessionTitle);
    const titleActions = append(titleRow, $69(".chat-debug-overview-title-actions"));
    const revealSessionBtn = this.loadDisposables.add(new Button(titleActions, { ariaLabel: localize(10729, null), title: localize(10729, null) }));
    revealSessionBtn.element.classList.add("chat-debug-icon-button");
    revealSessionBtn.icon = Codicon.goToFile;
    this.loadDisposables.add(revealSessionBtn.onDidClick(() => {
      if (this.currentSessionResource) {
        this.chatWidgetService.openSession(this.currentSessionResource);
      }
    }));
    this.renderSessionDetails(this.currentSessionResource);
    const events = this.chatDebugService.getEvents(this.currentSessionResource);
    this.renderDerivedOverview(events, this.isFirstLoad && events.length === 0);
    this.isFirstLoad = false;
  }
  renderSessionDetails(sessionUri) {
    const model = this.chatService.getSession(sessionUri);
    const details = [];
    const sessionType = getChatSessionType(sessionUri);
    const contribution = this.chatSessionsService.getChatSessionContribution(sessionType);
    const sessionTypeName = contribution?.displayName || (sessionType === localChatSessionType ? localize(10731, null) : sessionType);
    details.push({ label: localize(10714, null), value: sessionTypeName });
    if (model) {
      const locationLabel = this.getLocationLabel(model.initialLocation);
      details.push({ label: localize(10713, null), value: locationLabel });
      const inProgress = model.requestInProgress.get();
      const statusLabel = inProgress ? localize(10733, null) : localize(10732, null);
      details.push({ label: localize(10715, null), value: statusLabel });
      const timing = model.timing;
      details.push({ label: localize(10711, null), value: new Date(timing.created).toLocaleString() });
      if (timing.lastRequestEnded) {
        details.push({ label: localize(10712, null), value: new Date(timing.lastRequestEnded).toLocaleString() });
      } else if (timing.lastRequestStarted) {
        details.push({ label: localize(10712, null), value: new Date(timing.lastRequestStarted).toLocaleString() });
      }
    }
    if (details.length > 0) {
      const section = append(this.content, $69(".chat-debug-overview-section"));
      append(section, $69("h3.chat-debug-overview-section-label", void 0, localize(10730, null)));
      const detailsGrid = append(section, $69(".chat-debug-overview-details"));
      for (const detail2 of details) {
        const row = append(detailsGrid, $69(".chat-debug-overview-detail-row"));
        append(row, $69("span.chat-debug-overview-detail-label", void 0, detail2.label));
        append(row, $69("span.chat-debug-overview-detail-value", void 0, detail2.value));
      }
    }
  }
  getLocationLabel(location2) {
    switch (location2) {
      case "panel" /* Chat */:
        return localize(10717, null);
      case "terminal" /* Terminal */:
        return localize(10720, null);
      case "notebook" /* Notebook */:
        return localize(10719, null);
      case "editor" /* EditorInline */:
        return localize(10718, null);
      default:
        return String(location2);
    }
  }
  renderDerivedOverview(events, showShimmer) {
    if (!isChatDebugLoggingEnabledForSession(this.configurationService, this.currentSessionResource)) {
      this.metricsContainer = void 0;
      const disabledSection = append(this.content, $69(".chat-debug-overview-section"));
      renderChatDebugLoggingDisabledMessage(disabledSection, this.currentSessionResource, this.preferencesService, this.loadDisposables);
    } else {
      const metricsSection = append(this.content, $69(".chat-debug-overview-section"));
      append(metricsSection, $69("h3.chat-debug-overview-section-label", void 0, localize(10734, null)));
      this.metricsContainer = append(metricsSection, $69(".chat-debug-overview-metrics"));
      if (showShimmer) {
        this.renderMetricsShimmer(this.metricsContainer);
      } else {
        this.renderMetricsContent(this.metricsContainer, events);
      }
    }
    const actionsSection = append(this.content, $69(".chat-debug-overview-section"));
    append(actionsSection, $69("h3.chat-debug-overview-section-label", void 0, localize(10716, null)));
    const row = append(actionsSection, $69(".chat-debug-overview-actions"));
    const viewLogsBtn = this.loadDisposables.add(new Button(row, { ...defaultButtonStyles, secondary: true, supportIcons: true, title: localize(10736, null) }));
    viewLogsBtn.element.classList.add("chat-debug-overview-action-button");
    viewLogsBtn.label = `$(list-flat) ${localize(10736, null)}`;
    this.loadDisposables.add(viewLogsBtn.onDidClick(() => {
      this._onNavigate.fire("logs" /* Logs */);
    }));
    const flowChartBtn = this.loadDisposables.add(new Button(row, { ...defaultButtonStyles, secondary: true, supportIcons: true, title: localize(10708, null) }));
    flowChartBtn.element.classList.add("chat-debug-overview-action-button");
    flowChartBtn.label = `$(type-hierarchy) ${localize(10708, null)}`;
    this.loadDisposables.add(flowChartBtn.onDidClick(() => {
      this._onNavigate.fire("flowchart" /* FlowChart */);
    }));
    const cacheBtn = this.loadDisposables.add(new Button(row, { ...defaultButtonStyles, secondary: true, supportIcons: true, title: localize(10710, null) }));
    cacheBtn.element.classList.add("chat-debug-overview-action-button");
    cacheBtn.label = `$(database) ${localize(10710, null)}`;
    this.loadDisposables.add(cacheBtn.onDidClick(() => {
      this._onNavigate.fire("cache" /* CacheExplorer */);
    }));
    if (isAgentHostSession(this.currentSessionResource)) {
      const wireLogBtn = this.loadDisposables.add(new Button(row, { ...defaultButtonStyles, secondary: true, supportIcons: true, title: localize(10709, null) }));
      wireLogBtn.element.classList.add("chat-debug-overview-action-button");
      wireLogBtn.label = `$(arrow-swap) ${localize(10709, null)}`;
      this.loadDisposables.add(wireLogBtn.onDidClick(() => {
        this._onNavigate.fire("wirelog" /* WireLog */);
      }));
    }
  }
  renderMetricsShimmer(container2) {
    const placeholderLabels = [
      localize(10723, null),
      localize(10724, null),
      localize(10726, null),
      localize(10727, null),
      localize(10725, null),
      localize(10728, null),
      localize(10722, null)
    ];
    for (const label3 of placeholderLabels) {
      const card = append(container2, $69(".chat-debug-overview-metric-card"));
      append(card, $69("div.chat-debug-overview-metric-label", void 0, label3));
      const valueEl = append(card, $69("div.chat-debug-overview-metric-value"));
      const shimmer = append(valueEl, $69("span.chat-debug-overview-metric-shimmer"));
      shimmer.textContent = "\xA0";
    }
  }
  renderMetricsContent(container2, events) {
    const modelTurns = events.filter((e4) => e4.kind === "modelTurn");
    const toolCalls = events.filter((e4) => e4.kind === "toolCall");
    const errors = events.filter(
      (e4) => e4.kind === "generic" && e4.level === 3 /* Error */ || e4.kind === "toolCall" && e4.result === "error"
    );
    const fmt2 = numberFormatter.value;
    const totalInputTokens = modelTurns.reduce((sum2, e4) => sum2 + (e4.inputTokens ?? 0), 0);
    const totalOutputTokens = modelTurns.reduce((sum2, e4) => sum2 + (e4.outputTokens ?? 0), 0);
    const totalCachedTokens = modelTurns.reduce((sum2, e4) => sum2 + (e4.cachedTokens ?? 0), 0);
    const totalTokens = modelTurns.reduce((sum2, e4) => sum2 + (e4.totalTokens ?? 0), 0);
    const totalCopilotUsageNanoAiu = modelTurns.reduce((sum2, e4) => sum2 + (e4.copilotUsageNanoAiu ?? 0), 0);
    const metrics = [
      { label: localize(10723, null), value: fmt2.format(modelTurns.length) },
      { label: localize(10724, null), value: fmt2.format(toolCalls.length) },
      { label: localize(10726, null), value: fmt2.format(totalInputTokens) },
      { label: localize(10727, null), value: fmt2.format(totalOutputTokens) },
      { label: localize(10725, null), value: fmt2.format(totalCachedTokens) },
      { label: localize(10728, null), value: fmt2.format(totalTokens) },
      { label: localize(10722, null), value: fmt2.format(errors.length) }
    ];
    if (totalCopilotUsageNanoAiu > 0) {
      const aic = totalCopilotUsageNanoAiu / NANO_AIU_PER_AIC;
      metrics.push({ label: localize(10721, null), value: aicFormatter.value.format(aic) });
    }
    for (const metric of metrics) {
      const card = append(container2, $69(".chat-debug-overview-metric-card"));
      append(card, $69("div.chat-debug-overview-metric-label", void 0, metric.label));
      append(card, $69("div.chat-debug-overview-metric-value", void 0, metric.value));
    }
  }
};

ChatDebugOverviewView = __decorateClass([
  __decorateParam(1, IChatService),
  __decorateParam(2, IChatDebugService),
  __decorateParam(3, IChatWidgetService),
  __decorateParam(4, IChatSessionsService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IPreferencesService)
], ChatDebugOverviewView);
export { $69, numberFormatter, aicFormatter, NANO_AIU_PER_AIC, ChatDebugOverviewView };
