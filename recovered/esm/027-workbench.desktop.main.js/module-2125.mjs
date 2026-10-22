// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostChatInputPicker.ts
import { Codicon } from "./module-0085.mjs";
import { isAssistedPermissionsEnabled, isAutoApprovePolicyRestricted, isAutoApproveValuePolicyRestricted, isPermissionLevelVisible, normalizeSessionConfigValue } from "./module-2047.mjs";
import { SessionType } from "./module-0960.mjs";
import { IAgentHostService, getAgentHostCopilotSandboxSettingId } from "./module-1107.mjs";
import { localize } from "./module-0001.mjs";
import { getCodexApprovalsPickerListOptions } from "./module-2100.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { KNOWN_AUTO_APPROVE_VALUES } from "./module-2046.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Delayer } from "./module-0036.mjs";
import { AgentHostCustomTerminalToolEnabledSettingId } from "./module-2104.mjs";
import { autorun } from "./module-0052.mjs";
import { toAgentHostBackendSessionUri } from "./module-2074.mjs";
import { getChatSessionType, isUntitledChatSession } from "./module-0961.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { renderIcon } from "./module-0467.mjs";
import { getCompactCodicon } from "./module-2040.mjs";
import { URI } from "./module-0032.mjs";
import { withChatInputPickerMotion } from "./module-2096.mjs";
import { isAgentSandboxEnabledValue } from "./module-1105.mjs";
import { isChatPermissionLevel } from "./module-0964.mjs";
import { maybeConfirmElevatedPermissionLevel } from "./module-2106.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IAgentHostSessionWorkingDirectoryResolver } from "./module-2107.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IAgentHostUntitledProvisionalSessionService } from "./module-2124.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAgentHostNewSessionFolderService } from "./module-2108.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IAgentHostEnablementService } from "./module-0963.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostChatInputPicker.ts
var FILTER_THRESHOLD = 10;

var LEARN_MORE_VALUE = "__agentHostChatInputPicker.learnMore__";

var PERMISSIONS_LEARN_MORE_URL = "https://aka.ms/vscode/docs/permissions";

var CODEX_APPROVALS_LEARN_MORE_URL = "https://developers.openai.com/codex/concepts/sandboxing#how-you-control-it";

function getConfigIcon(property, value2) {
  if (property === "mode" /* Mode */) {
    switch (value2) {
      case "plan":
        return Codicon.checklist;
      case "autopilot":
        return Codicon.rocket;
      case "interactive":
        return Codicon.comment;
    }
  }
  if (property === "autoApprove" /* AutoApprove */) {
    if (value2 === "autopilot") {
      return Codicon.rocket;
    }
    if (value2 === "autoApprove") {
      return Codicon.warning;
    }
    if (value2 === "assisted") {
      return Codicon.sparkle;
    }
    return Codicon.shield;
  }
  if (property === "permissionMode" /* PermissionMode */ && typeof value2 === "string") {
    switch (value2) {
      case "default":
        return Codicon.shield;
      case "acceptEdits":
        return Codicon.edit;
      case "plan":
        return Codicon.lightbulb;
      case "auto":
        return Codicon.sparkle;
      case "bypassPermissions":
        return Codicon.warning;
    }
  }
  if (property === "codex.permissionsPreset" /* PermissionsPreset */ && typeof value2 === "string") {
    switch (value2) {
      case "default":
        return Codicon.shield;
      case "auto-review":
        return Codicon.sparkle;
      case "full-access":
        return Codicon.warning;
    }
  }
  return void 0;
}

