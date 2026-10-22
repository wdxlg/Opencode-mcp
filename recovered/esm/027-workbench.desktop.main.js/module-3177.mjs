// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/watchExpressionsView.ts
import { ViewAction, ViewPane } from "./module-1335.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED, CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED, CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED, CONTEXT_CAN_VIEW_MEMORY, CONTEXT_DEBUG_TYPE, CONTEXT_EXPRESSION_SELECTED, CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, CONTEXT_VARIABLE_IS_READONLY, CONTEXT_VARIABLE_TYPE, CONTEXT_WATCH_EXPRESSIONS_EXIST, CONTEXT_WATCH_EXPRESSIONS_FOCUSED, CONTEXT_WATCH_ITEM_TYPE, IDebugService, WATCH_VIEW_ID } from "./module-1057.mjs";
import { DebugExpressionRenderer } from "./module-2408.mjs";
import { AbstractExpressionDataSource, AbstractExpressionsRenderer, expressionAndScopeLabelProvider, renderViewTree } from "./module-2399.mjs";
import { WorkbenchAsyncDataTree } from "./module-0636.mjs";
import { VariablesRenderer, VisualizedVariableRenderer } from "./module-2409.mjs";
import { Expression, Variable3, VisualizedExpression } from "./module-1064.mjs";
import { Action2, IMenuService, MenuId, registerAction2 } from "./module-0092.mjs";
import { getContextMenuActions } from "./module-0516.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ILogService } from "./module-0095.mjs";
import { localize } from "./module-0001.mjs";
import { COPY_WATCH_EXPRESSION_COMMAND_ID, setDataBreakpointInfoResponse } from "./module-2406.mjs";
import { ElementsDragAndDropData } from "./module-0459.mjs";
import { Codicon } from "./module-0085.mjs";
import { watchExpressionsAdd, watchExpressionsRemoveAll } from "./module-1891.mjs";
import { FocusedViewContext } from "./module-0949.mjs";
import { IClipboardService } from "./module-0487.mjs";


// src/vs/workbench/contrib/debug/browser/watchExpressionsView.ts
var MAX_VALUE_RENDER_LENGTH_IN_VIEWLET3 = 1024;

var ignoreViewUpdates = false;

var useCachedEvaluation = false;

