// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/commands.ts
import { Action2, MenuId } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { EditorAction2 } from "./module-0097.mjs";
import { DiffEditorWidget } from "./module-0527.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { getActiveElement } from "./module-0075.mjs";


// src/vs/editor/browser/widget/diffEditor/commands.ts
var ToggleCollapseUnchangedRegions = class extends Action2 {
  constructor() {
    super({
      id: "diffEditor.toggleCollapseUnchangedRegions",
      title: localize2(217, "Toggle Collapse Unchanged Regions"),
      icon: Codicon.map,
      toggled: ContextKeyExpr.has("config.diffEditor.hideUnchangedRegions.enabled"),
      precondition: ContextKeyExpr.has("isInDiffEditor"),
      menu: {
        when: ContextKeyExpr.has("isInDiffEditor"),
        id: MenuId.EditorTitle,
        order: 22,
        group: "navigation"
      }
    });
  }
  run(accessor, ...args2) {
    const configurationService = accessor.get(IConfigurationService);
    const newValue = !configurationService.getValue("diffEditor.hideUnchangedRegions.enabled");
    configurationService.updateValue("diffEditor.hideUnchangedRegions.enabled", newValue);
  }
};

var ToggleShowMovedCodeBlocks = class extends Action2 {
  constructor() {
    super({
      id: "diffEditor.toggleShowMovedCodeBlocks",
      title: localize2(218, "Toggle Show Moved Code Blocks"),
      precondition: ContextKeyExpr.has("isInDiffEditor")
    });
  }
  run(accessor, ...args2) {
    const configurationService = accessor.get(IConfigurationService);
    const newValue = !configurationService.getValue("diffEditor.experimental.showMoves");
    configurationService.updateValue("diffEditor.experimental.showMoves", newValue);
  }
};

var ToggleUseInlineViewWhenSpaceIsLimited = class extends Action2 {
  constructor() {
    super({
      id: "diffEditor.toggleUseInlineViewWhenSpaceIsLimited",
      title: localize2(219, "Toggle Use Inline View When Space Is Limited"),
      precondition: ContextKeyExpr.has("isInDiffEditor")
    });
  }
  run(accessor, ...args2) {
    const configurationService = accessor.get(IConfigurationService);
    const newValue = !configurationService.getValue("diffEditor.useInlineViewWhenSpaceIsLimited");
    configurationService.updateValue("diffEditor.useInlineViewWhenSpaceIsLimited", newValue);
  }
};

var diffEditorCategory = localize2(210, "Diff Editor");

var SwitchSide = class extends EditorAction2 {
  constructor() {
    super({
      id: "diffEditor.switchSide",
      title: localize2(216, "Switch Side"),
      icon: Codicon.arrowSwap,
      precondition: ContextKeyExpr.has("isInDiffEditor"),
      f1: true,
      category: diffEditorCategory
    });
  }
  runEditorCommand(accessor, editor, arg) {
    const diffEditor = findFocusedDiffEditor(accessor);
    if (diffEditor instanceof DiffEditorWidget) {
      if (arg && arg.dryRun) {
        return { destinationSelection: diffEditor.mapToOtherSide().destinationSelection };
      } else {
        diffEditor.switchSide();
      }
    }
    return void 0;
  }
};

var ExitCompareMove = class extends EditorAction2 {
  constructor() {
    super({
      id: "diffEditor.exitCompareMove",
      title: localize2(213, "Exit Compare Move"),
      icon: Codicon.close,
      precondition: EditorContextKeys.comparingMovedCode,
      f1: false,
      category: diffEditorCategory,
      keybinding: {
        weight: 1e4,
        primary: 9 /* Escape */
      }
    });
  }
  runEditorCommand(accessor, editor, ...args2) {
    const diffEditor = findFocusedDiffEditor(accessor);
    if (diffEditor instanceof DiffEditorWidget) {
      diffEditor.exitCompareMove();
    }
  }
};

var CollapseAllUnchangedRegions = class extends EditorAction2 {
  constructor() {
    super({
      id: "diffEditor.collapseAllUnchangedRegions",
      title: localize2(209, "Collapse All Unchanged Regions"),
      icon: Codicon.fold,
      precondition: ContextKeyExpr.has("isInDiffEditor"),
      f1: true,
      category: diffEditorCategory
    });
  }
  runEditorCommand(accessor, editor, ...args2) {
    const diffEditor = findFocusedDiffEditor(accessor);
    if (diffEditor instanceof DiffEditorWidget) {
      diffEditor.collapseAllUnchangedRegions();
    }
  }
};

var ShowAllUnchangedRegions = class extends EditorAction2 {
  constructor() {
    super({
      id: "diffEditor.showAllUnchangedRegions",
      title: localize2(215, "Show All Unchanged Regions"),
      icon: Codicon.unfold,
      precondition: ContextKeyExpr.has("isInDiffEditor"),
      f1: true,
      category: diffEditorCategory
    });
  }
  runEditorCommand(accessor, editor, ...args2) {
    const diffEditor = findFocusedDiffEditor(accessor);
    if (diffEditor instanceof DiffEditorWidget) {
      diffEditor.showAllUnchangedRegions();
    }
  }
};

