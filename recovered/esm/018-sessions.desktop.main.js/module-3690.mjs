// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/copilotChatSessions/browser/permissionPicker.ts
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { isChatPermissionLevel } from "./module-0965.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { autorun } from "./module-0052.mjs";
import { URI } from "./module-0032.mjs";
import { maybeConfirmElevatedPermissionLevel } from "./module-2100.mjs";
import { reportNewChatPickerClosed } from "./module-3541.mjs";
import { renderIcon } from "./module-0467.mjs";
import { isAgentSandboxEnabledValue } from "./module-1106.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IHoverService } from "./module-0520.mjs";
import { derived } from "./module-0054.mjs";
import { CopilotChatSessionsProvider } from "./module-3689.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IChatSessionsService } from "./module-0961.mjs";


// src/vs/sessions/contrib/providers/copilotChatSessions/browser/permissionPicker.ts
var PERMISSION_LEVEL_OPTION_ID2 = "permissionLevel";

var DEFAULT_PERMISSION_LEVELS2 = [
  "default" /* Default */,
  "autoApprove" /* AutoApprove */,
  "autopilot" /* Autopilot */
];

function getPermissionLevelMeta2(level) {
  switch (level) {
    case "assisted" /* Assisted */:
      return {
        label: localize(5071, null),
        detail: localize(5073, null),
        icon: Codicon.sparkle,
        hover: localize(5072, null)
      };
    case "autoApprove" /* AutoApprove */:
      return {
        label: localize(5074, null),
        detail: localize(5075, null),
        icon: Codicon.warning
      };
    case "autopilot" /* Autopilot */:
      return {
        label: localize(5076, null),
        detail: localize(5078, null),
        icon: Codicon.rocket,
        hover: localize(5077, null)
      };
    case "default" /* Default */:
    default:
      return {
        label: localize(5079, null),
        detail: localize(5080, null),
        icon: Codicon.shield
      };
  }
}

