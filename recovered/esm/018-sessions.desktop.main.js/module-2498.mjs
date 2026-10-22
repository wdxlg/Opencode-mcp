// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptTimeline/promptTimelineModel.ts
import { isRequestVM, isResponseVM } from "./module-0979.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { MAX_TICKS, budgetBucketPrompts } from "./module-2497.mjs";
import { localize } from "./module-0001.mjs";
import { observableSignal } from "./module-0058.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun } from "./module-0052.mjs";
import { transaction } from "./module-0045.mjs";
import { getChatRequestText } from "./module-2183.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { MultiDiffEditorItem } from "./module-1148.mjs";
import { URI } from "./module-0032.mjs";
import { generateUuid } from "./module-0190.mjs";
import { MultiDiffEditorInput } from "./module-1149.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatEditingService } from "./module-1082.mjs";
import { IChatResponseFileChangesService } from "./module-2233.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IFileService } from "./module-0269.mjs";


// src/vs/workbench/contrib/chat/browser/promptTimeline/promptTimelineModel.ts
var MAX_PREVIEW_LENGTH = 80;

function itemKind(item) {
  if (isRequestVM(item)) {
    return "request";
  }
  if (isResponseVM(item)) {
    return "response";
  }
  return "other";
}

function isPromptTimelineRequest(item) {
  return isRequestVM(item) && !item.isSystemInitiated;
}

var CHARS_PER_LINE = 48;

var CODE_BLOCK_UNITS = 3;

var MAX_SIGNAL = 60;

var PRIOR_PX_PER_UNIT = { request: 18, response: 20, other: 40 };

function getPromptPreview(text2) {
  const firstLine = text2.split("\n").map((l) => l.trim()).find((l) => l.length > 0) ?? "";
  return firstLine.length <= MAX_PREVIEW_LENGTH ? firstLine : `${firstLine.slice(0, MAX_PREVIEW_LENGTH)}\u2026`;
}

function promptsEqual(a, b) {
  return a.length === b.length && a.every((p, i2) => p.requestId === b[i2].requestId && p.text === b[i2].text && p.timestamp === b[i2].timestamp);
}

