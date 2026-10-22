// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/notebookDiffActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ActiveEditorContext } from "./module-0949.mjs";
import { NotebookTextDiffEditor } from "./module-1987.mjs";
import { NotebookMultiTextDiffEditor } from "./module-2467.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { nextChangeIcon2, openAsTextIcon, previousChangeIcon2, renderOutputIcon, revertIcon, toggleWhitespace2 } from "./module-1870.mjs";
import { DEFAULT_EDITOR_ASSOCIATION } from "./module-0925.mjs";
import { NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE_KEY, NOTEBOOK_DIFF_CELL_INPUT, NOTEBOOK_DIFF_CELL_PROPERTY, NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED, NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS, NOTEBOOK_DIFF_ITEM_DIFF_STATE, NOTEBOOK_DIFF_ITEM_KIND, NOTEBOOK_DIFF_METADATA, NOTEBOOK_DIFF_UNCHANGED_CELLS_HIDDEN } from "./module-1968.mjs";
import { SideBySideDiffElementViewModel } from "./module-1970.mjs";
import { IBulkEditService, ResourceTextEdit } from "./module-0537.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { NOTEBOOK_DIFF_EDITOR_ID } from "./module-0909.mjs";
import { ctxHasEditorModification, ctxHasRequestInProgress } from "./module-2057.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { product_default } from "./module-0139.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/notebookDiffActions.ts
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.diff.openFile",
      icon: Codicon.goToFile,
      title: localize2(17660, "Open File"),
      precondition: ContextKeyExpr.or(ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID), ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID)),
      menu: [{
        id: MenuId.EditorTitle,
        group: "navigation",
        when: ContextKeyExpr.or(ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID), ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID))
      }]
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const activeEditor = editorService.activeEditorPane;
    if (!activeEditor) {
      return;
    }
    if (activeEditor instanceof NotebookTextDiffEditor || activeEditor instanceof NotebookMultiTextDiffEditor) {
      const diffEditorInput = activeEditor.input;
      const resource = diffEditorInput.modified.resource;
      await editorService.openEditor({ resource });
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.diff.cell.toggleCollapseUnchangedRegions",
      title: localize2(17656, "Toggle Collapse Unchanged Regions"),
      icon: Codicon.map,
      toggled: ContextKeyExpr.has("config.diffEditor.hideUnchangedRegions.enabled"),
      precondition: ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID),
      menu: {
        id: MenuId.EditorTitle,
        group: "navigation",
        when: ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID)
      }
    });
  }
  run(accessor, ...args2) {
    const configurationService = accessor.get(IConfigurationService);
    const newValue = !configurationService.getValue("diffEditor.hideUnchangedRegions.enabled");
    configurationService.updateValue("diffEditor.hideUnchangedRegions.enabled", newValue);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.diff.switchToText",
      icon: openAsTextIcon,
      title: localize2(17664, "Open Text Diff Editor"),
      precondition: ContextKeyExpr.or(ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID), ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID)),
      menu: [{
        id: MenuId.EditorTitle,
        group: "navigation",
        when: ContextKeyExpr.or(ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID), ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID))
      }]
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const activeEditor = editorService.activeEditorPane;
    if (!activeEditor) {
      return;
    }
    if (activeEditor instanceof NotebookTextDiffEditor || activeEditor instanceof NotebookMultiTextDiffEditor) {
      const diffEditorInput = activeEditor.input;
      await editorService.openEditor(
        {
          original: { resource: diffEditorInput.original.resource },
          modified: { resource: diffEditorInput.resource },
          label: diffEditorInput.getName(),
          options: {
            preserveFocus: false,
            override: DEFAULT_EDITOR_ASSOCIATION.id
          }
        }
      );
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.diffEditor.showUnchangedCells",
      title: localize2(17666, "Show Unchanged Cells"),
      icon: Codicon.unfold,
      precondition: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.has(NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS.key)),
      menu: {
        when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.has(NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS.key), ContextKeyExpr.equals(NOTEBOOK_DIFF_UNCHANGED_CELLS_HIDDEN.key, true)),
        id: MenuId.EditorTitle,
        order: 22,
        group: "navigation"
      }
    });
  }
  run(accessor, ...args2) {
    const activeEditor = accessor.get(IEditorService).activeEditorPane;
    if (!activeEditor) {
      return;
    }
    if (activeEditor instanceof NotebookMultiTextDiffEditor) {
      activeEditor.showUnchanged();
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.diffEditor.hideUnchangedCells",
      title: localize2(17648, "Hide Unchanged Cells"),
      icon: Codicon.fold,
      precondition: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.has(NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS.key)),
      menu: {
        when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.has(NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS.key), ContextKeyExpr.equals(NOTEBOOK_DIFF_UNCHANGED_CELLS_HIDDEN.key, false)),
        id: MenuId.EditorTitle,
        order: 22,
        group: "navigation"
      }
    });
  }
  run(accessor, ...args2) {
    const activeEditor = accessor.get(IEditorService).activeEditorPane;
    if (!activeEditor) {
      return;
    }
    if (activeEditor instanceof NotebookMultiTextDiffEditor) {
      activeEditor.hideUnchanged();
    }
  }
});

