// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/controller/editActions.ts
import { MenuId, registerAction2 } from "./module-0092.mjs";
import { CELL_TITLE_CELL_GROUP_ID, CELL_TITLE_OUTPUT_GROUP_ID, NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT, NotebookAction, NotebookCellAction, NotebookMultiCellAction, executeNotebookCondition, findTargetCellEditor } from "./module-1845.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { NOTEBOOK_CELL_EDITABLE, NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_CELL_IS_FIRST_OUTPUT, NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_CELL_MARKDOWN_EDIT_MODE, NOTEBOOK_CELL_TYPE, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_HAS_OUTPUTS, NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_OUTPUT_FOCUSED, NOTEBOOK_OUTPUT_INPUT_FOCUSED, NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON } from "./module-1844.mjs";
import { InputFocusedContext, InputFocusedContextKey } from "./module-0635.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { clearIcon, deleteCellIcon, editIcon, stopEditIcon } from "./module-1846.mjs";
import { InlineChatController } from "./module-2372.mjs";
import { CTX_INLINE_CHAT_FOCUSED } from "./module-1978.mjs";
import { CHANGE_CELL_LANGUAGE, DETECT_CELL_LANGUAGE, QUIT_EDIT_CELL_COMMAND_ID, getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { INotebookExecutionStateService } from "./module-1386.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { NotebookSetting } from "./module-0911.mjs";
import { IDialogService } from "./module-0267.mjs";
import { changeCellToKind, runDeleteAction } from "./module-1976.mjs";
import { NotebookInlineVariablesController } from "./module-2388.mjs";
import { KeyChord } from "./module-0019.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILanguageDetectionService } from "./module-1098.mjs";
import { INotebookKernelService } from "./module-1387.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { URI } from "./module-0032.mjs";
import { INotificationService } from "./module-0336.mjs";
import { Mimes } from "./module-0136.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { NotebookChangeTabDisplaySize, NotebookIndentUsingSpaces, NotebookIndentUsingTabs, NotebookIndentationToSpacesAction, NotebookIndentationToTabsAction } from "./module-2373.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { LineCommentCommand } from "./module-0662.mjs";
import { Selection } from "./module-0107.mjs";
import { CommandExecutor } from "./module-0429.mjs";


// src/vs/workbench/contrib/notebook/browser/controller/editActions.ts
var CLEAR_ALL_CELLS_OUTPUTS_COMMAND_ID = "notebook.clearAllCellsOutputs";

var EDIT_CELL_COMMAND_ID = "notebook.cell.edit";

var DELETE_CELL_COMMAND_ID = "notebook.cell.delete";

var QUIT_EDIT_ALL_CELLS_COMMAND_ID = "notebook.quitEditAllCells";

var CLEAR_CELL_OUTPUTS_COMMAND_ID = "notebook.cell.clearOutputs";

var SELECT_NOTEBOOK_INDENTATION_ID = "notebook.selectIndentation";

var COMMENT_SELECTED_CELLS_ID = "notebook.commentSelectedCells";

registerAction2(class EditCellAction extends NotebookCellAction {
  constructor() {
    super(
      {
        id: EDIT_CELL_COMMAND_ID,
        title: localize(17556, null),
        keybinding: {
          when: ContextKeyExpr.and(
            NOTEBOOK_CELL_LIST_FOCUSED,
            ContextKeyExpr.not(InputFocusedContextKey),
            EditorContextKeys.hoverFocused.toNegated(),
            NOTEBOOK_OUTPUT_INPUT_FOCUSED.toNegated()
          ),
          primary: 3 /* Enter */,
          weight: 200 /* WorkbenchContrib */
        },
        menu: {
          id: MenuId.NotebookCellTitle,
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true),
            NOTEBOOK_CELL_TYPE.isEqualTo("markup"),
            NOTEBOOK_CELL_MARKDOWN_EDIT_MODE.toNegated(),
            NOTEBOOK_CELL_EDITABLE
          ),
          order: 1 /* EditCell */,
          group: CELL_TITLE_CELL_GROUP_ID
        },
        icon: editIcon
      }
    );
  }
  async runWithContext(accessor, context2) {
    if (!context2.notebookEditor.hasModel()) {
      return;
    }
    await context2.notebookEditor.focusNotebookCell(context2.cell, "editor");
    const foundEditor = context2.cell ? findTargetCellEditor(context2, context2.cell) : void 0;
    if (foundEditor && foundEditor.hasTextFocus() && InlineChatController.get(foundEditor)?.getWidgetPosition()?.lineNumber === foundEditor.getPosition()?.lineNumber) {
      InlineChatController.get(foundEditor)?.focus();
    }
  }
});

