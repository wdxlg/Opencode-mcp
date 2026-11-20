// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/compositePart.ts
import { Part } from "./module-1566.mjs";
import { Emitter } from "./module-0017.mjs";
import { DisposableStore, MutableDisposable, dispose } from "./module-0012.mjs";
import { createInstantHoverDelegate, getDefaultHoverDelegate } from "./module-0448.mjs";
import { defaultGenerator } from "./module-0463.mjs";
import { AbstractProgressScope, ScopedProgressIndicator } from "./module-1332.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IEditorProgressService } from "./module-0446.mjs";
import { $, Dimension, append, hide, show } from "./module-0075.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { localize } from "./module-0001.mjs";
import { prepareActions } from "./module-0477.mjs";
import { WorkbenchToolBar } from "./module-0519.mjs";
import { createActionViewItem } from "./module-0516.mjs";
import { ProgressBar } from "./module-1331.mjs";
import { defaultProgressBarStyles } from "./module-0513.mjs";


// src/vs/workbench/browser/parts/compositePart.ts
// OpenCode titlebar-step01: 拆分按钮（如「+∨」）收进菜单后执行默认动作，和直接点按钮一样
function ocTitleSplitPrimary(action) {
  const split = action?.item?.isSplitButton;
  if (!split || !Array.isArray(action.actions)) return void 0;
  const ids = typeof split === "object" ? split.primaryActionIds : void 0;
  return action.actions.find((a) => a && a.id !== "vs.actions.separator" && a.enabled !== false && (!ids || ids.includes(a.id)));
}
function ocTitleOverflowAction(action) {
  return ocTitleSplitPrimary(action) ?? action;
}
function ocTitleActionWidth(action) {
  return ocTitleSplitPrimary(action) ? 34 : 22;
}
var CompositePart = class extends Part {
  constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, registry4, activeCompositeSettingsKey, defaultCompositeId, nameForTelemetry, compositeCSSClass, titleForegroundColor, titleBorderColor, id2, options3) {
    super(id2, options3, themeService, storageService, layoutService);
    this.notificationService = notificationService;
    this.storageService = storageService;
    this.contextMenuService = contextMenuService;
    this.keybindingService = keybindingService;
    this.hoverService = hoverService;
    this.instantiationService = instantiationService;
    this.registry = registry4;
    this.activeCompositeSettingsKey = activeCompositeSettingsKey;
    this.defaultCompositeId = defaultCompositeId;
    this.nameForTelemetry = nameForTelemetry;
    this.compositeCSSClass = compositeCSSClass;
    this.titleForegroundColor = titleForegroundColor;
    this.titleBorderColor = titleBorderColor;
    this.onDidCompositeOpen = this._register(new Emitter());
    this.onDidCompositeClose = this._register(new Emitter());
    this.mapCompositeToCompositeContainer = /* @__PURE__ */ new Map();
    this.mapActionsBindingToComposite = /* @__PURE__ */ new Map();
    this.instantiatedCompositeItems = /* @__PURE__ */ new Map();
    this.actionsListener = this._register(new MutableDisposable());
    this.lastActiveCompositeId = storageService.get(activeCompositeSettingsKey, 1 /* WORKSPACE */, this.defaultCompositeId);
    this.toolbarHoverDelegate = this._register(createInstantHoverDelegate());
    this.trailingSeparator = options3.trailingSeparator ?? false;
  }
  openComposite(id2, focus) {
    if (this.activeComposite?.getId() === id2) {
      if (focus) {
        this.activeComposite.focus();
      }
      return this.activeComposite;
    }
    if (!this.element) {
      return;
    }
    return this.doOpenComposite(id2, focus);
  }
  doOpenComposite(id2, focus = false) {
    const currentCompositeOpenToken = defaultGenerator.nextId();
    this.currentCompositeOpenToken = currentCompositeOpenToken;
    if (this.activeComposite) {
      this.hideActiveComposite();
    }
    this.updateTitle(id2);
    const composite = this.createComposite(id2, true);
    if (this.currentCompositeOpenToken !== currentCompositeOpenToken || this.activeComposite && this.activeComposite.getId() !== composite.getId()) {
      return void 0;
    }
    if (this.activeComposite?.getId() === composite.getId()) {
      if (focus) {
        composite.focus();
      }
      this.onDidCompositeOpen.fire({ composite, focus });
      return composite;
    }
    this.showComposite(composite);
    if (focus) {
      composite.focus();
    }
    if (composite) {
      this.onDidCompositeOpen.fire({ composite, focus });
    }
    return composite;
  }
  createComposite(id2, isActive2) {
    const compositeItem = this.instantiatedCompositeItems.get(id2);
    if (compositeItem) {
      return compositeItem.composite;
    }
    const compositeDescriptor = this.registry.getComposite(id2);
    if (compositeDescriptor) {
      const disposable = new DisposableStore();
      const that = this;
      const compositeProgressIndicator = disposable.add(new ScopedProgressIndicator(assertReturnsDefined(this.progressBar), disposable.add(new class extends AbstractProgressScope {
        constructor() {
          super(compositeDescriptor.id, !!isActive2);
          this._register(that.onDidCompositeOpen.event((e) => this.onScopeOpened(e.composite.getId())));
          this._register(that.onDidCompositeClose.event((e) => this.onScopeClosed(e.getId())));
        }
      }())));
      const compositeInstantiationService = disposable.add(this.instantiationService.createChild(new ServiceCollection(
        [IEditorProgressService, compositeProgressIndicator]
        // provide the editor progress service for any editors instantiated within the composite
      )));
      const composite = compositeDescriptor.instantiate(compositeInstantiationService);
      this.instantiatedCompositeItems.set(id2, { composite, disposable, progress: compositeProgressIndicator });
      disposable.add(composite.onTitleAreaUpdate(() => this.onTitleAreaUpdate(composite.getId()), this));
      return composite;
    }
    throw new Error(`Unable to find composite with id ${id2}`);
  }
  showComposite(composite) {
    this.activeComposite = composite;
    const id2 = this.activeComposite.getId();
    if (id2 !== this.defaultCompositeId) {
      this.storageService.store(this.activeCompositeSettingsKey, id2, 1 /* WORKSPACE */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(this.activeCompositeSettingsKey, 1 /* WORKSPACE */);
    }
    this.lastActiveCompositeId = this.activeComposite.getId();
    let compositeContainer = this.mapCompositeToCompositeContainer.get(composite.getId());
    if (!compositeContainer) {
      compositeContainer = $(".composite");
      compositeContainer.classList.add(...this.compositeCSSClass.split(" "));
      compositeContainer.id = composite.getId();
      composite.create(compositeContainer);
      composite.updateStyles();
      this.mapCompositeToCompositeContainer.set(composite.getId(), compositeContainer);
    }
    if (!this.activeComposite || composite.getId() !== this.activeComposite.getId()) {
      return void 0;
    }
    this.contentArea?.appendChild(compositeContainer);
    show(compositeContainer);
    if (this.toolBar) {
      this.toolBar.actionRunner = composite.getActionRunner();
    }
    const descriptor = this.registry.getComposite(composite.getId());
    if (descriptor && descriptor.name !== composite.getTitle()) {
      this.updateTitle(composite.getId(), composite.getTitle());
    }
    let actionsBinding = this.mapActionsBindingToComposite.get(composite.getId());
    if (!actionsBinding) {
      actionsBinding = this.collectCompositeActions(composite);
      this.mapActionsBindingToComposite.set(composite.getId(), actionsBinding);
    }
    actionsBinding();
    if (this.toolBar) {
      this.actionsListener.value = this.toolBar.actionRunner.onDidRun((e) => {
        if (e.error && !isCancellationError(e.error)) {
          this.notificationService.error(e.error);
        }
      });
    }
    composite.setVisible(true);
    if (!this.activeComposite || composite.getId() !== this.activeComposite.getId()) {
      return;
    }
    if (this.contentAreaSize) {
      composite.layout(this.contentAreaSize);
    }
    if (this.boundarySashes) {
      composite.setBoundarySashes(this.boundarySashes);
    }
  }
  onTitleAreaUpdate(compositeId) {
    const composite = this.instantiatedCompositeItems.get(compositeId);
    if (composite) {
      this.updateTitle(compositeId, composite.composite.getTitle());
    }
    if (this.activeComposite?.getId() === compositeId) {
      const actionsBinding = this.collectCompositeActions(this.activeComposite);
      this.mapActionsBindingToComposite.set(this.activeComposite.getId(), actionsBinding);
      actionsBinding();
    } else {
      this.mapActionsBindingToComposite.delete(compositeId);
    }
  }
  updateTitle(compositeId, compositeTitle) {
    const compositeDescriptor = this.registry.getComposite(compositeId);
    if (!compositeDescriptor || !this.titleLabel) {
      return;
    }
    if (!compositeTitle) {
      compositeTitle = compositeDescriptor.name;
    }
    const keybinding = this.keybindingService.lookupKeybinding(compositeId);
    this.titleLabel.updateTitle(compositeId, compositeTitle, keybinding?.getLabel() ?? void 0);
    this.toolBar?.setAriaLabel(localize(6263, null, compositeTitle));
  }
  collectCompositeActions(composite) {
    const menuIds = composite?.getMenuIds();
    const primaryActions = composite?.getActions().slice(0) || [];
    const secondaryActions = composite?.getSecondaryActions().slice(0) || [];
    if (this.toolBar) {
      this.toolBar.context = this.actionsContextProvider();
    }
    return () => {
      this.toolBar?.setActions(prepareActions(primaryActions), prepareActions(secondaryActions), menuIds);
      this.titleArea?.classList.toggle("has-actions", primaryActions.length > 0 || secondaryActions.length > 0);
    };
  }
  getActiveComposite() {
    return this.activeComposite;
  }
  getLastActiveCompositeId() {
    return this.lastActiveCompositeId;
  }
  hideActiveComposite() {
    if (!this.activeComposite) {
      return void 0;
    }
    const composite = this.activeComposite;
    this.activeComposite = void 0;
    const compositeContainer = this.mapCompositeToCompositeContainer.get(composite.getId());
    composite.setVisible(false);
    if (compositeContainer) {
      compositeContainer.remove();
      hide(compositeContainer);
    }
    this.progressBar?.stop().hide();
    if (this.toolBar) {
      this.collectCompositeActions()();
    }
    this.onDidCompositeClose.fire(composite);
    return composite;
  }
  createTitleArea(parent) {
    if (!this.options.hasTitle) {
      return void 0;
    }
    const titleArea = append(parent, $(".composite"));
    titleArea.classList.add("title");
    this.titleLabel = this.createTitleLabel(titleArea);
    const titleActionsContainer = append(titleArea, $(".title-actions"));
    this.toolBar = this._register(this.instantiationService.createInstance(WorkbenchToolBar, titleActionsContainer, {
      actionViewItemProvider: (action, options3) => this.actionViewItemProvider(action, options3),
      orientation: 0 /* HORIZONTAL */,
      getKeyBinding: (action) => this.keybindingService.lookupKeybinding(action.id),
      anchorAlignmentProvider: () => this.getTitleAreaDropDownAnchorAlignment(),
      toggleMenuTitle: localize(6265, null),
      telemetrySource: this.nameForTelemetry,
      hoverDelegate: this.toolbarHoverDelegate,
      trailingSeparator: this.trailingSeparator,
      // OpenCode titlebar-step01: 宽度不够时把靠后的按钮收进「…」，菜单里的项与直接点按钮效果一致
      responsiveBehavior: {
        enabled: true,
        observedElement: titleArea,
        getAvailableWidth: () => this.ocTitleActionsAvailableWidth(titleArea, titleActionsContainer),
        getActionMinWidth: (action) => ocTitleActionWidth(action),
        getOverflowAction: (action) => ocTitleOverflowAction(action)
      }
    }));
    this.collectCompositeActions()();
    return titleArea;
  }
  ocTitleActionsAvailableWidth(titleArea, actionsContainer) {
    const width2 = titleArea.clientWidth;
    if (!width2) return Number.MAX_SAFE_INTEGER;
    let used = 0;
    for (const child of titleArea.children) {
      if (child !== actionsContainer) used += child.getBoundingClientRect().width;
    }
    return Math.max(24, width2 - used - 12);
  }
  createTitleLabel(parent) {
    const titleContainer = append(parent, $(".title-label"));
    const titleLabel = append(titleContainer, $("h2"));
    this.titleLabelElement = titleLabel;
    const hover = this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), titleLabel, ""));
    const $this = this;
    return {
      updateTitle: (id2, title, keybinding) => {
        if (!this.activeComposite || this.activeComposite.getId() === id2) {
          titleLabel.textContent = title;
          hover.update(keybinding ? localize(6264, null, title, keybinding) : title);
        }
      },
      updateStyles: () => {
        titleLabel.style.color = $this.titleForegroundColor ? $this.getColor($this.titleForegroundColor) || "" : "";
        const borderColor = $this.titleBorderColor ? $this.getColor($this.titleBorderColor) : void 0;
        parent.style.borderBottom = borderColor ? `1px solid ${borderColor}` : "";
      }
    };
  }
  createHeaderArea() {
    return $(".composite");
  }
  createFooterArea() {
    return $(".composite");
  }
  updateStyles() {
    super.updateStyles();
    this.titleLabel?.updateStyles();
  }
  actionViewItemProvider(action, options3) {
    if (this.activeComposite) {
      return this.activeComposite.getActionViewItem(action, options3);
    }
    return createActionViewItem(this.instantiationService, action, options3);
  }
  actionsContextProvider() {
    if (this.activeComposite) {
      return this.activeComposite.getActionsContext();
    }
    return null;
  }
  createContentArea(parent) {
    const contentContainer = append(parent, $(".content"));
    this.progressBar = this._register(new ProgressBar(contentContainer, defaultProgressBarStyles));
    this.progressBar.hide();
    return contentContainer;
  }
  getProgressIndicator(id2) {
    const compositeItem = this.instantiatedCompositeItems.get(id2);
    return compositeItem ? compositeItem.progress : void 0;
  }
  getTitleAreaDropDownAnchorAlignment() {
    return 1 /* RIGHT */;
  }
  layout(width2, height, top2, left) {
    super.layout(width2, height, top2, left);
    this.contentAreaSize = Dimension.lift(super.layoutContents(width2, height).contentSize);
    this.activeComposite?.layout(this.contentAreaSize);
  }
  setBoundarySashes(sashes) {
    this.boundarySashes = sashes;
    this.activeComposite?.setBoundarySashes(sashes);
  }
  removeComposite(compositeId) {
    if (this.activeComposite?.getId() === compositeId) {
      return false;
    }
    this.mapCompositeToCompositeContainer.delete(compositeId);
    this.mapActionsBindingToComposite.delete(compositeId);
    const compositeItem = this.instantiatedCompositeItems.get(compositeId);
    if (compositeItem) {
      compositeItem.composite.dispose();
      dispose(compositeItem.disposable);
      this.instantiatedCompositeItems.delete(compositeId);
    }
    return true;
  }
  dispose() {
    this.mapCompositeToCompositeContainer.clear();
    this.mapActionsBindingToComposite.clear();
    this.instantiatedCompositeItems.forEach((compositeItem) => {
      compositeItem.composite.dispose();
      dispose(compositeItem.disposable);
    });
    this.instantiatedCompositeItems.clear();
    super.dispose();
  }
};
export { CompositePart };
