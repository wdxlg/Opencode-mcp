// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/quickInputList.ts
import { $, EventType, addDisposableListener, addStandardDisposableListener, append, isAncestor, isAncestorOfActiveElement, isHTMLAnchorElement, prepend } from "./module-0075.mjs";
import { Lazy } from "./module-0028.mjs";
import { getCodiconAriaLabel, matchesFuzzyIconAware, parseLabelWithIcons } from "./module-0461.mjs";
import { Emitter, Event2, EventBufferer } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { IconLabel } from "./module-0640.mjs";
import { KeybindingLabel } from "./module-0547.mjs";
import { OS } from "./module-0014.mjs";
import { ToolBar } from "./module-0503.mjs";
import { Checkbox, createToggleActionViewItemProvider } from "./module-0549.mjs";
import { defaultCheckboxStyles } from "./module-0513.mjs";
import { isDark } from "./module-0247.mjs";
import { URI } from "./module-0032.mjs";
import { asCSSUrl } from "./module-0449.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { escape, ltrim } from "./module-0030.mjs";
import { quickInputButtonsToActionArrays } from "./module-1559.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IThemeService } from "./module-0287.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableValueOpts } from "./module-0050.mjs";
import { equals } from "./module-0007.mjs";
import { WorkbenchObjectTree } from "./module-0636.mjs";
import { ThrottledDelayer, disposableTimeout } from "./module-0036.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { transaction } from "./module-0045.mjs";
import { memoize } from "./module-0250.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { compareAnything } from "./module-1521.mjs";


// src/vs/platform/quickinput/browser/quickInputList.ts
var $18 = $;

var BaseQuickPickItemElement = class {
  constructor(index2, hasCheckbox, mainItem) {
    this.index = index2;
    this.hasCheckbox = hasCheckbox;
    this._hidden = false;
    this._init = new Lazy(() => {
      const saneLabel = mainItem.label ?? "";
      const saneSortLabel = parseLabelWithIcons(saneLabel).text.trim();
      const saneAriaLabel = mainItem.ariaLabel || [saneLabel, this.saneDescription, this.saneDetail].map((s) => getCodiconAriaLabel(s)).filter((s) => !!s).join(", ");
      return {
        saneLabel,
        saneSortLabel,
        saneAriaLabel
      };
    });
    this._saneDescription = mainItem.description;
    this._saneTooltip = mainItem.tooltip;
  }
  // #region Lazy Getters
  get saneLabel() {
    return this._init.value.saneLabel;
  }
  get saneSortLabel() {
    return this._init.value.saneSortLabel;
  }
  get saneAriaLabel() {
    return this._init.value.saneAriaLabel;
  }
  get element() {
    return this._element;
  }
  set element(value2) {
    this._element = value2;
  }
  get hidden() {
    return this._hidden;
  }
  set hidden(value2) {
    this._hidden = value2;
  }
  get saneDescription() {
    return this._saneDescription;
  }
  set saneDescription(value2) {
    this._saneDescription = value2;
  }
  get saneDetail() {
    return this._saneDetail;
  }
  set saneDetail(value2) {
    this._saneDetail = value2;
  }
  get saneTooltip() {
    return this._saneTooltip;
  }
  set saneTooltip(value2) {
    this._saneTooltip = value2;
  }
  get labelHighlights() {
    return this._labelHighlights;
  }
  set labelHighlights(value2) {
    this._labelHighlights = value2;
  }
  get descriptionHighlights() {
    return this._descriptionHighlights;
  }
  set descriptionHighlights(value2) {
    this._descriptionHighlights = value2;
  }
  get detailHighlights() {
    return this._detailHighlights;
  }
  set detailHighlights(value2) {
    this._detailHighlights = value2;
  }
};

var QuickPickItemElement = class extends BaseQuickPickItemElement {
  constructor(index2, childIndex, hasCheckbox, fireButtonTriggered, _onChecked, item, _separator) {
    super(index2, hasCheckbox, item);
    this.childIndex = childIndex;
    this.fireButtonTriggered = fireButtonTriggered;
    this._onChecked = _onChecked;
    this.item = item;
    this._separator = _separator;
    this._checked = false;
    this.onChecked = hasCheckbox ? Event2.map(Event2.filter(this._onChecked.event, (e4) => e4.element === this), (e4) => e4.checked) : Event2.None;
    this._saneDetail = item.detail;
    this._labelHighlights = item.highlights?.label;
    this._descriptionHighlights = item.highlights?.description;
    this._detailHighlights = item.highlights?.detail;
  }
  get separator() {
    return this._separator;
  }
  set separator(value2) {
    this._separator = value2;
  }
  get checked() {
    return this._checked;
  }
  set checked(value2) {
    if (value2 !== this._checked) {
      this._checked = value2;
      this._onChecked.fire({ element: this, checked: value2 });
    }
  }
  get checkboxDisabled() {
    return !!this.item.disabled;
  }
};

var QuickPickSeparatorElement = class extends BaseQuickPickItemElement {
  constructor(index2, fireSeparatorButtonTriggered, separator2) {
    super(index2, false, separator2);
    this.fireSeparatorButtonTriggered = fireSeparatorButtonTriggered;
    this.separator = separator2;
    this.children = new Array();
    /**
     * If this item is >0, it means that there is some item in the list that is either:
     * * hovered over
     * * active
     */
    this.focusInsideSeparator = 0 /* NONE */;
  }
};

var QuickInputItemDelegate = class {
  getHeight(element) {
    if (element instanceof QuickPickSeparatorElement) {
      return 30;
    }
    return element.saneDetail ? 44 : 22;
  }
  getTemplateId(element) {
    if (element instanceof QuickPickItemElement) {
      return QuickPickItemElementRenderer.ID;
    } else {
      return QuickPickSeparatorElementRenderer.ID;
    }
  }
};

