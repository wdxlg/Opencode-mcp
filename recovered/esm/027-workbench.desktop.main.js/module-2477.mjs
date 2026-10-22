// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariablesTree.ts
import { $, append } from "./module-0075.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { DebugExpressionRenderer } from "./module-2408.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { observableValue } from "./module-0048.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariablesTree.ts
var $66 = $;

var MAX_VALUE_RENDER_LENGTH_IN_VIEWLET2 = 1024;

var NOTEBOOK_TITLE = localize2(17487, "Notebook Variables");

var REPL_TITLE = localize2(17488, "REPL Variables");

var NotebookVariablesDelegate = class {
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    return NotebookVariableRenderer.ID;
  }
};

var NotebookVariableRenderer = class {
  static {
    this.ID = "variableElement";
  }
  get templateId() {
    return NotebookVariableRenderer.ID;
  }
  constructor(instantiationService) {
    this.expressionRenderer = instantiationService.createInstance(DebugExpressionRenderer);
  }
  renderTemplate(container3) {
    const expression = append(container3, $66(".expression"));
    const name = append(expression, $66("span.name"));
    const value2 = append(expression, $66("span.value"));
    const template2 = { expression, name, value: value2, elementDisposables: new DisposableStore() };
    return template2;
  }
  renderElement(element, _index, data) {
    const text2 = element.element.value.trim() !== "" ? `${element.element.name}:` : element.element.name;
    data.name.textContent = text2;
    data.name.title = element.element.type ?? "";
    data.elementDisposables.add(this.expressionRenderer.renderValue(data.value, element.element, {
      colorize: true,
      maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET2,
      session: void 0
    }));
  }
  disposeElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
  }
};

NotebookVariableRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], NotebookVariableRenderer);

var NotebookVariableAccessibilityProvider = class {
  constructor() {
    this._widgetAriaLabel = observableValue("widgetAriaLabel", NOTEBOOK_TITLE.value);
  }
  getWidgetAriaLabel() {
    return this._widgetAriaLabel;
  }
  updateWidgetAriaLabel(label3) {
    this._widgetAriaLabel.set(label3, void 0);
  }
  getAriaLabel(element) {
    return localize(17489, null, element.name, element.value);
  }
};
export { $66, MAX_VALUE_RENDER_LENGTH_IN_VIEWLET2, NOTEBOOK_TITLE, REPL_TITLE, NotebookVariablesDelegate, NotebookVariableRenderer, NotebookVariableAccessibilityProvider };
