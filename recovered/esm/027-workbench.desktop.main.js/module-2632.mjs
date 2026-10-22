// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/tools/clientToolSetsContribution.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { browserChatToolReferenceNames } from "./module-2631.mjs";
import { ILanguageModelToolsService, ToolDataSource } from "./module-0990.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAICustomizationWorkspaceService } from "./module-0995.mjs";


// src/vs/workbench/contrib/chat/browser/tools/clientToolSetsContribution.ts
var ClientToolSetsContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.chat.clientToolSets";
  }
  constructor(toolsService, workspaceService) {
    super();
    if (!workspaceService.isSessionsWindow) {
      this._register(this._registerDynamicToolSet(toolsService, {
        id: "vscode-tasks",
        referenceName: "vscodeTasks",
        icon: Codicon.tasklist,
        description: localize(11666, null),
        detail: localize(11667, null),
        members: [
          "createAndRunTask",
          "runTask",
          "getTaskOutput",
          "problems"
        ]
      }));
    }
    if (workspaceService.isSessionsWindow) {
      this._register(this._registerDynamicToolSet(toolsService, {
        id: "vscode-automations",
        referenceName: "vscodeAutomations",
        icon: Codicon.calendar,
        description: localize(11660, null),
        detail: localize(11661, null),
        members: [
          "listAutomations",
          "configureAutomation",
          "runAutomation",
          "deleteAutomation"
        ]
      }));
    }
    this._register(this._registerDynamicToolSet(toolsService, {
      id: "vscode-browser",
      referenceName: "vscodeBrowser",
      icon: Codicon.browser,
      description: localize(11662, null),
      detail: localize(11663, null),
      members: browserChatToolReferenceNames
    }));
    this._register(this._registerDynamicToolSet(toolsService, {
      id: "vscode-general",
      referenceName: "vscodeGeneral",
      icon: Codicon.vscode,
      description: localize(11668, null),
      detail: localize(11669, null),
      members: [
        ...workspaceService.isSessionsWindow ? [] : ["runTests", "testFailure", "rename", "usages"],
        "toolSearch"
      ]
    }));
    if (!workspaceService.isSessionsWindow) {
      this._register(this._registerDynamicToolSet(toolsService, {
        id: "vscode-notebooks",
        referenceName: "vscodeNotebooks",
        icon: Codicon.notebook,
        description: localize(11664, null),
        detail: localize(11665, null),
        members: [
          "createJupyterNotebook",
          "editNotebook",
          "runNotebookCell",
          "getNotebookSummary",
          "readNotebookCellOutput"
        ]
      }));
    }
  }
  /**
   * Creates a tool set and keeps its membership in sync with the tools registered under the
   * reference names in {@link IDynamicToolSetSpec.members}. Returns a disposable that removes the
   * tool set and all of its member registrations.
   */
  _registerDynamicToolSet(toolsService, spec) {
    const store = new DisposableStore();
    const toolSet = store.add(toolsService.createToolSet(
      ToolDataSource.Internal,
      spec.id,
      spec.referenceName,
      {
        icon: spec.icon,
        description: spec.description,
        detail: spec.detail,
        hiddenInToolsPicker: true
      }
    ));
    const members = /* @__PURE__ */ new Map();
    const reconcile = () => {
      for (const name of spec.members) {
        const tool = toolsService.getToolByName(name) ?? toolsService.getTool(name);
        const existing = members.get(name);
        if (tool === existing?.tool) {
          continue;
        }
        existing?.disposable.dispose();
        members.delete(name);
        if (tool) {
          members.set(name, { tool, disposable: toolSet.addTool(tool) });
        }
      }
    };
    store.add(toolsService.onDidChangeTools(() => reconcile()));
    store.add(toDisposable(() => {
      for (const { disposable } of members.values()) {
        disposable.dispose();
      }
      members.clear();
    }));
    reconcile();
    return store;
  }
};

ClientToolSetsContribution = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService),
  __decorateParam(1, IAICustomizationWorkspaceService)
], ClientToolSetsContribution);
export { ClientToolSetsContribution };
