// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/views/viewPane.ts
import { Action } from "./module-0082.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13, IViewDescriptorService, ViewContainerLocationToString, defaultViewIcon } from "./module-1094.mjs";
import { DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { $, Dimension, EventType, addDisposableListener, after, append, isActiveElement, isAncestorOfActiveElement, reset, trackFocus } from "./module-0075.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { parseLinkedText } from "./module-1328.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles, defaultProgressBarStyles } from "./module-0513.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { Link } from "./module-0550.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { Pane } from "./module-1327.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { ViewMenuActions } from "./module-1333.mjs";
import { Action2, MenuId, SubmenuItemAction } from "./module-0092.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { WorkbenchToolBar } from "./module-0519.mjs";
import { asCSSUrl, asCssValueWithDefault } from "./module-0449.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { foreground } from "./module-0227.mjs";
import { URI } from "./module-0032.mjs";
import { createCSSRule } from "./module-0224.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { ProgressBar } from "./module-1330.mjs";
import { AbstractProgressScope, ScopedProgressIndicator } from "./module-1331.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { prepareActions } from "./module-0477.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { createActionViewItem } from "./module-0516.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { FilterWidget } from "./module-1332.mjs";
import { PANEL_BACKGROUND, PANEL_SECTION_DRAG_AND_DROP_BACKGROUND, PANEL_STICKY_SCROLL_BACKGROUND, PANEL_STICKY_SCROLL_BORDER, PANEL_STICKY_SCROLL_SHADOW, SIDE_BAR_BACKGROUND, SIDE_BAR_DRAG_AND_DROP_BACKGROUND, SIDE_BAR_STICKY_SCROLL_BACKGROUND, SIDE_BAR_STICKY_SCROLL_BORDER, SIDE_BAR_STICKY_SCROLL_SHADOW } from "./module-0868.mjs";
import { IViewsService } from "./module-1246.mjs";


// src/vs/workbench/browser/parts/views/viewPane.ts
var VIEWPANE_FILTER_ACTION = new Action("viewpane.action.filter");

var viewPaneContainerExpandedIcon = registerIcon("view-pane-container-expanded", Codicon.chevronDown, localize(6982, null));

var viewPaneContainerCollapsedIcon = registerIcon("view-pane-container-collapsed", Codicon.chevronRight, localize(6981, null));

var viewsRegistry = Registry.as(Extensions13.ViewsRegistry);

