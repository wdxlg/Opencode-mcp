// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/paneCompositePartService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { getClientArea } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { MobilePanelPart } from "./module-3446.mjs";
import { PanelPart } from "./module-3442.mjs";
import { MobileSidebarPart } from "./module-3447.mjs";
import { SidebarPart } from "./module-3443.mjs";
import { MobileAuxiliaryBarPart } from "./module-3448.mjs";
import { AuxiliaryBarPart } from "./module-3444.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IPaneCompositePartService } from "./module-1093.mjs";


// src/vs/sessions/browser/paneCompositePartService.ts
var AgenticPaneCompositePartService = class extends Disposable {
  constructor(instantiationService, layoutService, editorGroupsService) {
    super();
    this._onDidPaneCompositeOpen = this._register(new Emitter());
    this.onDidPaneCompositeOpen = this._onDidPaneCompositeOpen.event;
    this._onDidPaneCompositeClose = this._register(new Emitter());
    this.onDidPaneCompositeClose = this._onDidPaneCompositeClose.event;
    this.paneCompositeParts = /* @__PURE__ */ new Map();
    const { width: width2 } = getClientArea(mainWindow.document.body);
    const isPhoneLayout2 = width2 < 640;
    this.registerPart(1 /* Panel */, instantiationService.createInstance(isPhoneLayout2 ? MobilePanelPart : PanelPart));
    this.registerPart(0 /* Sidebar */, instantiationService.createInstance(isPhoneLayout2 ? MobileSidebarPart : SidebarPart));
    const auxiliaryBarPart = layoutService.isSinglePaneLayoutEnabled ? editorGroupsService.mainPart.auxiliaryBar : instantiationService.createInstance(isPhoneLayout2 ? MobileAuxiliaryBarPart : AuxiliaryBarPart);
    this.registerPart(2 /* AuxiliaryBar */, auxiliaryBarPart);
  }
  registerPart(location2, part) {
    this.paneCompositeParts.set(location2, part);
    this._register(part.onDidPaneCompositeOpen((composite) => this._onDidPaneCompositeOpen.fire({ composite, viewContainerLocation: location2 })));
    this._register(part.onDidPaneCompositeClose((composite) => this._onDidPaneCompositeClose.fire({ composite, viewContainerLocation: location2 })));
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

AgenticPaneCompositePartService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IAgentWorkbenchLayoutService),
  __decorateParam(2, IEditorGroupsService)
], AgenticPaneCompositePartService);

registerSingleton(IPaneCompositePartService, AgenticPaneCompositePartService, 1 /* Delayed */);
export { AgenticPaneCompositePartService };
