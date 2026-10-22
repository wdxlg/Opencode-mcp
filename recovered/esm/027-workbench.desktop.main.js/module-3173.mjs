// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/replAccessibilityHelp.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { CONTEXT_IN_DEBUG_REPL } from "./module-1057.mjs";
import { IViewsService } from "./module-1246.mjs";
import { getReplView } from "./module-3019.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/debug/browser/replAccessibilityHelp.ts
var ReplAccessibilityHelp = class {
  constructor() {
    this.priority = 120;
    this.name = "replHelp";
    this.when = ContextKeyExpr.or(
      ContextKeyExpr.equals("focusedView", "workbench.panel.repl.view"),
      CONTEXT_IN_DEBUG_REPL
    );
    this.type = "help" /* Help */;
  }
  getProvider(accessor) {
    const viewsService = accessor.get(IViewsService);
    const replView = getReplView(viewsService);
    if (!replView) {
      return void 0;
    }
    return new ReplAccessibilityHelpProvider(replView);
  }
};

var ReplAccessibilityHelpProvider = class extends Disposable {
  constructor(_replView) {
    super();
    this._replView = _replView;
    this.id = "replHelp" /* ReplHelp */;
    this.verbositySettingKey = "accessibility.verbosity.find" /* Find */;
    this.options = { type: "help" /* Help */ };
  }
  onClose() {
    this._replView.focusFilter();
  }
  provideContent() {
    const content2 = [];
    content2.push(localize(14656, null));
    content2.push(localize(14645, null));
    content2.push("");
    content2.push(localize(14675, null));
    content2.push(localize(14674, null));
    content2.push("");
    content2.push(localize(14658, null));
    content2.push(localize(14657, null));
    content2.push("");
    content2.push(localize(14651, null));
    content2.push(localize(14650, null));
    content2.push("");
    content2.push(localize(14655, null));
    content2.push(localize(14652, null));
    content2.push(localize(14653, null));
    content2.push(localize(14654, null));
    content2.push("");
    content2.push(localize(14648, null));
    content2.push(localize(14647, null));
    content2.push(localize(14646, null));
    content2.push(localize(14649, null, "<keybinding:workbench.panel.repl.view.focus>"));
    content2.push("");
    content2.push(localize(14677, null));
    content2.push(localize(14678, null));
    content2.push(localize(14676, null));
    content2.push("");
    content2.push(localize(14659, null));
    content2.push(localize(14660, null));
    content2.push(localize(14663, null));
    content2.push(localize(14661, null));
    content2.push(localize(14662, null, "<keybinding:workbench.panel.repl.view.focus>"));
    content2.push("");
    content2.push(localize(14670, null, "<keybinding:workbench.action.openSettings>"));
    content2.push(localize(14671, null));
    content2.push(localize(14672, null));
    content2.push(localize(14664, null));
    content2.push(localize(14667, null));
    content2.push(localize(14666, null));
    content2.push(localize(14673, null));
    content2.push(localize(14668, null));
    content2.push(localize(14665, null));
    content2.push(localize(14669, null));
    content2.push("");
    content2.push(localize(14644, null));
    content2.push(localize(14643, null));
    return content2.join("\n");
  }
};
export { ReplAccessibilityHelp, ReplAccessibilityHelpProvider };
