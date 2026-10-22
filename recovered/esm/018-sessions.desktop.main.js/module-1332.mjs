// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/views/viewFilter.ts
import { MenuId, MenuRegistry, SubmenuItemAction } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { SubmenuEntryActionViewItem } from "./module-0516.mjs";
import { Widget } from "./module-0252.mjs";
import { Emitter } from "./module-0017.mjs";
import { Delayer, disposableTimeout } from "./module-0036.mjs";
import { toDisposable } from "./module-0012.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { $, EventType, addStandardDisposableListener, append, trackFocus } from "./module-0075.mjs";
import { ContextScopedHistoryInputBox } from "./module-0603.mjs";
import { showHistoryKeybindingHint } from "./module-0604.mjs";
import { defaultInputBoxStyles } from "./module-0513.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { badgeBackground, badgeForeground } from "./module-0228.mjs";
import { contrastBorder } from "./module-0227.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/browser/parts/views/viewFilter.ts
var viewFilterMenu = new MenuId("menu.view.filter");

var viewFilterSubmenu = new MenuId("submenu.view.filter");

MenuRegistry.appendMenuItem(viewFilterMenu, {
  submenu: viewFilterSubmenu,
  title: localize(6978, null),
  group: "navigation",
  icon: Codicon.filter
});

var MoreFiltersActionViewItem = class extends SubmenuEntryActionViewItem {
  constructor() {
    super(...arguments);
    this._checked = false;
  }
  set checked(checked) {
    if (this._checked !== checked) {
      this._checked = checked;
      this.updateChecked();
    }
  }
  updateChecked() {
    if (this.element) {
      this.element.classList.toggle("checked", this._checked);
    }
  }
  render(container2) {
    super.render(container2);
    this.updateChecked();
  }
};