function toActionItems(property, items, currentValue, policyRestricted = false, sandboxToggle) {
  const actionItems = items.map((item) => {
    const disabled = property === "autoApprove" /* AutoApprove */ && isAutoApproveValuePolicyRestricted(item.value, policyRestricted);
    const hover = getConfigPickerItemHover(property, item, disabled);
    return {
      kind: "action" /* Action */,
      label: item.label,
      detail: disabled ? hover : item.description,
      group: { title: "", icon: getConfigIcon(property, item.value) },
      disabled,
      ...hover ? { hover: { content: hover } } : {},
      item: { ...item, checked: isSelectedValue(currentValue, item.value) }
    };
  });
  if (property === "autoApprove" /* AutoApprove */ && sandboxToggle) {
    actionItems.push({
      kind: "separator" /* Separator */,
      label: ""
    });
    actionItems.push({
      kind: "action" /* Action */,
      label: sandboxToggle.label,
      group: { title: "", icon: Codicon.blank },
      standaloneToggle: sandboxToggle,
      item: { value: "__sandboxToggle", label: sandboxToggle.label, checked: false }
    });
  }
  return actionItems;
}

function getAgentHostSandboxSettingId(sessionType, customTerminalToolEnabled, windows) {
  if (sessionType !== SessionType.AgentHostCopilot) {
    return void 0;
  }
  return getAgentHostCopilotSandboxSettingId(customTerminalToolEnabled, windows);
}

function getConfigPickerTriggerLabel(schema10, value2, sandboxed) {
  let label3;
  if (schema10.type === "boolean") {
    label3 = value2 === true ? localize(8941, null) : localize(8940, null);
  } else if (typeof value2 === "string") {
    const index2 = schema10.enum?.indexOf(value2) ?? -1;
    label3 = index2 >= 0 ? schema10.enumLabels?.[index2] ?? value2 : value2;
  } else {
    label3 = schema10.title;
  }
  return sandboxed ? localize(8950, null, label3) : label3;
}

function isSelectedValue(currentValue, itemValue) {
  if (typeof currentValue === "boolean") {
    return currentValue === (itemValue === "true");
  }
  return itemValue === currentValue;
}

function getAutoApproveHover(value2, fallback2) {
  switch (value2) {
    case "default" /* Default */:
      return localize(8943, null);
    case "assisted" /* Assisted */:
      return localize(8936, null);
    case "autoApprove" /* AutoApprove */:
      return localize(8937, null);
    case "autopilot" /* Autopilot */:
      return localize(8938, null);
  }
  return fallback2 ?? localize(8933, null);
}

function getEnumValueDescription(schema10, value2) {
  if (typeof value2 !== "string") {
    return void 0;
  }
  const index2 = schema10.enum?.indexOf(value2) ?? -1;
  return index2 >= 0 ? schema10.enumDescriptions?.[index2] : void 0;
}

function getConfigPickerTriggerHover(property, schema10, value2, isReadOnly2) {
  if (property === "codex.permissionsPreset" /* PermissionsPreset */) {
    return getEnumValueDescription(schema10, value2) ?? schema10.description ?? schema10.title;
  }
  if (property !== "autoApprove" /* AutoApprove */) {
    return schema10.description ?? schema10.title;
  }
  const hover = getAutoApproveHover(value2, getEnumValueDescription(schema10, value2));
  if (isReadOnly2) {
    return localize(8934, null, hover);
  }
  return hover;
}

function getConfigPickerItemHover(property, item, disabled) {
  if (disabled) {
    return localize(8949, null);
  }
  if (property === "autoApprove" /* AutoApprove */) {
    return getAutoApproveHover(item.value, item.description);
  }
  return void 0;
}

function getPermissionsLearnMoreUrl(property) {
  if (property === "codex.permissionsPreset" /* PermissionsPreset */) {
    return CODEX_APPROVALS_LEARN_MORE_URL;
  }
  if (property === "permissionMode" /* PermissionMode */ || property === "autoApprove" /* AutoApprove */) {
    return PERMISSIONS_LEARN_MORE_URL;
  }
  return void 0;
}

