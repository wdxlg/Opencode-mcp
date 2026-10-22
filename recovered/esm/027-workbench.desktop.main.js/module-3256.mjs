// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/output/browser/outputAccessibilityHelp.ts
import { OUTPUT_FILTER_FOCUS_CONTEXT } from "./module-1245.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/output/browser/outputAccessibilityHelp.ts
var OutputAccessibilityHelp = class {
  constructor() {
    this.type = "help" /* Help */;
    this.priority = 105;
    this.name = "outputFilter";
    this.when = OUTPUT_FILTER_FOCUS_CONTEXT;
  }
  getProvider(accessor) {
    return new OutputAccessibilityHelpProvider(accessor.get(IKeybindingService));
  }
};

var OutputAccessibilityHelpProvider = class extends Disposable {
  constructor(_keybindingService) {
    super();
    this._keybindingService = _keybindingService;
    this.id = "outputFindHelp" /* OutputFindHelp */;
    this.verbositySettingKey = "accessibility.verbosity.find" /* Find */;
    this.options = { type: "help" /* Help */ };
  }
  provideContent() {
    const lines = [];
    lines.push(localize(18019, null));
    lines.push(localize(18011, null));
    lines.push("");
    lines.push(localize(18031, null));
    lines.push(localize(18030, null));
    lines.push("");
    lines.push(localize(18021, null));
    lines.push(localize(18020, null));
    lines.push("");
    lines.push(localize(18014, null));
    lines.push(localize(18012, null));
    lines.push(localize(18013, null));
    lines.push("");
    lines.push(localize(18018, null));
    lines.push(localize(18015, null));
    lines.push(localize(18016, null));
    lines.push(localize(18017, null));
    lines.push("");
    lines.push(localize(18035, null));
    lines.push(localize(18037, null));
    lines.push(localize(18034, null));
    lines.push(localize(18032, null));
    lines.push(localize(18036, null));
    lines.push(localize(18033, null));
    lines.push("");
    lines.push(localize(18022, null));
    lines.push(localize(18023, null));
    lines.push(localize(18025, null));
    lines.push(localize(18024, null));
    lines.push("");
    lines.push(localize(18026, null, this._describeCommand("workbench.action.openSettings") || "Ctrl+,"));
    lines.push(localize(18027, null));
    lines.push(localize(18029, null));
    lines.push(localize(18028, null));
    lines.push("");
    lines.push(localize(18010, null));
    lines.push(localize(18009, null));
    return lines.join("\n");
  }
  _describeCommand(commandId) {
    const kb = this._keybindingService.lookupKeybinding(commandId);
    return kb?.getAriaLabel() ?? void 0;
  }
  onClose() {
  }
};
export { OutputAccessibilityHelp, OutputAccessibilityHelpProvider };
