// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/commands/commands.ts
import { Action2, MenuId } from "./module-0092.mjs";
import { IEditorService } from "./module-0935.mjs";
import { MergeEditor } from "./module-2986.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { MergeEditorInputData } from "./module-1145.mjs";
import { URI } from "./module-0032.mjs";
import { StorageCloseWithConflicts, ctxIsMergeEditor, ctxMergeEditorLayout, ctxMergeEditorShowBase, ctxMergeEditorShowBaseAtTop, ctxMergeEditorShowNonConflictingChanges } from "./module-1142.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { Codicon } from "./module-0085.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IStorageService } from "./module-0512.mjs";
import { transaction } from "./module-0045.mjs";
import { IDialogService } from "./module-0267.mjs";
import { basename2 } from "./module-0034.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/commands/commands.ts
var MergeEditorAction = class extends Action2 {
  constructor(desc) {
    super(desc);
  }
  run(accessor) {
    const { activeEditorPane } = accessor.get(IEditorService);
    if (activeEditorPane instanceof MergeEditor) {
      const vm = activeEditorPane.viewModel.get();
      if (!vm) {
        return;
      }
      this.runWithViewModel(vm, accessor);
    }
  }
};

var MergeEditorAction2 = class extends Action2 {
  constructor(desc) {
    super(desc);
  }
  run(accessor, ...args2) {
    const { activeEditorPane } = accessor.get(IEditorService);
    if (activeEditorPane instanceof MergeEditor) {
      const vm = activeEditorPane.viewModel.get();
      if (!vm) {
        return;
      }
      return this.runWithMergeEditor({
        viewModel: vm,
        inputModel: activeEditorPane.inputModel.get(),
        input: activeEditorPane.input,
        editorIdentifier: {
          editor: activeEditorPane.input,
          groupId: activeEditorPane.group.id
        }
      }, accessor, ...args2);
    }
  }
};

var OpenMergeEditor = class extends Action2 {
  constructor() {
    super({
      id: "_open.mergeEditor",
      title: localize2(17235, "Open Merge Editor")
    });
  }
  run(accessor, ...args2) {
    const validatedArgs = IRelaxedOpenArgs.validate(args2[0]);
    const input = {
      base: { resource: validatedArgs.base },
      input1: { resource: validatedArgs.input1.uri, label: validatedArgs.input1.title, description: validatedArgs.input1.description, detail: validatedArgs.input1.detail },
      input2: { resource: validatedArgs.input2.uri, label: validatedArgs.input2.title, description: validatedArgs.input2.description, detail: validatedArgs.input2.detail },
      result: { resource: validatedArgs.output },
      options: { preserveFocus: true }
    };
    accessor.get(IEditorService).openEditor(input);
  }
};

var IRelaxedOpenArgs;

((IRelaxedOpenArgs2) => {
  function validate(obj) {
    if (!obj || typeof obj !== "object") {
      throw new TypeError("invalid argument");
    }
    const o = obj;
    const base = toUri(o.base);
    const output = toUri(o.output);
    const input1 = toInputData2(o.input1);
    const input2 = toInputData2(o.input2);
    return { base, input1, input2, output };
  }
  IRelaxedOpenArgs2.validate = validate;
  function toInputData2(obj) {
    if (typeof obj === "string") {
      return new MergeEditorInputData(URI.parse(obj, true), void 0, void 0, void 0);
    }
    if (!obj || typeof obj !== "object") {
      throw new TypeError("invalid argument");
    }
    if (isUriComponents3(obj)) {
      return new MergeEditorInputData(URI.revive(obj), void 0, void 0, void 0);
    }
    const o = obj;
    const title = o.title;
    const uri4 = toUri(o.uri);
    const detail2 = o.detail;
    const description = o.description;
    return new MergeEditorInputData(uri4, title, detail2, description);
  }
  function toUri(obj) {
    if (typeof obj === "string") {
      return URI.parse(obj, true);
    } else if (obj && typeof obj === "object") {
      return URI.revive(obj);
    }
    throw new TypeError("invalid argument");
  }
  function isUriComponents3(obj) {
    if (!obj || typeof obj !== "object") {
      return false;
    }
    const o = obj;
    return typeof o.scheme === "string" && typeof o.authority === "string" && typeof o.path === "string" && typeof o.query === "string" && typeof o.fragment === "string";
  }
})(IRelaxedOpenArgs || (IRelaxedOpenArgs = {}));