registerAction2(class GoToFileAction extends Action2 {
  constructor() {
    super({
      id: "notebook.diffEditor.2.goToCell",
      title: localize2(17647, "Go To Cell"),
      icon: Codicon.goToFile,
      menu: {
        when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.equals(NOTEBOOK_DIFF_ITEM_KIND.key, "Cell"), ContextKeyExpr.notEquals(NOTEBOOK_DIFF_ITEM_DIFF_STATE.key, "delete")),
        id: MenuId.MultiDiffEditorFileToolbar,
        order: 0,
        group: "navigation"
      }
    });
  }
  async run(accessor, ...args2) {
    const uri5 = args2[0];
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (!(activeEditorPane instanceof NotebookMultiTextDiffEditor)) {
      return;
    }
    await editorService.openEditor({
      resource: uri5,
      options: {
        selectionRevealType: 1 /* CenterIfOutsideViewport */
      }
    });
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super(
      {
        id: "notebook.diff.revertMetadata",
        title: localize(17661, null),
        icon: revertIcon,
        f1: false,
        menu: {
          id: MenuId.NotebookDiffDocumentMetadata,
          when: NOTEBOOK_DIFF_METADATA
        },
        precondition: NOTEBOOK_DIFF_METADATA
      }
    );
  }
  run(accessor, context2) {
    if (!context2) {
      return;
    }
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (!(activeEditorPane instanceof NotebookTextDiffEditor)) {
      return;
    }
    context2.modifiedDocumentTextModel.applyEdits([{
      editType: 5 /* DocumentMetadata */,
      metadata: context2.originalMetadata.metadata
    }], true, void 0, () => void 0, void 0, true);
  }
});

var revertInput = localize(17652, null);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.diffEditor.2.cell.revertInput",
      title: revertInput,
      icon: revertIcon,
      menu: {
        when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.equals(NOTEBOOK_DIFF_ITEM_KIND.key, "Cell"), ContextKeyExpr.equals(NOTEBOOK_DIFF_ITEM_DIFF_STATE.key, "modified")),
        id: MenuId.MultiDiffEditorFileToolbar,
        order: 2,
        group: "navigation"
      }
    });
  }
  async run(accessor, ...args2) {
    const uri5 = args2[0];
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (!(activeEditorPane instanceof NotebookMultiTextDiffEditor)) {
      return;
    }
    const item = activeEditorPane.getDiffElementViewModel(uri5);
    if (item && item instanceof SideBySideDiffElementViewModel) {
      const modified = item.modified;
      const original = item.original;
      if (!original || !modified) {
        return;
      }
      const bulkEditService = accessor.get(IBulkEditService);
      await bulkEditService.apply([
        new ResourceTextEdit(modified.uri, { range: modified.textModel.getFullModelRange(), text: original.textModel.getValue() })
      ], { quotableLabel: "Revert Notebook Cell Content Change" });
    }
  }
});

