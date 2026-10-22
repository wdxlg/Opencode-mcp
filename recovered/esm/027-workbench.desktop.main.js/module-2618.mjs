// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugWireLogView.ts
import { $, EventType, addDisposableListener, append, clearNode, hide, show } from "./module-0075.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { BreadcrumbsWidget } from "./module-1573.mjs";
import { Codicon } from "./module-0085.mjs";
import { defaultBreadcrumbsWidgetStyles, defaultButtonStyles, defaultSelectBoxStyles } from "./module-0513.mjs";
import { TextBreadcrumbItem, setupBreadcrumbKeyboardNavigation } from "./module-2595.mjs";
import { localize } from "./module-0001.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { LocalChatSessionUri } from "./module-0961.mjs";
import { AgentHostAhpJsonlLoggingSettingId, IAgentHostService } from "./module-1107.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { enumerateAgentHostLogSources, isAgentHostSession, readAgentHostLogSourceContent } from "./module-2598.mjs";
import { SelectBox } from "./module-0475.mjs";
import { Button } from "./module-0546.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0972.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IPathService } from "./module-0938.mjs";
import { IRemoteAgentHostService } from "./module-1808.mjs";
import { IOutputService } from "./module-1245.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IProductService } from "./module-0873.mjs";
import { ILogService } from "./module-0095.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugWireLogView.ts
var $81 = $;

var LIVE_REFRESH_DELAY = 400;

var FILTER_DEBOUNCE_DELAY = 150;

var PAGE_SIZE4 = 1e3;

var MAX_DETAIL_JSON = 2e4;