var quitEditCondition = ContextKeyExpr.and(
  NOTEBOOK_EDITOR_FOCUSED,
  InputFocusedContext,
  CTX_INLINE_CHAT_FOCUSED.toNegated()
);

registerAction2(class QuitEditCellAction extends NotebookCellAction {
  constructor() {
    super(
      {
        id: QUIT_EDIT_CELL_COMMAND_ID,
        title: localize(17557, null),
        menu: {
          id: MenuId.NotebookCellTitle,
          when: ContextKeyExpr.and(
            NOTEBOOK_CELL_TYPE.isEqualTo("markup"),
            NOTEBOOK_CELL_MARKDOWN_EDIT_MODE,
            NOTEBOOK_CELL_EDITABLE
          ),
          order: 4 /* SaveCell */,
          group: CELL_TITLE_CELL_GROUP_ID
        },
        icon: stopEditIcon,
        keybinding: [
          {
            when: ContextKeyExpr.and(
              quitEditCondition,
              EditorContextKeys.hoverVisible.toNegated(),
              EditorContextKeys.hasNonEmptySelection.toNegated(),
              EditorContextKeys.hasMultipleSelections.toNegated()
            ),
            primary: 9 /* Escape */,
            weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT - 5
          },
          {
            when: ContextKeyExpr.and(
              NOTEBOOK_EDITOR_FOCUSED,
              NOTEBOOK_OUTPUT_FOCUSED
            ),
            primary: 9 /* Escape */,
            weight: 200 /* WorkbenchContrib */ + 5
          },
          {
            when: ContextKeyExpr.and(
              quitEditCondition,
              NOTEBOOK_CELL_TYPE.isEqualTo("markup")
            ),
            primary: 256 /* WinCtrl */ | 3 /* Enter */,
            win: {
              primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 3 /* Enter */
            },
            weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT - 5
          }
        ]
      }
    );
  }
  async runWithContext(accessor, context2) {
    if (context2.cell.cellKind === 1 /* Markup */) {
      context2.cell.updateEditState(0 /* Preview */, QUIT_EDIT_CELL_COMMAND_ID);
    }
    await context2.notebookEditor.focusNotebookCell(context2.cell, "container", { skipReveal: true });
  }
});

registerAction2(class QuitEditAllCellsAction extends NotebookAction {
  constructor() {
    super(
      {
        id: QUIT_EDIT_ALL_CELLS_COMMAND_ID,
        title: localize(17558, null)
      }
    );
  }
  async runWithContext(accessor, context2) {
    if (!context2.notebookEditor.hasModel()) {
      return;
    }
    const viewModel = context2.notebookEditor.getViewModel();
    if (!viewModel) {
      return;
    }
    const activeCell = context2.notebookEditor.getActiveCell();
    const editingCells = viewModel.viewCells.filter(
      (cell) => cell.cellKind === 1 /* Markup */ && cell.getEditState() === 1 /* Editing */
    );
    editingCells.forEach((cell) => {
      cell.updateEditState(0 /* Preview */, QUIT_EDIT_ALL_CELLS_COMMAND_ID);
    });
    if (activeCell) {
      await context2.notebookEditor.focusNotebookCell(activeCell, "container", { skipReveal: true });
    }
  }
});

