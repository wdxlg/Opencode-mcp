// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/multicursor/notebookMulticursor.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { ViewModelEventsCollector } from "./module-0428.mjs";
import { Selection } from "./module-0107.mjs";
import { CommandExecutor, CursorsController } from "./module-0429.mjs";
import { CursorConfiguration } from "./module-0113.mjs";
import { indentOfLine } from "./module-0423.mjs";
import { USUAL_WORD_SEPARATORS } from "./module-0103.mjs";
import { Position } from "./module-0079.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { NotebookCellTextModel } from "./module-1883.mjs";
import { cursorBlinkingStyleFromString, cursorStyleFromString } from "./module-0105.mjs";
import { DeleteOperations } from "./module-0119.mjs";
import { CellEditorOptions } from "./module-1918.mjs";
import { EditorConfiguration } from "./module-0221.mjs";
import { MenuId, registerAction2 } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { NotebookAction } from "./module-1869.mjs";
import { localize } from "./module-0001.mjs";
import { KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED, NOTEBOOK_CELL_EDITOR_FOCUSED, NOTEBOOK_IS_ACTIVE_EDITOR } from "./module-1868.mjs";
import { IEditorService } from "./module-0934.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0941.mjs";
import { NotebookFindContrib } from "./module-2427.mjs";
import { CoreEditingCommands } from "./module-0157.mjs";
import { RedoCommand, UndoCommand } from "./module-0097.mjs";
import { registerNotebookContribution } from "./module-1893.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/multicursor/notebookMulticursor.ts
var NOTEBOOK_ADD_FIND_MATCH_TO_SELECTION_ID = "notebook.addFindMatchToSelection";

var NOTEBOOK_SELECT_ALL_FIND_MATCHES_ID = "notebook.selectAllFindMatches";

var NOTEBOOK_MULTI_CURSOR_CONTEXT = {
  IsNotebookMultiCursor: new RawContextKey("isNotebookMultiSelect", false),
  NotebookMultiSelectCursorState: new RawContextKey("notebookMultiSelectCursorState", 0 /* Idle */)
};

