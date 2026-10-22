// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/limitIndicator/browser/limitIndicator.contribution.ts
import { localize } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ILanguageStatusService } from "./module-1225.mjs";
import { ColorDetector } from "./module-0578.mjs";
import { FoldingController } from "./module-0684.mjs";
import { severity_default } from "./module-0266.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/limitIndicator/browser/limitIndicator.contribution.ts
var openSettingsCommand = "workbench.action.openSettings";

var configureSettingsLabel = localize(16509, null);

var LimitIndicatorContribution = class extends Disposable {
  constructor(editorService, languageStatusService) {
    super();
    const accessors = [new ColorDecorationAccessor(), new FoldingRangeAccessor()];
    const statusEntries = accessors.map((indicator) => new LanguageStatusEntry(languageStatusService, indicator));
    statusEntries.forEach((entry) => this._register(entry));
    let control;
    const onActiveEditorChanged = () => {
      const activeControl = editorService.activeTextEditorControl;
      if (activeControl === control) {
        return;
      }
      control = activeControl;
      const editor = getCodeEditor(activeControl);
      statusEntries.forEach((statusEntry) => statusEntry.onActiveEditorChanged(editor));
    };
    this._register(editorService.onDidActiveEditorChange(onActiveEditorChanged));
    onActiveEditorChanged();
  }
};

LimitIndicatorContribution = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, ILanguageStatusService)
], LimitIndicatorContribution);

var ColorDecorationAccessor = class {
  constructor() {
    this.id = "decoratorsLimitInfo";
    this.name = localize(16505, null);
    this.label = localize(16511, null);
    this.source = localize(16506, null);
    this.settingsId = "editor.colorDecoratorsLimit";
  }
  getLimitReporter(editor) {
    return ColorDetector.get(editor)?.limitReporter;
  }
};

var FoldingRangeAccessor = class {
  constructor() {
    this.id = "foldingLimitInfo";
    this.name = localize(16507, null);
    this.label = localize(16512, null);
    this.source = localize(16508, null);
    this.settingsId = "editor.foldingMaximumRegions";
  }
  getLimitReporter(editor) {
    return FoldingController.get(editor)?.limitReporter;
  }
};

var LanguageStatusEntry = class {
  constructor(languageStatusService, accessor) {
    this.languageStatusService = languageStatusService;
    this.accessor = accessor;
  }
  onActiveEditorChanged(editor) {
    if (this._indicatorChangeListener) {
      this._indicatorChangeListener.dispose();
      this._indicatorChangeListener = void 0;
    }
    let info;
    if (editor) {
      info = this.accessor.getLimitReporter(editor);
    }
    this.updateStatusItem(info);
    if (info) {
      this._indicatorChangeListener = info.onDidChange((_) => {
        this.updateStatusItem(info);
      });
      return true;
    }
    return false;
  }
  updateStatusItem(info) {
    if (this._limitStatusItem) {
      this._limitStatusItem.dispose();
      this._limitStatusItem = void 0;
    }
    if (info && info.limited !== false) {
      const status2 = {
        id: this.accessor.id,
        selector: "*",
        name: this.accessor.name,
        severity: severity_default.Warning,
        label: this.accessor.label,
        detail: localize(16510, null, info.limited),
        command: { id: openSettingsCommand, arguments: [this.accessor.settingsId], title: configureSettingsLabel },
        accessibilityInfo: void 0,
        source: this.accessor.source,
        busy: false
      };
      this._limitStatusItem = this.languageStatusService.addStatus(status2);
    }
  }
  dispose() {
    this._limitStatusItem?.dispose();
    this._limitStatusItem = void 0;
    this._indicatorChangeListener?.dispose();
    this._indicatorChangeListener = void 0;
  }
};

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(
  LimitIndicatorContribution,
  3 /* Restored */
);
export { openSettingsCommand, configureSettingsLabel, LimitIndicatorContribution, ColorDecorationAccessor, FoldingRangeAccessor, LanguageStatusEntry };