var WatchExpressionsView = class extends ViewPane {
  constructor(options3, contextMenuService, debugService, keybindingService, instantiationService, viewDescriptorService, configurationService, contextKeyService, openerService, themeService, hoverService, menuService, logService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.debugService = debugService;
    this.menuService = menuService;
    this.logService = logService;
    this.needsRefresh = false;
    this.watchExpressionsUpdatedScheduler = this._register(new RunOnceScheduler(() => {
      this.needsRefresh = false;
      this.tree.updateChildren();
    }, 50));
    this.watchExpressionsExist = CONTEXT_WATCH_EXPRESSIONS_EXIST.bindTo(contextKeyService);
    this.watchExpressionsExist.set(this.debugService.getModel().getWatchExpressions().length > 0);
    this.expressionRenderer = instantiationService.createInstance(DebugExpressionRenderer);
  }
  get treeSelection() {
    return this.tree.getSelection();
  }
  renderBody(container3) {
    super.renderBody(container3);
    this.element.classList.add("debug-pane");
    container3.classList.add("debug-watch");
    const treeContainer = renderViewTree(container3);
    const expressionsRenderer = this.instantiationService.createInstance(WatchExpressionsRenderer, this.expressionRenderer);
    this.tree = this.instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "WatchExpressions",
      treeContainer,
      new WatchExpressionsDelegate(),
      [
        expressionsRenderer,
        this.instantiationService.createInstance(VariablesRenderer, this.expressionRenderer),
        this.instantiationService.createInstance(VisualizedVariableRenderer, this.expressionRenderer)
      ],
      this.instantiationService.createInstance(WatchExpressionsDataSource),
      {
        accessibilityProvider: new WatchExpressionsAccessibilityProvider(),
        identityProvider: { getId: (element) => element.getId() },
        keyboardNavigationLabelProvider: {
          getKeyboardNavigationLabel: (e) => {
            if (e === this.debugService.getViewModel().getSelectedExpression()?.expression) {
              return void 0;
            }
            return expressionAndScopeLabelProvider.getKeyboardNavigationLabel(e);
          }
        },
        dnd: new WatchExpressionsDragAndDrop(this.debugService),
        overrideStyles: this.getLocationBasedColors().listOverrideStyles
      }
    );
    this._register(this.tree);
    this.tree.setInput(this.debugService);
    CONTEXT_WATCH_EXPRESSIONS_FOCUSED.bindTo(this.tree.contextKeyService);
    this._register(VisualizedVariableRenderer.rendererOnVisualizationRange(this.debugService.getViewModel(), this.tree));
    this._register(this.tree.onContextMenu((e) => this.onContextMenu(e)));
    this._register(this.tree.onMouseDblClick((e) => this.onMouseDblClick(e)));
    this._register(this.debugService.getModel().onDidChangeWatchExpressions(async (we) => {
      this.watchExpressionsExist.set(this.debugService.getModel().getWatchExpressions().length > 0);
      if (!this.isBodyVisible()) {
        this.needsRefresh = true;
      } else {
        if (we && !we.name) {
          useCachedEvaluation = true;
        }
        await this.tree.updateChildren();
        useCachedEvaluation = false;
        if (we instanceof Expression) {
          this.tree.reveal(we);
        }
      }
    }));
    this._register(this.debugService.getViewModel().onDidFocusStackFrame(() => {
      if (!this.isBodyVisible()) {
        this.needsRefresh = true;
        return;
      }
      if (!this.watchExpressionsUpdatedScheduler.isScheduled()) {
        this.watchExpressionsUpdatedScheduler.schedule();
      }
    }));
    this._register(this.debugService.getViewModel().onWillUpdateViews(() => {
      if (!ignoreViewUpdates) {
        this.tree.updateChildren();
      }
    }));
    this._register(this.onDidChangeBodyVisibility((visible) => {
      if (visible && this.needsRefresh) {
        this.watchExpressionsUpdatedScheduler.schedule();
      }
    }));
    let horizontalScrolling;
    this._register(this.debugService.getViewModel().onDidSelectExpression((e) => {
      const expression = e?.expression;
      if (expression && this.tree.hasNode(expression)) {
        horizontalScrolling = this.tree.options.horizontalScrolling;
        if (horizontalScrolling) {
          this.tree.updateOptions({ horizontalScrolling: false });
        }
        if (expression.name) {
          this.tree.rerender(expression);
        }
      } else if (!expression && horizontalScrolling !== void 0) {
        this.tree.updateOptions({ horizontalScrolling });
        horizontalScrolling = void 0;
      }
    }));
    this._register(this.debugService.getViewModel().onDidEvaluateLazyExpression(async (e) => {
      if (e instanceof Variable3 && this.tree.hasNode(e)) {
        await this.tree.updateChildren(e, false, true);
        await this.tree.expand(e);
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
  onMouseDblClick(e) {
    if (e.browserEvent.target.className.indexOf("twistie") >= 0) {
      return;
    }
    const element = e.element;
    const selectedExpression = this.debugService.getViewModel().getSelectedExpression();
    if (element instanceof Expression && element !== selectedExpression?.expression || element instanceof VisualizedExpression && element.treeItem.canEdit) {
      this.debugService.getViewModel().setSelectedExpression(element, false);
    } else if (!element) {
      this.debugService.addWatchExpression();
    }
  }
  async onContextMenu(e) {
    const element = e.element;
    if (!element) {
      return;
    }
    const selection = this.tree.getSelection();
    const contextKeyService = element && await getContextForWatchExpressionMenuWithDataAccess(this.contextKeyService, element, this.debugService, this.logService);
    const menu = this.menuService.getMenuActions(MenuId.DebugWatchContext, contextKeyService, { arg: element, shouldForwardArgs: false });
    const { secondary } = getContextMenuActions(menu, "inline");
    this.contextMenuService.showContextMenu({
      getAnchor: () => e.anchor,
      getActions: () => secondary,
      getActionsContext: () => element && selection.includes(element) ? selection : element ? [element] : []
    });
  }
};

WatchExpressionsView = __decorateClass([
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
  __decorateParam(11, IMenuService),
  __decorateParam(12, ILogService)
], WatchExpressionsView);

var WatchExpressionsDelegate = class {
  getHeight(_element) {
    return 22;
  }
  getTemplateId(element) {
    if (element instanceof Expression) {
      return WatchExpressionsRenderer.ID;
    }
    if (element instanceof VisualizedExpression) {
      return VisualizedVariableRenderer.ID;
    }
    return VariablesRenderer.ID;
  }
};

function isDebugService(element) {
  return typeof element.getConfigurationManager === "function";
}

var WatchExpressionsDataSource = class extends AbstractExpressionDataSource {
  hasChildren(element) {
    return isDebugService(element) || element.hasChildren;
  }
  doGetChildren(element) {
    if (isDebugService(element)) {
      const debugService = element;
      const watchExpressions = debugService.getModel().getWatchExpressions();
      const viewModel = debugService.getViewModel();
      return Promise.all(watchExpressions.map((we) => !!we.name && !useCachedEvaluation ? we.evaluate(viewModel.focusedSession, viewModel.focusedStackFrame, "watch").then(() => we) : Promise.resolve(we)));
    }
    return element.getChildren();
  }
};

var WatchExpressionsRenderer = class extends AbstractExpressionsRenderer {
  constructor(expressionRenderer, menuService, contextKeyService, debugService, contextViewService, hoverService, configurationService) {
    super(debugService, contextViewService, hoverService);
    this.expressionRenderer = expressionRenderer;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
  }
  static {
    this.ID = "watchexpression";
  }
  get templateId() {
    return WatchExpressionsRenderer.ID;
  }
  renderElement(node, index2, data) {
    data.elementDisposable.clear();
    data.elementDisposable.add(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("debug.showVariableTypes")) {
        super.renderExpressionElement(node.element, node, data);
      }
    }));
    super.renderExpressionElement(node.element, node, data);
  }
  renderExpression(expression, data, highlights) {
    let text2;
    data.type.textContent = "";
    const showType = this.configurationService.getValue("debug").showVariableTypes;
    if (showType && expression.type) {
      text2 = typeof expression.value === "string" ? `${expression.name}: ` : expression.name;
      data.type.textContent = expression.type + " =";
    } else {
      text2 = typeof expression.value === "string" ? `${expression.name} =` : expression.name;
    }
    let title;
    if (expression.type) {
      if (showType) {
        title = `${expression.name}`;
      } else {
        title = expression.type === expression.value ? expression.type : `${expression.type}`;
      }
    } else {
      title = expression.value;
    }
    data.label.set(text2, highlights, title);
    data.elementDisposable.add(this.expressionRenderer.renderValue(data.value, expression, {
      showChanged: true,
      maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET3,
      colorize: true,
      session: expression.getSession()
    }));
  }
  getInputBoxOptions(expression, settingValue) {
    if (settingValue) {
      return {
        initialValue: expression.value,
        ariaLabel: localize(14717, null),
        onFinish: async (value2, success) => {
          if (success && value2) {
            const focusedFrame = this.debugService.getViewModel().focusedStackFrame;
            if (focusedFrame && (expression instanceof Variable3 || expression instanceof Expression)) {
              await expression.setExpression(value2, focusedFrame);
              this.debugService.getViewModel().updateViews();
            }
          }
        }
      };
    }
    return {
      initialValue: expression.name ? expression.name : "",
      ariaLabel: localize(14720, null),
      placeholder: localize(14721, null),
      onFinish: (value2, success) => {
        if (success && value2) {
          this.debugService.renameWatchExpression(expression.getId(), value2);
          ignoreViewUpdates = true;
          this.debugService.getViewModel().updateViews();
          ignoreViewUpdates = false;
        } else if (!expression.name) {
          this.debugService.removeWatchExpressions(expression.getId());
        }
      }
    };
  }
  renderActionBar(actionBar3, expression) {
    const contextKeyService = getContextForWatchExpressionMenu(this.contextKeyService, expression);
    const context2 = expression;
    const menu = this.menuService.getMenuActions(MenuId.DebugWatchContext, contextKeyService, { arg: context2, shouldForwardArgs: false });
    const { primary } = getContextMenuActions(menu, "inline");
    actionBar3.clear();
    actionBar3.context = context2;
    actionBar3.push(primary, { icon: true, label: false });
  }
};

WatchExpressionsRenderer = __decorateClass([
  __decorateParam(1, IMenuService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IDebugService),
  __decorateParam(4, IContextViewService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IConfigurationService)
], WatchExpressionsRenderer);

function getContextForWatchExpressionMenu(parentContext, expression, additionalContext = []) {
  const session = expression.getSession();
  return parentContext.createOverlay([
    [CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT.key, "evaluateName" in expression],
    [CONTEXT_WATCH_ITEM_TYPE.key, expression instanceof Expression ? "expression" : expression instanceof Variable3 ? "variable" : void 0],
    [CONTEXT_CAN_VIEW_MEMORY.key, !!session?.capabilities.supportsReadMemoryRequest && expression.memoryReference !== void 0],
    [CONTEXT_VARIABLE_IS_READONLY.key, !!expression.presentationHint?.attributes?.includes("readOnly") || expression.presentationHint?.lazy],
    [CONTEXT_VARIABLE_TYPE.key, expression.type],
    [CONTEXT_DEBUG_TYPE.key, session?.configuration.type],
    ...additionalContext
  ]);
}

async function getContextForWatchExpressionMenuWithDataAccess(parentContext, expression, debugService, logService) {
  const session = expression.getSession();
  if (!session || !session.capabilities.supportsDataBreakpoints) {
    return getContextForWatchExpressionMenu(parentContext, expression);
  }
  const contextKeys = [];
  const stackFrame = debugService.getViewModel().focusedStackFrame;
  let dataBreakpointInfoResponse2;
  try {
    if ("evaluateName" in expression && expression.evaluateName) {
      dataBreakpointInfoResponse2 = await session.dataBreakpointInfo(
        expression.evaluateName,
        void 0,
        stackFrame?.frameId
      );
    } else if (expression instanceof Variable3) {
      dataBreakpointInfoResponse2 = await session.dataBreakpointInfo(
        expression.name,
        expression.parent.reference,
        stackFrame?.frameId
      );
    } else {
      dataBreakpointInfoResponse2 = await session.dataBreakpointInfo(
        expression.name,
        void 0,
        stackFrame?.frameId
      );
    }
  } catch (error) {
    logService.error("Failed to get data breakpoint info for watch expression:", error);
  }
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
  return getContextForWatchExpressionMenu(parentContext, expression, contextKeys);
}

var WatchExpressionsAccessibilityProvider = class {
  getWidgetAriaLabel() {
    return localize(14718, null);
  }
  getAriaLabel(element) {
    if (element instanceof Expression) {
      return localize(14719, null, element.name, element.value);
    }
    return localize(14722, null, element.name, element.value);
  }
};

var WatchExpressionsDragAndDrop = class {
  constructor(debugService) {
    this.debugService = debugService;
  }
  onDragStart(data, originalEvent) {
    if (data instanceof ElementsDragAndDropData) {
      originalEvent.dataTransfer.setData("text/plain", data.elements[0].name);
    }
  }
  onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
    if (!(data instanceof ElementsDragAndDropData)) {
      return false;
    }
    const expressions = data.elements;
    if (!(expressions.length > 0 && expressions[0] instanceof Expression)) {
      return false;
    }
    let dropEffectPosition = void 0;
    if (targetIndex === void 0) {
      dropEffectPosition = "drop-target-after" /* After */;
      targetIndex = -1;
    } else {
      switch (targetSector) {
        case 0 /* TOP */:
        case 1 /* CENTER_TOP */:
          dropEffectPosition = "drop-target-before" /* Before */;
          break;
        case 2 /* CENTER_BOTTOM */:
        case 3 /* BOTTOM */:
          dropEffectPosition = "drop-target-after" /* After */;
          break;
      }
    }
    return { accept: true, effect: { type: 1 /* Move */, position: dropEffectPosition }, feedback: [targetIndex] };
  }
  getDragURI(element) {
    if (!(element instanceof Expression) || element === this.debugService.getViewModel().getSelectedExpression()?.expression) {
      return null;
    }
    return element.getId();
  }
  getDragLabel(elements) {
    if (elements.length === 1) {
      return elements[0].name;
    }
    return void 0;
  }
  drop(data, targetElement, targetIndex, targetSector, originalEvent) {
    if (!(data instanceof ElementsDragAndDropData)) {
      return;
    }
    const draggedElement = data.elements[0];
    if (!(draggedElement instanceof Expression)) {
      throw new Error("Invalid dragged element");
    }
    const watches = this.debugService.getModel().getWatchExpressions();
    const sourcePosition = watches.indexOf(draggedElement);
    let targetPosition;
    if (targetElement instanceof Expression) {
      targetPosition = watches.indexOf(targetElement);
      switch (targetSector) {
        case 3 /* BOTTOM */:
        case 2 /* CENTER_BOTTOM */:
          targetPosition++;
          break;
      }
      if (sourcePosition < targetPosition) {
        targetPosition--;
      }
    } else {
      targetPosition = watches.length - 1;
    }
    this.debugService.moveWatchExpression(draggedElement.getId(), targetPosition);
  }
  dispose() {
  }
};

