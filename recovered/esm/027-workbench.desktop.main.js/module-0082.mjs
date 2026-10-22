// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/actions.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/base/common/actions.ts
var Action = class extends Disposable {
  constructor(id2, label3 = "", cssClass = "", enabled = true, actionCallback) {
    super();
    this._onDidChange = this._register(new Emitter());
    this._enabled = true;
    this._id = id2;
    this._label = label3;
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
  set label(value2) {
    this._setLabel(value2);
  }
  _setLabel(value2) {
    if (this._label !== value2) {
      this._label = value2;
      this._onDidChange.fire({ label: value2 });
    }
  }
  get tooltip() {
    return this._tooltip || "";
  }
  set tooltip(value2) {
    this._setTooltip(value2);
  }
  _setTooltip(value2) {
    if (this._tooltip !== value2) {
      this._tooltip = value2;
      this._onDidChange.fire({ tooltip: value2 });
    }
  }
  get class() {
    return this._cssClass;
  }
  set class(value2) {
    this._setClass(value2);
  }
  _setClass(value2) {
    if (this._cssClass !== value2) {
      this._cssClass = value2;
      this._onDidChange.fire({ class: value2 });
    }
  }
  get enabled() {
    return this._enabled;
  }
  set enabled(value2) {
    this._setEnabled(value2);
  }
  _setEnabled(value2) {
    if (this._enabled !== value2) {
      this._enabled = value2;
      this._onDidChange.fire({ enabled: value2 });
    }
  }
  get checked() {
    return this._checked;
  }
  set checked(value2) {
    this._setChecked(value2);
  }
  _setChecked(value2) {
    if (this._checked !== value2) {
      this._checked = value2;
      this._onDidChange.fire({ checked: value2 });
    }
  }
  async run(event, data) {
    if (this._actionCallback) {
      await this._actionCallback(event);
    }
  }
};

var ActionRunner = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onWillRun = this._register(new Emitter());
    this._onDidRun = this._register(new Emitter());
  }
  get onWillRun() {
    return this._onWillRun.event;
  }
  get onDidRun() {
    return this._onDidRun.event;
  }
  async run(action, context2) {
    if (!action.enabled) {
      return;
    }
    this._onWillRun.fire({ action });
    let error = void 0;
    try {
      await this.runAction(action, context2);
    } catch (e) {
      error = e;
    }
    this._onDidRun.fire({ action, error });
  }
  async runAction(action, context2) {
    await action.run(context2);
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
    for (let i2 = actions.length - 2; i2 >= 0; i2--) {
      if (actions[i2].id === _Separator.ID && actions[i2 + 1].id === _Separator.ID) {
        actions.splice(i2 + 1, 1);
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
  constructor(id2, label3, actions, cssClass) {
    this.tooltip = "";
    this.enabled = true;
    this.checked = void 0;
    this.id = id2;
    this.label = label3;
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

function toAction(props) {
  return {
    id: props.id,
    label: props.label,
    tooltip: props.tooltip ?? props.label,
    class: props.class,
    enabled: props.enabled ?? true,
    checked: props.checked,
    run: async (...args2) => props.run(...args2)
  };
}
export { toAction, Action, ActionRunner, Separator, SubmenuAction, EmptySubmenuAction };
