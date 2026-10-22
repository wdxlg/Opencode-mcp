// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/iconLabel/iconLabel.ts
import { equals4 } from "./module-0098.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { $, after, append, isAncestor, isHTMLElement } from "./module-0075.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { asCSSUrl } from "./module-0449.mjs";
import { HighlightedLabel } from "./module-0639.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";
import { Range3 } from "./module-0455.mjs";


// src/vs/base/browser/ui/iconLabel/iconLabel.ts
var FastLabelNode = class {
  constructor(_element) {
    this._element = _element;
  }
  get element() {
    return this._element;
  }
  set textContent(content) {
    if (this.disposed || content === this._textContent) {
      return;
    }
    this._textContent = content;
    this._element.textContent = content;
  }
  set classNames(classNames2) {
    if (this.disposed || equals4(classNames2, this._classNames)) {
      return;
    }
    this._classNames = classNames2;
    this._element.classList.value = "";
    this._element.classList.add(...classNames2);
  }
  set empty(empty) {
    if (this.disposed || empty === this._empty) {
      return;
    }
    this._empty = empty;
    this._element.style.marginLeft = empty ? "0" : "";
  }
  dispose() {
    this.disposed = true;
  }
};

var IconLabel = class extends Disposable {
  constructor(container2, options3) {
    super();
    this.customHovers = /* @__PURE__ */ new Map();
    this.creationOptions = options3;
    this.domNode = this._register(new FastLabelNode(append(container2, $(".monaco-icon-label"))));
    this.labelContainer = append(this.domNode.element, $(".monaco-icon-label-container"));
    this.nameContainer = append(this.labelContainer, $("span.monaco-icon-name-container"));
    if (options3?.supportHighlights || options3?.supportIcons) {
      this.nameNode = this._register(new LabelWithHighlights(this.nameContainer, !!options3.supportIcons));
    } else {
      this.nameNode = new Label(this.nameContainer);
    }
    this.hoverDelegate = options3?.hoverDelegate ?? getDefaultHoverDelegate("mouse");
  }
  get element() {
    return this.domNode.element;
  }
  setLabel(label3, description, options3) {
    const labelClasses = ["monaco-icon-label"];
    const containerClasses = ["monaco-icon-label-container"];
    let ariaLabel = "";
    if (options3) {
      if (options3.extraClasses) {
        labelClasses.push(...options3.extraClasses);
      }
      if (options3.bold) {
        labelClasses.push("bold");
      }
      if (options3.italic) {
        labelClasses.push("italic");
      }
      if (options3.strikethrough) {
        labelClasses.push("strikethrough");
      }
      if (options3.disabledCommand) {
        containerClasses.push("disabled");
      }
      if (options3.title) {
        if (typeof options3.title === "string") {
          ariaLabel += options3.title;
        } else {
          ariaLabel += label3;
        }
      }
    }
    const existingIconNode = this.domNode.element.querySelector(".monaco-icon-label-iconpath");
    if (options3?.iconPath) {
      let iconNode;
      if (!existingIconNode || !isHTMLElement(existingIconNode)) {
        iconNode = $(".monaco-icon-label-iconpath");
        this.domNode.element.prepend(iconNode);
      } else {
        iconNode = existingIconNode;
      }
      if (ThemeIcon.isThemeIcon(options3.iconPath)) {
        const iconClass = ThemeIcon.asClassName(options3.iconPath);
        iconNode.className = `monaco-icon-label-iconpath ${iconClass}`;
        iconNode.style.backgroundImage = "";
      } else {
        iconNode.style.backgroundImage = asCSSUrl(options3?.iconPath);
      }
      iconNode.style.backgroundRepeat = "no-repeat";
      iconNode.style.backgroundPosition = "center";
      iconNode.style.backgroundSize = "contain";
    } else if (existingIconNode) {
      existingIconNode.remove();
    }
    this.domNode.classNames = labelClasses;
    this.domNode.element.setAttribute("aria-label", ariaLabel);
    this.labelContainer.classList.value = "";
    this.labelContainer.classList.add(...containerClasses);
    this.setupHover(options3?.descriptionTitle ? this.labelContainer : this.element, options3?.title);
    this.nameNode.setLabel(label3, options3);
    if (description || this.descriptionNode) {
      const descriptionNode = this.getOrCreateDescriptionNode();
      if (descriptionNode instanceof HighlightedLabel) {
        const supportIcons = options3?.supportIcons ?? this.creationOptions?.supportIcons;
        descriptionNode.set(description || "", options3 ? options3.descriptionMatches : void 0, void 0, options3?.labelEscapeNewLines, supportIcons);
        this.setupHover(descriptionNode.element, options3?.descriptionTitle);
      } else {
        descriptionNode.textContent = description && options3?.labelEscapeNewLines ? HighlightedLabel.escapeNewLines(description, []) : description || "";
        this.setupHover(descriptionNode.element, options3?.descriptionTitle || "");
        descriptionNode.empty = !description;
      }
    }
    if (options3?.suffix || this.suffixNode) {
      const suffixNode = this.getOrCreateSuffixNode();
      suffixNode.textContent = options3?.suffix ?? "";
    }
  }
  setupHover(htmlElement, tooltip) {
    const previousCustomHover = this.customHovers.get(htmlElement);
    if (previousCustomHover) {
      previousCustomHover.dispose();
      this.customHovers.delete(htmlElement);
    }
    if (!tooltip) {
      htmlElement.removeAttribute("title");
      return;
    }
    let hoverTarget = htmlElement;
    if (this.creationOptions?.hoverTargetOverride) {
      if (!isAncestor(htmlElement, this.creationOptions.hoverTargetOverride)) {
        throw new Error("hoverTargetOverrride must be an ancestor of the htmlElement");
      }
      hoverTarget = this.creationOptions.hoverTargetOverride;
    }
    const hoverDisposable = getBaseLayerHoverDelegate().setupManagedHover(this.hoverDelegate, hoverTarget, tooltip);
    if (hoverDisposable) {
      this.customHovers.set(htmlElement, hoverDisposable);
    }
  }
  dispose() {
    super.dispose();
    for (const disposable of this.customHovers.values()) {
      disposable.dispose();
    }
    this.customHovers.clear();
  }
  getOrCreateSuffixNode() {
    if (!this.suffixNode) {
      const suffixContainer = this._register(new FastLabelNode(after(this.nameContainer, $("span.monaco-icon-suffix-container"))));
      this.suffixNode = this._register(new FastLabelNode(append(suffixContainer.element, $("span.label-suffix"))));
    }
    return this.suffixNode;
  }
  getOrCreateDescriptionNode() {
    if (!this.descriptionNode) {
      const descriptionContainer = this._register(new FastLabelNode(append(this.labelContainer, $("span.monaco-icon-description-container"))));
      if (this.creationOptions?.supportDescriptionHighlights) {
        this.descriptionNode = this._register(new HighlightedLabel(append(descriptionContainer.element, $("span.label-description"))));
      } else {
        this.descriptionNode = this._register(new FastLabelNode(append(descriptionContainer.element, $("span.label-description"))));
      }
    }
    return this.descriptionNode;
  }
};

