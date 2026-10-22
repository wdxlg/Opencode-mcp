// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatFind/chatFindWidget.ts
import { Range2 } from "./module-0106.mjs";
import { SimpleFindWidget } from "./module-2377.mjs";
import { ChatFindModel, MAX_FIND_MATCHES } from "./module-2380.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { DeferredPromise, Delayer } from "./module-0036.mjs";
import { append, getWindow, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { isDefined } from "./module-0010.mjs";
import { createRegExp } from "./module-0030.mjs";
import { getChatFindHighlightRegistry, supportsCssHighlightApi } from "./module-2378.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatFind/chatFindWidget.ts
var MAX_VISIBLE_HIGHLIGHTS = 500;

var CHAT_FIND_WIDGET_INITIAL_WIDTH = 350;

var SEARCH_DEBOUNCE_DELAY = 150;

var MAX_SETTLE_WAITS = 20;

var CURRENT_MATCH_HIGHLIGHT_NAME = "chat-find-current-match";

var OTHER_MATCH_HIGHLIGHT_NAME = "chat-find-other-match";

var INLINE_TAGS = /* @__PURE__ */ new Set(["A", "ABBR", "B", "BDI", "BDO", "CITE", "CODE", "DATA", "DEL", "DFN", "EM", "I", "INS", "KBD", "MARK", "Q", "S", "SAMP", "SMALL", "SPAN", "STRONG", "SUB", "SUP", "TIME", "U", "VAR"]);

function nearestBlock(node, root) {
  let element = node.parentElement;
  while (element && element !== root && INLINE_TAGS.has(element.tagName)) {
    element = element.parentElement;
  }
  return element ?? root;
}

function findMatchRangesInDom(root, regex, limit, excludedRoots = []) {
  const ownerDocument = root.ownerDocument;
  const nodes = [];
  let buffer = "";
  let block2;
  let separatorPending = false;
  const walker = ownerDocument.createTreeWalker(
    root,
    5
    /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT */
  );
  let current;
  while (current = walker.nextNode()) {
    if (excludedRoots.some((candidate) => candidate.contains(current))) {
      separatorPending = true;
      continue;
    }
    if (current.nodeType !== 3) {
      separatorPending ||= current.tagName === "BR";
      continue;
    }
    const text2 = current.textContent;
    if (!text2) {
      continue;
    }
    const nodeBlock = nearestBlock(current, root);
    if (buffer && (separatorPending || nodeBlock !== block2)) {
      buffer += "\n";
    }
    block2 = nodeBlock;
    separatorPending = false;
    nodes.push({ node: current, start: buffer.length, end: buffer.length + text2.length });
    buffer += text2;
  }
  if (!buffer) {
    return [];
  }
  const ranges = [];
  regex.lastIndex = 0;
  let match2;
  while (match2 = regex.exec(buffer)) {
    const range2 = toDomRange(ownerDocument, nodes, match2.index, match2.index + match2[0].length);
    if (range2) {
      ranges.push(range2);
    }
    if (match2[0].length === 0) {
      regex.lastIndex++;
    }
    if (ranges.length >= limit) {
      break;
    }
  }
  return ranges;
}

function toDomRange(ownerDocument, nodes, start, end) {
  const startEntry = nodes.find((n2) => start < n2.end);
  const endEntry = nodes.find((n2) => end <= n2.end);
  if (!startEntry || !endEntry || endEntry.start < startEntry.start) {
    return void 0;
  }
  const range2 = ownerDocument.createRange();
  range2.setStart(startEntry.node, Math.max(start - startEntry.start, 0));
  range2.setEnd(endEntry.node, Math.max(end - endEntry.start, 0));
  return range2;
}

function isDetailsElement(node) {
  return node.tagName === "DETAILS";
}

function openAncestorDisclosures(root, node) {
  let opened = false;
  let current = node;
  while (current && current !== root) {
    if (isDetailsElement(current) && !current.open) {
      current.open = true;
      opened = true;
    }
    current = current.parentNode;
  }
  return opened;
}

function shouldCaptureFocusBeforeShow(wasVisible) {
  return !wasVisible;
}

var MATCH_REVEAL_PADDING = 30;

function computeRevealScrollTop(scrollTop, renderHeight, top2, bottom) {
  const alignTop = () => Math.max(0, scrollTop + top2 - MATCH_REVEAL_PADDING);
  if (top2 < MATCH_REVEAL_PADDING) {
    return alignTop();
  }
  if (bottom > renderHeight - MATCH_REVEAL_PADDING) {
    return bottom - top2 > renderHeight - 2 * MATCH_REVEAL_PADDING ? alignTop() : Math.max(0, scrollTop + bottom - renderHeight + MATCH_REVEAL_PADDING);
  }
  return void 0;
}

function isCodeMatch(match2) {
  return "codeBlock" in match2;
}

function findMatchRangesInCodeBlock(codeBlock, regex, limit) {
  const model = codeBlock.editor.getModel();
  if (!model) {
    return [];
  }
  const ranges = [];
  regex.lastIndex = 0;
  let match2;
  while (match2 = regex.exec(model.getValue())) {
    const start = model.getPositionAt(match2.index);
    const end = model.getPositionAt(match2.index + match2[0].length);
    ranges.push(Range2.fromPositions(start, end));
    if (match2[0].length === 0) {
      regex.lastIndex++;
    }
    if (ranges.length >= limit) {
      break;
    }
  }
  return ranges;
}

var ChatFindWidget = class extends SimpleFindWidget {
  constructor(host, contextViewService, contextKeyService, hoverService, keybindingService, configurationService, accessibilityService) {
    super({
      showCommonFindToggles: true,
      checkImeCompletionState: true,
      showResultCount: true,
      matchesLimit: MAX_FIND_MATCHES,
      initialWidth: CHAT_FIND_WIDGET_INITIAL_WIDTH,
      enableSash: true,
      appendCaseSensitiveActionId: "workbench.action.chat.toggleFindCaseSensitive" /* ToggleFindCaseSensitive */,
      appendRegexActionId: "workbench.action.chat.toggleFindRegex" /* ToggleFindRegex */,
      appendWholeWordsActionId: "workbench.action.chat.toggleFindWholeWord" /* ToggleFindWholeWord */,
      previousMatchActionId: "workbench.action.chat.findPrevious" /* FindPrevious */,
      nextMatchActionId: "workbench.action.chat.findNext" /* FindNext */,
      closeWidgetActionId: "workbench.action.chat.hideFind" /* FindHide */
    }, contextViewService, contextKeyService, hoverService, keybindingService, configurationService, accessibilityService);
    this.host = host;
    this._repaintScheduler = this._register(new MutableDisposable());
    this._revealScheduler = this._register(new MutableDisposable());
    this._recomputeDelayer = this._register(new Delayer(200));
    this._searchDelayer = this._register(new Delayer(SEARCH_DEBOUNCE_DELAY));
    this._codeDecorations = /* @__PURE__ */ new Map();
    this._lastNavigationWasPrevious = false;
    this._unlocatableSkips = 0;
    this._targetWindow = getWindow(this.host.transcriptDomNode);
    this._findWidgetVisibleKey = ChatContextKeys.findWidgetVisible.bindTo(contextKeyService);
    this._findWidgetFocusedKey = ChatContextKeys.findWidgetFocused.bindTo(contextKeyService);
    this._findInputFocusedKey = ChatContextKeys.findInputFocused.bindTo(contextKeyService);
    this._model = this._register(new ChatFindModel(() => this.host.getItems(), () => this.host.getViewportAnchorItemId()));
    this._register(this._model.onDidChangeMatches(() => this._onMatchesChanged()));
    this._register(this.host.onDidChangeContent(() => {
      if (this.isVisible()) {
        this._recomputeDelayer.trigger(() => {
          this._model.recompute();
          this._scheduleRepaint();
        }).catch(() => {
        });
      }
    }));
    this._register(this.host.onDidRerenderRow(() => {
      if (this.isVisible()) {
        this._scheduleRepaint();
      }
    }));
    append(this.host.transcriptDomNode.parentElement ?? this.host.transcriptDomNode, this.getDomNode());
  }
  static {
    /** Bounds the skip walk so a query whose matches are all unlocatable cannot spin. */
    this.MAX_UNLOCATABLE_SKIPS = 50;
  }
  static {
    /**
     * Frames to wait for a revealed row to mount before treating a match as unreachable. The list
     * mounts and re-measures rows over several frames after a long scroll, so a single frame is
     * not enough to tell "not there yet" from "not there".
     */
    this.MAX_LOCATE_ATTEMPTS = 4;
  }
  get visible() {
    return this.isVisible();
  }
  show(seedText, focus = true) {
    if (shouldCaptureFocusBeforeShow(this.isVisible())) {
      this._lastFocusedElement = this._targetWindow.document.activeElement;
    }
    this._findWidgetVisibleKey.set(true);
    this._beginSettle();
    if (focus) {
      super.reveal(seedText);
    } else {
      super.show(seedText);
    }
    this._model.setQuery(this.inputValue, this._currentFindOptions());
    this._navigateToActive();
  }
  hide() {
    super.hide();
    this._findWidgetVisibleKey.reset();
    this._recomputeDelayer.cancel();
    this._searchDelayer.cancel();
    this._pendingSearch = void 0;
    this._completeSettle();
    this._revealScheduler.clear();
    this._repaintScheduler.clear();
    this._clearHighlights();
    this._restoreFocus();
  }
  find(previous) {
    this._lastNavigationWasPrevious = previous;
    this._unlocatableSkips = 0;
    if (this._flushPendingSearch()) {
      this._navigateToActive();
      void this.updateResultCount();
      return;
    }
    this._advanceActiveMatch(previous);
  }
  /**
   * Runs a debounced search now, if one is still waiting. Returns whether it ran, so navigation
   * acts on the query the user actually typed rather than the previous one.
   */
  _flushPendingSearch() {
    if (!this._pendingSearch) {
      return false;
    }
    this._searchDelayer.cancel();
    this._pendingSearch = void 0;
    this._model.setQuery(this.inputValue, this._currentFindOptions());
    return true;
  }
  _advanceActiveMatch(previous) {
    if (previous) {
      this._model.previous();
    } else {
      this._model.next();
    }
    this._navigateToActive();
    void this.updateResultCount();
  }
  /**
   * Steps past a match the DOM cannot produce, so navigation never appears to do nothing. The
   * index predicts where the renderer puts content, and a prediction can still be wrong for
   * content whose placement is decided at render time; rather than stall, keep going the same
   * way. Bounded so a query whose matches are all unlocatable cannot spin.
   */
  _skipUnlocatableMatch() {
    if (this._unlocatableSkips >= ChatFindWidget.MAX_UNLOCATABLE_SKIPS) {
      this._completeSettle();
      return;
    }
    this._unlocatableSkips++;
    this._advanceActiveMatch(this._lastNavigationWasPrevious);
  }
  findFirst() {
    this._unlocatableSkips = 0;
    this._searchDelayer.cancel();
    this._pendingSearch = void 0;
    this._model.setQuery(this.inputValue, this._currentFindOptions());
    this._navigateToActive();
  }
  next() {
    if (!this.visible) {
      this.show(void 0, false);
    }
    this.find(false);
  }
  previous() {
    if (!this.visible) {
      this.show(void 0, false);
    }
    this.find(true);
  }
  focus() {
    this.focusFindBox();
  }
  toggleCaseSensitive() {
    this.changeState({ matchCase: !this._getCaseSensitiveValue() });
  }
  toggleWholeWord() {
    this.changeState({ wholeWord: !this._getWholeWordValue() });
  }
  toggleRegex() {
    this.changeState({ isRegex: !this._getRegexValue() });
  }
  _onInputChanged() {
    this._unlocatableSkips = 0;
    this._scheduleSearch();
    return this._model.matches.length > 0;
  }
  /** Whether the widget's query or options have moved on from what the model last searched. */
  _isModelStale() {
    const options3 = this._currentFindOptions();
    const current = this._model.options;
    return this.inputValue !== this._model.query || options3.isRegex !== current.isRegex || options3.matchCase !== current.matchCase || options3.wholeWord !== current.wholeWord;
  }
  /**
   * Runs the search once typing pauses. Searching per keystroke would publish a count for every
   * prefix, and each of those counts can then shed unreachable matches, so the label ends up
   * ticking up and down before landing on the real number.
   */
  _scheduleSearch() {
    if (!this._isModelStale()) {
      return;
    }
    const search2 = this._searchDelayer.trigger(() => {
      this._model.setQuery(this.inputValue, this._currentFindOptions());
      this._navigateToActive();
    });
    this._pendingSearch = search2;
    search2.catch(() => {
    }).finally(() => {
      if (this._pendingSearch === search2) {
        this._pendingSearch = void 0;
      }
    });
  }
  /** Marks the start of locating an active match, if one is not already in progress. */
  _beginSettle() {
    this._settleBarrier ??= new DeferredPromise();
  }
  /** Marks the active match as located, dropped, or given up on, releasing the result count. */
  _completeSettle() {
    const barrier = this._settleBarrier;
    this._settleBarrier = void 0;
    void barrier?.complete();
  }
  /**
   * Waits for the query to be searched and its active match to be located. Locating can drop
   * matches that turn out to be unreachable, so reading the count before then reports a total
   * that is about to change.
   */
  async _whenSettled() {
    await Promise.resolve();
    for (let attempt = 0; attempt < MAX_SETTLE_WAITS; attempt++) {
      const pending = [this._pendingSearch, this._settleBarrier?.p].filter(isDefined);
      if (!pending.length) {
        return;
      }
      await Promise.all(pending).catch(() => {
      });
    }
  }
  async _getResultCount() {
    await this._whenSettled();
    if (this._model.isInvalidRegex) {
      return void 0;
    }
    return { resultIndex: this._model.activeIndex, resultCount: this._model.matches.length };
  }
  _onFocusTrackerFocus() {
    this._findWidgetFocusedKey.set(true);
  }
  _onFocusTrackerBlur() {
    this._findWidgetFocusedKey.reset();
  }
  _onFindInputFocusTrackerFocus() {
    this._findInputFocusedKey.set(true);
  }
  _onFindInputFocusTrackerBlur() {
    this._findInputFocusedKey.reset();
  }
  _currentFindOptions() {
    return { isRegex: this._getRegexValue(), matchCase: this._getCaseSensitiveValue(), wholeWord: this._getWholeWordValue() };
  }
  _onMatchesChanged() {
    void this.updateResultCount();
  }
  _navigateToActive() {
    const match2 = this._model.activeMatch;
    this._clearHighlights();
    this._beginSettle();
    if (!match2) {
      this._completeSettle();
      return;
    }
    const item = this._findItemForMatch(match2);
    if (item) {
      this.host.reveal(item);
    }
    this._revealScheduler.value = scheduleAtNextAnimationFrame(this._targetWindow, () => this._revealActiveMatch(match2));
  }
  _revealActiveMatch(match2, attempt = 0) {
    const locatedMatch = this._locateMatch(match2);
    if (!locatedMatch) {
      if (attempt < ChatFindWidget.MAX_LOCATE_ATTEMPTS) {
        const item = this._findItemForMatch(match2);
        if (item) {
          this.host.reveal(item);
        }
        this._revealScheduler.value = scheduleAtNextAnimationFrame(this._targetWindow, () => this._revealActiveMatch(match2, attempt + 1));
        return;
      }
      this._repaintVisibleHighlights();
      this._skipUnlocatableMatch();
      return;
    }
    if (isCodeMatch(locatedMatch)) {
      const revealCodeMatch = () => {
        locatedMatch.codeBlock.editor.revealRangeInCenter(locatedMatch.range);
        this._repaintVisibleHighlights();
        this._revealRect(this._codeMatchRect(locatedMatch));
        this._completeSettle();
      };
      if (openAncestorDisclosures(this.host.transcriptDomNode, locatedMatch.codeBlock.element)) {
        this._revealScheduler.value = scheduleAtNextAnimationFrame(this._targetWindow, revealCodeMatch);
      } else {
        revealCodeMatch();
      }
      return;
    }
    const range2 = locatedMatch;
    const opened = this._openAncestorDisclosures(range2);
    this._repaintVisibleHighlights();
    if (opened) {
      this._revealScheduler.value = scheduleAtNextAnimationFrame(this._targetWindow, () => {
        this._revealRect(this._rangeRect(range2));
        this._completeSettle();
      });
    } else {
      this._revealRect(this._rangeRect(range2));
      this._completeSettle();
    }
  }
  /**
   * Scrolls the transcript so `rect` is in view, in either direction, and reports whether it
   * moved.
   *
   * Deliberately not `Element.scrollIntoView`: the chat list picks up native scrolling by
   * reading the container's `scrollTop` and resetting it to `0` (see `scrollToActiveElement` in
   * `listView.ts`), so the browser can only ever hand it a downward delta. Scrolling up — which
   * is now the common direction, since matches run newest first — would silently do nothing.
   */
  _scrollRectIntoView(rect) {
    if (!rect) {
      return false;
    }
    const viewportTop = this.host.transcriptDomNode.getBoundingClientRect().top;
    const scrollTop = computeRevealScrollTop(
      this.host.getScrollTop(),
      this.host.getRenderHeight(),
      rect.top - viewportTop,
      rect.bottom - viewportTop
    );
    if (scrollTop === void 0) {
      return false;
    }
    this.host.setScrollTop(scrollTop);
    return true;
  }
  /** Scrolls to a match and repaints once the rows the scroll brought into view have mounted. */
  _revealRect(rect) {
    if (this._scrollRectIntoView(rect)) {
      this._scheduleRepaint();
    }
  }
  /** The match's own rectangle, falling back to its element for ranges that measure as empty. */
  _rangeRect(range2) {
    const rect = range2.getBoundingClientRect();
    if (rect.height > 0) {
      return rect;
    }
    const element = range2.startContainer.nodeType === this._targetWindow.Node.ELEMENT_NODE ? range2.startContainer : range2.startContainer.parentElement;
    return element?.getBoundingClientRect();
  }
  /**
   * The matched line's rectangle inside an embedded editor. Only visible lines exist in the DOM,
   * so the position is derived from the editor's layout rather than looked up as a node.
   */
  _codeMatchRect(codeMatch) {
    const editor = codeMatch.codeBlock.editor;
    const editorDomNode = editor.getDomNode();
    if (!editorDomNode) {
      return void 0;
    }
    const lineTop = editorDomNode.getBoundingClientRect().top + editor.getTopForLineNumber(codeMatch.range.startLineNumber) - editor.getScrollTop();
    return { top: lineTop, bottom: lineTop + editor.getOption(75 /* lineHeight */) };
  }
  _findItemForMatch(match2) {
    return this.host.getItems().find((item) => item.id === match2.itemId);
  }
  /** Opens every closed `<details>` ancestor of `range`, up to the transcript root. Returns whether any were toggled. */
  _openAncestorDisclosures(range2) {
    return openAncestorDisclosures(this.host.transcriptDomNode, range2.startContainer);
  }
  _scheduleRepaint() {
    this._repaintScheduler.value = scheduleAtNextAnimationFrame(this._targetWindow, () => this._repaintVisibleHighlights());
  }
  _tryCreateRegex() {
    try {
      return createRegExp(this._model.query, this._model.options.isRegex, {
        matchCase: this._model.options.matchCase,
        wholeWord: this._model.options.wholeWord,
        global: true,
        unicode: true
      });
    } catch {
      return void 0;
    }
  }
  /**
   * The DOM subtrees that can own `match`, in document order. Matches with a rendered part use
   * it directly; row-level response matches search the trailing parts (error details and other
   * content following the response body) so their occurrence is not counted against the body.
   */
  _locateMatchRoots(match2, template2) {
    if (match2.partIndex >= 0) {
      const partRoot = template2?.renderedParts?.[match2.partIndex]?.domNode;
      if (partRoot) {
        return [partRoot];
      }
    } else if (match2.scopeStartPartIndex !== void 0 && template2?.renderedParts) {
      const trailing = template2.renderedParts.slice(match2.scopeStartPartIndex).map((part) => part?.domNode).filter(isDefined);
      if (trailing.length) {
        return trailing;
      }
    }
    return template2?.value ? [template2.value] : [];
  }
  /** Locates the active match's DOM range within its rendered content part (or the whole row as a fallback). */
  _locateMatch(match2, regex) {
    const template2 = this.host.getTemplateDataForRequestId(match2.itemId);
    const roots = this._locateMatchRoots(match2, template2);
    if (!roots.length) {
      return void 0;
    }
    const effectiveRegex = regex ?? this._tryCreateRegex();
    if (!effectiveRegex) {
      return void 0;
    }
    const locations = [];
    for (const root of roots) {
      const codeBlocks = [...this.host.editorsInUse()].filter((codeBlock) => root.contains(codeBlock.element)).sort((first2, second) => first2.element.compareDocumentPosition(second.element) & 4 ? -1 : 1);
      findMatchRangesInDom(
        root,
        effectiveRegex,
        match2.occurrenceIndex + 1,
        codeBlocks.map((codeBlock) => codeBlock.element)
      ).forEach((range2, order) => locations.push({ node: range2.startContainer, order, match: range2 }));
      for (const codeBlock of codeBlocks) {
        const ranges = findMatchRangesInCodeBlock(codeBlock, effectiveRegex, match2.occurrenceIndex + 1);
        for (let order = 0; order < ranges.length; order++) {
          locations.push({
            node: codeBlock.element,
            order,
            match: { codeBlock, range: ranges[order] }
          });
        }
      }
    }
    locations.sort((first2, second) => first2.node === second.node ? first2.order - second.order : first2.node.compareDocumentPosition(second.node) & 4 ? -1 : 1);
    return locations[match2.occurrenceIndex]?.match;
  }
  _repaintVisibleHighlights() {
    const registry4 = getChatFindHighlightRegistry(this._targetWindow);
    if (!this.isVisible() || !this._model.matches.length || !this._model.query) {
      registry4.clear(this);
      this._updateCodeDecorations(/* @__PURE__ */ new Map());
      return;
    }
    const regex = this._tryCreateRegex();
    if (!regex) {
      registry4.clear(this);
      this._updateCodeDecorations(/* @__PURE__ */ new Map());
      return;
    }
    const currentRanges = [];
    const otherRanges = [];
    const codeDecorations = /* @__PURE__ */ new Map();
    let locatedCount = 0;
    const renderedRows = /* @__PURE__ */ new Map();
    for (let index2 = 0; index2 < this._model.matches.length && locatedCount < MAX_VISIBLE_HIGHLIGHTS; index2++) {
      const match2 = this._model.matches[index2];
      let isRendered = renderedRows.get(match2.itemId);
      if (isRendered === void 0) {
        isRendered = !!this.host.getTemplateDataForRequestId(match2.itemId);
        renderedRows.set(match2.itemId, isRendered);
      }
      if (!isRendered) {
        continue;
      }
      const locatedMatch = this._locateMatch(match2, regex);
      if (!locatedMatch) {
        continue;
      }
      locatedCount++;
      if (isCodeMatch(locatedMatch)) {
        const decorations = codeDecorations.get(locatedMatch.codeBlock) ?? [];
        decorations.push({ range: locatedMatch.range, current: index2 === this._model.activeIndex });
        codeDecorations.set(locatedMatch.codeBlock, decorations);
      } else {
        (index2 === this._model.activeIndex ? currentRanges : otherRanges).push(locatedMatch);
      }
    }
    if (supportsCssHighlightApi(this._targetWindow)) {
      registry4.setRanges(this, CURRENT_MATCH_HIGHLIGHT_NAME, currentRanges, 1);
      registry4.setRanges(this, OTHER_MATCH_HIGHLIGHT_NAME, otherRanges, 0);
    } else {
      registry4.clear(this);
    }
    this._updateCodeDecorations(codeDecorations);
  }
  _updateCodeDecorations(matches2) {
    for (const [codeBlock, collection] of this._codeDecorations) {
      collection.clear();
      if (!matches2.has(codeBlock)) {
        this._codeDecorations.delete(codeBlock);
      }
    }
    for (const [codeBlock, decorations] of matches2) {
      let collection = this._codeDecorations.get(codeBlock);
      if (!collection) {
        collection = codeBlock.editor.createDecorationsCollection();
        this._codeDecorations.set(codeBlock, collection);
      }
      collection.set(decorations.map(({ range: range2, current }) => ({
        range: range2,
        options: {
          description: current ? "chat-find-current-match" : "chat-find-other-match",
          inlineClassName: current ? "chat-find-current-match" : "chat-find-other-match"
        }
      })));
    }
  }
  _clearHighlights() {
    getChatFindHighlightRegistry(this._targetWindow).clear(this);
    this._updateCodeDecorations(/* @__PURE__ */ new Map());
  }
  _restoreFocus() {
    const target = this._lastFocusedElement;
    this._lastFocusedElement = void 0;
    if (target && target.isConnected) {
      target.focus();
    } else {
      this.host.transcriptDomNode.focus();
    }
  }
  dispose() {
    this._completeSettle();
    this._clearHighlights();
    super.dispose();
  }
};

ChatFindWidget = __decorateClass([
  __decorateParam(1, IContextViewService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IAccessibilityService)
], ChatFindWidget);
export { nearestBlock, findMatchRangesInDom, toDomRange, isDetailsElement, openAncestorDisclosures, shouldCaptureFocusBeforeShow, computeRevealScrollTop, isCodeMatch, findMatchRangesInCodeBlock, MAX_VISIBLE_HIGHLIGHTS, CHAT_FIND_WIDGET_INITIAL_WIDTH, SEARCH_DEBOUNCE_DELAY, MAX_SETTLE_WAITS, CURRENT_MATCH_HIGHLIGHT_NAME, OTHER_MATCH_HIGHLIGHT_NAME, INLINE_TAGS, MATCH_REVEAL_PADDING, ChatFindWidget };
