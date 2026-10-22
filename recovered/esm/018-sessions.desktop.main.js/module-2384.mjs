// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/variablesView.ts
import { $, append } from "./module-0075.mjs";
import { ViewAction, ViewPane } from "./module-1334.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { AbstractExpressionDataSource, AbstractExpressionsRenderer, expressionAndScopeLabelProvider, renderViewTree } from "./module-2374.mjs";
import { DebugExpressionRenderer } from "./module-2383.mjs";
import { WorkbenchAsyncDataTree } from "./module-0636.mjs";
import { CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED, CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED, CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED, CONTEXT_VARIABLES_FOCUSED, IDebugService, VARIABLES_VIEW_ID, WATCH_VIEW_ID } from "./module-1058.mjs";
import { ErrorScope, Expression, Scope, StackFrame, Variable3, VisualizedExpression, getUriForDebugMemory } from "./module-1065.mjs";
import { IMenuService, MenuId, registerAction2 } from "./module-0092.mjs";
import { getContextMenuActions } from "./module-0516.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ADD_TO_WATCH_ID, ADD_TO_WATCH_LABEL, COPY_EVALUATE_PATH_ID, COPY_EVALUATE_PATH_LABEL, COPY_VALUE_ID, COPY_VALUE_LABEL, setDataBreakpointInfoResponse } from "./module-2381.mjs";
import { getContextForVariable } from "./module-1061.mjs";
import { HighlightedLabel } from "./module-0639.mjs";
import { createMatches } from "./module-0453.mjs";
import { localize } from "./module-0001.mjs";
import { toAction } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { toDisposable } from "./module-0012.mjs";
import { IDebugVisualizerService } from "./module-1066.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IViewsService } from "./module-1246.mjs";
import { coalesce } from "./module-0007.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0935.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/debug/browser/variablesView.ts
var $60 = $;

var forgetScopes = true;

var variableInternalContext;