var QuickInputAccessibilityProvider = class {
  getWidgetAriaLabel() {
    return localize(3212, null);
  }
  getAriaLabel(element) {
    return element.separator?.label ? `${element.saneAriaLabel}, ${element.separator.label}` : element.saneAriaLabel;
  }
  getWidgetRole() {
    return "listbox";
  }
  getRole(element) {
    return element.hasCheckbox ? "checkbox" : "option";
  }
  isChecked(element) {
    if (!element.hasCheckbox || !(element instanceof QuickPickItemElement)) {
      return void 0;
    }
    return {
      get value() {
        return element.checked;
      },
      onDidChange: (e4) => element.onChecked(() => e4())
    };
  }
};

var BaseQuickInputListRenderer = class extends Disposable {
  constructor(hoverDelegate, toggleStyles, contextMenuService) {
    super();
    this.hoverDelegate = hoverDelegate;
    this.toggleStyles = toggleStyles;
    this.contextMenuService = contextMenuService;
    this._onDidDisposeFocusedElement = this._register(new Emitter());
    /**
     * This event is emitted when the renderer disposes an element that has focus.
     * This allows the list to re-focus itself and prevent focus from being lost
     * (potentially causing quickinput to dismiss itself) when an element is
     * removed while focused.
     */
    this.onDidDisposeFocusedElement = this._onDidDisposeFocusedElement.event;
  }
  // TODO: only do the common stuff here and have a subclass handle their specific stuff
  renderTemplate(container2) {
    const data = /* @__PURE__ */ Object.create(null);
    data.toDisposeElement = new DisposableStore();
    data.toDisposeTemplate = new DisposableStore();
    data.entry = append(container2, $18(".quick-input-list-entry"));
    const label3 = append(data.entry, $18("label.quick-input-list-label"));
    data.outerLabel = label3;
    data.checkbox = data.toDisposeTemplate.add(new MutableDisposable());
    data.toDisposeTemplate.add(addStandardDisposableListener(label3, EventType.CLICK, (e4) => {
      if (data.checkbox.value && !e4.defaultPrevented && data.checkbox.value.enabled) {
        const checked = !data.checkbox.value.checked;
        data.checkbox.value.checked = checked;
        data.element.checked = checked;
      }
    }));
    const rows = append(label3, $18(".quick-input-list-rows"));
    const row1 = append(rows, $18(".quick-input-list-row"));
    const row2 = append(rows, $18(".quick-input-list-row"));
    data.label = new IconLabel(row1, { supportHighlights: true, supportDescriptionHighlights: true, supportIcons: true, hoverDelegate: this.hoverDelegate });
    data.toDisposeTemplate.add(data.label);
    data.icon = prepend(data.label.element, $18(".quick-input-list-icon"));
    const keybindingContainer = append(row1, $18(".quick-input-list-entry-keybinding"));
    data.keybinding = new KeybindingLabel(keybindingContainer, OS);
    data.toDisposeTemplate.add(data.keybinding);
    const detailContainer = append(row2, $18(".quick-input-list-label-meta"));
    data.detail = new IconLabel(detailContainer, { supportHighlights: true, supportIcons: true, hoverDelegate: this.hoverDelegate });
    data.toDisposeTemplate.add(data.detail);
    data.separator = append(data.entry, $18(".quick-input-list-separator"));
    data.toolBar = new ToolBar(data.entry, this.contextMenuService, {
      ...this.hoverDelegate ? { hoverDelegate: this.hoverDelegate } : void 0,
      actionViewItemProvider: createToggleActionViewItemProvider(this.toggleStyles),
      icon: true,
      label: false
    });
    data.toolBar.getElement().classList.add("quick-input-list-entry-action-bar");
    data.toDisposeTemplate.add(data.toolBar);
    return data;
  }
  disposeTemplate(data) {
    data.toDisposeElement.dispose();
    data.toDisposeTemplate.dispose();
  }
  disposeElement(_element, _index, data) {
    if (isAncestorOfActiveElement(data.entry)) {
      this._onDidDisposeFocusedElement.fire();
    }
    data.toDisposeElement.clear();
    data.toolBar.setActions([]);
  }
};

