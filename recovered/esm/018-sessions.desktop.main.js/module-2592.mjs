// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugCacheExplorerView.ts
import { $, EventType, addDisposableListener, append, clearNode, hide, show } from "./module-0075.mjs";
import { safeIntl } from "./module-0120.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { BreadcrumbsWidget } from "./module-2008.mjs";
import { Codicon } from "./module-0085.mjs";
import { defaultBreadcrumbsWidgetStyles } from "./module-0513.mjs";
import { TextBreadcrumbItem, setupBreadcrumbKeyboardNavigation } from "./module-2570.mjs";
import { Sash } from "./module-0496.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { LocalChatSessionUri } from "./module-0962.mjs";
import { localize } from "./module-0001.mjs";
import { appendSystemDrift, appendToolsDrift, diffPromptSignature, parseInputMessages } from "./module-2590.mjs";
import { analyzeStringDivergence, buildSessionCacheReport, cacheBreakCategoryLabel, categorizeCacheBreak, computeCacheInsights, describeStringDivergence, maxInsightSeverity, primaryInsight } from "./module-2591.mjs";
import { Separator, toAction } from "./module-0082.mjs";
import { equals4 } from "./module-0098.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatDebugService } from "./module-1455.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { linesDiffComputers } from "./module-0196.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugCacheExplorerView.ts
var $79 = $;

var numberFormatter6 = safeIntl.NumberFormat();

var timeFormatter = safeIntl.DateTimeFormat(void 0, { hour: "numeric", minute: "2-digit", second: "2-digit" });

var RAIL_DEFAULT_WIDTH = 280;

var RAIL_MIN_WIDTH = 180;

var RAIL_MAX_WIDTH = 600;

var CURRENT_CONTINUATION_DELTA_COMPONENT = "current continuation delta";

var TTL_GAP_MINUTES = 5;

var DEFAULT_AGENT_KEY = "panel/editAgent";

