// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/timeline/browser/timelinePane.ts
import { fromNow } from "./module-0120.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { ViewPane } from "./module-1335.mjs";
import { Action2, IMenuService, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { Schemas } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";
import { $, append, clearNode } from "./module-0075.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Iterable } from "./module-0011.mjs";
import { WorkbenchObjectTree } from "./module-0636.mjs";
import { API_OPEN_DIFF_EDITOR_COMMAND_ID, API_OPEN_EDITOR_COMMAND_ID } from "./module-1538.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { debounce } from "./module-0250.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorService } from "./module-0934.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ITimelineService } from "./module-1423.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService, WorkbenchHoverDelegate } from "./module-0520.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IconLabel } from "./module-0640.mjs";
import { ActionBar } from "./module-0477.mjs";
import { ActionRunner } from "./module-0082.mjs";
import { Emitter } from "./module-0017.mjs";
import { createActionViewItem, getContextMenuActions } from "./module-0516.mjs";
import { isDark } from "./module-0247.mjs";
import { asCSSUrl } from "./module-0449.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { isString } from "./module-0010.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { createMatches } from "./module-0453.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";


// src/vs/workbench/contrib/timeline/browser/timelinePane.ts
var ItemHeight = 22;

function isLoadMoreCommand(item) {
  return item instanceof LoadMoreCommand;
}

function isTimelineItem(item) {
  return !!item && !item.handle.startsWith("vscode-command:");
}

function updateRelativeTime(item, lastRelativeTime) {
  item.relativeTime = isTimelineItem(item) ? fromNow(item.timestamp) : void 0;
  item.relativeTimeFullWord = isTimelineItem(item) ? fromNow(item.timestamp, false, true) : void 0;
  if (lastRelativeTime === void 0 || item.relativeTime !== lastRelativeTime) {
    lastRelativeTime = item.relativeTime;
    item.hideRelativeTime = false;
  } else {
    item.hideRelativeTime = true;
  }
  return lastRelativeTime;
}

var TimelineAggregate = class {
  constructor(timeline) {
    this._stale = false;
    this._requiresReset = false;
    this.source = timeline.source;
    this.items = timeline.items;
    this._cursor = timeline.paging?.cursor;
    this.lastRenderedIndex = -1;
  }
  get cursor() {
    return this._cursor;
  }
  get more() {
    return this._cursor !== void 0;
  }
  get newest() {
    return this.items[0];
  }
  get oldest() {
    return this.items[this.items.length - 1];
  }
  add(timeline, options3) {
    let updated = false;
    if (timeline.items.length !== 0 && this.items.length !== 0) {
      updated = true;
      const ids = /* @__PURE__ */ new Set();
      const timestamps = /* @__PURE__ */ new Set();
      for (const item2 of timeline.items) {
        if (item2.id === void 0) {
          timestamps.add(item2.timestamp);
        } else {
          ids.add(item2.id);
        }
      }
      let i2 = this.items.length;
      let item;
      while (i2--) {
        item = this.items[i2];
        if (item.id !== void 0 && ids.has(item.id) || timestamps.has(item.timestamp)) {
          this.items.splice(i2, 1);
        }
      }
      if ((timeline.items[timeline.items.length - 1]?.timestamp ?? 0) >= (this.newest?.timestamp ?? 0)) {
        this.items.splice(0, 0, ...timeline.items);
      } else {
        this.items.push(...timeline.items);
      }
    } else if (timeline.items.length !== 0) {
      updated = true;
      this.items.push(...timeline.items);
    }
    if (options3.cursor !== void 0 || typeof options3.limit !== "object") {
      this._cursor = timeline.paging?.cursor;
    }
    if (updated) {
      this.items.sort(
        (a, b) => b.timestamp - a.timestamp || (a.source === void 0 ? b.source === void 0 ? 0 : 1 : b.source === void 0 ? -1 : b.source.localeCompare(a.source, void 0, { numeric: true, sensitivity: "base" }))
      );
    }
    return updated;
  }
  get stale() {
    return this._stale;
  }
  get requiresReset() {
    return this._requiresReset;
  }
  invalidate(requiresReset) {
    this._stale = true;
    this._requiresReset = requiresReset;
  }
};

var LoadMoreCommand = class {
  constructor(loading) {
    this.handle = "vscode-command:loadMore";
    this.timestamp = 0;
    this.description = void 0;
    this.tooltip = void 0;
    this.contextValue = void 0;
    // Make things easier for duck typing
    this.id = void 0;
    this.icon = void 0;
    this.iconDark = void 0;
    this.source = void 0;
    this.relativeTime = void 0;
    this.relativeTimeFullWord = void 0;
    this.hideRelativeTime = void 0;
    this._loading = false;
    this._loading = loading;
  }
  get loading() {
    return this._loading;
  }
  set loading(value2) {
    this._loading = value2;
  }
  get ariaLabel() {
    return this.label;
  }
  get label() {
    return this.loading ? localize(21431, null) : localize(21432, null);
  }
  get themeIcon() {
    return void 0;
  }
};

