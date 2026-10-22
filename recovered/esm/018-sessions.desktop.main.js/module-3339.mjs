// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/languageDetection/browser/languageDetection.contribution.ts
import { DisposableStore } from "./module-0012.mjs";
import { ThrottledDelayer } from "./module-0036.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { Schemas } from "./module-0033.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageDetectionService, LanguageDetectionLanguageEventSource } from "./module-1098.mjs";
import { IStatusbarService } from "./module-0895.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { NOTEBOOK_EDITOR_EDITABLE } from "./module-1844.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { INotificationService } from "./module-0336.mjs";


// src/vs/workbench/contrib/languageDetection/browser/languageDetection.contribution.ts
var detectLanguageCommandId = "editor.detectLanguage";

var LanguageDetectionStatusContribution = class {
  constructor(_languageDetectionService, _statusBarService, _configurationService, _editorService, _languageService, _keybindingService) {
    this._languageDetectionService = _languageDetectionService;
    this._statusBarService = _statusBarService;
    this._configurationService = _configurationService;
    this._editorService = _editorService;
    this._languageService = _languageService;
    this._keybindingService = _keybindingService;
    this._disposables = new DisposableStore();
    this._delayer = new ThrottledDelayer(1e3);
    this._renderDisposables = new DisposableStore();
    _editorService.onDidActiveEditorChange(() => this._update(true), this, this._disposables);
    this._update(false);
  }
  static {
    this._id = "status.languageDetectionStatus";
  }
  dispose() {
    this._disposables.dispose();
    this._delayer.dispose();
    this._combinedEntry?.dispose();
    this._renderDisposables.dispose();
  }
  _update(clear) {
    if (clear) {
      this._combinedEntry?.dispose();
      this._combinedEntry = void 0;
    }
    this._delayer.trigger(() => this._doUpdate());
  }
  async _doUpdate() {
    const editor = getCodeEditor(this._editorService.activeTextEditorControl);
    this._renderDisposables.clear();
    editor?.onDidChangeModelLanguage(() => this._update(true), this, this._renderDisposables);
    editor?.onDidChangeModelContent(() => this._update(false), this, this._renderDisposables);
    const editorModel = editor?.getModel();
    const editorUri = editorModel?.uri;
    const existingId = editorModel?.getLanguageId();
    const enablementConfig = this._configurationService.getValue("workbench.editor.languageDetectionHints");
    const enabled = typeof enablementConfig === "object" && enablementConfig?.untitledEditors;
    const disableLightbulb = !enabled || editorUri?.scheme !== Schemas.untitled || !existingId;
    if (disableLightbulb || !editorUri) {
      this._combinedEntry?.dispose();
      this._combinedEntry = void 0;
    } else {
      const lang = await this._languageDetectionService.detectLanguage(editorUri);
      const skip = { "jsonc": "json" };
      const existing = editorModel.getLanguageId();
      if (lang && lang !== existing && skip[existing] !== lang) {
        const detectedName = this._languageService.getLanguageName(lang) || lang;
        const tooltip = this._keybindingService.appendKeybinding(
          localize(16496, null, detectedName),
          detectLanguageCommandId
        );
        const props = {
          name: localize(16494, null),
          ariaLabel: localize(16493, null, lang),
          tooltip,
          command: detectLanguageCommandId,
          text: "$(lightbulb-autofix)"
        };
        if (!this._combinedEntry) {
          this._combinedEntry = this._statusBarService.addEntry(props, LanguageDetectionStatusContribution._id, 1 /* RIGHT */, { location: { id: "status.editor.mode", priority: 100.1 }, alignment: 1 /* RIGHT */, compact: true });
        } else {
          this._combinedEntry.update(props);
        }
      } else {
        this._combinedEntry?.dispose();
        this._combinedEntry = void 0;
      }
    }
  }
};

LanguageDetectionStatusContribution = __decorateClass([
  __decorateParam(0, ILanguageDetectionService),
  __decorateParam(1, IStatusbarService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, ILanguageService),
  __decorateParam(5, IKeybindingService)
], LanguageDetectionStatusContribution);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(LanguageDetectionStatusContribution, 3 /* Restored */);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: detectLanguageCommandId,
      title: localize2(16492, "Detect Language from Content"),
      f1: true,
      precondition: ContextKeyExpr.and(NOTEBOOK_EDITOR_EDITABLE.toNegated(), EditorContextKeys.editorTextFocus),
      keybinding: { primary: 34 /* KeyD */ | 512 /* Alt */ | 1024 /* Shift */, weight: 200 /* WorkbenchContrib */ }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const languageDetectionService = accessor.get(ILanguageDetectionService);
    const editor = getCodeEditor(editorService.activeTextEditorControl);
    const notificationService = accessor.get(INotificationService);
    const editorUri = editor?.getModel()?.uri;
    if (editorUri) {
      const lang = await languageDetectionService.detectLanguage(editorUri);
      if (lang) {
        editor.getModel()?.setLanguage(lang, LanguageDetectionLanguageEventSource);
      } else {
        notificationService.warn(localize(16495, null));
      }
    }
  }
});
export { detectLanguageCommandId, LanguageDetectionStatusContribution };
