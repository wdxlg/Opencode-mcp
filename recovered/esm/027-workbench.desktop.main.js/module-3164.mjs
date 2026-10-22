// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugEditorActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { TOGGLE_BREAKPOINT_ID } from "./module-2406.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { BREAKPOINT_EDITOR_CONTRIBUTION_ID, CONTEXT_CALLSTACK_ITEM_TYPE, CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_STATE, CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED, CONTEXT_DISASSEMBLY_VIEW_FOCUS, CONTEXT_EXCEPTION_WIDGET_VISIBLE, CONTEXT_FOCUSED_STACK_FRAME_HAS_INSTRUCTION_POINTER_REFERENCE, CONTEXT_IN_DEBUG_MODE, CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST, CONTEXT_STEP_INTO_TARGETS_SUPPORTED, EDITOR_CONTRIBUTION_ID, IDebugService, REPL_VIEW_ID, WATCH_VIEW_ID } from "./module-1057.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { IEditorService } from "./module-0934.mjs";
import { DisassemblyView } from "./module-3163.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { EditorAction, registerEditorAction } from "./module-0097.mjs";
import { PanelFocusContext } from "./module-0949.mjs";
import { DisassemblyViewInput } from "./module-1062.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { getEvaluatableExpressionAtPosition } from "./module-1059.mjs";
import { KeyChord } from "./module-0019.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { MessageController } from "./module-0542.mjs";
import { Position } from "./module-0079.mjs";
import { getDomNodePagePosition } from "./module-0075.mjs";
import { toAction } from "./module-0082.mjs";
import { openBreakpointSource } from "./module-2404.mjs";


// src/vs/workbench/contrib/debug/browser/debugEditorActions.ts
var ToggleBreakpointAction = class extends Action2 {
  constructor() {
    super({
      id: TOGGLE_BREAKPOINT_ID,
      title: {
        ...localize2(14461, "Toggle Breakpoint"),
        mnemonicTitle: localize(14454, null)
      },
      category: localize2(14443, "Debug"),
      f1: true,
      precondition: CONTEXT_DEBUGGERS_AVAILABLE,
      keybinding: {
        when: ContextKeyExpr.or(EditorContextKeys.editorTextFocus, CONTEXT_DISASSEMBLY_VIEW_FOCUS),
        primary: 67 /* F9 */,
        weight: 100 /* EditorContrib */
      },
      menu: [{
        id: MenuId.MenubarDebugMenu,
        when: CONTEXT_DEBUGGERS_AVAILABLE,
        group: "4_new_breakpoint",
        order: 1
      }]
    });
  }
  async run(accessor, entry) {
    const editorService = accessor.get(IEditorService);
    const debugService = accessor.get(IDebugService);
    const activePane = editorService.activeEditorPane;
    if (activePane instanceof DisassemblyView) {
      const location2 = entry ? activePane.getAddressAndOffset(entry) : activePane.focusedAddressAndOffset;
      if (location2) {
        const bps = debugService.getModel().getInstructionBreakpoints();
        const toRemove = bps.find((bp) => bp.address === location2.address);
        if (toRemove) {
          debugService.removeInstructionBreakpoints(toRemove.instructionReference, toRemove.offset);
        } else {
          debugService.addInstructionBreakpoint({ instructionReference: location2.reference, offset: location2.offset, address: location2.address, canPersist: false });
        }
      }
      return;
    }
    const codeEditorService = accessor.get(ICodeEditorService);
    const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
    if (editor?.hasModel()) {
      const modelUri = editor.getModel().uri;
      const canSet = debugService.canSetBreakpointsIn(editor.getModel());
      const lineNumbers = [...new Set(editor.getSelections().map((s) => s.getPosition().lineNumber))];
      await Promise.all(lineNumbers.map(async (line) => {
        const bps = debugService.getModel().getBreakpoints({ lineNumber: line, uri: modelUri });
        if (bps.length) {
          await Promise.all(bps.map((bp) => debugService.removeBreakpoints(bp.getId())));
        } else if (canSet) {
          await debugService.addBreakpoints(modelUri, [{ lineNumber: line }]);
        }
      }));
    }
  }
};

var ConditionalBreakpointAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.debug.action.conditionalBreakpoint",
      label: localize2(14442, "Debug: Add Conditional Breakpoint..."),
      precondition: CONTEXT_DEBUGGERS_AVAILABLE,
      menuOpts: {
        menuId: MenuId.MenubarNewBreakpointMenu,
        title: localize(14450, null),
        group: "1_breakpoints",
        order: 1,
        when: CONTEXT_DEBUGGERS_AVAILABLE
      }
    });
  }
  async run(accessor, editor) {
    const debugService = accessor.get(IDebugService);
    const position2 = editor.getPosition();
    if (position2 && editor.hasModel() && debugService.canSetBreakpointsIn(editor.getModel())) {
      editor.getContribution(BREAKPOINT_EDITOR_CONTRIBUTION_ID)?.showBreakpointWidget(position2.lineNumber, void 0, 0 /* CONDITION */);
    }
  }
};

var LogPointAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.debug.action.addLogPoint",
      label: localize2(14449, "Debug: Add Logpoint..."),
      precondition: CONTEXT_DEBUGGERS_AVAILABLE,
      menuOpts: [
        {
          menuId: MenuId.MenubarNewBreakpointMenu,
          title: localize(14453, null),
          group: "1_breakpoints",
          order: 4,
          when: CONTEXT_DEBUGGERS_AVAILABLE
        }
      ]
    });
  }
  async run(accessor, editor) {
    const debugService = accessor.get(IDebugService);
    const position2 = editor.getPosition();
    if (position2 && editor.hasModel() && debugService.canSetBreakpointsIn(editor.getModel())) {
      editor.getContribution(BREAKPOINT_EDITOR_CONTRIBUTION_ID)?.showBreakpointWidget(position2.lineNumber, position2.column, 2 /* LOG_MESSAGE */);
    }
  }
};

var TriggerByBreakpointAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.debug.action.triggerByBreakpoint",
      label: localize(14464, null),
      precondition: CONTEXT_DEBUGGERS_AVAILABLE,
      alias: "Debug: Triggered Breakpoint...",
      menuOpts: [
        {
          menuId: MenuId.MenubarNewBreakpointMenu,
          title: localize(14456, null),
          group: "1_breakpoints",
          order: 4,
          when: CONTEXT_DEBUGGERS_AVAILABLE
        }
      ]
    });
  }
  async run(accessor, editor) {
    const debugService = accessor.get(IDebugService);
    const position2 = editor.getPosition();
    if (position2 && editor.hasModel() && debugService.canSetBreakpointsIn(editor.getModel())) {
      editor.getContribution(BREAKPOINT_EDITOR_CONTRIBUTION_ID)?.showBreakpointWidget(position2.lineNumber, position2.column, 3 /* TRIGGER_POINT */);
    }
  }
};

var EditBreakpointAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.debug.action.editBreakpoint",
      label: localize(14444, null),
      alias: "Debug: Edit Existing Breakpoint",
      precondition: CONTEXT_DEBUGGERS_AVAILABLE,
      menuOpts: {
        menuId: MenuId.MenubarNewBreakpointMenu,
        title: localize(14452, null),
        group: "1_breakpoints",
        order: 1,
        when: CONTEXT_DEBUGGERS_AVAILABLE
      }
    });
  }
  async run(accessor, editor) {
    const debugService = accessor.get(IDebugService);
    const position2 = editor.getPosition();
    const debugModel = debugService.getModel();
    if (!(editor.hasModel() && position2)) {
      return;
    }
    const lineBreakpoints = debugModel.getBreakpoints({ lineNumber: position2.lineNumber });
    if (lineBreakpoints.length === 0) {
      return;
    }
    const breakpointDistances = lineBreakpoints.map((b) => {
      if (!b.column) {
        return position2.column;
      }
      return Math.abs(b.column - position2.column);
    });
    const closestBreakpointIndex = breakpointDistances.indexOf(Math.min(...breakpointDistances));
    const closestBreakpoint = lineBreakpoints[closestBreakpointIndex];
    editor.getContribution(BREAKPOINT_EDITOR_CONTRIBUTION_ID)?.showBreakpointWidget(closestBreakpoint.lineNumber, closestBreakpoint.column);
  }
};