var ChatDebugCacheExplorerView = class extends Disposable {
  constructor(parent, chatService, chatDebugService, contextMenuService) {
    super();
    this.chatService = chatService;
    this.chatDebugService = chatDebugService;
    this.contextMenuService = contextMenuService;
    this._onNavigate = this._register(new Emitter());
    this.onNavigate = this._onNavigate.event;
    this.railWidth = RAIL_DEFAULT_WIDTH;
    /** Disposables for the left rail (toolbar + turn rows). Cleared on every full render. */
    this.railDisposables = this._register(new DisposableStore());
    /** Disposables for the right content panel. Cleared whenever the content is re-rendered. */
    this.contentDisposables = this._register(new DisposableStore());
    /** All model turns for the session, before the agent filter is applied. */
    this.allModelTurns = [];
    /** Model turns after the agent filter — the list the rail and diff operate on. */
    this.modelTurns = [];
    /** Selected turn (B side). A is computed as `selectedIndex - 1`. -1 = no explicit selection yet. */
    this.selectedIndex = -1;
    /** Whether the per-chunk signature breakdown table is expanded. */
    this.sigBreakdownOpen = false;
    /** Rail turn-row elements by turn index, for in-place selection updates without rebuilding the rail. */
    this.railRowsByIndex = /* @__PURE__ */ new Map();
    /**
     * Component accordion entries by component name (`system`, `tools`,
     * `messages[i]`), so findings and signature segments can reveal the
     * matching entry. We track both the outer item (for the open/flash
     * classes and scroll target) and the inner header (the focus target).
     * Rebuilt on every content render.
     */
    this.componentElements = /* @__PURE__ */ new Map();
    /** Selection index the breaking component was last auto-expanded for. */
    this.autoOpenedForIndex = -1;
    /**
     * Monotonically-increasing render token. Each call to {@link render}
     * captures the current value, then re-checks it after each await; if a
     * newer render has started in the meantime, the older one bails out
     * before mutating the DOM. Avoids races where a slow model-turn
     * resolve from one session writes into another's panel.
     */
    this.renderToken = 0;
    /** Cache of resolved model-turn content keyed by event id. */
    this.resolvedCache = /* @__PURE__ */ new Map();
    /** Components currently expanded (by component name). */
    this.openComponents = /* @__PURE__ */ new Set(["system", "tools"]);
    /** Rail groups currently collapsed (by group key — the parent event id). */
    this.collapsedGroups = /* @__PURE__ */ new Set();
    this.container = append(parent, $79(".chat-debug-cache"));
    hide(this.container);
    const breadcrumbContainer = append(this.container, $79(".chat-debug-breadcrumb"));
    this.breadcrumbWidget = this._register(new BreadcrumbsWidget(breadcrumbContainer, 3, void 0, Codicon.chevronRight, defaultBreadcrumbsWidgetStyles));
    this._register(setupBreadcrumbKeyboardNavigation(breadcrumbContainer, this.breadcrumbWidget));
    this._register(this.breadcrumbWidget.onDidSelectItem((e4) => {
      if (e4.type === "select" && e4.item instanceof TextBreadcrumbItem) {
        this.breadcrumbWidget.setSelection(void 0);
        const items = this.breadcrumbWidget.getItems();
        const idx = items.indexOf(e4.item);
        if (idx === 0) {
          this._onNavigate.fire("home" /* Home */);
        } else if (idx === 1) {
          this._onNavigate.fire("overview" /* Overview */);
        }
      }
    }));
    const body = append(this.container, $79(".chat-debug-cache-body"));
    this.rail = append(body, $79(".chat-debug-cache-rail"));
    this.rail.style.width = `${this.railWidth}px`;
    this.railToolbar = append(this.rail, $79(".chat-debug-cache-rail-toolbar"));
    this.railList = append(this.rail, $79(".chat-debug-cache-rail-list"));
    this.content = append(body, $79(".chat-debug-cache-content"));
    this.sash = this._register(new Sash(body, {
      getVerticalSashLeft: () => this.railWidth
    }, { orientation: 0 /* VERTICAL */ }));
    this.sash.state = 3 /* Enabled */;
    let sashStartWidth;
    this._register(this.sash.onDidStart(() => sashStartWidth = this.railWidth));
    this._register(this.sash.onDidEnd(() => {
      sashStartWidth = void 0;
      this.sash.layout();
    }));
    this._register(this.sash.onDidChange((e4) => {
      if (sashStartWidth === void 0) {
        return;
      }
      const delta2 = e4.currentX - e4.startX;
      const next = Math.max(RAIL_MIN_WIDTH, Math.min(RAIL_MAX_WIDTH, sashStartWidth + delta2));
      this.railWidth = next;
      this.rail.style.width = `${next}px`;
      this.sash.layout();
    }));
    this.refreshScheduler = this._register(new RunOnceScheduler(() => this.render(), 50));
  }
  setSession(sessionResource) {
    if (!this.currentSessionResource || this.currentSessionResource.toString() !== sessionResource.toString()) {
      this.resolvedCache.clear();
      this.collapsedGroups.clear();
      this.openComponents.clear();
      this.openComponents.add("system");
      this.openComponents.add("tools");
      this.selectedIndex = -1;
      this.selectedAgents = void 0;
      this.pendingSelectTurn = void 0;
      this.sigBreakdownOpen = false;
      this.autoOpenedForIndex = -1;
      this.sessionReportCache = void 0;
    }
    this.currentSessionResource = sessionResource;
  }
  show() {
    show(this.container);
    this.render();
  }
  hide() {
    hide(this.container);
    this.refreshScheduler.cancel();
  }
  refresh() {
    if (this.container.style.display !== "none" && !this.refreshScheduler.isScheduled()) {
      this.refreshScheduler.schedule();
    }
  }
  updateBreadcrumb() {
    if (!this.currentSessionResource) {
      return;
    }
    const sessionTitle = this.chatService.getSessionTitle(this.currentSessionResource) || LocalChatSessionUri.parseLocalSessionId(this.currentSessionResource) || this.currentSessionResource.toString();
    this.breadcrumbWidget.setItems([
      new TextBreadcrumbItem(localize(10487, null), true),
      new TextBreadcrumbItem(sessionTitle, true),
      new TextBreadcrumbItem(localize(10485, null))
    ]);
  }
  async render() {
    const token = ++this.renderToken;
    const isCurrent = () => token === this.renderToken;
    const railScrollTop = this.railList.scrollTop;
    this.updateBreadcrumb();
    this.railDisposables.clear();
    clearNode(this.railToolbar);
    clearNode(this.railList);
    this.railRowsByIndex.clear();
    if (!this.currentSessionResource) {
      this.contentDisposables.clear();
      clearNode(this.content);
      return;
    }
    const events = this.chatDebugService.getEvents(this.currentSessionResource);
    this.allModelTurns = events.filter((e4) => e4.kind === "modelTurn");
    const userMessages = events.filter((e4) => e4.kind === "userMessage");
    if (this.allModelTurns.length === 0) {
      this.contentDisposables.clear();
      clearNode(this.content);
      const empty = append(this.content, $79(".chat-debug-cache-empty"));
      empty.textContent = localize(10414, null);
      return;
    }
    const agentCounts = computeAgentCounts(this.allModelTurns);
    if (this.selectedAgents === void 0) {
      this.selectedAgents = defaultAgentSelection(agentCounts);
    }
    this.renderRailToolbar(agentCounts);
    this.modelTurns = this.allModelTurns.filter((t2) => this.selectedAgents.has(agentKey(t2)));
    if (this.modelTurns.length === 0) {
      this.contentDisposables.clear();
      clearNode(this.content);
      const empty = append(this.content, $79(".chat-debug-cache-empty"));
      empty.textContent = localize(10415, null);
      return;
    }
    if (this.pendingSelectTurn) {
      this.selectedIndex = resolveFilteredSelectionIndex(this.modelTurns, this.pendingSelectTurn);
      this.pendingSelectTurn = void 0;
    }
    if (this.selectedIndex < 0 || this.selectedIndex >= this.modelTurns.length) {
      this.selectedIndex = this.modelTurns.length - 1;
    }
    this.renderRail(buildTurnGroups(this.modelTurns, userMessages));
    this.railList.scrollTop = railScrollTop;
    await this.renderContentInner(token, isCurrent);
  }
  /**
   * Render the right-hand content panel (summary, signature, options,
   * components) for the current selection. Split out of {@link render} so a
   * selection change can refresh just the content without rebuilding the
   * rail \u2014 which is what keeps keyboard focus and scroll position stable
   * while navigating turns.
   *
   * @param preserveScroll keep the content scroll position (used for zoom
   * and breakdown toggles where the selection is unchanged).
   */
  async renderContentInner(token, isCurrent, preserveScroll = false) {
    const prevScroll = preserveScroll ? this.content.scrollTop : 0;
    const bEvent = this.modelTurns[this.selectedIndex];
    const aEvent = this.selectedIndex > 0 ? this.modelTurns[this.selectedIndex - 1] : void 0;
    const report = await this.ensureSessionReport();
    if (!isCurrent()) {
      return;
    }
    if (!aEvent) {
      const b2 = await this.resolveSide(bEvent);
      if (!isCurrent()) {
        return;
      }
      this.contentDisposables.clear();
      clearNode(this.content);
      this.renderTitleRow();
      this.renderSingleSummary(b2);
      if (preserveScroll) {
        this.content.scrollTop = prevScroll;
      }
      return;
    }
    const [a, b] = await Promise.all([this.resolveSide(aEvent), this.resolveSide(bEvent)]);
    if (!isCurrent()) {
      return;
    }
    this.contentDisposables.clear();
    clearNode(this.content);
    this.renderTitleRow();
    if (report && report.pairCount > 0) {
      this.renderSessionHealth(append(this.content, $79(".chat-debug-cache-session-health")), report);
    }
    const hasSignatureData = !!(a.system || a.tools || a.inputMessages.length || b.system || b.tools || b.inputMessages.length);
    if (!hasSignatureData) {
      this.renderTokenOnlySummary(a, b);
      if (preserveScroll) {
        this.content.scrollTop = prevScroll;
      }
      return;
    }
    const compareInputMessages = shouldCompareInputMessages(a, b);
    const diff4 = compareInputMessages ? diffPromptSignature(a.inputMessages, b.inputMessages) : diffPromptSignature([], []);
    const drift = appendToolsDrift(appendSystemDrift([...diff4.drift], a.system, b.system), a.tools, b.tools);
    const { insights, optionsDiff } = this.buildInsights(a, b, diff4, compareInputMessages);
    if (this.autoOpenedForIndex !== this.selectedIndex) {
      this.autoOpenedForIndex = this.selectedIndex;
      const target = primaryInsight(insights)?.component;
      if (target) {
        this.openComponents.add(target);
      }
    }
    this.renderSummary(a, b, diff4, compareInputMessages, insights, optionsDiff);
    this.renderSignature(a, b, diff4, compareInputMessages);
    this.renderRequestOptions(a, b);
    this.renderComponents(drift, a, b, compareInputMessages, diff4.counts.identical);
    if (preserveScroll) {
      this.content.scrollTop = prevScroll;
    }
  }
  /**
   * Build the findings list for an A→B pair. Shared between the per-turn
   * content panel and the cross-turn session report.
   */
  buildInsights(a, b, diff4, compareInputMessages) {
    const optionsDiff = computeOptionsDiff(a, b);
    const minutesSincePrevious = (b.event.created.getTime() - a.event.created.getTime()) / 6e4;
    const insights = computeCacheInsights({
      aModel: a.event.model,
      bModel: b.event.model,
      aSystem: a.system,
      bSystem: b.system,
      aTools: a.tools,
      bTools: b.tools,
      aMessages: a.inputMessages,
      bMessages: b.inputMessages,
      diff: diff4,
      optionsDiff: optionsDiff.map((d) => ({ key: d.key, previousLabel: formatOptionValue(d.previous), currentLabel: formatOptionValue(d.current) })),
      hitPct: computeCacheHit(b.event),
      inputTokens: b.event.inputTokens ?? 0,
      minutesSincePrevious: Number.isFinite(minutesSincePrevious) && minutesSincePrevious >= 0 ? minutesSincePrevious : void 0,
      isContinuation: b.requestShape.isContinuation,
      previousIsContinuation: a.requestShape.isContinuation,
      compareInputMessages
    });
    return { insights, optionsDiff };
  }
  /**
   * Memoization key for the session report. The report is scoped to the
   * turns up to (and including) the selected one, so it is stable while
   * later requests stream in. Undefined when there is nothing to report
   * (no session, or fewer than two turns in scope).
   *
   * Every in-scope turn contributes its identity AND token counts to the
   * key — endpoints alone would miss a middle turn replaced in place, and
   * token counts live on the event (not the id-cached resolved content),
   * so a usage update arriving after the first render must invalidate the
   * memoized report or the overall hit rate stays stale.
   */
  sessionReportKey() {
    if (!this.currentSessionResource || this.selectedIndex < 1) {
      return void 0;
    }
    const parts = [
      this.currentSessionResource.toString(),
      [...this.selectedAgents ?? []].sort().join(",")
    ];
    for (let i2 = 0; i2 <= this.selectedIndex; i2++) {
      const turn = this.modelTurns[i2];
      parts.push(`${turn.id ?? turn.created.getTime()}:${turn.inputTokens ?? ""}:${turn.cachedTokens ?? ""}`);
    }
    return parts.join("|");
  }
  /**
   * Run the insights engine over every consecutive turn pair up to the
   * selected turn and aggregate the outcome. Memoized per (session,
   * selection prefix, agent filter) — per-turn resolution is cached in
   * {@link resolvedCache}, so even a cold run is one pass over in-memory
   * events.
   */
  async ensureSessionReport() {
    const key3 = this.sessionReportKey();
    if (key3 === void 0) {
      return void 0;
    }
    const cached = this.sessionReportCache?.key === key3 ? this.sessionReportCache.report : void 0;
    if (cached) {
      return cached;
    }
    const scopedTurns = this.modelTurns.slice(0, this.selectedIndex + 1);
    const sides = await Promise.all(scopedTurns.map((t2) => this.resolveSide(t2)));
    const pairs2 = [];
    for (let i2 = 1; i2 < sides.length; i2++) {
      const a = sides[i2 - 1];
      const b = sides[i2];
      const compare6 = shouldCompareInputMessages(a, b);
      const diff4 = compare6 ? diffPromptSignature(a.inputMessages, b.inputMessages) : diffPromptSignature([], []);
      const { insights } = this.buildInsights(a, b, diff4, compare6);
      const inputTokens = b.event.inputTokens ?? 0;
      const cachedTokens = b.event.cachedTokens ?? 0;
      pairs2.push({
        turnIndex: i2,
        category: categorizeCacheBreak(insights),
        lostTokens: Math.max(0, inputTokens - cachedTokens)
      });
    }
    const turnTokens = scopedTurns.map((t2) => ({ inputTokens: t2.inputTokens ?? 0, cachedTokens: t2.cachedTokens ?? 0 }));
    const report = buildSessionCacheReport(pairs2, turnTokens);
    this.sessionReportCache = { key: key3, report };
    return report;
  }
  /** Render the session-level cache health card from the cross-turn report. */
  renderSessionHealth(container2, report) {
    append(container2, $79(".chat-debug-cache-card-h", void 0, localize(10451, null)));
    if (report.overall) {
      const headline = append(container2, $79(".chat-debug-cache-card-headline"));
      headline.textContent = localize(10455, null, formatCachePct(report.overall.hitPct));
      const sub = append(container2, $79(".chat-debug-cache-card-sub"));
      sub.textContent = localize(
        10456,
        null,
        numberFormatter6.value.format(report.overall.cachedTokens),
        numberFormatter6.value.format(report.overall.inputTokens),
        report.overall.turnCount
      );
    }
    const statsLine = append(container2, $79(".chat-debug-cache-session-health-stats"));
    statsLine.textContent = report.avoidableLostTokens > 0 ? localize(
      10454,
      null,
      report.healthyCount,
      report.pairCount,
      numberFormatter6.value.format(report.avoidableLostTokens)
    ) : localize(
      10453,
      null,
      report.healthyCount,
      report.pairCount
    );
    if (report.byCategory.length > 0) {
      const chips = append(container2, $79(".chat-debug-cache-session-health-chips"));
      for (const stat of report.byCategory) {
        const chip = append(chips, $79(`span.chat-debug-cache-session-health-chip.cause-${stat.category}`));
        append(chip, $79(`span.codicon.codicon-${categoryIcon(stat.category)}`, { "aria-hidden": "true" }));
        append(chip, $79("span", void 0, localize(10452, null, cacheBreakCategoryLabel(stat.category), stat.count, numberFormatter6.value.format(stat.lostTokens))));
      }
    }
    if (report.findings.length > 0) {
      const list2 = append(container2, $79(".chat-debug-cache-findings"));
      for (const finding of report.findings) {
        this.renderFinding(list2, finding);
      }
    }
  }
  /**
   * Select a turn (the B side of the diff) and refresh only the content
   * panel. The rail is updated in place \u2014 just the selected classes move \u2014
   * so clicking or arrowing through turns never rebuilds the list, keeping
   * focus and scroll position stable.
   */
  selectTurn(index2, focusOptions) {
    if (index2 < 0 || index2 >= this.modelTurns.length || index2 === this.selectedIndex) {
      return;
    }
    const prevRow = this.railRowsByIndex.get(this.selectedIndex);
    if (prevRow) {
      prevRow.classList.remove("is-selected");
      prevRow.removeAttribute("aria-current");
    }
    this.selectedIndex = index2;
    const nextRow = this.railRowsByIndex.get(index2);
    if (nextRow) {
      nextRow.classList.add("is-selected");
      nextRow.setAttribute("aria-current", "true");
      if (focusOptions) {
        nextRow.focus(focusOptions);
      }
    }
    const token = ++this.renderToken;
    void this.renderContentInner(token, () => token === this.renderToken);
  }
  /** Move the selection to the previous/next visible turn row (arrow keys). */
  moveSelection(delta2) {
    const indices = [...this.railRowsByIndex.keys()];
    if (indices.length === 0) {
      return;
    }
    const pos = indices.indexOf(this.selectedIndex);
    const nextPos = pos === -1 ? delta2 > 0 ? 0 : indices.length - 1 : Math.min(indices.length - 1, Math.max(0, pos + delta2));
    this.selectTurn(indices[nextPos], { preventScroll: false });
  }
  /**
   * Render the agent filter dropdown at the top of the rail. Hidden when a
   * session only used a single agent (nothing to filter).
   */
  renderRailToolbar(agentCounts) {
    const agents = [...agentCounts.keys()];
    if (agents.length <= 1) {
      hide(this.railToolbar);
      return;
    }
    show(this.railToolbar);
    const selected = this.selectedAgents ?? new Set(agents);
    const selectedCount = agents.filter((a) => selected.has(a)).length;
    const label3 = append(this.railToolbar, $79("span.chat-debug-cache-filter-label"));
    label3.textContent = localize(10391, null);
    const button = append(this.railToolbar, $79("button.chat-debug-cache-filter-button"));
    button.setAttribute("aria-haspopup", "menu");
    const summary = selectedCount === agents.length ? localize(10392, null, agents.length) : selectedCount === 1 ? agents.find((a) => selected.has(a)) ?? "" : localize(10393, null, selectedCount, agents.length);
    const text2 = append(button, $79("span.chat-debug-cache-filter-button-text"));
    text2.textContent = summary;
    text2.title = summary;
    append(button, $79("span.codicon.codicon-chevron-down.chat-debug-cache-filter-chevron", { "aria-hidden": "true" }));
    this.railDisposables.add(addDisposableListener(button, EventType.CLICK, () => this.showAgentFilterMenu(button, agentCounts)));
  }
  showAgentFilterMenu(anchor, agentCounts) {
    const agents = [...agentCounts.keys()].sort((a, b) => a.localeCompare(b));
    const selected = this.selectedAgents ?? new Set(agents);
    const agentActions = agents.map((agent) => toAction({
      id: `chatDebug.cache.agent.${agent}`,
      label: localize(10365, null, agent, agentCounts.get(agent) ?? 0),
      checked: selected.has(agent),
      run: () => this.toggleAgent(agent)
    }));
    const selectAll = toAction({
      id: "chatDebug.cache.agentSelectAll",
      label: localize(10450, null),
      run: () => this.setAgentSelection(new Set(agents))
    });
    this.contextMenuService.showContextMenu({
      getAnchor: () => anchor,
      getActions: () => [selectAll, new Separator(), ...agentActions]
    });
  }
  /** Toggle a single agent on/off. Never leaves the selection empty. */
  toggleAgent(agent) {
    const agents = [...computeAgentCounts(this.allModelTurns).keys()];
    const next = new Set(this.selectedAgents ?? agents);
    if (next.has(agent)) {
      next.delete(agent);
    } else {
      next.add(agent);
    }
    this.setAgentSelection(next.size === 0 ? new Set(agents) : next);
  }
  setAgentSelection(agents) {
    this.pendingSelectTurn = this.modelTurns[this.selectedIndex];
    this.selectedAgents = agents;
    this.render();
  }
  /**
   * Render a collapsible per-chunk breakdown table. Lists every signature
   * chunk (including identical ones the bar may hide) with its exact char
   * count on each side and its share of the current request \u2014 i.e. where the
   * bytes are allocated.
   */
  renderChunkBreakdown(section, rows, totalA, totalB, bTokensPerChar) {
    const wrap = append(section, $79(".chat-debug-cache-sig-breakdown"));
    if (this.sigBreakdownOpen) {
      wrap.classList.add("open");
    }
    const toggle = append(wrap, $79("button.chat-debug-cache-sig-breakdown-toggle"));
    toggle.setAttribute("aria-expanded", this.sigBreakdownOpen ? "true" : "false");
    append(toggle, $79("span.codicon.codicon-chevron-right.chat-debug-cache-sig-breakdown-chev", { "aria-hidden": "true" }));
    append(toggle, $79("span", void 0, localize(10377, null)));
    this.contentDisposables.add(addDisposableListener(toggle, EventType.CLICK, () => {
      this.sigBreakdownOpen = !this.sigBreakdownOpen;
      const token = ++this.renderToken;
      void this.renderContentInner(token, () => token === this.renderToken, true);
    }));
    if (!this.sigBreakdownOpen) {
      return;
    }
    const table = append(wrap, $79(".chat-debug-cache-sig-breakdown-table", { role: "table" }));
    const head = append(table, $79(".chat-debug-cache-sig-breakdown-row.head", { role: "row" }));
    append(head, $79(".cell.idx", { role: "columnheader" }, localize(10379, null)));
    append(head, $79(".cell.chunk", { role: "columnheader" }, localize(10378, null)));
    append(head, $79(".cell.num", { role: "columnheader" }, localize(10423, null)));
    append(head, $79(".cell.num", { role: "columnheader" }, localize(10383, null)));
    append(head, $79(".cell.num", { role: "columnheader" }, localize(10467, null)));
    append(head, $79(".cell.num", { role: "columnheader" }, localize(10420, null)));
    rows.forEach((r2, i2) => {
      const row = append(table, $79(".chat-debug-cache-sig-breakdown-row", { role: "row" }));
      if (r2.drift) {
        row.classList.add("is-drift");
      }
      append(row, $79(".cell.idx", { role: "cell" }, String(i2)));
      const chunk2 = append(row, $79(".cell.chunk", { role: "cell" }));
      append(chunk2, $79(`span.chat-debug-cache-sig-swatch.role-${roleClass(r2.role)}`, { "aria-hidden": "true" }));
      append(chunk2, $79("span.chat-debug-cache-sig-breakdown-chunk-label", void 0, r2.label));
      append(row, $79(".cell.num", { role: "cell" }, r2.aChars !== void 0 ? numberFormatter6.value.format(r2.aChars) : "\u2014"));
      append(row, $79(".cell.num", { role: "cell" }, r2.bChars !== void 0 ? numberFormatter6.value.format(r2.bChars) : "\u2014"));
      const tok = r2.bChars !== void 0 && bTokensPerChar !== void 0 ? Math.round(r2.bChars * bTokensPerChar) : void 0;
      append(row, $79(".cell.num", { role: "cell" }, tok !== void 0 ? numberFormatter6.value.format(tok) : "\u2014"));
      const pct2 = r2.bChars !== void 0 && totalB > 0 ? r2.bChars / totalB * 100 : void 0;
      append(row, $79(".cell.num", { role: "cell" }, pct2 !== void 0 ? localize(10421, null, pct2.toFixed(1)) : "\u2014"));
    });
    const totals = append(table, $79(".chat-debug-cache-sig-breakdown-row.total", { role: "row" }));
    append(totals, $79(".cell.idx", { role: "cell" }, ""));
    append(totals, $79(".cell.chunk", { role: "cell" }, localize(10471, null)));
    append(totals, $79(".cell.num", { role: "cell" }, numberFormatter6.value.format(totalA)));
    append(totals, $79(".cell.num", { role: "cell" }, numberFormatter6.value.format(totalB)));
    append(totals, $79(".cell.num", { role: "cell" }, bTokensPerChar !== void 0 ? numberFormatter6.value.format(Math.round(totalB * bTokensPerChar)) : "\u2014"));
    append(totals, $79(".cell.num", { role: "cell" }, localize(10421, null, "100")));
  }
  async resolveSide(event) {
    let content;
    if (event.id) {
      if (this.resolvedCache.has(event.id)) {
        content = this.resolvedCache.get(event.id);
      } else {
        const r2 = await this.chatDebugService.resolveEvent(event.id);
        content = r2 && r2.kind === "modelTurn" ? r2 : void 0;
        this.resolvedCache.set(event.id, content);
      }
    }
    const system = findSection(content?.sections, "System");
    const tools = findSection(content?.sections, "Tools");
    const requestShapeJson = findSection(content?.sections, "Request Shape");
    const inputMessagesJson = findSection(content?.sections, "Input Messages");
    const rawMessages = parseInputMessages(inputMessagesJson);
    let stripFrom = 0;
    if (system) {
      while (stripFrom < rawMessages.length && rawMessages[stripFrom].role === "system") {
        stripFrom++;
      }
    }
    const inputMessages = stripFrom > 0 ? rawMessages.slice(stripFrom) : rawMessages;
    return { event, content, system, tools, inputMessages, requestShape: describeRequestShape(inputMessages, requestShapeJson) };
  }
  renderRail(groups) {
    const gapBefore = (turnIndex) => {
      if (turnIndex <= 0) {
        return void 0;
      }
      const prev = this.modelTurns[turnIndex - 1];
      const curr = this.modelTurns[turnIndex];
      const prevEnd = prev.created.getTime() + (prev.durationInMillis ?? 0);
      const gapMinutes = (curr.created.getTime() - prevEnd) / 6e4;
      return gapMinutes >= TTL_GAP_MINUTES ? gapMinutes : void 0;
    };
    const appendGapMarker = (gapMinutes) => {
      const gap = append(this.railList, $79(".chat-debug-cache-rail-gap"));
      append(gap, $79("span.codicon.codicon-clock", { "aria-hidden": "true" }));
      append(gap, $79("span", void 0, localize(10425, null, gapMinutes.toFixed(1))));
    };
    for (const group2 of groups) {
      const collapsed2 = this.collapsedGroups.has(group2.key);
      const groupGap = group2.turns.length > 0 ? gapBefore(group2.turns[0].index) : void 0;
      if (groupGap !== void 0) {
        appendGapMarker(groupGap);
      }
      const header2 = append(this.railList, $79(".chat-debug-cache-group-header"));
      if (collapsed2) {
        header2.classList.add("is-collapsed");
      }
      header2.tabIndex = 0;
      header2.setAttribute("role", "button");
      header2.setAttribute("aria-expanded", collapsed2 ? "false" : "true");
      header2.title = localize(10466, null);
      const topLine = append(header2, $79(".chat-debug-cache-group-top"));
      append(topLine, $79("span.chat-debug-cache-group-chev"));
      const headerLine = append(topLine, $79(".chat-debug-cache-group-prompt"));
      headerLine.textContent = group2.userMessage?.message?.trim() || localize(10479, null);
      const countBadge = append(topLine, $79("span.chat-debug-cache-group-count"));
      countBadge.textContent = String(group2.turns.length);
      const headerMeta = append(header2, $79(".chat-debug-cache-group-meta"));
      headerMeta.textContent = group2.key;
      headerMeta.title = localize(10428, null, group2.key);
      const toggle = () => {
        if (this.collapsedGroups.has(group2.key)) {
          this.collapsedGroups.delete(group2.key);
        } else {
          this.collapsedGroups.add(group2.key);
        }
        this.refresh();
      };
      this.railDisposables.add(addDisposableListener(header2, EventType.CLICK, toggle));
      this.railDisposables.add(addDisposableListener(header2, EventType.KEY_DOWN, (e4) => {
        if (e4.key === "Enter" || e4.key === " ") {
          e4.preventDefault();
          toggle();
        }
      }));
      if (collapsed2) {
        continue;
      }
      for (const [posInGroup, { turn: evt, index: i2 }] of group2.turns.entries()) {
        if (posInGroup > 0) {
          const gap = gapBefore(i2);
          if (gap !== void 0) {
            appendGapMarker(gap);
          }
        }
        const row = append(this.railList, $79(".chat-debug-cache-turn"));
        this.railRowsByIndex.set(i2, row);
        if (i2 === this.selectedIndex) {
          row.classList.add("is-selected");
        }
        const idx = append(row, $79(".chat-debug-cache-turn-idx"));
        idx.textContent = String(i2).padStart(2, " ");
        const main2 = append(row, $79(".chat-debug-cache-turn-main"));
        const top2 = append(main2, $79(".chat-debug-cache-turn-top"));
        const source = append(top2, $79("span.chat-debug-cache-turn-source"));
        source.textContent = evt.requestName || localize(10409, null);
        if (evt.inputTokens) {
          const hit = computeCacheHit(evt);
          const hitChip = append(top2, $79(
            "span.chat-debug-cache-turn-chip.chat-debug-cache-turn-hit",
            void 0,
            localize(10399, null, formatCachePctInt(hit))
          ));
          if (hit < 90) {
            hitChip.classList.add("is-bad");
          }
        }
        if (evt.durationInMillis !== void 0) {
          append(top2, $79("span.chat-debug-cache-turn-chip", void 0, localize(10410, null, numberFormatter6.value.format(Math.round(evt.durationInMillis)))));
        }
        append(top2, $79("span.chat-debug-cache-turn-chip", void 0, `[${timeFormatter.value.format(evt.created)}]`));
        if (evt.model) {
          const sub = append(main2, $79(".chat-debug-cache-turn-sub"));
          sub.textContent = evt.model;
        }
        row.title = localize(10478, null);
        row.tabIndex = 0;
        row.setAttribute("role", "button");
        if (i2 === this.selectedIndex) {
          row.setAttribute("aria-current", "true");
        }
        row.setAttribute("aria-label", localize(10477, null, i2, evt.requestName ?? evt.model ?? localize(10409, null)));
        this.railDisposables.add(addDisposableListener(row, EventType.CLICK, () => this.selectTurn(i2, { preventScroll: true })));
        this.railDisposables.add(addDisposableListener(row, EventType.KEY_DOWN, (e4) => {
          if (e4.key === "Enter" || e4.key === " ") {
            e4.preventDefault();
            this.selectTurn(i2, { preventScroll: true });
          } else if (e4.key === "ArrowDown") {
            e4.preventDefault();
            this.moveSelection(1);
          } else if (e4.key === "ArrowUp") {
            e4.preventDefault();
            this.moveSelection(-1);
          }
        }));
      }
    }
  }
  renderTitleRow() {
    const titleRow = append(this.content, $79(".chat-debug-cache-title-row"));
    const title = append(titleRow, $79("h2.chat-debug-cache-title"));
    title.textContent = localize(10486, null);
  }
  renderSummary(a, b, diff4, compareInputMessages, insights, optionsDiff) {
    const row = append(this.content, $79(".chat-debug-cache-summary"));
    row.appendChild(this.renderSideCard(a, localize(10424, null)));
    row.appendChild(this.renderSideCard(b, localize(10441, null)));
    const hit = computeCacheHit(b.event);
    const breakCard = append(row, $79(".chat-debug-cache-card.break"));
    breakCard.classList.add(`is-${maxInsightSeverity(insights)}`);
    append(breakCard, $79(".chat-debug-cache-card-h", void 0, localize(10422, null)));
    const primary = primaryInsight(insights);
    const headline = append(breakCard, $79(".chat-debug-cache-card-headline"));
    headline.textContent = primary ? localize(10401, null, formatCachePct(hit), primary.title) : localize(10400, null, formatCachePct(hit));
    this.appendTokensReusedLine(breakCard, b.event);
    if (b.requestShape.description) {
      const shapeLine = append(breakCard, $79(".chat-debug-cache-perf-line.chat-debug-cache-request-shape-note"));
      shapeLine.textContent = b.requestShape.description;
    }
    append(breakCard, $79(".chat-debug-cache-perf-rule"));
    append(breakCard, $79(".chat-debug-cache-perf-section-h", void 0, localize(10395, null)));
    const list2 = append(breakCard, $79(".chat-debug-cache-findings"));
    if (insights.length === 0) {
      append(list2, $79(".chat-debug-cache-finding-detail", void 0, localize(10411, null)));
    }
    for (const insight of insights) {
      this.renderFinding(list2, insight);
    }
    if (compareInputMessages) {
      append(breakCard, $79(".chat-debug-cache-perf-rule"));
      append(breakCard, $79(".chat-debug-cache-perf-section-h", void 0, localize(10386, null)));
      const summaryLine = append(breakCard, $79(".chat-debug-cache-perf-line"));
      const inPlaceChanged = diff4.counts.contentDrift + diff4.counts.lengthChange;
      const addedInB = diff4.counts.onlyInB;
      const droppedFromA = diff4.counts.onlyInA;
      const parts = [
        localize(10464, null, diff4.counts.identical),
        localize(10462, null, inPlaceChanged)
      ];
      if (addedInB > 0) {
        parts.push(localize(10461, null, addedInB));
      }
      if (droppedFromA > 0) {
        parts.push(localize(10463, null, droppedFromA));
      }
      summaryLine.textContent = parts.join(" \xB7 ");
    }
    if (optionsDiff.length > 0) {
      const optsLine = append(this.content, $79(".chat-debug-cache-options-banner"));
      optsLine.textContent = localize(
        10416,
        null,
        optionsDiff.map((d) => `${d.key} (${formatOptionValue(d.previous)} \u2192 ${formatOptionValue(d.current)})`).join(", ")
      );
    }
  }
  /**
   * Render one finding row: severity icon, title, evidence, and hint.
   * Findings that point at a Components entry render as a button that
   * reveals (scrolls to, expands, and flashes) that component.
   */
  renderFinding(list2, insight) {
    const isLink = !!insight.component;
    const row = append(list2, isLink ? $79("button.chat-debug-cache-finding.is-clickable", { type: "button" }) : $79(".chat-debug-cache-finding"));
    append(row, $79(`span.codicon.codicon-${findingIcon(insight.severity)}.chat-debug-cache-finding-icon.is-${insight.severity}`, { "aria-hidden": "true" }));
    const body = append(row, $79(".chat-debug-cache-finding-body"));
    append(body, $79(".chat-debug-cache-finding-title", void 0, insight.title));
    if (insight.detail) {
      append(body, $79(".chat-debug-cache-finding-detail", void 0, insight.detail));
    }
    if (insight.hint) {
      append(body, $79(".chat-debug-cache-finding-hint", void 0, insight.hint));
    }
    if (isLink) {
      row.title = localize(10394, null, insight.component);
      this.contentDisposables.add(addDisposableListener(row, EventType.CLICK, () => this.revealComponent(insight.component)));
    }
  }
  /**
   * Scroll the named Components entry into view, expand it, and flash it so
   * the eye lands on the right place. No-op when the component isn't part
   * of the current drift list (e.g. an identical message).
   */
  revealComponent(name) {
    const entry = this.componentElements.get(name);
    if (!entry) {
      return;
    }
    const { item, head } = entry;
    if (!this.openComponents.has(name)) {
      this.openComponents.add(name);
      item.classList.add("open");
      head.setAttribute("aria-expanded", "true");
    }
    item.scrollIntoView({ behavior: "smooth", block: "start" });
    item.classList.remove("flash");
    void item.offsetWidth;
    item.classList.add("flash");
    head.focus({ preventScroll: true });
  }
  renderSideCard(data, title) {
    const card = $79(".chat-debug-cache-card");
    if (title) {
      append(card, $79(".chat-debug-cache-card-h", void 0, title));
    }
    this.appendKv(card, localize(10408, null), data.event.model ?? "\u2014");
    this.appendKv(card, localize(10403, null), formatTokens(data.event.inputTokens));
    this.appendKv(card, localize(10373, null), formatTokens(data.event.cachedTokens));
    this.appendKv(card, localize(10374, null), `${formatCachePct(computeCacheHit(data.event))}%`);
    this.appendKv(card, localize(10430, null), data.requestShape.label);
    const startTime = data.event.created;
    const endTime = data.event.durationInMillis !== void 0 ? new Date(startTime.getTime() + data.event.durationInMillis) : void 0;
    this.appendKv(card, localize(10460, null), startTime.toISOString(), true);
    if (endTime) {
      this.appendKv(card, localize(10390, null), endTime.toISOString(), true);
    }
    if (data.event.durationInMillis !== void 0) {
      this.appendKv(card, localize(10388, null), `${numberFormatter6.value.format(Math.round(data.event.durationInMillis))}ms`);
    }
    const ttft = data.content?.timeToFirstTokenInMillis;
    if (ttft !== void 0) {
      this.appendKv(card, localize(10476, null), `${numberFormatter6.value.format(Math.round(ttft))}ms`);
    }
    const requestId = data.content?.requestId ?? data.event.parentEventId ?? data.event.id;
    if (requestId) {
      this.appendKv(card, localize(10427, null), requestId, true);
    }
    return card;
  }
  /**
   * Render the summary cards alone when there is no prior turn to diff
   * against (e.g. the first request in a brand-new session). The OTel-
   * reported cache hit is still useful here — the system prompt and tool
   * definitions can already be cached from previous sessions.
   */
  renderSingleSummary(b) {
    const row = append(this.content, $79(".chat-debug-cache-summary"));
    row.appendChild(this.renderSideCard(b, localize(10441, null)));
    const note = append(row, $79(".chat-debug-cache-card.break"));
    append(note, $79(".chat-debug-cache-card-h", void 0, localize(10396, null)));
    const headline = append(note, $79(".chat-debug-cache-card-headline"));
    headline.textContent = `${formatCachePct(computeCacheHit(b.event))}%`;
    const sub = append(note, $79(".chat-debug-cache-card-sub"));
    sub.textContent = localize(10397, null);
    if (b.requestShape.description) {
      const shapeLine = append(note, $79(".chat-debug-cache-perf-line.chat-debug-cache-request-shape-note"));
      shapeLine.textContent = b.requestShape.description;
    }
  }
  /**
   * Render the token-based cache performance for a request pair when the
   * request-side prompt signature (system, tools, input messages) was not
   * captured for the session — e.g. agent-host (Copilot CLI) sessions, whose
   * log records the model's output but not the request sent to it. The reported
   * cache-hit numbers are still accurate, but there is nothing to diff, so the
   * divergence-based root-cause analysis is deliberately skipped.
   */
  renderTokenOnlySummary(a, b) {
    const row = append(this.content, $79(".chat-debug-cache-summary"));
    row.appendChild(this.renderSideCard(a, localize(10424, null)));
    row.appendChild(this.renderSideCard(b, localize(10441, null)));
    const card = append(row, $79(".chat-debug-cache-card.break"));
    append(card, $79(".chat-debug-cache-card-h", void 0, localize(10422, null)));
    const headline = append(card, $79(".chat-debug-cache-card-headline"));
    headline.textContent = localize(10400, null, formatCachePct(computeCacheHit(b.event)));
    this.appendTokensReusedLine(card, b.event);
    append(card, $79(".chat-debug-cache-perf-rule"));
    const note = append(card, $79(".chat-debug-cache-perf-line.chat-debug-cache-request-shape-note"));
    note.textContent = localize(10412, null);
  }
  /** Appends the "{cached} of {input} input tokens reused" sub-line for a request. */
  appendTokensReusedLine(parent, event) {
    const inputTokens = event.inputTokens ?? 0;
    const cachedTokens = event.cachedTokens ?? 0;
    const lostTokens = Math.max(0, inputTokens - cachedTokens);
    const line = append(parent, $79(".chat-debug-cache-card-sub"));
    line.textContent = lostTokens > 0 && inputTokens > 0 ? localize(
      10469,
      null,
      numberFormatter6.value.format(cachedTokens),
      numberFormatter6.value.format(inputTokens),
      numberFormatter6.value.format(lostTokens),
      formatCachePct(lostTokens / inputTokens * 100)
    ) : localize(
      10468,
      null,
      numberFormatter6.value.format(cachedTokens),
      numberFormatter6.value.format(inputTokens)
    );
  }
  appendKv(parent, key3, value2, copyable = false) {
    const row = append(parent, $79(".chat-debug-cache-kv"));
    append(row, $79("span.k", void 0, key3));
    const valueEl = append(row, $79("span.v", void 0, value2));
    if (copyable) {
      valueEl.classList.add("chat-debug-cache-request-id");
      valueEl.title = value2;
    }
  }
  renderSignature(a, b, diff4, compareInputMessages) {
    const continuationComparison = b.requestShape.isContinuation;
    const section = append(this.content, $79(".chat-debug-cache-section"));
    const heading2 = append(section, $79("h3.chat-debug-cache-section-h"));
    heading2.textContent = continuationComparison ? localize(10481, null) : localize(10457, null);
    if (continuationComparison) {
      const note = append(section, $79(".chat-debug-cache-sig-summary.chat-debug-cache-request-shape-note"));
      note.textContent = localize(10482, null);
    }
    const legend = append(section, $79(".chat-debug-cache-sig-legend"));
    for (const role of ["system", "user", "assistant", "tool", "tool_search", "tools"]) {
      const entry = append(legend, $79("span.chat-debug-cache-sig-legend-entry"));
      append(entry, $79(`span.chat-debug-cache-sig-swatch.role-${roleClass(role)}`));
      append(entry, $("span", void 0, role === "tools" ? localize(10406, null) : role === "tool_search" ? localize(10407, null) : role));
    }
    const driftEntry = append(legend, $79("span.chat-debug-cache-sig-legend-entry"));
    append(driftEntry, $79("span.chat-debug-cache-sig-swatch.role-drift"));
    append(driftEntry, $("span", void 0, localize(10387, null)));
    const groupEntry = append(legend, $79("span.chat-debug-cache-sig-legend-entry"));
    append(groupEntry, $79("span.chat-debug-cache-sig-swatch.role-coalesced"));
    append(groupEntry, $("span", void 0, localize(10398, null)));
    const toSegments = (side, isA) => {
      const segs = [];
      const sys = side.system;
      if (sys) {
        const other = isA ? b.system : a.system;
        segs.push({ role: "system", chars: sys.length, drift: sys !== (other ?? ""), label: "system", synthetic: true, component: "system" });
      }
      const tools = side.tools;
      if (tools) {
        const other = isA ? b.tools : a.tools;
        segs.push({ role: "tools", chars: tools.length, drift: tools !== (other ?? ""), label: "tools", synthetic: true, component: "tools" });
      }
      side.inputMessages.forEach((m, i2) => {
        const tok = diff4.signature[i2];
        const kind = tok?.kind;
        const drift = compareInputMessages && (kind === "contentDrift" /* ContentDrift */ || kind === "lengthChange" /* LengthChange */ || isA && kind === "onlyInA" /* OnlyInA */ || !isA && kind === "onlyInB" /* OnlyInB */);
        segs.push({ role: m.role, chars: m.charLength, drift, label: m.name ? `${m.role}-${m.name}` : m.role, synthetic: false, component: `messages[${i2}]` });
      });
      return segs;
    };
    const aSegs = toSegments(a, true);
    const bSegs = toSegments(b, false);
    const totalA = aSegs.reduce((s, x) => s + x.chars, 0);
    const totalB = bSegs.reduce((s, x) => s + x.chars, 0);
    const max = Math.max(totalA, totalB, 1);
    const breakCharPos = (segs) => {
      if (!diff4.break) {
        return void 0;
      }
      let cumulative = 0;
      let idx = 0;
      for (const s of segs) {
        if (s.synthetic) {
          cumulative += s.chars;
          continue;
        }
        if (idx === diff4.break.index) {
          return cumulative;
        }
        cumulative += s.chars;
        idx++;
      }
      return void 0;
    };
    const aTokensPerChar = a.event.inputTokens && totalA > 0 ? a.event.inputTokens / totalA : void 0;
    const bTokensPerChar = b.event.inputTokens && totalB > 0 ? b.event.inputTokens / totalB : void 0;
    const buildLane = (label3, segs, breakPos, tokensPerChar) => {
      const row = $79(".chat-debug-cache-sig-lane-row");
      append(row, $79(".chat-debug-cache-sig-lane-label", void 0, label3));
      const bar = append(row, $79(".chat-debug-cache-sig-bar"));
      const sideTotal = segs.reduce((sum2, s) => sum2 + s.chars, 0);
      const sizeText = (chars) => tokensPerChar !== void 0 ? localize(10448, null, numberFormatter6.value.format(chars), numberFormatter6.value.format(Math.round(chars * tokensPerChar))) : localize(10447, null, numberFormatter6.value.format(chars));
      const renderSegment = (s) => {
        const seg = append(bar, $79(`span.chat-debug-cache-sig-seg.role-${roleClass(s.role)}`));
        if (s.drift) {
          seg.classList.add("is-drift");
          seg.classList.add("is-clickable");
          seg.setAttribute("role", "button");
          seg.tabIndex = 0;
          const reveal = () => this.revealComponent(s.component);
          this.contentDisposables.add(addDisposableListener(seg, EventType.CLICK, reveal));
          this.contentDisposables.add(addDisposableListener(seg, EventType.KEY_DOWN, (e4) => {
            if (e4.key === "Enter" || e4.key === " ") {
              e4.preventDefault();
              reveal();
            }
          }));
        }
        seg.style.width = `${s.chars / max * 100}%`;
        seg.title = s.drift ? localize(10445, null, s.component, s.label, sizeText(s.chars)) : localize(10449, null, s.component, s.label, sizeText(s.chars));
        if (s.drift) {
          seg.setAttribute("aria-label", seg.title);
        }
        if (s.chars > max * 0.06) {
          seg.textContent = numberFormatter6.value.format(s.chars);
        }
      };
      const renderGroup = (group2) => {
        if (group2.length === 1) {
          renderSegment(group2[0]);
          return;
        }
        const chars = group2.reduce((sum2, s) => sum2 + s.chars, 0);
        const seg = append(bar, $79("span.chat-debug-cache-sig-seg.role-coalesced"));
        seg.style.width = `${chars / max * 100}%`;
        seg.title = localize(10446, null, group2[0].component, group2[group2.length - 1].component, group2.length, sizeText(chars));
      };
      const COALESCE_THRESHOLD = max * 0.015;
      let pending = [];
      for (const s of segs) {
        if (s.chars <= 0) {
          continue;
        }
        if (!s.synthetic && !s.drift && s.chars < COALESCE_THRESHOLD) {
          pending.push(s);
          continue;
        }
        if (pending.length) {
          renderGroup(pending);
          pending = [];
        }
        renderSegment(s);
      }
      if (pending.length) {
        renderGroup(pending);
      }
      if (sideTotal < max) {
        const pad = append(bar, $79("span.chat-debug-cache-sig-seg.role-empty"));
        pad.style.width = `${(max - sideTotal) / max * 100}%`;
      }
      if (breakPos !== void 0 && diff4.break) {
        const line = append(bar, $79(".chat-debug-cache-sig-break"));
        line.style.left = `${breakPos / max * 100}%`;
        line.title = localize(10372, null, diff4.break.index);
      }
      append(row, $79(".chat-debug-cache-sig-lane-total", void 0, localize(10376, null, numberFormatter6.value.format(sideTotal))));
      return row;
    };
    const lanes = append(section, $79(".chat-debug-cache-sig-lanes"));
    lanes.appendChild(buildLane(localize(10405, null), aSegs, breakCharPos(aSegs), aTokensPerChar));
    lanes.appendChild(buildLane(localize(10404, null), bSegs, breakCharPos(bSegs), bTokensPerChar));
    if (compareInputMessages && totalB > 0) {
      let reused = 0;
      let sawDrift = false;
      for (const s of bSegs) {
        if (s.drift) {
          sawDrift = true;
          break;
        }
        reused += s.chars;
      }
      if (!sawDrift) {
        reused = totalB;
      }
      const railRow = append(lanes, $79(".chat-debug-cache-sig-lane-row.reuse"));
      append(railRow, $79(".chat-debug-cache-sig-lane-label", void 0, localize(10443, null)));
      const rail = append(railRow, $79(".chat-debug-cache-sig-reuse-rail"));
      if (reused > 0) {
        const ok2 = append(rail, $79("span.chat-debug-cache-sig-reuse-seg.is-reused"));
        ok2.style.width = `${reused / max * 100}%`;
        ok2.title = localize(10442, null, numberFormatter6.value.format(reused));
      }
      if (totalB - reused > 0) {
        const bad = append(rail, $79("span.chat-debug-cache-sig-reuse-seg.is-recomputed"));
        bad.style.width = `${(totalB - reused) / max * 100}%`;
        bad.title = localize(10426, null, numberFormatter6.value.format(totalB - reused));
      }
      append(railRow, $79(".chat-debug-cache-sig-lane-total", void 0, localize(10444, null, String(Math.floor(reused / totalB * 100)))));
    }
    this.renderChunkBreakdown(section, alignSignatureChunks(aSegs, bSegs), totalA, totalB, bTokensPerChar);
    let shared = 0;
    let firstDrift;
    if (a.system || b.system) {
      if ((a.system ?? "") === (b.system ?? "")) {
        shared += b.system?.length ?? 0;
      } else {
        firstDrift = localize(10465, null);
      }
    }
    if (!firstDrift && (a.tools || b.tools)) {
      if ((a.tools ?? "") === (b.tools ?? "")) {
        shared += b.tools?.length ?? 0;
      } else {
        firstDrift = localize(10470, null);
      }
    }
    if (!firstDrift) {
      for (const tok of diff4.signature) {
        if (tok.kind === "identical" /* Identical */) {
          shared += tok.bCharLength ?? 0;
        } else {
          firstDrift = `messages[${tok.index}]`;
          break;
        }
      }
    }
    const summary = append(section, $79(".chat-debug-cache-sig-summary"));
    if (firstDrift) {
      summary.textContent = continuationComparison ? localize(10483, null, numberFormatter6.value.format(shared), numberFormatter6.value.format(totalB), firstDrift) : localize(10458, null, numberFormatter6.value.format(shared), numberFormatter6.value.format(totalB), firstDrift);
    } else {
      summary.textContent = continuationComparison ? localize(10484, null, numberFormatter6.value.format(shared), numberFormatter6.value.format(totalB)) : localize(10459, null, numberFormatter6.value.format(shared), numberFormatter6.value.format(totalB));
    }
  }
  /**
   * Render the per-key request-options table. Shows every cache-keying
   * option captured from the model provider request body, with a column
   * for the previous turn and one for the current turn. Rows whose
   * values differ are highlighted.
   */
  renderRequestOptions(a, b) {
    const prev = sideOptions(a);
    const curr = sideOptions(b);
    const keys = /* @__PURE__ */ new Set([...Object.keys(prev), ...Object.keys(curr)]);
    if (keys.size === 0) {
      return;
    }
    const section = append(this.content, $79(".chat-debug-cache-section"));
    append(section, $79("h3.chat-debug-cache-section-h", void 0, localize(10429, null)));
    const table = append(section, $79(".chat-debug-cache-options-table"));
    const head = append(table, $79(".chat-debug-cache-options-row.head"));
    append(head, $79(".chat-debug-cache-options-cell.key", void 0, localize(10418, null)));
    append(head, $79(".chat-debug-cache-options-cell", void 0, localize(10419, null)));
    append(head, $79(".chat-debug-cache-options-cell", void 0, localize(10417, null)));
    const sortedKeys = [...keys].sort((x, y) => x.localeCompare(y));
    for (const key3 of sortedKeys) {
      const row = append(table, $79(".chat-debug-cache-options-row"));
      const av = prev[key3];
      const bv = curr[key3];
      const changed = !equals4(av, bv);
      if (changed) {
        row.classList.add("changed");
      }
      append(row, $79(".chat-debug-cache-options-cell.key", void 0, key3));
      append(row, $79(".chat-debug-cache-options-cell", void 0, formatOptionValue(av)));
      append(row, $79(".chat-debug-cache-options-cell", void 0, formatOptionValue(bv)));
    }
  }
  renderComponents(drift, a, b, compareInputMessages, identicalCount) {
    this.componentElements.clear();
    const section = append(this.content, $79(".chat-debug-cache-section"));
    append(section, $79("h3.chat-debug-cache-section-h", void 0, localize(10380, null)));
    if (!compareInputMessages && b.requestShape.isContinuation) {
      const note = append(section, $79(".chat-debug-cache-sig-summary.chat-debug-cache-request-shape-note"));
      note.textContent = localize(10382, null);
    }
    const acc = append(section, $79(".chat-debug-cache-acc"));
    const effectiveDrift = !compareInputMessages && b.requestShape.isContinuation && b.inputMessages.length > 0 ? [...drift, currentDeltaComponent(b)] : drift;
    if (effectiveDrift.length === 0) {
      const empty = append(acc, $79(".chat-debug-cache-acc-empty"));
      empty.textContent = localize(10366, null);
      return;
    }
    for (const c of effectiveDrift) {
      const item = append(acc, $79(".chat-debug-cache-acc-item"));
      item.classList.add(c.status);
      const isOpen = this.openComponents.has(c.name);
      if (isOpen) {
        item.classList.add("open");
      }
      const head = append(item, $79(".chat-debug-cache-acc-head"));
      this.componentElements.set(c.name, { item, head });
      head.tabIndex = 0;
      head.setAttribute("role", "button");
      head.setAttribute("aria-expanded", isOpen ? "true" : "false");
      append(head, $79("span.chat-debug-cache-chev"));
      const name = append(head, $79(".chat-debug-cache-acc-name"));
      const swatchRole = c.role ?? (c.name === "system" || c.name === "tools" ? c.name : void 0);
      if (swatchRole) {
        append(name, $79(`span.chat-debug-cache-sig-swatch.role-${roleClass(swatchRole)}`, { "aria-hidden": "true" }));
      }
      if (c.role) {
        append(name, $79("span.role", void 0, c.role));
      }
      append(name, $("span", void 0, c.name));
      const badge = append(head, $79(`span.chat-debug-cache-acc-badge.${c.status}`));
      badge.textContent = badgeLabel(c.status);
      const sizes = append(head, $79("span.chat-debug-cache-acc-sizes"));
      sizes.textContent = localize(10381, null, formatTokens(c.aSize), formatTokens(c.bSize));
      const body = append(item, $79(".chat-debug-cache-acc-body"));
      const aText = c.name === CURRENT_CONTINUATION_DELTA_COMPONENT ? "" : textForComponent(c, a);
      const bText = c.name === CURRENT_CONTINUATION_DELTA_COMPONENT ? continuationDeltaText(b) : textForComponent(c, b);
      const truncationNote = describeTruncation(aText, bText);
      if (truncationNote) {
        const note = append(item, $79(".chat-debug-cache-acc-truncated"));
        note.textContent = truncationNote;
        note.title = truncationNote;
        head.title = truncationNote;
      }
      if (aText && bText && aText !== bText) {
        const dv = analyzeStringDivergence(aText, bText);
        if (dv) {
          const changeNote = append(body, $79(".chat-debug-cache-acc-change-note"));
          changeNote.textContent = localize(10375, null, describeStringDivergence(dv));
        }
      }
      body.appendChild(this.renderComponentDiff(aText, bText, c.aSize, c.bSize));
      const toggle = () => {
        if (this.openComponents.has(c.name)) {
          this.openComponents.delete(c.name);
          item.classList.remove("open");
          head.setAttribute("aria-expanded", "false");
        } else {
          this.openComponents.add(c.name);
          item.classList.add("open");
          head.setAttribute("aria-expanded", "true");
        }
      };
      this.contentDisposables.add(addDisposableListener(head, EventType.CLICK, toggle));
      this.contentDisposables.add(addDisposableListener(head, EventType.KEY_DOWN, (e4) => {
        if (e4.key === "Enter" || e4.key === " ") {
          e4.preventDefault();
          toggle();
        }
      }));
    }
    if (compareInputMessages && identicalCount > 0) {
      const note = append(section, $79(".chat-debug-cache-acc-identical-note"));
      note.textContent = localize(10402, null, identicalCount);
    }
  }
  renderComponentDiff(aText, bText, aSize, bSize) {
    const grid = $79(".chat-debug-cache-diff");
    const colA = append(grid, $79(".chat-debug-cache-diff-col"));
    append(colA, $79("h4", void 0, localize(10384, null, numberFormatter6.value.format(aSize))));
    const aBody = append(colA, $79(".chat-debug-cache-diff-body"));
    const colB = append(grid, $79(".chat-debug-cache-diff-col"));
    append(colB, $79("h4", void 0, localize(10385, null, numberFormatter6.value.format(bSize))));
    const bBody = append(colB, $79(".chat-debug-cache-diff-body"));
    if (!aText && !bText) {
      aBody.textContent = localize(10413, null);
      bBody.textContent = localize(10413, null);
      return grid;
    }
    renderInlineDiff(aBody, bBody, aText, bText);
    return grid;
  }
};