var VariablesView = class extends ViewPane {
  constructor(options3, contextMenuService, debugService, keybindingService, configurationService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, hoverService, menuService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.debugService = debugService;
    this.menuService = menuService;
    this.needsRefresh = false;
    this.savedViewState = /* @__PURE__ */ new Map();
    this.autoExpandedScopes = /* @__PURE__ */ new Set();
    this.updateTreeScheduler = this._register(new RunOnceScheduler(async () => {
      const stackFrame = this.debugService.getViewModel().focusedStackFrame;
      this.needsRefresh = false;
      const input = this.tree.getInput();
      if (input) {
        this.savedViewState.set(input.getId(), this.tree.getViewState());
      }
      if (!stackFrame) {
        await this.tree.setInput(null);
        return;
      }
      const viewState = this.savedViewState.get(stackFrame.getId());
      await this.tree.setInput(stackFrame, viewState);
      const scopes = await stackFrame.getScopes();
      const toExpand = scopes.find((s) => !s.expensive);
      if (toExpand && this.tree.hasNode(toExpand)) {
        this.autoExpandedScopes.add(toExpand.getId());
        await this.tree.expand(toExpand);
      }
    }, 400));
  }
  get treeSelection() {
    return this.tree.getSelection();
  }
  renderBody(container2) {
    super.renderBody(container2);
    this.element.classList.add("debug-pane");
    container2.classList.add("debug-variables");
    const treeContainer = renderViewTree(container2);
    const expressionRenderer = this.instantiationService.createInstance(DebugExpressionRenderer);
    this.tree = this.instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "VariablesView",
      treeContainer,
      new VariablesDelegate(),
      [
        this.instantiationService.createInstance(VariablesRenderer, expressionRenderer),
        this.instantiationService.createInstance(VisualizedVariableRenderer, expressionRenderer),
        new ScopesRenderer(),
        new ScopeErrorRenderer()
      ],
      this.instantiationService.createInstance(VariablesDataSource),
      {
        accessibilityProvider: new VariablesAccessibilityProvider(),
        identityProvider: { getId: (element) => element.getId() },
        keyboardNavigationLabelProvider: expressionAndScopeLabelProvider,
        overrideStyles: this.getLocationBasedColors().listOverrideStyles
      }
    );
    this._register(VisualizedVariableRenderer.rendererOnVisualizationRange(this.debugService.getViewModel(), this.tree));
    this.tree.setInput(this.debugService.getViewModel().focusedStackFrame ?? null);
    CONTEXT_VARIABLES_FOCUSED.bindTo(this.tree.contextKeyService);
    this._register(this.debugService.getViewModel().onDidFocusStackFrame((sf) => {
      if (!this.isBodyVisible()) {
        this.needsRefresh = true;
        return;
      }
      const timeout2 = sf.explicit ? 0 : void 0;
      this.updateTreeScheduler.schedule(timeout2);
    }));
    this._register(this.debugService.getViewModel().onWillUpdateViews(() => {
      const stackFrame = this.debugService.getViewModel().focusedStackFrame;
      if (stackFrame && forgetScopes) {
        stackFrame.forgetScopes();
      }
      forgetScopes = true;
      this.tree.updateChildren();
    }));
    this._register(this.tree);
    this._register(this.tree.onMouseDblClick((e4) => this.onMouseDblClick(e4)));
    this._register(this.tree.onContextMenu(async (e4) => await this.onContextMenu(e4)));
    this._register(this.onDidChangeBodyVisibility((visible) => {
      if (visible && this.needsRefresh) {
        this.updateTreeScheduler.schedule();
      }
    }));
    let horizontalScrolling;
    this._register(this.debugService.getViewModel().onDidSelectExpression((e4) => {
      const variable = e4?.expression;
      if (variable && this.tree.hasNode(variable)) {
        horizontalScrolling = this.tree.options.horizontalScrolling;
        if (horizontalScrolling) {
          this.tree.updateOptions({ horizontalScrolling: false });
        }
        this.tree.rerender(variable);
      } else if (!e4 && horizontalScrolling !== void 0) {
        this.tree.updateOptions({ horizontalScrolling });
        horizontalScrolling = void 0;
      }
    }));
    this._register(this.debugService.getViewModel().onDidEvaluateLazyExpression(async (e4) => {
      if (e4 instanceof Variable3 && this.tree.hasNode(e4)) {
        await this.tree.updateChildren(e4, false, true);
        await this.tree.expand(e4);
      }
    }));
    this._register(this.debugService.onDidEndSession(() => {
      this.savedViewState.clear();
      this.autoExpandedScopes.clear();
    }));
  }
  layoutBody(width2, height) {
    super.layoutBody(height, width2);
    this.tree.layout(width2, height);
  }
  focus() {
    super.focus();
    this.tree.domFocus();
  }
  collapseAll() {
    this.tree.collapseAll();
  }
  onMouseDblClick(e4) {
    if (this.canSetExpressionValue(e4.element)) {
      this.debugService.getViewModel().setSelectedExpression(e4.element, false);
    }
  }
  canSetExpressionValue(e4) {
    const session = this.debugService.getViewModel().focusedSession;
    if (!session) {
      return false;
    }
    if (e4 instanceof VisualizedExpression) {
      return !!e4.treeItem.canEdit;
    }
    if (!session.capabilities?.supportsSetVariable && !session.capabilities?.supportsSetExpression) {
      return false;
    }
    return e4 instanceof Variable3 && !e4.presentationHint?.attributes?.includes("readOnly") && !e4.presentationHint?.lazy;
  }
  async onContextMenu(e4) {
    const element = e4.element;
    if (element instanceof Scope) {
      return this.openContextMenuForScope(e4, element);
    }
    if (!(element instanceof Variable3) || !element.value) {
      return;
    }
    return openContextMenuForVariableTreeElement(this.contextKeyService, this.menuService, this.contextMenuService, MenuId.DebugVariablesContext, e4);
  }
  openContextMenuForScope(e4, scope) {
    const context2 = { scope: { name: scope.name } };
    const menu = this.menuService.getMenuActions(MenuId.DebugScopesContext, this.contextKeyService, { arg: context2, shouldForwardArgs: false });
    const { secondary } = getContextMenuActions(menu, "inline");
    this.contextMenuService.showContextMenu({
      getAnchor: () => e4.anchor,
      getActions: () => secondary
    });
  }
};

VariablesView = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IDebugService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IViewDescriptorService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, IHoverService),
  __decorateParam(11, IMenuService)
], VariablesView);

