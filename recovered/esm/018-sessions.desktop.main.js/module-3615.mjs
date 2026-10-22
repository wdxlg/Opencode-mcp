// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/newChatInSessionWidget.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { derived } from "./module-0054.mjs";
import { NewChatInputWidget } from "./module-3582.mjs";
import { constObservable } from "./module-0061.mjs";
import { localize } from "./module-0001.mjs";
import { $, append } from "./module-0075.mjs";
import { chatInputStackClass, setChatInputStackSlot } from "./module-2033.mjs";
import { ChatInputNoticeWidget } from "./module-2036.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/sessions/contrib/chat/browser/newChatInSessionWidget.ts
var STORAGE_KEY_SUB_SESSION_TIP_DISMISSED = "sessions.subSessionTipDismissed";

var NewChatInSessionWidget = class extends Disposable {
  constructor(_options, instantiationService, logService, sessionsManagementService, sessionsService, storageService) {
    super();
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.sessionsManagementService = sessionsManagementService;
    this.sessionsService = sessionsService;
    this.storageService = storageService;
    this._tipDisposable = this._register(new MutableDisposable());
    this._session = derived((reader) => {
      const activeSession = this.sessionsService.activeSession.read(reader);
      return activeSession;
    });
    const canSendRequest = derived((reader) => {
      const session = this._session.read(reader);
      if (!session) {
        return false;
      }
      return true;
    });
    const loading = derived((_reader) => false);
    this._newChatInput = this._register(this.instantiationService.createInstance(NewChatInputWidget, {
      session: this._session,
      getContextFolderUri: () => this._getContextFolderUri(),
      sendRequest: async ({ query, attachments, background }) => this._send(query, attachments, background),
      canSendRequest,
      loading,
      historyKey: constObservable(void 0),
      // no persisted history for the new-chat-in-session view
      minEditorHeight: 64,
      placeholder: localize(4467, null),
      petHostPreferred: _options.petHostPreferred,
      supportsBackground: true,
      voiceRoutesWhileSessionActive: true
    }));
  }
  // --- Rendering ---
  render(parent) {
    const element = append(parent, $(".sessions-chat-widget.new-chat-in-session"));
    const chatWidgetContainer = append(element, $(".new-chat-widget-container"));
    const chatWidgetContent = append(chatWidgetContainer, $(`.new-chat-widget-content.${chatInputStackClass}`));
    this._newChatInput.render(chatWidgetContent, parent);
    this._renderSubSessionTip();
    chatWidgetContainer.classList.add("revealed");
  }
  _renderSubSessionTip() {
    if (this.storageService.getBoolean(STORAGE_KEY_SUB_SESSION_TIP_DISMISSED, 0 /* PROFILE */, false)) {
      return;
    }
    const tipContainer = this._newChatInput.hostNoticeContainerElement;
    if (!tipContainer) {
      return;
    }
    const store = new DisposableStore();
    tipContainer.classList.add("sub-session-tip-container");
    const message = localize(
      4470,
      null
    );
    const tip = store.add(new ChatInputNoticeWidget({
      container: tipContainer,
      variant: "tip" /* Tip */,
      ariaLabel: message,
      ariaRoleDescription: localize(4468, null)
    }));
    const iconEl = append(tip.domNode, renderIcon(Codicon.lightbulb));
    iconEl.classList.add("sub-session-tip-icon");
    const textEl = append(tip.domNode, $("span.sub-session-tip-text"));
    textEl.textContent = message;
    const dismiss = () => {
      const hadFocus = tip.hasFocus();
      this.storageService.store(STORAGE_KEY_SUB_SESSION_TIP_DISMISSED, true, 0 /* PROFILE */, 0 /* USER */);
      setChatInputStackSlot(tipContainer, 0 /* Empty */);
      this._tipDisposable.clear();
      if (hadFocus) {
        this._newChatInput.focus();
      }
    };
    tip.addDismissAction({
      ariaLabel: localize(4469, null),
      onActivate: dismiss
    });
    let leading = false;
    let announced = false;
    setChatInputStackSlot(tipContainer, 0 /* Empty */);
    store.add(this._newChatInput.noticeHost.occupy(2 /* Tip */, {
      focusTarget: {
        hasFocus: () => tip.hasFocus(),
        focus: () => tip.focus(),
        canFocus: () => leading
      },
      onDidChangeLeading: (isLeading) => {
        leading = isLeading;
        setChatInputStackSlot(tipContainer, isLeading ? 1 /* Docked */ : 0 /* Empty */);
        if (isLeading && !announced) {
          announced = true;
          tip.announce();
        }
      }
    }));
    this._tipDisposable.value = store;
  }
  /**
   * Returns the workspace URI from the active session's workspace.
   */
  _getContextFolderUri() {
    const session = this._session.get();
    const workspace = session?.workspace.get();
    return workspace?.folders[0]?.workingDirectory;
  }
  // --- Send ---
  async _send(query, attachedContext, background) {
    const activeSession = this._session.get();
    if (!activeSession) {
      return false;
    }
    const activeChat = activeSession.activeChat.get();
    try {
      if (background) {
        await this.sessionsService.openNewChatInSession(activeSession, { forceNew: true });
      }
      await this.sessionsManagementService.sendRequest(activeSession, activeChat, { query, attachedContext, background });
      return true;
    } catch (e4) {
      this.logService.error("Failed to send secondary chat request:", e4);
      return false;
    }
  }
  layout(height, width2) {
    this._newChatInput.layout(height, width2);
  }
  focusInput() {
    this._newChatInput.focus();
  }
  attach(uris) {
    this._newChatInput.attach(uris);
  }
};

NewChatInSessionWidget = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILogService),
  __decorateParam(3, ISessionsManagementService),
  __decorateParam(4, ISessionsService),
  __decorateParam(5, IStorageService)
], NewChatInSessionWidget);
export { STORAGE_KEY_SUB_SESSION_TIP_DISMISSED, NewChatInSessionWidget };