var TimelineFollowActiveEditorContext = new RawContextKey("timelineFollowActiveEditor", true, true);

var TimelineExcludeSources = new RawContextKey("timelineExcludeSources", "[]", true);

var TimelineViewFocusedContext = new RawContextKey("timelineFocused", true);

var TimelinePane = class extends ViewPane {
  constructor(options3, keybindingService, contextMenuService, contextKeyService, configurationService, storageService, viewDescriptorService, instantiationService, editorService, commandService, progressService, timelineService, openerService, themeService, hoverService, labelService, uriIdentityService, extensionService) {
    super({ ...options3, titleMenuId: MenuId.TimelineTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.storageService = storageService;
    this.editorService = editorService;
    this.commandService = commandService;
    this.progressService = progressService;
    this.timelineService = timelineService;
    this.labelService = labelService;
    this.uriIdentityService = uriIdentityService;
    this.extensionService = extensionService;
    this.pendingRequests = /* @__PURE__ */ new Map();
    this.timelinesBySource = /* @__PURE__ */ new Map();
    this._followActiveEditor = true;
    this._isEmpty = true;
    this._maxItemCount = 0;
    this._visibleItemCount = 0;
    this._pendingRefresh = false;
    this.commands = this._register(this.instantiationService.createInstance(TimelinePaneCommands, this));
    this.followActiveEditorContext = TimelineFollowActiveEditorContext.bindTo(this.contextKeyService);
    this.timelineExcludeSourcesContext = TimelineExcludeSources.bindTo(this.contextKeyService);
    const excludedSourcesString = storageService.get("timeline.excludeSources", 0 /* PROFILE */, "[]");
    this.timelineExcludeSourcesContext.set(excludedSourcesString);
    this.excludedSources = new Set(JSON.parse(excludedSourcesString));
    this._register(storageService.onDidChangeValue(0 /* PROFILE */, "timeline.excludeSources", this._store)(this.onStorageServiceChanged, this));
    this._register(configurationService.onDidChangeConfiguration(this.onConfigurationChanged, this));
    this._register(timelineService.onDidChangeProviders(this.onProvidersChanged, this));
    this._register(timelineService.onDidChangeTimeline(this.onTimelineChanged, this));
    this._register(timelineService.onDidChangeUri((uri5) => this.setUri(uri5), this));
  }
  static {
    this.TITLE = localize2(21426, "Timeline");
  }
  get followActiveEditor() {
    return this._followActiveEditor;
  }
  set followActiveEditor(value2) {
    if (this._followActiveEditor === value2) {
      return;
    }
    this._followActiveEditor = value2;
    this.followActiveEditorContext.set(value2);
    this.updateFilename(this._filename);
    if (value2) {
      this.onActiveEditorChanged();
    }
  }
  get pageOnScroll() {
    if (this._pageOnScroll === void 0) {
      this._pageOnScroll = this.configurationService.getValue("timeline.pageOnScroll") ?? false;
    }
    return this._pageOnScroll;
  }
  get pageSize() {
    let pageSize = this.configurationService.getValue("timeline.pageSize");
    if (pageSize === void 0 || pageSize === null) {
      pageSize = Math.max(20, Math.floor((this.tree?.renderHeight ?? 0) / ItemHeight + (this.pageOnScroll ? 1 : -1)));
    }
    return pageSize;
  }
  reset() {
    this.loadTimeline(true);
  }
  setUri(uri5) {
    this.setUriCore(uri5, true);
  }
  setUriCore(uri5, disableFollowing) {
    if (disableFollowing) {
      this.followActiveEditor = false;
    }
    this.uri = uri5;
    this.updateFilename(uri5 ? this.labelService.getUriBasenameLabel(uri5) : void 0);
    this.treeRenderer?.setUri(uri5);
    this.loadTimeline(true);
  }
  onStorageServiceChanged() {
    const excludedSourcesString = this.storageService.get("timeline.excludeSources", 0 /* PROFILE */, "[]");
    this.timelineExcludeSourcesContext.set(excludedSourcesString);
    this.excludedSources = new Set(JSON.parse(excludedSourcesString));
    const missing = this.timelineService.getSources().filter(({ id: id2 }) => !this.excludedSources.has(id2) && !this.timelinesBySource.has(id2));
    if (missing.length !== 0) {
      this.loadTimeline(true, missing.map(({ id: id2 }) => id2));
    } else {
      this.refresh();
    }
  }
  onConfigurationChanged(e) {
    if (e.affectsConfiguration("timeline.pageOnScroll")) {
      this._pageOnScroll = void 0;
    }
  }
  onActiveEditorChanged() {
    if (!this.followActiveEditor || !this.isExpanded()) {
      return;
    }
    const uri5 = EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
    if (this.uriIdentityService.extUri.isEqual(uri5, this.uri) && uri5 !== void 0 || // Fallback to match on fsPath if we are dealing with files or git schemes
    uri5?.fsPath === this.uri?.fsPath && (uri5?.scheme === Schemas.file || uri5?.scheme === "git") && (this.uri?.scheme === Schemas.file || this.uri?.scheme === "git")) {
      for (const source of this.timelineService.getSources()) {
        if (this.excludedSources.has(source.id)) {
          continue;
        }
        const timeline = this.timelinesBySource.get(source.id);
        if (timeline !== void 0 && !timeline.stale) {
          continue;
        }
        if (timeline !== void 0) {
          this.updateTimeline(timeline, timeline.requiresReset);
        } else {
          this.loadTimelineForSource(source.id, uri5, true);
        }
      }
      return;
    }
    this.setUriCore(uri5, false);
  }
  onProvidersChanged(e) {
    if (e.removed) {
      for (const source of e.removed) {
        this.timelinesBySource.delete(source);
      }
      this.refresh();
    }
    if (e.added) {
      this.loadTimeline(true, e.added);
    }
  }
  onTimelineChanged(e) {
    if (e?.uri === void 0 || this.uriIdentityService.extUri.isEqual(URI.revive(e.uri), this.uri)) {
      const timeline = this.timelinesBySource.get(e.id);
      if (timeline === void 0) {
        return;
      }
      if (this.isBodyVisible()) {
        this.updateTimeline(timeline, e.reset);
      } else {
        timeline.invalidate(e.reset);
      }
    }
  }
  updateFilename(filename) {
    this._filename = filename;
    if (this.followActiveEditor || !filename) {
      this.updateTitleDescription(filename);
    } else {
      this.updateTitleDescription(`${filename} (pinned)`);
    }
  }
  get message() {
    return this._message;
  }
  set message(message) {
    this._message = message;
    this.updateMessage();
  }
  updateMessage() {
    if (this._message !== void 0) {
      this.showMessage(this._message);
    } else {
      this.hideMessage();
    }
  }
  showMessage(message) {
    if (!this.$message) {
      return;
    }
    this.$message.classList.remove("hide");
    this.resetMessageElement();
    this.$message.textContent = message;
  }
  hideMessage() {
    this.resetMessageElement();
    this.$message.classList.add("hide");
  }
  resetMessageElement() {
    clearNode(this.$message);
  }
  get hasVisibleItems() {
    return this._visibleItemCount > 0;
  }
  clear(cancelPending) {
    this._visibleItemCount = 0;
    this._maxItemCount = this.pageSize;
    this.timelinesBySource.clear();
    if (cancelPending) {
      for (const pendingRequest of this.pendingRequests.values()) {
        pendingRequest.request.tokenSource.cancel();
        pendingRequest.dispose();
      }
      this.pendingRequests.clear();
      if (!this.isBodyVisible() && this.tree) {
        this.tree.setChildren(null, void 0);
        this._isEmpty = true;
      }
    }
  }
  async loadTimeline(reset2, sources) {
    if (sources === void 0) {
      if (reset2) {
        this.clear(true);
      }
      if (this.uri?.scheme === Schemas.vscodeSettings || this.uri?.scheme === Schemas.webviewPanel || this.uri?.scheme === Schemas.walkThrough) {
        this.uri = void 0;
        this.clear(false);
        this.refresh();
        return;
      }
      if (this._isEmpty && this.uri !== void 0) {
        this.setLoadingUriMessage();
      }
    }
    if (this.uri === void 0) {
      this.clear(false);
      this.refresh();
      return;
    }
    if (!this.isBodyVisible()) {
      return;
    }
    let hasPendingRequests = false;
    for (const source of sources ?? this.timelineService.getSources().map((s) => s.id)) {
      const requested = this.loadTimelineForSource(source, this.uri, reset2);
      if (requested) {
        hasPendingRequests = true;
      }
    }
    if (!hasPendingRequests) {
      this.refresh();
    } else if (this._isEmpty) {
      this.setLoadingUriMessage();
    }
  }
  loadTimelineForSource(source, uri5, reset2, options3) {
    if (this.excludedSources.has(source)) {
      return false;
    }
    const timeline = this.timelinesBySource.get(source);
    if (!reset2 && options3?.cursor !== void 0 && timeline !== void 0 && (!timeline?.more || timeline.items.length > timeline.lastRenderedIndex + this.pageSize)) {
      return false;
    }
    if (options3 === void 0) {
      if (!reset2 && timeline !== void 0 && timeline.items.length > 0 && !timeline.more) {
        return false;
      }
      options3 = { cursor: reset2 ? void 0 : timeline?.cursor, limit: this.pageSize };
    }
    const pendingRequest = this.pendingRequests.get(source);
    if (pendingRequest !== void 0) {
      options3.cursor = pendingRequest.request.options.cursor;
      if (typeof options3.limit === "number") {
        if (typeof pendingRequest.request.options.limit === "number") {
          options3.limit += pendingRequest.request.options.limit;
        } else {
          options3.limit = pendingRequest.request.options.limit;
        }
      }
    }
    pendingRequest?.request?.tokenSource.cancel();
    pendingRequest?.dispose();
    options3.cacheResults = true;
    options3.resetCache = reset2;
    const tokenSource = new CancellationTokenSource();
    const newRequest = this.timelineService.getTimeline(source, uri5, options3, tokenSource);
    if (newRequest === void 0) {
      tokenSource.dispose();
      return false;
    }
    const disposables = new DisposableStore();
    this.pendingRequests.set(source, { request: newRequest, dispose: () => disposables.dispose() });
    disposables.add(tokenSource);
    disposables.add(tokenSource.token.onCancellationRequested(() => this.pendingRequests.delete(source)));
    this.handleRequest(newRequest);
    return true;
  }
  updateTimeline(timeline, reset2) {
    if (reset2) {
      this.timelinesBySource.delete(timeline.source);
      const { oldest } = timeline;
      this.loadTimelineForSource(timeline.source, this.uri, true, oldest !== void 0 ? { limit: { timestamp: oldest.timestamp, id: oldest.id } } : void 0);
    } else {
      const { newest } = timeline;
      this.loadTimelineForSource(timeline.source, this.uri, false, newest !== void 0 ? { limit: { timestamp: newest.timestamp, id: newest.id } } : { limit: this.pageSize });
    }
  }
  async handleRequest(request2) {
    let response;
    try {
      response = await this.progressService.withProgress({ location: this.id }, () => request2.result);
    } catch {
    }
    if (!request2.tokenSource.token.isCancellationRequested) {
      this.pendingRequests.get(request2.source)?.dispose();
      this.pendingRequests.delete(request2.source);
    }
    if (response === void 0 || request2.uri !== this.uri) {
      if (this.pendingRequests.size === 0 && this._pendingRefresh) {
        this.refresh();
      }
      return;
    }
    const source = request2.source;
    let updated = false;
    const timeline = this.timelinesBySource.get(source);
    if (timeline === void 0) {
      this.timelinesBySource.set(source, new TimelineAggregate(response));
      updated = true;
    } else {
      updated = timeline.add(response, request2.options);
    }
    if (updated) {
      this._pendingRefresh = true;
      if (this.hasVisibleItems && this.pendingRequests.size !== 0) {
        this.refreshDebounced();
      } else {
        this.refresh();
      }
    } else if (this.pendingRequests.size === 0) {
      if (this._pendingRefresh) {
        this.refresh();
      } else {
        this.tree.rerender();
      }
    }
  }
  *getItems() {
    let more = false;
    if (this.uri === void 0 || this.timelinesBySource.size === 0) {
      this._visibleItemCount = 0;
      return;
    }
    const maxCount = this._maxItemCount;
    let count2 = 0;
    if (this.timelinesBySource.size === 1) {
      const [source, timeline] = Iterable.first(this.timelinesBySource);
      timeline.lastRenderedIndex = -1;
      if (this.excludedSources.has(source)) {
        this._visibleItemCount = 0;
        return;
      }
      if (timeline.items.length !== 0) {
        this._visibleItemCount = 1;
      }
      more = timeline.more;
      let lastRelativeTime;
      for (const item of timeline.items) {
        item.relativeTime = void 0;
        item.hideRelativeTime = void 0;
        count2++;
        if (count2 > maxCount) {
          more = true;
          break;
        }
        lastRelativeTime = updateRelativeTime(item, lastRelativeTime);
        yield { element: item };
      }
      timeline.lastRenderedIndex = count2 - 1;
    } else {
      let getNextMostRecentSource = function() {
        return sources.filter((source) => !source.nextItem.done).reduce((previous, current) => previous === void 0 || current.nextItem.value.timestamp >= previous.nextItem.value.timestamp ? current : previous, void 0);
      };
      const sources = [];
      let hasAnyItems = false;
      let mostRecentEnd = 0;
      for (const [source, timeline] of this.timelinesBySource) {
        timeline.lastRenderedIndex = -1;
        if (this.excludedSources.has(source) || timeline.stale) {
          continue;
        }
        if (timeline.items.length !== 0) {
          hasAnyItems = true;
        }
        if (timeline.more) {
          more = true;
          const last = timeline.items[Math.min(maxCount, timeline.items.length - 1)];
          if (last.timestamp > mostRecentEnd) {
            mostRecentEnd = last.timestamp;
          }
        }
        const iterator = timeline.items[Symbol.iterator]();
        sources.push({ timeline, iterator, nextItem: iterator.next() });
      }
      this._visibleItemCount = hasAnyItems ? 1 : 0;
      let lastRelativeTime;
      let nextSource;
      while (nextSource = getNextMostRecentSource()) {
        nextSource.timeline.lastRenderedIndex++;
        const item = nextSource.nextItem.value;
        item.relativeTime = void 0;
        item.hideRelativeTime = void 0;
        if (item.timestamp >= mostRecentEnd) {
          count2++;
          if (count2 > maxCount) {
            more = true;
            break;
          }
          lastRelativeTime = updateRelativeTime(item, lastRelativeTime);
          yield { element: item };
        }
        nextSource.nextItem = nextSource.iterator.next();
      }
    }
    this._visibleItemCount = count2;
    if (count2 > 0) {
      if (more) {
        yield {
          element: new LoadMoreCommand(this.pendingRequests.size !== 0)
        };
      } else if (this.pendingRequests.size !== 0) {
        yield {
          element: new LoadMoreCommand(true)
        };
      }
    }
  }
  refresh() {
    if (!this.isBodyVisible()) {
      return;
    }
    this.tree.setChildren(null, this.getItems());
    this._isEmpty = !this.hasVisibleItems;
    if (this.uri === void 0) {
      this.updateFilename(void 0);
      this.message = localize(21429, null);
    } else if (this._isEmpty) {
      if (this.pendingRequests.size !== 0) {
        this.setLoadingUriMessage();
      } else {
        this.updateFilename(this.labelService.getUriBasenameLabel(this.uri));
        const scmProviderCount = this.contextKeyService.getContextKeyValue("scm.providerCount");
        if (this.timelineService.getSources().filter(({ id: id2 }) => !this.excludedSources.has(id2)).length === 0) {
          this.message = localize(21437, null);
        } else {
          if (this.configurationService.getValue("workbench.localHistory.enabled") && !this.excludedSources.has("timeline.localHistory")) {
            this.message = localize(21433, null);
          } else if (this.excludedSources.size > 0) {
            this.message = localize(21436, null);
          } else {
            this.message = localize(21435, null);
          }
        }
        if (!scmProviderCount || scmProviderCount === 0) {
          this.message += " " + localize(21434, null);
        }
      }
    } else {
      this.updateFilename(this.labelService.getUriBasenameLabel(this.uri));
      this.message = void 0;
    }
    this._pendingRefresh = false;
  }
  refreshDebounced() {
    this.refresh();
  }
  focus() {
    super.focus();
    this.tree.domFocus();
  }
  setExpanded(expanded2) {
    const changed = super.setExpanded(expanded2);
    if (changed && this.isBodyVisible()) {
      if (!this.followActiveEditor) {
        this.setUriCore(this.uri, true);
      } else {
        this.onActiveEditorChanged();
      }
    }
    return changed;
  }
  setVisible(visible) {
    if (visible) {
      this.extensionService.activateByEvent("onView:timeline");
      this.visibilityDisposables?.dispose();
      this.visibilityDisposables = new DisposableStore();
      this.editorService.onDidActiveEditorChange(this.onActiveEditorChanged, this, this.visibilityDisposables);
      this.onDidFocus(() => this.refreshDebounced(), this, this.visibilityDisposables);
      super.setVisible(visible);
      this.onActiveEditorChanged();
    } else {
      this.visibilityDisposables?.dispose();
      super.setVisible(visible);
    }
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.tree.layout(height, width2);
  }
  renderHeaderTitle(container3) {
    super.renderHeaderTitle(container3, this.title);
    container3.classList.add("timeline-view");
  }
  renderBody(container3) {
    super.renderBody(container3);
    this.$container = container3;
    container3.classList.add("tree-explorer-viewlet-tree-view", "timeline-tree-view");
    this.$message = append(this.$container, $(".message"));
    this.$message.classList.add("timeline-subtle");
    this.message = localize(21429, null);
    this.$tree = document.createElement("div");
    this.$tree.classList.add("customview-tree", "file-icon-themable-tree", "hide-arrows");
    container3.appendChild(this.$tree);
    this.treeRenderer = this._register(this.instantiationService.createInstance(TimelineTreeRenderer, this.commands, this.viewDescriptorService.getViewLocationById(this.id)));
    this._register(this.treeRenderer.onDidScrollToEnd((item) => {
      if (this.pageOnScroll) {
        this.loadMore(item);
      }
    }));
    this.tree = this.instantiationService.createInstance(
      WorkbenchObjectTree,
      "TimelinePane",
      this.$tree,
      new TimelineListVirtualDelegate(),
      [this.treeRenderer],
      {
        identityProvider: new TimelineIdentityProvider(),
        accessibilityProvider: {
          getAriaLabel(element) {
            if (isLoadMoreCommand(element)) {
              return element.ariaLabel;
            }
            return element.accessibilityInformation ? element.accessibilityInformation.label : localize(21428, null, element.relativeTimeFullWord ?? "", element.label);
          },
          getRole(element) {
            if (isLoadMoreCommand(element)) {
              return "treeitem";
            }
            return element.accessibilityInformation && element.accessibilityInformation.role ? element.accessibilityInformation.role : "treeitem";
          },
          getWidgetAriaLabel() {
            return localize(21427, null);
          }
        },
        keyboardNavigationLabelProvider: new TimelineKeyboardNavigationLabelProvider(),
        multipleSelectionSupport: false,
        overrideStyles: this.getLocationBasedColors().listOverrideStyles
      }
    );
    TimelineViewFocusedContext.bindTo(this.tree.contextKeyService);
    this._register(this.tree.onContextMenu((e) => this.onContextMenu(this.commands, e)));
    this._register(this.tree.onDidChangeSelection((e) => this.ensureValidItems()));
    this._register(this.tree.onDidOpen((e) => {
      if (!e.browserEvent || !this.ensureValidItems()) {
        return;
      }
      const selection = this.tree.getSelection();
      let item;
      if (selection.length === 1) {
        item = selection[0];
      }
      if (item === null) {
        return;
      }
      if (isTimelineItem(item)) {
        if (item.command) {
          let args2 = item.command.arguments ?? [];
          if (item.command.id === API_OPEN_EDITOR_COMMAND_ID || item.command.id === API_OPEN_DIFF_EDITOR_COMMAND_ID) {
            args2 = [...args2, e];
          }
          this.commandService.executeCommand(item.command.id, ...args2);
        }
      } else if (isLoadMoreCommand(item)) {
        this.loadMore(item);
      }
    }));
  }
  loadMore(item) {
    if (item.loading) {
      return;
    }
    item.loading = true;
    this.tree.rerender(item);
    if (this.pendingRequests.size !== 0) {
      return;
    }
    this._maxItemCount = this._visibleItemCount + this.pageSize;
    this.loadTimeline(false);
  }
  ensureValidItems() {
    if (!this.hasVisibleItems || !this.timelineService.getSources().some(({ id: id2 }) => !this.excludedSources.has(id2) && this.timelinesBySource.has(id2))) {
      this.tree.setChildren(null, void 0);
      this._isEmpty = true;
      this.setLoadingUriMessage();
      return false;
    }
    return true;
  }
  setLoadingUriMessage() {
    const file = this.uri && this.labelService.getUriBasenameLabel(this.uri);
    this.updateFilename(file);
    this.message = file ? localize(21430, null, file) : "";
  }
  onContextMenu(commands, treeEvent) {
    const item = treeEvent.element;
    if (item === null) {
      return;
    }
    const event = treeEvent.browserEvent;
    event.preventDefault();
    event.stopPropagation();
    if (!this.ensureValidItems()) {
      return;
    }
    this.tree.setFocus([item]);
    const actions = commands.getItemContextActions(item);
    if (!actions.length) {
      return;
    }
    this.contextMenuService.showContextMenu({
      getAnchor: () => treeEvent.anchor,
      getActions: () => actions,
      getActionViewItem: (action) => {
        const keybinding = this.keybindingService.lookupKeybinding(action.id);
        if (keybinding) {
          return new ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
        }
        return void 0;
      },
      onHide: (wasCancelled) => {
        if (wasCancelled) {
          this.tree.domFocus();
        }
      },
      getActionsContext: () => ({ uri: this.uri, item }),
      actionRunner: new TimelineActionRunner()
    });
  }
};

__decorateClass([
  debounce(500)
], TimelinePane.prototype, "refreshDebounced", 1);

TimelinePane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IViewDescriptorService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IEditorService),
  __decorateParam(9, ICommandService),
  __decorateParam(10, IProgressService),
  __decorateParam(11, ITimelineService),
  __decorateParam(12, IOpenerService),
  __decorateParam(13, IThemeService),
  __decorateParam(14, IHoverService),
  __decorateParam(15, ILabelService),
  __decorateParam(16, IUriIdentityService),
  __decorateParam(17, IExtensionService)
], TimelinePane);

