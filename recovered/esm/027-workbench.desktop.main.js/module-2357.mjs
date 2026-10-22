// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/chatTerminalCommandMirror.ts
import { Color } from "./module-0197.mjs";
import { TERMINAL_BACKGROUND_COLOR } from "./module-1174.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { editorBackground } from "./module-0229.mjs";
import { PANEL_BACKGROUND } from "./module-0912.mjs";
import { getWindow } from "./module-0075.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { CancellationError } from "./module-0004.mjs";
import { DetachedProcessInfo } from "./module-2356.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalService } from "./module-1149.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { Sequencer } from "./module-0036.mjs";


// src/vs/workbench/contrib/terminal/browser/chatTerminalCommandMirror.ts
function getChatTerminalBackgroundColor(theme, contextKeyService, storedBackground) {
  if (storedBackground) {
    const color2 = Color.fromHex(storedBackground);
    if (color2) {
      return color2;
    }
  }
  const terminalBackground = theme.getColor(TERMINAL_BACKGROUND_COLOR);
  if (terminalBackground) {
    return terminalBackground;
  }
  const isInEditor = ChatContextKeys.inChatEditor.getValue(contextKeyService);
  return theme.getColor(isInEditor ? editorBackground : PANEL_BACKGROUND);
}

function computeMaxBufferColumnWidth(buffer, cols) {
  let maxWidth = 0;
  for (let y = 0; y < buffer.length; y++) {
    const line = buffer.getLine(y);
    if (!line) {
      continue;
    }
    const lineLength = Math.min(line.length, cols);
    for (let x = lineLength - 1; x >= 0; x--) {
      if (line.getCell(x)?.getChars()) {
        maxWidth = Math.max(maxWidth, x + 1);
        break;
      }
    }
  }
  return maxWidth;
}

function vtBoundaryMatches(newVT, oldVT, slicePoint, windowSize = 50) {
  const start = Math.max(0, slicePoint - windowSize);
  const end = slicePoint;
  for (let i2 = start; i2 < end; i2++) {
    if (newVT.charCodeAt(i2) !== oldVT.charCodeAt(i2)) {
      return false;
    }
  }
  return true;
}

function computeChatTerminalMirrorCols(availableWidthPx, font, devicePixelRatio, horizontalChromePx = 20 /* MirrorHorizontalPaddingPx */) {
  if (!isFinite(availableWidthPx) || availableWidthPx <= 0 || !font.charWidth) {
    return 80 /* MirrorColCountFallback */;
  }
  const dpr = isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  const scaledWidthAvailable = (availableWidthPx - horizontalChromePx) * dpr;
  const scaledCharWidth = font.charWidth * dpr + font.letterSpacing;
  return Math.max(Math.floor(scaledWidthAvailable / scaledCharWidth), 1);
}

function getMirrorRaw(detached) {
  return detached.xterm.raw;
}

function enableCursorLineReflow(detached) {
  getMirrorRaw(detached).options.reflowCursorLine = true;
}

function getMirrorDevicePixelRatio(detached) {
  return getWindow(getMirrorRaw(detached).element).devicePixelRatio;
}

function measureMirrorHorizontalChrome(detached) {
  const element = getMirrorRaw(detached).element;
  if (!element) {
    return void 0;
  }
  const style = getWindow(element).getComputedStyle(element);
  const chrome = parseInt(style.paddingLeft) + parseInt(style.paddingRight);
  return isNaN(chrome) ? void 0 : Math.max(chrome, 0);
}

function getMirrorRowHeightPx(detached) {
  const font = detached?.xterm.getFont();
  if (!font?.charHeight || font.charHeight <= 0) {
    return void 0;
  }
  const lineHeight = font.lineHeight > 0 ? font.lineHeight : 1;
  return font.charHeight * lineHeight;
}

function computeOutputLineCount(startLine, endLine) {
  return Math.max(endLine - startLine, 0);
}

