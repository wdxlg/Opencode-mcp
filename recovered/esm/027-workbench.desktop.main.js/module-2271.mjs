// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatDiffBlockPart.ts
import { EditorModel } from "./module-1096.mjs";
import { Disposable, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { generateUuid } from "./module-0190.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { hashAsync } from "./module-0039.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatDiffBlockPart.ts
function parseUnifiedDiff(diffText) {
  const lines = diffText.split("\n");
  const beforeLines = [];
  const afterLines = [];
  for (const line of lines) {
    if (line.startsWith("- ")) {
      beforeLines.push(line.substring(2));
    } else if (line.startsWith("-")) {
      beforeLines.push(line.substring(1));
    } else if (line.startsWith("+ ")) {
      afterLines.push(line.substring(2));
    } else if (line.startsWith("+")) {
      afterLines.push(line.substring(1));
    } else if (line.startsWith(" ")) {
      const content2 = line.substring(1);
      beforeLines.push(content2);
      afterLines.push(content2);
    } else if (!line.startsWith("@@") && !line.startsWith("---") && !line.startsWith("+++") && !line.startsWith("diff ")) {
      beforeLines.push(line);
      afterLines.push(line);
    }
  }
  return {
    before: beforeLines.join("\n"),
    after: afterLines.join("\n")
  };
}

var SimpleDiffEditorModel = class extends EditorModel {
  constructor(_original, _modified) {
    super();
    this._original = _original;
    this._modified = _modified;
    this.original = this._original.object.textEditorModel;
    this.modified = this._modified.object.textEditorModel;
  }
  dispose() {
    super.dispose();
    this._original.dispose();
    this._modified.dispose();
  }
};

var MarkdownDiffBlockPart = class extends Disposable {
  constructor(data, diffEditorPool, currentWidth, modelService, textModelService, languageService) {
    super();
    this.modelService = modelService;
    this.textModelService = textModelService;
    this.languageService = languageService;
    this.modelRef = this._register(new MutableDisposable());
    this.comparePart = this._register(diffEditorPool.get());
    const originalUri = URI.from({
      scheme: Schemas.vscodeChatCodeBlock,
      path: `/chat-diff-original-${data.codeBlockIndex}-${generateUuid()}`
    });
    const modifiedUri = URI.from({
      scheme: Schemas.vscodeChatCodeBlock,
      path: `/chat-diff-modified-${data.codeBlockIndex}-${generateUuid()}`
    });
    const languageSelection = this.languageService.createById(data.languageId);
    const originalModel = this.modelService.createModel(data.beforeContent, languageSelection, originalUri, false);
    const modifiedModel = this.modelService.createModel(data.afterContent, languageSelection, modifiedUri, false);
    const cts = new CancellationTokenSource();
    let referencesSettled = false;
    let disposeRequested = false;
    let didDisposeModels = false;
    const disposeModels = () => {
      if (didDisposeModels) {
        return;
      }
      didDisposeModels = true;
      originalModel.dispose();
      modifiedModel.dispose();
    };
    this._register(toDisposable(() => {
      disposeRequested = true;
      cts.dispose(true);
      if (referencesSettled) {
        disposeModels();
      }
    }));
    const modelsPromise = Promise.all([
      this.textModelService.createModelReference(originalUri),
      this.textModelService.createModelReference(modifiedUri)
    ]).then(([originalRef, modifiedRef]) => {
      referencesSettled = true;
      const model = new SimpleDiffEditorModel(originalRef, modifiedRef);
      if (disposeRequested) {
        model.dispose();
        disposeModels();
        return void 0;
      }
      return model;
    }, (error) => {
      referencesSettled = true;
      disposeModels();
      if (disposeRequested) {
        return void 0;
      }
      throw error;
    });
    const compareData = {
      element: data.element,
      isReadOnly: data.isReadOnly,
      horizontalPadding: data.horizontalPadding,
      edit: {
        uri: data.codeBlockResource || modifiedUri,
        edits: [],
        kind: "textEditGroup",
        done: true
      },
      diffData: modelsPromise.then(async (model) => {
        if (!model) {
          return void 0;
        }
        this.modelRef.value = model;
        const diffData = {
          original: model.original,
          modified: model.modified,
          originalSha1: await hashAsync(model.original.getValue())
        };
        return diffData;
      })
    };
    this.comparePart.object.render(compareData, currentWidth, cts.token);
    this.element = this.comparePart.object.element;
  }
  layout(width2) {
    this.comparePart.object.layout(width2);
  }
  reset() {
    this.modelRef.clear();
  }
};

MarkdownDiffBlockPart = __decorateClass([
  __decorateParam(3, IModelService),
  __decorateParam(4, ITextModelService),
  __decorateParam(5, ILanguageService)
], MarkdownDiffBlockPart);
export { parseUnifiedDiff, SimpleDiffEditorModel, MarkdownDiffBlockPart };