async function openContextMenuForVariableTreeElement(parentContextKeyService, menuService, contextMenuService, menuId, e4) {
  const variable = e4.element;
  if (!(variable instanceof Variable3) || !variable.value) {
    return;
  }
  const contextKeyService = await getContextForVariableMenuWithDataAccess(parentContextKeyService, variable);
  const context2 = getVariablesContext(variable);
  const menu = menuService.getMenuActions(menuId, contextKeyService, { arg: context2, shouldForwardArgs: false });
  const { secondary } = getContextMenuActions(menu, "inline");
  contextMenuService.showContextMenu({
    getAnchor: () => e4.anchor,
    getActions: () => secondary
  });
}

var getVariablesContext = (variable) => ({
  sessionId: variable.getSession()?.getId(),
  container: variable.parent instanceof Expression ? { expression: variable.parent.name } : variable.parent.toDebugProtocolObject(),
  variable: variable.toDebugProtocolObject()
});

async function getContextForVariableMenuWithDataAccess(parentContext, variable) {
  const session = variable.getSession();
  if (!session || !session.capabilities.supportsDataBreakpoints) {
    return getContextForVariableMenuBase(parentContext, variable);
  }
  const contextKeys = [];
  const dataBreakpointInfoResponse2 = await session.dataBreakpointInfo(variable.name, variable.parent.reference);
  const dataBreakpointId = dataBreakpointInfoResponse2?.dataId;
  const dataBreakpointAccessTypes = dataBreakpointInfoResponse2?.accessTypes;
  setDataBreakpointInfoResponse(dataBreakpointInfoResponse2);
  if (!dataBreakpointAccessTypes) {
    contextKeys.push([CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED.key, !!dataBreakpointId]);
  } else {
    for (const accessType of dataBreakpointAccessTypes) {
      switch (accessType) {
        case "read":
          contextKeys.push([CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED.key, !!dataBreakpointId]);
          break;
        case "write":
          contextKeys.push([CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED.key, !!dataBreakpointId]);
          break;
        case "readWrite":
          contextKeys.push([CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED.key, !!dataBreakpointId]);
          break;
      }
    }
  }
  return getContextForVariableMenuBase(parentContext, variable, contextKeys);
}

function getContextForVariableMenuBase(parentContext, variable, additionalContext = []) {
  variableInternalContext = variable;
  return getContextForVariable(parentContext, variable, additionalContext);
}

function isStackFrame(obj) {
  return obj instanceof StackFrame;
}

var VariablesDataSource = class extends AbstractExpressionDataSource {
  hasChildren(element) {
    if (!element) {
      return false;
    }
    if (isStackFrame(element)) {
      return true;
    }
    return element.hasChildren;
  }
  doGetChildren(element) {
    if (isStackFrame(element)) {
      return element.getScopes();
    }
    return element.getChildren();
  }
};

var VariablesDelegate = class {
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    if (element instanceof ErrorScope) {
      return ScopeErrorRenderer.ID;
    }
    if (element instanceof Scope) {
      return ScopesRenderer.ID;
    }
    if (element instanceof VisualizedExpression) {
      return VisualizedVariableRenderer.ID;
    }
    return VariablesRenderer.ID;
  }
};

var ScopesRenderer = class _ScopesRenderer {
  static {
    this.ID = "scope";
  }
  get templateId() {
    return _ScopesRenderer.ID;
  }
  renderTemplate(container2) {
    const name = append(container2, $60(".scope"));
    const label3 = new HighlightedLabel(name);
    return { name, label: label3 };
  }
  renderElement(element, index2, templateData) {
    templateData.label.set(element.element.name, createMatches(element.filterData));
  }
  disposeTemplate(templateData) {
    templateData.label.dispose();
  }
};

var ScopeErrorRenderer = class _ScopeErrorRenderer {
  static {
    this.ID = "scopeError";
  }
  get templateId() {
    return _ScopeErrorRenderer.ID;
  }
  renderTemplate(container2) {
    const wrapper = append(container2, $60(".scope"));
    const error = append(wrapper, $60(".error"));
    return { error };
  }
  renderElement(element, index2, templateData) {
    templateData.error.innerText = element.element.name;
  }
  disposeTemplate() {
  }
};

