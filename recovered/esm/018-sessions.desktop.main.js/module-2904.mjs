// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/replViewer.ts
import { $, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { debugConsoleEvaluationInput } from "./module-1868.mjs";
import { HighlightedLabel } from "./module-0639.mjs";
import { createMatches } from "./module-0453.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { CountBadge } from "./module-0638.mjs";
import { defaultCountBadgeStyles } from "./module-0513.mjs";
import { severity_default } from "./module-0266.mjs";
import { AbstractExpressionsRenderer } from "./module-2374.mjs";
import { RawObjectReplElement, ReplEvaluationInput, ReplEvaluationResult, ReplGroup, ReplOutputElement, ReplVariableElement } from "./module-2375.mjs";
import { IDebugService } from "./module-1058.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IHoverService } from "./module-0520.mjs";
import { Variable3 } from "./module-1065.mjs";
import { CachedListVirtualDelegate } from "./module-0454.mjs";
import { localize } from "./module-0001.mjs";
import { basename } from "./module-0026.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ILabelService } from "./module-0641.mjs";


// src/vs/workbench/contrib/debug/browser/replViewer.ts
var $100 = $;

var ReplEvaluationInputsRenderer = class _ReplEvaluationInputsRenderer {
  static {
    this.ID = "replEvaluationInput";
  }
  get templateId() {
    return _ReplEvaluationInputsRenderer.ID;
  }
  renderTemplate(container2) {
    append(container2, $100("span.arrow" + ThemeIcon.asCSSSelector(debugConsoleEvaluationInput)));
    const input = append(container2, $100(".expression"));
    const label3 = new HighlightedLabel(input);
    return { label: label3 };
  }
  renderElement(element, index2, templateData) {
    const evaluation = element.element;
    templateData.label.set(evaluation.value, createMatches(element.filterData));
  }
  disposeTemplate(templateData) {
    templateData.label.dispose();
  }
};

var ReplGroupRenderer = class {
  constructor(expressionRenderer, instaService) {
    this.expressionRenderer = expressionRenderer;
    this.instaService = instaService;
  }
  static {
    this.ID = "replGroup";
  }
  get templateId() {
    return ReplGroupRenderer.ID;
  }
  renderTemplate(container2) {
    container2.classList.add("group");
    const expression = append(container2, $100(".output.expression.value-and-source"));
    const label3 = append(expression, $100("span.label"));
    const source = this.instaService.createInstance(SourceWidget, expression);
    return { label: label3, source };
  }
  renderElement(element, _index, templateData) {
    templateData.elementDisposable?.dispose();
    const replGroup = element.element;
    clearNode(templateData.label);
    templateData.elementDisposable = this.expressionRenderer.renderValue(templateData.label, replGroup.name, { wasANSI: true, session: element.element.session });
    templateData.source.setSource(replGroup.sourceData);
  }
  disposeTemplate(templateData) {
    templateData.elementDisposable?.dispose();
    templateData.source.dispose();
  }
};

ReplGroupRenderer = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ReplGroupRenderer);

var ReplEvaluationResultsRenderer = class _ReplEvaluationResultsRenderer {
  constructor(expressionRenderer) {
    this.expressionRenderer = expressionRenderer;
  }
  static {
    this.ID = "replEvaluationResult";
  }
  get templateId() {
    return _ReplEvaluationResultsRenderer.ID;
  }
  renderTemplate(container2) {
    const output = append(container2, $100(".evaluation-result.expression"));
    const value2 = append(output, $100("span.value"));
    return { value: value2, elementStore: new DisposableStore() };
  }
  renderElement(element, index2, templateData) {
    templateData.elementStore.clear();
    const expression = element.element;
    templateData.elementStore.add(this.expressionRenderer.renderValue(templateData.value, expression, {
      colorize: true,
      hover: false,
      session: element.element.getSession()
    }));
  }
  disposeTemplate(templateData) {
    templateData.elementStore.dispose();
  }
};