var ViewWelcomeController = class {
  constructor(container2, delegate, instantiationService, openerService, contextKeyService, lifecycleService) {
    this.container = container2;
    this.delegate = delegate;
    this.instantiationService = instantiationService;
    this.openerService = openerService;
    this.contextKeyService = contextKeyService;
    this.items = [];
    this._enabled = false;
    this._wide = false;
    this.disposables = new DisposableStore();
    this.enabledDisposables = this.disposables.add(new DisposableStore());
    this.renderDisposables = this.disposables.add(new DisposableStore());
    this.disposables.add(Event2.runAndSubscribe(this.delegate.onDidChangeViewWelcomeState, () => this.onDidChangeViewWelcomeState()));
    this.disposables.add(lifecycleService.onWillShutdown(() => this.dispose()));
  }
  get enabled() {
    return this._enabled;
  }
  layout(height, width2) {
    if (!this._enabled) {
      return;
    }
    this.element.style.height = `${height}px`;
    this.element.style.width = `${width2}px`;
    this._wide = width2 > 640;
    this.element.classList.toggle("wide", this._wide);
    this.scrollableElement.scanDomNode();
  }
  focus() {
    if (!this._enabled) {
      return;
    }
    this.element.focus();
  }
  onDidChangeViewWelcomeState() {
    const enabled = this.delegate.shouldShowWelcome();
    if (this._enabled === enabled) {
      return;
    }
    this._enabled = enabled;
    if (!enabled) {
      this.enabledDisposables.clear();
      return;
    }
    this.container.classList.add("welcome");
    const viewWelcomeContainer = append(this.container, $(".welcome-view"));
    this.element = $(".welcome-view-content", { tabIndex: 0, role: "region", "aria-label": localize(6984, null) });
    if (this._wide) {
      this.element.classList.add("wide");
    }
    this.scrollableElement = new DomScrollableElement(this.element, { alwaysConsumeMouseWheel: true, horizontal: 2 /* Hidden */, vertical: 3 /* Visible */ });
    append(viewWelcomeContainer, this.scrollableElement.getDomNode());
    this.enabledDisposables.add(toDisposable(() => {
      this.container.classList.remove("welcome");
      this.scrollableElement.dispose();
      viewWelcomeContainer.remove();
      this.scrollableElement = void 0;
      this.element = void 0;
    }));
    this.contextKeyService.onDidChangeContext(this.onDidChangeContext, this, this.enabledDisposables);
    Event2.chain(viewsRegistry.onDidChangeViewWelcomeContent, ($129) => $129.filter((id2) => id2 === this.delegate.id))(this.onDidChangeViewWelcomeContent, this, this.enabledDisposables);
    this.onDidChangeViewWelcomeContent();
  }
  onDidChangeViewWelcomeContent() {
    const descriptors = viewsRegistry.getViewWelcomeContent(this.delegate.id);
    this.items = [];
    for (const descriptor of descriptors) {
      if (descriptor.when === "default") {
        this.defaultItem = { descriptor, visible: true };
      } else {
        const visible = descriptor.when ? this.contextKeyService.contextMatchesRules(descriptor.when) : true;
        this.items.push({ descriptor, visible });
      }
    }
    this.render();
  }
  onDidChangeContext() {
    let didChange = false;
    for (const item of this.items) {
      if (!item.descriptor.when || item.descriptor.when === "default") {
        continue;
      }
      const visible = this.contextKeyService.contextMatchesRules(item.descriptor.when);
      if (item.visible === visible) {
        continue;
      }
      item.visible = visible;
      didChange = true;
    }
    if (didChange) {
      this.render();
    }
  }
  render() {
    this.renderDisposables.clear();
    this.element.textContent = "";
    const contents = this.getContentDescriptors();
    if (contents.length === 0) {
      this.container.classList.remove("welcome");
      this.scrollableElement.scanDomNode();
      return;
    }
    let buttonsCount = 0;
    for (const { content, precondition: precondition2, renderSecondaryButtons } of contents) {
      const lines = content.split("\n");
      for (let line of lines) {
        line = line.trim();
        if (!line) {
          continue;
        }
        const linkedText = parseLinkedText(line);
        if (linkedText.nodes.length === 1 && typeof linkedText.nodes[0] !== "string") {
          const node = linkedText.nodes[0];
          const buttonContainer = append(this.element, $(".button-container"));
          const button = new Button(buttonContainer, { title: node.title, supportIcons: true, secondary: !!(renderSecondaryButtons && buttonsCount > 0), ...defaultButtonStyles });
          button.label = node.label;
          button.onDidClick((_) => {
            this.openerService.open(node.href, { allowCommands: true });
          }, null, this.renderDisposables);
          this.renderDisposables.add(button);
          buttonsCount++;
          if (precondition2) {
            const updateEnablement = () => button.enabled = this.contextKeyService.contextMatchesRules(precondition2);
            updateEnablement();
            const keys = new Set(precondition2.keys());
            const onDidChangeContext = Event2.filter(this.contextKeyService.onDidChangeContext, (e4) => e4.affectsSome(keys));
            onDidChangeContext(updateEnablement, null, this.renderDisposables);
          }
        } else {
          const p = append(this.element, $("p"));
          for (const node of linkedText.nodes) {
            if (typeof node === "string") {
              append(p, ...renderLabelWithIcons(node));
            } else {
              const link2 = this.renderDisposables.add(this.instantiationService.createInstance(Link, p, node, {}));
              if (precondition2 && node.href.startsWith("command:")) {
                const updateEnablement = () => link2.enabled = this.contextKeyService.contextMatchesRules(precondition2);
                updateEnablement();
                const keys = new Set(precondition2.keys());
                const onDidChangeContext = Event2.filter(this.contextKeyService.onDidChangeContext, (e4) => e4.affectsSome(keys));
                onDidChangeContext(updateEnablement, null, this.renderDisposables);
              }
            }
          }
        }
      }
    }
    this.container.classList.add("welcome");
    this.scrollableElement.scanDomNode();
  }
  getContentDescriptors() {
    const visibleItems = this.items.filter((v2) => v2.visible);
    if (visibleItems.length === 0 && this.defaultItem) {
      return [this.defaultItem.descriptor];
    }
    return visibleItems.map((v2) => v2.descriptor);
  }
  dispose() {
    this.disposables.dispose();
  }
};

