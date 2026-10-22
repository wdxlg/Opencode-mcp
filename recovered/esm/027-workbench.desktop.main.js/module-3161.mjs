// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/callStackView.ts
import { $, append } from "./module-0075.mjs";
import { StackFrame, Thread, ThreadAndSessionIds } from "./module-1064.mjs";
import { commonSuffixLength } from "./module-0030.mjs";
import { posix } from "./module-0026.mjs";
import { ViewAction, ViewPane } from "./module-1335.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { localize } from "./module-0001.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { renderViewTree } from "./module-2399.mjs";
import { WorkbenchCompressibleAsyncDataTree } from "./module-0636.mjs";
import { CALLSTACK_VIEW_ID, CONTEXT_CALLSTACK_FOCUSED, CONTEXT_CALLSTACK_ITEM_STOPPED, CONTEXT_CALLSTACK_ITEM_TYPE, CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD, CONTEXT_CALLSTACK_SESSION_IS_ATTACH, CONTEXT_DEBUG_STATE, CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG, CONTEXT_STACK_FRAME_SUPPORTS_RESTART, IDebugService, getStateLabel, isFrameDeemphasized } from "./module-1057.mjs";
import { Event2 } from "./module-0017.mjs";
import { DisposableStore, dispose } from "./module-0012.mjs";
import { IMenuService, MenuId, MenuItemAction, MenuRegistry, SubmenuItemAction, registerAction2 } from "./module-0092.mjs";
import { MenuEntryActionViewItem, SubmenuEntryActionViewItem, getActionBarActions, getContextMenuActions } from "./module-0516.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { isSessionAttach } from "./module-1059.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { callstackViewSession, debugContinue, debugDisconnect, debugPause, debugRestart, debugRestartFrame, debugStepInto, debugStepOut, debugStepOver, debugStop } from "./module-1891.mjs";
import { HighlightedLabel } from "./module-0639.mjs";
import { ActionBar } from "./module-0477.mjs";
import { CONTINUE_ID, CONTINUE_LABEL, DISCONNECT_ID, DISCONNECT_LABEL, PAUSE_ID, PAUSE_LABEL, RESTART_LABEL, RESTART_SESSION_ID, STEP_INTO_ID, STEP_INTO_LABEL, STEP_OUT_ID, STEP_OUT_LABEL, STEP_OVER_ID, STEP_OVER_LABEL, STOP_ID, STOP_LABEL } from "./module-2406.mjs";
import { createDisconnectMenuItemAction } from "./module-3160.mjs";
import { createMatches } from "./module-0453.mjs";
import { Action } from "./module-0082.mjs";
import { ILabelService } from "./module-0641.mjs";
import { INotificationService } from "./module-0336.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { textLinkForeground } from "./module-0227.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/debug/browser/callStackView.ts
var $103 = $;

function getSessionContext(element) {
  return {
    sessionId: element.getId()
  };
}

function getThreadContext(element) {
  return {
    ...getSessionContext(element.session),
    threadId: element.getId()
  };
}

function getStackFrameContext(element) {
  return {
    ...getThreadContext(element.thread),
    frameId: element.getId(),
    frameName: element.name,
    frameLocation: { range: element.range, source: element.source.raw }
  };
}

function getContext2(element) {
  if (element instanceof StackFrame) {
    return getStackFrameContext(element);
  } else if (element instanceof Thread) {
    return getThreadContext(element);
  } else if (isDebugSession2(element)) {
    return getSessionContext(element);
  } else {
    return void 0;
  }
}

function getContextForContributedActions(element) {
  if (element instanceof StackFrame) {
    if (element.source.inMemory) {
      return element.source.raw.path || element.source.reference || element.source.name;
    }
    return element.source.uri.toString();
  }
  if (element instanceof Thread) {
    return element.threadId;
  }
  if (isDebugSession2(element)) {
    return element.getId();
  }
  return "";
}

function getSpecificSourceName(stackFrame) {
  let callStack = stackFrame.thread.getStaleCallStack();
  callStack = callStack.length > 0 ? callStack : stackFrame.thread.getCallStack();
  const otherSources = callStack.map((sf) => sf.source).filter((s) => s !== stackFrame.source);
  let suffixLength = 0;
  otherSources.forEach((s) => {
    if (s.name === stackFrame.source.name) {
      suffixLength = Math.max(suffixLength, commonSuffixLength(stackFrame.source.uri.path, s.uri.path));
    }
  });
  if (suffixLength === 0) {
    return stackFrame.source.name;
  }
  const from = Math.max(0, stackFrame.source.uri.path.lastIndexOf(posix.sep, stackFrame.source.uri.path.length - suffixLength - 1));
  return (from > 0 ? "..." : "") + stackFrame.source.uri.path.substring(from);
}

