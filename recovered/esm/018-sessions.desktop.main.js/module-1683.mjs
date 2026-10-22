// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/tree/quickTree.ts
import { QuickInput } from "./module-1560.mjs";
import { observableValue } from "./module-0048.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { getParentNodeState } from "./module-1678.mjs";
import { setTimeout0 } from "./module-0014.mjs";
import { autorun } from "./module-0052.mjs";


// src/vs/platform/quickinput/browser/tree/quickTree.ts
var QuickTree = class _QuickTree extends QuickInput {
  constructor(ui) {
    super(ui);
    this.type = "quickTree" /* QuickTree */;
    this._value = observableValue("value", "");
    this._ariaLabel = observableValue("ariaLabel", void 0);
    this._placeholder = observableValue("placeholder", void 0);
    this._matchOnDescription = observableValue("matchOnDescription", false);
    this._matchOnLabel = observableValue("matchOnLabel", true);
    this._sortByLabel = observableValue("sortByLabel", true);
    this._activeItems = observableValue("activeItems", []);
    this._itemTree = observableValue("itemTree", []);
    this.onDidChangeValue = Event2.fromObservable(this._value, this._store);
    this.onDidChangeActive = Event2.fromObservable(this._activeItems, this._store);
    this._onDidChangeCheckedLeafItems = this._register(new Emitter());
    this.onDidChangeCheckedLeafItems = this._onDidChangeCheckedLeafItems.event;
    this._onDidChangeCheckboxState = this._register(new Emitter());
    this.onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
    this._onDidAcceptEmitter = this._register(new Emitter());
    this.onDidAccept = Event2.any(ui.onDidAccept, this._onDidAcceptEmitter.event);
    this._registerAutoruns();
    this._register(ui.tree.onDidChangeCheckedLeafItems((e4) => this._onDidChangeCheckedLeafItems.fire(e4)));
    this._register(ui.tree.onDidChangeCheckboxState((e4) => this._onDidChangeCheckboxState.fire(e4.item)));
    this._register(ui.tree.tree.onDidChangeFocus((e4) => {
      this._activeItems.set(ui.tree.getActiveItems(), void 0);
    }));
  }
  static {
    this.DEFAULT_ARIA_LABEL = localize(3218, null);
  }
  get value() {
    return this._value.get();
  }
  set value(value2) {
    this._value.set(value2, void 0);
  }
  get ariaLabel() {
    return this._ariaLabel.get();
  }
  set ariaLabel(ariaLabel) {
    this._ariaLabel.set(ariaLabel, void 0);
  }
  get placeholder() {
    return this._placeholder.get();
  }
  set placeholder(placeholder) {
    this._placeholder.set(placeholder, void 0);
  }
  get matchOnDescription() {
    return this._matchOnDescription.get();
  }
  set matchOnDescription(matchOnDescription) {
    this._matchOnDescription.set(matchOnDescription, void 0);
  }
  get matchOnLabel() {
    return this._matchOnLabel.get();
  }
  set matchOnLabel(matchOnLabel) {
    this._matchOnLabel.set(matchOnLabel, void 0);
  }
  get sortByLabel() {
    return this._sortByLabel.get();
  }
  set sortByLabel(sortByLabel) {
    this._sortByLabel.set(sortByLabel, void 0);
  }
  get activeItems() {
    return this._activeItems.get();
  }
  set activeItems(activeItems) {
    this._activeItems.set(activeItems, void 0);
  }
  get itemTree() {
    return this._itemTree.get();
  }
  get onDidTriggerItemButton() {
    return this.ui.tree.onDidTriggerButton;
  }
  // TODO: Fix the any casting
  // eslint-disable-next-line local/code-no-any-casts, @typescript-eslint/no-explicit-any
  get checkedLeafItems() {
    return this.ui.tree.getCheckedLeafItems();
  }
  setItemTree(itemTree) {
    this._itemTree.set(itemTree, void 0);
  }
  getParent(element) {
    return this.ui.tree.tree.getParentElement(element) ?? void 0;
  }
  expand(element) {
    this.ui.tree.tree.expand(element);
  }
  collapse(element) {
    this.ui.tree.tree.collapse(element);
  }
  isCollapsed(element) {
    return this.ui.tree.tree.isCollapsed(element);
  }
  focusOnInput() {
    this.ui.inputBox.setFocus();
  }
  reveal(element) {
    this.ui.tree.tree.reveal(element);
    this.ui.tree.tree.setFocus([element]);
  }
  show() {
    if (!this.visible) {
      const visibilities = {
        title: !!this.title || !!this.step || !!this.titleButtons.length,
        description: !!this.description,
        checkAll: true,
        checkBox: true,
        inputBox: true,
        progressBar: true,
        visibleCount: true,
        count: true,
        ok: true,
        list: false,
        tree: true,
        message: !!this.validationMessage,
        customButton: false
      };
      this.ui.setVisibilities(visibilities);
      this.visibleDisposables.add(this.ui.inputBox.onDidChange((value2) => {
        this._value.set(value2, void 0);
      }));
      this.visibleDisposables.add(this.ui.tree.onDidChangeCheckboxState((e4) => {
        const checkAllState2 = getParentNodeState([...this.ui.tree.tree.getNode().children]);
        if (this.ui.checkAll.checked !== checkAllState2) {
          this.ui.checkAll.checked = checkAllState2;
        }
      }));
      this.visibleDisposables.add(this.ui.checkAll.onChange((_e) => {
        const checked = this.ui.checkAll.checked;
        this.ui.tree.checkAll(checked);
      }));
      this.visibleDisposables.add(this.ui.tree.onDidChangeCheckedLeafItems((e4) => {
        this.ui.count.setCount(e4.length);
      }));
    }
    super.show();
    setTimeout0(() => this.ui.count.setCount(this.ui.tree.getCheckedLeafItems().length));
    const checkAllState = getParentNodeState([...this.ui.tree.tree.getNode().children]);
    if (this.ui.checkAll.checked !== checkAllState) {
      this.ui.checkAll.checked = checkAllState;
    }
  }
  update() {
    if (!this.visible) {
      return;
    }
    const visibilities = {
      title: !!this.title || !!this.step || !!this.titleButtons.length,
      description: !!this.description,
      checkAll: true,
      checkBox: true,
      inputBox: true,
      progressBar: true,
      visibleCount: true,
      count: true,
      ok: true,
      tree: true,
      message: !!this.validationMessage
    };
    this.ui.setVisibilities(visibilities);
    super.update();
  }
  _registerListeners() {
  }
  // TODO: Move to using autoruns instead of update function
  _registerAutoruns() {
    this.registerVisibleAutorun((reader) => {
      const value2 = this._value.read(reader);
      this.ui.inputBox.value = value2;
      this.ui.tree.filter(value2);
    });
    this.registerVisibleAutorun((reader) => {
      let ariaLabel = this._ariaLabel.read(reader);
      if (!ariaLabel) {
        ariaLabel = this.placeholder || _QuickTree.DEFAULT_ARIA_LABEL;
        if (this.title) {
          ariaLabel += ` - ${this.title}`;
        }
      }
      if (this.ui.list.ariaLabel !== ariaLabel) {
        this.ui.list.ariaLabel = ariaLabel ?? null;
      }
      if (this.ui.inputBox.ariaLabel !== ariaLabel) {
        this.ui.inputBox.ariaLabel = ariaLabel ?? "input";
      }
    });
    this.registerVisibleAutorun((reader) => {
      const placeholder = this._placeholder.read(reader);
      if (this.ui.inputBox.placeholder !== placeholder) {
        this.ui.inputBox.placeholder = placeholder ?? "";
      }
    });
    this.registerVisibleAutorun((reader) => {
      const matchOnLabel = this._matchOnLabel.read(reader);
      const matchOnDescription = this._matchOnDescription.read(reader);
      this.ui.tree.updateFilterOptions({ matchOnLabel, matchOnDescription });
    });
    this.registerVisibleAutorun((reader) => {
      const sortByLabel = this._sortByLabel.read(reader);
      this.ui.tree.sortByLabel = sortByLabel;
    });
    this.registerVisibleAutorun((reader) => {
      const itemTree = this._itemTree.read(reader);
      this.ui.tree.setTreeData(itemTree);
    });
  }
  registerVisibleAutorun(fn) {
    this._register(autorun((reader) => {
      if (this._visible.read(reader)) {
        fn(reader);
      }
    }));
  }
  focus(focus) {
    this.ui.tree.focus(focus);
    this.ui.tree.tree.domFocus();
  }
  /**
   * Programmatically accepts an item. Used internally for keyboard navigation.
   * @param inBackground Whether you are accepting an item in the background and keeping the picker open.
   */
  accept(_inBackground) {
    this._onDidAcceptEmitter.fire();
  }
};
export { QuickTree };
