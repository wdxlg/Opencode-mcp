// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/find/findMatchDecorationModel.ts
import { Disposable } from "./module-0012.mjs";
import { FindDecorations } from "./module-0591.mjs";
import { overviewRulerFindMatchForeground, overviewRulerSelectionHighlightForeground } from "./module-0229.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/find/findMatchDecorationModel.ts
var FindMatchDecorationModel = class extends Disposable {
  constructor(_notebookEditor, ownerID) {
    super();
    this._notebookEditor = _notebookEditor;
    this.ownerID = ownerID;
    this._allMatchesDecorations = [];
    this._currentMatchCellDecorations = [];
    this._allMatchesCellDecorations = [];
    this._currentMatchDecorations = null;
  }
  get currentMatchDecorations() {
    return this._currentMatchDecorations;
  }
  clearDecorations() {
    this.clearCurrentFindMatchDecoration();
    this.setAllFindMatchesDecorations([]);
  }
  async highlightCurrentFindMatchDecorationInCell(cell, cellRange) {
    this.clearCurrentFindMatchDecoration();
    this._notebookEditor.changeModelDecorations((accessor) => {
      const findMatchesOptions = FindDecorations._CURRENT_FIND_MATCH_DECORATION;
      const decorations = [
        { range: cellRange, options: findMatchesOptions }
      ];
      const deltaDecoration = {
        ownerId: cell.handle,
        decorations
      };
      this._currentMatchDecorations = {
        kind: "input",
        decorations: accessor.deltaDecorations(this._currentMatchDecorations?.kind === "input" ? this._currentMatchDecorations.decorations : [], [deltaDecoration])
      };
    });
    this._currentMatchCellDecorations = this._notebookEditor.deltaCellDecorations(this._currentMatchCellDecorations, [{
      handle: cell.handle,
      options: {
        overviewRuler: {
          color: overviewRulerSelectionHighlightForeground,
          modelRanges: [cellRange],
          includeOutput: false,
          position: 2 /* Center */
        }
      }
    }]);
    return null;
  }
  async highlightCurrentFindMatchDecorationInWebview(cell, index2) {
    this.clearCurrentFindMatchDecoration();
    const offset = await this._notebookEditor.findHighlightCurrent(index2, this.ownerID);
    this._currentMatchDecorations = { kind: "output", index: index2 };
    this._currentMatchCellDecorations = this._notebookEditor.deltaCellDecorations(this._currentMatchCellDecorations, [{
      handle: cell.handle,
      options: {
        overviewRuler: {
          color: overviewRulerSelectionHighlightForeground,
          modelRanges: [],
          includeOutput: true,
          position: 2 /* Center */
        }
      }
    }]);
    return offset;
  }
  clearCurrentFindMatchDecoration() {
    if (this._currentMatchDecorations?.kind === "input") {
      this._notebookEditor.changeModelDecorations((accessor) => {
        accessor.deltaDecorations(this._currentMatchDecorations?.kind === "input" ? this._currentMatchDecorations.decorations : [], []);
        this._currentMatchDecorations = null;
      });
    } else if (this._currentMatchDecorations?.kind === "output") {
      this._notebookEditor.findUnHighlightCurrent(this._currentMatchDecorations.index, this.ownerID);
    }
    this._currentMatchCellDecorations = this._notebookEditor.deltaCellDecorations(this._currentMatchCellDecorations, []);
  }
  setAllFindMatchesDecorations(cellFindMatches) {
    this._notebookEditor.changeModelDecorations((accessor) => {
      const findMatchesOptions = FindDecorations._FIND_MATCH_DECORATION;
      const deltaDecorations = cellFindMatches.map((cellFindMatch) => {
        const newFindMatchesDecorations = new Array(cellFindMatch.contentMatches.length);
        for (let i2 = 0; i2 < cellFindMatch.contentMatches.length; i2++) {
          newFindMatchesDecorations[i2] = {
            range: cellFindMatch.contentMatches[i2].range,
            options: findMatchesOptions
          };
        }
        return { ownerId: cellFindMatch.cell.handle, decorations: newFindMatchesDecorations };
      });
      this._allMatchesDecorations = accessor.deltaDecorations(this._allMatchesDecorations, deltaDecorations);
    });
    this._allMatchesCellDecorations = this._notebookEditor.deltaCellDecorations(this._allMatchesCellDecorations, cellFindMatches.map((cellFindMatch) => {
      return {
        ownerId: cellFindMatch.cell.handle,
        handle: cellFindMatch.cell.handle,
        options: {
          overviewRuler: {
            color: overviewRulerFindMatchForeground,
            modelRanges: cellFindMatch.contentMatches.map((match2) => match2.range),
            includeOutput: cellFindMatch.webviewMatches.length > 0,
            position: 2 /* Center */
          }
        }
      };
    }));
  }
  stopWebviewFind() {
    this._notebookEditor.findStop(this.ownerID);
  }
  dispose() {
    this.clearDecorations();
    super.dispose();
  }
};
export { FindMatchDecorationModel };
