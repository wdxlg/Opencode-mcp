// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalGroup.ts
import { Disposable, DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { Sizing, SplitView } from "./module-0625.mjs";
import { hasKey, isNumber } from "./module-0010.mjs";
import { IWorkbenchLayoutService, isHorizontal } from "./module-1119.mjs";
import { asArray } from "./module-0007.mjs";
import { TERMINAL_VIEW_ID } from "./module-1174.mjs";
import { getWindow } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalConfigurationService, ITerminalInstanceService } from "./module-1150.mjs";
import { IPaneCompositePartService } from "./module-1093.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalGroup.ts
var SplitPaneContainer = class extends Disposable {
  constructor(_container, orientation) {
    super();
    this._container = _container;
    this.orientation = orientation;
    this._splitViewDisposables = this._register(new DisposableStore());
    this._children = [];
    this._terminalToPane = /* @__PURE__ */ new Map();
    this._onDidChange = Event2.None;
    this._width = this._container.offsetWidth;
    this._height = this._container.offsetHeight;
    this._createSplitView();
    this._splitView.layout(this.orientation === 1 /* HORIZONTAL */ ? this._width : this._height);
  }
  get onDidChange() {
    return this._onDidChange;
  }
  _createSplitView() {
    this._splitViewDisposables.clear();
    this._splitView = new SplitView(this._container, { orientation: this.orientation });
    this._splitViewDisposables.add(this._splitView);
    this._splitViewDisposables.add(this._splitView.onDidSashReset(() => this._splitView.distributeViewSizes()));
  }
  split(instance2, index2) {
    this._addChild(instance2, index2);
  }
  resizePane(index2, direction, amount) {
    if (this._children.length <= 1) {
      return;
    }
    const sizes = [];
    for (let i2 = 0; i2 < this._splitView.length; i2++) {
      sizes.push(this._splitView.getViewSize(i2));
    }
    const isSizingEndPane = index2 !== this._children.length - 1;
    const indexToChange = isSizingEndPane ? index2 + 1 : index2 - 1;
    if (isSizingEndPane && direction === 0 /* Left */) {
      amount *= -1;
    } else if (!isSizingEndPane && direction === 1 /* Right */) {
      amount *= -1;
    } else if (isSizingEndPane && direction === 2 /* Up */) {
      amount *= -1;
    } else if (!isSizingEndPane && direction === 3 /* Down */) {
      amount *= -1;
    }
    if (sizes[index2] + amount < 80 /* SplitPaneMinSize */) {
      amount = 80 /* SplitPaneMinSize */ - sizes[index2];
    } else if (sizes[indexToChange] - amount < 80 /* SplitPaneMinSize */) {
      amount = sizes[indexToChange] - 80 /* SplitPaneMinSize */;
    }
    sizes[index2] += amount;
    sizes[indexToChange] -= amount;
    for (let i2 = 0; i2 < this._splitView.length - 1; i2++) {
      this._splitView.resizeView(i2, sizes[i2]);
    }
  }
  resizePanes(relativeSizes) {
    if (this._children.length <= 1) {
      return;
    }
    relativeSizes[relativeSizes.length - 1] += 1 - relativeSizes.reduce((totalValue, currentValue) => totalValue + currentValue, 0);
    let totalSize = 0;
    for (let i2 = 0; i2 < this._splitView.length; i2++) {
      totalSize += this._splitView.getViewSize(i2);
    }
    for (let i2 = 0; i2 < this._splitView.length; i2++) {
      this._splitView.resizeView(i2, totalSize * relativeSizes[i2]);
    }
  }
  getPaneSize(instance2) {
    const paneForInstance = this._terminalToPane.get(instance2);
    if (!paneForInstance) {
      return 0;
    }
    const index2 = this._children.indexOf(paneForInstance);
    return this._splitView.getViewSize(index2);
  }
  _addChild(instance2, index2) {
    const child = new SplitPane(instance2, this.orientation === 1 /* HORIZONTAL */ ? this._height : this._width);
    child.orientation = this.orientation;
    if (isNumber(index2)) {
      this._children.splice(index2, 0, child);
    } else {
      this._children.push(child);
    }
    this._terminalToPane.set(instance2, this._children[this._children.indexOf(child)]);
    this._withDisabledLayout(() => this._splitView.addView(child, Sizing.Distribute, index2));
    this.layout(this._width, this._height);
    this._onDidChange = Event2.any(...this._children.map((c) => c.onDidChange));
  }
  remove(instance2) {
    let index2 = null;
    for (let i2 = 0; i2 < this._children.length; i2++) {
      if (this._children[i2].instance === instance2) {
        index2 = i2;
      }
    }
    if (index2 !== null) {
      this._children.splice(index2, 1);
      this._terminalToPane.delete(instance2);
      this._splitView.removeView(index2, Sizing.Distribute);
      instance2.detachFromElement();
    }
  }
  layout(width2, height) {
    this._width = width2;
    this._height = height;
    if (this.orientation === 1 /* HORIZONTAL */) {
      this._children.forEach((c) => c.orthogonalLayout(height));
      this._splitView.layout(width2);
    } else {
      this._children.forEach((c) => c.orthogonalLayout(width2));
      this._splitView.layout(height);
    }
  }
  setOrientation(orientation) {
    if (this.orientation === orientation) {
      return;
    }
    this.orientation = orientation;
    while (this._container.children.length > 0) {
      this._container.children[0].remove();
    }
    this._createSplitView();
    this._withDisabledLayout(() => {
      this._children.forEach((child) => {
        child.orientation = orientation;
        this._splitView.addView(child, 1);
      });
    });
  }
  _withDisabledLayout(innerFunction) {
    this._children.forEach((c) => c.instance.disableLayout = true);
    innerFunction();
    this._children.forEach((c) => c.instance.disableLayout = false);
  }
};

