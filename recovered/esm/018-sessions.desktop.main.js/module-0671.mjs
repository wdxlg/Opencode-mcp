// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorController.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { LocalSelectionTransfer } from "./module-0273.mjs";
import { InlineProgressManager } from "./module-0540.mjs";
import { PostEditWidgetManager } from "./module-0554.mjs";
import { createCancelablePromise, raceCancellation } from "./module-0036.mjs";
import { EditorStateCancellationTokenSource } from "./module-0539.mjs";
import { Range2 } from "./module-0106.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { coalesce } from "./module-0007.mjs";
import { sortEditsByYieldTo } from "./module-0545.mjs";
import { HierarchicalKind } from "./module-0535.mjs";
import { VSDataTransfer } from "./module-0264.mjs";
import { toExternalVSDataTransfer } from "./module-0274.mjs";
import { DraggedTreeItemsIdentifier } from "./module-0669.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ITreeViewsDnDService } from "./module-0670.mjs";


// src/vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorController.ts
var dropAsPreferenceConfig = "editor.dropIntoEditor.preferences";

var changeDropTypeCommandId = "editor.changeDropType";

var dropWidgetVisibleCtx = new RawContextKey("dropWidgetVisible", false, localize(1111, null));

var DropIntoEditorController = class extends Disposable {
  constructor(editor, instantiationService, _configService, _languageFeaturesService, _treeViewsDragAndDropService) {
    super();
    this._configService = _configService;
    this._languageFeaturesService = _languageFeaturesService;
    this._treeViewsDragAndDropService = _treeViewsDragAndDropService;
    this.treeItemsTransfer = LocalSelectionTransfer.getInstance();
    this._dropProgressManager = this._register(instantiationService.createInstance(InlineProgressManager, "dropIntoEditor", editor));
    this._postDropWidgetManager = this._register(instantiationService.createInstance(
      PostEditWidgetManager,
      "dropIntoEditor",
      editor,
      dropWidgetVisibleCtx,
      { id: changeDropTypeCommandId, label: localize(1112, null) },
      () => DropIntoEditorController._configureDefaultAction ? [DropIntoEditorController._configureDefaultAction] : []
    ));
    this._register(editor.onDropIntoEditor((e4) => this.onDropIntoEditor(editor, e4.position, e4.event)));
  }
  static {
    this.ID = "editor.contrib.dropIntoEditorController";
  }
  static get(editor) {
    return editor.getContribution(DropIntoEditorController.ID);
  }
  static setConfigureDefaultAction(action) {
    this._configureDefaultAction = action;
  }
  clearWidgets() {
    this._postDropWidgetManager.clear();
  }
  changeDropType() {
    this._postDropWidgetManager.tryShowSelector();
  }
  async onDropIntoEditor(editor, position2, dragEvent) {
    if (!dragEvent.dataTransfer || !editor.hasModel()) {
      return;
    }
    DropIntoEditorController._currentDropOperation?.cancel();
    editor.focus();
    editor.setPosition(position2);
    const p = createCancelablePromise(async (token) => {
      const disposables = new DisposableStore();
      const tokenSource = disposables.add(new EditorStateCancellationTokenSource(editor, 1 /* Value */, void 0, token));
      try {
        const ourDataTransfer = await this.extractDataTransferData(dragEvent);
        if (ourDataTransfer.size === 0 || tokenSource.token.isCancellationRequested) {
          return;
        }
        const model = editor.getModel();
        if (!model) {
          return;
        }
        const providers2 = this._languageFeaturesService.documentDropEditProvider.ordered(model).filter((provider) => {
          if (!provider.dropMimeTypes) {
            return true;
          }
          return provider.dropMimeTypes.some((mime) => ourDataTransfer.matches(mime));
        });
        const editSession = disposables.add(await this.getDropEdits(providers2, model, position2, ourDataTransfer, tokenSource.token));
        if (tokenSource.token.isCancellationRequested) {
          return;
        }
        if (editSession.edits.length) {
          const activeEditIndex = this.getInitialActiveEditIndex(model, editSession.edits);
          const canShowWidget = editor.getOption(43 /* dropIntoEditor */).showDropSelector === "afterDrop";
          await this._postDropWidgetManager.applyEditAndShowIfNeeded([Range2.fromPositions(position2)], { activeEditIndex, allEdits: editSession.edits }, canShowWidget, async (edit3) => edit3, token);
        }
      } finally {
        disposables.dispose();
        if (DropIntoEditorController._currentDropOperation === p) {
          DropIntoEditorController._currentDropOperation = void 0;
        }
      }
    });
    this._dropProgressManager.showWhile(position2, localize(1110, null), p, { cancel: () => p.cancel() });
    DropIntoEditorController._currentDropOperation = p;
  }
  async getDropEdits(providers2, model, position2, dataTransfer, token) {
    const disposables = new DisposableStore();
    const results = await raceCancellation(Promise.all(providers2.map(async (provider) => {
      try {
        const edits2 = await provider.provideDocumentDropEdits(model, position2, dataTransfer, token);
        if (edits2) {
          disposables.add(edits2);
        }
        return edits2?.edits.map((edit3) => ({ ...edit3, providerId: provider.id }));
      } catch (err) {
        if (!isCancellationError(err)) {
          console.error(err);
        }
        console.error(err);
      }
      return void 0;
    })), token);
    const edits = coalesce(results ?? []).flat();
    return {
      edits: sortEditsByYieldTo(edits),
      dispose: () => disposables.dispose()
    };
  }
  getInitialActiveEditIndex(model, edits) {
    const preferredProviders = this._configService.getValue(dropAsPreferenceConfig, { resource: model.uri });
    for (const config of Array.isArray(preferredProviders) ? preferredProviders : []) {
      const desiredKind = new HierarchicalKind(config);
      const editIndex = edits.findIndex((edit3) => edit3.kind && desiredKind.contains(edit3.kind));
      if (editIndex >= 0) {
        return editIndex;
      }
    }
    return 0;
  }
  async extractDataTransferData(dragEvent) {
    if (!dragEvent.dataTransfer) {
      return new VSDataTransfer();
    }
    const dataTransfer = toExternalVSDataTransfer(dragEvent.dataTransfer);
    if (this.treeItemsTransfer.hasData(DraggedTreeItemsIdentifier.prototype)) {
      const data = this.treeItemsTransfer.getData(DraggedTreeItemsIdentifier.prototype);
      if (Array.isArray(data)) {
        for (const id2 of data) {
          const treeDataTransfer = await this._treeViewsDragAndDropService.removeDragOperationTransfer(id2.identifier);
          if (treeDataTransfer) {
            for (const [type, value2] of treeDataTransfer) {
              dataTransfer.replace(type, value2);
            }
          }
        }
      }
    }
    return dataTransfer;
  }
};

DropIntoEditorController = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ILanguageFeaturesService),
  __decorateParam(4, ITreeViewsDnDService)
], DropIntoEditorController);
export { dropAsPreferenceConfig, changeDropTypeCommandId, dropWidgetVisibleCtx, DropIntoEditorController };
