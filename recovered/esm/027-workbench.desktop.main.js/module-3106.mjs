// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/bulkEdit/browser/preview/bulkEditTree.ts
import { ResourceFileEdit } from "./module-0537.mjs";
import { BulkFileOperations } from "./module-3105.mjs";
import { TextModel } from "./module-0423.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { Range2 } from "./module-0106.mjs";
import { SnippetParser } from "./module-0544.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { compare } from "./module-0030.mjs";
import { localize } from "./module-0001.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IconLabel } from "./module-0640.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { URI } from "./module-0032.mjs";
import { asCSSUrl } from "./module-0449.mjs";
import { createMatches } from "./module-0453.mjs";
import { IThemeService } from "./module-0287.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Checkbox } from "./module-0549.mjs";
import { defaultCheckboxStyles } from "./module-0513.mjs";
import { HighlightedLabel } from "./module-0639.mjs";
import { basename2 } from "./module-0034.mjs";


// src/vs/workbench/contrib/bulkEdit/browser/preview/bulkEditTree.ts
var CategoryElement = class {
  constructor(parent, category11) {
    this.parent = parent;
    this.category = category11;
  }
  isChecked() {
    const model = this.parent;
    let checked = true;
    for (const file of this.category.fileOperations) {
      for (const edit3 of file.originalEdits.values()) {
        checked = checked && model.checked.isChecked(edit3);
      }
    }
    return checked;
  }
  setChecked(value2) {
    const model = this.parent;
    for (const file of this.category.fileOperations) {
      for (const edit3 of file.originalEdits.values()) {
        model.checked.updateChecked(edit3, value2);
      }
    }
  }
};

var FileElement2 = class {
  constructor(parent, edit3) {
    this.parent = parent;
    this.edit = edit3;
  }
  isChecked() {
    const model = this.parent instanceof CategoryElement ? this.parent.parent : this.parent;
    let checked = true;
    if (this.edit.type === 1 /* TextEdit */) {
      checked = !this.edit.textEdits.every((edit3) => !model.checked.isChecked(edit3.textEdit));
    }
    for (const edit3 of this.edit.originalEdits.values()) {
      if (edit3 instanceof ResourceFileEdit) {
        checked = checked && model.checked.isChecked(edit3);
      }
    }
    if (this.parent instanceof CategoryElement && this.edit.type === 1 /* TextEdit */) {
      for (const category11 of model.categories) {
        for (const file of category11.fileOperations) {
          if (file.uri.toString() === this.edit.uri.toString()) {
            for (const edit3 of file.originalEdits.values()) {
              if (edit3 instanceof ResourceFileEdit) {
                checked = checked && model.checked.isChecked(edit3);
              }
            }
          }
        }
      }
    }
    return checked;
  }
  setChecked(value2) {
    const model = this.parent instanceof CategoryElement ? this.parent.parent : this.parent;
    for (const edit3 of this.edit.originalEdits.values()) {
      model.checked.updateChecked(edit3, value2);
    }
    if (this.parent instanceof CategoryElement && this.edit.type !== 1 /* TextEdit */) {
      for (const category11 of model.categories) {
        for (const file of category11.fileOperations) {
          if (file.uri.toString() === this.edit.uri.toString()) {
            for (const edit3 of file.originalEdits.values()) {
              model.checked.updateChecked(edit3, value2);
            }
          }
        }
      }
    }
  }
  isDisabled() {
    if (this.parent instanceof CategoryElement && this.edit.type === 1 /* TextEdit */) {
      const model = this.parent.parent;
      let checked = true;
      for (const category11 of model.categories) {
        for (const file of category11.fileOperations) {
          if (file.uri.toString() === this.edit.uri.toString()) {
            for (const edit3 of file.originalEdits.values()) {
              if (edit3 instanceof ResourceFileEdit) {
                checked = checked && model.checked.isChecked(edit3);
              }
            }
          }
        }
      }
      return !checked;
    }
    return false;
  }
};