ChatDebugCacheExplorerView = __decorateClass([
  __decorateParam(1, IChatService),
  __decorateParam(2, IChatDebugService),
  __decorateParam(3, IContextMenuService)
], ChatDebugCacheExplorerView);

function findSection(sections, name) {
  if (!sections) {
    return void 0;
  }
  for (const s of sections) {
    if (s.name === name) {
      return s.content;
    }
  }
  return void 0;
}

function alignSignatureChunks(aSegs, bSegs) {
  const rows = [];
  const toRow2 = (aS, bS) => {
    const ref = bS ?? aS;
    return {
      role: ref.role,
      label: ref.label,
      aChars: aS?.chars,
      bChars: bS?.chars,
      // A row drifts if either side flags drift (e.g. OnlyInA marks only
      // the A segment) or the chunk is present on just one side.
      drift: (aS?.drift ?? false) || (bS?.drift ?? false) || !!aS !== !!bS
    };
  };
  for (const role of ["system", "tools"]) {
    const aS = aSegs.find((s) => s.synthetic && s.role === role);
    const bS = bSegs.find((s) => s.synthetic && s.role === role);
    if (aS || bS) {
      rows.push(toRow2(aS, bS));
    }
  }
  const aMsgs = aSegs.filter((s) => !s.synthetic);
  const bMsgs = bSegs.filter((s) => !s.synthetic);
  const count2 = Math.max(aMsgs.length, bMsgs.length);
  for (let i2 = 0; i2 < count2; i2++) {
    rows.push(toRow2(aMsgs[i2], bMsgs[i2]));
  }
  return rows;
}