registerAction2(class DeleteCellAction extends NotebookCellAction {
  constructor() {
    super(
      {
        id: DELETE_CELL_COMMAND_ID,
        title: localize(17555, null),
        keybinding: {
          primary: 20 /* Delete */,
          mac: {
            primary: 2048 /* CtrlCmd */ | 1 /* Backspace */
          },
          when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey), NOTEBOOK_OUTPUT_INPUT_FOCUSED.toNegated()),
          weight: 200 /* WorkbenchContrib */
        },
        menu: [
          {
            id: MenuId.NotebookCellDelete,
            when: NOTEBOOK_EDITOR_EDITABLE,
            group: CELL_TITLE_CELL_GROUP_ID
          },
          {
            id: MenuId.InteractiveCellDelete,
            group: CELL_TITLE_CELL_GROUP_ID
          }
        ],
        icon: deleteCellIcon
      }
    );
  }
  async runWithContext(accessor, context2) {
    if (!context2.notebookEditor.hasModel()) {
      return;
    }
    let confirmation;
    const notebookExecutionStateService = accessor.get(INotebookExecutionStateService);
    const runState = notebookExecutionStateService.getCellExecution(context2.cell.uri)?.state;
    const configService = accessor.get(IConfigurationService);
    if (runState === 3 /* Executing */ && configService.getValue(NotebookSetting.confirmDeleteRunningCell)) {
      const dialogService = accessor.get(IDialogService);
      const primaryButton = localize(17544, null);
      confirmation = await dialogService.confirm({
        type: "question",
        message: localize(17545, null),
        primaryButton,
        checkbox: {
          label: localize(17547, null)
        }
      });
    } else {
      confirmation = { confirmed: true };
    }
    if (!confirmation.confirmed) {
      return;
    }
    if (confirmation.checkboxChecked === true) {
      await configService.updateValue(NotebookSetting.confirmDeleteRunningCell, false);
    }
    runDeleteAction(context2.notebookEditor, context2.cell);
  }
});

registerAction2(class ClearCellOutputsAction extends NotebookCellAction {
  constructor() {
    super({
      id: CLEAR_CELL_OUTPUTS_COMMAND_ID,
      title: localize(17542, null),
      menu: [
        {
          id: MenuId.NotebookCellTitle,
          when: ContextKeyExpr.and(NOTEBOOK_CELL_TYPE.isEqualTo("code"), executeNotebookCondition, NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_CELL_EDITABLE, NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON.toNegated()),
          order: 6 /* ClearCellOutput */,
          group: CELL_TITLE_OUTPUT_GROUP_ID
        },
        {
          id: MenuId.NotebookOutputToolbar,
          when: ContextKeyExpr.and(NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_CELL_EDITABLE, NOTEBOOK_CELL_IS_FIRST_OUTPUT, NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON)
        }
      ],
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey), NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_CELL_EDITABLE),
        primary: 512 /* Alt */ | 20 /* Delete */,
        weight: 200 /* WorkbenchContrib */
      },
      icon: clearIcon
    });
  }
  async runWithContext(accessor, context2) {
    const notebookExecutionStateService = accessor.get(INotebookExecutionStateService);
    const editor = context2.notebookEditor;
    if (!editor.hasModel() || !editor.textModel.length) {
      return;
    }
    const cell = context2.cell;
    const index2 = editor.textModel.cells.indexOf(cell.model);
    if (index2 < 0) {
      return;
    }
    const computeUndoRedo = !editor.isReadOnly;
    editor.textModel.applyEdits([{ editType: 2 /* Output */, index: index2, outputs: [] }], true, void 0, () => void 0, void 0, computeUndoRedo);
    const runState = notebookExecutionStateService.getCellExecution(context2.cell.uri)?.state;
    if (runState !== 3 /* Executing */) {
      context2.notebookEditor.textModel.applyEdits([{
        editType: 9 /* PartialInternalMetadata */,
        index: index2,
        internalMetadata: {
          runStartTime: null,
          runStartTimeAdjustment: null,
          runEndTime: null,
          executionOrder: null,
          lastRunSuccess: null
        }
      }], true, void 0, () => void 0, void 0, computeUndoRedo);
    }
  }
});

