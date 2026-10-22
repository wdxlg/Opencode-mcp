// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/typeHierarchy/browser/typeHierarchyTree.ts
import { compare } from "./module-0030.mjs";
import { Range2 } from "./module-0106.mjs";
import { TypeHierarchyModel } from "./module-1217.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IconLabel } from "./module-0640.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { SymbolKinds } from "./module-0164.mjs";
import { createMatches } from "./module-0453.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/typeHierarchy/browser/typeHierarchyTree.ts
var Type2 = class {
  constructor(item, model, parent) {
    this.item = item;
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

var DataSource3 = class {
  constructor(getDirection) {
    this.getDirection = getDirection;
  }
  hasChildren() {
    return true;
  }
  async getChildren(element) {
    if (element instanceof TypeHierarchyModel) {
      return element.roots.map((root) => new Type2(root, element, void 0));
    }
    const { model, item } = element;
    if (this.getDirection() === "supertypes" /* Supertypes */) {
      return (await model.provideSupertypes(item, CancellationToken.None)).map((item2) => {
        return new Type2(
          item2,
          model,
          element
        );
      });
    } else {
      return (await model.provideSubtypes(item, CancellationToken.None)).map((item2) => {
        return new Type2(
          item2,
          model,
          element
        );
      });
    }
  }
};

var Sorter3 = class {
  compare(element, otherElement) {
    return Type2.compare(element, otherElement);
  }
};

var IdentityProvider4 = class {
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

var TypeRenderingTemplate = class {
  constructor(icon2, label3) {
    this.icon = icon2;
    this.label = label3;
  }
};

var TypeRenderer = class _TypeRenderer {
  constructor() {
    this.templateId = _TypeRenderer.id;
  }
  static {
    this.id = "TypeRenderer";
  }
  renderTemplate(container3) {
    container3.classList.add("typehierarchy-element");
    const icon2 = document.createElement("div");
    container3.appendChild(icon2);
    const label3 = new IconLabel(container3, { supportHighlights: true });
    return new TypeRenderingTemplate(icon2, label3);
  }
  renderElement(node, _index, template2) {
    const { element, filterData } = node;
    const deprecated = element.item.tags?.includes(1 /* Deprecated */);
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

var VirtualDelegate3 = class {
  getHeight(_element) {
    return 22;
  }
  getTemplateId(_element) {
    return TypeRenderer.id;
  }
};

var AccessibilityProvider5 = class {
  constructor(getDirection) {
    this.getDirection = getDirection;
  }
  getWidgetAriaLabel() {
    return localize(21460, null);
  }
  getAriaLabel(element) {
    if (this.getDirection() === "supertypes" /* Supertypes */) {
      return localize(21459, null, element.item.name);
    } else {
      return localize(21458, null, element.item.name);
    }
  }
};
export { Type2, DataSource3, Sorter3, IdentityProvider4, TypeRenderingTemplate, TypeRenderer, VirtualDelegate3, AccessibilityProvider5 };
