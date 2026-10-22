// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/processExplorer/browser/processExplorer.contribution.ts
import { ProcessExplorerEditorInput } from "./module-2966.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorResolverService } from "./module-1114.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IsWebContext } from "./module-0635.mjs";
import { RemoteNameContext } from "./module-0950.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { AUX_WINDOW_GROUP, IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IAuxiliaryWindowService } from "./module-2972.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/processExplorer/browser/processExplorer.contribution.ts
var ProcessExplorerEditorContribution = class {
  static {
    this.ID = "workbench.contrib.processExplorerEditor";
  }
  constructor(editorResolverService, instantiationService) {
    editorResolverService.registerEditor(
      `${ProcessExplorerEditorInput.RESOURCE.scheme}:**/**`,
      {
        id: ProcessExplorerEditorInput.ID,
        label: localize(18407, null),
        priority: "exclusive" /* exclusive */
      },
      {
        singlePerResource: true,
        canSupportResource: (resource) => resource.scheme === ProcessExplorerEditorInput.RESOURCE.scheme
      },
      {
        createEditorInput: () => {
          return {
            editor: instantiationService.createInstance(ProcessExplorerEditorInput),
            options: {
              pinned: true
            }
          };
        }
      }
    );
  }
};

ProcessExplorerEditorContribution = __decorateClass([
  __decorateParam(0, IEditorResolverService),
  __decorateParam(1, IInstantiationService)
], ProcessExplorerEditorContribution);

registerWorkbenchContribution2(ProcessExplorerEditorContribution.ID, ProcessExplorerEditorContribution, WorkbenchPhase.BlockStartup);

var ProcessExplorerEditorInputSerializer = class {
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return ProcessExplorerEditorInput.instance;
  }
};

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(ProcessExplorerEditorInput.ID, ProcessExplorerEditorInputSerializer);

var supported2 = ContextKeyExpr.or(IsWebContext.negate(), RemoteNameContext.notEqualsTo(""));

var OpenProcessExplorer = class _OpenProcessExplorer extends Action2 {
  static {
    this.ID = "workbench.action.openProcessExplorer";
  }
  static {
    this.STATE_KEY = "workbench.processExplorerWindowState";
  }
  static {
    this.DEFAULT_STATE = { bounds: { width: 800, height: 500 } };
  }
  constructor() {
    super({
      id: _OpenProcessExplorer.ID,
      title: localize2(18406, "Open Process Explorer"),
      category: Categories.Developer,
      precondition: supported2,
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editorGroupService = accessor.get(IEditorGroupsService);
    const auxiliaryWindowService = accessor.get(IAuxiliaryWindowService);
    const storageService = accessor.get(IStorageService);
    const pane = await editorService.openEditor({
      resource: ProcessExplorerEditorInput.RESOURCE,
      options: {
        pinned: true,
        revealIfOpened: true,
        auxiliary: {
          ...this.loadState(storageService),
          compact: true,
          alwaysOnTop: true
        }
      }
    }, AUX_WINDOW_GROUP);
    if (pane) {
      const listener = pane.input?.onWillDispose(() => {
        listener?.dispose();
        this.saveState(pane.group.id, storageService, editorGroupService, auxiliaryWindowService);
      });
    }
  }
  loadState(storageService) {
    const stateRaw = storageService.get(_OpenProcessExplorer.STATE_KEY, -1 /* APPLICATION */);
    if (!stateRaw) {
      return _OpenProcessExplorer.DEFAULT_STATE;
    }
    try {
      return JSON.parse(stateRaw);
    } catch {
      return _OpenProcessExplorer.DEFAULT_STATE;
    }
  }
  saveState(group2, storageService, editorGroupService, auxiliaryWindowService) {
    const auxiliaryWindow = auxiliaryWindowService.getWindow(editorGroupService.getPart(group2).windowId);
    if (!auxiliaryWindow) {
      return;
    }
    const bounds = auxiliaryWindow.createState().bounds;
    if (!bounds) {
      return;
    }
    storageService.store(_OpenProcessExplorer.STATE_KEY, JSON.stringify({ bounds }), -1 /* APPLICATION */, 1 /* MACHINE */);
  }
};

registerAction2(OpenProcessExplorer);

MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
  group: "5_tools",
  command: {
    id: OpenProcessExplorer.ID,
    title: localize(18405, null)
  },
  when: supported2,
  order: 2
});
export { ProcessExplorerEditorContribution, ProcessExplorerEditorInputSerializer, supported2, OpenProcessExplorer };
