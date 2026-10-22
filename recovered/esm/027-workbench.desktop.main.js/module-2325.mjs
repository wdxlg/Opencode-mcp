// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatToolOutputContentSubPart.ts
import { Disposable } from "./module-0012.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { $ } from "./module-0075.mjs";
import { ChatResourceGroupWidget } from "./module-2286.mjs";
import { CodeBlockPart } from "./module-2278.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatToolOutputContentSubPart.ts
var ChatToolOutputContentSubPart = class extends Disposable {
  constructor(context2, parts, _instantiationService, contextKeyService, _markdownRendererService) {
    super();
    this.context = context2;
    this.parts = parts;
    this._instantiationService = _instantiationService;
    this.contextKeyService = contextKeyService;
    this._markdownRendererService = _markdownRendererService;
    this._editorReferences = [];
    this.codeblocks = [];
    this.domNode = this.createOutputContents();
  }
  toMdString(value2) {
    if (typeof value2 === "string") {
      return new MarkdownString("").appendText(value2);
    }
    return new MarkdownString(value2.value, { isTrusted: value2.isTrusted });
  }
  createOutputContents() {
    const container3 = $("div");
    for (let i2 = 0; i2 < this.parts.length; i2++) {
      const part = this.parts[i2];
      if (part.kind === "code") {
        const codeParts = [part];
        while (i2 + 1 < this.parts.length) {
          const nextPart = this.parts[i2 + 1];
          if (nextPart.kind !== "code" || nextPart.title) {
            break;
          }
          codeParts.push(nextPart);
          i2++;
        }
        this.addCodeBlock(codeParts, container3);
        continue;
      }
      const group2 = [];
      for (let k = i2; k < this.parts.length; k++) {
        const part2 = this.parts[k];
        if (part2.kind !== "data") {
          break;
        }
        group2.push(part2);
      }
      this.addResourceGroup(group2, container3);
      i2 += group2.length - 1;
    }
    return container3;
  }
  addResourceGroup(parts, container3) {
    const widget = this._register(this._instantiationService.createInstance(ChatResourceGroupWidget, parts, void 0));
    container3.appendChild(widget.domNode);
  }
  addCodeBlock(parts, container3) {
    const firstPart = parts[0];
    if (firstPart.title) {
      const title = $("div.chat-confirmation-widget-title");
      const renderedTitle = this._register(this._markdownRendererService.render(this.toMdString(firstPart.title)));
      title.appendChild(renderedTitle.element);
      container3.appendChild(title);
    }
    const combinedText = parts.map((p) => p.data).join("\n");
    const data = {
      languageId: firstPart.languageId,
      text: combinedText,
      codeBlockIndex: firstPart.codeBlockIndex,
      element: this.context.element,
      parentContextKeyService: this.contextKeyService,
      renderOptions: firstPart.options,
      chatSessionResource: this.context.element.sessionResource
    };
    const key3 = CodeBlockPart.poolKey(this.context.element.id, firstPart.codeBlockIndex);
    const editorReference = this._register(this.context.editorPool.get(key3));
    editorReference.object.render(data, this.context.currentWidth.get());
    container3.appendChild(editorReference.object.element);
    this._editorReferences.push(editorReference);
    this.codeblocks.push({
      ownerMarkdownPartId: firstPart.ownerMarkdownPartId,
      codeBlockIndex: firstPart.codeBlockIndex,
      elementId: this.context.element.id,
      uri: editorReference.object.uri,
      codemapperUri: void 0,
      chatSessionResource: this.context.element.sessionResource,
      focus: () => {
      }
    });
  }
  layout(width2) {
    this._editorReferences.forEach((r2) => r2.object.layout(width2));
  }
};

ChatToolOutputContentSubPart = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IMarkdownRendererService)
], ChatToolOutputContentSubPart);
export { ChatToolOutputContentSubPart };
