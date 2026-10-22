// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/dropdown/dropdown.ts
import { ActionRunner } from "./module-0082.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, isMouseEvent } from "./module-0075.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { CONTEXT_VIEW_MENU_MOTION_CLASS, contextViewMenuCloseAnimation } from "./module-0471.mjs";


// src/vs/base/browser/ui/dropdown/dropdown.ts
var BaseDropdown = class extends ActionRunner {
  constructor(container2, baseOptions) {
    super();
    this.baseOptions = baseOptions;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this._element = append(container2, $(".monaco-dropdown"));
    this._label = append(this._element, $(".dropdown-label"));
    let labelRenderer = baseOptions.labelRenderer;
    if (!labelRenderer) {
      labelRenderer = (container3) => {
        container3.textContent = baseOptions.label || "";
        return null;
      };
    }
    for (const event of [EventType.CLICK, EventType.MOUSE_DOWN, EventType2.Tap]) {
      this._register(addDisposableListener(this.element, event, (e4) => EventHelper.stop(e4, true)));
    }
    for (const event of [EventType.MOUSE_DOWN, EventType2.Tap]) {
      this._register(addDisposableListener(this._label, event, (e4) => {
        if (baseOptions.isEnabled?.() === false) {
          return;
        }
        if (isMouseEvent(e4) && e4.button !== 0) {
          return;
        }
        if (this.visible) {
          this.hide();
        } else {
          this.show();
        }
      }));
    }
    this._register(addDisposableListener(this._label, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
        EventHelper.stop(e4, true);
        if (baseOptions.isEnabled?.() === false) {
          return;
        }
        if (this.visible) {
          this.hide();
        } else {
          this.show();
        }
      }
    }));
    const cleanupFn = labelRenderer(this._label);
    if (cleanupFn) {
      this._register(cleanupFn);
    }
    this._register(Gesture.addTarget(this._label));
  }
  get element() {
    return this._element;
  }
  get label() {
    return this._label;
  }
  set tooltip(tooltip) {
    if (this._label) {
      if (!this.hover && tooltip !== "") {
        this.hover = this._register(getBaseLayerHoverDelegate().setupManagedHover(getDefaultHoverDelegate("mouse"), this._label, tooltip));
      } else if (this.hover) {
        this.hover.update(tooltip);
      }
    }
  }
  show() {
    if (!this.visible && this.baseOptions.isEnabled?.() !== false) {
      this.visible = true;
      this._onDidChangeVisibility.fire(true);
    }
  }
  hide() {
    if (this.visible) {
      this.visible = false;
      this._onDidChangeVisibility.fire(false);
    }
  }
  isVisible() {
    return !!this.visible;
  }
  onEvent(_e, activeElement) {
    this.hide();
  }
  dispose() {
    super.dispose();
    this.hide();
    if (this.boxContainer) {
      this.boxContainer.remove();
      this.boxContainer = void 0;
    }
    if (this.contents) {
      this.contents.remove();
      this.contents = void 0;
    }
    if (this._label) {
      this._label.remove();
      this._label = void 0;
    }
  }
};

function isActionProvider(obj) {
  const candidate = obj;
  return typeof candidate?.getActions === "function";
}

var DropdownMenu = class extends BaseDropdown {
  constructor(container2, _options) {
    super(container2, _options);
    this._options = _options;
    this._actions = [];
    this.actions = _options.actions || [];
  }
  set menuOptions(options3) {
    this._menuOptions = options3;
  }
  get menuOptions() {
    return this._menuOptions;
  }
  get actions() {
    if (this._options.actionProvider) {
      return this._options.actionProvider.getActions();
    }
    return this._actions;
  }
  set actions(actions) {
    this._actions = actions;
  }
  show() {
    if (this._options.isEnabled?.() === false) {
      return;
    }
    super.show();
    this.element.classList.add("active");
    this._options.contextMenuProvider.showContextMenu({
      getAnchor: () => this._options.getAnchor?.() ?? this.element,
      getActions: () => this.actions,
      getActionsContext: () => this.menuOptions ? this.menuOptions.context : null,
      getActionViewItem: (action, options3) => this.menuOptions && this.menuOptions.actionViewItemProvider ? this.menuOptions.actionViewItemProvider(action, options3) : void 0,
      getKeyBinding: (action) => this.menuOptions && this.menuOptions.getKeyBinding ? this.menuOptions.getKeyBinding(action) : void 0,
      getMenuClassName: () => this.getMenuClassName(),
      closeAnimation: this._options.closeAnimation ?? contextViewMenuCloseAnimation,
      onHide: () => this.onHide(),
      actionRunner: this.menuOptions ? this.menuOptions.actionRunner : void 0,
      anchorAlignment: this.menuOptions ? this.menuOptions.anchorAlignment : 0 /* LEFT */,
      domForShadowRoot: this._options.menuAsChild ? this.element : void 0,
      skipTelemetry: this._options.skipTelemetry
    });
  }
  getMenuClassName() {
    const classNames2 = this._options.menuClassName?.split(/\s+/).filter(Boolean) ?? [];
    if (!classNames2.includes(CONTEXT_VIEW_MENU_MOTION_CLASS)) {
      classNames2.push(CONTEXT_VIEW_MENU_MOTION_CLASS);
    }
    return classNames2.join(" ");
  }
  hide() {
    super.hide();
  }
  onHide() {
    this.hide();
    this.element.classList.remove("active");
  }
};
export { isActionProvider, BaseDropdown, DropdownMenu };
