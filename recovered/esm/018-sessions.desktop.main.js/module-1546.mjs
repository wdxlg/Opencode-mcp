// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorPlaceholder.ts
import { EditorPane } from "./module-1090.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { $, EventHelper, clearNode, size } from "./module-0075.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { assertReturnsAllDefined } from "./module-0010.mjs";
import { truncate } from "./module-0030.mjs";
import { SimpleIconLabel } from "./module-1545.mjs";
import { EditorPaneDescriptor, computeEditorAriaLabel } from "./module-1085.mjs";
import { ButtonBar } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { localize } from "./module-0001.mjs";
import { IWorkspaceContextService, isSingleFolderWorkspaceIdentifier, toWorkspaceIdentifier } from "./module-0509.mjs";
import { ICommandService } from "./module-0087.mjs";
import { isEditorOpenError } from "./module-0926.mjs";
import { severity_default } from "./module-0266.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { showWindowLogActionId } from "./module-1501.mjs";
import { IFileService } from "./module-0269.mjs";
import { IDialogService } from "./module-0267.mjs";


// src/vs/workbench/browser/parts/editor/editorPlaceholder.ts
var EditorPlaceholder = class extends EditorPane {
  constructor(id2, group2, telemetryService, themeService, storageService) {
    super(id2, group2, telemetryService, themeService, storageService);
    this.inputDisposable = this._register(new MutableDisposable());
  }
  static {
    this.PLACEHOLDER_LABEL_MAX_LENGTH = 1024;
  }
  createEditor(parent) {
    this.container = $(".monaco-editor-pane-placeholder", {
      tabIndex: 0
      // enable focus support from the editor part (do not remove)
    });
    this.container.style.outline = "none";
    this.scrollbar = this._register(new DomScrollableElement(this.container, { horizontal: 1 /* Auto */, vertical: 1 /* Auto */ }));
    parent.appendChild(this.scrollbar.getDomNode());
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    if (token.isCancellationRequested) {
      return;
    }
    this.inputDisposable.value = await this.renderInput(input, options3);
  }
  async renderInput(input, options3) {
    const [container2, scrollbar] = assertReturnsAllDefined(this.container, this.scrollbar);
    clearNode(container2);
    const disposables = new DisposableStore();
    const { icon: icon2, label: label3, actions } = await this.getContents(input, options3, disposables);
    const truncatedLabel = truncate(label3, EditorPlaceholder.PLACEHOLDER_LABEL_MAX_LENGTH);
    const iconContainer = container2.appendChild($(".editor-placeholder-icon-container"));
    const iconWidget = disposables.add(new SimpleIconLabel(iconContainer));
    iconWidget.text = icon2;
    const labelContainer = container2.appendChild($(".editor-placeholder-label-container"));
    const labelWidget = $("span");
    labelWidget.textContent = truncatedLabel;
    labelContainer.appendChild(labelWidget);
    container2.setAttribute("aria-label", `${computeEditorAriaLabel(input, void 0, this.group, void 0)}, ${truncatedLabel}`);
    if (actions.length) {
      const actionsContainer = container2.appendChild($(".editor-placeholder-buttons-container"));
      const buttons = disposables.add(new ButtonBar(actionsContainer));
      for (let i2 = 0; i2 < actions.length; i2++) {
        const button = disposables.add(buttons.addButton({
          ...defaultButtonStyles,
          secondary: i2 !== 0
        }));
        button.label = actions[i2].label;
        disposables.add(button.onDidClick((e4) => {
          if (e4) {
            EventHelper.stop(e4, true);
          }
          actions[i2].run();
        }));
      }
    }
    scrollbar.scanDomNode();
    return disposables;
  }
  clearInput() {
    if (this.container) {
      clearNode(this.container);
    }
    this.inputDisposable.clear();
    super.clearInput();
  }
  layout(dimension) {
    const [container2, scrollbar] = assertReturnsAllDefined(this.container, this.scrollbar);
    size(container2, dimension.width, dimension.height);
    scrollbar.scanDomNode();
    container2.classList.toggle("max-height-200px", dimension.height <= 200);
  }
  focus() {
    super.focus();
    this.container?.focus();
  }
  dispose() {
    this.container?.remove();
    super.dispose();
  }
};

