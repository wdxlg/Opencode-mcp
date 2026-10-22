// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/mergeEditorInputModel.ts
import { DisposableStore } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { MergeDiffComputer } from "./module-1135.mjs";
import { MergeEditorModel } from "./module-1140.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IModelService } from "./module-0080.mjs";
import { EditorModel } from "./module-1096.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { derived } from "./module-0054.mjs";
import { assertFn } from "./module-0009.mjs";
import { localize } from "./module-0001.mjs";
import { basename2 } from "./module-0034.mjs";
import { severity_default } from "./module-0266.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IEditorService } from "./module-0934.mjs";
import { SaveSourceRegistry } from "./module-0925.mjs";
import { BugIndicatingError, onUnexpectedError } from "./module-0004.mjs";
import { conflictMarkers } from "./module-1131.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { StorageCloseWithConflicts } from "./module-1141.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/mergeEditorInputModel.ts
var TempFileMergeEditorModeFactory = class {
  constructor(_mergeEditorTelemetry, _instantiationService, _textModelService, _modelService) {
    this._mergeEditorTelemetry = _mergeEditorTelemetry;
    this._instantiationService = _instantiationService;
    this._textModelService = _textModelService;
    this._modelService = _modelService;
  }
  async createInputModel(args2) {
    const store = new DisposableStore();
    const [
      base,
      result,
      input1Data,
      input2Data
    ] = await Promise.all([
      this._textModelService.createModelReference(args2.base),
      this._textModelService.createModelReference(args2.result),
      toInputData(args2.input1, this._textModelService, store),
      toInputData(args2.input2, this._textModelService, store)
    ]);
    store.add(base);
    store.add(result);
    const tempResultUri = result.object.textEditorModel.uri.with({ scheme: "merge-result" });
    const temporaryResultModel = this._modelService.createModel(
      "",
      {
        languageId: result.object.textEditorModel.getLanguageId(),
        onDidChange: Event2.None
      },
      tempResultUri
    );
    store.add(temporaryResultModel);
    const mergeDiffComputer = this._instantiationService.createInstance(MergeDiffComputer);
    const model = this._instantiationService.createInstance(
      MergeEditorModel,
      base.object.textEditorModel,
      input1Data,
      input2Data,
      temporaryResultModel,
      mergeDiffComputer,
      {
        resetResult: true
      },
      this._mergeEditorTelemetry
    );
    store.add(model);
    await model.onInitialized;
    return this._instantiationService.createInstance(TempFileMergeEditorInputModel, model, store, result.object, args2.result);
  }
};

TempFileMergeEditorModeFactory = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, IModelService)
], TempFileMergeEditorModeFactory);

var TempFileMergeEditorInputModel = class extends EditorModel {
  constructor(model, disposable, result, resultUri, textFileService, dialogService, editorService) {
    super();
    this.model = model;
    this.disposable = disposable;
    this.result = result;
    this.resultUri = resultUri;
    this.textFileService = textFileService;
    this.dialogService = dialogService;
    this.editorService = editorService;
    this.savedAltVersionId = observableValue(this, this.model.resultTextModel.getAlternativeVersionId());
    this.altVersionId = observableFromEvent(
      this,
      (e) => this.model.resultTextModel.onDidChangeContent(e),
      () => (
        /** @description getAlternativeVersionId */
        this.model.resultTextModel.getAlternativeVersionId()
      )
    );
    this.isDirty = derived(this, (reader) => this.altVersionId.read(reader) !== this.savedAltVersionId.read(reader));
    this.finished = false;
  }
  dispose() {
    this.disposable.dispose();
    super.dispose();
  }
  async accept() {
    const value2 = await this.model.resultTextModel.getValue();
    this.result.textEditorModel.setValue(value2);
    this.savedAltVersionId.set(this.model.resultTextModel.getAlternativeVersionId(), void 0);
    await this.textFileService.save(this.result.textEditorModel.uri);
    this.finished = true;
  }
  async _discard() {
    await this.textFileService.revert(this.model.resultTextModel.uri);
    this.savedAltVersionId.set(this.model.resultTextModel.getAlternativeVersionId(), void 0);
    this.finished = true;
  }
  shouldConfirmClose() {
    return true;
  }
  async confirmClose(inputModels) {
    assertFn(
      () => inputModels.some((m) => m === this)
    );
    const someDirty = inputModels.some((m) => m.isDirty.get());
    let choice;
    if (someDirty) {
      const isMany = inputModels.length > 1;
      const message = isMany ? localize(17267, null, inputModels.length) : localize(17266, null, basename2(inputModels[0].model.resultTextModel.uri));
      const hasUnhandledConflicts = inputModels.some((m) => m.model.hasUnhandledConflicts.get());
      const buttons = [
        {
          label: hasUnhandledConflicts ? localize(17272, null) : localize(17269, null),
          run: () => 0 /* SAVE */
        },
        {
          label: localize(17264, null),
          run: () => 1 /* DONT_SAVE */
        }
      ];
      choice = (await this.dialogService.prompt({
        type: severity_default.Info,
        message,
        detail: hasUnhandledConflicts ? isMany ? localize(17263, null) : localize(17261, null) : isMany ? localize(17262, null) : localize(17260, null),
        buttons,
        cancelButton: {
          run: () => 2 /* CANCEL */
        }
      })).result;
    } else {
      choice = 1 /* DONT_SAVE */;
    }
    if (choice === 0 /* SAVE */) {
      await Promise.all(inputModels.map((m) => m.accept()));
    } else if (choice === 1 /* DONT_SAVE */) {
      await Promise.all(inputModels.map((m) => m._discard()));
    } else {
    }
    return choice;
  }
  async save(options3) {
    if (this.finished) {
      return;
    }
    (async () => {
      const { confirmed } = await this.dialogService.confirm({
        message: localize(
          17271,
          null
        ),
        detail: localize(
          17270,
          null
        ),
        primaryButton: localize(17259, null)
      });
      if (confirmed) {
        await this.accept();
        const editors = this.editorService.findEditors(this.resultUri).filter((e) => e.editor.typeId === "mergeEditor.Input");
        await this.editorService.closeEditors(editors);
      }
    })();
  }
  async revert(options3) {
  }
};

