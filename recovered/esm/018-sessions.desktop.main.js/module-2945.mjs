// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/replaceService.ts
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { Disposable } from "./module-0012.mjs";
import { createTextBufferFactoryFromSnapshot } from "./module-0423.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IReplaceService } from "./module-2814.mjs";
import { ISearchViewModelWorkbenchService } from "./module-2820.mjs";
import { SaveSourceRegistry } from "./module-0926.mjs";
import { localize } from "./module-0001.mjs";
import { CellUri } from "./module-0911.mjs";
import { Promises } from "./module-0036.mjs";
import { isSearchTreeFileMatch, isSearchTreeMatch } from "./module-2519.mjs";
import { dirname2 } from "./module-0034.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Range2 } from "./module-0106.mjs";
import { isIMatchInNotebook } from "./module-2809.mjs";
import { IBulkEditService, ResourceTextEdit } from "./module-0537.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ILabelService } from "./module-0641.mjs";
import { INotebookEditorModelResolverService } from "./module-0928.mjs";


// src/vs/workbench/contrib/search/browser/replaceService.ts
var REPLACE_PREVIEW = "replacePreview";

var toReplaceResource = (fileResource) => {
  return fileResource.with({ scheme: Schemas.internal, fragment: REPLACE_PREVIEW, query: JSON.stringify({ scheme: fileResource.scheme }) });
};

var toFileResource = (replaceResource) => {
  return replaceResource.with({ scheme: JSON.parse(replaceResource.query)["scheme"], fragment: "", query: "" });
};

var ReplacePreviewContentProvider = class {
  constructor(instantiationService, textModelResolverService) {
    this.instantiationService = instantiationService;
    this.textModelResolverService = textModelResolverService;
    this.textModelResolverService.registerTextModelContentProvider(Schemas.internal, this);
  }
  static {
    this.ID = "workbench.contrib.replacePreviewContentProvider";
  }
  provideTextContent(uri4) {
    if (uri4.fragment === REPLACE_PREVIEW) {
      return this.instantiationService.createInstance(ReplacePreviewModel).resolve(uri4);
    }
    return null;
  }
};

ReplacePreviewContentProvider = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ITextModelService)
], ReplacePreviewContentProvider);

var ReplacePreviewModel = class extends Disposable {
  constructor(modelService, languageService, textModelResolverService, replaceService, searchWorkbenchService) {
    super();
    this.modelService = modelService;
    this.languageService = languageService;
    this.textModelResolverService = textModelResolverService;
    this.replaceService = replaceService;
    this.searchWorkbenchService = searchWorkbenchService;
  }
  async resolve(replacePreviewUri) {
    const fileResource = toFileResource(replacePreviewUri);
    const fileMatch = this.searchWorkbenchService.searchModel.searchResult.matches(false).filter((match2) => match2.resource.toString() === fileResource.toString())[0];
    const ref = this._register(await this.textModelResolverService.createModelReference(fileResource));
    const sourceModel = ref.object.textEditorModel;
    const sourceModelLanguageId = sourceModel.getLanguageId();
    const replacePreviewModel = this.modelService.createModel(createTextBufferFactoryFromSnapshot(sourceModel.createSnapshot()), this.languageService.createById(sourceModelLanguageId), replacePreviewUri);
    this._register(fileMatch.onChange(({ forceUpdateModel }) => this.update(sourceModel, replacePreviewModel, fileMatch, forceUpdateModel)));
    this._register(this.searchWorkbenchService.searchModel.onReplaceTermChanged(() => this.update(sourceModel, replacePreviewModel, fileMatch)));
    this._register(fileMatch.onDispose(() => replacePreviewModel.dispose()));
    this._register(replacePreviewModel.onWillDispose(() => this.dispose()));
    this._register(sourceModel.onWillDispose(() => this.dispose()));
    return replacePreviewModel;
  }
  update(sourceModel, replacePreviewModel, fileMatch, override = false) {
    if (!sourceModel.isDisposed() && !replacePreviewModel.isDisposed()) {
      this.replaceService.updateReplacePreview(fileMatch, override);
    }
  }
};

ReplacePreviewModel = __decorateClass([
  __decorateParam(0, IModelService),
  __decorateParam(1, ILanguageService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, IReplaceService),
  __decorateParam(4, ISearchViewModelWorkbenchService)
], ReplacePreviewModel);