EditorPlaceholder = __decorateClass([
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IStorageService)
], EditorPlaceholder);

var WorkspaceTrustRequiredPlaceholderEditor = class extends EditorPlaceholder {
  constructor(group2, telemetryService, themeService, commandService, workspaceService, storageService) {
    super(WorkspaceTrustRequiredPlaceholderEditor.ID, group2, telemetryService, themeService, storageService);
    this.commandService = commandService;
    this.workspaceService = workspaceService;
  }
  static {
    this.ID = "workbench.editors.workspaceTrustRequiredEditor";
  }
  static {
    this.LABEL = localize(6679, null);
  }
  static {
    this.DESCRIPTOR = EditorPaneDescriptor.create(this, this.ID, this.LABEL);
  }
  getTitle() {
    return WorkspaceTrustRequiredPlaceholderEditor.LABEL;
  }
  async getContents() {
    return {
      icon: "$(workspace-untrusted)",
      label: isSingleFolderWorkspaceIdentifier(toWorkspaceIdentifier(this.workspaceService.getWorkspace())) ? localize(6675, null) : localize(6676, null),
      actions: [
        {
          label: localize(6674, null),
          run: () => this.commandService.executeCommand("workbench.trust.manage")
        }
      ]
    };
  }
};

WorkspaceTrustRequiredPlaceholderEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IStorageService)
], WorkspaceTrustRequiredPlaceholderEditor);

var ErrorPlaceholderEditor = class extends EditorPlaceholder {
  constructor(group2, telemetryService, themeService, storageService, fileService, dialogService, commandService) {
    super(ErrorPlaceholderEditor.ID, group2, telemetryService, themeService, storageService);
    this.fileService = fileService;
    this.dialogService = dialogService;
    this.commandService = commandService;
  }
  static {
    this.ID = "workbench.editors.errorEditor";
  }
  static {
    this.LABEL = localize(6673, null);
  }
  static {
    this.DESCRIPTOR = EditorPaneDescriptor.create(this, this.ID, this.LABEL);
  }
  async getContents(input, options3, disposables) {
    const resource = input.resource;
    const error = options3.error;
    const isFileNotFound = error?.fileOperationResult === 1 /* FILE_NOT_FOUND */;
    let label3;
    if (isFileNotFound) {
      label3 = localize(6680, null);
    } else if (isEditorOpenError(error) && error.forceMessage) {
      label3 = error.message;
    } else if (error) {
      label3 = localize(6681, null);
    } else {
      label3 = localize(6682, null);
    }
    let icon2 = "$(error)";
    if (isEditorOpenError(error)) {
      if (error.forceSeverity === severity_default.Info) {
        icon2 = "$(info)";
      } else if (error.forceSeverity === severity_default.Warning) {
        icon2 = "$(warning)";
      }
    }
    let actions = void 0;
    if (isEditorOpenError(error) && error.actions.length > 0) {
      actions = error.actions.map((action) => {
        return {
          label: action.label,
          run: () => {
            const result = action.run();
            if (result instanceof Promise) {
              result.catch((error2) => this.dialogService.error(toErrorMessage(error2)));
            }
          }
        };
      });
    } else {
      actions = [
        {
          label: localize(6677, null),
          run: () => this.group.openEditor(input, {
            ...options3,
            source: 1 /* USER */
            /* explicit user gesture */
          })
        },
        {
          label: localize(6678, null),
          run: () => this.commandService.executeCommand(showWindowLogActionId)
        }
      ];
    }
    if (isFileNotFound && resource && this.fileService.hasProvider(resource)) {
      disposables.add(this.fileService.onDidFilesChange((e4) => {
        if (e4.contains(resource, 1 /* ADDED */, 0 /* UPDATED */)) {
          this.group.openEditor(input, options3);
        }
      }));
    }
    return { icon: icon2, label: label3, actions: actions ?? [] };
  }
};

ErrorPlaceholderEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IFileService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, ICommandService)
], ErrorPlaceholderEditor);
export { EditorPlaceholder, WorkspaceTrustRequiredPlaceholderEditor, ErrorPlaceholderEditor };
