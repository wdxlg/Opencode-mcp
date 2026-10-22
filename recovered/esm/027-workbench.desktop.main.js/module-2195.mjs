// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/permissionPickerActionItem.ts
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { isWindows } from "./module-0014.mjs";
import { ChatInputPickerActionViewItem } from "./module-2096.mjs";
import { maybeConfirmElevatedPermissionLevel } from "./module-2106.mjs";
import { SessionType } from "./module-0960.mjs";
import { URI } from "./module-0032.mjs";
import { Emitter } from "./module-0017.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { isAgentSandboxEnabledValue } from "./module-1105.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { getCompactCodicon } from "./module-2040.mjs";
import { $, reset } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/permissionPickerActionItem.ts
var DEFAULT_PERMISSION_LEVELS = [
  "default" /* Default */,
  "autoApprove" /* AutoApprove */,
  "autopilot" /* Autopilot */
];

function getPermissionLevelMeta(level) {
  switch (level) {
    case "assisted" /* Assisted */:
      return {
        id: "chat.permissions.assisted",
        label: localize(12645, null),
        shortLabel: localize(12647, null),
        detail: localize(12648, null),
        icon: ThemeIcon.fromId(Codicon.sparkle.id),
        description: localize(12646, null),
        elevated: true
      };
    case "autoApprove" /* AutoApprove */:
      return {
        id: "chat.permissions.autoApprove",
        label: localize(12649, null),
        shortLabel: localize(12651, null),
        detail: localize(12652, null),
        icon: ThemeIcon.fromId(Codicon.warning.id),
        description: localize(12650, null),
        elevated: true
      };
    case "autopilot" /* Autopilot */:
      return {
        id: "chat.permissions.autopilot",
        label: localize(12653, null),
        shortLabel: localize(12655, null),
        detail: localize(12656, null),
        icon: ThemeIcon.fromId(Codicon.rocket.id),
        description: localize(12654, null),
        elevated: true
      };
    case "default" /* Default */:
    default:
      return {
        id: "chat.permissions.default",
        label: localize(12657, null),
        shortLabel: localize(12659, null),
        detail: localize(12663, null),
        icon: ThemeIcon.fromId(Codicon.shield.id),
        description: localize(12658, null),
        elevated: false
      };
  }
}