var RevertHunkOrSelection = class extends Action2 {
  constructor() {
    super({
      id: "diffEditor.revert",
      title: localize2(214, "Revert"),
      f1: true,
      category: diffEditorCategory,
      precondition: ContextKeyExpr.has("isInDiffEditor")
    });
  }
  run(accessor, arg) {
    return arg ? this.runViaToolbarContext(accessor, arg) : this.runViaCursorOrSelection(accessor);
  }
  runViaCursorOrSelection(accessor) {
    const diffEditor = findFocusedDiffEditor(accessor);
    if (diffEditor instanceof DiffEditorWidget) {
      diffEditor.revertFocusedRangeMappings();
    }
    return void 0;
  }
  runViaToolbarContext(accessor, arg) {
    const diffEditor = findDiffEditor(accessor, arg.originalUri, arg.modifiedUri);
    if (diffEditor instanceof DiffEditorWidget) {
      diffEditor.revertRangeMappings(arg.mapping.innerChanges ?? []);
    }
    return void 0;
  }
};

var accessibleDiffViewerCategory = localize2(208, "Accessible Diff Viewer");

var AccessibleDiffViewerNext = class _AccessibleDiffViewerNext extends Action2 {
  static {
    this.id = "editor.action.accessibleDiffViewer.next";
  }
  constructor() {
    super({
      id: _AccessibleDiffViewerNext.id,
      title: localize2(211, "Go to Next Difference"),
      category: accessibleDiffViewerCategory,
      precondition: ContextKeyExpr.has("isInDiffEditor"),
      keybinding: {
        primary: 65 /* F7 */,
        weight: 100 /* EditorContrib */
      },
      f1: true
    });
  }
  run(accessor) {
    const diffEditor = findFocusedDiffEditor(accessor);
    diffEditor?.accessibleDiffViewerNext();
  }
};

var AccessibleDiffViewerPrev = class _AccessibleDiffViewerPrev extends Action2 {
  static {
    this.id = "editor.action.accessibleDiffViewer.prev";
  }
  constructor() {
    super({
      id: _AccessibleDiffViewerPrev.id,
      title: localize2(212, "Go to Previous Difference"),
      category: accessibleDiffViewerCategory,
      precondition: ContextKeyExpr.has("isInDiffEditor"),
      keybinding: {
        primary: 1024 /* Shift */ | 65 /* F7 */,
        weight: 100 /* EditorContrib */
      },
      f1: true
    });
  }
  run(accessor) {
    const diffEditor = findFocusedDiffEditor(accessor);
    diffEditor?.accessibleDiffViewerPrev();
  }
};

function findDiffEditor(accessor, originalUri, modifiedUri) {
  const codeEditorService = accessor.get(ICodeEditorService);
  const diffEditors = codeEditorService.listDiffEditors();
  return diffEditors.find((diffEditor) => {
    const modified = diffEditor.getModifiedEditor();
    const original = diffEditor.getOriginalEditor();
    return modified && modified.getModel()?.uri.toString() === modifiedUri.toString() && original && original.getModel()?.uri.toString() === originalUri.toString();
  }) || null;
}

function findFocusedDiffEditor(accessor) {
  const codeEditorService = accessor.get(ICodeEditorService);
  const diffEditors = codeEditorService.listDiffEditors();
  const activeElement = getActiveElement();
  if (activeElement) {
    for (const d of diffEditors) {
      const container2 = d.getContainerDomNode();
      if (container2.contains(activeElement)) {
        return d;
      }
    }
  }
  return null;
}

function findDiffEditorContainingCodeEditor(accessor, editor) {
  if (!editor.getOption(70 /* inDiffEditor */)) {
    return null;
  }
  const codeEditorService = accessor.get(ICodeEditorService);
  for (const diffEditor of codeEditorService.listDiffEditors()) {
    const originalEditor = diffEditor.getOriginalEditor();
    const modifiedEditor = diffEditor.getModifiedEditor();
    if (originalEditor === editor || modifiedEditor === editor) {
      return diffEditor;
    }
  }
  return null;
}
export { findDiffEditor, findFocusedDiffEditor, findDiffEditorContainingCodeEditor, ToggleCollapseUnchangedRegions, ToggleShowMovedCodeBlocks, ToggleUseInlineViewWhenSpaceIsLimited, diffEditorCategory, SwitchSide, ExitCompareMove, CollapseAllUnchangedRegions, ShowAllUnchangedRegions, RevertHunkOrSelection, accessibleDiffViewerCategory, AccessibleDiffViewerNext, AccessibleDiffViewerPrev };
