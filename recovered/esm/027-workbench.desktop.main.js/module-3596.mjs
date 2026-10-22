// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/outline/documentSymbolsTree.ts
import { OutlineElement, OutlineGroup, OutlineModel } from "./module-0691.mjs";
import { SymbolKinds, getAriaLabelForSymbol, symbolKindNames } from "./module-0164.mjs";
import { fillInSymbolsDragData } from "./module-0273.mjs";
import { fillEditorsDragData } from "./module-1381.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { withSelection } from "./module-0272.mjs";
import { $, append, hide, show } from "./module-0075.mjs";
import { HighlightedLabel } from "./module-0639.mjs";
import { createMatches } from "./module-0453.mjs";
import { IconLabel } from "./module-0640.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { listErrorForeground, listWarningForeground } from "./module-0232.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { safeIntl } from "./module-0120.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/codeEditor/browser/outline/documentSymbolsTree.ts
var DocumentSymbolNavigationLabelProvider = class {
  getKeyboardNavigationLabel(element) {
    if (element instanceof OutlineGroup) {
      return element.label;
    } else {
      return element.symbol.name;
    }
  }
};

var DocumentSymbolAccessibilityProvider = class {
  constructor(_ariaLabel) {
    this._ariaLabel = _ariaLabel;
  }
  getWidgetAriaLabel() {
    return this._ariaLabel;
  }
  getAriaLabel(element) {
    if (element instanceof OutlineGroup) {
      return element.label;
    } else {
      return getAriaLabelForSymbol(element.symbol.name, element.symbol.kind);
    }
  }
};

var DocumentSymbolIdentityProvider = class {
  getId(element) {
    return element.id;
  }
};

var DocumentSymbolDragAndDrop = class {
  constructor(_instantiationService) {
    this._instantiationService = _instantiationService;
  }
  getDragURI(element) {
    const resource = OutlineModel.get(element)?.uri;
    if (!resource) {
      return null;
    }
    if (element instanceof OutlineElement) {
      const symbolUri = symbolRangeUri(resource, element.symbol);
      return symbolUri.fsPath + (symbolUri.fragment ? "#" + symbolUri.fragment : "");
    } else {
      return resource.fsPath;
    }
  }
  getDragLabel(elements, originalEvent) {
    if (elements.length !== 1) {
      return void 0;
    }
    const element = elements[0];
    return element instanceof OutlineElement ? element.symbol.name : element.label;
  }
  onDragStart(data, originalEvent) {
    const elements = data.elements;
    const item = elements[0];
    if (!item || !originalEvent.dataTransfer) {
      return;
    }
    const resource = OutlineModel.get(item)?.uri;
    if (!resource) {
      return;
    }
    const outlineElements = item instanceof OutlineElement ? [item] : Array.from(item.children.values());
    fillInSymbolsDragData(outlineElements.map((oe) => ({
      name: oe.symbol.name,
      fsPath: resource.fsPath,
      range: oe.symbol.range,
      kind: oe.symbol.kind
    })), originalEvent);
    this._instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, outlineElements.map((oe) => ({
      resource,
      selection: oe.symbol.range
    })), originalEvent));
  }
  onDragOver() {
    return false;
  }
  drop() {
  }
  dispose() {
  }
};

DocumentSymbolDragAndDrop = __decorateClass([
  __decorateParam(0, IInstantiationService)
], DocumentSymbolDragAndDrop);

function symbolRangeUri(resource, symbol) {
  return withSelection(resource, symbol.range);
}

var DocumentSymbolGroupTemplate = class {
  constructor(labelContainer, label3) {
    this.labelContainer = labelContainer;
    this.label = label3;
  }
  static {
    this.id = "DocumentSymbolGroupTemplate";
  }
  dispose() {
    this.label.dispose();
  }
};

var DocumentSymbolTemplate = class {
  constructor(container3, iconLabel, iconClass, decoration3) {
    this.container = container3;
    this.iconLabel = iconLabel;
    this.iconClass = iconClass;
    this.decoration = decoration3;
  }
  static {
    this.id = "DocumentSymbolTemplate";
  }
};

