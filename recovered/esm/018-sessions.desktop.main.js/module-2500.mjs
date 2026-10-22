// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptTimeline/promptTimelineGutterRail.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventType, addDisposableListener, append, clearNode, getWindow } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { MIN_HOST_WIDTH } from "./module-2499.mjs";


// src/vs/workbench/contrib/chat/browser/promptTimeline/promptTimelineGutterRail.ts
var MAX_REST_DOTS = 50;

var MIN_REST_DOTS = 2;

var DOT_SIZE = 4;

var DOT_GAP = 4;

var HANDLE_PADDING_Y = 8;

var MORE_MARKER_HEIGHT = 8;

var GUTTER_INSET = 12;

function restDotCount(promptCount, railHeight) {
  const capped = Math.min(promptCount, MAX_REST_DOTS);
  if (promptCount <= MIN_REST_DOTS || railHeight <= 0) {
    return capped;
  }
  const available = railHeight - 2 * (GUTTER_INSET + HANDLE_PADDING_Y);
  const step = DOT_SIZE + DOT_GAP;
  if (capped === promptCount && Math.floor((available + DOT_GAP) / step) >= promptCount) {
    return capped;
  }
  return Math.max(MIN_REST_DOTS, Math.min(capped, Math.floor((available - MORE_MARKER_HEIGHT) / step)));
}

var gutterIdSeq = 0;