var PromptTimelineModel = class extends Disposable {
  constructor(widget, chatEditingService, chatResponseFileChangesService, editorService, instantiationService, fileService) {
    super();
    this.widget = widget;
    this.chatEditingService = chatEditingService;
    this.chatResponseFileChangesService = chatResponseFileChangesService;
    this.editorService = editorService;
    this.instantiationService = instantiationService;
    this.fileService = fileService;
    /** All user prompts in the chat, updated as the transcript changes. */
    this._prompts = observableValue(this, []);
    /** The chat editing session for this chat, if one exists (local or agent-host). */
    this._editingSession = derived(this, (reader) => {
      const resource = this._sessionResource.read(reader);
      if (!resource) {
        return void 0;
      }
      this.chatEditingService.editingSessionsObs.read(reader);
      return this.chatEditingService.getEditingSession(resource);
    });
    /** Recency-bucketed ticks, capped to a fixed maximum so each keeps a >=24px slot. */
    this._baseTicks = derived(this, (reader) => {
      const prompts = this._prompts.read(reader);
      return budgetBucketPrompts(prompts, Date.now(), MAX_TICKS).map((bucket) => ({
        requestId: bucket.prompt.requestId,
        allRequestIds: bucket.prompts.map((p) => p.requestId),
        text: bucket.prompt.text,
        timestamp: bucket.prompt.timestamp,
        count: bucket.count,
        ariaLabel: bucket.count === 1 ? localize(11588, null, bucket.prompt.text) : localize(11589, null, bucket.count, bucket.prompt.text)
      }));
    });
    /** Ticks decorated with per-prompt diff stats (server per-turn changeset, else editing session). */
    this._ticks = derived(this, (reader) => {
      const base = this._baseTicks.read(reader);
      return base.map((tick) => {
        const stat = this._statForRequests(tick.allRequestIds, reader);
        return stat ? { ...tick, stat } : tick;
      });
    });
    /**
     * One tick per user prompt — unbucketed and uncapped, decorated with per-prompt diff stats. The
     * gutter rail lists every prompt as its own entry (no recency bucketing/sampling), so it needs the
     * raw prompt list rather than the capped {@link ticks} the overview ruler uses.
     */
    this._promptTicks = derived(this, (reader) => {
      const prompts = this._prompts.read(reader);
      return prompts.map((prompt) => {
        const base = {
          requestId: prompt.requestId,
          allRequestIds: [prompt.requestId],
          text: prompt.text,
          timestamp: prompt.timestamp,
          count: 1,
          ariaLabel: localize(11588, null, prompt.text)
        };
        const stat = this._statForRequests(base.allRequestIds, reader);
        return stat ? { ...base, stat } : base;
      });
    });
    this._activeRequestId = observableValue(this, void 0);
    /** The exact request currently scrolled to the top, unbucketed — drives the sticky header's label/position and the gutter rail's active row. */
    this._activePromptId = observableValue(this, void 0);
    /** True once the active prompt's own row has scrolled above the viewport top (drives the sticky header). */
    this._scrollPinned = observableValue(this, false);
    /** The active prompt with its 1-based position among all (unbucketed) prompts, for the sticky header. */
    this._activePrompt = derived(this, (reader) => {
      const id2 = this._activePromptId.read(reader);
      if (id2 === void 0) {
        return void 0;
      }
      const prompts = this._prompts.read(reader);
      const index2 = prompts.findIndex((p) => p.requestId === id2);
      return index2 < 0 ? void 0 : { text: prompts[index2].text, index: index2 + 1, total: prompts.length };
    });
    /** Fires when the transcript scroll offset or content height changes (drives the ruler rail). */
    this._scrollLayoutSignal = observableSignal(this);
    this._viewModelListener = this._register(new MutableDisposable());
    /** Per-item content-signal cache (id -> {version, signal}) for height estimation; version invalidates on content growth. */
    this._signalCache = /* @__PURE__ */ new Map();
    /** Per-request preview cache (id -> {messageText, preview}); recognizing an Agent Merge turn parses its whole state block, and `_recompute` runs on every streamed token. */
    this._previewCache = /* @__PURE__ */ new Map();
    this._sessionResource = observableFromEvent(this, this.widget.onDidChangeViewModel, () => this.widget.viewModel?.sessionResource);
    this._register(this.widget.onDidChangeViewModel(() => this._bindViewModel()));
    this._register(this.widget.onDidScroll(() => {
      this._updateActive();
      this._triggerScrollLayout();
    }));
    this._register(this.widget.onDidChangeContentHeight(() => this._triggerScrollLayout()));
    this._register(autorun((reader) => {
      this._baseTicks.read(reader);
      this._updateActive();
      this._triggerScrollLayout();
    }));
    this._bindViewModel();
  }
  get ticks() {
    return this._ticks;
  }
  get promptTicks() {
    return this._promptTicks;
  }
  get activeRequestId() {
    return this._activeRequestId;
  }
  get activePromptId() {
    return this._activePromptId;
  }
  get activePinned() {
    return this._scrollPinned;
  }
  get activePrompt() {
    return this._activePrompt;
  }
  get onDidChangeScrollLayout() {
    return this._scrollLayoutSignal;
  }
  _triggerScrollLayout() {
    transaction((tx) => this._scrollLayoutSignal.trigger(tx));
  }
  /**
   * The prompts' positions for the overview-ruler rail, in an *estimated*
   * content space that stays stable while the transcript virtualizes. The rail
   * draws its own scrollbar thumb from `scrollTop`/`scrollHeight` (the transcript's
   * native scrollbar is hidden while the rail is active) so the whole lane is one
   * surface: a plain scrollbar that blooms into the prompt fan on engagement.
   *
   * The chat list's own height model (`getElementTop`/`scrollHeight`) guesses
   * every un-rendered row at one flat default height (200px). Real turns are
   * nothing like flat — prompts are short, responses tall and variable — so as
   * rows render and get measured the list's tops snap around, dragging the marks
   * with them (the "scroll jitter"). For the marks we instead build our own
   * heights: measured rows use their real `currentRenderedHeight`; un-measured
   * rows are estimated from a content signal calibrated to measured rows (see
   * `_computeAdaptiveLayout`), so marks land near their final spot immediately and
   * barely drift. Once every row is measured this estimate equals the list's real
   * layout.
   */
  getScrollLayout() {
    const layout2 = this._computeAdaptiveLayout();
    if (!layout2) {
      return void 0;
    }
    const { items, tops, total } = layout2;
    const marks = [];
    for (let i2 = 0; i2 < items.length; i2++) {
      const item = items[i2];
      if (isPromptTimelineRequest(item)) {
        marks.push({ requestId: item.id, top: tops[i2] });
      }
    }
    return { marks, total, scrollTop: this.widget.scrollTop, scrollHeight: this.widget.scrollHeight, viewportHeight: this.widget.viewportHeight };
  }
  /**
   * Builds a per-item content-height model for the marks. Measured rows
   * contribute their real rendered height; un-measured rows are estimated from a
   * cheap content signal (~ rendered line count) scaled by a pixels-per-unit
   * factor *learned from the measured rows of the same kind*, so the estimate
   * calibrates to the real line height/width instead of relying on magic
   * constants. Falls back to a seed factor until a row of that kind is measured.
   */
  _computeAdaptiveLayout() {
    const items = this.widget.viewModel?.getItems();
    if (!items) {
      return void 0;
    }
    const measuredPx = { request: 0, response: 0, other: 0 };
    const measuredSignal = { request: 0, response: 0, other: 0 };
    for (const item of items) {
      const measured = item.currentRenderedHeight;
      if (measured !== void 0 && measured > 0) {
        const kind = itemKind(item);
        measuredPx[kind] += measured;
        measuredSignal[kind] += this._itemSignal(item);
      }
    }
    const pxPerUnit = (kind) => measuredSignal[kind] > 0 ? measuredPx[kind] / measuredSignal[kind] : PRIOR_PX_PER_UNIT[kind];
    const tops = [];
    let acc = 0;
    for (const item of items) {
      tops.push(acc);
      const measured = item.currentRenderedHeight;
      acc += measured !== void 0 && measured > 0 ? measured : pxPerUnit(itemKind(item)) * this._itemSignal(item);
    }
    return { items, tops, total: acc };
  }
  /**
   * A cheap, unit-less size proxy for a row (~ rendered line count), used to
   * estimate un-measured rows. Cached per item and only recomputed when the
   * content grows (responses stream), so scanning every row on each scroll stays
   * cheap even for long sessions.
   */
  _itemSignal(item) {
    if (isRequestVM(item)) {
      const cached = this._signalCache.get(item.id);
      const version2 = item.messageText.length;
      if (cached && cached.version === version2) {
        return cached.signal;
      }
      const signal = Math.min(MAX_SIGNAL, 1 + Math.ceil(version2 / CHARS_PER_LINE));
      this._signalCache.set(item.id, { version: version2, signal });
      return signal;
    }
    if (isResponseVM(item)) {
      const parts = item.response.value;
      const cached = this._signalCache.get(item.id);
      if (cached && cached.version === parts.length) {
        return cached.signal;
      }
      const text2 = item.response.getMarkdown();
      const codeBlocks = Math.floor((text2.match(/```/g)?.length ?? 0) / 2);
      const lines = Math.ceil(text2.length / CHARS_PER_LINE);
      const signal = Math.min(MAX_SIGNAL, 1 + lines + codeBlocks * CODE_BLOCK_UNITS);
      this._signalCache.set(item.id, { version: parts.length, signal });
      return signal;
    }
    return 1;
  }
  /**
   * Preview of a prompt, which for a request rendered as something other than
   * its own text (an Agent Merge turn) previews that stand-in label instead.
   */
  _requestPreview(item) {
    const messageText2 = item.messageText;
    const cached = this._previewCache.get(item.id);
    if (cached && cached.messageText === messageText2) {
      return cached.preview;
    }
    const preview = getPromptPreview(getChatRequestText(item));
    this._previewCache.set(item.id, { messageText: messageText2, preview });
    return preview;
  }
  _bindViewModel() {
    this._signalCache.clear();
    this._previewCache.clear();
    this._viewModelListener.value = this.widget.viewModel?.onDidChange(() => this._recompute());
    this._recompute();
  }
  _recompute() {
    const prompts = [];
    for (const item of this.widget.viewModel?.getItems() ?? []) {
      if (isPromptTimelineRequest(item)) {
        prompts.push({ requestId: item.id, text: this._requestPreview(item), timestamp: item.timestamp });
      }
    }
    if (promptsEqual(prompts, this._prompts.get())) {
      this._updateActive();
      return;
    }
    this._prompts.set(prompts, void 0);
  }
  /** Recomputes which tick maps to the prompt currently scrolled into view. */
  _updateActive() {
    const ticks = this._baseTicks.get();
    const items = this.widget.viewModel?.getItems();
    if (!items || ticks.length === 0) {
      transaction((tx) => {
        this._activeRequestId.set(void 0, tx);
        this._activePromptId.set(void 0, tx);
        this._scrollPinned.set(false, tx);
      });
      return;
    }
    const scrollTop = this.widget.scrollTop;
    const isScrolledToBottom = scrollTop + this.widget.viewportHeight >= this.widget.scrollHeight - 2;
    let activeRequestId;
    let activeTimestamp = 0;
    let activeTop = -1;
    if (isScrolledToBottom) {
      for (let i2 = items.length - 1; i2 >= 0; i2--) {
        const item = items[i2];
        if (!isPromptTimelineRequest(item)) {
          continue;
        }
        const top2 = this.widget.getElementTop(item);
        if (top2 === void 0 || top2 > scrollTop) {
          continue;
        }
        activeRequestId = item.id;
        activeTimestamp = item.timestamp;
        activeTop = top2;
        break;
      }
    } else {
      for (const item of items) {
        if (isPromptTimelineRequest(item)) {
          const top2 = this.widget.getElementTop(item);
          if (top2 === void 0) {
            continue;
          }
          if (top2 > scrollTop) {
            break;
          }
          activeRequestId = item.id;
          activeTimestamp = item.timestamp;
          activeTop = top2;
        }
      }
    }
    if (activeRequestId === void 0) {
      transaction((tx) => {
        this._activeRequestId.set(ticks.at(0)?.requestId, tx);
        this._activePromptId.set(this._prompts.get().at(0)?.requestId, tx);
        this._scrollPinned.set(false, tx);
      });
      return;
    }
    let activeTick = ticks.find((t2) => t2.allRequestIds.includes(activeRequestId));
    if (!activeTick) {
      for (const tick of ticks) {
        if (tick.timestamp <= activeTimestamp) {
          activeTick = tick;
        } else {
          break;
        }
      }
    }
    const pinned = activeTop < scrollTop - 2;
    transaction((tx) => {
      this._activeRequestId.set((activeTick ?? ticks[ticks.length - 1]).requestId, tx);
      this._activePromptId.set(activeRequestId, tx);
      this._scrollPinned.set(pinned, tx);
    });
  }
  /** Reveals the request with the given id at the top of the transcript. */
  reveal(requestId) {
    const items = this.widget.viewModel?.getItems();
    const index2 = items?.findIndex((i2) => isRequestVM(i2) && i2.id === requestId) ?? -1;
    if (items && index2 >= 0) {
      this.widget.reveal(items[index2], 0);
    }
    const owningTick = this._baseTicks.get().find((t2) => t2.allRequestIds.includes(requestId));
    this._activeRequestId.set(owningTick?.requestId ?? requestId, void 0);
  }
  /**
   * Reveals the prompt the sticky header currently names (the prompt scrolled to the top). Used when the
   * header's label is activated so it jumps straight to that prompt, aligned to the top of the transcript.
   */
  revealActivePrompt() {
    const id2 = this._activePromptId.get();
    if (id2 !== void 0) {
      this.reveal(id2);
    }
  }
  /** The changed files for a tick's prompts, aggregated per file (for the hover card / drill-down). */
  getRequestFiles(tick) {
    const byPath = /* @__PURE__ */ new Map();
    for (const requestId of tick.allRequestIds) {
      for (const diff4 of this._diffsForRequest(requestId)) {
        if (diff4.identical) {
          continue;
        }
        const key3 = diff4.modifiedURI.toString();
        const existing = byPath.get(key3);
        if (existing) {
          byPath.set(key3, {
            ...existing,
            diffModifiedURI: diff4.modifiedSnapshotURI ?? diff4.modifiedURI,
            added: existing.added + diff4.added,
            removed: existing.removed + diff4.removed
          });
        } else {
          byPath.set(key3, {
            name: basename2(diff4.modifiedURI),
            originalURI: diff4.originalURI,
            modifiedURI: diff4.modifiedURI,
            diffModifiedURI: diff4.modifiedSnapshotURI ?? diff4.modifiedURI,
            added: diff4.added,
            removed: diff4.removed
          });
        }
      }
    }
    return [...byPath.values()];
  }
  /**
   * Opens the per-prompt changes as a multi-file diff. When a specific file is
   * given (a file row in the card), the same multi-diff is opened but revealed
   * at that file, so per-file and whole-prompt review share one experience.
   */
  async reviewChanges(tick, file) {
    const files = this.getRequestFiles(tick);
    if (files.length === 0) {
      return;
    }
    const items = [];
    let revealResource;
    for (const f of files) {
      const [originalURI, modifiedURI] = await this._readableSides(f);
      if (!originalURI && !modifiedURI) {
        continue;
      }
      items.push(new MultiDiffEditorItem(originalURI, modifiedURI, f.modifiedURI));
      if (file && isEqual2(f.modifiedURI, file)) {
        revealResource = { original: originalURI, modified: modifiedURI };
      }
    }
    if (items.length === 0) {
      return;
    }
    const source = URI.parse(`multi-diff-editor:prompt-timeline/${generateUuid()}`);
    const input = this.instantiationService.createInstance(
      MultiDiffEditorInput,
      source,
      localize(11587, null, tick.text),
      items,
      false
    );
    const options3 = revealResource ? { viewState: { revealData: { resource: revealResource } } } : void 0;
    await this.editorService.openEditor(input, options3);
  }
  /**
   * Resolves which sides of a file diff can actually be read. Prefers the frozen
   * before/after snapshots so only this turn's changes show, but the agent-host
   * checkpoint blobs backing them can be missing (an added file's original, or a
   * pruned/restored session where whole checkpoints are gone). The modified side
   * then falls back to the live working file so review still opens with the best
   * available fidelity; an unreadable side is dropped so the file still renders
   * as a pure add/delete instead of crashing the diff editor.
   */
  async _readableSides(file) {
    const hasFrozenOriginal = !isEqual2(file.originalURI, file.modifiedURI);
    const hasFrozenModified = !isEqual2(file.diffModifiedURI, file.modifiedURI);
    const [frozenOriginalReadable, frozenModifiedReadable, liveModifiedReadable] = await Promise.all([
      hasFrozenOriginal ? this._canRead(file.originalURI) : Promise.resolve(false),
      hasFrozenModified ? this._canRead(file.diffModifiedURI) : Promise.resolve(false),
      this._canRead(file.modifiedURI)
    ]);
    const modified = frozenModifiedReadable ? file.diffModifiedURI : liveModifiedReadable ? file.modifiedURI : void 0;
    return [frozenOriginalReadable ? file.originalURI : void 0, modified];
  }
  async _canRead(resource) {
    try {
      await this.fileService.readFile(resource, { length: 1 });
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Per-request file diffs, preferring the session type's authoritative
   * provider (agent-host sessions expose a server-computed per-turn changeset
   * that survives reload), and falling back to the chat editing session.
   */
  _diffsForRequest(requestId, reader) {
    const resource = reader ? this._sessionResource.read(reader) : this._sessionResource.get();
    if (resource) {
      const provided = this.chatResponseFileChangesService.getChangesForRequest(resource, requestId);
      if (provided) {
        return reader ? provided.read(reader) : provided.get();
      }
    }
    const session = reader ? this._editingSession.read(reader) : this._editingSession.get();
    if (session) {
      const obs = session.getDiffsForFilesInRequest(requestId);
      return reader ? obs.read(reader) : obs.get();
    }
    return [];
  }
  /** Sums the diff stats across the given requests, or undefined when nothing changed. */
  _statForRequests(requestIds, reader) {
    let added = 0;
    let removed = 0;
    const files = /* @__PURE__ */ new Set();
    for (const requestId of requestIds) {
      for (const diff4 of this._diffsForRequest(requestId, reader)) {
        if (diff4.identical) {
          continue;
        }
        added += diff4.added;
        removed += diff4.removed;
        files.add(diff4.modifiedURI.toString());
      }
    }
    return files.size > 0 ? { added, removed, fileCount: files.size } : void 0;
  }
};

PromptTimelineModel = __decorateClass([
  __decorateParam(1, IChatEditingService),
  __decorateParam(2, IChatResponseFileChangesService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IFileService)
], PromptTimelineModel);
export { itemKind, isPromptTimelineRequest, getPromptPreview, promptsEqual, MAX_PREVIEW_LENGTH, CHARS_PER_LINE, CODE_BLOCK_UNITS, MAX_SIGNAL, PRIOR_PX_PER_UNIT, PromptTimelineModel };
