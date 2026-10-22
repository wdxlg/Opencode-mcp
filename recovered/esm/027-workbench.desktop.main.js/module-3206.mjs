// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/markers/browser/markersAccessibilityHelp.ts
import { MarkersContextKeys } from "./module-3192.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/markers/browser/markersAccessibilityHelp.ts
var ProblemsAccessibilityHelp = class {
  constructor() {
    this.type = "help" /* Help */;
    this.priority = 105;
    this.name = "problemsFilter";
    this.when = MarkersContextKeys.MarkerViewFilterFocusContextKey;
  }
  getProvider(accessor) {
    return new ProblemsAccessibilityHelpProvider(accessor.get(IKeybindingService));
  }
};

var ProblemsAccessibilityHelpProvider = class extends Disposable {
  constructor(_keybindingService) {
    super();
    this._keybindingService = _keybindingService;
    this.id = "problemsFilterHelp" /* ProblemsFilterHelp */;
    this.verbositySettingKey = "accessibility.verbosity.find" /* Find */;
    this.options = { type: "help" /* Help */ };
  }
  provideContent() {
    const lines = [];
    lines.push(localize(16666, null));
    lines.push(localize(16657, null));
    lines.push("");
    lines.push(localize(16691, null));
    lines.push(localize(16690, null));
    lines.push("");
    lines.push(localize(16668, null));
    lines.push(localize(16667, null));
    lines.push("");
    lines.push(localize(16660, null));
    lines.push(localize(16658, null));
    lines.push(localize(16659, null));
    lines.push("");
    lines.push(localize(16665, null));
    lines.push(localize(16661, null));
    lines.push(localize(16662, null));
    lines.push(localize(16663, null));
    lines.push(localize(16664, null));
    lines.push("");
    lines.push(localize(16694, null));
    lines.push(localize(16695, null));
    lines.push(localize(16693, null));
    lines.push(localize(16692, null));
    lines.push("");
    lines.push(localize(16686, null));
    lines.push(localize(16688, null));
    lines.push(localize(16685, null));
    lines.push(localize(16689, null));
    lines.push(localize(16687, null));
    lines.push(localize(16683, null));
    lines.push(localize(16684, null));
    lines.push("");
    lines.push(localize(16669, null));
    lines.push(localize(16670, null));
    lines.push(localize(16675, null));
    lines.push(localize(16671, null));
    lines.push(localize(16673, null, this._describeCommand("editor.action.marker.nextInFiles") || "F8"));
    lines.push(localize(16674, null, this._describeCommand("editor.action.marker.prevInFiles") || "Shift+F8"));
    lines.push(localize(16672, null));
    lines.push("");
    lines.push(localize(16677, null, this._describeCommand("workbench.action.openSettings") || "Ctrl+,"));
    lines.push(localize(16679, null));
    lines.push(localize(16681, null));
    lines.push(localize(16676, null));
    lines.push(localize(16682, null));
    lines.push(localize(16680, null));
    lines.push(localize(16678, null));
    lines.push("");
    lines.push(localize(16656, null));
    lines.push(localize(16655, null));
    return lines.join("\n");
  }
  _describeCommand(commandId) {
    const kb = this._keybindingService.lookupKeybinding(commandId);
    return kb?.getAriaLabel() ?? void 0;
  }
  onClose() {
  }
};
export { ProblemsAccessibilityHelp, ProblemsAccessibilityHelpProvider };
