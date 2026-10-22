// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/mobile/contributions/mobileMultiDiffView.ts
import { $, EventType, addDisposableListener, append, clearNode, getWindow } from "./module-0075.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";
import { computeMobileMultiDiffItemHeight, computeMobileMultiDiffVirtualLayout } from "./module-3641.mjs";
import { computeUnifiedDiff2, hasMultipleTokenClasses2, regexTokenizeLines2, resolveMobileDiffLanguageId, tokenizeFileLines2 } from "./module-3640.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { generateTokensCSSForColorMap } from "./module-0401.mjs";


// src/vs/sessions/browser/parts/mobile/contributions/mobileMultiDiffView.ts
var $120 = $;

var VIRTUALIZER_METRICS = {
  fileHeaderHeight: 44,
  hunkHeaderHeight: 26,
  rowHeight: 18,
  bodyVerticalPadding: 0,
  placeholderHeight: 76
};

var MAX_CONCURRENT_FILE_LOADS = 2;

var MAX_CONCURRENT_PREFETCH_LOADS = 1;

var MIN_PREFETCH_DISTANCE = 2400;

var PREFETCH_VIEWPORT_MULTIPLIER = 4;

var MobileMultiDiffView = class extends Disposable {
  constructor(workbenchContainer, data, textFileService, fileService, languageService) {
    super();
    this.data = data;
    this.textFileService = textFileService;
    this.fileService = fileService;
    this.languageService = languageService;
    this._onDidDispose = this._register(new Emitter());
    this.onDidDispose = this._onDidDispose.event;
    this.viewStore = this._register(new DisposableStore());
    this.disposed = false;
    this.renderGeneration = 0;
    this.mountedIndexes = /* @__PURE__ */ new Set();
    this.fileStates = data.diffs.map((diff4, index2) => ({
      index: index2,
      diff: diff4,
      section: void 0,
      content: void 0,
      sectionStore: void 0,
      collapsed: false,
      loadState: "idle",
      loadKind: void 0,
      loadRequestId: 0,
      estimatedHunkCount: diff4.identical || diff4.added + diff4.removed === 0 ? 0 : 1,
      estimatedRowCount: diff4.added + diff4.removed,
      hunkCount: 0,
      rowCount: 0,
      renderData: void 0,
      bodyScrollTop: 0,
      bodyViewportHeight: 0,
      fileMessage: void 0,
      bodyInner: void 0,
      renderedBodyRows: /* @__PURE__ */ new Map(),
      renderedBodyStartIndex: void 0,
      renderedBodyEndIndex: void 0
    }));
    this.render(workbenchContainer);
    this.renderGeneration++;
    this.updateVirtualLayout();
    this.scrollToInitialIndex();
    this.scheduleLoadVisibleFiles();
  }
  render(workbenchContainer) {
    const overlay = append(workbenchContainer, $120("div.mobile-overlay-view.mobile-multi-diff-view"));
    this.viewStore.add(addDisposableListener(overlay, EventType.CONTEXT_MENU, (e4) => e4.preventDefault()));
    this.viewStore.add(toDisposable(() => overlay.remove()));
    const topBar = append(overlay, $120("div.mobile-multi-diff-topbar"));
    const backBtn = append(topBar, $120("button.mobile-overlay-back-btn", { type: "button" }));
    backBtn.setAttribute("aria-label", localize(3808, null));
    append(backBtn, $120("span")).classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronLeft));
    this.viewStore.add(Gesture.addTarget(backBtn));
    this.viewStore.add(addDisposableListener(backBtn, EventType.CLICK, () => this.dispose()));
    this.viewStore.add(addDisposableListener(backBtn, EventType2.Tap, () => this.dispose()));
    const fileCount = append(topBar, $120("span.mobile-multi-diff-file-count"));
    fileCount.textContent = localize(
      3810,
      null,
      this.data.diffs.length,
      this.data.diffs.length === 1 ? localize(3809, null) : localize(3812, null)
    );
    const body = append(overlay, $120("div.mobile-overlay-body"));
    this.scrollWrapper = append(body, $120("div.mobile-overlay-scroll"));
    this.virtualContent = append(this.scrollWrapper, $120("div.mobile-multi-diff-virtual-content"));
    this.viewStore.add(addDisposableListener(this.scrollWrapper, EventType.SCROLL, () => this.scheduleVirtualLayout(), { passive: true }));
  }
  scrollToInitialIndex() {
    if (this.data.initialIndex === void 0 || this.data.initialIndex <= 0) {
      return;
    }
    getWindow(this.scrollWrapper).requestAnimationFrame(() => {
      if (this.disposed) {
        return;
      }
      this.scrollWrapper.scrollTop = this.computeVirtualTop(this.data.initialIndex);
      this.updateVirtualLayout();
      this.scheduleLoadVisibleFiles();
    });
  }
  formatDirSegment(uri4) {
    const parent = dirname2(uri4);
    const parentPath = parent.path.replace(/^\/+/, "");
    if (!parentPath || parentPath === ".") {
      return "";
    }
    const segments = parentPath.split("/").filter((s) => s.length > 0);
    if (segments.length === 0) {
      return "";
    }
    const tail2 = segments.slice(-2).join("/");
    const prefix = segments.length > 2 ? "\u2026/" : "";
    return `${prefix}${tail2}/`;
  }
  renderFileSection(state) {
    const diff4 = state.diff;
    const store = new DisposableStore();
    const section = $120("div.mobile-multi-diff-file-section");
    section.dataset.index = String(state.index);
    const header2 = append(section, $120("div.mobile-multi-diff-file-header"));
    const fileNameUri = diff4.modifiedURI ?? diff4.originalURI;
    const fileName = fileNameUri ? basename2(fileNameUri) : "";
    const dirPath = fileNameUri ? this.formatDirSegment(fileNameUri) : "";
    const chevronEl = append(header2, $120("span.mobile-multi-diff-file-chevron", {
      role: "button",
      tabindex: "0",
      "aria-expanded": "true"
    }));
    chevronEl.classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronDown));
    chevronEl.setAttribute("aria-label", localize(3816, null, fileName || localize(3811, null)));
    const nameEl = append(header2, $120("span.mobile-multi-diff-file-name"));
    if (dirPath) {
      append(nameEl, $120("span.mobile-multi-diff-file-dir")).textContent = dirPath;
    }
    append(nameEl, $120("span.mobile-multi-diff-file-base")).textContent = fileName;
    const statsEl = append(header2, $120("span.mobile-multi-diff-file-stats"));
    if (!diff4.identical) {
      if (diff4.added) {
        append(statsEl, $120("span.mobile-multi-diff-stat-added")).textContent = `+${diff4.added}`;
      }
      if (diff4.removed) {
        append(statsEl, $120("span.mobile-multi-diff-stat-removed")).textContent = `-${diff4.removed}`;
      }
    }
    const content = append(section, $120("div.mobile-multi-diff-file-content"));
    const loadingEl = append(content, $120("div.mobile-diff-empty-state"));
    loadingEl.textContent = localize(3814, null);
    const toggle = (e4) => {
      e4.stopPropagation();
      state.collapsed = !state.collapsed;
      section.classList.toggle("collapsed", state.collapsed);
      chevronEl.setAttribute("aria-expanded", state.collapsed ? "false" : "true");
      chevronEl.classList.remove(...ThemeIcon.asClassNameArray(state.collapsed ? Codicon.chevronDown : Codicon.chevronRight));
      chevronEl.classList.add(...ThemeIcon.asClassNameArray(state.collapsed ? Codicon.chevronRight : Codicon.chevronDown));
      this.scheduleVirtualLayout();
      if (!state.collapsed) {
        this.scheduleLoadVisibleFiles();
      }
    };
    store.add(Gesture.addTarget(header2));
    store.add(addDisposableListener(header2, EventType.CLICK, toggle));
    store.add(addDisposableListener(header2, EventType2.Tap, (e4) => {
      e4.preventDefault();
      toggle(e4);
    }));
    store.add(addDisposableListener(chevronEl, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        toggle(e4);
      }
    }));
    return { section, content, store };
  }
  ensureFileSection(state) {
    if (!state.section || !state.content) {
      const { section, content, store } = this.renderFileSection(state);
      state.section = section;
      state.content = content;
      state.sectionStore = store;
      this.renderCurrentFileContent(state);
    }
    return state.section;
  }
  disposeFileSection(state) {
    state.sectionStore?.dispose();
    state.sectionStore = void 0;
    state.section?.remove();
    state.section = void 0;
    state.content = void 0;
    this.resetBodyRenderState(state);
  }
  scheduleVirtualLayout() {
    if (this.disposed) {
      return;
    }
    if (this.layoutAnimationFrame !== void 0) {
      return;
    }
    const targetWindow = getWindow(this.scrollWrapper);
    this.layoutAnimationFrame = targetWindow.requestAnimationFrame(() => {
      this.layoutAnimationFrame = void 0;
      this.updateVirtualLayout();
    });
  }
  updateVirtualLayout() {
    if (this.disposed) {
      return;
    }
    const viewportHeight = this.scrollWrapper.clientHeight;
    const layout2 = this.computeCurrentVirtualLayout(viewportHeight);
    this.currentLayout = layout2;
    this.virtualContent.style.height = `${layout2.totalHeight}px`;
    const visibleIndexes = new Set(layout2.items.map((item) => item.index));
    this.abandonOffscreenLoads(visibleIndexes);
    for (const index2 of Array.from(this.mountedIndexes)) {
      if (!visibleIndexes.has(index2)) {
        this.disposeFileSection(this.fileStates[index2]);
        this.mountedIndexes.delete(index2);
      }
    }
    let previousSection;
    for (const item of layout2.items) {
      const state = this.fileStates[item.index];
      const section = this.ensureFileSection(state);
      this.applyVirtualLayout(section, state, item, viewportHeight);
      if (!this.mountedIndexes.has(item.index)) {
        this.mountedIndexes.add(item.index);
      }
      this.ensureFileSectionDomOrder(section, previousSection);
      previousSection = section;
    }
    this.scheduleLoadVisibleFiles();
  }
  ensureFileSectionDomOrder(section, previousSection) {
    const referenceNode = previousSection ? previousSection.nextSibling : this.virtualContent.firstChild;
    if (section !== referenceNode) {
      this.virtualContent.insertBefore(section, referenceNode);
    }
  }
  applyVirtualLayout(section, state, item, viewportHeight) {
    section.style.top = `${item.renderTop}px`;
    section.style.height = `${item.renderHeight}px`;
    const bodyOffset = Math.max(0, item.innerOffset - VIRTUALIZER_METRICS.fileHeaderHeight);
    state.bodyScrollTop = bodyOffset;
    state.bodyViewportHeight = Math.max(0, viewportHeight - VIRTUALIZER_METRICS.fileHeaderHeight);
    const content = state.content;
    content.classList.toggle("mobile-multi-diff-file-content-placeholder", state.loadState !== "loaded");
    if (state.loadState === "loaded") {
      content.style.height = "";
      content.style.transform = "";
      this.renderLoadedFileContent(state, viewportHeight);
    } else {
      const bodyHeight = Math.max(0, item.renderHeight - VIRTUALIZER_METRICS.fileHeaderHeight);
      const placeholderHeight = Math.min(
        bodyHeight || VIRTUALIZER_METRICS.placeholderHeight,
        Math.max(VIRTUALIZER_METRICS.placeholderHeight, state.bodyViewportHeight)
      );
      content.style.height = `${bodyHeight}px`;
      content.style.transform = "";
      this.updateFileMessageHeight(state, placeholderHeight);
    }
  }
  renderCurrentFileContent(state) {
    if (!state.content) {
      return;
    }
    switch (state.loadState) {
      case "loaded":
        this.renderLoadedFileContent(state);
        break;
      case "empty":
        this.renderFileMessage(state, localize(3815, null));
        break;
      case "error":
        this.renderFileMessage(state, localize(3813, null));
        break;
      case "idle":
      case "loading":
        this.renderFileMessage(state, localize(3814, null));
        break;
    }
  }
  renderFileMessage(state, message) {
    if (!state.content) {
      return;
    }
    clearNode(state.content);
    this.resetBodyRenderState(state);
    const empty = append(state.content, $120("div.mobile-diff-empty-state"));
    state.fileMessage = empty;
    empty.textContent = message;
    this.updateFileMessageHeight(state);
  }
  updateFileMessageHeight(state, placeholderHeight) {
    if (!state.content) {
      return;
    }
    const empty = state.fileMessage;
    if (!empty || empty.parentElement !== state.content) {
      return;
    }
    const bodyHeight = Number.parseFloat(state.content.style.height) || VIRTUALIZER_METRICS.placeholderHeight;
    const visibleHeight = placeholderHeight ?? Math.min(
      bodyHeight,
      Math.max(VIRTUALIZER_METRICS.placeholderHeight, state.bodyViewportHeight)
    );
    empty.style.height = `${visibleHeight}px`;
  }
  renderLoadedFileContent(state, viewportHeight = this.scrollWrapper.clientHeight) {
    if (!state.content || !state.renderData) {
      return;
    }
    const bodyOverscan = Math.max(viewportHeight, 480);
    const visibleTop = Math.max(0, state.bodyScrollTop - bodyOverscan);
    const visibleBottom = Math.min(
      state.renderData.bodyHeight,
      state.bodyScrollTop + state.bodyViewportHeight + bodyOverscan
    );
    const { startIndex, endIndex } = this.computeVisibleBodyEntryRange(state.renderData.bodyEntries, visibleTop, visibleBottom);
    const inner = this.ensureBodyInner(state);
    if (state.renderedBodyStartIndex === startIndex && state.renderedBodyEndIndex === endIndex) {
      return;
    }
    inner.style.height = `${state.renderData.bodyHeight}px`;
    inner.style.minWidth = `calc(${state.renderData.maxLineCharacterCount + 8}ch + 64px)`;
    this.reconcileBodyEntries(state, startIndex, endIndex);
    state.renderedBodyStartIndex = startIndex;
    state.renderedBodyEndIndex = endIndex;
  }
  toVirtualItem(state) {
    return {
      collapsed: state.collapsed,
      state: state.loadState === "idle" ? "unloaded" : state.loadState,
      estimatedHunkCount: state.estimatedHunkCount,
      estimatedRowCount: state.estimatedRowCount,
      hunkCount: state.hunkCount,
      rowCount: state.rowCount
    };
  }
  computeCurrentVirtualLayout(viewportHeight) {
    return computeMobileMultiDiffVirtualLayout(this.fileStates.map((state) => this.toVirtualItem(state)), {
      viewportHeight,
      scrollTop: this.scrollWrapper.scrollTop,
      overscan: Math.max(viewportHeight, 480),
      metrics: VIRTUALIZER_METRICS
    });
  }
  computeVirtualTop(index2) {
    let top2 = 0;
    const end = Math.min(index2, this.fileStates.length);
    for (let i2 = 0; i2 < end; i2++) {
      top2 += computeMobileMultiDiffItemHeight(this.toVirtualItem(this.fileStates[i2]), VIRTUALIZER_METRICS);
    }
    return top2;
  }
  scheduleLoadVisibleFiles() {
    if (this.disposed || this.loadVisibleAnimationFrame !== void 0) {
      return;
    }
    const targetWindow = getWindow(this.scrollWrapper);
    this.loadVisibleAnimationFrame = targetWindow.requestAnimationFrame(() => {
      this.loadVisibleAnimationFrame = void 0;
      this.loadVisibleFiles();
      this.schedulePrefetchFile();
    });
  }
  cancelScheduledLoadVisibleFiles() {
    if (this.loadVisibleAnimationFrame !== void 0) {
      getWindow(this.scrollWrapper).cancelAnimationFrame(this.loadVisibleAnimationFrame);
      this.loadVisibleAnimationFrame = void 0;
    }
  }
  schedulePrefetchFile() {
    if (this.disposed || this.prefetchAnimationFrame !== void 0) {
      return;
    }
    const targetWindow = getWindow(this.scrollWrapper);
    this.prefetchAnimationFrame = targetWindow.requestAnimationFrame(() => {
      this.prefetchAnimationFrame = void 0;
      this.prefetchNearFile();
    });
  }
  cancelScheduledPrefetchFile() {
    if (this.prefetchAnimationFrame !== void 0) {
      getWindow(this.scrollWrapper).cancelAnimationFrame(this.prefetchAnimationFrame);
      this.prefetchAnimationFrame = void 0;
    }
  }
  loadVisibleFiles() {
    if (this.disposed) {
      return;
    }
    const loadingCount = this.fileStates.reduce((count2, state) => count2 + (state.loadState === "loading" ? 1 : 0), 0);
    if (loadingCount >= MAX_CONCURRENT_FILE_LOADS) {
      return;
    }
    const layout2 = this.currentLayout;
    if (!layout2) {
      return;
    }
    const viewportTop = this.scrollWrapper.scrollTop;
    const viewportBottom = viewportTop + this.scrollWrapper.clientHeight;
    let nextState;
    let nextDistance = Number.POSITIVE_INFINITY;
    for (const item of layout2.items) {
      const state = this.fileStates[item.index];
      if (state.loadState !== "idle" || state.collapsed) {
        continue;
      }
      const itemTop = item.virtualTop;
      const itemBottom = item.virtualTop + item.virtualHeight;
      const distance = itemBottom < viewportTop ? viewportTop - itemBottom : itemTop > viewportBottom ? itemTop - viewportBottom : 0;
      if (distance < nextDistance) {
        nextState = state;
        nextDistance = distance;
      }
    }
    if (nextState) {
      this.ensureFileLoaded(nextState, "visible");
    }
  }
  prefetchNearFile() {
    if (this.disposed) {
      return;
    }
    const layout2 = this.currentLayout;
    if (!layout2) {
      return;
    }
    const mountedIndexes = new Set(layout2.items.map((item) => item.index));
    if (layout2.items.some((item) => {
      const state = this.fileStates[item.index];
      return !state.collapsed && state.loadState === "idle";
    })) {
      return;
    }
    const loadingCount = this.fileStates.reduce((count2, state) => count2 + (state.loadState === "loading" ? 1 : 0), 0);
    const prefetchLoadingCount = this.fileStates.reduce((count2, state) => count2 + (state.loadState === "loading" && state.loadKind === "prefetch" ? 1 : 0), 0);
    if (loadingCount >= MAX_CONCURRENT_FILE_LOADS || prefetchLoadingCount >= MAX_CONCURRENT_PREFETCH_LOADS) {
      return;
    }
    const viewportTop = this.scrollWrapper.scrollTop;
    const viewportBottom = viewportTop + this.scrollWrapper.clientHeight;
    const prefetchDistance = Math.max(MIN_PREFETCH_DISTANCE, this.scrollWrapper.clientHeight * PREFETCH_VIEWPORT_MULTIPLIER);
    let virtualTop = 0;
    let nextState;
    let nextDistance = Number.POSITIVE_INFINITY;
    for (const state of this.fileStates) {
      const virtualHeight = computeMobileMultiDiffItemHeight(this.toVirtualItem(state), VIRTUALIZER_METRICS);
      const virtualBottom = virtualTop + virtualHeight;
      if (!mountedIndexes.has(state.index) && !state.collapsed && state.loadState === "idle") {
        const distance = virtualBottom < viewportTop ? viewportTop - virtualBottom : virtualTop > viewportBottom ? virtualTop - viewportBottom : 0;
        if (distance <= prefetchDistance && distance < nextDistance) {
          nextState = state;
          nextDistance = distance;
        }
      }
      virtualTop = virtualBottom;
    }
    if (nextState) {
      this.ensureFileLoaded(nextState, "prefetch");
    }
  }
  ensureFileLoaded(state, loadKind) {
    if (state.loadState !== "idle") {
      return;
    }
    state.loadState = "loading";
    state.loadKind = loadKind;
    state.loadRequestId++;
    this.renderCurrentFileContent(state);
    const generation = this.renderGeneration;
    const loadRequestId = state.loadRequestId;
    void this.loadFileContent(state, generation, loadRequestId).catch(() => {
      if (!this.isActiveFileLoad(state, generation, loadRequestId)) {
        return;
      }
      state.loadState = "error";
      state.loadKind = void 0;
      this.renderCurrentFileContent(state);
    }).finally(() => {
      if (!this.disposed && generation === this.renderGeneration && state.loadRequestId === loadRequestId) {
        this.scheduleVirtualLayout();
      }
    });
  }
  isActiveFileLoad(state, generation, loadRequestId) {
    return !this.disposed && generation === this.renderGeneration && state.loadRequestId === loadRequestId && state.loadState === "loading";
  }
  abandonOffscreenLoads(visibleIndexes) {
    for (const state of this.fileStates) {
      if (state.loadState !== "loading" || state.loadKind === "prefetch" || visibleIndexes.has(state.index)) {
        continue;
      }
      state.loadRequestId++;
      state.loadState = "idle";
      state.loadKind = void 0;
      state.renderData = void 0;
      state.hunkCount = 0;
      state.rowCount = 0;
      this.resetBodyRenderState(state);
      this.renderCurrentFileContent(state);
    }
  }
  async loadFileContent(state, generation, loadRequestId) {
    const diff4 = state.diff;
    if (diff4.identical) {
      if (!this.isActiveFileLoad(state, generation, loadRequestId)) {
        return;
      }
      state.loadState = "empty";
      state.loadKind = void 0;
      state.renderData = void 0;
      state.hunkCount = 0;
      state.rowCount = 0;
      this.renderCurrentFileContent(state);
      return;
    }
    const languageId = resolveMobileDiffLanguageId(this.languageService, diff4);
    const [originalText, modifiedText] = await Promise.all([
      this.readTextContent(diff4.originalURI),
      this.readTextContent(diff4.modifiedURI)
    ]);
    if (!this.isActiveFileLoad(state, generation, loadRequestId)) {
      return;
    }
    const hunks = await (this.data.computeDiff?.(originalText, modifiedText) ?? Promise.resolve(computeUnifiedDiff2(originalText, modifiedText)));
    if (!this.isActiveFileLoad(state, generation, loadRequestId)) {
      return;
    }
    if (hunks.length === 0) {
      state.loadState = "empty";
      state.loadKind = void 0;
      state.renderData = void 0;
      state.hunkCount = 0;
      state.rowCount = 0;
      this.renderCurrentFileContent(state);
      return;
    }
    const [origLineHtml, modLineHtml] = await Promise.all([
      tokenizeFileLines2(this.languageService, originalText, languageId),
      tokenizeFileLines2(this.languageService, modifiedText, languageId)
    ]);
    if (!this.isActiveFileLoad(state, generation, loadRequestId)) {
      return;
    }
    const hasRealTokens = hasMultipleTokenClasses2(origLineHtml) || hasMultipleTokenClasses2(modLineHtml);
    const origLines = hasRealTokens ? origLineHtml : regexTokenizeLines2(originalText, languageId);
    const modLines = hasRealTokens ? modLineHtml : regexTokenizeLines2(modifiedText, languageId);
    if (!this.isActiveFileLoad(state, generation, loadRequestId)) {
      return;
    }
    state.loadState = "loaded";
    state.loadKind = void 0;
    state.hunkCount = hunks.length;
    state.rowCount = hunks.reduce((count2, hunk) => count2 + hunk.lines.length, 0);
    const { bodyEntries, bodyHeight, maxLineCharacterCount } = this.createBodyEntries(hunks);
    state.renderData = { bodyEntries, bodyHeight, maxLineCharacterCount, origLines, modLines, hasRealTokens };
    this.resetBodyRenderState(state);
    this.renderCurrentFileContent(state);
  }
  async readTextContent(resource) {
    if (!resource) {
      return "";
    }
    try {
      const model = await this.textFileService.read(resource, { acceptTextOnly: true });
      return model.value;
    } catch {
      try {
        const file = await this.fileService.readFile(resource);
        return file.value.toString();
      } catch {
        return "";
      }
    }
  }
  createBodyEntries(hunks) {
    const bodyEntries = [];
    let top2 = 0;
    let maxLineCharacterCount = 0;
    for (const hunk of hunks) {
      bodyEntries.push({
        type: "hunk",
        header: hunk.header,
        top: top2,
        height: VIRTUALIZER_METRICS.hunkHeaderHeight
      });
      top2 += VIRTUALIZER_METRICS.hunkHeaderHeight;
      for (const line of hunk.lines) {
        maxLineCharacterCount = Math.max(maxLineCharacterCount, line.text.length);
        bodyEntries.push({
          type: "line",
          line,
          top: top2,
          height: VIRTUALIZER_METRICS.rowHeight
        });
        top2 += VIRTUALIZER_METRICS.rowHeight;
      }
    }
    return { bodyEntries, bodyHeight: top2, maxLineCharacterCount };
  }
  computeVisibleBodyEntryRange(entries2, visibleTop, visibleBottom) {
    if (entries2.length === 0 || visibleBottom <= visibleTop) {
      return { startIndex: 0, endIndex: 0 };
    }
    const startIndex = this.findFirstBodyEntryEndingAfter(entries2, visibleTop);
    const endIndex = this.findFirstBodyEntryStartingAtOrAfter(entries2, visibleBottom);
    return { startIndex, endIndex: Math.max(startIndex, endIndex) };
  }
  findFirstBodyEntryEndingAfter(entries2, offset) {
    let low = 0;
    let high = entries2.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (entries2[mid].top + entries2[mid].height <= offset) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }
  findFirstBodyEntryStartingAtOrAfter(entries2, offset) {
    let low = 0;
    let high = entries2.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (entries2[mid].top < offset) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }
  ensureBodyInner(state) {
    if (state.bodyInner && state.bodyInner.parentElement === state.content) {
      return state.bodyInner;
    }
    if (!state.content || !state.renderData) {
      throw new Error("Cannot render a loaded mobile diff body without content and render data.");
    }
    clearNode(state.content);
    this.resetBodyRenderState(state);
    const inner = append(state.content, $120("div.mobile-multi-diff-file-content-inner"));
    inner.style.height = `${state.renderData.bodyHeight}px`;
    inner.style.minWidth = `calc(${state.renderData.maxLineCharacterCount + 8}ch + 64px)`;
    const colorMap = TokenizationRegistry2.getColorMap();
    if (colorMap && state.renderData.hasRealTokens) {
      const styleEl = document.createElement("style");
      styleEl.textContent = generateTokensCSSForColorMap(colorMap);
      inner.appendChild(styleEl);
    }
    state.bodyInner = inner;
    return inner;
  }
  resetBodyRenderState(state) {
    state.fileMessage = void 0;
    state.bodyInner = void 0;
    state.renderedBodyRows.clear();
    state.renderedBodyStartIndex = void 0;
    state.renderedBodyEndIndex = void 0;
  }
  reconcileBodyEntries(state, startIndex, endIndex) {
    if (!state.bodyInner || !state.renderData) {
      return;
    }
    for (const [index2, element] of Array.from(state.renderedBodyRows)) {
      if (index2 < startIndex || index2 >= endIndex) {
        element.remove();
        state.renderedBodyRows.delete(index2);
      }
    }
    let runStart;
    let runEnd = startIndex;
    for (let index2 = startIndex; index2 < endIndex; index2++) {
      if (state.renderedBodyRows.has(index2)) {
        if (runStart !== void 0) {
          this.insertBodyEntryRun(state, runStart, runEnd);
          runStart = void 0;
        }
        continue;
      }
      runStart ??= index2;
      runEnd = index2 + 1;
    }
    if (runStart !== void 0) {
      this.insertBodyEntryRun(state, runStart, runEnd);
    }
  }
  insertBodyEntryRun(state, startIndex, endIndex) {
    if (!state.bodyInner || !state.renderData) {
      return;
    }
    const htmlParts = [];
    for (let index2 = startIndex; index2 < endIndex; index2++) {
      htmlParts.push(this.renderBodyEntryHtml(index2, state.renderData.bodyEntries[index2], state.renderData.origLines, state.renderData.modLines));
    }
    const template2 = document.createElement("template");
    template2.innerHTML = htmlParts.join("");
    const insertedElements = Array.from(template2.content.children);
    for (const element of insertedElements) {
      const index2 = Number(element.dataset.entryIndex);
      if (Number.isFinite(index2)) {
        state.renderedBodyRows.set(index2, element);
      }
    }
    state.bodyInner.insertBefore(template2.content, this.findNextRenderedBodyRow(state, endIndex));
  }
  findNextRenderedBodyRow(state, startIndex) {
    for (let index2 = startIndex; index2 < state.renderData.bodyEntries.length; index2++) {
      const element = state.renderedBodyRows.get(index2);
      if (element) {
        return element;
      }
    }
    return null;
  }
  renderBodyEntryHtml(index2, entry, origLineHtml, modLineHtml) {
    const style = `top:${entry.top}px;height:${entry.height}px;`;
    if (entry.type === "hunk") {
      return `<div class="mobile-diff-hunk-header mobile-multi-diff-body-entry" data-entry-index="${index2}" style="${style}">${this.escapeHtml(entry.header)}</div>`;
    }
    const line = entry.line;
    const lineNumber = line.lineNum !== void 0 ? String(line.lineNum) : "";
    const gutter = line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";
    const content = this.getLineHtml(line, origLineHtml, modLineHtml);
    return [
      `<div class="mobile-diff-line mobile-multi-diff-body-entry ${line.type}" data-entry-index="${index2}" style="${style}">`,
      `<span class="mobile-diff-line-num">${this.escapeHtml(lineNumber)}</span>`,
      `<span class="mobile-diff-gutter">${this.escapeHtml(gutter)}</span>`,
      `<span class="mobile-diff-content">${content}</span>`,
      "</div>"
    ].join("");
  }
  getLineHtml(line, origLineHtml, modLineHtml) {
    if (line.lineNum !== void 0) {
      const source = line.type === "added" ? modLineHtml : origLineHtml;
      const html3 = source[line.lineNum - 1];
      if (html3 !== void 0) {
        return html3;
      }
    }
    return this.escapeHtml(line.text);
  }
  escapeHtml(value2) {
    return value2.replace(/[&<>"']/g, (char) => {
      switch (char) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#39;";
        default:
          return char;
      }
    });
  }
  dispose() {
    this.disposed = true;
    if (this.layoutAnimationFrame !== void 0) {
      getWindow(this.scrollWrapper).cancelAnimationFrame(this.layoutAnimationFrame);
      this.layoutAnimationFrame = void 0;
    }
    if (this.loadVisibleAnimationFrame !== void 0) {
      this.cancelScheduledLoadVisibleFiles();
    }
    if (this.prefetchAnimationFrame !== void 0) {
      this.cancelScheduledPrefetchFile();
    }
    for (const state of this.fileStates) {
      this.disposeFileSection(state);
    }
    this.mountedIndexes.clear();
    this._onDidDispose.fire();
    this.viewStore.dispose();
    super.dispose();
  }
};
export { $120, VIRTUALIZER_METRICS, MAX_CONCURRENT_FILE_LOADS, MAX_CONCURRENT_PREFETCH_LOADS, MIN_PREFETCH_DISTANCE, PREFETCH_VIEWPORT_MULTIPLIER, MobileMultiDiffView };
