// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/replNotebook/browser/replEditorInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { NotebookEditorInput } from "./module-0939.mjs";
import { NotebookSetting } from "./module-0909.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookService } from "./module-0926.mjs";
import { INotebookEditorModelResolverService } from "./module-0927.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IFileService } from "./module-0269.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { ICustomEditorLabelService } from "./module-0931.mjs";
import { IInteractiveHistoryService } from "./module-1128.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IPathService } from "./module-0938.mjs";


// src/vs/workbench/contrib/replNotebook/browser/replEditorInput.ts
var replTabIcon = registerIcon("repl-editor-label-icon", Codicon.debugLineByLine, localize(18713, null));

var ReplEditorInput = class extends NotebookEditorInput {
  constructor(resource, label3, _notebookService, _notebookModelResolverService, _fileDialogService, labelService, fileService, filesConfigurationService, extensionService, editorService, textResourceConfigurationService, customEditorLabelService, historyService, _textModelService, configurationService, environmentService, pathService) {
    super(resource, void 0, "jupyter-notebook", {}, _notebookService, _notebookModelResolverService, _fileDialogService, labelService, fileService, filesConfigurationService, extensionService, editorService, textResourceConfigurationService, customEditorLabelService, environmentService, pathService);
    this.historyService = historyService;
    this._textModelService = _textModelService;
    this.isDisposing = false;
    this.isScratchpad = resource.scheme === "untitled" && configurationService.getValue(NotebookSetting.InteractiveWindowPromptToSave) !== true;
    this.label = label3 ?? this.createEditorLabel(resource);
  }
  static {
    this.ID = "workbench.editorinputs.replEditorInput";
  }
  getIcon() {
    return replTabIcon;
  }
  createEditorLabel(resource) {
    if (!resource) {
      return "REPL";
    }
    if (resource.scheme === "untitled") {
      const match2 = new RegExp("Untitled-(\\d+).").exec(resource.path);
      if (match2?.length === 2) {
        return `REPL - ${match2[1]}`;
      }
    }
    const filename = resource.path.split("/").pop();
    return filename ? `REPL - ${filename}` : "REPL";
  }
  get typeId() {
    return ReplEditorInput.ID;
  }
  get editorId() {
    return "repl";
  }
  getName() {
    return this.label;
  }
  get editorInputs() {
    return [this];
  }
  get capabilities() {
    const capabilities = super.capabilities;
    const scratchPad = this.isScratchpad ? 512 /* Scratchpad */ : 0;
    return capabilities | 2 /* Readonly */ | scratchPad;
  }
  async resolve() {
    const model = await super.resolve();
    if (model) {
      this.ensureInputBoxCell(model.notebook);
    }
    return model;
  }
  ensureInputBoxCell(notebook) {
    const lastCell = notebook.cells[notebook.cells.length - 1];
    if (!lastCell || lastCell.cellKind === 1 /* Markup */ || lastCell.outputs.length > 0 || lastCell.internalMetadata.executionOrder !== void 0) {
      notebook.applyEdits([
        {
          editType: 1 /* Replace */,
          index: notebook.cells.length,
          count: 0,
          cells: [
            {
              cellKind: 2 /* Code */,
              language: "python",
              mime: void 0,
              outputs: [],
              source: ""
            }
          ]
        }
      ], true, void 0, () => void 0, void 0, false);
    }
  }
  async resolveInput(notebook) {
    if (this.inputModelRef) {
      return this.inputModelRef.object.textEditorModel;
    }
    const lastCell = notebook.cells[notebook.cells.length - 1];
    if (!lastCell) {
      throw new Error("The REPL editor requires at least one cell for the input box.");
    }
    this.inputModelRef = await this._textModelService.createModelReference(lastCell.uri);
    return this.inputModelRef.object.textEditorModel;
  }
  dispose() {
    if (!this.isDisposing) {
      this.isDisposing = true;
      this.editorModelReference?.object.revert({ soft: true });
      this.inputModelRef?.dispose();
      super.dispose();
    }
  }
};

ReplEditorInput = __decorateClass([
  __decorateParam(2, INotebookService),
  __decorateParam(3, INotebookEditorModelResolverService),
  __decorateParam(4, IFileDialogService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IFilesConfigurationService),
  __decorateParam(8, IExtensionService),
  __decorateParam(9, IEditorService),
  __decorateParam(10, ITextResourceConfigurationService),
  __decorateParam(11, ICustomEditorLabelService),
  __decorateParam(12, IInteractiveHistoryService),
  __decorateParam(13, ITextModelService),
  __decorateParam(14, IConfigurationService),
  __decorateParam(15, IWorkbenchEnvironmentService),
  __decorateParam(16, IPathService)
], ReplEditorInput);
export { replTabIcon, ReplEditorInput };
