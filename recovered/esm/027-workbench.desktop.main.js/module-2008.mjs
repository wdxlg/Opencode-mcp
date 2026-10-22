// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/browser/inlineChatAffordance.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { debouncedObservable } from "./module-0059.mjs";
import { CTX_INLINE_CHAT_AFFORDANCE_VISIBLE } from "./module-2001.mjs";
import { runOnChange } from "./module-0064.mjs";
import { autorun } from "./module-0052.mjs";
import { generateUuid } from "./module-0190.mjs";
import { derived } from "./module-0054.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { InlineChatAffordanceWidget } from "./module-2007.mjs";
import { CodeActionController } from "./module-0566.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { IInlineChatSessionService } from "./module-1899.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/inlineChat/browser/inlineChatAffordance.ts
var InlineChatAffordance = class extends Disposable {
  #editor;
  #instantiationService;
  #selectionData = observableValue(this, void 0);
  constructor(editor, instantiationService, configurationService, chatEntiteldService, inlineChatSessionService, telemetryService, contextKeyService) {
    super();
    this.#editor = editor;
    this.#instantiationService = instantiationService;
    const editorObs = observableCodeEditor(this.#editor);
    const affordance = observableConfigValue("inlineChat.affordance" /* Affordance */, "off", configurationService);
    const debouncedSelection = debouncedObservable(editorObs.cursorSelection, 500);
    const selectionData = this.#selectionData;
    const ctxAffordanceVisible = CTX_INLINE_CHAT_AFFORDANCE_VISIBLE.bindTo(contextKeyService);
    this._store.add({ dispose: () => ctxAffordanceVisible.reset() });
    let explicitSelection = false;
    let affordanceId;
    this._store.add(runOnChange(editorObs.selections, (value2, _prev, events) => {
      explicitSelection = events.every((e) => e.reason === 3 /* Explicit */);
      if (!value2 || value2.length !== 1 || value2[0].isEmpty() || !explicitSelection) {
        selectionData.set(void 0, void 0);
      }
    }));
    this._store.add(autorun((r2) => {
      const value2 = debouncedSelection.read(r2);
      if (!value2 || value2.isEmpty() || !explicitSelection || this.#editor.getModel()?.getValueInRange(value2).match(/^\s+$/)) {
        selectionData.set(void 0, void 0);
        affordanceId = void 0;
        return;
      }
      affordanceId = generateUuid();
      const mode = affordance.read(void 0);
      if (mode === "editor") {
        telemetryService.publicLog2("inlineChatAffordance/shown", { mode, id: affordanceId, commandId: "" });
      }
      selectionData.set(value2, void 0);
    }));
    this._store.add(autorun((r2) => {
      if (chatEntiteldService.sentimentObs.read(r2).hidden) {
        selectionData.set(void 0, void 0);
      }
    }));
    const hasSessionObs = derived((r2) => {
      observableSignalFromEvent(this, inlineChatSessionService.onDidChangeSessions).read(r2);
      const model = editorObs.model.read(r2);
      return model ? inlineChatSessionService.getSessionByTextModel(model.uri) !== void 0 : false;
    });
    this._store.add(autorun((r2) => {
      if (hasSessionObs.read(r2)) {
        selectionData.set(void 0, void 0);
      }
    }));
    this._store.add(this.#editor.onContextMenu(() => {
      selectionData.set(void 0, void 0);
    }));
    this._store.add(autorun((r2) => {
      if (!editorObs.isFocused.read(r2)) {
        selectionData.set(void 0, void 0);
      }
    }));
    this._store.add(autorun((r2) => {
      const sel = selectionData.read(r2);
      const mode = affordance.read(r2);
      ctxAffordanceVisible.set(sel !== void 0 && mode === "editor");
    }));
    const editorAffordance = this.#instantiationService.createInstance(
      InlineChatAffordanceWidget,
      this.#editor,
      derived((r2) => affordance.read(r2) === "editor" ? selectionData.read(r2) : void 0)
    );
    this._store.add(editorAffordance);
    this._store.add(editorAffordance.onDidRunAction((commandId) => {
      if (affordanceId) {
        telemetryService.publicLog2("inlineChatAffordance/selected", { mode: affordance.get(), id: affordanceId, commandId });
      }
    }));
    this._store.add(autorun((r2) => {
      const mode = affordance.read(r2);
      const hideWithSelection = mode === "editor";
      const controller = CodeActionController.get(this.#editor);
      if (controller) {
        controller.onlyLightBulbWithEmptySelection = hideWithSelection;
      }
    }));
  }
  dismiss() {
    this.#selectionData.set(void 0, void 0);
  }
};

InlineChatAffordance = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IChatEntitlementService),
  __decorateParam(4, IInlineChatSessionService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, IContextKeyService)
], InlineChatAffordance);
export { InlineChatAffordance };
