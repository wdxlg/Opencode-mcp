// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/reactionsAction.ts
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { $, append } from "./module-0075.mjs";
import { URI } from "./module-0032.mjs";
import { asCSSUrl } from "./module-0449.mjs";


// src/vs/workbench/contrib/comments/browser/reactionsAction.ts
var ToggleReactionsAction = class _ToggleReactionsAction extends Action {
  constructor(toggleDropdownMenu, title) {
    super(_ToggleReactionsAction.ID, title || localize(14064, null), "toggle-reactions", true);
    this._menuActions = [];
    this.toggleDropdownMenu = toggleDropdownMenu;
  }
  static {
    this.ID = "toolbar.toggle.pickReactions";
  }
  run() {
    this.toggleDropdownMenu();
    return Promise.resolve(true);
  }
  get menuActions() {
    return this._menuActions;
  }
  set menuActions(actions) {
    this._menuActions = actions;
  }
};

var ReactionActionViewItem = class extends ActionViewItem {
  constructor(action) {
    super(null, action, {});
  }
  updateLabel() {
    if (!this.label) {
      return;
    }
    const action = this.action;
    if (action.class) {
      this.label.classList.add(action.class);
    }
    if (!action.icon) {
      const reactionLabel = append(this.label, $("span.reaction-label"));
      reactionLabel.innerText = action.label;
    } else {
      const reactionIcon = append(this.label, $(".reaction-icon"));
      const uri5 = URI.revive(action.icon);
      reactionIcon.style.backgroundImage = asCSSUrl(uri5);
    }
    if (action.count) {
      const reactionCount = append(this.label, $("span.reaction-count"));
      reactionCount.innerText = `${action.count}`;
    }
  }
  getTooltip() {
    const action = this.action;
    const toggleMessage = action.enabled ? localize(14063, null) : "";
    if (action.count === void 0) {
      return localize(14059, null, toggleMessage, action.label);
    } else if (action.reactors === void 0 || action.reactors.length === 0) {
      if (action.count === 1) {
        return localize(14060, null, toggleMessage, action.label);
      } else if (action.count > 1) {
        return localize(14058, null, toggleMessage, action.count, action.label);
      }
    } else {
      if (action.reactors.length <= 10 && action.reactors.length === action.count) {
        return localize(14061, null, toggleMessage, action.reactors.join(", "), action.label);
      } else if (action.count > 1) {
        const displayedReactors = action.reactors.slice(0, 10);
        return localize(14062, null, toggleMessage, displayedReactors.join(", "), action.count - displayedReactors.length, action.label);
      }
    }
    return void 0;
  }
};

var ReactionAction = class _ReactionAction extends Action {
  constructor(id2, label3 = "", cssClass = "", enabled = true, actionCallback, reactors, icon2, count2) {
    super(_ReactionAction.ID, label3, cssClass, enabled, actionCallback);
    this.reactors = reactors;
    this.icon = icon2;
    this.count = count2;
  }
  static {
    this.ID = "toolbar.toggle.reaction";
  }
};
export { ToggleReactionsAction, ReactionActionViewItem, ReactionAction };
