// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/chatGroupView.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { $, size, trackFocus } from "./module-0075.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { getChatSessionArchiveActionPresentation, getChatSessionArchiveActionWording } from "./module-2468.mjs";
import { ChatCompositeBar } from "./module-3491.mjs";
import { SessionReadOnlyBanner } from "./module-3492.mjs";
import { localize } from "./module-0001.mjs";
import { derived } from "./module-0054.mjs";
import { autorun } from "./module-0052.mjs";
import { UNARCHIVE_SESSION_COMMAND_ID } from "./module-1800.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatViewFactory } from "./module-3487.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/sessions/browser/parts/chatGroupView.ts
var ChatGroupView = class extends Disposable {
  constructor(_chatViewFactory, instantiationService, _commandService, configurationService) {
    super();
    this._chatViewFactory = _chatViewFactory;
    this._commandService = _commandService;
    this.element = $(".chat-group-view");
    this.minimumWidth = 200;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this.minimumHeight = 200;
    this.maximumHeight = Number.POSITIVE_INFINITY;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    /** Fires when keyboard focus enters this group (any of its descendants). */
    this._onDidFocus = this._register(new Emitter());
    this.onDidFocus = this._onDidFocus.event;
    this._currentView = this._register(new MutableDisposable());
    this._contextDisposables = this._register(new DisposableStore());
    /** Whether this group is the active (focused) group within the session. */
    this._groupActive = false;
    /** Whether this group's session is the active session in the sessions part. */
    this._sessionActive = true;
    /** Whether this group's session is currently visible in the sessions part. */
    this._sessionVisible = true;
    /** Index of this group within the persisted layout, written into {@link toJSON}. */
    this._serializationIndex = 0;
    this._archiveActionWording = observableFromEvent(
      this,
      configurationService.onDidChangeConfiguration,
      () => getChatSessionArchiveActionWording(configurationService)
    );
    this._barContainer = $(".chat-group-view-bar");
    this.element.appendChild(this._barContainer);
    this._compositeBar = this._register(instantiationService.createInstance(ChatCompositeBar, void 0));
    this._barContainer.appendChild(this._compositeBar.element);
    this._readOnlyBanner = this._register(new SessionReadOnlyBanner());
    this._barContainer.appendChild(this._readOnlyBanner.domNode);
    this._contentContainer = $(".chat-group-view-content");
    this.element.appendChild(this._contentContainer);
    this._register(this._compositeBar.onDidChangeVisibility(() => this._layoutChildren()));
    this._register(this._compositeBar.onDidChangeHeight(() => this._layoutChildren()));
    const focusTracker = this._register(trackFocus(this.element));
    this._register(focusTracker.onDidFocus(() => this._onDidFocus.fire()));
  }
  static {
    this.TYPE = "sessions.chatGroupView";
  }
  setGroupPosition(index2, count2) {
    if (count2 <= 1) {
      this.element.removeAttribute("role");
      this.element.removeAttribute("aria-label");
      this._compositeBar.setAriaLabel(localize(3778, null));
      return;
    }
    this.element.setAttribute("role", "region");
    this.element.setAttribute("aria-label", localize(3776, null, index2 + 1, count2));
    this._compositeBar.setAriaLabel(localize(3777, null, index2 + 1, count2));
  }
  /** Sets (or clears) the group this view renders. */
  setContext(context2) {
    this._contextDisposables.clear();
    if (!context2) {
      this._compositeBar.setGroup(void 0);
      this._currentView.clear();
      this._contentContainer.replaceChildren();
      return;
    }
    const delegate = {
      session: context2.session,
      chats: context2.chats,
      activeChatResource: context2.activeChatResource,
      mainChatResource: context2.mainChatResource,
      visible: context2.tabsVisible,
      showSessionActions: context2.showSessionActions,
      openChat: (resource) => context2.openChat(resource),
      onTabDragStart: (resource) => context2.onTabDragStart(resource),
      onTabDragEnd: () => context2.onTabDragEnd()
    };
    this._compositeBar.setGroup(delegate);
    const activeChat = derived((reader) => {
      const activeResource = context2.activeChatResource.read(reader);
      return context2.chats.read(reader).find((c) => c.resource.toString() === activeResource);
    });
    this._contextDisposables.add(autorun((reader) => {
      const session = context2.session;
      const chat = activeChat.read(reader);
      let desiredKind;
      if (session.isCreated.read(reader) === false) {
        desiredKind = session.isNewSessionRequestInProgress?.read(reader) === true ? "chat" : "newSession";
      } else if (!chat || chat.status.read(reader) === 0 /* Untitled */ && chat.interactivity.read(reader) === "full" /* Full */) {
        desiredKind = "newChatInSession";
      } else {
        desiredKind = "chat";
      }
      let view = this._currentView.value;
      if (!view || view.kind !== desiredKind) {
        view = desiredKind === "chat" ? this._chatViewFactory.createChatView() : this._chatViewFactory.createNewChatView(desiredKind === "newChatInSession", context2.options);
        this._contentContainer.replaceChildren(view.element);
        this._currentView.value = view;
        view.setActive(this._sessionActive);
        view.setVisible(this._sessionVisible);
        this._layoutChildren();
      }
      if (chat) {
        view.setChat(chat, session.sessionId, session);
      }
      const readOnly = !!chat && chat.interactivity.read(reader) !== "full" /* Full */;
      if (readOnly) {
        const archived = session.isArchived.read(reader);
        if (archived) {
          const action = getChatSessionArchiveActionPresentation(this._archiveActionWording.read(reader)).unarchive;
          this._readOnlyBanner.setContent({
            message: localize(3779, null),
            action: {
              label: action.title.value,
              run: () => this._commandService.executeCommand(UNARCHIVE_SESSION_COMMAND_ID, session)
            }
          });
        } else {
          this._readOnlyBanner.setContent({ message: localize(3780, null) });
        }
      }
      if (this._readOnlyBanner.visible !== readOnly) {
        this._readOnlyBanner.setVisible(readOnly);
        this._layoutChildren();
      }
    }));
  }
  /** Whether this group is the active (focused) group within the session. */
  setGroupActive(active) {
    this._groupActive = active;
    this.element.classList.toggle("active-group", active);
  }
  get groupActive() {
    return this._groupActive;
  }
  /** Whether this group's session is the active session in the sessions part. */
  setSessionActive(active) {
    if (this._sessionActive === active) {
      return;
    }
    this._sessionActive = active;
    this._currentView.value?.setActive(active);
  }
  /** Whether this group's session is currently visible in the sessions part. */
  setSessionVisible(visible) {
    if (this._sessionVisible === visible) {
      return;
    }
    this._sessionVisible = visible;
    this._currentView.value?.setVisible(visible);
  }
  submitInput() {
    return this._currentView.value?.submitInput() ?? Promise.resolve(false);
  }
  selectWorkspace(folderUri, providerId) {
    this._currentView.value?.selectWorkspace(folderUri, providerId);
  }
  prefillInput(text2) {
    this._currentView.value?.prefillInput(text2);
  }
  sendQuery(text2) {
    this._currentView.value?.sendQuery(text2);
  }
  attach(uris) {
    this._currentView.value?.attach(uris);
  }
  layout(width2, height, top2, left) {
    size(this.element, width2, height);
    this._lastLayout = { width: width2, height, top: top2, left };
    this._layoutChildren();
  }
  _layoutChildren() {
    if (!this._lastLayout) {
      return;
    }
    const { width: width2, height, top: top2, left } = this._lastLayout;
    const tabsHeight = this._compositeBar.visible ? this._compositeBar.height : 0;
    const bannerHeight = this._readOnlyBanner.visible ? this._readOnlyBanner.domNode.offsetHeight : 0;
    const barHeight = tabsHeight + bannerHeight;
    size(this._barContainer, width2, barHeight);
    this._currentView.value?.layout(width2, height - barHeight, top2 + barHeight, left);
  }
  /** Sets the index this group serializes as, so the grid deserializer can map nodes back to groups. */
  setSerializationIndex(index2) {
    this._serializationIndex = index2;
  }
  toJSON() {
    return { type: ChatGroupView.TYPE, index: this._serializationIndex };
  }
  focus() {
    this._currentView.value?.focus();
  }
};

ChatGroupView = __decorateClass([
  __decorateParam(0, IChatViewFactory),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IConfigurationService)
], ChatGroupView);
export { ChatGroupView };