var ChatDebugWireLogView = class extends Disposable {
  constructor(parent, chatService, contextViewService, editorService, configurationService, pathService, agentHostService, remoteAgentHostService, outputService, fileService, textModelService, environmentService, productService, logService) {
    super();
    this.chatService = chatService;
    this.contextViewService = contextViewService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.pathService = pathService;
    this.agentHostService = agentHostService;
    this.remoteAgentHostService = remoteAgentHostService;
    this.outputService = outputService;
    this.fileService = fileService;
    this.textModelService = textModelService;
    this.environmentService = environmentService;
    this.productService = productService;
    this.logService = logService;
    this._onNavigate = this._register(new Emitter());
    this.onNavigate = this._onNavigate.event;
    this.headerDisposables = this._register(new DisposableStore());
    this.contentDisposables = this._register(new DisposableStore());
    /** Watches the currently-shown wire log for live updates. */
    this.liveWatch = this._register(new MutableDisposable());
    this.sources = [];
    this.entries = [];
    /** The filtered entries currently rendered in the list, in order. */
    this.renderedVisible = [];
    /** Row DOM nodes parallel to {@link renderedVisible}. */
    this.rowElements = [];
    /** Per-row disposables parallel to {@link renderedVisible}. */
    this.rowStores = [];
    /** True while the list is showing a status message instead of rows. */
    this.listShowingMessage = false;
    this.filterText = "";
    /** Monotonic token guarding against out-of-order async loads. */
    this.loadGeneration = 0;
    /** Max number of (filtered) frames rendered at once; grows via "Load more". */
    this.visibleLimit = PAGE_SIZE4;
    this.loadMoreDisposables = this._register(new DisposableStore());
    this.loadMoreVisible = false;
    this.container = append(parent, $81(".chat-debug-wirelog"));
    hide(this.container);
    this.refreshScheduler = this._register(new RunOnceScheduler(() => this.liveRefresh(), LIVE_REFRESH_DELAY));
    this.filterScheduler = this._register(new RunOnceScheduler(() => this.applyFilter(), FILTER_DEBOUNCE_DELAY));
    const breadcrumbContainer = append(this.container, $81(".chat-debug-breadcrumb"));
    this.breadcrumbWidget = this._register(new BreadcrumbsWidget(breadcrumbContainer, 3, void 0, Codicon.chevronRight, defaultBreadcrumbsWidgetStyles));
    this._register(setupBreadcrumbKeyboardNavigation(breadcrumbContainer, this.breadcrumbWidget));
    this._register(this.breadcrumbWidget.onDidSelectItem((e) => {
      if (e.type === "select" && e.item instanceof TextBreadcrumbItem) {
        this.breadcrumbWidget.setSelection(void 0);
        const idx = this.breadcrumbWidget.getItems().indexOf(e.item);
        if (idx === 0) {
          this._onNavigate.fire("home" /* Home */);
        } else if (idx === 1) {
          this._onNavigate.fire("overview" /* Overview */);
        }
      }
    }));
    this.hintBar = append(this.container, $81(".chat-debug-wirelog-hint"));
    hide(this.hintBar);
    this.toolbar = append(this.container, $81(".chat-debug-wirelog-toolbar"));
    this.selectHost = append(this.toolbar, $81(".chat-debug-wirelog-select"));
    this.filterInput = append(this.toolbar, $81("input.chat-debug-wirelog-filter"));
    this.filterInput.type = "text";
    this.filterInput.placeholder = localize(10761, null);
    this.filterInput.setAttribute("aria-label", localize(10760, null));
    this._register(addDisposableListener(this.filterInput, EventType.INPUT, () => {
      this.filterScheduler.schedule();
    }));
    this.summary = append(this.container, $81(".chat-debug-wirelog-summary"));
    hide(this.summary);
    this.body = append(this.container, $81(".chat-debug-wirelog-body"));
    this.list = $81(".chat-debug-wirelog-list");
    this.scrollable = this._register(new DomScrollableElement(this.list, {
      horizontal: 1 /* Auto */,
      vertical: 1 /* Auto */
    }));
    append(this.body, this.scrollable.getDomNode());
    this.loadMoreContainer = append(this.container, $81(".chat-debug-wirelog-loadmore"));
    hide(this.loadMoreContainer);
    this.footer = append(this.container, $81(".chat-debug-wirelog-footer"));
  }
  setSession(sessionResource) {
    this.currentSessionResource = sessionResource;
    this.selectedSourceId = void 0;
    this.visibleLimit = PAGE_SIZE4;
  }
  show() {
    show(this.container);
    this.load();
  }
  hide() {
    hide(this.container);
    this.refreshScheduler.cancel();
    this.filterScheduler.cancel();
    this.liveWatch.clear();
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
      new TextBreadcrumbItem(localize(10747, null), true),
      new TextBreadcrumbItem(sessionTitle, true),
      new TextBreadcrumbItem(localize(10746, null))
    ]);
  }
  focus() {
    this.selectBox?.focus();
  }
  layout() {
    const height = this.body.clientHeight;
    if (height > 0) {
      this.list.style.height = `${height}px`;
    }
    this.scrollable.scanDomNode();
  }
  get logSourceServices() {
    return {
      pathService: this.pathService,
      agentHostService: this.agentHostService,
      remoteAgentHostService: this.remoteAgentHostService,
      outputService: this.outputService,
      fileService: this.fileService,
      textModelService: this.textModelService,
      configurationService: this.configurationService,
      environmentService: this.environmentService,
      productService: this.productService,
      logService: this.logService
    };
  }
  async load() {
    this.updateBreadcrumb();
    this.headerDisposables.clear();
    this.liveWatch.clear();
    clearNode(this.selectHost);
    this.selectBox = void 0;
    const wireLoggingEnabled = this.configurationService.getValue(AgentHostAhpJsonlLoggingSettingId);
    clearNode(this.hintBar);
    if (!wireLoggingEnabled) {
      show(this.hintBar);
      append(this.hintBar, $81(`span${ThemeIcon.asCSSSelector(Codicon.info)}`));
      append(this.hintBar, $81("span", void 0, localize(10756, null, AgentHostAhpJsonlLoggingSettingId)));
    } else {
      hide(this.hintBar);
    }
    if (!isAgentHostSession(this.currentSessionResource)) {
      this.renderMessage(localize(10772, null));
      return;
    }
    const allSources = await enumerateAgentHostLogSources(this.logSourceServices, this.currentSessionResource);
    this.sources = allSources.filter((source) => source.kind === "wire" /* WireLog */);
    if (this.sources.length === 0) {
      this.renderMessage(wireLoggingEnabled ? localize(10770, null) : localize(10758, null, AgentHostAhpJsonlLoggingSettingId));
      return;
    }
    if (this.sources.length > 1) {
      show(this.selectHost);
      const options3 = this.sources.map((source) => ({ text: source.label }));
      let selectedIndex2 = this.sources.findIndex((source) => source.id === this.selectedSourceId);
      if (selectedIndex2 < 0) {
        selectedIndex2 = 0;
      }
      const selectBox = this.headerDisposables.add(new SelectBox(options3, selectedIndex2, this.contextViewService, defaultSelectBoxStyles, {
        ariaLabel: localize(10783, null)
      }));
      selectBox.render(this.selectHost);
      this.headerDisposables.add(selectBox.onDidSelect((e) => this.loadSource(e.index)));
      this.selectBox = selectBox;
    } else {
      hide(this.selectHost);
    }
    const openBtn = this.headerDisposables.add(new Button(this.toolbar, { ...defaultButtonStyles, secondary: true, supportIcons: true, title: localize(10773, null) }));
    openBtn.element.classList.add("chat-debug-wirelog-action");
    openBtn.label = `$(go-to-file) ${localize(10773, null)}`;
    this.headerDisposables.add(openBtn.onDidClick(() => this.openCurrentFile()));
    const refreshBtn = this.headerDisposables.add(new Button(this.toolbar, { ...defaultButtonStyles, secondary: true, supportIcons: true, title: localize(10775, null) }));
    refreshBtn.element.classList.add("chat-debug-wirelog-action");
    refreshBtn.label = `$(refresh) ${localize(10775, null)}`;
    this.headerDisposables.add(refreshBtn.onDidClick(() => this.reloadCurrentSource()));
    let selectedIndex = this.sources.findIndex((source) => source.id === this.selectedSourceId);
    if (selectedIndex < 0) {
      selectedIndex = 0;
    }
    await this.loadSource(selectedIndex);
  }
  async loadSource(index2) {
    const source = this.sources[index2];
    if (!source) {
      return;
    }
    this.selectedSourceId = source.id;
    this.liveWatch.clear();
    this.currentFileResource = void 0;
    this.visibleLimit = PAGE_SIZE4;
    const generation = ++this.loadGeneration;
    this.renderMessage(localize(10766, null));
    let content2;
    try {
      content2 = await readAgentHostLogSourceContent(source, this.logSourceServices);
    } catch (error) {
      if (generation !== this.loadGeneration) {
        return;
      }
      this.renderMessage(localize(10759, null, error instanceof Error ? error.message : String(error)));
      return;
    }
    if (generation !== this.loadGeneration) {
      return;
    }
    if (!content2) {
      this.renderMessage(localize(10788, null));
      return;
    }
    this.currentFileResource = content2.fileResource;
    this.entries = buildWireEntries(parseWireFrames(content2.text));
    this.renderList();
    this.renderFooter(source, content2.truncated);
    this.setupLiveWatch(source);
  }
  reloadCurrentSource() {
    const index2 = this.sources.findIndex((source) => source.id === this.selectedSourceId);
    if (index2 >= 0) {
      this.loadSource(index2);
    }
  }
  setupLiveWatch(source) {
    const store = new DisposableStore();
    if (source.resource?.scheme === Schemas.file) {
      const watcher = store.add(this.fileService.createWatcher(source.resource, { recursive: false, excludes: [] }));
      store.add(watcher.onDidChange(() => this.refresh()));
    }
    this.liveWatch.value = store;
  }
  openCurrentFile() {
    if (this.currentFileResource) {
      this.editorService.openEditor({ resource: this.currentFileResource, options: { pinned: true } });
    }
  }
  renderMessage(message) {
    this.contentDisposables.clear();
    this.rowElements = [];
    this.rowStores = [];
    this.renderedVisible = [];
    this.listShowingMessage = true;
    hide(this.summary);
    clearNode(this.list);
    this.list.classList.add("chat-debug-wirelog-message");
    this.list.textContent = message;
    this.scrollable.scanDomNode();
    clearNode(this.footer);
    if (this.loadMoreVisible) {
      hide(this.loadMoreContainer);
      this.loadMoreVisible = false;
    }
  }
  renderSummary() {
    clearNode(this.summary);
    let requests = 0;
    let errors = 0;
    let pending = 0;
    let longest = 0;
    for (const entry of this.entries) {
      if (entry.frame.kind === "request") {
        requests++;
        if (!entry.response) {
          pending++;
        } else {
          const duration = entry.response.ts - entry.frame.ts;
          if (duration > longest) {
            longest = duration;
          }
        }
      }
      if (isErrorEntry(entry)) {
        errors++;
      }
    }
    show(this.summary);
    this.appendChip(localize(10752, null, this.entries.length));
    this.appendChip(localize(10754, null, requests));
    if (errors > 0) {
      this.appendChip(localize(10751, null, errors), "error");
    }
    if (pending > 0) {
      this.appendChip(localize(10753, null, pending), "pending");
    }
    if (longest > 0) {
      this.appendChip(localize(10755, null, formatDuration3(longest)));
    }
  }
  appendChip(text2, tone) {
    const chip = append(this.summary, $81("span.chat-debug-wirelog-chip", void 0, text2));
    if (tone) {
      chip.classList.add(`chat-debug-wirelog-chip-${tone}`);
    }
  }
  /**
   * Applies the current filter box value and re-renders the list. Invoked
   * (debounced) from the filter input's INPUT handler; skips work when the
   * effective filter text has not changed.
   */
  applyFilter() {
    const next = this.filterInput.value.trim().toLowerCase();
    if (next === this.filterText) {
      return;
    }
    this.filterText = next;
    this.visibleLimit = PAGE_SIZE4;
    this.renderList();
  }
  renderList() {
    this.contentDisposables.clear();
    clearNode(this.list);
    this.rowElements = [];
    this.rowStores = [];
    this.renderedVisible = [];
    this.listShowingMessage = false;
    if (this.entries.length === 0) {
      this.renderMessage(localize(10757, null));
      return;
    }
    this.renderSummary();
    const { filtered, display } = this.computeVisible(this.entries);
    if (display.length === 0) {
      const empty = append(this.list, $81(".chat-debug-wirelog-noresults"));
      empty.textContent = localize(10771, null, this.filterText);
      this.updateLoadMore(0);
      this.scrollable.scanDomNode();
      return;
    }
    for (const entry of display) {
      this.appendRow(entry);
    }
    this.renderedVisible = display;
    this.updateLoadMore(filtered.length);
    this.scrollable.scanDomNode();
  }
  /**
   * Re-reads the current wire log and updates the list in place — appending
   * newly-captured frames and refreshing rows whose state changed (e.g. a
   * response arriving for a pending request) — instead of rebuilding the
   * whole view. Used for live refreshes so the panel does not flash back to
   * "Loading…" and lose scroll position on every turn.
   */
  async liveRefresh() {
    const index2 = this.sources.findIndex((source2) => source2.id === this.selectedSourceId);
    const source = this.sources[index2];
    if (!source) {
      return;
    }
    const generation = ++this.loadGeneration;
    let content2;
    try {
      content2 = await readAgentHostLogSourceContent(source, this.logSourceServices);
    } catch {
      return;
    }
    if (generation !== this.loadGeneration || !content2) {
      return;
    }
    this.currentFileResource = content2.fileResource;
    this.applyEntries(buildWireEntries(parseWireFrames(content2.text)));
    this.renderFooter(source, content2.truncated);
  }
  /**
   * Applies a freshly-parsed set of entries to the list. When the previously
   * rendered rows are still a prefix of the new (filtered) set, only the
   * changed and newly-appended rows are touched; otherwise a full render is
   * performed (e.g. after a filter change or log rotation).
   */
  applyEntries(newEntries) {
    const { filtered, display } = this.computeVisible(newEntries);
    const canReconcile = !this.listShowingMessage && this.renderedVisible.length > 0 && display.length >= this.renderedVisible.length && this.renderedVisible.every((entry, i2) => baseEntryKey(entry) === baseEntryKey(display[i2]));
    this.entries = newEntries;
    if (!canReconcile) {
      this.renderList();
      return;
    }
    const wasAtBottom = this.isScrolledToBottom();
    this.renderSummary();
    for (let i2 = 0; i2 < this.renderedVisible.length; i2++) {
      if (entryStateKey(this.renderedVisible[i2]) !== entryStateKey(display[i2])) {
        this.replaceRow(i2, display[i2]);
      }
    }
    for (let i2 = this.renderedVisible.length; i2 < display.length; i2++) {
      this.appendRow(display[i2]);
    }
    this.renderedVisible = display;
    this.updateLoadMore(filtered.length);
    this.scrollable.scanDomNode();
    if (wasAtBottom) {
      this.scrollToBottom();
    }
  }
  /**
   * Computes the filtered entries and the (paginated) subset currently
   * displayed. Only the first {@link visibleLimit} matching frames are shown;
   * the rest are revealed via the "Load more" button.
   */
  computeVisible(entries2) {
    const filter2 = this.filterText;
    const filtered = filter2 ? entries2.filter((entry) => matchesFilter(entry, filter2)) : entries2;
    const display = filtered.length > this.visibleLimit ? filtered.slice(0, this.visibleLimit) : filtered;
    return { filtered, display };
  }
  /**
   * Shows or hides the "Load more" affordance and updates its status label.
   */
  updateLoadMore(totalFiltered) {
    if (totalFiltered <= this.visibleLimit) {
      if (this.loadMoreVisible) {
        hide(this.loadMoreContainer);
        this.loadMoreVisible = false;
        this.layout();
      }
      return;
    }
    if (!this.loadMoreStatus) {
      this.loadMoreStatus = append(this.loadMoreContainer, $81("span.chat-debug-wirelog-loadmore-status"));
    }
    if (!this.loadMoreBtn) {
      this.loadMoreBtn = this.loadMoreDisposables.add(new Button(this.loadMoreContainer, { ...defaultButtonStyles, secondary: true, title: localize(10768, null) }));
      this.loadMoreDisposables.add(this.loadMoreBtn.onDidClick(() => {
        this.visibleLimit += PAGE_SIZE4;
        this.renderList();
      }));
    }
    const shown = Math.min(this.visibleLimit, totalFiltered);
    const remaining = totalFiltered - shown;
    this.loadMoreStatus.textContent = localize(10782, null, shown, totalFiltered);
    this.loadMoreBtn.label = localize(10767, null, remaining);
    if (!this.loadMoreVisible) {
      show(this.loadMoreContainer);
      this.loadMoreVisible = true;
      this.layout();
    }
  }
  appendRow(entry) {
    const { row, store } = this.buildRow(entry);
    this.contentDisposables.add(store);
    this.rowElements.push(row);
    this.rowStores.push(store);
    this.list.appendChild(row);
  }
  replaceRow(index2, entry) {
    const { row, store } = this.buildRow(entry);
    this.contentDisposables.add(store);
    const oldRow = this.rowElements[index2];
    this.list.replaceChild(row, oldRow);
    this.rowStores[index2].dispose();
    this.rowElements[index2] = row;
    this.rowStores[index2] = store;
  }
  isScrolledToBottom() {
    const dimensions = this.scrollable.getScrollDimensions();
    const position2 = this.scrollable.getScrollPosition();
    return position2.scrollTop + dimensions.height >= dimensions.scrollHeight - 4;
  }
  scrollToBottom() {
    this.scrollable.setScrollPosition({ scrollTop: this.scrollable.getScrollDimensions().scrollHeight });
  }
  buildRow(entry) {
    const store = new DisposableStore();
    const frame = entry.frame;
    const isError = isErrorEntry(entry);
    const isPending = frame.kind === "request" && !entry.response;
    const row = $81(".chat-debug-wirelog-row");
    if (isError) {
      row.classList.add("chat-debug-wirelog-row-error");
    }
    const header2 = append(row, $81(".chat-debug-wirelog-row-header"));
    header2.tabIndex = 0;
    header2.setAttribute("role", "button");
    const chevron = append(header2, $81(`span.chat-debug-wirelog-chevron${ThemeIcon.asCSSSelector(Codicon.chevronRight)}`));
    chevron.setAttribute("aria-hidden", "true");
    const outbound = frame.dir === "c2s";
    const dirIcon = outbound ? Codicon.arrowRight : Codicon.arrowLeft;
    const dirEl = append(header2, $81(`span.chat-debug-wirelog-dir${ThemeIcon.asCSSSelector(dirIcon)}`));
    dirEl.title = outbound ? localize(10774, null) : localize(10765, null);
    const label3 = frame.method ?? localize(10776, null);
    append(header2, $81("span.chat-debug-wirelog-method", void 0, label3));
    if (frame.actionType) {
      append(header2, $81("span.chat-debug-wirelog-type", void 0, frame.actionType));
    }
    const badgeText = frame.kind === "request" ? localize(10749, null) : frame.kind === "notification" ? localize(10748, null) : localize(10750, null);
    append(header2, $81("span.chat-debug-wirelog-badge", void 0, badgeText));
    const status2 = append(header2, $81("span.chat-debug-wirelog-status"));
    if (isError) {
      status2.classList.add("chat-debug-wirelog-status-error");
      const code = entry.response?.error?.code ?? frame.error?.code;
      status2.textContent = code !== void 0 ? localize(10785, null, code) : localize(10784, null);
    } else if (isPending) {
      status2.classList.add("chat-debug-wirelog-status-pending");
      status2.textContent = localize(10786, null);
    } else if (entry.response) {
      status2.classList.add("chat-debug-wirelog-status-ok");
      status2.textContent = formatDuration3(entry.response.ts - frame.ts);
    }
    const time = append(header2, $81("span.chat-debug-wirelog-time"));
    time.textContent = formatClock(frame.ts);
    if (frame.id !== void 0) {
      time.title = localize(10764, null, frame.id);
    }
    const details = append(row, $81(".chat-debug-wirelog-row-details"));
    let detailsRendered = false;
    let expanded2 = false;
    const setExpanded = (value2, scan) => {
      expanded2 = value2;
      if (expanded2 && !detailsRendered) {
        this.renderDetails(details, entry);
        detailsRendered = true;
      }
      row.classList.toggle("chat-debug-wirelog-row-expanded", expanded2);
      chevron.classList.toggle("codicon-chevron-down", expanded2);
      chevron.classList.toggle("codicon-chevron-right", !expanded2);
      header2.setAttribute("aria-expanded", String(expanded2));
      if (scan) {
        this.scrollable.scanDomNode();
      }
    };
    setExpanded(isError, false);
    store.add(addDisposableListener(header2, EventType.CLICK, () => setExpanded(!expanded2, true)));
    store.add(addDisposableListener(header2, EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setExpanded(!expanded2, true);
      }
    }));
    return { row, store };
  }
  renderDetails(container3, entry) {
    const frame = entry.frame;
    if (frame.payload !== void 0) {
      this.appendJsonSection(container3, frame.kind === "response" ? localize(10781, null) : localize(10779, null), frame.payload);
    }
    if (frame.error) {
      this.appendJsonSection(container3, localize(10778, null), frame.error, true);
    }
    if (entry.response) {
      if (entry.response.error) {
        this.appendJsonSection(container3, localize(10780, null), entry.response.error, true);
      } else if (entry.response.payload !== void 0) {
        this.appendJsonSection(container3, localize(10781, null), entry.response.payload);
      }
    }
    if (frame.truncated || entry.response?.truncated) {
      append(container3, $81(".chat-debug-wirelog-detail-note", void 0, localize(10787, null)));
    }
  }
  appendJsonSection(container3, title, value2, isError = false) {
    const section = append(container3, $81(".chat-debug-wirelog-detail-section"));
    append(section, $81(".chat-debug-wirelog-detail-title", void 0, title));
    const pre = append(section, $81("pre.chat-debug-wirelog-detail-json"));
    if (isError) {
      pre.classList.add("chat-debug-wirelog-detail-json-error");
    }
    pre.textContent = stringifyBounded(value2);
  }
  renderFooter(source, truncated) {
    clearNode(this.footer);
    const parts = [];
    if (truncated) {
      parts.push(localize(10763, null));
    }
    if (source.isRemote) {
      parts.push(localize(10762, null));
    }
    this.footer.textContent = parts.join(" \xB7 ");
  }
};