var ReplOutputElementRenderer = class {
  constructor(expressionRenderer, instaService) {
    this.expressionRenderer = expressionRenderer;
    this.instaService = instaService;
  }
  static {
    this.ID = "outputReplElement";
  }
  get templateId() {
    return ReplOutputElementRenderer.ID;
  }
  renderTemplate(container2) {
    const data = /* @__PURE__ */ Object.create(null);
    container2.classList.add("output");
    const expression = append(container2, $100(".output.expression.value-and-source"));
    data.container = container2;
    data.countContainer = append(expression, $100(".count-badge-wrapper"));
    data.count = new CountBadge(data.countContainer, {}, defaultCountBadgeStyles);
    data.value = append(expression, $100("span.value.label"));
    data.source = this.instaService.createInstance(SourceWidget, expression);
    data.elementDisposable = new DisposableStore();
    return data;
  }
  renderElement({ element }, index2, templateData) {
    templateData.elementDisposable.clear();
    this.setElementCount(element, templateData);
    templateData.elementDisposable.add(element.onDidChangeCount(() => this.setElementCount(element, templateData)));
    clearNode(templateData.value);
    templateData.value.className = "value";
    const locationReference = element.expression?.valueLocationReference;
    templateData.elementDisposable.add(this.expressionRenderer.renderValue(templateData.value, element.value, {
      wasANSI: true,
      session: element.session,
      locationReference,
      hover: false
    }));
    templateData.value.classList.add(element.severity === severity_default.Warning ? "warn" : element.severity === severity_default.Error ? "error" : element.severity === severity_default.Ignore ? "ignore" : "info");
    templateData.source.setSource(element.sourceData);
    templateData.getReplElementSource = () => element.sourceData;
  }
  setElementCount(element, templateData) {
    if (element.count >= 2) {
      templateData.count.setCount(element.count);
      templateData.countContainer.hidden = false;
    } else {
      templateData.countContainer.hidden = true;
    }
  }
  disposeTemplate(templateData) {
    templateData.source.dispose();
    templateData.elementDisposable.dispose();
    templateData.count.dispose();
  }
  disposeElement(_element, _index, templateData) {
    templateData.elementDisposable.clear();
  }
};

ReplOutputElementRenderer = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ReplOutputElementRenderer);

var ReplVariablesRenderer = class extends AbstractExpressionsRenderer {
  constructor(expressionRenderer, debugService, contextViewService, hoverService) {
    super(debugService, contextViewService, hoverService);
    this.expressionRenderer = expressionRenderer;
  }
  static {
    this.ID = "replVariable";
  }
  get templateId() {
    return ReplVariablesRenderer.ID;
  }
  renderElement(node, _index, data) {
    const element = node.element;
    data.elementDisposable.clear();
    super.renderExpressionElement(element instanceof ReplVariableElement ? element.expression : element, node, data);
  }
  renderExpression(expression, data, highlights) {
    const isReplVariable = expression instanceof ReplVariableElement;
    if (isReplVariable || !expression.name) {
      data.label.set("");
      const value2 = isReplVariable ? expression.expression : expression;
      data.elementDisposable.add(this.expressionRenderer.renderValue(data.value, value2, { colorize: true, hover: false, session: expression.getSession() }));
      data.expression.classList.remove("nested-variable");
    } else {
      data.elementDisposable.add(this.expressionRenderer.renderVariable(data, expression, { showChanged: true, highlights }));
      data.expression.classList.toggle("nested-variable", isNestedVariable(expression));
    }
  }
  getInputBoxOptions(expression) {
    return void 0;
  }
};

ReplVariablesRenderer = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IHoverService)
], ReplVariablesRenderer);

var ReplRawObjectsRenderer = class _ReplRawObjectsRenderer {
  constructor(expressionRenderer) {
    this.expressionRenderer = expressionRenderer;
  }
  static {
    this.ID = "rawObject";
  }
  get templateId() {
    return _ReplRawObjectsRenderer.ID;
  }
  renderTemplate(container2) {
    container2.classList.add("output");
    const expression = append(container2, $100(".output.expression"));
    const name = append(expression, $100("span.name"));
    const label3 = new HighlightedLabel(name);
    const value2 = append(expression, $100("span.value"));
    return { container: container2, expression, name, label: label3, value: value2, elementStore: new DisposableStore() };
  }
  renderElement(node, index2, templateData) {
    templateData.elementStore.clear();
    const element = node.element;
    templateData.label.set(element.name ? `${element.name}:` : "", createMatches(node.filterData));
    if (element.name) {
      templateData.name.textContent = `${element.name}:`;
    } else {
      templateData.name.textContent = "";
    }
    templateData.elementStore.add(this.expressionRenderer.renderValue(templateData.value, element.value, {
      hover: false,
      session: node.element.getSession()
    }));
  }
  disposeTemplate(templateData) {
    templateData.elementStore.dispose();
    templateData.label.dispose();
  }
};

function isNestedVariable(element) {
  return element instanceof Variable3 && (element.parent instanceof ReplEvaluationResult || element.parent instanceof Variable3);
}

