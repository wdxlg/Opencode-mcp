// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/diffEditorHelper.ts
import { Disposable } from "./module-0012.mjs";
import { EmbeddedDiffEditorWidget } from "./module-2958.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorunWithStore } from "./module-0052.mjs";
import { FloatingEditorClickWidget } from "./module-1821.mjs";
import { localize } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { registerDiffEditorContribution } from "./module-0097.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions14 } from "./module-1113.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { DiffEditorAccessibilityHelp } from "./module-3291.mjs";


// src/vs/workbench/contrib/codeEditor/browser/diffEditorHelper.ts
var DiffEditorHelperContribution = class extends Disposable {
  constructor(_diffEditor, _instantiationService, _textResourceConfigurationService, _notificationService) {
    super();
    this._diffEditor = _diffEditor;
    this._instantiationService = _instantiationService;
    this._textResourceConfigurationService = _textResourceConfigurationService;
    this._notificationService = _notificationService;
    const isEmbeddedDiffEditor = this._diffEditor instanceof EmbeddedDiffEditorWidget;
    if (!isEmbeddedDiffEditor) {
      const computationResult = observableFromEvent(this, (e4) => this._diffEditor.onDidUpdateDiff(e4), () => (
        /** @description diffEditor.diffComputationResult */
        this._diffEditor.getDiffComputationResult()
      ));
      const onlyWhiteSpaceChange = computationResult.map((r2) => r2 && !r2.identical && r2.changes2.length === 0);
      this._register(autorunWithStore((reader, store) => {
        if (onlyWhiteSpaceChange.read(reader)) {
          const helperWidget = store.add(this._instantiationService.createInstance(
            FloatingEditorClickWidget,
            this._diffEditor.getModifiedEditor(),
            localize(13666, null),
            null
          ));
          store.add(helperWidget.onClick(() => {
            this._textResourceConfigurationService.updateValue(this._diffEditor.getModel().modified.uri, "diffEditor.ignoreTrimWhitespace", false);
          }));
          helperWidget.render();
        }
      }));
      this._register(this._diffEditor.onDidUpdateDiff(() => {
        const diffComputationResult = this._diffEditor.getDiffComputationResult();
        if (diffComputationResult && diffComputationResult.quitEarly) {
          this._notificationService.prompt(
            Severity2.Warning,
            localize(13665, null, this._diffEditor.maxComputationTime),
            [{
              label: localize(13667, null),
              run: () => {
                this._textResourceConfigurationService.updateValue(this._diffEditor.getModel().modified.uri, "diffEditor.maxComputationTime", 0);
              }
            }],
            {}
          );
        }
      }));
    }
  }
  static {
    this.ID = "editor.contrib.diffEditorHelper";
  }
};

DiffEditorHelperContribution = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITextResourceConfigurationService),
  __decorateParam(3, INotificationService)
], DiffEditorHelperContribution);

registerDiffEditorContribution(DiffEditorHelperContribution.ID, DiffEditorHelperContribution);

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "diffEditor.experimental.collapseUnchangedRegions",
  migrateFn: (value2, accessor) => {
    return [
      ["diffEditor.hideUnchangedRegions.enabled", { value: value2 }],
      ["diffEditor.experimental.collapseUnchangedRegions", { value: void 0 }]
    ];
  }
}]);

AccessibleViewRegistry.register(new DiffEditorAccessibilityHelp());
export { DiffEditorHelperContribution };
