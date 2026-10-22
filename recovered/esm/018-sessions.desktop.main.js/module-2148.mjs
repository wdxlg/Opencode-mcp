// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatInputNotificationWidget.ts
import { $, append, clearNode } from "./module-0075.mjs";
import { Codicon } from "./module-0085.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ChatInputNoticeWidget } from "./module-2036.mjs";
import { localize } from "./module-0001.mjs";
import { autorun } from "./module-0052.mjs";
import { IChatInputNotificationService, getChatInputNotificationAnnouncementSignature, isChatInputNotificationApplicableToSession, resolveChatInputNotificationBody } from "./module-1460.mjs";
import { setChatInputStackSlot } from "./module-2033.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { isMarkdownString } from "./module-0462.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { filterConfigurationToSchema } from "./module-2045.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatInputNotificationWidget.ts
var $39 = $;

var severityToClass = {
  [0 /* Info */]: "severity-info",
  [1 /* Warning */]: "severity-warning",
  [2 /* Error */]: "severity-error"
};

var severityToIcon = {
  [0 /* Info */]: Codicon.info,
  [1 /* Warning */]: Codicon.warning,
  [2 /* Error */]: Codicon.error
};

var emptyModelState = { currentModel: void 0, models: [] };

var ChatInputNotificationWidget = class extends Disposable {
  constructor(_delegate2, _notificationService, _commandService, _telemetryService, _markdownRendererService, _hoverService, _logService) {
    super();
    this._delegate = _delegate2;
    this._notificationService = _notificationService;
    this._commandService = _commandService;
    this._telemetryService = _telemetryService;
    this._markdownRendererService = _markdownRendererService;
    this._hoverService = _hoverService;
    this._logService = _logService;
    this._contentDisposables = this._register(new DisposableStore());
    this._deferredNotificationsEnabled = true;
    this._sessionStarted = false;
    this._modelState = emptyModelState;
    this._isTransientChat = false;
    this._visible = false;
    this._notice = this._register(new ChatInputNoticeWidget({
      variant: "notification" /* Notification */,
      className: "chat-input-notification-widget",
      ariaRoleDescription: localize(12488, null)
    }));
    this._notice.setVisible(false);
    this._register(this._notificationService.onDidChange(() => this._render()));
    this._register(autorun((reader) => {
      this._modelTargetChatSessionType = this._delegate?.modelTargetChatSessionType?.read(reader);
      this._sessionResource = this._delegate?.sessionResource?.read(reader);
      this._deferredNotificationsEnabled = this._delegate?.deferredNotificationsEnabled?.read(reader) ?? true;
      this._sessionStarted = this._delegate?.sessionStarted?.read(reader) ?? false;
      this._modelState = this._delegate?.modelSelection?.state.read(reader) ?? emptyModelState;
      this._isTransientChat = this._delegate?.isTransientChat?.read(reader) ?? false;
      this._render();
    }));
  }
  get domNode() {
    return this._notice.domNode;
  }
  _render() {
    const hadFocus = this.hasFocus();
    this._contentDisposables.clear();
    clearNode(this.domNode);
    this.domNode.classList.remove(...Object.values(severityToClass));
    const bodies = /* @__PURE__ */ new Map();
    const notification = this._notificationService.getActiveNotification((candidate) => {
      const body2 = this._resolveBody(candidate);
      if (body2) {
        bodies.set(candidate.id, body2);
        return true;
      }
      return false;
    });
    const body = notification ? bodies.get(notification.id) : void 0;
    this._setVisible(!!notification && !!body);
    const announcementSignature = notification && body ? getChatInputNotificationAnnouncementSignature(notification, body) : void 0;
    if (announcementSignature !== this._lastAnnouncementSignature) {
      this._lastAnnouncementSignature = announcementSignature;
      this._notificationService.announceRendered(body ? notification : void 0, body);
    }
    if (!notification || !body) {
      setChatInputStackSlot(this._slot, 0 /* Empty */);
      this._lastShownTelemetryData = void 0;
      if (hadFocus) {
        this._delegate?.focusInput?.();
      }
      return;
    }
    setChatInputStackSlot(this._slot, 1 /* Docked */);
    this._renderNotification(notification, body);
    this._logShownTelemetry(notification);
    if (hadFocus) {
      this.focus();
    }
  }
  _setVisible(visible) {
    if (this._visible === visible) {
      return;
    }
    this._visible = visible;
    this._notice.setVisible(visible);
    this._delegate?.onDidChangeVisibility?.(visible, this);
  }
  hasFocus() {
    return this._notice.hasFocus();
  }
  /**
   * Add the notification to its slot and report what the slot is showing.
   *
   * The widget is built detached and renders in its constructor, so an already
   * active notification has no slot to report to at that point. Owners add it
   * through here so the slot cannot end up marked empty while it has content.
   */
  attachTo(slot) {
    this._slot = slot;
    slot.appendChild(this.domNode);
    setChatInputStackSlot(slot, this._visible ? 1 /* Docked */ : 0 /* Empty */);
  }
  focus() {
    this._notice.focus();
  }
  _resolveBody(notification) {
    const context2 = this._getContext();
    if (!isChatInputNotificationApplicableToSession(notification, context2.sessionType, context2.sessionResource)) {
      return void 0;
    }
    return resolveChatInputNotificationBody(notification, context2, (error) => this._logError(error));
  }
  _getContext() {
    return {
      sessionType: this._modelTargetChatSessionType,
      sessionResource: this._sessionResource,
      deferredNotificationsEnabled: this._deferredNotificationsEnabled,
      isTransientChat: this._isTransientChat,
      sessionStarted: this._sessionStarted,
      modelState: this._modelState
    };
  }
  _renderNotification(notification, body) {
    const container2 = this.domNode;
    container2.classList.add(severityToClass[notification.severity]);
    const headerRow = append(container2, $39(".chat-input-notification-header"));
    const iconElement = append(headerRow, $39(".chat-input-notification-icon"));
    iconElement.appendChild($(ThemeIcon.asCSSSelector(severityToIcon[notification.severity])));
    const titleElement = append(headerRow, $39(".chat-input-notification-title"));
    if (isMarkdownString(notification.message)) {
      const rendered = this._contentDisposables.add(this._markdownRendererService.render(notification.message));
      rendered.element.classList.add("chat-input-notification-title-markdown");
      titleElement.appendChild(rendered.element);
    } else {
      titleElement.textContent = notification.message;
    }
    const ariaTitle = isMarkdownString(notification.message) ? notification.message.value : notification.message;
    this._notice.setAriaLabel(ariaTitle);
    if (notification.mute) {
      const mute = notification.mute;
      const muteButton = this._notice.addAction({
        ariaLabel: mute.tooltip,
        icon: Codicon.bellSlash,
        parent: headerRow,
        store: this._contentDisposables,
        onActivate: () => queueMicrotask(() => {
          this._telemetryService.publicLog2("workbenchActionExecuted", {
            id: mute.commandId,
            from: "chatInputNotification"
          });
          this._commandService.executeCommand(mute.commandId, ...mute.commandArgs ?? []);
        })
      });
      this._contentDisposables.add(this._hoverService.setupManagedHover(getDefaultHoverDelegate("element"), muteButton, mute.tooltip));
    }
    if (notification.dismissible) {
      this._notice.addDismissAction({
        className: "chat-input-notification-dismiss",
        ariaLabel: localize(12489, null),
        parent: headerRow,
        store: this._contentDisposables,
        onActivate: () => queueMicrotask(() => {
          this._telemetryService.publicLog2("chatInputNotificationDismissed", this._getTelemetryData(notification));
          this._notificationService.dismissNotification(notification.id);
        })
      });
    }
    const actions = body.actions.filter((action) => this._supportsAction(action));
    const hasBody = body.description || actions.length > 0;
    if (hasBody) {
      const bodyRow = append(container2, $39(".chat-input-notification-body"));
      if (body.description) {
        const descriptionElement = append(bodyRow, $39(".chat-input-notification-description"));
        if (isMarkdownString(body.description)) {
          const rendered = this._contentDisposables.add(this._markdownRendererService.render(body.description));
          rendered.element.classList.add("chat-input-notification-description-markdown");
          descriptionElement.appendChild(rendered.element);
        } else {
          descriptionElement.textContent = body.description;
        }
      }
      if (actions.length > 0) {
        const actionsContainer = append(bodyRow, $39(".chat-input-notification-actions"));
        for (let i2 = 0; i2 < actions.length; i2++) {
          const action = actions[i2];
          const isLast = i2 === actions.length - 1;
          const button = this._contentDisposables.add(new Button(actionsContainer, {
            ...defaultButtonStyles,
            ...!isLast ? {
              buttonBackground: void 0,
              buttonHoverBackground: void 0,
              buttonForeground: void 0,
              buttonSecondaryBackground: void 0,
              buttonSecondaryHoverBackground: void 0,
              buttonSecondaryForeground: void 0,
              buttonSecondaryBorder: void 0
            } : {},
            supportIcons: true,
            secondary: !isLast
          }));
          button.element.classList.add("chat-input-notification-action-button");
          button.label = action.label;
          button.element.ariaLabel = `${ariaTitle} ${action.label}`;
          this._contentDisposables.add(button.onDidClick(() => {
            void this._executeAction(notification, action);
          }));
        }
      }
    }
  }
  _supportsAction(action) {
    switch (action.kind) {
      case "command" /* Command */:
        return true;
      case "openModelPicker" /* OpenModelPicker */:
        return !!this._delegate?.modelSelection;
      case "switchToModel" /* SwitchToModel */:
        return !!this._delegate?.modelSelection;
    }
  }
  async _executeAction(notification, action) {
    this._telemetryService.publicLog2("chatInputNotificationAction", {
      ...this._getTelemetryData(notification),
      actionKind: action.kind,
      actionId: action.telemetryActionId ?? ""
    });
    switch (action.kind) {
      case "command" /* Command */:
        try {
          await this._executeCommandAction(action);
        } catch (error) {
          this._logError(error);
        }
        break;
      case "openModelPicker" /* OpenModelPicker */:
        this._openModelPicker();
        break;
      case "switchToModel" /* SwitchToModel */:
        this._switchToModel(action);
        break;
    }
    if (!action.keepOpen) {
      this._notificationService.dismissNotification(notification.id);
    }
  }
  _resolveModel(action) {
    const matches2 = this._modelState.models.filter((model) => this._matchesModel(action, model));
    return action.requireUniqueModel && matches2.length !== 1 ? void 0 : matches2[0];
  }
  _matchesModel(action, model) {
    try {
      return action.matchesModel(model);
    } catch (error) {
      this._logError(error);
      return false;
    }
  }
  _switchToModel(action) {
    const model = this._resolveModel(action);
    let switched = false;
    if (model) {
      try {
        switched = this._delegate?.modelSelection?.selectModel(model.identifier) ?? false;
      } catch (error) {
        this._logError(error);
      }
      if (switched) {
        this._applyModelConfiguration(model, action.config).catch((error) => this._logError(error));
      }
    }
    if (!switched) {
      this._openModelPicker();
    }
  }
  /** Key names are model-specific (`thinkingLevel`, `reasoningEffort`, ...), so a key meant for another model is logged rather than stored. */
  async _applyModelConfiguration(model, config) {
    const modelSelection = this._delegate?.modelSelection;
    if (!config || !modelSelection?.applyModelConfiguration) {
      return;
    }
    const schema10 = model.metadata.configurationSchema;
    const values = filterConfigurationToSchema(config, schema10);
    const dropped = Object.keys(config).filter((key3) => !Object.hasOwn(values, key3));
    if (dropped.length) {
      this._logService.warn(`[ChatInputNotificationWidget] ${model.identifier} does not accept ${dropped.join(", ")}; supported: ${Object.keys(schema10?.properties ?? {}).join(", ") || "none"}`);
    }
    if (Object.keys(values).length) {
      await modelSelection.applyModelConfiguration(model.identifier, values);
    }
  }
  _openModelPicker() {
    try {
      this._delegate?.modelSelection?.openPicker();
    } catch (error) {
      this._logError(error);
    }
  }
  _logError(error) {
    this._logService.error("[ChatInputNotificationWidget] Failed to process notification", error);
  }
  async _executeCommandAction(action) {
    this._telemetryService.publicLog2("workbenchActionExecuted", {
      id: action.commandId,
      from: "chatInputNotification"
    });
    await this._commandService.executeCommand(action.commandId, ...action.commandArgs ?? []);
  }
  _logShownTelemetry(notification) {
    const data = this._getTelemetryData(notification);
    if (this._lastShownTelemetryData?.id === data.id && this._lastShownTelemetryData.telemetryId === data.telemetryId) {
      return;
    }
    this._lastShownTelemetryData = data;
    this._telemetryService.publicLog2("chatInputNotificationShown", data);
  }
  _getTelemetryData(notification) {
    return {
      id: notification.id,
      telemetryId: notification.telemetryId
    };
  }
};

ChatInputNotificationWidget = __decorateClass([
  __decorateParam(1, IChatInputNotificationService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IMarkdownRendererService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, ILogService)
], ChatInputNotificationWidget);
export { $39, severityToClass, severityToIcon, emptyModelState, ChatInputNotificationWidget };