ChatDebugWireLogView = __decorateClass([
  __decorateParam(1, IChatService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IPathService),
  __decorateParam(6, IAgentHostService),
  __decorateParam(7, IRemoteAgentHostService),
  __decorateParam(8, IOutputService),
  __decorateParam(9, IFileService),
  __decorateParam(10, ITextModelService),
  __decorateParam(11, IEnvironmentService),
  __decorateParam(12, IProductService),
  __decorateParam(13, ILogService)
], ChatDebugWireLogView);

function extractActionType(method, payload) {
  switch (method) {
    case "notification":
      return typeStringOf(getProp(payload, "notification"));
    case "dispatchAction":
      return typeStringOf(Array.isArray(payload) ? payload[1] : void 0);
    case "createSession":
      return uriStringOf(getProp(Array.isArray(payload) ? payload[0] : void 0, "session"));
    default:
      return typeStringOf(getProp(payload, "action"));
  }
}

function getProp(value2, key3) {
  return value2 && typeof value2 === "object" ? value2[key3] : void 0;
}

function typeStringOf(value2) {
  const type = getProp(value2, "type");
  return typeof type === "string" ? type : void 0;
}

function uriStringOf(value2) {
  if (typeof value2 === "string") {
    return value2;
  }
  if (value2 && typeof value2 === "object") {
    const external = value2.external;
    if (typeof external === "string") {
      return external;
    }
    if (typeof value2.scheme === "string") {
      try {
        return URI.revive(value2).toString(true);
      } catch {
        return void 0;
      }
    }
  }
  return void 0;
}