var PermissionPicker = class extends Disposable {
  constructor(_delegate2, actionWidgetService, configurationService, dialogService, openerService, storageService, telemetryService, hoverService) {
    super();
    this._delegate = _delegate2;
    this.actionWidgetService = actionWidgetService;
    this.configurationService = configurationService;
    this.dialogService = dialogService;
    this.openerService = openerService;
    this.storageService = storageService;
    this.telemetryService = telemetryService;
    this.hoverService = hoverService;
    this._currentLevel = "default" /* Default */;
    this._renderDisposables = this._register(new DisposableStore());
  }
  render(container2) {
    this._renderDisposables.clear();
    const policyRestricted = this.configurationService.inspect("chat.tools.global.autoApprove" /* GlobalAutoApprove */).policyValue === false;
    const configuredDefault = this.configurationService.getValue("chat.permissions.default" /* DefaultPermissionLevel */);
    const initialLevel = isChatPermissionLevel(configuredDefault) ? configuredDefault : "default" /* Default */;
    this._currentLevel = policyRestricted ? "default" /* Default */ : initialLevel;
    const slot = append(container2, $(".sessions-chat-picker-slot.sessions-chat-permission-picker"));
    this._renderDisposables.add({ dispose: () => slot.remove() });
    const trigger = append(slot, $("a.action-label"));
    trigger.tabIndex = 0;
    trigger.role = "button";
    this._triggerElement = trigger;
    this._updateTriggerLabel(trigger);
    if (this._delegate.getPermissionLevelHover) {
      this._renderDisposables.add(this.hoverService.setupDelayedHover(trigger, () => {
        const meta = this._getPermissionLevelMeta(this._currentLevel);
        return { content: this._getPermissionLevelHover(this._currentLevel, meta) ?? "" };
      }));
    }
    this._renderDisposables.add(Gesture.addTarget(trigger));
    for (const eventType of [EventType.CLICK, EventType2.Tap]) {
      this._renderDisposables.add(addDisposableListener(trigger, eventType, (e4) => {
        EventHelper.stop(e4, true);
        this.showPicker();
      }));
    }
    this._renderDisposables.add(addDisposableListener(trigger, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        EventHelper.stop(e4, true);
        this.showPicker();
      }
    }));
    const currentPermissionLevel = this._delegate.currentPermissionLevel;
    if (currentPermissionLevel) {
      this._renderDisposables.add(autorun((reader) => {
        const level = currentPermissionLevel.read(reader);
        if (level === void 0) {
          return;
        }
        this._currentLevel = level;
        this._updateTriggerLabel(trigger);
      }));
    }
    const isApplicable = this._delegate.isApplicable;
    if (isApplicable) {
      this._renderDisposables.add(autorun((reader) => {
        const visible = isApplicable.read(reader);
        slot.style.display = visible ? "" : "none";
        container2.style.display = visible ? "" : "none";
      }));
    }
    const isResolving = this._delegate.isResolving;
    if (isResolving) {
      this._renderDisposables.add(autorun((reader) => {
        const resolving = isResolving.read(reader);
        slot.classList.toggle("resolving", resolving);
        trigger.setAttribute("aria-disabled", resolving ? "true" : "false");
      }));
    }
    const managedSandboxEnforced = this._delegate.managedSandboxEnforced;
    if (managedSandboxEnforced) {
      this._renderDisposables.add(autorun((reader) => {
        managedSandboxEnforced.read(reader);
        this._updateTriggerLabel(trigger);
      }));
    }
    this._renderDisposables.add(this.configurationService.onDidChangeConfiguration((e4) => {
      if (this._affectsSandboxToggle(e4)) {
        this._updateTriggerLabel(trigger);
      }
    }));
    return slot;
  }
  showPicker() {
    if (!this._triggerElement || this.actionWidgetService.isVisible || this._isResolving()) {
      return;
    }
    const policyRestricted = this.configurationService.inspect("chat.tools.global.autoApprove" /* GlobalAutoApprove */).policyValue === false;
    const levels = this._delegate.availableLevels ?? DEFAULT_PERMISSION_LEVELS2;
    const items = levels.map((level) => {
      const meta = this._getPermissionLevelMeta(level);
      const disabled = level !== "default" /* Default */ && policyRestricted;
      const hover = this._delegate.getPermissionLevelHover ? disabled ? localize(5082, null) : this._getPermissionLevelHover(level, meta) : meta.hover;
      return {
        kind: "action" /* Action */,
        group: { kind: "header" /* Header */, title: "", icon: meta.icon },
        item: {
          level,
          label: meta.label,
          icon: meta.icon,
          checked: this._currentLevel === level
        },
        label: meta.label,
        detail: meta.detail,
        ...hover ? { hover: { content: hover } } : {},
        disabled
      };
    });
    const sandboxToggle = this._getSandboxStandaloneToggle();
    if (sandboxToggle) {
      const disabled = sandboxToggle.disabled === true;
      items.push({
        kind: "separator" /* Separator */,
        label: "",
        disabled: false
      });
      items.push({
        kind: "action" /* Action */,
        group: { kind: "header" /* Header */, title: "", icon: Codicon.blank },
        item: {
          kind: "sandbox",
          label: sandboxToggle.label,
          icon: Codicon.blank,
          checked: false
        },
        label: sandboxToggle.label,
        standaloneToggle: sandboxToggle,
        ...disabled ? { hover: { content: localize(5082, null) } } : {},
        disabled
      });
    }
    items.push({
      kind: "separator" /* Separator */,
      label: "",
      disabled: false
    });
    items.push({
      kind: "action" /* Action */,
      group: { kind: "header" /* Header */, title: "", icon: Codicon.blank },
      item: {
        kind: "learnMore",
        label: localize(5081, null),
        icon: Codicon.blank,
        checked: false
      },
      label: localize(5081, null),
      hideIcon: false,
      disabled: false
    });
    const triggerElement = this._triggerElement;
    const delegate = {
      onSelect: async (item) => {
        this.actionWidgetService.hide();
        if (item.level) {
          await this._selectLevel(item.level);
        } else if (item.kind === "learnMore") {
          await this.openerService.open(URI.parse("https://aka.ms/vscode/docs/permissions"));
        }
      },
      onHide: () => {
        triggerElement.focus();
      }
    };
    const listOptions = { minWidth: 255 };
    this.actionWidgetService.show(
      "permissionPicker",
      false,
      items,
      delegate,
      this._triggerElement,
      void 0,
      [],
      {
        getWidgetAriaLabel: () => localize(5064, null)
      },
      listOptions
    );
  }
  _isResolving() {
    return this._delegate.isResolving?.get() ?? false;
  }
  async _selectLevel(level) {
    if (!await maybeConfirmElevatedPermissionLevel(level, this.dialogService, this.storageService, {
      defaultSettingKey: this._delegate.defaultSettingKey,
      levelLabel: this._getPermissionLevelMeta(level).label
    })) {
      reportNewChatPickerClosed(this.telemetryService, {
        id: "NewChatPermissionPicker",
        name: "NewChatPermissionPicker",
        optionIdBefore: this._currentLevel,
        optionIdAfter: this._currentLevel,
        optionLabelBefore: void 0,
        optionLabelAfter: void 0,
        isPII: false
      });
      return;
    }
    reportNewChatPickerClosed(this.telemetryService, {
      id: "NewChatPermissionPicker",
      name: "NewChatPermissionPicker",
      optionIdBefore: this._currentLevel,
      optionIdAfter: level,
      optionLabelBefore: void 0,
      optionLabelAfter: void 0,
      isPII: false
    });
    this._currentLevel = level;
    this._updateTriggerLabel(this._triggerElement);
    this._delegate.setPermissionLevel(level);
  }
  _updateTriggerLabel(trigger) {
    if (!trigger) {
      return;
    }
    clearNode(trigger);
    const meta = this._getPermissionLevelMeta(this._currentLevel);
    const label3 = this._isSandboxToggleAvailable() && this._isSandboxingEnabled() ? localize(5066, null, meta.label) : meta.label;
    append(trigger, renderIcon(meta.icon));
    const labelSpan = append(trigger, $("span.sessions-chat-dropdown-label"));
    labelSpan.textContent = label3;
    const hover = this._getPermissionLevelHover(this._currentLevel, meta);
    trigger.ariaLabel = hover ? localize(5070, null, label3, hover) : localize(5069, null, label3);
    trigger.classList.toggle("warning", this._currentLevel === "autopilot" /* Autopilot */ || this._currentLevel === "assisted" /* Assisted */);
    trigger.classList.toggle("info", this._currentLevel === "autoApprove" /* AutoApprove */);
  }
  _getSandboxStandaloneToggle() {
    if (!this._isSandboxToggleAvailable()) {
      return void 0;
    }
    const managed = this._isSandboxManaged();
    return {
      label: localize(5067, null),
      title: managed ? localize(5065, null) : localize(5068, null),
      checked: this._isSandboxingEnabled(),
      disabled: managed,
      onChange: (checked) => {
        if (this._isSandboxManaged()) {
          return;
        }
        const settingId = this._delegate.getSandboxToggleSettingId?.();
        if (settingId) {
          const target = checked ? "on" /* On */ : "off" /* Off */;
          void this.configurationService.updateValue(settingId, target);
        }
      }
    };
  }
  _isSandboxToggleAvailable() {
    return this.configurationService.getValue("chat.experimental.permissionsSandboxToggle.enabled" /* PermissionsSandboxToggleEnabled */) === true && this._delegate.sandboxTogglePresentation === "standalone" && this._delegate.isSandboxToggleApplicable?.() === true && this._delegate.getSandboxToggleSettingId?.() !== void 0;
  }
  _isSandboxingEnabled() {
    if (this._isSandboxManaged()) {
      return true;
    }
    const settingId = this._delegate.getSandboxToggleSettingId?.();
    return settingId !== void 0 && isAgentSandboxEnabledValue(this.configurationService.getValue(settingId));
  }
  _isSandboxManaged() {
    return this._delegate.managedSandboxEnforced?.get() === true;
  }
  _affectsSandboxToggle(event) {
    const settingId = this._delegate.getSandboxToggleSettingId?.();
    return event.affectsConfiguration("chat.experimental.permissionsSandboxToggle.enabled" /* PermissionsSandboxToggleEnabled */) || settingId !== void 0 && event.affectsConfiguration(settingId) || this._delegate.sandboxToggleConfigurationKeys?.some((key3) => event.affectsConfiguration(key3)) === true;
  }
  _getPermissionLevelHover(level, meta) {
    return this._delegate.getPermissionLevelHover?.(level, meta) ?? meta.hover;
  }
  _getPermissionLevelMeta(level) {
    const meta = getPermissionLevelMeta2(level);
    return this._delegate.getPermissionLevelMeta(level, meta);
  }
};

