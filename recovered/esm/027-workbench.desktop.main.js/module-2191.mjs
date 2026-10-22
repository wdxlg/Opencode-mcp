// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerConfiguration.ts
import { localize } from "./module-0001.mjs";
import { formatTokenCount } from "./module-0040.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { $, getActiveElement, isHTMLElement, reset } from "./module-0075.mjs";
import { withChatInputPickerMotion } from "./module-2096.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { TelemetryTrustedValue } from "./module-0885.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerConfiguration.ts
var ModelPickerConfiguration = class {
  constructor(_host, _actionWidgetService, _telemetryService) {
    this._host = _host;
    this._actionWidgetService = _actionWidgetService;
    this._telemetryService = _telemetryService;
  }
  renderButton(button, compact2, noModelsAvailable) {
    const model = this._host.getSelectedModel();
    const effortConfig = this._getConfigProperty("navigation");
    const speedConfig = this._getConfigProperty("speed");
    const tokensConfig = this._getConfigProperty("tokens");
    if (!model || noModelsAvailable || !effortConfig && !speedConfig && !tokensConfig) {
      button.style.display = "none";
      return;
    }
    const labelParts = [];
    const ariaParts = [];
    if (effortConfig && effortConfig.value !== void 0) {
      const enumIndex = effortConfig.schema.enum?.indexOf(effortConfig.value) ?? -1;
      const effortLabel = enumIndex >= 0 && effortConfig.schema.enumItemLabels?.[enumIndex] ? effortConfig.schema.enumItemLabels[enumIndex] : String(effortConfig.value);
      labelParts.push(compact2 || !!effortConfig.schema.title ? effortLabel : localize(12556, null, effortLabel));
      ariaParts.push(effortConfig.schema.title ? localize(12557, null, effortConfig.schema.title, effortLabel) : localize(12555, null, effortLabel));
    }
    if (speedConfig && speedConfig.value !== void 0) {
      const enumIndex = speedConfig.schema.enum?.indexOf(speedConfig.value) ?? -1;
      const speedLabel = enumIndex >= 0 && speedConfig.schema.enumItemLabels?.[enumIndex] ? speedConfig.schema.enumItemLabels[enumIndex] : String(speedConfig.value);
      labelParts.push(compact2 ? speedLabel : localize(12559, null, speedLabel));
      ariaParts.push(localize(12558, null, speedLabel));
    }
    if (tokensConfig && tokensConfig.value !== void 0 && !compact2) {
      const enumIndex = tokensConfig.schema.enum?.indexOf(tokensConfig.value) ?? -1;
      const tokensLabel = enumIndex >= 0 && tokensConfig.schema.enumItemLabels?.[enumIndex] ? tokensConfig.schema.enumItemLabels[enumIndex] : formatTokenCount(Number(tokensConfig.value));
      labelParts.push(tokensLabel);
      ariaParts.push(localize(12560, null, tokensLabel));
    }
    if (!labelParts.length) {
      const fallbackLabel = effortConfig?.schema.title ?? speedConfig?.schema.title ?? tokensConfig?.schema.title ?? localize(12554, null);
      labelParts.push(fallbackLabel);
      ariaParts.push(fallbackLabel);
    }
    if (compact2) {
      const icon2 = renderIcon(Codicon.settingsGear);
      icon2.setAttribute("aria-hidden", "true");
      reset(button, icon2);
    } else {
      reset(button, $("span.chat-input-picker-label", void 0, labelParts.join(" ")));
    }
    button.style.display = "";
    button.ariaLabel = ariaParts.join(", ");
  }
  show(button, focusGroup) {
    if (this._host.isDisabled() || !button || !this._host.getSelectedModel()) {
      return;
    }
    const items = this._buildItems();
    if (!items.length) {
      return;
    }
    const previouslyFocusedElement = getActiveElement();
    const delegate = {
      onSelect: async (action) => {
        this._actionWidgetService.focusItemById(action.id);
        await action.run();
        this._actionWidgetService.updateItems(this._buildItems(), action.id);
      },
      onHide: () => {
        button.setAttribute("aria-expanded", "false");
        if (isHTMLElement(previouslyFocusedElement)) {
          previouslyFocusedElement.focus();
        }
      }
    };
    button.setAttribute("aria-expanded", "true");
    const showCacheBreakHint = this._host.shouldShowCacheBreakHint();
    this._actionWidgetService.show(
      "ChatModelConfigPicker",
      false,
      items,
      delegate,
      button,
      void 0,
      [],
      {
        isChecked: (element) => element.kind === "action" /* Action */ ? !!element.item?.checked : void 0,
        getRole: (element) => element.kind === "action" /* Action */ ? "menuitemradio" : "separator",
        getWidgetRole: () => "menu"
      },
      withChatInputPickerMotion({
        headerText: showCacheBreakHint ? localize(12552, null) : void 0,
        headerIcon: showCacheBreakHint ? Codicon.info : void 0,
        headerLink: showCacheBreakHint ? this._host.getCacheBreakLearnMoreLink() : void 0,
        headerDismiss: showCacheBreakHint ? this._host.dismissCacheBreakHint : void 0,
        reserveSubmenuSpace: false
      })
    );
    if (focusGroup) {
      const groupItem = items.find((item) => item.kind === "action" /* Action */ && item.item?.id?.startsWith(`${focusGroup}.`));
      if (groupItem?.kind === "action" /* Action */ && groupItem.item) {
        this._actionWidgetService.focusItemById(groupItem.item.id);
      }
    }
  }
  _getConfigProperty(group2) {
    const model = this._host.getSelectedModel();
    if (!model) {
      return void 0;
    }
    const schema10 = model.metadata.configurationSchema;
    if (!schema10?.properties) {
      return void 0;
    }
    const configurationAccess = this._host.getConfigurationAccess();
    const currentConfig = configurationAccess.getModelConfiguration(model.identifier) ?? {};
    for (const [key3, propSchema] of Object.entries(schema10.properties)) {
      if (propSchema.group !== group2 || !propSchema.enum?.length) {
        continue;
      }
      return { key: key3, value: currentConfig[key3] ?? propSchema.default, schema: propSchema };
    }
    return void 0;
  }
  _buildItems() {
    const model = this._host.getSelectedModel();
    if (!model) {
      return [];
    }
    const modelIdentifier = model.identifier;
    const configurationAccess = this._host.getConfigurationAccess();
    const items = [];
    const defaultLabel = localize(12563, null);
    const appendConfigSection = (group2, fallbackHeaderLabel, formatValueLabel, logChange) => {
      const config = this._getConfigProperty(group2);
      if (!config) {
        return;
      }
      const previousValue = String(config.value ?? "");
      const enumValues = config.schema.enum ?? [];
      if (items.length) {
        items.push({ kind: "separator" /* Separator */ });
      }
      items.push({ kind: "header" /* Header */, label: config.schema.title ?? fallbackHeaderLabel });
      for (let index2 = 0; index2 < enumValues.length; index2++) {
        const value2 = enumValues[index2];
        const isDefault = value2 === config.schema.default;
        const displayLabel = formatValueLabel(value2, config.schema.enumItemLabels?.[index2]);
        const enumDescription = config.schema.enumDescriptions?.[index2];
        const ariaDescriptionParts = [isDefault ? defaultLabel : void 0, enumDescription].filter((part) => !!part);
        const checked = config.value === value2;
        items.push({
          item: {
            id: `${group2}.${value2}`,
            enabled: true,
            checked,
            class: void 0,
            tooltip: enumDescription ?? "",
            label: displayLabel,
            run: () => {
              logChange(value2, previousValue, config.key);
              return configurationAccess.setModelConfiguration(modelIdentifier, { [config.key]: value2 });
            }
          },
          kind: "action" /* Action */,
          className: "chat-model-picker-config-option",
          label: displayLabel,
          description: isDefault ? defaultLabel : void 0,
          ariaDescription: ariaDescriptionParts.length ? ariaDescriptionParts.join(", ") : void 0,
          hover: enumDescription ? { content: enumDescription } : void 0,
          group: { title: "", icon: ThemeIcon.fromId(checked ? Codicon.check.id : Codicon.blank.id) },
          hideIcon: false
        });
      }
    };
    appendConfigSection(
      "navigation",
      localize(12553, null),
      (value2, enumLabel) => enumLabel ?? String(value2),
      (value2, previousValue, key3) => this._telemetryService.publicLog2("chat.thinkingEffortChange", {
        model: model.metadata.vendor === "copilot" ? new TelemetryTrustedValue(modelIdentifier) : "unknown",
        // Third-party providers choose their own property keys, so only
        // first-party ones are reported as a controlled vocabulary.
        property: model.metadata.vendor === "copilot" ? key3 : "unknown",
        fromValue: previousValue,
        toValue: String(value2)
      })
    );
    appendConfigSection(
      "speed",
      localize(12561, null),
      (value2, enumLabel) => enumLabel ?? String(value2),
      (value2, previousValue) => this._telemetryService.publicLog2("chat.speedTierChange", {
        model: model.metadata.vendor === "copilot" ? new TelemetryTrustedValue(modelIdentifier) : "unknown",
        fromValue: previousValue,
        toValue: String(value2)
      })
    );
    appendConfigSection(
      "tokens",
      localize(12562, null),
      (value2, enumLabel) => enumLabel ?? formatTokenCount(Number(value2)),
      (value2, previousValue) => this._telemetryService.publicLog2("chat.contextSizeChange", {
        model: model.metadata.vendor === "copilot" ? new TelemetryTrustedValue(modelIdentifier) : "unknown",
        fromValue: previousValue,
        toValue: String(value2)
      })
    );
    return items;
  }
};

ModelPickerConfiguration = __decorateClass([
  __decorateParam(1, IActionWidgetService),
  __decorateParam(2, ITelemetryService)
], ModelPickerConfiguration);
export { ModelPickerConfiguration };
