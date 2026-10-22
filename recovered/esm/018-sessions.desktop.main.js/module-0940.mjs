// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/notebookEditorInput.ts
import { AbstractResourceEditorInput } from "./module-0933.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { localize } from "./module-0001.mjs";
import { Schemas } from "./module-0033.mjs";
import { isRelativePattern } from "./module-0857.mjs";
import { isEqual2, toLocalResource } from "./module-0034.mjs";
import { isAbsolute } from "./module-0026.mjs";
import { URI } from "./module-0032.mjs";
import { INotebookService, SimpleNotebookProviderInfo } from "./module-0927.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { isResourceEditorInput } from "./module-0926.mjs";
import { CellUri } from "./module-0911.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookEditorModelResolverService } from "./module-0928.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IFileService } from "./module-0269.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { ICustomEditorLabelService } from "./module-0932.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IPathService } from "./module-0939.mjs";


// src/vs/workbench/contrib/notebook/common/notebookEditorInput.ts
var NotebookEditorInput = class extends AbstractResourceEditorInput {
  constructor(resource, preferredResource, viewType, options3, _notebookService, _notebookModelResolverService, _fileDialogService, labelService, fileService, filesConfigurationService, extensionService, editorService, textResourceConfigurationService, customEditorLabelService, environmentService, pathService) {
    super(resource, preferredResource, labelService, fileService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService);
    this.viewType = viewType;
    this.options = options3;
    this._notebookService = _notebookService;
    this._notebookModelResolverService = _notebookModelResolverService;
    this._fileDialogService = _fileDialogService;
    this.environmentService = environmentService;
    this.pathService = pathService;
    this.editorModelReference = null;
    this._defaultDirtyState = false;
    this._defaultDirtyState = !!options3.startDirty;
    this._sideLoadedListener = _notebookService.onDidAddNotebookDocument((e4) => {
      if (e4.viewType === this.viewType && e4.uri.toString() === this.resource.toString()) {
        this.resolve().catch(onUnexpectedError);
      }
    });
    this._register(extensionService.onWillStop((e4) => {
      if (!e4.auto && !this.isDirty()) {
        return;
      }
      const reason = e4.auto ? localize(17917, null, this.getName()) : localize(17918, null, this.getName());
      e4.veto((async () => {
        const editors = editorService.findEditors(this);
        if (e4.auto) {
          return true;
        }
        if (editors.length > 0) {
          const result = await editorService.save(editors[0]);
          if (result.success) {
            return false;
          }
        }
        return true;
      })(), reason);
    }));
  }
  static getOrCreate(instantiationService, resource, preferredResource, viewType, options3 = {}) {
    const editor = instantiationService.createInstance(NotebookEditorInput, resource, preferredResource, viewType, options3);
    if (preferredResource) {
      editor.setPreferredResource(preferredResource);
    }
    return editor;
  }
  static {
    this.ID = "workbench.input.notebook";
  }
  dispose() {
    this._sideLoadedListener.dispose();
    this.editorModelReference?.dispose();
    this.editorModelReference = null;
    super.dispose();
  }
  get typeId() {
    return NotebookEditorInput.ID;
  }
  get editorId() {
    return this.viewType;
  }
  get capabilities() {
    let capabilities = 0 /* None */;
    if (this.resource.scheme === Schemas.untitled) {
      capabilities |= 4 /* Untitled */;
    }
    if (this.editorModelReference) {
      if (this.editorModelReference.object.isReadonly()) {
        capabilities |= 2 /* Readonly */;
      }
    } else {
      if (this.filesConfigurationService.isReadonly(this.resource)) {
        capabilities |= 2 /* Readonly */;
      }
    }
    if (!(capabilities & 2 /* Readonly */)) {
      capabilities |= 128 /* CanDropIntoEditor */;
    }
    return capabilities;
  }
  getDescription(verbosity = 1 /* MEDIUM */) {
    if (!this.hasCapability(4 /* Untitled */) || this.editorModelReference?.object.hasAssociatedFilePath()) {
      return super.getDescription(verbosity);
    }
    return void 0;
  }
  isReadonly() {
    if (!this.editorModelReference) {
      return this.filesConfigurationService.isReadonly(this.resource);
    }
    return this.editorModelReference.object.isReadonly();
  }
  isDirty() {
    if (!this.editorModelReference) {
      return this._defaultDirtyState;
    }
    return this.editorModelReference.object.isDirty();
  }
  isSaving() {
    const model = this.editorModelReference?.object;
    if (!model || !model.isDirty() || model.hasErrorState || this.hasCapability(4 /* Untitled */)) {
      return false;
    }
    return this.filesConfigurationService.hasShortAutoSaveDelay(this);
  }
  async save(group2, options3) {
    if (this.editorModelReference) {
      if (this.hasCapability(4 /* Untitled */)) {
        return this.saveAs(group2, options3);
      } else {
        await this.editorModelReference.object.save(options3);
      }
      return this;
    }
    return void 0;
  }
  async saveAs(group2, options3) {
    if (!this.editorModelReference) {
      return void 0;
    }
    const provider = this._notebookService.getContributedNotebookType(this.viewType);
    if (!provider) {
      return void 0;
    }
    const pathCandidate = this.hasCapability(4 /* Untitled */) ? await this._suggestName(provider) : this.editorModelReference.object.resource;
    let target;
    if (this.editorModelReference.object.hasAssociatedFilePath()) {
      target = pathCandidate;
    } else {
      target = await this._fileDialogService.pickFileToSave(pathCandidate, options3?.availableFileSystems);
      if (!target) {
        return void 0;
      }
    }
    if (!provider.matches(target)) {
      const patterns = provider.selectors.map((pattern) => {
        if (typeof pattern === "string") {
          return pattern;
        }
        if (isRelativePattern(pattern)) {
          return `${pattern} (base ${pattern.base})`;
        }
        if (pattern.exclude) {
          return `${pattern.include} (exclude: ${pattern.exclude})`;
        } else {
          return `${pattern.include}`;
        }
      }).join(", ");
      throw new Error(`File name ${target} is not supported by ${provider.providerDisplayName}.

Please make sure the file name matches following patterns:
${patterns}`);
    }
    return await this.editorModelReference.object.saveAs(target);
  }
  async _suggestName(provider) {
    const resource = await this.ensureAbsolutePath(this.ensureProviderExtension(provider));
    const remoteAuthority = this.environmentService.remoteAuthority;
    return toLocalResource(resource, remoteAuthority, this.pathService.defaultUriScheme);
  }
  async ensureAbsolutePath(resource) {
    if (resource.scheme !== Schemas.untitled || isAbsolute(resource.path)) {
      return resource;
    }
    const defaultFilePath = await this._fileDialogService.defaultFilePath();
    return URI.joinPath(defaultFilePath, resource.path);
  }
  ensureProviderExtension(provider) {
    const firstSelector = provider.selectors[0];
    let selectorStr = firstSelector && typeof firstSelector === "string" ? firstSelector : void 0;
    if (!selectorStr && firstSelector) {
      const include = firstSelector.include;
      if (typeof include === "string") {
        selectorStr = include;
      }
    }
    const resource = this.resource;
    if (selectorStr) {
      const matches2 = /^\*\.([A-Za-z_-]*)$/.exec(selectorStr);
      if (matches2 && matches2.length > 1) {
        const fileExt = matches2[1];
        if (!resource.path.endsWith(fileExt)) {
          return resource.with({ path: resource.path + "." + fileExt });
        }
      }
    }
    return resource;
  }
  // called when users rename a notebook document
  async rename(group2, target) {
    if (this.editorModelReference) {
      return { editor: { resource: target }, options: { override: this.viewType } };
    }
    return void 0;
  }
  async revert(_group, options3) {
    if (this.editorModelReference && this.editorModelReference.object.isDirty()) {
      await this.editorModelReference.object.revert(options3);
    }
  }
  async resolve(_options, perf2) {
    if (!await this._notebookService.canResolve(this.viewType)) {
      return null;
    }
    perf2?.mark("extensionActivated");
    this._sideLoadedListener.dispose();
    if (!this.editorModelReference) {
      const scratchpad = this.capabilities & 512 /* Scratchpad */ ? true : false;
      const ref = await this._notebookModelResolverService.resolve(this.resource, this.viewType, { limits: this.ensureLimits(_options), scratchpad, viewType: this.editorId });
      if (this.editorModelReference) {
        ref.dispose();
        return this.editorModelReference.object;
      }
      this.editorModelReference = ref;
      if (this.isDisposed()) {
        this.editorModelReference.dispose();
        this.editorModelReference = null;
        return null;
      }
      this._register(this.editorModelReference.object.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
      this._register(this.editorModelReference.object.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
      this._register(this.editorModelReference.object.onDidRevertUntitled(() => this.dispose()));
      if (this.editorModelReference.object.isDirty()) {
        this._onDidChangeDirty.fire();
      }
    } else {
      this.editorModelReference.object.load({ limits: this.ensureLimits(_options) });
    }
    if (this.options._backupId) {
      const info = await this._notebookService.withNotebookDataProvider(this.editorModelReference.object.notebook.viewType);
      if (!(info instanceof SimpleNotebookProviderInfo)) {
        throw new Error("CANNOT open file notebook with this provider");
      }
      const data = await info.serializer.dataToNotebook(VSBuffer.fromString(JSON.stringify({ __webview_backup: this.options._backupId })));
      this.editorModelReference.object.notebook.applyEdits([
        {
          editType: 1 /* Replace */,
          index: 0,
          count: this.editorModelReference.object.notebook.length,
          cells: data.cells
        }
      ], true, void 0, () => void 0, void 0, false);
      if (this.options._workingCopy) {
        this.options._backupId = void 0;
        this.options._workingCopy = void 0;
        this.options.startDirty = void 0;
      }
    }
    return this.editorModelReference.object;
  }
  toUntyped() {
    return {
      resource: this.resource,
      options: {
        override: this.viewType
      }
    };
  }
  matches(otherInput) {
    if (super.matches(otherInput)) {
      return true;
    }
    if (otherInput instanceof NotebookEditorInput) {
      return this.viewType === otherInput.viewType && isEqual2(this.resource, otherInput.resource);
    }
    if (isResourceEditorInput(otherInput) && otherInput.resource.scheme === CellUri.scheme) {
      return isEqual2(this.resource, CellUri.parse(otherInput.resource)?.notebook);
    }
    return false;
  }
};

NotebookEditorInput = __decorateClass([
  __decorateParam(4, INotebookService),
  __decorateParam(5, INotebookEditorModelResolverService),
  __decorateParam(6, IFileDialogService),
  __decorateParam(7, ILabelService),
  __decorateParam(8, IFileService),
  __decorateParam(9, IFilesConfigurationService),
  __decorateParam(10, IExtensionService),
  __decorateParam(11, IEditorService),
  __decorateParam(12, ITextResourceConfigurationService),
  __decorateParam(13, ICustomEditorLabelService),
  __decorateParam(14, IWorkbenchEnvironmentService),
  __decorateParam(15, IPathService)
], NotebookEditorInput);

function isCompositeNotebookEditorInput(thing) {
  return !!thing && typeof thing === "object" && Array.isArray(thing.editorInputs) && thing.editorInputs.every((input) => input instanceof NotebookEditorInput);
}

function isNotebookEditorInput(thing) {
  return !!thing && typeof thing === "object" && thing.typeId === NotebookEditorInput.ID;
}
export { isCompositeNotebookEditorInput, isNotebookEditorInput, NotebookEditorInput };