PermissionPicker = __decorateClass([
  __decorateParam(1, IActionWidgetService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IOpenerService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IHoverService)
], PermissionPicker);

var CopilotPermissionPickerDelegate = class extends Disposable {
  constructor(_session, _sessionsProvidersService, _chatSessionsService) {
    super();
    this._session = _session;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._chatSessionsService = _chatSessionsService;
    this.currentPermissionLevel = derived(this, (reader) => {
      const session = this._session.read(reader);
      if (!session) {
        return void 0;
      }
      const provider = this._sessionsProvidersService.getProvider(session.providerId);
      if (!(provider instanceof CopilotChatSessionsProvider)) {
        return void 0;
      }
      return provider.getSession(session.sessionId)?.permissionLevel.read(reader);
    });
  }
  getPermissionLevelMeta(_level, meta) {
    return meta;
  }
  setPermissionLevel(level) {
    const session = this._session.get();
    if (!session) {
      return;
    }
    const provider = this._sessionsProvidersService.getProvider(session.providerId);
    if (provider instanceof CopilotChatSessionsProvider) {
      const chatSession = provider.getSession(session.sessionId);
      if (!chatSession) {
        return;
      }
      if (chatSession.setOption) {
        chatSession.setPermissionLevel(level);
        chatSession.setOption(PERMISSION_LEVEL_OPTION_ID2, level);
      } else {
        this._chatSessionsService.setSessionOption(chatSession.resource, PERMISSION_LEVEL_OPTION_ID2, level);
      }
    }
  }
};

CopilotPermissionPickerDelegate = __decorateClass([
  __decorateParam(1, ISessionsProvidersService),
  __decorateParam(2, IChatSessionsService)
], CopilotPermissionPickerDelegate);
export { getPermissionLevelMeta2, PERMISSION_LEVEL_OPTION_ID2, DEFAULT_PERMISSION_LEVELS2, PermissionPicker, CopilotPermissionPickerDelegate };
