// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/views/checkbox.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Checkbox } from "./module-0549.mjs";
import { defaultCheckboxStyles } from "./module-0513.mjs";
import { append } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/browser/parts/views/checkbox.ts
var CheckboxStateHandler = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidChangeCheckboxState = this._register(new Emitter());
    this.onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
  }
  setCheckboxState(node) {
    this._onDidChangeCheckboxState.fire([node]);
  }
};

var TreeItemCheckbox = class _TreeItemCheckbox extends Disposable {
  constructor(container2, checkboxStateHandler, hoverDelegate, hoverService) {
    super();
    this.checkboxStateHandler = checkboxStateHandler;
    this.hoverDelegate = hoverDelegate;
    this.hoverService = hoverService;
    this.checkboxContainer = container2;
  }
  static {
    this.checkboxClass = "custom-view-tree-node-item-checkbox";
  }
  render(node) {
    if (node.checkbox) {
      if (!this.toggle) {
        this.createCheckbox(node);
      } else {
        this.toggle.checked = node.checkbox.isChecked;
      }
    }
  }
  createCheckbox(node) {
    if (node.checkbox) {
      this.toggle = new Checkbox("", node.checkbox.isChecked, { ...defaultCheckboxStyles, size: 15 });
      this.setHover(node.checkbox);
      this.setAccessibilityInformation(node.checkbox);
      this.toggle.domNode.classList.add(_TreeItemCheckbox.checkboxClass);
      this.toggle.domNode.tabIndex = 1;
      append(this.checkboxContainer, this.toggle.domNode);
      this.registerListener(node);
    }
  }
  registerListener(node) {
    if (this.toggle) {
      this._register({ dispose: () => this.removeCheckbox() });
      this._register(this.toggle);
      this._register(this.toggle.onChange(() => {
        this.setCheckbox(node);
      }));
    }
  }
  setHover(checkbox) {
    if (this.toggle) {
      if (!this.hover) {
        this.hover = this._register(this.hoverService.setupManagedHover(this.hoverDelegate, this.toggle.domNode, this.checkboxHoverContent(checkbox)));
      } else {
        this.hover.update(checkbox.tooltip);
      }
    }
  }
  setCheckbox(node) {
    if (this.toggle && node.checkbox) {
      node.checkbox.isChecked = this.toggle.checked;
      this.setHover(node.checkbox);
      this.setAccessibilityInformation(node.checkbox);
      this.checkboxStateHandler.setCheckboxState(node);
    }
  }
  checkboxHoverContent(checkbox) {
    return checkbox.tooltip ? checkbox.tooltip : checkbox.isChecked ? localize(6963, null) : localize(6964, null);
  }
  setAccessibilityInformation(checkbox) {
    if (this.toggle && checkbox.accessibilityInformation) {
      this.toggle.setTitle(checkbox.accessibilityInformation.label);
      if (checkbox.accessibilityInformation.role) {
        this.toggle.domNode.role = checkbox.accessibilityInformation.role;
      }
    }
  }
  removeCheckbox() {
    const children = this.checkboxContainer.children;
    for (const child of children) {
      child.remove();
    }
  }
};
export { CheckboxStateHandler, TreeItemCheckbox };
