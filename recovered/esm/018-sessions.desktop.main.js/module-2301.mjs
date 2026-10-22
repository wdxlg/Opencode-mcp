// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatToolInputOutputContentPart.ts
import { Disposable } from "./module-0012.mjs";
import { $, DisposableResizeObserver, EventType, addDisposableListener, getContentWidth, h } from "./module-0075.mjs";
import { ChatQueryTitlePart } from "./module-2274.mjs";
import { getChatMarkdownRenderOptions } from "./module-2117.mjs";
import { ButtonWithIcon } from "./module-0546.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { observableValue } from "./module-0048.mjs";
import { autorun } from "./module-0052.mjs";
import { Codicon } from "./module-0085.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { ChatCollapsibleContentPart } from "./module-2116.mjs";
import { ChatToolOutputContentSubPart } from "./module-2300.mjs";
import { URI, isUriComponents } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { CodeBlockPart } from "./module-2253.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatToolInputOutputContentPart.ts
var ChatCollapsibleInputOutputContentPart = class extends Disposable {
  constructor(title, subtitle, progressTooltip, context2, input, output, isError, initiallyExpanded, shimmer, summaryPresentation, contextKeyService, _instantiationService, hoverService, configurationService, openerService) {
    super();
    this.context = context2;
    this.input = input;
    this.output = output;
    this.summaryPresentation = summaryPresentation;
    this.contextKeyService = contextKeyService;
    this._instantiationService = _instantiationService;
    this.configurationService = configurationService;
    this.openerService = openerService;
    this._editorReferences = [];
    this._contentInitialized = false;
    const container2 = h(".chat-confirmation-widget-container");
    const titleEl = h(".chat-confirmation-widget-title-inner");
    const elements = h(".chat-confirmation-widget.chat-confirmation-widget-collapsible");
    const contentAnimation = h(".chat-confirmation-widget-message-animation", [
      h(".chat-confirmation-widget-message-animation-inner@inner")
    ]);
    this.domNode = container2.root;
    container2.root.appendChild(elements.root);
    this._titlePart = this._register(_instantiationService.createInstance(
      ChatQueryTitlePart,
      titleEl.root,
      title,
      subtitle
    ));
    this._titlePart.setOptions({ markdownRenderOptions: getChatMarkdownRenderOptions(), renderFileWidgets: true });
    const spacer = document.createElement("span");
    spacer.style.flexGrow = "1";
    const btn = this._register(new ButtonWithIcon(elements.root, {}));
    btn.element.classList.add("chat-confirmation-widget-title", "monaco-text-button");
    btn.labelElement.append(titleEl.root);
    elements.root.appendChild(contentAnimation.root);
    const hoverChevron = $("span.chat-collapsible-hover-chevron.codicon.codicon-chevron-right-compact");
    hoverChevron.setAttribute("aria-hidden", "true");
    btn.element.appendChild(hoverChevron);
    const showCheckmarks = observableConfigValue("accessibility.chat.showCheckmarks" /* ShowChatCheckmarks */, false, this.configurationService);
    const expanded2 = this._expanded = observableValue(this, initiallyExpanded);
    this._register(autorun((r2) => {
      const value2 = expanded2.read(r2);
      const checkmarksEnabled = showCheckmarks.read(r2);
      const isInProgress2 = !output && !isError;
      if (isError) {
        btn.icon = Codicon.errorCompact;
      } else {
        btn.icon = output ? Codicon.checkCompact : ThemeIcon.modify(Codicon.loadingCompact, "spin");
      }
      elements.root.classList.toggle("shimmer-progress", shimmer && isInProgress2);
      container2.root.classList.toggle("show-checkmarks", checkmarksEnabled);
      hoverChevron.classList.toggle("expanded", value2);
      if (value2 && !this._contentInitialized) {
        this._contentInitialized = true;
        const messageContainer = h(".chat-confirmation-widget-message");
        messageContainer.root.appendChild(this.createMessageContents());
        contentAnimation.inner.appendChild(messageContainer.root);
        const resizeObserver = this._register(new DisposableResizeObserver("ChatCollapsibleInputOutputContentPart.message", () => this.layoutToMessageWidth(messageContainer.root)));
        this._register(resizeObserver.observe(messageContainer.root));
        this.layoutToMessageWidth(messageContainer.root);
        contentAnimation.root.getBoundingClientRect();
      }
      elements.root.classList.toggle("collapsed", !value2);
      contentAnimation.inner.inert = !value2;
      btn.element.ariaExpanded = String(value2);
    }));
    const toggle = (e4) => {
      if (!e4.defaultPrevented) {
        const value2 = expanded2.get();
        container2.root.dispatchEvent(new CustomEvent(ChatCollapsibleContentPart.userToggleEvent, { bubbles: true }));
        expanded2.set(!value2, void 0);
        e4.preventDefault();
      }
    };
    this._register(btn.onDidClick(toggle));
    const topLevelResources = this.output?.parts.filter((p) => p.kind === "data").filter((p) => !p.audience || p.audience.includes(1 /* User */));
    if (topLevelResources?.length) {
      const resourceSubPart = this._register(this._instantiationService.createInstance(
        ChatToolOutputContentSubPart,
        this.context,
        topLevelResources
      ));
      const group2 = resourceSubPart.domNode;
      group2.classList.add("chat-collapsible-top-level-resource-group");
      container2.root.appendChild(group2);
      this._register(autorun((r2) => {
        group2.style.display = expanded2.read(r2) ? "none" : "";
      }));
    }
  }
  get codeblocks() {
    const outputCodeblocks = this._outputSubPart?.codeblocks ?? [];
    return outputCodeblocks;
  }
  set title(s) {
    this._titlePart.title = s;
  }
  get title() {
    return this._titlePart.title;
  }
  get expanded() {
    return this._expanded.get();
  }
  createMessageContents() {
    const presentation2 = this.summaryPresentation;
    if (!presentation2?.items?.length) {
      return this.createTechnicalContents();
    }
    const root = $(".chat-tool-summary-presentation");
    const items = $(".chat-tool-summary-items");
    for (const item of presentation2.items) {
      const row = $(".chat-tool-summary-item");
      const label3 = item.resource ? $("a.chat-tool-summary-item-label") : $("span.chat-tool-summary-item-label");
      label3.textContent = item.label;
      if (item.resource) {
        const resource = URI.isUri(item.resource) ? item.resource : isUriComponents(item.resource) ? URI.revive(item.resource) : URI.revive(item.resource.uri);
        label3.href = resource.toString();
        this._register(addDisposableListener(label3, EventType.CLICK, (event) => {
          event.preventDefault();
          void this.openerService.open(resource, { fromUserGesture: true });
        }));
      }
      row.appendChild(label3);
      if (item.description) {
        const description = $("span.chat-tool-summary-item-description");
        description.textContent = item.description;
        row.appendChild(description);
      }
      if (item.added !== void 0 || item.removed !== void 0) {
        const diff4 = $("span.chat-tool-summary-item-diff");
        const added = item.added !== void 0 ? `+${item.added}` : "";
        const removed = item.removed !== void 0 ? `\u2212${item.removed}` : "";
        diff4.textContent = [added, removed].filter(Boolean).join(" ");
        row.appendChild(diff4);
      }
      items.appendChild(row);
    }
    root.appendChild(items);
    return root;
  }
  createTechnicalContents() {
    const contents = h("div", [
      h("h3@inputTitle"),
      h("div@input"),
      h("h3@outputTitle"),
      h("div@output")
    ]);
    const { input, output } = this;
    contents.inputTitle.textContent = localize(12174, null);
    this.addCodeBlock(input, contents.input);
    if (!output) {
      contents.output.remove();
      contents.outputTitle.remove();
    } else {
      contents.outputTitle.textContent = localize(12175, null);
      const outputSubPart = this._register(this._instantiationService.createInstance(
        ChatToolOutputContentSubPart,
        this.context,
        output.parts
      ));
      this._outputSubPart = outputSubPart;
      contents.output.appendChild(outputSubPart.domNode);
    }
    return contents.root;
  }
  addCodeBlock(part, container2) {
    const data = {
      languageId: part.languageId,
      text: part.data,
      codeBlockIndex: part.codeBlockIndex,
      element: this.context.element,
      parentContextKeyService: this.contextKeyService,
      renderOptions: part.options,
      chatSessionResource: this.context.element.sessionResource
    };
    const key3 = CodeBlockPart.poolKey(this.context.element.id, part.codeBlockIndex);
    const editorReference = this._register(this.context.editorPool.get(key3));
    editorReference.object.render(data, this.context.currentWidth.get() || 300);
    container2.appendChild(editorReference.object.element);
    this._editorReferences.push(editorReference);
  }
  layoutToMessageWidth(messageContainer) {
    const width2 = getContentWidth(messageContainer);
    if (width2 <= 0 || width2 === this._lastLayoutWidth) {
      return;
    }
    this._lastLayoutWidth = width2;
    this.layout(width2);
  }
  hasSameContent(other, followingContent, element) {
    return false;
  }
  layout(width2) {
    this._editorReferences.forEach((r2) => r2.object.layout(width2));
    this._outputSubPart?.layout(width2);
  }
};

ChatCollapsibleInputOutputContentPart = __decorateClass([
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IInstantiationService),
  __decorateParam(12, IHoverService),
  __decorateParam(13, IConfigurationService),
  __decorateParam(14, IOpenerService)
], ChatCollapsibleInputOutputContentPart);
export { ChatCollapsibleInputOutputContentPart };