var PromptTimelineGutterRail = class extends Disposable {
  constructor() {
    super();
    this._rowDisposables = this._register(new DisposableStore());
    /** Held separately from {@link _rowDisposables}: the dots are re-rendered on resize, without the rows. */
    this._dotDisposables = this._register(new DisposableStore());
    this._rows = [];
    /** The resting dots, in order; `_dotTicks[i]` is the tick index dot `i` stands for. */
    this._dots = [];
    this._dotTicks = [];
    this._hostWidth = Number.POSITIVE_INFINITY;
    /** Cached rail height; only changes on resize (observed), so rendering never forces a reflow to read it. */
    this._railHeight = 0;
    this._resizeObserverReady = false;
    /** Prompt count of the last {@link setTicks}, so a resize can re-sample the dots without new ticks. */
    this._tickCount = 0;
    /** Disclosure held open by explicit activation (handle click/tap/keyboard, or a row focused via keyboard). */
    this._open = false;
    /** Pointer is over the rail; reveals the flyout transiently (independent of {@link _open}). */
    this._hovering = false;
    /** Tick index previewed by the dot currently under the pointer, or `-1` when no dot is hovered. */
    this._previewIndex = -1;
    /** Row currently showing the full-width preview band, or `-1`; only dot-driven previews band. */
    this._previewBand = -1;
    /** Tick index of the prompt the transcript is scrolled to, or `-1`; re-applied when the dots re-render. */
    this._activeIndex = -1;
    /** Row holding the flyout's single tab stop. */
    this._focusRow = 0;
    /** Which of that row's two buttons holds it. */
    this._focusColumn = "jump";
    this._onDidSelect = this._register(new Emitter());
    this.onDidSelect = this._onDidSelect.event;
    /** Fired by a row's diff button to review that prompt's whole changeset. */
    this._onDidReview = this._register(new Emitter());
    this.onDidReview = this._onDidReview.event;
    // Per-FILE review is only offered by the ruler rail's hover card; the gutter rail's rows drill down
    // to the whole prompt. Kept to satisfy the shared rail contract.
    this._onDidReviewFile = this._register(new Emitter());
    this.onDidReviewFile = this._onDidReviewFile.event;
    this._domNode = $("nav.prompt-timeline-rail.prompt-timeline-rail-gutter");
    this._domNode.setAttribute("aria-label", localize(11582, null));
    this._domNode.setAttribute("role", "toolbar");
    this._domNode.setAttribute("aria-orientation", "vertical");
    const panelId = `prompt-timeline-gutter-panel-${gutterIdSeq++}`;
    this._rest = append(this._domNode, $("button.prompt-timeline-gutter-rest"));
    this._rest.setAttribute("aria-haspopup", "true");
    this._rest.setAttribute("aria-expanded", "false");
    this._rest.setAttribute("aria-controls", panelId);
    this._rest.setAttribute("aria-label", localize(11586, null));
    this._rest.tabIndex = 0;
    this._list = append(this._domNode, $(".prompt-timeline-gutter-panel"));
    this._list.id = panelId;
    this._register(addDisposableListener(this._domNode, EventType.MOUSE_OVER, () => {
      this._hovering = true;
      this._updateRevealed();
    }));
    this._register(addDisposableListener(this._domNode, EventType.MOUSE_OUT, (e4) => {
      if (!this._domNode.contains(e4.relatedTarget)) {
        this._hovering = false;
        this._setPreview(-1);
        this._updateRevealed();
      }
    }));
    this._register(addDisposableListener(this._list, EventType.MOUSE_OVER, (e4) => {
      const target = e4.target;
      const rowIndex = target === null ? -1 : this._rows.findIndex((row) => row.container.contains(target));
      this._setPreview(rowIndex, "row");
    }));
    this._register(Gesture.addTarget(this._rest));
    this._register(addDisposableListener(this._rest, EventType.CLICK, (e4) => {
      e4.preventDefault();
      this._toggleOpen();
    }));
    this._register(addDisposableListener(this._rest, EventType2.Tap, () => this._toggleOpen()));
    this._register(addDisposableListener(this._rest, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.keyCode === 3 /* Enter */ || event.keyCode === 10 /* Space */) {
        event.preventDefault();
        event.stopPropagation();
        this._toggleOpen();
      }
    }));
    this._register(addDisposableListener(this._list, EventType.KEY_DOWN, (e4) => this._onListKeyDown(e4)));
    this._register(addDisposableListener(this._domNode, EventType.FOCUS_OUT, (e4) => {
      if (!this._domNode.contains(e4.relatedTarget)) {
        this._open = false;
        this._updateRevealed();
      }
    }));
  }
  get domNode() {
    return this._domNode;
  }
  /** Reveal whenever the disclosure is open OR the pointer is hovering; keep `aria-expanded` in sync. */
  _updateRevealed() {
    const revealed = this._open || this._hovering;
    this._domNode.classList.toggle("revealed", revealed);
    this._rest.setAttribute("aria-expanded", String(revealed));
  }
  /** Toggle the disclosure via explicit activation: opening focuses a row, closing returns to the handle. */
  _toggleOpen() {
    if (this._open) {
      this._close();
    } else {
      this._open = true;
      this._updateRevealed();
      this._focusActiveRow();
    }
  }
  /**
   * Collapse the disclosure (shared close path for activation, Escape, and row actions).
   *
   * `restoreFocus` returns focus to the handle so keyboard users are not stranded; the diff action
   * opts out, because the multi-diff editor it opens takes focus itself and pulling focus back to
   * the rail first would fight it.
   */
  _close(restoreFocus = true) {
    this._open = false;
    this._updateRevealed();
    if (restoreFocus) {
      this._rest.focus();
    }
  }
  _focusActiveRow() {
    this._focusCell(this._focusRow, this._focusColumn);
  }
  setFilesProvider(_provider) {
  }
  /**
   * Rebuilds the resting handle's dots. There is one dot per prompt as long as they fit — capped by
   * {@link MAX_REST_DOTS} and by the room the rail actually has (see {@link restDotCount}); beyond
   * that the dots are evenly sampled across the session so every dot still stands for a real prompt
   * (and the active prompt always maps to one), with a trailing marker signalling the sampling.
   */
  _renderDots(count2) {
    this._dotDisposables.clear();
    clearNode(this._rest);
    this._dots.length = 0;
    this._dotTicks.length = 0;
    const dots = restDotCount(count2, this._railHeight);
    for (let i2 = 0; i2 < dots; i2++) {
      const dot = append(this._rest, $(".prompt-timeline-gutter-dot"));
      const tickIndex = dots === count2 ? i2 : Math.round(i2 * (count2 - 1) / (dots - 1));
      this._dots.push(dot);
      this._dotTicks.push(tickIndex);
      this._dotDisposables.add(addDisposableListener(dot, EventType.MOUSE_OVER, () => this._setPreview(tickIndex)));
    }
    if (count2 > dots) {
      append(this._rest, $(".prompt-timeline-gutter-dot-more"));
    }
    this._updateDotHighlights();
  }
  /**
   * Observes the rail so the dot column keeps fitting when the transcript's height changes — the
   * window resizing, the chat input growing, a split view. The rail is only mounted once, so the
   * observer is created on the first render and lives for the rail's lifetime.
   */
  _ensureResizeObserver() {
    if (this._resizeObserverReady) {
      return;
    }
    const ResizeObserverCtor = getWindow(this._domNode).ResizeObserver;
    if (!ResizeObserverCtor) {
      return;
    }
    this._resizeObserverReady = true;
    const observer = new ResizeObserverCtor(() => {
      const height = this._domNode.clientHeight;
      if (height <= 0 || height === this._railHeight) {
        return;
      }
      this._railHeight = height;
      if (restDotCount(this._tickCount, height) !== this._dots.length) {
        this._renderDots(this._tickCount);
      }
    });
    observer.observe(this._domNode);
    this._register(toDisposable(() => observer.disconnect()));
  }
  /** Previews the prompt a hovered dot stands for by highlighting its row and scrolling it into view. */
  /**
   * Previews the prompt a row stands for: highlights it and scrolls it into view.
   *
   * `source` decides whether the row gets the full-width band. A preview from a hovered *dot* points
   * at a row the pointer is nowhere near, so the whole row lights up to say "this one". A preview
   * from the pointer resting on the row itself must NOT band it: the row's two halves light up
   * individually under the pointer, and a band covering both would paint over that — making a row
   * with two buttons read as one.
   */
  _setPreview(index2, source = "dot") {
    const band = source === "dot" ? index2 : -1;
    if (this._previewIndex === index2 && this._previewBand === band) {
      return;
    }
    this._previewIndex = index2;
    this._previewBand = band;
    for (let i2 = 0; i2 < this._rows.length; i2++) {
      this._rows[i2].container.classList.toggle("preview", i2 === band);
    }
    this._updateDotHighlights();
    if (index2 >= 0) {
      this._revealRow(index2);
    }
  }
  /**
   * Accents the dots standing for the active ("you are here") and previewed prompts. Once the dots
   * are sampled the nearest dot stands in, so both accents survive a re-sampling on resize.
   */
  _updateDotHighlights() {
    const activeDot = this._findNearestDotIndex(this._activeIndex);
    const previewDot = this._findNearestDotIndex(this._previewIndex);
    for (let i2 = 0; i2 < this._dots.length; i2++) {
      this._dots[i2].classList.toggle("active", i2 === activeDot);
      this._dots[i2].classList.toggle("preview", i2 === previewDot);
    }
  }
  _findNearestDotIndex(tickIndex) {
    if (tickIndex < 0) {
      return -1;
    }
    let nearestDot = -1;
    let bestDelta = Number.POSITIVE_INFINITY;
    for (let i2 = 0; i2 < this._dotTicks.length; i2++) {
      const delta2 = Math.abs(this._dotTicks[i2] - tickIndex);
      if (delta2 < bestDelta) {
        bestDelta = delta2;
        nearestDot = i2;
      }
    }
    return nearestDot;
  }
  /**
   * Scrolls a row into view inside the flyout. Done by hand rather than with `scrollIntoView` so a
   * hover can never scroll the transcript (or any other ancestor) behind the rail.
   */
  _revealRow(index2) {
    const container2 = this._rows[index2]?.container;
    if (!container2) {
      return;
    }
    const top2 = container2.offsetTop;
    const bottom = top2 + container2.offsetHeight;
    const viewTop = this._list.scrollTop;
    const viewBottom = viewTop + this._list.clientHeight;
    if (top2 < viewTop) {
      this._list.scrollTop = top2;
    } else if (bottom > viewBottom) {
      this._list.scrollTop = bottom - this._list.clientHeight;
    }
  }
  setTicks(ticks) {
    this._tickCount = ticks.length;
    this._ensureResizeObserver();
    if (this._railHeight <= 0) {
      this._railHeight = this._domNode.clientHeight;
    }
    const sameStructure = ticks.length === this._rows.length && ticks.every((t2, i2) => this._rows[i2]?.tick.requestId === t2.requestId);
    if (sameStructure) {
      const doc = getWindow(this._domNode).document;
      const focusedCell = this._isLiveCell(doc.activeElement) ? doc.activeElement : void 0;
      for (let i2 = 0; i2 < ticks.length; i2++) {
        this._renderRow(this._rows[i2], ticks[i2]);
      }
      this._updateTabStops(this._focusRow, this._focusColumn);
      if (focusedCell && !this._isLiveCell(focusedCell)) {
        this._cell(this._focusRow, this._focusColumn)?.focus();
      }
      this._updateActiveClasses();
      return;
    }
    this._rowDisposables.clear();
    this._rows.length = 0;
    this._previewIndex = -1;
    this._previewBand = -1;
    clearNode(this._list);
    this._renderDots(ticks.length);
    for (const tick of ticks) {
      const container2 = append(this._list, $(".prompt-timeline-gutter-row"));
      const jump = append(container2, $("button.prompt-timeline-gutter-row-jump"));
      jump.tabIndex = -1;
      const label3 = append(jump, $("span.prompt-timeline-gutter-row-label"));
      const diff4 = append(container2, $("button.prompt-timeline-gutter-row-diff"));
      diff4.tabIndex = -1;
      const stat = append(diff4, $("span.prompt-timeline-gutter-row-stat"));
      const entry = { tick, container: container2, jump, diff: diff4, label: label3, stat };
      this._renderRow(entry, tick);
      const requestId = tick.requestId;
      this._rowDisposables.add(addDisposableListener(jump, EventType.CLICK, () => {
        this._onDidSelect.fire(requestId);
        this._close();
      }));
      this._rowDisposables.add(addDisposableListener(diff4, EventType.CLICK, () => {
        this._onDidReview.fire(entry.tick);
        this._close(
          /*restoreFocus*/
          false
        );
      }));
      for (const [button, column] of [[jump, "jump"], [diff4, "diff"]]) {
        this._rowDisposables.add(addDisposableListener(button, EventType.FOCUS, () => {
          this._open = true;
          this._updateRevealed();
          this._updateTabStops(this._rows.indexOf(entry), column);
        }));
      }
      this._rows.push(entry);
    }
    const activeIndex = this._rows.findIndex((r2) => r2.tick.requestId === this._activeRequestId);
    this._updateTabStops(activeIndex >= 0 ? activeIndex : 0, "jump");
    this._updateActiveClasses();
  }
  _renderRow(entry, tick) {
    entry.tick = tick;
    entry.jump.setAttribute("aria-label", tick.ariaLabel);
    entry.label.textContent = tick.text;
    entry.label.title = tick.text;
    const stat = tick.stat && tick.stat.added + tick.stat.removed > 0 ? tick.stat : void 0;
    this._renderStat(entry.stat, stat);
    entry.container.classList.toggle("reviewable", !!stat);
    if (stat) {
      entry.diff.setAttribute("aria-label", localize(
        11583,
        null,
        tick.text,
        stat.fileCount === 1 ? localize(11585, null) : localize(11584, null, stat.fileCount)
      ));
    }
  }
  _renderStat(container2, stat) {
    clearNode(container2);
    if (!stat) {
      return;
    }
    append(container2, $("span.added")).textContent = `+${stat.added}`;
    append(container2, $("span.removed")).textContent = `\u2212${stat.removed}`;
  }
  /** The button a row column maps to, or undefined when that row has no changes to review. */
  _cell(rowIndex, column) {
    const entry = this._rows[rowIndex];
    if (!entry) {
      return void 0;
    }
    if (column === "jump") {
      return entry.jump;
    }
    return entry.container.classList.contains("reviewable") ? entry.diff : void 0;
  }
  /** True when `element` is a row button that is still a live focus target — a dropped badge is not. */
  _isLiveCell(element) {
    return this._rows.some((row) => row.jump === element || row.diff === element && row.container.classList.contains("reviewable"));
  }
  /**
   * Roving tabindex: exactly one button across the whole flyout is tabbable, so it stays a single Tab
   * stop even though every row now holds two. A requested diff column falls back to the label when
   * that row has no changes, so the tab stop can never land on a hidden (unfocusable) button.
   */
  _updateTabStops(focusIndex, column = this._focusColumn) {
    this._focusRow = Math.max(0, Math.min(this._rows.length - 1, focusIndex));
    this._focusColumn = this._cell(this._focusRow, column) ? column : "jump";
    const focused = this._cell(this._focusRow, this._focusColumn);
    for (const entry of this._rows) {
      entry.jump.tabIndex = entry.jump === focused ? 0 : -1;
      entry.diff.tabIndex = entry.diff === focused ? 0 : -1;
    }
  }
  /** Moves the roving tab stop and the focus together, clamping the row and resolving the column. */
  _focusCell(rowIndex, column) {
    this._updateTabStops(rowIndex, column);
    this._cell(this._focusRow, this._focusColumn)?.focus();
  }
  /**
   * The flyout's toolbar keyboard model: Up/Down (and Home/End) walk the rows keeping the current
   * column where the target row has one, Left/Right cross between a row's label and diff buttons,
   * and Escape dismisses.
   */
  _onListKeyDown(e4) {
    if (this._rows.length === 0) {
      return;
    }
    const event = new StandardKeyboardEvent(e4);
    if (event.keyCode === 9 /* Escape */) {
      event.preventDefault();
      event.stopPropagation();
      this._close();
      return;
    }
    const activeElement = getWindow(this._domNode).document.activeElement;
    const currentIndex = this._rows.findIndex((r2) => r2.jump === activeElement || r2.diff === activeElement);
    const currentColumn = this._rows[currentIndex]?.diff === activeElement ? "diff" : "jump";
    let nextIndex = currentIndex;
    let nextColumn = currentColumn;
    switch (event.keyCode) {
      case 18 /* DownArrow */:
        nextIndex = Math.min(this._rows.length - 1, currentIndex + 1);
        break;
      case 16 /* UpArrow */:
        nextIndex = Math.max(0, currentIndex - 1);
        break;
      case 14 /* Home */:
        nextIndex = 0;
        break;
      case 13 /* End */:
        nextIndex = this._rows.length - 1;
        break;
      case 17 /* RightArrow */:
        nextColumn = "diff";
        break;
      case 15 /* LeftArrow */:
        nextColumn = "jump";
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    this._focusCell(nextIndex, nextColumn);
  }
  setActive(requestId) {
    this._activeRequestId = requestId;
    this._updateActiveClasses();
  }
  _updateActiveClasses() {
    let activeIndex = -1;
    for (let i2 = 0; i2 < this._rows.length; i2++) {
      const row = this._rows[i2];
      const active = this._activeRequestId !== void 0 && (row.tick.requestId === this._activeRequestId || row.tick.allRequestIds.includes(this._activeRequestId));
      if (active) {
        activeIndex = i2;
      }
      row.container.classList.toggle("active", active);
      if (active) {
        row.jump.setAttribute("aria-current", "location");
      } else {
        row.jump.removeAttribute("aria-current");
      }
    }
    this._activeIndex = activeIndex;
    this._updateDotHighlights();
  }
  focusTick(requestId) {
    const index2 = this._rows.findIndex((r2) => r2.tick.requestId === requestId || r2.tick.allRequestIds.includes(requestId));
    if (index2 >= 0) {
      this._focusCell(index2, "jump");
    }
  }
  setHostWidth(width2) {
    if (width2 > 0 && width2 !== this._hostWidth) {
      this._hostWidth = width2;
      this._domNode.classList.toggle("overflowing", width2 < MIN_HOST_WIDTH);
    }
  }
  // The ruler blooms its fan on a hard scroll and scatters marks by scroll position; the gutter rail is a
  // static, evenly-spaced list, so both are intentionally no-ops.
  notifyHardWheel() {
  }
  setScrollLayout(_layout) {
  }
};
export { restDotCount, MAX_REST_DOTS, MIN_REST_DOTS, DOT_SIZE, DOT_GAP, HANDLE_PADDING_Y, MORE_MARKER_HEIGHT, GUTTER_INSET, gutterIdSeq, PromptTimelineGutterRail };
