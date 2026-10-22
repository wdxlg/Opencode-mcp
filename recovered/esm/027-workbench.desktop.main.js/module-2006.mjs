// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/controller/layoutActions.ts
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { NotebookSetting } from "./module-0909.mjs";
import { NOTEBOOK_ACTIONS_CATEGORY } from "./module-1869.mjs";
import { NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_IS_ACTIVE_EDITOR } from "./module-1868.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { Codicon } from "./module-0085.mjs";
import { INotebookService } from "./module-0926.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IEditorService } from "./module-0934.mjs";
import { URI } from "./module-0032.mjs";
import { INotebookEditorService } from "./module-1386.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0941.mjs";
import { Categories } from "./module-0847.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/notebook/browser/controller/layoutActions.ts
registerAction2(class NotebookConfigureLayoutAction extends Action2 {
  constructor() {
    super({
      id: "workbench.notebook.layout.select",
      title: localize2(17614, "Select between Notebook Layouts"),
      f1: true,
      precondition: ContextKeyExpr.equals(`config.${NotebookSetting.openGettingStarted}`, true),
      category: NOTEBOOK_ACTIONS_CATEGORY,
      menu: [
        {
          id: MenuId.EditorTitle,
          group: "notebookLayout",
          when: ContextKeyExpr.and(
            NOTEBOOK_IS_ACTIVE_EDITOR,
            ContextKeyExpr.notEquals("config.notebook.globalToolbar", true),
            ContextKeyExpr.equals(`config.${NotebookSetting.openGettingStarted}`, true)
          ),
          order: 0
        },
        {
          id: MenuId.NotebookToolbar,
          group: "notebookLayout",
          when: ContextKeyExpr.and(
            ContextKeyExpr.equals("config.notebook.globalToolbar", true),
            ContextKeyExpr.equals(`config.${NotebookSetting.openGettingStarted}`, true)
          ),
          order: 0
        }
      ]
    });
  }
  run(accessor) {
    accessor.get(ICommandService).executeCommand("workbench.action.openWalkthrough", { category: "notebooks", step: "notebookProfile" }, true);
  }
});

registerAction2(class NotebookConfigureLayoutAction2 extends Action2 {
  constructor() {
    super({
      id: "workbench.notebook.layout.configure",
      title: localize2(17613, "Customize Notebook Layout"),
      f1: true,
      category: NOTEBOOK_ACTIONS_CATEGORY,
      menu: [
        {
          id: MenuId.NotebookToolbar,
          group: "notebookLayout",
          when: ContextKeyExpr.equals("config.notebook.globalToolbar", true),
          order: 1
        }
      ]
    });
  }
  run(accessor) {
    accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: "@tag:notebookLayout" });
  }
});

registerAction2(class NotebookConfigureLayoutFromEditorTitle extends Action2 {
  constructor() {
    super({
      id: "workbench.notebook.layout.configure.editorTitle",
      title: localize2(17613, "Customize Notebook Layout"),
      f1: false,
      category: NOTEBOOK_ACTIONS_CATEGORY,
      menu: [
        {
          id: MenuId.NotebookEditorLayoutConfigure,
          group: "notebookLayout",
          when: NOTEBOOK_IS_ACTIVE_EDITOR,
          order: 1
        }
      ]
    });
  }
  run(accessor) {
    accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: "@tag:notebookLayout" });
  }
});

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  submenu: MenuId.NotebookEditorLayoutConfigure,
  title: localize2(17598, "Customize Notebook..."),
  icon: Codicon.gear,
  group: "navigation",
  order: -1,
  when: NOTEBOOK_IS_ACTIVE_EDITOR
});

registerAction2(class ToggleLineNumberFromEditorTitle extends Action2 {
  constructor() {
    super({
      id: "notebook.toggleLineNumbersFromEditorTitle",
      title: localize2(17606, "Toggle Notebook Line Numbers"),
      shortTitle: localize2(17607, "Line Numbers"),
      precondition: NOTEBOOK_EDITOR_FOCUSED,
      menu: [
        {
          id: MenuId.NotebookEditorLayoutConfigure,
          group: "notebookLayoutDetails",
          order: 1,
          when: NOTEBOOK_IS_ACTIVE_EDITOR
        }
      ],
      category: NOTEBOOK_ACTIONS_CATEGORY,
      f1: true,
      toggled: {
        condition: ContextKeyExpr.notEquals("config.notebook.lineNumbers", "off"),
        title: localize(17602, null)
      }
    });
  }
  async run(accessor) {
    return accessor.get(ICommandService).executeCommand("notebook.toggleLineNumbers");
  }
});

