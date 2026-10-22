// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugCommands.ts
import { localize, localize2 } from "./module-0001.mjs";
import { CONTEXT_BREAKPOINTS_FOCUSED, CONTEXT_BREAKPOINT_INPUT_FOCUSED, CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_STATE, CONTEXT_DISASSEMBLY_VIEW_FOCUS, CONTEXT_EXPRESSION_SELECTED, CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_IN_DEBUG_MODE, CONTEXT_IN_DEBUG_REPL, CONTEXT_JUMP_TO_CURSOR_SUPPORTED, CONTEXT_STEP_INTO_TARGETS_SUPPORTED, CONTEXT_VARIABLES_FOCUSED, CONTEXT_WATCH_EXPRESSIONS_FOCUSED, EDITOR_CONTRIBUTION_ID, IDebugService, REPL_VIEW_ID, VIEWLET_ID2, getStateLabel, isFrameDeemphasized } from "./module-1058.mjs";
import { IViewsService } from "./module-1246.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { ITextResourcePropertiesService } from "./module-0204.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IEditorService } from "./module-0935.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { isWeb, isWindows } from "./module-0014.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { showLoadedScriptMenu } from "./module-2378.mjs";
import { resolveChildSession, saveAllBeforeDebugStart } from "./module-1060.mjs";
import { showDebugSessionMenu } from "./module-2380.mjs";
import { deepClone } from "./module-0098.mjs";
import { InputFocusedContext } from "./module-0635.mjs";
import { IListService } from "./module-0636.mjs";
import { List } from "./module-0460.mjs";
import { Breakpoint2, DataBreakpoint2, Expression, FunctionBreakpoint2, Variable3 } from "./module-1065.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { ActiveEditorContext, PanelFocusContext, ResourceContextKey } from "./module-0950.mjs";
import { TEXT_FILE_EDITOR_ID } from "./module-1534.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { openBreakpointSource } from "./module-2379.mjs";
import { IPaneCompositePartService } from "./module-1093.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { getWindowId } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { IExtensionHostDebugService } from "./module-2377.mjs";


// src/vs/workbench/contrib/debug/browser/debugCommands.ts
var ADD_CONFIGURATION_ID = "debug.addConfiguration";

var TOGGLE_INLINE_BREAKPOINT_ID = "editor.debug.action.toggleInlineBreakpoint";

var COPY_STACK_TRACE_ID = "debug.copyStackTrace";

var REVERSE_CONTINUE_ID = "workbench.action.debug.reverseContinue";

var STEP_BACK_ID = "workbench.action.debug.stepBack";

var RESTART_SESSION_ID = "workbench.action.debug.restart";

var TERMINATE_THREAD_ID = "workbench.action.debug.terminateThread";

var STEP_OVER_ID = "workbench.action.debug.stepOver";

var STEP_INTO_ID = "workbench.action.debug.stepInto";

var STEP_INTO_TARGET_ID = "workbench.action.debug.stepIntoTarget";

var STEP_OUT_ID = "workbench.action.debug.stepOut";

var PAUSE_ID = "workbench.action.debug.pause";

var DISCONNECT_ID = "workbench.action.debug.disconnect";

var DISCONNECT_AND_SUSPEND_ID = "workbench.action.debug.disconnectAndSuspend";

var STOP_ID = "workbench.action.debug.stop";

var RESTART_FRAME_ID = "workbench.action.debug.restartFrame";

var CONTINUE_ID = "workbench.action.debug.continue";

var FOCUS_REPL_ID = "workbench.debug.action.focusRepl";

var JUMP_TO_CURSOR_ID = "debug.jumpToCursor";

var FOCUS_SESSION_ID = "workbench.action.debug.focusProcess";

var SELECT_AND_START_ID = "workbench.action.debug.selectandstart";

var SELECT_DEBUG_CONSOLE_ID = "workbench.action.debug.selectDebugConsole";

var SELECT_DEBUG_SESSION_ID = "workbench.action.debug.selectDebugSession";

var DEBUG_START_COMMAND_ID = "workbench.action.debug.start";

var DEBUG_RUN_COMMAND_ID = "workbench.action.debug.run";

var EDIT_EXPRESSION_COMMAND_ID = "debug.renameWatchExpression";

var SET_EXPRESSION_COMMAND_ID = "debug.setWatchExpression";

var REMOVE_EXPRESSION_COMMAND_ID = "debug.removeWatchExpression";

var NEXT_DEBUG_CONSOLE_ID = "workbench.action.debug.nextConsole";

var PREV_DEBUG_CONSOLE_ID = "workbench.action.debug.prevConsole";

var SHOW_LOADED_SCRIPTS_ID = "workbench.action.debug.showLoadedScripts";

var CALLSTACK_TOP_ID = "workbench.action.debug.callStackTop";

var CALLSTACK_BOTTOM_ID = "workbench.action.debug.callStackBottom";

var CALLSTACK_UP_ID = "workbench.action.debug.callStackUp";

var CALLSTACK_DOWN_ID = "workbench.action.debug.callStackDown";

var ADD_TO_WATCH_ID = "debug.addToWatchExpressions";

var COPY_EVALUATE_PATH_ID = "debug.copyEvaluatePath";

var COPY_VALUE_ID = "workbench.debug.viewlet.action.copyValue";

var BREAK_WHEN_VALUE_CHANGES_ID = "debug.breakWhenValueChanges";

var BREAK_WHEN_VALUE_IS_ACCESSED_ID = "debug.breakWhenValueIsAccessed";

var BREAK_WHEN_VALUE_IS_READ_ID = "debug.breakWhenValueIsRead";

var TOGGLE_EXCEPTION_BREAKPOINTS_ID = "debug.toggleExceptionBreakpoints";

var ATTACH_TO_CURRENT_CODE_RENDERER = "debug.attachToCurrentCodeRenderer";

var DEBUG_COMMAND_CATEGORY = localize2(14409, "Debug");

var RESTART_LABEL = localize2(14421, "Restart");

var STEP_OVER_LABEL = localize2(14431, "Step Over");