var DocumentSymbolVirtualDelegate = class {
  getHeight(_element) {
    return 22;
  }
  getTemplateId(element) {
    return element instanceof OutlineGroup ? DocumentSymbolGroupTemplate.id : DocumentSymbolTemplate.id;
  }
};

var DocumentSymbolGroupRenderer = class {
  constructor() {
    this.templateId = DocumentSymbolGroupTemplate.id;
  }
  renderTemplate(container3) {
    const labelContainer = $(".outline-element-label");
    container3.classList.add("outline-element");
    append(container3, labelContainer);
    return new DocumentSymbolGroupTemplate(labelContainer, new HighlightedLabel(labelContainer));
  }
  renderElement(node, _index, template2) {
    template2.label.set(node.element.label, createMatches(node.filterData));
  }
  disposeTemplate(_template) {
    _template.dispose();
  }
};

var DocumentSymbolRenderer = class {
  constructor(_renderMarker, target, _configurationService, _themeService) {
    this._renderMarker = _renderMarker;
    this._configurationService = _configurationService;
    this._themeService = _themeService;
    this.templateId = DocumentSymbolTemplate.id;
  }
  renderTemplate(container3) {
    container3.classList.add("outline-element");
    const iconLabel = new IconLabel(container3, { supportHighlights: true });
    const iconClass = $(".outline-element-icon");
    const decoration3 = $(".outline-element-decoration");
    container3.prepend(iconClass);
    container3.appendChild(decoration3);
    return new DocumentSymbolTemplate(container3, iconLabel, iconClass, decoration3);
  }
  renderElement(node, _index, template2) {
    const { element } = node;
    const extraClasses = ["nowrap"];
    const options3 = {
      matches: createMatches(node.filterData),
      labelEscapeNewLines: true,
      extraClasses,
      title: localize(13811, null, element.symbol.name, symbolKindNames[element.symbol.kind])
    };
    if (this._configurationService.getValue("outline.icons" /* icons */)) {
      template2.iconClass.className = "";
      template2.iconClass.classList.add("outline-element-icon", "inline", "codicon-colored", ...ThemeIcon.asClassNameArray(SymbolKinds.toIcon(element.symbol.kind)));
    }
    if (element.symbol.tags.indexOf(1 /* Deprecated */) >= 0) {
      extraClasses.push(`deprecated`);
      options3.matches = [];
    }
    template2.iconLabel.setLabel(element.symbol.name, element.symbol.detail, options3);
    if (this._renderMarker) {
      this._renderMarkerInfo(element, template2);
    }
  }
  _renderMarkerInfo(element, template2) {
    if (!element.marker) {
      hide(template2.decoration);
      template2.container.style.removeProperty("--outline-element-color");
      return;
    }
    const { count: count2, topSev } = element.marker;
    const color2 = this._themeService.getColorTheme().getColor(topSev === 8 /* Error */ ? listErrorForeground : listWarningForeground);
    const cssColor = color2 ? color2.toString() : "inherit";
    const problem = this._configurationService.getValue("problems.visibility");
    const configProblems = this._configurationService.getValue("outline.problems.colors" /* problemsColors */);
    if (!problem || !configProblems) {
      template2.container.style.removeProperty("--outline-element-color");
    } else {
      template2.container.style.setProperty("--outline-element-color", cssColor);
    }
    if (problem === void 0) {
      return;
    }
    const configBadges = this._configurationService.getValue("outline.problems.badges" /* problemsBadges */);
    if (!configBadges || !problem) {
      hide(template2.decoration);
    } else if (count2 > 0) {
      show(template2.decoration);
      template2.decoration.classList.remove("bubble");
      template2.decoration.textContent = count2 < 10 ? count2.toString() : "+9";
      template2.decoration.title = count2 === 1 ? localize(13808, null) : localize(13810, null, count2);
      template2.decoration.style.setProperty("--outline-element-color", cssColor);
    } else {
      show(template2.decoration);
      template2.decoration.classList.add("bubble");
      template2.decoration.textContent = "\uEA71";
      template2.decoration.title = localize(13809, null);
      template2.decoration.style.setProperty("--outline-element-color", cssColor);
    }
  }
  disposeTemplate(_template) {
    _template.iconLabel.dispose();
  }
};