async function expandTo(session, tree) {
  if (session.parentSession) {
    await expandTo(session.parentSession, tree);
  }
  await tree.expand(session);
}

var CallStackView = class extends ViewPane {
  constructor(options3, contextMenuService, debugService, keybindingService, instantiationService, viewDescriptorService, configurationService, contextKeyService, openerService, themeService, hoverService, menuService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.options = options3;
    this.debugService = debugService;
    this.menuService = menuService;
    this.needsRefresh = false;
    this.ignoreSelectionChangedEvent = false;
    this.ignoreFocusStackFrameEvent = false;
    this.autoExpandedSessions = /* @__PURE__ */ new Set();
    this.selectionNeedsUpdate = false;
    this.onCallStackChangeScheduler = this._register(new RunOnceScheduler(async () => {
      const sessions = this.debugService.getModel().getSessions();
      if (sessions.length === 0) {
        this.autoExpandedSessions.clear();
      }
      const thread = sessions.length === 1 && sessions[0].getAllThreads().length === 1 ? sessions[0].getAllThreads()[0] : void 0;
      const stoppedDetails = sessions.length === 1 ? sessions[0].getStoppedDetails() : void 0;
      if (stoppedDetails && (thread || typeof stoppedDetails.threadId !== "number")) {
        this.stateMessageLabel.textContent = stoppedDescription(stoppedDetails);
        this.stateMessageLabelHover.update(stoppedText(stoppedDetails));
        this.stateMessageLabel.classList.toggle("exception", stoppedDetails.reason === "exception");
        this.stateMessage.hidden = false;
      } else if (sessions.length === 1 && sessions[0].state === 3 /* Running */) {
        this.stateMessageLabel.textContent = localize(14232, null);
        this.stateMessageLabelHover.update(sessions[0].getLabel());
        this.stateMessageLabel.classList.remove("exception");
        this.stateMessage.hidden = false;
      } else {
        this.stateMessage.hidden = true;
      }
      this.updateActions();
      this.needsRefresh = false;
      await this.tree.updateChildren();
      try {
        const toExpand = /* @__PURE__ */ new Set();
        sessions.forEach((s) => {
          if (s.parentSession && !this.autoExpandedSessions.has(s.parentSession)) {
            toExpand.add(s.parentSession);
          }
        });
        for (const session of toExpand) {
          await expandTo(session, this.tree);
          this.autoExpandedSessions.add(session);
        }
      } catch (e) {
      }
      if (this.selectionNeedsUpdate) {
        this.selectionNeedsUpdate = false;
        await this.updateTreeSelection();
      }
    }, 50));
  }
  renderHeaderTitle(container3) {
    super.renderHeaderTitle(container3, this.options.title);
    this.stateMessage = append(container3, $103("span.call-stack-state-message"));
    this.stateMessage.hidden = true;
    this.stateMessageLabel = append(this.stateMessage, $103("span.label"));
    this.stateMessageLabelHover = this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.stateMessage, ""));
  }
  renderBody(container3) {
    super.renderBody(container3);
    this.element.classList.add("debug-pane");
    container3.classList.add("debug-call-stack");
    const treeContainer = renderViewTree(container3);
    this.dataSource = new CallStackDataSource(this.debugService);
    this.tree = this.instantiationService.createInstance(WorkbenchCompressibleAsyncDataTree, "CallStackView", treeContainer, new CallStackDelegate(), new CallStackCompressionDelegate(this.debugService), [
      this.instantiationService.createInstance(SessionsRenderer),
      this.instantiationService.createInstance(ThreadsRenderer),
      this.instantiationService.createInstance(StackFramesRenderer),
      this.instantiationService.createInstance(ErrorsRenderer),
      new LoadMoreRenderer(),
      new ShowMoreRenderer()
    ], this.dataSource, {
      accessibilityProvider: new CallStackAccessibilityProvider(),
      compressionEnabled: true,
      autoExpandSingleChildren: true,
      identityProvider: {
        getId: (element) => {
          if (typeof element === "string") {
            return element;
          }
          if (element instanceof Array) {
            return `showMore ${element[0].getId()}`;
          }
          return element.getId();
        }
      },
      keyboardNavigationLabelProvider: {
        getKeyboardNavigationLabel: (e) => {
          if (isDebugSession2(e)) {
            return e.getLabel();
          }
          if (e instanceof Thread) {
            return `${e.name} ${e.stateLabel}`;
          }
          if (e instanceof StackFrame || typeof e === "string") {
            return e;
          }
          if (e instanceof ThreadAndSessionIds) {
            return LoadMoreRenderer.LABEL;
          }
          return localize(14237, null);
        },
        getCompressedNodeKeyboardNavigationLabel: (e) => {
          const firstItem = e[0];
          if (isDebugSession2(firstItem)) {
            return firstItem.getLabel();
          }
          return "";
        }
      },
      expandOnlyOnTwistieClick: true,
      overrideStyles: this.getLocationBasedColors().listOverrideStyles
    });
    CONTEXT_CALLSTACK_FOCUSED.bindTo(this.tree.contextKeyService);
    this.tree.setInput(this.debugService.getModel());
    this._register(this.tree);
    this._register(this.tree.onDidOpen(async (e) => {
      if (this.ignoreSelectionChangedEvent) {
        return;
      }
      const focusStackFrame = (stackFrame, thread, session, options3 = {}) => {
        this.ignoreFocusStackFrameEvent = true;
        try {
          this.debugService.focusStackFrame(stackFrame, thread, session, { ...options3, ...{ explicit: true } });
        } finally {
          this.ignoreFocusStackFrameEvent = false;
        }
      };
      const element = e.element;
      if (element instanceof StackFrame) {
        const opts = {
          preserveFocus: e.editorOptions.preserveFocus,
          sideBySide: e.sideBySide,
          pinned: e.editorOptions.pinned
        };
        focusStackFrame(element, element.thread, element.thread.session, opts);
      }
      if (element instanceof Thread) {
        focusStackFrame(void 0, element, element.session);
      }
      if (isDebugSession2(element)) {
        focusStackFrame(void 0, void 0, element);
      }
      if (element instanceof ThreadAndSessionIds) {
        const session = this.debugService.getModel().getSession(element.sessionId);
        const thread = session && session.getThread(element.threadId);
        if (thread) {
          const totalFrames = thread.stoppedDetails?.totalFrames;
          const remainingFramesCount = typeof totalFrames === "number" ? totalFrames - thread.getCallStack().length : void 0;
          await thread.fetchCallStack(remainingFramesCount);
          await this.tree.updateChildren();
        }
      }
      if (element instanceof Array) {
        element.forEach((sf) => this.dataSource.deemphasizedStackFramesToShow.add(sf));
        this.tree.updateChildren();
      }
    }));
    this._register(this.debugService.getModel().onDidChangeCallStack(() => {
      if (!this.isBodyVisible()) {
        this.needsRefresh = true;
        return;
      }
      if (!this.onCallStackChangeScheduler.isScheduled()) {
        this.onCallStackChangeScheduler.schedule();
      }
    }));
    const onFocusChange = Event2.any(this.debugService.getViewModel().onDidFocusStackFrame, this.debugService.getViewModel().onDidFocusSession);
    this._register(onFocusChange(async () => {
      if (this.ignoreFocusStackFrameEvent) {
        return;
      }
      if (!this.isBodyVisible()) {
        this.needsRefresh = true;
        this.selectionNeedsUpdate = true;
        return;
      }
      if (this.onCallStackChangeScheduler.isScheduled()) {
        this.selectionNeedsUpdate = true;
        return;
      }
      await this.updateTreeSelection();
    }));
    this._register(this.tree.onContextMenu((e) => this.onContextMenu(e)));
    if (this.debugService.state === 2 /* Stopped */) {
      this.onCallStackChangeScheduler.schedule(0);
    }
    this._register(this.onDidChangeBodyVisibility((visible) => {
      if (visible && this.needsRefresh) {
        this.onCallStackChangeScheduler.schedule();
      }
    }));
    this._register(this.debugService.onDidNewSession((s) => {
      const sessionListeners = [];
      sessionListeners.push(s.onDidChangeName(() => {
        if (this.tree.hasNode(s)) {
          this.tree.rerender(s);
        }
      }));
      sessionListeners.push(s.onDidEndAdapter(() => dispose(sessionListeners)));
      if (s.parentSession) {
        this.autoExpandedSessions.delete(s.parentSession);
      }
    }));
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.tree.layout(height, width2);
  }
  focus() {
    super.focus();
    this.tree.domFocus();
  }
  collapseAll() {
    this.tree.collapseAll();
  }
  async updateTreeSelection() {
    if (!this.tree || !this.tree.getInput()) {
      return;
    }
    const updateSelectionAndReveal = (element) => {
      this.ignoreSelectionChangedEvent = true;
      try {
        this.tree.setSelection([element]);
        if (this.tree.getRelativeTop(element) === null) {
          this.tree.reveal(element, 0.5);
        } else {
          this.tree.reveal(element);
        }
      } catch (e) {
      } finally {
        this.ignoreSelectionChangedEvent = false;
      }
    };
    const thread = this.debugService.getViewModel().focusedThread;
    const session = this.debugService.getViewModel().focusedSession;
    const stackFrame = this.debugService.getViewModel().focusedStackFrame;
    if (!thread) {
      if (!session) {
        this.tree.setSelection([]);
      } else {
        updateSelectionAndReveal(session);
      }
    } else {
      try {
        await expandTo(thread.session, this.tree);
      } catch (e) {
      }
      try {
        await this.tree.expand(thread);
      } catch (e) {
      }
      const toReveal = stackFrame || session;
      if (toReveal) {
        updateSelectionAndReveal(toReveal);
      }
    }
  }
  onContextMenu(e) {
    const element = e.element;
    let overlay = [];
    if (isDebugSession2(element)) {
      overlay = getSessionContextOverlay(element);
    } else if (element instanceof Thread) {
      overlay = getThreadContextOverlay(element);
    } else if (element instanceof StackFrame) {
      overlay = getStackFrameContextOverlay(element);
    }
    const contextKeyService = this.contextKeyService.createOverlay(overlay);
    const menu = this.menuService.getMenuActions(MenuId.DebugCallStackContext, contextKeyService, { arg: getContextForContributedActions(element), shouldForwardArgs: true });
    const result = getContextMenuActions(menu, "inline");
    this.contextMenuService.showContextMenu({
      getAnchor: () => e.anchor,
      getActions: () => result.secondary,
      getActionsContext: () => getContext2(element)
    });
  }
};