TempFileMergeEditorInputModel = __decorateClass([
  __decorateParam(4, ITextFileService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, IEditorService)
], TempFileMergeEditorInputModel);

var WorkspaceMergeEditorModeFactory = class {
  constructor(_mergeEditorTelemetry, _instantiationService, _textModelService, textFileService, _modelService, _languageService) {
    this._mergeEditorTelemetry = _mergeEditorTelemetry;
    this._instantiationService = _instantiationService;
    this._textModelService = _textModelService;
    this.textFileService = textFileService;
    this._modelService = _modelService;
    this._languageService = _languageService;
  }
  static {
    this.FILE_SAVED_SOURCE = SaveSourceRegistry.registerSource("merge-editor.source", localize(17265, null));
  }
  async createInputModel(args2) {
    const store = new DisposableStore();
    let [
      base,
      result,
      input1Data,
      input2Data
    ] = await Promise.all([
      this._textModelService.createModelReference(args2.base).then((v2) => ({
        object: v2.object.textEditorModel,
        dispose: () => v2.dispose()
      })).catch((e) => {
        onUnexpectedError(e);
        console.error(e);
        return void 0;
      }),
      this._textModelService.createModelReference(args2.result),
      toInputData(args2.input1, this._textModelService, store),
      toInputData(args2.input2, this._textModelService, store)
    ]);
    if (base === void 0) {
      const tm = this._modelService.createModel("", this._languageService.createById(result.object.getLanguageId()));
      base = {
        dispose: () => {
          tm.dispose();
        },
        object: tm
      };
    }
    store.add(base);
    store.add(result);
    const resultTextFileModel = this.textFileService.files.models.find(
      (m) => m.resource.toString() === result.object.textEditorModel.uri.toString()
    );
    if (!resultTextFileModel) {
      throw new BugIndicatingError();
    }
    await resultTextFileModel.save({ source: WorkspaceMergeEditorModeFactory.FILE_SAVED_SOURCE });
    const lines = resultTextFileModel.textEditorModel.getLinesContent();
    const hasConflictMarkers = lines.some((l) => l.startsWith(conflictMarkers.start));
    const resetResult = hasConflictMarkers;
    const mergeDiffComputer = this._instantiationService.createInstance(MergeDiffComputer);
    const model = this._instantiationService.createInstance(
      MergeEditorModel,
      base.object,
      input1Data,
      input2Data,
      result.object.textEditorModel,
      mergeDiffComputer,
      {
        resetResult
      },
      this._mergeEditorTelemetry
    );
    store.add(model);
    await model.onInitialized;
    return this._instantiationService.createInstance(WorkspaceMergeEditorInputModel, model, store, resultTextFileModel, this._mergeEditorTelemetry);
  }
};

WorkspaceMergeEditorModeFactory = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, ITextFileService),
  __decorateParam(4, IModelService),
  __decorateParam(5, ILanguageService)
], WorkspaceMergeEditorModeFactory);

