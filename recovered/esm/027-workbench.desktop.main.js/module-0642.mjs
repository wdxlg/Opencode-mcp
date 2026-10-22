// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/gotoSymbol/browser/peek/referencesTree.ts
import { FileReferences, OneReference, ReferencesModel } from "./module-0637.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Disposable } from "./module-0012.mjs";
import { IconLabel } from "./module-0640.mjs";
import { CountBadge } from "./module-0638.mjs";
import { $, append } from "./module-0075.mjs";
import { defaultCountBadgeStyles } from "./module-0513.mjs";
import { localize } from "./module-0001.mjs";
import { ILabelService } from "./module-0641.mjs";
import { FuzzyScore, createMatches } from "./module-0453.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { HighlightedLabel } from "./module-0639.mjs";


// src/vs/editor/contrib/gotoSymbol/browser/peek/referencesTree.ts
var DataSource = class {
  constructor(_resolverService) {
    this._resolverService = _resolverService;
  }
  hasChildren(element) {
    if (element instanceof ReferencesModel) {
      return true;
    }
    if (element instanceof FileReferences) {
      return true;
    }
    return false;
  }
  getChildren(element) {
    if (element instanceof ReferencesModel) {
      return element.groups;
    }
    if (element instanceof FileReferences) {
      return element.resolve(this._resolverService).then((val) => {
        return val.children;
      });
    }
    throw new Error("bad tree");
  }
};

DataSource = __decorateClass([
  __decorateParam(0, ITextModelService)
], DataSource);

var Delegate = class {
  getHeight() {
    return 23;
  }
  getTemplateId(element) {
    if (element instanceof FileReferences) {
      return FileReferencesRenderer.id;
    } else {
      return OneReferenceRenderer.id;
    }
  }
};

var StringRepresentationProvider = class {
  constructor(_keybindingService) {
    this._keybindingService = _keybindingService;
  }
  getKeyboardNavigationLabel(element) {
    if (element instanceof OneReference) {
      const parts = element.parent.getPreview(element)?.preview(element.range);
      if (parts) {
        return parts.value;
      }
    }
    return basename2(element.uri);
  }
  mightProducePrintableCharacter(event) {
    return this._keybindingService.mightProducePrintableCharacter(event);
  }
};

StringRepresentationProvider = __decorateClass([
  __decorateParam(0, IKeybindingService)
], StringRepresentationProvider);

var IdentityProvider = class {
  getId(element) {
    return element instanceof OneReference ? element.id : element.uri;
  }
};

var FileReferencesTemplate = class extends Disposable {
  constructor(container3, _labelService) {
    super();
    this._labelService = _labelService;
    const parent = document.createElement("div");
    parent.classList.add("reference-file");
    this.file = this._register(new IconLabel(parent, { supportHighlights: true }));
    this.badge = this._register(new CountBadge(append(parent, $(".count")), {}, defaultCountBadgeStyles));
    container3.appendChild(parent);
  }
  set(element, matches2) {
    const parent = dirname2(element.uri);
    this.file.setLabel(
      this._labelService.getUriBasenameLabel(element.uri),
      this._labelService.getUriLabel(parent, { relative: true }),
      { title: this._labelService.getUriLabel(element.uri), matches: matches2 }
    );
    const len = element.children.length;
    this.badge.setCount(len);
    if (len > 1) {
      this.badge.setTitleFormat(localize(1257, null, len));
    } else {
      this.badge.setTitleFormat(localize(1256, null, len));
    }
  }
};

FileReferencesTemplate = __decorateClass([
  __decorateParam(1, ILabelService)
], FileReferencesTemplate);

var FileReferencesRenderer = class {
  constructor(_instantiationService) {
    this._instantiationService = _instantiationService;
    this.templateId = FileReferencesRenderer.id;
  }
  static {
    this.id = "FileReferencesRenderer";
  }
  renderTemplate(container3) {
    return this._instantiationService.createInstance(FileReferencesTemplate, container3);
  }
  renderElement(node, index2, template2) {
    template2.set(node.element, createMatches(node.filterData));
  }
  disposeTemplate(templateData) {
    templateData.dispose();
  }
};

FileReferencesRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], FileReferencesRenderer);

var OneReferenceTemplate = class extends Disposable {
  constructor(container3) {
    super();
    this.label = this._register(new HighlightedLabel(container3));
  }
  set(element, score3) {
    const preview = element.parent.getPreview(element)?.preview(element.range);
    if (!preview || !preview.value) {
      this.label.set(`${basename2(element.uri)}:${element.range.startLineNumber + 1}:${element.range.startColumn + 1}`);
    } else {
      const { value: value2, highlight } = preview;
      if (score3 && !FuzzyScore.isDefault(score3)) {
        this.label.element.classList.toggle("referenceMatch", false);
        this.label.set(value2, createMatches(score3));
      } else {
        this.label.element.classList.toggle("referenceMatch", true);
        this.label.set(value2, [highlight]);
      }
    }
  }
};

var OneReferenceRenderer = class _OneReferenceRenderer {
  constructor() {
    this.templateId = _OneReferenceRenderer.id;
  }
  static {
    this.id = "OneReferenceRenderer";
  }
  renderTemplate(container3) {
    return new OneReferenceTemplate(container3);
  }
  renderElement(node, index2, templateData) {
    templateData.set(node.element, node.filterData);
  }
  disposeTemplate(templateData) {
    templateData.dispose();
  }
};

var AccessibilityProvider = class {
  getWidgetAriaLabel() {
    return localize(1258, null);
  }
  getAriaLabel(element) {
    return element.ariaMessage;
  }
};
export { DataSource, Delegate, StringRepresentationProvider, IdentityProvider, FileReferencesTemplate, FileReferencesRenderer, OneReferenceTemplate, OneReferenceRenderer, AccessibilityProvider };