var VisualizedVariableRenderer = class extends AbstractExpressionsRenderer {
  constructor(expressionRenderer, debugService, contextViewService, hoverService, menuService, contextKeyService) {
    super(debugService, contextViewService, hoverService);
    this.expressionRenderer = expressionRenderer;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
  }
  static {
    this.ID = "viz";
  }
  /**
   * Registers a helper that rerenders the tree when visualization is requested
   * or cancelled./
   */
  static rendererOnVisualizationRange(model, tree) {
    return model.onDidChangeVisualization(({ original }) => {
      if (!tree.hasNode(original)) {
        return;
      }
      const parent = tree.getParentElement(original);
      tree.updateChildren(parent, false, false);
    });
  }
  get templateId() {
    return VisualizedVariableRenderer.ID;
  }
  renderElement(node, index2, data) {
    data.elementDisposable.clear();
    super.renderExpressionElement(node.element, node, data);
  }
  renderExpression(expression, data, highlights) {
    const viz = expression;
    let text2 = viz.name;
    if (viz.value && typeof viz.name === "string") {
      text2 += ":";
    }
    data.label.set(text2, highlights, viz.name);
    data.elementDisposable.add(this.expressionRenderer.renderValue(data.value, viz, {
      showChanged: false,
      maxValueLength: 1024,
      colorize: true,
      session: expression.getSession()
    }));
  }
  getInputBoxOptions(expression) {
    const viz = expression;
    return {
      initialValue: expression.value,
      ariaLabel: localize(14710, null),
      validationOptions: {
        validation: () => viz.errorMessage ? { content: viz.errorMessage } : null
      },
      onFinish: (value2, success) => {
        viz.errorMessage = void 0;
        if (success) {
          viz.edit(value2).then(() => {
            forgetScopes = false;
            this.debugService.getViewModel().updateViews();
          });
        }
      }
    };
  }
  renderActionBar(actionBar3, expression, _data) {
    const viz = expression;
    const contextKeyService = viz.original ? getContextForVariableMenuBase(this.contextKeyService, viz.original) : this.contextKeyService;
    const context2 = viz.original ? getVariablesContext(viz.original) : void 0;
    const menu = this.menuService.getMenuActions(MenuId.DebugVariablesContext, contextKeyService, { arg: context2, shouldForwardArgs: false });
    const { primary } = getContextMenuActions(menu, "inline");
    if (viz.original) {
      const action = toAction({
        id: "debugViz",
        label: localize(14705, null),
        class: ThemeIcon.asClassName(Codicon.eye),
        run: () => this.debugService.getViewModel().setVisualizedExpression(viz.original, void 0)
      });
      action.checked = true;
      primary.push(action);
      actionBar3.domNode.style.display = "initial";
    }
    actionBar3.clear();
    actionBar3.context = context2;
    actionBar3.push(primary, { icon: true, label: false });
  }
};

VisualizedVariableRenderer = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IContextKeyService)
], VisualizedVariableRenderer);