var revertOutputs = localize(17654, null);

registerAction2(class extends Action2 {
  constructor() {
    super(
      {
        id: "notebook.diffEditor.2.cell.revertOutputs",
        title: revertOutputs,
        icon: revertIcon,
        f1: false,
        menu: {
          when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.equals(NOTEBOOK_DIFF_ITEM_KIND.key, "Output"), ContextKeyExpr.equals(NOTEBOOK_DIFF_ITEM_DIFF_STATE.key, "modified")),
          id: MenuId.MultiDiffEditorFileToolbar,
          order: 2,
          group: "navigation"
        }
      }
    );
  }
  async run(accessor, ...args2) {
    const uri5 = args2[0];
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (!(activeEditorPane instanceof NotebookMultiTextDiffEditor)) {
      return;
    }
    const item = activeEditorPane.getDiffElementViewModel(uri5);
    if (item && item instanceof SideBySideDiffElementViewModel) {
      const original = item.original;
      const modifiedCellIndex = item.modifiedDocument.cells.findIndex((cell) => cell.handle === item.modified.handle);
      if (modifiedCellIndex === -1) {
        return;
      }
      item.mainDocumentTextModel.applyEdits([{
        editType: 2 /* Output */,
        index: modifiedCellIndex,
        outputs: original.outputs
      }], true, void 0, () => void 0, void 0, true);
    }
  }
});

var revertMetadata = localize(17653, null);