var SetMixedLayout = class extends Action2 {
  constructor() {
    super({
      id: "merge.mixedLayout",
      title: localize2(17209, "Mixed Layout"),
      toggled: ctxMergeEditorLayout.isEqualTo("mixed"),
      menu: [
        {
          id: MenuId.EditorTitle,
          when: ctxIsMergeEditor,
          group: "1_merge",
          order: 9
        }
      ],
      precondition: ctxIsMergeEditor
    });
  }
  run(accessor) {
    const { activeEditorPane } = accessor.get(IEditorService);
    if (activeEditorPane instanceof MergeEditor) {
      activeEditorPane.setLayoutKind("mixed");
    }
  }
};

var SetColumnLayout = class extends Action2 {
  constructor() {
    super({
      id: "merge.columnLayout",
      title: localize2(17208, "Column Layout"),
      toggled: ctxMergeEditorLayout.isEqualTo("columns"),
      menu: [{
        id: MenuId.EditorTitle,
        when: ctxIsMergeEditor,
        group: "1_merge",
        order: 10
      }],
      precondition: ctxIsMergeEditor
    });
  }
  run(accessor) {
    const { activeEditorPane } = accessor.get(IEditorService);
    if (activeEditorPane instanceof MergeEditor) {
      activeEditorPane.setLayoutKind("columns");
    }
  }
};

var ShowNonConflictingChanges = class extends Action2 {
  constructor() {
    super({
      id: "merge.showNonConflictingChanges",
      title: localize2(17234, "Show Non-Conflicting Changes"),
      toggled: ctxMergeEditorShowNonConflictingChanges.isEqualTo(true),
      menu: [
        {
          id: MenuId.EditorTitle,
          when: ctxIsMergeEditor,
          group: "3_merge",
          order: 9
        }
      ],
      precondition: ctxIsMergeEditor
    });
  }
  run(accessor) {
    const { activeEditorPane } = accessor.get(IEditorService);
    if (activeEditorPane instanceof MergeEditor) {
      activeEditorPane.toggleShowNonConflictingChanges();
    }
  }
};

var ShowHideBase = class extends Action2 {
  constructor() {
    super({
      id: "merge.showBase",
      title: localize2(17210, "Show Base"),
      toggled: ctxMergeEditorShowBase.isEqualTo(true),
      menu: [
        {
          id: MenuId.EditorTitle,
          when: ContextKeyExpr.and(ctxIsMergeEditor, ctxMergeEditorLayout.isEqualTo("columns")),
          group: "2_merge",
          order: 9
        }
      ]
    });
  }
  run(accessor) {
    const { activeEditorPane } = accessor.get(IEditorService);
    if (activeEditorPane instanceof MergeEditor) {
      activeEditorPane.toggleBase();
    }
  }
};

var ShowHideTopBase = class extends Action2 {
  constructor() {
    super({
      id: "merge.showBaseTop",
      title: localize2(17212, "Show Base Top"),
      toggled: ContextKeyExpr.and(ctxMergeEditorShowBase, ctxMergeEditorShowBaseAtTop),
      menu: [
        {
          id: MenuId.EditorTitle,
          when: ContextKeyExpr.and(ctxIsMergeEditor, ctxMergeEditorLayout.isEqualTo("mixed")),
          group: "2_merge",
          order: 10
        }
      ]
    });
  }
  run(accessor) {
    const { activeEditorPane } = accessor.get(IEditorService);
    if (activeEditorPane instanceof MergeEditor) {
      activeEditorPane.toggleShowBaseTop();
    }
  }
};

