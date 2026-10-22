// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/workspacePickerActionItem.ts
import { ChatInputPickerActionViewItem } from "./module-2096.mjs";
import { localize } from "./module-0001.mjs";
import { basename2 } from "./module-0034.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { $, reset } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/workspacePickerActionItem.ts
var WorkspacePickerActionItem = class extends ChatInputPickerActionViewItem {
  constructor(action, delegate, pickerOptions, actionWidgetService, keybindingService, contextKeyService, commandService, telemetryService) {
    const actionProvider = {
      getActions: () => {
        const currentWorkspace = this.delegate.getSelectedWorkspace();
        const workspaces = this.delegate.getWorkspaces();
        const actions = workspaces.map((workspace) => ({
          ...action,
          id: `workspace.${workspace.uri.toString()}`,
          label: workspace.label,
          checked: currentWorkspace?.uri.toString() === workspace.uri.toString(),
          icon: workspace.isFolder ? { id: "folder" } : { id: "file-symlink-directory" },
          enabled: true,
          tooltip: workspace.uri.fsPath,
          run: async () => {
            this.delegate.setSelectedWorkspace(workspace);
            if (this.element) {
              this.renderLabel(this.element);
            }
          }
        }));
        actions.push({
          ...action,
          id: "workspace.openFolder",
          label: localize(12674, null),
          checked: false,
          enabled: true,
          tooltip: localize(12675, null),
          run: async () => {
            this.commandService.executeCommand(this.delegate.openFolderCommand);
          }
        });
        return actions;
      }
    };
    const actionBarActionProvider = {
      getActions: () => []
    };
    const workspacePickerOptions = {
      actionProvider,
      actionBarActionProvider,
      showItemKeybindings: false,
      reporter: { id: "ChatWorkspacePicker", name: "ChatWorkspacePicker", includeOptions: false }
    };
    super(action, workspacePickerOptions, pickerOptions, actionWidgetService, keybindingService, contextKeyService, telemetryService);
    this.delegate = delegate;
    this.commandService = commandService;
    this._register(this.delegate.onDidChangeSelectedWorkspace(() => {
      if (this.element) {
        this.renderLabel(this.element);
      }
    }));
    this._register(this.delegate.onDidChangeWorkspaces(() => {
      if (this.element) {
        this.renderLabel(this.element);
      }
    }));
  }
  renderLabel(element) {
    const currentWorkspace = this.delegate.getSelectedWorkspace();
    const labelElements = [];
    const label3 = currentWorkspace ? currentWorkspace.label || basename2(currentWorkspace.uri) : localize(12676, null);
    const compact2 = this.pickerOptions.compact.get();
    element.classList.toggle("icon-only", compact2);
    labelElements.push(...renderLabelWithIcons(`$(folder-compact)`));
    if (!compact2) {
      labelElements.push($("span.chat-input-picker-label", void 0, label3));
    }
    reset(element, ...labelElements);
    this.setAriaLabelAttributes(element);
    element.ariaLabel = label3;
    return null;
  }
};

WorkspacePickerActionItem = __decorateClass([
  __decorateParam(3, IActionWidgetService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, ITelemetryService)
], WorkspacePickerActionItem);
export { WorkspacePickerActionItem };
