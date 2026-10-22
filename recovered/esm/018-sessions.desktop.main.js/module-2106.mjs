// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostFolderPickerActionItem.ts
import { ChatInputPickerActionViewItem } from "./module-2090.mjs";
import { createFolderPickerTip } from "./module-2105.mjs";
import { URI } from "./module-0032.mjs";
import { basename2 } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { $, reset } from "./module-0075.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IAgentHostNewSessionFolderService } from "./module-1746.mjs";
import { IAgentHostCustomizationService } from "./module-1763.mjs";
import { ISCMService } from "./module-1081.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostFolderPickerActionItem.ts
var AgentHostFolderPickerActionItem = class extends ChatInputPickerActionViewItem {
  constructor(action, _widget, pickerOptions, actionWidgetService, keybindingService, contextKeyService, telemetryService, _workspaceContextService, _newSessionFolderService, _customizationService, _scmService, _hoverService, storageService) {
    const actionProvider = {
      getActions: () => {
        const selected = this._selectedFolder();
        return this._workspaceContextService.getWorkspace().folders.map((folder) => ({
          ...action,
          id: `agentHostFolder.${folder.uri.toString()}`,
          label: folder.name,
          checked: selected?.toString() === folder.uri.toString(),
          icon: { id: "folder" },
          enabled: true,
          tooltip: folder.uri.fsPath,
          run: async () => {
            const sessionResource = this._sessionResource();
            if (sessionResource) {
              this._newSessionFolderService.setFolder(sessionResource, folder.uri);
            }
            if (this.element) {
              this.renderLabel(this.element);
            }
          }
        }));
      }
    };
    const actionBarActionProvider = {
      getActions: () => []
    };
    const folderPickerOptions = {
      actionProvider,
      actionBarActionProvider,
      showItemKeybindings: false,
      reporter: { id: "AgentHostFolderPicker", name: "AgentHostFolderPicker", includeOptions: false },
      listOptionsProvider: createFolderPickerTip(storageService)
    };
    super(action, folderPickerOptions, pickerOptions, actionWidgetService, keybindingService, contextKeyService, telemetryService);
    this._widget = _widget;
    this._workspaceContextService = _workspaceContextService;
    this._newSessionFolderService = _newSessionFolderService;
    this._customizationService = _customizationService;
    this._scmService = _scmService;
    this._hoverService = _hoverService;
    this._hoverSetup = false;
    this._register(this._newSessionFolderService.onDidChangeFolder(() => {
      if (this.element) {
        this.renderLabel(this.element);
      }
    }));
    this._register(this._workspaceContextService.onDidChangeWorkspaceFolders(() => {
      if (this.element) {
        this.renderLabel(this.element);
      }
    }));
    this._register(this._widget.onDidChangeViewModel(() => {
      if (this.element) {
        this.renderLabel(this.element);
      }
    }));
    this._register(this._customizationService.onDidChangeCustomizations(() => {
      if (this.element) {
        this.renderLabel(this.element);
      }
    }));
  }
  _sessionResource() {
    return this._widget.viewModel?.sessionResource;
  }
  _selectedFolder() {
    const folders = this._workspaceContextService.getWorkspace().folders;
    const sessionResource = this._sessionResource();
    const stored = sessionResource ? this._newSessionFolderService.getFolder(sessionResource) : void 0;
    if (stored) {
      return stored;
    }
    const sessionWorkingDirectory = sessionResource ? this._customizationService.getWorkingDirectory(sessionResource) : void 0;
    if (sessionWorkingDirectory) {
      return URI.parse(sessionWorkingDirectory);
    }
    return this._newSessionFolderService.getDefaultFolder() ?? folders[0]?.uri;
  }
  renderLabel(element) {
    const selected = this._selectedFolder();
    const folder = selected && this._workspaceContextService.getWorkspace().folders.find((f) => f.uri.toString() === selected.toString());
    const label3 = folder ? folder.name : selected ? basename2(selected) : localize(8968, null);
    const compact2 = this.pickerOptions.compact.get();
    element.classList.toggle("icon-only", compact2);
    reset(
      element,
      ...renderLabelWithIcons(`$(folder-compact)`),
      ...!compact2 ? [$("span.chat-input-picker-label", void 0, label3)] : []
    );
    this.setAriaLabelAttributes(element);
    element.ariaLabel = label3;
    return null;
  }
  render(container2) {
    super.render(container2);
    if (this.element && !this._hoverSetup) {
      this._hoverSetup = true;
      this._register(this._hoverService.setupManagedHover(
        getDefaultHoverDelegate("element"),
        this.element,
        () => this._buildHoverContent()
      ));
    }
  }
  /**
   * Builds the hover content for the folder chip: the full folder path and,
   * when the folder maps to a git repository, the current branch name.
   * Returns `undefined` when no folder is selected so no hover is shown.
   */
  _buildHoverContent() {
    const selected = this._selectedFolder();
    if (!selected) {
      return void 0;
    }
    const md = new MarkdownString("", { supportThemeIcons: true });
    const fallbackLines = [];
    md.appendMarkdown(`$(${Codicon.folder.id}) `);
    md.appendText(selected.fsPath);
    fallbackLines.push(selected.fsPath);
    const branch = this._branchName(selected);
    if (branch) {
      md.appendMarkdown("\n\n$(git-branch) ");
      md.appendText(branch);
      fallbackLines.push(branch);
    }
    return { markdown: md, markdownNotSupportedFallback: fallbackLines.join("\n") };
  }
  /**
   * Resolves the current git branch name for the given folder via the SCM
   * service, or `undefined` when the folder has no associated repository or
   * branch information.
   */
  _branchName(folderUri) {
    const repository = this._scmService.getRepository(folderUri);
    const historyProvider = repository?.provider.historyProvider.get();
    return historyProvider?.historyItemRef.get()?.name.trim() || void 0;
  }
};

AgentHostFolderPickerActionItem = __decorateClass([
  __decorateParam(3, IActionWidgetService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IWorkspaceContextService),
  __decorateParam(8, IAgentHostNewSessionFolderService),
  __decorateParam(9, IAgentHostCustomizationService),
  __decorateParam(10, ISCMService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IStorageService)
], AgentHostFolderPickerActionItem);
export { AgentHostFolderPickerActionItem };
