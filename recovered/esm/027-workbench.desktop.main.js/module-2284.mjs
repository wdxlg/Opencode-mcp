// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatExtensionsContentPart.ts
import { Disposable } from "./module-0012.mjs";
import { $, append } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { ExtensionsList, getExtensions2 } from "./module-2283.mjs";
import { ChatViewId } from "./module-0981.mjs";
import { Event2 } from "./module-0017.mjs";
import { PagedModel } from "./module-2282.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatExtensionsContentPart.ts
var ChatExtensionsContentPart = class extends Disposable {
  constructor(extensionsContent, extensionsWorkbenchService, instantiationService) {
    super();
    this.extensionsContent = extensionsContent;
    this.domNode = $(".chat-extensions-content-part");
    const loadingElement = append(this.domNode, $(".loading-extensions-element"));
    append(loadingElement, $(ThemeIcon.asCSSSelector(ThemeIcon.modify(Codicon.loadingCompact, "spin"))), $("span.loading-message", void 0, localize(11901, null)));
    const extensionsList = append(this.domNode, $(".extensions-list"));
    const list2 = this._register(instantiationService.createInstance(ExtensionsList, extensionsList, ChatViewId, { alwaysConsumeMouseWheel: false }, { onFocus: Event2.None, onBlur: Event2.None, filters: {} }));
    getExtensions2(extensionsContent.extensions, extensionsWorkbenchService).then((extensions) => {
      loadingElement.remove();
      if (this._store.isDisposed) {
        return;
      }
      list2.setModel(new PagedModel(extensions));
      list2.layout();
    });
  }
  get codeblocks() {
    return [];
  }
  get codeblocksPartId() {
    return void 0;
  }
  hasSameContent(other, followingContent, element) {
    return other.kind === "extensions" && other.extensions.length === this.extensionsContent.extensions.length && other.extensions.every((ext) => this.extensionsContent.extensions.includes(ext));
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatExtensionsContentPart = __decorateClass([
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IInstantiationService)
], ChatExtensionsContentPart);
export { ChatExtensionsContentPart };