CallStackView = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IDebugService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, IHoverService),
  __decorateParam(11, IMenuService)
], CallStackView);

function getSessionContextOverlay(session) {
  return [
    [CONTEXT_CALLSTACK_ITEM_TYPE.key, "session"],
    [CONTEXT_CALLSTACK_SESSION_IS_ATTACH.key, isSessionAttach(session)],
    [CONTEXT_CALLSTACK_ITEM_STOPPED.key, session.state === 2 /* Stopped */],
    [CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD.key, session.getAllThreads().length === 1]
  ];
}

var SessionsRenderer = class {
  constructor(instantiationService, contextKeyService, hoverService, menuService) {
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.hoverService = hoverService;
    this.menuService = menuService;
  }
  static {
    this.ID = "session";
  }
  get templateId() {
    return SessionsRenderer.ID;
  }
  renderTemplate(container3) {
    const session = append(container3, $103(".session"));
    append(session, $103(ThemeIcon.asCSSSelector(callstackViewSession)));
    const name = append(session, $103(".name"));
    const stateLabel = append(session, $103("span.state.label.monaco-count-badge.long"));
    const templateDisposable = new DisposableStore();
    const label3 = templateDisposable.add(new HighlightedLabel(name));
    const stopActionViewItemDisposables = templateDisposable.add(new DisposableStore());
    const actionBar3 = templateDisposable.add(new ActionBar(session, {
      actionViewItemProvider: (action, options3) => {
        if ((action.id === STOP_ID || action.id === DISCONNECT_ID) && action instanceof MenuItemAction) {
          stopActionViewItemDisposables.clear();
          const item = this.instantiationService.invokeFunction((accessor) => createDisconnectMenuItemAction(action, stopActionViewItemDisposables, accessor, { ...options3, menuAsChild: false }));
          if (item) {
            return item;
          }
        }
        if (action instanceof MenuItemAction) {
          return this.instantiationService.createInstance(MenuEntryActionViewItem, action, { hoverDelegate: options3.hoverDelegate });
        } else if (action instanceof SubmenuItemAction) {
          return this.instantiationService.createInstance(SubmenuEntryActionViewItem, action, { hoverDelegate: options3.hoverDelegate });
        }
        return void 0;
      }
    }));
    const elementDisposable = templateDisposable.add(new DisposableStore());
    return { session, name, stateLabel, label: label3, actionBar: actionBar3, elementDisposable, templateDisposable };
  }
  renderElement(element, _, data) {
    this.doRenderElement(element.element, createMatches(element.filterData), data);
  }
  renderCompressedElements(node, _index, templateData) {
    const lastElement = node.element.elements[node.element.elements.length - 1];
    const matches2 = createMatches(node.filterData);
    this.doRenderElement(lastElement, matches2, templateData);
  }
  doRenderElement(session, matches2, data) {
    const sessionHover = data.elementDisposable.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.session, localize(14233, null)));
    data.label.set(session.getLabel(), matches2);
    const stoppedDetails = session.getStoppedDetails();
    const thread = session.getAllThreads().find((t2) => t2.stopped);
    const contextKeyService = this.contextKeyService.createOverlay(getSessionContextOverlay(session));
    const menu = data.elementDisposable.add(this.menuService.createMenu(MenuId.DebugCallStackContext, contextKeyService));
    const setupActionBar = () => {
      data.actionBar.clear();
      const { primary } = getActionBarActions(menu.getActions({ arg: getContextForContributedActions(session), shouldForwardArgs: true }), "inline");
      data.actionBar.push(primary, { icon: true, label: false });
      data.actionBar.context = getContext2(session);
    };
    data.elementDisposable.add(menu.onDidChange(() => setupActionBar()));
    setupActionBar();
    data.stateLabel.style.display = "";
    if (stoppedDetails) {
      data.stateLabel.textContent = stoppedDescription(stoppedDetails);
      sessionHover.update(`${session.getLabel()}: ${stoppedText(stoppedDetails)}`);
      data.stateLabel.classList.toggle("exception", stoppedDetails.reason === "exception");
    } else if (thread && thread.stoppedDetails) {
      data.stateLabel.textContent = stoppedDescription(thread.stoppedDetails);
      sessionHover.update(`${session.getLabel()}: ${stoppedText(thread.stoppedDetails)}`);
      data.stateLabel.classList.toggle("exception", thread.stoppedDetails.reason === "exception");
    } else {
      data.stateLabel.textContent = localize(14232, null);
      data.stateLabel.classList.remove("exception");
    }
  }
  disposeTemplate(templateData) {
    templateData.templateDisposable.dispose();
  }
  disposeElement(_element, _, templateData) {
    templateData.elementDisposable.clear();
  }
  disposeCompressedElements(node, index2, templateData) {
    templateData.elementDisposable.clear();
  }
};

SessionsRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IHoverService),
  __decorateParam(3, IMenuService)
], SessionsRenderer);

function getThreadContextOverlay(thread) {
  return [
    [CONTEXT_CALLSTACK_ITEM_TYPE.key, "thread"],
    [CONTEXT_CALLSTACK_ITEM_STOPPED.key, thread.stopped]
  ];
}

var ThreadsRenderer = class {
  constructor(contextKeyService, hoverService, menuService) {
    this.contextKeyService = contextKeyService;
    this.hoverService = hoverService;
    this.menuService = menuService;
  }
  static {
    this.ID = "thread";
  }
  get templateId() {
    return ThreadsRenderer.ID;
  }
  renderTemplate(container3) {
    const thread = append(container3, $103(".thread"));
    const name = append(thread, $103(".name"));
    const stateLabel = append(thread, $103("span.state.label.monaco-count-badge.long"));
    const templateDisposable = new DisposableStore();
    const label3 = templateDisposable.add(new HighlightedLabel(name));
    const actionBar3 = templateDisposable.add(new ActionBar(thread));
    const elementDisposable = templateDisposable.add(new DisposableStore());
    return { thread, name, stateLabel, label: label3, actionBar: actionBar3, elementDisposable, templateDisposable };
  }
  renderElement(element, _index, data) {
    const thread = element.element;
    data.elementDisposable.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.thread, thread.name));
    data.label.set(thread.name, createMatches(element.filterData));
    data.stateLabel.textContent = thread.stateLabel;
    data.stateLabel.classList.toggle("exception", thread.stoppedDetails?.reason === "exception");
    const contextKeyService = this.contextKeyService.createOverlay(getThreadContextOverlay(thread));
    const menu = data.elementDisposable.add(this.menuService.createMenu(MenuId.DebugCallStackContext, contextKeyService));
    const setupActionBar = () => {
      data.actionBar.clear();
      const { primary } = getActionBarActions(menu.getActions({ arg: getContextForContributedActions(thread), shouldForwardArgs: true }), "inline");
      data.actionBar.push(primary, { icon: true, label: false });
      data.actionBar.context = getContext2(thread);
    };
    data.elementDisposable.add(menu.onDidChange(() => setupActionBar()));
    setupActionBar();
  }
  renderCompressedElements(_node, _index, _templateData) {
    throw new Error("Method not implemented.");
  }
  disposeElement(_element, _index, templateData) {
    templateData.elementDisposable.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposable.dispose();
  }
};

