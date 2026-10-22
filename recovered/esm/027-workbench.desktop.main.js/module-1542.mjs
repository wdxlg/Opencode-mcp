// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/common/files.ts
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { InputFocusedContextKey } from "./module-0635.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";


// src/vs/workbench/contrib/files/common/files.ts
var VIEWLET_ID5 = "workbench.view.explorer";

var VIEW_ID2 = "workbench.explorer.fileView";

var ExplorerViewletVisibleContext = new RawContextKey("explorerViewletVisible", true, { type: "boolean", description: localize(16054, null) });

var FoldersViewVisibleContext = new RawContextKey("foldersViewVisible", true, { type: "boolean", description: localize(16056, null) });

var ExplorerFolderContext = new RawContextKey("explorerResourceIsFolder", false, { type: "boolean", description: localize(16045, null) });

var ExplorerResourceReadonlyContext = new RawContextKey("explorerResourceReadonly", false, { type: "boolean", description: localize(16049, null) });

var ExplorerResourceWritableContext = ExplorerResourceReadonlyContext.toNegated();

var ExplorerResourceParentReadOnlyContext = new RawContextKey("explorerResourceParentReadonly", false, { type: "boolean", description: localize(16048, null) });

var ExplorerResourceAvailableEditorIdsContext = new RawContextKey("explorerResourceAvailableEditorIds", "");

var ExplorerRootContext = new RawContextKey("explorerResourceIsRoot", false, { type: "boolean", description: localize(16046, null) });

var ExplorerResourceCut = new RawContextKey("explorerResourceCut", false, { type: "boolean", description: localize(16044, null) });

var ExplorerResourceMoveableToTrash = new RawContextKey("explorerResourceMoveableToTrash", false, { type: "boolean", description: localize(16047, null) });

var FilesExplorerFocusedContext = new RawContextKey("filesExplorerFocus", true, { type: "boolean", description: localize(16055, null) });

var OpenEditorsFocusedContext = new RawContextKey("openEditorsFocus", true, { type: "boolean", description: localize(16057, null) });

var ExplorerFocusedContext = new RawContextKey("explorerViewletFocus", true, { type: "boolean", description: localize(16053, null) });

var ExplorerFindProviderActive = new RawContextKey("explorerFindProviderActive", false, { type: "boolean", description: localize(16043, null) });

var ExplorerCompressedFocusContext = new RawContextKey("explorerViewletCompressedFocus", true, { type: "boolean", description: localize(16051, null) });

var ExplorerCompressedFirstFocusContext = new RawContextKey("explorerViewletCompressedFirstFocus", true, { type: "boolean", description: localize(16050, null) });

var ExplorerCompressedLastFocusContext = new RawContextKey("explorerViewletCompressedLastFocus", true, { type: "boolean", description: localize(16052, null) });

var ViewHasSomeCollapsibleRootItemContext = new RawContextKey("viewHasSomeCollapsibleItem", false, { type: "boolean", description: localize(16058, null) });

var FilesExplorerFocusCondition = ContextKeyExpr.and(FoldersViewVisibleContext, FilesExplorerFocusedContext, ContextKeyExpr.not(InputFocusedContextKey));

var ExplorerFocusCondition = ContextKeyExpr.and(FoldersViewVisibleContext, ExplorerFocusedContext, ContextKeyExpr.not(InputFocusedContextKey));

var TEXT_FILE_EDITOR_ID = "workbench.editors.files.textFileEditor";

var FILE_EDITOR_INPUT_ID = "workbench.editors.files.fileEditorInput";

var BINARY_FILE_EDITOR_ID = "workbench.editors.files.binaryFileEditor";

var BINARY_TEXT_FILE_MODE = "code-text-binary";