var NotebookMultiCursorController = class extends Disposable {
  constructor(notebookEditor, contextKeyService, textModelService, languageConfigurationService, accessibilityService, configurationService, undoRedoService) {
    super();
    this.notebookEditor = notebookEditor;
    this.contextKeyService = contextKeyService;
    this.textModelService = textModelService;
    this.languageConfigurationService = languageConfigurationService;
    this.accessibilityService = accessibilityService;
    this.configurationService = configurationService;
    this.undoRedoService = undoRedoService;
    this.word = "";
    this.trackedCells = [];
    this.totalMatchesCount = 0;
    this._onDidChangeAnchorCell = this._register(new Emitter());
    this.onDidChangeAnchorCell = this._onDidChangeAnchorCell.event;
    this.anchorDisposables = this._register(new DisposableStore());
    this.cursorsDisposables = this._register(new DisposableStore());
    this.cursorsControllers = new ResourceMap();
    this.state = 0 /* Idle */;
    this._nbIsMultiSelectSession = NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor.bindTo(this.contextKeyService);
    this._nbMultiSelectState = NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.bindTo(this.contextKeyService);
    this.anchorCell = this.notebookEditor.activeCellAndCodeEditor;
    this._register(this.onDidChangeAnchorCell(async () => {
      await this.syncCursorsControllers();
      this.syncAnchorListeners();
    }));
  }
  static {
    this.id = "notebook.multiCursorController";
  }
  getState() {
    return this.state;
  }
  syncAnchorListeners() {
    this.anchorDisposables.clear();
    if (!this.anchorCell) {
      throw new Error("Anchor cell is undefined");
    }
    this.anchorDisposables.add(this.anchorCell[1].onWillType((input) => {
      const collector = new ViewModelEventsCollector();
      this.trackedCells.forEach((cell) => {
        const controller = this.cursorsControllers.get(cell.cellViewModel.uri);
        if (!controller) {
          return;
        }
        if (cell.cellViewModel.handle !== this.anchorCell?.[0].handle) {
          controller.type(collector, input, "keyboard");
        }
      });
    }));
    this.anchorDisposables.add(this.anchorCell[1].onDidType(() => {
      this.state = 2 /* Editing */;
      this._nbMultiSelectState.set(2 /* Editing */);
      const anchorController = this.cursorsControllers.get(this.anchorCell[0].uri);
      if (!anchorController) {
        return;
      }
      const activeSelections = this.notebookEditor.activeCodeEditor?.getSelections();
      if (!activeSelections) {
        return;
      }
      anchorController.setSelections(new ViewModelEventsCollector(), "keyboard", activeSelections, 3 /* Explicit */);
      this.trackedCells.forEach((cell) => {
        const controller = this.cursorsControllers.get(cell.cellViewModel.uri);
        if (!controller) {
          return;
        }
        cell.initialSelection = controller.getSelection();
        cell.matchSelections = [];
      });
      this.updateLazyDecorations();
    }));
    this.anchorDisposables.add(this.anchorCell[1].onDidChangeCursorSelection((e) => {
      if (e.source === "mouse") {
        this.resetToIdleState();
        return;
      }
      if (!e.oldSelections || e.reason === 0 /* NotSet */ || e.reason === 2 /* RecoverFromMarkers */) {
        return;
      }
      const translation = {
        deltaStartCol: e.selection.startColumn - e.oldSelections[0].startColumn,
        deltaStartLine: e.selection.startLineNumber - e.oldSelections[0].startLineNumber,
        deltaEndCol: e.selection.endColumn - e.oldSelections[0].endColumn,
        deltaEndLine: e.selection.endLineNumber - e.oldSelections[0].endLineNumber
      };
      const translationDir = e.selection.getDirection();
      this.trackedCells.forEach((cell) => {
        const controller = this.cursorsControllers.get(cell.cellViewModel.uri);
        if (!controller) {
          return;
        }
        const newSelections = controller.getSelections().map((selection) => {
          const newStartCol = selection.startColumn + translation.deltaStartCol;
          const newStartLine = selection.startLineNumber + translation.deltaStartLine;
          const newEndCol = selection.endColumn + translation.deltaEndCol;
          const newEndLine = selection.endLineNumber + translation.deltaEndLine;
          return Selection.createWithDirection(newStartLine, newStartCol, newEndLine, newEndCol, translationDir);
        });
        controller.setSelections(new ViewModelEventsCollector(), e.source, newSelections, 3 /* Explicit */);
      });
      this.updateLazyDecorations();
    }));
    this.anchorDisposables.add(this.anchorCell[1].onWillTriggerEditorOperationEvent((e) => {
      this.handleEditorOperationEvent(e);
    }));
    this.anchorDisposables.add(this.anchorCell[1].onDidBlurEditorWidget(() => {
      if (this.state === 1 /* Selecting */ || this.state === 2 /* Editing */) {
        this.resetToIdleState();
      }
    }));
  }
  async syncCursorsControllers() {
    this.cursorsDisposables.clear();
    await Promise.all(this.trackedCells.map(async (cell) => {
      const controller = await this.createCursorController(cell);
      if (!controller) {
        return;
      }
      this.cursorsControllers.set(cell.cellViewModel.uri, controller);
      const selections = cell.matchSelections;
      controller.setSelections(new ViewModelEventsCollector(), void 0, selections, 3 /* Explicit */);
    }));
    this.updateLazyDecorations();
  }
  async createCursorController(cell) {
    const textModelRef = await this.textModelService.createModelReference(cell.cellViewModel.uri);
    const textModel = textModelRef.object.textEditorModel;
    if (!textModel) {
      textModelRef.dispose();
      return void 0;
    }
    this.cursorsDisposables.add(textModelRef);
    const cursorSimpleModel = this.constructCursorSimpleModel(cell.cellViewModel);
    const converter = this.constructCoordinatesConverter();
    const editorConfig = cell.editorConfig;
    const controller = this.cursorsDisposables.add(new CursorsController(
      textModel,
      cursorSimpleModel,
      converter,
      new CursorConfiguration(textModel.getLanguageId(), textModel.getOptions(), editorConfig, this.languageConfigurationService)
    ));
    controller.setSelections(new ViewModelEventsCollector(), void 0, cell.matchSelections, 3 /* Explicit */);
    return controller;
  }
  constructCoordinatesConverter() {
    return {
      convertViewPositionToModelPosition(viewPosition) {
        return viewPosition;
      },
      convertViewRangeToModelRange(viewRange) {
        return viewRange;
      },
      validateViewPosition(viewPosition, expectedModelPosition) {
        return viewPosition;
      },
      validateViewRange(viewRange, expectedModelRange) {
        return viewRange;
      },
      convertModelPositionToViewPosition(modelPosition, affinity, allowZeroLineNumber, belowHiddenRanges) {
        return modelPosition;
      },
      convertModelRangeToViewRange(modelRange, affinity) {
        return modelRange;
      },
      modelPositionIsVisible(modelPosition) {
        return true;
      },
      getModelLineViewLineCount(modelLineNumber) {
        return 1;
      },
      getViewLineNumberOfModelPosition(modelLineNumber, modelColumn) {
        return modelLineNumber;
      }
    };
  }
  constructCursorSimpleModel(cell) {
    return {
      getLineCount() {
        return cell.textBuffer.getLineCount();
      },
      getLineContent(lineNumber) {
        return cell.textBuffer.getLineContent(lineNumber);
      },
      getLineMinColumn(lineNumber) {
        return cell.textBuffer.getLineMinColumn(lineNumber);
      },
      getLineMaxColumn(lineNumber) {
        return cell.textBuffer.getLineMaxColumn(lineNumber);
      },
      getLineFirstNonWhitespaceColumn(lineNumber) {
        return cell.textBuffer.getLineFirstNonWhitespaceColumn(lineNumber);
      },
      getLineLastNonWhitespaceColumn(lineNumber) {
        return cell.textBuffer.getLineLastNonWhitespaceColumn(lineNumber);
      },
      normalizePosition(position2, affinity) {
        return position2;
      },
      getLineIndentColumn(lineNumber) {
        return indentOfLine(cell.textBuffer.getLineContent(lineNumber)) + 1;
      }
    };
  }
  handleEditorOperationEvent(e) {
    this.trackedCells.forEach((cell) => {
      if (cell.cellViewModel.handle === this.anchorCell?.[0].handle) {
        return;
      }
      const eventsCollector = new ViewModelEventsCollector();
      const controller = this.cursorsControllers.get(cell.cellViewModel.uri);
      if (!controller) {
        return;
      }
      this.executeEditorOperation(controller, eventsCollector, e);
    });
  }
  executeEditorOperation(controller, eventsCollector, e) {
    switch (e.handlerId) {
      case "compositionStart" /* CompositionStart */:
        controller.startComposition(eventsCollector);
        break;
      case "compositionEnd" /* CompositionEnd */:
        controller.endComposition(eventsCollector, e.source);
        break;
      case "replacePreviousChar" /* ReplacePreviousChar */: {
        const args2 = e.payload;
        controller.compositionType(eventsCollector, args2.text || "", args2.replaceCharCnt || 0, 0, 0, e.source);
        break;
      }
      case "compositionType" /* CompositionType */: {
        const args2 = e.payload;
        controller.compositionType(eventsCollector, args2.text || "", args2.replacePrevCharCnt || 0, args2.replaceNextCharCnt || 0, args2.positionDelta || 0, e.source);
        break;
      }
      case "paste" /* Paste */: {
        const args2 = e.payload;
        controller.paste(eventsCollector, args2.text || "", args2.pasteOnNewLine || false, args2.multicursorText || null, e.source);
        break;
      }
      case "cut" /* Cut */:
        controller.cut(eventsCollector, e.source);
        break;
    }
  }
  updateViewModelSelections() {
    for (const cell of this.trackedCells) {
      const controller = this.cursorsControllers.get(cell.cellViewModel.uri);
      if (!controller) {
        return;
      }
      cell.cellViewModel.setSelections(controller.getSelections());
    }
  }
  updateFinalUndoRedo() {
    const anchorCellModel = this.anchorCell?.[1].getModel();
    if (!anchorCellModel) {
      return;
    }
    const newElementsMap = new ResourceMap();
    const resources = [];
    this.trackedCells.forEach((trackedMatch) => {
      const undoRedoState = trackedMatch.undoRedoHistory;
      if (!undoRedoState) {
        return;
      }
      resources.push(trackedMatch.cellViewModel.uri);
      const currentPastElements = this.undoRedoService.getElements(trackedMatch.cellViewModel.uri).past.slice();
      const oldPastElements = trackedMatch.undoRedoHistory.past.slice();
      const newElements = currentPastElements.slice(oldPastElements.length);
      if (newElements.length === 0) {
        return;
      }
      newElementsMap.set(trackedMatch.cellViewModel.uri, newElements);
      this.undoRedoService.removeElements(trackedMatch.cellViewModel.uri);
      oldPastElements.forEach((element) => {
        this.undoRedoService.pushElement(element);
      });
    });
    this.undoRedoService.pushElement({
      type: 1 /* Workspace */,
      resources,
      label: "Multi Cursor Edit",
      code: "multiCursorEdit",
      confirmBeforeUndo: false,
      undo: async () => {
        newElementsMap.forEach(async (value2) => {
          value2.reverse().forEach(async (element) => {
            await element.undo();
          });
        });
      },
      redo: async () => {
        newElementsMap.forEach(async (value2) => {
          value2.forEach(async (element) => {
            await element.redo();
          });
        });
      }
    });
  }
  resetToIdleState() {
    this.state = 0 /* Idle */;
    this._nbMultiSelectState.set(0 /* Idle */);
    this._nbIsMultiSelectSession.set(false);
    this.updateFinalUndoRedo();
    this.trackedCells.forEach((cell) => {
      this.clearDecorations(cell);
      cell.cellViewModel.setSelections([cell.initialSelection]);
    });
    this.anchorDisposables.clear();
    this.anchorCell = void 0;
    this.cursorsDisposables.clear();
    this.cursorsControllers.clear();
    this.trackedCells = [];
    this.totalMatchesCount = 0;
    this.startPosition = void 0;
    this.word = "";
  }
  async findAndTrackNextSelection(focusedCell) {
    if (this.state === 0 /* Idle */) {
      const textModel = focusedCell.textModel;
      if (!textModel) {
        return;
      }
      const inputSelection = focusedCell.getSelections()[0];
      const word = this.getWord(inputSelection, textModel);
      if (!word) {
        return;
      }
      this.word = word.word;
      const notebookTextModel = this.notebookEditor.textModel;
      if (notebookTextModel) {
        const allMatches = notebookTextModel.findMatches(this.word, false, true, USUAL_WORD_SEPARATORS);
        this.totalMatchesCount = allMatches.reduce((sum2, cellMatch) => sum2 + cellMatch.matches.length, 0);
      }
      const index2 = this.notebookEditor.getCellIndex(focusedCell);
      if (index2 === void 0) {
        return;
      }
      this.startPosition = {
        cellIndex: index2,
        position: new Position(inputSelection.startLineNumber, word.startColumn)
      };
      const newSelection = new Selection(
        inputSelection.startLineNumber,
        word.startColumn,
        inputSelection.startLineNumber,
        word.endColumn
      );
      focusedCell.setSelections([newSelection]);
      this.anchorCell = this.notebookEditor.activeCellAndCodeEditor;
      if (!this.anchorCell || this.anchorCell[0].handle !== focusedCell.handle) {
        throw new Error("Active cell is not the same as the cell passed as context");
      }
      if (!(this.anchorCell[1] instanceof CodeEditorWidget)) {
        throw new Error("Active cell is not an instance of CodeEditorWidget");
      }
      await this.updateTrackedCell(focusedCell, [newSelection]);
      this._nbIsMultiSelectSession.set(true);
      this.state = 1 /* Selecting */;
      this._nbMultiSelectState.set(1 /* Selecting */);
      this._onDidChangeAnchorCell.fire();
    } else if (this.state === 1 /* Selecting */) {
      const notebookTextModel = this.notebookEditor.textModel;
      if (!notebookTextModel) {
        return;
      }
      const index2 = this.notebookEditor.getCellIndex(focusedCell);
      if (index2 === void 0) {
        return;
      }
      if (!this.startPosition) {
        return;
      }
      const totalSelections = this.trackedCells.reduce((sum2, trackedCell) => sum2 + trackedCell.matchSelections.length, 0);
      if (totalSelections >= this.totalMatchesCount) {
        return;
      }
      const findResult = notebookTextModel.findNextMatch(
        this.word,
        { cellIndex: index2, position: focusedCell.getSelections()[focusedCell.getSelections().length - 1].getEndPosition() },
        false,
        true,
        USUAL_WORD_SEPARATORS,
        this.startPosition
      );
      if (!findResult) {
        return;
      }
      const findResultCellViewModel = this.notebookEditor.getCellByHandle(findResult.cell.handle);
      if (!findResultCellViewModel) {
        return;
      }
      if (findResult.cell.handle === focusedCell.handle) {
        const selections = [...focusedCell.getSelections(), Selection.fromRange(findResult.match.range, 0 /* LTR */)];
        const trackedCell = await this.updateTrackedCell(focusedCell, selections);
        findResultCellViewModel.setSelections(trackedCell.matchSelections);
      } else if (findResult.cell.handle !== focusedCell.handle) {
        await this.notebookEditor.revealRangeInViewAsync(findResultCellViewModel, findResult.match.range);
        await this.notebookEditor.focusNotebookCell(findResultCellViewModel, "editor");
        const trackedCell = await this.updateTrackedCell(findResultCellViewModel, [Selection.fromRange(findResult.match.range, 0 /* LTR */)]);
        findResultCellViewModel.setSelections(trackedCell.matchSelections);
        this.anchorCell = this.notebookEditor.activeCellAndCodeEditor;
        if (!this.anchorCell || !(this.anchorCell[1] instanceof CodeEditorWidget)) {
          throw new Error("Active cell is not an instance of CodeEditorWidget");
        }
        this._onDidChangeAnchorCell.fire();
        this.initializeMultiSelectDecorations(this.trackedCells.find((trackedCell2) => trackedCell2.cellViewModel.handle === focusedCell.handle));
      }
    }
  }
  async selectAllMatches(focusedCell, matches2) {
    const notebookTextModel = this.notebookEditor.textModel;
    if (!notebookTextModel) {
      return;
    }
    if (matches2) {
      await this.handleFindWidgetSelectAllMatches(matches2);
    } else {
      await this.handleCellEditorSelectAllMatches(notebookTextModel, focusedCell);
    }
    await this.syncCursorsControllers();
    this.syncAnchorListeners();
    this.updateLazyDecorations();
  }
  async handleFindWidgetSelectAllMatches(matches2) {
    if (this.state !== 0 /* Idle */) {
      return;
    }
    if (!matches2.length) {
      return;
    }
    await this.notebookEditor.focusNotebookCell(matches2[0].cell, "editor");
    this.anchorCell = this.notebookEditor.activeCellAndCodeEditor;
    this.trackedCells = [];
    for (const match2 of matches2) {
      this.updateTrackedCell(match2.cell, match2.contentMatches.map((match3) => Selection.fromRange(match3.range, 0 /* LTR */)));
      if (this.anchorCell && match2.cell.handle === this.anchorCell[0].handle) {
        match2.cell.setSelections(match2.contentMatches.map((match3) => Selection.fromRange(match3.range, 0 /* LTR */)));
      }
    }
    this._nbIsMultiSelectSession.set(true);
    this.state = 1 /* Selecting */;
    this._nbMultiSelectState.set(1 /* Selecting */);
  }
  async handleCellEditorSelectAllMatches(notebookTextModel, focusedCell) {
    if (this.state === 0 /* Idle */) {
      const textModel = focusedCell.textModel;
      if (!textModel) {
        return;
      }
      const inputSelection = focusedCell.getSelections()[0];
      const word = this.getWord(inputSelection, textModel);
      if (!word) {
        return;
      }
      this.word = word.word;
      const index2 = this.notebookEditor.getCellIndex(focusedCell);
      if (index2 === void 0) {
        return;
      }
      this.startPosition = {
        cellIndex: index2,
        position: new Position(inputSelection.startLineNumber, word.startColumn)
      };
      this.anchorCell = this.notebookEditor.activeCellAndCodeEditor;
      if (!this.anchorCell || this.anchorCell[0].handle !== focusedCell.handle) {
        throw new Error("Active cell is not the same as the cell passed as context");
      }
      if (!(this.anchorCell[1] instanceof CodeEditorWidget)) {
        throw new Error("Active cell is not an instance of CodeEditorWidget");
      }
      const findResults = notebookTextModel.findMatches(this.word, false, true, USUAL_WORD_SEPARATORS);
      this.trackedCells = [];
      for (const res of findResults) {
        await this.updateTrackedCell(res.cell, res.matches.map((match2) => Selection.fromRange(match2.range, 0 /* LTR */)));
        if (res.cell.handle === focusedCell.handle) {
          const cellViewModel = this.notebookEditor.getCellByHandle(res.cell.handle);
          if (cellViewModel) {
            cellViewModel.setSelections(res.matches.map((match2) => Selection.fromRange(match2.range, 0 /* LTR */)));
          }
        }
      }
      this._nbIsMultiSelectSession.set(true);
      this.state = 1 /* Selecting */;
      this._nbMultiSelectState.set(1 /* Selecting */);
    } else if (this.state === 1 /* Selecting */) {
      const findResults = notebookTextModel.findMatches(this.word, false, true, USUAL_WORD_SEPARATORS);
      for (const res of findResults) {
        await this.updateTrackedCell(res.cell, res.matches.map((match2) => Selection.fromRange(match2.range, 0 /* LTR */)));
      }
    }
  }
  async updateTrackedCell(cell, selections) {
    const cellViewModel = cell instanceof NotebookCellTextModel ? this.notebookEditor.getCellByHandle(cell.handle) : cell;
    if (!cellViewModel) {
      throw new Error("Cell not found");
    }
    let trackedMatch = this.trackedCells.find((trackedCell) => trackedCell.cellViewModel.handle === cellViewModel.handle);
    if (trackedMatch) {
      this.clearDecorations(trackedMatch);
      trackedMatch.matchSelections = selections;
    } else {
      const initialSelection = cellViewModel.getSelections()[0];
      const textModel = await cellViewModel.resolveTextModel();
      textModel.pushStackElement();
      const editorConfig = this.constructCellEditorOptions(cellViewModel);
      const rawEditorOptions = editorConfig.getRawOptions();
      const cursorConfig = {
        cursorStyle: cursorStyleFromString(rawEditorOptions.cursorStyle),
        cursorBlinking: cursorBlinkingStyleFromString(rawEditorOptions.cursorBlinking),
        cursorSmoothCaretAnimation: rawEditorOptions.cursorSmoothCaretAnimation
      };
      trackedMatch = {
        cellViewModel,
        initialSelection,
        matchSelections: selections,
        editorConfig,
        cursorConfig,
        decorationIds: [],
        undoRedoHistory: this.undoRedoService.getElements(cellViewModel.uri)
      };
      this.trackedCells.push(trackedMatch);
    }
    return trackedMatch;
  }
  async deleteLeft() {
    this.trackedCells.forEach((cell) => {
      const controller = this.cursorsControllers.get(cell.cellViewModel.uri);
      if (!controller) {
        return;
      }
      const [, commands] = DeleteOperations.deleteLeft(
        controller.getPrevEditOperationType(),
        controller.context.cursorConfig,
        controller.context.model,
        controller.getSelections(),
        controller.getAutoClosedCharacters()
      );
      const delSelections = CommandExecutor.executeCommands(controller.context.model, controller.getSelections(), commands);
      if (!delSelections) {
        return;
      }
      controller.setSelections(new ViewModelEventsCollector(), void 0, delSelections, 3 /* Explicit */);
    });
    this.updateLazyDecorations();
  }
  async deleteRight() {
    this.trackedCells.forEach((cell) => {
      const controller = this.cursorsControllers.get(cell.cellViewModel.uri);
      if (!controller) {
        return;
      }
      const [, commands] = DeleteOperations.deleteRight(
        controller.getPrevEditOperationType(),
        controller.context.cursorConfig,
        controller.context.model,
        controller.getSelections()
      );
      if (cell.cellViewModel.handle !== this.anchorCell?.[0].handle) {
        const delSelections = CommandExecutor.executeCommands(controller.context.model, controller.getSelections(), commands);
        if (!delSelections) {
          return;
        }
        controller.setSelections(new ViewModelEventsCollector(), void 0, delSelections, 3 /* Explicit */);
      } else {
        controller.setSelections(new ViewModelEventsCollector(), void 0, cell.cellViewModel.getSelections(), 3 /* Explicit */);
      }
    });
    this.updateLazyDecorations();
  }
  async undo() {
    const models = [];
    for (const cell of this.trackedCells) {
      const model = await cell.cellViewModel.resolveTextModel();
      if (model) {
        models.push(model);
      }
    }
    await Promise.all(models.map((model) => model.undo()));
    this.updateViewModelSelections();
    this.updateLazyDecorations();
  }
  async redo() {
    const models = [];
    for (const cell of this.trackedCells) {
      const model = await cell.cellViewModel.resolveTextModel();
      if (model) {
        models.push(model);
      }
    }
    await Promise.all(models.map((model) => model.redo()));
    this.updateViewModelSelections();
    this.updateLazyDecorations();
  }
  constructCellEditorOptions(cell) {
    const cellEditorOptions = new CellEditorOptions(this.notebookEditor.getBaseCellEditorOptions(cell.language), this.notebookEditor.notebookOptions, this.configurationService);
    const options3 = cellEditorOptions.getUpdatedValue(cell.internalMetadata, cell.uri);
    cellEditorOptions.dispose();
    return new EditorConfiguration(false, MenuId.EditorContent, options3, null, this.accessibilityService);
  }
  /**
   * Updates the multicursor selection decorations for a specific matched cell
   *
   * @param cell -- match object containing the viewmodel + selections
   */
  initializeMultiSelectDecorations(cell) {
    if (!cell) {
      return;
    }
    const decorations = [];
    cell.matchSelections.forEach((selection) => {
      decorations.push({
        range: Selection.fromPositions(selection.getEndPosition()),
        options: {
          description: "",
          className: this.getClassName(cell.cursorConfig, true)
        }
      });
    });
    cell.decorationIds = cell.cellViewModel.deltaModelDecorations(
      cell.decorationIds,
      decorations
    );
  }
  updateLazyDecorations() {
    this.trackedCells.forEach((cell) => {
      if (cell.cellViewModel.handle === this.anchorCell?.[0].handle) {
        return;
      }
      const controller = this.cursorsControllers.get(cell.cellViewModel.uri);
      if (!controller) {
        return;
      }
      const selections = controller.getSelections();
      const newDecorations = [];
      selections?.map((selection) => {
        const isEmpty = selection.isEmpty();
        if (!isEmpty) {
          newDecorations.push({
            range: selection,
            options: {
              description: "",
              className: this.getClassName(cell.cursorConfig, false)
            }
          });
        }
        newDecorations.push({
          range: Selection.fromPositions(selection.getPosition()),
          options: {
            description: "",
            zIndex: 1e4,
            className: this.getClassName(cell.cursorConfig, true)
          }
        });
      });
      cell.decorationIds = cell.cellViewModel.deltaModelDecorations(
        cell.decorationIds,
        newDecorations
      );
    });
  }
  clearDecorations(cell) {
    cell.decorationIds = cell.cellViewModel.deltaModelDecorations(
      cell.decorationIds,
      []
    );
  }
  getWord(selection, model) {
    const lineNumber = selection.startLineNumber;
    const startColumn = selection.startColumn;
    if (model.isDisposed()) {
      return null;
    }
    return model.getWordAtPosition({
      lineNumber,
      column: startColumn
    });
  }
  getClassName(cursorConfig, isCursor) {
    let result = isCursor ? ".nb-multicursor-cursor" : ".nb-multicursor-selection";
    if (isCursor) {
      switch (cursorConfig.cursorStyle) {
        case 1 /* Line */:
          break;
        // default style, no additional class needed (handled by base css style)
        case 2 /* Block */:
          result += ".nb-cursor-block-style";
          break;
        case 3 /* Underline */:
          result += ".nb-cursor-underline-style";
          break;
        case 4 /* LineThin */:
          result += ".nb-cursor-line-thin-style";
          break;
        case 5 /* BlockOutline */:
          result += ".nb-cursor-block-outline-style";
          break;
        case 6 /* UnderlineThin */:
          result += ".nb-cursor-underline-thin-style";
          break;
        default:
          break;
      }
      switch (cursorConfig.cursorBlinking) {
        case 1 /* Blink */:
          result += ".nb-blink";
          break;
        case 2 /* Smooth */:
          result += ".nb-smooth";
          break;
        case 3 /* Phase */:
          result += ".nb-phase";
          break;
        case 4 /* Expand */:
          result += ".nb-expand";
          break;
        case 5 /* Solid */:
          result += ".nb-solid";
          break;
        default:
          result += ".nb-solid";
          break;
      }
      if (cursorConfig.cursorSmoothCaretAnimation === "on" || cursorConfig.cursorSmoothCaretAnimation === "explicit") {
        result += ".nb-smooth-caret-animation";
      }
    }
    return result;
  }
  dispose() {
    super.dispose();
    this.anchorDisposables.dispose();
    this.cursorsDisposables.dispose();
    this.trackedCells.forEach((cell) => {
      this.clearDecorations(cell);
    });
    this.trackedCells = [];
  }
};