function getConfigPickerListOptions(property) {
  switch (property) {
    case "mode" /* Mode */:
      return { minWidth: 260 };
    case "autoApprove" /* AutoApprove */:
      return { minWidth: 255 };
    case "codex.permissionsPreset" /* PermissionsPreset */:
      return getCodexApprovalsPickerListOptions();
    default:
      return void 0;
  }
}

function renderPickerTrigger(slot, disabled, disposables, onOpen) {
  const trigger = append(slot, disabled ? $("span.action-label") : $("a.action-label"));
  if (disabled) {
    trigger.setAttribute("aria-readonly", "true");
  } else {
    trigger.role = "button";
    trigger.tabIndex = 0;
    trigger.setAttribute("aria-haspopup", "listbox");
    disposables.add(Gesture.addTarget(trigger));
    for (const eventType of [EventType.CLICK, EventType2.Tap]) {
      disposables.add(addDisposableListener(trigger, eventType, (e) => {
        EventHelper.stop(e, true);
        onOpen();
      }));
    }
    disposables.add(addDisposableListener(trigger, EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        EventHelper.stop(e, true);
        onOpen();
      }
    }));
  }
  slot.classList.toggle("disabled", disabled);
  return trigger;
}

function isWellKnownAutoApproveSchema(schema10) {
  if (schema10.type !== "string" || !Array.isArray(schema10.enum) || schema10.enum.length === 0) {
    return false;
  }
  if (!schema10.enum.includes("default")) {
    return false;
  }
  return schema10.enum.every((value2) => typeof value2 === "string" && KNOWN_AUTO_APPROVE_VALUES.has(value2));
}

var WELL_KNOWN_PICKER_PROPERTIES = /* @__PURE__ */ new Set([
  "mode" /* Mode */,
  "autoApprove" /* AutoApprove */,
  "isolation" /* Isolation */,
  "branch" /* Branch */,
  "permissions" /* Permissions */,
  "worktreeBranchPrefix" /* WorktreeBranchPrefix */,
  "worktreeBranchTrack" /* WorktreeBranchTrack */,
  "worktreeCreateNewBranch" /* WorktreeCreateNewBranch */,
  "worktreeIncludeFiles" /* WorktreeIncludeFiles */,
  "permissionMode" /* PermissionMode */,
  "codex.permissionsPreset" /* PermissionsPreset */
]);

function isClaimedByDedicatedPicker(property, schema10) {
  if (property === "autoApprove" /* AutoApprove */) {
    return isWellKnownAutoApproveSchema(schema10);
  }
  return WELL_KNOWN_PICKER_PROPERTIES.has(property);
}

function resolveConfigChipValue(isUntitled, serverValue, overlayValue, schemaDefault) {
  const preferred = isUntitled ? overlayValue ?? serverValue : serverValue ?? overlayValue;
  return preferred ?? schemaDefault;
}