var ShowHideCenterBase = class extends Action2 {
  constructor() {
    super({
      id: "merge.showBaseCenter",
      title: localize2(17211, "Show Base Center"),
      toggled: ContextKeyExpr.and(ctxMergeEditorShowBase, ctxMergeEditorShowBaseAtTop.negate()),
      menu: [
        {
          id: MenuId.EditorTitle,
          when: ContextKeyExpr.and(ctxIsMergeEditor, ctxMergeEditorLayout.isEqualTo("mixed")),
          group: "2_merge",
          order: 11
        }
      ]
    });
  }
  run(accessor) {
    const { activeEditorPane } = accessor.get(IEditorService);
    if (activeEditorPane instanceof MergeEditor) {
      activeEditorPane.toggleShowBaseCenter();
    }
  }
};

var mergeEditorCategory = localize2(17220, "Merge Editor");

var OpenResultResource = class extends MergeEditorAction {
  constructor() {
    super({
      id: "merge.openResult",
      icon: Codicon.goToFile,
      title: localize2(17233, "Open File"),
      category: mergeEditorCategory,
      menu: [{
        id: MenuId.EditorTitle,
        when: ctxIsMergeEditor,
        group: "navigation",
        order: 1
      }],
      precondition: ctxIsMergeEditor
    });
  }
  runWithViewModel(viewModel, accessor) {
    const editorService = accessor.get(IEditorService);
    editorService.openEditor({ resource: viewModel.model.resultTextModel.uri });
  }
};

var GoToNextUnhandledConflict = class extends MergeEditorAction {
  constructor() {
    super({
      id: "merge.goToNextUnhandledConflict",
      category: mergeEditorCategory,
      title: localize2(17215, "Go to Next Unhandled Conflict"),
      icon: Codicon.arrowDown,
      menu: [
        {
          id: MenuId.EditorTitle,
          when: ctxIsMergeEditor,
          group: "navigation",
          order: 3
        }
      ],
      f1: true,
      precondition: ctxIsMergeEditor
    });
  }
  runWithViewModel(viewModel) {
    viewModel.model.telemetry.reportNavigationToNextConflict();
    viewModel.goToNextModifiedBaseRange((r2) => !viewModel.model.isHandled(r2).get());
  }
};

var GoToPreviousUnhandledConflict = class extends MergeEditorAction {
  constructor() {
    super({
      id: "merge.goToPreviousUnhandledConflict",
      category: mergeEditorCategory,
      title: localize2(17216, "Go to Previous Unhandled Conflict"),
      icon: Codicon.arrowUp,
      menu: [
        {
          id: MenuId.EditorTitle,
          when: ctxIsMergeEditor,
          group: "navigation",
          order: 2
        }
      ],
      f1: true,
      precondition: ctxIsMergeEditor
    });
  }
  runWithViewModel(viewModel) {
    viewModel.model.telemetry.reportNavigationToPreviousConflict();
    viewModel.goToPreviousModifiedBaseRange((r2) => !viewModel.model.isHandled(r2).get());
  }
};

var ToggleActiveConflictInput1 = class extends MergeEditorAction {
  constructor() {
    super({
      id: "merge.toggleActiveConflictInput1",
      category: mergeEditorCategory,
      title: localize2(17218, "Toggle Current Conflict from Left"),
      f1: true,
      precondition: ctxIsMergeEditor
    });
  }
  runWithViewModel(viewModel) {
    viewModel.toggleActiveConflict(1);
  }
};

var ToggleActiveConflictInput2 = class extends MergeEditorAction {
  constructor() {
    super({
      id: "merge.toggleActiveConflictInput2",
      category: mergeEditorCategory,
      title: localize2(17219, "Toggle Current Conflict from Right"),
      f1: true,
      precondition: ctxIsMergeEditor
    });
  }
  runWithViewModel(viewModel) {
    viewModel.toggleActiveConflict(2);
  }
};

