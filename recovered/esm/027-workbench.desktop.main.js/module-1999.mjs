// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/controller/cellOperations.ts
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { expandCellRangesWithHiddenCells } from "./module-0941.mjs";
import { cellRangeContains, cellRangesToIndexes } from "./module-0940.mjs";
import { cloneNotebookCellTextModel } from "./module-1883.mjs";
import { localize } from "./module-0001.mjs";
import { ResourceNotebookCellEdit } from "./module-0942.mjs";
import { ResourceTextEdit } from "./module-0537.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/workbench/contrib/notebook/browser/controller/cellOperations.ts
async function changeCellToKind(kind, context2, language2, mime) {
  const { notebookEditor } = context2;
  if (!notebookEditor.hasModel()) {
    return;
  }
  if (notebookEditor.isReadOnly) {
    return;
  }
  if (context2.ui && context2.cell) {
    const { cell } = context2;
    if (cell.cellKind === kind) {
      return;
    }
    const text2 = cell.getText();
    const idx = notebookEditor.getCellIndex(cell);
    if (language2 === void 0) {
      const availableLanguages = notebookEditor.activeKernel?.supportedLanguages ?? [];
      language2 = availableLanguages[0] ?? PLAINTEXT_LANGUAGE_ID;
    }
    notebookEditor.textModel.applyEdits([
      {
        editType: 1 /* Replace */,
        index: idx,
        count: 1,
        cells: [{
          cellKind: kind,
          source: text2,
          language: language2,
          mime: mime ?? cell.mime,
          outputs: cell.model.outputs,
          metadata: cell.metadata
        }]
      }
    ], true, {
      kind: 1 /* Index */,
      focus: notebookEditor.getFocus(),
      selections: notebookEditor.getSelections()
    }, () => {
      return {
        kind: 1 /* Index */,
        focus: notebookEditor.getFocus(),
        selections: notebookEditor.getSelections()
      };
    }, void 0, true);
    const newCell = notebookEditor.cellAt(idx);
    await notebookEditor.focusNotebookCell(newCell, cell.getEditState() === 1 /* Editing */ ? "editor" : "container");
  } else if (context2.selectedCells) {
    const selectedCells = context2.selectedCells;
    const rawEdits = [];
    selectedCells.forEach((cell) => {
      if (cell.cellKind === kind) {
        return;
      }
      const text2 = cell.getText();
      const idx = notebookEditor.getCellIndex(cell);
      if (language2 === void 0) {
        const availableLanguages = notebookEditor.activeKernel?.supportedLanguages ?? [];
        language2 = availableLanguages[0] ?? PLAINTEXT_LANGUAGE_ID;
      }
      rawEdits.push(
        {
          editType: 1 /* Replace */,
          index: idx,
          count: 1,
          cells: [{
            cellKind: kind,
            source: text2,
            language: language2,
            mime: mime ?? cell.mime,
            outputs: cell.model.outputs,
            metadata: cell.metadata
          }]
        }
      );
    });
    notebookEditor.textModel.applyEdits(rawEdits, true, {
      kind: 1 /* Index */,
      focus: notebookEditor.getFocus(),
      selections: notebookEditor.getSelections()
    }, () => {
      return {
        kind: 1 /* Index */,
        focus: notebookEditor.getFocus(),
        selections: notebookEditor.getSelections()
      };
    }, void 0, true);
  }
}

