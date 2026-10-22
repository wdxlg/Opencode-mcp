// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalView.ts
import { ViewPane } from "./module-1335.mjs";
import { DisposableMap, DisposableStore, MutableDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { IMenuService, MenuId, MenuItemAction } from "./module-0092.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { localize } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { TerminalTabbedView } from "./module-3300.mjs";
import { Action } from "./module-0082.mjs";
import { ActionViewItem, SelectActionViewItem } from "./module-0476.mjs";
import { MenuEntryActionViewItem, getFlatContextMenuActions } from "./module-0516.mjs";
import { getTerminalActionBarArgs } from "./module-3275.mjs";
import { DropdownWithPrimaryActionViewItem } from "./module-1932.mjs";
import { Event2 } from "./module-0017.mjs";
import { EventType, addDisposableListener, isActiveElement, reset } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITerminalConfigurationService, ITerminalGroupService, ITerminalService } from "./module-1149.mjs";
import { IThemeService, Themable } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ITerminalProfileResolverService, ITerminalProfileService } from "./module-1173.mjs";
import { defaultSelectBoxStyles } from "./module-0513.mjs";
import { hasNativeContextMenu } from "./module-0515.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { selectBorder } from "./module-0233.mjs";
import { SeparatorSelectOption } from "./module-0475.mjs";
import { switchTerminalShowTabsTitle } from "./module-3272.mjs";
import { MicrotaskDelay } from "./module-0035.mjs";
import { getColorForSeverity } from "./module-3270.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getColorClass, getUriClasses } from "./module-1175.mjs";
import { InstanceContext, TerminalContextActionRunner } from "./module-3268.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { URI } from "./module-0032.mjs";
import { hasKey } from "./module-0010.mjs";
import { isDark } from "./module-0247.mjs";
import { asCSSUrl } from "./module-0449.mjs";
import { getInstanceHoverInfo } from "./module-3269.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalView.ts
var TerminalViewPane = class extends ViewPane {
  constructor(options3, keybindingService, _contextKeyService, viewDescriptorService, _configurationService, contextMenuService, _instantiationService, _terminalService, _terminalConfigurationService, _terminalGroupService, themeService, hoverService, _notificationService, _keybindingService, openerService, _menuService, _terminalProfileService, _terminalProfileResolverService) {
    super(options3, keybindingService, contextMenuService, _configurationService, _contextKeyService, viewDescriptorService, _instantiationService, openerService, themeService, hoverService);
    this._contextKeyService = _contextKeyService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._terminalService = _terminalService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._terminalGroupService = _terminalGroupService;
    this._notificationService = _notificationService;
    this._keybindingService = _keybindingService;
    this._menuService = _menuService;
    this._terminalProfileService = _terminalProfileService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._isInitialized = false;
    /**
     * Tracks an active promise of terminal creation requested by this component. This helps prevent
     * double creation for example when toggling a terminal's visibility and focusing it.
     */
    this._isTerminalBeingCreated = false;
    this._newDropdown = this._register(new MutableDisposable());
    this._disposableStore = this._register(new DisposableStore());
    this._actionDisposables = this._register(new DisposableMap());
    this._register(this._terminalService.onDidRegisterProcessSupport(() => {
      this._onDidChangeViewWelcomeState.fire();
    }));
    this._register(this._terminalService.onDidChangeInstances(() => {
      if (this._hasWelcomeScreen() && this._terminalGroupService.instances.length <= 1) {
        this._onDidChangeViewWelcomeState.fire();
      }
      if (!this._parentDomElement) {
        return;
      }
      if (!this._terminalTabbedView) {
        this._createTabsView();
      }
      this.layoutBody(this._parentDomElement.offsetHeight, this._parentDomElement.offsetWidth);
    }));
    this._dropdownMenu = this._register(this._menuService.createMenu(MenuId.TerminalNewDropdownContext, this._contextKeyService));
    this._singleTabMenu = this._register(this._menuService.createMenu(MenuId.TerminalTabContext, this._contextKeyService));
    this._register(this._terminalProfileService.onDidChangeAvailableProfiles((profiles2) => this._updateTabActionBar(profiles2)));
    this._viewShowing = TerminalContextKeys.viewShowing.bindTo(this._contextKeyService);
    this._register(this.onDidChangeBodyVisibility((e) => {
      if (e) {
        this._terminalTabbedView?.rerenderTabs();
      }
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (this._parentDomElement && (e.affectsConfiguration("terminal.integrated.shellIntegration.decorationsEnabled" /* ShellIntegrationDecorationsEnabled */) || e.affectsConfiguration("terminal.integrated.shellIntegration.enabled" /* ShellIntegrationEnabled */))) {
        this._updateForShellIntegration(this._parentDomElement);
      }
    }));
    const shellIntegrationDisposable = this._register(new MutableDisposable());
    shellIntegrationDisposable.value = this._terminalService.onAnyInstanceAddedCapabilityType((c) => {
      if (c === 2 /* CommandDetection */ && this._gutterDecorationsEnabled()) {
        this._parentDomElement?.classList.add("shell-integration");
        shellIntegrationDisposable.clear();
      }
    });
  }
  get terminalTabbedView() {
    return this._terminalTabbedView;
  }
  _updateForShellIntegration(container3) {
    container3.classList.toggle("shell-integration", this._gutterDecorationsEnabled());
  }
  _gutterDecorationsEnabled() {
    const decorationsEnabled = this._configurationService.getValue("terminal.integrated.shellIntegration.decorationsEnabled" /* ShellIntegrationDecorationsEnabled */);
    return (decorationsEnabled === "both" || decorationsEnabled === "gutter") && this._configurationService.getValue("terminal.integrated.shellIntegration.enabled" /* ShellIntegrationEnabled */);
  }
  _initializeTerminal(checkRestoredTerminals) {
    if (this.isBodyVisible() && this._terminalService.isProcessSupportRegistered && this._terminalService.connectionState === 1 /* Connected */) {
      const wasInitialized = this._isInitialized;
      this._isInitialized = true;
      let hideOnStartup = "never";
      if (!wasInitialized) {
        hideOnStartup = this._configurationService.getValue("terminal.integrated.hideOnStartup" /* HideOnStartup */);
        if (hideOnStartup === "always") {
          this._terminalGroupService.hidePanel();
        }
      }
      let shouldCreate = this._terminalGroupService.groups.length === 0;
      if (checkRestoredTerminals) {
        shouldCreate &&= this._terminalService.restoredGroupCount === 0;
      }
      if (!shouldCreate) {
        return;
      }
      if (!wasInitialized) {
        switch (hideOnStartup) {
          case "never":
            this._isTerminalBeingCreated = true;
            this._terminalService.createTerminal({ location: 1 /* Panel */ }).finally(() => this._isTerminalBeingCreated = false);
            break;
          case "whenEmpty":
            if (this._terminalService.restoredGroupCount === 0) {
              this._terminalGroupService.hidePanel();
            }
            break;
        }
        return;
      }
      if (!this._isTerminalBeingCreated) {
        this._isTerminalBeingCreated = true;
        this._terminalService.createTerminal({ location: 1 /* Panel */ }).finally(() => this._isTerminalBeingCreated = false);
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  renderBody(container3) {
    super.renderBody(container3);
    if (!this._parentDomElement) {
      this._updateForShellIntegration(container3);
    }
    this._parentDomElement = container3;
    this._parentDomElement.classList.add("integrated-terminal");
    createStyleSheet(this._parentDomElement);
    this._instantiationService.createInstance(TerminalThemeIconStyle, this._parentDomElement);
    if (!this.shouldShowWelcome()) {
      this._createTabsView();
    }
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("terminal.integrated.fontFamily" /* FontFamily */) || e.affectsConfiguration("editor.fontFamily")) {
        if (!this._terminalConfigurationService.configFontIsMonospace()) {
          const choices = [{
            label: localize(20096, null),
            run: () => this.configurationService.updateValue("terminal.integrated.fontFamily" /* FontFamily */, "monospace")
          }];
          this._notificationService.prompt(Severity2.Warning, localize(20095, null), choices);
        }
      }
    }));
    this._register(this.onDidChangeBodyVisibility(async (visible) => {
      this._viewShowing.set(visible);
      if (visible) {
        if (this._hasWelcomeScreen()) {
          this._onDidChangeViewWelcomeState.fire();
        }
        this._initializeTerminal(false);
        this._terminalGroupService.showPanel(false);
      } else {
        for (const instance2 of this._terminalGroupService.instances) {
          instance2.resetFocusContextKey();
        }
      }
      this._terminalGroupService.updateVisibility();
    }));
    this._register(this._terminalService.onDidChangeConnectionState(() => this._initializeTerminal(true)));
    this.layoutBody(this._parentDomElement.offsetHeight, this._parentDomElement.offsetWidth);
  }
  _createTabsView() {
    if (!this._parentDomElement) {
      return;
    }
    this._terminalTabbedView = this._register(this.instantiationService.createInstance(TerminalTabbedView, this._parentDomElement));
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this._terminalTabbedView?.layout(width2, height);
  }
  createActionViewItem(action, options3) {
    switch (action.id) {
      case "workbench.action.terminal.split" /* Split */: {
        const that = this;
        const store = new DisposableStore();
        const panelOnlySplitAction = store.add(new class extends Action {
          constructor() {
            super(action.id, action.label, action.class, action.enabled);
            this.checked = action.checked;
            this.tooltip = action.tooltip;
          }
          async run() {
            const instance2 = that._terminalGroupService.activeInstance;
            if (instance2) {
              const newInstance = await that._terminalService.createTerminal({ location: { parentTerminal: instance2 } });
              return newInstance?.focusWhenReady();
            }
            return;
          }
        }());
        const item = store.add(new ActionViewItem(action, panelOnlySplitAction, { ...options3, icon: true, label: false, keybinding: this._getKeybindingLabel(action) }));
        this._actionDisposables.set(action.id, store);
        return item;
      }
      case "workbench.action.terminal.switchTerminal" /* SwitchTerminal */: {
        const item = this._instantiationService.createInstance(SwitchTerminalActionViewItem, action);
        this._actionDisposables.set(action.id, item);
        return item;
      }
      case "workbench.action.terminal.focus" /* Focus */: {
        if (action instanceof MenuItemAction) {
          const actions = getFlatContextMenuActions(this._singleTabMenu.getActions({ shouldForwardArgs: true }));
          const item = this._instantiationService.createInstance(SingleTerminalTabActionViewItem, action, actions);
          this._actionDisposables.set(action.id, item);
          return item;
        }
        break;
      }
      case "workbench.action.terminal.new" /* New */: {
        if (action instanceof MenuItemAction) {
          this._disposableStore.clear();
          const actions = getTerminalActionBarArgs(1 /* Panel */, this._terminalProfileService.availableProfiles, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu, this._disposableStore);
          this._newDropdown.value = this._instantiationService.createInstance(DropdownWithPrimaryActionViewItem, action, actions.dropdownAction, actions.dropdownMenuActions, actions.className, {
            hoverDelegate: options3.hoverDelegate,
            getKeyBinding: (action2) => this._keybindingService.lookupKeybinding(action2.id, this._contextKeyService)
          });
          this._newDropdown.value?.update(actions.dropdownAction, actions.dropdownMenuActions);
          return this._newDropdown.value;
        }
      }
    }
    return super.createActionViewItem(action, options3);
  }
  _getDefaultProfileName() {
    let defaultProfileName;
    try {
      defaultProfileName = this._terminalProfileService.getDefaultProfileName();
    } catch (e) {
      defaultProfileName = this._terminalProfileResolverService.defaultProfileName;
    }
    return defaultProfileName;
  }
  _getKeybindingLabel(action) {
    return this._keybindingService.lookupKeybinding(action.id)?.getLabel() ?? void 0;
  }
  _updateTabActionBar(profiles2) {
    this._disposableStore.clear();
    const actions = getTerminalActionBarArgs(1 /* Panel */, profiles2, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu, this._disposableStore);
    this._newDropdown.value?.update(actions.dropdownAction, actions.dropdownMenuActions);
  }
  focus() {
    super.focus();
    if (this._terminalService.connectionState === 1 /* Connected */) {
      if (this._terminalGroupService.instances.length === 0 && !this._isTerminalBeingCreated) {
        this._isTerminalBeingCreated = true;
        this._terminalService.createTerminal({ location: 1 /* Panel */ }).finally(() => this._isTerminalBeingCreated = false);
      }
      this._terminalGroupService.showPanel(true);
      return;
    }
    const previousActiveElement = this.element.ownerDocument.activeElement;
    if (previousActiveElement) {
      const listener = this._register(Event2.once(this._terminalService.onDidChangeConnectionState)(() => {
        if (previousActiveElement && isActiveElement(previousActiveElement)) {
          this._terminalGroupService.showPanel(true);
        }
        this._store.delete(listener);
      }));
    }
  }
  _hasWelcomeScreen() {
    return !this._terminalService.isProcessSupportRegistered;
  }
  shouldShowWelcome() {
    return this._hasWelcomeScreen() && this._terminalService.instances.length === 0;
  }
};

TerminalViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IViewDescriptorService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, ITerminalService),
  __decorateParam(8, ITerminalConfigurationService),
  __decorateParam(9, ITerminalGroupService),
  __decorateParam(10, IThemeService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, INotificationService),
  __decorateParam(13, IKeybindingService),
  __decorateParam(14, IOpenerService),
  __decorateParam(15, IMenuService),
  __decorateParam(16, ITerminalProfileService),
  __decorateParam(17, ITerminalProfileResolverService)
], TerminalViewPane);

var SwitchTerminalActionViewItem = class extends SelectActionViewItem {
  constructor(action, _terminalService, _terminalGroupService, contextViewService, terminalProfileService, configurationService) {
    super(null, action, getTerminalSelectOpenItems(_terminalService, _terminalGroupService), _terminalGroupService.activeGroupIndex, contextViewService, defaultSelectBoxStyles, { ariaLabel: localize(20098, null), optionsAsChildren: true, useCustomDrawn: !hasNativeContextMenu(configurationService) });
    this._terminalService = _terminalService;
    this._terminalGroupService = _terminalGroupService;
    this._register(_terminalService.onDidChangeInstances(() => this._updateItems(), this));
    this._register(_terminalService.onDidChangeActiveGroup(() => this._updateItems(), this));
    this._register(_terminalService.onDidChangeActiveInstance(() => this._updateItems(), this));
    this._register(_terminalService.onAnyInstanceTitleChange(() => this._updateItems(), this));
    this._register(_terminalGroupService.onDidChangeGroups(() => this._updateItems(), this));
    this._register(_terminalService.onDidChangeConnectionState(() => this._updateItems(), this));
    this._register(terminalProfileService.onDidChangeAvailableProfiles(() => this._updateItems(), this));
    this._register(_terminalService.onAnyInstancePrimaryStatusChange(() => this._updateItems(), this));
  }
  render(container3) {
    super.render(container3);
    container3.classList.add("switch-terminal");
    container3.style.borderColor = asCssVariable(selectBorder);
  }
  _updateItems() {
    const options3 = getTerminalSelectOpenItems(this._terminalService, this._terminalGroupService);
    this.setOptions(options3, this._terminalGroupService.activeGroupIndex);
  }
};