var TextEditElement = class {
  constructor(parent, idx, edit3, prefix, selecting, inserting, suffix) {
    this.parent = parent;
    this.idx = idx;
    this.edit = edit3;
    this.prefix = prefix;
    this.selecting = selecting;
    this.inserting = inserting;
    this.suffix = suffix;
  }
  isChecked() {
    let model = this.parent.parent;
    if (model instanceof CategoryElement) {
      model = model.parent;
    }
    return model.checked.isChecked(this.edit.textEdit);
  }
  setChecked(value2) {
    let model = this.parent.parent;
    if (model instanceof CategoryElement) {
      model = model.parent;
    }
    model.checked.updateChecked(this.edit.textEdit, value2);
    if (value2) {
      for (const edit3 of this.parent.edit.originalEdits.values()) {
        if (edit3 instanceof ResourceFileEdit) {
          model.checked.updateChecked(edit3, value2);
        }
      }
    }
  }
  isDisabled() {
    return this.parent.isDisabled();
  }
};

var BulkEditDataSource = class {
  constructor(_textModelService, _instantiationService) {
    this._textModelService = _textModelService;
    this._instantiationService = _instantiationService;
    this.groupByFile = true;
  }
  hasChildren(element) {
    if (element instanceof FileElement2) {
      return element.edit.textEdits.length > 0;
    }
    if (element instanceof TextEditElement) {
      return false;
    }
    return true;
  }
  async getChildren(element) {
    if (element instanceof BulkFileOperations) {
      return this.groupByFile ? element.fileOperations.map((op) => new FileElement2(element, op)) : element.categories.map((cat) => new CategoryElement(element, cat));
    }
    if (element instanceof CategoryElement) {
      return Array.from(element.category.fileOperations, (op) => new FileElement2(element, op));
    }
    if (element instanceof FileElement2 && element.edit.textEdits.length > 0) {
      let textModel;
      let textModelDisposable;
      try {
        const ref = await this._textModelService.createModelReference(element.edit.uri);
        textModel = ref.object.textEditorModel;
        textModelDisposable = ref;
      } catch {
        textModel = this._instantiationService.createInstance(TextModel, "", PLAINTEXT_LANGUAGE_ID, TextModel.DEFAULT_CREATION_OPTIONS, null);
        textModelDisposable = textModel;
      }
      const result = element.edit.textEdits.map((edit3, idx) => {
        const range2 = textModel.validateRange(edit3.textEdit.textEdit.range);
        const startTokens = textModel.tokenization.getLineTokens(range2.startLineNumber);
        let prefixLen = 23;
        for (let idx2 = startTokens.findTokenIndexAtOffset(range2.startColumn - 1) - 1; prefixLen < 50 && idx2 >= 0; idx2--) {
          prefixLen = range2.startColumn - startTokens.getStartOffset(idx2);
        }
        const endTokens = textModel.tokenization.getLineTokens(range2.endLineNumber);
        let suffixLen = 0;
        for (let idx2 = endTokens.findTokenIndexAtOffset(range2.endColumn - 1); suffixLen < 50 && idx2 < endTokens.getCount(); idx2++) {
          suffixLen += endTokens.getEndOffset(idx2) - endTokens.getStartOffset(idx2);
        }
        return new TextEditElement(
          element,
          idx,
          edit3,
          textModel.getValueInRange(new Range2(range2.startLineNumber, range2.startColumn - prefixLen, range2.startLineNumber, range2.startColumn)),
          textModel.getValueInRange(range2),
          !edit3.textEdit.textEdit.insertAsSnippet ? edit3.textEdit.textEdit.text : SnippetParser.asInsertText(edit3.textEdit.textEdit.text),
          textModel.getValueInRange(new Range2(range2.endLineNumber, range2.endColumn, range2.endLineNumber, range2.endColumn + suffixLen))
        );
      });
      textModelDisposable.dispose();
      return result;
    }
    return [];
  }
};

BulkEditDataSource = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IInstantiationService)
], BulkEditDataSource);

var BulkEditSorter = class {
  compare(a, b) {
    if (a instanceof FileElement2 && b instanceof FileElement2) {
      return compareBulkFileOperations(a.edit, b.edit);
    }
    if (a instanceof TextEditElement && b instanceof TextEditElement) {
      return Range2.compareRangesUsingStarts(a.edit.textEdit.textEdit.range, b.edit.textEdit.textEdit.range);
    }
    return 0;
  }
};

function compareBulkFileOperations(a, b) {
  return compare(a.uri.toString(), b.uri.toString());
}