var TextFileContentProvider = class extends Disposable {
  constructor(textFileService, fileService, languageService, modelService) {
    super();
    this.textFileService = textFileService;
    this.fileService = fileService;
    this.languageService = languageService;
    this.modelService = modelService;
    this.fileWatcherDisposable = this._register(new MutableDisposable());
  }
  static async open(resource, scheme, label3, editorService, options3) {
    await editorService.openEditor({
      original: { resource: TextFileContentProvider.resourceToTextFile(scheme, resource) },
      modified: { resource },
      label: label3,
      options: options3
    });
  }
  static resourceToTextFile(scheme, resource) {
    return resource.with({ scheme, query: JSON.stringify({ scheme: resource.scheme, query: resource.query }) });
  }
  static textFileToResource(resource) {
    const { scheme, query } = JSON.parse(resource.query);
    return resource.with({ scheme, query });
  }
  async provideTextContent(resource) {
    if (!resource.query) {
      return null;
    }
    const savedFileResource = TextFileContentProvider.textFileToResource(resource);
    const codeEditorModel = await this.resolveEditorModel(resource);
    if (!this.fileWatcherDisposable.value) {
      const disposables = new DisposableStore();
      this.fileWatcherDisposable.value = disposables;
      disposables.add(this.fileService.onDidFilesChange((changes) => {
        if (changes.contains(savedFileResource, 0 /* UPDATED */)) {
          this.resolveEditorModel(
            resource,
            false
            /* do not create if missing */
          );
        }
      }));
      if (codeEditorModel) {
        disposables.add(Event2.once(codeEditorModel.onWillDispose)(() => this.fileWatcherDisposable.clear()));
      }
    }
    return codeEditorModel;
  }
  async resolveEditorModel(resource, createAsNeeded = true) {
    const savedFileResource = TextFileContentProvider.textFileToResource(resource);
    const content2 = await this.textFileService.readStream(savedFileResource);
    let codeEditorModel = this.modelService.getModel(resource);
    if (codeEditorModel) {
      this.modelService.updateModel(codeEditorModel, content2.value);
    } else if (createAsNeeded) {
      const textFileModel = this.modelService.getModel(savedFileResource);
      let languageSelector;
      if (textFileModel) {
        languageSelector = this.languageService.createById(textFileModel.getLanguageId());
      } else {
        languageSelector = this.languageService.createByFilepathOrFirstLine(savedFileResource);
      }
      codeEditorModel = this.modelService.createModel(content2.value, languageSelector, resource);
    }
    return codeEditorModel;
  }
};

TextFileContentProvider = __decorateClass([
  __decorateParam(0, ITextFileService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IModelService)
], TextFileContentProvider);

var OpenEditor = class _OpenEditor {
  constructor(_editor, _group) {
    this._editor = _editor;
    this._group = _group;
    this.id = _OpenEditor.COUNTER++;
  }
  static {
    this.COUNTER = 0;
  }
  get editor() {
    return this._editor;
  }
  get group() {
    return this._group;
  }
  get groupId() {
    return this._group.id;
  }
  getId() {
    return `openeditor:${this.groupId}:${this.id}`;
  }
  isPreview() {
    return !this._group.isPinned(this.editor);
  }
  isSticky() {
    return this._group.isSticky(this.editor);
  }
  getResource() {
    return EditorResourceAccessor.getOriginalUri(this.editor, { supportSideBySide: 1 /* PRIMARY */ });
  }
};
export { VIEWLET_ID5, VIEW_ID2, ExplorerViewletVisibleContext, FoldersViewVisibleContext, ExplorerFolderContext, ExplorerResourceReadonlyContext, ExplorerResourceWritableContext, ExplorerResourceParentReadOnlyContext, ExplorerResourceAvailableEditorIdsContext, ExplorerRootContext, ExplorerResourceCut, ExplorerResourceMoveableToTrash, FilesExplorerFocusedContext, OpenEditorsFocusedContext, ExplorerFocusedContext, ExplorerFindProviderActive, ExplorerCompressedFocusContext, ExplorerCompressedFirstFocusContext, ExplorerCompressedLastFocusContext, ViewHasSomeCollapsibleRootItemContext, FilesExplorerFocusCondition, ExplorerFocusCondition, TEXT_FILE_EDITOR_ID, FILE_EDITOR_INPUT_ID, BINARY_FILE_EDITOR_ID, BINARY_TEXT_FILE_MODE, TextFileContentProvider, OpenEditor };