SwitchTerminalActionViewItem = __decorateClass([
  __decorateParam(1, ITerminalService),
  __decorateParam(2, ITerminalGroupService),
  __decorateParam(3, IContextViewService),
  __decorateParam(4, ITerminalProfileService),
  __decorateParam(5, IConfigurationService)
], SwitchTerminalActionViewItem);

function getTerminalSelectOpenItems(terminalService, terminalGroupService) {
  let items;
  if (terminalService.connectionState === 1 /* Connected */) {
    items = terminalGroupService.getGroupLabels().map((label3) => {
      return { text: label3 };
    });
  } else {
    items = [{ text: localize(20097, null) }];
  }
  items.push(SeparatorSelectOption);
  items.push({ text: switchTerminalShowTabsTitle });
  return items;
}

var SingleTerminalTabActionViewItem = class extends MenuEntryActionViewItem {
  constructor(action, _actions, keybindingService, notificationService, contextKeyService, themeService, _terminalService, _terminaConfigurationService, _terminalGroupService, contextMenuService, _commandService, _instantiationService, _accessibilityService) {
    super(action, {
      draggable: true,
      hoverDelegate: _instantiationService.createInstance(SingleTabHoverDelegate)
    }, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, _accessibilityService);
    this._actions = _actions;
    this._terminalService = _terminalService;
    this._terminaConfigurationService = _terminaConfigurationService;
    this._terminalGroupService = _terminalGroupService;
    this._commandService = _commandService;
    this._instantiationService = _instantiationService;
    this._elementDisposables = [];
    this._register(Event2.debounce(Event2.any(
      this._terminalService.onAnyInstancePrimaryStatusChange,
      this._terminalGroupService.onDidChangeActiveInstance,
      Event2.map(this._terminalService.onAnyInstanceIconChange, (e) => e.instance),
      this._terminalService.onAnyInstanceTitleChange,
      this._terminalService.onDidChangeInstanceCapability
    ), (last, e) => {
      if (!last) {
        last = /* @__PURE__ */ new Set();
      }
      if (e) {
        last.add(e);
      }
      return last;
    }, MicrotaskDelay)((merged) => {
      for (const e of merged) {
        this.updateLabel(e);
      }
    }));
    this._register(toDisposable(() => dispose(this._elementDisposables)));
  }
  async onClick(event) {
    this._terminalGroupService.lastAccessedMenu = "inline-tab";
    if (event.altKey && this._menuItemAction.alt) {
      this._commandService.executeCommand(this._menuItemAction.alt.id, { location: 1 /* Panel */ });
    } else {
      this._openContextMenu();
    }
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  updateLabel(e) {
    if (e && e !== this._terminalGroupService.activeInstance) {
      return;
    }
    if (this._elementDisposables.length === 0 && this.element && this.label) {
      this._elementDisposables.push(addDisposableListener(this.element, EventType.CONTEXT_MENU, (e2) => {
        if (e2.button === 2) {
          this._openContextMenu();
          e2.stopPropagation();
          e2.preventDefault();
        }
      }));
      this._elementDisposables.push(addDisposableListener(this.element, EventType.AUXCLICK, (e2) => {
        if (e2.button === 1) {
          const instance2 = this._terminalGroupService.activeInstance;
          if (instance2) {
            this._terminalService.safeDisposeTerminal(instance2);
          }
          e2.preventDefault();
        }
      }));
      this._elementDisposables.push(addDisposableListener(this.element, EventType.DRAG_START, (e2) => {
        const instance2 = this._terminalGroupService.activeInstance;
        if (e2.dataTransfer && instance2) {
          e2.dataTransfer.setData("Terminals" /* Terminals */, JSON.stringify([instance2.resource.toString()]));
        }
      }));
    }
    if (this.label) {
      const label3 = this.label;
      const instance2 = this._terminalGroupService.activeInstance;
      if (!instance2) {
        reset(label3, "");
        return;
      }
      label3.classList.add("single-terminal-tab");
      let colorStyle = "";
      const primaryStatus = instance2.statusList.primary;
      if (primaryStatus) {
        const colorKey = getColorForSeverity(primaryStatus.severity);
        this._themeService.getColorTheme();
        const foundColor = this._themeService.getColorTheme().getColor(colorKey);
        if (foundColor) {
          colorStyle = foundColor.toString();
        }
      }
      label3.style.color = colorStyle;
      const primaryActionIcon = this._menuItemAction.item.icon;
      reset(label3, ...renderLabelWithIcons(this._instantiationService.invokeFunction(getSingleTabLabel, instance2, this._terminaConfigurationService.config.tabs.separator, ThemeIcon.isThemeIcon(primaryActionIcon) ? primaryActionIcon : void 0)));
      if (this._altCommand) {
        label3.classList.remove(this._altCommand);
        this._altCommand = void 0;
      }
      if (this._color) {
        label3.classList.remove(this._color);
        this._color = void 0;
      }
      if (this._class) {
        label3.classList.remove(this._class);
        label3.classList.remove("terminal-uri-icon");
        this._class = void 0;
      }
      const colorClass = getColorClass(instance2);
      if (colorClass) {
        this._color = colorClass;
        label3.classList.add(colorClass);
      }
      const uriClasses = getUriClasses(instance2, this._themeService.getColorTheme().type);
      if (uriClasses) {
        this._class = uriClasses?.[0];
        label3.classList.add(...uriClasses);
      }
      if (primaryActionIcon) {
        this._altCommand = `alt-command`;
        label3.classList.add(this._altCommand);
      }
      this.updateTooltip();
    }
  }
  _openContextMenu() {
    const actionRunner = new TerminalContextActionRunner();
    this._contextMenuService.showContextMenu({
      actionRunner,
      getAnchor: () => this.element,
      getActions: () => this._actions,
      // The context is always the active instance in the terminal view
      getActionsContext: () => {
        const instance2 = this._terminalGroupService.activeInstance;
        return instance2 ? [new InstanceContext(instance2)] : [];
      },
      onHide: () => actionRunner.dispose()
    });
  }
};

SingleTerminalTabActionViewItem = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, ITerminalService),
  __decorateParam(7, ITerminalConfigurationService),
  __decorateParam(8, ITerminalGroupService),
  __decorateParam(9, IContextMenuService),
  __decorateParam(10, ICommandService),
  __decorateParam(11, IInstantiationService),
  __decorateParam(12, IAccessibilityService)
], SingleTerminalTabActionViewItem);

