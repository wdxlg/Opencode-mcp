// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/xterm/markNavigationAddon.ts
import { Disposable, DisposableStore, MutableDisposable, dispose } from "./module-0012.mjs";
import { coalesce } from "./module-0007.mjs";
import { isFullTerminalCommand } from "./module-3059.mjs";
import { TerminalContribSettingId } from "./module-1173.mjs";
import { TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR } from "./module-0869.mjs";
import { timeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/workbench/contrib/terminal/browser/xterm/markNavigationAddon.ts
var MarkNavigationAddon = class extends Disposable {
  constructor(_capabilities, _configurationService, _themeService) {
    super();
    this._capabilities = _capabilities;
    this._configurationService = _configurationService;
    this._themeService = _themeService;
    this._currentMarker = 1 /* Bottom */;
    this._selectionStart = null;
    this._isDisposable = false;
    this._commandGuideDecorations = this._register(new MutableDisposable());
  }
  activate(terminal2) {
    this._terminal = terminal2;
    this._register(this._terminal.onData(() => {
      this._currentMarker = 1 /* Bottom */;
    }));
  }
  _getMarkers(skipEmptyCommands) {
    const commandCapability = this._capabilities.get(2 /* CommandDetection */);
    const partialCommandCapability = this._capabilities.get(3 /* PartialCommandDetection */);
    const markCapability = this._capabilities.get(4 /* BufferMarkDetection */);
    let markers = [];
    if (commandCapability) {
      markers = coalesce(commandCapability.commands.filter((e4) => skipEmptyCommands ? e4.exitCode !== void 0 : true).map((e4) => e4.promptStartMarker ?? e4.marker));
      if (commandCapability.currentCommand?.promptStartMarker && commandCapability.currentCommand.commandExecutedMarker) {
        markers.push(commandCapability.currentCommand?.promptStartMarker);
      }
    } else if (partialCommandCapability) {
      markers.push(...partialCommandCapability.commands);
    }
    if (markCapability && !skipEmptyCommands) {
      markers = [...markCapability.markers()];
    }
    return markers;
  }
  _findCommand(marker) {
    const commandCapability = this._capabilities.get(2 /* CommandDetection */);
    if (commandCapability) {
      const command4 = commandCapability.commands.find((e4) => e4.marker?.line === marker.line || e4.promptStartMarker?.line === marker.line);
      if (command4) {
        return command4;
      }
      if (commandCapability.currentCommand) {
        return commandCapability.currentCommand;
      }
    }
    return void 0;
  }
  clear() {
    this._currentMarker = 1 /* Bottom */;
    this._resetNavigationDecorations();
    this._selectionStart = null;
  }
  _resetNavigationDecorations() {
    if (this._navigationDecorations) {
      dispose(this._navigationDecorations);
    }
    this._navigationDecorations = [];
  }
  _isEmptyCommand(marker) {
    if (marker === 1 /* Bottom */) {
      return true;
    }
    if (marker === 0 /* Top */) {
      return !this._getMarkers(true).map((e4) => e4.line).includes(0);
    }
    return !this._getMarkers(true).includes(marker);
  }
  scrollToPreviousMark(scrollPosition = 1 /* Middle */, retainSelection = false, skipEmptyCommands = true) {
    if (!this._terminal) {
      return;
    }
    if (!retainSelection) {
      this._selectionStart = null;
    }
    let markerIndex;
    const currentLineY = typeof this._currentMarker === "object" ? this.getTargetScrollLine(this._currentMarker.line, scrollPosition) : Math.min(getLine(this._terminal, this._currentMarker), this._terminal.buffer.active.baseY);
    const viewportY = this._terminal.buffer.active.viewportY;
    if (typeof this._currentMarker === "object" ? !this._isMarkerInViewport(this._terminal, this._currentMarker) : currentLineY !== viewportY) {
      const markersBelowViewport = this._getMarkers(skipEmptyCommands).filter((e4) => e4.line >= viewportY).length;
      markerIndex = this._getMarkers(skipEmptyCommands).length - markersBelowViewport - 1;
    } else if (this._currentMarker === 1 /* Bottom */) {
      markerIndex = this._getMarkers(skipEmptyCommands).length - 1;
    } else if (this._currentMarker === 0 /* Top */) {
      markerIndex = -1;
    } else if (this._isDisposable) {
      markerIndex = this._findPreviousMarker(skipEmptyCommands);
      this._currentMarker.dispose();
      this._isDisposable = false;
    } else {
      if (skipEmptyCommands && this._isEmptyCommand(this._currentMarker)) {
        markerIndex = this._findPreviousMarker(true);
      } else {
        markerIndex = this._getMarkers(skipEmptyCommands).indexOf(this._currentMarker) - 1;
      }
    }
    if (markerIndex < 0) {
      this._currentMarker = 0 /* Top */;
      this._terminal.scrollToTop();
      this._resetNavigationDecorations();
      return;
    }
    this._currentMarker = this._getMarkers(skipEmptyCommands)[markerIndex];
    this._scrollToCommand(this._currentMarker, scrollPosition);
  }
  scrollToNextMark(scrollPosition = 1 /* Middle */, retainSelection = false, skipEmptyCommands = true) {
    if (!this._terminal) {
      return;
    }
    if (!retainSelection) {
      this._selectionStart = null;
    }
    let markerIndex;
    const currentLineY = typeof this._currentMarker === "object" ? this.getTargetScrollLine(this._currentMarker.line, scrollPosition) : Math.min(getLine(this._terminal, this._currentMarker), this._terminal.buffer.active.baseY);
    const viewportY = this._terminal.buffer.active.viewportY;
    if (typeof this._currentMarker === "object" ? !this._isMarkerInViewport(this._terminal, this._currentMarker) : currentLineY !== viewportY) {
      const markersAboveViewport = this._getMarkers(skipEmptyCommands).filter((e4) => e4.line <= viewportY).length;
      markerIndex = markersAboveViewport;
    } else if (this._currentMarker === 1 /* Bottom */) {
      markerIndex = this._getMarkers(skipEmptyCommands).length;
    } else if (this._currentMarker === 0 /* Top */) {
      markerIndex = 0;
    } else if (this._isDisposable) {
      markerIndex = this._findNextMarker(skipEmptyCommands);
      this._currentMarker.dispose();
      this._isDisposable = false;
    } else {
      if (skipEmptyCommands && this._isEmptyCommand(this._currentMarker)) {
        markerIndex = this._findNextMarker(true);
      } else {
        markerIndex = this._getMarkers(skipEmptyCommands).indexOf(this._currentMarker) + 1;
      }
    }
    if (markerIndex >= this._getMarkers(skipEmptyCommands).length) {
      this._currentMarker = 1 /* Bottom */;
      this._terminal.scrollToBottom();
      this._resetNavigationDecorations();
      return;
    }
    this._currentMarker = this._getMarkers(skipEmptyCommands)[markerIndex];
    this._scrollToCommand(this._currentMarker, scrollPosition);
  }
  _scrollToCommand(marker, position2) {
    const command4 = this._findCommand(marker);
    if (command4) {
      this.revealCommand(command4, position2);
    } else {
      this._scrollToMarker(marker, position2);
    }
  }
  _scrollToMarker(start, position2, end, options3) {
    if (!this._terminal) {
      return;
    }
    if (!this._isMarkerInViewport(this._terminal, start) || options3?.forceScroll) {
      const line = this.getTargetScrollLine(toLineIndex(start), position2);
      this._terminal.scrollToLine(line);
    }
    if (!options3?.hideDecoration) {
      if (options3?.bufferRange) {
        this._highlightBufferRange(options3.bufferRange);
      } else {
        this.registerTemporaryDecoration(start, end, true);
      }
    }
  }
  _createMarkerForOffset(marker, offset) {
    if (offset === 0 && isMarker(marker)) {
      return marker;
    } else {
      const offsetMarker = this._terminal?.registerMarker(-this._terminal.buffer.active.cursorY + toLineIndex(marker) - this._terminal.buffer.active.baseY + offset);
      if (offsetMarker) {
        return offsetMarker;
      } else {
        throw new Error(`Could not register marker with offset ${toLineIndex(marker)}, ${offset}`);
      }
    }
  }
  revealCommand(command4, position2 = 1 /* Middle */) {
    const marker = isFullTerminalCommand(command4) ? command4.marker : command4.commandStartMarker;
    if (!this._terminal || !marker) {
      return;
    }
    const line = toLineIndex(marker);
    const promptRowCount = command4.getPromptRowCount();
    const commandRowCount = command4.getCommandRowCount();
    this._scrollToMarker(
      line - (promptRowCount - 1),
      position2,
      line + (commandRowCount - 1)
    );
  }
  revealRange(range2) {
    this._scrollToMarker(
      range2.start.y - 1,
      1 /* Middle */,
      range2.end.y - 1,
      {
        bufferRange: range2,
        // Ensure scroll shows the line when sticky scroll is enabled
        forceScroll: !!this._configurationService.getValue(TerminalContribSettingId.StickyScrollEnabled)
      }
    );
  }
  showCommandGuide(command4) {
    if (!this._terminal) {
      return;
    }
    if (!command4) {
      this._commandGuideDecorations.clear();
      this._activeCommandGuide = void 0;
      return;
    }
    if (this._activeCommandGuide === command4) {
      return;
    }
    if (command4.marker) {
      this._activeCommandGuide = command4;
      const store = this._commandGuideDecorations.value = new DisposableStore();
      if (!command4.executedMarker || !command4.endMarker) {
        return;
      }
      const startLine = command4.marker.line - (command4.getPromptRowCount() - 1);
      const decorationCount = toLineIndex(command4.endMarker) - startLine;
      if (decorationCount > 200) {
        return;
      }
      for (let i2 = 0; i2 < decorationCount; i2++) {
        const decoration3 = this._terminal.registerDecoration({
          marker: this._createMarkerForOffset(startLine, i2)
        });
        if (decoration3) {
          store.add(decoration3);
          let renderedElement;
          store.add(decoration3.onRender((element) => {
            if (!renderedElement) {
              renderedElement = element;
              element.classList.add("terminal-command-guide");
              if (i2 === 0) {
                element.classList.add("top");
              }
              if (i2 === decorationCount - 1) {
                element.classList.add("bottom");
              }
            }
          }));
        }
      }
    }
  }
  saveScrollState() {
    this._scrollState = { viewportY: this._terminal?.buffer.active.viewportY ?? 0 };
  }
  restoreScrollState() {
    if (this._scrollState && this._terminal) {
      this._terminal.scrollToLine(this._scrollState.viewportY);
      this._scrollState = void 0;
    }
  }
  _highlightBufferRange(range2) {
    if (!this._terminal) {
      return;
    }
    this._resetNavigationDecorations();
    const startLine = range2.start.y;
    const decorationCount = range2.end.y - range2.start.y + 1;
    for (let i2 = 0; i2 < decorationCount; i2++) {
      const decoration3 = this._terminal.registerDecoration({
        marker: this._createMarkerForOffset(startLine - 1, i2),
        x: range2.start.x - 1,
        width: range2.end.x - 1 - (range2.start.x - 1) + 1,
        overviewRulerOptions: void 0
      });
      if (decoration3) {
        this._navigationDecorations?.push(decoration3);
        let renderedElement;
        decoration3.onRender((element) => {
          if (!renderedElement) {
            renderedElement = element;
            element.classList.add("terminal-range-highlight");
          }
        });
        decoration3.onDispose(() => {
          this._navigationDecorations = this._navigationDecorations?.filter((d) => d !== decoration3);
        });
      }
    }
  }
  registerTemporaryDecoration(marker, endMarker, showOutline) {
    if (!this._terminal) {
      return;
    }
    this._resetNavigationDecorations();
    const color2 = this._themeService.getColorTheme().getColor(TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR);
    const startLine = toLineIndex(marker);
    const decorationCount = endMarker ? toLineIndex(endMarker) - startLine + 1 : 1;
    for (let i2 = 0; i2 < decorationCount; i2++) {
      const decoration3 = this._terminal.registerDecoration({
        marker: this._createMarkerForOffset(marker, i2),
        width: this._terminal.cols,
        overviewRulerOptions: i2 === 0 ? {
          color: color2?.toString() || "#a0a0a0cc"
        } : void 0
      });
      if (decoration3) {
        this._navigationDecorations?.push(decoration3);
        let renderedElement;
        decoration3.onRender((element) => {
          if (!renderedElement) {
            renderedElement = element;
            element.classList.add("terminal-scroll-highlight");
            if (showOutline) {
              element.classList.add("terminal-scroll-highlight-outline");
            }
            if (i2 === 0) {
              element.classList.add("top");
            }
            if (i2 === decorationCount - 1) {
              element.classList.add("bottom");
            }
          } else {
            element.classList.add("terminal-scroll-highlight");
          }
        });
        decoration3.onDispose(() => {
          this._navigationDecorations = this._navigationDecorations?.filter((d) => d !== decoration3);
        });
        if (showOutline) {
          timeout(350).then(() => {
            if (renderedElement) {
              renderedElement.classList.remove("terminal-scroll-highlight-outline");
            }
          });
        }
      }
    }
  }
  scrollToLine(line, position2) {
    this._terminal?.scrollToLine(this.getTargetScrollLine(line, position2));
  }
  getTargetScrollLine(line, position2) {
    if (this._terminal && position2 === 1 /* Middle */) {
      return Math.max(line - Math.floor(this._terminal.rows / 4), 0);
    }
    return line;
  }
  _isMarkerInViewport(terminal2, marker) {
    const viewportY = terminal2.buffer.active.viewportY;
    const line = toLineIndex(marker);
    return line >= viewportY && line < viewportY + terminal2.rows;
  }
  scrollToClosestMarker(startMarkerId, endMarkerId, highlight) {
    const detectionCapability = this._capabilities.get(4 /* BufferMarkDetection */);
    if (!detectionCapability) {
      return;
    }
    const startMarker = detectionCapability.getMark(startMarkerId);
    if (!startMarker) {
      return;
    }
    const endMarker = endMarkerId ? detectionCapability.getMark(endMarkerId) : startMarker;
    this._scrollToMarker(startMarker, 0 /* Top */, endMarker, { hideDecoration: !highlight });
  }
  selectToPreviousMark() {
    if (!this._terminal) {
      return;
    }
    if (this._selectionStart === null) {
      this._selectionStart = this._currentMarker;
    }
    if (this._capabilities.has(2 /* CommandDetection */)) {
      this.scrollToPreviousMark(1 /* Middle */, true, true);
    } else {
      this.scrollToPreviousMark(1 /* Middle */, true, false);
    }
    selectLines(this._terminal, this._currentMarker, this._selectionStart);
  }
  selectToNextMark() {
    if (!this._terminal) {
      return;
    }
    if (this._selectionStart === null) {
      this._selectionStart = this._currentMarker;
    }
    if (this._capabilities.has(2 /* CommandDetection */)) {
      this.scrollToNextMark(1 /* Middle */, true, true);
    } else {
      this.scrollToNextMark(1 /* Middle */, true, false);
    }
    selectLines(this._terminal, this._currentMarker, this._selectionStart);
  }
  selectToPreviousLine() {
    if (!this._terminal) {
      return;
    }
    if (this._selectionStart === null) {
      this._selectionStart = this._currentMarker;
    }
    this.scrollToPreviousLine(this._terminal, 1 /* Middle */, true);
    selectLines(this._terminal, this._currentMarker, this._selectionStart);
  }
  selectToNextLine() {
    if (!this._terminal) {
      return;
    }
    if (this._selectionStart === null) {
      this._selectionStart = this._currentMarker;
    }
    this.scrollToNextLine(this._terminal, 1 /* Middle */, true);
    selectLines(this._terminal, this._currentMarker, this._selectionStart);
  }
  scrollToPreviousLine(xterm, scrollPosition = 1 /* Middle */, retainSelection = false) {
    if (!retainSelection) {
      this._selectionStart = null;
    }
    if (this._currentMarker === 0 /* Top */) {
      xterm.scrollToTop();
      return;
    }
    if (this._currentMarker === 1 /* Bottom */) {
      this._currentMarker = this._registerMarkerOrThrow(xterm, this._getOffset(xterm) - 1);
    } else {
      const offset = this._getOffset(xterm);
      if (this._isDisposable) {
        this._currentMarker.dispose();
      }
      this._currentMarker = this._registerMarkerOrThrow(xterm, offset - 1);
    }
    this._isDisposable = true;
    this._scrollToMarker(this._currentMarker, scrollPosition);
  }
  scrollToNextLine(xterm, scrollPosition = 1 /* Middle */, retainSelection = false) {
    if (!retainSelection) {
      this._selectionStart = null;
    }
    if (this._currentMarker === 1 /* Bottom */) {
      xterm.scrollToBottom();
      return;
    }
    if (this._currentMarker === 0 /* Top */) {
      this._currentMarker = this._registerMarkerOrThrow(xterm, this._getOffset(xterm) + 1);
    } else {
      const offset = this._getOffset(xterm);
      if (this._isDisposable) {
        this._currentMarker.dispose();
      }
      this._currentMarker = this._registerMarkerOrThrow(xterm, offset + 1);
    }
    this._isDisposable = true;
    this._scrollToMarker(this._currentMarker, scrollPosition);
  }
  _registerMarkerOrThrow(xterm, cursorYOffset) {
    const marker = xterm.registerMarker(cursorYOffset);
    if (!marker) {
      throw new Error(`Could not create marker for ${cursorYOffset}`);
    }
    return marker;
  }
  _getOffset(xterm) {
    if (this._currentMarker === 1 /* Bottom */) {
      return 0;
    } else if (this._currentMarker === 0 /* Top */) {
      return 0 - (xterm.buffer.active.baseY + xterm.buffer.active.cursorY);
    } else {
      let offset = getLine(xterm, this._currentMarker);
      offset -= xterm.buffer.active.baseY + xterm.buffer.active.cursorY;
      return offset;
    }
  }
  _findPreviousMarker(skipEmptyCommands = false) {
    if (this._currentMarker === 0 /* Top */) {
      return 0;
    } else if (this._currentMarker === 1 /* Bottom */) {
      return this._getMarkers(skipEmptyCommands).length - 1;
    }
    let i2;
    for (i2 = this._getMarkers(skipEmptyCommands).length - 1; i2 >= 0; i2--) {
      if (this._getMarkers(skipEmptyCommands)[i2].line < this._currentMarker.line) {
        return i2;
      }
    }
    return -1;
  }
  _findNextMarker(skipEmptyCommands = false) {
    if (this._currentMarker === 0 /* Top */) {
      return 0;
    } else if (this._currentMarker === 1 /* Bottom */) {
      return this._getMarkers(skipEmptyCommands).length - 1;
    }
    let i2;
    for (i2 = 0; i2 < this._getMarkers(skipEmptyCommands).length; i2++) {
      if (this._getMarkers(skipEmptyCommands)[i2].line > this._currentMarker.line) {
        return i2;
      }
    }
    return this._getMarkers(skipEmptyCommands).length;
  }
};

MarkNavigationAddon = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IThemeService)
], MarkNavigationAddon);

function getLine(xterm, marker) {
  if (marker === 1 /* Bottom */) {
    return xterm.buffer.active.baseY + xterm.rows - 1;
  }
  if (marker === 0 /* Top */) {
    return 0;
  }
  return marker.line;
}

function selectLines(xterm, start, end) {
  if (end === null) {
    end = 1 /* Bottom */;
  }
  let startLine = getLine(xterm, start);
  let endLine = getLine(xterm, end);
  if (startLine > endLine) {
    const temp = startLine;
    startLine = endLine;
    endLine = temp;
  }
  endLine -= 1;
  xterm.selectLines(startLine, endLine);
}

function isMarker(value2) {
  return typeof value2 !== "number";
}

function toLineIndex(line) {
  return isMarker(line) ? line.line : line;
}
export { getLine, selectLines, isMarker, toLineIndex, MarkNavigationAddon };
