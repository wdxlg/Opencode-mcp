// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/notebookMultiDiffEditorInput.ts
import { NotebookDiffEditorInput } from "./module-1880.mjs";
import { NotebookEditorInput } from "./module-0939.mjs";
import { MultiDiffEditorInput } from "./module-1148.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IMultiDiffSourceResolverService } from "./module-1147.mjs";
import { ITextFileService } from "./module-1063.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/notebookMultiDiffEditorInput.ts
var NotebookMultiDiffEditorScheme = "multi-cell-notebook-diff-editor";

var NotebookMultiDiffEditorInput = class _NotebookMultiDiffEditorInput extends NotebookDiffEditorInput {
  static {
    this.ID = "workbench.input.multiDiffNotebookInput";
  }
  static create(instantiationService, resource, name, description, originalResource, viewType) {
    const original = NotebookEditorInput.getOrCreate(instantiationService, originalResource, void 0, viewType);
    const modified = NotebookEditorInput.getOrCreate(instantiationService, resource, void 0, viewType);
    return instantiationService.createInstance(_NotebookMultiDiffEditorInput, name, description, original, modified, viewType);
  }
};

var NotebookMultiDiffEditorWidgetInput = class extends MultiDiffEditorInput {
  constructor(multiDiffSource, notebookDiffViewModel, _textModelService, _textResourceConfigurationService, _instantiationService, _multiDiffSourceResolverService, _textFileService) {
    super(multiDiffSource, void 0, void 0, true, _textModelService, _textResourceConfigurationService, _instantiationService, _multiDiffSourceResolverService, _textFileService);
    this.notebookDiffViewModel = notebookDiffViewModel;
    this._register(_multiDiffSourceResolverService.registerResolver(this));
  }
  static createInput(notebookDiffViewModel, instantiationService) {
    const multiDiffSource = URI.parse(`${NotebookMultiDiffEditorScheme}:${(/* @__PURE__ */ new Date()).getMilliseconds().toString() + Math.random().toString()}`);
    return instantiationService.createInstance(
      NotebookMultiDiffEditorWidgetInput,
      multiDiffSource,
      notebookDiffViewModel
    );
  }
  canHandleUri(uri5) {
    return uri5.toString() === this.multiDiffSource.toString();
  }
  async resolveDiffSource(_) {
    return { resources: this.notebookDiffViewModel };
  }
};

NotebookMultiDiffEditorWidgetInput = __decorateClass([
  __decorateParam(2, ITextModelService),
  __decorateParam(3, ITextResourceConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IMultiDiffSourceResolverService),
  __decorateParam(6, ITextFileService)
], NotebookMultiDiffEditorWidgetInput);
export { NotebookMultiDiffEditorScheme, NotebookMultiDiffEditorInput, NotebookMultiDiffEditorWidgetInput };