ThreadsRenderer = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IHoverService),
  __decorateParam(2, IMenuService)
], ThreadsRenderer);

function getStackFrameContextOverlay(stackFrame) {
  return [
    [CONTEXT_CALLSTACK_ITEM_TYPE.key, "stackFrame"],
    [CONTEXT_STACK_FRAME_SUPPORTS_RESTART.key, stackFrame.canRestart]
  ];
}

var StackFramesRenderer = class {
  constructor(hoverService, labelService, notificationService) {
    this.hoverService = hoverService;
    this.labelService = labelService;
    this.notificationService = notificationService;
  }
  static {
    this.ID = "stackFrame";
  }
  get templateId() {
    return StackFramesRenderer.ID;
  }
  renderTemplate(container3) {
    const stackFrame = append(container3, $103(".stack-frame"));
    const labelDiv = append(stackFrame, $103("span.label.expression"));
    const file = append(stackFrame, $103(".file"));
    const fileName = append(file, $103("span.file-name"));
    const wrapper = append(file, $103("span.line-number-wrapper"));
    const lineNumber = append(wrapper, $103("span.line-number.monaco-count-badge"));
    const templateDisposable = new DisposableStore();
    const elementDisposables = new DisposableStore();
    templateDisposable.add(elementDisposables);
    const label3 = templateDisposable.add(new HighlightedLabel(labelDiv));
    const actionBar3 = templateDisposable.add(new ActionBar(stackFrame));
    return { file, fileName, label: label3, lineNumber, stackFrame, actionBar: actionBar3, templateDisposable, elementDisposables };
  }
  renderElement(element, index2, data) {
    const stackFrame = element.element;
    data.stackFrame.classList.toggle("disabled", !stackFrame.source || !stackFrame.source.available || isFrameDeemphasized(stackFrame));
    data.stackFrame.classList.toggle("label", stackFrame.presentationHint === "label");
    const hasActions = !!stackFrame.thread.session.capabilities.supportsRestartFrame && stackFrame.presentationHint !== "label" && stackFrame.presentationHint !== "subtle" && stackFrame.canRestart;
    data.stackFrame.classList.toggle("has-actions", hasActions);
    let title = stackFrame.source.inMemory ? stackFrame.source.uri.path : this.labelService.getUriLabel(stackFrame.source.uri);
    if (stackFrame.source.raw.origin) {
      title += `
${stackFrame.source.raw.origin}`;
    }
    data.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.file, title));
    data.label.set(stackFrame.name, createMatches(element.filterData), stackFrame.name);
    data.fileName.textContent = getSpecificSourceName(stackFrame);
    if (stackFrame.range.startLineNumber !== void 0) {
      data.lineNumber.textContent = `${stackFrame.range.startLineNumber}`;
      if (stackFrame.range.startColumn) {
        data.lineNumber.textContent += `:${stackFrame.range.startColumn}`;
      }
      data.lineNumber.classList.remove("unavailable");
    } else {
      data.lineNumber.classList.add("unavailable");
    }
    data.actionBar.clear();
    if (hasActions) {
      const action = data.elementDisposables.add(new Action("debug.callStack.restartFrame", localize(14231, null), ThemeIcon.asClassName(debugRestartFrame), true, async () => {
        try {
          await stackFrame.restart();
        } catch (e) {
          this.notificationService.error(e);
        }
      }));
      data.actionBar.push(action, { icon: true, label: false });
    }
  }
  renderCompressedElements(node, index2, templateData) {
    throw new Error("Method not implemented.");
  }
  disposeElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposable.dispose();
  }
};

