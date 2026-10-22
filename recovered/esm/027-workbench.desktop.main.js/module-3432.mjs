// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/resizeDimensionsOverlay/browser/terminalResizeDimensionsOverlay.ts
import { Disposable, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { $ } from "./module-0075.mjs";


// src/vs/workbench/contrib/terminalContrib/resizeDimensionsOverlay/browser/terminalResizeDimensionsOverlay.ts
var TerminalResizeDimensionsOverlay = class extends Disposable {
  constructor(_container, xterm) {
    super();
    this._container = _container;
    this._resizeOverlayHideTimeout = this._register(new MutableDisposable());
    this._register(xterm.raw.onResize((dims) => this._handleDimensionsChanged(dims)));
    this._register(toDisposable(() => {
      this._resizeOverlay?.remove();
      this._resizeOverlay = void 0;
    }));
  }
  _handleDimensionsChanged(dims) {
    const container3 = this._container;
    if (!container3 || !container3.isConnected) {
      return;
    }
    const overlay = this._ensureResizeOverlay(container3);
    overlay.textContent = `${dims.cols} x ${dims.rows}`;
    overlay.classList.add("visible" /* VisibleClass */);
    this._resizeOverlayHideTimeout.value = disposableTimeout(() => {
      this._resizeOverlay?.classList.remove("visible" /* VisibleClass */);
    }, 500 /* ResizeOverlayHideDelay */);
  }
  _ensureResizeOverlay(container3) {
    if (!this._resizeOverlay) {
      this._resizeOverlay = $(".terminal-resize-overlay");
      this._resizeOverlay.setAttribute("role", "status");
      this._resizeOverlay.setAttribute("aria-live", "polite");
      container3.appendChild(this._resizeOverlay);
    } else if (!container3.contains(this._resizeOverlay)) {
      container3.appendChild(this._resizeOverlay);
    }
    return this._resizeOverlay;
  }
};
export { TerminalResizeDimensionsOverlay };