var OpenDisassemblyViewAction = class _OpenDisassemblyViewAction extends Action2 {
  static {
    this.ID = "debug.action.openDisassemblyView";
  }
  constructor() {
    super({
      id: _OpenDisassemblyViewAction.ID,
      title: {
        ...localize2(14457, "Open Disassembly View"),
        mnemonicTitle: localize(14451, null)
      },
      precondition: CONTEXT_FOCUSED_STACK_FRAME_HAS_INSTRUCTION_POINTER_REFERENCE,
      menu: [
        {
          id: MenuId.EditorContext,
          group: "debug",
          order: 5,
          when: ContextKeyExpr.and(CONTEXT_IN_DEBUG_MODE, PanelFocusContext.toNegated(), CONTEXT_DEBUG_STATE.isEqualTo("stopped"), EditorContextKeys.editorTextFocus, CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED, CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST)
        },
        {
          id: MenuId.DebugCallStackContext,
          group: "z_commands",
          order: 50,
          when: ContextKeyExpr.and(CONTEXT_IN_DEBUG_MODE, CONTEXT_DEBUG_STATE.isEqualTo("stopped"), CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("stackFrame"), CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED)
        },
        {
          id: MenuId.CommandPalette,
          when: ContextKeyExpr.and(CONTEXT_IN_DEBUG_MODE, CONTEXT_DEBUG_STATE.isEqualTo("stopped"), CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED)
        }
      ]
    });
  }
  run(accessor) {
    const editorService = accessor.get(IEditorService);
    editorService.openEditor(DisassemblyViewInput.instance, { pinned: true, revealIfOpened: true });
  }
};

var ToggleDisassemblyViewSourceCodeAction = class _ToggleDisassemblyViewSourceCodeAction extends Action2 {
  static {
    this.ID = "debug.action.toggleDisassemblyViewSourceCode";
  }
  static {
    this.configID = "debug.disassemblyView.showSourceCode";
  }
  constructor() {
    super({
      id: _ToggleDisassemblyViewSourceCodeAction.ID,
      title: {
        ...localize2(14462, "Toggle Source Code in Disassembly View"),
        mnemonicTitle: localize(14455, null)
      },
      metadata: {
        description: localize2(14463, "Shows or hides source code in disassembly")
      },
      f1: true
    });
  }
  run(accessor, editor, ...args2) {
    const configService = accessor.get(IConfigurationService);
    if (configService) {
      const value2 = configService.getValue("debug").disassemblyView.showSourceCode;
      configService.updateValue(_ToggleDisassemblyViewSourceCodeAction.configID, !value2);
    }
  }
};

