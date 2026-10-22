// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatTextEditContentPart.ts
import { $ } from "./module-0075.mjs";
import { createDecorator } from "./module-0077.mjs";
import { Disposable, RefCountedDisposable, toDisposable } from "./module-0012.mjs";
import { assertType } from "./module-0010.mjs";
import { isResponseVM } from "./module-0979.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { createTextBufferFactoryFromSnapshot } from "./module-0423.mjs";
import { Event2 } from "./module-0017.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { generateUuid } from "./module-0190.mjs";
import { DefaultModelSHA1Computer } from "./module-1612.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { TextEdit } from "./module-0164.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IModelService } from "./module-0080.mjs";
import { IChatService } from "./module-0973.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatTextEditContentPart.ts
var $52 = $;

var ICodeCompareModelService = createDecorator("ICodeCompareModelService");

var ChatTextEditContentPart = class extends Disposable {
  constructor(chatTextEdit, context2, rendererOptions, diffEditorPool, currentWidth, codeCompareModelService) {
    super();
    this.codeCompareModelService = codeCompareModelService;
    const element = context2.element;
    assertType(isResponseVM(element));
    if (rendererOptions.renderTextEditsAsSummary?.(chatTextEdit.uri)) {
      if (element.response.value.every((item) => item.kind === "textEditGroup")) {
        this.domNode = $52(".interactive-edits-summary", void 0, !element.isComplete ? "" : element.isCanceled ? localize(12106, null) : localize(12107, null));
      } else {
        this.domNode = $52("div");
      }
    } else {
      const cts = new CancellationTokenSource();
      let isDisposed = false;
      this._register(toDisposable(() => {
        isDisposed = true;
        cts.dispose(true);
      }));
      this.comparePart = this._register(diffEditorPool.get());
      const data = {
        element,
        edit: chatTextEdit,
        diffData: (async () => {
          const ref = await this.codeCompareModelService.createModel(element, chatTextEdit);
          if (isDisposed) {
            ref.dispose();
            return;
          }
          this._register(ref);
          return {
            modified: ref.object.modified.textEditorModel,
            original: ref.object.original.textEditorModel,
            originalSha1: ref.object.originalSha1
          };
        })()
      };
      this.comparePart.object.render(data, currentWidth, cts.token);
      this.domNode = this.comparePart.object.element;
    }
  }
  layout(width2) {
    this.comparePart?.object.layout(width2);
  }
  hasSameContent(other) {
    return other.kind === "textEditGroup";
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatTextEditContentPart = __decorateClass([
  __decorateParam(5, ICodeCompareModelService)
], ChatTextEditContentPart);

var CodeCompareModelService = class {
  constructor(textModelService, modelService, chatService) {
    this.textModelService = textModelService;
    this.modelService = modelService;
    this.chatService = chatService;
  }
  async createModel(element, chatTextEdit) {
    const original = await this.textModelService.createModelReference(chatTextEdit.uri);
    const modified = await this.textModelService.createModelReference(this.modelService.createModel(
      createTextBufferFactoryFromSnapshot(original.object.textEditorModel.createSnapshot()),
      { languageId: original.object.textEditorModel.getLanguageId(), onDidChange: Event2.None },
      URI.from({ scheme: Schemas.vscodeChatCodeBlock, path: chatTextEdit.uri.path, query: generateUuid() }),
      false
    ).uri);
    const d = new RefCountedDisposable(toDisposable(() => {
      original.dispose();
      modified.dispose();
    }));
    let originalSha1 = "";
    if (chatTextEdit.state) {
      originalSha1 = chatTextEdit.state.sha1;
    } else {
      const sha1 = new DefaultModelSHA1Computer();
      if (sha1.canComputeSHA1(original.object.textEditorModel)) {
        originalSha1 = sha1.computeSHA1(original.object.textEditorModel);
        chatTextEdit.state = { sha1: originalSha1, applied: 0 };
      }
    }
    const chatModel = this.chatService.getSession(element.sessionResource);
    const editGroups = [];
    for (const request2 of chatModel.getRequests()) {
      if (!request2.response) {
        continue;
      }
      for (const item of request2.response.response.value) {
        if (item.kind !== "textEditGroup" || item.state?.applied || !isEqual2(item.uri, chatTextEdit.uri)) {
          continue;
        }
        for (const group2 of item.edits) {
          const edits = group2.map(TextEdit.asEditOperation);
          editGroups.push(edits);
        }
      }
      if (request2.response === element.model) {
        break;
      }
    }
    for (const edits of editGroups) {
      modified.object.textEditorModel.pushEditOperations(null, edits, () => null);
    }
    d.acquire();
    setTimeout(() => d.release(), 5e3);
    return {
      object: {
        originalSha1,
        original: original.object,
        modified: modified.object
      },
      dispose() {
        d.release();
      }
    };
  }
};

CodeCompareModelService = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IModelService),
  __decorateParam(2, IChatService)
], CodeCompareModelService);

registerSingleton(ICodeCompareModelService, CodeCompareModelService, 1 /* Delayed */);
export { $52, ICodeCompareModelService, ChatTextEditContentPart, CodeCompareModelService };