function agentKey(turn) {
  return turn.requestName?.trim() || localize(10480, null);
}

function computeAgentCounts(turns) {
  const counts = /* @__PURE__ */ new Map();
  for (const turn of turns) {
    const key3 = agentKey(turn);
    counts.set(key3, (counts.get(key3) ?? 0) + 1);
  }
  return counts;
}

function defaultAgentSelection(agentCounts) {
  if (agentCounts.has(DEFAULT_AGENT_KEY)) {
    return /* @__PURE__ */ new Set([DEFAULT_AGENT_KEY]);
  }
  return new Set(agentCounts.keys());
}

function isSameModelTurn(a, b) {
  if (a === b) {
    return true;
  }
  return a.id !== void 0 && b.id !== void 0 && a.id === b.id;
}

function isSimilarNoIdModelTurn(a, b) {
  return a.id === void 0 && b.id === void 0 && a.created.getTime() === b.created.getTime() && a.parentEventId === b.parentEventId && a.requestName === b.requestName && a.model === b.model;
}

function resolveFilteredSelectionIndex(turns, previous) {
  if (previous) {
    const exact = turns.findIndex((t2) => isSameModelTurn(t2, previous));
    if (exact >= 0) {
      return exact;
    }
    const similar = turns.findIndex((t2) => isSimilarNoIdModelTurn(t2, previous));
    if (similar >= 0) {
      return similar;
    }
  }
  return turns.length - 1;
}