registerAction2(class extends Action2 {
  constructor() {
    super(
      {
        id: "notebook.diffEditor.2.cell.revertMetadata",
        title: revertMetadata,
        icon: revertIcon,
        f1: false,
        menu: {
          when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.equals(NOTEBOOK_DIFF_ITEM_KIND.key, "Metadata"), ContextKeyExpr.equals(NOTEBOOK_DIFF_ITEM_DIFF_STATE.key, "modified")),
          id: MenuId.MultiDiffEditorFileToolbar,
          order: 2,
          group: "navigation"
        }
      }
    );
  }
  async run(accessor, ...args2) {
    const uri5 = args2[0];
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (!(activeEditorPane instanceof NotebookMultiTextDiffEditor)) {
      return;
    }
    const item = activeEditorPane.getDiffElementViewModel(uri5);
    if (item && item instanceof SideBySideDiffElementViewModel) {
      const original = item.original;
      const modifiedCellIndex = item.modifiedDocument.cells.findIndex((cell) => cell.handle === item.modified.handle);
      if (modifiedCellIndex === -1) {
        return;
      }
      item.mainDocumentTextModel.applyEdits([{
        editType: 3 /* Metadata */,
        index: modifiedCellIndex,
        metadata: original.metadata
      }], true, void 0, () => void 0, void 0, true);
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super(
      {
        id: "notebook.diff.cell.revertMetadata",
        title: revertMetadata,
        icon: revertIcon,
        f1: false,
        menu: {
          id: MenuId.NotebookDiffCellMetadataTitle,
          when: NOTEBOOK_DIFF_CELL_PROPERTY
        },
        precondition: NOTEBOOK_DIFF_CELL_PROPERTY
      }
    );
  }
  run(accessor, context2) {
    if (!context2) {
      return;
    }
    if (!(context2 instanceof SideBySideDiffElementViewModel)) {
      return;
    }
    const original = context2.original;
    const modified = context2.modified;
    const modifiedCellIndex = context2.mainDocumentTextModel.cells.indexOf(modified.textModel);
    if (modifiedCellIndex === -1) {
      return;
    }
    const rawEdits = [{ editType: 3 /* Metadata */, index: modifiedCellIndex, metadata: original.metadata }];
    if (context2.original.language && context2.modified.language !== context2.original.language) {
      rawEdits.push({ editType: 4 /* CellLanguage */, index: modifiedCellIndex, language: context2.original.language });
    }
    context2.modifiedDocument.applyEdits(rawEdits, true, void 0, () => void 0, void 0, true);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super(
      {
        id: "notebook.diff.cell.switchOutputRenderingStyleToText",
        title: localize(17655, null),
        icon: renderOutputIcon,
        f1: false,
        menu: {
          id: MenuId.NotebookDiffCellOutputsTitle,
          when: NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED
        }
      }
    );
  }
  run(accessor, context2) {
    if (!context2) {
      return;
    }
    context2.renderOutput = !context2.renderOutput;
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super(
      {
        id: "notebook.diff.cell.revertOutputs",
        title: localize(17654, null),
        icon: revertIcon,
        f1: false,
        menu: {
          id: MenuId.NotebookDiffCellOutputsTitle,
          when: NOTEBOOK_DIFF_CELL_PROPERTY
        },
        precondition: NOTEBOOK_DIFF_CELL_PROPERTY
      }
    );
  }
  run(accessor, context2) {
    if (!context2) {
      return;
    }
    if (!(context2 instanceof SideBySideDiffElementViewModel)) {
      return;
    }
    const original = context2.original;
    const modified = context2.modified;
    const modifiedCellIndex = context2.mainDocumentTextModel.cells.indexOf(modified.textModel);
    if (modifiedCellIndex === -1) {
      return;
    }
    context2.mainDocumentTextModel.applyEdits([{
      editType: 2 /* Output */,
      index: modifiedCellIndex,
      outputs: original.outputs
    }], true, void 0, () => void 0, void 0, true);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super(
      {
        id: "notebook.toggle.diff.cell.ignoreTrimWhitespace",
        title: localize(17649, null),
        icon: toggleWhitespace2,
        f1: false,
        menu: {
          id: MenuId.NotebookDiffCellInputTitle,
          when: NOTEBOOK_DIFF_CELL_INPUT,
          order: 1
        },
        precondition: NOTEBOOK_DIFF_CELL_INPUT,
        toggled: ContextKeyExpr.equals(NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE_KEY, false)
      }
    );
  }
  run(accessor, context2) {
    const cell = context2;
    if (!cell?.modified) {
      return;
    }
    const uri5 = cell.modified.uri;
    const configService = accessor.get(ITextResourceConfigurationService);
    const key3 = "diffEditor.ignoreTrimWhitespace";
    const val = configService.getValue(uri5, key3);
    configService.updateValue(uri5, key3, !val);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super(
      {
        id: "notebook.diff.cell.revertInput",
        title: revertInput,
        icon: revertIcon,
        f1: false,
        menu: {
          id: MenuId.NotebookDiffCellInputTitle,
          when: NOTEBOOK_DIFF_CELL_INPUT,
          order: 2
        },
        precondition: NOTEBOOK_DIFF_CELL_INPUT
      }
    );
  }
  run(accessor, context2) {
    if (!context2) {
      return;
    }
    const original = context2.original;
    const modified = context2.modified;
    if (!original || !modified) {
      return;
    }
    const bulkEditService = accessor.get(IBulkEditService);
    return bulkEditService.apply([
      new ResourceTextEdit(modified.uri, { range: modified.textModel.getFullModelRange(), text: original.textModel.getValue() })
    ], { quotableLabel: "Revert Notebook Cell Content Change" });
  }
});

var ToggleRenderAction = class extends Action2 {
  constructor(id2, title, precondition2, toggled, order, toggleOutputs, toggleMetadata) {
    super({
      id: id2,
      title,
      precondition: precondition2,
      menu: [{
        id: MenuId.EditorTitle,
        group: "notebook",
        when: precondition2,
        order
      }],
      toggled
    });
    this.toggleOutputs = toggleOutputs;
    this.toggleMetadata = toggleMetadata;
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    if (this.toggleOutputs !== void 0) {
      const oldValue = configurationService.getValue("notebook.diff.ignoreOutputs");
      configurationService.updateValue("notebook.diff.ignoreOutputs", !oldValue);
    }
    if (this.toggleMetadata !== void 0) {
      const oldValue = configurationService.getValue("notebook.diff.ignoreMetadata");
      configurationService.updateValue("notebook.diff.ignoreMetadata", !oldValue);
    }
  }
};

