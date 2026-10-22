// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostModePicker.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { renderIcon } from "./module-0467.mjs";
import { reportNewChatPickerClosed } from "./module-3541.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ChatPetAchievementIds, didExplicitlyEnableChatPetAutopilot } from "./module-2111.mjs";
import { isWellKnownModeSchema } from "./module-3693.mjs";
import { getAgentHostModeIcon } from "./module-3692.mjs";
import { localize } from "./module-0001.mjs";
import { IChatPetService } from "./module-2112.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostModePicker.ts
var AgentHostSessionEnumPicker = class extends Disposable {
  constructor(_session, _actionWidgetService, _sessionsProvidersService, _telemetryService, _hoverService) {
    super();
    this._session = _session;
    this._actionWidgetService = _actionWidgetService;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._telemetryService = _telemetryService;
    this._hoverService = _hoverService;
    this._renderDisposables = this._register(new DisposableStore());
    this._providerListeners = this._register(new DisposableMap());
    this._register(autorun((reader) => {
      this._session.read(reader);
      this._updateTrigger();
    }));
    this._register(this._sessionsProvidersService.onDidChangeProviders((e4) => {
      for (const provider of e4.removed) {
        this._providerListeners.deleteAndDispose(provider.id);
      }
      this._watchProviders(e4.added);
      this._updateTrigger();
    }));
    this._watchProviders(this._sessionsProvidersService.getProviders());
  }
  render(container2) {
    this._renderDisposables.clear();
    this._containerElement = container2;
    const slot = append(container2, $(".sessions-chat-picker-slot"));
    this._renderDisposables.add({ dispose: () => slot.remove() });
    this._slotElement = slot;
    const trigger = append(slot, $("a.action-label"));
    trigger.tabIndex = 0;
    trigger.role = "button";
    this._triggerElement = trigger;
    this._renderDisposables.add(this._hoverService.setupDelayedHover(trigger, () => ({ content: this._getActiveContext()?.tooltip ?? "" })));
    this._renderDisposables.add(Gesture.addTarget(trigger));
    for (const eventType of [EventType.CLICK, EventType2.Tap]) {
      this._renderDisposables.add(addDisposableListener(trigger, eventType, (e4) => {
        EventHelper.stop(e4, true);
        this._showPicker();
      }));
    }
    this._renderDisposables.add(addDisposableListener(trigger, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        EventHelper.stop(e4, true);
        this._showPicker();
      }
    }));
    this._updateTrigger();
  }
  _watchProviders(providers2) {
    for (const provider of providers2) {
      if (!isAgentHostProvider(provider) || this._providerListeners.has(provider.id)) {
        continue;
      }
      this._providerListeners.set(provider.id, provider.onDidChangeSessionConfig(() => this._updateTrigger()));
    }
  }
  _getFooterActionItems() {
    return [];
  }
  _handleFooterActionItem(_item) {
    return false;
  }
  _onDidSelectValue(_previousValue, _selectedValue) {
  }
  /**
   * Optional list-widget options for the picker popup. Subclasses whose
   * option descriptions are long (e.g. the Codex approvals presets) return a
   * bounded `maxWidth` plus a `className`/`detailItemHeight` so the detail text
   * wraps within a compact box instead of stretching the popup horizontally.
   */
  _getListOptions() {
    return void 0;
  }
  /**
   * `true` while the active session's provider is resolving its config.
   * Subclasses gate picker-open paths on this; the desktop chip is
   * rendered visually disabled in {@link _updateTrigger}.
   */
  _isCurrentlyResolvingConfig() {
    const session = this._session.get();
    if (!session) {
      return false;
    }
    const provider = this._sessionsProvidersService.getProvider(session.providerId);
    if (!provider || !isAgentHostProvider(provider)) {
      return false;
    }
    return provider.isSessionConfigResolving(session.sessionId).get();
  }
  showPicker(anchor, onHide) {
    return this._showPicker(anchor, onHide);
  }
  _getActiveContext() {
    const session = this._session.get();
    if (!session) {
      return void 0;
    }
    const rawProvider = this._sessionsProvidersService.getProvider(session.providerId);
    if (!rawProvider || !isAgentHostProvider(rawProvider)) {
      return void 0;
    }
    const config = rawProvider.getSessionConfig(session.sessionId);
    const schema10 = config?.schema.properties[this._property];
    if (!schema10 || !this._isWellKnownSchema(schema10)) {
      return void 0;
    }
    const enumValues = (schema10.enum ?? []).map((value2) => String(value2));
    const enumLabels = schema10.enumLabels ?? [];
    const enumDescriptions = schema10.enumDescriptions ?? [];
    const items = enumValues.map((value2, index2) => ({
      value: value2,
      label: enumLabels[index2] ?? value2,
      description: enumDescriptions[index2]
    }));
    const rawCurrent = config?.values[this._property] ?? schema10.default;
    const currentValue = typeof rawCurrent === "string" && enumValues.includes(rawCurrent) ? rawCurrent : enumValues[0] ?? "";
    return { provider: rawProvider, sessionId: session.sessionId, currentValue, items, tooltip: schema10.description ?? schema10.title ?? "" };
  }
  _updateTrigger() {
    if (!this._triggerElement || !this._slotElement || !this._containerElement) {
      return;
    }
    const ctx = this._getActiveContext();
    if (!ctx) {
      this._slotElement.style.display = "none";
      this._containerElement.style.display = "none";
      return;
    }
    this._slotElement.style.display = "";
    this._containerElement.style.display = "";
    clearNode(this._triggerElement);
    const item = ctx.items.find((i2) => i2.value === ctx.currentValue);
    const label3 = item?.label ?? ctx.currentValue;
    const icon2 = this._getTriggerIcon(ctx.currentValue);
    if (icon2) {
      append(this._triggerElement, renderIcon(icon2));
    }
    const labelSpan = append(this._triggerElement, $("span.sessions-chat-dropdown-label"));
    labelSpan.textContent = label3;
    this._triggerElement.ariaLabel = this._getTriggerAriaLabel(label3);
    const isResolving = ctx.provider.isSessionConfigResolving(ctx.sessionId).get();
    this._slotElement.classList.toggle("resolving", isResolving);
    this._triggerElement.setAttribute("aria-disabled", isResolving ? "true" : "false");
  }
  _showPicker(anchor = this._triggerElement, onHide) {
    if (!anchor || this._actionWidgetService.isVisible) {
      return false;
    }
    const ctx = this._getActiveContext();
    if (!ctx) {
      return false;
    }
    if (this._isCurrentlyResolvingConfig()) {
      return false;
    }
    const actionItems = ctx.items.map((item) => ({
      kind: "action" /* Action */,
      label: item.label,
      detail: item.description,
      group: { title: "", icon: this._getActionItemIcon(item, ctx.currentValue) },
      item: { ...item, checked: item.value === ctx.currentValue }
    }));
    actionItems.push(...this._getFooterActionItems());
    const delegate = {
      onSelect: (item) => {
        this._actionWidgetService.hide();
        if (this._handleFooterActionItem(item)) {
          return;
        }
        if (!ctx.items.some((candidate) => candidate.value === item.value)) {
          return;
        }
        const previousItem = ctx.items.find((i2) => i2.value === ctx.currentValue);
        reportNewChatPickerClosed(this._telemetryService, {
          id: this._telemetryId,
          optionIdBefore: ctx.currentValue,
          optionIdAfter: item.value,
          optionLabelBefore: previousItem?.label ?? ctx.currentValue,
          optionLabelAfter: item.label,
          isPII: false
        });
        ctx.provider.setSessionConfigValue(ctx.sessionId, this._property, item.value).then(() => this._onDidSelectValue(ctx.currentValue, item.value)).catch(() => {
        });
      },
      onHide: () => {
        anchor.focus();
        onHide?.();
      }
    };
    this._actionWidgetService.show(
      this._pickerId,
      false,
      actionItems,
      delegate,
      anchor,
      void 0,
      [],
      {
        getAriaLabel: (i2) => i2.label ?? "",
        getWidgetAriaLabel: () => this._getWidgetAriaLabel()
      },
      this._getListOptions()
    );
    return true;
  }
};