function runDeleteAction(editor, cell) {
  const textModel = editor.textModel;
  const selections = editor.getSelections();
  const targetCellIndex = editor.getCellIndex(cell);
  const containingSelection = selections.find((selection) => selection.start <= targetCellIndex && targetCellIndex < selection.end);
  const computeUndoRedo = !editor.isReadOnly || textModel.viewType === "interactive";
  if (containingSelection) {
    const edits = selections.reverse().map((selection) => ({
      editType: 1 /* Replace */,
      index: selection.start,
      count: selection.end - selection.start,
      cells: []
    }));
    const nextCellAfterContainingSelection = containingSelection.end >= editor.getLength() ? void 0 : editor.cellAt(containingSelection.end);
    textModel.applyEdits(edits, true, { kind: 1 /* Index */, focus: editor.getFocus(), selections: editor.getSelections() }, () => {
      if (nextCellAfterContainingSelection) {
        const cellIndex = textModel.cells.findIndex((cell2) => cell2.handle === nextCellAfterContainingSelection.handle);
        return { kind: 1 /* Index */, focus: { start: cellIndex, end: cellIndex + 1 }, selections: [{ start: cellIndex, end: cellIndex + 1 }] };
      } else {
        if (textModel.length) {
          const lastCellIndex = textModel.length - 1;
          return { kind: 1 /* Index */, focus: { start: lastCellIndex, end: lastCellIndex + 1 }, selections: [{ start: lastCellIndex, end: lastCellIndex + 1 }] };
        } else {
          return { kind: 1 /* Index */, focus: { start: 0, end: 0 }, selections: [{ start: 0, end: 0 }] };
        }
      }
    }, void 0, computeUndoRedo);
  } else {
    const focus = editor.getFocus();
    const edits = [{
      editType: 1 /* Replace */,
      index: targetCellIndex,
      count: 1,
      cells: []
    }];
    const finalSelections = [];
    for (let i2 = 0; i2 < selections.length; i2++) {
      const selection = selections[i2];
      if (selection.end <= targetCellIndex) {
        finalSelections.push(selection);
      } else if (selection.start > targetCellIndex) {
        finalSelections.push({ start: selection.start - 1, end: selection.end - 1 });
      } else {
        finalSelections.push({ start: targetCellIndex, end: targetCellIndex + 1 });
      }
    }
    if (editor.cellAt(focus.start) === cell) {
      const newFocus = focus.end === textModel.length ? { start: focus.start - 1, end: focus.end - 1 } : focus;
      textModel.applyEdits(edits, true, { kind: 1 /* Index */, focus: editor.getFocus(), selections: editor.getSelections() }, () => ({
        kind: 1 /* Index */,
        focus: newFocus,
        selections: finalSelections
      }), void 0, computeUndoRedo);
    } else {
      const newFocus = focus.start > targetCellIndex ? { start: focus.start - 1, end: focus.end - 1 } : focus;
      textModel.applyEdits(edits, true, { kind: 1 /* Index */, focus: editor.getFocus(), selections: editor.getSelections() }, () => ({
        kind: 1 /* Index */,
        focus: newFocus,
        selections: finalSelections
      }), void 0, computeUndoRedo);
    }
  }
}

async function moveCellRange(context2, direction) {
  if (!context2.notebookEditor.hasModel()) {
    return;
  }
  const editor = context2.notebookEditor;
  const textModel = editor.textModel;
  if (editor.isReadOnly) {
    return;
  }
  let range2 = void 0;
  if (context2.cell) {
    const idx = editor.getCellIndex(context2.cell);
    range2 = { start: idx, end: idx + 1 };
  } else {
    const selections = editor.getSelections();
    const modelRanges = expandCellRangesWithHiddenCells(editor, selections);
    range2 = modelRanges[0];
  }
  if (!range2 || range2.start === range2.end) {
    return;
  }
  if (direction === "up") {
    if (range2.start === 0) {
      return;
    }
    const indexAbove = range2.start - 1;
    const finalSelection = { start: range2.start - 1, end: range2.end - 1 };
    const focus = context2.notebookEditor.getFocus();
    const newFocus = cellRangeContains(range2, focus) ? { start: focus.start - 1, end: focus.end - 1 } : { start: range2.start - 1, end: range2.start };
    textModel.applyEdits(
      [
        {
          editType: 6 /* Move */,
          index: indexAbove,
          length: 1,
          newIdx: range2.end - 1
        }
      ],
      true,
      {
        kind: 1 /* Index */,
        focus: editor.getFocus(),
        selections: editor.getSelections()
      },
      () => ({ kind: 1 /* Index */, focus: newFocus, selections: [finalSelection] }),
      void 0,
      true
    );
    const focusRange = editor.getSelections()[0] ?? editor.getFocus();
    editor.revealCellRangeInView(focusRange);
  } else {
    if (range2.end >= textModel.length) {
      return;
    }
    const indexBelow = range2.end;
    const finalSelection = { start: range2.start + 1, end: range2.end + 1 };
    const focus = editor.getFocus();
    const newFocus = cellRangeContains(range2, focus) ? { start: focus.start + 1, end: focus.end + 1 } : { start: range2.start + 1, end: range2.start + 2 };
    textModel.applyEdits(
      [
        {
          editType: 6 /* Move */,
          index: indexBelow,
          length: 1,
          newIdx: range2.start
        }
      ],
      true,
      {
        kind: 1 /* Index */,
        focus: editor.getFocus(),
        selections: editor.getSelections()
      },
      () => ({ kind: 1 /* Index */, focus: newFocus, selections: [finalSelection] }),
      void 0,
      true
    );
    const focusRange = editor.getSelections()[0] ?? editor.getFocus();
    editor.revealCellRangeInView(focusRange);
  }
}