registerAction2(class extends ToggleRenderAction {
  constructor() {
    super(
      "notebook.diff.showOutputs",
      localize2(17663, "Show Outputs Differences"),
      ContextKeyExpr.or(ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID), ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID)),
      ContextKeyExpr.notEquals("config.notebook.diff.ignoreOutputs", true),
      2,
      true,
      void 0
    );
  }
});

registerAction2(class extends ToggleRenderAction {
  constructor() {
    super(
      "notebook.diff.showMetadata",
      localize2(17662, "Show Metadata Differences"),
      ContextKeyExpr.or(ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID), ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID)),
      ContextKeyExpr.notEquals("config.notebook.diff.ignoreMetadata", true),
      1,
      void 0,
      true
    );
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super(
      {
        id: "notebook.diff.action.previous",
        title: localize(17651, null),
        icon: previousChangeIcon2,
        f1: false,
        keybinding: {
          primary: 1024 /* Shift */ | 512 /* Alt */ | 61 /* F3 */,
          weight: 200 /* WorkbenchContrib */,
          when: ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID)
        },
        menu: {
          id: MenuId.EditorTitle,
          group: "navigation",
          when: ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID)
        }
      }
    );
  }
  run(accessor) {
    const editorService = accessor.get(IEditorService);
    if (editorService.activeEditorPane?.getId() !== NOTEBOOK_DIFF_EDITOR_ID) {
      return;
    }
    const editor = editorService.activeEditorPane.getControl();
    editor?.previousChange();
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super(
      {
        id: "notebook.diff.action.next",
        title: localize(17650, null),
        icon: nextChangeIcon2,
        f1: false,
        keybinding: {
          primary: 512 /* Alt */ | 61 /* F3 */,
          weight: 200 /* WorkbenchContrib */,
          when: ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID)
        },
        menu: {
          id: MenuId.EditorTitle,
          group: "navigation",
          when: ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID)
        }
      }
    );
  }
  run(accessor) {
    const editorService = accessor.get(IEditorService);
    if (editorService.activeEditorPane?.getId() !== NOTEBOOK_DIFF_EDITOR_ID) {
      return;
    }
    const editor = editorService.activeEditorPane.getControl();
    editor?.nextChange();
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super(
      {
        id: "notebook.diff.inline.toggle",
        title: localize(17659, null),
        menu: {
          id: MenuId.EditorTitle,
          group: "1_diff",
          order: 10,
          when: ContextKeyExpr.and(
            ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID),
            ContextKeyExpr.equals("config.notebook.diff.experimental.toggleInline", true),
            ctxHasEditorModification.negate(),
            ctxHasRequestInProgress.negate()
          )
        }
      }
    );
  }
  run(accessor) {
    const editorService = accessor.get(IEditorService);
    if (editorService.activeEditorPane?.getId() !== NOTEBOOK_DIFF_EDITOR_ID) {
      return;
    }
    const editor = editorService.activeEditorPane.getControl();
    editor?.toggleInlineView();
  }
});

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "notebook",
  order: 100,
  type: "object",
  "properties": {
    "notebook.diff.ignoreMetadata": {
      type: "boolean",
      default: false,
      markdownDescription: localize(17657, null)
    },
    "notebook.diff.ignoreOutputs": {
      type: "boolean",
      default: false,
      markdownDescription: localize(17658, null)
    },
    "notebook.diff.experimental.toggleInline": {
      type: "boolean",
      default: typeof product_default.quality === "string" && product_default.quality !== "stable",
      // only enable as default in insiders
      markdownDescription: localize(17665, null)
    }
  }
});
export { revertInput, revertOutputs, revertMetadata, ToggleRenderAction };
