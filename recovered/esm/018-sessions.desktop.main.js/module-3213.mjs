// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/zoom/browser/terminal.zoom.contribution.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { MouseWheelClassifier } from "./module-0259.mjs";
import { EventType, addDisposableListener } from "./module-0075.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerTerminalContribution } from "./module-2329.mjs";
import { registerTerminalAction } from "./module-3043.mjs";
import { localize2 } from "./module-0001.mjs";
import { isNumber } from "./module-0010.mjs";
import { defaultTerminalFontSize } from "./module-3029.mjs";


// src/vs/workbench/contrib/terminalContrib/zoom/browser/terminal.zoom.contribution.ts
var TerminalMouseWheelZoomContribution = class extends Disposable {
  constructor(_ctx, _configurationService) {
    super();
    this._configurationService = _configurationService;
    this._listener = this._register(new MutableDisposable());
  }
  static {
    this.ID = "terminal.mouseWheelZoom";
  }
  static get(instance2) {
    return instance2.getContribution(TerminalMouseWheelZoomContribution.ID);
  }
  xtermOpen(xterm) {
    this._register(Event2.runAndSubscribe(this._configurationService.onDidChangeConfiguration, (e4) => {
      if (!e4 || e4.affectsConfiguration("terminal.integrated.mouseWheelZoom" /* MouseWheelZoom */)) {
        if (!!this._configurationService.getValue("terminal.integrated.mouseWheelZoom" /* MouseWheelZoom */)) {
          this._setupMouseWheelZoomListener(xterm.raw);
        } else {
          this._listener.clear();
        }
      }
    }));
  }
  _getConfigFontSize() {
    return this._configurationService.getValue("terminal.integrated.fontSize" /* FontSize */);
  }
  _clampFontSize(fontSize) {
    return clampTerminalFontSize(fontSize);
  }
  _setupMouseWheelZoomListener(raw) {
    const classifier = MouseWheelClassifier.INSTANCE;
    let prevMouseWheelTime = 0;
    let gestureStartFontSize = this._getConfigFontSize();
    let gestureHasZoomModifiers = false;
    let gestureAccumulatedDelta = 0;
    const wheelListener = (browserEvent) => {
      if (classifier.isPhysicalMouseWheel()) {
        if (this._hasMouseWheelZoomModifiers(browserEvent)) {
          const delta2 = browserEvent.deltaY > 0 ? -1 : 1;
          const newFontSize = this._clampFontSize(this._getConfigFontSize() + delta2);
          this._configurationService.updateValue("terminal.integrated.fontSize" /* FontSize */, newFontSize);
          browserEvent.preventDefault();
          browserEvent.stopPropagation();
        }
      } else {
        if (Date.now() - prevMouseWheelTime > 50) {
          gestureStartFontSize = this._getConfigFontSize();
          gestureHasZoomModifiers = this._hasMouseWheelZoomModifiers(browserEvent);
          gestureAccumulatedDelta = 0;
        }
        prevMouseWheelTime = Date.now();
        gestureAccumulatedDelta += browserEvent.deltaY;
        if (gestureHasZoomModifiers) {
          const deltaAbs = Math.ceil(Math.abs(gestureAccumulatedDelta / 5));
          const deltaDirection = gestureAccumulatedDelta > 0 ? -1 : 1;
          const delta2 = deltaAbs * deltaDirection;
          const newFontSize = this._clampFontSize(gestureStartFontSize + delta2);
          this._configurationService.updateValue("terminal.integrated.fontSize" /* FontSize */, newFontSize);
          gestureAccumulatedDelta += browserEvent.deltaY;
          browserEvent.preventDefault();
          browserEvent.stopPropagation();
        }
      }
    };
    this._listener.value = addDisposableListener(raw.element, EventType.MOUSE_WHEEL, wheelListener, { capture: true, passive: false });
  }
  _hasMouseWheelZoomModifiers(browserEvent) {
    return isMacintosh ? (browserEvent.metaKey || browserEvent.ctrlKey) && !browserEvent.shiftKey && !browserEvent.altKey : browserEvent.ctrlKey && !browserEvent.metaKey && !browserEvent.shiftKey && !browserEvent.altKey;
  }
};

TerminalMouseWheelZoomContribution = __decorateClass([
  __decorateParam(1, IConfigurationService)
], TerminalMouseWheelZoomContribution);

registerTerminalContribution(TerminalMouseWheelZoomContribution.ID, TerminalMouseWheelZoomContribution, true);

registerTerminalAction({
  id: "workbench.action.terminal.fontZoomIn" /* FontZoomIn */,
  title: localize2(20985, "Increase Font Size"),
  run: async (c, accessor) => {
    const configurationService = accessor.get(IConfigurationService);
    const value2 = configurationService.getValue("terminal.integrated.fontSize" /* FontSize */);
    if (isNumber(value2)) {
      const newFontSize = clampTerminalFontSize(value2 + 1);
      await configurationService.updateValue("terminal.integrated.fontSize" /* FontSize */, newFontSize);
    }
  }
});

registerTerminalAction({
  id: "workbench.action.terminal.fontZoomOut" /* FontZoomOut */,
  title: localize2(20986, "Decrease Font Size"),
  run: async (c, accessor) => {
    const configurationService = accessor.get(IConfigurationService);
    const value2 = configurationService.getValue("terminal.integrated.fontSize" /* FontSize */);
    if (isNumber(value2)) {
      const newFontSize = clampTerminalFontSize(value2 - 1);
      await configurationService.updateValue("terminal.integrated.fontSize" /* FontSize */, newFontSize);
    }
  }
});

registerTerminalAction({
  id: "workbench.action.terminal.fontZoomReset" /* FontZoomReset */,
  title: localize2(20987, "Reset Font Size"),
  run: async (c, accessor) => {
    const configurationService = accessor.get(IConfigurationService);
    await configurationService.updateValue("terminal.integrated.fontSize" /* FontSize */, defaultTerminalFontSize);
  }
});

function clampTerminalFontSize(fontSize) {
  return Math.max(6, Math.min(100, fontSize));
}
export { clampTerminalFontSize, TerminalMouseWheelZoomContribution };