DocumentSymbolRenderer = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IThemeService)
], DocumentSymbolRenderer);

var DocumentSymbolFilter = class {
  constructor(_prefix, _textResourceConfigService) {
    this._prefix = _prefix;
    this._textResourceConfigService = _textResourceConfigService;
  }
  static {
    this.kindToConfigName = Object.freeze({
      [0 /* File */]: "showFiles",
      [1 /* Module */]: "showModules",
      [2 /* Namespace */]: "showNamespaces",
      [3 /* Package */]: "showPackages",
      [4 /* Class */]: "showClasses",
      [5 /* Method */]: "showMethods",
      [6 /* Property */]: "showProperties",
      [7 /* Field */]: "showFields",
      [8 /* Constructor */]: "showConstructors",
      [9 /* Enum */]: "showEnums",
      [10 /* Interface */]: "showInterfaces",
      [11 /* Function */]: "showFunctions",
      [12 /* Variable */]: "showVariables",
      [13 /* Constant */]: "showConstants",
      [14 /* String */]: "showStrings",
      [15 /* Number */]: "showNumbers",
      [16 /* Boolean */]: "showBooleans",
      [17 /* Array */]: "showArrays",
      [18 /* Object */]: "showObjects",
      [19 /* Key */]: "showKeys",
      [20 /* Null */]: "showNull",
      [21 /* EnumMember */]: "showEnumMembers",
      [22 /* Struct */]: "showStructs",
      [23 /* Event */]: "showEvents",
      [24 /* Operator */]: "showOperators",
      [25 /* TypeParameter */]: "showTypeParameters"
    });
  }
  filter(element) {
    const outline = OutlineModel.get(element);
    if (!(element instanceof OutlineElement)) {
      return true;
    }
    const configName = DocumentSymbolFilter.kindToConfigName[element.symbol.kind];
    const configKey = `${this._prefix}.${configName}`;
    return this._textResourceConfigService.getValue(outline?.uri, configKey);
  }
};

DocumentSymbolFilter = __decorateClass([
  __decorateParam(1, ITextResourceConfigurationService)
], DocumentSymbolFilter);

var DocumentSymbolComparator = class {
  constructor() {
    this._collator = safeIntl.Collator(void 0, { numeric: true });
  }
  compareByPosition(a, b) {
    if (a instanceof OutlineGroup && b instanceof OutlineGroup) {
      return a.order - b.order;
    } else if (a instanceof OutlineElement && b instanceof OutlineElement) {
      return Range2.compareRangesUsingStarts(a.symbol.range, b.symbol.range) || this._collator.value.compare(a.symbol.name, b.symbol.name);
    }
    return 0;
  }
  compareByType(a, b) {
    if (a instanceof OutlineGroup && b instanceof OutlineGroup) {
      return a.order - b.order;
    } else if (a instanceof OutlineElement && b instanceof OutlineElement) {
      return a.symbol.kind - b.symbol.kind || this._collator.value.compare(a.symbol.name, b.symbol.name);
    }
    return 0;
  }
  compareByName(a, b) {
    if (a instanceof OutlineGroup && b instanceof OutlineGroup) {
      return a.order - b.order;
    } else if (a instanceof OutlineElement && b instanceof OutlineElement) {
      return this._collator.value.compare(a.symbol.name, b.symbol.name) || Range2.compareRangesUsingStarts(a.symbol.range, b.symbol.range);
    }
    return 0;
  }
};
export { symbolRangeUri, DocumentSymbolNavigationLabelProvider, DocumentSymbolAccessibilityProvider, DocumentSymbolIdentityProvider, DocumentSymbolDragAndDrop, DocumentSymbolGroupTemplate, DocumentSymbolTemplate, DocumentSymbolVirtualDelegate, DocumentSymbolGroupRenderer, DocumentSymbolRenderer, DocumentSymbolFilter, DocumentSymbolComparator };