function getSingleTabLabel(accessor, instance2, separator2, icon2) {
  if (!instance2 || !instance2.title) {
    return "";
  }
  const iconId = ThemeIcon.isThemeIcon(instance2.icon) ? instance2.icon.id : accessor.get(ITerminalProfileResolverService).getDefaultIcon().id;
  const label3 = `$(${icon2?.id || iconId}) ${getSingleTabTitle(instance2, separator2)}`;
  const primaryStatus = instance2.statusList.primary;
  if (!primaryStatus?.icon) {
    return label3;
  }
  return `${label3} $(${primaryStatus.icon.id})`;
}

function getSingleTabTitle(instance2, separator2) {
  if (!instance2) {
    return "";
  }
  return !instance2.description ? instance2.title : `${instance2.title} ${separator2} ${instance2.description}`;
}

var TerminalThemeIconStyle = class extends Themable {
  constructor(container3, _themeService, _terminalService, _terminalGroupService) {
    super(_themeService);
    this._themeService = _themeService;
    this._terminalService = _terminalService;
    this._terminalGroupService = _terminalGroupService;
    this._registerListeners();
    this._styleElement = createStyleSheet(container3);
    this._register(toDisposable(() => this._styleElement.remove()));
    this.updateStyles();
  }
  _registerListeners() {
    this._register(this._terminalService.onAnyInstanceIconChange(() => this.updateStyles()));
    this._register(this._terminalService.onDidChangeInstances(() => this.updateStyles()));
    this._register(this._terminalGroupService.onDidChangeGroups(() => this.updateStyles()));
  }
  updateStyles() {
    super.updateStyles();
    const colorTheme = this._themeService.getColorTheme();
    let css = "";
    for (const instance2 of this._terminalService.instances) {
      const icon2 = instance2.icon;
      if (!icon2) {
        continue;
      }
      let uri5 = void 0;
      if (icon2 instanceof URI) {
        uri5 = icon2;
      } else if (icon2 instanceof Object && hasKey(icon2, { light: true, dark: true })) {
        uri5 = isDark(colorTheme.type) ? icon2.dark : icon2.light;
      }
      const iconClasses = getUriClasses(instance2, colorTheme.type);
      if (uri5 instanceof URI && iconClasses && iconClasses.length > 1) {
        css += `.monaco-workbench .${iconClasses[0]} .monaco-highlighted-label .codicon, .monaco-action-bar .terminal-uri-icon.single-terminal-tab.action-label:not(.alt-command) .codicon{background-image: ${asCSSUrl(uri5)};}`;
      }
    }
    for (const instance2 of this._terminalService.instances) {
      const colorClass = getColorClass(instance2);
      if (!colorClass || !instance2.color) {
        continue;
      }
      const color2 = colorTheme.getColor(instance2.color);
      if (color2) {
        css += `.monaco-workbench .${colorClass} .codicon:first-child:not(.codicon-split-horizontal):not(.codicon-trashcan):not(.file-icon):not(.codicon-rerun-task){ color: ${color2} !important; }`;
      }
    }
    this._styleElement.textContent = css;
  }
};