var QuickPickItemElementRenderer = class extends BaseQuickInputListRenderer {
  constructor(hoverDelegate, toggleStyles, contextMenuService, themeService) {
    super(hoverDelegate, toggleStyles, contextMenuService);
    this.themeService = themeService;
    // Follow what we do in the separator renderer
    this._itemsWithSeparatorsFrequency = /* @__PURE__ */ new Map();
  }
  static {
    this.ID = "quickpickitem";
  }
  get templateId() {
    return QuickPickItemElementRenderer.ID;
  }
  ensureCheckbox(element, data) {
    if (!element.hasCheckbox) {
      data.checkbox.value?.domNode.remove();
      data.checkbox.clear();
      return;
    }
    let checkbox = data.checkbox.value;
    if (!checkbox) {
      checkbox = new Checkbox(element.saneLabel, element.checked, { ...defaultCheckboxStyles, size: 15 });
      data.checkbox.value = checkbox;
      data.outerLabel.prepend(checkbox.domNode);
      checkbox.domNode.tabIndex = -1;
    } else {
      checkbox.setTitle(element.saneLabel);
    }
    if (element.checkboxDisabled) {
      checkbox.disable();
    } else {
      checkbox.enable();
    }
    checkbox.checked = element.checked;
    data.toDisposeElement.add(element.onChecked((checked) => checkbox.checked = checked));
    data.toDisposeElement.add(checkbox.onChange(() => element.checked = checkbox.checked));
  }
  renderElement(node, index2, data) {
    const element = node.element;
    data.element = element;
    element.element = data.entry ?? void 0;
    const mainItem = element.item;
    element.element.classList.toggle("not-pickable", element.item.pickable === false);
    if (typeof mainItem.id === "string") {
      data.entry.setAttribute("data-quick-input-id", mainItem.id);
    } else {
      data.entry.removeAttribute("data-quick-input-id");
    }
    this.ensureCheckbox(element, data);
    const { labelHighlights, descriptionHighlights, detailHighlights } = element;
    if (mainItem.iconPath) {
      const icon2 = isDark(this.themeService.getColorTheme().type) ? mainItem.iconPath.dark : mainItem.iconPath.light ?? mainItem.iconPath.dark;
      const iconUrl = URI.revive(icon2);
      data.icon.className = "quick-input-list-icon";
      data.icon.style.backgroundImage = asCSSUrl(iconUrl);
    } else {
      data.icon.style.backgroundImage = "";
      data.icon.className = mainItem.iconClass ? `quick-input-list-icon ${mainItem.iconClass}` : "";
    }
    data.icon.style.color = mainItem.iconColor ? asCssVariable(mainItem.iconColor.id) : "";
    let descriptionTitle;
    if (!element.saneTooltip && element.saneDescription) {
      descriptionTitle = {
        markdown: {
          value: escape(element.saneDescription),
          supportThemeIcons: true
        },
        markdownNotSupportedFallback: element.saneDescription
      };
    }
    const options3 = {
      matches: labelHighlights || [],
      // If we have a tooltip, we want that to be shown and not any other hover
      descriptionTitle,
      descriptionMatches: descriptionHighlights || [],
      labelEscapeNewLines: true
    };
    options3.extraClasses = mainItem.iconClasses;
    options3.italic = mainItem.italic;
    options3.strikethrough = mainItem.strikethrough;
    data.entry.classList.remove("quick-input-list-separator-as-item");
    data.label.setLabel(element.saneLabel, element.saneDescription, options3);
    data.keybinding.set(mainItem.keybinding);
    if (element.saneDetail) {
      let title;
      if (!element.saneTooltip) {
        title = {
          markdown: {
            value: escape(element.saneDetail),
            supportThemeIcons: true
          },
          markdownNotSupportedFallback: element.saneDetail
        };
      }
      data.detail.element.style.display = "";
      data.detail.setLabel(element.saneDetail, void 0, {
        matches: detailHighlights,
        title,
        labelEscapeNewLines: true
      });
    } else {
      data.detail.element.style.display = "none";
    }
    if (element.separator?.label) {
      data.separator.textContent = element.separator.label;
      data.separator.style.display = "";
      this.addItemWithSeparator(element);
    } else {
      data.separator.style.display = "none";
    }
    data.entry.classList.toggle("quick-input-list-separator-border", !!element.separator && element.childIndex !== 0);
    const buttons = mainItem.buttons;
    if (buttons && buttons.length) {
      const { primary, secondary } = quickInputButtonsToActionArrays(
        buttons,
        "quick-input-item",
        (button) => element.fireButtonTriggered({ button, item: element.item })
      );
      data.toolBar.setActions(primary, secondary);
      data.entry.classList.add("has-actions");
    } else {
      data.toolBar.setActions([]);
      data.entry.classList.remove("has-actions");
    }
  }
  disposeElement(element, _index, data) {
    this.removeItemWithSeparator(element.element);
    super.disposeElement(element, _index, data);
  }
  isItemWithSeparatorVisible(item) {
    return this._itemsWithSeparatorsFrequency.has(item);
  }
  addItemWithSeparator(item) {
    this._itemsWithSeparatorsFrequency.set(item, (this._itemsWithSeparatorsFrequency.get(item) || 0) + 1);
  }
  removeItemWithSeparator(item) {
    const frequency = this._itemsWithSeparatorsFrequency.get(item) || 0;
    if (frequency > 1) {
      this._itemsWithSeparatorsFrequency.set(item, frequency - 1);
    } else {
      this._itemsWithSeparatorsFrequency.delete(item);
    }
  }
};

QuickPickItemElementRenderer = __decorateClass([
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IThemeService)
], QuickPickItemElementRenderer);

var QuickPickSeparatorElementRenderer = class extends BaseQuickInputListRenderer {
  constructor(hoverDelegate, toggleStyles, contextMenuService) {
    super(hoverDelegate, toggleStyles, contextMenuService);
    // This is a frequency map because sticky scroll re-uses the same renderer to render a second
    // instance of the same separator.
    this._visibleSeparatorsFrequency = /* @__PURE__ */ new Map();
  }
  static {
    this.ID = "quickpickseparator";
  }
  get templateId() {
    return QuickPickSeparatorElementRenderer.ID;
  }
  get visibleSeparators() {
    return [...this._visibleSeparatorsFrequency.keys()];
  }
  isSeparatorVisible(separator2) {
    return this._visibleSeparatorsFrequency.has(separator2);
  }
  renderElement(node, index2, data) {
    const element = node.element;
    data.element = element;
    element.element = data.entry ?? void 0;
    element.element.classList.toggle("focus-inside", !!element.focusInsideSeparator);
    const mainItem = element.separator;
    const { labelHighlights, descriptionHighlights } = element;
    data.icon.style.backgroundImage = "";
    data.icon.className = "";
    let descriptionTitle;
    if (!element.saneTooltip && element.saneDescription) {
      descriptionTitle = {
        markdown: {
          value: escape(element.saneDescription),
          supportThemeIcons: true
        },
        markdownNotSupportedFallback: element.saneDescription
      };
    }
    const options3 = {
      matches: labelHighlights || [],
      // If we have a tooltip, we want that to be shown and not any other hover
      descriptionTitle,
      descriptionMatches: descriptionHighlights || [],
      labelEscapeNewLines: true
    };
    data.entry.classList.add("quick-input-list-separator-as-item");
    data.label.setLabel(element.saneLabel, element.saneDescription, options3);
    data.separator.style.display = "none";
    data.entry.classList.add("quick-input-list-separator-border");
    const buttons = mainItem.buttons;
    if (buttons && buttons.length) {
      const { primary, secondary } = quickInputButtonsToActionArrays(
        buttons,
        "quick-input-separator",
        (button) => element.fireSeparatorButtonTriggered({ button, separator: element.separator })
      );
      data.toolBar.setActions(primary, secondary);
      data.entry.classList.add("has-actions");
    } else {
      data.toolBar.setActions([]);
      data.entry.classList.remove("has-actions");
    }
    this.addSeparator(element);
  }
  disposeElement(element, _index, data) {
    this.removeSeparator(element.element);
    if (!this.isSeparatorVisible(element.element)) {
      element.element.element?.classList.remove("focus-inside");
    }
    super.disposeElement(element, _index, data);
  }
  addSeparator(separator2) {
    this._visibleSeparatorsFrequency.set(separator2, (this._visibleSeparatorsFrequency.get(separator2) || 0) + 1);
  }
  removeSeparator(separator2) {
    const frequency = this._visibleSeparatorsFrequency.get(separator2) || 0;
    if (frequency > 1) {
      this._visibleSeparatorsFrequency.set(separator2, frequency - 1);
    } else {
      this._visibleSeparatorsFrequency.delete(separator2);
    }
  }
};