var TimelineElementTemplate = class {
  static {
    this.id = "TimelineElementTemplate";
  }
  constructor(container3, actionViewItemProvider, hoverDelegate) {
    container3.classList.add("custom-view-tree-node-item");
    this.icon = append(container3, $(".custom-view-tree-node-item-icon"));
    this.iconLabel = new IconLabel(container3, { supportHighlights: true, supportIcons: true, hoverDelegate });
    const timestampContainer = append(this.iconLabel.element, $(".timeline-timestamp-container"));
    this.timestamp = append(timestampContainer, $("span.timeline-timestamp"));
    const actionsContainer = append(this.iconLabel.element, $(".actions"));
    this.actionBar = new ActionBar(actionsContainer, { actionViewItemProvider });
  }
  dispose() {
    this.iconLabel.dispose();
    this.actionBar.dispose();
  }
  reset() {
    this.icon.className = "";
    this.icon.style.backgroundImage = "";
    this.actionBar.clear();
  }
};

var TimelineIdentityProvider = class {
  getId(item) {
    return item.handle;
  }
};

var TimelineActionRunner = class extends ActionRunner {
  async runAction(action, { uri: uri5, item }) {
    if (!isTimelineItem(item)) {
      await action.run();
      return;
    }
    await action.run(
      {
        $mid: 12 /* TimelineActionContext */,
        handle: item.handle,
        source: item.source,
        uri: uri5
      },
      uri5,
      item.source
    );
  }
};