registerAction2(class Collapse3 extends ViewAction {
  constructor() {
    super({
      id: "watch.collapse",
      viewId: WATCH_VIEW_ID,
      title: localize(14713, null),
      f1: false,
      icon: Codicon.collapseAll,
      precondition: CONTEXT_WATCH_EXPRESSIONS_EXIST,
      menu: {
        id: MenuId.ViewTitle,
        order: 30,
        group: "navigation",
        when: ContextKeyExpr.equals("view", WATCH_VIEW_ID)
      }
    });
  }
  runInView(_accessor, view) {
    view.collapseAll();
  }
});

var ADD_WATCH_ID = "workbench.debug.viewlet.action.addWatchExpression";

var ADD_WATCH_LABEL = localize(14712, null);

registerAction2(class AddWatchExpressionAction extends Action2 {
  constructor() {
    super({
      id: ADD_WATCH_ID,
      title: ADD_WATCH_LABEL,
      f1: false,
      icon: watchExpressionsAdd,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.equals("view", WATCH_VIEW_ID)
      }
    });
  }
  run(accessor) {
    const debugService = accessor.get(IDebugService);
    debugService.addWatchExpression();
  }
});

var REMOVE_WATCH_EXPRESSIONS_COMMAND_ID = "workbench.debug.viewlet.action.removeAllWatchExpressions";