var FilterWidget = class extends Widget {
  constructor(options3, instantiationService, contextViewService, contextKeyService, keybindingService, configurationService, accessibilityService) {
    super();
    this.options = options3;
    this.instantiationService = instantiationService;
    this.contextViewService = contextViewService;
    this.keybindingService = keybindingService;
    this.configurationService = configurationService;
    this.accessibilityService = accessibilityService;
    this._onDidChangeFilterText = this._register(new Emitter());
    this.onDidChangeFilterText = this._onDidChangeFilterText.event;
    this._onDidAcceptFilterText = this._register(new Emitter());
    this.onDidAcceptFilterText = this._onDidAcceptFilterText.event;
    this.isMoreFiltersChecked = false;
    /**
     * Tracks whether the accessibility help hint has been announced in the ARIA label.
     * Reset when the widget loses focus, allowing the hint to be announced again
     * on the next focus.
     */
    this._accessibilityHelpHintAnnounced = false;
    this.delayedFilterUpdate = new Delayer(300);
    this._register(toDisposable(() => this.delayedFilterUpdate.cancel()));
    if (options3.focusContextKey) {
      this.focusContextKey = new RawContextKey(options3.focusContextKey, false).bindTo(contextKeyService);
    }
    this.element = $(".viewpane-filter");
    [this.filterInputBox, this.focusTracker] = this.createInput(this.element);
    this._register(this.filterInputBox);
    this._register(this.focusTracker);
    const controlsContainer = append(this.element, $(".viewpane-filter-controls"));
    this.filterBadge = this.createBadge(controlsContainer);
    this.toolbar = this._register(this.createToolBar(controlsContainer));
    this.adjustInputBox();
  }
  get onDidFocus() {
    return this.focusTracker.onDidFocus;
  }
  get onDidBlur() {
    return this.focusTracker.onDidBlur;
  }
  hasFocus() {
    return this.filterInputBox.hasFocus();
  }
  focus() {
    this._updateFilterInputAriaLabel();
    this.filterInputBox.focus();
  }
  /**
   * Updates the ARIA label of the filter input box.
   * When a screen reader is active and the accessibility verbosity setting is enabled,
   * includes a hint about pressing Alt+F1 for accessibility help on first focus.
   * The hint is only announced once per focus cycle to prevent double-speak.
   */
  _updateFilterInputAriaLabel() {
    let ariaLabel = this.options.ariaLabel || localize(6979, null);
    if (!this._accessibilityHelpHintAnnounced && this.configurationService.getValue("accessibility.verbosity.find") && this.accessibilityService.isScreenReaderOptimized()) {
      const keybinding = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp")?.getAriaLabel();
      if (keybinding) {
        ariaLabel += ", " + localize(6977, null, keybinding);
        this._accessibilityHelpHintAnnounced = true;
        this._labelResetTimeout?.dispose();
        this._labelResetTimeout = disposableTimeout(() => {
          this.filterInputBox.setAriaLabel(this.options.ariaLabel || localize(6979, null));
        }, 1e3);
      }
    }
    this.filterInputBox.setAriaLabel(ariaLabel);
  }
  blur() {
    this.filterInputBox.blur();
  }
  updateBadge(message) {
    this.filterBadge.classList.toggle("hidden", !message);
    this.filterBadge.textContent = message || "";
    this.adjustInputBox();
  }
  setFilterText(filterText) {
    this.filterInputBox.value = filterText;
  }
  getFilterText() {
    return this.filterInputBox.value;
  }
  getHistory() {
    return this.filterInputBox.getHistory();
  }
  layout(width2) {
    this.element.parentElement?.classList.toggle("grow", width2 > 700);
    this.element.classList.toggle("small", width2 < 400);
    this.adjustInputBox();
    this.lastWidth = width2;
  }
  relayout() {
    if (this.lastWidth) {
      this.layout(this.lastWidth);
    }
  }
  checkMoreFilters(checked) {
    this.isMoreFiltersChecked = checked;
    if (this.moreFiltersActionViewItem) {
      this.moreFiltersActionViewItem.checked = checked;
    }
  }
  createInput(container2) {
    const history = this.options.history || [];
    const inputBox = this._register(this.instantiationService.createInstance(ContextScopedHistoryInputBox, container2, this.contextViewService, {
      placeholder: this.options.placeholder,
      ariaLabel: this.options.ariaLabel,
      history: new Set(history),
      showHistoryHint: () => showHistoryKeybindingHint(this.keybindingService),
      inputBoxStyles: defaultInputBoxStyles
    }));
    if (this.options.text) {
      inputBox.value = this.options.text;
    }
    this._register(inputBox.onDidChange((filter2) => this.delayedFilterUpdate.trigger(() => this.onDidInputChange(inputBox))));
    this._register(addStandardDisposableListener(inputBox.inputElement, EventType.KEY_DOWN, (e4) => this.onInputKeyDown(e4)));
    this._register(addStandardDisposableListener(container2, EventType.KEY_DOWN, (e4) => this.handleKeyboardEvent(e4)));
    this._register(addStandardDisposableListener(container2, EventType.KEY_UP, (e4) => this.handleKeyboardEvent(e4)));
    this._register(addStandardDisposableListener(inputBox.inputElement, EventType.CLICK, (e4) => {
      e4.stopPropagation();
      e4.preventDefault();
    }));
    const focusTracker = this._register(trackFocus(inputBox.inputElement));
    if (this.focusContextKey) {
      this._register(focusTracker.onDidFocus(() => this.focusContextKey.set(true)));
      this._register(focusTracker.onDidBlur(() => this.focusContextKey.set(false)));
      this._register(toDisposable(() => this.focusContextKey.reset()));
    }
    return [inputBox, focusTracker];
  }
  createBadge(container2) {
    const filterBadge = append(container2, $(".viewpane-filter-badge.hidden"));
    filterBadge.style.backgroundColor = asCssVariable(badgeBackground);
    filterBadge.style.color = asCssVariable(badgeForeground);
    filterBadge.style.border = `1px solid ${asCssVariable(contrastBorder)}`;
    return filterBadge;
  }
  createToolBar(container2) {
    return this.instantiationService.createInstance(
      MenuWorkbenchToolBar,
      container2,
      viewFilterMenu,
      {
        hiddenItemStrategy: -1 /* NoHide */,
        actionViewItemProvider: (action, options3) => {
          if (action instanceof SubmenuItemAction && action.item.submenu.id === viewFilterSubmenu.id) {
            this.moreFiltersActionViewItem = this.instantiationService.createInstance(MoreFiltersActionViewItem, action, options3);
            this.moreFiltersActionViewItem.checked = this.isMoreFiltersChecked;
            return this.moreFiltersActionViewItem;
          }
          return void 0;
        }
      }
    );
  }
  onDidInputChange(inputbox) {
    inputbox.addToHistory();
    this._onDidChangeFilterText.fire(inputbox.value);
  }
  adjustInputBox() {
    this.filterInputBox.inputElement.style.paddingRight = this.element.classList.contains("small") || this.filterBadge.classList.contains("hidden") ? "25px" : "150px";
  }
  // Action toolbar is swallowing some keys for action items which should not be for an input box
  handleKeyboardEvent(event) {
    if (event.equals(10 /* Space */) || event.equals(15 /* LeftArrow */) || event.equals(17 /* RightArrow */) || event.equals(14 /* Home */) || event.equals(13 /* End */)) {
      event.stopPropagation();
    }
  }
  onInputKeyDown(event) {
    let handled = false;
    if (event.equals(2 /* Tab */) && !this.toolbar.isEmpty()) {
      this.toolbar.focus();
      handled = true;
    }
    if (event.equals(3 /* Enter */)) {
      this._onDidAcceptFilterText.fire();
      handled = true;
    }
    if (handled) {
      event.stopPropagation();
      event.preventDefault();
    }
  }
};

FilterWidget = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IAccessibilityService)
], FilterWidget);
export { viewFilterMenu, viewFilterSubmenu, MoreFiltersActionViewItem, FilterWidget };