var ReplaceService = class {
  constructor(textFileService, editorService, textModelResolverService, bulkEditorService, labelService, notebookEditorModelResolverService) {
    this.textFileService = textFileService;
    this.editorService = editorService;
    this.textModelResolverService = textModelResolverService;
    this.bulkEditorService = bulkEditorService;
    this.labelService = labelService;
    this.notebookEditorModelResolverService = notebookEditorModelResolverService;
  }
  static {
    this.REPLACE_SAVE_SOURCE = SaveSourceRegistry.registerSource("searchReplace.source", localize(18982, null));
  }
  async replace(arg, progress = void 0, resource = null) {
    const edits = this.createEdits(arg, resource);
    await this.bulkEditorService.apply(edits, { progress });
    const rawTextPromises = edits.map(async (e4) => {
      if (e4.resource.scheme === Schemas.vscodeNotebookCell) {
        const notebookResource = CellUri.parse(e4.resource)?.notebook;
        if (notebookResource) {
          let ref;
          try {
            ref = await this.notebookEditorModelResolverService.resolve(notebookResource);
            await ref.object.save({ source: ReplaceService.REPLACE_SAVE_SOURCE });
          } finally {
            ref?.dispose();
          }
        }
        return;
      } else {
        return this.textFileService.files.get(e4.resource)?.save({ source: ReplaceService.REPLACE_SAVE_SOURCE });
      }
    });
    return Promises.settled(rawTextPromises);
  }
  async openReplacePreview(element, preserveFocus, sideBySide, pinned) {
    const fileMatch = isSearchTreeMatch(element) ? element.parent() : element;
    const editor = await this.editorService.openEditor({
      original: { resource: fileMatch.resource },
      modified: { resource: toReplaceResource(fileMatch.resource) },
      label: localize(18981, null, fileMatch.name(), fileMatch.name()),
      description: this.labelService.getUriLabel(dirname2(fileMatch.resource), { relative: true }),
      options: {
        preserveFocus,
        pinned,
        revealIfVisible: true
      }
    });
    const input = editor?.input;
    const disposable = fileMatch.onDispose(() => {
      input?.dispose();
      disposable.dispose();
    });
    await this.updateReplacePreview(fileMatch);
    if (editor) {
      const editorControl = editor.getControl();
      if (isSearchTreeMatch(element) && editorControl) {
        editorControl.revealLineInCenter(element.range().startLineNumber, 1 /* Immediate */);
      }
    }
  }
  async updateReplacePreview(fileMatch, override = false) {
    const replacePreviewUri = toReplaceResource(fileMatch.resource);
    const [sourceModelRef, replaceModelRef] = await Promise.all([this.textModelResolverService.createModelReference(fileMatch.resource), this.textModelResolverService.createModelReference(replacePreviewUri)]);
    const sourceModel = sourceModelRef.object.textEditorModel;
    const replaceModel = replaceModelRef.object.textEditorModel;
    try {
      if (sourceModel && replaceModel) {
        if (override) {
          replaceModel.setValue(sourceModel.getValue());
        } else {
          replaceModel.undo();
        }
        this.applyEditsToPreview(fileMatch, replaceModel);
      }
    } finally {
      sourceModelRef.dispose();
      replaceModelRef.dispose();
    }
  }
  applyEditsToPreview(fileMatch, replaceModel) {
    const resourceEdits = this.createEdits(fileMatch, replaceModel.uri);
    const modelEdits = [];
    for (const resourceEdit of resourceEdits) {
      modelEdits.push(
        EditOperation.replaceMove(
          Range2.lift(resourceEdit.textEdit.range),
          resourceEdit.textEdit.text
        )
      );
    }
    replaceModel.pushEditOperations([], modelEdits.sort((a, b) => Range2.compareRangesUsingStarts(a.range, b.range)), () => []);
  }
  createEdits(arg, resource = null) {
    const edits = [];
    if (isSearchTreeMatch(arg)) {
      if (!arg.isReadonly) {
        if (isIMatchInNotebook(arg)) {
          const match2 = arg;
          edits.push(this.createEdit(match2, match2.replaceString, match2.cell?.uri));
        } else {
          const match2 = arg;
          edits.push(this.createEdit(match2, match2.replaceString, resource));
        }
      }
    }
    if (isSearchTreeFileMatch(arg)) {
      arg = [arg];
    }
    if (arg instanceof Array) {
      arg.forEach((element) => {
        const fileMatch = element;
        if (fileMatch.count() > 0) {
          edits.push(...fileMatch.matches().flatMap(
            (match2) => this.createEdits(match2, resource)
          ));
        }
      });
    }
    return edits;
  }
  createEdit(match2, text2, resource = null) {
    const fileMatch = match2.parent();
    return new ResourceTextEdit(
      resource ?? fileMatch.resource,
      { range: match2.range(), text: text2 },
      void 0,
      void 0
    );
  }
};

ReplaceService = __decorateClass([
  __decorateParam(0, ITextFileService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, IBulkEditService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, INotebookEditorModelResolverService)
], ReplaceService);
export { REPLACE_PREVIEW, toReplaceResource, toFileResource, ReplacePreviewContentProvider, ReplacePreviewModel, ReplaceService };
