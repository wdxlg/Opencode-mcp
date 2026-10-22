// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/actions.ts
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0019.mjs";
import { localize } from "./module-0015.mjs";


// src/vs/base/common/actions.ts
var Action = class extends Disposable {
  constructor(id2, label = "", cssClass = "", enabled = true, actionCallback) {
    super();
    this._onDidChange = this._register(new Emitter());
    this._enabled = true;
    this._id = id2;
    this._label = label;
    this._cssClass = cssClass;
    this._enabled = enabled;
    this._actionCallback = actionCallback;
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  get id() {
    return this._id;
  }
  get label() {
    return this._label;
  }
  set label(value) {
    this._setLabel(value);
  }
  _setLabel(value) {
    if (this._label !== value) {
      this._label = value;
      this._onDidChange.fire({ label: value });
    }
  }
  get tooltip() {
    return this._tooltip || "";
  }
  set tooltip(value) {
    this._setTooltip(value);
  }
  _setTooltip(value) {
    if (this._tooltip !== value) {
      this._tooltip = value;
      this._onDidChange.fire({ tooltip: value });
    }
  }
  get class() {
    return this._cssClass;
  }
  set class(value) {
    this._setClass(value);
  }
  _setClass(value) {
    if (this._cssClass !== value) {
      this._cssClass = value;
      this._onDidChange.fire({ class: value });
    }
  }
  get enabled() {
    return this._enabled;
  }
  set enabled(value) {
    this._setEnabled(value);
  }
  _setEnabled(value) {
    if (this._enabled !== value) {
      this._enabled = value;
      this._onDidChange.fire({ enabled: value });
    }
  }
  get checked() {
    return this._checked;
  }
  set checked(value) {
    this._setChecked(value);
  }
  _setChecked(value) {
    if (this._checked !== value) {
      this._checked = value;
      this._onDidChange.fire({ checked: value });
    }
  }
  async run(event, data2) {
    if (this._actionCallback) {
      await this._actionCallback(event);
    }
  }
};

var Separator = class _Separator {
  constructor() {
    this.id = _Separator.ID;
    this.label = "";
    this.tooltip = "";
    this.class = "separator";
    this.enabled = false;
    this.checked = void 0;
  }
  /**
   * Joins all non-empty lists of actions with separators.
   */
  static join(...actionLists) {
    let out = [];
    for (const list2 of actionLists) {
      if (!list2.length) {
      } else if (out.length) {
        out = [...out, new _Separator(), ...list2];
      } else {
        out = list2;
      }
    }
    return out;
  }
  /**
   * Removes leading, trailing, and consecutive duplicate separators in-place and returns the actions.
   */
  static clean(actions) {
    while (actions.length > 0 && actions[0].id === _Separator.ID) {
      actions.shift();
    }
    while (actions.length > 0 && actions[actions.length - 1].id === _Separator.ID) {
      actions.pop();
    }
    for (let i = actions.length - 2; i >= 0; i--) {
      if (actions[i].id === _Separator.ID && actions[i + 1].id === _Separator.ID) {
        actions.splice(i + 1, 1);
      }
    }
    return actions;
  }
  static {
    this.ID = "vs.actions.separator";
  }
  async run() {
  }
};

var SubmenuAction = class {
  constructor(id2, label, actions, cssClass) {
    this.tooltip = "";
    this.enabled = true;
    this.checked = void 0;
    this.id = id2;
    this.label = label;
    this.class = cssClass;
    this._actions = actions;
  }
  get actions() {
    return this._actions;
  }
  async run() {
  }
};

var EmptySubmenuAction = class _EmptySubmenuAction extends Action {
  static {
    this.ID = "vs.actions.empty";
  }
  constructor() {
    super(_EmptySubmenuAction.ID, localize(46, null), void 0, false);
  }
};
export { Action, Separator, SubmenuAction, EmptySubmenuAction };