var SplitPane = class {
  constructor(instance2, orthogonalSize) {
    this.instance = instance2;
    this.orthogonalSize = orthogonalSize;
    this.minimumSize = 80 /* SplitPaneMinSize */;
    this.maximumSize = Number.MAX_VALUE;
    this._onDidChange = Event2.None;
    this.element = document.createElement("div");
    this.element.className = "terminal-split-pane";
    this.instance.attachToElement(this.element);
  }
  get onDidChange() {
    return this._onDidChange;
  }
  layout(size3) {
    if (!size3 || !this.orthogonalSize) {
      return;
    }
    if (this.orientation === 0 /* VERTICAL */) {
      this.instance.layout({ width: this.orthogonalSize, height: size3 });
    } else {
      this.instance.layout({ width: size3, height: this.orthogonalSize });
    }
  }
  orthogonalLayout(size3) {
    this.orthogonalSize = size3;
  }
};

var TerminalGroup = class extends Disposable {
  constructor(_container, shellLaunchConfigOrInstance, _terminalConfigurationService, _terminalInstanceService, _paneCompositePartService, _layoutService, _viewDescriptorService, _instantiationService) {
    super();
    this._container = _container;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._terminalInstanceService = _terminalInstanceService;
    this._paneCompositePartService = _paneCompositePartService;
    this._layoutService = _layoutService;
    this._viewDescriptorService = _viewDescriptorService;
    this._instantiationService = _instantiationService;
    this._terminalInstances = [];
    this._panelPosition = 2 /* BOTTOM */;
    this._terminalLocation = 1 /* Panel */;
    this._instanceDisposables = /* @__PURE__ */ new Map();
    this._activeInstanceIndex = -1;
    this._hadFocusOnExit = false;
    this._visible = false;
    this._onDidDisposeInstance = this._register(new Emitter());
    this.onDidDisposeInstance = this._onDidDisposeInstance.event;
    this._onDidFocusInstance = this._register(new Emitter());
    this.onDidFocusInstance = this._onDidFocusInstance.event;
    this._onDidChangeInstanceCapability = this._register(new Emitter());
    this.onDidChangeInstanceCapability = this._onDidChangeInstanceCapability.event;
    this._onDisposed = this._register(new Emitter());
    this.onDisposed = this._onDisposed.event;
    this._onInstancesChanged = this._register(new Emitter());
    this.onInstancesChanged = this._onInstancesChanged.event;
    this._onDidChangeActiveInstance = this._register(new Emitter());
    this.onDidChangeActiveInstance = this._onDidChangeActiveInstance.event;
    this._onPanelOrientationChanged = this._register(new Emitter());
    this.onPanelOrientationChanged = this._onPanelOrientationChanged.event;
    if (shellLaunchConfigOrInstance) {
      this.addInstance(shellLaunchConfigOrInstance);
    }
    if (this._container) {
      this.attachToElement(this._container);
    }
    this._onPanelOrientationChanged.fire(this._terminalLocation === 1 /* Panel */ && isHorizontal(this._panelPosition) ? 1 /* HORIZONTAL */ : 0 /* VERTICAL */);
    this._register(toDisposable(() => {
      if (this._container && this._groupElement) {
        this._groupElement.remove();
        this._groupElement = void 0;
      }
    }));
  }
  get terminalInstances() {
    return this._terminalInstances;
  }
  get hadFocusOnExit() {
    return this._hadFocusOnExit;
  }
  addInstance(shellLaunchConfigOrInstance, parentTerminalId) {
    let instance2;
    const parentIndex = parentTerminalId ? this._terminalInstances.findIndex((t2) => t2.instanceId === parentTerminalId) : this._activeInstanceIndex;
    if (hasKey(shellLaunchConfigOrInstance, { instanceId: true })) {
      instance2 = shellLaunchConfigOrInstance;
    } else {
      instance2 = this._terminalInstanceService.createInstance(shellLaunchConfigOrInstance, 1 /* Panel */);
    }
    if (this._terminalInstances.length === 0) {
      this._terminalInstances.push(instance2);
      this._activeInstanceIndex = 0;
    } else {
      this._terminalInstances.splice(parentIndex + 1, 0, instance2);
    }
    this._initInstanceListeners(instance2);
    if (this._splitPaneContainer) {
      this._splitPaneContainer.split(instance2, parentIndex + 1);
    }
    this._onInstancesChanged.fire();
  }
  dispose() {
    this._terminalInstances = [];
    this._onInstancesChanged.fire();
    this._splitPaneContainer?.dispose();
    super.dispose();
  }
  get activeInstance() {
    if (this._terminalInstances.length === 0) {
      return void 0;
    }
    return this._terminalInstances[this._activeInstanceIndex];
  }
  getLayoutInfo(isActive2) {
    const instances = this.terminalInstances.filter((instance2) => isNumber(instance2.persistentProcessId) && instance2.shouldPersist);
    const totalSize = instances.map((t2) => this._splitPaneContainer?.getPaneSize(t2) || 0).reduce((total, size3) => total += size3, 0);
    return {
      isActive: isActive2,
      activePersistentProcessId: this.activeInstance ? this.activeInstance.persistentProcessId : void 0,
      terminals: instances.map((t2) => {
        return {
          relativeSize: totalSize > 0 ? this._splitPaneContainer.getPaneSize(t2) / totalSize : 0,
          terminal: t2.persistentProcessId || 0
        };
      })
    };
  }
  _initInstanceListeners(instance2) {
    this._instanceDisposables.set(instance2.instanceId, [
      instance2.onDisposed((instance3) => {
        this._onDidDisposeInstance.fire(instance3);
        this._handleOnDidDisposeInstance(instance3);
      }),
      instance2.onDidFocus((instance3) => {
        this._setActiveInstance(instance3);
        this._onDidFocusInstance.fire(instance3);
      }),
      instance2.capabilities.onDidChangeCapabilities(() => this._onDidChangeInstanceCapability.fire(instance2))
    ]);
  }
  _handleOnDidDisposeInstance(instance2) {
    this._removeInstance(instance2);
  }
  removeInstance(instance2) {
    this._removeInstance(instance2);
  }
  _removeInstance(instance2) {
    const index2 = this._terminalInstances.indexOf(instance2);
    if (index2 === -1) {
      return;
    }
    const wasActiveInstance = instance2 === this.activeInstance;
    this._terminalInstances.splice(index2, 1);
    if (wasActiveInstance && this._terminalInstances.length > 0) {
      const newIndex = index2 < this._terminalInstances.length ? index2 : this._terminalInstances.length - 1;
      this.setActiveInstanceByIndex(newIndex);
      this.activeInstance?.focus(true);
    } else if (index2 < this._activeInstanceIndex) {
      this._activeInstanceIndex--;
    }
    this._splitPaneContainer?.remove(instance2);
    if (this._terminalInstances.length === 0) {
      this._hadFocusOnExit = instance2.hadFocusOnExit;
      this._onDisposed.fire(this);
      this.dispose();
    } else {
      this._onInstancesChanged.fire();
    }
    const disposables = this._instanceDisposables.get(instance2.instanceId);
    if (disposables) {
      dispose(disposables);
      this._instanceDisposables.delete(instance2.instanceId);
    }
  }
  moveInstance(instances, index2, position2) {
    instances = asArray(instances);
    const hasInvalidInstance = instances.some((instance2) => !this.terminalInstances.includes(instance2));
    if (hasInvalidInstance) {
      return;
    }
    const insertIndex = position2 === "before" ? index2 : index2 + 1;
    this._terminalInstances.splice(insertIndex, 0, ...instances);
    for (const item of instances) {
      const originSourceGroupIndex = position2 === "after" ? this._terminalInstances.indexOf(item) : this._terminalInstances.lastIndexOf(item);
      this._terminalInstances.splice(originSourceGroupIndex, 1);
    }
    if (this._splitPaneContainer) {
      for (let i2 = 0; i2 < instances.length; i2++) {
        const item = instances[i2];
        this._splitPaneContainer.remove(item);
        this._splitPaneContainer.split(item, index2 + (position2 === "before" ? i2 : 0));
      }
    }
    this._onInstancesChanged.fire();
  }
  _setActiveInstance(instance2) {
    this.setActiveInstanceByIndex(this._getIndexFromId(instance2.instanceId));
  }
  _getIndexFromId(terminalId) {
    let terminalIndex = -1;
    this.terminalInstances.forEach((terminalInstance, i2) => {
      if (terminalInstance.instanceId === terminalId) {
        terminalIndex = i2;
      }
    });
    if (terminalIndex === -1) {
      throw new Error(`Terminal with ID ${terminalId} does not exist (has it already been disposed?)`);
    }
    return terminalIndex;
  }
  setActiveInstanceByIndex(index2, force) {
    if (index2 < 0 || index2 >= this._terminalInstances.length) {
      return;
    }
    const oldActiveInstance = this.activeInstance;
    this._activeInstanceIndex = index2;
    if (oldActiveInstance !== this.activeInstance || force) {
      this._onInstancesChanged.fire();
      this._onDidChangeActiveInstance.fire(this.activeInstance);
    }
  }
  attachToElement(element) {
    this._container = element;
    if (!this._groupElement) {
      this._groupElement = document.createElement("div");
      this._groupElement.classList.add("terminal-group");
    }
    this._container.appendChild(this._groupElement);
    if (!this._splitPaneContainer) {
      this._panelPosition = this._layoutService.getPanelPosition();
      this._terminalLocation = this._viewDescriptorService.getViewLocationById(TERMINAL_VIEW_ID);
      const orientation = this._terminalLocation === 1 /* Panel */ && isHorizontal(this._panelPosition) ? 1 /* HORIZONTAL */ : 0 /* VERTICAL */;
      this._splitPaneContainer = this._instantiationService.createInstance(SplitPaneContainer, this._groupElement, orientation);
      this.terminalInstances.forEach((instance2) => this._splitPaneContainer.split(instance2, this._activeInstanceIndex + 1));
    }
  }
  get title() {
    if (this._terminalInstances.length === 0) {
      return "";
    }
    let title = this.terminalInstances[0].title + this._getBellTitle(this.terminalInstances[0]);
    if (this.terminalInstances[0].description) {
      title += ` (${this.terminalInstances[0].description})`;
    }
    for (let i2 = 1; i2 < this.terminalInstances.length; i2++) {
      const instance2 = this.terminalInstances[i2];
      if (instance2.title) {
        title += `, ${instance2.title + this._getBellTitle(instance2)}`;
        if (instance2.description) {
          title += ` (${instance2.description})`;
        }
      }
    }
    return title;
  }
  _getBellTitle(instance2) {
    if (this._terminalConfigurationService.config.enableBell && instance2.statusList.statuses.some((e4) => e4.id === "bell" /* Bell */)) {
      return "*";
    }
    return "";
  }
  setVisible(visible) {
    this._visible = visible;
    if (this._groupElement) {
      this._groupElement.style.display = visible ? "" : "none";
    }
    this.terminalInstances.forEach((i2) => i2.setVisible(visible));
  }
  split(shellLaunchConfig) {
    const instance2 = this._terminalInstanceService.createInstance(shellLaunchConfig, 1 /* Panel */);
    this.addInstance(instance2, shellLaunchConfig.parentTerminalId);
    this._setActiveInstance(instance2);
    return instance2;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
  layout(width2, height) {
    if (this._splitPaneContainer) {
      const newPanelPosition = this._layoutService.getPanelPosition();
      const newTerminalLocation = this._viewDescriptorService.getViewLocationById(TERMINAL_VIEW_ID);
      const terminalPositionChanged = newPanelPosition !== this._panelPosition || newTerminalLocation !== this._terminalLocation;
      if (terminalPositionChanged) {
        const newOrientation = newTerminalLocation === 1 /* Panel */ && isHorizontal(newPanelPosition) ? 1 /* HORIZONTAL */ : 0 /* VERTICAL */;
        this._splitPaneContainer.setOrientation(newOrientation);
        this._panelPosition = newPanelPosition;
        this._terminalLocation = newTerminalLocation;
        this._onPanelOrientationChanged.fire(this._splitPaneContainer.orientation);
      }
      this._splitPaneContainer.layout(width2, height);
      if (this._initialRelativeSizes && this._visible) {
        this.resizePanes(this._initialRelativeSizes);
        this._initialRelativeSizes = void 0;
      }
    }
  }
  focusPreviousPane() {
    const newIndex = this._activeInstanceIndex === 0 ? this._terminalInstances.length - 1 : this._activeInstanceIndex - 1;
    this.setActiveInstanceByIndex(newIndex);
  }
  focusNextPane() {
    const newIndex = this._activeInstanceIndex === this._terminalInstances.length - 1 ? 0 : this._activeInstanceIndex + 1;
    this.setActiveInstanceByIndex(newIndex);
  }
  _getPosition() {
    switch (this._terminalLocation) {
      case 1 /* Panel */:
        return this._panelPosition;
      case 0 /* Sidebar */:
        return this._layoutService.getSideBarPosition();
      case 2 /* AuxiliaryBar */:
        return this._layoutService.getSideBarPosition() === 0 /* LEFT */ ? 1 /* RIGHT */ : 0 /* LEFT */;
      default:
        return this._panelPosition;
    }
  }
  _getOrientation() {
    return isHorizontal(this._getPosition()) ? 1 /* HORIZONTAL */ : 0 /* VERTICAL */;
  }
  resizePane(direction) {
    if (!this._splitPaneContainer) {
      return;
    }
    const isHorizontalResize = direction === 0 /* Left */ || direction === 1 /* Right */;
    const groupOrientation = this._getOrientation();
    const shouldResizePart = isHorizontalResize && groupOrientation === 0 /* VERTICAL */ || !isHorizontalResize && groupOrientation === 1 /* HORIZONTAL */;
    const font = this._terminalConfigurationService.getFont(getWindow(this._groupElement));
    const charSize = isHorizontalResize ? font.charWidth : font.charHeight;
    if (charSize) {
      let resizeAmount = charSize * 4 /* ResizePartCellCount */;
      if (shouldResizePart) {
        const position2 = this._getPosition();
        const shouldShrink = position2 === 0 /* LEFT */ && direction === 0 /* Left */ || position2 === 1 /* RIGHT */ && direction === 1 /* Right */ || position2 === 2 /* BOTTOM */ && direction === 3 /* Down */ || position2 === 3 /* TOP */ && direction === 2 /* Up */;
        if (shouldShrink) {
          resizeAmount *= -1;
        }
        this._layoutService.resizePart(this._paneCompositePartService.getPartId(this._terminalLocation), resizeAmount, resizeAmount);
      } else {
        this._splitPaneContainer.resizePane(this._activeInstanceIndex, direction, resizeAmount);
      }
    }
  }
  resizePanes(relativeSizes) {
    if (!this._splitPaneContainer) {
      this._initialRelativeSizes = relativeSizes;
      return;
    }
    this._splitPaneContainer.resizePanes(relativeSizes);
  }
};

TerminalGroup = __decorateClass([
  __decorateParam(2, ITerminalConfigurationService),
  __decorateParam(3, ITerminalInstanceService),
  __decorateParam(4, IPaneCompositePartService),
  __decorateParam(5, IWorkbenchLayoutService),
  __decorateParam(6, IViewDescriptorService),
  __decorateParam(7, IInstantiationService)
], TerminalGroup);
export { SplitPaneContainer, SplitPane, TerminalGroup };