StackFramesRenderer = __decorateClass([
  __decorateParam(0, IHoverService),
  __decorateParam(1, ILabelService),
  __decorateParam(2, INotificationService)
], StackFramesRenderer);

var ErrorsRenderer = class {
  constructor(hoverService) {
    this.hoverService = hoverService;
  }
  static {
    this.ID = "error";
  }
  get templateId() {
    return ErrorsRenderer.ID;
  }
  renderTemplate(container3) {
    const label3 = append(container3, $103(".error"));
    return { label: label3, templateDisposable: new DisposableStore() };
  }
  renderElement(element, index2, data) {
    const error = element.element;
    data.label.textContent = error;
    data.templateDisposable.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.label, error));
  }
  renderCompressedElements(node, index2, templateData) {
    throw new Error("Method not implemented.");
  }
  disposeTemplate(templateData) {
  }
};

ErrorsRenderer = __decorateClass([
  __decorateParam(0, IHoverService)
], ErrorsRenderer);

var LoadMoreRenderer = class _LoadMoreRenderer {
  static {
    this.ID = "loadMore";
  }
  static {
    this.LABEL = localize(14228, null);
  }
  constructor() {
  }
  get templateId() {
    return _LoadMoreRenderer.ID;
  }
  renderTemplate(container3) {
    const label3 = append(container3, $103(".load-all"));
    label3.style.color = asCssVariable(textLinkForeground);
    return { label: label3 };
  }
  renderElement(element, index2, data) {
    data.label.textContent = _LoadMoreRenderer.LABEL;
  }
  renderCompressedElements(node, index2, templateData) {
    throw new Error("Method not implemented.");
  }
  disposeTemplate(templateData) {
  }
};

var ShowMoreRenderer = class _ShowMoreRenderer {
  static {
    this.ID = "showMore";
  }
  constructor() {
  }
  get templateId() {
    return _ShowMoreRenderer.ID;
  }
  renderTemplate(container3) {
    const label3 = append(container3, $103(".show-more"));
    label3.style.color = asCssVariable(textLinkForeground);
    return { label: label3 };
  }
  renderElement(element, index2, data) {
    const stackFrames = element.element;
    if (stackFrames.every((sf) => !!(sf.source && sf.source.origin && sf.source.origin === stackFrames[0].source.origin))) {
      data.label.textContent = localize(14235, null, stackFrames.length, stackFrames[0].source.origin);
    } else {
      data.label.textContent = localize(14236, null, stackFrames.length);
    }
  }
  renderCompressedElements(node, index2, templateData) {
    throw new Error("Method not implemented.");
  }
  disposeTemplate(templateData) {
  }
};