function sanitizeIdSegment(value2) {
  return value2.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function getLocalSandboxEnabledSettingId() {
  return isWindows ? "chat.agent.sandbox.enabledWindows" /* AgentSandboxWindowsEnabled */ : "chat.agent.sandbox.enabled" /* AgentSandboxEnabled */;
}

var PermissionPickerActionItem = class extends ChatInputPickerActionViewItem {
  constructor(action, delegate, pickerOptions, actionWidgetService, keybindingService, contextKeyService, telemetryService, configurationService, dialogService, openerService, storageService, hoverService) {
    const isAutoApprovePolicyRestricted2 = () => configurationService.inspect("chat.tools.global.autoApprove" /* GlobalAutoApprove */).policyValue === false;
    const actionProvider = {
      getActions: () => {
        const ext = delegate.getExtensionPermissions?.();
        if (ext && ext.items.length > 0) {
          const sessionTypeSeg = sanitizeIdSegment(ext.sessionType);
          const groupSeg = sanitizeIdSegment(ext.groupId);
          return ext.items.map((item) => ({
            ...action,
            id: `chat.permissions.ext.${sessionTypeSeg}.${groupSeg}.${sanitizeIdSegment(item.id)}`,
            label: item.name,
            detail: item.description,
            icon: item.icon,
            checked: ext.selectedId === item.id,
            enabled: !item.locked,
            tooltip: item.locked ? localize(12665, null) : "",
            hover: item.description ? { content: item.description } : void 0,
            run: async () => {
              delegate.setExtensionPermission?.(ext.groupId, item);
              if (this.element) {
                this.renderLabel(this.element);
              }
            }
          }));
        }
        const currentLevel = delegate.currentPermissionLevel.get();
        const policyRestricted = isAutoApprovePolicyRestricted2();
        const sandboxToggleEnabled = this.isSandboxToggleAvailable();
        const sandboxTogglePresentation = delegate.sandboxTogglePresentation ?? "inline";
        const setSandboxEnabled = async (enableSandbox) => {
          if (this.isSandboxManaged()) {
            return;
          }
          const target = enableSandbox ? "on" /* On */ : "off" /* Off */;
          const settingId = this.getSandboxToggleSettingId();
          if (settingId && this.isSandboxingEnabled() !== enableSandbox) {
            await configurationService.updateValue(settingId, target);
          }
        };
        const sandboxManaged = this.isSandboxManaged();
        const sandboxToggle = sandboxToggleEnabled ? {
          label: localize(12660, null),
          title: sandboxManaged ? localize(12661, null) : localize(12662, null),
          checked: this.isSandboxingEnabled(),
          disabled: sandboxManaged,
          onChange: (checked) => {
            void setSandboxEnabled(checked);
          }
        } : void 0;
        const levels = delegate.availableLevels ?? DEFAULT_PERMISSION_LEVELS;
        const actions = levels.map((level) => {
          const meta = getPermissionLevelMeta(level);
          const disabledByPolicy = meta.elevated && policyRestricted;
          const hover = disabledByPolicy ? localize(12667, null) : delegate.getPermissionLevelHover?.(level, meta) ?? meta.description;
          const inlineToggle = sandboxTogglePresentation === "inline" && level === "default" /* Default */ ? sandboxToggle : void 0;
          return {
            ...action,
            id: meta.id,
            label: meta.label,
            detail: meta.detail,
            icon: meta.icon,
            checked: currentLevel === level,
            enabled: !disabledByPolicy,
            inlineToggle,
            tooltip: disabledByPolicy ? localize(12668, null) : "",
            hover: {
              content: hover
            },
            run: async () => {
              if (meta.elevated && !await maybeConfirmElevatedPermissionLevel(level, this.dialogService, storageService, {
                defaultSettingKey: delegate.defaultSettingKey,
                levelLabel: meta.label
              })) {
                return;
              }
              delegate.setPermissionLevel(level);
              if (this.element) {
                this.renderLabel(this.element);
              }
            }
          };
        });
        if (sandboxTogglePresentation === "standalone" && sandboxToggle) {
          actions.push({
            ...action,
            id: "chat.permissions.sandbox",
            label: sandboxToggle.label,
            icon: Codicon.blank,
            checked: false,
            enabled: true,
            standaloneToggle: sandboxToggle,
            category: { label: "sandbox", order: Number.MAX_SAFE_INTEGER },
            tooltip: "",
            run: async () => {
            }
          });
        }
        return actions;
      }
    };
    super(action, {
      actionProvider,
      actionBarActions: [{
        id: "chat.permissions.learnMore",
        label: localize(12666, null),
        tooltip: localize(12666, null),
        class: void 0,
        enabled: true,
        run: async () => {
          const ext = delegate.getExtensionPermissions?.();
          const url = ext?.sessionType === SessionType.AgentHostClaude ? "https://code.claude.com/docs/en/permission-modes#available-modes" : "https://aka.ms/vscode/docs/permissions";
          await openerService.open(URI.parse(url));
        }
      }],
      reporter: { id: "ChatPermissionPicker", name: "ChatPermissionPicker", includeOptions: true },
      listOptions: { minWidth: 255, detailItemHeight: 44, ...pickerOptions.listOptions }
    }, pickerOptions, actionWidgetService, keybindingService, contextKeyService, telemetryService);
    this.delegate = delegate;
    this.configurationService = configurationService;
    this.dialogService = dialogService;
    this.hoverService = hoverService;
    this._onDidDispose = this._register(new Emitter());
    this.onDidDispose = this._onDidDispose.event;
    this._currentTooltip = "";
    this._hover = this._register(new MutableDisposable());
    this._register(configurationService.onDidChangeConfiguration((e) => {
      const settingId = this.getSandboxToggleSettingId();
      const affectsSandboxToggle = e.affectsConfiguration("chat.experimental.permissionsSandboxToggle.enabled" /* PermissionsSandboxToggleEnabled */) || settingId !== void 0 && e.affectsConfiguration(settingId) || this.delegate.sandboxToggleConfigurationKeys?.some((key3) => e.affectsConfiguration(key3)) === true;
      if (affectsSandboxToggle && this.element) {
        this.renderLabel(this.element);
      }
    }));
    if (delegate.managedSandboxEnforced) {
      this._register(autorun((reader) => {
        delegate.managedSandboxEnforced?.read(reader);
        if (this.element) {
          this.renderLabel(this.element);
        }
      }));
    }
  }
  isSandboxingEnabled() {
    if (this.isSandboxManaged()) {
      return true;
    }
    const settingId = this.getSandboxToggleSettingId();
    if (!settingId) {
      return false;
    }
    const value2 = this.configurationService.getValue(settingId);
    return isAgentSandboxEnabledValue(value2);
  }
  isSandboxManaged() {
    return this.delegate.managedSandboxEnforced?.get() === true;
  }
  getSandboxToggleSettingId() {
    return this.delegate.getSandboxToggleSettingId ? this.delegate.getSandboxToggleSettingId() : getLocalSandboxEnabledSettingId();
  }
  isSandboxToggleSettingEnabled() {
    return this.configurationService.getValue("chat.experimental.permissionsSandboxToggle.enabled" /* PermissionsSandboxToggleEnabled */) === true;
  }
  /**
   * Whether the sandbox toggle should surface for the current harness: the
   * experimental setting must be on and the delegate must opt in.
   */
  isSandboxToggleAvailable() {
    return this.isSandboxToggleSettingEnabled() && this.delegate.isSandboxToggleApplicable?.() === true && this.getSandboxToggleSettingId() !== void 0;
  }
  renderLabel(element) {
    this.setAriaLabelAttributes(element);
    const ext = this.delegate.getExtensionPermissions?.();
    let icon2;
    let label3;
    let tooltip;
    const level = this.delegate.currentPermissionLevel.get();
    if (ext && ext.items.length > 0) {
      const selected = ext.items.find((i2) => i2.id === ext.selectedId) ?? ext.items.find((i2) => i2.default) ?? ext.items[0];
      icon2 = selected.icon ?? Codicon.lock;
      label3 = selected.name;
      tooltip = selected.description ?? selected.name;
    } else {
      const meta = getPermissionLevelMeta(level);
      icon2 = meta.icon;
      label3 = meta.shortLabel;
      tooltip = this.delegate.getPermissionLevelHover?.(level, meta) ?? meta.description;
      if (this.isSandboxToggleAvailable() && this.isSandboxingEnabled()) {
        label3 = this.delegate.sandboxTogglePresentation === "standalone" ? localize(12669, null, label3) : level === "default" /* Default */ ? localize(12664, null) : label3;
      }
    }
    const labelElements = [];
    labelElements.push(...renderLabelWithIcons(`$(${getCompactCodicon(icon2).id})`));
    const compact2 = this.pickerOptions.compact.get();
    element.classList.toggle("icon-only", compact2);
    if (!compact2) {
      labelElements.push($("span.chat-input-picker-label", void 0, label3));
    }
    reset(element, ...labelElements);
    element.classList.toggle("warning", !ext && (level === "autopilot" /* Autopilot */ || level === "assisted" /* Assisted */));
    element.classList.toggle("info", !ext && level === "autoApprove" /* AutoApprove */);
    this._currentTooltip = tooltip;
    element.setAttribute("aria-label", !ext && this.delegate.getPermissionLevelHover ? localize(12644, null, label3, tooltip) : localize(12643, null, label3));
    if (this._hoverElement !== element) {
      this._hoverElement = element;
      this._hover.value = this.hoverService.setupDelayedHover(element, () => ({ content: this._currentTooltip }));
    }
    return null;
  }
  refresh() {
    if (this.element) {
      this.renderLabel(this.element);
    }
  }
  dispose() {
    if (this._store.isDisposed) {
      return;
    }
    this._onDidDispose.fire();
    super.dispose();
  }
};

PermissionPickerActionItem = __decorateClass([
  __decorateParam(3, IActionWidgetService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, IOpenerService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, IHoverService)
], PermissionPickerActionItem);
export { getPermissionLevelMeta, sanitizeIdSegment, getLocalSandboxEnabledSettingId, DEFAULT_PERMISSION_LEVELS, PermissionPickerActionItem };