NotebookMultiCursorController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, ILanguageConfigurationService),
  __decorateParam(4, IAccessibilityService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IUndoRedoService)
], NotebookMultiCursorController);

var NotebookSelectAllFindMatches = class extends NotebookAction {
  constructor() {
    super({
      id: NOTEBOOK_SELECT_ALL_FIND_MATCHES_ID,
      title: localize(17468, null),
      precondition: ContextKeyExpr.and(
        ContextKeyExpr.equals("config.notebook.multiCursor.enabled", true)
      ),
      keybinding: {
        when: ContextKeyExpr.or(
          ContextKeyExpr.and(
            ContextKeyExpr.equals("config.notebook.multiCursor.enabled", true),
            NOTEBOOK_IS_ACTIVE_EDITOR,
            NOTEBOOK_CELL_EDITOR_FOCUSED
          ),
          ContextKeyExpr.and(
            ContextKeyExpr.equals("config.notebook.multiCursor.enabled", true),
            KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED
          )
        ),
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 42 /* KeyL */,
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  async runWithContext(accessor, context2) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    if (!context2.cell) {
      return;
    }
    const cursorController = editor.getContribution(NotebookMultiCursorController.id);
    const findController = editor.getContribution(NotebookFindContrib.id);
    if (findController.widget.isFocused) {
      const findModel = findController.widget.findModel;
      cursorController.selectAllMatches(context2.cell, findModel.findMatches);
    } else {
      cursorController.selectAllMatches(context2.cell);
    }
  }
};

var NotebookAddMatchToMultiSelectionAction = class extends NotebookAction {
  constructor() {
    super({
      id: NOTEBOOK_ADD_FIND_MATCH_TO_SELECTION_ID,
      title: localize(17464, null),
      precondition: ContextKeyExpr.and(
        ContextKeyExpr.equals("config.notebook.multiCursor.enabled", true),
        NOTEBOOK_IS_ACTIVE_EDITOR,
        NOTEBOOK_CELL_EDITOR_FOCUSED
      ),
      keybinding: {
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("config.notebook.multiCursor.enabled", true),
          NOTEBOOK_IS_ACTIVE_EDITOR,
          NOTEBOOK_CELL_EDITOR_FOCUSED
        ),
        primary: 2048 /* CtrlCmd */ | 34 /* KeyD */,
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  async runWithContext(accessor, context2) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    if (!context2.cell) {
      return;
    }
    const controller = editor.getContribution(NotebookMultiCursorController.id);
    controller.findAndTrackNextSelection(context2.cell);
  }
};

var NotebookExitMultiSelectionAction = class extends NotebookAction {
  constructor() {
    super({
      id: "noteMultiCursor.exit",
      title: localize(17467, null),
      precondition: ContextKeyExpr.and(
        ContextKeyExpr.equals("config.notebook.multiCursor.enabled", true),
        NOTEBOOK_IS_ACTIVE_EDITOR,
        NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor
      ),
      keybinding: {
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("config.notebook.multiCursor.enabled", true),
          NOTEBOOK_IS_ACTIVE_EDITOR,
          NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor
        ),
        primary: 9 /* Escape */,
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  async runWithContext(accessor, context2) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    const controller = editor.getContribution(NotebookMultiCursorController.id);
    controller.resetToIdleState();
  }
};

var NotebookDeleteLeftMultiSelectionAction = class extends NotebookAction {
  constructor() {
    super({
      id: "noteMultiCursor.deleteLeft",
      title: localize(17465, null),
      precondition: ContextKeyExpr.and(
        ContextKeyExpr.equals("config.notebook.multiCursor.enabled", true),
        NOTEBOOK_IS_ACTIVE_EDITOR,
        NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor,
        ContextKeyExpr.or(
          NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(1 /* Selecting */),
          NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(2 /* Editing */)
        )
      ),
      keybinding: {
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("config.notebook.multiCursor.enabled", true),
          NOTEBOOK_IS_ACTIVE_EDITOR,
          NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor,
          ContextKeyExpr.or(
            NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(1 /* Selecting */),
            NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(2 /* Editing */)
          )
        ),
        primary: 1 /* Backspace */,
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  async runWithContext(accessor, context2) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    const controller = editor.getContribution(NotebookMultiCursorController.id);
    controller.deleteLeft();
  }
};

var NotebookDeleteRightMultiSelectionAction = class extends NotebookAction {
  constructor() {
    super({
      id: "noteMultiCursor.deleteRight",
      title: localize(17466, null),
      precondition: ContextKeyExpr.and(
        ContextKeyExpr.equals("config.notebook.multiCursor.enabled", true),
        NOTEBOOK_IS_ACTIVE_EDITOR,
        NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor,
        ContextKeyExpr.or(
          NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(1 /* Selecting */),
          NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(2 /* Editing */)
        )
      ),
      keybinding: {
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("config.notebook.multiCursor.enabled", true),
          NOTEBOOK_IS_ACTIVE_EDITOR,
          NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor,
          ContextKeyExpr.or(
            NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(1 /* Selecting */),
            NOTEBOOK_MULTI_CURSOR_CONTEXT.NotebookMultiSelectCursorState.isEqualTo(2 /* Editing */)
          )
        ),
        primary: 20 /* Delete */,
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  async runWithContext(accessor, context2) {
    const editorService = accessor.get(IEditorService);
    const nbEditor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!nbEditor) {
      return;
    }
    const cellEditor = nbEditor.activeCodeEditor;
    if (!cellEditor) {
      return;
    }
    CoreEditingCommands.DeleteRight.runEditorCommand(accessor, cellEditor, null);
    const controller = nbEditor.getContribution(NotebookMultiCursorController.id);
    controller.deleteRight();
  }
};

var NotebookMultiCursorUndoRedoContribution = class extends Disposable {
  constructor(_editorService, configurationService) {
    super();
    this._editorService = _editorService;
    this.configurationService = configurationService;
    if (!this.configurationService.getValue("notebook.multiCursor.enabled")) {
      return;
    }
    const PRIORITY3 = 10005;
    this._register(UndoCommand.addImplementation(PRIORITY3, "notebook-multicursor-undo-redo", () => {
      const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
      if (!editor) {
        return false;
      }
      if (!editor.hasModel()) {
        return false;
      }
      const controller = editor.getContribution(NotebookMultiCursorController.id);
      return controller.undo();
    }, ContextKeyExpr.and(
      ContextKeyExpr.equals("config.notebook.multiCursor.enabled", true),
      NOTEBOOK_IS_ACTIVE_EDITOR,
      NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor
    )));
    this._register(RedoCommand.addImplementation(PRIORITY3, "notebook-multicursor-undo-redo", () => {
      const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
      if (!editor) {
        return false;
      }
      if (!editor.hasModel()) {
        return false;
      }
      const controller = editor.getContribution(NotebookMultiCursorController.id);
      return controller.redo();
    }, ContextKeyExpr.and(
      ContextKeyExpr.equals("config.notebook.multiCursor.enabled", true),
      NOTEBOOK_IS_ACTIVE_EDITOR,
      NOTEBOOK_MULTI_CURSOR_CONTEXT.IsNotebookMultiCursor
    )));
  }
  static {
    this.ID = "workbench.contrib.notebook.multiCursorUndoRedo";
  }
};

NotebookMultiCursorUndoRedoContribution = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IConfigurationService)
], NotebookMultiCursorUndoRedoContribution);

registerNotebookContribution(NotebookMultiCursorController.id, NotebookMultiCursorController);

registerWorkbenchContribution2(NotebookMultiCursorUndoRedoContribution.ID, NotebookMultiCursorUndoRedoContribution, WorkbenchPhase.BlockRestore);

registerAction2(NotebookSelectAllFindMatches);

registerAction2(NotebookAddMatchToMultiSelectionAction);

registerAction2(NotebookExitMultiSelectionAction);

registerAction2(NotebookDeleteLeftMultiSelectionAction);

registerAction2(NotebookDeleteRightMultiSelectionAction);
export { NOTEBOOK_ADD_FIND_MATCH_TO_SELECTION_ID, NOTEBOOK_SELECT_ALL_FIND_MATCHES_ID, NOTEBOOK_MULTI_CURSOR_CONTEXT, NotebookMultiCursorController, NotebookSelectAllFindMatches, NotebookAddMatchToMultiSelectionAction, NotebookExitMultiSelectionAction, NotebookDeleteLeftMultiSelectionAction, NotebookDeleteRightMultiSelectionAction, NotebookMultiCursorUndoRedoContribution };