function buildTurnGroups(turns, userMessages) {
  const userById = /* @__PURE__ */ new Map();
  for (const um of userMessages) {
    if (!um.id) {
      continue;
    }
    userById.set(um.id, um);
    const stripped = um.id.startsWith("user-msg-") ? um.id.slice("user-msg-".length) : um.id;
    userById.set(stripped, um);
  }
  const groups = /* @__PURE__ */ new Map();
  const order = [];
  turns.forEach((turn, index2) => {
    const key3 = turn.parentEventId ?? turn.id ?? `turn-${index2}`;
    let entry = groups.get(key3);
    if (!entry) {
      entry = { userMessage: userById.get(key3) ?? userById.get(`user-msg-${key3}`), turns: [] };
      groups.set(key3, entry);
      order.push(key3);
    }
    entry.turns.push({ turn, index: index2 });
  });
  return order.map((key3) => ({ key: key3, userMessage: groups.get(key3).userMessage, turns: groups.get(key3).turns }));
}

function textForComponent(c, side) {
  if (c.name === "system") {
    return side.system ?? "";
  }
  if (c.name === "tools") {
    return side.tools ?? "";
  }
  if (c.name === CURRENT_CONTINUATION_DELTA_COMPONENT) {
    return continuationDeltaText(side);
  }
  const m = /^messages\[(\d+)\]$/.exec(c.name);
  if (m) {
    const idx = parseInt(m[1], 10);
    return side.inputMessages[idx]?.text ?? "";
  }
  return "";
}

