// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/hover/hoverWidget.ts
import { $, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { localize } from "./module-0001.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";


// src/vs/base/browser/ui/hover/hoverWidget.ts
var $2 = $;

var HoverWidget = class extends Disposable {
  constructor(fadeIn) {
    super();
    this.containerDomNode = document.createElement("div");
    this.containerDomNode.className = "monaco-hover";
    this.containerDomNode.classList.toggle("fade-in", !!fadeIn);
    this.containerDomNode.tabIndex = 0;
    this.containerDomNode.setAttribute("role", "tooltip");
    this.contentsDomNode = document.createElement("div");
    this.contentsDomNode.className = "monaco-hover-content";
    this.scrollbar = this._register(new DomScrollableElement(this.contentsDomNode, {
      consumeMouseWheelIfScrollbarIsNeeded: true
    }));
    this.containerDomNode.appendChild(this.scrollbar.getDomNode());
  }
  onContentsChanged() {
    this.scrollbar.scanDomNode();
  }
};

var HoverAction = class _HoverAction extends Disposable {
  static render(parent, actionOptions, keybindingLabel2) {
    return new _HoverAction(parent, actionOptions, keybindingLabel2);
  }
  constructor(parent, actionOptions, keybindingLabel2) {
    super();
    this.actionLabel = actionOptions.label;
    this.actionKeybindingLabel = keybindingLabel2;
    this.actionContainer = append(parent, $2("div.action-container"));
    this.actionContainer.setAttribute("tabindex", "0");
    this.action = append(this.actionContainer, $2("a.action"));
    this.action.setAttribute("role", "button");
    if (actionOptions.iconClass) {
      const iconElement = append(this.action, $2(`span.icon`));
      iconElement.classList.add(...actionOptions.iconClass.split(" "));
    }
    this.actionRenderedLabel = keybindingLabel2 ? `${actionOptions.label} (${keybindingLabel2})` : actionOptions.label;
    const label3 = append(this.action, $2("span"));
    label3.textContent = this.actionRenderedLabel;
    this._store.add(new ClickAction(this.actionContainer, actionOptions.run));
    this._store.add(new KeyDownAction(this.actionContainer, actionOptions.run, [3 /* Enter */, 10 /* Space */]));
    this.setEnabled(true);
  }
  setEnabled(enabled) {
    if (enabled) {
      this.actionContainer.classList.remove("disabled");
      this.actionContainer.removeAttribute("aria-disabled");
    } else {
      this.actionContainer.classList.add("disabled");
      this.actionContainer.setAttribute("aria-disabled", "true");
    }
  }
};

function getHoverAccessibleViewHint(shouldHaveHint, keybinding) {
  return shouldHaveHint && keybinding ? localize(15, null, keybinding) : shouldHaveHint ? localize(16, null) : "";
}

var ClickAction = class extends Disposable {
  constructor(container3, run) {
    super();
    this._register(addDisposableListener(container3, EventType.CLICK, (e) => {
      e.stopPropagation();
      e.preventDefault();
      run(container3);
    }));
  }
};

var KeyDownAction = class extends Disposable {
  constructor(container3, run, keyCodes) {
    super();
    this._register(addDisposableListener(container3, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (keyCodes.some((keyCode) => event.equals(keyCode))) {
        e.stopPropagation();
        e.preventDefault();
        run(container3);
      }
    }));
  }
};
export { getHoverAccessibleViewHint, $2, HoverWidget, HoverAction, ClickAction, KeyDownAction };
