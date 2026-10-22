// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/viewCursors/viewCursors.ts
import { ViewPart } from "./module-0239.mjs";
import { ViewCursor } from "./module-0322.mjs";
import { createFastDomNode } from "./module-0212.mjs";
import { TimeoutTimer } from "./module-0036.mjs";
import { WindowIntervalTimer, getWindow } from "./module-0075.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";
import { editorCursorBackground, editorCursorForeground, editorMultiCursorPrimaryBackground, editorMultiCursorPrimaryForeground, editorMultiCursorSecondaryBackground, editorMultiCursorSecondaryForeground } from "./module-0288.mjs";
import { isHighContrast } from "./module-0247.mjs";


// src/vs/editor/browser/viewParts/viewCursors/viewCursors.ts
var ViewCursors = class _ViewCursors extends ViewPart {
  static {
    this.BLINK_INTERVAL = 500;
  }
  constructor(context2) {
    super(context2);
    const options3 = this._context.configuration.options;
    this._readOnly = options3.get(104 /* readOnly */);
    this._cursorBlinking = options3.get(32 /* cursorBlinking */);
    this._cursorStyle = options3.get(161 /* effectiveCursorStyle */);
    this._cursorSmoothCaretAnimation = options3.get(33 /* cursorSmoothCaretAnimation */);
    this._editContextEnabled = options3.get(170 /* effectiveEditContext */);
    this._selectionIsEmpty = true;
    this._isComposingInput = false;
    this._isVisible = false;
    this._primaryCursor = new ViewCursor(this._context, 0 /* Single */);
    this._secondaryCursors = [];
    this._renderData = [];
    this._domNode = createFastDomNode(document.createElement("div"));
    this._domNode.setAttribute("role", "presentation");
    this._domNode.setAttribute("aria-hidden", "true");
    this._updateDomClassName();
    this._domNode.appendChild(this._primaryCursor.getDomNode());
    this._startCursorBlinkAnimation = new TimeoutTimer();
    this._cursorFlatBlinkInterval = new WindowIntervalTimer();
    this._blinkingEnabled = false;
    this._editorHasFocus = false;
    this._updateBlinking();
  }
  dispose() {
    super.dispose();
    this._startCursorBlinkAnimation.dispose();
    this._cursorFlatBlinkInterval.dispose();
  }
  getDomNode() {
    return this._domNode;
  }
  // --- begin event handlers
  onCompositionStart(e) {
    this._isComposingInput = true;
    this._updateBlinking();
    return true;
  }
  onCompositionEnd(e) {
    this._isComposingInput = false;
    this._updateBlinking();
    return true;
  }
  onConfigurationChanged(e) {
    const options3 = this._context.configuration.options;
    this._readOnly = options3.get(104 /* readOnly */);
    this._cursorBlinking = options3.get(32 /* cursorBlinking */);
    this._cursorStyle = options3.get(161 /* effectiveCursorStyle */);
    this._cursorSmoothCaretAnimation = options3.get(33 /* cursorSmoothCaretAnimation */);
    this._editContextEnabled = options3.get(170 /* effectiveEditContext */);
    this._updateBlinking();
    this._updateDomClassName();
    this._primaryCursor.onConfigurationChanged(e);
    for (let i2 = 0, len = this._secondaryCursors.length; i2 < len; i2++) {
      this._secondaryCursors[i2].onConfigurationChanged(e);
    }
    return true;
  }
  _onCursorPositionChanged(position2, secondaryPositions, reason) {
    const pauseAnimation = this._secondaryCursors.length !== secondaryPositions.length || this._cursorSmoothCaretAnimation === "explicit" && reason !== 3 /* Explicit */;
    this._primaryCursor.setPlurality(secondaryPositions.length ? 1 /* MultiPrimary */ : 0 /* Single */);
    this._primaryCursor.onCursorPositionChanged(position2, pauseAnimation);
    this._updateBlinking();
    if (this._secondaryCursors.length < secondaryPositions.length) {
      const addCnt = secondaryPositions.length - this._secondaryCursors.length;
      for (let i2 = 0; i2 < addCnt; i2++) {
        const newCursor = new ViewCursor(this._context, 2 /* MultiSecondary */);
        this._domNode.domNode.insertBefore(newCursor.getDomNode().domNode, this._primaryCursor.getDomNode().domNode.nextSibling);
        this._secondaryCursors.push(newCursor);
      }
    } else if (this._secondaryCursors.length > secondaryPositions.length) {
      const removeCnt = this._secondaryCursors.length - secondaryPositions.length;
      for (let i2 = 0; i2 < removeCnt; i2++) {
        this._domNode.removeChild(this._secondaryCursors[0].getDomNode());
        this._secondaryCursors.splice(0, 1);
      }
    }
    for (let i2 = 0; i2 < secondaryPositions.length; i2++) {
      this._secondaryCursors[i2].onCursorPositionChanged(secondaryPositions[i2], pauseAnimation);
    }
  }
  onCursorStateChanged(e) {
    const positions = [];
    for (let i2 = 0, len = e.selections.length; i2 < len; i2++) {
      positions[i2] = e.selections[i2].getPosition();
    }
    this._onCursorPositionChanged(positions[0], positions.slice(1), e.reason);
    const selectionIsEmpty = e.selections[0].isEmpty();
    if (this._selectionIsEmpty !== selectionIsEmpty) {
      this._selectionIsEmpty = selectionIsEmpty;
      this._updateDomClassName();
    }
    return true;
  }
  onDecorationsChanged(e) {
    return true;
  }
  onFlushed(e) {
    return true;
  }
  onFocusChanged(e) {
    this._editorHasFocus = e.isFocused;
    this._updateBlinking();
    return false;
  }
  onLinesChanged(e) {
    return true;
  }
  onLinesDeleted(e) {
    return true;
  }
  onLinesInserted(e) {
    return true;
  }
  onScrollChanged(e) {
    return true;
  }
  onTokensChanged(e) {
    const shouldRender = (position2) => {
      for (let i2 = 0, len = e.ranges.length; i2 < len; i2++) {
        if (e.ranges[i2].fromLineNumber <= position2.lineNumber && position2.lineNumber <= e.ranges[i2].toLineNumber) {
          return true;
        }
      }
      return false;
    };
    if (shouldRender(this._primaryCursor.getPosition())) {
      return true;
    }
    for (const secondaryCursor of this._secondaryCursors) {
      if (shouldRender(secondaryCursor.getPosition())) {
        return true;
      }
    }
    return false;
  }
  onZonesChanged(e) {
    return true;
  }
  // --- end event handlers
  // ---- blinking logic
  _getCursorBlinking() {
    if (this._isComposingInput && !this._editContextEnabled) {
      return 0 /* Hidden */;
    }
    if (!this._editorHasFocus) {
      return 0 /* Hidden */;
    }
    if (this._readOnly) {
      return 5 /* Solid */;
    }
    return this._cursorBlinking;
  }
  _updateBlinking() {
    this._startCursorBlinkAnimation.cancel();
    this._cursorFlatBlinkInterval.cancel();
    const blinkingStyle = this._getCursorBlinking();
    const isHidden = blinkingStyle === 0 /* Hidden */;
    const isSolid = blinkingStyle === 5 /* Solid */;
    if (isHidden) {
      this._hide();
    } else {
      this._show();
    }
    this._blinkingEnabled = false;
    this._updateDomClassName();
    if (!isHidden && !isSolid) {
      if (blinkingStyle === 1 /* Blink */) {
        this._cursorFlatBlinkInterval.cancelAndSet(() => {
          if (this._isVisible) {
            this._hide();
          } else {
            this._show();
          }
        }, _ViewCursors.BLINK_INTERVAL, getWindow(this._domNode.domNode));
      } else {
        this._startCursorBlinkAnimation.setIfNotSet(() => {
          this._blinkingEnabled = true;
          this._updateDomClassName();
        }, _ViewCursors.BLINK_INTERVAL);
      }
    }
  }
  // --- end blinking logic
  _updateDomClassName() {
    this._domNode.setClassName(this._getClassName());
  }
  _getClassName() {
    let result = "cursors-layer";
    if (!this._selectionIsEmpty) {
      result += " has-selection";
    }
    switch (this._cursorStyle) {
      case 1 /* Line */:
        result += " cursor-line-style";
        break;
      case 2 /* Block */:
        result += " cursor-block-style";
        break;
      case 3 /* Underline */:
        result += " cursor-underline-style";
        break;
      case 4 /* LineThin */:
        result += " cursor-line-thin-style";
        break;
      case 5 /* BlockOutline */:
        result += " cursor-block-outline-style";
        break;
      case 6 /* UnderlineThin */:
        result += " cursor-underline-thin-style";
        break;
      default:
        result += " cursor-line-style";
    }
    if (this._blinkingEnabled) {
      switch (this._getCursorBlinking()) {
        case 1 /* Blink */:
          result += " cursor-blink";
          break;
        case 2 /* Smooth */:
          result += " cursor-smooth";
          break;
        case 3 /* Phase */:
          result += " cursor-phase";
          break;
        case 4 /* Expand */:
          result += " cursor-expand";
          break;
        case 5 /* Solid */:
          result += " cursor-solid";
          break;
        default:
          result += " cursor-solid";
      }
    } else {
      result += " cursor-solid";
    }
    if (this._cursorSmoothCaretAnimation === "on" || this._cursorSmoothCaretAnimation === "explicit") {
      result += " cursor-smooth-caret-animation";
    }
    return result;
  }
  _show() {
    this._primaryCursor.show();
    for (let i2 = 0, len = this._secondaryCursors.length; i2 < len; i2++) {
      this._secondaryCursors[i2].show();
    }
    this._isVisible = true;
  }
  _hide() {
    this._primaryCursor.hide();
    for (let i2 = 0, len = this._secondaryCursors.length; i2 < len; i2++) {
      this._secondaryCursors[i2].hide();
    }
    this._isVisible = false;
  }
  // ---- IViewPart implementation
  prepareRender(ctx) {
    this._primaryCursor.prepareRender(ctx);
    for (let i2 = 0, len = this._secondaryCursors.length; i2 < len; i2++) {
      this._secondaryCursors[i2].prepareRender(ctx);
    }
  }
  render(ctx) {
    const renderData = [];
    let renderDataLen = 0;
    const primaryRenderData = this._primaryCursor.render(ctx);
    if (primaryRenderData) {
      renderData[renderDataLen++] = primaryRenderData;
    }
    for (let i2 = 0, len = this._secondaryCursors.length; i2 < len; i2++) {
      const secondaryRenderData = this._secondaryCursors[i2].render(ctx);
      if (secondaryRenderData) {
        renderData[renderDataLen++] = secondaryRenderData;
      }
    }
    this._renderData = renderData;
  }
  getLastRenderData() {
    return this._renderData;
  }
};

registerThemingParticipant((theme, collector) => {
  const cursorThemes = [
    { class: ".cursor", foreground: editorCursorForeground, background: editorCursorBackground },
    { class: ".cursor-primary", foreground: editorMultiCursorPrimaryForeground, background: editorMultiCursorPrimaryBackground },
    { class: ".cursor-secondary", foreground: editorMultiCursorSecondaryForeground, background: editorMultiCursorSecondaryBackground }
  ];
  for (const cursorTheme of cursorThemes) {
    const caret2 = theme.getColor(cursorTheme.foreground);
    if (caret2) {
      let caretBackground = theme.getColor(cursorTheme.background);
      if (!caretBackground) {
        caretBackground = caret2.opposite();
      }
      collector.addRule(`.monaco-editor .cursors-layer ${cursorTheme.class} { background-color: ${caret2}; border-color: ${caret2}; color: ${caretBackground}; }`);
      if (isHighContrast(theme.type)) {
        collector.addRule(`.monaco-editor .cursors-layer.has-selection ${cursorTheme.class} { border-left: 1px solid ${caretBackground}; border-right: 1px solid ${caretBackground}; }`);
      }
    }
  }
});
export { ViewCursors };