ViewWelcomeController = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IOpenerService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, ILifecycleService)
], ViewWelcomeController);

var ViewPane = class extends Pane {
  constructor(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, accessibleViewInformationService) {
    super({ ...options3, ...{ orientation: viewDescriptorService.getViewLocationById(options3.id) === 1 /* Panel */ ? 1 /* HORIZONTAL */ : 0 /* VERTICAL */ } });
    this.keybindingService = keybindingService;
    this.contextMenuService = contextMenuService;
    this.configurationService = configurationService;
    this.contextKeyService = contextKeyService;
    this.viewDescriptorService = viewDescriptorService;
    this.instantiationService = instantiationService;
    this.openerService = openerService;
    this.themeService = themeService;
    this.hoverService = hoverService;
    this.accessibleViewInformationService = accessibleViewInformationService;
    this._onDidFocus = this._register(new Emitter());
    this.onDidFocus = this._onDidFocus.event;
    this._onDidBlur = this._register(new Emitter());
    this.onDidBlur = this._onDidBlur.event;
    this._onDidChangeBodyVisibility = this._register(new Emitter());
    this.onDidChangeBodyVisibility = this._onDidChangeBodyVisibility.event;
    this._onDidChangeTitleArea = this._register(new Emitter());
    this.onDidChangeTitleArea = this._onDidChangeTitleArea.event;
    this._onDidChangeViewWelcomeState = this._register(new Emitter());
    this.onDidChangeViewWelcomeState = this._onDidChangeViewWelcomeState.event;
    this._isVisible = false;
    this.headerActionViewItems = this._register(new DisposableMap());
    this.id = options3.id;
    this._title = options3.title;
    this._titleDescription = options3.titleDescription;
    this._singleViewPaneContainerTitle = options3.singleViewPaneContainerTitle;
    this.showActions = options3.showActions ?? 0 /* Default */;
    this.scopedContextKeyService = this._register(contextKeyService.createScoped(this.element));
    this.scopedContextKeyService.createKey("view", this.id);
    const viewLocationKey = this.scopedContextKeyService.createKey("viewLocation", ViewContainerLocationToString(viewDescriptorService.getViewLocationById(this.id)));
    this._register(Event2.filter(viewDescriptorService.onDidChangeLocation, (e4) => e4.views.some((view) => view.id === this.id))(() => viewLocationKey.set(ViewContainerLocationToString(viewDescriptorService.getViewLocationById(this.id)))));
    const childInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
    this.menuActions = this._register(childInstantiationService.createInstance(ViewMenuActions, options3.titleMenuId ?? MenuId.ViewTitle, MenuId.ViewTitleContext, { shouldForwardArgs: !options3.donotForwardArgs, renderShortTitle: true }, { primaryActionGroups: this.primaryActionGroups }));
    this._register(this.menuActions.onDidChange(() => this.updateActions()));
  }
  static {
    this.AlwaysShowActionsConfig = "workbench.view.alwaysShowHeaderActions";
  }
  get title() {
    return this._title;
  }
  get titleDescription() {
    return this._titleDescription;
  }
  get singleViewPaneContainerTitle() {
    return this._singleViewPaneContainerTitle;
  }
  /**
   * Additional menu groups (beyond `navigation`) whose actions should be
   * rendered as primary (inline) actions in the title action bar. Separators
   * are rendered between groups in the primary actions. Subclasses can
   * override this to customize grouping in the title action bar.
   */
  get primaryActionGroups() {
    return void 0;
  }
  get headerVisible() {
    return super.headerVisible;
  }
  set headerVisible(visible) {
    super.headerVisible = visible;
    this.element.classList.toggle("merged-header", !visible);
  }
  setVisible(visible) {
    if (this._isVisible !== visible) {
      this._isVisible = visible;
      if (this.isExpanded()) {
        this._onDidChangeBodyVisibility.fire(visible);
      }
    }
  }
  isVisible() {
    return this._isVisible;
  }
  isBodyVisible() {
    return this._isVisible && this.isExpanded();
  }
  setExpanded(expanded2) {
    const changed = super.setExpanded(expanded2);
    if (changed) {
      this._onDidChangeBodyVisibility.fire(expanded2);
    }
    this.updateTwistyIcon();
    return changed;
  }
  render() {
    super.render();
    const focusTracker = trackFocus(this.element);
    this._register(focusTracker);
    this._register(focusTracker.onDidFocus(() => this._onDidFocus.fire()));
    this._register(focusTracker.onDidBlur(() => this._onDidBlur.fire()));
  }
  renderHeader(container2) {
    this.headerContainer = container2;
    this.twistiesContainer = append(container2, $(`.twisty-container${ThemeIcon.asCSSSelector(this.getTwistyIcon(this.isExpanded()))}`));
    this.renderHeaderTitle(container2, this.title);
    const actions = append(container2, $(".actions"));
    actions.classList.toggle("show-always", this.showActions === 2 /* Always */);
    actions.classList.toggle("show-expanded", this.showActions === 1 /* WhenExpanded */);
    this.toolbar = this.instantiationService.createInstance(WorkbenchToolBar, actions, {
      orientation: 0 /* HORIZONTAL */,
      actionViewItemProvider: (action, options3) => {
        const item = this.createActionViewItem(action, options3);
        if (item) {
          this.headerActionViewItems.set(item.action.id, item);
        }
        return item;
      },
      ariaLabel: localize(6983, null, this.title),
      getKeyBinding: (action) => this.keybindingService.lookupKeybinding(action.id),
      renderDropdownAsChildElement: true,
      actionRunner: this.getActionRunner(),
      resetMenu: this.menuActions.menuId
    });
    this._register(this.toolbar);
    this.setActions();
    this._register(addDisposableListener(actions, EventType.CLICK, (e4) => e4.preventDefault()));
    const viewContainerModel = this.viewDescriptorService.getViewContainerByViewId(this.id);
    if (viewContainerModel) {
      this._register(this.viewDescriptorService.getViewContainerModel(viewContainerModel).onDidChangeContainerInfo(({ title }) => this.updateTitle(this.title)));
    } else {
      console.error(`View container model not found for view ${this.id}`);
    }
    const onDidRelevantConfigurationChange = Event2.filter(this.configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration(ViewPane.AlwaysShowActionsConfig));
    this._register(onDidRelevantConfigurationChange(this.updateActionsVisibility, this));
    this.updateActionsVisibility();
  }
  updateHeader() {
    super.updateHeader();
    this.updateTwistyIcon();
  }
  updateTwistyIcon() {
    if (this.twistiesContainer) {
      this.twistiesContainer.classList.remove(...ThemeIcon.asClassNameArray(this.getTwistyIcon(!this._expanded)));
      this.twistiesContainer.classList.add(...ThemeIcon.asClassNameArray(this.getTwistyIcon(this._expanded)));
    }
  }
  getTwistyIcon(expanded2) {
    return expanded2 ? viewPaneContainerExpandedIcon : viewPaneContainerCollapsedIcon;
  }
  style(styles) {
    super.style(styles);
    const icon2 = this.getIcon();
    if (this.iconContainer) {
      const fgColor = asCssValueWithDefault(styles.headerForeground, asCssVariable(foreground));
      if (URI.isUri(icon2)) {
        this.iconContainer.style.backgroundColor = fgColor;
        this.iconContainer.style.color = "";
      } else {
        this.iconContainer.style.color = fgColor;
        this.iconContainer.style.backgroundColor = "";
      }
    }
  }
  getIcon() {
    return this.viewDescriptorService.getViewDescriptorById(this.id)?.containerIcon || defaultViewIcon;
  }
  renderHeaderTitle(container2, title) {
    this.iconContainer = append(container2, $(".icon", void 0));
    const icon2 = this.getIcon();
    let cssClass = void 0;
    if (URI.isUri(icon2)) {
      cssClass = `view-${this.id.replace(/[\.\:]/g, "-")}`;
      const iconClass = `.pane-header .icon.${cssClass}`;
      createCSSRule(iconClass, `
				mask: ${asCSSUrl(icon2)} no-repeat 50% 50%;
				mask-size: 24px;
				-webkit-mask: ${asCSSUrl(icon2)} no-repeat 50% 50%;
				-webkit-mask-size: 16px;
			`);
    } else if (ThemeIcon.isThemeIcon(icon2)) {
      cssClass = ThemeIcon.asClassName(icon2);
    }
    if (cssClass) {
      this.iconContainer.classList.add(...cssClass.split(" "));
    }
    const calculatedTitle = this.calculateTitle(title);
    this.titleContainer = append(container2, $("h3.title", {}, calculatedTitle));
    this.titleContainerHover = this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.titleContainer, calculatedTitle));
    if (this._titleDescription) {
      this.setTitleDescription(this._titleDescription);
    }
    this.iconContainerHover = this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.iconContainer, calculatedTitle));
    this.iconContainer.setAttribute("aria-label", this._getAriaLabel(calculatedTitle, this._titleDescription));
  }
  _getAriaLabel(title, description) {
    const viewHasAccessibilityHelpContent = this.viewDescriptorService.getViewDescriptorById(this.id)?.accessibilityHelpContent;
    const accessibleViewHasShownForView = this.accessibleViewInformationService?.hasShownAccessibleView(this.id);
    if (!viewHasAccessibilityHelpContent || accessibleViewHasShownForView) {
      if (description) {
        return `${title} - ${description}`;
      } else {
        return title;
      }
    }
    return localize(6980, null, title);
  }
  updateTitle(title) {
    const calculatedTitle = this.calculateTitle(title);
    if (this.titleContainer) {
      this.titleContainer.textContent = calculatedTitle;
      this.titleContainerHover?.update(calculatedTitle);
    }
    this.updateAriaHeaderLabel(calculatedTitle, this._titleDescription);
    this._title = title;
    this._onDidChangeTitleArea.fire();
  }
  updateAriaHeaderLabel(title, description) {
    const ariaLabel = this._getAriaLabel(title, description);
    if (this.iconContainer) {
      this.iconContainerHover?.update(title);
      this.iconContainer.setAttribute("aria-label", ariaLabel);
    }
    this.ariaHeaderLabel = this.getAriaHeaderLabel(ariaLabel);
  }
  setTitleDescription(description) {
    if (this.titleDescriptionContainer) {
      this.titleDescriptionContainer.textContent = description ?? "";
      this.titleDescriptionContainerHover?.update(description ?? "");
    } else if (description && this.titleContainer) {
      this.titleDescriptionContainer = after(this.titleContainer, $("span.description", {}, description));
      this.titleDescriptionContainerHover = this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.titleDescriptionContainer, description));
    }
  }
  updateTitleDescription(description) {
    this.setTitleDescription(description);
    this.updateAriaHeaderLabel(this._title, description);
    this._titleDescription = description;
    this._onDidChangeTitleArea.fire();
  }
  calculateTitle(title) {
    const viewContainer = this.viewDescriptorService.getViewContainerByViewId(this.id);
    const model = this.viewDescriptorService.getViewContainerModel(viewContainer);
    const viewDescriptor3 = this.viewDescriptorService.getViewDescriptorById(this.id);
    const isDefault = this.viewDescriptorService.getDefaultContainerById(this.id) === viewContainer;
    if (!isDefault && viewDescriptor3?.containerTitle && model.title !== viewDescriptor3.containerTitle && title !== viewDescriptor3.containerTitle) {
      return `${viewDescriptor3.containerTitle}: ${title}`;
    }
    return title;
  }
  renderBody(container2) {
    this.viewWelcomeController = this._register(this.instantiationService.createInstance(ViewWelcomeController, container2, this));
  }
  layoutBody(height, width2) {
    this.viewWelcomeController?.layout(height, width2);
  }
  onDidScrollRoot() {
  }
  getProgressIndicator() {
    if (this.progressBar === void 0) {
      this.progressBar = this._register(new ProgressBar(this.element, defaultProgressBarStyles));
      this.progressBar.hide();
    }
    if (this.progressIndicator === void 0) {
      const that = this;
      this.progressIndicator = this._register(new ScopedProgressIndicator(assertReturnsDefined(this.progressBar), this._register(new class extends AbstractProgressScope {
        constructor() {
          super(that.id, that.isBodyVisible());
          this._register(that.onDidChangeBodyVisibility((isVisible) => isVisible ? this.onScopeOpened(that.id) : this.onScopeClosed(that.id)));
        }
      }())));
    }
    return this.progressIndicator;
  }
  getProgressLocation() {
    return this.viewDescriptorService.getViewContainerByViewId(this.id).id;
  }
  getLocationBasedColors() {
    return getLocationBasedViewColors(this.viewDescriptorService.getViewLocationById(this.id));
  }
  focus() {
    if (this.viewWelcomeController?.enabled) {
      this.viewWelcomeController.focus();
    } else if (this.element) {
      this.element.focus();
    }
    if (isActiveElement(this.element) || isAncestorOfActiveElement(this.element)) {
      this._onDidFocus.fire();
    }
  }
  setActions() {
    if (this.toolbar) {
      const primaryActions = [...this.menuActions.getPrimaryActions()];
      if (this.shouldShowFilterInHeader()) {
        primaryActions.unshift(VIEWPANE_FILTER_ACTION);
      }
      this.toolbar.setActions(prepareActions(primaryActions), prepareActions(this.menuActions.getSecondaryActions()));
      this.toolbar.context = this.getActionsContext();
    }
  }
  updateActionsVisibility() {
    if (!this.headerContainer) {
      return;
    }
    const shouldAlwaysShowActions = this.configurationService.getValue("workbench.view.alwaysShowHeaderActions");
    this.headerContainer.classList.toggle("actions-always-visible", shouldAlwaysShowActions);
  }
  updateActions() {
    this.setActions();
    this._onDidChangeTitleArea.fire();
  }
  createActionViewItem(action, options3) {
    if (action.id === VIEWPANE_FILTER_ACTION.id) {
      const that = this;
      return new class extends BaseActionViewItem {
        constructor() {
          super(null, action);
        }
        setFocusable() {
        }
        get trapsArrowNavigation() {
          return true;
        }
        render(container2) {
          container2.classList.add("viewpane-filter-container");
          const filter2 = that.getFilterWidget();
          append(container2, filter2.element);
          filter2.relayout();
        }
      }();
    }
    return createActionViewItem(this.instantiationService, action, { ...options3, ...{ menuAsChild: action instanceof SubmenuItemAction } });
  }
  getActionsContext() {
    return void 0;
  }
  getActionRunner() {
    return void 0;
  }
  getOptimalWidth() {
    return 0;
  }
  saveState() {
  }
  shouldShowWelcome() {
    return false;
  }
  getFilterWidget() {
    return void 0;
  }
  shouldShowFilterInHeader() {
    return false;
  }
};

ViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService)
], ViewPane);

var FilterViewPane = class extends ViewPane {
  constructor(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, accessibleViewService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, accessibleViewService);
    const childInstantiationService = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
    this.filterWidget = this._register(childInstantiationService.createInstance(FilterWidget, options3.filterOptions));
    this._register(this.filterWidget.onDidAcceptFilterText(() => this.focusBodyContent()));
  }
  getFilterWidget() {
    return this.filterWidget;
  }
  renderBody(container2) {
    super.renderBody(container2);
    this.filterContainer = append(container2, $(".viewpane-filter-container"));
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.dimension = new Dimension(width2, height);
    const wasFilterShownInHeader = !this.filterContainer?.hasChildNodes();
    const shouldShowFilterInHeader = this.shouldShowFilterInHeader();
    if (wasFilterShownInHeader !== shouldShowFilterInHeader) {
      if (shouldShowFilterInHeader) {
        reset(this.filterContainer);
      }
      this.updateActions();
      if (!shouldShowFilterInHeader) {
        append(this.filterContainer, this.filterWidget.element);
      }
    }
    if (!shouldShowFilterInHeader) {
      height = height - 44;
    }
    this.filterWidget.layout(width2);
    this.layoutBodyContent(height, width2);
  }
  shouldShowFilterInHeader() {
    return !(this.dimension && this.dimension.width < 600 && this.dimension.height > 100);
  }
  focusBodyContent() {
    this.focus();
  }
};

FilterViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService)
], FilterViewPane);

function getLocationBasedViewColors(location2) {
  let background, overlayBackground, stickyScrollBackground, stickyScrollBorder, stickyScrollShadow;
  switch (location2) {
    case 1 /* Panel */:
      background = PANEL_BACKGROUND;
      overlayBackground = PANEL_SECTION_DRAG_AND_DROP_BACKGROUND;
      stickyScrollBackground = PANEL_STICKY_SCROLL_BACKGROUND;
      stickyScrollBorder = PANEL_STICKY_SCROLL_BORDER;
      stickyScrollShadow = PANEL_STICKY_SCROLL_SHADOW;
      break;
    case 0 /* Sidebar */:
    case 2 /* AuxiliaryBar */:
    default:
      background = SIDE_BAR_BACKGROUND;
      overlayBackground = SIDE_BAR_DRAG_AND_DROP_BACKGROUND;
      stickyScrollBackground = SIDE_BAR_STICKY_SCROLL_BACKGROUND;
      stickyScrollBorder = SIDE_BAR_STICKY_SCROLL_BORDER;
      stickyScrollShadow = SIDE_BAR_STICKY_SCROLL_SHADOW;
  }
  return {
    background,
    overlayBackground,
    listOverrideStyles: {
      listBackground: background,
      treeStickyScrollBackground: stickyScrollBackground,
      treeStickyScrollBorder: stickyScrollBorder,
      treeStickyScrollShadow: stickyScrollShadow
    }
  };
}

var ViewAction = class extends Action2 {
  constructor(desc) {
    super(desc);
    this.desc = desc;
  }
  run(accessor, ...args2) {
    const view = accessor.get(IViewsService).getActiveViewWithId(this.desc.viewId);
    if (view) {
      return this.runInView(accessor, view, ...args2);
    }
    return void 0;
  }
};
export { getLocationBasedViewColors, VIEWPANE_FILTER_ACTION, viewPaneContainerExpandedIcon, viewPaneContainerCollapsedIcon, viewsRegistry, ViewWelcomeController, ViewPane, FilterViewPane, ViewAction };