registerAction2(class ClearAllCellOutputsAction extends NotebookAction {
  constructor() {
    super({
      id: CLEAR_ALL_CELLS_OUTPUTS_COMMAND_ID,
      title: localize(17541, null),
      precondition: NOTEBOOK_HAS_OUTPUTS,
      menu: [
        {
          id: MenuId.EditorTitle,
          when: ContextKeyExpr.and(
            NOTEBOOK_IS_ACTIVE_EDITOR,
            ContextKeyExpr.notEquals("config.notebook.globalToolbar", true)
          ),
          group: "navigation",
          order: 0
        },
        {
          id: MenuId.NotebookToolbar,
          when: ContextKeyExpr.and(
            executeNotebookCondition,
            ContextKeyExpr.equals("config.notebook.globalToolbar", true)
          ),
          group: "navigation/execute",
          order: 10
        }
      ],
      icon: clearIcon
    });
  }
  async runWithContext(accessor, context2) {
    const notebookExecutionStateService = accessor.get(INotebookExecutionStateService);
    const editor = context2.notebookEditor;
    if (!editor.hasModel() || !editor.textModel.length) {
      return;
    }
    const computeUndoRedo = !editor.isReadOnly;
    editor.textModel.applyEdits(
      editor.textModel.cells.map((cell, index2) => ({
        editType: 2 /* Output */,
        index: index2,
        outputs: []
      })),
      true,
      void 0,
      () => void 0,
      void 0,
      computeUndoRedo
    );
    const clearExecutionMetadataEdits = editor.textModel.cells.map((cell, index2) => {
      const runState = notebookExecutionStateService.getCellExecution(cell.uri)?.state;
      if (runState !== 3 /* Executing */) {
        return {
          editType: 9 /* PartialInternalMetadata */,
          index: index2,
          internalMetadata: {
            runStartTime: null,
            runStartTimeAdjustment: null,
            runEndTime: null,
            executionOrder: null,
            lastRunSuccess: null
          }
        };
      } else {
        return void 0;
      }
    }).filter((edit3) => !!edit3);
    if (clearExecutionMetadataEdits.length) {
      context2.notebookEditor.textModel.applyEdits(clearExecutionMetadataEdits, true, void 0, () => void 0, void 0, computeUndoRedo);
    }
    const controller = editor.getContribution(NotebookInlineVariablesController.id);
    controller.clearNotebookInlineDecorations();
  }
});

registerAction2(class ChangeCellLanguageAction extends NotebookCellAction {
  constructor() {
    super({
      id: CHANGE_CELL_LANGUAGE,
      title: localize(17540, null),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 43 /* KeyM */),
        when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_CELL_EDITABLE)
      },
      metadata: {
        description: localize(17540, null),
        args: [
          {
            name: "range",
            description: "The cell range",
            schema: {
              "type": "object",
              "required": ["start", "end"],
              "properties": {
                "start": {
                  "type": "number"
                },
                "end": {
                  "type": "number"
                }
              }
            }
          },
          {
            name: "language",
            description: "The target cell language",
            schema: {
              "type": "string"
            }
          }
        ]
      }
    });
  }
  getCellContextFromArgs(accessor, context2, ...additionalArgs) {
    if (!context2 || typeof context2.start !== "number" || typeof context2.end !== "number" || context2.start >= context2.end) {
      return;
    }
    const language2 = additionalArgs.length && typeof additionalArgs[0] === "string" ? additionalArgs[0] : void 0;
    const activeEditorContext = this.getEditorContextFromArgsOrActive(accessor);
    if (!activeEditorContext || !activeEditorContext.notebookEditor.hasModel() || context2.start >= activeEditorContext.notebookEditor.getLength()) {
      return;
    }
    return {
      notebookEditor: activeEditorContext.notebookEditor,
      cell: activeEditorContext.notebookEditor.cellAt(context2.start),
      language: language2
    };
  }
  async runWithContext(accessor, context2) {
    if (context2.language) {
      await this.setLanguage(context2, context2.language);
    } else {
      await this.showLanguagePicker(accessor, context2);
    }
  }
  async showLanguagePicker(accessor, context2) {
    const topItems = [];
    const mainItems = [];
    const languageService = accessor.get(ILanguageService);
    const modelService = accessor.get(IModelService);
    const quickInputService = accessor.get(IQuickInputService);
    const languageDetectionService = accessor.get(ILanguageDetectionService);
    const kernelService = accessor.get(INotebookKernelService);
    let languages = context2.notebookEditor.activeKernel?.supportedLanguages;
    if (!languages) {
      const matchResult = kernelService.getMatchingKernel(context2.notebookEditor.textModel);
      const allSupportedLanguages = matchResult.all.flatMap((kernel) => kernel.supportedLanguages);
      languages = allSupportedLanguages.length > 0 ? allSupportedLanguages : languageService.getRegisteredLanguageIds();
    }
    const providerLanguages = /* @__PURE__ */ new Set([
      ...languages,
      "markdown"
    ]);
    providerLanguages.forEach((languageId2) => {
      let description;
      if (context2.cell.cellKind === 1 /* Markup */ ? languageId2 === "markdown" : languageId2 === context2.cell.language) {
        description = localize(17550, null, languageId2);
      } else {
        description = localize(17551, null, languageId2);
      }
      const languageName = languageService.getLanguageName(languageId2);
      if (!languageName) {
        return;
      }
      const item = {
        label: languageName,
        iconClasses: getIconClasses(modelService, languageService, this.getFakeResource(languageName, languageService)),
        description,
        languageId: languageId2
      };
      if (languageId2 === "markdown" || languageId2 === context2.cell.language) {
        topItems.push(item);
      } else {
        mainItems.push(item);
      }
    });
    mainItems.sort((a, b) => {
      return a.description.localeCompare(b.description);
    });
    const autoDetectMode = {
      label: localize(17539, null)
    };
    const picks = [
      autoDetectMode,
      { type: "separator", label: localize(17552, null) },
      ...topItems,
      { type: "separator" },
      ...mainItems
    ];
    const selection = await quickInputService.pick(picks, { placeHolder: localize(17561, null) });
    const languageId = selection === autoDetectMode ? await languageDetectionService.detectLanguage(context2.cell.uri) : selection?.languageId;
    if (languageId) {
      await this.setLanguage(context2, languageId);
    }
  }
  async setLanguage(context2, languageId) {
    await setCellToLanguage(languageId, context2);
  }
  /**
   * Copied from editorStatus.ts
   */
  getFakeResource(lang, languageService) {
    let fakeResource;
    const languageId = languageService.getLanguageIdByLanguageName(lang);
    if (languageId) {
      const extensions = languageService.getExtensions(languageId);
      if (extensions.length) {
        fakeResource = URI.file(extensions[0]);
      } else {
        const filenames = languageService.getFilenames(languageId);
        if (filenames.length) {
          fakeResource = URI.file(filenames[0]);
        }
      }
    }
    return fakeResource;
  }
});

