// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalGroupService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { TERMINAL_VIEW_ID } from "./module-1174.mjs";
import { TerminalGroup } from "./module-3050.mjs";
import { timeout } from "./module-0036.mjs";
import { getInstanceFromResource } from "./module-2131.mjs";
import { asArray } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalGroupService.ts
var TerminalGroupService = class extends Disposable {
  constructor(_contextKeyService, _instantiationService, _viewsService, _viewDescriptorService, _quickInputService) {
    super();
    this._contextKeyService = _contextKeyService;
    this._instantiationService = _instantiationService;
    this._viewsService = _viewsService;
    this._viewDescriptorService = _viewDescriptorService;
    this._quickInputService = _quickInputService;
    this.groups = [];
    this.activeGroupIndex = -1;
    this.lastAccessedMenu = "inline-tab";
    this._isQuickInputOpened = false;
    this._onDidChangeActiveGroup = this._register(new Emitter());
    this.onDidChangeActiveGroup = this._onDidChangeActiveGroup.event;
    this._onDidDisposeGroup = this._register(new Emitter());
    this.onDidDisposeGroup = this._onDidDisposeGroup.event;
    this._onDidChangeGroups = this._register(new Emitter());
    this.onDidChangeGroups = this._onDidChangeGroups.event;
    this._onDidShow = this._register(new Emitter());
    this.onDidShow = this._onDidShow.event;
    this._onDidDisposeInstance = this._register(new Emitter());
    this.onDidDisposeInstance = this._onDidDisposeInstance.event;
    this._onDidFocusInstance = this._register(new Emitter());
    this.onDidFocusInstance = this._onDidFocusInstance.event;
    this._onDidChangeActiveInstance = this._register(new Emitter());
    this.onDidChangeActiveInstance = this._onDidChangeActiveInstance.event;
    this._onDidChangeInstances = this._register(new Emitter());
    this.onDidChangeInstances = this._onDidChangeInstances.event;
    this._onDidChangeInstanceCapability = this._register(new Emitter());
    this.onDidChangeInstanceCapability = this._onDidChangeInstanceCapability.event;
    this._onDidChangePanelOrientation = this._register(new Emitter());
    this.onDidChangePanelOrientation = this._onDidChangePanelOrientation.event;
    this._getValidTerminalGroups = (sources) => {
      return new Set(
        sources.map((source) => this.getGroupForInstance(source)).filter((group2) => group2 !== void 0)
      );
    };
    const terminalGroupCountContextKey = TerminalContextKeys.groupCount.bindTo(this._contextKeyService);
    this._register(Event2.runAndSubscribe(this.onDidChangeGroups, () => terminalGroupCountContextKey.set(this.groups.length)));
    const splitTerminalActiveContextKey = TerminalContextKeys.splitTerminalActive.bindTo(this._contextKeyService);
    this._register(Event2.runAndSubscribe(this.onDidFocusInstance, () => {
      const activeInstance = this.activeInstance;
      splitTerminalActiveContextKey.set(activeInstance ? this.instanceIsSplit(activeInstance) : false);
    }));
    this._register(this.onDidDisposeGroup((group2) => this._removeGroup(group2)));
    this._register(Event2.any(this.onDidChangeActiveGroup, this.onDidChangeInstances)(() => this.updateVisibility()));
    this._register(this._quickInputService.onShow(() => this._isQuickInputOpened = true));
    this._register(this._quickInputService.onHide(() => this._isQuickInputOpened = false));
  }
  get instances() {
    return this.groups.reduce((p, c) => p.concat(c.terminalInstances), []);
  }
  hidePanel() {
    const panel = this._viewDescriptorService.getViewContainerByViewId(TERMINAL_VIEW_ID);
    if (panel && this._viewDescriptorService.getViewContainerModel(panel).visibleViewDescriptors.length === 1) {
      this._viewsService.closeView(TERMINAL_VIEW_ID);
      TerminalContextKeys.tabsMouse.bindTo(this._contextKeyService).set(false);
    }
  }
  get activeGroup() {
    if (this.activeGroupIndex < 0 || this.activeGroupIndex >= this.groups.length) {
      return void 0;
    }
    return this.groups[this.activeGroupIndex];
  }
  set activeGroup(value2) {
    if (value2 === void 0) {
      return;
    }
    const index2 = this.groups.findIndex((e4) => e4 === value2);
    this.setActiveGroupByIndex(index2);
  }
  get activeInstance() {
    return this.activeGroup?.activeInstance;
  }
  setActiveInstance(instance2) {
    this.setActiveInstanceByIndex(this._getIndexFromId(instance2.instanceId));
  }
  _getIndexFromId(terminalId) {
    const terminalIndex = this.instances.findIndex((e4) => e4.instanceId === terminalId);
    if (terminalIndex === -1) {
      throw new Error(`Terminal with ID ${terminalId} does not exist (has it already been disposed?)`);
    }
    return terminalIndex;
  }
  setContainer(container2) {
    this._container = container2;
    this.groups.forEach((group2) => group2.attachToElement(container2));
  }
  async focusTabs() {
    if (this.instances.length === 0) {
      return;
    }
    await this.showPanel(true);
    const pane = this._viewsService.getActiveViewWithId(TERMINAL_VIEW_ID);
    pane?.terminalTabbedView?.focusTabs();
  }
  async focusHover() {
    if (this.instances.length === 0) {
      return;
    }
    const pane = this._viewsService.getActiveViewWithId(TERMINAL_VIEW_ID);
    pane?.terminalTabbedView?.focusHover();
  }
  async focusInstance(instance2) {
    if (this.instances.includes(instance2)) {
      this.setActiveInstance(instance2);
    }
    await this.showPanel(true);
  }
  async focusActiveInstance() {
    return this.showPanel(true);
  }
  createGroup(slcOrInstance) {
    const group2 = this._instantiationService.createInstance(TerminalGroup, this._container, slcOrInstance);
    this.groups.push(group2);
    group2.addDisposable(Event2.forward(group2.onPanelOrientationChanged, this._onDidChangePanelOrientation));
    group2.addDisposable(Event2.forward(group2.onDidDisposeInstance, this._onDidDisposeInstance));
    group2.addDisposable(Event2.forward(group2.onDidFocusInstance, this._onDidFocusInstance));
    group2.addDisposable(Event2.forward(group2.onDidChangeInstanceCapability, this._onDidChangeInstanceCapability));
    group2.addDisposable(Event2.forward(group2.onInstancesChanged, this._onDidChangeInstances));
    group2.addDisposable(Event2.forward(group2.onDisposed, this._onDidDisposeGroup));
    group2.addDisposable(group2.onDidChangeActiveInstance((e4) => {
      if (group2 === this.activeGroup) {
        this._onDidChangeActiveInstance.fire(e4);
      }
    }));
    if (group2.terminalInstances.length > 0) {
      this._onDidChangeInstances.fire();
    }
    if (this.instances.length === 1) {
      this.setActiveInstanceByIndex(0);
    }
    this._onDidChangeGroups.fire();
    return group2;
  }
  async showPanel(focus) {
    const pane = this._viewsService.getActiveViewWithId(TERMINAL_VIEW_ID) ?? await this._viewsService.openView(TERMINAL_VIEW_ID, focus);
    pane?.setExpanded(true);
    if (focus) {
      await timeout(0);
      const instance2 = this.activeInstance;
      if (instance2) {
        if (pane && !pane.isVisible()) {
          await this._viewsService.openView(TERMINAL_VIEW_ID, focus);
        }
        await instance2.focusWhenReady(true);
      }
    }
    this._onDidShow.fire();
  }
  getInstanceFromResource(resource) {
    return getInstanceFromResource(this.instances, resource);
  }
  _removeGroup(group2) {
    const activeGroup = this.activeGroup;
    const wasActiveGroup = group2 === activeGroup;
    const index2 = this.groups.indexOf(group2);
    if (index2 !== -1) {
      this.groups.splice(index2, 1);
      this._onDidChangeGroups.fire();
    }
    if (wasActiveGroup) {
      if (this.groups.length > 0 && !this._isQuickInputOpened) {
        const newIndex = index2 < this.groups.length ? index2 : this.groups.length - 1;
        this.setActiveGroupByIndex(newIndex, true);
        if (group2.hadFocusOnExit) {
          this.activeInstance?.focus(true);
        }
      }
    } else {
      if (this.activeGroupIndex > index2) {
        this.setActiveGroupByIndex(this.activeGroupIndex - 1);
      }
    }
    if (this.activeGroupIndex >= this.groups.length) {
      this.setActiveGroupByIndex(this.groups.length - 1);
    }
    this._onDidChangeInstances.fire();
    this._onDidChangeGroups.fire();
    if (wasActiveGroup) {
      this._onDidChangeActiveGroup.fire(this.activeGroup);
      this._onDidChangeActiveInstance.fire(this.activeInstance);
    }
  }
  /**
   * @param force Whether to force the group change, this should be used when the previous active
   * group has been removed.
   */
  setActiveGroupByIndex(index2, force) {
    if (index2 === -1 && this.groups.length === 0) {
      if (this.activeGroupIndex !== -1) {
        this.activeGroupIndex = -1;
        this._onDidChangeActiveGroup.fire(this.activeGroup);
        this._onDidChangeActiveInstance.fire(this.activeInstance);
      }
      return;
    }
    if (index2 < 0 || index2 >= this.groups.length) {
      return;
    }
    const oldActiveGroup = this.activeGroup;
    this.activeGroupIndex = index2;
    if (force || oldActiveGroup !== this.activeGroup) {
      this._onDidChangeActiveGroup.fire(this.activeGroup);
      this._onDidChangeActiveInstance.fire(this.activeInstance);
    }
  }
  _getInstanceLocation(index2) {
    let currentGroupIndex = 0;
    while (index2 >= 0 && currentGroupIndex < this.groups.length) {
      const group2 = this.groups[currentGroupIndex];
      const count2 = group2.terminalInstances.length;
      if (index2 < count2) {
        return {
          group: group2,
          groupIndex: currentGroupIndex,
          instance: group2.terminalInstances[index2],
          instanceIndex: index2
        };
      }
      index2 -= count2;
      currentGroupIndex++;
    }
    return void 0;
  }
  setActiveInstanceByIndex(index2) {
    const activeInstance = this.activeInstance;
    const instanceLocation = this._getInstanceLocation(index2);
    const newActiveInstance = instanceLocation?.group.terminalInstances[instanceLocation.instanceIndex];
    if (!instanceLocation || activeInstance === newActiveInstance) {
      return;
    }
    const activeInstanceIndex = instanceLocation.instanceIndex;
    this.activeGroupIndex = instanceLocation.groupIndex;
    this._onDidChangeActiveGroup.fire(this.activeGroup);
    instanceLocation.group.setActiveInstanceByIndex(activeInstanceIndex, true);
  }
  setActiveGroupToNext() {
    if (this.groups.length <= 1) {
      return;
    }
    let newIndex = this.activeGroupIndex + 1;
    if (newIndex >= this.groups.length) {
      newIndex = 0;
    }
    this.setActiveGroupByIndex(newIndex);
  }
  setActiveGroupToPrevious() {
    if (this.groups.length <= 1) {
      return;
    }
    let newIndex = this.activeGroupIndex - 1;
    if (newIndex < 0) {
      newIndex = this.groups.length - 1;
    }
    this.setActiveGroupByIndex(newIndex);
  }
  moveGroup(source, target) {
    source = asArray(source);
    const sourceGroups = this._getValidTerminalGroups(source);
    const targetGroup = this.getGroupForInstance(target);
    if (!targetGroup || sourceGroups.size === 0) {
      return;
    }
    if (sourceGroups.size === 1 && sourceGroups.has(targetGroup)) {
      const targetIndex = targetGroup.terminalInstances.indexOf(target);
      const sortedSources = source.sort((a, b) => {
        return targetGroup.terminalInstances.indexOf(a) - targetGroup.terminalInstances.indexOf(b);
      });
      const firstTargetIndex = targetGroup.terminalInstances.indexOf(sortedSources[0]);
      const position3 = firstTargetIndex < targetIndex ? "after" : "before";
      targetGroup.moveInstance(sortedSources, targetIndex, position3);
      this._onDidChangeInstances.fire();
      return;
    }
    const targetGroupIndex = this.groups.indexOf(targetGroup);
    const sortedSourceGroups = Array.from(sourceGroups).sort((a, b) => {
      return this.groups.indexOf(a) - this.groups.indexOf(b);
    });
    const firstSourceGroupIndex = this.groups.indexOf(sortedSourceGroups[0]);
    const position2 = firstSourceGroupIndex < targetGroupIndex ? "after" : "before";
    const insertIndex = position2 === "after" ? targetGroupIndex + 1 : targetGroupIndex;
    this.groups.splice(insertIndex, 0, ...sortedSourceGroups);
    for (const sourceGroup of sortedSourceGroups) {
      const originSourceGroupIndex = position2 === "after" ? this.groups.indexOf(sourceGroup) : this.groups.lastIndexOf(sourceGroup);
      this.groups.splice(originSourceGroupIndex, 1);
    }
    this._onDidChangeInstances.fire();
  }
  moveGroupToEnd(source) {
    source = asArray(source);
    const sourceGroups = this._getValidTerminalGroups(source);
    if (sourceGroups.size === 0) {
      return;
    }
    const lastInstanceIndex = this.groups.length - 1;
    const sortedSourceGroups = Array.from(sourceGroups).sort((a, b) => {
      return this.groups.indexOf(a) - this.groups.indexOf(b);
    });
    this.groups.splice(lastInstanceIndex + 1, 0, ...sortedSourceGroups);
    for (const sourceGroup of sortedSourceGroups) {
      const sourceGroupIndex = this.groups.indexOf(sourceGroup);
      this.groups.splice(sourceGroupIndex, 1);
    }
    this._onDidChangeInstances.fire();
  }
  moveInstance(source, target, side) {
    const sourceGroup = this.getGroupForInstance(source);
    const targetGroup = this.getGroupForInstance(target);
    if (!sourceGroup || !targetGroup) {
      return;
    }
    if (sourceGroup !== targetGroup) {
      sourceGroup.removeInstance(source);
      targetGroup.addInstance(source);
    }
    const index2 = targetGroup.terminalInstances.indexOf(target) + (side === "after" ? 1 : 0);
    targetGroup.moveInstance(source, index2, side);
  }
  unsplitInstance(instance2) {
    const oldGroup = this.getGroupForInstance(instance2);
    if (!oldGroup || oldGroup.terminalInstances.length < 2) {
      return;
    }
    oldGroup.removeInstance(instance2);
    this.createGroup(instance2);
  }
  joinInstances(instances) {
    const group2 = this.getGroupForInstance(instances[0]);
    if (group2) {
      let differentGroups = true;
      for (let i2 = 1; i2 < group2.terminalInstances.length; i2++) {
        if (group2.terminalInstances.includes(instances[i2])) {
          differentGroups = false;
          break;
        }
      }
      if (!differentGroups && group2.terminalInstances.length === instances.length) {
        return;
      }
    }
    let candidateInstance = void 0;
    let candidateGroup = void 0;
    for (const instance2 of instances) {
      const group3 = this.getGroupForInstance(instance2);
      if (group3?.terminalInstances.length === 1) {
        candidateInstance = instance2;
        candidateGroup = group3;
        break;
      }
    }
    if (!candidateGroup) {
      candidateGroup = this.createGroup();
    }
    const wasActiveGroup = this.activeGroup === candidateGroup;
    for (const instance2 of instances) {
      if (instance2 === candidateInstance) {
        continue;
      }
      const oldGroup = this.getGroupForInstance(instance2);
      if (!oldGroup) {
        continue;
      }
      oldGroup.removeInstance(instance2);
      candidateGroup.addInstance(instance2);
    }
    this.setActiveInstance(instances[0]);
    this._onDidChangeInstances.fire();
    if (!wasActiveGroup) {
      this._onDidChangeActiveGroup.fire(this.activeGroup);
    }
  }
  instanceIsSplit(instance2) {
    const group2 = this.getGroupForInstance(instance2);
    if (!group2) {
      return false;
    }
    return group2.terminalInstances.length > 1;
  }
  getGroupForInstance(instance2) {
    return this.groups.find((group2) => group2.terminalInstances.includes(instance2));
  }
  getGroupLabels() {
    return this.groups.filter((group2) => group2.terminalInstances.length > 0).map((group2, index2) => {
      return `${index2 + 1}: ${group2.title ? group2.title : ""}`;
    });
  }
  /**
   * Visibility should be updated in the following cases:
   * 1. Toggle `TERMINAL_VIEW_ID` visibility
   * 2. Change active group
   * 3. Change instances in active group
   */
  updateVisibility() {
    const visible = this._viewsService.isViewVisible(TERMINAL_VIEW_ID);
    this.groups.forEach((g, i2) => g.setVisible(visible && i2 === this.activeGroupIndex));
  }
};

TerminalGroupService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IViewsService),
  __decorateParam(3, IViewDescriptorService),
  __decorateParam(4, IQuickInputService)
], TerminalGroupService);
export { TerminalGroupService };
