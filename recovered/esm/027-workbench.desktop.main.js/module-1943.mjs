// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/find/findModel.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Delayer, createCancelablePromise } from "./module-0036.mjs";
import { FindMatchDecorationModel } from "./module-1942.mjs";
import { hasKey } from "./module-0010.mjs";
import { findFirstIdxMonotonousOrArrLen } from "./module-0006.mjs";
import { Range2 } from "./module-0106.mjs";
import { PrefixSumComputer } from "./module-0200.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/find/findModel.ts
var CellFindMatchModel = class {
  get length() {
    return this._contentMatches.length + this._webviewMatches.length;
  }
  get contentMatches() {
    return this._contentMatches;
  }
  get webviewMatches() {
    return this._webviewMatches;
  }
  constructor(cell, index2, contentMatches, webviewMatches) {
    this.cell = cell;
    this.index = index2;
    this._contentMatches = contentMatches;
    this._webviewMatches = webviewMatches;
  }
  getMatch(index2) {
    if (index2 >= this.length) {
      throw new Error("NotebookCellFindMatch: index out of range");
    }
    if (index2 < this._contentMatches.length) {
      return this._contentMatches[index2];
    }
    return this._webviewMatches[index2 - this._contentMatches.length];
  }
};

var FindModel = class extends Disposable {
  constructor(_notebookEditor, _state, _configurationService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._state = _state;
    this._configurationService = _configurationService;
    this._findMatches = [];
    this._findMatchesStarts = null;
    this._currentMatch = -1;
    this._computePromise = null;
    this._modelDisposable = this._register(new DisposableStore());
    this._throttledDelayer = this._register(new Delayer(20));
    this._computePromise = null;
    this._register(_state.onFindReplaceStateChange((e) => {
      this._updateCellStates(e);
      if (e.searchString || e.isRegex || e.matchCase || e.searchScope || e.wholeWord || e.isRevealed && this._state.isRevealed || e.filters || e.isReplaceRevealed) {
        this.research();
      }
      if (e.isRevealed && !this._state.isRevealed) {
        this.clear();
      }
    }));
    this._register(this._notebookEditor.onDidChangeModel((e) => {
      this._registerModelListener(e);
    }));
    this._register(this._notebookEditor.onDidChangeCellState((e) => {
      if (e.cell.cellKind === 1 /* Markup */ && e.source.editStateChanged) {
        this.research();
      }
    }));
    if (this._notebookEditor.hasModel()) {
      this._registerModelListener(this._notebookEditor.textModel);
    }
    this._findMatchDecorationModel = new FindMatchDecorationModel(this._notebookEditor, this._notebookEditor.getId());
  }
  get findMatches() {
    return this._findMatches;
  }
  get currentMatch() {
    return this._currentMatch;
  }
  _updateCellStates(e) {
    if (!this._state.filters?.markupInput || !this._state.filters?.markupPreview || !this._state.filters?.findScope) {
      return;
    }
    const updateEditingState = () => {
      const viewModel = this._notebookEditor.getViewModel();
      if (!viewModel) {
        return;
      }
      const wordSeparators2 = this._configurationService.inspect("editor.wordSeparators").value;
      const options3 = {
        regex: this._state.isRegex,
        wholeWord: this._state.wholeWord,
        caseSensitive: this._state.matchCase,
        wordSeparators: wordSeparators2,
        includeMarkupInput: true,
        includeCodeInput: false,
        includeMarkupPreview: false,
        includeOutput: false,
        findScope: this._state.filters?.findScope
      };
      const contentMatches = viewModel.find(this._state.searchString, options3);
      for (let i2 = 0; i2 < viewModel.length; i2++) {
        const cell = viewModel.cellAt(i2);
        if (cell && cell.cellKind === 1 /* Markup */) {
          const foundContentMatch = contentMatches.find((m) => m.cell.handle === cell.handle && m.contentMatches.length > 0);
          const targetState = foundContentMatch ? 1 /* Editing */ : 0 /* Preview */;
          const currentEditingState = cell.getEditState();
          if (currentEditingState === 1 /* Editing */ && cell.editStateSource !== "find") {
            continue;
          }
          if (currentEditingState !== targetState) {
            cell.updateEditState(targetState, "find");
          }
        }
      }
    };
    if (e.isReplaceRevealed && !this._state.isReplaceRevealed) {
      const viewModel = this._notebookEditor.getViewModel();
      if (!viewModel) {
        return;
      }
      for (let i2 = 0; i2 < viewModel.length; i2++) {
        const cell = viewModel.cellAt(i2);
        if (cell && cell.cellKind === 1 /* Markup */) {
          if (cell.getEditState() === 1 /* Editing */ && cell.editStateSource === "find") {
            cell.updateEditState(0 /* Preview */, "find");
          }
        }
      }
      return;
    }
    if (e.isReplaceRevealed) {
      updateEditingState();
    } else if ((e.filters || e.isRevealed || e.searchString || e.replaceString) && this._state.isRevealed && this._state.isReplaceRevealed) {
      updateEditingState();
    }
  }
  ensureFindMatches() {
    if (!this._findMatchesStarts) {
      this.set(this._findMatches, true);
    }
  }
  getCurrentMatch() {
    const nextIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
    const cell = this._findMatches[nextIndex.index].cell;
    const match2 = this._findMatches[nextIndex.index].getMatch(nextIndex.remainder);
    return {
      cell,
      match: match2,
      isModelMatch: nextIndex.remainder < this._findMatches[nextIndex.index].contentMatches.length
    };
  }
  refreshCurrentMatch(focus) {
    const findMatchIndex = this.findMatches.findIndex((match2) => match2.cell === focus.cell);
    if (findMatchIndex === -1) {
      return;
    }
    const findMatch = this.findMatches[findMatchIndex];
    const index2 = findMatch.contentMatches.findIndex((match2) => match2.range.intersectRanges(focus.range) !== null);
    if (index2 === void 0) {
      return;
    }
    const matchesBefore = findMatchIndex === 0 ? 0 : this._findMatchesStarts?.getPrefixSum(findMatchIndex - 1) ?? 0;
    this._currentMatch = matchesBefore + index2;
    this.highlightCurrentFindMatchDecoration(findMatchIndex, index2).then(async (offset) => {
      await this.revealCellRange(findMatchIndex, index2, offset);
      this._state.changeMatchInfo(
        this._currentMatch,
        this._findMatches.reduce((p, c) => p + c.length, 0),
        void 0
      );
    });
  }
  find(option2) {
    if (!this.findMatches.length) {
      return;
    }
    if (!this._findMatchesStarts) {
      this.set(this._findMatches, true);
      if (hasKey(option2, { index: true })) {
        this._currentMatch = option2.index;
      }
    } else {
      const totalVal = this._findMatchesStarts.getTotalSum();
      if (hasKey(option2, { index: true })) {
        this._currentMatch = option2.index;
      } else if (this._currentMatch === -1) {
        this._currentMatch = option2.previous ? totalVal - 1 : 0;
      } else {
        const nextVal = (this._currentMatch + (option2.previous ? -1 : 1) + totalVal) % totalVal;
        this._currentMatch = nextVal;
      }
    }
    const nextIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
    this.highlightCurrentFindMatchDecoration(nextIndex.index, nextIndex.remainder).then(async (offset) => {
      await this.revealCellRange(nextIndex.index, nextIndex.remainder, offset);
      this._state.changeMatchInfo(
        this._currentMatch,
        this._findMatches.reduce((p, c) => p + c.length, 0),
        void 0
      );
    });
  }
  async revealCellRange(cellIndex, matchIndex, outputOffset) {
    const findMatch = this._findMatches[cellIndex];
    if (matchIndex >= findMatch.contentMatches.length) {
      this._notebookEditor.focusElement(findMatch.cell);
      const index2 = this._notebookEditor.getCellIndex(findMatch.cell);
      if (index2 !== void 0) {
        this._notebookEditor.revealCellOffsetInCenter(findMatch.cell, outputOffset ?? 0);
      }
    } else {
      const match2 = findMatch.getMatch(matchIndex);
      if (findMatch.cell.getEditState() !== 1 /* Editing */) {
        findMatch.cell.updateEditState(1 /* Editing */, "find");
      }
      findMatch.cell.isInputCollapsed = false;
      this._notebookEditor.focusElement(findMatch.cell);
      this._notebookEditor.setCellEditorSelection(findMatch.cell, match2.range);
      await this._notebookEditor.revealInView(findMatch.cell);
      this._notebookEditor.revealRangeInCenterIfOutsideViewportAsync(findMatch.cell, match2.range);
    }
  }
  _registerModelListener(notebookTextModel) {
    this._modelDisposable.clear();
    if (notebookTextModel) {
      this._modelDisposable.add(notebookTextModel.onDidChangeContent((e) => {
        if (!e.rawEvents.some((event) => event.kind === 10 /* ChangeCellContent */ || event.kind === 1 /* ModelChange */)) {
          return;
        }
        this.research();
      }));
    }
    this.research();
  }
  async research() {
    return this._throttledDelayer.trigger(async () => {
      this._state.change({ isSearching: true }, false);
      await this._research();
      this._state.change({ isSearching: false }, false);
    });
  }
  async _research() {
    this._computePromise?.cancel();
    if (!this._state.isRevealed || !this._notebookEditor.hasModel()) {
      this.set([], false);
      return;
    }
    this._computePromise = createCancelablePromise((token) => this._compute(token));
    const findMatches = await this._computePromise;
    if (!findMatches) {
      this.set([], false);
      return;
    }
    if (findMatches.length === 0) {
      this.set([], false);
      return;
    }
    const findFirstMatchAfterCellIndex = (cellIndex) => {
      const matchAfterSelection = findFirstIdxMonotonousOrArrLen(findMatches.map((match2) => match2.index), (index2) => index2 >= cellIndex);
      this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
    };
    if (this._currentMatch === -1) {
      if (this._notebookEditor.getLength() === 0) {
        this.set(findMatches, false);
        return;
      } else {
        const focus = this._notebookEditor.getFocus().start;
        findFirstMatchAfterCellIndex(focus);
        this.set(findMatches, false);
        return;
      }
    }
    const oldCurrIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
    const oldCurrCell = this._findMatches[oldCurrIndex.index].cell;
    const oldCurrMatchCellIndex = this._notebookEditor.getCellIndex(oldCurrCell);
    if (oldCurrMatchCellIndex < 0) {
      if (this._notebookEditor.getLength() === 0) {
        this.set(findMatches, false);
        return;
      }
      findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
      return;
    }
    const cell = this._notebookEditor.cellAt(oldCurrMatchCellIndex);
    if (cell.cellKind === 1 /* Markup */ && cell.getEditState() === 0 /* Preview */) {
      findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
      return;
    }
    if (!this._findMatchDecorationModel.currentMatchDecorations) {
      findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
      return;
    }
    if (this._findMatchDecorationModel.currentMatchDecorations.kind === "input") {
      const currentMatchDecorationId = this._findMatchDecorationModel.currentMatchDecorations.decorations.find((decoration3) => decoration3.ownerId === cell.handle);
      if (!currentMatchDecorationId) {
        findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
        return;
      }
      const matchAfterSelection = findFirstIdxMonotonousOrArrLen(findMatches, (match2) => match2.index >= oldCurrMatchCellIndex) % findMatches.length;
      if (findMatches[matchAfterSelection].index > oldCurrMatchCellIndex) {
        this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
        return;
      } else {
        let currMatchRangeInEditor = cell.editorAttached && currentMatchDecorationId.decorations[0] ? cell.getCellDecorationRange(currentMatchDecorationId.decorations[0]) : null;
        if (currMatchRangeInEditor === null && oldCurrIndex.remainder < this._findMatches[oldCurrIndex.index].contentMatches.length) {
          currMatchRangeInEditor = this._findMatches[oldCurrIndex.index].getMatch(oldCurrIndex.remainder).range;
        }
        if (currMatchRangeInEditor !== null) {
          const cellMatch = findMatches[matchAfterSelection];
          const matchAfterOldSelection = findFirstIdxMonotonousOrArrLen(cellMatch.contentMatches, (match2) => Range2.compareRangesUsingStarts(match2.range, currMatchRangeInEditor) >= 0);
          this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection) + matchAfterOldSelection);
        } else {
          this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
          return;
        }
      }
    } else {
      const matchAfterSelection = findFirstIdxMonotonousOrArrLen(findMatches.map((match2) => match2.index), (index2) => index2 >= oldCurrMatchCellIndex) % findMatches.length;
      this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
    }
  }
  set(cellFindMatches, autoStart) {
    if (!cellFindMatches || !cellFindMatches.length) {
      this._findMatches = [];
      this._findMatchDecorationModel.setAllFindMatchesDecorations([]);
      this.constructFindMatchesStarts();
      this._currentMatch = -1;
      this._findMatchDecorationModel.clearCurrentFindMatchDecoration();
      this._state.changeMatchInfo(
        this._currentMatch,
        this._findMatches.reduce((p, c) => p + c.length, 0),
        void 0
      );
      return;
    }
    this._findMatches = cellFindMatches;
    this._findMatchDecorationModel.setAllFindMatchesDecorations(cellFindMatches || []);
    this.constructFindMatchesStarts();
    if (autoStart) {
      this._currentMatch = 0;
      this.highlightCurrentFindMatchDecoration(0, 0);
    }
    this._state.changeMatchInfo(
      this._currentMatch,
      this._findMatches.reduce((p, c) => p + c.length, 0),
      void 0
    );
  }
  async _compute(token) {
    if (!this._notebookEditor.hasModel()) {
      return null;
    }
    let ret = null;
    const val = this._state.searchString;
    const wordSeparators2 = this._configurationService.inspect("editor.wordSeparators").value;
    const options3 = {
      regex: this._state.isRegex,
      wholeWord: this._state.wholeWord,
      caseSensitive: this._state.matchCase,
      wordSeparators: wordSeparators2,
      includeMarkupInput: this._state.filters?.markupInput ?? true,
      includeCodeInput: this._state.filters?.codeInput ?? true,
      includeMarkupPreview: !!this._state.filters?.markupPreview,
      includeOutput: !!this._state.filters?.codeOutput,
      findScope: this._state.filters?.findScope
    };
    ret = await this._notebookEditor.find(val, options3, token);
    if (token.isCancellationRequested) {
      return null;
    }
    return ret;
  }
  _updateCurrentMatch(findMatches, currentMatchesPosition) {
    this._currentMatch = currentMatchesPosition % findMatches.length;
    this.set(findMatches, false);
    const nextIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
    this.highlightCurrentFindMatchDecoration(nextIndex.index, nextIndex.remainder);
    this._state.changeMatchInfo(
      this._currentMatch,
      this._findMatches.reduce((p, c) => p + c.length, 0),
      void 0
    );
  }
  _matchesCountBeforeIndex(findMatches, index2) {
    let prevMatchesCount = 0;
    for (let i2 = 0; i2 < index2; i2++) {
      prevMatchesCount += findMatches[i2].length;
    }
    return prevMatchesCount;
  }
  constructFindMatchesStarts() {
    if (this._findMatches && this._findMatches.length) {
      const values = new Uint32Array(this._findMatches.length);
      for (let i2 = 0; i2 < this._findMatches.length; i2++) {
        values[i2] = this._findMatches[i2].length;
      }
      this._findMatchesStarts = new PrefixSumComputer(values);
    } else {
      this._findMatchesStarts = null;
    }
  }
  async highlightCurrentFindMatchDecoration(cellIndex, matchIndex) {
    const cell = this._findMatches[cellIndex].cell;
    const match2 = this._findMatches[cellIndex].getMatch(matchIndex);
    if (matchIndex < this._findMatches[cellIndex].contentMatches.length) {
      return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInCell(cell, match2.range);
    } else {
      return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInWebview(cell, match2.index);
    }
  }
  clear() {
    this._computePromise?.cancel();
    this._throttledDelayer.cancel();
    this.set([], false);
  }
  dispose() {
    this._findMatchDecorationModel.dispose();
    super.dispose();
  }
};

FindModel = __decorateClass([
  __decorateParam(2, IConfigurationService)
], FindModel);
export { CellFindMatchModel, FindModel };
