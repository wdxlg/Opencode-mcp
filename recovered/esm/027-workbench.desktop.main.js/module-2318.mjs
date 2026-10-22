// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatRequestOriginPart.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { $, EventType, addDisposableListener, clearNode } from "./module-0075.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { localize } from "./module-0001.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { autorun } from "./module-0052.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0972.mjs";
import { IChatSideChatService } from "./module-2317.mjs";
import { IChatRequestOriginService } from "./module-1189.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatRequestOriginPart.ts
var ChatRequestOriginPart = class extends Disposable {
  constructor(sessionResource, requestOrigin, _chatService, _sideChatService, _requestOriginService, _chatWidgetService, hoverService) {
    super();
    this._chatService = _chatService;
    this._sideChatService = _sideChatService;
    this._requestOriginService = _requestOriginService;
    this._chatWidgetService = _chatWidgetService;
    this._disposeCts = new CancellationTokenSource();
    this._renderVersion = 0;
    this._register(toDisposable(() => this._disposeCts.dispose(true)));
    this.domNode = $(".chat-request-origin.hidden");
    this.domNode.tabIndex = 0;
    this.domNode.setAttribute("role", "button");
    this._register(Gesture.addTarget(this.domNode));
    this._register(hoverService.setupManagedHover(
      getDefaultHoverDelegate("element"),
      this.domNode,
      localize(12056, null)
    ));
    for (const eventType of [EventType.CLICK, EventType2.Tap]) {
      this._register(addDisposableListener(this.domNode, eventType, () => {
        this._open();
      }));
    }
    this._register(addDisposableListener(this.domNode, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if ((event.keyCode === 3 /* Enter */ || event.keyCode === 10 /* Space */) && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        event.stopPropagation();
        this._open();
      }
    }));
    if (requestOrigin) {
      this._openSource = () => this._openRequestOrigin(requestOrigin);
      this._renderRequestOrigin(requestOrigin);
      return;
    }
    this._openSource = () => this._sideChatService.revealSideChatSource(sessionResource);
    const origin = this._sideChatService.observeSideChatOrigin(sessionResource);
    this._register(autorun((reader) => {
      this._renderSideChatOrigin(origin.read(reader));
    }));
  }
  _renderRequestOrigin(origin) {
    switch (origin.kind) {
      case "delegation" /* Delegation */: {
        const isFromAnotherChat = origin.delegationScope === "chat";
        const isFromAnotherSession = origin.delegationScope === "session";
        this._renderContent(
          isFromAnotherChat ? localize(12051, null) : isFromAnotherSession ? localize(12052, null) : localize(12050, null),
          void 0,
          isFromAnotherChat ? localize(12054, null) : isFromAnotherSession ? localize(12055, null) : localize(12053, null)
        );
        break;
      }
    }
  }
  _renderSideChatOrigin(origin) {
    const renderVersion = ++this._renderVersion;
    if (!origin) {
      clearNode(this.domNode);
      this.domNode.classList.add("hidden");
      this.domNode.removeAttribute("aria-label");
      return;
    }
    const title = origin.sourceTitle ?? localize(12059, null);
    let quote;
    let shouldLoadSourceSession = false;
    if (origin.selection) {
      quote = this._normalizeQuote(origin.selection.text);
    } else {
      const sourceSession = this._chatService.getSession(origin.sourceSessionResource);
      if (sourceSession) {
        quote = this._getRequestQuote(sourceSession, origin.sourceTurnId);
      } else {
        shouldLoadSourceSession = true;
      }
    }
    this._renderContent(title, quote);
    if (shouldLoadSourceSession) {
      void this._resolveSourceQuote(origin, title, renderVersion);
    }
  }
  async _resolveSourceQuote(origin, title, renderVersion) {
    try {
      const reference = await this._chatService.acquireOrLoadSession(
        origin.sourceSessionResource,
        "panel" /* Chat */,
        this._disposeCts.token,
        "ChatRequestOriginPart#resolveSourceQuote"
      );
      if (!reference) {
        return;
      }
      try {
        if (this._disposeCts.token.isCancellationRequested || this._store.isDisposed || renderVersion !== this._renderVersion) {
          return;
        }
        const quote = this._getRequestQuote(reference.object, origin.sourceTurnId);
        if (quote && renderVersion === this._renderVersion && !this._store.isDisposed) {
          this._renderContent(title, quote);
        }
      } finally {
        reference.dispose();
      }
    } catch (error) {
      if (!this._disposeCts.token.isCancellationRequested) {
        onUnexpectedError(error);
      }
    }
  }
  _getRequestQuote(sourceSession, sourceTurnId) {
    return this._normalizeQuote(sourceSession.getRequests().find((request2) => request2.id === sourceTurnId)?.message.text);
  }
  _normalizeQuote(text2) {
    const quote = text2?.replace(/\s+/g, " ").trim();
    return quote || void 0;
  }
  _renderContent(title, quote, ariaLabel) {
    clearNode(this.domNode);
    this.domNode.classList.remove("hidden");
    this.domNode.classList.toggle("has-no-quote", !quote);
    this.domNode.classList.toggle("delegation", ariaLabel !== void 0);
    const header2 = $(".chat-request-origin-header");
    const icon2 = $("span.chat-request-origin-icon");
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.reply));
    icon2.setAttribute("aria-hidden", "true");
    const titleElement = $("span.chat-request-origin-title");
    titleElement.textContent = title;
    header2.append(icon2, titleElement);
    this.domNode.appendChild(header2);
    if (quote) {
      const quoteElement = $("span.chat-request-origin-quote");
      quoteElement.textContent = quote;
      this.domNode.appendChild(quoteElement);
      this.domNode.setAttribute("aria-label", localize(
        12057,
        null,
        title,
        quote
      ));
    } else if (ariaLabel) {
      this.domNode.setAttribute("aria-label", ariaLabel);
    } else {
      this.domNode.setAttribute("aria-label", localize(
        12058,
        null,
        title
      ));
    }
  }
  async _openRequestOrigin(origin) {
    if (!await this._requestOriginService.open(origin)) {
      await this._chatWidgetService.openSession(origin.sourceSessionResource);
    }
  }
  _open() {
    void this._openSource?.().catch(onUnexpectedError);
  }
};

ChatRequestOriginPart = __decorateClass([
  __decorateParam(2, IChatService),
  __decorateParam(3, IChatSideChatService),
  __decorateParam(4, IChatRequestOriginService),
  __decorateParam(5, IChatWidgetService),
  __decorateParam(6, IHoverService)
], ChatRequestOriginPart);
export { ChatRequestOriginPart };