async function copyCellRange(context2, direction) {
  const editor = context2.notebookEditor;
  if (!editor.hasModel()) {
    return;
  }
  const textModel = editor.textModel;
  if (editor.isReadOnly) {
    return;
  }
  let range2 = void 0;
  if (context2.ui) {
    const targetCell = context2.cell;
    const targetCellIndex = editor.getCellIndex(targetCell);
    range2 = { start: targetCellIndex, end: targetCellIndex + 1 };
  } else {
    const selections = editor.getSelections();
    const modelRanges = expandCellRangesWithHiddenCells(editor, selections);
    range2 = modelRanges[0];
  }
  if (!range2 || range2.start === range2.end) {
    return;
  }
  if (direction === "up") {
    const focus = editor.getFocus();
    const selections = editor.getSelections();
    textModel.applyEdits(
      [
        {
          editType: 1 /* Replace */,
          index: range2.end,
          count: 0,
          cells: cellRangesToIndexes([range2]).map((index2) => cloneNotebookCellTextModel(editor.cellAt(index2).model))
        }
      ],
      true,
      {
        kind: 1 /* Index */,
        focus,
        selections
      },
      () => ({ kind: 1 /* Index */, focus, selections }),
      void 0,
      true
    );
  } else {
    const focus = editor.getFocus();
    const selections = editor.getSelections();
    const newCells = cellRangesToIndexes([range2]).map((index2) => cloneNotebookCellTextModel(editor.cellAt(index2).model));
    const countDelta = newCells.length;
    const newFocus = context2.ui ? focus : { start: focus.start + countDelta, end: focus.end + countDelta };
    const newSelections = context2.ui ? selections : [{ start: range2.start + countDelta, end: range2.end + countDelta }];
    textModel.applyEdits(
      [
        {
          editType: 1 /* Replace */,
          index: range2.end,
          count: 0,
          cells: cellRangesToIndexes([range2]).map((index2) => cloneNotebookCellTextModel(editor.cellAt(index2).model))
        }
      ],
      true,
      {
        kind: 1 /* Index */,
        focus,
        selections
      },
      () => ({ kind: 1 /* Index */, focus: newFocus, selections: newSelections }),
      void 0,
      true
    );
    const focusRange = editor.getSelections()[0] ?? editor.getFocus();
    editor.revealCellRangeInView(focusRange);
  }
}

