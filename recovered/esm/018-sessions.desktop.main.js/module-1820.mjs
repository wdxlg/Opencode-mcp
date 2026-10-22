// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/actions/browser/floatingMenu.ts
import { Widget } from "./module-0252.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, append, clearNode } from "./module-0075.mjs";
import { asCssVariable, asCssVariableWithDefault } from "./module-0226.mjs";
import { buttonBackground, buttonForeground } from "./module-0233.mjs";
import { editorBackground, editorForeground } from "./module-0229.mjs";
import { contrastBorder } from "./module-0227.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { getFlatActionBarActions } from "./module-0516.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMenuService } from "./module-0092.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/platform/actions/browser/floatingMenu.ts
var FloatingClickWidget = class extends Widget {
  constructor(label3) {
    super();
    this.label = label3;
    this._onClick = this._register(new Emitter());
    this.onClick = this._onClick.event;
    this._domNode = $(".floating-click-widget");
    this._domNode.style.padding = "6px 11px";
    this._domNode.style.borderRadius = "2px";
    this._domNode.style.cursor = "pointer";
    this._domNode.style.zIndex = "1";
  }
  getDomNode() {
    return this._domNode;
  }
  render() {
    clearNode(this._domNode);
    this._domNode.style.backgroundColor = asCssVariableWithDefault(buttonBackground, asCssVariable(editorBackground));
    this._domNode.style.color = asCssVariableWithDefault(buttonForeground, asCssVariable(editorForeground));
    this._domNode.style.border = `1px solid ${asCssVariable(contrastBorder)}`;
    append(this._domNode, $("")).textContent = this.label;
    this.onclick(this._domNode, () => this._onClick.fire());
  }
};

var AbstractFloatingClickMenu = class extends Disposable {
  constructor(menuId, menuService, contextKeyService) {
    super();
    this.renderEmitter = this._register(new Emitter());
    this.menu = this._register(menuService.createMenu(menuId, contextKeyService));
  }
  get onDidRender() {
    return this.renderEmitter.event;
  }
  /** Should be called in implementation constructors after they initialized */
  render() {
    const menuDisposables = this._register(new DisposableStore());
    const renderMenuAsFloatingClickBtn = () => {
      menuDisposables.clear();
      if (!this.isVisible()) {
        return;
      }
      const actions = getFlatActionBarActions(this.menu.getActions({ renderShortTitle: true, shouldForwardArgs: true }));
      if (actions.length === 0) {
        return;
      }
      const [first2] = actions;
      const widget = this.createWidget(first2, menuDisposables);
      menuDisposables.add(widget);
      menuDisposables.add(widget.onClick(() => first2.run(this.getActionArg())));
      widget.render();
    };
    this._register(this.menu.onDidChange(renderMenuAsFloatingClickBtn));
    renderMenuAsFloatingClickBtn();
  }
  getActionArg() {
    return void 0;
  }
  isVisible() {
    return true;
  }
};

AbstractFloatingClickMenu = __decorateClass([
  __decorateParam(1, IMenuService),
  __decorateParam(2, IContextKeyService)
], AbstractFloatingClickMenu);

var FloatingClickMenu = class extends AbstractFloatingClickMenu {
  constructor(options3, instantiationService, menuService, contextKeyService) {
    super(options3.menuId, menuService, contextKeyService);
    this.options = options3;
    this.instantiationService = instantiationService;
    this.render();
  }
  createWidget(action, disposable) {
    const w = this.instantiationService.createInstance(FloatingClickWidget, action.label);
    const node = w.getDomNode();
    this.options.container.appendChild(node);
    disposable.add(toDisposable(() => node.remove()));
    return w;
  }
  getActionArg() {
    return this.options.getActionArg();
  }
};

FloatingClickMenu = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IMenuService),
  __decorateParam(3, IContextKeyService)
], FloatingClickMenu);
export { FloatingClickWidget, AbstractFloatingClickMenu, FloatingClickMenu };