function parseWireFrames(text2) {
  const frames = [];
  for (const line of text2.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    let record;
    try {
      record = JSON.parse(trimmed);
    } catch {
      continue;
    }
    const meta = record._ahpLog;
    if (!meta) {
      continue;
    }
    const dir = meta.dir === "s2c" ? "s2c" : "c2s";
    const ts = typeof meta.ts === "string" ? Date.parse(meta.ts) : NaN;
    const id2 = record.id !== void 0 && record.id !== null ? String(record.id) : void 0;
    const method = typeof record.method === "string" ? record.method : void 0;
    const hasResult = Object.prototype.hasOwnProperty.call(record, "result");
    const errorValue = record.error;
    const kind = method ? id2 !== void 0 ? "request" : "notification" : "response";
    const payload = method ? record.params : hasResult ? record.result : void 0;
    frames.push({
      ts: Number.isNaN(ts) ? 0 : ts,
      dir,
      truncated: meta.truncated === true,
      byteLength: typeof meta.byteLength === "number" ? meta.byteLength : void 0,
      id: id2,
      method,
      actionType: extractActionType(method, payload),
      payload,
      error: errorValue && typeof errorValue === "object" ? errorValue : void 0,
      kind
    });
  }
  return frames;
}

function buildWireEntries(frames) {
  const entries2 = [];
  const pendingByKey = /* @__PURE__ */ new Map();
  const pendingKey = (dir, id2) => `${dir}|${id2}`;
  for (const frame of frames) {
    if (frame.kind === "response" && frame.id !== void 0) {
      const requestDir = frame.dir === "c2s" ? "s2c" : "c2s";
      const key3 = pendingKey(requestDir, frame.id);
      const request2 = pendingByKey.get(key3);
      if (request2) {
        request2.response = frame;
        pendingByKey.delete(key3);
        continue;
      }
    }
    const entry = { frame, response: void 0 };
    entries2.push(entry);
    if (frame.kind === "request" && frame.id !== void 0) {
      pendingByKey.set(pendingKey(frame.dir, frame.id), entry);
    }
  }
  return entries2;
}

