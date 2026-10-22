// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/multiDiffEditor/browser/actions.ts
import { Action2, MenuId } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ActiveEditorContext, IsSessionsWindowContext } from "./module-0950.mjs";
import { MultiDiffEditor } from "./module-2681.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0935.mjs";
import { Categories } from "./module-0847.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { createMultiDiffEditorLayoutDebugModel, isMultiDiffEditorLayoutDebugStateProvider } from "./module-2992.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { resolveCommandsContext } from "./module-1529.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IListService } from "./module-0636.mjs";
import { MultiDiffEditorInput } from "./module-1149.mjs";


// src/vs/workbench/contrib/multiDiffEditor/browser/actions.ts
var GoToFileAction2 = class extends Action2 {
  constructor() {
    super({
      id: "multiDiffEditor.goToFile",
      title: localize2(17372, "Open File"),
      icon: Codicon.goToFile,
      precondition: ActiveEditorContext.isEqualTo(MultiDiffEditor.ID),
      menu: {
        when: ActiveEditorContext.isEqualTo(MultiDiffEditor.ID),
        id: MenuId.MultiDiffEditorFileToolbar,
        order: 22,
        group: "navigation"
      }
    });
  }
  async run(accessor, ...args2) {
    const uri4 = args2[0];
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    let selections = void 0;
    if (!(activeEditorPane instanceof MultiDiffEditor)) {
      return;
    }
    const editor = activeEditorPane.tryGetCodeEditor(uri4);
    if (editor) {
      selections = editor.editor.getSelections() ?? void 0;
    }
    let targetUri = uri4;
    const item = activeEditorPane.findDocumentDiffItem(uri4);
    if (item && item.goToFileUri) {
      targetUri = item.goToFileUri;
    }
    await editorService.openEditor({
      label: item?.goToFileEditorTitle,
      resource: targetUri,
      options: {
        selection: selections?.[0],
        selectionRevealType: 1 /* CenterIfOutsideViewport */
      }
    });
  }
};

var OpenMultiDiffEditorLayoutDebugAction = class extends Action2 {
  constructor() {
    super({
      id: "multiDiffEditor.openLayoutDebug",
      title: localize2(17375, "Open Multi Diff Editor Layout Debug State"),
      category: Categories.Developer,
      precondition: ContextKeyExpr.or(ActiveEditorContext.isEqualTo(MultiDiffEditor.ID), EditorContextKeys.inMultiDiffEditor),
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (!isMultiDiffEditorLayoutDebugStateProvider(activeEditorPane)) {
      return;
    }
    const model = createMultiDiffEditorLayoutDebugModel(
      activeEditorPane.getLayoutDebugState(),
      accessor.get(IModelService),
      accessor.get(ILanguageService)
    );
    try {
      const editor = await editorService.openEditor(
        { resource: model.uri, options: { pinned: true } },
        SIDE_GROUP
      );
      if (!editor) {
        model.dispose();
      }
    } catch (error) {
      model.dispose();
      throw error;
    }
  }
};

var GoToNextChangeAction = class extends Action2 {
  constructor() {
    super({
      id: "multiDiffEditor.goToNextChange",
      title: localize2(17373, "Go to Next Change"),
      icon: Codicon.arrowDown,
      precondition: ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID),
      menu: [MenuId.EditorTitle, MenuId.CompactWindowEditorTitle].map((id2) => ({
        id: id2,
        when: ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID),
        group: "navigation",
        order: 2
      })),
      keybinding: {
        primary: 512 /* Alt */ | 63 /* F5 */,
        weight: 100 /* EditorContrib */,
        when: ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID)
      },
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (!(activeEditorPane instanceof MultiDiffEditor)) {
      return;
    }
    activeEditorPane.goToNextChange();
  }
};

var GoToPreviousChangeAction = class extends Action2 {
  constructor() {
    super({
      id: "multiDiffEditor.goToPreviousChange",
      title: localize2(17374, "Go to Previous Change"),
      icon: Codicon.arrowUp,
      precondition: ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID),
      menu: [MenuId.EditorTitle, MenuId.CompactWindowEditorTitle].map((id2) => ({
        id: id2,
        when: ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID),
        group: "navigation",
        order: 1
      })),
      keybinding: {
        primary: 512 /* Alt */ | 1024 /* Shift */ | 63 /* F5 */,
        weight: 100 /* EditorContrib */,
        when: ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID)
      },
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (!(activeEditorPane instanceof MultiDiffEditor)) {
      return;
    }
    activeEditorPane.goToPreviousChange();
  }
};