async function joinSelectedCells(bulkEditService, notificationService, context2) {
  const editor = context2.notebookEditor;
  if (editor.isReadOnly) {
    return;
  }
  const edits = [];
  const cells = [];
  for (const selection of editor.getSelections()) {
    cells.push(...editor.getCellsInRange(selection));
  }
  if (cells.length <= 1) {
    return;
  }
  const cellKind = cells[0].cellKind;
  const isSameKind = cells.every((cell) => cell.cellKind === cellKind);
  if (!isSameKind) {
    const message = localize(17513, null);
    return notificationService.warn(message);
  }
  const firstCell = cells[0];
  const insertContent = cells.map((cell) => cell.getText()).join(firstCell.textBuffer.getEOL());
  const firstSelection = editor.getSelections()[0];
  edits.push(
    new ResourceNotebookCellEdit(
      editor.textModel.uri,
      {
        editType: 1 /* Replace */,
        index: firstSelection.start,
        count: firstSelection.end - firstSelection.start,
        cells: [{
          cellKind: firstCell.cellKind,
          source: insertContent,
          language: firstCell.language,
          mime: firstCell.mime,
          outputs: firstCell.model.outputs,
          metadata: firstCell.metadata
        }]
      }
    )
  );
  for (const selection of editor.getSelections().slice(1)) {
    edits.push(new ResourceNotebookCellEdit(
      editor.textModel.uri,
      {
        editType: 1 /* Replace */,
        index: selection.start,
        count: selection.end - selection.start,
        cells: []
      }
    ));
  }
  if (edits.length) {
    await bulkEditService.apply(
      edits,
      { quotableLabel: localize(17514, null) }
    );
  }
}

async function joinNotebookCells(editor, range2, direction, constraint) {
  if (editor.isReadOnly) {
    return null;
  }
  const textModel = editor.textModel;
  const cells = editor.getCellsInRange(range2);
  if (!cells.length) {
    return null;
  }
  if (range2.start === 0 && direction === "above") {
    return null;
  }
  if (range2.end === textModel.length && direction === "below") {
    return null;
  }
  for (let i2 = 0; i2 < cells.length; i2++) {
    const cell = cells[i2];
    if (constraint && cell.cellKind !== constraint) {
      return null;
    }
  }
  if (direction === "above") {
    const above = editor.cellAt(range2.start - 1);
    if (constraint && above.cellKind !== constraint) {
      return null;
    }
    const insertContent = cells.map((cell) => (cell.textBuffer.getEOL() ?? "") + cell.getText()).join("");
    const aboveCellLineCount = above.textBuffer.getLineCount();
    const aboveCellLastLineEndColumn = above.textBuffer.getLineLength(aboveCellLineCount);
    return {
      edits: [
        new ResourceTextEdit(above.uri, { range: new Range2(aboveCellLineCount, aboveCellLastLineEndColumn + 1, aboveCellLineCount, aboveCellLastLineEndColumn + 1), text: insertContent }),
        new ResourceNotebookCellEdit(
          textModel.uri,
          {
            editType: 1 /* Replace */,
            index: range2.start,
            count: range2.end - range2.start,
            cells: []
          }
        )
      ],
      cell: above,
      endFocus: { start: range2.start - 1, end: range2.start },
      endSelections: [{ start: range2.start - 1, end: range2.start }]
    };
  } else {
    const below = editor.cellAt(range2.end);
    if (constraint && below.cellKind !== constraint) {
      return null;
    }
    const cell = cells[0];
    const restCells = [...cells.slice(1), below];
    const insertContent = restCells.map((cl) => (cl.textBuffer.getEOL() ?? "") + cl.getText()).join("");
    const cellLineCount = cell.textBuffer.getLineCount();
    const cellLastLineEndColumn = cell.textBuffer.getLineLength(cellLineCount);
    return {
      edits: [
        new ResourceTextEdit(cell.uri, { range: new Range2(cellLineCount, cellLastLineEndColumn + 1, cellLineCount, cellLastLineEndColumn + 1), text: insertContent }),
        new ResourceNotebookCellEdit(
          textModel.uri,
          {
            editType: 1 /* Replace */,
            index: range2.start + 1,
            count: range2.end - range2.start,
            cells: []
          }
        )
      ],
      cell,
      endFocus: { start: range2.start, end: range2.start + 1 },
      endSelections: [{ start: range2.start, end: range2.start + 1 }]
    };
  }
}

