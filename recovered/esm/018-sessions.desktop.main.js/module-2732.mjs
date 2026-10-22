// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/chatViewTitleControl.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { DisposableResizeObserver, EventType, addDisposableListener, getWindow, h } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { AgentSessionsPicker } from "./module-2731.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ActionViewItem } from "./module-0476.mjs";


// src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/chatViewTitleControl.ts
var ChatViewTitleControl = class extends Disposable {
  constructor(container2, delegate, resizeObserverCtor, instantiationService) {
    super();
    this.container = container2;
    this.delegate = delegate;
    this.instantiationService = instantiationService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this.title = void 0;
    this.titleLabel = this._register(new MutableDisposable());
    this.modelDisposables = this._register(new MutableDisposable());
    this.lastKnownHeight = 0;
    this.render(this.container);
    const resizeObserver = this._register(new DisposableResizeObserver("ChatViewTitleControl.height", (entries2) => {
      const entry = entries2.find((entry2) => entry2.target === this.titleContainer);
      if (!entry) {
        return;
      }
      const height = entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height;
      if (height !== this.lastKnownHeight) {
        this.lastKnownHeight = height;
        this._onDidChangeHeight.fire();
      }
    }, getWindow(this.titleContainer), { resizeObserverCtor }));
    this._register(resizeObserver.observe(this.titleContainer, { box: "border-box" }));
    this.registerActions();
  }
  static {
    this.DEFAULT_TITLE = localize(12717, null);
  }
  static {
    this.PICK_AGENT_SESSION_ACTION_ID = "workbench.action.chat.pickAgentSession";
  }
  registerActions() {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: ChatViewTitleControl.PICK_AGENT_SESSION_ACTION_ID,
          title: localize(12718, null),
          f1: false,
          menu: [{
            id: MenuId.ChatViewSessionTitleNavigationToolbar,
            group: "navigation",
            order: 2
          }]
        });
      }
      async run(accessor) {
        const instantiationService = accessor.get(IInstantiationService);
        const agentSessionsPicker = instantiationService.createInstance(AgentSessionsPicker, that.titleLabel.value?.element, void 0);
        await agentSessionsPicker.pickAgentSession();
      }
    }));
  }
  render(parent) {
    const elements = h("div.chat-view-title-container", [
      h("div.chat-view-title-inner", [
        h("div.chat-view-title-navigation-toolbar@navigationToolbar"),
        h("div.chat-view-title-actions-toolbar@actionsToolbar")
      ])
    ]);
    this.navigationToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, elements.navigationToolbar, MenuId.ChatViewSessionTitleNavigationToolbar, {
      actionViewItemProvider: (action) => {
        if (action.id === ChatViewTitleControl.PICK_AGENT_SESSION_ACTION_ID) {
          this.titleLabel.value = new ChatViewTitleLabel(action);
          this.titleLabel.value.updateTitle(this.title ?? ChatViewTitleControl.DEFAULT_TITLE);
          return this.titleLabel.value;
        }
        return void 0;
      },
      hiddenItemStrategy: -1 /* NoHide */,
      menuOptions: { shouldForwardArgs: true }
    }));
    this.actionsToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, elements.actionsToolbar, MenuId.ChatViewSessionTitleToolbar, {
      menuOptions: { shouldForwardArgs: true },
      hiddenItemStrategy: -1 /* NoHide */
    }));
    this.titleContainer = elements.root;
    this._register(Gesture.addTarget(this.titleContainer));
    for (const eventType of [EventType2.Tap, EventType.CLICK]) {
      this._register(addDisposableListener(this.titleContainer, eventType, () => {
        this.delegate.focusChat();
      }));
    }
    parent.appendChild(this.titleContainer);
  }
  update(model) {
    this.model = model;
    this.modelDisposables.value = model?.onDidChange((e4) => {
      if (e4.kind === "setCustomTitle" || e4.kind === "addRequest") {
        this.doUpdate();
      }
    });
    this.doUpdate();
  }
  doUpdate() {
    const markdownTitle = new MarkdownString(this.model?.title ?? "");
    this.title = renderAsPlaintext(markdownTitle);
    this.updateTitle(this.title ?? ChatViewTitleControl.DEFAULT_TITLE);
    const context2 = this.model && {
      $mid: 19 /* ChatViewContext */,
      sessionResource: this.model.sessionResource
    };
    if (this.navigationToolbar) {
      this.navigationToolbar.context = context2;
    }
    if (this.actionsToolbar) {
      this.actionsToolbar.context = context2;
    }
  }
  updateTitle(title) {
    if (!this.titleContainer) {
      return;
    }
    this.titleContainer.classList.toggle("visible", this.shouldRender());
    this.titleLabel.value?.updateTitle(title);
  }
  shouldRender() {
    return !!this.model?.title;
  }
  getHeight() {
    return this.lastKnownHeight;
  }
};

ChatViewTitleControl = __decorateClass([
  __decorateParam(3, IInstantiationService)
], ChatViewTitleControl);

var ChatViewTitleLabel = class extends ActionViewItem {
  constructor(action, options3) {
    super(null, action, { ...options3, icon: false, label: true });
    this.titleLabel = void 0;
  }
  render(container2) {
    super.render(container2);
    container2.classList.add("chat-view-title-action-item");
    this.label?.classList.add("chat-view-title-label-container");
    this.titleLabel = this.label?.appendChild(h("span.chat-view-title-label").root);
    this.updateLabel();
  }
  updateTitle(title) {
    this.title = title;
    this.updateLabel();
  }
  updateLabel() {
    if (!this.titleLabel) {
      return;
    }
    if (this.title) {
      this.titleLabel.textContent = this.title;
    } else {
      this.titleLabel.textContent = "";
    }
  }
};
export { ChatViewTitleControl, ChatViewTitleLabel };
