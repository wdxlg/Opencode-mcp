// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/modePickerActionItem.ts
import { Codicon } from "./module-0085.mjs";
import { ChatInputPickerActionViewItem } from "./module-2096.mjs";
import { observableValue } from "./module-0048.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getOpenChatActionIdForMode } from "./module-1476.mjs";
import { ToggleAgentModeActionId } from "./module-2062.mjs";
import { groupBy } from "./module-0003.mjs";
import { ChatMode } from "./module-1470.mjs";
import { coalesce } from "./module-0007.mjs";
import { autorun } from "./module-0052.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { getFlatActionBarActions } from "./module-0516.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { getCompactCodicon } from "./module-2040.mjs";
import { $, reset } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IProductService } from "./module-0873.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";
import { isOrganizationPromptFile } from "./module-2164.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/modePickerActionItem.ts
var builtinDefaultIcon = (mode) => {
  switch (mode.name.get().toLowerCase()) {
    case "ask":
      return Codicon.ask;
    case "plan":
      return Codicon.tasklist;
    default:
      return void 0;
  }
};

var ModePickerActionItem = class extends ChatInputPickerActionViewItem {
  constructor(action, delegate, pickerOptions, actionWidgetService, chatAgentService, keybindingService, configurationService, contextKeyService, menuService, commandService, _productService, telemetryService, openerService, assignmentService) {
    const assignments = observableValue("modePickerAssignments", { showOldAskMode: false });
    const getCustomAgentTarget = () => delegate.customAgentTarget?.() ?? "undefined" /* Undefined */;
    const builtInCategory = { label: localize(12638, null), order: 0 };
    const customCategory = { label: localize(12639, null), order: 1 };
    const policyDisabledCategory = { label: localize(12641, null), order: 999, showHeader: true };
    const agentModeDisabledViaPolicy = configurationService.inspect("chat.agent.enabled" /* AgentEnabled */).policyValue === false;
    const makeAction = (mode, currentMode) => {
      const isDisabledViaPolicy = mode.kind === "agent" /* Agent */ && agentModeDisabledViaPolicy;
      const tooltip = chatAgentService.getDefaultAgent("panel" /* Chat */, mode.kind)?.description ?? action.tooltip;
      const toolbarActions = [];
      if (mode.kind === "agent" /* Agent */ && !isDisabledViaPolicy) {
        if (mode.uri) {
          let label3, icon2, id2;
          if (mode.source?.storage === "extension" /* extension */) {
            icon2 = Codicon.file;
            id2 = `viewAgent:${mode.id}`;
            label3 = localize(12642, null, mode.label.get());
          } else {
            icon2 = Codicon.edit;
            id2 = `editAgent:${mode.id}`;
            label3 = localize(12640, null, mode.label.get());
          }
          const modeResource = mode.uri;
          toolbarActions.push({
            id: id2,
            label: label3,
            tooltip: label3,
            class: ThemeIcon.asClassName(icon2),
            enabled: true,
            run: async () => {
              openerService.open(modeResource.get());
            }
          });
        }
      }
      return {
        ...action,
        id: getOpenChatActionIdForMode(mode),
        label: mode.label.get(),
        icon: isDisabledViaPolicy ? ThemeIcon.fromId(Codicon.lock.id) : mode.icon.get(),
        class: isDisabledViaPolicy ? "disabled-by-policy" : void 0,
        enabled: !isDisabledViaPolicy,
        checked: !isDisabledViaPolicy && currentMode.id === mode.id,
        tooltip: "",
        hover: { content: tooltip },
        toolbarActions,
        run: async () => {
          if (isDisabledViaPolicy) {
            return;
          }
          if (this.delegate.setMode && !this.delegate.sessionResource()) {
            this.delegate.setMode(mode);
            if (this.element) {
              this.renderLabel(this.element);
            }
            return;
          }
          const result = await commandService.executeCommand(
            ToggleAgentModeActionId,
            { modeId: mode.id, sessionResource: this.delegate.sessionResource() }
          );
          if (this.element) {
            this.renderLabel(this.element);
          }
          return result;
        },
        category: isDisabledViaPolicy ? policyDisabledCategory : builtInCategory
      };
    };
    const makeActionFromCustomMode = (mode, currentMode) => {
      return {
        ...makeAction(mode, currentMode),
        tooltip: "",
        hover: { content: mode.description.get() ?? chatAgentService.getDefaultAgent("panel" /* Chat */, mode.kind)?.description ?? action.tooltip },
        icon: mode.icon.get() ?? (isModeConsideredBuiltIn(mode, this._productService) ? builtinDefaultIcon(mode) : void 0),
        category: agentModeDisabledViaPolicy ? policyDisabledCategory : customCategory
      };
    };
    const getActionsForCustomAgentTarget = (currentTarget) => {
      const modes = delegate.currentChatModes.get();
      const currentMode = delegate.currentMode.get();
      const filteredCustomModes = modes.custom.filter((mode) => {
        const target = mode.target.get();
        if (target !== currentTarget && target !== "undefined" /* Undefined */) {
          return false;
        }
        return true;
      });
      const customModes = groupBy(
        filteredCustomModes,
        (mode) => isModeConsideredBuiltIn(mode, this._productService) ? "builtin" : "custom"
      );
      const checked = currentMode.id === ChatMode.Agent.id;
      const defaultAction = { ...makeAction(ChatMode.Agent, ChatMode.Agent), checked };
      defaultAction.category = builtInCategory;
      const builtInActions = customModes.builtin?.map((mode) => {
        const action2 = makeActionFromCustomMode(mode, currentMode);
        action2.category = builtInCategory;
        return action2;
      }) ?? [];
      const customActions = customModes.custom?.map((mode) => makeActionFromCustomMode(mode, currentMode)) ?? [];
      return [defaultAction, ...builtInActions, ...customActions];
    };
    const actionProvider = {
      getActions: () => {
        const modes = delegate.currentChatModes.get();
        const currentMode = delegate.currentMode.get();
        const agentMode = modes.builtin.find((mode) => mode.id === ChatMode.Agent.id);
        const otherBuiltinModes = modes.builtin.filter((mode) => {
          return mode.id !== ChatMode.Agent.id && shouldShowBuiltInMode(mode, assignments.get(), agentModeDisabledViaPolicy);
        });
        const filteredCustomModes = modes.custom.filter((mode) => {
          if (isModeConsideredBuiltIn(mode, this._productService)) {
            return shouldShowBuiltInMode(mode, assignments.get(), agentModeDisabledViaPolicy);
          }
          return true;
        });
        const customModes = groupBy(
          filteredCustomModes,
          (mode) => isModeConsideredBuiltIn(mode, this._productService) ? "builtin" : "custom"
        );
        const customBuiltinModeActions = customModes.builtin?.map((mode) => {
          const action2 = makeActionFromCustomMode(mode, currentMode);
          action2.category = agentModeDisabledViaPolicy ? policyDisabledCategory : builtInCategory;
          return action2;
        }) ?? [];
        customBuiltinModeActions.sort((a, b) => a.label.localeCompare(b.label));
        const customModeActions = customModes.custom?.map((mode) => makeActionFromCustomMode(mode, currentMode)) ?? [];
        customModeActions.sort((a, b) => a.label.localeCompare(b.label));
        const orderedModes = coalesce([
          agentMode && makeAction(agentMode, currentMode),
          ...otherBuiltinModes.map((mode) => mode && makeAction(mode, currentMode)),
          ...customBuiltinModeActions,
          ...customModeActions
        ]);
        return orderedModes;
      }
    };
    const dynamicActionProvider = {
      getActions: () => {
        const currentTarget = getCustomAgentTarget();
        if (currentTarget !== "undefined" /* Undefined */) {
          return getActionsForCustomAgentTarget(currentTarget);
        }
        return actionProvider.getActions();
      }
    };
    const modePickerActionWidgetOptions = {
      actionProvider: dynamicActionProvider,
      actionBarActionProvider: {
        getActions: () => this.getModePickerActionBarActions()
      },
      showItemKeybindings: true,
      reporter: { id: "ChatModePicker", name: "ChatModePicker", includeOptions: true }
    };
    super(action, modePickerActionWidgetOptions, pickerOptions, actionWidgetService, keybindingService, contextKeyService, telemetryService);
    this.delegate = delegate;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this._productService = _productService;
    this._register(autorun((reader) => {
      this.delegate.currentMode.read(reader).label.read(reader);
      if (this.element) {
        this.renderLabel(this.element);
      }
    }));
    assignmentService.getTreatment("chat.showOldAskMode").then((showOldAskMode) => {
      assignments.set({ showOldAskMode: showOldAskMode === "enabled" }, void 0);
    });
    this._register(assignmentService.onDidRefetchAssignments(async () => {
      assignments.set({ showOldAskMode: await assignmentService.getTreatment("chat.showOldAskMode") === "enabled" }, void 0);
    }));
  }
  getModePickerActionBarActions() {
    const menuActions = this.menuService.createMenu(MenuId.ChatModePicker, this.contextKeyService);
    const menuContributions = getFlatActionBarActions(menuActions.getActions({ renderShortTitle: true }));
    menuActions.dispose();
    return menuContributions;
  }
  render(container3) {
    super.render(container3);
    container3.classList.add("chat-mode-picker-item");
  }
  renderLabel(element) {
    const currentMode = this.delegate.currentMode.get();
    const state = currentMode.label.get();
    let icon2 = currentMode.icon.get();
    if (!icon2 && isModeConsideredBuiltIn(currentMode, this._productService)) {
      icon2 = builtinDefaultIcon(currentMode);
    }
    const labelElements = [];
    const collapsed2 = this.pickerOptions.compact.get();
    element.classList.toggle("icon-only", collapsed2 && !!icon2);
    if (icon2) {
      labelElements.push(...renderLabelWithIcons(`$(${getCompactCodicon(icon2).id})`));
    }
    if (!collapsed2 || !icon2) {
      labelElements.push($("span.chat-input-picker-label", void 0, state));
    }
    reset(element, ...labelElements);
    this.setAriaLabelAttributes(element);
    element.ariaLabel = state;
    return null;
  }
};

