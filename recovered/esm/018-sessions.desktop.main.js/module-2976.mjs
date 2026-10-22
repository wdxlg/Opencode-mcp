// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/view/editors/codeEditorView.ts
import { Disposable } from "./module-0012.mjs";
import { h } from "./module-0075.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { DEFAULT_EDITOR_MAX_DIMENSIONS, DEFAULT_EDITOR_MIN_DIMENSIONS } from "./module-1089.mjs";
import { setStyle } from "./module-1139.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { FoldingController } from "./module-0684.mjs";
import { CodeLensContribution } from "./module-0573.mjs";
import { derived } from "./module-0054.mjs";
import { autorun } from "./module-0052.mjs";
import { Selection } from "./module-0107.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/view/editors/codeEditorView.ts
var CodeEditorView = class extends Disposable {
  constructor(instantiationService, viewModel, configurationService) {
    super();
    this.instantiationService = instantiationService;
    this.viewModel = viewModel;
    this.configurationService = configurationService;
    this.model = this.viewModel.map((m) => (
      /** @description model */
      m?.model
    ));
    this.htmlElements = h("div.code-view", [
      h("div.header@header", [
        h("span.title@title"),
        h("span.description@description"),
        h("span.detail@detail"),
        h("span.toolbar@toolbar")
      ]),
      h("div.container", [
        h("div.gutter@gutterDiv"),
        h("div@editor")
      ])
    ]);
    this._onDidViewChange = this._register(new Emitter());
    this.view = {
      element: this.htmlElements.root,
      minimumWidth: DEFAULT_EDITOR_MIN_DIMENSIONS.width,
      maximumWidth: DEFAULT_EDITOR_MAX_DIMENSIONS.width,
      minimumHeight: DEFAULT_EDITOR_MIN_DIMENSIONS.height,
      maximumHeight: DEFAULT_EDITOR_MAX_DIMENSIONS.height,
      onDidChange: this._onDidViewChange.event,
      layout: (width2, height, top2, left) => {
        setStyle(this.htmlElements.root, { width: width2, height, top: top2, left });
        this.editor.layout({
          width: width2 - this.htmlElements.gutterDiv.clientWidth,
          height: height - this.htmlElements.header.clientHeight
        });
      }
      // preferredWidth?: number | undefined;
      // preferredHeight?: number | undefined;
      // priority?: LayoutPriority | undefined;
      // snap?: boolean | undefined;
    };
    this.checkboxesVisible = observableConfigValue("mergeEditor.showCheckboxes", false, this.configurationService);
    this.showDeletionMarkers = observableConfigValue("mergeEditor.showDeletionMarkers", true, this.configurationService);
    this.useSimplifiedDecorations = observableConfigValue("mergeEditor.useSimplifiedDecorations", false, this.configurationService);
    this.editor = this.instantiationService.createInstance(
      CodeEditorWidget,
      this.htmlElements.editor,
      {},
      {
        contributions: this.getEditorContributions()
      }
    );
    this.isFocused = observableFromEvent(
      this,
      Event2.any(this.editor.onDidBlurEditorWidget, this.editor.onDidFocusEditorWidget),
      () => (
        /** @description editor.hasWidgetFocus */
        this.editor.hasWidgetFocus()
      )
    );
    this.cursorPosition = observableFromEvent(
      this,
      this.editor.onDidChangeCursorPosition,
      () => (
        /** @description editor.getPosition */
        this.editor.getPosition()
      )
    );
    this.selection = observableFromEvent(
      this,
      this.editor.onDidChangeCursorSelection,
      () => (
        /** @description editor.getSelections */
        this.editor.getSelections()
      )
    );
    this.cursorLineNumber = this.cursorPosition.map((p) => (
      /** @description cursorPosition.lineNumber */
      p?.lineNumber
    ));
  }
  updateOptions(newOptions) {
    this.editor.updateOptions(newOptions);
  }
  getEditorContributions() {
    return EditorExtensionsRegistry.getEditorContributions().filter((c) => c.id !== FoldingController.ID && c.id !== CodeLensContribution.ID);
  }
};

function createSelectionsAutorun(codeEditorView, translateRange) {
  const selections = derived((reader) => {
    const viewModel = codeEditorView.viewModel.read(reader);
    if (!viewModel) {
      return [];
    }
    const baseRange = viewModel.selectionInBase.read(reader);
    if (!baseRange || baseRange.sourceEditor === codeEditorView) {
      return [];
    }
    return baseRange.rangesInBase.map((r2) => translateRange(r2, viewModel));
  });
  return autorun((reader) => {
    const ranges = selections.read(reader);
    if (ranges.length === 0) {
      return;
    }
    codeEditorView.editor.setSelections(ranges.map((r2) => new Selection(r2.startLineNumber, r2.startColumn, r2.endLineNumber, r2.endColumn)));
  });
}

var TitleMenu = class extends Disposable {
  constructor(menuId, targetHtmlElement, instantiationService) {
    super();
    const toolbar = instantiationService.createInstance(MenuWorkbenchToolBar, targetHtmlElement, menuId, {
      menuOptions: { renderShortTitle: true },
      toolbarOptions: { primaryGroup: (g) => g === "primary" }
    });
    this._store.add(toolbar);
  }
};

TitleMenu = __decorateClass([
  __decorateParam(2, IInstantiationService)
], TitleMenu);
export { createSelectionsAutorun, CodeEditorView, TitleMenu };