var VariablesRenderer = class extends AbstractExpressionsRenderer {
  constructor(expressionRenderer, menuService, contextKeyService, visualization, contextMenuService, debugService, contextViewService, hoverService) {
    super(debugService, contextViewService, hoverService);
    this.expressionRenderer = expressionRenderer;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.visualization = visualization;
    this.contextMenuService = contextMenuService;
  }
  static {
    this.ID = "variable";
  }
  get templateId() {
    return VariablesRenderer.ID;
  }
  renderExpression(expression, data, highlights) {
    data.elementDisposable.add(this.expressionRenderer.renderVariable(data, expression, {
      highlights,
      showChanged: true
    }));
  }
  renderElement(node, index2, data) {
    data.elementDisposable.clear();
    super.renderExpressionElement(node.element, node, data);
  }
  getInputBoxOptions(expression) {
    const variable = expression;
    return {
      initialValue: expression.value,
      ariaLabel: localize(14710, null),
      validationOptions: {
        validation: () => variable.errorMessage ? { content: variable.errorMessage } : null
      },
      onFinish: (value2, success) => {
        variable.errorMessage = void 0;
        const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
        if (success && variable.value !== value2 && focusedStackFrame) {
          variable.setVariable(value2, focusedStackFrame).then(() => {
            forgetScopes = false;
            this.debugService.getViewModel().updateViews();
          });
        }
      }
    };
  }
  renderActionBar(actionBar3, expression, data) {
    const variable = expression;
    const contextKeyService = getContextForVariableMenuBase(this.contextKeyService, variable);
    const context2 = getVariablesContext(variable);
    const menu = this.menuService.getMenuActions(MenuId.DebugVariablesContext, contextKeyService, { arg: context2, shouldForwardArgs: false });
    const { primary } = getContextMenuActions(menu, "inline");
    actionBar3.clear();
    actionBar3.context = context2;
    actionBar3.push(primary, { icon: true, label: false });
    const cts = new CancellationTokenSource();
    data.elementDisposable.add(toDisposable(() => cts.dispose(true)));
    this.visualization.getApplicableFor(expression, cts.token).then((result) => {
      data.elementDisposable.add(result);
      const originalExpression = expression instanceof VisualizedExpression && expression.original || expression;
      const actions = result.object.map((v2) => toAction({ id: "debugViz", label: v2.name, class: v2.iconClass || "debug-viz-icon", run: this.useVisualizer(v2, originalExpression, cts.token) }));
      if (actions.length === 0) {
      } else if (actions.length === 1) {
        actionBar3.push(actions[0], { icon: true, label: false });
      } else {
        actionBar3.push(toAction({ id: "debugViz", label: localize(14706, null), class: ThemeIcon.asClassName(Codicon.eye), run: () => this.pickVisualizer(actions, originalExpression, data) }), { icon: true, label: false });
      }
    });
  }
  pickVisualizer(actions, expression, data) {
    this.contextMenuService.showContextMenu({
      getAnchor: () => data.actionBar.getContainer(),
      getActions: () => actions
    });
  }
  useVisualizer(viz, expression, token) {
    return async () => {
      const resolved = await viz.resolve(token);
      if (token.isCancellationRequested) {
        return;
      }
      if (resolved.type === 0 /* Command */) {
        viz.execute();
      } else {
        const replacement = await this.visualization.getVisualizedNodeFor(resolved.id, expression);
        if (replacement) {
          this.debugService.getViewModel().setVisualizedExpression(expression, replacement);
        }
      }
    };
  }
};

VariablesRenderer = __decorateClass([
  __decorateParam(1, IMenuService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IDebugVisualizerService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IDebugService),
  __decorateParam(6, IContextViewService),
  __decorateParam(7, IHoverService)
], VariablesRenderer);

var VariablesAccessibilityProvider = class {
  getWidgetAriaLabel() {
    return localize(14708, null);
  }
  getAriaLabel(element) {
    if (element instanceof Scope) {
      return localize(14709, null, element.name);
    }
    if (element instanceof Variable3) {
      return localize(14707, null, element.name, element.value);
    }
    return null;
  }
};

var SET_VARIABLE_ID = "debug.setVariable";

CommandsRegistry.registerCommand({
  id: SET_VARIABLE_ID,
  handler: (accessor) => {
    const debugService = accessor.get(IDebugService);
    debugService.getViewModel().setSelectedExpression(variableInternalContext, false);
  }
});

CommandsRegistry.registerCommand({
  metadata: {
    description: COPY_VALUE_LABEL
  },
  id: COPY_VALUE_ID,
  handler: async (accessor, arg, ctx) => {
    const debugService = accessor.get(IDebugService);
    const clipboardService = accessor.get(IClipboardService);
    let elementContext = "";
    let elements;
    if (!arg) {
      const viewService = accessor.get(IViewsService);
      const focusedView = viewService.getFocusedView();
      let view;
      if (focusedView?.id === WATCH_VIEW_ID) {
        view = viewService.getActiveViewWithId(WATCH_VIEW_ID);
        elementContext = "watch";
      } else if (focusedView?.id === VARIABLES_VIEW_ID) {
        view = viewService.getActiveViewWithId(VARIABLES_VIEW_ID);
        elementContext = "variables";
      }
      if (!view) {
        return;
      }
      elements = view.treeSelection.filter((e4) => e4 instanceof Expression || e4 instanceof Variable3);
    } else if (arg instanceof Variable3 || arg instanceof Expression) {
      elementContext = "watch";
      elements = [arg];
    } else {
      elementContext = "variables";
      elements = variableInternalContext ? [variableInternalContext] : [];
    }
    const stackFrame = debugService.getViewModel().focusedStackFrame;
    const session = debugService.getViewModel().focusedSession;
    if (!stackFrame || !session || elements.length === 0) {
      return;
    }
    const evalContext = session.capabilities.supportsClipboardContext ? "clipboard" : elementContext;
    const toEvaluate = elements.map((element) => element instanceof Variable3 ? element.evaluateName || element.value : element.name);
    try {
      const evaluations = await Promise.all(toEvaluate.map((expr) => session.evaluate(expr, stackFrame.frameId, evalContext)));
      const result = coalesce(evaluations).map((evaluation) => evaluation.body.result);
      if (result.length) {
        clipboardService.writeText(result.join("\n"));
      }
    } catch (e4) {
      const result = elements.map((element) => element.value);
      clipboardService.writeText(result.join("\n"));
    }
  }
});