var BulkEditAccessibilityProvider = class {
  constructor(_labelService) {
    this._labelService = _labelService;
  }
  getWidgetAriaLabel() {
    return localize(8358, null);
  }
  getRole(_element) {
    return "checkbox";
  }
  getAriaLabel(element) {
    if (element instanceof FileElement2) {
      if (element.edit.textEdits.length > 0) {
        if (element.edit.type & 8 /* Rename */ && element.edit.newUri) {
          return localize(
            8356,
            null,
            this._labelService.getUriLabel(element.edit.uri, { relative: true }),
            this._labelService.getUriLabel(element.edit.newUri, { relative: true })
          );
        } else if (element.edit.type & 2 /* Create */) {
          return localize(
            8349,
            null,
            this._labelService.getUriLabel(element.edit.uri, { relative: true })
          );
        } else if (element.edit.type & 4 /* Delete */) {
          return localize(
            8352,
            null,
            this._labelService.getUriLabel(element.edit.uri, { relative: true })
          );
        } else {
          return localize(
            8353,
            null,
            this._labelService.getUriLabel(element.edit.uri, { relative: true })
          );
        }
      } else {
        if (element.edit.type & 8 /* Rename */ && element.edit.newUri) {
          return localize(
            8355,
            null,
            this._labelService.getUriLabel(element.edit.uri, { relative: true }),
            this._labelService.getUriLabel(element.edit.newUri, { relative: true })
          );
        } else if (element.edit.type & 2 /* Create */) {
          return localize(
            8348,
            null,
            this._labelService.getUriLabel(element.edit.uri, { relative: true })
          );
        } else if (element.edit.type & 4 /* Delete */) {
          return localize(
            8351,
            null,
            this._labelService.getUriLabel(element.edit.uri, { relative: true })
          );
        }
      }
    }
    if (element instanceof TextEditElement) {
      if (element.selecting.length > 0 && element.inserting.length > 0) {
        return localize(8357, null, element.edit.textEdit.textEdit.range.startLineNumber, element.selecting, element.inserting);
      } else if (element.selecting.length > 0 && element.inserting.length === 0) {
        return localize(8350, null, element.edit.textEdit.textEdit.range.startLineNumber, element.selecting);
      } else if (element.selecting.length === 0 && element.inserting.length > 0) {
        return localize(8354, null, element.edit.textEdit.textEdit.range.startLineNumber, element.selecting);
      }
    }
    return null;
  }
};

BulkEditAccessibilityProvider = __decorateClass([
  __decorateParam(0, ILabelService)
], BulkEditAccessibilityProvider);

var BulkEditIdentityProvider = class {
  getId(element) {
    if (element instanceof FileElement2) {
      return element.edit.uri + (element.parent instanceof CategoryElement ? JSON.stringify(element.parent.category.metadata) : "");
    } else if (element instanceof TextEditElement) {
      return element.parent.edit.uri.toString() + element.idx;
    } else {
      return JSON.stringify(element.category.metadata);
    }
  }
};

var CategoryElementTemplate = class {
  constructor(container3) {
    container3.classList.add("category");
    this.icon = document.createElement("div");
    container3.appendChild(this.icon);
    this.label = new IconLabel(container3);
  }
};

var CategoryElementRenderer = class {
  constructor(_themeService) {
    this._themeService = _themeService;
    this.templateId = CategoryElementRenderer.id;
  }
  static {
    this.id = "CategoryElementRenderer";
  }
  renderTemplate(container3) {
    return new CategoryElementTemplate(container3);
  }
  renderElement(node, _index, template2) {
    template2.icon.style.setProperty("--background-dark", null);
    template2.icon.style.setProperty("--background-light", null);
    template2.icon.style.color = "";
    const { metadata } = node.element.category;
    if (ThemeIcon.isThemeIcon(metadata.iconPath)) {
      const className2 = ThemeIcon.asClassName(metadata.iconPath);
      template2.icon.className = className2 ? `theme-icon ${className2}` : "";
      template2.icon.style.color = metadata.iconPath.color ? this._themeService.getColorTheme().getColor(metadata.iconPath.color.id)?.toString() ?? "" : "";
    } else if (URI.isUri(metadata.iconPath)) {
      template2.icon.className = "uri-icon";
      template2.icon.style.setProperty("--background-dark", asCSSUrl(metadata.iconPath));
      template2.icon.style.setProperty("--background-light", asCSSUrl(metadata.iconPath));
    } else if (metadata.iconPath) {
      template2.icon.className = "uri-icon";
      template2.icon.style.setProperty("--background-dark", asCSSUrl(metadata.iconPath.dark));
      template2.icon.style.setProperty("--background-light", asCSSUrl(metadata.iconPath.light));
    }
    template2.label.setLabel(metadata.label, metadata.description, {
      descriptionMatches: createMatches(node.filterData)
    });
  }
  disposeTemplate(template2) {
    template2.label.dispose();
  }
};

