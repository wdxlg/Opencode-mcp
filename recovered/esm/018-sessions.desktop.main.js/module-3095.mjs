// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/accessibility/browser/bufferContentTracker.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITerminalLogService } from "./module-1155.mjs";


// src/vs/workbench/contrib/terminalContrib/accessibility/browser/bufferContentTracker.ts
var BufferContentTracker = class extends Disposable {
  constructor(_xterm, _configurationService, _logService) {
    super();
    this._xterm = _xterm;
    this._configurationService = _configurationService;
    this._logService = _logService;
    /**
     * The number of wrapped lines in the viewport when the last cached marker was set
     */
    this._priorEditorViewportLineCount = 0;
    this._lines = [];
    this.bufferToEditorLineMapping = /* @__PURE__ */ new Map();
  }
  get lines() {
    return this._lines;
  }
  reset() {
    this._lines = [];
    this._lastCachedMarker = void 0;
    this.update();
  }
  update() {
    if (this._lastCachedMarker?.isDisposed) {
      this._lines = [];
      this._lastCachedMarker = void 0;
    }
    this._removeViewportContent();
    this._updateCachedContent();
    this._updateViewportContent();
    this._lastCachedMarker = this._register(this._xterm.raw.registerMarker());
    this._logService.debug("Buffer content tracker: set ", this._lines.length, " lines");
  }
  _updateCachedContent() {
    const buffer = this._xterm.raw.buffer.active;
    const start = this._lastCachedMarker?.line ? this._lastCachedMarker.line - this._xterm.raw.rows + 1 : 0;
    const end = buffer.baseY;
    if (start < 0 || start > end) {
      return;
    }
    const scrollback = this._configurationService.getValue("terminal.integrated.scrollback" /* Scrollback */);
    const maxBufferSize = scrollback + this._xterm.raw.rows - 1;
    const linesToAdd = end - start;
    if (linesToAdd + this._lines.length > maxBufferSize) {
      const numToRemove = linesToAdd + this._lines.length - maxBufferSize;
      for (let i2 = 0; i2 < numToRemove; i2++) {
        this._lines.shift();
      }
      this._logService.debug("Buffer content tracker: removed ", numToRemove, " lines from top of cached lines, now ", this._lines.length, " lines");
    }
    const cachedLines = [];
    let currentLine = "";
    for (let i2 = start; i2 < end; i2++) {
      const line = buffer.getLine(i2);
      if (!line) {
        continue;
      }
      this.bufferToEditorLineMapping.set(i2, this._lines.length + cachedLines.length);
      const isWrapped = buffer.getLine(i2 + 1)?.isWrapped;
      currentLine += line.translateToString(!isWrapped);
      if (currentLine && !isWrapped || i2 === buffer.baseY + this._xterm.raw.rows - 1) {
        if (line.length) {
          cachedLines.push(currentLine);
          currentLine = "";
        }
      }
    }
    this._logService.debug("Buffer content tracker:", cachedLines.length, " lines cached");
    this._lines.push(...cachedLines);
  }
  _removeViewportContent() {
    if (!this._lines.length) {
      return;
    }
    let linesToRemove = this._priorEditorViewportLineCount;
    let index2 = 1;
    while (linesToRemove) {
      this.bufferToEditorLineMapping.forEach((value2, key3) => {
        if (value2 === this._lines.length - index2) {
          this.bufferToEditorLineMapping.delete(key3);
        }
      });
      this._lines.pop();
      index2++;
      linesToRemove--;
    }
    this._logService.debug("Buffer content tracker: removed lines from viewport, now ", this._lines.length, " lines cached");
  }
  _updateViewportContent() {
    const buffer = this._xterm.raw.buffer.active;
    this._priorEditorViewportLineCount = 0;
    let currentLine = "";
    for (let i2 = buffer.baseY; i2 < buffer.baseY + this._xterm.raw.rows; i2++) {
      const line = buffer.getLine(i2);
      if (!line) {
        continue;
      }
      this.bufferToEditorLineMapping.set(i2, this._lines.length);
      const isWrapped = buffer.getLine(i2 + 1)?.isWrapped;
      currentLine += line.translateToString(!isWrapped);
      if (currentLine && !isWrapped || i2 === buffer.baseY + this._xterm.raw.rows - 1) {
        if (currentLine.length) {
          this._priorEditorViewportLineCount++;
          this._lines.push(currentLine);
          currentLine = "";
        }
      }
    }
    this._logService.debug("Viewport content update complete, ", this._lines.length, " lines in the viewport");
  }
};

BufferContentTracker = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ITerminalLogService)
], BufferContentTracker);
export { BufferContentTracker };