ModePickerActionItem = __decorateClass([
  __decorateParam(3, IActionWidgetService),
  __decorateParam(4, IChatAgentService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IMenuService),
  __decorateParam(9, ICommandService),
  __decorateParam(10, IProductService),
  __decorateParam(11, ITelemetryService),
  __decorateParam(12, IOpenerService),
  __decorateParam(13, IWorkbenchAssignmentService)
], ModePickerActionItem);

function isModeConsideredBuiltIn(mode, productService) {
  if (mode.isBuiltin) {
    return true;
  }
  if (mode.source?.storage !== "extension" /* extension */) {
    return false;
  }
  const chatExtensionId = productService.defaultChatAgent?.chatExtensionId;
  if (!chatExtensionId || mode.source.extensionId.value !== chatExtensionId) {
    return false;
  }
  const modeUri = mode.uri?.get();
  if (!modeUri) {
    return true;
  }
  return !isOrganizationPromptFile(modeUri, mode.source.extensionId, productService);
}

function shouldShowBuiltInMode(mode, assignments, agentModeDisabledViaPolicy) {
  if (mode.id === ChatMode.Edit.id) {
    return agentModeDisabledViaPolicy;
  }
  if (mode.id === ChatMode.Ask.id || mode.name.get().toLowerCase() === "ask") {
    if (mode.id === ChatMode.Ask.id) {
      return assignments.showOldAskMode || agentModeDisabledViaPolicy;
    } else {
      return !(assignments.showOldAskMode || agentModeDisabledViaPolicy);
    }
  }
  return true;
}
export { isModeConsideredBuiltIn, shouldShowBuiltInMode, builtinDefaultIcon, ModePickerActionItem };
