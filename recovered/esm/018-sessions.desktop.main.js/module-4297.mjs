// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackAttachmentWidget.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { truncate } from "./module-0030.mjs";
import { localize } from "./module-0001.mjs";
import { AgentFeedbackContextView } from "./module-4296.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackAttachmentWidget.ts
var AgentFeedbackAttachmentWidget = class extends Disposable {
  constructor(_attachment, options3, container2, _instantiationService, _agentFeedbackService) {
    super();
    this._attachment = _attachment;
    this._instantiationService = _instantiationService;
    this._agentFeedbackService = _agentFeedbackService;
    this._onDidDelete = this._store.add(new Emitter());
    this.onDidDelete = this._onDidDelete.event;
    this._onDidOpen = this._store.add(new Emitter());
    this.onDidOpen = this._onDidOpen.event;
    this.element = append(container2, $(".chat-attached-context-attachment.agent-feedback-attachment"));
    this.element.tabIndex = 0;
    this.element.role = "button";
    const singleFeedback = this._attachment.feedbackItems.length === 1 ? this._attachment.feedbackItems[0] : void 0;
    if (this._attachment.feedbackItems.length > 1) {
      this.element.ariaHasPopup = "tree";
      this.element.ariaExpanded = "false";
    }
    const iconSpan = $("span");
    iconSpan.classList.add(...ThemeIcon.asClassNameArray(Codicon.comment));
    iconSpan.ariaHidden = "true";
    const pillIcon = $("div.chat-attached-context-pill", {}, iconSpan);
    this.element.appendChild(pillIcon);
    const attachmentLabel = singleFeedback ? truncate(singleFeedback.text, 25) : this._attachment.name;
    const label3 = $("span.chat-attached-context-custom-text", {}, attachmentLabel);
    this.element.appendChild(label3);
    const deletionCurrentlyNotSupported = true;
    if (options3.supportsDeletion && !deletionCurrentlyNotSupported) {
      const clearBtn = append(this.element, $(".chat-attached-context-clear-button"));
      const clearIcon3 = $("span");
      clearIcon3.classList.add(...ThemeIcon.asClassNameArray(Codicon.closeCompact));
      clearBtn.appendChild(clearIcon3);
      clearBtn.title = localize(4040, null);
      this._store.add(addDisposableListener(clearBtn, EventType.CLICK, (e4) => {
        e4.preventDefault();
        e4.stopPropagation();
        this._onDidDelete.fire(e4);
      }));
      if (options3.shouldFocusClearButton) {
        clearBtn.focus();
      }
    }
    this.element.ariaLabel = localize(4039, null, this._attachment.name);
    this._store.add(addDisposableListener(this.element, EventType.CLICK, (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      this._activateAttachment();
    }));
    this._store.add(addDisposableListener(this.element, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        e4.stopPropagation();
        this._activateAttachment();
      }
    }));
    this._contextView = this._store.add(this._instantiationService.createInstance(AgentFeedbackContextView, this.element, this._attachment, options3.supportsDeletion));
  }
  _activateAttachment() {
    const feedbackItems = this._attachment.feedbackItems;
    if (feedbackItems.length === 0) {
      return;
    }
    if (feedbackItems.length === 1) {
      void this._agentFeedbackService.revealFeedback(this._attachment.sessionResource, feedbackItems[0].id);
      return;
    }
    this._contextView.toggle();
  }
};

AgentFeedbackAttachmentWidget = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IAgentFeedbackService)
], AgentFeedbackAttachmentWidget);
export { AgentFeedbackAttachmentWidget };