var CompareInput1WithBaseCommand = class extends MergeEditorAction {
  constructor() {
    super({
      id: "mergeEditor.compareInput1WithBase",
      category: mergeEditorCategory,
      title: localize2(17226, "Compare Input 1 With Base"),
      shortTitle: localize(17228, null),
      f1: true,
      precondition: ctxIsMergeEditor,
      menu: { id: MenuId.MergeInput1Toolbar, group: "primary" },
      icon: Codicon.compareChanges
    });
  }
  runWithViewModel(viewModel, accessor) {
    const editorService = accessor.get(IEditorService);
    mergeEditorCompare(viewModel, editorService, 1);
  }
};

var CompareInput2WithBaseCommand = class extends MergeEditorAction {
  constructor() {
    super({
      id: "mergeEditor.compareInput2WithBase",
      category: mergeEditorCategory,
      title: localize2(17227, "Compare Input 2 With Base"),
      shortTitle: localize(17228, null),
      f1: true,
      precondition: ctxIsMergeEditor,
      menu: { id: MenuId.MergeInput2Toolbar, group: "primary" },
      icon: Codicon.compareChanges
    });
  }
  runWithViewModel(viewModel, accessor) {
    const editorService = accessor.get(IEditorService);
    mergeEditorCompare(viewModel, editorService, 2);
  }
};

async function mergeEditorCompare(viewModel, editorService, inputNumber) {
  editorService.openEditor(editorService.activeEditor, { pinned: true });
  const model = viewModel.model;
  const base = model.base;
  const input = inputNumber === 1 ? viewModel.inputCodeEditorView1.editor : viewModel.inputCodeEditorView2.editor;
  const lineNumber = input.getPosition().lineNumber;
  await editorService.openEditor({
    original: { resource: base.uri },
    modified: { resource: input.getModel().uri },
    options: {
      selection: {
        startLineNumber: lineNumber,
        startColumn: 1
      },
      revealIfOpened: true,
      revealIfVisible: true
    }
  });
}

var OpenBaseFile = class extends MergeEditorAction {
  constructor() {
    super({
      id: "merge.openBaseEditor",
      category: mergeEditorCategory,
      title: localize2(17217, "Open Base File"),
      f1: true,
      precondition: ctxIsMergeEditor
    });
  }
  runWithViewModel(viewModel, accessor) {
    const openerService = accessor.get(IOpenerService);
    openerService.open(viewModel.model.base.uri);
  }
};

var AcceptAllInput1 = class extends MergeEditorAction {
  constructor() {
    super({
      id: "merge.acceptAllInput1",
      category: mergeEditorCategory,
      title: localize2(17213, "Accept All Incoming Changes from Left"),
      f1: true,
      precondition: ctxIsMergeEditor,
      menu: { id: MenuId.MergeInput1Toolbar, group: "primary" },
      icon: Codicon.checkAll
    });
  }
  runWithViewModel(viewModel) {
    viewModel.acceptAll(1);
  }
};

var AcceptAllInput2 = class extends MergeEditorAction {
  constructor() {
    super({
      id: "merge.acceptAllInput2",
      category: mergeEditorCategory,
      title: localize2(17214, "Accept All Current Changes from Right"),
      f1: true,
      precondition: ctxIsMergeEditor,
      menu: { id: MenuId.MergeInput2Toolbar, group: "primary" },
      icon: Codicon.checkAll
    });
  }
  runWithViewModel(viewModel) {
    viewModel.acceptAll(2);
  }
};

var ResetToBaseAndAutoMergeCommand = class extends MergeEditorAction {
  constructor() {
    super({
      id: "mergeEditor.resetResultToBaseAndAutoMerge",
      category: mergeEditorCategory,
      title: localize2(17230, "Reset Result"),
      shortTitle: localize(17231, null),
      f1: true,
      precondition: ctxIsMergeEditor,
      menu: { id: MenuId.MergeInputResultToolbar, group: "primary" },
      icon: Codicon.discard
    });
  }
  runWithViewModel(viewModel, accessor) {
    viewModel.model.reset();
  }
};

var ResetCloseWithConflictsChoice = class extends Action2 {
  constructor() {
    super({
      id: "mergeEditor.resetCloseWithConflictsChoice",
      category: mergeEditorCategory,
      title: localize2(17229, "Reset Choice for 'Close with Conflicts'"),
      f1: true
    });
  }
  run(accessor) {
    accessor.get(IStorageService).remove(StorageCloseWithConflicts, 0 /* PROFILE */);
  }
};

