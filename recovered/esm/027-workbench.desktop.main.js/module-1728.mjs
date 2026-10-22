// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/views/browser/viewsService.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { FocusedViewContext, getVisbileViewContextKey } from "./module-0949.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IViewsService } from "./module-1246.mjs";
import { PaneComposite, PaneCompositeDescriptor } from "./module-1526.mjs";
import { FilterViewPaneContainer } from "./module-1727.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { Registry } from "./module-0090.mjs";
import { isString } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";
import { IEditorService } from "./module-0934.mjs";
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
    this.viewDescriptorService.viewContainers.forEach((viewContainer5) => this.onDidRegisterViewContainer(viewContainer5, this.viewDescriptorService.getViewContainerLocation(viewContainer5)));
    this._register(this.viewDescriptorService.onDidChangeViewContainers(({ added, removed }) => this.onDidChangeContainers(added, removed)));
    this._register(this.viewDescriptorService.onDidChangeContainerLocation(({ viewContainer: viewContainer5, from, to }) => this.onDidChangeContainerLocation(viewContainer5, from, to)));
    this._register(this.paneCompositeService.onDidPaneCompositeOpen((e) => this._onDidChangeViewContainerVisibility.fire({ id: e.composite.getId(), visible: true, location: e.viewContainerLocation })));
    this._register(this.paneCompositeService.onDidPaneCompositeClose((e) => this._onDidChangeViewContainerVisibility.fire({ id: e.composite.getId(), visible: false, location: e.viewContainerLocation })));
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
    for (const { container: container3, location: location2 } of removed) {
      this.onDidDeregisterViewContainer(container3, location2);
    }
    for (const { container: container3, location: location2 } of added) {
      this.onDidRegisterViewContainer(container3, location2);
    }
  }
  onDidRegisterViewContainer(viewContainer5, viewContainerLocation) {
    this.registerPaneComposite(viewContainer5, viewContainerLocation);
    const disposables = new DisposableStore();
    const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer5);
    this.onViewDescriptorsAdded(viewContainerModel.allViewDescriptors, viewContainer5);
    disposables.add(viewContainerModel.onDidChangeAllViewDescriptors(({ added, removed }) => {
      this.onViewDescriptorsAdded(added, viewContainer5);
      this.onViewDescriptorsRemoved(removed);
    }));
    this.updateViewContainerEnablementContextKey(viewContainer5);
    disposables.add(viewContainerModel.onDidChangeActiveViewDescriptors(() => this.updateViewContainerEnablementContextKey(viewContainer5)));
    disposables.add(this.registerOpenViewContainerAction(viewContainer5));
    this.viewContainerDisposables.set(viewContainer5.id, disposables);
  }
  onDidDeregisterViewContainer(viewContainer5, viewContainerLocation) {
    this.deregisterPaneComposite(viewContainer5, viewContainerLocation);
    this.viewContainerDisposables.deleteAndDispose(viewContainer5.id);
  }
  onDidChangeContainerLocation(viewContainer5, from, to) {
    this.deregisterPaneComposite(viewContainer5, from);
    this.registerPaneComposite(viewContainer5, to);
    if (this.layoutService.isVisible(this.paneCompositeService.getPartId(to)) && this.viewDescriptorService.getViewContainersByLocation(to).filter((vc) => this.isViewContainerActive(vc.id)).length === 1) {
      this.openViewContainer(viewContainer5.id);
    }
  }
  onViewDescriptorsAdded(views, container3) {
    const location2 = this.viewDescriptorService.getViewContainerLocation(container3);
    if (location2 === null) {
      return;
    }
    for (const viewDescriptor4 of views) {
      const disposables = new DisposableStore();
      disposables.add(this.registerOpenViewAction(viewDescriptor4));
      disposables.add(this.registerFocusViewAction(viewDescriptor4, container3.title));
      disposables.add(this.registerResetViewLocationAction(viewDescriptor4));
      this.viewDisposable.set(viewDescriptor4, disposables);
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
  updateViewContainerEnablementContextKey(viewContainer5) {
    let contextKey = this.enabledViewContainersContextKeys.get(viewContainer5.id);
    if (!contextKey) {
      contextKey = this.contextKeyService.createKey(getEnabledViewContainerContextKey(viewContainer5.id), false);
      this.enabledViewContainersContextKeys.set(viewContainer5.id, contextKey);
    }
    contextKey.set(!(viewContainer5.hideIfEmpty && this.viewDescriptorService.getViewContainerModel(viewContainer5).activeViewDescriptors.length === 0));
  }
  async openComposite(compositeId, location2, focus) {
    return this.paneCompositeService.openPaneComposite(compositeId, location2, focus);
  }
  getComposite(compositeId, location2) {
    return this.paneCompositeService.getPaneComposite(compositeId, location2);
  }
  // One view container can be visible at a time in a location
  isViewContainerVisible(id2) {
    const viewContainer5 = this.viewDescriptorService.getViewContainerById(id2);
    if (!viewContainer5) {
      return false;
    }
    const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer5);
    if (viewContainerLocation === null) {
      return false;
    }
    return this.paneCompositeService.getActivePaneComposite(viewContainerLocation)?.getId() === id2;
  }
  // Multiple view containers can be active/inactive at a time in a location
  isViewContainerActive(id2) {
    const viewContainer5 = this.viewDescriptorService.getViewContainerById(id2);
    if (!viewContainer5) {
      return false;
    }
    if (!viewContainer5.hideIfEmpty) {
      return true;
    }
    return this.viewDescriptorService.getViewContainerModel(viewContainer5).activeViewDescriptors.length > 0;
  }
  getVisibleViewContainer(location2) {
    const viewContainerId = this.paneCompositeService.getActivePaneComposite(location2)?.getId();
    return viewContainerId ? this.viewDescriptorService.getViewContainerById(viewContainerId) : null;
  }
  getActiveViewPaneContainerWithId(viewContainerId) {
    const viewContainer5 = this.viewDescriptorService.getViewContainerById(viewContainerId);
    return viewContainer5 ? this.getActiveViewPaneContainer(viewContainer5) : null;
  }
  async openViewContainer(id2, focus) {
    const viewContainer5 = this.viewDescriptorService.getViewContainerById(id2);
    if (viewContainer5) {
      const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer5);
      if (viewContainerLocation !== null) {
        const paneComposite = await this.paneCompositeService.openPaneComposite(id2, viewContainerLocation, focus);
        return paneComposite || null;
      }
    }
    return null;
  }
  async closeViewContainer(id2) {
    const viewContainer5 = this.viewDescriptorService.getViewContainerById(id2);
    if (viewContainer5) {
      const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer5);
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
    const viewContainer5 = this.viewDescriptorService.getViewContainerByViewId(id2);
    if (viewContainer5) {
      const activeViewPaneContainer = this.getActiveViewPaneContainer(viewContainer5);
      if (activeViewPaneContainer) {
        return activeViewPaneContainer.getView(id2);
      }
    }
    return null;
  }
  getViewWithId(id2) {
    const viewContainer5 = this.viewDescriptorService.getViewContainerByViewId(id2);
    if (viewContainer5) {
      const viewPaneContainer = this.viewPaneContainers.get(viewContainer5.id);
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
    const viewContainer5 = this.viewDescriptorService.getViewContainerByViewId(id2);
    if (!viewContainer5) {
      return null;
    }
    if (!this.viewDescriptorService.getViewContainerModel(viewContainer5).activeViewDescriptors.some((viewDescriptor4) => viewDescriptor4.id === id2)) {
      return null;
    }
    const location2 = this.viewDescriptorService.getViewContainerLocation(viewContainer5);
    const compositeDescriptor = this.getComposite(viewContainer5.id, location2);
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
    const viewContainer5 = this.viewDescriptorService.getViewContainerByViewId(id2);
    if (viewContainer5) {
      const activeViewPaneContainer = this.getActiveViewPaneContainer(viewContainer5);
      if (activeViewPaneContainer) {
        const view = activeViewPaneContainer.getView(id2);
        if (view) {
          if (activeViewPaneContainer.views.length === 1) {
            const location2 = this.viewDescriptorService.getViewContainerLocation(viewContainer5);
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
  getActiveViewPaneContainer(viewContainer5) {
    const location2 = this.viewDescriptorService.getViewContainerLocation(viewContainer5);
    if (location2 === null) {
      return null;
    }
    const activePaneComposite = this.paneCompositeService.getActivePaneComposite(location2);
    if (activePaneComposite?.getId() === viewContainer5.id) {
      return activePaneComposite.getViewPaneContainer() || null;
    }
    return null;
  }
  getViewProgressIndicator(viewId) {
    const viewContainer5 = this.viewDescriptorService.getViewContainerByViewId(viewId);
    if (!viewContainer5) {
      return void 0;
    }
    const viewPaneContainer = this.viewPaneContainers.get(viewContainer5.id);
    if (!viewPaneContainer) {
      return void 0;
    }
    const view = viewPaneContainer.getView(viewId);
    if (!view) {
      return void 0;
    }
    if (viewPaneContainer.isViewMergedWithContainer()) {
      return this.getViewContainerProgressIndicator(viewContainer5);
    }
    return view.getProgressIndicator();
  }
  getViewContainerProgressIndicator(viewContainer5) {
    const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer5);
    if (viewContainerLocation === null) {
      return void 0;
    }
    return this.paneCompositeService.getProgressIndicator(viewContainer5.id, viewContainerLocation);
  }
  registerOpenViewContainerAction(viewContainer5) {
    const disposables = new DisposableStore();
    if (viewContainer5.openCommandActionDescriptor) {
      const { id: id2, mnemonicTitle, keybindings, order } = viewContainer5.openCommandActionDescriptor ?? { id: viewContainer5.id };
      const title = viewContainer5.openCommandActionDescriptor.title ?? viewContainer5.title;
      const that = this;
      disposables.add(registerAction2(class OpenViewContainerAction extends Action2 {
        constructor() {
          super({
            id: id2,
            get title() {
              const viewContainerLocation = that.viewDescriptorService.getViewContainerLocation(viewContainer5);
              const localizedTitle = typeof title === "string" ? title : title.value;
              const originalTitle = typeof title === "string" ? title : title.original;
              if (viewContainerLocation === 0 /* Sidebar */) {
                return { value: localize(23726, null, localizedTitle), original: `Show ${originalTitle}` };
              } else {
                return { value: localize(23727, null, localizedTitle), original: `Toggle ${originalTitle}` };
              }
            },
            category: Categories.View,
            precondition: ContextKeyExpr.has(getEnabledViewContainerContextKey(viewContainer5.id)),
            keybinding: keybindings ? { ...keybindings, weight: 200 /* WorkbenchContrib */ } : void 0,
            f1: true
          });
        }
        async run(serviceAccessor) {
          const editorGroupService = serviceAccessor.get(IEditorGroupsService);
          const viewDescriptorService = serviceAccessor.get(IViewDescriptorService);
          const layoutService = serviceAccessor.get(IWorkbenchLayoutService);
          const viewsService = serviceAccessor.get(IViewsService);
          const viewContainerLocation = viewDescriptorService.getViewContainerLocation(viewContainer5);
          switch (viewContainerLocation) {
            case 2 /* AuxiliaryBar */:
            case 0 /* Sidebar */: {
              const part = viewContainerLocation === 0 /* Sidebar */ ? "workbench.parts.sidebar" /* SIDEBAR_PART */ : "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */;
              if (!viewsService.isViewContainerVisible(viewContainer5.id) || !layoutService.hasFocus(part)) {
                await viewsService.openViewContainer(viewContainer5.id, true);
              } else {
                editorGroupService.activeGroup.focus();
              }
              break;
            }
            case 1 /* Panel */:
              if (!viewsService.isViewContainerVisible(viewContainer5.id) || !layoutService.hasFocus("workbench.parts.panel" /* PANEL_PART */)) {
                await viewsService.openViewContainer(viewContainer5.id, true);
              } else {
                viewsService.closeViewContainer(viewContainer5.id);
              }
              break;
          }
        }
      }));
      if (mnemonicTitle) {
        const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(viewContainer5);
        disposables.add(MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
          command: {
            id: id2,
            title: mnemonicTitle
          },
          group: defaultLocation === 0 /* Sidebar */ ? "3_sidebar" : defaultLocation === 2 /* AuxiliaryBar */ ? "4_auxbar" : "5_panel",
          when: ContextKeyExpr.has(getEnabledViewContainerContextKey(viewContainer5.id)),
          order: order ?? Number.MAX_VALUE
        }));
      }
    }
    return disposables;
  }
  registerOpenViewAction(viewDescriptor4) {
    const disposables = new DisposableStore();
    const title = viewDescriptor4.openCommandActionDescriptor?.title ?? viewDescriptor4.name;
    const commandId = viewDescriptor4.openCommandActionDescriptor?.id ?? `${viewDescriptor4.id}.open`;
    const that = this;
    disposables.add(registerAction2(class OpenViewAction extends Action2 {
      constructor() {
        super({
          id: commandId,
          get title() {
            const viewContainerLocation = that.viewDescriptorService.getViewLocationById(viewDescriptor4.id);
            const localizedTitle = typeof title === "string" ? title : title.value;
            const originalTitle = typeof title === "string" ? title : title.original;
            if (viewContainerLocation === 0 /* Sidebar */) {
              return { value: localize(23726, null, localizedTitle), original: `Show ${originalTitle}` };
            } else {
              return { value: localize(23727, null, localizedTitle), original: `Toggle ${originalTitle}` };
            }
          },
          category: Categories.View,
          precondition: ContextKeyExpr.has(`${viewDescriptor4.id}.active`),
          keybinding: viewDescriptor4.openCommandActionDescriptor?.keybindings ? { ...viewDescriptor4.openCommandActionDescriptor.keybindings, weight: 200 /* WorkbenchContrib */ } : void 0,
          f1: viewDescriptor4.openCommandActionDescriptor ? true : void 0,
          metadata: {
            description: localize(23723, null, viewDescriptor4.name.value),
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
        if (focusedViewId === viewDescriptor4.id && !options3?.preserveFocus) {
          const viewLocation = viewDescriptorService.getViewLocationById(viewDescriptor4.id);
          if (viewDescriptorService.getViewLocationById(viewDescriptor4.id) === 0 /* Sidebar */) {
            editorGroupService.activeGroup.focus();
          } else if (viewLocation !== null) {
            layoutService.setPartHidden(true, that.paneCompositeService.getPartId(viewLocation));
          }
        } else {
          await viewsService.openView(viewDescriptor4.id, !options3?.preserveFocus);
        }
      }
    }));
    if (viewDescriptor4.openCommandActionDescriptor?.mnemonicTitle) {
      const defaultViewContainer = this.viewDescriptorService.getDefaultContainerById(viewDescriptor4.id);
      if (defaultViewContainer) {
        const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(defaultViewContainer);
        disposables.add(MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
          command: {
            id: commandId,
            title: viewDescriptor4.openCommandActionDescriptor.mnemonicTitle
          },
          group: defaultLocation === 0 /* Sidebar */ ? "3_sidebar" : defaultLocation === 2 /* AuxiliaryBar */ ? "4_auxbar" : "5_panel",
          when: ContextKeyExpr.has(`${viewDescriptor4.id}.active`),
          order: viewDescriptor4.openCommandActionDescriptor.order ?? Number.MAX_VALUE
        }));
      }
    }
    return disposables;
  }
  registerFocusViewAction(viewDescriptor4, category11) {
    return registerAction2(class FocusViewAction extends Action2 {
      constructor() {
        const title = localize2(23722, "Focus on {0} View", viewDescriptor4.name.value);
        super({
          id: viewDescriptor4.focusCommand ? viewDescriptor4.focusCommand.id : `${viewDescriptor4.id}.focus`,
          title,
          category: category11,
          menu: [{
            id: MenuId.CommandPalette,
            when: viewDescriptor4.when
          }],
          keybinding: {
            when: ContextKeyExpr.has(`${viewDescriptor4.id}.active`),
            weight: 200 /* WorkbenchContrib */,
            primary: viewDescriptor4.focusCommand?.keybindings?.primary,
            secondary: viewDescriptor4.focusCommand?.keybindings?.secondary,
            linux: viewDescriptor4.focusCommand?.keybindings?.linux,
            mac: viewDescriptor4.focusCommand?.keybindings?.mac,
            win: viewDescriptor4.focusCommand?.keybindings?.win
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
        accessor.get(IViewsService).openView(viewDescriptor4.id, !options3?.preserveFocus);
      }
    });
  }
  registerResetViewLocationAction(viewDescriptor4) {
    return registerAction2(class ResetViewLocationAction extends Action2 {
      constructor() {
        super({
          id: `${viewDescriptor4.id}.resetViewLocation`,
          title: localize2(23725, "Reset Location"),
          menu: [{
            id: MenuId.ViewTitleContext,
            when: ContextKeyExpr.or(
              ContextKeyExpr.and(
                ContextKeyExpr.equals("view", viewDescriptor4.id),
                ContextKeyExpr.equals(`${viewDescriptor4.id}.defaultViewLocation`, false)
              )
            ),
            group: "1_hide",
            order: 2
          }]
        });
      }
      run(accessor) {
        const viewDescriptorService = accessor.get(IViewDescriptorService);
        const defaultContainer = viewDescriptorService.getDefaultContainerById(viewDescriptor4.id);
        const containerModel = viewDescriptorService.getViewContainerModel(defaultContainer);
        if (defaultContainer.hideIfEmpty && containerModel.visibleViewDescriptors.length === 0) {
          const defaultLocation = viewDescriptorService.getDefaultViewContainerLocation(defaultContainer);
          viewDescriptorService.moveViewContainerToLocation(defaultContainer, defaultLocation, void 0, this.desc.id);
        }
        viewDescriptorService.moveViewsToContainer([viewDescriptor4], defaultContainer, void 0, this.desc.id);
        accessor.get(IViewsService).openView(viewDescriptor4.id, true);
      }
    });
  }
  registerPaneComposite(viewContainer5, viewContainerLocation) {
    const that = this;
    let PaneContainer = class extends PaneComposite {
      constructor(telemetryService, contextService, storageService, instantiationService, themeService, contextMenuService, extensionService) {
        super(viewContainer5.id, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService);
      }
      createViewPaneContainer(element) {
        const viewPaneContainerDisposables = this._register(new DisposableStore());
        const viewPaneContainer = that.createViewPaneContainer(element, viewContainer5, viewContainerLocation, viewPaneContainerDisposables, this.instantiationService);
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
      viewContainer5.id,
      typeof viewContainer5.title === "string" ? viewContainer5.title : viewContainer5.title.value,
      isString(viewContainer5.icon) ? viewContainer5.icon : void 0,
      viewContainer5.order,
      viewContainer5.requestedIndex,
      viewContainer5.icon instanceof URI ? viewContainer5.icon : void 0
    ));
  }
  deregisterPaneComposite(viewContainer5, viewContainerLocation) {
    Registry.as(this.paneCompositeService.getRegistryId(viewContainerLocation)).deregisterPaneComposite(viewContainer5.id);
  }
  createViewPaneContainer(element, viewContainer5, viewContainerLocation, disposables, instantiationService) {
    const viewPaneContainer = instantiationService.createInstance(viewContainer5.ctorDescriptor.ctor, ...viewContainer5.ctorDescriptor.staticArguments || []);
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