var STEP_INTO_LABEL = localize2(14428, "Step Into");

var STEP_INTO_TARGET_LABEL = localize2(14429, "Step Into Target");

var STEP_OUT_LABEL = localize2(14430, "Step Out");

var PAUSE_LABEL = localize2(14419, "Pause");

var DISCONNECT_LABEL = localize2(14410, "Disconnect");

var DISCONNECT_AND_SUSPEND_LABEL = localize2(14411, "Disconnect and Suspend");

var STOP_LABEL = localize2(14432, "Stop");

var CONTINUE_LABEL = localize2(14405, "Continue");

var FOCUS_SESSION_LABEL = localize2(14413, "Focus Session");

var SELECT_AND_START_LABEL = localize2(14422, "Select and Start Debugging");

var DEBUG_CONFIGURE_LABEL = localize(14417, null, "launch.json");

var DEBUG_START_LABEL = localize2(14426, "Start Debugging");

var DEBUG_RUN_LABEL = localize2(14427, "Start Without Debugging");

var NEXT_DEBUG_CONSOLE_LABEL = localize2(14415, "Focus Next Debug Console");

var PREV_DEBUG_CONSOLE_LABEL = localize2(14420, "Focus Previous Debug Console");

var OPEN_LOADED_SCRIPTS_LABEL = localize2(14418, "Open Loaded Script...");

var CALLSTACK_TOP_LABEL = localize2(14402, "Navigate to Top of Call Stack");

var CALLSTACK_BOTTOM_LABEL = localize2(14400, "Navigate to Bottom of Call Stack");

var CALLSTACK_UP_LABEL = localize2(14403, "Navigate Up Call Stack");

var CALLSTACK_DOWN_LABEL = localize2(14401, "Navigate Down Call Stack");

var COPY_EVALUATE_PATH_LABEL = localize2(14407, "Copy as Expression");

var COPY_VALUE_LABEL = localize2(14408, "Copy Value");

var COPY_ADDRESS_LABEL = localize2(14406, "Copy Address");

var ADD_TO_WATCH_LABEL = localize2(14398, "Add to Watch");

var SELECT_DEBUG_CONSOLE_LABEL = localize2(14423, "Select Debug Console");

var SELECT_DEBUG_SESSION_LABEL = localize2(14424, "Select Debug Session");

var DEBUG_QUICK_ACCESS_PREFIX = "debug ";

var DEBUG_CONSOLE_QUICK_ACCESS_PREFIX = "debug consoles ";

var dataBreakpointInfoResponse;

function setDataBreakpointInfoResponse(resp) {
  dataBreakpointInfoResponse = resp;
}

function isThreadContext(obj) {
  return obj && typeof obj.sessionId === "string" && typeof obj.threadId === "string";
}

async function getThreadAndRun(accessor, sessionAndThreadId, run) {
  const debugService = accessor.get(IDebugService);
  let thread;
  if (isThreadContext(sessionAndThreadId)) {
    const session = debugService.getModel().getSession(sessionAndThreadId.sessionId);
    if (session) {
      thread = session.getAllThreads().find((t2) => t2.getId() === sessionAndThreadId.threadId);
    }
  } else if (isSessionContext(sessionAndThreadId)) {
    const session = debugService.getModel().getSession(sessionAndThreadId.sessionId);
    if (session) {
      const threads = session.getAllThreads();
      thread = threads.length > 0 ? threads[0] : void 0;
    }
  }
  if (!thread) {
    thread = debugService.getViewModel().focusedThread;
    if (!thread) {
      const focusedSession = debugService.getViewModel().focusedSession;
      const threads = focusedSession ? focusedSession.getAllThreads() : void 0;
      thread = threads && threads.length ? threads[0] : void 0;
    }
  }
  if (thread) {
    await run(thread);
  }
}

function isStackFrameContext(obj) {
  return obj && typeof obj.sessionId === "string" && typeof obj.threadId === "string" && typeof obj.frameId === "string";
}

function getFrame(debugService, context2) {
  if (isStackFrameContext(context2)) {
    const session = debugService.getModel().getSession(context2.sessionId);
    if (session) {
      const thread = session.getAllThreads().find((t2) => t2.getId() === context2.threadId);
      if (thread) {
        return thread.getCallStack().find((sf) => sf.getId() === context2.frameId);
      }
    }
  } else {
    return debugService.getViewModel().focusedStackFrame;
  }
  return void 0;
}

function isSessionContext(obj) {
  return obj && typeof obj.sessionId === "string";
}

async function changeDebugConsoleFocus(accessor, next) {
  const debugService = accessor.get(IDebugService);
  const viewsService = accessor.get(IViewsService);
  const sessions = debugService.getModel().getSessions(true).filter((s) => s.hasSeparateRepl());
  let currSession = debugService.getViewModel().focusedSession;
  let nextIndex = 0;
  if (sessions.length > 0 && currSession) {
    while (currSession && !currSession.hasSeparateRepl()) {
      currSession = currSession.parentSession;
    }
    if (currSession) {
      const currIndex = sessions.indexOf(currSession);
      if (next) {
        nextIndex = currIndex === sessions.length - 1 ? 0 : currIndex + 1;
      } else {
        nextIndex = currIndex === 0 ? sessions.length - 1 : currIndex - 1;
      }
    }
  }
  await debugService.focusStackFrame(void 0, void 0, sessions[nextIndex], { explicit: true });
  if (!viewsService.isViewVisible(REPL_VIEW_ID)) {
    await viewsService.openView(REPL_VIEW_ID, true);
  }
}