var TimelineKeyboardNavigationLabelProvider = class {
  getKeyboardNavigationLabel(element) {
    return element.label;
  }
};

var TimelineListVirtualDelegate = class {
  getHeight(_element) {
    return ItemHeight;
  }
  getTemplateId(element) {
    return TimelineElementTemplate.id;
  }
};

var TimelineTreeRenderer = class extends Disposable {
  constructor(commands, viewContainerLocation, instantiationService, themeService) {
    super();
    this.commands = commands;
    this.viewContainerLocation = viewContainerLocation;
    this.instantiationService = instantiationService;
    this.themeService = themeService;
    this._onDidScrollToEnd = this._register(new Emitter());
    this.onDidScrollToEnd = this._onDidScrollToEnd.event;
    this.templateId = TimelineElementTemplate.id;
    this.actionViewItemProvider = createActionViewItem.bind(void 0, this.instantiationService);
    this._hoverDelegate = this.instantiationService.createInstance(
      WorkbenchHoverDelegate,
      this.viewContainerLocation === 1 /* Panel */ ? "mouse" : "element",
      {
        instantHover: this.viewContainerLocation !== 1 /* Panel */
      },
      {
        position: {
          hoverPosition: 1 /* RIGHT */
          // Will flip when there's no space
        }
      }
    );
  }
  setUri(uri5) {
    this.uri = uri5;
  }
  renderTemplate(container3) {
    return new TimelineElementTemplate(container3, this.actionViewItemProvider, this._hoverDelegate);
  }
  renderElement(node, index2, template2) {
    template2.reset();
    const { element: item } = node;
    const theme = this.themeService.getColorTheme();
    const icon2 = isDark(theme.type) ? item.iconDark : item.icon;
    const iconUrl = icon2 ? URI.revive(icon2) : null;
    if (iconUrl) {
      template2.icon.className = "custom-view-tree-node-item-icon";
      template2.icon.style.backgroundImage = asCSSUrl(iconUrl);
      template2.icon.style.color = "";
    } else if (item.themeIcon) {
      template2.icon.className = `custom-view-tree-node-item-icon ${ThemeIcon.asClassName(item.themeIcon)}`;
      if (item.themeIcon.color) {
        template2.icon.style.color = theme.getColor(item.themeIcon.color.id)?.toString() ?? "";
      } else {
        template2.icon.style.color = "";
      }
      template2.icon.style.backgroundImage = "";
    } else {
      template2.icon.className = "custom-view-tree-node-item-icon";
      template2.icon.style.backgroundImage = "";
      template2.icon.style.color = "";
    }
    const tooltip = item.tooltip ? isString(item.tooltip) ? item.tooltip : { markdown: item.tooltip, markdownNotSupportedFallback: renderAsPlaintext(item.tooltip) } : void 0;
    template2.iconLabel.setLabel(item.label, item.description, {
      title: tooltip,
      matches: createMatches(node.filterData)
    });
    template2.timestamp.textContent = item.relativeTime ?? "";
    template2.timestamp.ariaLabel = item.relativeTimeFullWord ?? "";
    template2.timestamp.parentElement.classList.toggle("timeline-timestamp--duplicate", isTimelineItem(item) && item.hideRelativeTime);
    template2.actionBar.context = { uri: this.uri, item };
    template2.actionBar.actionRunner = new TimelineActionRunner();
    template2.actionBar.push(this.commands.getItemActions(item), { icon: true, label: false });
    if (isLoadMoreCommand(item)) {
      setTimeout(() => this._onDidScrollToEnd.fire(item), 0);
    }
  }
  disposeElement(element, index2, templateData) {
    templateData.actionBar.actionRunner.dispose();
  }
  disposeTemplate(template2) {
    template2.dispose();
  }
};

