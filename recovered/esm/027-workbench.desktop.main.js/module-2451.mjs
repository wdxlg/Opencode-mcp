// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/callStackEditorContribution.ts
import { registerColor } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { debugStackframe, debugStackframeFocused } from "./module-1891.mjs";
import { themeColorFromId2 } from "./module-0287.mjs";
import { Range2 } from "./module-0106.mjs";
import { Disposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { distinct } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDebugService } from "./module-1057.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/debug/browser/callStackEditorContribution.ts
var topStackFrameColor = registerColor("editor.stackFrameHighlightBackground", { dark: "#ffff0033", light: "#ffff6673", hcDark: "#ffff0033", hcLight: "#ffff6673" }, localize(14225, null));

var focusedStackFrameColor = registerColor("editor.focusedStackFrameHighlightBackground", { dark: "#7abd7a4d", light: "#cee7ce73", hcDark: "#7abd7a4d", hcLight: "#cee7ce73" }, localize(14224, null));

var stickiness = 1 /* NeverGrowsWhenTypingAtEdges */;

var TOP_STACK_FRAME_MARGIN = {
  description: "top-stack-frame-margin",
  glyphMarginClassName: ThemeIcon.asClassName(debugStackframe),
  glyphMargin: { position: 3 /* Right */ },
  zIndex: 9999,
  stickiness,
  overviewRuler: {
    position: 7 /* Full */,
    color: themeColorFromId2(topStackFrameColor)
  }
};

var FOCUSED_STACK_FRAME_MARGIN = {
  description: "focused-stack-frame-margin",
  glyphMarginClassName: ThemeIcon.asClassName(debugStackframeFocused),
  glyphMargin: { position: 3 /* Right */ },
  zIndex: 9999,
  stickiness,
  overviewRuler: {
    position: 7 /* Full */,
    color: themeColorFromId2(focusedStackFrameColor)
  }
};

var TOP_STACK_FRAME_DECORATION = {
  description: "top-stack-frame-decoration",
  isWholeLine: true,
  className: "debug-top-stack-frame-line",
  stickiness
};

var FOCUSED_STACK_FRAME_DECORATION = {
  description: "focused-stack-frame-decoration",
  isWholeLine: true,
  className: "debug-focused-stack-frame-line",
  stickiness
};

var makeStackFrameColumnDecoration = (noCharactersBefore) => ({
  description: "top-stack-frame-inline-decoration",
  before: {
    content: "\uEB8B",
    inlineClassName: noCharactersBefore ? "debug-top-stack-frame-column start-of-line" : "debug-top-stack-frame-column",
    inlineClassNameAffectsLetterSpacing: true
  }
});

function createDecorationsForStackFrame(stackFrame, isFocusedSession, noCharactersBefore) {
  const result = [];
  const columnUntilEOLRange = new Range2(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, 1073741824 /* MAX_SAFE_SMALL_INTEGER */);
  const range2 = new Range2(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, stackFrame.range.startColumn + 1);
  const topStackFrame = stackFrame.thread.getTopStackFrame();
  if (stackFrame.getId() === topStackFrame?.getId()) {
    if (isFocusedSession) {
      result.push({
        options: TOP_STACK_FRAME_MARGIN,
        range: range2
      });
    }
    result.push({
      options: TOP_STACK_FRAME_DECORATION,
      range: columnUntilEOLRange
    });
    if (stackFrame.range.startColumn > 1) {
      result.push({
        options: makeStackFrameColumnDecoration(noCharactersBefore),
        range: columnUntilEOLRange
      });
    }
  } else {
    if (isFocusedSession) {
      result.push({
        options: FOCUSED_STACK_FRAME_MARGIN,
        range: range2
      });
    }
    result.push({
      options: FOCUSED_STACK_FRAME_DECORATION,
      range: columnUntilEOLRange
    });
  }
  return result;
}

var CallStackEditorContribution = class extends Disposable {
  constructor(editor, debugService, uriIdentityService, logService) {
    super();
    this.editor = editor;
    this.debugService = debugService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this.decorations = this.editor.createDecorationsCollection();
    const setDecorations = () => this.decorations.set(this.createCallStackDecorations());
    this._register(Event2.any(this.debugService.getViewModel().onDidFocusStackFrame, this.debugService.getModel().onDidChangeCallStack)(() => {
      setDecorations();
    }));
    this._register(this.editor.onDidChangeModel((e) => {
      if (e.newModelUrl) {
        setDecorations();
      }
    }));
    setDecorations();
  }
  createCallStackDecorations() {
    const editor = this.editor;
    if (!editor.hasModel()) {
      return [];
    }
    const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
    const decorations = [];
    this.debugService.getModel().getSessions().forEach((s) => {
      const isSessionFocused = s === focusedStackFrame?.thread.session;
      s.getAllThreads().forEach((t2) => {
        if (t2.stopped) {
          const callStack = t2.getCallStack();
          const stackFrames = [];
          if (callStack.length > 0) {
            if (focusedStackFrame && !focusedStackFrame.equals(callStack[0])) {
              stackFrames.push(focusedStackFrame);
            }
            stackFrames.push(callStack[0]);
          }
          stackFrames.forEach((candidateStackFrame) => {
            if (candidateStackFrame && this.uriIdentityService.extUri.isEqual(candidateStackFrame.source.uri, editor.getModel()?.uri)) {
              if (candidateStackFrame.range.startLineNumber > editor.getModel()?.getLineCount() || candidateStackFrame.range.startLineNumber < 1) {
                this.logService.warn(`CallStackEditorContribution: invalid stack frame line number: ${candidateStackFrame.range.startLineNumber}`);
                return;
              }
              const noCharactersBefore = editor.getModel().getLineFirstNonWhitespaceColumn(candidateStackFrame.range.startLineNumber) >= candidateStackFrame.range.startColumn;
              decorations.push(...createDecorationsForStackFrame(candidateStackFrame, isSessionFocused, noCharactersBefore));
            }
          });
        }
      });
    });
    return distinct(decorations, (d) => `${d.options.className} ${d.options.glyphMarginClassName} ${d.range.startLineNumber} ${d.range.startColumn}`);
  }
  dispose() {
    super.dispose();
    this.decorations.clear();
  }
};

CallStackEditorContribution = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, ILogService)
], CallStackEditorContribution);
export { createDecorationsForStackFrame, topStackFrameColor, focusedStackFrameColor, stickiness, TOP_STACK_FRAME_MARGIN, FOCUSED_STACK_FRAME_MARGIN, TOP_STACK_FRAME_DECORATION, FOCUSED_STACK_FRAME_DECORATION, makeStackFrameColumnDecoration, CallStackEditorContribution };