async function joinCellsWithSurrounds(bulkEditService, context2, direction) {
  const editor = context2.notebookEditor;
  const textModel = editor.textModel;
  const viewModel = editor.getViewModel();
  let ret = null;
  if (context2.ui) {
    const focusMode = context2.cell.focusMode;
    const cellIndex = editor.getCellIndex(context2.cell);
    ret = await joinNotebookCells(editor, { start: cellIndex, end: cellIndex + 1 }, direction);
    if (!ret) {
      return;
    }
    await bulkEditService.apply(
      ret?.edits,
      { quotableLabel: "Join Notebook Cells" }
    );
    viewModel.updateSelectionsState({ kind: 1 /* Index */, focus: ret.endFocus, selections: ret.endSelections });
    ret.cell.updateEditState(1 /* Editing */, "joinCellsWithSurrounds");
    editor.revealCellRangeInView(editor.getFocus());
    if (focusMode === 1 /* Editor */) {
      ret.cell.focusMode = 1 /* Editor */;
    }
  } else {
    const selections = editor.getSelections();
    if (!selections.length) {
      return;
    }
    const focus = editor.getFocus();
    const focusMode = editor.cellAt(focus.start)?.focusMode;
    const edits = [];
    let cell = null;
    const cells = [];
    for (let i2 = selections.length - 1; i2 >= 0; i2--) {
      const selection = selections[i2];
      const containFocus = cellRangeContains(selection, focus);
      if (selection.end >= textModel.length && direction === "below" || selection.start === 0 && direction === "above") {
        if (containFocus) {
          cell = editor.cellAt(focus.start);
        }
        cells.push(...editor.getCellsInRange(selection));
        continue;
      }
      const singleRet = await joinNotebookCells(editor, selection, direction);
      if (!singleRet) {
        return;
      }
      edits.push(...singleRet.edits);
      cells.push(singleRet.cell);
      if (containFocus) {
        cell = singleRet.cell;
      }
    }
    if (!edits.length) {
      return;
    }
    if (!cell || !cells.length) {
      return;
    }
    await bulkEditService.apply(
      edits,
      { quotableLabel: "Join Notebook Cells" }
    );
    cells.forEach((cell2) => {
      cell2.updateEditState(1 /* Editing */, "joinCellsWithSurrounds");
    });
    viewModel.updateSelectionsState({ kind: 0 /* Handle */, primary: cell.handle, selections: cells.map((cell2) => cell2.handle) });
    editor.revealCellRangeInView(editor.getFocus());
    const newFocusedCell = editor.cellAt(editor.getFocus().start);
    if (focusMode === 1 /* Editor */ && newFocusedCell) {
      newFocusedCell.focusMode = 1 /* Editor */;
    }
  }
}

function _splitPointsToBoundaries(splitPoints, textBuffer) {
  const boundaries = [];
  const lineCnt = textBuffer.getLineCount();
  const getLineLen = (lineNumber) => {
    return textBuffer.getLineLength(lineNumber);
  };
  splitPoints = splitPoints.sort((l, r2) => {
    const lineDiff = l.lineNumber - r2.lineNumber;
    const columnDiff = l.column - r2.column;
    return lineDiff !== 0 ? lineDiff : columnDiff;
  });
  for (let sp of splitPoints) {
    if (getLineLen(sp.lineNumber) + 1 === sp.column && sp.column !== 1 && sp.lineNumber < lineCnt) {
      sp = new Position(sp.lineNumber + 1, 1);
    }
    _pushIfAbsent(boundaries, sp);
  }
  if (boundaries.length === 0) {
    return null;
  }
  const modelStart = new Position(1, 1);
  const modelEnd = new Position(lineCnt, getLineLen(lineCnt) + 1);
  return [modelStart, ...boundaries, modelEnd];
}