function continuationDeltaText(side) {
  return side.requestShape.isContinuation ? side.inputMessages.map((m, index2) => `input[${index2}] ${m.role}
${m.text}`).join("\n\n") : "";
}

function currentDeltaComponent(side) {
  const size3 = side.inputMessages.reduce((sum2, m) => sum2 + m.charLength, 0);
  return {
    name: CURRENT_CONTINUATION_DELTA_COMPONENT,
    role: side.requestShape.inputItemTypes.join(", ") || side.inputMessages.map((m) => m.role).join(", ") || void 0,
    status: "onlyInB" /* OnlyInB */,
    aSize: 0,
    bSize: size3
  };
}

function categoryIcon(category9) {
  switch (category9) {
    case "healthy" /* Healthy */:
      return "check-compact";
    case "expiration" /* Expiration */:
      return "clock";
    case "model" /* Model */:
      return "hubot";
    case "tools" /* Tools */:
      return "tools";
    case "system" /* System */:
      return "gear-compact";
    case "options" /* Options */:
      return "symbol-parameter";
    case "history" /* History */:
      return "history";
    case "unknown" /* Unknown */:
      return "question";
  }
}

function findingIcon(severity) {
  switch (severity) {
    case "ok" /* Ok */:
      return "check";
    case "info" /* Info */:
      return "info";
    case "warning" /* Warning */:
      return "warning";
    case "critical" /* Critical */:
      return "error";
  }
}