registerAction2(class DetectCellLanguageAction extends NotebookCellAction {
  constructor() {
    super({
      id: DETECT_CELL_LANGUAGE,
      title: localize2(17546, "Accept Detected Language for Cell"),
      f1: true,
      precondition: ContextKeyExpr.and(NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_CELL_EDITABLE),
      keybinding: { primary: 34 /* KeyD */ | 512 /* Alt */ | 1024 /* Shift */, weight: 200 /* WorkbenchContrib */ }
    });
  }
  async runWithContext(accessor, context2) {
    const languageDetectionService = accessor.get(ILanguageDetectionService);
    const notificationService = accessor.get(INotificationService);
    const kernelService = accessor.get(INotebookKernelService);
    const kernel = kernelService.getSelectedOrSuggestedKernel(context2.notebookEditor.textModel);
    const providerLanguages = [...kernel?.supportedLanguages ?? []];
    providerLanguages.push("markdown");
    const detection = await languageDetectionService.detectLanguage(context2.cell.uri, providerLanguages);
    if (detection) {
      setCellToLanguage(detection, context2);
    } else {
      notificationService.warn(localize(17553, null));
    }
  }
});

async function setCellToLanguage(languageId, context2) {
  if (languageId === "markdown" && context2.cell?.language !== "markdown") {
    const idx = context2.notebookEditor.getCellIndex(context2.cell);
    await changeCellToKind(1 /* Markup */, { cell: context2.cell, notebookEditor: context2.notebookEditor, ui: true }, "markdown", Mimes.markdown);
    const newCell = context2.notebookEditor.cellAt(idx);
    if (newCell) {
      await context2.notebookEditor.focusNotebookCell(newCell, "editor");
    }
  } else if (languageId !== "markdown" && context2.cell?.cellKind === 1 /* Markup */) {
    await changeCellToKind(2 /* Code */, { cell: context2.cell, notebookEditor: context2.notebookEditor, ui: true }, languageId);
  } else {
    const index2 = context2.notebookEditor.textModel.cells.indexOf(context2.cell.model);
    context2.notebookEditor.textModel.applyEdits(
      [{ editType: 4 /* CellLanguage */, index: index2, language: languageId }],
      true,
      void 0,
      () => void 0,
      void 0,
      !context2.notebookEditor.isReadOnly
    );
  }
}

