// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/untitled/common/untitledTextEditorHandler.ts
import { isEqual2, toLocalResource } from "./module-0034.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { URI } from "./module-0032.mjs";
import { ITextEditorService } from "./module-1561.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IPathService } from "./module-0938.mjs";
import { Disposable } from "./module-0012.mjs";
import { Schemas } from "./module-0033.mjs";
import { NO_TYPE_ID } from "./module-1122.mjs";
import { IWorkingCopyEditorService } from "./module-1396.mjs";
import { IUntitledTextEditorService } from "./module-1125.mjs";


// src/vs/workbench/services/untitled/common/untitledTextEditorHandler.ts
var UntitledTextEditorInputSerializer = class {
  constructor(filesConfigurationService, environmentService, pathService) {
    this.filesConfigurationService = filesConfigurationService;
    this.environmentService = environmentService;
    this.pathService = pathService;
  }
  canSerialize(editorInput) {
    return this.filesConfigurationService.isHotExitEnabled && !editorInput.isDisposed();
  }
  serialize(editorInput) {
    if (!this.canSerialize(editorInput)) {
      return void 0;
    }
    const untitledTextEditorInput = editorInput;
    let resource = untitledTextEditorInput.resource;
    if (untitledTextEditorInput.hasAssociatedFilePath) {
      resource = toLocalResource(resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
    }
    let languageId;
    const languageIdCandidate = untitledTextEditorInput.getLanguageId();
    if (languageIdCandidate !== PLAINTEXT_LANGUAGE_ID) {
      languageId = languageIdCandidate;
    } else if (untitledTextEditorInput.hasLanguageSetExplicitly) {
      languageId = languageIdCandidate;
    }
    const serialized = {
      resourceJSON: resource.toJSON(),
      modeId: languageId,
      encoding: untitledTextEditorInput.getEncoding()
    };
    return JSON.stringify(serialized);
  }
  deserialize(instantiationService, serializedEditorInput) {
    return instantiationService.invokeFunction((accessor) => {
      const deserialized = JSON.parse(serializedEditorInput);
      const resource = URI.revive(deserialized.resourceJSON);
      const languageId = deserialized.modeId;
      const encoding = deserialized.encoding;
      return accessor.get(ITextEditorService).createTextEditor({ resource, languageId, encoding, forceUntitled: true });
    });
  }
};

UntitledTextEditorInputSerializer = __decorateClass([
  __decorateParam(0, IFilesConfigurationService),
  __decorateParam(1, IWorkbenchEnvironmentService),
  __decorateParam(2, IPathService)
], UntitledTextEditorInputSerializer);

var UntitledTextEditorWorkingCopyEditorHandler = class extends Disposable {
  constructor(workingCopyEditorService, environmentService, pathService, textEditorService, untitledTextEditorService) {
    super();
    this.environmentService = environmentService;
    this.pathService = pathService;
    this.textEditorService = textEditorService;
    this.untitledTextEditorService = untitledTextEditorService;
    this._register(workingCopyEditorService.registerHandler(this));
  }
  static {
    this.ID = "workbench.contrib.untitledTextEditorWorkingCopyEditorHandler";
  }
  handles(workingCopy) {
    return workingCopy.resource.scheme === Schemas.untitled && workingCopy.typeId === NO_TYPE_ID;
  }
  isOpen(workingCopy, editor) {
    if (!this.handles(workingCopy)) {
      return false;
    }
    return isEqual2(workingCopy.resource, editor.resource);
  }
  createEditor(workingCopy) {
    let editorInputResource;
    if (this.untitledTextEditorService.isUntitledWithAssociatedResource(workingCopy.resource)) {
      editorInputResource = toLocalResource(workingCopy.resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
    } else {
      editorInputResource = workingCopy.resource;
    }
    return this.textEditorService.createTextEditor({ resource: editorInputResource, forceUntitled: true });
  }
};

UntitledTextEditorWorkingCopyEditorHandler = __decorateClass([
  __decorateParam(0, IWorkingCopyEditorService),
  __decorateParam(1, IWorkbenchEnvironmentService),
  __decorateParam(2, IPathService),
  __decorateParam(3, ITextEditorService),
  __decorateParam(4, IUntitledTextEditorService)
], UntitledTextEditorWorkingCopyEditorHandler);
export { UntitledTextEditorInputSerializer, UntitledTextEditorWorkingCopyEditorHandler };
