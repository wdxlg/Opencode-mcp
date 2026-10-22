// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/paneCompositePartService.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { PanelPart } from "./module-1605.mjs";
import { SidebarPart } from "./module-1620.mjs";
import { AuxiliaryBarPart } from "./module-1604.mjs";
import { Event2 } from "./module-0017.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";


// src/vs/workbench/browser/parts/paneCompositePartService.ts
var PaneCompositePartService = class extends Disposable {
  constructor(instantiationService) {
    super();
    this.paneCompositeParts = /* @__PURE__ */ new Map();
    const panelPart = instantiationService.createInstance(PanelPart);
    const sideBarPart = instantiationService.createInstance(SidebarPart);
    const auxiliaryBarPart = instantiationService.createInstance(AuxiliaryBarPart);
    this.paneCompositeParts.set(1 /* Panel */, panelPart);
    this.paneCompositeParts.set(0 /* Sidebar */, sideBarPart);
    this.paneCompositeParts.set(2 /* AuxiliaryBar */, auxiliaryBarPart);
    const viewContainerLocations = [0 /* Sidebar */, 1 /* Panel */, 2 /* AuxiliaryBar */];
    const eventDisposables = this._register(new DisposableStore());
    this.onDidPaneCompositeOpen = Event2.any(...viewContainerLocations.map((loc) => Event2.map(this.paneCompositeParts.get(loc).onDidPaneCompositeOpen, (composite) => {
      return { composite, viewContainerLocation: loc };
    }, eventDisposables)));
    this.onDidPaneCompositeClose = Event2.any(...viewContainerLocations.map((loc) => Event2.map(this.paneCompositeParts.get(loc).onDidPaneCompositeClose, (composite) => {
      return { composite, viewContainerLocation: loc };
    }, eventDisposables)));
  }
  getRegistryId(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).registryId;
  }
  getPartId(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).partId;
  }
  openPaneComposite(id2, viewContainerLocation, focus) {
    return this.getPartByLocation(viewContainerLocation).openPaneComposite(id2, focus);
  }
  getActivePaneComposite(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getActivePaneComposite();
  }
  getPaneComposite(id2, viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getPaneComposite(id2);
  }
  getPaneComposites(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getPaneComposites();
  }
  getPinnedPaneCompositeIds(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getPinnedPaneCompositeIds();
  }
  getVisiblePaneCompositeIds(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getVisiblePaneCompositeIds();
  }
  getPaneCompositeIds(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getPaneCompositeIds();
  }
  getProgressIndicator(id2, viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getProgressIndicator(id2);
  }
  hideActivePaneComposite(viewContainerLocation) {
    this.getPartByLocation(viewContainerLocation).hideActivePaneComposite();
  }
  getLastActivePaneCompositeId(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getLastActivePaneCompositeId();
  }
  getPartByLocation(viewContainerLocation) {
    return assertReturnsDefined(this.paneCompositeParts.get(viewContainerLocation));
  }
};

PaneCompositePartService = __decorateClass([
  __decorateParam(0, IInstantiationService)
], PaneCompositePartService);

registerSingleton(IPaneCompositePartService, PaneCompositePartService, 1 /* Delayed */);
export { PaneCompositePartService };
