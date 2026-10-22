// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibilitySignals/browser/openDiffEditorAnnouncement.ts
import { Disposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { isDiffEditor } from "./module-0223.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/accessibilitySignals/browser/openDiffEditorAnnouncement.ts
var DiffEditorActiveAnnouncementContribution = class extends Disposable {
  constructor(_editorService, _accessibilityService, _configurationService) {
    super();
    this._editorService = _editorService;
    this._accessibilityService = _accessibilityService;
    this._configurationService = _configurationService;
    this._register(Event2.runAndSubscribe(_accessibilityService.onDidChangeScreenReaderOptimized, () => this._updateListener()));
    this._register(_configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("accessibility.verbosity.diffEditorActive" /* DiffEditorActive */)) {
        this._updateListener();
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.diffEditorActiveAnnouncement";
  }
  _updateListener() {
    const announcementEnabled = this._configurationService.getValue("accessibility.verbosity.diffEditorActive" /* DiffEditorActive */);
    const screenReaderOptimized = this._accessibilityService.isScreenReaderOptimized();
    if (!announcementEnabled || !screenReaderOptimized) {
      this._onDidActiveEditorChangeListener?.dispose();
      this._onDidActiveEditorChangeListener = void 0;
      return;
    }
    if (this._onDidActiveEditorChangeListener) {
      return;
    }
    this._onDidActiveEditorChangeListener = this._register(this._editorService.onDidActiveEditorChange(() => {
      if (isDiffEditor(this._editorService.activeTextEditorControl)) {
        this._accessibilityService.alert(localize(7808, null));
      }
    }));
  }
};

DiffEditorActiveAnnouncementContribution = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IAccessibilityService),
  __decorateParam(2, IConfigurationService)
], DiffEditorActiveAnnouncementContribution);
export { DiffEditorActiveAnnouncementContribution };
