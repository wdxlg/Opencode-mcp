// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatQueuePickerActionItem.ts
import { ActionViewItem, BaseActionViewItem } from "./module-0476.mjs";
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { $, EventType, ModifierKeyEmitter, addDisposableListener, append } from "./module-0075.mjs";
import { ChatAskInSideChatAction, ChatQueueMessageAction, ChatSteerWithMessageAction } from "./module-2548.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { ChatSubmitAction } from "./module-2056.mjs";
import { coalesce } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IChatSideChatService } from "./module-2292.mjs";
import { ActionWidgetDropdownActionViewItem } from "./module-2053.mjs";
import { Disposable } from "./module-0012.mjs";
import { MenuId, SubmenuItemAction } from "./module-0092.mjs";
import { IActionViewItemService } from "./module-0518.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatQueuePickerActionItem.ts
var ChatQueuePickerActionItem = class extends BaseActionViewItem {
  constructor(action, _options, commandService, configurationService, actionWidgetService, keybindingService, contextKeyService, telemetryService, chatWidgetService, chatSideChatService) {
    super(void 0, action);
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.keybindingService = keybindingService;
    this.contextKeyService = contextKeyService;
    this.chatWidgetService = chatWidgetService;
    this.chatSideChatService = chatSideChatService;
    this._altKeyPressed = false;
    const isSteerDefault = this._isEffectiveSteer();
    const editingPendingRequest = this._isEditingPendingRequest();
    this._primaryActionAction = this._register(new Action(
      "chat.queuePickerPrimary",
      editingPendingRequest ? isSteerDefault ? localize(12510, null) : localize(12509, null) : isSteerDefault ? localize(12513, null) : localize(12506, null),
      ThemeIcon.asClassName(editingPendingRequest ? Codicon.arrowUpCompact : isSteerDefault ? Codicon.newLine : Codicon.add),
      !!this.contextKeyService.getContextKeyValue(ChatContextKeys.inputHasText.key),
      () => this._runDefaultAction()
    ));
    this._primaryAction = this._register(new ActionViewItem(void 0, this._primaryActionAction, { icon: true, label: false }));
    this._register(this.contextKeyService.onDidChangeContext((e4) => {
      this._primaryActionAction.enabled = !!this.contextKeyService.getContextKeyValue(ChatContextKeys.inputHasText.key);
      if (e4.affectsSome(/* @__PURE__ */ new Set([ChatContextKeys.editingRequestType.key]))) {
        this._updatePrimaryAction();
      }
    }));
    const dropdownAction = this._register(new Action("chat.queuePickerDropdown", localize(12508, null)));
    this._dropdown = this._register(new ChevronActionWidgetDropdown(
      dropdownAction,
      {
        actionProvider: { getActions: () => this._getDropdownActions() },
        showItemKeybindings: true
      },
      actionWidgetService,
      this.keybindingService,
      this.contextKeyService,
      telemetryService
    ));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("chat.requestQueuing.defaultAction" /* RequestQueueingDefaultAction */)) {
        this._updatePrimaryAction();
      }
    }));
    this._register(ModifierKeyEmitter.getInstance().event((status2) => {
      if (this._altKeyPressed !== status2.altKey) {
        this._altKeyPressed = status2.altKey;
        this._updatePrimaryAction();
      }
    }));
  }
  _isSteerDefault() {
    return this.configurationService.getValue("chat.requestQueuing.defaultAction" /* RequestQueueingDefaultAction */) === "steer";
  }
  _isEditingPendingRequest() {
    const editing = this.contextKeyService.getContextKeyValue(ChatContextKeys.editingRequestType.key);
    return editing === ChatContextKeys.EditingRequestType.Queue || editing === ChatContextKeys.EditingRequestType.Steer;
  }
  _isEffectiveSteer() {
    const editing = this.contextKeyService.getContextKeyValue(ChatContextKeys.editingRequestType.key);
    const isSteerDefault = editing === ChatContextKeys.EditingRequestType.Steer ? true : editing === ChatContextKeys.EditingRequestType.Queue ? false : this._isSteerDefault();
    return this._altKeyPressed ? !isSteerDefault : isSteerDefault;
  }
  _updatePrimaryAction() {
    const isSteer = this._isEffectiveSteer();
    const editingPendingRequest = this._isEditingPendingRequest();
    this._primaryActionAction.label = editingPendingRequest ? isSteer ? localize(12510, null) : localize(12509, null) : isSteer ? localize(12513, null) : localize(12506, null);
    this._primaryActionAction.class = ThemeIcon.asClassName(editingPendingRequest ? Codicon.arrowUpCompact : isSteer ? Codicon.newLine : Codicon.add);
  }
  _runDefaultAction() {
    const actionId = this._isEffectiveSteer() ? ChatSteerWithMessageAction.ID : ChatQueueMessageAction.ID;
    this.commandService.executeCommand(actionId);
  }
  render(container2) {
    super.render(container2);
    container2.classList.add("monaco-dropdown-with-default");
    const primaryContainer = $(".action-container");
    this._primaryAction.render(append(container2, primaryContainer));
    this._register(addDisposableListener(primaryContainer, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.equals(17 /* RightArrow */)) {
        this._primaryAction.blur();
        this._dropdown.focus();
        event.stopPropagation();
      }
    }));
    const dropdownContainer = $(".dropdown-action-container");
    this._dropdown.render(append(container2, dropdownContainer));
    this._register(addDisposableListener(dropdownContainer, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.equals(15 /* LeftArrow */)) {
        this._dropdown.setFocusable(false);
        this._primaryAction.focus();
        event.stopPropagation();
      }
    }));
  }
  focus(fromRight) {
    if (fromRight) {
      this._dropdown.focus();
    } else {
      this._primaryAction.focus();
    }
  }
  blur() {
    this._primaryAction.blur();
    this._dropdown.blur();
  }
  setFocusable(focusable) {
    this._primaryAction.setFocusable(focusable);
    this._dropdown.setFocusable(focusable);
  }
  _getDropdownActions() {
    const isSteerDefault = this._isSteerDefault();
    const lookupContext = this.contextKeyService.createOverlay([
      [ChatContextKeys.inputHasText.key, true],
      [ChatContextKeys.inChatInput.key, true],
      [ChatContextKeys.requestInProgress.key, true]
    ]);
    const queueKeybinding = this.keybindingService.lookupKeybinding(ChatQueueMessageAction.ID, lookupContext, true);
    const steerKeybinding = this.keybindingService.lookupKeybinding(ChatSteerWithMessageAction.ID, lookupContext, true);
    const queueAction = {
      id: ChatQueueMessageAction.ID,
      label: localize(12506, null),
      tooltip: "",
      enabled: true,
      checked: !isSteerDefault,
      icon: Codicon.add,
      class: void 0,
      keybinding: queueKeybinding,
      hover: {
        content: localize(12507, null)
      },
      run: () => {
        this.commandService.executeCommand(ChatQueueMessageAction.ID);
      }
    };
    const steerAction = {
      id: ChatSteerWithMessageAction.ID,
      label: localize(12513, null),
      tooltip: "",
      enabled: true,
      checked: isSteerDefault,
      icon: Codicon.newLine,
      class: void 0,
      keybinding: steerKeybinding,
      hover: {
        content: localize(12514, null)
      },
      run: () => {
        this.commandService.executeCommand(ChatSteerWithMessageAction.ID);
      }
    };
    const sendAction = {
      id: "_" + ChatSubmitAction.ID,
      // _ to avoid showing a keybinding which is not valid in this context
      label: localize(12511, null),
      tooltip: "",
      enabled: true,
      icon: Codicon.arrowRight,
      class: void 0,
      hover: {
        content: localize(12512, null)
      },
      run: () => {
        this.commandService.executeCommand(ChatSubmitAction.ID, { acceptInputOptions: { cancelCurrentRequest: true } });
      }
    };
    const askInSideChatAction = this._canAskInSideChat() ? {
      id: ChatAskInSideChatAction.ID,
      label: localize(12504, null),
      tooltip: "",
      enabled: true,
      icon: Codicon.commentDiscussion,
      class: void 0,
      hover: {
        content: localize(12505, null)
      },
      run: () => {
        this.commandService.executeCommand(ChatAskInSideChatAction.ID);
      }
    } : void 0;
    return coalesce([sendAction, queueAction, steerAction, askInSideChatAction]);
  }
  /**
   * Side chats are provided by the layer hosting the conversation (today the
   * Agents window), so the entry is offered only once a provider reports the
   * current conversation can branch one.
   */
  _canAskInSideChat() {
    const sessionResource = this.chatWidgetService.lastFocusedWidget?.viewModel?.model.sessionResource;
    return !!sessionResource && this.chatSideChatService.canAskInSideChat(sessionResource);
  }
};

ChatQueuePickerActionItem = __decorateClass([
  __decorateParam(2, ICommandService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IActionWidgetService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IChatWidgetService),
  __decorateParam(9, IChatSideChatService)
], ChatQueuePickerActionItem);

var ChevronActionWidgetDropdown = class extends ActionWidgetDropdownActionViewItem {
  renderLabel(element) {
    element.classList.add("codicon", "codicon-chevron-down");
    return null;
  }
};

var ChatQueuePickerRendering = class extends Disposable {
  static {
    this.ID = "chat.queuePickerRendering";
  }
  constructor(actionViewItemService) {
    super();
    this._register(actionViewItemService.register(MenuId.ChatExecute, MenuId.ChatExecuteQueue, (action, options3, instantiationService) => {
      if (!(action instanceof SubmenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(ChatQueuePickerActionItem, action, options3);
    }));
  }
};

ChatQueuePickerRendering = __decorateClass([
  __decorateParam(0, IActionViewItemService)
], ChatQueuePickerRendering);
export { ChatQueuePickerActionItem, ChevronActionWidgetDropdown, ChatQueuePickerRendering };