CategoryElementRenderer = __decorateClass([
  __decorateParam(0, IThemeService)
], CategoryElementRenderer);

var FileElementTemplate = class {
  constructor(container3, resourceLabels, _labelService) {
    this._labelService = _labelService;
    this._disposables = new DisposableStore();
    this._localDisposables = new DisposableStore();
    this._checkbox = this._disposables.add(new Checkbox("", false, defaultCheckboxStyles));
    this._checkbox.domNode.classList.add("edit-checkbox");
    this._checkbox.domNode.tabIndex = -1;
    container3.appendChild(this._checkbox.domNode);
    this._label = resourceLabels.create(container3, { supportHighlights: true });
    this._details = document.createElement("span");
    this._details.className = "details";
    container3.appendChild(this._details);
  }
  dispose() {
    this._localDisposables.dispose();
    this._disposables.dispose();
    this._label.dispose();
  }
  set(element, score3) {
    this._localDisposables.clear();
    this._checkbox.checked = element.isChecked();
    if (element.isDisabled()) {
      this._checkbox.disable();
    } else {
      this._checkbox.enable();
    }
    this._checkbox.domNode.tabIndex = -1;
    this._localDisposables.add(this._checkbox.onChange(() => {
      element.setChecked(this._checkbox.checked);
    }));
    if (element.edit.type & 8 /* Rename */ && element.edit.newUri) {
      this._label.setResource({
        resource: element.edit.uri,
        name: localize(8362, null, this._labelService.getUriLabel(element.edit.uri, { relative: true }), this._labelService.getUriLabel(element.edit.newUri, { relative: true }))
      }, {
        fileDecorations: { colors: true, badges: false }
      });
      this._details.innerText = localize(8361, null);
    } else {
      const options3 = {
        matches: createMatches(score3),
        fileKind: 0 /* FILE */,
        fileDecorations: { colors: true, badges: false },
        extraClasses: []
      };
      if (element.edit.type & 2 /* Create */) {
        this._details.innerText = localize(8359, null);
      } else if (element.edit.type & 4 /* Delete */) {
        this._details.innerText = localize(8360, null);
        options3.extraClasses.push("delete");
      } else {
        this._details.innerText = "";
      }
      this._label.setFile(element.edit.uri, options3);
    }
  }
};

FileElementTemplate = __decorateClass([
  __decorateParam(2, ILabelService)
], FileElementTemplate);

var FileElementRenderer = class {
  constructor(_resourceLabels, _labelService) {
    this._resourceLabels = _resourceLabels;
    this._labelService = _labelService;
    this.templateId = FileElementRenderer.id;
  }
  static {
    this.id = "FileElementRenderer";
  }
  renderTemplate(container3) {
    return new FileElementTemplate(container3, this._resourceLabels, this._labelService);
  }
  renderElement(node, _index, template2) {
    template2.set(node.element, node.filterData);
  }
  disposeTemplate(template2) {
    template2.dispose();
  }
};

FileElementRenderer = __decorateClass([
  __decorateParam(1, ILabelService)
], FileElementRenderer);