async function navigateCallStack(debugService, down) {
  const frame = debugService.getViewModel().focusedStackFrame;
  if (frame) {
    let callStack = frame.thread.getCallStack();
    let index2 = callStack.findIndex((elem) => elem.frameId === frame.frameId);
    let nextVisibleFrame;
    if (down) {
      if (index2 >= callStack.length - 1) {
        if (frame.thread.reachedEndOfCallStack) {
          goToTopOfCallStack(debugService);
          return;
        } else {
          await debugService.getModel().fetchCallstack(frame.thread, 20);
          callStack = frame.thread.getCallStack();
          index2 = callStack.findIndex((elem) => elem.frameId === frame.frameId);
        }
      }
      nextVisibleFrame = findNextVisibleFrame(true, callStack, index2);
    } else {
      if (index2 <= 0) {
        goToBottomOfCallStack(debugService);
        return;
      }
      nextVisibleFrame = findNextVisibleFrame(false, callStack, index2);
    }
    if (nextVisibleFrame) {
      debugService.focusStackFrame(nextVisibleFrame, void 0, void 0, { preserveFocus: false });
    }
  }
}

async function goToBottomOfCallStack(debugService) {
  const thread = debugService.getViewModel().focusedThread;
  if (thread) {
    await debugService.getModel().fetchCallstack(thread);
    const callStack = thread.getCallStack();
    if (callStack.length > 0) {
      const nextVisibleFrame = findNextVisibleFrame(false, callStack, 0);
      if (nextVisibleFrame) {
        debugService.focusStackFrame(nextVisibleFrame, void 0, void 0, { preserveFocus: false });
      }
    }
  }
}

function goToTopOfCallStack(debugService) {
  const thread = debugService.getViewModel().focusedThread;
  if (thread) {
    debugService.focusStackFrame(thread.getTopStackFrame(), void 0, void 0, { preserveFocus: false });
  }
}

function findNextVisibleFrame(down, callStack, startIndex) {
  if (startIndex >= callStack.length) {
    startIndex = callStack.length - 1;
  } else if (startIndex < 0) {
    startIndex = 0;
  }
  let index2 = startIndex;
  let currFrame;
  do {
    if (down) {
      if (index2 === callStack.length - 1) {
        index2 = 0;
      } else {
        index2++;
      }
    } else {
      if (index2 === 0) {
        index2 = callStack.length - 1;
      } else {
        index2--;
      }
    }
    currFrame = callStack[index2];
    if (!isFrameDeemphasized(currFrame)) {
      return currFrame;
    }
  } while (index2 !== startIndex);
  return void 0;
}

CommandsRegistry.registerCommand({
  id: COPY_STACK_TRACE_ID,
  handler: async (accessor, _, context2) => {
    const textResourcePropertiesService = accessor.get(ITextResourcePropertiesService);
    const clipboardService = accessor.get(IClipboardService);
    const debugService = accessor.get(IDebugService);
    const frame = getFrame(debugService, context2);
    if (frame) {
      const eol = textResourcePropertiesService.getEOL(frame.source.uri);
      await clipboardService.writeText(frame.thread.getCallStack().map((sf) => sf.toString()).join(eol));
    }
  }
});

CommandsRegistry.registerCommand({
  id: REVERSE_CONTINUE_ID,
  handler: async (accessor, _, context2) => {
    await getThreadAndRun(accessor, context2, (thread) => thread.reverseContinue());
  }
});

CommandsRegistry.registerCommand({
  id: STEP_BACK_ID,
  handler: async (accessor, _, context2) => {
    const contextKeyService = accessor.get(IContextKeyService);
    if (CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
      await getThreadAndRun(accessor, context2, (thread) => thread.stepBack("instruction"));
    } else {
      await getThreadAndRun(accessor, context2, (thread) => thread.stepBack());
    }
  }
});

CommandsRegistry.registerCommand({
  id: TERMINATE_THREAD_ID,
  handler: async (accessor, _, context2) => {
    await getThreadAndRun(accessor, context2, (thread) => thread.terminate());
  }
});

CommandsRegistry.registerCommand({
  id: JUMP_TO_CURSOR_ID,
  handler: async (accessor) => {
    const debugService = accessor.get(IDebugService);
    const stackFrame = debugService.getViewModel().focusedStackFrame;
    const editorService = accessor.get(IEditorService);
    const activeEditorControl = editorService.activeTextEditorControl;
    const notificationService = accessor.get(INotificationService);
    const quickInputService = accessor.get(IQuickInputService);
    if (stackFrame && isCodeEditor(activeEditorControl) && activeEditorControl.hasModel()) {
      const position2 = activeEditorControl.getPosition();
      const resource = activeEditorControl.getModel().uri;
      const source = stackFrame.thread.session.getSourceForUri(resource);
      if (source) {
        const response = await stackFrame.thread.session.gotoTargets(source.raw, position2.lineNumber, position2.column);
        const targets = response?.body.targets;
        if (targets && targets.length) {
          let id2 = targets[0].id;
          if (targets.length > 1) {
            const picks = targets.map((t2) => ({ label: t2.label, _id: t2.id }));
            const pick = await quickInputService.pick(picks, { placeHolder: localize(14404, null) });
            if (!pick) {
              return;
            }
            id2 = pick._id;
          }
          return await stackFrame.thread.session.goto(stackFrame.thread.threadId, id2).catch((e4) => notificationService.warn(e4));
        }
      }
    }
    return notificationService.warn(localize(14416, null));
  }
});

CommandsRegistry.registerCommand({
  id: CALLSTACK_TOP_ID,
  handler: async (accessor, _, context2) => {
    const debugService = accessor.get(IDebugService);
    goToTopOfCallStack(debugService);
  }
});

CommandsRegistry.registerCommand({
  id: CALLSTACK_BOTTOM_ID,
  handler: async (accessor, _, context2) => {
    const debugService = accessor.get(IDebugService);
    await goToBottomOfCallStack(debugService);
  }
});

CommandsRegistry.registerCommand({
  id: CALLSTACK_UP_ID,
  handler: async (accessor, _, context2) => {
    const debugService = accessor.get(IDebugService);
    navigateCallStack(debugService, false);
  }
});

CommandsRegistry.registerCommand({
  id: CALLSTACK_DOWN_ID,
  handler: async (accessor, _, context2) => {
    const debugService = accessor.get(IDebugService);
    navigateCallStack(debugService, true);
  }
});

