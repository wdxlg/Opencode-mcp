// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/editors/fileEditorHandler.ts
import { isEqual2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { ITextEditorService } from "./module-1561.mjs";
import { Disposable } from "./module-0012.mjs";
import { NO_TYPE_ID } from "./module-1122.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkingCopyEditorService } from "./module-1396.mjs";
import { IFileService } from "./module-0269.mjs";


// src/vs/workbench/contrib/files/browser/editors/fileEditorHandler.ts
var FileEditorInputSerializer = class {
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    const fileEditorInput = editorInput;
    const resource = fileEditorInput.resource;
    const preferredResource = fileEditorInput.preferredResource;
    const serializedFileEditorInput = {
      resourceJSON: resource.toJSON(),
      preferredResourceJSON: isEqual2(resource, preferredResource) ? void 0 : preferredResource,
      // only storing preferredResource if it differs from the resource
      name: fileEditorInput.getPreferredName(),
      description: fileEditorInput.getPreferredDescription(),
      encoding: fileEditorInput.getEncoding(),
      modeId: fileEditorInput.getPreferredLanguageId()
      // only using the preferred user associated language here if available to not store redundant data
    };
    return JSON.stringify(serializedFileEditorInput);
  }
  deserialize(instantiationService, serializedEditorInput) {
    return instantiationService.invokeFunction((accessor) => {
      const serializedFileEditorInput = JSON.parse(serializedEditorInput);
      const resource = URI.revive(serializedFileEditorInput.resourceJSON);
      const preferredResource = URI.revive(serializedFileEditorInput.preferredResourceJSON);
      const name = serializedFileEditorInput.name;
      const description = serializedFileEditorInput.description;
      const encoding = serializedFileEditorInput.encoding;
      const languageId = serializedFileEditorInput.modeId;
      const fileEditorInput = accessor.get(ITextEditorService).createTextEditor({ resource, label: name, description, encoding, languageId, forceFile: true });
      if (preferredResource) {
        fileEditorInput.setPreferredResource(preferredResource);
      }
      return fileEditorInput;
    });
  }
};

var FileEditorWorkingCopyEditorHandler = class extends Disposable {
  constructor(workingCopyEditorService, textEditorService, fileService) {
    super();
    this.textEditorService = textEditorService;
    this.fileService = fileService;
    this._register(workingCopyEditorService.registerHandler(this));
  }
  static {
    this.ID = "workbench.contrib.fileEditorWorkingCopyEditorHandler";
  }
  handles(workingCopy) {
    return workingCopy.typeId === NO_TYPE_ID && this.fileService.canHandleResource(workingCopy.resource);
  }
  handlesSync(workingCopy) {
    return workingCopy.typeId === NO_TYPE_ID && this.fileService.hasProvider(workingCopy.resource);
  }
  isOpen(workingCopy, editor) {
    if (!this.handlesSync(workingCopy)) {
      return false;
    }
    return isEqual2(workingCopy.resource, editor.resource);
  }
  createEditor(workingCopy) {
    return this.textEditorService.createTextEditor({ resource: workingCopy.resource, forceFile: true });
  }
};

FileEditorWorkingCopyEditorHandler = __decorateClass([
  __decorateParam(0, IWorkingCopyEditorService),
  __decorateParam(1, ITextEditorService),
  __decorateParam(2, IFileService)
], FileEditorWorkingCopyEditorHandler);
export { FileEditorInputSerializer, FileEditorWorkingCopyEditorHandler };