var RunToCursorAction = class _RunToCursorAction extends EditorAction {
  static {
    this.ID = "editor.debug.action.runToCursor";
  }
  static {
    this.LABEL = localize2(14458, "Run to Cursor");
  }
  constructor() {
    super({
      id: _RunToCursorAction.ID,
      label: _RunToCursorAction.LABEL.value,
      alias: "Debug: Run to Cursor",
      precondition: ContextKeyExpr.and(
        CONTEXT_DEBUGGERS_AVAILABLE,
        PanelFocusContext.toNegated(),
        ContextKeyExpr.or(EditorContextKeys.editorTextFocus, CONTEXT_DISASSEMBLY_VIEW_FOCUS),
        ChatContextKeys.inChatSession.negate()
      ),
      contextMenuOpts: {
        group: "debug",
        order: 2,
        when: CONTEXT_IN_DEBUG_MODE
      }
    });
  }
  async run(accessor, editor) {
    const position2 = editor.getPosition();
    if (!(editor.hasModel() && position2)) {
      return;
    }
    const uri5 = editor.getModel().uri;
    const debugService = accessor.get(IDebugService);
    const viewModel = debugService.getViewModel();
    const uriIdentityService = accessor.get(IUriIdentityService);
    let column = void 0;
    const focusedStackFrame = viewModel.focusedStackFrame;
    if (focusedStackFrame && uriIdentityService.extUri.isEqual(focusedStackFrame.source.uri, uri5) && focusedStackFrame.range.startLineNumber === position2.lineNumber) {
      column = position2.column;
    }
    await debugService.runTo(uri5, position2.lineNumber, column);
  }
};

var SelectionToReplAction = class _SelectionToReplAction extends EditorAction {
  static {
    this.ID = "editor.debug.action.selectionToRepl";
  }
  static {
    this.LABEL = localize2(14446, "Evaluate in Debug Console");
  }
  constructor() {
    super({
      id: _SelectionToReplAction.ID,
      label: _SelectionToReplAction.LABEL.value,
      alias: "Debug: Evaluate in Console",
      precondition: ContextKeyExpr.and(
        CONTEXT_IN_DEBUG_MODE,
        EditorContextKeys.editorTextFocus,
        ChatContextKeys.inChatSession.negate()
      ),
      contextMenuOpts: {
        group: "debug",
        order: 0
      }
    });
  }
  async run(accessor, editor) {
    const debugService = accessor.get(IDebugService);
    const viewsService = accessor.get(IViewsService);
    const viewModel = debugService.getViewModel();
    const session = viewModel.focusedSession;
    if (!editor.hasModel() || !session) {
      return;
    }
    const selection = editor.getSelection();
    let text2;
    if (selection.isEmpty()) {
      text2 = editor.getModel().getLineContent(selection.selectionStartLineNumber).trim();
    } else {
      text2 = editor.getModel().getValueInRange(selection);
    }
    const replView = await viewsService.openView(REPL_VIEW_ID, false);
    replView?.sendReplInput(text2);
  }
};

var SelectionToWatchExpressionsAction = class _SelectionToWatchExpressionsAction extends EditorAction {
  static {
    this.ID = "editor.debug.action.selectionToWatch";
  }
  static {
    this.LABEL = localize2(14440, "Add to Watch");
  }
  constructor() {
    super({
      id: _SelectionToWatchExpressionsAction.ID,
      label: _SelectionToWatchExpressionsAction.LABEL.value,
      alias: "Debug: Add to Watch",
      precondition: ContextKeyExpr.and(
        CONTEXT_IN_DEBUG_MODE,
        EditorContextKeys.editorTextFocus,
        ChatContextKeys.inChatSession.negate()
      ),
      contextMenuOpts: {
        group: "debug",
        order: 1
      }
    });
  }
  async run(accessor, editor) {
    const debugService = accessor.get(IDebugService);
    const viewsService = accessor.get(IViewsService);
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    if (!editor.hasModel()) {
      return;
    }
    let expression = void 0;
    const model = editor.getModel();
    const selection = editor.getSelection();
    if (!selection.isEmpty()) {
      expression = model.getValueInRange(selection);
    } else {
      const position2 = editor.getPosition();
      const evaluatableExpression = await getEvaluatableExpressionAtPosition(languageFeaturesService, model, position2);
      if (!evaluatableExpression) {
        return;
      }
      expression = evaluatableExpression.matchingExpression;
    }
    if (!expression) {
      return;
    }
    await viewsService.openView(WATCH_VIEW_ID);
    debugService.addWatchExpression(expression);
  }
};

var ShowDebugHoverAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.debug.action.showDebugHover",
      label: localize2(14459, "Debug: Show Hover"),
      precondition: CONTEXT_IN_DEBUG_MODE,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 39 /* KeyI */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  async run(accessor, editor) {
    const position2 = editor.getPosition();
    if (!position2 || !editor.hasModel()) {
      return;
    }
    return editor.getContribution(EDITOR_CONTRIBUTION_ID)?.showHover(position2, true);
  }
};

var NO_TARGETS_MESSAGE = localize(14445, null);

var StepIntoTargetsAction = class _StepIntoTargetsAction extends EditorAction {
  static {
    this.ID = "editor.debug.action.stepIntoTargets";
  }
  static {
    this.LABEL = localize(14460, null);
  }
  constructor() {
    super({
      id: _StepIntoTargetsAction.ID,
      label: _StepIntoTargetsAction.LABEL,
      alias: "Debug: Step Into Target",
      precondition: ContextKeyExpr.and(CONTEXT_STEP_INTO_TARGETS_SUPPORTED, CONTEXT_IN_DEBUG_MODE, CONTEXT_DEBUG_STATE.isEqualTo("stopped"), EditorContextKeys.editorTextFocus),
      contextMenuOpts: {
        group: "debug",
        order: 1.5
      }
    });
  }
  async run(accessor, editor) {
    const debugService = accessor.get(IDebugService);
    const contextMenuService = accessor.get(IContextMenuService);
    const uriIdentityService = accessor.get(IUriIdentityService);
    const session = debugService.getViewModel().focusedSession;
    const frame = debugService.getViewModel().focusedStackFrame;
    const selection = editor.getSelection();
    const targetPosition = selection?.getPosition() || frame && { lineNumber: frame.range.startLineNumber, column: frame.range.startColumn };
    if (!session || !frame || !editor.hasModel() || !uriIdentityService.extUri.isEqual(editor.getModel().uri, frame.source.uri)) {
      if (targetPosition) {
        MessageController.get(editor)?.showMessage(NO_TARGETS_MESSAGE, targetPosition);
      }
      return;
    }
    const targets = await session.stepInTargets(frame.frameId);
    if (!targets?.length) {
      MessageController.get(editor)?.showMessage(NO_TARGETS_MESSAGE, targetPosition);
      return;
    }
    if (selection) {
      const positionalTargets = [];
      for (const target of targets) {
        if (target.line) {
          positionalTargets.push({
            start: new Position(target.line, target.column || 1),
            end: target.endLine ? new Position(target.endLine, target.endColumn || 1) : void 0,
            target
          });
        }
      }
      positionalTargets.sort((a, b) => b.start.lineNumber - a.start.lineNumber || b.start.column - a.start.column);
      const needle = selection.getPosition();
      const best = positionalTargets.find((t2) => t2.end && needle.isBefore(t2.end) && t2.start.isBeforeOrEqual(needle)) || positionalTargets.find((t2) => t2.end === void 0 && t2.start.isBeforeOrEqual(needle));
      if (best) {
        session.stepIn(frame.thread.threadId, best.target.id);
        return;
      }
    }
    editor.revealLineInCenterIfOutsideViewport(frame.range.startLineNumber);
    const cursorCoords = editor.getScrolledVisiblePosition(targetPosition);
    const editorCoords = getDomNodePagePosition(editor.getDomNode());
    const x = editorCoords.left + cursorCoords.left;
    const y = editorCoords.top + cursorCoords.top + cursorCoords.height;
    contextMenuService.showContextMenu({
      getAnchor: () => ({ x, y }),
      getActions: () => {
        return targets.map((t2) => toAction({ id: `stepIntoTarget:${t2.id}`, label: t2.label, enabled: true, run: () => session.stepIn(frame.thread.threadId, t2.id) }));
      }
    });
  }
};