QuickPickSeparatorElementRenderer = __decorateClass([
  __decorateParam(2, IContextMenuService)
], QuickPickSeparatorElementRenderer);

var QuickInputList = class extends Disposable {
  constructor(parent, hoverDelegate, linkOpenerDelegate, id2, styles, instantiationService, accessibilityService) {
    super();
    this.parent = parent;
    this.hoverDelegate = hoverDelegate;
    this.linkOpenerDelegate = linkOpenerDelegate;
    this.styles = styles;
    this.accessibilityService = accessibilityService;
    //#region QuickInputList Events
    this._onKeyDown = this._register(new Emitter());
    /**
     * Event that is fired when the tree receives a keydown.
    */
    this.onKeyDown = this._onKeyDown.event;
    this._onLeave = this._register(new Emitter());
    /**
     * Event that is fired when the tree would no longer have focus.
    */
    this.onLeave = this._onLeave.event;
    this._visibleCountObservable = observableValue("VisibleCount", 0);
    this.onChangedVisibleCount = Event2.fromObservable(this._visibleCountObservable, this._store);
    this._allVisibleCheckedObservable = observableValue("AllVisibleChecked", false);
    this.onChangedAllVisibleChecked = Event2.fromObservable(this._allVisibleCheckedObservable, this._store);
    this._checkedCountObservable = observableValue("CheckedCount", 0);
    this.onChangedCheckedCount = Event2.fromObservable(this._checkedCountObservable, this._store);
    this._checkedElementsObservable = observableValueOpts({ equalsFn: equals }, new Array());
    this.onChangedCheckedElements = Event2.fromObservable(this._checkedElementsObservable, this._store);
    this._onButtonTriggered = this._register(new Emitter());
    this.onButtonTriggered = this._onButtonTriggered.event;
    this._onSeparatorButtonTriggered = this._register(new Emitter());
    this.onSeparatorButtonTriggered = this._onSeparatorButtonTriggered.event;
    this._elementChecked = this._register(new Emitter());
    this._elementCheckedEventBufferer = new EventBufferer();
    //#endregion
    this._hasCheckboxes = false;
    this._inputElements = new Array();
    this._elementTree = new Array();
    this._itemElements = new Array();
    // Elements that apply to the current set of elements
    this._elementDisposable = this._register(new DisposableStore());
    this._matchOnDescription = false;
    this._matchOnDetail = false;
    this._matchOnLabel = true;
    this._matchOnLabelMode = "fuzzy";
    this._matchOnMeta = true;
    this._sortByLabel = true;
    this._shouldLoop = true;
    this._container = append(this.parent, $18(".quick-input-list"));
    this._separatorRenderer = this._register(instantiationService.createInstance(QuickPickSeparatorElementRenderer, hoverDelegate, this.styles.toggle));
    this._itemRenderer = this._register(instantiationService.createInstance(QuickPickItemElementRenderer, hoverDelegate, this.styles.toggle));
    this._tree = this._register(instantiationService.createInstance(
      WorkbenchObjectTree,
      "QuickInput",
      this._container,
      new QuickInputItemDelegate(),
      [this._itemRenderer, this._separatorRenderer],
      {
        filter: {
          filter(element) {
            return element.hidden ? 0 /* Hidden */ : element instanceof QuickPickSeparatorElement ? 2 /* Recurse */ : 1 /* Visible */;
          }
        },
        sorter: {
          compare: (element, otherElement) => {
            if (!this.sortByLabel || !this._lastQueryString) {
              return 0;
            }
            const normalizedSearchValue = this._lastQueryString.toLowerCase();
            return compareEntries(element, otherElement, normalizedSearchValue);
          }
        },
        accessibilityProvider: new QuickInputAccessibilityProvider(),
        setRowLineHeight: false,
        multipleSelectionSupport: false,
        hideTwistiesOfChildlessElements: true,
        renderIndentGuides: "none" /* None */,
        findWidgetEnabled: false,
        indent: 0,
        horizontalScrolling: false,
        allowNonCollapsibleParents: true,
        alwaysConsumeMouseWheel: true
      }
    ));
    this._tree.getHTMLElement().id = id2;
    this._register(this._itemRenderer.onDidDisposeFocusedElement(() => this._tree.domFocus()));
    this._register(this._separatorRenderer.onDidDisposeFocusedElement(() => this._tree.domFocus()));
    this._registerListeners();
  }
  get onDidChangeFocus() {
    return Event2.map(
      this._tree.onDidChangeFocus,
      (e4) => e4.elements.filter((e5) => e5 instanceof QuickPickItemElement).map((e5) => e5.item),
      this._store
    );
  }
  get onDidChangeSelection() {
    return Event2.map(
      this._tree.onDidChangeSelection,
      (e4) => ({
        items: e4.elements.filter((e5) => e5 instanceof QuickPickItemElement).map((e5) => e5.item),
        event: e4.browserEvent
      }),
      this._store
    );
  }
  get displayed() {
    return this._container.style.display !== "none";
  }
  set displayed(value2) {
    this._container.style.display = value2 ? "" : "none";
  }
  get scrollTop() {
    return this._tree.scrollTop;
  }
  set scrollTop(scrollTop) {
    this._tree.scrollTop = scrollTop;
  }
  get ariaLabel() {
    return this._tree.ariaLabel;
  }
  set ariaLabel(label3) {
    this._tree.ariaLabel = label3 ?? "";
  }
  set enabled(value2) {
    this._tree.getHTMLElement().style.pointerEvents = value2 ? "" : "none";
  }
  get matchOnDescription() {
    return this._matchOnDescription;
  }
  set matchOnDescription(value2) {
    this._matchOnDescription = value2;
  }
  get matchOnDetail() {
    return this._matchOnDetail;
  }
  set matchOnDetail(value2) {
    this._matchOnDetail = value2;
  }
  get matchOnLabel() {
    return this._matchOnLabel;
  }
  set matchOnLabel(value2) {
    this._matchOnLabel = value2;
  }
  get matchOnLabelMode() {
    return this._matchOnLabelMode;
  }
  set matchOnLabelMode(value2) {
    this._matchOnLabelMode = value2;
  }
  get matchOnMeta() {
    return this._matchOnMeta;
  }
  set matchOnMeta(value2) {
    this._matchOnMeta = value2;
  }
  get sortByLabel() {
    return this._sortByLabel;
  }
  set sortByLabel(value2) {
    this._sortByLabel = value2;
  }
  get shouldLoop() {
    return this._shouldLoop;
  }
  set shouldLoop(value2) {
    this._shouldLoop = value2;
  }
  //#endregion
  //#region register listeners
  _registerListeners() {
    this._registerOnContainerClick();
    this._registerOnMouseMiddleClick();
    this._registerOnTreeModelChanged();
    this._registerOnElementChecked();
    this._registerOnContextMenu();
    this._registerHoverListeners();
    this._registerSelectionChangeListener();
    this._registerSeparatorActionShowingListeners();
  }
  _registerOnContainerClick() {
    this._register(addDisposableListener(this._container, EventType.CLICK, (e4) => {
      if (e4.x || e4.y) {
        this._onLeave.fire();
      }
    }));
  }
  _registerOnMouseMiddleClick() {
    this._register(addDisposableListener(this._container, EventType.AUXCLICK, (e4) => {
      if (e4.button === 1) {
        this._onLeave.fire();
      }
    }));
  }
  _registerOnTreeModelChanged() {
    this._register(this._tree.onDidChangeModel(() => {
      const visibleCount = this._itemElements.filter((e4) => !e4.hidden).length;
      this._visibleCountObservable.set(visibleCount, void 0);
      if (this._hasCheckboxes) {
        this._updateCheckedObservables();
      }
    }));
  }
  _registerOnElementChecked() {
    this._register(this._elementCheckedEventBufferer.wrapEvent(this._elementChecked.event, (_, e4) => e4)((_) => this._updateCheckedObservables()));
  }
  _registerOnContextMenu() {
    this._register(this._tree.onContextMenu((e4) => {
      if (e4.element) {
        e4.browserEvent.preventDefault();
        this._tree.setSelection([e4.element]);
      }
    }));
  }
  _registerHoverListeners() {
    const delayer5 = this._register(new ThrottledDelayer(typeof this.hoverDelegate.delay === "function" ? this.hoverDelegate.delay() : this.hoverDelegate.delay));
    this._register(this._tree.onMouseOver(async (e4) => {
      if (isHTMLAnchorElement(e4.browserEvent.target)) {
        delayer5.cancel();
        return;
      }
      if (
        // anchors are an exception as called out above so we skip them here
        !isHTMLAnchorElement(e4.browserEvent.relatedTarget) && // check if the mouse is still over the same element
        isAncestor(e4.browserEvent.relatedTarget, e4.element?.element)
      ) {
        return;
      }
      try {
        await delayer5.trigger(async () => {
          if (e4.element instanceof QuickPickItemElement) {
            this.showHover(e4.element);
          }
        });
      } catch (e5) {
        if (!isCancellationError(e5)) {
          throw e5;
        }
      }
    }));
    this._register(this._tree.onMouseOut((e4) => {
      if (isAncestor(e4.browserEvent.relatedTarget, e4.element?.element)) {
        return;
      }
      delayer5.cancel();
    }));
  }
  /**
   * Register's focus change and mouse events so that we can track when items inside of a
   * separator's section are focused or hovered so that we can display the separator's actions
   */
  _registerSeparatorActionShowingListeners() {
    this._register(this._tree.onDidChangeFocus((e4) => {
      const parent = e4.elements[0] ? this._tree.getParentElement(e4.elements[0]) : null;
      for (const separator2 of this._separatorRenderer.visibleSeparators) {
        const value2 = separator2 === parent;
        const currentActive = !!(separator2.focusInsideSeparator & 2 /* ACTIVE_ITEM */);
        if (currentActive !== value2) {
          if (value2) {
            separator2.focusInsideSeparator |= 2 /* ACTIVE_ITEM */;
          } else {
            separator2.focusInsideSeparator &= ~2 /* ACTIVE_ITEM */;
          }
          this._tree.rerender(separator2);
        }
      }
    }));
    this._register(this._tree.onMouseOver((e4) => {
      const parent = e4.element ? this._tree.getParentElement(e4.element) : null;
      for (const separator2 of this._separatorRenderer.visibleSeparators) {
        if (separator2 !== parent) {
          continue;
        }
        const currentMouse = !!(separator2.focusInsideSeparator & 1 /* MOUSE_HOVER */);
        if (!currentMouse) {
          separator2.focusInsideSeparator |= 1 /* MOUSE_HOVER */;
          this._tree.rerender(separator2);
        }
      }
    }));
    this._register(this._tree.onMouseOut((e4) => {
      const parent = e4.element ? this._tree.getParentElement(e4.element) : null;
      for (const separator2 of this._separatorRenderer.visibleSeparators) {
        if (separator2 !== parent) {
          continue;
        }
        const currentMouse = !!(separator2.focusInsideSeparator & 1 /* MOUSE_HOVER */);
        if (currentMouse) {
          separator2.focusInsideSeparator &= ~1 /* MOUSE_HOVER */;
          this._tree.rerender(separator2);
        }
      }
    }));
  }
  _registerSelectionChangeListener() {
    this._register(this._tree.onDidChangeSelection((e4) => {
      const elementsWithoutSeparators = e4.elements.filter((e5) => e5 instanceof QuickPickItemElement);
      if (elementsWithoutSeparators.length !== e4.elements.length) {
        if (e4.elements.length === 1 && e4.elements[0] instanceof QuickPickSeparatorElement) {
          this._tree.setFocus([e4.elements[0].children[0]]);
          this._tree.reveal(e4.elements[0], 0);
        }
        this._tree.setSelection(elementsWithoutSeparators);
      }
    }));
  }
  //#endregion
  //#region public methods
  setAllVisibleChecked(checked) {
    this._elementCheckedEventBufferer.bufferEvents(() => {
      this._itemElements.forEach((element) => {
        if (!element.hidden && !element.checkboxDisabled && element.item.pickable !== false) {
          element.checked = checked;
        }
      });
    });
  }
  setElements(inputElements) {
    this._elementDisposable.clear();
    this._lastQueryString = void 0;
    this._inputElements = inputElements;
    this._hasCheckboxes = this.parent.classList.contains("show-checkboxes");
    let currentSeparatorElement;
    this._itemElements = new Array();
    this._elementTree = inputElements.reduce((result, item, index2) => {
      let element;
      if (item.type === "separator") {
        if (!item.buttons) {
          return result;
        }
        currentSeparatorElement = new QuickPickSeparatorElement(
          index2,
          (e4) => this._onSeparatorButtonTriggered.fire(e4),
          item
        );
        element = currentSeparatorElement;
      } else {
        const previous = index2 > 0 ? inputElements[index2 - 1] : void 0;
        let separator2;
        if (previous && previous.type === "separator" && !previous.buttons) {
          separator2 = previous;
        }
        const qpi = new QuickPickItemElement(
          index2,
          currentSeparatorElement?.children ? currentSeparatorElement.children.length : index2,
          this._hasCheckboxes && item.pickable !== false,
          (e4) => this._onButtonTriggered.fire(e4),
          this._elementChecked,
          item,
          separator2
        );
        this._itemElements.push(qpi);
        if (currentSeparatorElement) {
          currentSeparatorElement.children.push(qpi);
          return result;
        }
        element = qpi;
      }
      result.push(element);
      return result;
    }, new Array());
    this._setElementsToTree(this._elementTree);
    if (this.accessibilityService.isScreenReaderOptimized()) {
      disposableTimeout(() => {
        const focusedElement = this._tree.getHTMLElement().querySelector(`.monaco-list-row.focused`);
        const parent = focusedElement?.parentNode;
        if (focusedElement && parent) {
          const nextSibling = focusedElement.nextSibling;
          focusedElement.remove();
          parent.insertBefore(focusedElement, nextSibling);
        }
      }, 0, this._elementDisposable);
    }
  }
  setFocusedElements(items) {
    const elements = items.map((item) => this._itemElements.find((e4) => e4.item === item)).filter((e4) => !!e4).filter((e4) => !e4.hidden);
    this._tree.setFocus(elements);
    if (items.length > 0) {
      const focused = this._tree.getFocus()[0];
      if (focused) {
        this._tree.reveal(focused);
      }
    }
  }
  getActiveDescendant() {
    return this._tree.getHTMLElement().getAttribute("aria-activedescendant");
  }
  setSelectedElements(items) {
    const elements = items.map((item) => this._itemElements.find((e4) => e4.item === item)).filter((e4) => !!e4);
    this._tree.setSelection(elements);
  }
  getCheckedElements() {
    return this._itemElements.filter((e4) => e4.checked).map((e4) => e4.item);
  }
  setCheckedElements(items) {
    this._elementCheckedEventBufferer.bufferEvents(() => {
      const checked = /* @__PURE__ */ new Set();
      for (const item of items) {
        checked.add(item);
      }
      for (const element of this._itemElements) {
        element.checked = checked.has(element.item);
      }
    });
  }
  focus(what) {
    if (!this._itemElements.length) {
      return;
    }
    if (what === 2 /* Second */ && this._itemElements.length < 2) {
      what = 1 /* First */;
    }
    switch (what) {
      case 1 /* First */:
        this._tree.scrollTop = 0;
        this._tree.focusFirst(void 0, (e4) => e4.element instanceof QuickPickItemElement);
        break;
      case 2 /* Second */: {
        this._tree.scrollTop = 0;
        let isSecondItem = false;
        this._tree.focusFirst(void 0, (e4) => {
          if (!(e4.element instanceof QuickPickItemElement)) {
            return false;
          }
          if (isSecondItem) {
            return true;
          }
          isSecondItem = !isSecondItem;
          return false;
        });
        break;
      }
      case 3 /* Last */:
        this._tree.scrollTop = this._tree.scrollHeight;
        this._tree.focusLast(void 0, (e4) => e4.element instanceof QuickPickItemElement);
        break;
      case 4 /* Next */: {
        const prevFocus = this._tree.getFocus();
        this._tree.focusNext(void 0, this._shouldLoop, void 0, (e4) => {
          if (!(e4.element instanceof QuickPickItemElement)) {
            return false;
          }
          this._tree.reveal(e4.element);
          return true;
        });
        const currentFocus = this._tree.getFocus();
        if (prevFocus.length && prevFocus[0] === currentFocus[0]) {
          this._onLeave.fire();
        }
        break;
      }
      case 5 /* Previous */: {
        const prevFocus = this._tree.getFocus();
        this._tree.focusPrevious(void 0, this._shouldLoop, void 0, (e4) => {
          if (!(e4.element instanceof QuickPickItemElement)) {
            return false;
          }
          const parent = this._tree.getParentElement(e4.element);
          if (parent === null || parent.children[0] !== e4.element) {
            this._tree.reveal(e4.element);
          } else {
            this._tree.reveal(parent);
          }
          return true;
        });
        const currentFocus = this._tree.getFocus();
        if (prevFocus.length && prevFocus[0] === currentFocus[0]) {
          this._onLeave.fire();
        }
        break;
      }
      case 6 /* NextPage */:
        this._tree.focusNextPage(void 0, (e4) => {
          if (!(e4.element instanceof QuickPickItemElement)) {
            return false;
          }
          this._tree.reveal(e4.element);
          return true;
        });
        break;
      case 7 /* PreviousPage */:
        this._tree.focusPreviousPage(void 0, (e4) => {
          if (!(e4.element instanceof QuickPickItemElement)) {
            return false;
          }
          const parent = this._tree.getParentElement(e4.element);
          if (parent === null || parent.children[0] !== e4.element) {
            this._tree.reveal(e4.element);
          } else {
            this._tree.reveal(parent);
          }
          return true;
        });
        break;
      case 8 /* NextSeparator */: {
        let foundSeparatorAsItem = false;
        const before = this._tree.getFocus()[0];
        this._tree.focusNext(void 0, true, void 0, (e4) => {
          if (foundSeparatorAsItem) {
            return true;
          }
          if (e4.element instanceof QuickPickSeparatorElement) {
            foundSeparatorAsItem = true;
            if (this._separatorRenderer.isSeparatorVisible(e4.element)) {
              this._tree.reveal(e4.element.children[0]);
            } else {
              this._tree.reveal(e4.element, 0);
            }
          } else if (e4.element instanceof QuickPickItemElement) {
            if (e4.element.separator) {
              if (this._itemRenderer.isItemWithSeparatorVisible(e4.element)) {
                this._tree.reveal(e4.element);
              } else {
                this._tree.reveal(e4.element, 0);
              }
              return true;
            } else if (e4.element === this._elementTree[0]) {
              this._tree.reveal(e4.element, 0);
              return true;
            }
          }
          return false;
        });
        const after2 = this._tree.getFocus()[0];
        if (before === after2) {
          this._tree.scrollTop = this._tree.scrollHeight;
          this._tree.focusLast(void 0, (e4) => e4.element instanceof QuickPickItemElement);
        }
        break;
      }
      case 9 /* PreviousSeparator */: {
        let focusElement;
        let foundSeparator = !!this._tree.getFocus()[0]?.separator;
        this._tree.focusPrevious(void 0, true, void 0, (e4) => {
          if (e4.element instanceof QuickPickSeparatorElement) {
            if (foundSeparator) {
              if (!focusElement) {
                if (this._separatorRenderer.isSeparatorVisible(e4.element)) {
                  this._tree.reveal(e4.element);
                } else {
                  this._tree.reveal(e4.element, 0);
                }
                focusElement = e4.element.children[0];
              }
            } else {
              foundSeparator = true;
            }
          } else if (e4.element instanceof QuickPickItemElement) {
            if (!focusElement) {
              if (e4.element.separator) {
                if (this._itemRenderer.isItemWithSeparatorVisible(e4.element)) {
                  this._tree.reveal(e4.element);
                } else {
                  this._tree.reveal(e4.element, 0);
                }
                focusElement = e4.element;
              } else if (e4.element === this._elementTree[0]) {
                this._tree.reveal(e4.element, 0);
                return true;
              }
            }
          }
          return false;
        });
        if (focusElement) {
          this._tree.setFocus([focusElement]);
        }
        break;
      }
    }
  }
  clearFocus() {
    this._tree.setFocus([]);
  }
  domFocus() {
    this._tree.domFocus();
  }
  layout(maxHeight) {
    this._tree.getHTMLElement().style.maxHeight = maxHeight ? `${// Make sure height aligns with list item heights
    Math.floor(maxHeight / 44) * 44 + 6}px` : "";
    this._tree.layout();
  }
  filter(query) {
    this._lastQueryString = query;
    if (!(this._sortByLabel || this._matchOnLabel || this._matchOnDescription || this._matchOnDetail)) {
      this._tree.layout();
      return false;
    }
    const queryWithWhitespace = query;
    query = query.trim();
    if (!query || !(this.matchOnLabel || this.matchOnDescription || this.matchOnDetail)) {
      this._itemElements.forEach((element) => {
        element.labelHighlights = void 0;
        element.descriptionHighlights = void 0;
        element.detailHighlights = void 0;
        element.hidden = false;
        const previous = element.index && this._inputElements[element.index - 1];
        if (element.item) {
          element.separator = previous && previous.type === "separator" && !previous.buttons ? previous : void 0;
        }
      });
    } else {
      let currentSeparator;
      this._itemElements.forEach((element) => {
        let labelHighlights;
        if (this.matchOnLabelMode === "fuzzy") {
          labelHighlights = this.matchOnLabel ? matchesFuzzyIconAware(query, parseLabelWithIcons(element.saneLabel)) ?? void 0 : void 0;
        } else {
          labelHighlights = this.matchOnLabel ? matchesContiguousIconAware(queryWithWhitespace, parseLabelWithIcons(element.saneLabel)) ?? void 0 : void 0;
        }
        const descriptionHighlights = this.matchOnDescription ? matchesFuzzyIconAware(query, parseLabelWithIcons(element.saneDescription || "")) ?? void 0 : void 0;
        const detailHighlights = this.matchOnDetail ? matchesFuzzyIconAware(query, parseLabelWithIcons(element.saneDetail || "")) ?? void 0 : void 0;
        if (labelHighlights || descriptionHighlights || detailHighlights) {
          element.labelHighlights = labelHighlights;
          element.descriptionHighlights = descriptionHighlights;
          element.detailHighlights = detailHighlights;
          element.hidden = false;
        } else {
          element.labelHighlights = void 0;
          element.descriptionHighlights = void 0;
          element.detailHighlights = void 0;
          element.hidden = element.item ? !element.item.alwaysShow : true;
        }
        if (element.item) {
          element.separator = void 0;
        } else if (element.separator) {
          element.hidden = true;
        }
        if (!this.sortByLabel) {
          const previous = element.index && this._inputElements[element.index - 1] || void 0;
          if (previous?.type === "separator" && !previous.buttons) {
            currentSeparator = previous;
          }
          if (currentSeparator && !element.hidden) {
            element.separator = currentSeparator;
            currentSeparator = void 0;
          }
        }
      });
    }
    this._setElementsToTree(
      this._sortByLabel && query ? this._itemElements : this._elementTree
    );
    this._tree.layout();
    return true;
  }
  toggleCheckbox() {
    this._elementCheckedEventBufferer.bufferEvents(() => {
      const elements = this._tree.getFocus().filter((e4) => e4 instanceof QuickPickItemElement);
      const allChecked = this._allVisibleChecked(elements);
      for (const element of elements) {
        if (!element.checkboxDisabled) {
          element.checked = !allChecked;
        }
      }
    });
  }
  style(styles) {
    this._tree.style(styles);
  }
  toggleHover() {
    const focused = this._tree.getFocus()[0];
    if (!focused?.saneTooltip || !(focused instanceof QuickPickItemElement)) {
      return;
    }
    if (this._lastHover && !this._lastHover.isDisposed) {
      this._lastHover.dispose();
      return;
    }
    this.showHover(focused);
    const store = new DisposableStore();
    store.add(this._tree.onDidChangeFocus((e4) => {
      if (e4.elements[0] instanceof QuickPickItemElement) {
        this.showHover(e4.elements[0]);
      }
    }));
    if (this._lastHover) {
      store.add(this._lastHover);
    }
    this._elementDisposable.add(store);
  }
  //#endregion
  //#region private methods
  _setElementsToTree(elements) {
    const treeElements = new Array();
    for (const element of elements) {
      if (element instanceof QuickPickSeparatorElement) {
        treeElements.push({
          element,
          collapsible: false,
          collapsed: false,
          children: element.children.map((e4) => ({
            element: e4,
            collapsible: false,
            collapsed: false
          }))
        });
      } else {
        treeElements.push({
          element,
          collapsible: false,
          collapsed: false
        });
      }
    }
    this._tree.setChildren(null, treeElements);
  }
  _allVisibleChecked(elements, whenNoneVisible = true) {
    for (let i2 = 0, n2 = elements.length; i2 < n2; i2++) {
      const element = elements[i2];
      if (!element.hidden && element.item.pickable !== false) {
        if (!element.checked) {
          return false;
        } else {
          whenNoneVisible = true;
        }
      }
    }
    return whenNoneVisible;
  }
  _updateCheckedObservables() {
    transaction((tx) => {
      this._allVisibleCheckedObservable.set(this._allVisibleChecked(this._itemElements, false), tx);
      const checkedCount = this._itemElements.filter((element) => element.checked).length;
      this._checkedCountObservable.set(checkedCount, tx);
      this._checkedElementsObservable.set(this.getCheckedElements(), tx);
    });
  }
  /**
   * Disposes of the hover and shows a new one for the given index if it has a tooltip.
   * @param element The element to show the hover for
   */
  showHover(element) {
    if (this._lastHover && !this._lastHover.isDisposed) {
      this.hoverDelegate.onDidHideHover?.();
      this._lastHover?.dispose();
    }
    if (!element.element || !element.saneTooltip) {
      return;
    }
    this._lastHover = this.hoverDelegate.showHover({
      content: element.saneTooltip,
      target: element.element,
      linkHandler: (url) => {
        this.linkOpenerDelegate(url);
      },
      appearance: {
        showPointer: true
      },
      container: this._container,
      position: {
        hoverPosition: 1 /* RIGHT */
      }
    }, false);
  }
};