AgentHostSessionEnumPicker = __decorateClass([
  __decorateParam(1, IActionWidgetService),
  __decorateParam(2, ISessionsProvidersService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IHoverService)
], AgentHostSessionEnumPicker);

var AgentHostModePicker = class extends AgentHostSessionEnumPicker {
  constructor(session, actionWidgetService, sessionsProvidersService, telemetryService, hoverService, _chatPetService) {
    super(session, actionWidgetService, sessionsProvidersService, telemetryService, hoverService);
    this._chatPetService = _chatPetService;
    this._property = "mode" /* Mode */;
    this._pickerId = "agentHostModePicker";
    this._telemetryId = "NewChatAgentHostModePicker";
  }
  _onDidSelectValue(previousValue, selectedValue) {
    if (didExplicitlyEnableChatPetAutopilot(previousValue, selectedValue)) {
      this._chatPetService.unlockAchievement(ChatPetAchievementIds.AutopilotEnabled);
    }
  }
  _getListOptions() {
    return { minWidth: 260 };
  }
  _isWellKnownSchema(schema10) {
    return isWellKnownModeSchema(schema10);
  }
  _getTriggerIcon(value2) {
    return getAgentHostModeIcon(value2);
  }
  _getActionItemIcon(item) {
    return getAgentHostModeIcon(item.value);
  }
  _getTriggerAriaLabel(label3) {
    return localize(4919, null, label3);
  }
  _getWidgetAriaLabel() {
    return localize(4918, null);
  }
};

AgentHostModePicker = __decorateClass([
  __decorateParam(1, IActionWidgetService),
  __decorateParam(2, ISessionsProvidersService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IChatPetService)
], AgentHostModePicker);
export { AgentHostSessionEnumPicker, AgentHostModePicker };
