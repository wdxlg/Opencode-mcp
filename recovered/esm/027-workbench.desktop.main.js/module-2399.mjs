// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/baseDebugView.ts
import { $, EventType, addDisposableListener, addStandardDisposableListener, append, clearNode } from "./module-0075.mjs";
import { removeAnsiEscapeCodes } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDebugService } from "./module-1057.mjs";
import { IDebugVisualizerService } from "./module-1065.mjs";
import { DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { localize } from "./module-0001.mjs";
import { HighlightedLabel } from "./module-0639.mjs";
import { ActionBar } from "./module-0477.mjs";
import { createMatches } from "./module-0453.mjs";
import { Variable3 } from "./module-1064.mjs";
import { InputBox } from "./module-0600.mjs";
import { defaultInputBoxStyles } from "./module-0513.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/debug/browser/baseDebugView.ts
var $59 = $;

function renderViewTree(container3) {
  const treeContainer = $59(".");
  treeContainer.classList.add("debug-view-content", "file-icon-themable-tree");
  container3.appendChild(treeContainer);
  return treeContainer;
}

var splitExpressionOrScopeHighlights = (e, highlights) => {
  const nameEndsAt = e.name.length;
  const labelBeginsAt = e.name.length + 2;
  const name = [];
  const value2 = [];
  for (const hl of highlights) {
    if (hl.start < nameEndsAt) {
      name.push({ start: hl.start, end: Math.min(hl.end, nameEndsAt) });
    }
    if (hl.end > labelBeginsAt) {
      value2.push({ start: Math.max(hl.start - labelBeginsAt, 0), end: hl.end - labelBeginsAt });
    }
  }
  return { name, value: value2 };
};

var expressionAndScopeLabelProvider = {
  getKeyboardNavigationLabel(e) {
    const stripAnsi2 = e.getSession()?.rememberedCapabilities?.supportsANSIStyling;
    return `${e.name}: ${stripAnsi2 ? removeAnsiEscapeCodes(e.value) : e.value}`;
  }
};

var AbstractExpressionDataSource = class {
  constructor(debugService, debugVisualizer) {
    this.debugService = debugService;
    this.debugVisualizer = debugVisualizer;
  }
  async getChildren(element) {
    const vm = this.debugService.getViewModel();
    const children = await this.doGetChildren(element);
    return Promise.all(children.map(async (r2) => {
      const vizOrTree = vm.getVisualizedExpression(r2);
      if (typeof vizOrTree === "string") {
        const viz = await this.debugVisualizer.getVisualizedNodeFor(vizOrTree, r2);
        if (viz) {
          vm.setVisualizedExpression(r2, viz);
          return viz;
        }
      } else if (vizOrTree) {
        return vizOrTree;
      }
      return r2;
    }));
  }
};

AbstractExpressionDataSource = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IDebugVisualizerService)
], AbstractExpressionDataSource);

var AbstractExpressionsRenderer = class {
  constructor(debugService, contextViewService, hoverService) {
    this.debugService = debugService;
    this.contextViewService = contextViewService;
    this.hoverService = hoverService;
  }
  renderTemplate(container3) {
    const templateDisposable = new DisposableStore();
    const expression = append(container3, $59(".expression"));
    const name = append(expression, $59("span.name"));
    const lazyButton = append(expression, $59("span.lazy-button"));
    lazyButton.classList.add(...ThemeIcon.asClassNameArray(Codicon.eye));
    templateDisposable.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), lazyButton, localize(14101, null)));
    const type = append(expression, $59("span.type"));
    const value2 = append(expression, $59("span.value"));
    const label3 = templateDisposable.add(new HighlightedLabel(name));
    const inputBoxContainer = append(expression, $59(".inputBoxContainer"));
    let actionBar3;
    if (this.renderActionBar) {
      append(expression, $59(".span.actionbar-spacer"));
      actionBar3 = templateDisposable.add(new ActionBar(expression));
    }
    const template2 = { expression, name, type, value: value2, label: label3, inputBoxContainer, actionBar: actionBar3, elementDisposable: new DisposableStore(), templateDisposable, lazyButton, currentElement: void 0 };
    templateDisposable.add(addDisposableListener(lazyButton, EventType.CLICK, () => {
      if (template2.currentElement) {
        this.debugService.getViewModel().evaluateLazyExpression(template2.currentElement);
      }
    }));
    return template2;
  }
  renderExpressionElement(element, node, data) {
    data.currentElement = element;
    this.renderExpression(node.element, data, createMatches(node.filterData));
    if (data.actionBar) {
      this.renderActionBar(data.actionBar, element, data);
    }
    const selectedExpression = this.debugService.getViewModel().getSelectedExpression();
    if (element === selectedExpression?.expression || element instanceof Variable3 && element.errorMessage) {
      const options3 = this.getInputBoxOptions(element, !!selectedExpression?.settingWatch);
      if (options3) {
        data.elementDisposable.add(this.renderInputBox(data.name, data.value, data.inputBoxContainer, options3));
      }
    }
  }
  renderInputBox(nameElement, valueElement, inputBoxContainer, options3) {
    nameElement.style.display = "none";
    valueElement.style.display = "none";
    inputBoxContainer.style.display = "initial";
    clearNode(inputBoxContainer);
    const inputBox = new InputBox(inputBoxContainer, this.contextViewService, { ...options3, inputBoxStyles: defaultInputBoxStyles });
    inputBox.value = options3.initialValue;
    inputBox.focus();
    inputBox.select();
    const done = createSingleCallFunction((success, finishEditing) => {
      nameElement.style.display = "";
      valueElement.style.display = "";
      inputBoxContainer.style.display = "none";
      const value2 = inputBox.value;
      dispose(toDispose);
      if (finishEditing) {
        this.debugService.getViewModel().setSelectedExpression(void 0, false);
        options3.onFinish(value2, success);
      }
    });
    const toDispose = [
      inputBox,
      addStandardDisposableListener(inputBox.inputElement, EventType.KEY_DOWN, (e) => {
        const isEscape = e.equals(9 /* Escape */);
        const isEnter = e.equals(3 /* Enter */);
        if (isEscape || isEnter) {
          e.preventDefault();
          e.stopPropagation();
          done(isEnter, true);
        }
      }),
      addDisposableListener(inputBox.inputElement, EventType.BLUR, () => {
        done(true, true);
      }),
      addDisposableListener(inputBox.inputElement, EventType.CLICK, (e) => {
        e.preventDefault();
        e.stopPropagation();
      })
    ];
    return toDisposable(() => {
      done(false, false);
    });
  }
  disposeElement(node, index2, templateData) {
    templateData.elementDisposable.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposable.dispose();
    templateData.templateDisposable.dispose();
  }
};

AbstractExpressionsRenderer = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IContextViewService),
  __decorateParam(2, IHoverService)
], AbstractExpressionsRenderer);
export { renderViewTree, $59, splitExpressionOrScopeHighlights, expressionAndScopeLabelProvider, AbstractExpressionDataSource, AbstractExpressionsRenderer };