var CallStackDelegate = class {
  getHeight(element) {
    if (element instanceof StackFrame && element.presentationHint === "label") {
      return 16;
    }
    if (element instanceof ThreadAndSessionIds || element instanceof Array) {
      return 16;
    }
    return 22;
  }
  getTemplateId(element) {
    if (isDebugSession2(element)) {
      return SessionsRenderer.ID;
    }
    if (element instanceof Thread) {
      return ThreadsRenderer.ID;
    }
    if (element instanceof StackFrame) {
      return StackFramesRenderer.ID;
    }
    if (typeof element === "string") {
      return ErrorsRenderer.ID;
    }
    if (element instanceof ThreadAndSessionIds) {
      return LoadMoreRenderer.ID;
    }
    return ShowMoreRenderer.ID;
  }
};

function stoppedText(stoppedDetails) {
  return stoppedDetails.text ?? stoppedDescription(stoppedDetails);
}

function stoppedDescription(stoppedDetails) {
  return stoppedDetails.description || (stoppedDetails.reason ? localize(14230, null, stoppedDetails.reason) : localize(14229, null));
}

function isDebugModel(obj) {
  return !!obj && typeof obj.getSessions === "function";
}

function isDebugSession2(obj) {
  return !!obj && typeof obj.getAllThreads === "function";
}

var CallStackDataSource = class {
  constructor(debugService) {
    this.debugService = debugService;
    this.deemphasizedStackFramesToShow = /* @__PURE__ */ new WeakSet();
  }
  hasChildren(element) {
    if (isDebugSession2(element)) {
      const threads = element.getAllThreads();
      return threads.length > 1 || threads.length === 1 && threads[0].stopped || !!this.debugService.getModel().getSessions().find((s) => s.parentSession === element);
    }
    return isDebugModel(element) || element instanceof Thread && element.stopped;
  }
  async getChildren(element) {
    if (isDebugModel(element)) {
      const sessions = element.getSessions();
      if (sessions.length === 0) {
        return Promise.resolve([]);
      }
      if (sessions.length > 1 || this.debugService.getViewModel().isMultiSessionView()) {
        return Promise.resolve(sessions.filter((s) => !s.parentSession));
      }
      const threads = sessions[0].getAllThreads();
      return threads.length === 1 ? this.getThreadChildren(threads[0]) : Promise.resolve(threads);
    } else if (isDebugSession2(element)) {
      const childSessions = this.debugService.getModel().getSessions().filter((s) => s.parentSession === element);
      const threads = element.getAllThreads();
      if (threads.length === 1) {
        const children = await this.getThreadChildren(threads[0]);
        return children.concat(childSessions);
      }
      return Promise.resolve(threads.concat(childSessions));
    } else {
      return this.getThreadChildren(element);
    }
  }
  getThreadChildren(thread) {
    return this.getThreadCallstack(thread).then((children) => {
      const result = [];
      children.forEach((child, index2) => {
        if (child instanceof StackFrame && child.source && isFrameDeemphasized(child)) {
          if (!this.deemphasizedStackFramesToShow.has(child)) {
            if (result.length) {
              const last = result[result.length - 1];
              if (last instanceof Array) {
                last.push(child);
                return;
              }
            }
            const nextChild = index2 < children.length - 1 ? children[index2 + 1] : void 0;
            if (nextChild instanceof StackFrame && nextChild.source && isFrameDeemphasized(nextChild)) {
              result.push([child]);
              return;
            }
          }
        }
        result.push(child);
      });
      return result;
    });
  }
  async getThreadCallstack(thread) {
    let callStack = thread.getCallStack();
    if (!callStack || !callStack.length) {
      await thread.fetchCallStack();
      callStack = thread.getCallStack();
    }
    if (callStack.length === 1 && thread.session.capabilities.supportsDelayedStackTraceLoading && thread.stoppedDetails && thread.stoppedDetails.totalFrames && thread.stoppedDetails.totalFrames > 1) {
      callStack = callStack.concat(thread.getStaleCallStack().slice(1));
    }
    if (thread.stoppedDetails && thread.stoppedDetails.framesErrorMessage) {
      callStack = callStack.concat([thread.stoppedDetails.framesErrorMessage]);
    }
    if (!thread.reachedEndOfCallStack && thread.stoppedDetails) {
      callStack = callStack.concat([new ThreadAndSessionIds(thread.session.getId(), thread.threadId)]);
    }
    return callStack;
  }
};