var GoToBreakpointAction = class extends EditorAction {
  constructor(isNext, opts) {
    super(opts);
    this.isNext = isNext;
  }
  async run(accessor, editor) {
    const debugService = accessor.get(IDebugService);
    const editorService = accessor.get(IEditorService);
    const uriIdentityService = accessor.get(IUriIdentityService);
    if (editor.hasModel()) {
      const currentUri = editor.getModel().uri;
      const currentLine = editor.getPosition().lineNumber;
      const allEnabledBreakpoints = debugService.getModel().getBreakpoints({ enabledOnly: true });
      let moveBreakpoint = this.isNext ? allEnabledBreakpoints.filter((bp) => uriIdentityService.extUri.isEqual(bp.uri, currentUri) && bp.lineNumber > currentLine).shift() : allEnabledBreakpoints.filter((bp) => uriIdentityService.extUri.isEqual(bp.uri, currentUri) && bp.lineNumber < currentLine).pop();
      if (!moveBreakpoint) {
        moveBreakpoint = this.isNext ? allEnabledBreakpoints.filter((bp) => bp.uri.toString() > currentUri.toString()).shift() : allEnabledBreakpoints.filter((bp) => bp.uri.toString() < currentUri.toString()).pop();
      }
      if (!moveBreakpoint && allEnabledBreakpoints.length) {
        moveBreakpoint = this.isNext ? allEnabledBreakpoints[0] : allEnabledBreakpoints[allEnabledBreakpoints.length - 1];
      }
      if (moveBreakpoint) {
        return openBreakpointSource(moveBreakpoint, false, true, false, debugService, editorService);
      }
    }
  }
};

var GoToNextBreakpointAction = class extends GoToBreakpointAction {
  constructor() {
    super(true, {
      id: "editor.debug.action.goToNextBreakpoint",
      label: localize2(14447, "Debug: Go to Next Breakpoint"),
      precondition: CONTEXT_DEBUGGERS_AVAILABLE
    });
  }
};

var GoToPreviousBreakpointAction = class extends GoToBreakpointAction {
  constructor() {
    super(false, {
      id: "editor.debug.action.goToPreviousBreakpoint",
      label: localize2(14448, "Debug: Go to Previous Breakpoint"),
      precondition: CONTEXT_DEBUGGERS_AVAILABLE
    });
  }
};

var CloseExceptionWidgetAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.debug.action.closeExceptionWidget",
      label: localize2(14441, "Close Exception Widget"),
      precondition: CONTEXT_EXCEPTION_WIDGET_VISIBLE,
      kbOpts: {
        primary: 9 /* Escape */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  async run(_accessor, editor) {
    const contribution = editor.getContribution(EDITOR_CONTRIBUTION_ID);
    contribution?.closeExceptionWidget();
  }
};

registerAction2(OpenDisassemblyViewAction);

registerAction2(ToggleDisassemblyViewSourceCodeAction);

registerAction2(ToggleBreakpointAction);

registerEditorAction(ConditionalBreakpointAction);

registerEditorAction(LogPointAction);

registerEditorAction(TriggerByBreakpointAction);

registerEditorAction(EditBreakpointAction);

registerEditorAction(RunToCursorAction);

registerEditorAction(StepIntoTargetsAction);

registerEditorAction(SelectionToReplAction);

registerEditorAction(SelectionToWatchExpressionsAction);

registerEditorAction(ShowDebugHoverAction);

registerEditorAction(GoToNextBreakpointAction);

registerEditorAction(GoToPreviousBreakpointAction);

registerEditorAction(CloseExceptionWidgetAction);
export { ToggleBreakpointAction, ConditionalBreakpointAction, LogPointAction, TriggerByBreakpointAction, EditBreakpointAction, OpenDisassemblyViewAction, ToggleDisassemblyViewSourceCodeAction, RunToCursorAction, SelectionToReplAction, SelectionToWatchExpressionsAction, ShowDebugHoverAction, NO_TARGETS_MESSAGE, StepIntoTargetsAction, GoToBreakpointAction, GoToNextBreakpointAction, GoToPreviousBreakpointAction, CloseExceptionWidgetAction };