var ReplDelegate = class extends CachedListVirtualDelegate {
  constructor(configurationService, replOptions) {
    super();
    this.configurationService = configurationService;
    this.replOptions = replOptions;
  }
  getHeight(element) {
    const config = this.configurationService.getValue("debug");
    if (!config.console.wordWrap) {
      return this.estimateHeight(element, true);
    }
    return super.getHeight(element);
  }
  /**
   * With wordWrap enabled, this is an estimate. With wordWrap disabled, this is the real height that the list will use.
   */
  estimateHeight(element, ignoreValueLength = false) {
    const lineHeight = this.replOptions.replConfiguration.lineHeight;
    const countNumberOfLines = (str) => str.match(/\n/g)?.length ?? 0;
    const hasValue = (e4) => typeof e4.value === "string";
    if (hasValue(element) && !isNestedVariable(element)) {
      const value2 = element.value;
      const valueRows = countNumberOfLines(value2) + (ignoreValueLength ? 0 : Math.floor(value2.length / 70)) + (element instanceof ReplOutputElement ? 0 : 1);
      return Math.max(valueRows, 1) * lineHeight;
    }
    return lineHeight;
  }
  getTemplateId(element) {
    if (element instanceof Variable3 || element instanceof ReplVariableElement) {
      return ReplVariablesRenderer.ID;
    }
    if (element instanceof ReplEvaluationResult) {
      return ReplEvaluationResultsRenderer.ID;
    }
    if (element instanceof ReplEvaluationInput) {
      return ReplEvaluationInputsRenderer.ID;
    }
    if (element instanceof ReplOutputElement) {
      return ReplOutputElementRenderer.ID;
    }
    if (element instanceof ReplGroup) {
      return ReplGroupRenderer.ID;
    }
    return ReplRawObjectsRenderer.ID;
  }
  hasDynamicHeight(element) {
    if (isNestedVariable(element)) {
      return false;
    }
    return element.toString().length > 0;
  }
};

function isDebugSession(obj) {
  return typeof obj.getReplElements === "function";
}

var ReplDataSource = class {
  hasChildren(element) {
    if (isDebugSession(element)) {
      return true;
    }
    return !!element.hasChildren;
  }
  getChildren(element) {
    if (isDebugSession(element)) {
      return Promise.resolve(element.getReplElements());
    }
    return Promise.resolve(element.getChildren());
  }
};

var ReplAccessibilityProvider = class {
  getWidgetAriaLabel() {
    return localize(14679, null);
  }
  getAriaLabel(element) {
    if (element instanceof Variable3) {
      return localize(14683, null, element.name, element.value);
    }
    if (element instanceof ReplOutputElement || element instanceof ReplEvaluationInput || element instanceof ReplEvaluationResult) {
      return element.value + (element instanceof ReplOutputElement && element.count > 1 ? localize(
        14680,
        null,
        element.count
      ) : "");
    }
    if (element instanceof RawObjectReplElement) {
      return localize(14682, null, element.name, element.value);
    }
    if (element instanceof ReplGroup) {
      return localize(14681, null, element.name);
    }
    return "";
  }
};

var SourceWidget = class extends Disposable {
  constructor(container2, editorService, hoverService, labelService) {
    super();
    this.hoverService = hoverService;
    this.labelService = labelService;
    this.el = append(container2, $100(".source"));
    this._register(addDisposableListener(this.el, "click", (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      if (this.source) {
        this.source.source.openInEditor(editorService, {
          startLineNumber: this.source.lineNumber,
          startColumn: this.source.column,
          endLineNumber: this.source.lineNumber,
          endColumn: this.source.column
        });
      }
    }));
  }
  setSource(source) {
    this.source = source;
    this.el.textContent = source ? `${basename(source.source.name)}:${source.lineNumber}` : "";
    this.hover ??= this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.el, ""));
    this.hover.update(source ? `${this.labelService.getUriLabel(source.source.uri)}:${source.lineNumber}` : "");
  }
};

SourceWidget = __decorateClass([
  __decorateParam(1, IEditorService),
  __decorateParam(2, IHoverService),
  __decorateParam(3, ILabelService)
], SourceWidget);
export { isNestedVariable, isDebugSession, $100, ReplEvaluationInputsRenderer, ReplGroupRenderer, ReplEvaluationResultsRenderer, ReplOutputElementRenderer, ReplVariablesRenderer, ReplRawObjectsRenderer, ReplDelegate, ReplDataSource, ReplAccessibilityProvider, SourceWidget };
