// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugHover.ts
import { $, SafeTriangle, addStandardDisposableListener, append, isAncestorOfActiveElement } from "./module-0075.mjs";
import { coalesce } from "./module-0007.mjs";
import { DebugExpressionRenderer } from "./module-2383.mjs";
import { localize } from "./module-0001.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { WorkbenchAsyncDataTree } from "./module-0636.mjs";
import { VariablesRenderer, VisualizedVariableRenderer, openContextMenuForVariableTreeElement } from "./module-2384.mjs";
import { editorHoverBackground, editorHoverBorder, editorHoverForeground } from "./module-0229.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { Expression, Variable3, VisualizedExpression } from "./module-1065.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { DisposableStore, dispose } from "./module-0012.mjs";
import { clamp } from "./module-0040.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDebugService } from "./module-1058.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { AbstractExpressionDataSource } from "./module-2374.mjs";
import { getEvaluatableExpressionAtPosition } from "./module-1060.mjs";
import { Range2 } from "./module-0106.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/debug/browser/debugHover.ts
var $61 = $;

async function doFindExpression(container2, namesToFind) {
  if (!container2) {
    return null;
  }
  const children = await container2.getChildren();
  const filtered = children.filter((v2) => namesToFind[0] === v2.name);
  if (filtered.length !== 1) {
    return null;
  }
  if (namesToFind.length === 1) {
    return filtered[0];
  } else {
    return doFindExpression(filtered[0], namesToFind.slice(1));
  }
}

async function findExpressionInStackFrame(stackFrame, namesToFind) {
  const scopes = await stackFrame.getScopes();
  const nonExpensive = scopes.filter((s) => !s.expensive);
  const expressions = coalesce(await Promise.all(nonExpensive.map((scope) => doFindExpression(scope, namesToFind))));
  return expressions.length > 0 && expressions.every((e4) => e4.value === expressions[0].value) ? expressions[0] : void 0;
}