registerAction2(class ToggleCellToolbarPositionFromEditorTitle extends Action2 {
  constructor() {
    super({
      id: "notebook.toggleCellToolbarPositionFromEditorTitle",
      title: localize2(17605, "Toggle Cell Toolbar Position"),
      menu: [{
        id: MenuId.NotebookEditorLayoutConfigure,
        group: "notebookLayoutDetails",
        order: 3
      }],
      category: NOTEBOOK_ACTIONS_CATEGORY,
      f1: false
    });
  }
  async run(accessor, ...args2) {
    return accessor.get(ICommandService).executeCommand("notebook.toggleCellToolbarPosition", ...args2);
  }
});

registerAction2(class ToggleBreadcrumbFromEditorTitle extends Action2 {
  constructor() {
    super({
      id: "breadcrumbs.toggleFromEditorTitle",
      title: localize2(17603, "Toggle Breadcrumbs"),
      shortTitle: localize2(17604, "Breadcrumbs"),
      toggled: {
        condition: ContextKeyExpr.equals("config.breadcrumbs.enabled", true),
        title: localize(17597, null)
      },
      menu: [{
        id: MenuId.NotebookEditorLayoutConfigure,
        group: "notebookLayoutDetails",
        order: 2
      }],
      category: NOTEBOOK_ACTIONS_CATEGORY,
      f1: false
    });
  }
  async run(accessor) {
    return accessor.get(ICommandService).executeCommand("breadcrumbs.toggle");
  }
});

registerAction2(class SaveMimeTypeDisplayOrder extends Action2 {
  constructor() {
    super({
      id: "notebook.saveMimeTypeOrder",
      title: localize2(17601, "Save Mimetype Display Order"),
      f1: true,
      category: NOTEBOOK_ACTIONS_CATEGORY,
      precondition: NOTEBOOK_IS_ACTIVE_EDITOR
    });
  }
  run(accessor) {
    const service = accessor.get(INotebookService);
    const disposables = new DisposableStore();
    const qp = disposables.add(accessor.get(IQuickInputService).createQuickPick());
    qp.placeholder = localize(17600, null);
    qp.items = [
      { target: 2 /* USER */, label: localize(17609, null) },
      { target: 5 /* WORKSPACE */, label: localize(17610, null) }
    ];
    disposables.add(qp.onDidAccept(() => {
      const target = qp.selectedItems[0]?.target;
      if (target !== void 0) {
        service.saveMimeDisplayOrder(target);
      }
      qp.dispose();
    }));
    disposables.add(qp.onDidHide(() => disposables.dispose()));
    qp.show();
  }
});

registerAction2(class NotebookWebviewResetAction extends Action2 {
  constructor() {
    super({
      id: "workbench.notebook.layout.webview.reset",
      title: localize2(17615, "Reset Notebook Webview"),
      f1: false,
      category: NOTEBOOK_ACTIONS_CATEGORY
    });
  }
  run(accessor, args2) {
    const editorService = accessor.get(IEditorService);
    if (args2) {
      const uri5 = URI.revive(args2);
      const notebookEditorService = accessor.get(INotebookEditorService);
      const widgets2 = notebookEditorService.listNotebookEditors().filter((widget) => widget.hasModel() && widget.textModel.uri.toString() === uri5.toString());
      for (const widget of widgets2) {
        if (widget.hasModel()) {
          widget.getInnerWebview()?.reload();
        }
      }
    } else {
      const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
      if (!editor) {
        return;
      }
      editor.getInnerWebview()?.reload();
    }
  }
});

registerAction2(class ToggleNotebookStickyScroll extends Action2 {
  constructor() {
    super({
      id: "notebook.action.toggleNotebookStickyScroll",
      title: {
        ...localize2(17611, "Toggle Notebook Sticky Scroll"),
        mnemonicTitle: localize(17599, null)
      },
      shortTitle: localize2(17612, "Sticky Scroll"),
      category: Categories.View,
      toggled: {
        condition: ContextKeyExpr.equals("config.notebook.stickyScroll.enabled", true),
        title: localize(17608, null),
        mnemonicTitle: localize(17599, null)
      },
      menu: [
        { id: MenuId.CommandPalette },
        { id: MenuId.NotebookStickyScrollContext, group: "notebookView", order: 2 },
        { id: MenuId.NotebookToolbarContext, group: "notebookView", order: 2 }
      ]
    });
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const newValue = !configurationService.getValue("notebook.stickyScroll.enabled");
    return configurationService.updateValue("notebook.stickyScroll.enabled", newValue);
  }
});
export {};
