// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/views/browser/viewsService.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { FocusedViewContext, getVisbileViewContextKey } from "./module-0950.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IViewsService } from "./module-1246.mjs";
import { PaneComposite, PaneCompositeDescriptor } from "./module-1518.mjs";
import { FilterViewPaneContainer } from "./module-1670.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { Registry } from "./module-0090.mjs";
import { isString } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { IPaneCompositePartService } from "./module-1093.mjs";
import { IEditorService } from "./module-0935.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/views/browser/viewsService.ts
var ViewsService = class extends Disposable {
  constructor(viewDescriptorService, paneCompositeService, contextKeyService, layoutService, editorService) {
    super();
    this.viewDescriptorService = viewDescriptorService;
    this.paneCompositeService = paneCompositeService;
    this.contextKeyService = contextKeyService;
    this.layoutService = layoutService;
    this.editorService = editorService;
    this._onDidChangeViewVisibility = this._register(new Emitter());
    this.onDidChangeViewVisibility = this._onDidChangeViewVisibility.event;
    this._onDidChangeViewContainerVisibility = this._register(new Emitter());
    this.onDidChangeViewContainerVisibility = this._onDidChangeViewContainerVisibility.event;
    this._onDidChangeFocusedView = this._register(new Emitter());
    this.onDidChangeFocusedView = this._onDidChangeFocusedView.event;
    this.viewContainerDisposables = this._register(new DisposableMap());
    this.viewDisposable = /* @__PURE__ */ new Map();
    this.enabledViewContainersContextKeys = /* @__PURE__ */ new Map();
    this.visibleViewContextKeys = /* @__PURE__ */ new Map();
    this.viewPaneContainers = /* @__PURE__ */ new Map();
    this._register(toDisposable(() => {
      this.viewDisposable.forEach((disposable) => disposable.dispose());
      this.viewDisposable.clear();
    }));
    this.viewDescriptorService.viewContainers.forEach((viewContainer) => this.onDidRegisterViewContainer(viewContainer, this.viewDescriptorService.getViewContainerLocation(viewContainer)));
    this._register(this.viewDescriptorService.onDidChangeViewContainers(({ added, removed }) => this.onDidChangeContainers(added, removed)));
    this._register(this.viewDescriptorService.onDidChangeContainerLocation(({ viewContainer, from, to }) => this.onDidChangeContainerLocation(viewContainer, from, to)));
    this._register(this.paneCompositeService.onDidPaneCompositeOpen((e4) => this._onDidChangeViewContainerVisibility.fire({ id: e4.composite.getId(), visible: true, location: e4.viewContainerLocation })));
    this._register(this.paneCompositeService.onDidPaneCompositeClose((e4) => this._onDidChangeViewContainerVisibility.fire({ id: e4.composite.getId(), visible: false, location: e4.viewContainerLocation })));
    this.focusedViewContextKey = FocusedViewContext.bindTo(contextKeyService);
  }
  onViewsAdded(added) {
    for (const view of added) {
      this.onViewsVisibilityChanged(view, view.isBodyVisible());
    }
  }
  onViewsVisibilityChanged(view, visible) {
    this.getOrCreateActiveViewContextKey(view).set(visible);
    this._onDidChangeViewVisibility.fire({ id: view.id, visible });
  }
  onViewsRemoved(removed) {
    for (const view of removed) {
      this.onViewsVisibilityChanged(view, false);
    }
  }
  getOrCreateActiveViewContextKey(view) {
    const visibleContextKeyId = getVisbileViewContextKey(view.id);
    let contextKey = this.visibleViewContextKeys.get(visibleContextKeyId);
    if (!contextKey) {
      contextKey = new RawContextKey(visibleContextKeyId, false).bindTo(this.contextKeyService);
      this.visibleViewContextKeys.set(visibleContextKeyId, contextKey);
    }
    return contextKey;
  }
  onDidChangeContainers(added, removed) {
    for (const { container: container2, location: location2 } of removed) {
      this.onDidDeregisterViewContainer(container2, location2);
    }
    for (const { container: container2, location: location2 } of added) {
      this.onDidRegisterViewContainer(container2, location2);
    }
  }
  onDidRegisterViewContainer(viewContainer, viewContainerLocation) {
    this.registerPaneComposite(viewContainer, viewContainerLocation);
    const disposables = new DisposableStore();
    const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
    this.onViewDescriptorsAdded(viewContainerModel.allViewDescriptors, viewContainer);
    disposables.add(viewContainerModel.onDidChangeAllViewDescriptors(({ added, removed }) => {
      this.onViewDescriptorsAdded(added, viewContainer);
      this.onViewDescriptorsRemoved(removed);
    }));
    this.updateViewContainerEnablementContextKey(viewContainer);
    disposables.add(viewContainerModel.onDidChangeActiveViewDescriptors(() => this.updateViewContainerEnablementContextKey(viewContainer)));
    disposables.add(this.registerOpenViewContainerAction(viewContainer));
    this.viewContainerDisposables.set(viewContainer.id, disposables);
  }
  onDidDeregisterViewContainer(viewContainer, viewContainerLocation) {
    this.deregisterPaneComposite(viewContainer, viewContainerLocation);
    this.viewContainerDisposables.deleteAndDispose(viewContainer.id);
  }
  onDidChangeContainerLocation(viewContainer, from, to) {
    this.deregisterPaneComposite(viewContainer, from);
    this.registerPaneComposite(viewContainer, to);
    if (this.layoutService.isVisible(this.paneCompositeService.getPartId(to)) && this.viewDescriptorService.getViewContainersByLocation(to).filter((vc) => this.isViewContainerActive(vc.id)).length === 1) {
      this.openViewContainer(viewContainer.id);
    }
  }
  onViewDescriptorsAdded(views, container2) {
    const location2 = this.viewDescriptorService.getViewContainerLocation(container2);
    if (location2 === null) {
      return;
    }
    for (const viewDescriptor3 of views) {
      const disposables = new DisposableStore();
      disposables.add(this.registerOpenViewAction(viewDescriptor3));
      disposables.add(this.registerFocusViewAction(viewDescriptor3, container2.title));
      disposables.add(this.registerResetViewLocationAction(viewDescriptor3));
      this.viewDisposable.set(viewDescriptor3, disposables);
    }
  }
  onViewDescriptorsRemoved(views) {
    for (const view of views) {
      const disposable = this.viewDisposable.get(view);
      if (disposable) {
        disposable.dispose();
        this.viewDisposable.delete(view);
      }
    }
  }
  updateViewContainerEnablementContextKey(viewContainer) {
    let contextKey = this.enabledViewContainersContextKeys.get(viewContainer.id);
    if (!contextKey) {
      contextKey = this.contextKeyService.createKey(getEnabledViewContainerContextKey(viewContainer.id), false);
      this.enabledViewContainersContextKeys.set(viewContainer.id, contextKey);
    }
    contextKey.set(!(viewContainer.hideIfEmpty && this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.length === 0));
  }
  async openComposite(compositeId, location2, focus) {
    return this.paneCompositeService.openPaneComposite(compositeId, location2, focus);
  }
  getComposite(compositeId, location2) {
    return this.paneCompositeService.getPaneComposite(compositeId, location2);
  }
  // One view container can be visible at a time in a location
  isViewContainerVisible(id2) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(id2);
    if (!viewContainer) {
      return false;
    }
    const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
    if (viewContainerLocation === null) {
      return false;
    }
    return this.paneCompositeService.getActivePaneComposite(viewContainerLocation)?.getId() === id2;
  }
  // Multiple view containers can be active/inactive at a time in a location
  isViewContainerActive(id2) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(id2);
    if (!viewContainer) {
      return false;
    }
    if (!viewContainer.hideIfEmpty) {
      return true;
    }
    return this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.length > 0;
  }
  getVisibleViewContainer(location2) {
    const viewContainerId = this.paneCompositeService.getActivePaneComposite(location2)?.getId();
    return viewContainerId ? this.viewDescriptorService.getViewContainerById(viewContainerId) : null;
  }
  getActiveViewPaneContainerWithId(viewContainerId) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(viewContainerId);
    return viewContainer ? this.getActiveViewPaneContainer(viewContainer) : null;
  }
  async openViewContainer(id2, focus) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(id2);
    if (viewContainer) {
      const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
      if (viewContainerLocation !== null) {
        const paneComposite = await this.paneCompositeService.openPaneComposite(id2, viewContainerLocation, focus);
        return paneComposite || null;
      }
    }
    return null;
  }
  async closeViewContainer(id2) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(id2);
    if (viewContainer) {
      const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
      const isActive2 = viewContainerLocation !== null && this.paneCompositeService.getActivePaneComposite(viewContainerLocation);
      if (viewContainerLocation !== null) {
        return isActive2 ? this.layoutService.setPartHidden(true, this.paneCompositeService.getPartId(viewContainerLocation)) : void 0;
      }
    }
  }
  isViewVisible(id2) {
    const activeView = this.getActiveViewWithId(id2);
    return activeView?.isBodyVisible() || false;
  }
  getActiveViewWithId(id2) {
    const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id2);
    if (viewContainer) {
      const activeViewPaneContainer = this.getActiveViewPaneContainer(viewContainer);
      if (activeViewPaneContainer) {
        return activeViewPaneContainer.getView(id2);
      }
    }
    return null;
  }
  getViewWithId(id2) {
    const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id2);
    if (viewContainer) {
      const viewPaneContainer = this.viewPaneContainers.get(viewContainer.id);
      if (viewPaneContainer) {
        return viewPaneContainer.getView(id2);
      }
    }
    return null;
  }
  getFocusedView() {
    const viewId = this.contextKeyService.getContextKeyValue(FocusedViewContext.key) ?? "";
    return this.viewDescriptorService.getViewDescriptorById(viewId.toString());
  }
  getFocusedViewName() {
    const textEditorFocused = this.editorService.activeTextEditorControl?.hasTextFocus() ? localize(23721, null) : void 0;
    return this.getFocusedView()?.name?.value ?? textEditorFocused ?? "";
  }
  async openView(id2, focus) {
    const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id2);
    if (!viewContainer) {
      return null;
    }
    if (!this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.some((viewDescriptor3) => viewDescriptor3.id === id2)) {
      return null;
    }
    const location2 = this.viewDescriptorService.getViewContainerLocation(viewContainer);
    const compositeDescriptor = this.getComposite(viewContainer.id, location2);
    if (compositeDescriptor) {
      const paneComposite = await this.openComposite(compositeDescriptor.id, location2);
      if (paneComposite?.openView) {
        return paneComposite.openView(id2, focus) || null;
      } else if (focus) {
        paneComposite?.focus();
      }
    }
    return null;
  }
  closeView(id2) {
    const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id2);
    if (viewContainer) {
      const activeViewPaneContainer = this.getActiveViewPaneContainer(viewContainer);
      if (activeViewPaneContainer) {
        const view = activeViewPaneContainer.getView(id2);
        if (view) {
          if (activeViewPaneContainer.views.length === 1) {
            const location2 = this.viewDescriptorService.getViewContainerLocation(viewContainer);
            if (location2 === 0 /* Sidebar */) {
              this.layoutService.setPartHidden(true, "workbench.parts.sidebar" /* SIDEBAR_PART */);
            } else if (location2 === 1 /* Panel */ || location2 === 2 /* AuxiliaryBar */) {
              this.paneCompositeService.hideActivePaneComposite(location2);
            }
            if (this.focusedViewContextKey.get() === id2) {
              this.focusedViewContextKey.reset();
            }
          } else {
            view.setExpanded(false);
          }
        }
      }
    }
  }
  getActiveViewPaneContainer(viewContainer) {
    const location2 = this.viewDescriptorService.getViewContainerLocation(viewContainer);
    if (location2 === null) {
      return null;
    }
    const activePaneComposite = this.paneCompositeService.getActivePaneComposite(location2);
    if (activePaneComposite?.getId() === viewContainer.id) {
      return activePaneComposite.getViewPaneContainer() || null;
    }
    return null;
  }
  getViewProgressIndicator(viewId) {
    const viewContainer = this.viewDescriptorService.getViewContainerByViewId(viewId);
    if (!viewContainer) {
      return void 0;
    }
    const viewPaneContainer = this.viewPaneContainers.get(viewContainer.id);
    if (!viewPaneContainer) {
      return void 0;
    }
    const view = viewPaneContainer.getView(viewId);
    if (!view) {
      return void 0;
    }
    if (viewPaneContainer.isViewMergedWithContainer()) {
      return this.getViewContainerProgressIndicator(viewContainer);
    }
    return view.getProgressIndicator();
  }
  getViewContainerProgressIndicator(viewContainer) {
    const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
    if (viewContainerLocation === null) {
      return void 0;
    }
    return this.paneCompositeService.getProgressIndicator(viewContainer.id, viewContainerLocation);
  }
  registerOpenViewContainerAction(viewContainer) {
    const disposables = new DisposableStore();
    if (viewContainer.openCommandActionDescriptor) {
      const { id: id2, mnemonicTitle, keybindings, order } = viewContainer.openCommandActionDescriptor ?? { id: viewContainer.id };
      const title = viewContainer.openCommandActionDescriptor.title ?? viewContainer.title;
      const that = this;
      disposables.add(registerAction2(class OpenViewContainerAction extends Action2 {
        constructor() {
          super({
            id: id2,
            get title() {
              const viewContainerLocation = that.viewDescriptorService.getViewContainerLocation(viewContainer);
              const localizedTitle = typeof title === "string" ? title : title.value;
              const originalTitle = typeof title === "string" ? title : title.original;
              if (viewContainerLocation === 0 /* Sidebar */) {
                return { value: localize(23726, null, localizedTitle), original: `Show ${originalTitle}` };
              } else {
                return { value: localize(23727, null, localizedTitle), original: `Toggle ${originalTitle}` };
              }
            },
            category: Categories.View,
            precondition: ContextKeyExpr.has(getEnabledViewContainerContextKey(viewContainer.id)),
            keybinding: keybindings ? { ...keybindings, weight: 200 /* WorkbenchContrib */ } : void 0,
            f1: true
          });
        }
        async run(serviceAccessor) {
          const editorGroupService = serviceAccessor.get(IEditorGroupsService);
          const viewDescriptorService = serviceAccessor.get(IViewDescriptorService);
          const layoutService = serviceAccessor.get(IWorkbenchLayoutService);
          const viewsService = serviceAccessor.get(IViewsService);
          const viewContainerLocation = viewDescriptorService.getViewContainerLocation(viewContainer);
          switch (viewContainerLocation) {
            case 2 /* AuxiliaryBar */:
            case 0 /* Sidebar */: {
              const part = viewContainerLocation === 0 /* Sidebar */ ? "workbench.parts.sidebar" /* SIDEBAR_PART */ : "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */;
              if (!viewsService.isViewContainerVisible(viewContainer.id) || !layoutService.hasFocus(part)) {
                await viewsService.openViewContainer(viewContainer.id, true);
              } else {
                editorGroupService.activeGroup.focus();
              }
              break;
            }
            case 1 /* Panel */:
              if (!viewsService.isViewContainerVisible(viewContainer.id) || !layoutService.hasFocus("workbench.parts.panel" /* PANEL_PART */)) {
                await viewsService.openViewContainer(viewContainer.id, true);
              } else {
                viewsService.closeViewContainer(viewContainer.id);
              }
              break;
          }
        }
      }));
      if (mnemonicTitle) {
        const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(viewContainer);
        disposables.add(MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
          command: {
            id: id2,
            title: mnemonicTitle
          },
          group: defaultLocation === 0 /* Sidebar */ ? "3_sidebar" : defaultLocation === 2 /* AuxiliaryBar */ ? "4_auxbar" : "5_panel",
          when: ContextKeyExpr.has(getEnabledViewContainerContextKey(viewContainer.id)),
          order: order ?? Number.MAX_VALUE
        }));
      }
    }
    return disposables;
  }
  registerOpenViewAction(viewDescriptor3) {
    const disposables = new DisposableStore();
    const title = viewDescriptor3.openCommandActionDescriptor?.title ?? viewDescriptor3.name;
    const commandId = viewDescriptor3.openCommandActionDescriptor?.id ?? `${viewDescriptor3.id}.open`;
    const that = this;
    disposables.add(registerAction2(class OpenViewAction extends Action2 {
      constructor() {
        super({
          id: commandId,
          get title() {
            const viewContainerLocation = that.viewDescriptorService.getViewLocationById(viewDescriptor3.id);
            const localizedTitle = typeof title === "string" ? title : title.value;
            const originalTitle = typeof title === "string" ? title : title.original;
            if (viewContainerLocation === 0 /* Sidebar */) {
              return { value: localize(23726, null, localizedTitle), original: `Show ${originalTitle}` };
            } else {
              return { value: localize(23727, null, localizedTitle), original: `Toggle ${originalTitle}` };
            }
          },
          category: Categories.View,
          precondition: ContextKeyExpr.has(`${viewDescriptor3.id}.active`),
          keybinding: viewDescriptor3.openCommandActionDescriptor?.keybindings ? { ...viewDescriptor3.openCommandActionDescriptor.keybindings, weight: 200 /* WorkbenchContrib */ } : void 0,
          f1: viewDescriptor3.openCommandActionDescriptor ? true : void 0,
          metadata: {
            description: localize(23723, null, viewDescriptor3.name.value),
            args: [
              {
                name: "options",
                schema: {
                  type: "object",
                  properties: {
                    "preserveFocus": {
                      type: "boolean",
                      default: false,
                      description: localize(23724, null)
                    }
                  }
                }
              }
            ]
          }
        });
      }
      async run(serviceAccessor, options3) {
        const editorGroupService = serviceAccessor.get(IEditorGroupsService);
        const viewDescriptorService = serviceAccessor.get(IViewDescriptorService);
        const layoutService = serviceAccessor.get(IWorkbenchLayoutService);
        const viewsService = serviceAccessor.get(IViewsService);
        const contextKeyService = serviceAccessor.get(IContextKeyService);
        const focusedViewId = FocusedViewContext.getValue(contextKeyService);
        if (focusedViewId === viewDescriptor3.id && !options3?.preserveFocus) {
          const viewLocation = viewDescriptorService.getViewLocationById(viewDescriptor3.id);
          if (viewDescriptorService.getViewLocationById(viewDescriptor3.id) === 0 /* Sidebar */) {
            editorGroupService.activeGroup.focus();
          } else if (viewLocation !== null) {
            layoutService.setPartHidden(true, that.paneCompositeService.getPartId(viewLocation));
          }
        } else {
          await viewsService.openView(viewDescriptor3.id, !options3?.preserveFocus);
        }
      }
    }));
    if (viewDescriptor3.openCommandActionDescriptor?.mnemonicTitle) {
      const defaultViewContainer = this.viewDescriptorService.getDefaultContainerById(viewDescriptor3.id);
      if (defaultViewContainer) {
        const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(defaultViewContainer);
        disposables.add(MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
          command: {
            id: commandId,
            title: viewDescriptor3.openCommandActionDescriptor.mnemonicTitle
          },
          group: defaultLocation === 0 /* Sidebar */ ? "3_sidebar" : defaultLocation === 2 /* AuxiliaryBar */ ? "4_auxbar" : "5_panel",
          when: ContextKeyExpr.has(`${viewDescriptor3.id}.active`),
          order: viewDescriptor3.openCommandActionDescriptor.order ?? Number.MAX_VALUE
        }));
      }
    }
    return disposables;
  }
  registerFocusViewAction(viewDescriptor3, category9) {
    return registerAction2(class FocusViewAction extends Action2 {
      constructor() {
        const title = localize2(23722, "Focus on {0} View", viewDescriptor3.name.value);
        super({
          id: viewDescriptor3.focusCommand ? viewDescriptor3.focusCommand.id : `${viewDescriptor3.id}.focus`,
          title,
          category: category9,
          menu: [{
            id: MenuId.CommandPalette,
            when: viewDescriptor3.when
          }],
          keybinding: {
            when: ContextKeyExpr.has(`${viewDescriptor3.id}.active`),
            weight: 200 /* WorkbenchContrib */,
            primary: viewDescriptor3.focusCommand?.keybindings?.primary,
            secondary: viewDescriptor3.focusCommand?.keybindings?.secondary,
            linux: viewDescriptor3.focusCommand?.keybindings?.linux,
            mac: viewDescriptor3.focusCommand?.keybindings?.mac,
            win: viewDescriptor3.focusCommand?.keybindings?.win
          },
          metadata: {
            description: title.value,
            args: [
              {
                name: "focusOptions",
                description: "Focus Options",
                schema: {
                  type: "object",
                  properties: {
                    "preserveFocus": {
                      type: "boolean",
                      default: false
                    }
                  }
                }
              }
            ]
          }
        });
      }
      run(accessor, options3) {
        accessor.get(IViewsService).openView(viewDescriptor3.id, !options3?.preserveFocus);
      }
    });
  }
  registerResetViewLocationAction(viewDescriptor3) {
    return registerAction2(class ResetViewLocationAction extends Action2 {
      constructor() {
        super({
          id: `${viewDescriptor3.id}.resetViewLocation`,
          title: localize2(23725, "Reset Location"),
          menu: [{
            id: MenuId.ViewTitleContext,
            when: ContextKeyExpr.or(
              ContextKeyExpr.and(
                ContextKeyExpr.equals("view", viewDescriptor3.id),
                ContextKeyExpr.equals(`${viewDescriptor3.id}.defaultViewLocation`, false)
              )
            ),
            group: "1_hide",
            order: 2
          }]
        });
      }
      run(accessor) {
        const viewDescriptorService = accessor.get(IViewDescriptorService);
        const defaultContainer = viewDescriptorService.getDefaultContainerById(viewDescriptor3.id);
        const containerModel = viewDescriptorService.getViewContainerModel(defaultContainer);
        if (defaultContainer.hideIfEmpty && containerModel.visibleViewDescriptors.length === 0) {
          const defaultLocation = viewDescriptorService.getDefaultViewContainerLocation(defaultContainer);
          viewDescriptorService.moveViewContainerToLocation(defaultContainer, defaultLocation, void 0, this.desc.id);
        }
        viewDescriptorService.moveViewsToContainer([viewDescriptor3], defaultContainer, void 0, this.desc.id);
        accessor.get(IViewsService).openView(viewDescriptor3.id, true);
      }
    });
  }
  registerPaneComposite(viewContainer, viewContainerLocation) {
    const that = this;
    let PaneContainer = class extends PaneComposite {
      constructor(telemetryService, contextService, storageService, instantiationService, themeService, contextMenuService, extensionService) {
        super(viewContainer.id, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService);
      }
      createViewPaneContainer(element) {
        const viewPaneContainerDisposables = this._register(new DisposableStore());
        const viewPaneContainer = that.createViewPaneContainer(element, viewContainer, viewContainerLocation, viewPaneContainerDisposables, this.instantiationService);
        if (!(viewPaneContainer instanceof FilterViewPaneContainer)) {
          viewPaneContainerDisposables.add(Event2.any(viewPaneContainer.onDidAddViews, viewPaneContainer.onDidRemoveViews, viewPaneContainer.onTitleAreaUpdate)(() => {
            this.updateTitleArea();
          }));
        }
        return viewPaneContainer;
      }
    };
    PaneContainer = __decorateClass([
      __decorateParam(0, ITelemetryService),
      __decorateParam(1, IWorkspaceContextService),
      __decorateParam(2, IStorageService),
      __decorateParam(3, IInstantiationService),
      __decorateParam(4, IThemeService),
      __decorateParam(5, IContextMenuService),
      __decorateParam(6, IExtensionService)
    ], PaneContainer);
    Registry.as(this.paneCompositeService.getRegistryId(viewContainerLocation)).registerPaneComposite(PaneCompositeDescriptor.create(
      PaneContainer,
      viewContainer.id,
      typeof viewContainer.title === "string" ? viewContainer.title : viewContainer.title.value,
      isString(viewContainer.icon) ? viewContainer.icon : void 0,
      viewContainer.order,
      viewContainer.requestedIndex,
      viewContainer.icon instanceof URI ? viewContainer.icon : void 0
    ));
  }
  deregisterPaneComposite(viewContainer, viewContainerLocation) {
    Registry.as(this.paneCompositeService.getRegistryId(viewContainerLocation)).deregisterPaneComposite(viewContainer.id);
  }
  createViewPaneContainer(element, viewContainer, viewContainerLocation, disposables, instantiationService) {
    const viewPaneContainer = instantiationService.createInstance(viewContainer.ctorDescriptor.ctor, ...viewContainer.ctorDescriptor.staticArguments || []);
    this.viewPaneContainers.set(viewPaneContainer.getId(), viewPaneContainer);
    disposables.add(toDisposable(() => this.viewPaneContainers.delete(viewPaneContainer.getId())));
    disposables.add(viewPaneContainer.onDidAddViews((views) => this.onViewsAdded(views)));
    disposables.add(viewPaneContainer.onDidChangeViewVisibility((view) => this.onViewsVisibilityChanged(view, view.isBodyVisible())));
    disposables.add(viewPaneContainer.onDidRemoveViews((views) => this.onViewsRemoved(views)));
    disposables.add(viewPaneContainer.onDidFocusView((view) => {
      if (this.focusedViewContextKey.get() !== view.id) {
        this.focusedViewContextKey.set(view.id);
        this._onDidChangeFocusedView.fire();
      }
    }));
    disposables.add(viewPaneContainer.onDidBlurView((view) => {
      if (this.focusedViewContextKey.get() === view.id) {
        this.focusedViewContextKey.reset();
        this._onDidChangeFocusedView.fire();
      }
    }));
    return viewPaneContainer;
  }
};

ViewsService = __decorateClass([
  __decorateParam(0, IViewDescriptorService),
  __decorateParam(1, IPaneCompositePartService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IWorkbenchLayoutService),
  __decorateParam(4, IEditorService)
], ViewsService);

function getEnabledViewContainerContextKey(viewContainerId) {
  return `viewContainer.${viewContainerId}.enabled`;
}

registerSingleton(
  IViewsService,
  ViewsService,
  0 /* Eager */
  /* Eager because it registers viewlets and panels in the constructor which are required during workbench layout */
);
export { getEnabledViewContainerContextKey, ViewsService };