var VIEW_MEMORY_ID = "workbench.debug.viewlet.action.viewMemory";

var HEX_EDITOR_EXTENSION_ID = "ms-vscode.hexeditor";

var HEX_EDITOR_EDITOR_ID = "hexEditor.hexedit";

CommandsRegistry.registerCommand({
  id: VIEW_MEMORY_ID,
  handler: async (accessor, arg, ctx) => {
    const debugService = accessor.get(IDebugService);
    let sessionId;
    let memoryReference;
    if ("sessionId" in arg) {
      if (!arg.sessionId || !arg.variable.memoryReference) {
        return;
      }
      sessionId = arg.sessionId;
      memoryReference = arg.variable.memoryReference;
    } else {
      if (!arg.memoryReference) {
        return;
      }
      const focused = debugService.getViewModel().focusedSession;
      if (!focused) {
        return;
      }
      sessionId = focused.getId();
      memoryReference = arg.memoryReference;
    }
    const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
    const editorService = accessor.get(IEditorService);
    const notificationService = accessor.get(INotificationService);
    const extensionService = accessor.get(IExtensionService);
    const telemetryService = accessor.get(ITelemetryService);
    const ext = await extensionService.getExtension(HEX_EDITOR_EXTENSION_ID);
    if (ext || await tryInstallHexEditor(extensionsWorkbenchService, notificationService)) {
      telemetryService.publicLog("debug/didViewMemory", {
        debugType: debugService.getModel().getSession(sessionId)?.configuration.type
      });
      await editorService.openEditor({
        resource: getUriForDebugMemory(sessionId, memoryReference),
        options: {
          revealIfOpened: true,
          override: HEX_EDITOR_EDITOR_ID
        }
      }, SIDE_GROUP);
    }
  }
});

async function tryInstallHexEditor(extensionsWorkbenchService, notificationService) {
  try {
    await extensionsWorkbenchService.install(HEX_EDITOR_EXTENSION_ID, {
      justification: localize(14711, null),
      enable: true
    }, 15 /* Notification */);
    return true;
  } catch (error) {
    notificationService.error(error);
    return false;
  }
}

CommandsRegistry.registerCommand({
  metadata: {
    description: COPY_EVALUATE_PATH_LABEL
  },
  id: COPY_EVALUATE_PATH_ID,
  handler: async (accessor, context2) => {
    const clipboardService = accessor.get(IClipboardService);
    if (context2 instanceof Variable3) {
      await clipboardService.writeText(context2.evaluateName);
    } else {
      await clipboardService.writeText(context2.variable.evaluateName);
    }
  }
});

CommandsRegistry.registerCommand({
  metadata: {
    description: ADD_TO_WATCH_LABEL
  },
  id: ADD_TO_WATCH_ID,
  handler: async (accessor, context2) => {
    const debugService = accessor.get(IDebugService);
    debugService.addWatchExpression(context2.variable.evaluateName);
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "variables.collapse",
      viewId: VARIABLES_VIEW_ID,
      title: localize(14704, null),
      f1: false,
      icon: Codicon.collapseAll,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.equals("view", VARIABLES_VIEW_ID)
      }
    });
  }
  runInView(_accessor, view) {
    view.collapseAll();
  }
});
export { openContextMenuForVariableTreeElement, getContextForVariableMenuWithDataAccess, getContextForVariableMenuBase, isStackFrame, tryInstallHexEditor, $60, forgetScopes, variableInternalContext, VariablesView, getVariablesContext, VariablesDataSource, VariablesDelegate, ScopesRenderer, ScopeErrorRenderer, VisualizedVariableRenderer, VariablesRenderer, VariablesAccessibilityProvider, SET_VARIABLE_ID, VIEW_MEMORY_ID, HEX_EDITOR_EXTENSION_ID, HEX_EDITOR_EDITOR_ID };