var AgentHostChatInputPicker = class extends Disposable {
  constructor(_widget, _property, _agentHostService, _actionWidgetService, _hoverService, _openerService, _workingDirectoryResolver, _workspaceContextService, _provisional, _configurationService, _newSessionFolderService, _dialogService, _storageService, _agentHostEnablementService) {
    super();
    this._widget = _widget;
    this._property = _property;
    this._agentHostService = _agentHostService;
    this._actionWidgetService = _actionWidgetService;
    this._hoverService = _hoverService;
    this._openerService = _openerService;
    this._workingDirectoryResolver = _workingDirectoryResolver;
    this._workspaceContextService = _workspaceContextService;
    this._provisional = _provisional;
    this._configurationService = _configurationService;
    this._newSessionFolderService = _newSessionFolderService;
    this._dialogService = _dialogService;
    this._storageService = _storageService;
    this._agentHostEnablementService = _agentHostEnablementService;
    this._initialResolveCts = this._registerInitialResolveCts();
    this._renderDisposables = this._register(new DisposableStore());
    this._filterDelayer = this._register(new Delayer(200));
    this._subRef = this._register(new MutableDisposable());
    this._register(this._widget.onDidChangeViewModel(() => {
      this._reattach();
    }));
    this._register(this._provisional.onDidChange((sessionResource) => {
      const current = this._widget.viewModel?.sessionResource;
      if (current && current.toString() === sessionResource.toString()) {
        this._reattach();
      }
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      const sandboxSettingId = this._getSandboxSettingId();
      if (e.affectsConfiguration("chat.experimental.permissionsSandboxToggle.enabled" /* PermissionsSandboxToggleEnabled */) || e.affectsConfiguration(AgentHostCustomTerminalToolEnabledSettingId) || sandboxSettingId && e.affectsConfiguration(sandboxSettingId)) {
        this._refreshTrigger();
      }
    }));
    this._reattach();
    this._register(autorun((reader) => {
      this._agentHostEnablementService.managedSandboxEnforced.read(reader);
      this._refreshTrigger();
    }));
  }
  _registerInitialResolveCts() {
    const cts = new MutableDisposable();
    this._register(toDisposable(() => {
      this._container = void 0;
      this._trigger = void 0;
      this._cancelInitialResolve();
    }));
    return this._register(cts);
  }
  render(container3) {
    this._container = container3;
    container3.classList.add("agent-host-chat-input-picker-host");
    container3.classList.add(`agent-host-chat-input-picker-host-${this._property}`);
    this._renderChip();
  }
  show(anchor) {
    void this._showPicker(anchor);
  }
  _reattach() {
    const sessionResource = this._widget.viewModel?.sessionResource;
    const provisionalBackend = sessionResource ? this._provisional.get(sessionResource) : void 0;
    const backendSession = provisionalBackend ?? (sessionResource ? toAgentHostBackendSessionUri(sessionResource) : void 0);
    if (!sessionResource || !backendSession) {
      this._subRef.clear();
      this._initialResolved = void 0;
      this._cancelInitialResolve();
      this._renderChip();
      return;
    }
    if (isUntitledChatSession(sessionResource) && !provisionalBackend) {
      this._subRef.clear();
      if (!this._initialResolved || this._initialResolved.sessionResource.toString() !== sessionResource.toString()) {
        this._initialResolved = void 0;
        void this._refreshInitialResolved(sessionResource, backendSession);
      }
      void this._provisional.getOrCreate(
        sessionResource,
        backendSession.scheme,
        this._readWorkingDirectory()
      );
      this._renderChip();
      return;
    }
    this._initialResolved = void 0;
    this._cancelInitialResolve();
    const ref = this._agentHostService.getSubscription(1 /* Session */, backendSession, "AgentHostChatInputPicker");
    const sub = ref.object;
    const listener = sub.onDidChange(() => this._renderChip());
    this._subRef.value = {
      sub,
      backendSession,
      dispose: () => {
        listener.dispose();
        ref.dispose();
      }
    };
    this._renderChip();
  }
  _cancelInitialResolve() {
    this._initialResolveCts.value?.cancel();
    this._initialResolveCts.clear();
  }
  async _refreshInitialResolved(sessionResource, backendSession) {
    this._initialResolveCts.value?.cancel();
    const cts = new CancellationTokenSource();
    this._initialResolveCts.value = cts;
    try {
      const result = await this._agentHostService.resolveSessionConfig({
        provider: backendSession.scheme,
        workingDirectory: this._readWorkingDirectory()
      });
      if (cts.token.isCancellationRequested || this._widget.viewModel?.sessionResource?.toString() !== sessionResource.toString()) {
        return;
      }
      this._initialResolved = { sessionResource, result };
      this._renderChip();
    } catch {
    }
  }
  _renderChip() {
    if (!this._container || this._renderDisposables.isDisposed) {
      return;
    }
    this._trigger = void 0;
    this._renderDisposables.clear();
    clearNode(this._container);
    this._container.classList.remove("agent-host-chat-input-picker-has-icon");
    const ctx = this._readContext();
    const sessionResource = this._widget.viewModel?.sessionResource;
    const isStartedSession = !!sessionResource && !isUntitledChatSession(sessionResource);
    if (!ctx || isStartedSession && ctx.schema.sessionMutable === false) {
      this._container.style.display = "none";
      this._container.classList.add("agent-host-chat-input-picker-host-hidden");
      return;
    }
    if (this._property === "autoApprove" /* AutoApprove */ && !isWellKnownAutoApproveSchema(ctx.schema)) {
      this._container.style.display = "none";
      this._container.classList.add("agent-host-chat-input-picker-host-hidden");
      return;
    }
    this._container.style.display = "";
    this._container.classList.remove("agent-host-chat-input-picker-host-hidden");
    const slot = append(this._container, $(".agent-host-chat-input-picker-slot"));
    this._renderDisposables.add({ dispose: () => slot.remove() });
    const isReadOnly2 = !!ctx.schema.readOnly || isStartedSession && ctx.schema.sessionMutable === false;
    const trigger = renderPickerTrigger(slot, isReadOnly2, this._renderDisposables, () => this._showPicker(trigger));
    this._trigger = trigger;
    const tooltip = getConfigPickerTriggerHover(this._property, ctx.schema, ctx.value, isReadOnly2);
    if (tooltip) {
      this._renderDisposables.add(this._hoverService.setupDelayedHover(trigger, { content: tooltip }));
    }
    this._renderTrigger(trigger, ctx.schema, ctx.value, isReadOnly2);
  }
  _renderTrigger(trigger, schema10, value2, isReadOnly2) {
    clearNode(trigger);
    const icon2 = getConfigIcon(this._property, value2);
    this._container?.classList.toggle("agent-host-chat-input-picker-has-icon", !!icon2);
    if (icon2) {
      append(trigger, renderIcon(getCompactCodicon(icon2)));
    }
    if (this._property === "autoApprove" /* AutoApprove */) {
      trigger.classList.toggle("warning", value2 === "autopilot" || value2 === "assisted");
      trigger.classList.toggle("info", value2 === "autoApprove");
    }
    const label3 = this._labelFor(schema10, value2);
    const labelSpan = append(trigger, $("span.agent-host-chat-input-picker-label"));
    labelSpan.textContent = label3;
    trigger.setAttribute("aria-label", isReadOnly2 ? localize(8952, null, schema10.title, label3) : localize(8951, null, schema10.title, label3));
  }
  _refreshTrigger() {
    const trigger = this._trigger;
    const ctx = this._readContext();
    if (!trigger || !ctx) {
      return;
    }
    const sessionResource = this._widget.viewModel?.sessionResource;
    const isStartedSession = !!sessionResource && !isUntitledChatSession(sessionResource);
    const isReadOnly2 = !!ctx.schema.readOnly || isStartedSession && ctx.schema.sessionMutable === false;
    this._renderTrigger(trigger, ctx.schema, ctx.value, isReadOnly2);
  }
  _labelFor(schema10, value2) {
    const sandboxed = this._property === "autoApprove" /* AutoApprove */ && this._isSandboxToggleSettingEnabled() && this._isSandboxingEnabled();
    return getConfigPickerTriggerLabel(schema10, value2, sandboxed);
  }
  _readContext() {
    const sessionResource = this._widget.viewModel?.sessionResource;
    if (!sessionResource) {
      return void 0;
    }
    if (this._subRef.value) {
      const state = this._subRef.value.sub.value;
      if (!state || state instanceof Error) {
        return void 0;
      }
      const overlay = this._provisional.getResolvedConfig(sessionResource);
      const schemaSource = overlay?.schema ?? state.config?.schema;
      const schema10 = schemaSource?.properties[this._property];
      if (!schema10) {
        return void 0;
      }
      const serverValue = state.config?.values?.[this._property];
      const overlayValue = overlay?.values?.[this._property];
      const value2 = resolveConfigChipValue(isUntitledChatSession(sessionResource), serverValue, overlayValue, schema10.default);
      return { backendSession: this._subRef.value.backendSession, schema: schema10, value: value2 };
    }
    if (this._initialResolved && this._initialResolved.sessionResource.toString() === sessionResource.toString()) {
      const schema10 = this._initialResolved.result.schema.properties[this._property];
      if (!schema10) {
        return void 0;
      }
      const backendSession = toAgentHostBackendSessionUri(sessionResource);
      if (!backendSession) {
        return void 0;
      }
      const value2 = this._initialResolved.result.values?.[this._property] ?? schema10.default;
      return { backendSession, schema: schema10, value: value2 };
    }
    return void 0;
  }
  async _showPicker(trigger) {
    if (this._actionWidgetService.isVisible) {
      return;
    }
    const ctx = this._readContext();
    if (!ctx || ctx.schema.readOnly) {
      return;
    }
    const items = await this._getItems(ctx.schema);
    if (items.length === 0) {
      return;
    }
    const currentValue = ctx.value;
    const policyRestricted = isAutoApprovePolicyRestricted(this._configurationService);
    const actionItems = toActionItems(this._property, items, currentValue, policyRestricted, this._getSandboxStandaloneToggle());
    const permissionsLearnMoreUrl = getPermissionsLearnMoreUrl(this._property);
    if (permissionsLearnMoreUrl) {
      const learnMoreLabel = localize(8947, null);
      actionItems.push({
        kind: "separator" /* Separator */,
        label: ""
      });
      actionItems.push({
        kind: "action" /* Action */,
        label: learnMoreLabel,
        group: { title: "", icon: Codicon.blank },
        item: { value: LEARN_MORE_VALUE, label: learnMoreLabel }
      });
    }
    const delegate = {
      onSelect: (item) => {
        this._actionWidgetService.hide();
        if (item.value === LEARN_MORE_VALUE) {
          if (permissionsLearnMoreUrl) {
            void this._openerService.open(URI.parse(permissionsLearnMoreUrl));
          }
          return;
        }
        void this._confirmAndSetValue(ctx.backendSession, item);
      },
      onFilter: ctx.schema.enumDynamic ? (query) => this._filterDelayer.trigger(async () => {
        const refreshed = this._readContext();
        if (!refreshed) {
          return [];
        }
        return toActionItems(this._property, await this._getItems(refreshed.schema, query), refreshed.value, isAutoApprovePolicyRestricted(this._configurationService), this._getSandboxStandaloneToggle());
      }) : void 0,
      onHide: () => trigger.focus()
    };
    this._actionWidgetService.show(
      `agentHostChatInputPicker.${this._property}`,
      false,
      actionItems,
      delegate,
      trigger,
      void 0,
      [],
      {
        getAriaLabel: (item) => item.label ?? "",
        getWidgetAriaLabel: () => localize(8935, null, ctx.schema.title)
      },
      withChatInputPickerMotion({
        ...getConfigPickerListOptions(this._property),
        ...actionItems.length > FILTER_THRESHOLD || ctx.schema.enumDynamic ? { showFilter: true, filterPlaceholder: localize(8946, null) } : {}
      })
    );
  }
  _getSandboxSettingId() {
    const sessionResource = this._widget.viewModel?.sessionResource;
    const sessionType = sessionResource ? getChatSessionType(sessionResource) : void 0;
    const customTerminalToolEnabled = this._configurationService.getValue(AgentHostCustomTerminalToolEnabledSettingId) === true;
    return getAgentHostSandboxSettingId(sessionType, customTerminalToolEnabled);
  }
  _isSandboxToggleSettingEnabled() {
    return this._configurationService.getValue("chat.experimental.permissionsSandboxToggle.enabled" /* PermissionsSandboxToggleEnabled */) === true;
  }
  _isSandboxingEnabled() {
    if (this._agentHostEnablementService.managedSandboxEnforced.get()) {
      return true;
    }
    const settingId = this._getSandboxSettingId();
    return settingId !== void 0 && isAgentSandboxEnabledValue(this._configurationService.getValue(settingId));
  }
  _getSandboxStandaloneToggle() {
    const settingId = this._getSandboxSettingId();
    if (this._property !== "autoApprove" /* AutoApprove */ || !this._isSandboxToggleSettingEnabled() || !settingId) {
      return void 0;
    }
    const managed = this._agentHostEnablementService.managedSandboxEnforced.get();
    return {
      label: localize(8944, null),
      title: managed ? localize(8948, null) : localize(8945, null),
      checked: this._isSandboxingEnabled(),
      disabled: managed,
      onChange: (checked) => {
        if (this._agentHostEnablementService.managedSandboxEnforced.get()) {
          return;
        }
        const target = checked ? "on" /* On */ : "off" /* Off */;
        void this._configurationService.updateValue(settingId, target);
      }
    };
  }
  async _getItems(schema10, query) {
    if (schema10.type === "boolean") {
      return [
        { value: "true", label: localize(8942, null) },
        { value: "false", label: localize(8939, null) }
      ];
    }
    const sessionResource = this._widget.viewModel?.sessionResource;
    const backendSession = this._subRef.value?.backendSession ?? (sessionResource ? toAgentHostBackendSessionUri(sessionResource) : void 0);
    if (schema10.enumDynamic && backendSession) {
      try {
        const result = await this._agentHostService.sessionConfigCompletions({
          provider: backendSession.scheme,
          property: this._property,
          query,
          workingDirectory: this._readWorkingDirectory(),
          config: this._readCurrentValues()
        });
        return this._filterAutoApproveItems(result.items.map((item) => this._fromCompletion(item)));
      } catch {
      }
    }
    return this._filterAutoApproveItems((schema10.enum ?? []).map((value2, index2) => ({
      value: String(value2),
      label: schema10.enumLabels?.[index2] ?? String(value2),
      description: schema10.enumDescriptions?.[index2]
    })));
  }
  _filterAutoApproveItems(items) {
    if (this._property !== "autoApprove" /* AutoApprove */) {
      return items;
    }
    const assistedPermissionsEnabled = isAssistedPermissionsEnabled(this._configurationService);
    return items.filter((item) => isPermissionLevelVisible(item.value, assistedPermissionsEnabled));
  }
  _fromCompletion(item) {
    return { value: item.value, label: item.label, description: item.description };
  }
  _readWorkingDirectory() {
    const state = this._subRef.value?.sub.value;
    if (state && !(state instanceof Error)) {
      const cwd2 = state.workingDirectories?.[0];
      return typeof cwd2 === "string" ? URI.parse(cwd2) : cwd2;
    }
    const sessionResource = this._widget.viewModel?.sessionResource;
    return (sessionResource && this._newSessionFolderService.getFolder(sessionResource)) ?? (sessionResource && this._workingDirectoryResolver.resolve(sessionResource)) ?? this._newSessionFolderService.getDefaultFolder() ?? this._workspaceContextService.getWorkspace().folders[0]?.uri;
  }
  _readCurrentValues() {
    const sessionResource = this._widget.viewModel?.sessionResource;
    const overlay = sessionResource ? this._provisional.getResolvedConfig(sessionResource) : void 0;
    const state = this._subRef.value?.sub.value;
    if (state && !(state instanceof Error)) {
      return { ...state.config?.values ?? {}, ...overlay?.values ?? {} };
    }
    return overlay?.values ?? this._initialResolved?.result.values;
  }
  /**
   * Surfaces the shared elevated-level warning before applying an approval
   * pick. Unknown non-default values fall back to the Bypass warning.
   */
  async _confirmAndSetValue(backendSession, item) {
    const value2 = item.value;
    if (this._property === "autoApprove" /* AutoApprove */ && !isPermissionLevelVisible(value2, isAssistedPermissionsEnabled(this._configurationService))) {
      return;
    }
    if (this._property === "autoApprove" /* AutoApprove */) {
      const levelToConfirm = isChatPermissionLevel(value2) ? value2 : value2 !== "default" /* Default */ ? "autoApprove" /* AutoApprove */ : void 0;
      if (levelToConfirm) {
        const confirmed = await maybeConfirmElevatedPermissionLevel(levelToConfirm, this._dialogService, this._storageService, {
          defaultSettingKey: "chat.defaultConfiguration" /* DefaultConfiguration */,
          levelLabel: item.label
        });
        if (!confirmed) {
          return;
        }
      }
    }
    await this._setValue(backendSession, value2);
  }
  async _setValue(backendSession, value2) {
    const sessionResource = this._widget.viewModel?.sessionResource;
    if (!sessionResource) {
      return;
    }
    const ctx = this._readContext();
    const normalizedValue = ctx?.schema.type === "boolean" ? value2 === "true" : normalizeSessionConfigValue(this._property, value2, isAutoApprovePolicyRestricted(this._configurationService));
    const partial = { [this._property]: normalizedValue };
    const nextConfig = { ...this._readCurrentValues() ?? {}, ...partial };
    if (isUntitledChatSession(sessionResource)) {
      const provider = backendSession.scheme;
      const created = await this._provisional.applyConfigChange(
        sessionResource,
        provider,
        this._readWorkingDirectory(),
        partial
      );
      if (!created) {
        return;
      }
      if (!this._subRef.value || this._subRef.value.backendSession.toString() !== created.toString()) {
        this._reattach();
      }
      return;
    }
    this._agentHostService.dispatch(backendSession.toString(), {
      type: "session/configChanged" /* SessionConfigChanged */,
      config: partial
    });
    void this._provisional.refreshResolvedConfig(
      sessionResource,
      backendSession.scheme,
      this._readWorkingDirectory(),
      nextConfig
    );
  }
};

