// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatSessions/chatSessionPickerActionItem.ts
import { ActionWidgetDropdownActionViewItem } from "./module-2059.mjs";
import { withChatInputPickerMotion } from "./module-2096.mjs";
import { autorun } from "./module-0052.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { getModelHoverContent } from "./module-2098.mjs";
import { $, getActiveWindow, reset } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { renderIcon } from "./module-0467.mjs";
import { getCompactCodicon } from "./module-2040.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/workbench/contrib/chat/browser/chatSessions/chatSessionPickerActionItem.ts
var ChatSessionPickerActionItem = class extends ActionWidgetDropdownActionViewItem {
  constructor(action, initialState, delegate, _pickerOptions, actionWidgetService, contextKeyService, keybindingService, commandService, telemetryService, chatEntitlementService, openerService) {
    const { group: group2, item } = initialState;
    const actionWithLabel = {
      ...action,
      label: item?.name || group2.name,
      tooltip: item?.description ?? group2.description ?? group2.name,
      run: () => {
      }
    };
    const sessionPickerActionWidgetOptions = {
      actionProvider: {
        getActions: () => this.getDropdownActions()
      },
      actionBarActionProvider: void 0,
      reporter: { id: group2.id, name: `ChatSession:${group2.name}`, includeOptions: false },
      getAnchor: () => this._getAnchorElement(),
      listOptions: withChatInputPickerMotion(void 0)
    };
    super(actionWithLabel, sessionPickerActionWidgetOptions, actionWidgetService, keybindingService, contextKeyService, telemetryService);
    this.delegate = delegate;
    this._pickerOptions = _pickerOptions;
    this.commandService = commandService;
    this.chatEntitlementService = chatEntitlementService;
    this.openerService = openerService;
    this.currentOption = item;
    this._register(this.delegate.onDidChangeOption((newOption) => {
      this.currentOption = newOption;
      if (this.element) {
        this.renderLabel(this.element);
      }
      this.updateEnabled();
    }));
    const pickerOptions = this._pickerOptions;
    if (pickerOptions) {
      this._register(autorun((reader) => {
        pickerOptions.compact.read(reader);
        if (this.element) {
          this.renderLabel(this.element);
        }
      }));
    }
  }
  /**
   * Returns the actions to show in the dropdown. Can be overridden by subclasses.
   */
  getDropdownActions() {
    const currentOption = this.delegate.getCurrentOption();
    if (currentOption?.locked) {
      return [this.createLockedOptionAction(currentOption)];
    }
    const group2 = this.delegate.getOptionGroup();
    if (!group2) {
      return [];
    }
    const actions = group2.items.map((optionItem) => {
      const isCurrent = optionItem.id === currentOption?.id;
      return {
        id: optionItem.id,
        enabled: !optionItem.locked,
        icon: optionItem.icon,
        checked: isCurrent,
        class: void 0,
        description: optionItem.description,
        tooltip: optionItem.description ?? optionItem.name,
        label: optionItem.name,
        hover: this._buildOptionHover(optionItem),
        run: () => {
          this.delegate.setOption(optionItem);
        }
      };
    });
    if (group2.commands?.length) {
      const addSeparator = actions.length > 0;
      for (const command4 of group2.commands) {
        const args2 = command4.arguments ? [...command4.arguments] : [];
        const sessionResource = this.delegate.getSessionResource();
        if (sessionResource) {
          args2.unshift(sessionResource);
        }
        actions.push({
          id: command4.command,
          enabled: true,
          checked: false,
          class: void 0,
          description: void 0,
          tooltip: command4.tooltip ?? command4.title,
          label: command4.title,
          // Use category to create a separator before commands (only if there are options)
          category: addSeparator ? { label: "", order: Number.MAX_SAFE_INTEGER } : void 0,
          run: () => {
            this.commandService.executeCommand(command4.command, ...args2);
          }
        });
      }
    }
    return actions;
  }
  _buildOptionHover(optionItem) {
    if (optionItem.modelMetadata) {
      const isUBB = !!this.chatEntitlementService.quotas.usageBasedBilling;
      const syntheticModel = {
        identifier: optionItem.id,
        metadata: {
          extension: new ExtensionIdentifier(""),
          name: optionItem.modelMetadata.name,
          id: optionItem.modelMetadata.id,
          vendor: optionItem.modelMetadata.vendor ?? "",
          version: optionItem.modelMetadata.version ?? "",
          family: optionItem.modelMetadata.family ?? "",
          tooltip: optionItem.modelMetadata.tooltip,
          pricing: optionItem.modelMetadata.pricing,
          multiplierNumeric: optionItem.modelMetadata.multiplierNumeric,
          inputCost: optionItem.modelMetadata.inputCost,
          outputCost: optionItem.modelMetadata.outputCost,
          cacheCost: optionItem.modelMetadata.cacheCost,
          cacheWriteCost: optionItem.modelMetadata.cacheWriteCost,
          longContextInputCost: optionItem.modelMetadata.longContextInputCost,
          longContextOutputCost: optionItem.modelMetadata.longContextOutputCost,
          longContextCacheCost: optionItem.modelMetadata.longContextCacheCost,
          longContextCacheWriteCost: optionItem.modelMetadata.longContextCacheWriteCost,
          priceCategory: optionItem.modelMetadata.priceCategory,
          promo: optionItem.modelMetadata.promo,
          maxInputTokens: optionItem.modelMetadata.maxInputTokens ?? 0,
          maxOutputTokens: optionItem.modelMetadata.maxOutputTokens ?? 0,
          capabilities: optionItem.modelMetadata.capabilities ? {
            vision: optionItem.modelMetadata.capabilities.vision,
            toolCalling: optionItem.modelMetadata.capabilities.toolCalling
          } : void 0,
          isDefaultForLocation: {}
        }
      };
      const hover = getModelHoverContent(syntheticModel, isUBB, void 0, this.openerService);
      if (hover) {
        return { content: hover.element, disposable: hover.disposable };
      }
    }
    if (optionItem.tooltip) {
      return { content: optionItem.tooltip };
    }
    return void 0;
  }
  /**
   * Creates a disabled action for a locked option.
   */
  createLockedOptionAction(option2) {
    return {
      id: option2.id,
      enabled: false,
      icon: option2.icon,
      checked: true,
      class: void 0,
      description: option2.description,
      tooltip: option2.description ?? option2.name,
      label: option2.name,
      run: () => {
      }
    };
  }
  /**
   * Returns the anchor element for the dropdown.
   * Falls back to the overflow anchor if this element is not in the DOM.
   */
  _getAnchorElement() {
    if (this.element && getActiveWindow().document.contains(this.element)) {
      return this.element;
    }
    return this._pickerOptions?.getOverflowAnchor?.() ?? this.element;
  }
  renderLabel(element) {
    const domChildren = [];
    element.classList.add("chat-session-option-picker");
    const group2 = this.delegate.getOptionGroup();
    const compact2 = this._pickerOptions?.compact.get() ?? false;
    element.classList.toggle("compact", compact2);
    const label3 = this.currentOption?.name ?? group2?.description ?? localize(11082, null);
    const isDefaultWithIcon = this.currentOption?.default && this.currentOption?.icon;
    element.classList.toggle("icon-only", compact2 && !!this.currentOption?.icon);
    if (this.currentOption?.icon) {
      domChildren.push(renderIcon(getCompactCodicon(this.currentOption.icon)));
    }
    if (!isDefaultWithIcon && (!compact2 || !this.currentOption?.icon)) {
      domChildren.push($("span.chat-session-option-label", void 0, label3));
    }
    reset(element, ...domChildren);
    this.setAriaLabelAttributes(element);
    element.ariaLabel = label3;
    return null;
  }
  render(container3) {
    this.container = container3;
    super.render(container3);
    container3.classList.add(this.getContainerClass());
    if (this.currentOption?.locked) {
      container3.classList.add("locked");
    }
  }
  /**
   * Returns the CSS class to add to the container. Can be overridden by subclasses.
   */
  getContainerClass() {
    return "chat-sessionPicker-item";
  }
  updateEnabled() {
    const originalEnabled = this.action.enabled;
    if (this.currentOption?.locked) {
      this.action.enabled = false;
    }
    super.updateEnabled();
    this.action.enabled = originalEnabled;
    if (this.container) {
      this.container.classList.toggle("locked", !!this.currentOption?.locked);
    }
  }
};

ChatSessionPickerActionItem = __decorateClass([
  __decorateParam(4, IActionWidgetService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, IChatEntitlementService),
  __decorateParam(10, IOpenerService)
], ChatSessionPickerActionItem);
export { ChatSessionPickerActionItem };