MenuRegistry.appendMenuItem(MenuId.EditorContext, {
  command: {
    id: JUMP_TO_CURSOR_ID,
    title: localize(14414, null),
    category: DEBUG_COMMAND_CATEGORY
  },
  when: ContextKeyExpr.and(CONTEXT_JUMP_TO_CURSOR_SUPPORTED, EditorContextKeys.editorTextFocus),
  group: "debug",
  order: 3
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: NEXT_DEBUG_CONSOLE_ID,
  weight: 200 /* WorkbenchContrib */ + 1,
  when: CONTEXT_IN_DEBUG_REPL,
  primary: 2048 /* CtrlCmd */ | 12 /* PageDown */,
  mac: { primary: 1024 /* Shift */ | 2048 /* CtrlCmd */ | 94 /* BracketRight */ },
  handler: async (accessor, _, context2) => {
    changeDebugConsoleFocus(accessor, true);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: PREV_DEBUG_CONSOLE_ID,
  weight: 200 /* WorkbenchContrib */ + 1,
  when: CONTEXT_IN_DEBUG_REPL,
  primary: 2048 /* CtrlCmd */ | 11 /* PageUp */,
  mac: { primary: 1024 /* Shift */ | 2048 /* CtrlCmd */ | 92 /* BracketLeft */ },
  handler: async (accessor, _, context2) => {
    changeDebugConsoleFocus(accessor, false);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: RESTART_SESSION_ID,
  weight: 200 /* WorkbenchContrib */,
  primary: 1024 /* Shift */ | 2048 /* CtrlCmd */ | 63 /* F5 */,
  when: CONTEXT_IN_DEBUG_MODE,
  handler: async (accessor, _, context2) => {
    const debugService = accessor.get(IDebugService);
    const configurationService = accessor.get(IConfigurationService);
    let session;
    if (isSessionContext(context2)) {
      session = debugService.getModel().getSession(context2.sessionId);
    } else {
      session = debugService.getViewModel().focusedSession;
    }
    if (!session) {
      const { launch, name } = debugService.getConfigurationManager().selectedConfiguration;
      await debugService.startDebugging(launch, name, { noDebug: false, startedByUser: true });
    } else {
      const showSubSessions = configurationService.getValue("debug").showSubSessionsInToolBar;
      while (!showSubSessions && session.lifecycleManagedByParent && session.parentSession) {
        session = session.parentSession;
      }
      session.removeReplExpressions();
      await debugService.restartSession(session);
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: STEP_OVER_ID,
  weight: 200 /* WorkbenchContrib */,
  primary: 68 /* F10 */,
  when: CONTEXT_DEBUG_STATE.isEqualTo("stopped"),
  handler: async (accessor, _, context2) => {
    const contextKeyService = accessor.get(IContextKeyService);
    if (CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
      await getThreadAndRun(accessor, context2, (thread) => thread.next("instruction"));
    } else {
      await getThreadAndRun(accessor, context2, (thread) => thread.next());
    }
  }
});

var STEP_INTO_KEYBINDING = isWeb && isWindows ? 512 /* Alt */ | 69 /* F11 */ : 69 /* F11 */;

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: STEP_INTO_ID,
  weight: 200 /* WorkbenchContrib */ + 10,
  // Have a stronger weight to have priority over full screen when debugging
  primary: STEP_INTO_KEYBINDING,
  // Use a more flexible when clause to not allow full screen command to take over when F11 pressed a lot of times
  when: CONTEXT_DEBUG_STATE.notEqualsTo("inactive"),
  handler: async (accessor, _, context2) => {
    const contextKeyService = accessor.get(IContextKeyService);
    if (CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
      await getThreadAndRun(accessor, context2, (thread) => thread.stepIn("instruction"));
    } else {
      await getThreadAndRun(accessor, context2, (thread) => thread.stepIn());
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: STEP_OUT_ID,
  weight: 200 /* WorkbenchContrib */,
  primary: 1024 /* Shift */ | 69 /* F11 */,
  when: CONTEXT_DEBUG_STATE.isEqualTo("stopped"),
  handler: async (accessor, _, context2) => {
    const contextKeyService = accessor.get(IContextKeyService);
    if (CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
      await getThreadAndRun(accessor, context2, (thread) => thread.stepOut("instruction"));
    } else {
      await getThreadAndRun(accessor, context2, (thread) => thread.stepOut());
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: PAUSE_ID,
  weight: 200 /* WorkbenchContrib */ + 2,
  // take priority over focus next part while we are debugging
  primary: 64 /* F6 */,
  when: CONTEXT_DEBUG_STATE.isEqualTo("running"),
  handler: async (accessor, _, context2) => {
    await getThreadAndRun(accessor, context2, (thread) => thread.pause());
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: STEP_INTO_TARGET_ID,
  primary: STEP_INTO_KEYBINDING | 2048 /* CtrlCmd */,
  when: ContextKeyExpr.and(CONTEXT_STEP_INTO_TARGETS_SUPPORTED, CONTEXT_IN_DEBUG_MODE, CONTEXT_DEBUG_STATE.isEqualTo("stopped")),
  weight: 200 /* WorkbenchContrib */,
  handler: async (accessor, _, context2) => {
    const quickInputService = accessor.get(IQuickInputService);
    const debugService = accessor.get(IDebugService);
    const session = debugService.getViewModel().focusedSession;
    const frame = debugService.getViewModel().focusedStackFrame;
    if (!frame || !session) {
      return;
    }
    const editor = await accessor.get(IEditorService).openEditor({
      resource: frame.source.uri,
      options: { revealIfOpened: true }
    });
    let codeEditor;
    if (editor) {
      const ctrl = editor?.getControl();
      if (isCodeEditor(ctrl)) {
        codeEditor = ctrl;
      }
    }
    const disposables = new DisposableStore();
    const qp = disposables.add(quickInputService.createQuickPick());
    qp.busy = true;
    qp.show();
    disposables.add(qp.onDidChangeActive(([item]) => {
      if (codeEditor && item && item.target.line !== void 0) {
        codeEditor.revealLineInCenterIfOutsideViewport(item.target.line);
        codeEditor.setSelection({
          startLineNumber: item.target.line,
          startColumn: item.target.column || 1,
          endLineNumber: item.target.endLine || item.target.line,
          endColumn: item.target.endColumn || item.target.column || 1
        });
      }
    }));
    disposables.add(qp.onDidAccept(() => {
      if (qp.activeItems.length) {
        session.stepIn(frame.thread.threadId, qp.activeItems[0].target.id);
      }
    }));
    disposables.add(qp.onDidHide(() => disposables.dispose()));
    session.stepInTargets(frame.frameId).then((targets) => {
      qp.busy = false;
      if (targets?.length) {
        qp.items = targets?.map((target) => ({ target, label: target.label }));
      } else {
        qp.placeholder = localize(14412, null);
      }
    });
  }
});

async function stopHandler(accessor, _, context2, disconnect, suspend) {
  const debugService = accessor.get(IDebugService);
  let session;
  if (isSessionContext(context2)) {
    session = debugService.getModel().getSession(context2.sessionId);
  } else {
    session = debugService.getViewModel().focusedSession;
  }
  const configurationService = accessor.get(IConfigurationService);
  const showSubSessions = configurationService.getValue("debug").showSubSessionsInToolBar;
  while (!showSubSessions && session && session.lifecycleManagedByParent && session.parentSession) {
    session = session.parentSession;
  }
  await debugService.stopSession(session, disconnect, suspend);
}

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: DISCONNECT_ID,
  weight: 200 /* WorkbenchContrib */,
  primary: 1024 /* Shift */ | 63 /* F5 */,
  when: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_IN_DEBUG_MODE),
  handler: (accessor, _, context2) => stopHandler(accessor, _, context2, true)
});

CommandsRegistry.registerCommand({
  id: DISCONNECT_AND_SUSPEND_ID,
  handler: (accessor, _, context2) => stopHandler(accessor, _, context2, true, true)
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: STOP_ID,
  weight: 200 /* WorkbenchContrib */,
  primary: 1024 /* Shift */ | 63 /* F5 */,
  when: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), CONTEXT_IN_DEBUG_MODE),
  handler: (accessor, _, context2) => stopHandler(accessor, _, context2, false)
});

CommandsRegistry.registerCommand({
  id: RESTART_FRAME_ID,
  handler: async (accessor, _, context2) => {
    const debugService = accessor.get(IDebugService);
    const notificationService = accessor.get(INotificationService);
    const frame = getFrame(debugService, context2);
    if (frame) {
      try {
        await frame.restart();
      } catch (e4) {
        notificationService.error(e4);
      }
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: CONTINUE_ID,
  weight: 200 /* WorkbenchContrib */ + 10,
  // Use a stronger weight to get priority over start debugging F5 shortcut
  primary: 63 /* F5 */,
  when: CONTEXT_DEBUG_STATE.isEqualTo("stopped"),
  handler: async (accessor, _, context2) => {
    await getThreadAndRun(accessor, context2, (thread) => thread.continue());
  }
});

CommandsRegistry.registerCommand({
  id: SHOW_LOADED_SCRIPTS_ID,
  handler: async (accessor) => {
    await showLoadedScriptMenu(accessor);
  }
});

CommandsRegistry.registerCommand({
  id: "debug.startFromConfig",
  handler: async (accessor, config) => {
    const debugService = accessor.get(IDebugService);
    await debugService.startDebugging(void 0, config);
  }
});

CommandsRegistry.registerCommand({
  id: FOCUS_SESSION_ID,
  handler: async (accessor, session) => {
    const debugService = accessor.get(IDebugService);
    const editorService = accessor.get(IEditorService);
    session = resolveChildSession(session, debugService.getModel().getSessions());
    await debugService.focusStackFrame(void 0, void 0, session, { explicit: true });
    const stackFrame = debugService.getViewModel().focusedStackFrame;
    if (stackFrame) {
      await stackFrame.openInEditor(editorService, true);
    }
  }
});

CommandsRegistry.registerCommand({
  id: SELECT_AND_START_ID,
  handler: async (accessor, debugType, debugStartOptions) => {
    const quickInputService = accessor.get(IQuickInputService);
    const debugService = accessor.get(IDebugService);
    if (debugType) {
      const configManager = debugService.getConfigurationManager();
      const dynamicProviders = await configManager.getDynamicProviders();
      for (const provider of dynamicProviders) {
        if (provider.type === debugType) {
          const pick = await provider.pick();
          if (pick) {
            await configManager.selectConfiguration(pick.launch, pick.config.name, pick.config, { type: provider.type });
            debugService.startDebugging(pick.launch, pick.config, { noDebug: debugStartOptions?.noDebug, startedByUser: true });
            return;
          }
        }
      }
    }
    quickInputService.quickAccess.show(DEBUG_QUICK_ACCESS_PREFIX);
  }
});

CommandsRegistry.registerCommand({
  id: SELECT_DEBUG_CONSOLE_ID,
  handler: async (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.quickAccess.show(DEBUG_CONSOLE_QUICK_ACCESS_PREFIX);
  }
});

CommandsRegistry.registerCommand({
  id: SELECT_DEBUG_SESSION_ID,
  handler: async (accessor) => {
    showDebugSessionMenu(accessor, SELECT_AND_START_ID);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: DEBUG_START_COMMAND_ID,
  weight: 200 /* WorkbenchContrib */,
  primary: 63 /* F5 */,
  when: ContextKeyExpr.and(CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_STATE.isEqualTo("inactive")),
  handler: async (accessor, debugStartOptions) => {
    const debugService = accessor.get(IDebugService);
    await saveAllBeforeDebugStart(accessor.get(IConfigurationService), accessor.get(IEditorService));
    const { launch, name, getConfig } = debugService.getConfigurationManager().selectedConfiguration;
    const config = await getConfig();
    const configOrName = config ? Object.assign(deepClone(config), debugStartOptions?.config) : name;
    await debugService.startDebugging(launch, configOrName, { noDebug: debugStartOptions?.noDebug, startedByUser: true }, false);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: DEBUG_RUN_COMMAND_ID,
  weight: 200 /* WorkbenchContrib */,
  primary: 2048 /* CtrlCmd */ | 63 /* F5 */,
  mac: { primary: 256 /* WinCtrl */ | 63 /* F5 */ },
  when: ContextKeyExpr.and(CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_STATE.notEqualsTo(getStateLabel(1 /* Initializing */))),
  handler: async (accessor) => {
    const commandService = accessor.get(ICommandService);
    await commandService.executeCommand(DEBUG_START_COMMAND_ID, { noDebug: true });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "debug.toggleBreakpoint",
  weight: 200 /* WorkbenchContrib */ + 5,
  when: ContextKeyExpr.and(CONTEXT_BREAKPOINTS_FOCUSED, InputFocusedContext.toNegated()),
  primary: 10 /* Space */,
  handler: (accessor) => {
    const listService = accessor.get(IListService);
    const debugService = accessor.get(IDebugService);
    const list2 = listService.lastFocusedList;
    if (list2 instanceof List) {
      const focused = list2.getFocusedElements();
      if (focused && focused.length) {
        debugService.enableOrDisableBreakpoints(!focused[0].enabled, focused[0]);
      }
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "debug.enableOrDisableBreakpoint",
  weight: 200 /* WorkbenchContrib */,
  primary: void 0,
  when: EditorContextKeys.editorTextFocus,
  handler: (accessor) => {
    const debugService = accessor.get(IDebugService);
    const editorService = accessor.get(IEditorService);
    const control = editorService.activeTextEditorControl;
    if (isCodeEditor(control)) {
      const model = control.getModel();
      if (model) {
        const position2 = control.getPosition();
        if (position2) {
          const bps = debugService.getModel().getBreakpoints({ uri: model.uri, lineNumber: position2.lineNumber });
          if (bps.length) {
            debugService.enableOrDisableBreakpoints(!bps[0].enabled, bps[0]);
          }
        }
      }
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: EDIT_EXPRESSION_COMMAND_ID,
  weight: 200 /* WorkbenchContrib */ + 5,
  when: CONTEXT_WATCH_EXPRESSIONS_FOCUSED,
  primary: 60 /* F2 */,
  mac: { primary: 3 /* Enter */ },
  handler: (accessor, expression) => {
    const debugService = accessor.get(IDebugService);
    if (!(expression instanceof Expression)) {
      const listService = accessor.get(IListService);
      const focused = listService.lastFocusedList;
      if (focused) {
        const elements = focused.getFocus();
        if (Array.isArray(elements) && elements[0] instanceof Expression) {
          expression = elements[0];
        }
      }
    }
    if (expression instanceof Expression) {
      debugService.getViewModel().setSelectedExpression(expression, false);
    }
  }
});

CommandsRegistry.registerCommand({
  id: SET_EXPRESSION_COMMAND_ID,
  handler: async (accessor, expression) => {
    const debugService = accessor.get(IDebugService);
    if (expression instanceof Expression || expression instanceof Variable3) {
      debugService.getViewModel().setSelectedExpression(expression, true);
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "debug.setVariable",
  weight: 200 /* WorkbenchContrib */ + 5,
  when: CONTEXT_VARIABLES_FOCUSED,
  primary: 60 /* F2 */,
  mac: { primary: 3 /* Enter */ },
  handler: (accessor) => {
    const listService = accessor.get(IListService);
    const debugService = accessor.get(IDebugService);
    const focused = listService.lastFocusedList;
    if (focused) {
      const elements = focused.getFocus();
      if (Array.isArray(elements) && elements[0] instanceof Variable3) {
        debugService.getViewModel().setSelectedExpression(elements[0], false);
      }
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: REMOVE_EXPRESSION_COMMAND_ID,
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(CONTEXT_WATCH_EXPRESSIONS_FOCUSED, CONTEXT_EXPRESSION_SELECTED.toNegated()),
  primary: 20 /* Delete */,
  mac: { primary: 2048 /* CtrlCmd */ | 1 /* Backspace */ },
  handler: (accessor, expression) => {
    const debugService = accessor.get(IDebugService);
    if (expression instanceof Expression) {
      debugService.removeWatchExpressions(expression.getId());
      return;
    }
    const listService = accessor.get(IListService);
    const focused = listService.lastFocusedList;
    if (focused) {
      let elements = focused.getFocus();
      if (Array.isArray(elements) && elements[0] instanceof Expression) {
        const selection = focused.getSelection();
        if (selection && selection.indexOf(elements[0]) >= 0) {
          elements = selection;
        }
        elements.forEach((e4) => debugService.removeWatchExpressions(e4.getId()));
      }
    }
  }
});

CommandsRegistry.registerCommand({
  id: BREAK_WHEN_VALUE_CHANGES_ID,
  handler: async (accessor) => {
    const debugService = accessor.get(IDebugService);
    if (dataBreakpointInfoResponse) {
      await debugService.addDataBreakpoint({ description: dataBreakpointInfoResponse.description, src: { type: 0 /* Variable */, dataId: dataBreakpointInfoResponse.dataId }, canPersist: !!dataBreakpointInfoResponse.canPersist, accessTypes: dataBreakpointInfoResponse.accessTypes, accessType: "write" });
    }
  }
});

CommandsRegistry.registerCommand({
  id: BREAK_WHEN_VALUE_IS_ACCESSED_ID,
  handler: async (accessor) => {
    const debugService = accessor.get(IDebugService);
    if (dataBreakpointInfoResponse) {
      await debugService.addDataBreakpoint({ description: dataBreakpointInfoResponse.description, src: { type: 0 /* Variable */, dataId: dataBreakpointInfoResponse.dataId }, canPersist: !!dataBreakpointInfoResponse.canPersist, accessTypes: dataBreakpointInfoResponse.accessTypes, accessType: "readWrite" });
    }
  }
});

CommandsRegistry.registerCommand({
  id: BREAK_WHEN_VALUE_IS_READ_ID,
  handler: async (accessor) => {
    const debugService = accessor.get(IDebugService);
    if (dataBreakpointInfoResponse) {
      await debugService.addDataBreakpoint({ description: dataBreakpointInfoResponse.description, src: { type: 0 /* Variable */, dataId: dataBreakpointInfoResponse.dataId }, canPersist: !!dataBreakpointInfoResponse.canPersist, accessTypes: dataBreakpointInfoResponse.accessTypes, accessType: "read" });
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "debug.removeBreakpoint",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(CONTEXT_BREAKPOINTS_FOCUSED, CONTEXT_BREAKPOINT_INPUT_FOCUSED.toNegated()),
  primary: 20 /* Delete */,
  mac: { primary: 2048 /* CtrlCmd */ | 1 /* Backspace */ },
  handler: (accessor) => {
    const listService = accessor.get(IListService);
    const debugService = accessor.get(IDebugService);
    const list2 = listService.lastFocusedList;
    if (list2 instanceof List) {
      const focused = list2.getFocusedElements();
      const element = focused.length ? focused[0] : void 0;
      if (element instanceof Breakpoint2) {
        debugService.removeBreakpoints(element.getId());
      } else if (element instanceof FunctionBreakpoint2) {
        debugService.removeFunctionBreakpoints(element.getId());
      } else if (element instanceof DataBreakpoint2) {
        debugService.removeDataBreakpoints(element.getId());
      }
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "debug.installAdditionalDebuggers",
  weight: 200 /* WorkbenchContrib */,
  when: void 0,
  primary: void 0,
  handler: async (accessor, query) => {
    const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
    let searchFor = `@category:debuggers`;
    if (typeof query === "string") {
      searchFor += ` ${query}`;
    }
    return extensionsWorkbenchService.openSearch(searchFor);
  }
});

registerAction2(class AddConfigurationAction extends Action2 {
  constructor() {
    super({
      id: ADD_CONFIGURATION_ID,
      title: localize2(14396, "Add Configuration..."),
      category: DEBUG_COMMAND_CATEGORY,
      f1: true,
      menu: {
        id: MenuId.EditorContent,
        when: ContextKeyExpr.and(
          ContextKeyExpr.regex(ResourceContextKey.Path.key, /\.vscode[/\\]launch\.json$/),
          ActiveEditorContext.isEqualTo(TEXT_FILE_EDITOR_ID)
        )
      }
    });
  }
  async run(accessor, launchUri) {
    const manager = accessor.get(IDebugService).getConfigurationManager();
    const launch = manager.getLaunches().find((l) => l.uri.toString() === launchUri) || manager.selectedConfiguration.launch;
    if (launch) {
      const { editor, created } = await launch.openConfigFile({ preserveFocus: false });
      if (editor && !created) {
        const codeEditor = editor.getControl();
        if (codeEditor) {
          await codeEditor.getContribution(EDITOR_CONTRIBUTION_ID)?.addLaunchConfiguration();
        }
      }
    }
  }
});

var inlineBreakpointHandler = (accessor) => {
  const debugService = accessor.get(IDebugService);
  const editorService = accessor.get(IEditorService);
  const control = editorService.activeTextEditorControl;
  if (isCodeEditor(control)) {
    const position2 = control.getPosition();
    if (position2 && control.hasModel() && debugService.canSetBreakpointsIn(control.getModel())) {
      const modelUri = control.getModel().uri;
      const breakpointAlreadySet = debugService.getModel().getBreakpoints({ lineNumber: position2.lineNumber, uri: modelUri }).some((bp) => bp.sessionAgnosticData.column === position2.column || !bp.column && position2.column <= 1);
      if (!breakpointAlreadySet) {
        debugService.addBreakpoints(modelUri, [{ lineNumber: position2.lineNumber, column: position2.column > 1 ? position2.column : void 0 }]);
      }
    }
  }
};

KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: 200 /* WorkbenchContrib */,
  primary: 1024 /* Shift */ | 67 /* F9 */,
  when: EditorContextKeys.editorTextFocus,
  id: TOGGLE_INLINE_BREAKPOINT_ID,
  handler: inlineBreakpointHandler
});

MenuRegistry.appendMenuItem(MenuId.EditorContext, {
  command: {
    id: TOGGLE_INLINE_BREAKPOINT_ID,
    title: localize(14397, null),
    category: DEBUG_COMMAND_CATEGORY
  },
  when: ContextKeyExpr.and(
    CONTEXT_IN_DEBUG_MODE,
    PanelFocusContext.toNegated(),
    EditorContextKeys.editorTextFocus,
    ChatContextKeys.inChatSession.toNegated()
  ),
  group: "debug",
  order: 1
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "debug.openBreakpointToSide",
  weight: 200 /* WorkbenchContrib */,
  when: CONTEXT_BREAKPOINTS_FOCUSED,
  primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
  secondary: [512 /* Alt */ | 3 /* Enter */],
  handler: (accessor) => {
    const listService = accessor.get(IListService);
    const list2 = listService.lastFocusedList;
    if (list2 instanceof List) {
      const focus = list2.getFocusedElements();
      if (focus.length && focus[0] instanceof Breakpoint2) {
        return openBreakpointSource(focus[0], true, false, true, accessor.get(IDebugService), accessor.get(IEditorService));
      }
    }
    return void 0;
  }
});

registerAction2(class ToggleExceptionBreakpointsAction extends Action2 {
  constructor() {
    super({
      id: TOGGLE_EXCEPTION_BREAKPOINTS_ID,
      title: localize2(14433, "Toggle Exception Breakpoints"),
      category: DEBUG_COMMAND_CATEGORY,
      f1: true,
      precondition: CONTEXT_DEBUGGERS_AVAILABLE
    });
  }
  async run(accessor) {
    const debugService = accessor.get(IDebugService);
    const quickInputService = accessor.get(IQuickInputService);
    const debugModel = debugService.getModel();
    const session = debugService.getViewModel().focusedSession || debugModel.getSessions()[0];
    const exceptionBreakpoints = session ? debugModel.getExceptionBreakpointsForSession(session.getId()) : debugModel.getExceptionBreakpoints();
    if (exceptionBreakpoints.length === 0) {
      return;
    }
    if (exceptionBreakpoints.length === 1) {
      const breakpoint2 = exceptionBreakpoints[0];
      await debugService.enableOrDisableBreakpoints(!breakpoint2.enabled, breakpoint2);
      return;
    }
    const disposables = new DisposableStore();
    const quickPick = disposables.add(quickInputService.createQuickPick());
    quickPick.placeholder = localize(14425, null);
    quickPick.canSelectMany = true;
    quickPick.matchOnDescription = true;
    quickPick.matchOnDetail = true;
    quickPick.items = exceptionBreakpoints.map((bp) => ({
      label: bp.label,
      description: bp.description,
      picked: bp.enabled,
      breakpoint: bp
    }));
    quickPick.selectedItems = quickPick.items.filter((item) => item.picked);
    disposables.add(quickPick.onDidAccept(() => {
      const selectedItems = quickPick.selectedItems;
      const toEnable = [];
      const toDisable = [];
      for (const bp of exceptionBreakpoints) {
        const isSelected = selectedItems.some((item) => item.breakpoint === bp);
        if (isSelected && !bp.enabled) {
          toEnable.push(bp);
        } else if (!isSelected && bp.enabled) {
          toDisable.push(bp);
        }
      }
      const promises = [];
      for (const bp of toEnable) {
        promises.push(debugService.enableOrDisableBreakpoints(true, bp));
      }
      for (const bp of toDisable) {
        promises.push(debugService.enableOrDisableBreakpoints(false, bp));
      }
      Promise.all(promises).then(() => disposables.dispose());
    }));
    disposables.add(quickPick.onDidHide(() => disposables.dispose()));
    quickPick.show();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "debug.openView",
  weight: 200 /* WorkbenchContrib */,
  when: CONTEXT_DEBUGGERS_AVAILABLE.toNegated(),
  primary: 63 /* F5 */,
  secondary: [2048 /* CtrlCmd */ | 63 /* F5 */],
  handler: async (accessor) => {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    await paneCompositeService.openPaneComposite(VIEWLET_ID2, 0 /* Sidebar */, true);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: ATTACH_TO_CURRENT_CODE_RENDERER,
      title: localize2(14399, "Attach to Current Code Renderer")
    });
  }
  async run(accessor) {
    const env2 = accessor.get(IEnvironmentService);
    if (!env2.isExtensionDevelopment && !env2.extensionTestsLocationURI) {
      throw new Error("Refusing to attach to renderer outside of development context");
    }
    const windowId = getWindowId(mainWindow);
    const extDebugService = accessor.get(IExtensionHostDebugService);
    const result = await extDebugService.attachToCurrentWindowRenderer(windowId);
    return result;
  }
});
export { setDataBreakpointInfoResponse, isThreadContext, getThreadAndRun, isStackFrameContext, getFrame, isSessionContext, changeDebugConsoleFocus, navigateCallStack, goToBottomOfCallStack, goToTopOfCallStack, findNextVisibleFrame, stopHandler, ADD_CONFIGURATION_ID, TOGGLE_INLINE_BREAKPOINT_ID, COPY_STACK_TRACE_ID, REVERSE_CONTINUE_ID, STEP_BACK_ID, RESTART_SESSION_ID, TERMINATE_THREAD_ID, STEP_OVER_ID, STEP_INTO_ID, STEP_INTO_TARGET_ID, STEP_OUT_ID, PAUSE_ID, DISCONNECT_ID, DISCONNECT_AND_SUSPEND_ID, STOP_ID, RESTART_FRAME_ID, CONTINUE_ID, FOCUS_REPL_ID, JUMP_TO_CURSOR_ID, FOCUS_SESSION_ID, SELECT_AND_START_ID, SELECT_DEBUG_CONSOLE_ID, SELECT_DEBUG_SESSION_ID, DEBUG_START_COMMAND_ID, DEBUG_RUN_COMMAND_ID, EDIT_EXPRESSION_COMMAND_ID, SET_EXPRESSION_COMMAND_ID, REMOVE_EXPRESSION_COMMAND_ID, NEXT_DEBUG_CONSOLE_ID, PREV_DEBUG_CONSOLE_ID, SHOW_LOADED_SCRIPTS_ID, CALLSTACK_TOP_ID, CALLSTACK_BOTTOM_ID, CALLSTACK_UP_ID, CALLSTACK_DOWN_ID, ADD_TO_WATCH_ID, COPY_EVALUATE_PATH_ID, COPY_VALUE_ID, BREAK_WHEN_VALUE_CHANGES_ID, BREAK_WHEN_VALUE_IS_ACCESSED_ID, BREAK_WHEN_VALUE_IS_READ_ID, TOGGLE_EXCEPTION_BREAKPOINTS_ID, ATTACH_TO_CURRENT_CODE_RENDERER, DEBUG_COMMAND_CATEGORY, RESTART_LABEL, STEP_OVER_LABEL, STEP_INTO_LABEL, STEP_INTO_TARGET_LABEL, STEP_OUT_LABEL, PAUSE_LABEL, DISCONNECT_LABEL, DISCONNECT_AND_SUSPEND_LABEL, STOP_LABEL, CONTINUE_LABEL, FOCUS_SESSION_LABEL, SELECT_AND_START_LABEL, DEBUG_CONFIGURE_LABEL, DEBUG_START_LABEL, DEBUG_RUN_LABEL, NEXT_DEBUG_CONSOLE_LABEL, PREV_DEBUG_CONSOLE_LABEL, OPEN_LOADED_SCRIPTS_LABEL, CALLSTACK_TOP_LABEL, CALLSTACK_BOTTOM_LABEL, CALLSTACK_UP_LABEL, CALLSTACK_DOWN_LABEL, COPY_EVALUATE_PATH_LABEL, COPY_VALUE_LABEL, COPY_ADDRESS_LABEL, ADD_TO_WATCH_LABEL, SELECT_DEBUG_CONSOLE_LABEL, SELECT_DEBUG_SESSION_LABEL, DEBUG_QUICK_ACCESS_PREFIX, DEBUG_CONSOLE_QUICK_ACCESS_PREFIX, dataBreakpointInfoResponse, STEP_INTO_KEYBINDING, inlineBreakpointHandler };