var AcceptAllCombination = class extends MergeEditorAction2 {
  constructor() {
    super({
      id: "mergeEditor.acceptAllCombination",
      category: mergeEditorCategory,
      title: localize2(17221, "Accept All Combination"),
      f1: true
    });
  }
  runWithMergeEditor(context2, accessor, ...args2) {
    const { viewModel } = context2;
    const modifiedBaseRanges = viewModel.model.modifiedBaseRanges.get();
    const model = viewModel.model;
    transaction((tx) => {
      for (const m of modifiedBaseRanges) {
        const state = model.getState(m).get();
        if (state.kind !== 4 /* unrecognized */ && !state.isInputIncluded(1) && (!state.isInputIncluded(2) || !viewModel.shouldUseAppendInsteadOfAccept.get()) && m.canBeCombined) {
          model.setState(
            m,
            state.withInputValue(1, true).withInputValue(2, true, true),
            true,
            tx
          );
          model.telemetry.reportSmartCombinationInvoked(state.includesInput(2));
        }
      }
    });
    return { success: true };
  }
};

var AcceptMerge = class extends MergeEditorAction2 {
  constructor() {
    super({
      id: "mergeEditor.acceptMerge",
      category: mergeEditorCategory,
      title: localize2(17222, "Complete Merge"),
      f1: true,
      precondition: ctxIsMergeEditor,
      keybinding: [
        {
          primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
          weight: 100 /* EditorContrib */,
          when: ctxIsMergeEditor
        }
      ]
    });
  }
  async runWithMergeEditor({ inputModel, editorIdentifier, viewModel }, accessor) {
    const dialogService = accessor.get(IDialogService);
    const editorService = accessor.get(IEditorService);
    if (viewModel.model.unhandledConflictsCount.get() > 0) {
      const { confirmed } = await dialogService.confirm({
        message: localize(17225, null, basename2(inputModel.resultUri)),
        detail: localize(17224, null),
        primaryButton: localize(17223, null)
      });
      if (!confirmed) {
        return {
          successful: false
        };
      }
    }
    await inputModel.accept();
    await editorService.closeEditor(editorIdentifier);
    return {
      successful: true
    };
  }
};

var ToggleBetweenInputs = class extends MergeEditorAction2 {
  constructor() {
    super({
      id: "mergeEditor.toggleBetweenInputs",
      category: mergeEditorCategory,
      title: localize2(17232, "Toggle Between Merge Editor Inputs"),
      f1: true,
      precondition: ctxIsMergeEditor,
      keybinding: [
        {
          primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 50 /* KeyT */,
          // Override reopen closed editor
          weight: 200 /* WorkbenchContrib */ + 10,
          when: ctxIsMergeEditor
        }
      ]
    });
  }
  runWithMergeEditor({ viewModel }, accessor) {
    const input1IsFocused = viewModel.inputCodeEditorView1.editor.hasWidgetFocus();
    if (input1IsFocused) {
      viewModel.inputCodeEditorView2.editor.focus();
    } else {
      viewModel.inputCodeEditorView1.editor.focus();
    }
  }
};
export { mergeEditorCompare, MergeEditorAction, MergeEditorAction2, OpenMergeEditor, IRelaxedOpenArgs, SetMixedLayout, SetColumnLayout, ShowNonConflictingChanges, ShowHideBase, ShowHideTopBase, ShowHideCenterBase, mergeEditorCategory, OpenResultResource, GoToNextUnhandledConflict, GoToPreviousUnhandledConflict, ToggleActiveConflictInput1, ToggleActiveConflictInput2, CompareInput1WithBaseCommand, CompareInput2WithBaseCommand, OpenBaseFile, AcceptAllInput1, AcceptAllInput2, ResetToBaseAndAutoMergeCommand, ResetCloseWithConflictsChoice, AcceptAllCombination, AcceptMerge, ToggleBetweenInputs };
