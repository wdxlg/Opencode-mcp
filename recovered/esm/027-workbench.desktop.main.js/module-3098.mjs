// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/editors/textFileEditor.ts
import { AbstractTextCodeEditor } from "./module-1550.mjs";
import { BINARY_TEXT_FILE_MODE, TEXT_FILE_EDITOR_ID, VIEWLET_ID5 } from "./module-1542.mjs";
import { localize } from "./module-0001.mjs";
import { mark } from "./module-0506.mjs";
import { BinaryEditorModel } from "./module-1552.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { DEFAULT_EDITOR_ASSOCIATION, createEditorOpenError, createTooLargeFileError, isTextEditorViewState } from "./module-0925.mjs";
import { applyTextEditorOptions } from "./module-1533.mjs";
import { toAction } from "./module-0082.mjs";
import { ByteSize, FileOperationError, IFileService, TooLargeFileOperationError } from "./module-0269.mjs";
import { FileEditorInput } from "./module-2023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { IExplorerService } from "./module-2020.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IPathService } from "./module-0938.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { IHostService } from "./module-1117.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";


// src/vs/workbench/contrib/files/browser/editors/textFileEditor.ts
var TextFileEditor = class extends AbstractTextCodeEditor {
  constructor(group2, telemetryService, fileService, paneCompositeService, instantiationService, contextService, storageService, textResourceConfigurationService, editorService, themeService, editorGroupService, textFileService, explorerService, uriIdentityService, pathService, configurationService, preferencesService, hostService, filesConfigurationService) {
    super(TextFileEditor.ID, group2, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService);
    this.paneCompositeService = paneCompositeService;
    this.contextService = contextService;
    this.textFileService = textFileService;
    this.explorerService = explorerService;
    this.uriIdentityService = uriIdentityService;
    this.pathService = pathService;
    this.configurationService = configurationService;
    this.preferencesService = preferencesService;
    this.hostService = hostService;
    this.filesConfigurationService = filesConfigurationService;
    this._register(this.fileService.onDidFilesChange((e) => this.onDidFilesChange(e)));
    this._register(this.fileService.onDidRunOperation((e) => this.onDidRunOperation(e)));
  }
  static {
    this.ID = TEXT_FILE_EDITOR_ID;
  }
  onDidFilesChange(e) {
    for (const resource of e.rawDeleted) {
      this.clearEditorViewState(resource);
    }
  }
  onDidRunOperation(e) {
    if (e.operation === 2 /* MOVE */ && e.target) {
      this.moveEditorViewState(e.resource, e.target.resource, this.uriIdentityService.extUri);
    }
  }
  getTitle() {
    if (this.input) {
      return this.input.getName();
    }
    return localize(15678, null);
  }
  get input() {
    return this._input;
  }
  async setInput(input, options3, context2, token) {
    mark("code/willSetInputToTextFileEditor");
    await super.setInput(input, options3, context2, token);
    try {
      const resolvedModel = await input.resolve(options3);
      if (token.isCancellationRequested) {
        return;
      }
      if (resolvedModel instanceof BinaryEditorModel) {
        return this.openAsBinary(input, options3);
      }
      const textFileModel = resolvedModel;
      const control = assertReturnsDefined(this.editorControl);
      control.setModel(textFileModel.textEditorModel);
      if (!isTextEditorViewState(options3?.viewState)) {
        const editorViewState = this.loadEditorViewState(input, context2);
        if (editorViewState) {
          if (options3?.selection) {
            editorViewState.cursorState = [];
          }
          control.restoreViewState(editorViewState);
        }
      }
      if (options3) {
        applyTextEditorOptions(options3, control, 1 /* Immediate */);
      }
      control.updateOptions(this.getReadonlyConfiguration(textFileModel.isReadonly()));
      if (control.handleInitialized) {
        control.handleInitialized();
      }
    } catch (error) {
      await this.handleSetInputError(error, input, options3);
    }
    mark("code/didSetInputToTextFileEditor");
  }
  async handleSetInputError(error, input, options3) {
    if (error.textFileOperationResult === 0 /* FILE_IS_BINARY */) {
      return this.openAsBinary(input, options3);
    }
    if (error.fileOperationResult === 0 /* FILE_IS_DIRECTORY */) {
      const actions = [];
      actions.push(toAction({
        id: "workbench.files.action.openFolder",
        label: localize(15676, null),
        run: async () => {
          return this.hostService.openWindow([{ folderUri: input.resource }], { forceNewWindow: true });
        }
      }));
      if (this.contextService.isInsideWorkspace(input.preferredResource)) {
        actions.push(toAction({
          id: "workbench.files.action.reveal",
          label: localize(15677, null),
          run: async () => {
            await this.paneCompositeService.openPaneComposite(VIEWLET_ID5, 0 /* Sidebar */, true);
            return this.explorerService.select(input.preferredResource, true);
          }
        }));
      }
      throw createEditorOpenError(localize(15673, null), actions, { forceMessage: true });
    }
    if (error.fileOperationResult === 7 /* FILE_TOO_LARGE */) {
      let message;
      if (error instanceof TooLargeFileOperationError) {
        message = localize(15675, null, ByteSize.formatSize(error.size));
      } else {
        message = localize(15674, null);
      }
      throw createTooLargeFileError(this.group, input, options3, message, this.preferencesService);
    }
    if (error.fileOperationResult === 1 /* FILE_NOT_FOUND */ && !this.filesConfigurationService.isReadonly(input.preferredResource) && await this.pathService.hasValidBasename(input.preferredResource)) {
      const fileNotFoundError = createEditorOpenError(new FileOperationError(localize(15679, null), 1 /* FILE_NOT_FOUND */), [
        toAction({
          id: "workbench.files.action.createMissingFile",
          label: localize(15672, null),
          run: async () => {
            await this.textFileService.create([{ resource: input.preferredResource }]);
            return this.editorService.openEditor({
              resource: input.preferredResource,
              options: {
                pinned: true
                // new file gets pinned by default
              }
            });
          }
        })
      ], {
        // Support the flow of directly pressing `Enter` on the dialog to
        // create the file on the go. This is nice when for example following
        // a link to a file that does not exist to scaffold it quickly.
        allowDialog: true
      });
      throw fileNotFoundError;
    }
    throw error;
  }
  openAsBinary(input, options3) {
    const defaultBinaryEditor = this.configurationService.getValue("workbench.editor.defaultBinaryEditor");
    const editorOptions2 = {
      ...options3,
      // Make sure to not steal away the currently active group
      // because we are triggering another openEditor() call
      // and do not control the initial intent that resulted
      // in us now opening as binary.
      activation: 3 /* PRESERVE */
    };
    if (defaultBinaryEditor && defaultBinaryEditor !== "" && defaultBinaryEditor !== DEFAULT_EDITOR_ASSOCIATION.id) {
      this.doOpenAsBinaryInDifferentEditor(this.group, defaultBinaryEditor, input, editorOptions2);
    } else {
      this.doOpenAsBinaryInSameEditor(this.group, defaultBinaryEditor, input, editorOptions2);
    }
  }
  doOpenAsBinaryInDifferentEditor(group2, editorId, editor, editorOptions2) {
    this.editorService.replaceEditors([{
      editor,
      replacement: { resource: editor.resource, options: { ...editorOptions2, override: editorId } }
    }], group2);
  }
  doOpenAsBinaryInSameEditor(group2, editorId, editor, editorOptions2) {
    if (editorId === DEFAULT_EDITOR_ASSOCIATION.id) {
      editor.setForceOpenAsText();
      editor.setPreferredLanguageId(BINARY_TEXT_FILE_MODE);
      editorOptions2 = { ...editorOptions2, forceReload: true };
    } else {
      editor.setForceOpenAsBinary();
    }
    group2.openEditor(editor, editorOptions2);
  }
  clearInput() {
    super.clearInput();
    this.editorControl?.setModel(null);
  }
  createEditorControl(parent, initialOptions) {
    mark("code/willCreateTextFileEditorControl");
    super.createEditorControl(parent, initialOptions);
    mark("code/didCreateTextFileEditorControl");
  }
  tracksEditorViewState(input) {
    return input instanceof FileEditorInput;
  }
  tracksDisposedEditorViewState() {
    return true;
  }
};

TextFileEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IPaneCompositePartService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, ITextResourceConfigurationService),
  __decorateParam(8, IEditorService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, IEditorGroupsService),
  __decorateParam(11, ITextFileService),
  __decorateParam(12, IExplorerService),
  __decorateParam(13, IUriIdentityService),
  __decorateParam(14, IPathService),
  __decorateParam(15, IConfigurationService),
  __decorateParam(16, IPreferencesService),
  __decorateParam(17, IHostService),
  __decorateParam(18, IFilesConfigurationService)
], TextFileEditor);
export { TextFileEditor };
