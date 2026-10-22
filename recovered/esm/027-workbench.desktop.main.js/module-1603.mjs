// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/visibleViewContainersTracker.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";


// src/vs/workbench/browser/parts/visibleViewContainersTracker.ts
var VisibleViewContainersTracker = class extends Disposable {
  constructor(location2, viewDescriptorService) {
    super();
    this.location = location2;
    this.viewDescriptorService = viewDescriptorService;
    this.viewContainerModelListeners = this._register(new DisposableMap());
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._visibleCount = 0;
    this.registerListeners();
    this.initializeViewContainerListeners();
    this.updateVisibleCount();
  }
  /**
   * Returns the current number of visible view containers at this location.
   */
  get visibleCount() {
    return this._visibleCount;
  }
  registerListeners() {
    this._register(this.viewDescriptorService.onDidChangeViewContainers(({ added, removed }) => {
      for (const { container: container3, location: location2 } of added) {
        if (location2 === this.location) {
          this.addViewContainerModelListener(container3.id);
        }
      }
      for (const { container: container3, location: location2 } of removed) {
        if (location2 === this.location) {
          this.viewContainerModelListeners.deleteAndDispose(container3.id);
        }
      }
      const relevantChange = [...added, ...removed].some(({ location: location2 }) => location2 === this.location);
      if (relevantChange) {
        this.updateVisibleCount();
      }
    }));
    this._register(this.viewDescriptorService.onDidChangeContainerLocation(({ viewContainer: viewContainer5, from, to }) => {
      if (from === this.location) {
        this.viewContainerModelListeners.deleteAndDispose(viewContainer5.id);
      }
      if (to === this.location) {
        this.addViewContainerModelListener(viewContainer5.id);
      }
      if (from === this.location || to === this.location) {
        this.updateVisibleCount();
      }
    }));
  }
  initializeViewContainerListeners() {
    for (const container3 of this.viewDescriptorService.getViewContainersByLocation(this.location)) {
      this.addViewContainerModelListener(container3.id);
    }
  }
  addViewContainerModelListener(containerId) {
    const container3 = this.viewDescriptorService.getViewContainerById(containerId);
    if (container3) {
      const model = this.viewDescriptorService.getViewContainerModel(container3);
      const listener = model.onDidChangeActiveViewDescriptors(() => this.updateVisibleCount());
      this.viewContainerModelListeners.set(containerId, listener);
    }
  }
  updateVisibleCount() {
    const viewContainers = this.viewDescriptorService.getViewContainersByLocation(this.location);
    const visibleViewContainers = viewContainers.filter(
      (container3) => this.viewDescriptorService.getViewContainerModel(container3).activeViewDescriptors.length > 0
    );
    const newCount = visibleViewContainers.length;
    if (this._visibleCount !== newCount) {
      const before = this._visibleCount;
      this._visibleCount = newCount;
      this._onDidChange.fire({ before, after: newCount });
    }
  }
};

VisibleViewContainersTracker = __decorateClass([
  __decorateParam(1, IViewDescriptorService)
], VisibleViewContainersTracker);
export { VisibleViewContainersTracker };