AgentHostChatInputPicker = __decorateClass([
  __decorateParam(2, IAgentHostService),
  __decorateParam(3, IActionWidgetService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IOpenerService),
  __decorateParam(6, IAgentHostSessionWorkingDirectoryResolver),
  __decorateParam(7, IWorkspaceContextService),
  __decorateParam(8, IAgentHostUntitledProvisionalSessionService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IAgentHostNewSessionFolderService),
  __decorateParam(11, IDialogService),
  __decorateParam(12, IStorageService),
  __decorateParam(13, IAgentHostEnablementService)
], AgentHostChatInputPicker);

var AgentHostChatInputPickerActionViewItem = class extends BaseActionViewItem {
  constructor(action, _picker) {
    super(void 0, action);
    this._picker = _picker;
    this._register(this._picker);
  }
  render(container3) {
    this._picker.render(container3);
  }
};
export { getConfigIcon, toActionItems, getAgentHostSandboxSettingId, getConfigPickerTriggerLabel, isSelectedValue, getAutoApproveHover, getEnumValueDescription, getConfigPickerTriggerHover, getConfigPickerItemHover, getPermissionsLearnMoreUrl, getConfigPickerListOptions, renderPickerTrigger, isWellKnownAutoApproveSchema, isClaimedByDedicatedPicker, resolveConfigChipValue, FILTER_THRESHOLD, LEARN_MORE_VALUE, PERMISSIONS_LEARN_MORE_URL, CODEX_APPROVALS_LEARN_MORE_URL, WELL_KNOWN_PICKER_PROPERTIES, AgentHostChatInputPicker, AgentHostChatInputPickerActionViewItem };
