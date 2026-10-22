// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostVariableResolverService.ts
import { createDecorator2 } from "./module-0048.mjs";
import { AbstractVariableResolverService } from "./module-0312.mjs";
import { CustomEditorTabInput, NotebookDiffEditorTabInput, NotebookEditorTabInput, TextDiffTabInput, TextTabInput } from "./module-0244.mjs";
import { cwd, env } from "./module-0015.mjs";
import { normalize } from "./module-0019.mjs";
import { Disposable } from "./module-0011.mjs";
import { Lazy } from "./module-0021.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostExtensionService } from "./module-0288.mjs";
import { IExtHostWorkspace } from "./module-0251.mjs";
import { IExtHostDocumentsAndEditors } from "./module-0301.mjs";
import { IExtHostConfiguration } from "./module-0253.mjs";
import { IExtHostEditorTabs } from "./module-0307.mjs";


// src/vs/workbench/api/common/extHostVariableResolverService.ts
var IExtHostVariableResolverProvider = createDecorator2("IExtHostVariableResolverProvider");

var ExtHostVariableResolverService = class extends AbstractVariableResolverService {
  constructor(extensionService, workspaceService, editorService, editorTabs, configProvider, context, homeDir) {
    function getActiveUri() {
      if (editorService) {
        const activeEditor = editorService.activeEditor();
        if (activeEditor) {
          return activeEditor.document.uri;
        }
        const activeTab = editorTabs.tabGroups.all.find((group) => group.isActive)?.activeTab;
        if (activeTab !== void 0) {
          if (activeTab.input instanceof TextDiffTabInput || activeTab.input instanceof NotebookDiffEditorTabInput) {
            return activeTab.input.modified;
          } else if (activeTab.input instanceof TextTabInput || activeTab.input instanceof NotebookEditorTabInput || activeTab.input instanceof CustomEditorTabInput) {
            return activeTab.input.uri;
          }
        }
      }
      return void 0;
    }
    super({
      getFolderUri: (folderName) => {
        const found = context.folders.filter((f) => f.name === folderName);
        if (found && found.length > 0) {
          return found[0].uri;
        }
        return void 0;
      },
      getWorkspaceFolderCount: () => {
        return context.folders.length;
      },
      getConfigurationValue: (folderUri, section) => {
        return configProvider.getConfiguration(void 0, folderUri).get(section);
      },
      getAppRoot: () => {
        return cwd();
      },
      getExecPath: () => {
        return env["VSCODE_EXEC_PATH"];
      },
      getFilePath: () => {
        const activeUri = getActiveUri();
        if (activeUri) {
          return normalize(activeUri.fsPath);
        }
        return void 0;
      },
      getWorkspaceFolderPathForFile: () => {
        if (workspaceService) {
          const activeUri = getActiveUri();
          if (activeUri) {
            const ws = workspaceService.getWorkspaceFolder(activeUri);
            if (ws) {
              return normalize(ws.uri.fsPath);
            }
          }
        }
        return void 0;
      },
      getSelectedText: () => {
        if (editorService) {
          const activeEditor = editorService.activeEditor();
          if (activeEditor && !activeEditor.selection.isEmpty) {
            return activeEditor.document.getText(activeEditor.selection);
          }
        }
        return void 0;
      },
      getLineNumber: () => {
        if (editorService) {
          const activeEditor = editorService.activeEditor();
          if (activeEditor) {
            return String(activeEditor.selection.end.line + 1);
          }
        }
        return void 0;
      },
      getColumnNumber: () => {
        if (editorService) {
          const activeEditor = editorService.activeEditor();
          if (activeEditor) {
            return String(activeEditor.selection.end.character + 1);
          }
        }
        return void 0;
      },
      getExtension: (id2) => {
        return extensionService.getExtension(id2);
      }
    }, void 0, homeDir ? Promise.resolve(homeDir) : void 0, Promise.resolve(env));
  }
};

var ExtHostVariableResolverProviderService = class extends Disposable {
  constructor(extensionService, workspaceService, editorService, configurationService, editorTabs) {
    super();
    this.extensionService = extensionService;
    this.workspaceService = workspaceService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.editorTabs = editorTabs;
    this._resolver = new Lazy(async () => {
      const configProvider = await this.configurationService.getConfigProvider();
      const folders = await this.workspaceService.getWorkspaceFolders2() || [];
      const dynamic = { folders };
      this._register(this.workspaceService.onDidChangeWorkspace(async (e) => {
        dynamic.folders = await this.workspaceService.getWorkspaceFolders2() || [];
      }));
      return new ExtHostVariableResolverService(
        this.extensionService,
        this.workspaceService,
        this.editorService,
        this.editorTabs,
        configProvider,
        dynamic,
        this.homeDir()
      );
    });
  }
  getResolver() {
    return this._resolver.value;
  }
  homeDir() {
    return void 0;
  }
};

ExtHostVariableResolverProviderService = __decorateClass([
  __decorateParam(0, IExtHostExtensionService),
  __decorateParam(1, IExtHostWorkspace),
  __decorateParam(2, IExtHostDocumentsAndEditors),
  __decorateParam(3, IExtHostConfiguration),
  __decorateParam(4, IExtHostEditorTabs)
], ExtHostVariableResolverProviderService);
export { IExtHostVariableResolverProvider, ExtHostVariableResolverService, ExtHostVariableResolverProviderService };