var WorkspaceMergeEditorInputModel = class extends EditorModel {
  constructor(model, disposableStore, resultTextFileModel, telemetry, _dialogService, _storageService) {
    super();
    this.model = model;
    this.disposableStore = disposableStore;
    this.resultTextFileModel = resultTextFileModel;
    this.telemetry = telemetry;
    this._dialogService = _dialogService;
    this._storageService = _storageService;
    this.isDirty = observableFromEvent(
      this,
      Event2.any(this.resultTextFileModel.onDidChangeDirty, this.resultTextFileModel.onDidSaveError),
      () => (
        /** @description isDirty */
        this.resultTextFileModel.isDirty()
      )
    );
    this.reported = false;
    this.dateTimeOpened = /* @__PURE__ */ new Date();
  }
  dispose() {
    this.disposableStore.dispose();
    super.dispose();
    this.reportClose(false);
  }
  reportClose(accepted) {
    if (!this.reported) {
      const remainingConflictCount = this.model.unhandledConflictsCount.get();
      const durationOpenedMs = (/* @__PURE__ */ new Date()).getTime() - this.dateTimeOpened.getTime();
      this.telemetry.reportMergeEditorClosed({
        durationOpenedSecs: durationOpenedMs / 1e3,
        remainingConflictCount,
        accepted,
        conflictCount: this.model.conflictCount,
        combinableConflictCount: this.model.combinableConflictCount,
        conflictsResolvedWithBase: this.model.conflictsResolvedWithBase,
        conflictsResolvedWithInput1: this.model.conflictsResolvedWithInput1,
        conflictsResolvedWithInput2: this.model.conflictsResolvedWithInput2,
        conflictsResolvedWithSmartCombination: this.model.conflictsResolvedWithSmartCombination,
        manuallySolvedConflictCountThatEqualNone: this.model.manuallySolvedConflictCountThatEqualNone,
        manuallySolvedConflictCountThatEqualSmartCombine: this.model.manuallySolvedConflictCountThatEqualSmartCombine,
        manuallySolvedConflictCountThatEqualInput1: this.model.manuallySolvedConflictCountThatEqualInput1,
        manuallySolvedConflictCountThatEqualInput2: this.model.manuallySolvedConflictCountThatEqualInput2,
        manuallySolvedConflictCountThatEqualNoneAndStartedWithBase: this.model.manuallySolvedConflictCountThatEqualNoneAndStartedWithBase,
        manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1: this.model.manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1,
        manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2: this.model.manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2,
        manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart: this.model.manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart,
        manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart: this.model.manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart
      });
      this.reported = true;
    }
  }
  async accept() {
    this.reportClose(true);
    await this.resultTextFileModel.save();
  }
  get resultUri() {
    return this.resultTextFileModel.resource;
  }
  async save(options3) {
    await this.resultTextFileModel.save(options3);
  }
  /**
   * If save resets the dirty state, revert must do so too.
  */
  async revert(options3) {
    await this.resultTextFileModel.revert(options3);
  }
  shouldConfirmClose() {
    return true;
  }
  async confirmClose(inputModels) {
    const isMany = inputModels.length > 1;
    const someDirty = inputModels.some((m) => m.isDirty.get());
    const someUnhandledConflicts = inputModels.some((m) => m.model.hasUnhandledConflicts.get());
    if (someDirty) {
      const message = isMany ? localize(17284, null, inputModels.length) : localize(17282, null, basename2(inputModels[0].resultUri));
      const { result } = await this._dialogService.prompt({
        type: severity_default.Info,
        message,
        detail: someUnhandledConflicts ? isMany ? localize(17279, null) : localize(17276, null) : isMany ? localize(17278, null) : localize(17275, null),
        buttons: [
          {
            label: someUnhandledConflicts ? localize(17287, null) : localize(17286, null),
            run: () => 0 /* SAVE */
          },
          {
            label: localize(17281, null),
            run: () => 1 /* DONT_SAVE */
          }
        ],
        cancelButton: {
          run: () => 2 /* CANCEL */
        }
      });
      return result;
    } else if (someUnhandledConflicts && !this._storageService.getBoolean(StorageCloseWithConflicts, 0 /* PROFILE */, false)) {
      const { confirmed, checkboxChecked } = await this._dialogService.confirm({
        message: isMany ? localize(17285, null, inputModels.length) : localize(17283, null, basename2(inputModels[0].resultUri)),
        detail: someUnhandledConflicts ? isMany ? localize(17280, null) : localize(17277, null) : void 0,
        primaryButton: someUnhandledConflicts ? localize(17274, null) : localize(17273, null),
        checkbox: { label: localize(17268, null) }
      });
      if (checkboxChecked) {
        this._storageService.store(StorageCloseWithConflicts, true, 0 /* PROFILE */, 0 /* USER */);
      }
      return confirmed ? 0 /* SAVE */ : 2 /* CANCEL */;
    } else {
      return 0 /* SAVE */;
    }
  }
};

WorkspaceMergeEditorInputModel = __decorateClass([
  __decorateParam(4, IDialogService),
  __decorateParam(5, IStorageService)
], WorkspaceMergeEditorInputModel);

async function toInputData(data, textModelService, store) {
  const ref = await textModelService.createModelReference(data.uri);
  store.add(ref);
  return {
    textModel: ref.object.textEditorModel,
    title: data.title,
    description: data.description,
    detail: data.detail
  };
}
export { toInputData, TempFileMergeEditorModeFactory, TempFileMergeEditorInputModel, WorkspaceMergeEditorModeFactory, WorkspaceMergeEditorInputModel };