__decorateClass([
  memoize
], QuickInputList.prototype, "onDidChangeFocus", 1);

__decorateClass([
  memoize
], QuickInputList.prototype, "onDidChangeSelection", 1);

QuickInputList = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IAccessibilityService)
], QuickInputList);

function matchesContiguousIconAware(query, target) {
  const { text: text2, iconOffsets } = target;
  if (!iconOffsets || iconOffsets.length === 0) {
    return matchesContiguous(query, text2);
  }
  const wordToMatchAgainstWithoutIconsTrimmed = ltrim(text2, " ");
  const leadingWhitespaceOffset = text2.length - wordToMatchAgainstWithoutIconsTrimmed.length;
  const matches2 = matchesContiguous(query, wordToMatchAgainstWithoutIconsTrimmed);
  if (matches2) {
    for (const match2 of matches2) {
      const iconOffset = iconOffsets[match2.start + leadingWhitespaceOffset] + leadingWhitespaceOffset;
      match2.start += iconOffset;
      match2.end += iconOffset;
    }
  }
  return matches2;
}

function matchesContiguous(word, wordToMatchAgainst) {
  const matchIndex = wordToMatchAgainst.toLowerCase().indexOf(word.toLowerCase());
  if (matchIndex !== -1) {
    return [{ start: matchIndex, end: matchIndex + word.length }];
  }
  return null;
}

function compareEntries(elementA, elementB, lookFor) {
  const labelHighlightsA = elementA.labelHighlights || [];
  const labelHighlightsB = elementB.labelHighlights || [];
  if (labelHighlightsA.length && !labelHighlightsB.length) {
    return -1;
  }
  if (!labelHighlightsA.length && labelHighlightsB.length) {
    return 1;
  }
  if (labelHighlightsA.length === 0 && labelHighlightsB.length === 0) {
    return 0;
  }
  return compareAnything(elementA.saneSortLabel, elementB.saneSortLabel, lookFor);
}
export { matchesContiguousIconAware, matchesContiguous, compareEntries, $18, BaseQuickPickItemElement, QuickPickItemElement, QuickPickSeparatorElement, QuickInputItemDelegate, QuickInputAccessibilityProvider, BaseQuickInputListRenderer, QuickPickItemElementRenderer, QuickPickSeparatorElementRenderer, QuickInputList };