var DebugHoverWidget = class {
  constructor(editor, debugService, instantiationService, menuService, contextKeyService, contextMenuService) {
    this.editor = editor;
    this.debugService = debugService;
    this.instantiationService = instantiationService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.contextMenuService = contextMenuService;
    // editor.IContentWidget.allowEditorOverflow
    this.allowEditorOverflow = true;
    this.isUpdatingTree = false;
    this.highlightDecorations = this.editor.createDecorationsCollection();
    this.toDispose = [];
    this.showAtPosition = null;
    this.positionPreference = [1 /* ABOVE */, 2 /* BELOW */];
    this.debugHoverComputer = this.instantiationService.createInstance(DebugHoverComputer, this.editor);
    this.expressionRenderer = this.instantiationService.createInstance(DebugExpressionRenderer);
  }
  static {
    this.ID = "debug.hoverWidget";
  }
  get isShowingComplexValue() {
    return this.complexValueContainer?.hidden === false;
  }
  create() {
    this.domNode = $61(".debug-hover-widget");
    this.complexValueContainer = append(this.domNode, $61(".complex-value"));
    this.complexValueTitle = append(this.complexValueContainer, $61(".title"));
    this.treeContainer = append(this.complexValueContainer, $61(".debug-hover-tree"));
    this.treeContainer.setAttribute("role", "tree");
    const tip = append(this.complexValueContainer, $61(".tip"));
    tip.textContent = localize(14467, null, isMacintosh ? "Option" : "Alt");
    const dataSource = this.instantiationService.createInstance(DebugHoverDataSource);
    this.tree = this.instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "DebugHover",
      this.treeContainer,
      new DebugHoverDelegate(),
      [
        this.instantiationService.createInstance(VariablesRenderer, this.expressionRenderer),
        this.instantiationService.createInstance(VisualizedVariableRenderer, this.expressionRenderer)
      ],
      dataSource,
      {
        accessibilityProvider: new DebugHoverAccessibilityProvider(),
        mouseSupport: false,
        horizontalScrolling: true,
        useShadows: false,
        keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e4) => e4.name },
        overrideStyles: {
          listBackground: editorHoverBackground
        }
      }
    );
    this.toDispose.push(VisualizedVariableRenderer.rendererOnVisualizationRange(this.debugService.getViewModel(), this.tree));
    this.toDispose.push(this.tree);
    this.valueContainer = $61(".value");
    this.valueContainer.tabIndex = 0;
    this.valueContainer.setAttribute("role", "tooltip");
    this.scrollbar = new DomScrollableElement(this.valueContainer, { horizontal: 2 /* Hidden */ });
    this.domNode.appendChild(this.scrollbar.getDomNode());
    this.toDispose.push(this.scrollbar);
    this.editor.applyFontInfo(this.domNode);
    this.domNode.style.backgroundColor = asCssVariable(editorHoverBackground);
    this.domNode.style.border = `1px solid ${asCssVariable(editorHoverBorder)}`;
    this.domNode.style.color = asCssVariable(editorHoverForeground);
    this.toDispose.push(this.tree.onContextMenu(async (e4) => await this.onContextMenu(e4)));
    this.toDispose.push(this.tree.onDidChangeContentHeight(() => {
      if (!this.isUpdatingTree) {
        this.layoutTreeAndContainer();
      }
    }));
    this.toDispose.push(this.tree.onDidChangeContentWidth(() => {
      if (!this.isUpdatingTree) {
        this.layoutTreeAndContainer();
      }
    }));
    this.registerListeners();
    this.editor.addContentWidget(this);
  }
  async onContextMenu(e4) {
    const variable = e4.element;
    if (!(variable instanceof Variable3) || !variable.value) {
      return;
    }
    return openContextMenuForVariableTreeElement(this.contextKeyService, this.menuService, this.contextMenuService, MenuId.DebugHoverContext, e4);
  }
  registerListeners() {
    this.toDispose.push(addStandardDisposableListener(this.domNode, "keydown", (e4) => {
      if (e4.equals(9 /* Escape */)) {
        this.hide();
      }
    }));
    this.toDispose.push(this.editor.onDidChangeConfiguration((e4) => {
      if (e4.hasChanged(59 /* fontInfo */)) {
        this.editor.applyFontInfo(this.domNode);
      }
    }));
    this.toDispose.push(this.debugService.getViewModel().onDidEvaluateLazyExpression(async (e4) => {
      if (e4 instanceof Variable3 && this.tree.hasNode(e4)) {
        await this.tree.updateChildren(e4, false, true);
        await this.tree.expand(e4);
      }
    }));
  }
  isHovered() {
    return !!this.domNode?.matches(":hover");
  }
  isVisible() {
    return !!this._isVisible;
  }
  willBeVisible() {
    return !!this.showCancellationSource;
  }
  getId() {
    return DebugHoverWidget.ID;
  }
  getDomNode() {
    return this.domNode;
  }
  /**
   * Gets whether the given coordinates are in the safe triangle formed from
   * the position at which the hover was initiated.
   */
  isInSafeTriangle(x, y) {
    return this._isVisible && !!this.safeTriangle?.contains(x, y);
  }
  async showAt(position2, focus, mouseEvent) {
    this.showCancellationSource?.dispose(true);
    const cancellationSource = this.showCancellationSource = new CancellationTokenSource();
    const session = this.debugService.getViewModel().focusedSession;
    if (!session || !this.editor.hasModel()) {
      this.hide();
      return 1 /* NOT_AVAILABLE */;
    }
    const result = await this.debugHoverComputer.compute(position2, cancellationSource.token);
    if (cancellationSource.token.isCancellationRequested) {
      this.hide();
      return 2 /* CANCELLED */;
    }
    if (!result.range) {
      this.hide();
      return 1 /* NOT_AVAILABLE */;
    }
    if (this.isVisible() && !result.rangeChanged) {
      return 0 /* NOT_CHANGED */;
    }
    const expression = await this.debugHoverComputer.evaluate(session);
    if (cancellationSource.token.isCancellationRequested) {
      this.hide();
      return 2 /* CANCELLED */;
    }
    if (!expression || expression instanceof Expression && !expression.available) {
      this.hide();
      return 1 /* NOT_AVAILABLE */;
    }
    this.highlightDecorations.set([{
      range: result.range,
      options: DebugHoverWidget._HOVER_HIGHLIGHT_DECORATION_OPTIONS
    }]);
    return this.doShow(session, result.range.getStartPosition(), expression, focus, mouseEvent);
  }
  static {
    this._HOVER_HIGHLIGHT_DECORATION_OPTIONS = ModelDecorationOptions.register({
      description: "bdebug-hover-highlight",
      className: "hoverHighlight"
    });
  }
  async doShow(session, position2, expression, focus, mouseEvent) {
    if (!this.domNode) {
      this.create();
    }
    this.showAtPosition = position2;
    const store = new DisposableStore();
    this._isVisible = { store };
    if (!expression.hasChildren) {
      this.complexValueContainer.hidden = true;
      this.valueContainer.hidden = false;
      store.add(this.expressionRenderer.renderValue(this.valueContainer, expression, {
        showChanged: false,
        colorize: true,
        hover: false,
        session
      }));
      this.valueContainer.title = "";
      this.editor.layoutContentWidget(this);
      this.safeTriangle = mouseEvent && new SafeTriangle(mouseEvent.posx, mouseEvent.posy, this.domNode);
      this.scrollbar.scanDomNode();
      if (focus) {
        this.editor.render();
        this.valueContainer.focus();
      }
      return void 0;
    }
    this.valueContainer.hidden = true;
    this.expressionToRender = expression;
    store.add(this.expressionRenderer.renderValue(this.complexValueTitle, expression, { hover: false, session }));
    this.editor.layoutContentWidget(this);
    this.safeTriangle = mouseEvent && new SafeTriangle(mouseEvent.posx, mouseEvent.posy, this.domNode);
    this.tree.scrollTop = 0;
    this.tree.scrollLeft = 0;
    this.complexValueContainer.hidden = false;
    if (focus) {
      this.editor.render();
      this.tree.domFocus();
    }
  }
  layoutTreeAndContainer() {
    this.layoutTree();
    this.editor.layoutContentWidget(this);
  }
  layoutTree() {
    const scrollBarHeight = 10;
    let maxHeightToAvoidCursorOverlay = Infinity;
    if (this.showAtPosition) {
      const editorTop = this.editor.getDomNode()?.offsetTop || 0;
      const containerTop = this.treeContainer.offsetTop + editorTop;
      const hoveredCharTop = this.editor.getTopForLineNumber(this.showAtPosition.lineNumber, true) - this.editor.getScrollTop();
      if (containerTop < hoveredCharTop) {
        maxHeightToAvoidCursorOverlay = hoveredCharTop + editorTop - 22;
      }
    }
    const treeHeight = Math.min(Math.max(266, this.editor.getLayoutInfo().height * 0.55), this.tree.contentHeight + scrollBarHeight, maxHeightToAvoidCursorOverlay);
    const realTreeWidth = this.tree.contentWidth;
    const treeWidth = clamp(realTreeWidth, 400, 550);
    this.tree.layout(treeHeight, treeWidth);
    this.treeContainer.style.height = `${treeHeight}px`;
    this.scrollbar.scanDomNode();
  }
  beforeRender() {
    if (this.expressionToRender) {
      const expression = this.expressionToRender;
      this.expressionToRender = void 0;
      this.isUpdatingTree = true;
      this.tree.setInput(expression).finally(() => {
        this.isUpdatingTree = false;
      });
    }
    return null;
  }
  afterRender(positionPreference) {
    if (positionPreference) {
      this.positionPreference = [positionPreference];
    }
  }
  hide() {
    if (this.showCancellationSource) {
      this.showCancellationSource.dispose(true);
      this.showCancellationSource = void 0;
    }
    if (!this._isVisible) {
      return;
    }
    if (isAncestorOfActiveElement(this.domNode)) {
      this.editor.focus();
    }
    this._isVisible.store.dispose();
    this._isVisible = void 0;
    this.highlightDecorations.clear();
    this.editor.layoutContentWidget(this);
    this.positionPreference = [1 /* ABOVE */, 2 /* BELOW */];
  }
  getPosition() {
    return this._isVisible ? {
      position: this.showAtPosition,
      preference: this.positionPreference
    } : null;
  }
  dispose() {
    this.toDispose = dispose(this.toDispose);
  }
};