var Label = class {
  constructor(container2) {
    this.container = container2;
    this.label = void 0;
    this.singleLabel = void 0;
  }
  setLabel(label3, options3) {
    if (this.label === label3 && equals4(this.options, options3)) {
      return;
    }
    this.label = label3;
    this.options = options3;
    if (typeof label3 === "string") {
      if (!this.singleLabel) {
        this.container.textContent = "";
        this.container.classList.remove("multiple");
        this.singleLabel = append(this.container, $("a.label-name", { id: options3?.domId }));
      }
      this.singleLabel.textContent = label3;
    } else {
      this.container.textContent = "";
      this.container.classList.add("multiple");
      this.singleLabel = void 0;
      for (let i2 = 0; i2 < label3.length; i2++) {
        const l = label3[i2];
        const id2 = options3?.domId && `${options3?.domId}_${i2}`;
        append(this.container, $("a.label-name", { id: id2, "data-icon-label-count": label3.length, "data-icon-label-index": i2, "role": "treeitem" }, l));
        if (i2 < label3.length - 1) {
          append(this.container, $("span.label-separator", void 0, options3?.separator || "/"));
        }
      }
    }
  }
};

function splitMatches(labels, separator2, matches2) {
  if (!matches2) {
    return void 0;
  }
  let labelStart = 0;
  return labels.map((label3) => {
    const labelRange = { start: labelStart, end: labelStart + label3.length };
    const result = matches2.map((match2) => Range3.intersect(labelRange, match2)).filter((range2) => !Range3.isEmpty(range2)).map(({ start, end }) => ({ start: start - labelStart, end: end - labelStart }));
    labelStart = labelRange.end + separator2.length;
    return result;
  });
}

var LabelWithHighlights = class extends Disposable {
  constructor(container2, supportIcons) {
    super();
    this.container = container2;
    this.supportIcons = supportIcons;
    this.label = void 0;
    this.singleLabel = void 0;
    this._labelDisposables = this._register(new DisposableStore());
  }
  setLabel(label3, options3) {
    if (this.label === label3 && equals4(this.options, options3)) {
      return;
    }
    this.label = label3;
    this.options = options3;
    const supportIcons = options3?.supportIcons ?? this.supportIcons;
    if (typeof label3 === "string") {
      if (!this.singleLabel) {
        this._labelDisposables.clear();
        this.container.textContent = "";
        this.container.classList.remove("multiple");
        this.singleLabel = this._labelDisposables.add(new HighlightedLabel(append(this.container, $("a.label-name", { id: options3?.domId }))));
      }
      this.singleLabel.set(label3, options3?.matches, void 0, options3?.labelEscapeNewLines, supportIcons);
    } else {
      this._labelDisposables.clear();
      this.container.textContent = "";
      this.container.classList.add("multiple");
      this.singleLabel = void 0;
      const separator2 = options3?.separator || "/";
      const matches2 = splitMatches(label3, separator2, options3?.matches);
      for (let i2 = 0; i2 < label3.length; i2++) {
        const l = label3[i2];
        const m = matches2 ? matches2[i2] : void 0;
        const id2 = options3?.domId && `${options3?.domId}_${i2}`;
        const name = $("a.label-name", { id: id2, "data-icon-label-count": label3.length, "data-icon-label-index": i2, "role": "treeitem" });
        const highlightedLabel = this._labelDisposables.add(new HighlightedLabel(append(this.container, name)));
        highlightedLabel.set(l, m, void 0, options3?.labelEscapeNewLines, supportIcons);
        if (i2 < label3.length - 1) {
          append(name, $("span.label-separator", void 0, separator2));
        }
      }
    }
  }
};
export { splitMatches, FastLabelNode, IconLabel, Label, LabelWithHighlights };