function badgeLabel(status2) {
  switch (status2) {
    case "identical" /* Identical */:
      return localize(10368, null);
    case "contentDrift" /* ContentDrift */:
      return localize(10367, null);
    case "lengthChange" /* LengthChange */:
      return localize(10369, null);
    case "onlyInA" /* OnlyInA */:
      return localize(10370, null);
    case "onlyInB" /* OnlyInB */:
      return localize(10371, null);
  }
}

function describeTruncation(aText, bText) {
  const re = /\.\.\.\[truncated, original (\d+) chars\]$/;
  const aMatch = re.exec(aText);
  const bMatch = re.exec(bText);
  if (!aMatch && !bMatch) {
    return void 0;
  }
  if (aMatch && bMatch) {
    return localize(
      10472,
      null,
      numberFormatter6.value.format(parseInt(aMatch[1], 10)),
      numberFormatter6.value.format(parseInt(bMatch[1], 10))
    );
  }
  const match2 = aMatch ?? bMatch;
  const side = aMatch ? localize(10475, null) : localize(10474, null);
  return localize(
    10473,
    null,
    side,
    numberFormatter6.value.format(parseInt(match2[1], 10))
  );
}

function computeCacheHit(event) {
  if (!event.inputTokens || event.cachedTokens === void 0) {
    return 0;
  }
  return Math.min(100, event.cachedTokens / event.inputTokens * 100);
}