registerAction2(class SelectNotebookIndentation extends NotebookAction {
  constructor() {
    super({
      id: SELECT_NOTEBOOK_INDENTATION_ID,
      title: localize2(17562, "Select Indentation"),
      f1: true,
      precondition: ContextKeyExpr.and(NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_CELL_EDITABLE)
    });
  }
  async runWithContext(accessor, context2) {
    await this.showNotebookIndentationPicker(accessor, context2);
  }
  async showNotebookIndentationPicker(accessor, context2) {
    const quickInputService = accessor.get(IQuickInputService);
    const editorService = accessor.get(IEditorService);
    const instantiationService = accessor.get(IInstantiationService);
    const activeNotebook = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!activeNotebook || activeNotebook.isDisposed) {
      return quickInputService.pick([{ label: localize(17554, null) }]);
    }
    if (activeNotebook.isReadOnly) {
      return quickInputService.pick([{ label: localize(17559, null) }]);
    }
    const picks = [
      new NotebookIndentUsingTabs(),
      // indent using tabs
      new NotebookIndentUsingSpaces(),
      // indent using spaces
      new NotebookChangeTabDisplaySize(),
      // change tab size
      new NotebookIndentationToTabsAction(),
      // convert indentation to tabs
      new NotebookIndentationToSpacesAction()
      // convert indentation to spaces
    ].map((item) => {
      return {
        id: item.desc.id,
        label: item.desc.title.toString(),
        run: () => {
          instantiationService.invokeFunction(item.run);
        }
      };
    });
    picks.splice(3, 0, { type: "separator", label: localize(17548, null) });
    picks.unshift({ type: "separator", label: localize(17549, null) });
    const action = await quickInputService.pick(picks, { placeHolder: localize(17560, null), matchOnDetail: true });
    if (!action) {
      return;
    }
    action.run();
    context2.notebookEditor.focus();
    return;
  }
});

registerAction2(class CommentSelectedCellsAction extends NotebookMultiCellAction {
  constructor() {
    super({
      id: COMMENT_SELECTED_CELLS_ID,
      title: localize(17543, null),
      keybinding: {
        when: ContextKeyExpr.and(
          NOTEBOOK_EDITOR_FOCUSED,
          NOTEBOOK_EDITOR_EDITABLE,
          ContextKeyExpr.not(InputFocusedContextKey)
        ),
        primary: 2048 /* CtrlCmd */ | 90 /* Slash */,
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  async runWithContext(accessor, context2) {
    const languageConfigurationService = accessor.get(ILanguageConfigurationService);
    context2.selectedCells.forEach(async (cellViewModel) => {
      const textModel = await cellViewModel.resolveTextModel();
      const commentsOptions = cellViewModel.commentOptions;
      const cellCommentCommand = new LineCommentCommand(
        languageConfigurationService,
        new Selection(1, 1, textModel.getLineCount(), textModel.getLineMaxColumn(textModel.getLineCount())),
        // comment the entire cell
        textModel.getOptions().tabSize,
        0 /* Toggle */,
        commentsOptions.insertSpace ?? true,
        commentsOptions.ignoreEmptyLines ?? true,
        false
      );
      const cellEditorSelections = cellViewModel.getSelections();
      const initialTrackedRangesIDs = cellEditorSelections.map((selection) => {
        return textModel._setTrackedRange(null, selection, 1 /* NeverGrowsWhenTypingAtEdges */);
      });
      CommandExecutor.executeCommands(textModel, cellEditorSelections, [cellCommentCommand]);
      const newTrackedSelections = initialTrackedRangesIDs.map((i2) => {
        return textModel._getTrackedRange(i2);
      }).filter((r2) => !!r2).map((range2) => {
        return new Selection(range2.startLineNumber, range2.startColumn, range2.endLineNumber, range2.endColumn);
      });
      cellViewModel.setSelections(newTrackedSelections ?? []);
    });
  }
});
export { setCellToLanguage, CLEAR_ALL_CELLS_OUTPUTS_COMMAND_ID, EDIT_CELL_COMMAND_ID, DELETE_CELL_COMMAND_ID, QUIT_EDIT_ALL_CELLS_COMMAND_ID, CLEAR_CELL_OUTPUTS_COMMAND_ID, SELECT_NOTEBOOK_INDENTATION_ID, COMMENT_SELECTED_CELLS_ID, quitEditCondition };
