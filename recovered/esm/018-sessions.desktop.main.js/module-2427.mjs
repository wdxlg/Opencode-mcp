// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/debug/notebookDebugDecorations.ts
import { Disposable } from "./module-0012.mjs";
import { Delayer } from "./module-0036.mjs";
import { CellUri } from "./module-0911.mjs";
import { Range2 } from "./module-0106.mjs";
import { focusedStackFrameColor, topStackFrameColor } from "./module-2426.mjs";
import { runningCellRulerDecorationColor } from "./module-1941.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDebugService } from "./module-1058.mjs";
import { INotebookExecutionStateService } from "./module-1386.mjs";
import { registerNotebookContribution } from "./module-1870.mjs";
import { debugIconBreakpointForeground } from "./module-2425.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/debug/notebookDebugDecorations.ts
var PausedCellDecorationContribution = class extends Disposable {
  constructor(_notebookEditor, _debugService, _notebookExecutionStateService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._debugService = _debugService;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this._currentTopDecorations = [];
    this._currentOtherDecorations = [];
    this._executingCellDecorations = [];
    const delayer5 = this._register(new Delayer(200));
    this._register(_debugService.getModel().onDidChangeCallStack(() => this.updateExecutionDecorations()));
    this._register(_debugService.getViewModel().onDidFocusStackFrame(() => this.updateExecutionDecorations()));
    this._register(_notebookExecutionStateService.onDidChangeExecution((e4) => {
      if (e4.type === 0 /* cell */ && this._notebookEditor.textModel && e4.affectsNotebook(this._notebookEditor.textModel.uri)) {
        delayer5.trigger(() => this.updateExecutionDecorations());
      }
    }));
  }
  static {
    this.id = "workbench.notebook.debug.pausedCellDecorations";
  }
  updateExecutionDecorations() {
    const exes = this._notebookEditor.textModel ? this._notebookExecutionStateService.getCellExecutionsByHandleForNotebook(this._notebookEditor.textModel.uri) : void 0;
    const topFrameCellsAndRanges = [];
    let focusedFrameCellAndRange = void 0;
    const getNotebookCellAndRange = (sf) => {
      const parsed = CellUri.parse(sf.source.uri);
      if (parsed && parsed.notebook.toString() === this._notebookEditor.textModel?.uri.toString()) {
        return { handle: parsed.handle, range: sf.range };
      }
      return void 0;
    };
    for (const session of this._debugService.getModel().getSessions()) {
      for (const thread of session.getAllThreads()) {
        const topFrame = thread.getTopStackFrame();
        if (topFrame) {
          const notebookCellAndRange = getNotebookCellAndRange(topFrame);
          if (notebookCellAndRange) {
            topFrameCellsAndRanges.push(notebookCellAndRange);
            exes?.delete(notebookCellAndRange.handle);
          }
        }
      }
    }
    const focusedFrame = this._debugService.getViewModel().focusedStackFrame;
    if (focusedFrame && focusedFrame.thread.stopped) {
      const thisFocusedFrameCellAndRange = getNotebookCellAndRange(focusedFrame);
      if (thisFocusedFrameCellAndRange && !topFrameCellsAndRanges.some((topFrame) => topFrame.handle === thisFocusedFrameCellAndRange?.handle && Range2.equalsRange(topFrame.range, thisFocusedFrameCellAndRange?.range))) {
        focusedFrameCellAndRange = thisFocusedFrameCellAndRange;
        exes?.delete(focusedFrameCellAndRange.handle);
      }
    }
    this.setTopFrameDecoration(topFrameCellsAndRanges);
    this.setFocusedFrameDecoration(focusedFrameCellAndRange);
    const exeHandles = exes ? Array.from(exes.entries()).filter(([_, exe]) => exe.state === 3 /* Executing */).map(([handle2]) => handle2) : [];
    this.setExecutingCellDecorations(exeHandles);
  }
  setTopFrameDecoration(handlesAndRanges) {
    const newDecorations = handlesAndRanges.map(({ handle: handle2, range: range2 }) => {
      const options3 = {
        overviewRuler: {
          color: topStackFrameColor,
          includeOutput: false,
          modelRanges: [range2],
          position: 7 /* Full */
        }
      };
      return {
        handle: handle2,
        options: options3
      };
    });
    this._currentTopDecorations = this._notebookEditor.deltaCellDecorations(this._currentTopDecorations, newDecorations);
  }
  setFocusedFrameDecoration(focusedFrameCellAndRange) {
    let newDecorations = [];
    if (focusedFrameCellAndRange) {
      const options3 = {
        overviewRuler: {
          color: focusedStackFrameColor,
          includeOutput: false,
          modelRanges: [focusedFrameCellAndRange.range],
          position: 7 /* Full */
        }
      };
      newDecorations = [{
        handle: focusedFrameCellAndRange.handle,
        options: options3
      }];
    }
    this._currentOtherDecorations = this._notebookEditor.deltaCellDecorations(this._currentOtherDecorations, newDecorations);
  }
  setExecutingCellDecorations(handles) {
    const newDecorations = handles.map((handle2) => {
      const options3 = {
        overviewRuler: {
          color: runningCellRulerDecorationColor,
          includeOutput: false,
          modelRanges: [new Range2(0, 0, 0, 0)],
          position: 1 /* Left */
        }
      };
      return {
        handle: handle2,
        options: options3
      };
    });
    this._executingCellDecorations = this._notebookEditor.deltaCellDecorations(this._executingCellDecorations, newDecorations);
  }
};

PausedCellDecorationContribution = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, INotebookExecutionStateService)
], PausedCellDecorationContribution);

registerNotebookContribution(PausedCellDecorationContribution.id, PausedCellDecorationContribution);

var NotebookBreakpointDecorations = class extends Disposable {
  constructor(_notebookEditor, _debugService, _configService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._debugService = _debugService;
    this._configService = _configService;
    this._currentDecorations = [];
    this._register(_debugService.getModel().onDidChangeBreakpoints(() => this.updateDecorations()));
    this._register(_configService.onDidChangeConfiguration((e4) => e4.affectsConfiguration("debug.showBreakpointsInOverviewRuler") && this.updateDecorations()));
  }
  static {
    this.id = "workbench.notebook.debug.notebookBreakpointDecorations";
  }
  updateDecorations() {
    const enabled = this._configService.getValue("debug.showBreakpointsInOverviewRuler");
    const newDecorations = enabled ? this._debugService.getModel().getBreakpoints().map((breakpoint2) => {
      const parsed = CellUri.parse(breakpoint2.uri);
      if (!parsed || parsed.notebook.toString() !== this._notebookEditor.textModel.uri.toString()) {
        return null;
      }
      const options3 = {
        overviewRuler: {
          color: debugIconBreakpointForeground,
          includeOutput: false,
          modelRanges: [new Range2(breakpoint2.lineNumber, 0, breakpoint2.lineNumber, 0)],
          position: 1 /* Left */
        }
      };
      return { handle: parsed.handle, options: options3 };
    }).filter((x) => !!x) : [];
    this._currentDecorations = this._notebookEditor.deltaCellDecorations(this._currentDecorations, newDecorations);
  }
};

NotebookBreakpointDecorations = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, IConfigurationService)
], NotebookBreakpointDecorations);

registerNotebookContribution(NotebookBreakpointDecorations.id, NotebookBreakpointDecorations);
export { PausedCellDecorationContribution, NotebookBreakpointDecorations };
