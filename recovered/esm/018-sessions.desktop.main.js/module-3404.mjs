// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineCompletions/browser/inlineCompletionLanguageStatusBarContribution.ts
import { Disposable } from "./module-0012.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { derived } from "./module-0054.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { InlineCompletionsController } from "./module-0796.mjs";
import { debouncedObservable } from "./module-0059.mjs";
import { autorunWithStore } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { severity_default } from "./module-0266.mjs";
import { createHotClass } from "./module-0443.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageStatusService } from "./module-1225.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";


// src/vs/workbench/contrib/inlineCompletions/browser/inlineCompletionLanguageStatusBarContribution.ts
var InlineCompletionLanguageStatusBarContribution = class extends Disposable {
  constructor(_languageStatusService, _editorService, _chatEntitlementService) {
    super();
    this._languageStatusService = _languageStatusService;
    this._editorService = _editorService;
    this._chatEntitlementService = _chatEntitlementService;
    this._activeEditor = observableFromEvent(this, _editorService.onDidActiveEditorChange, () => this._editorService.activeTextEditorControl);
    this._sentiment = this._chatEntitlementService.sentimentObs;
    this._state = derived(this, (reader) => {
      const editor = this._activeEditor.read(reader);
      if (!editor || !isCodeEditor(editor)) {
        return void 0;
      }
      const c = InlineCompletionsController.get(editor);
      const model = c?.model.read(reader);
      if (!model) {
        return void 0;
      }
      return {
        model,
        status: debouncedObservable(model.status, 300)
      };
    });
    this._register(autorunWithStore((reader, store) => {
      const sentiment = this._sentiment.read(reader);
      if (sentiment.hidden) {
        return;
      }
      const state = this._state.read(reader);
      if (!state) {
        return;
      }
      const status2 = state.status.read(reader);
      const statusMap = {
        loading: { shortLabel: "", label: localize(16206, null), loading: true },
        ghostText: { shortLabel: "$(lightbulb)", label: "$(copilot) " + localize(16204, null), loading: false },
        inlineEdit: { shortLabel: "$(lightbulb-sparkle)", label: "$(copilot) " + localize(16205, null), loading: false },
        noSuggestion: { shortLabel: "$(circle-slash)", label: "$(copilot) " + localize(16209, null), loading: false }
      };
      store.add(this._languageStatusService.addStatus({
        accessibilityInfo: void 0,
        busy: statusMap[status2].loading,
        command: void 0,
        detail: localize(16208, null),
        id: "inlineSuggestions",
        label: { value: statusMap[status2].label, shortValue: statusMap[status2].shortLabel },
        name: localize(16207, null),
        selector: { pattern: state.model.textModel.uri.fsPath },
        severity: severity_default.Info,
        source: "inlineSuggestions"
      }));
    }));
  }
  static {
    this.hot = createHotClass(this);
  }
  static {
    this.Id = "vs.contrib.inlineCompletionLanguageStatusBarContribution";
  }
  static {
    this.languageStatusBarDisposables = /* @__PURE__ */ new Set();
  }
};

InlineCompletionLanguageStatusBarContribution = __decorateClass([
  __decorateParam(0, ILanguageStatusService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IChatEntitlementService)
], InlineCompletionLanguageStatusBarContribution);
export { InlineCompletionLanguageStatusBarContribution };