function isErrorEntry(entry) {
  const frame = entry.frame;
  return !!entry.response?.error || frame.kind === "response" && !!frame.error || frame.actionType === "chat/error" /* ChatError */;
}

function matchesFilter(entry, filter2) {
  const frame = entry.frame;
  if (frame.method?.toLowerCase().includes(filter2)) {
    return true;
  }
  if (frame.actionType?.toLowerCase().includes(filter2)) {
    return true;
  }
  if (frame.id !== void 0 && frame.id.toLowerCase().includes(filter2)) {
    return true;
  }
  const errorMessage = entry.response?.error?.message ?? frame.error?.message;
  return !!errorMessage && errorMessage.toLowerCase().includes(filter2);
}

function baseEntryKey(entry) {
  const frame = entry.frame;
  return `${frame.dir}|${frame.kind}|${frame.id ?? ""}|${frame.ts}|${frame.method ?? ""}`;
}

function entryStateKey(entry) {
  const response = entry.response;
  const responseKey = response ? `R${response.ts}${response.error ? "E" : ""}` : "P";
  return `${baseEntryKey(entry)}|${responseKey}`;
}

function stringifyBounded(value2) {
  let text2;
  try {
    text2 = JSON.stringify(value2, void 0, 2) ?? String(value2);
  } catch {
    text2 = String(value2);
  }
  if (text2.length > MAX_DETAIL_JSON) {
    return `${text2.slice(0, MAX_DETAIL_JSON)}\u2026`;
  }
  return text2;
}

function formatDuration3(millis) {
  if (millis < 1e3) {
    return localize(10769, null, Math.round(millis));
  }
  return localize(10777, null, (millis / 1e3).toFixed(millis < 1e4 ? 1 : 0));
}

function formatClock(ts) {
  if (!ts) {
    return "";
  }
  const date = new Date(ts);
  const pad = (value2, length = 2) => String(value2).padStart(length, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}
export { extractActionType, getProp, typeStringOf, uriStringOf, parseWireFrames, buildWireEntries, isErrorEntry, matchesFilter, baseEntryKey, entryStateKey, stringifyBounded, formatDuration3, formatClock, $81, LIVE_REFRESH_DELAY, FILTER_DEBOUNCE_DELAY, PAGE_SIZE4, MAX_DETAIL_JSON, ChatDebugWireLogView };
