// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadEditors.ts
import { DisposableStore, dispose } from "./module-0012.mjs";
import { ExtHostContext } from "./module-0922.mjs";
import { autorun } from "./module-0052.mjs";
import { equals4 } from "./module-0098.mjs";
import { columnToEditorGroup, editorGroupToColumn } from "./module-1079.mjs";
import { constObservable } from "./module-0061.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { isITextModel } from "./module-0117.mjs";
import { Event2 } from "./module-0017.mjs";
import { equals } from "./module-0007.mjs";
import { isTextEditorDiffInformationEqual } from "./module-0156.mjs";
import { URI } from "./module-0032.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { illegalArgument } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IQuickDiffModelService } from "./module-1083.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IWorkingCopyService } from "./module-1073.mjs";


// src/vs/workbench/api/browser/mainThreadEditors.ts
var MainThreadTextEditors = class {
  constructor(_editorLocator, extHostContext, _codeEditorService, _editorService, _editorGroupService, _configurationService, _quickDiffModelService, _uriIdentityService) {
    this._editorLocator = _editorLocator;
    this._codeEditorService = _codeEditorService;
    this._editorService = _editorService;
    this._editorGroupService = _editorGroupService;
    this._configurationService = _configurationService;
    this._quickDiffModelService = _quickDiffModelService;
    this._uriIdentityService = _uriIdentityService;
    this._toDispose = new DisposableStore();
    this._instanceId = String(++MainThreadTextEditors.INSTANCE_COUNT);
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostEditors);
    this._textEditorsListenersMap = /* @__PURE__ */ Object.create(null);
    this._editorPositionData = null;
    this._toDispose.add(this._editorService.onDidVisibleEditorsChange(() => this._updateActiveAndVisibleTextEditors()));
    this._toDispose.add(this._editorGroupService.onDidRemoveGroup(() => this._updateActiveAndVisibleTextEditors()));
    this._toDispose.add(this._editorGroupService.onDidMoveGroup(() => this._updateActiveAndVisibleTextEditors()));
    this._registeredDecorationTypes = /* @__PURE__ */ Object.create(null);
  }
  static {
    this.INSTANCE_COUNT = 0;
  }
  dispose() {
    Object.keys(this._textEditorsListenersMap).forEach((editorId) => {
      dispose(this._textEditorsListenersMap[editorId]);
    });
    this._textEditorsListenersMap = /* @__PURE__ */ Object.create(null);
    this._toDispose.dispose();
    for (const decorationType in this._registeredDecorationTypes) {
      this._codeEditorService.removeDecorationType(decorationType);
    }
    this._registeredDecorationTypes = /* @__PURE__ */ Object.create(null);
  }
  handleTextEditorAdded(textEditor) {
    const id2 = textEditor.getId();
    const toDispose = [];
    toDispose.push(textEditor.onPropertiesChanged((data) => {
      this._proxy.$acceptEditorPropertiesChanged(id2, data);
    }));
    const diffInformationObs = this._getTextEditorDiffInformation(textEditor, toDispose);
    toDispose.push(autorun((reader) => {
      const diffInformation = diffInformationObs.read(reader);
      this._proxy.$acceptEditorDiffInformation(id2, diffInformation);
    }));
    this._textEditorsListenersMap[id2] = toDispose;
  }
  handleTextEditorRemoved(id2) {
    dispose(this._textEditorsListenersMap[id2]);
    delete this._textEditorsListenersMap[id2];
  }
  _updateActiveAndVisibleTextEditors() {
    const editorPositionData = this._getTextEditorPositionData();
    if (!equals4(this._editorPositionData, editorPositionData)) {
      this._editorPositionData = editorPositionData;
      this._proxy.$acceptEditorPositionData(this._editorPositionData);
    }
  }
  _getTextEditorPositionData() {
    const result = /* @__PURE__ */ Object.create(null);
    for (const editorPane of this._editorService.visibleEditorPanes) {
      const id2 = this._editorLocator.findTextEditorIdFor(editorPane);
      if (id2) {
        result[id2] = editorGroupToColumn(this._editorGroupService, editorPane.group);
      }
    }
    return result;
  }
  _getTextEditorDiffInformation(textEditor, toDispose) {
    const codeEditor = textEditor.getCodeEditor();
    if (!codeEditor) {
      return constObservable(void 0);
    }
    const [diffEditor] = this._codeEditorService.listDiffEditors().filter((d) => d.getOriginalEditor().getId() === codeEditor.getId() || d.getModifiedEditor().getId() === codeEditor.getId());
    const editorModelObs = diffEditor ? observableFromEvent(this, diffEditor.onDidChangeModel, () => diffEditor.getModel()) : observableFromEvent(this, codeEditor.onDidChangeModel, () => codeEditor.getModel());
    const editorChangesObs = derived((reader) => {
      const editorModel = editorModelObs.read(reader);
      if (!editorModel) {
        return constObservable(void 0);
      }
      if (isITextModel(editorModel)) {
        const quickDiffModelRef2 = this._quickDiffModelService.createQuickDiffModelReference(editorModel.uri);
        if (!quickDiffModelRef2) {
          return constObservable(void 0);
        }
        toDispose.push(quickDiffModelRef2);
        return observableFromEvent(this, quickDiffModelRef2.object.onDidChange, () => {
          return quickDiffModelRef2.object.getQuickDiffResults().map((result) => ({
            original: result.original,
            modified: result.modified,
            changes: result.changes2
          }));
        });
      }
      const diffAlgorithm = this._configurationService.getValue("diffEditor.diffAlgorithm");
      const quickDiffModelRef = this._quickDiffModelService.createQuickDiffModelReference(editorModel.modified.uri, { algorithm: diffAlgorithm });
      if (!quickDiffModelRef) {
        return constObservable(void 0);
      }
      toDispose.push(quickDiffModelRef);
      return observableFromEvent(Event2.any(quickDiffModelRef.object.onDidChange, diffEditor.onDidUpdateDiff), () => {
        const diffChanges = diffEditor.getDiffComputationResult()?.changes2 ?? [];
        const diffInformation = [{
          original: editorModel.original.uri,
          modified: editorModel.modified.uri,
          changes: diffChanges.map((change) => change)
        }];
        const quickDiffInformation = quickDiffModelRef.object.getQuickDiffResults().filter((result) => result.providerKind !== "primary").map((result) => ({
          original: result.original,
          modified: result.modified,
          changes: result.changes2
        }));
        return diffInformation.concat(quickDiffInformation);
      });
    });
    return derivedOpts({
      owner: this,
      equalsFn: (diff1, diff22) => equals(diff1, diff22, (a, b) => isTextEditorDiffInformationEqual(this._uriIdentityService, a, b))
    }, (reader) => {
      const editorModel = editorModelObs.read(reader);
      const editorChanges = editorChangesObs.read(reader).read(reader);
      if (!editorModel || !editorChanges) {
        return void 0;
      }
      const documentVersion = isITextModel(editorModel) ? editorModel.getVersionId() : editorModel.modified.getVersionId();
      return editorChanges.map((change) => {
        const changes = change.changes.map((change2) => [
          change2.original.startLineNumber,
          change2.original.endLineNumberExclusive,
          change2.modified.startLineNumber,
          change2.modified.endLineNumberExclusive
        ]);
        return {
          documentVersion,
          original: change.original,
          modified: change.modified,
          changes
        };
      });
    });
  }
  // --- from extension host process
  async $tryShowTextDocument(resource, options3) {
    const uri4 = URI.revive(resource);
    const editorOptions = {
      preserveFocus: options3.preserveFocus,
      pinned: options3.pinned,
      selection: options3.selection,
      // preserve pre 1.38 behaviour to not make group active when preserveFocus: true
      // but make sure to restore the editor to fix https://github.com/microsoft/vscode/issues/79633
      activation: options3.preserveFocus ? 2 /* RESTORE */ : void 0,
      override: 1 /* EXCLUSIVE_ONLY */
    };
    const input = {
      resource: uri4,
      options: editorOptions
    };
    const editor = await this._editorService.openEditor(input, columnToEditorGroup(this._editorGroupService, this._configurationService, options3.position));
    if (!editor) {
      return void 0;
    }
    const editorControl = editor.getControl();
    const codeEditor = getCodeEditor(editorControl);
    return codeEditor ? this._editorLocator.getIdOfCodeEditor(codeEditor) : void 0;
  }
  async $tryShowEditor(id2, position2) {
    const mainThreadEditor = this._editorLocator.getEditor(id2);
    if (mainThreadEditor) {
      const model = mainThreadEditor.getModel();
      await this._editorService.openEditor({
        resource: model.uri,
        options: { preserveFocus: false }
      }, columnToEditorGroup(this._editorGroupService, this._configurationService, position2));
      return;
    }
  }
  async $tryHideEditor(id2) {
    const mainThreadEditor = this._editorLocator.getEditor(id2);
    if (mainThreadEditor) {
      const editorPanes = this._editorService.visibleEditorPanes;
      for (const editorPane of editorPanes) {
        if (mainThreadEditor.matches(editorPane)) {
          await editorPane.group.closeEditor(editorPane.input);
          return;
        }
      }
    }
  }
  $trySetSelections(id2, selections) {
    const editor = this._editorLocator.getEditor(id2);
    if (!editor) {
      return Promise.reject(illegalArgument(`TextEditor(${id2})`));
    }
    editor.setSelections(selections);
    return Promise.resolve(void 0);
  }
  $trySetDecorations(id2, key3, ranges) {
    key3 = `${this._instanceId}-${key3}`;
    const editor = this._editorLocator.getEditor(id2);
    if (!editor) {
      return Promise.reject(illegalArgument(`TextEditor(${id2})`));
    }
    editor.setDecorations(key3, ranges);
    return Promise.resolve(void 0);
  }
  $trySetDecorationsFast(id2, key3, ranges) {
    key3 = `${this._instanceId}-${key3}`;
    const editor = this._editorLocator.getEditor(id2);
    if (!editor) {
      return Promise.reject(illegalArgument(`TextEditor(${id2})`));
    }
    editor.setDecorationsFast(key3, ranges);
    return Promise.resolve(void 0);
  }
  $tryRevealRange(id2, range2, revealType) {
    const editor = this._editorLocator.getEditor(id2);
    if (!editor) {
      return Promise.reject(illegalArgument(`TextEditor(${id2})`));
    }
    editor.revealRange(range2, revealType);
    return Promise.resolve();
  }
  $trySetOptions(id2, options3) {
    const editor = this._editorLocator.getEditor(id2);
    if (!editor) {
      return Promise.reject(illegalArgument(`TextEditor(${id2})`));
    }
    editor.setConfiguration(options3);
    return Promise.resolve(void 0);
  }
  $tryApplyEdits(id2, modelVersionId, edits, opts) {
    const editor = this._editorLocator.getEditor(id2);
    if (!editor) {
      return Promise.reject(illegalArgument(`TextEditor(${id2})`));
    }
    return Promise.resolve(editor.applyEdits(modelVersionId, edits, opts));
  }
  $tryInsertSnippet(id2, modelVersionId, template2, ranges, opts) {
    const editor = this._editorLocator.getEditor(id2);
    if (!editor) {
      return Promise.reject(illegalArgument(`TextEditor(${id2})`));
    }
    return Promise.resolve(editor.insertSnippet(modelVersionId, template2, ranges, opts));
  }
  $registerTextEditorDecorationType(extensionId, key3, options3) {
    key3 = `${this._instanceId}-${key3}`;
    this._registeredDecorationTypes[key3] = true;
    this._codeEditorService.registerDecorationType(`exthost-api-${extensionId}`, key3, options3);
  }
  $removeTextEditorDecorationType(key3) {
    key3 = `${this._instanceId}-${key3}`;
    delete this._registeredDecorationTypes[key3];
    this._codeEditorService.removeDecorationType(key3);
  }
  $getDiffInformation(id2) {
    const editor = this._editorLocator.getEditor(id2);
    if (!editor) {
      return Promise.reject(new Error("No such TextEditor"));
    }
    const codeEditor = editor.getCodeEditor();
    if (!codeEditor) {
      return Promise.reject(new Error("No such CodeEditor"));
    }
    const codeEditorId = codeEditor.getId();
    const diffEditors = this._codeEditorService.listDiffEditors();
    const [diffEditor] = diffEditors.filter((d) => d.getOriginalEditor().getId() === codeEditorId || d.getModifiedEditor().getId() === codeEditorId);
    if (diffEditor) {
      return Promise.resolve(diffEditor.getLineChanges() || []);
    }
    if (!codeEditor.hasModel()) {
      return Promise.resolve([]);
    }
    const quickDiffModelRef = this._quickDiffModelService.createQuickDiffModelReference(codeEditor.getModel().uri);
    if (!quickDiffModelRef) {
      return Promise.resolve([]);
    }
    try {
      const primaryQuickDiff = quickDiffModelRef.object.quickDiffs.find((quickDiff) => quickDiff.kind === "primary");
      const primaryQuickDiffChanges = quickDiffModelRef.object.changes.filter((change) => change.providerId === primaryQuickDiff?.id);
      return Promise.resolve(primaryQuickDiffChanges.map((change) => change.change) ?? []);
    } finally {
      quickDiffModelRef.dispose();
    }
  }
};

MainThreadTextEditors = __decorateClass([
  __decorateParam(2, ICodeEditorService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IEditorGroupsService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IQuickDiffModelService),
  __decorateParam(7, IUriIdentityService)
], MainThreadTextEditors);

CommandsRegistry.registerCommand("_workbench.revertAllDirty", async function(accessor) {
  const environmentService = accessor.get(IEnvironmentService);
  if (!environmentService.extensionTestsLocationURI) {
    throw new Error("Command is only available when running extension tests.");
  }
  const workingCopyService = accessor.get(IWorkingCopyService);
  for (const workingCopy of workingCopyService.dirtyWorkingCopies) {
    await workingCopy.revert({ soft: true });
  }
});
export { MainThreadTextEditors };