var CallStackAccessibilityProvider = class {
  getWidgetAriaLabel() {
    return localize(14226, null);
  }
  getWidgetRole() {
    return "treegrid";
  }
  getRole(_element) {
    return "row";
  }
  getAriaLabel(element) {
    if (element instanceof Thread) {
      return localize(14239, null, element.name, element.stateLabel);
    }
    if (element instanceof StackFrame) {
      return localize(14238, null, element.name, element.range.startLineNumber, getSpecificSourceName(element));
    }
    if (isDebugSession2(element)) {
      const thread = element.getAllThreads().find((t2) => t2.stopped);
      const state = thread ? thread.stateLabel : localize(14232, null);
      return localize(14234, null, element.getLabel(), state);
    }
    if (typeof element === "string") {
      return element;
    }
    if (element instanceof Array) {
      return localize(14236, null, element.length);
    }
    return LoadMoreRenderer.LABEL;
  }
};

var CallStackCompressionDelegate = class {
  constructor(debugService) {
    this.debugService = debugService;
  }
  isIncompressible(stat) {
    if (isDebugSession2(stat)) {
      if (stat.compact) {
        return false;
      }
      const sessions = this.debugService.getModel().getSessions();
      if (sessions.some((s) => s.parentSession === stat && s.compact)) {
        return false;
      }
      return true;
    }
    return true;
  }
};

registerAction2(class Collapse extends ViewAction {
  constructor() {
    super({
      id: "callStack.collapse",
      viewId: CALLSTACK_VIEW_ID,
      title: localize(14227, null),
      f1: false,
      icon: Codicon.collapseAll,
      precondition: CONTEXT_DEBUG_STATE.isEqualTo(getStateLabel(2 /* Stopped */)),
      menu: {
        id: MenuId.ViewTitle,
        order: 10,
        group: "navigation",
        when: ContextKeyExpr.equals("view", CALLSTACK_VIEW_ID)
      }
    });
  }
  runInView(_accessor, view) {
    view.collapseAll();
  }
});

function registerCallStackInlineMenuItem(id2, title, icon2, when, order, precondition2) {
  MenuRegistry.appendMenuItem(MenuId.DebugCallStackContext, {
    group: "inline",
    order,
    when,
    command: { id: id2, title, icon: icon2, precondition: precondition2 }
  });
}

var threadOrSessionWithOneThread = ContextKeyExpr.or(CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("thread"), ContextKeyExpr.and(CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("session"), CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD));

registerCallStackInlineMenuItem(PAUSE_ID, PAUSE_LABEL, debugPause, ContextKeyExpr.and(threadOrSessionWithOneThread, CONTEXT_CALLSTACK_ITEM_STOPPED.toNegated()), 10, CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG.toNegated());

registerCallStackInlineMenuItem(CONTINUE_ID, CONTINUE_LABEL, debugContinue, ContextKeyExpr.and(threadOrSessionWithOneThread, CONTEXT_CALLSTACK_ITEM_STOPPED), 10);

registerCallStackInlineMenuItem(STEP_OVER_ID, STEP_OVER_LABEL, debugStepOver, threadOrSessionWithOneThread, 20, CONTEXT_CALLSTACK_ITEM_STOPPED);

registerCallStackInlineMenuItem(STEP_INTO_ID, STEP_INTO_LABEL, debugStepInto, threadOrSessionWithOneThread, 30, CONTEXT_CALLSTACK_ITEM_STOPPED);

registerCallStackInlineMenuItem(STEP_OUT_ID, STEP_OUT_LABEL, debugStepOut, threadOrSessionWithOneThread, 40, CONTEXT_CALLSTACK_ITEM_STOPPED);

registerCallStackInlineMenuItem(RESTART_SESSION_ID, RESTART_LABEL, debugRestart, CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("session"), 50);

registerCallStackInlineMenuItem(STOP_ID, STOP_LABEL, debugStop, ContextKeyExpr.and(CONTEXT_CALLSTACK_SESSION_IS_ATTACH.toNegated(), CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("session")), 60);

registerCallStackInlineMenuItem(DISCONNECT_ID, DISCONNECT_LABEL, debugDisconnect, ContextKeyExpr.and(CONTEXT_CALLSTACK_SESSION_IS_ATTACH, CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("session")), 60);
export { getSessionContext, getThreadContext, getStackFrameContext, getContext2, getContextForContributedActions, getSpecificSourceName, expandTo, getSessionContextOverlay, getThreadContextOverlay, getStackFrameContextOverlay, stoppedText, stoppedDescription, isDebugModel, isDebugSession2, registerCallStackInlineMenuItem, $103, CallStackView, SessionsRenderer, ThreadsRenderer, StackFramesRenderer, ErrorsRenderer, LoadMoreRenderer, ShowMoreRenderer, CallStackDelegate, CallStackDataSource, CallStackAccessibilityProvider, CallStackCompressionDelegate, threadOrSessionWithOneThread };