function shouldCompareInputMessages(a, b) {
  return !a.requestShape.isContinuation && !b.requestShape.isContinuation;
}

function describeRequestShape(inputMessages, requestShapeJson) {
  const metadata = parseRequestShapeMetadata(requestShapeJson);
  const inputItemTypes = Array.isArray(metadata?.inputItemTypes) ? metadata.inputItemTypes.filter((x) => typeof x === "string") : [];
  const common = { api: typeof metadata?.api === "string" ? metadata.api : void 0, inputItemTypes };
  const hasPreviousResponseId = metadata?.hasPreviousResponseId === true;
  const hasToolSearchOutput = inputItemTypes.includes("tool_search_output") || inputMessages.some((m) => m.role === "tool_search");
  const hasOnlyToolOutput = inputMessages.length > 0 && inputMessages.every((m) => m.role === "tool");
  if (hasPreviousResponseId && hasToolSearchOutput) {
    return {
      label: localize(10437, null),
      description: localize(10438, null),
      isContinuation: true,
      ...common
    };
  }
  if (hasPreviousResponseId && hasOnlyToolOutput) {
    return {
      label: localize(10434, null),
      description: localize(10435, null),
      isContinuation: true,
      ...common
    };
  }
  if (hasPreviousResponseId) {
    return {
      label: localize(10431, null),
      description: localize(10432, null),
      isContinuation: true,
      ...common
    };
  }
  if (hasToolSearchOutput) {
    return {
      label: localize(10439, null),
      description: localize(10440, null),
      isContinuation: false,
      ...common
    };
  }
  if (hasOnlyToolOutput) {
    return {
      label: localize(10436, null),
      description: void 0,
      isContinuation: false,
      ...common
    };
  }
  return {
    label: localize(10433, null),
    description: void 0,
    isContinuation: false,
    ...common
  };
}

function parseRequestShapeMetadata(requestShapeJson) {
  if (!requestShapeJson) {
    return void 0;
  }
  try {
    const parsed = JSON.parse(requestShapeJson);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
  }
  return void 0;
}

function roleClass(role) {
  switch (role) {
    case "system":
    case "tools":
    case "user":
    case "assistant":
    case "tool":
      return role;
    case "tool_search":
      return "tool-search";
    default:
      return "tool";
  }
}

function formatCachePct(pct2) {
  const truncated = Math.floor(pct2 * 100) / 100;
  return truncated.toFixed(2);
}

function formatCachePctInt(pct2) {
  return String(Math.floor(pct2));
}

function formatTokens(value2) {
  if (value2 === void 0) {
    return "\u2014";
  }
  return numberFormatter6.value.format(value2);
}

function sideOptions(side) {
  const out = {};
  if (side.event.model !== void 0) {
    out.model = side.event.model;
  }
  Object.assign(out, parseOptions(side.content?.requestOptions));
  const hasEffort = out["output_config.effort"] !== void 0 || out["reasoning.effort"] !== void 0 || out["reasoning_effort"] !== void 0;
  const hasThinking = Object.keys(out).some((k) => k === "thinking" || k.startsWith("thinking."));
  if (!hasEffort && hasThinking) {
    out["output_config.effort"] = localize(10389, null);
  }
  return out;
}

function computeOptionsDiff(a, b) {
  const prev = sideOptions(a);
  const curr = sideOptions(b);
  const keys = /* @__PURE__ */ new Set([...Object.keys(prev), ...Object.keys(curr)]);
  const out = [];
  for (const key3 of keys) {
    const av = prev[key3];
    const bv = curr[key3];
    if (!equals4(av, bv)) {
      out.push({ key: key3, previous: av, current: bv });
    }
  }
  out.sort((x, y) => x.key.localeCompare(y.key));
  return out;
}

function parseOptions(blob) {
  if (!blob) {
    return {};
  }
  let parsed;
  try {
    parsed = JSON.parse(blob);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }
  const flat = {};
  for (const [k, v2] of Object.entries(parsed)) {
    if (v2 && typeof v2 === "object" && !Array.isArray(v2)) {
      for (const [nk, nv] of Object.entries(v2)) {
        flat[`${k}.${nk}`] = nv;
      }
    } else {
      flat[k] = v2;
    }
  }
  return flat;
}

function formatOptionValue(value2) {
  if (value2 === void 0) {
    return "\u2014";
  }
  if (value2 === null) {
    return "null";
  }
  if (typeof value2 === "string") {
    return value2;
  }
  if (typeof value2 === "number" || typeof value2 === "boolean") {
    return String(value2);
  }
  try {
    return JSON.stringify(value2);
  } catch {
    return String(value2);
  }
}

var DIFF_OPTIONS = {
  ignoreTrimWhitespace: false,
  maxComputationTimeMs: 200,
  computeMoves: false
};

function renderInlineDiff(prevHost, currHost, prev, curr) {
  const prevLines = prev.split(/\r?\n/);
  const currLines = curr.split(/\r?\n/);
  const result = linesDiffComputers.getDefault().computeDiff(prevLines, currLines, DIFF_OPTIONS);
  let prevIdx = 0;
  let currIdx = 0;
  for (const change of result.changes) {
    const origStart = change.original.startLineNumber;
    const origEnd = change.original.endLineNumberExclusive;
    const modStart = change.modified.startLineNumber;
    const modEnd = change.modified.endLineNumberExclusive;
    while (prevIdx + 1 < origStart && currIdx + 1 < modStart) {
      appendLine(prevHost, prevLines[prevIdx], "context");
      appendLine(currHost, currLines[currIdx], "context");
      prevIdx++;
      currIdx++;
    }
    const innerByOrig = groupInnerChangesByLine(
      change.innerChanges,
      /* original */
      true
    );
    const innerByMod = groupInnerChangesByLine(
      change.innerChanges,
      /* original */
      false
    );
    for (let line = origStart; line < origEnd; line++) {
      const lineText = prevLines[line - 1] ?? "";
      appendChangedLine(prevHost, lineText, innerByOrig.get(line), "remove");
    }
    prevIdx = origEnd - 1;
    for (let line = modStart; line < modEnd; line++) {
      const lineText = currLines[line - 1] ?? "";
      appendChangedLine(currHost, lineText, innerByMod.get(line), "add");
    }
    currIdx = modEnd - 1;
  }
  while (prevIdx < prevLines.length && currIdx < currLines.length) {
    appendLine(prevHost, prevLines[prevIdx], "context");
    appendLine(currHost, currLines[currIdx], "context");
    prevIdx++;
    currIdx++;
  }
}

function appendLine(host, text2, kind) {
  const line = append(host, $79(`.chat-debug-cache-diff-line.${kind}`));
  line.textContent = text2 === "" ? "\xA0" : text2;
}

function appendChangedLine(host, text2, ranges, kind) {
  const line = append(host, $79(`.chat-debug-cache-diff-line.${kind}`));
  if (!ranges || ranges.length === 0) {
    line.textContent = text2 === "" ? "\xA0" : text2;
    return;
  }
  let cursor = 1;
  const sorted = [...ranges].sort((a, b) => a.startColumn - b.startColumn);
  for (const r2 of sorted) {
    if (r2.startColumn > cursor) {
      append(line, document.createTextNode(text2.substring(cursor - 1, r2.startColumn - 1)));
    }
    const span = append(line, $79("span.chat-debug-cache-diff-inner"));
    span.textContent = text2.substring(r2.startColumn - 1, r2.endColumn - 1);
    cursor = r2.endColumn;
  }
  if (cursor - 1 < text2.length) {
    append(line, document.createTextNode(text2.substring(cursor - 1)));
  }
}

function groupInnerChangesByLine(innerChanges, useOriginal) {
  const out = /* @__PURE__ */ new Map();
  if (!innerChanges) {
    return out;
  }
  for (const r2 of innerChanges) {
    const range2 = useOriginal ? r2.originalRange : r2.modifiedRange;
    if (range2.startLineNumber !== range2.endLineNumber) {
      continue;
    }
    const list2 = out.get(range2.startLineNumber) ?? [];
    list2.push({ startColumn: range2.startColumn, endColumn: range2.endColumn });
    out.set(range2.startLineNumber, list2);
  }
  return out;
}
export { findSection, alignSignatureChunks, agentKey, computeAgentCounts, defaultAgentSelection, isSameModelTurn, isSimilarNoIdModelTurn, resolveFilteredSelectionIndex, buildTurnGroups, textForComponent, continuationDeltaText, currentDeltaComponent, categoryIcon, findingIcon, badgeLabel, describeTruncation, computeCacheHit, shouldCompareInputMessages, describeRequestShape, parseRequestShapeMetadata, roleClass, formatCachePct, formatCachePctInt, formatTokens, sideOptions, computeOptionsDiff, parseOptions, formatOptionValue, renderInlineDiff, appendLine, appendChangedLine, groupInnerChangesByLine, $79, numberFormatter6, timeFormatter, RAIL_DEFAULT_WIDTH, RAIL_MIN_WIDTH, RAIL_MAX_WIDTH, CURRENT_CONTINUATION_DELTA_COMPONENT, TTL_GAP_MINUTES, DEFAULT_AGENT_KEY, ChatDebugCacheExplorerView, DIFF_OPTIONS };
