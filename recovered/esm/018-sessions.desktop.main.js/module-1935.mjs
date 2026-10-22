// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webview/browser/webviewFindAccessibilityHelp.ts
import { KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED } from "./module-1043.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/webview/browser/webviewFindAccessibilityHelp.ts
var WebviewFindAccessibilityHelp = class {
  constructor() {
    this.priority = 105;
    this.name = "webview-find";
    this.type = "help" /* Help */;
    this.when = KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED;
  }
  getProvider(accessor) {
    return new WebviewFindAccessibilityHelpProvider();
  }
};

var WebviewFindAccessibilityHelpProvider = class extends Disposable {
  constructor() {
    super(...arguments);
    this.id = "webviewFindHelp" /* WebviewFindHelp */;
    this.verbositySettingKey = "accessibility.verbosity.find" /* Find */;
    this.options = { type: "help" /* Help */ };
  }
  onClose() {
  }
  provideContent() {
    const content = [];
    content.push(localize(21834, null));
    content.push(localize(21829, null));
    content.push("");
    content.push(localize(21856, null));
    content.push(localize(21855, null));
    content.push("");
    content.push(localize(21843, null));
    content.push(localize(21842, null));
    content.push("");
    content.push(localize(21839, null));
    content.push(localize(21838, null));
    content.push(localize(21835, null));
    content.push(localize(21836, null));
    content.push(localize(21837, null));
    content.push("");
    content.push(localize(21833, null));
    content.push(localize(21830, null));
    content.push(localize(21831, null));
    content.push(localize(21832, null));
    content.push("");
    content.push(localize(21844, null));
    content.push("");
    content.push(localize(21846, null));
    content.push(localize(21845, null));
    content.push(localize(21847, null));
    content.push("");
    content.push(localize(21850, null));
    content.push(localize(21848, null));
    content.push(localize(21851, null));
    content.push(localize(21849, null));
    content.push("");
    content.push(localize(21841, null));
    content.push(localize(21840, null));
    content.push("");
    content.push(localize(21853, null, "<keybinding:workbench.action.openSettings>"));
    content.push(localize(21852, null));
    content.push(localize(21854, null));
    content.push("");
    content.push(localize(21828, null));
    content.push(localize(21827, null));
    return content.join("\n");
  }
};
export { WebviewFindAccessibilityHelp, WebviewFindAccessibilityHelpProvider };