function computeSnapshotLineCount(buffer, lineCount) {
  if (lineCount !== void 0) {
    return lineCount;
  }
  const cursorLineIndex = buffer.baseY + buffer.cursorY;
  const hasCursorLineContent = !!buffer.getLine(cursorLineIndex)?.translateToString(true);
  const endLine = cursorLineIndex + (hasCursorLineContent ? 1 : 0);
  return computeOutputLineCount(0, endLine);
}

async function getCommandOutputSnapshot(xtermTerminal, command4, log4) {
  const executedMarker = command4.executedMarker;
  const endMarker = command4.endMarker;
  if (!endMarker || endMarker.isDisposed) {
    return void 0;
  }
  if (!executedMarker || executedMarker.isDisposed) {
    const raw = xtermTerminal.raw;
    const buffer = raw.buffer.active;
    const offsets = [
      -(buffer.baseY + buffer.cursorY),
      -buffer.baseY,
      0
    ];
    let startMarker;
    for (const offset of offsets) {
      startMarker = raw.registerMarker(offset);
      if (startMarker) {
        break;
      }
    }
    if (!startMarker || startMarker.isDisposed) {
      return { text: "", lineCount: 0 };
    }
    const startLine2 = startMarker.line;
    let text3;
    try {
      text3 = await xtermTerminal.getRangeAsVT(startMarker, endMarker, true);
    } catch (error) {
      log4?.("fallback", error);
      return void 0;
    } finally {
      startMarker.dispose();
    }
    if (!text3) {
      return { text: "", lineCount: 0 };
    }
    const endLine2 = endMarker.line;
    const lineCount2 = computeOutputLineCount(startLine2, endLine2);
    return { text: text3, lineCount: lineCount2 };
  }
  const startLine = executedMarker.line;
  const endLine = endMarker.line;
  const lineCount = computeOutputLineCount(startLine, endLine);
  let text2;
  try {
    text2 = await xtermTerminal.getRangeAsVT(executedMarker, endMarker, true);
  } catch (error) {
    log4?.("primary", error);
    return void 0;
  }
  if (!text2) {
    return { text: "", lineCount: 0 };
  }
  return { text: text2, lineCount };
}

