// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/callHierarchy/browser/callHierarchyTree.ts
import { compare } from "./module-0030.mjs";
import { Range2 } from "./module-0106.mjs";
import { CallHierarchyModel } from "./module-1215.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IconLabel } from "./module-0640.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { SymbolKinds } from "./module-0164.mjs";
import { createMatches } from "./module-0453.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/callHierarchy/browser/callHierarchyTree.ts
var Call = class {
  constructor(item, locations, model, parent) {
    this.item = item;
    this.locations = locations;
    this.model = model;
    this.parent = parent;
  }
  static compare(a, b) {
    let res = compare(a.item.uri.toString(), b.item.uri.toString());
    if (res === 0) {
      res = Range2.compareRangesUsingStarts(a.item.range, b.item.range);
    }
    return res;
  }
};

var DataSource2 = class {
  constructor(getDirection) {
    this.getDirection = getDirection;
  }
  hasChildren() {
    return true;
  }
  async getChildren(element) {
    if (element instanceof CallHierarchyModel) {
      return element.roots.map((root) => new Call(root, void 0, element, void 0));
    }
    const { model, item } = element;
    if (this.getDirection() === "outgoingCalls" /* CallsFrom */) {
      return (await model.resolveOutgoingCalls(item, CancellationToken.None)).map((call) => {
        return new Call(
          call.to,
          call.fromRanges.map((range2) => ({ range: range2, uri: item.uri })),
          model,
          element
        );
      });
    } else {
      return (await model.resolveIncomingCalls(item, CancellationToken.None)).map((call) => {
        return new Call(
          call.from,
          call.fromRanges.map((range2) => ({ range: range2, uri: call.from.uri })),
          model,
          element
        );
      });
    }
  }
};

var Sorter2 = class {
  compare(element, otherElement) {
    return Call.compare(element, otherElement);
  }
};

var IdentityProvider3 = class {
  constructor(getDirection) {
    this.getDirection = getDirection;
  }
  getId(element) {
    let res = this.getDirection() + JSON.stringify(element.item.uri) + JSON.stringify(element.item.range);
    if (element.parent) {
      res += this.getId(element.parent);
    }
    return res;
  }
};

var CallRenderingTemplate = class {
  constructor(icon2, label3) {
    this.icon = icon2;
    this.label = label3;
  }
};

var CallRenderer = class _CallRenderer {
  constructor() {
    this.templateId = _CallRenderer.id;
  }
  static {
    this.id = "CallRenderer";
  }
  renderTemplate(container3) {
    container3.classList.add("callhierarchy-element");
    const icon2 = document.createElement("div");
    container3.appendChild(icon2);
    const label3 = new IconLabel(container3, { supportHighlights: true });
    return new CallRenderingTemplate(icon2, label3);
  }
  renderElement(node, _index, template2) {
    const { element, filterData } = node;
    const deprecated = element.item.tags?.includes(1 /* Deprecated */);
    template2.icon.className = "";
    template2.icon.classList.add("inline", "codicon-colored", ...ThemeIcon.asClassNameArray(SymbolKinds.toIcon(element.item.kind)));
    template2.label.setLabel(
      element.item.name,
      element.item.detail,
      { labelEscapeNewLines: true, matches: createMatches(filterData), strikethrough: deprecated }
    );
  }
  disposeTemplate(template2) {
    template2.label.dispose();
  }
};

var VirtualDelegate2 = class {
  getHeight(_element) {
    return 22;
  }
  getTemplateId(_element) {
    return CallRenderer.id;
  }
};

var AccessibilityProvider4 = class {
  constructor(getDirection) {
    this.getDirection = getDirection;
  }
  getWidgetAriaLabel() {
    return localize(8383, null);
  }
  getAriaLabel(element) {
    if (this.getDirection() === "outgoingCalls" /* CallsFrom */) {
      return localize(8381, null, element.item.name);
    } else {
      return localize(8382, null, element.item.name);
    }
  }
};
export { Call, DataSource2, Sorter2, IdentityProvider3, CallRenderingTemplate, CallRenderer, VirtualDelegate2, AccessibilityProvider4 };