var TextEditElementTemplate = class {
  constructor(container3, _themeService) {
    this._themeService = _themeService;
    this._disposables = new DisposableStore();
    this._localDisposables = new DisposableStore();
    container3.classList.add("textedit");
    this._checkbox = this._disposables.add(new Checkbox("", false, defaultCheckboxStyles));
    this._checkbox.domNode.classList.add("edit-checkbox");
    this._checkbox.domNode.tabIndex = -1;
    container3.appendChild(this._checkbox.domNode);
    this._icon = document.createElement("div");
    container3.appendChild(this._icon);
    this._label = this._disposables.add(new HighlightedLabel(container3));
  }
  dispose() {
    this._localDisposables.dispose();
    this._disposables.dispose();
  }
  set(element) {
    this._localDisposables.clear();
    this._localDisposables.add(this._checkbox.onChange(() => {
      element.setChecked(this._checkbox.checked);
    }));
    this._checkbox.checked = element.isChecked();
    if (element.isDisabled()) {
      this._checkbox.disable();
    } else {
      this._checkbox.enable();
    }
    this._checkbox.domNode.tabIndex = -1;
    let value2 = "";
    value2 += element.prefix;
    value2 += element.selecting;
    value2 += element.inserting;
    value2 += element.suffix;
    const selectHighlight = { start: element.prefix.length, end: element.prefix.length + element.selecting.length, extraClasses: ["remove"] };
    const insertHighlight = { start: selectHighlight.end, end: selectHighlight.end + element.inserting.length, extraClasses: ["insert"] };
    let title;
    const { metadata } = element.edit.textEdit;
    if (metadata && metadata.description) {
      title = localize(8363, null, metadata.label, metadata.description);
    } else if (metadata) {
      title = metadata.label;
    }
    const iconPath = metadata?.iconPath;
    if (!iconPath) {
      this._icon.style.display = "none";
    } else {
      this._icon.style.display = "block";
      this._icon.style.setProperty("--background-dark", null);
      this._icon.style.setProperty("--background-light", null);
      if (ThemeIcon.isThemeIcon(iconPath)) {
        const className2 = ThemeIcon.asClassName(iconPath);
        this._icon.className = className2 ? `theme-icon ${className2}` : "";
        this._icon.style.color = iconPath.color ? this._themeService.getColorTheme().getColor(iconPath.color.id)?.toString() ?? "" : "";
      } else if (URI.isUri(iconPath)) {
        this._icon.className = "uri-icon";
        this._icon.style.setProperty("--background-dark", asCSSUrl(iconPath));
        this._icon.style.setProperty("--background-light", asCSSUrl(iconPath));
      } else {
        this._icon.className = "uri-icon";
        this._icon.style.setProperty("--background-dark", asCSSUrl(iconPath.dark));
        this._icon.style.setProperty("--background-light", asCSSUrl(iconPath.light));
      }
    }
    this._label.set(value2, [selectHighlight, insertHighlight], title, true);
    this._icon.title = title || "";
  }
};

TextEditElementTemplate = __decorateClass([
  __decorateParam(1, IThemeService)
], TextEditElementTemplate);

var TextEditElementRenderer = class {
  constructor(_themeService) {
    this._themeService = _themeService;
    this.templateId = TextEditElementRenderer.id;
  }
  static {
    this.id = "TextEditElementRenderer";
  }
  renderTemplate(container3) {
    return new TextEditElementTemplate(container3, this._themeService);
  }
  renderElement({ element }, _index, template2) {
    template2.set(element);
  }
  disposeTemplate(template2) {
    template2.dispose();
  }
};

TextEditElementRenderer = __decorateClass([
  __decorateParam(0, IThemeService)
], TextEditElementRenderer);

var BulkEditDelegate = class {
  getHeight() {
    return 23;
  }
  getTemplateId(element) {
    if (element instanceof FileElement2) {
      return FileElementRenderer.id;
    } else if (element instanceof TextEditElement) {
      return TextEditElementRenderer.id;
    } else {
      return CategoryElementRenderer.id;
    }
  }
};

var BulkEditNaviLabelProvider = class {
  getKeyboardNavigationLabel(element) {
    if (element instanceof FileElement2) {
      return basename2(element.edit.uri);
    } else if (element instanceof CategoryElement) {
      return element.category.metadata.label;
    }
    return void 0;
  }
};
export { compareBulkFileOperations, CategoryElement, FileElement2, TextEditElement, BulkEditDataSource, BulkEditSorter, BulkEditAccessibilityProvider, BulkEditIdentityProvider, CategoryElementTemplate, CategoryElementRenderer, FileElementTemplate, FileElementRenderer, TextEditElementTemplate, TextEditElementRenderer, BulkEditDelegate, BulkEditNaviLabelProvider };