var DetachedTerminalCommandMirror = class extends Disposable {
  constructor(_xtermTerminal, _command, _terminalService, _contextKeyService) {
    super();
    this._xtermTerminal = _xtermTerminal;
    this._command = _command;
    this._terminalService = _terminalService;
    this._contextKeyService = _contextKeyService;
    this._streamingDisposables = this._register(new DisposableStore());
    this._onDidUpdateEmitter = this._register(new Emitter());
    this.onDidUpdate = this._onDidUpdateEmitter.event;
    this._onDidInputEmitter = this._register(new Emitter());
    this.onDidInput = this._onDidInputEmitter.event;
    this._onDidChangeRowHeightEmitter = this._register(new Emitter());
    this.onDidChangeRowHeight = this._onDidChangeRowHeightEmitter.event;
    this._renderListenerInstalled = false;
    this._lastVT = "";
    this._lineCount = 0;
    this._maxColumnWidth = 0;
    this._dirtyScheduled = false;
    this._isStreaming = false;
    this._register(toDisposable(() => {
      this._stopStreaming();
    }));
  }
  async attach(container3) {
    if (this._store.isDisposed) {
      return;
    }
    let terminal2;
    try {
      terminal2 = await this._getOrCreateTerminal();
    } catch (error) {
      if (error instanceof CancellationError) {
        return;
      }
      throw error;
    }
    if (this._store.isDisposed) {
      return;
    }
    if (this._attachedContainer !== container3) {
      container3.classList.add("chat-terminal-output-terminal");
      terminal2.attachToElement(container3, { enableGpu: false });
      this._attachedContainer = container3;
    }
    this._installFirstRenderListener(terminal2);
  }
  /**
   * The height in CSS pixels of one rendered row of this mirror, or undefined until the
   * detached terminal exists. Reflects the renderer's actual cell metrics once it has
   * rendered, so box-height math matches what xterm paints.
   */
  getRowHeightPx() {
    if (this._store.isDisposed) {
      return void 0;
    }
    return getMirrorRowHeightPx(this._detachedTerminal);
  }
  _installFirstRenderListener(detached) {
    if (this._renderListenerInstalled) {
      return;
    }
    this._renderListenerInstalled = true;
    this._register(getMirrorRaw(detached).onRender(() => this._notifyRowHeightIfChanged()));
  }
  _notifyRowHeightIfChanged() {
    const rowHeight = this.getRowHeightPx();
    if (rowHeight !== void 0 && rowHeight !== this._lastObservedRowHeight) {
      this._lastObservedRowHeight = rowHeight;
      this._onDidChangeRowHeightEmitter.fire();
    }
  }
  async renderCommand() {
    if (this._store.isDisposed) {
      return void 0;
    }
    let detached;
    try {
      detached = await this._getOrCreateTerminal();
    } catch (error) {
      if (error instanceof CancellationError) {
        return void 0;
      }
      throw error;
    }
    if (this._store.isDisposed) {
      return void 0;
    }
    let vt;
    try {
      vt = await this._getCommandOutputAsVT(this._xtermTerminal);
    } catch {
    }
    if (!vt) {
      return void 0;
    }
    if (this._store.isDisposed) {
      return void 0;
    }
    await new Promise((resolve3) => {
      const canAppend = !!this._lastVT && vt.text.length >= this._lastVT.length && this._vtBoundaryMatches(vt.text, this._lastVT.length);
      if (!canAppend) {
        const payload = this._lastVT ? `\x1Bc${vt.text}` : vt.text;
        if (payload) {
          detached.xterm.write(payload, resolve3);
        } else {
          resolve3();
        }
      } else {
        const appended = vt.text.slice(this._lastVT.length);
        if (appended) {
          detached.xterm.write(appended, resolve3);
        } else {
          resolve3();
        }
      }
    });
    this._lastVT = vt.text;
    const sourceRaw = this._xtermTerminal.raw;
    if (sourceRaw) {
      this._sourceRaw = sourceRaw;
      this._lastUpToDateCursorY = this._getAbsoluteCursorY(sourceRaw);
      if (!this._isStreaming && (!this._command.endMarker || this._command.endMarker.isDisposed)) {
        this._startStreaming(sourceRaw);
      }
    }
    this._lineCount = this._getRenderedLineCount();
    const commandFinished = this._command.endMarker && !this._command.endMarker.isDisposed;
    if (commandFinished && this._lineCount <= 100 /* MaxLinesForColumnWidthComputation */) {
      this._maxColumnWidth = this._computeMaxColumnWidth();
    }
    return { lineCount: this._lineCount, maxColumnWidth: this._maxColumnWidth };
  }
  /**
   * Resizes the mirror to fill the given width, relying on xterm's native resize reflow to
   * re-wrap soft-wrapped lines. No-op when the resulting cols are unchanged. The column
   * count derives from the mirror's own xterm font metrics, which reflect the actual
   * renderer cell size rather than a configuration-based estimate.
   */
  async layout(widthPx) {
    if (this._store.isDisposed || widthPx <= 0) {
      return void 0;
    }
    let detached;
    try {
      detached = await this._getOrCreateTerminal();
    } catch (error) {
      if (error instanceof CancellationError) {
        return void 0;
      }
      throw error;
    }
    if (this._store.isDisposed) {
      return void 0;
    }
    const cols = computeChatTerminalMirrorCols(widthPx, detached.xterm.getFont(), getMirrorDevicePixelRatio(detached), measureMirrorHorizontalChrome(detached));
    if (detached.xterm.cols === cols) {
      return void 0;
    }
    await this._flushPromise;
    if (this._store.isDisposed || detached.xterm.cols === cols) {
      return void 0;
    }
    detached.xterm.resize(cols, 10 /* MirrorRowCount */);
    if (!this._lastVT) {
      return void 0;
    }
    this._lineCount = this._getRenderedLineCount();
    const commandFinished = this._command.endMarker && !this._command.endMarker.isDisposed;
    if (commandFinished && this._lineCount <= 100 /* MaxLinesForColumnWidthComputation */) {
      this._maxColumnWidth = this._computeMaxColumnWidth();
    }
    return { lineCount: this._lineCount, maxColumnWidth: this._maxColumnWidth };
  }
  async _getCommandOutputAsVT(source) {
    if (this._store.isDisposed) {
      return void 0;
    }
    const executedMarker = this._command.executedMarker ?? this._command.commandExecutedMarker;
    if (!executedMarker) {
      return void 0;
    }
    const endMarker = this._command.endMarker;
    const text2 = await source.getRangeAsVT(executedMarker, endMarker, endMarker?.line !== executedMarker.line);
    if (this._store.isDisposed) {
      return void 0;
    }
    if (!text2) {
      return { text: "" };
    }
    return { text: text2 };
  }
  _getRenderedLineCount() {
    const detachedBuffer = this._detachedTerminal?.xterm.buffer.active;
    if (detachedBuffer) {
      return computeSnapshotLineCount(detachedBuffer);
    }
    const endMarker = this._command.endMarker;
    if (this._command.executedMarker && endMarker && !endMarker.isDisposed) {
      const startLine = this._command.executedMarker.line;
      const endLine = endMarker.line;
      return computeOutputLineCount(startLine, endLine);
    }
    const executedMarker = this._command.executedMarker ?? this._command.commandExecutedMarker;
    if (executedMarker && this._sourceRaw) {
      const buffer = this._sourceRaw.buffer.active;
      const currentLine = buffer.baseY + buffer.cursorY;
      return computeOutputLineCount(executedMarker.line, currentLine);
    }
    return this._lineCount;
  }
  _computeMaxColumnWidth() {
    const detached = this._detachedTerminal;
    if (!detached) {
      return 0;
    }
    return computeMaxBufferColumnWidth(detached.xterm.buffer.active, detached.xterm.cols);
  }
  async _getOrCreateTerminal() {
    if (this._detachedTerminal) {
      return this._detachedTerminal;
    }
    if (this._detachedTerminalPromise) {
      return this._detachedTerminalPromise;
    }
    if (this._store.isDisposed) {
      throw new CancellationError();
    }
    const createPromise = (async () => {
      const colorProvider = {
        getBackgroundColor: (theme) => getChatTerminalBackgroundColor(theme, this._contextKeyService)
      };
      const processInfo = new DetachedProcessInfo({ initialCwd: "" });
      const detached = await this._terminalService.createDetachedTerminal({
        cols: this._xtermTerminal.raw.cols ?? 80 /* MirrorColCountFallback */,
        rows: 10 /* MirrorRowCount */,
        readonly: false,
        processInfo,
        disableOverviewRuler: true,
        colorProvider
      });
      if (this._store.isDisposed) {
        processInfo.dispose();
        detached.dispose();
        throw new CancellationError();
      }
      enableCursorLineReflow(detached);
      this._detachedTerminal = detached;
      this._register(processInfo);
      this._register(detached);
      this._register(detached.onData((data) => this._onDidInputEmitter.fire(data)));
      return detached;
    })();
    this._detachedTerminalPromise = createPromise;
    return createPromise;
  }
  _startStreaming(raw) {
    if (this._store.isDisposed || this._isStreaming) {
      return;
    }
    this._isStreaming = true;
    this._streamingDisposables.add(Event2.any(raw.onCursorMove, raw.onLineFeed, raw.onWriteParsed)(() => this._handleCursorEvent()));
    this._streamingDisposables.add(raw.onData(() => this._handleCursorEvent()));
  }
  _stopStreaming() {
    if (!this._isStreaming) {
      return;
    }
    this._streamingDisposables.clear();
    this._isStreaming = false;
    this._lowestDirtyCursorY = void 0;
    this._sourceRaw = void 0;
  }
  _handleCursorEvent() {
    if (this._store.isDisposed || !this._sourceRaw) {
      return;
    }
    const cursorY = this._getAbsoluteCursorY(this._sourceRaw);
    this._lowestDirtyCursorY = this._lowestDirtyCursorY === void 0 ? cursorY : Math.min(this._lowestDirtyCursorY, cursorY);
    this._scheduleFlush();
  }
  _scheduleFlush() {
    if (this._dirtyScheduled || this._store.isDisposed) {
      return;
    }
    this._dirtyScheduled = true;
    queueMicrotask(() => {
      this._dirtyScheduled = false;
      if (this._store.isDisposed) {
        return;
      }
      this._flushDirtyRange();
    });
  }
  _flushDirtyRange() {
    if (this._store.isDisposed || this._flushPromise) {
      return;
    }
    this._flushPromise = this._doFlushDirtyRange().finally(() => {
      this._flushPromise = void 0;
    });
  }
  async _doFlushDirtyRange() {
    if (this._store.isDisposed) {
      return;
    }
    const sourceRaw = this._xtermTerminal.raw;
    let detached = this._detachedTerminal;
    if (!detached) {
      try {
        detached = await this._getOrCreateTerminal();
      } catch (error) {
        if (error instanceof CancellationError) {
          return;
        }
        throw error;
      }
    }
    if (this._store.isDisposed) {
      return;
    }
    const detachedRaw = detached?.xterm;
    if (!sourceRaw || !detachedRaw) {
      return;
    }
    this._sourceRaw = sourceRaw;
    const currentCursor = this._getAbsoluteCursorY(sourceRaw);
    const previousCursor = this._lastUpToDateCursorY ?? currentCursor;
    const startCandidate = this._lowestDirtyCursorY ?? currentCursor;
    this._lowestDirtyCursorY = void 0;
    const startLine = Math.min(previousCursor, startCandidate);
    const vt = await this._getCommandOutputAsVT(this._xtermTerminal);
    if (!vt) {
      return;
    }
    if (this._store.isDisposed) {
      return;
    }
    if (vt.text === this._lastVT) {
      this._lastUpToDateCursorY = currentCursor;
      if (this._command.endMarker && !this._command.endMarker.isDisposed) {
        this._stopStreaming();
      }
      return;
    }
    const canAppend = !!this._lastVT && startLine >= previousCursor && vt.text.length >= this._lastVT.length && this._vtBoundaryMatches(vt.text, this._lastVT.length);
    await new Promise((resolve3) => {
      if (!canAppend) {
        const payload = this._lastVT ? `\x1Bc${vt.text}` : vt.text;
        if (payload) {
          detachedRaw.write(payload, resolve3);
        } else {
          resolve3();
        }
      } else {
        const appended = vt.text.slice(this._lastVT.length);
        if (appended) {
          detachedRaw.write(appended, resolve3);
        } else {
          resolve3();
        }
      }
    });
    this._lastVT = vt.text;
    this._lineCount = this._getRenderedLineCount();
    this._lastUpToDateCursorY = currentCursor;
    const commandFinished = this._command.endMarker && !this._command.endMarker.isDisposed;
    if (commandFinished) {
      if (this._lineCount <= 100 /* MaxLinesForColumnWidthComputation */) {
        this._maxColumnWidth = this._computeMaxColumnWidth();
      }
      this._stopStreaming();
    }
    this._onDidUpdateEmitter.fire({ lineCount: this._lineCount, maxColumnWidth: this._maxColumnWidth });
  }
  _getAbsoluteCursorY(raw) {
    return raw.buffer.active.baseY + raw.buffer.active.cursorY;
  }
  /**
   * Checks if the new VT text matches the old VT around the boundary where we would slice.
   */
  _vtBoundaryMatches(newVT, slicePoint) {
    return vtBoundaryMatches(newVT, this._lastVT, slicePoint);
  }
};

