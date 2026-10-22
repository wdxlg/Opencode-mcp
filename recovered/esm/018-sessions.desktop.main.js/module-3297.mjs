// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/largeFileOptimizations.ts
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { basename } from "./module-0026.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/workbench/contrib/codeEditor/browser/largeFileOptimizations.ts
var LargeFileOptimizationsWarner = class extends Disposable {
  constructor(_editor, _notificationService, _configurationService) {
    super();
    this._editor = _editor;
    this._notificationService = _notificationService;
    this._configurationService = _configurationService;
    this._register(this._editor.onDidChangeModel((e4) => this._update()));
    this._update();
  }
  static {
    this.ID = "editor.contrib.largeFileOptimizationsWarner";
  }
  _update() {
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    if (model.isTooLargeForTokenization()) {
      const message = localize(
        13804,
        null,
        basename(model.uri.path)
      );
      this._notificationService.prompt(Severity2.Info, message, [
        {
          label: localize(13805, null),
          run: () => {
            this._configurationService.updateValue(`editor.largeFileOptimizations`, false).then(() => {
              this._notificationService.info(localize(13806, null));
            }, (err) => {
              this._notificationService.error(err);
            });
          }
        }
      ], { neverShowAgain: { id: "editor.contrib.largeFileOptimizationsWarner" } });
    }
  }
};

LargeFileOptimizationsWarner = __decorateClass([
  __decorateParam(1, INotificationService),
  __decorateParam(2, IConfigurationService)
], LargeFileOptimizationsWarner);

registerEditorContribution(LargeFileOptimizationsWarner.ID, LargeFileOptimizationsWarner, 1 /* AfterFirstRender */);
export { LargeFileOptimizationsWarner };
