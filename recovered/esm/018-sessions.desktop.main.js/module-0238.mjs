// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/viewEventHandler.ts
import { Disposable } from "./module-0012.mjs";


// src/vs/editor/common/viewEventHandler.ts
var ViewEventHandler = class extends Disposable {
  constructor() {
    super();
    this._shouldRender = true;
  }
  shouldRender() {
    return this._shouldRender;
  }
  forceShouldRender() {
    this._shouldRender = true;
  }
  setShouldRender() {
    this._shouldRender = true;
  }
  onDidRender() {
    this._shouldRender = false;
  }
  // --- begin event handlers
  onCompositionStart(e4) {
    return false;
  }
  onCompositionEnd(e4) {
    return false;
  }
  onConfigurationChanged(e4) {
    return false;
  }
  onCursorStateChanged(e4) {
    return false;
  }
  onDecorationsChanged(e4) {
    return false;
  }
  onFlushed(e4) {
    return false;
  }
  onFocusChanged(e4) {
    return false;
  }
  onLanguageConfigurationChanged(e4) {
    return false;
  }
  onLineMappingChanged(e4) {
    return false;
  }
  onLinesChanged(e4) {
    return false;
  }
  onLinesDeleted(e4) {
    return false;
  }
  onLinesInserted(e4) {
    return false;
  }
  onRevealRangeRequest(e4) {
    return false;
  }
  onScrollChanged(e4) {
    return false;
  }
  onThemeChanged(e4) {
    return false;
  }
  onTokensChanged(e4) {
    return false;
  }
  onTokensColorsChanged(e4) {
    return false;
  }
  onZonesChanged(e4) {
    return false;
  }
  // --- end event handlers
  handleEvents(events) {
    let shouldRender = false;
    for (let i2 = 0, len = events.length; i2 < len; i2++) {
      const e4 = events[i2];
      switch (e4.type) {
        case 0 /* ViewCompositionStart */:
          if (this.onCompositionStart(e4)) {
            shouldRender = true;
          }
          break;
        case 1 /* ViewCompositionEnd */:
          if (this.onCompositionEnd(e4)) {
            shouldRender = true;
          }
          break;
        case 2 /* ViewConfigurationChanged */:
          if (this.onConfigurationChanged(e4)) {
            shouldRender = true;
          }
          break;
        case 3 /* ViewCursorStateChanged */:
          if (this.onCursorStateChanged(e4)) {
            shouldRender = true;
          }
          break;
        case 4 /* ViewDecorationsChanged */:
          if (this.onDecorationsChanged(e4)) {
            shouldRender = true;
          }
          break;
        case 5 /* ViewFlushed */:
          if (this.onFlushed(e4)) {
            shouldRender = true;
          }
          break;
        case 6 /* ViewFocusChanged */:
          if (this.onFocusChanged(e4)) {
            shouldRender = true;
          }
          break;
        case 7 /* ViewLanguageConfigurationChanged */:
          if (this.onLanguageConfigurationChanged(e4)) {
            shouldRender = true;
          }
          break;
        case 8 /* ViewLineMappingChanged */:
          if (this.onLineMappingChanged(e4)) {
            shouldRender = true;
          }
          break;
        case 9 /* ViewLinesChanged */:
          if (this.onLinesChanged(e4)) {
            shouldRender = true;
          }
          break;
        case 10 /* ViewLinesDeleted */:
          if (this.onLinesDeleted(e4)) {
            shouldRender = true;
          }
          break;
        case 11 /* ViewLinesInserted */:
          if (this.onLinesInserted(e4)) {
            shouldRender = true;
          }
          break;
        case 12 /* ViewRevealRangeRequest */:
          if (this.onRevealRangeRequest(e4)) {
            shouldRender = true;
          }
          break;
        case 13 /* ViewScrollChanged */:
          if (this.onScrollChanged(e4)) {
            shouldRender = true;
          }
          break;
        case 15 /* ViewTokensChanged */:
          if (this.onTokensChanged(e4)) {
            shouldRender = true;
          }
          break;
        case 14 /* ViewThemeChanged */:
          if (this.onThemeChanged(e4)) {
            shouldRender = true;
          }
          break;
        case 16 /* ViewTokensColorsChanged */:
          if (this.onTokensColorsChanged(e4)) {
            shouldRender = true;
          }
          break;
        case 17 /* ViewZonesChanged */:
          if (this.onZonesChanged(e4)) {
            shouldRender = true;
          }
          break;
        default:
          console.info("View received unknown event: ");
          console.info(e4);
      }
    }
    if (shouldRender) {
      this._shouldRender = true;
    }
  }
};
export { ViewEventHandler };