var CollapseAllAction2 = class extends Action2 {
  constructor() {
    super({
      id: "multiDiffEditor.collapseAll",
      title: localize2(17370, "Collapse All Diffs"),
      icon: Codicon.collapseAll,
      precondition: ContextKeyExpr.and(ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID), ContextKeyExpr.not("multiDiffEditorAllCollapsed")),
      menu: [
        // In the agents window this action lives in the editor title overflow (...) menu instead of as a primary toolbar icon.
        {
          id: MenuId.EditorTitle,
          when: ContextKeyExpr.and(ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID), ContextKeyExpr.not("multiDiffEditorAllCollapsed"), IsSessionsWindowContext.toNegated()),
          group: "navigation",
          order: 100
        },
        // The compact window editor title has no overflow menu, so keep the primary toolbar icon there.
        {
          id: MenuId.CompactWindowEditorTitle,
          when: ContextKeyExpr.and(ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID), ContextKeyExpr.not("multiDiffEditorAllCollapsed")),
          group: "navigation",
          order: 100
        },
        {
          id: MenuId.EditorTitle,
          when: ContextKeyExpr.and(ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID), ContextKeyExpr.not("multiDiffEditorAllCollapsed"), IsSessionsWindowContext),
          group: "4_collapse",
          order: 10
        }
      ],
      f1: true
    });
  }
  async run(accessor, ...args2) {
    const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
    const groupContext = resolvedContext.groupedEditors[0];
    if (!groupContext) {
      return;
    }
    const editor = groupContext.editors[0];
    if (editor instanceof MultiDiffEditorInput) {
      const viewModel = await editor.getViewModel();
      viewModel.collapseAll();
    }
  }
};

var ExpandAllAction2 = class extends Action2 {
  constructor() {
    super({
      id: "multiDiffEditor.expandAll",
      title: localize2(17371, "Expand All Diffs"),
      icon: Codicon.expandAll,
      precondition: ContextKeyExpr.and(ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID), ContextKeyExpr.has("multiDiffEditorAllCollapsed")),
      menu: [
        // In the agents window this action lives in the editor title overflow (...) menu instead of as a primary toolbar icon.
        {
          id: MenuId.EditorTitle,
          when: ContextKeyExpr.and(ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID), ContextKeyExpr.has("multiDiffEditorAllCollapsed"), IsSessionsWindowContext.toNegated()),
          group: "navigation",
          order: 100
        },
        // The compact window editor title has no overflow menu, so keep the primary toolbar icon there.
        {
          id: MenuId.CompactWindowEditorTitle,
          when: ContextKeyExpr.and(ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID), ContextKeyExpr.has("multiDiffEditorAllCollapsed")),
          group: "navigation",
          order: 100
        },
        {
          id: MenuId.EditorTitle,
          when: ContextKeyExpr.and(ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID), ContextKeyExpr.has("multiDiffEditorAllCollapsed"), IsSessionsWindowContext),
          group: "4_collapse",
          order: 10
        }
      ],
      f1: true
    });
  }
  async run(accessor, ...args2) {
    const resolvedContext = resolveCommandsContext(args2, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
    const groupContext = resolvedContext.groupedEditors[0];
    if (!groupContext) {
      return;
    }
    const editor = groupContext.editors[0];
    if (editor instanceof MultiDiffEditorInput) {
      const viewModel = await editor.getViewModel();
      viewModel.expandAll();
    }
  }
};
export { GoToFileAction2, OpenMultiDiffEditorLayoutDebugAction, GoToNextChangeAction, GoToPreviousChangeAction, CollapseAllAction2, ExpandAllAction2 };