var REMOVE_WATCH_EXPRESSIONS_LABEL = localize(14716, null);

registerAction2(class RemoveAllWatchExpressionsAction extends Action2 {
  constructor() {
    super({
      id: REMOVE_WATCH_EXPRESSIONS_COMMAND_ID,
      // Use old and long id for backwards compatibility
      title: REMOVE_WATCH_EXPRESSIONS_LABEL,
      f1: false,
      icon: watchExpressionsRemoveAll,
      precondition: CONTEXT_WATCH_EXPRESSIONS_EXIST,
      menu: {
        id: MenuId.ViewTitle,
        order: 20,
        group: "navigation",
        when: ContextKeyExpr.equals("view", WATCH_VIEW_ID)
      }
    });
  }
  run(accessor) {
    const debugService = accessor.get(IDebugService);
    debugService.removeWatchExpressions();
  }
});

registerAction2(class CopyExpression extends ViewAction {
  constructor() {
    super({
      id: COPY_WATCH_EXPRESSION_COMMAND_ID,
      title: localize(14715, null),
      f1: false,
      viewId: WATCH_VIEW_ID,
      precondition: CONTEXT_WATCH_EXPRESSIONS_EXIST,
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 33 /* KeyC */,
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(
          FocusedViewContext.isEqualTo(WATCH_VIEW_ID),
          CONTEXT_EXPRESSION_SELECTED.negate()
        )
      },
      menu: {
        id: MenuId.DebugWatchContext,
        order: 20,
        group: "3_modification",
        when: CONTEXT_WATCH_ITEM_TYPE.isEqualTo("expression")
      }
    });
  }
  runInView(accessor, view, value2) {
    const clipboardService = accessor.get(IClipboardService);
    if (!value2) {
      value2 = view.treeSelection.at(-1);
    }
    if (value2) {
      clipboardService.writeText(value2.name);
    }
  }
});