DebugHoverWidget = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IMenuService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IContextMenuService)
], DebugHoverWidget);

var DebugHoverAccessibilityProvider = class {
  getWidgetAriaLabel() {
    return localize(14468, null);
  }
  getAriaLabel(element) {
    return localize(14469, null, element.name, element.value);
  }
};

var DebugHoverDataSource = class extends AbstractExpressionDataSource {
  hasChildren(element) {
    return element.hasChildren;
  }
  doGetChildren(element) {
    return element.getChildren();
  }
};

var DebugHoverDelegate = class {
  getHeight(element) {
    return 18;
  }
  getTemplateId(element) {
    if (element instanceof VisualizedExpression) {
      return VisualizedVariableRenderer.ID;
    }
    return VariablesRenderer.ID;
  }
};

var DebugHoverComputer = class {
  constructor(editor, debugService, languageFeaturesService, logService) {
    this.editor = editor;
    this.debugService = debugService;
    this.languageFeaturesService = languageFeaturesService;
    this.logService = logService;
  }
  async compute(position2, token) {
    const session = this.debugService.getViewModel().focusedSession;
    if (!session || !this.editor.hasModel()) {
      return { rangeChanged: false };
    }
    const model = this.editor.getModel();
    const result = await getEvaluatableExpressionAtPosition(this.languageFeaturesService, model, position2, token);
    if (!result) {
      return { rangeChanged: false };
    }
    const { range: range2, matchingExpression } = result;
    const rangeChanged = !this._current?.range.equalsRange(range2);
    this._current = { expression: matchingExpression, range: Range2.lift(range2) };
    return { rangeChanged, range: this._current.range };
  }
  async evaluate(session) {
    if (!this._current) {
      this.logService.error("No expression to evaluate");
      return;
    }
    const textModel = this.editor.getModel();
    const debugSource = textModel && session.getSourceForUri(textModel?.uri);
    if (session.capabilities.supportsEvaluateForHovers) {
      const expression = new Expression(this._current.expression);
      await expression.evaluate(session, this.debugService.getViewModel().focusedStackFrame, "hover", void 0, debugSource ? {
        line: this._current.range.startLineNumber,
        column: this._current.range.startColumn,
        source: debugSource.raw
      } : void 0);
      return expression;
    } else {
      const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
      if (focusedStackFrame) {
        return await findExpressionInStackFrame(
          focusedStackFrame,
          coalesce(this._current.expression.split(".").map((word) => word.trim()))
        );
      }
    }
    return void 0;
  }
};

DebugHoverComputer = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, ILogService)
], DebugHoverComputer);
export { doFindExpression, findExpressionInStackFrame, $61, DebugHoverWidget, DebugHoverAccessibilityProvider, DebugHoverDataSource, DebugHoverDelegate, DebugHoverComputer };