DetachedTerminalCommandMirror = __decorateClass([
  __decorateParam(2, ITerminalService),
  __decorateParam(3, IContextKeyService)
], DetachedTerminalCommandMirror);

var DetachedTerminalSnapshotMirror = class extends Disposable {
  constructor(output, _getTheme, _terminalService, _contextKeyService) {
    super();
    this._getTheme = _getTheme;
    this._terminalService = _terminalService;
    this._contextKeyService = _contextKeyService;
    this._renderSequencer = new Sequencer();
    this._outputVersion = 0;
    this._renderedVersion = -1;
    this._lastRenderedText = "";
    this._onDidChangeRowHeightEmitter = this._register(new Emitter());
    this.onDidChangeRowHeight = this._onDidChangeRowHeightEmitter.event;
    this._renderListenerInstalled = false;
    this._output = output;
    const processInfo = this._register(new DetachedProcessInfo({ initialCwd: "" }));
    this._detachedTerminal = this._terminalService.createDetachedTerminal({
      cols: 80 /* MirrorColCountFallback */,
      rows: 10 /* MirrorRowCount */,
      readonly: true,
      processInfo,
      disableOverviewRuler: true,
      colorProvider: {
        getBackgroundColor: (theme) => {
          const storedBackground = this._getTheme()?.background;
          return getChatTerminalBackgroundColor(theme, this._contextKeyService, storedBackground);
        }
      }
    }).then((terminal2) => {
      if (this._store.isDisposed) {
        terminal2.dispose();
        return terminal2;
      }
      enableCursorLineReflow(terminal2);
      this._resolvedTerminal = terminal2;
      return this._register(terminal2);
    });
  }
  /**
   * The height in CSS pixels of one rendered row of this mirror, or undefined until the
   * detached terminal exists. Reflects the renderer's actual cell metrics once it has
   * rendered, so box-height math matches what xterm paints.
   */
  getRowHeightPx() {
    if (this._store.isDisposed) {
      return void 0;
    }
    return getMirrorRowHeightPx(this._resolvedTerminal);
  }
  async _getTerminal() {
    if (!this._detachedTerminal) {
      throw new Error("Detached terminal not initialized");
    }
    return this._detachedTerminal;
  }
  setOutput(output) {
    this._output = output;
    this._outputVersion++;
  }
  async attach(container3) {
    const terminal2 = await this._getTerminal();
    if (this._store.isDisposed) {
      return;
    }
    container3.classList.add("chat-terminal-output-terminal");
    const needsAttach = this._attachedContainer !== container3 || container3.firstChild === null;
    if (needsAttach) {
      terminal2.attachToElement(container3, { enableGpu: false });
      this._attachedContainer = container3;
    }
    if (!this._renderListenerInstalled) {
      this._renderListenerInstalled = true;
      this._register(getMirrorRaw(terminal2).onRender(() => {
        const rowHeight = this.getRowHeightPx();
        if (rowHeight !== void 0 && rowHeight !== this._lastObservedRowHeight) {
          this._lastObservedRowHeight = rowHeight;
          this._onDidChangeRowHeightEmitter.fire();
        }
      }));
    }
    this._container = container3;
    this._applyTheme(container3);
  }
  async render() {
    return this._renderSequencer.queue(() => this._render());
  }
  /**
   * Resizes the mirror to fill the given width, relying on xterm's native resize reflow to
   * re-wrap soft-wrapped lines. No-op when the resulting cols are unchanged. The column
   * count derives from the mirror's own xterm font metrics, which reflect the actual
   * renderer cell size rather than a configuration-based estimate.
   */
  async layout(widthPx) {
    if (widthPx <= 0) {
      return void 0;
    }
    return this._renderSequencer.queue(async () => {
      const terminal2 = await this._getTerminal();
      if (this._store.isDisposed) {
        return void 0;
      }
      const cols = computeChatTerminalMirrorCols(widthPx, terminal2.xterm.getFont(), getMirrorDevicePixelRatio(terminal2), measureMirrorHorizontalChrome(terminal2));
      if (terminal2.xterm.cols === cols) {
        return void 0;
      }
      terminal2.xterm.resize(cols, 10 /* MirrorRowCount */);
      if (!this._lastRenderedText) {
        return void 0;
      }
      const lineCount = computeSnapshotLineCount(terminal2.xterm.buffer.active, this._output?.truncated ? this._output.lineCount : void 0);
      this._lastRenderedLineCount = lineCount;
      if (this._shouldComputeMaxColumnWidth(lineCount)) {
        this._lastRenderedMaxColumnWidth = this._computeMaxColumnWidth(terminal2);
      }
      return { lineCount, maxColumnWidth: this._lastRenderedMaxColumnWidth };
    });
  }
  async _render() {
    const output = this._output;
    const outputVersion = this._outputVersion;
    if (!output) {
      return void 0;
    }
    if (outputVersion === this._renderedVersion) {
      return { lineCount: this._lastRenderedLineCount ?? output.lineCount, maxColumnWidth: this._lastRenderedMaxColumnWidth };
    }
    const terminal2 = await this._getTerminal();
    if (this._store.isDisposed) {
      return void 0;
    }
    if (this._container) {
      this._applyTheme(this._container);
    }
    const text2 = output.text ?? "";
    if (!text2) {
      if (this._lastRenderedText) {
        await new Promise((resolve3) => terminal2.xterm.write("\x1B[2J\x1B[3J\x1B[H", resolve3));
      }
      const lineCount2 = output.lineCount ?? 0;
      this._renderedVersion = outputVersion;
      this._lastRenderedText = "";
      this._lastRenderedLineCount = lineCount2;
      this._lastRenderedMaxColumnWidth = 0;
      return { lineCount: lineCount2, maxColumnWidth: 0 };
    }
    const write = text2.startsWith(this._lastRenderedText) ? text2.slice(this._lastRenderedText.length) : `\x1B[2J\x1B[3J\x1B[H${text2}`;
    if (write) {
      await new Promise((resolve3) => terminal2.xterm.write(write, resolve3));
    }
    if (this._store.isDisposed) {
      return void 0;
    }
    const lineCount = computeSnapshotLineCount(terminal2.xterm.buffer.active, output.truncated ? output.lineCount : void 0);
    this._renderedVersion = outputVersion;
    this._lastRenderedText = text2;
    this._lastRenderedLineCount = lineCount;
    if (this._shouldComputeMaxColumnWidth(lineCount)) {
      this._lastRenderedMaxColumnWidth = this._computeMaxColumnWidth(terminal2);
    }
    return { lineCount, maxColumnWidth: this._lastRenderedMaxColumnWidth };
  }
  _computeMaxColumnWidth(terminal2) {
    return computeMaxBufferColumnWidth(terminal2.xterm.buffer.active, terminal2.xterm.cols);
  }
  _shouldComputeMaxColumnWidth(lineCount) {
    return lineCount <= 100 /* MaxLinesForColumnWidthComputation */;
  }
  _applyTheme(container3) {
    const theme = this._getTheme();
    if (!theme) {
      container3.style.removeProperty("background-color");
      container3.style.removeProperty("color");
      return;
    }
    if (theme.background) {
      container3.style.backgroundColor = theme.background;
    }
    if (theme.foreground) {
      container3.style.color = theme.foreground;
    }
  }
};

DetachedTerminalSnapshotMirror = __decorateClass([
  __decorateParam(2, ITerminalService),
  __decorateParam(3, IContextKeyService)
], DetachedTerminalSnapshotMirror);
export { getChatTerminalBackgroundColor, computeMaxBufferColumnWidth, vtBoundaryMatches, computeChatTerminalMirrorCols, getMirrorRaw, enableCursorLineReflow, getMirrorDevicePixelRatio, measureMirrorHorizontalChrome, getMirrorRowHeightPx, computeOutputLineCount, computeSnapshotLineCount, getCommandOutputSnapshot, DetachedTerminalCommandMirror, DetachedTerminalSnapshotMirror };