var COPY_ALL_WATCH_EXPRESSIONS_COMMAND_ID = "workbench.debug.viewlet.action.copyAllWatchExpressions";

registerAction2(class CopyAllWatchExpressions extends ViewAction {
  constructor() {
    super({
      id: COPY_ALL_WATCH_EXPRESSIONS_COMMAND_ID,
      title: localize(14714, null),
      f1: false,
      viewId: WATCH_VIEW_ID,
      precondition: CONTEXT_WATCH_EXPRESSIONS_EXIST,
      menu: {
        id: MenuId.DebugWatchContext,
        order: 45,
        group: "3_modification"
      }
    });
  }
  runInView(accessor) {
    const clipboardService = accessor.get(IClipboardService);
    const debugService = accessor.get(IDebugService);
    const watches = debugService.getModel().getWatchExpressions();
    const lines = watches.map((w) => `${w.name}: ${w.value}`);
    clipboardService.writeText(lines.join("\n"));
  }
});
export { isDebugService, getContextForWatchExpressionMenu, getContextForWatchExpressionMenuWithDataAccess, MAX_VALUE_RENDER_LENGTH_IN_VIEWLET3, ignoreViewUpdates, useCachedEvaluation, WatchExpressionsView, WatchExpressionsDelegate, WatchExpressionsDataSource, WatchExpressionsRenderer, WatchExpressionsAccessibilityProvider, WatchExpressionsDragAndDrop, ADD_WATCH_ID, ADD_WATCH_LABEL, REMOVE_WATCH_EXPRESSIONS_COMMAND_ID, REMOVE_WATCH_EXPRESSIONS_LABEL, COPY_ALL_WATCH_EXPRESSIONS_COMMAND_ID };