function _pushIfAbsent(positions, p) {
  const last = positions.length > 0 ? positions[positions.length - 1] : void 0;
  if (!last || last.lineNumber !== p.lineNumber || last.column !== p.column) {
    positions.push(p);
  }
}

function computeCellLinesContents(cell, splitPoints) {
  const rangeBoundaries = _splitPointsToBoundaries(splitPoints, cell.textBuffer);
  if (!rangeBoundaries) {
    return null;
  }
  const newLineModels = [];
  for (let i2 = 1; i2 < rangeBoundaries.length; i2++) {
    const start = rangeBoundaries[i2 - 1];
    const end = rangeBoundaries[i2];
    newLineModels.push(cell.textBuffer.getValueInRange(new Range2(start.lineNumber, start.column, end.lineNumber, end.column), 0 /* TextDefined */));
  }
  return newLineModels;
}

function insertCell(languageService, editor, index2, type, direction = "above", initialText = "", ui = false, kernelHistoryService) {
  const viewModel = editor.getViewModel();
  const activeKernel = editor.activeKernel;
  if (viewModel.options.isReadOnly) {
    return null;
  }
  const cell = editor.cellAt(index2);
  const nextIndex = ui ? viewModel.getNextVisibleCellIndex(index2) : index2 + 1;
  let language2;
  if (type === 2 /* Code */) {
    const supportedLanguages = activeKernel?.supportedLanguages ?? languageService.getRegisteredLanguageIds();
    const defaultLanguage = supportedLanguages[0] || PLAINTEXT_LANGUAGE_ID;
    if (cell?.cellKind === 2 /* Code */) {
      language2 = cell.language;
    } else if (cell?.cellKind === 1 /* Markup */) {
      const nearestCodeCellIndex = viewModel.nearestCodeCellIndex(index2);
      if (nearestCodeCellIndex > -1) {
        language2 = viewModel.cellAt(nearestCodeCellIndex).language;
      } else {
        language2 = defaultLanguage;
      }
    } else if (!cell && viewModel.length === 0) {
      const lastKernels = kernelHistoryService?.getKernels(viewModel.notebookDocument);
      if (lastKernels?.all.length) {
        const lastKernel = lastKernels.all[0];
        language2 = lastKernel.supportedLanguages[0] || defaultLanguage;
      } else {
        language2 = defaultLanguage;
      }
    } else {
      if (cell === void 0 && direction === "above") {
        language2 = viewModel.viewCells.find((cell2) => cell2.cellKind === 2 /* Code */)?.language || defaultLanguage;
      } else {
        language2 = defaultLanguage;
      }
    }
    if (!supportedLanguages.includes(language2)) {
      language2 = defaultLanguage;
    }
  } else {
    language2 = "markdown";
  }
  const insertIndex = cell ? direction === "above" ? index2 : nextIndex : index2;
  return insertCellAtIndex(viewModel, insertIndex, initialText, language2, type, void 0, [], true, true);
}

function insertCellAtIndex(viewModel, index2, source, language2, type, metadata, outputs, synchronous, pushUndoStop) {
  const endSelections = { kind: 1 /* Index */, focus: { start: index2, end: index2 + 1 }, selections: [{ start: index2, end: index2 + 1 }] };
  viewModel.notebookDocument.applyEdits([
    {
      editType: 1 /* Replace */,
      index: index2,
      count: 0,
      cells: [
        {
          cellKind: type,
          language: language2,
          mime: void 0,
          outputs,
          metadata,
          source
        }
      ]
    }
  ], synchronous, { kind: 1 /* Index */, focus: viewModel.getFocus(), selections: viewModel.getSelections() }, () => endSelections, void 0, pushUndoStop && !viewModel.options.isReadOnly);
  return viewModel.cellAt(index2);
}
export { changeCellToKind, runDeleteAction, moveCellRange, copyCellRange, joinSelectedCells, joinNotebookCells, joinCellsWithSurrounds, _splitPointsToBoundaries, _pushIfAbsent, computeCellLinesContents, insertCell, insertCellAtIndex };
