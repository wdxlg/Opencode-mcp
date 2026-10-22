// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/interactive/browser/interactiveEditorInput.ts
import { EditorInput } from "./module-0928.mjs";
import { NotebookEditorInput } from "./module-0939.mjs";
import { NotebookSetting } from "./module-0909.mjs";
import { basename, extname } from "./module-0026.mjs";
import { Event2 } from "./module-0017.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { isEqual2, joinPath } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IInteractiveDocumentService } from "./module-1127.mjs";
import { IInteractiveHistoryService } from "./module-1128.mjs";
import { INotebookService } from "./module-0926.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/interactive/browser/interactiveEditorInput.ts
var InteractiveEditorInput = class extends EditorInput {
  constructor(resource, inputResource, title, languageId, instantiationService, textModelService, interactiveDocumentService, historyService, _notebookService, _fileDialogService, configurationService) {
    const input = NotebookEditorInput.getOrCreate(instantiationService, resource, void 0, "interactive", {});
    super();
    this._notebookService = _notebookService;
    this._fileDialogService = _fileDialogService;
    this.isScratchpad = configurationService.getValue(NotebookSetting.InteractiveWindowPromptToSave) !== true;
    this._notebookEditorInput = input;
    this._register(this._notebookEditorInput);
    this.name = title ?? InteractiveEditorInput.windowNames[resource.path] ?? basename(resource.path, extname(resource.path));
    this._initLanguage = languageId;
    this._resource = resource;
    this._inputResource = inputResource;
    this._inputResolver = null;
    this._editorModelReference = null;
    this._inputModelRef = null;
    this._textModelService = textModelService;
    this._interactiveDocumentService = interactiveDocumentService;
    this._historyService = historyService;
    this._registerListeners();
  }
  static create(instantiationService, resource, inputResource, title, language2) {
    return instantiationService.createInstance(InteractiveEditorInput, resource, inputResource, title, language2);
  }
  static {
    this.windowNames = {};
  }
  static setName(notebookUri, title) {
    if (title) {
      this.windowNames[notebookUri.path] = title;
    }
  }
  static {
    this.ID = "workbench.input.interactive";
  }
  get editorId() {
    return "interactive";
  }
  get typeId() {
    return InteractiveEditorInput.ID;
  }
  get language() {
    return this._inputModelRef?.object.textEditorModel.getLanguageId() ?? this._initLanguage;
  }
  get notebookEditorInput() {
    return this._notebookEditorInput;
  }
  get editorInputs() {
    return [this._notebookEditorInput];
  }
  get resource() {
    return this._resource;
  }
  get inputResource() {
    return this._inputResource;
  }
  get primary() {
    return this._notebookEditorInput;
  }
  _registerListeners() {
    const oncePrimaryDisposed = Event2.once(this.primary.onWillDispose);
    this._register(oncePrimaryDisposed(() => {
      if (!this.isDisposed()) {
        this.dispose();
      }
    }));
    this._register(this.primary.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
    this._register(this.primary.onDidChangeLabel(() => this._onDidChangeLabel.fire()));
    this._register(this.primary.onDidChangeCapabilities(() => this._onDidChangeCapabilities.fire()));
  }
  get capabilities() {
    const scratchPad = this.isScratchpad ? 512 /* Scratchpad */ : 0;
    return 4 /* Untitled */ | 2 /* Readonly */ | scratchPad;
  }
  async _resolveEditorModel() {
    if (!this._editorModelReference) {
      this._editorModelReference = await this._notebookEditorInput.resolve();
    }
    return this._editorModelReference;
  }
  async resolve() {
    if (this._editorModelReference) {
      return this._editorModelReference;
    }
    if (this._inputResolver) {
      return this._inputResolver;
    }
    this._inputResolver = this._resolveEditorModel();
    return this._inputResolver;
  }
  async resolveInput(language2) {
    if (this._inputModelRef) {
      return this._inputModelRef.object.textEditorModel;
    }
    const resolvedLanguage = language2 ?? this._initLanguage ?? PLAINTEXT_LANGUAGE_ID;
    this._interactiveDocumentService.willCreateInteractiveDocument(this.resource, this.inputResource, resolvedLanguage);
    this._inputModelRef = await this._textModelService.createModelReference(this.inputResource);
    return this._inputModelRef.object.textEditorModel;
  }
  async save(group2, options3) {
    if (this._editorModelReference) {
      if (this.hasCapability(4 /* Untitled */)) {
        return this.saveAs(group2, options3);
      } else {
        await this._editorModelReference.save(options3);
      }
      return this;
    }
    return void 0;
  }
  async saveAs(group2, options3) {
    if (!this._editorModelReference) {
      return void 0;
    }
    const provider = this._notebookService.getContributedNotebookType("interactive");
    if (!provider) {
      return void 0;
    }
    const filename = this.getName() + ".ipynb";
    const pathCandidate = joinPath(await this._fileDialogService.defaultFilePath(), filename);
    const target = await this._fileDialogService.pickFileToSave(pathCandidate, options3?.availableFileSystems);
    if (!target) {
      return void 0;
    }
    const saved = await this._editorModelReference.saveAs(target);
    if (saved && "resource" in saved && saved.resource) {
      this._notebookService.getNotebookTextModel(saved.resource)?.dispose();
    }
    return saved;
  }
  matches(otherInput) {
    if (super.matches(otherInput)) {
      return true;
    }
    if (otherInput instanceof InteractiveEditorInput) {
      return isEqual2(this.resource, otherInput.resource) && isEqual2(this.inputResource, otherInput.inputResource);
    }
    return false;
  }
  getName() {
    return this.name;
  }
  isDirty() {
    if (this.isScratchpad) {
      return false;
    }
    return this._editorModelReference?.isDirty() ?? false;
  }
  isModified() {
    return this._editorModelReference?.isModified() ?? false;
  }
  async revert(_group, options3) {
    if (this._editorModelReference && this._editorModelReference.isDirty()) {
      await this._editorModelReference.revert(options3);
    }
  }
  dispose() {
    this._editorModelReference?.revert({ soft: true });
    this._notebookEditorInput?.dispose();
    this._editorModelReference?.dispose();
    this._editorModelReference = null;
    this._interactiveDocumentService.willRemoveInteractiveDocument(this.resource, this.inputResource);
    this._inputModelRef?.dispose();
    this._inputModelRef = null;
    super.dispose();
  }
  get historyService() {
    return this._historyService;
  }
};

InteractiveEditorInput = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ITextModelService),
  __decorateParam(6, IInteractiveDocumentService),
  __decorateParam(7, IInteractiveHistoryService),
  __decorateParam(8, INotebookService),
  __decorateParam(9, IFileDialogService),
  __decorateParam(10, IConfigurationService)
], InteractiveEditorInput);
export { InteractiveEditorInput };