TimelineTreeRenderer = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IThemeService)
], TimelineTreeRenderer);

var timelineRefresh = registerIcon("timeline-refresh", Codicon.refresh, localize(21441, null));

var timelinePin = registerIcon("timeline-pin", Codicon.pin, localize(21440, null));

var timelineUnpin = registerIcon("timeline-unpin", Codicon.pinned, localize(21442, null));

var TimelinePaneCommands = class extends Disposable {
  constructor(pane, timelineService, storageService, contextKeyService, menuService) {
    super();
    this.pane = pane;
    this.timelineService = timelineService;
    this.storageService = storageService;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this._register(this.sourceDisposables = new DisposableStore());
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "timeline.refresh",
          title: localize2(21425, "Refresh"),
          icon: timelineRefresh,
          category: localize2(21426, "Timeline"),
          menu: {
            id: MenuId.TimelineTitle,
            group: "navigation",
            order: 99
          }
        });
      }
      run(accessor, ...args2) {
        pane.reset();
      }
    }));
    this._register(CommandsRegistry.registerCommand(
      "timeline.toggleFollowActiveEditor",
      (accessor, ...args2) => pane.followActiveEditor = !pane.followActiveEditor
    ));
    this._register(MenuRegistry.appendMenuItem(MenuId.TimelineTitle, {
      command: {
        id: "timeline.toggleFollowActiveEditor",
        title: localize2(21438, "Pin the Current Timeline"),
        icon: timelinePin,
        category: localize2(21426, "Timeline")
      },
      group: "navigation",
      order: 98,
      when: TimelineFollowActiveEditorContext
    }));
    this._register(MenuRegistry.appendMenuItem(MenuId.TimelineTitle, {
      command: {
        id: "timeline.toggleFollowActiveEditor",
        title: localize2(21439, "Unpin the Current Timeline"),
        icon: timelineUnpin,
        category: localize2(21426, "Timeline")
      },
      group: "navigation",
      order: 98,
      when: TimelineFollowActiveEditorContext.toNegated()
    }));
    this._register(timelineService.onDidChangeProviders(() => this.updateTimelineSourceFilters()));
    this.updateTimelineSourceFilters();
  }
  getItemActions(element) {
    return this.getActions(MenuId.TimelineItemContext, { key: "timelineItem", value: element.contextValue }).primary;
  }
  getItemContextActions(element) {
    return this.getActions(MenuId.TimelineItemContext, { key: "timelineItem", value: element.contextValue }).secondary;
  }
  getActions(menuId, context2) {
    const contextKeyService = this.contextKeyService.createOverlay([
      ["view", this.pane.id],
      [context2.key, context2.value]
    ]);
    const menu = this.menuService.getMenuActions(menuId, contextKeyService, { shouldForwardArgs: true });
    return getContextMenuActions(menu, "inline");
  }
  updateTimelineSourceFilters() {
    this.sourceDisposables.clear();
    const excluded = new Set(JSON.parse(this.storageService.get("timeline.excludeSources", 0 /* PROFILE */, "[]")));
    for (const source of this.timelineService.getSources()) {
      this.sourceDisposables.add(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: `timeline.toggleExcludeSource:${source.id}`,
            title: source.label,
            menu: {
              id: MenuId.TimelineFilterSubMenu,
              group: "navigation"
            },
            toggled: ContextKeyExpr.regex(`timelineExcludeSources`, new RegExp(`\\b${escapeRegExpCharacters(source.id)}\\b`)).negate()
          });
        }
        run(accessor, ...args2) {
          if (!excluded.delete(source.id)) {
            excluded.add(source.id);
          }
          const storageService = accessor.get(IStorageService);
          storageService.store("timeline.excludeSources", JSON.stringify([...excluded.keys()]), 0 /* PROFILE */, 0 /* USER */);
        }
      }));
    }
  }
};

TimelinePaneCommands = __decorateClass([
  __decorateParam(1, ITimelineService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IMenuService)
], TimelinePaneCommands);
export { isLoadMoreCommand, isTimelineItem, updateRelativeTime, ItemHeight, TimelineAggregate, LoadMoreCommand, TimelineFollowActiveEditorContext, TimelineExcludeSources, TimelineViewFocusedContext, TimelinePane, TimelineElementTemplate, TimelineIdentityProvider, TimelineActionRunner, TimelineKeyboardNavigationLabelProvider, TimelineListVirtualDelegate, TimelineTreeRenderer, timelineRefresh, timelinePin, timelineUnpin, TimelinePaneCommands };