TerminalThemeIconStyle = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, ITerminalService),
  __decorateParam(3, ITerminalGroupService)
], TerminalThemeIconStyle);

var SingleTabHoverDelegate = class {
  constructor(_configurationService, _hoverService, _storageService, _terminalGroupService) {
    this._configurationService = _configurationService;
    this._hoverService = _hoverService;
    this._storageService = _storageService;
    this._terminalGroupService = _terminalGroupService;
    this._lastHoverHideTime = 0;
    this.placement = "element";
  }
  get delay() {
    return Date.now() - this._lastHoverHideTime < 200 ? 0 : this._configurationService.getValue("workbench.hover.delay");
  }
  showHover(options3, focus) {
    const instance2 = this._terminalGroupService.activeInstance;
    if (!instance2) {
      return;
    }
    const hoverInfo = getInstanceHoverInfo(instance2, this._storageService);
    return this._hoverService.showInstantHover({
      ...options3,
      content: hoverInfo.content,
      actions: hoverInfo.actions
    }, focus);
  }
  onDidHideHover() {
    this._lastHoverHideTime = Date.now();
  }
};

SingleTabHoverDelegate = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IHoverService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, ITerminalGroupService)
], SingleTabHoverDelegate);
export { getTerminalSelectOpenItems, getSingleTabLabel, getSingleTabTitle, TerminalViewPane, SwitchTerminalActionViewItem, SingleTerminalTabActionViewItem, TerminalThemeIconStyle, SingleTabHoverDelegate };
