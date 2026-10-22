// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/widgets/widgetManager.ts



// src/vs/workbench/contrib/terminal/browser/widgets/widgetManager.ts
var TerminalWidgetManager = class {
  constructor() {
    this._attached = /* @__PURE__ */ new Map();
  }
  attachToElement(terminalWrapper) {
    if (!this._container) {
      this._container = document.createElement("div");
      this._container.classList.add("terminal-widget-container");
      terminalWrapper.appendChild(this._container);
    }
  }
  dispose() {
    if (this._container) {
      this._container.remove();
      this._container = void 0;
    }
    this._attached.forEach((w) => w.dispose());
    this._attached.clear();
  }
  attachWidget(widget) {
    if (!this._container) {
      return;
    }
    this._attached.get(widget.id)?.dispose();
    widget.attach(this._container);
    this._attached.set(widget.id, widget);
    return {
      dispose: () => {
        const current = this._attached.get(widget.id);
        if (current === widget) {
          this._attached.delete(widget.id);
          widget.dispose();
        }
      }
    };
  }
};
export { TerminalWidgetManager };
