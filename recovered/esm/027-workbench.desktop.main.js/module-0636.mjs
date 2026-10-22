// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/list/browser/listService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, combinedDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { isActiveElement, isKeyboardEvent } from "./module-0075.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { InputFocusedContextKey } from "./module-0635.mjs";
import { List, isSelectionRangeChangeEvent, isSelectionSingleChangeEvent } from "./module-0460.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { defaultFindWidgetStyles, defaultListStyles, getListStyles } from "./module-0513.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { PagedList } from "./module-0624.mjs";
import { Table } from "./module-0626.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { CompressibleObjectTree, ObjectTree } from "./module-0632.mjs";
import { DataTree } from "./module-0634.mjs";
import { AsyncDataTree, CompressibleAsyncDataTree } from "./module-0633.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/platform/list/browser/listService.ts
var IListService = createDecorator("listService");

var ListService = class {
  constructor() {
    this.disposables = new DisposableStore();
    this.lists = [];
    this._lastFocusedWidget = void 0;
  }
  get lastFocusedList() {
    return this._lastFocusedWidget;
  }
  setLastFocusedList(widget) {
    if (widget === this._lastFocusedWidget) {
      return;
    }
    this._lastFocusedWidget?.getHTMLElement().classList.remove("last-focused");
    this._lastFocusedWidget = widget;
    this._lastFocusedWidget?.getHTMLElement().classList.add("last-focused");
  }
  register(widget, extraContextKeys) {
    if (this.lists.some((l) => l.widget === widget)) {
      throw new Error("Cannot register the same widget multiple times");
    }
    const registeredList = { widget, extraContextKeys };
    this.lists.push(registeredList);
    if (isActiveElement(widget.getHTMLElement())) {
      this.setLastFocusedList(widget);
    }
    return combinedDisposable(
      widget.onDidFocus(() => this.setLastFocusedList(widget)),
      toDisposable(() => this.lists.splice(this.lists.indexOf(registeredList), 1)),
      widget.onDidDispose(() => {
        this.lists = this.lists.filter((l) => l !== registeredList);
        if (this._lastFocusedWidget === widget) {
          this.setLastFocusedList(void 0);
        }
      })
    );
  }
  dispose() {
    this.disposables.dispose();
  }
};

var RawWorkbenchListScrollAtBoundaryContextKey = new RawContextKey("listScrollAtBoundary", "none");

var WorkbenchListScrollAtTopContextKey = ContextKeyExpr.or(
  RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo("top"),
  RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo("both")
);

var WorkbenchListScrollAtBottomContextKey = ContextKeyExpr.or(
  RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo("bottom"),
  RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo("both")
);

var RawWorkbenchListFocusContextKey = new RawContextKey("listFocus", true);

var WorkbenchTreeStickyScrollFocused = new RawContextKey("treestickyScrollFocused", false);

var WorkbenchListSupportsMultiSelectContextKey = new RawContextKey("listSupportsMultiselect", true);

var WorkbenchListFocusContextKey = ContextKeyExpr.and(RawWorkbenchListFocusContextKey, ContextKeyExpr.not(InputFocusedContextKey), WorkbenchTreeStickyScrollFocused.negate());

var WorkbenchListHasSelectionOrFocus = new RawContextKey("listHasSelectionOrFocus", false);

var WorkbenchListDoubleSelection = new RawContextKey("listDoubleSelection", false);

var WorkbenchListMultiSelection = new RawContextKey("listMultiSelection", false);

var WorkbenchListSelectionNavigation = new RawContextKey("listSelectionNavigation", false);

var WorkbenchListSupportsFind = new RawContextKey("listSupportsFind", true);

var WorkbenchTreeElementCanCollapse = new RawContextKey("treeElementCanCollapse", false);

var WorkbenchTreeElementHasParent = new RawContextKey("treeElementHasParent", false);

var WorkbenchTreeElementCanExpand = new RawContextKey("treeElementCanExpand", false);

var WorkbenchTreeElementHasChild = new RawContextKey("treeElementHasChild", false);

var WorkbenchTreeFindOpen = new RawContextKey("treeFindOpen", false);

var WorkbenchListTypeNavigationModeKey = "listTypeNavigationMode";

var WorkbenchListAutomaticKeyboardNavigationLegacyKey = "listAutomaticKeyboardNavigation";

function createScopedContextKeyService(contextKeyService, widget) {
  const result = contextKeyService.createScoped(widget.getHTMLElement());
  RawWorkbenchListFocusContextKey.bindTo(result);
  return result;
}

function createScrollObserver(contextKeyService, widget) {
  const listScrollAt = RawWorkbenchListScrollAtBoundaryContextKey.bindTo(contextKeyService);
  const update = () => {
    const atTop = widget.scrollTop === 0;
    const atBottom = widget.scrollHeight - widget.renderHeight - widget.scrollTop < 1;
    if (atTop && atBottom) {
      listScrollAt.set("both");
    } else if (atTop) {
      listScrollAt.set("top");
    } else if (atBottom) {
      listScrollAt.set("bottom");
    } else {
      listScrollAt.set("none");
    }
  };
  update();
  return widget.onDidScroll(update);
}

var multiSelectModifierSettingKey = "workbench.list.multiSelectModifier";

var openModeSettingKey = "workbench.list.openMode";

var horizontalScrollingKey = "workbench.list.horizontalScrolling";

var defaultFindModeSettingKey = "workbench.list.defaultFindMode";

var typeNavigationModeSettingKey = "workbench.list.typeNavigationMode";

var keyboardNavigationSettingKey = "workbench.list.keyboardNavigation";

var scrollByPageKey = "workbench.list.scrollByPage";

var defaultFindMatchTypeSettingKey = "workbench.list.defaultFindMatchType";

var treeIndentKey = "workbench.tree.indent";

var treeRenderIndentGuidesKey = "workbench.tree.renderIndentGuides";

var listSmoothScrolling = "workbench.list.smoothScrolling";

var mouseWheelScrollSensitivityKey = "workbench.list.mouseWheelScrollSensitivity";

var fastScrollSensitivityKey = "workbench.list.fastScrollSensitivity";

var treeExpandMode = "workbench.tree.expandMode";

var treeStickyScroll = "workbench.tree.enableStickyScroll";

var treeStickyScrollMaxElements = "workbench.tree.stickyScrollMaxItemCount";

function useAltAsMultipleSelectionModifier(configurationService) {
  return configurationService.getValue(multiSelectModifierSettingKey) === "alt";
}

var MultipleSelectionController = class extends Disposable {
  constructor(configurationService) {
    super();
    this.configurationService = configurationService;
    this.useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
        this.useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(this.configurationService);
      }
    }));
  }
  isSelectionSingleChangeEvent(event) {
    if (this.useAltAsMultipleSelectionModifier) {
      return event.browserEvent.altKey;
    }
    return isSelectionSingleChangeEvent(event);
  }
  isSelectionRangeChangeEvent(event) {
    return isSelectionRangeChangeEvent(event);
  }
};

function toWorkbenchListOptions(accessor, options3) {
  const configurationService = accessor.get(IConfigurationService);
  const keybindingService = accessor.get(IKeybindingService);
  const disposables = new DisposableStore();
  const result = {
    ...options3,
    keyboardNavigationDelegate: { mightProducePrintableCharacter(e) {
      return keybindingService.mightProducePrintableCharacter(e);
    } },
    smoothScrolling: Boolean(configurationService.getValue(listSmoothScrolling)),
    mouseWheelScrollSensitivity: configurationService.getValue(mouseWheelScrollSensitivityKey),
    fastScrollSensitivity: configurationService.getValue(fastScrollSensitivityKey),
    multipleSelectionController: options3.multipleSelectionController ?? disposables.add(new MultipleSelectionController(configurationService)),
    keyboardNavigationEventFilter: createKeyboardNavigationEventFilter(keybindingService),
    scrollByPage: Boolean(configurationService.getValue(scrollByPageKey))
  };
  return [result, disposables];
}

var WorkbenchList = class extends List {
  get onDidOpen() {
    return this.navigator.onDidOpen;
  }
  constructor(user, container3, delegate, renderers, options3, contextKeyService, listService, configurationService, instantiationService) {
    const horizontalScrolling = typeof options3.horizontalScrolling !== "undefined" ? options3.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
    const [workbenchListOptions, workbenchListOptionsDisposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options3);
    super(
      user,
      container3,
      delegate,
      renderers,
      {
        keyboardSupport: false,
        ...workbenchListOptions,
        horizontalScrolling
      }
    );
    this.disposables.add(workbenchListOptionsDisposable);
    this.contextKeyService = createScopedContextKeyService(contextKeyService, this);
    this.disposables.add(createScrollObserver(this.contextKeyService, this));
    this.listSupportsMultiSelect = WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
    this.listSupportsMultiSelect.set(options3.multipleSelectionSupport !== false);
    const listSelectionNavigation = WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
    listSelectionNavigation.set(Boolean(options3.selectionNavigation));
    this.listHasSelectionOrFocus = WorkbenchListHasSelectionOrFocus.bindTo(this.contextKeyService);
    this.listDoubleSelection = WorkbenchListDoubleSelection.bindTo(this.contextKeyService);
    this.listMultiSelection = WorkbenchListMultiSelection.bindTo(this.contextKeyService);
    this.horizontalScrolling = options3.horizontalScrolling;
    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
    this.disposables.add(this.contextKeyService);
    this.disposables.add(listService.register(this));
    this.updateStyles(options3.overrideStyles);
    this.disposables.add(this.onDidChangeSelection(() => {
      const selection = this.getSelection();
      const focus = this.getFocus();
      this.contextKeyService.bufferChangeEvents(() => {
        this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
        this.listMultiSelection.set(selection.length > 1);
        this.listDoubleSelection.set(selection.length === 2);
      });
    }));
    this.disposables.add(this.onDidChangeFocus(() => {
      const selection = this.getSelection();
      const focus = this.getFocus();
      this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
    }));
    this.disposables.add(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
        this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
      }
      let options4 = {};
      if (e.affectsConfiguration(horizontalScrollingKey) && this.horizontalScrolling === void 0) {
        const horizontalScrolling2 = Boolean(configurationService.getValue(horizontalScrollingKey));
        options4 = { ...options4, horizontalScrolling: horizontalScrolling2 };
      }
      if (e.affectsConfiguration(scrollByPageKey)) {
        const scrollByPage = Boolean(configurationService.getValue(scrollByPageKey));
        options4 = { ...options4, scrollByPage };
      }
      if (e.affectsConfiguration(listSmoothScrolling)) {
        const smoothScrolling = Boolean(configurationService.getValue(listSmoothScrolling));
        options4 = { ...options4, smoothScrolling };
      }
      if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
        const mouseWheelScrollSensitivity = configurationService.getValue(mouseWheelScrollSensitivityKey);
        options4 = { ...options4, mouseWheelScrollSensitivity };
      }
      if (e.affectsConfiguration(fastScrollSensitivityKey)) {
        const fastScrollSensitivity = configurationService.getValue(fastScrollSensitivityKey);
        options4 = { ...options4, fastScrollSensitivity };
      }
      if (Object.keys(options4).length > 0) {
        this.updateOptions(options4);
      }
    }));
    this.navigator = new ListResourceNavigator(this, { configurationService, ...options3 });
    this.disposables.add(this.navigator);
  }
  updateOptions(options3) {
    super.updateOptions(options3);
    if (options3.overrideStyles !== void 0) {
      this.updateStyles(options3.overrideStyles);
    }
    if (options3.multipleSelectionSupport !== void 0) {
      this.listSupportsMultiSelect.set(!!options3.multipleSelectionSupport);
    }
  }
  updateStyles(styles) {
    this.style(styles ? getListStyles(styles) : defaultListStyles);
  }
  get useAltAsMultipleSelectionModifier() {
    return this._useAltAsMultipleSelectionModifier;
  }
};

WorkbenchList = __decorateClass([
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IListService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IInstantiationService)
], WorkbenchList);

var WorkbenchPagedList = class extends PagedList {
  get onDidOpen() {
    return this.navigator.onDidOpen;
  }
  constructor(user, container3, delegate, renderers, options3, contextKeyService, listService, configurationService, instantiationService) {
    const horizontalScrolling = typeof options3.horizontalScrolling !== "undefined" ? options3.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
    const [workbenchListOptions, workbenchListOptionsDisposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options3);
    super(
      user,
      container3,
      delegate,
      renderers,
      {
        keyboardSupport: false,
        ...workbenchListOptions,
        horizontalScrolling
      }
    );
    this.disposables = new DisposableStore();
    this.disposables.add(workbenchListOptionsDisposable);
    this.contextKeyService = createScopedContextKeyService(contextKeyService, this);
    this.disposables.add(createScrollObserver(this.contextKeyService, this.widget));
    this.horizontalScrolling = options3.horizontalScrolling;
    this.listSupportsMultiSelect = WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
    this.listSupportsMultiSelect.set(options3.multipleSelectionSupport !== false);
    const listSelectionNavigation = WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
    listSelectionNavigation.set(Boolean(options3.selectionNavigation));
    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
    this.disposables.add(this.contextKeyService);
    this.disposables.add(listService.register(this));
    this.updateStyles(options3.overrideStyles);
    this.disposables.add(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
        this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
      }
      let options4 = {};
      if (e.affectsConfiguration(horizontalScrollingKey) && this.horizontalScrolling === void 0) {
        const horizontalScrolling2 = Boolean(configurationService.getValue(horizontalScrollingKey));
        options4 = { ...options4, horizontalScrolling: horizontalScrolling2 };
      }
      if (e.affectsConfiguration(scrollByPageKey)) {
        const scrollByPage = Boolean(configurationService.getValue(scrollByPageKey));
        options4 = { ...options4, scrollByPage };
      }
      if (e.affectsConfiguration(listSmoothScrolling)) {
        const smoothScrolling = Boolean(configurationService.getValue(listSmoothScrolling));
        options4 = { ...options4, smoothScrolling };
      }
      if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
        const mouseWheelScrollSensitivity = configurationService.getValue(mouseWheelScrollSensitivityKey);
        options4 = { ...options4, mouseWheelScrollSensitivity };
      }
      if (e.affectsConfiguration(fastScrollSensitivityKey)) {
        const fastScrollSensitivity = configurationService.getValue(fastScrollSensitivityKey);
        options4 = { ...options4, fastScrollSensitivity };
      }
      if (Object.keys(options4).length > 0) {
        this.updateOptions(options4);
      }
    }));
    this.navigator = new ListResourceNavigator(this, { configurationService, ...options3 });
    this.disposables.add(this.navigator);
  }
  updateOptions(options3) {
    super.updateOptions(options3);
    if (options3.overrideStyles !== void 0) {
      this.updateStyles(options3.overrideStyles);
    }
    if (options3.multipleSelectionSupport !== void 0) {
      this.listSupportsMultiSelect.set(!!options3.multipleSelectionSupport);
    }
  }
  updateStyles(styles) {
    this.style(styles ? getListStyles(styles) : defaultListStyles);
  }
  get useAltAsMultipleSelectionModifier() {
    return this._useAltAsMultipleSelectionModifier;
  }
  dispose() {
    this.disposables.dispose();
    super.dispose();
  }
};

WorkbenchPagedList = __decorateClass([
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IListService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IInstantiationService)
], WorkbenchPagedList);

var WorkbenchTable = class extends Table {
  get onDidOpen() {
    return this.navigator.onDidOpen;
  }
  constructor(user, container3, delegate, columns, renderers, options3, contextKeyService, listService, configurationService, instantiationService) {
    const horizontalScrolling = typeof options3.horizontalScrolling !== "undefined" ? options3.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
    const [workbenchListOptions, workbenchListOptionsDisposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options3);
    super(
      user,
      container3,
      delegate,
      columns,
      renderers,
      {
        keyboardSupport: false,
        ...workbenchListOptions,
        horizontalScrolling
      }
    );
    this.disposables.add(workbenchListOptionsDisposable);
    this.contextKeyService = createScopedContextKeyService(contextKeyService, this);
    this.disposables.add(createScrollObserver(this.contextKeyService, this));
    this.listSupportsMultiSelect = WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
    this.listSupportsMultiSelect.set(options3.multipleSelectionSupport !== false);
    const listSelectionNavigation = WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
    listSelectionNavigation.set(Boolean(options3.selectionNavigation));
    this.listHasSelectionOrFocus = WorkbenchListHasSelectionOrFocus.bindTo(this.contextKeyService);
    this.listDoubleSelection = WorkbenchListDoubleSelection.bindTo(this.contextKeyService);
    this.listMultiSelection = WorkbenchListMultiSelection.bindTo(this.contextKeyService);
    this.horizontalScrolling = options3.horizontalScrolling;
    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
    this.disposables.add(this.contextKeyService);
    this.disposables.add(listService.register(this));
    this.updateStyles(options3.overrideStyles);
    this.disposables.add(this.onDidChangeSelection(() => {
      const selection = this.getSelection();
      const focus = this.getFocus();
      this.contextKeyService.bufferChangeEvents(() => {
        this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
        this.listMultiSelection.set(selection.length > 1);
        this.listDoubleSelection.set(selection.length === 2);
      });
    }));
    this.disposables.add(this.onDidChangeFocus(() => {
      const selection = this.getSelection();
      const focus = this.getFocus();
      this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
    }));
    this.disposables.add(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
        this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
      }
      let options4 = {};
      if (e.affectsConfiguration(horizontalScrollingKey) && this.horizontalScrolling === void 0) {
        const horizontalScrolling2 = Boolean(configurationService.getValue(horizontalScrollingKey));
        options4 = { ...options4, horizontalScrolling: horizontalScrolling2 };
      }
      if (e.affectsConfiguration(scrollByPageKey)) {
        const scrollByPage = Boolean(configurationService.getValue(scrollByPageKey));
        options4 = { ...options4, scrollByPage };
      }
      if (e.affectsConfiguration(listSmoothScrolling)) {
        const smoothScrolling = Boolean(configurationService.getValue(listSmoothScrolling));
        options4 = { ...options4, smoothScrolling };
      }
      if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
        const mouseWheelScrollSensitivity = configurationService.getValue(mouseWheelScrollSensitivityKey);
        options4 = { ...options4, mouseWheelScrollSensitivity };
      }
      if (e.affectsConfiguration(fastScrollSensitivityKey)) {
        const fastScrollSensitivity = configurationService.getValue(fastScrollSensitivityKey);
        options4 = { ...options4, fastScrollSensitivity };
      }
      if (Object.keys(options4).length > 0) {
        this.updateOptions(options4);
      }
    }));
    this.navigator = new TableResourceNavigator(this, { configurationService, ...options3 });
    this.disposables.add(this.navigator);
  }
  updateOptions(options3) {
    super.updateOptions(options3);
    if (options3.overrideStyles !== void 0) {
      this.updateStyles(options3.overrideStyles);
    }
    if (options3.multipleSelectionSupport !== void 0) {
      this.listSupportsMultiSelect.set(!!options3.multipleSelectionSupport);
    }
  }
  updateStyles(styles) {
    this.style(styles ? getListStyles(styles) : defaultListStyles);
  }
  get useAltAsMultipleSelectionModifier() {
    return this._useAltAsMultipleSelectionModifier;
  }
  dispose() {
    this.disposables.dispose();
    super.dispose();
  }
};

WorkbenchTable = __decorateClass([
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IListService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IInstantiationService)
], WorkbenchTable);

function getSelectionKeyboardEvent(typeArg = "keydown", preserveFocus, pinned) {
  const e = new KeyboardEvent(typeArg);
  e.preserveFocus = preserveFocus;
  e.pinned = pinned;
  e.__forceEvent = true;
  return e;
}

var ResourceNavigator = class extends Disposable {
  constructor(widget, options3) {
    super();
    this.widget = widget;
    this._onDidOpen = this._register(new Emitter());
    this.onDidOpen = this._onDidOpen.event;
    this._register(Event2.filter(this.widget.onDidChangeSelection, (e) => isKeyboardEvent(e.browserEvent))((e) => this.onSelectionFromKeyboard(e)));
    this._register(this.widget.onPointer((e) => this.onPointer(e.element, e.browserEvent)));
    this._register(this.widget.onMouseDblClick((e) => this.onMouseDblClick(e.element, e.browserEvent)));
    if (typeof options3?.openOnSingleClick !== "boolean" && options3?.configurationService) {
      this.openOnSingleClick = options3?.configurationService.getValue(openModeSettingKey) !== "doubleClick";
      this._register(options3?.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(openModeSettingKey)) {
          this.openOnSingleClick = options3?.configurationService.getValue(openModeSettingKey) !== "doubleClick";
        }
      }));
    } else {
      this.openOnSingleClick = options3?.openOnSingleClick ?? true;
    }
  }
  onSelectionFromKeyboard(event) {
    if (event.elements.length !== 1) {
      return;
    }
    const selectionKeyboardEvent = event.browserEvent;
    const preserveFocus = typeof selectionKeyboardEvent.preserveFocus === "boolean" ? selectionKeyboardEvent.preserveFocus : true;
    const pinned = typeof selectionKeyboardEvent.pinned === "boolean" ? selectionKeyboardEvent.pinned : !preserveFocus;
    const sideBySide = false;
    this._open(this.getSelectedElement(), preserveFocus, pinned, sideBySide, event.browserEvent);
  }
  onPointer(element, browserEvent) {
    if (!this.openOnSingleClick) {
      return;
    }
    const isDoubleClick = browserEvent.detail === 2;
    if (isDoubleClick) {
      return;
    }
    const isMiddleClick = browserEvent.button === 1;
    const preserveFocus = true;
    const pinned = isMiddleClick;
    const sideBySide = browserEvent.ctrlKey || browserEvent.metaKey || browserEvent.altKey;
    this._open(element, preserveFocus, pinned, sideBySide, browserEvent);
  }
  onMouseDblClick(element, browserEvent) {
    if (!browserEvent) {
      return;
    }
    const target = browserEvent.target;
    const onTwistie = target.classList.contains("monaco-tl-twistie") || target.classList.contains("monaco-icon-label") && target.classList.contains("folder-icon") && browserEvent.offsetX < 16;
    if (onTwistie) {
      return;
    }
    const preserveFocus = false;
    const pinned = true;
    const sideBySide = browserEvent.ctrlKey || browserEvent.metaKey || browserEvent.altKey;
    this._open(element, preserveFocus, pinned, sideBySide, browserEvent);
  }
  _open(element, preserveFocus, pinned, sideBySide, browserEvent) {
    if (!element) {
      return;
    }
    this._onDidOpen.fire({
      editorOptions: {
        preserveFocus,
        pinned,
        revealIfVisible: true
      },
      sideBySide,
      element,
      browserEvent
    });
  }
};

var ListResourceNavigator = class extends ResourceNavigator {
  constructor(widget, options3) {
    super(widget, options3);
    this.widget = widget;
  }
  getSelectedElement() {
    return this.widget.getSelectedElements()[0];
  }
};

var TableResourceNavigator = class extends ResourceNavigator {
  constructor(widget, options3) {
    super(widget, options3);
  }
  getSelectedElement() {
    return this.widget.getSelectedElements()[0];
  }
};

var TreeResourceNavigator = class extends ResourceNavigator {
  constructor(widget, options3) {
    super(widget, options3);
  }
  getSelectedElement() {
    return this.widget.getSelection()[0] ?? void 0;
  }
};

function createKeyboardNavigationEventFilter(keybindingService) {
  let inMultiChord = false;
  return (event) => {
    if (event.toKeyCodeChord().isModifierKey()) {
      return false;
    }
    if (inMultiChord) {
      inMultiChord = false;
      return false;
    }
    const result = keybindingService.softDispatch(event, event.target);
    if (result.kind === 1 /* MoreChordsNeeded */) {
      inMultiChord = true;
      return false;
    }
    inMultiChord = false;
    return result.kind === 0 /* NoMatchingKb */;
  };
}

var WorkbenchObjectTree = class extends ObjectTree {
  get contextKeyService() {
    return this.internals.contextKeyService;
  }
  get useAltAsMultipleSelectionModifier() {
    return this.internals.useAltAsMultipleSelectionModifier;
  }
  get onDidOpen() {
    return this.internals.onDidOpen;
  }
  constructor(user, container3, delegate, renderers, options3, instantiationService, contextKeyService, listService, configurationService) {
    const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options3);
    super(user, container3, delegate, renderers, treeOptions);
    this.disposables.add(disposable);
    this.internals = new WorkbenchTreeInternals(this, options3, getTypeNavigationMode, options3.overrideStyles, contextKeyService, listService, configurationService);
    this.disposables.add(this.internals);
  }
  updateOptions(options3 = {}) {
    super.updateOptions(options3);
    if (options3.overrideStyles) {
      this.internals.updateStyleOverrides(options3.overrideStyles);
    }
    this.internals.updateOptions(options3);
  }
};

WorkbenchObjectTree = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IListService),
  __decorateParam(8, IConfigurationService)
], WorkbenchObjectTree);

var WorkbenchCompressibleObjectTree = class extends CompressibleObjectTree {
  get contextKeyService() {
    return this.internals.contextKeyService;
  }
  get useAltAsMultipleSelectionModifier() {
    return this.internals.useAltAsMultipleSelectionModifier;
  }
  get onDidOpen() {
    return this.internals.onDidOpen;
  }
  constructor(user, container3, delegate, renderers, options3, instantiationService, contextKeyService, listService, configurationService) {
    const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options3);
    super(user, container3, delegate, renderers, treeOptions);
    this.disposables.add(disposable);
    this.internals = new WorkbenchTreeInternals(this, options3, getTypeNavigationMode, options3.overrideStyles, contextKeyService, listService, configurationService);
    this.disposables.add(this.internals);
  }
  updateOptions(options3 = {}) {
    super.updateOptions(options3);
    if (options3.overrideStyles) {
      this.internals.updateStyleOverrides(options3.overrideStyles);
    }
    this.internals.updateOptions(options3);
  }
};

WorkbenchCompressibleObjectTree = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IListService),
  __decorateParam(8, IConfigurationService)
], WorkbenchCompressibleObjectTree);

var WorkbenchDataTree = class extends DataTree {
  get contextKeyService() {
    return this.internals.contextKeyService;
  }
  get useAltAsMultipleSelectionModifier() {
    return this.internals.useAltAsMultipleSelectionModifier;
  }
  get onDidOpen() {
    return this.internals.onDidOpen;
  }
  constructor(user, container3, delegate, renderers, dataSource, options3, instantiationService, contextKeyService, listService, configurationService) {
    const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options3);
    super(user, container3, delegate, renderers, dataSource, treeOptions);
    this.disposables.add(disposable);
    this.internals = new WorkbenchTreeInternals(this, options3, getTypeNavigationMode, options3.overrideStyles, contextKeyService, listService, configurationService);
    this.disposables.add(this.internals);
  }
  updateOptions(options3 = {}) {
    super.updateOptions(options3);
    if (options3.overrideStyles !== void 0) {
      this.internals.updateStyleOverrides(options3.overrideStyles);
    }
    this.internals.updateOptions(options3);
  }
};

WorkbenchDataTree = __decorateClass([
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IListService),
  __decorateParam(9, IConfigurationService)
], WorkbenchDataTree);

var WorkbenchAsyncDataTree = class extends AsyncDataTree {
  get contextKeyService() {
    return this.internals.contextKeyService;
  }
  get useAltAsMultipleSelectionModifier() {
    return this.internals.useAltAsMultipleSelectionModifier;
  }
  get onDidOpen() {
    return this.internals.onDidOpen;
  }
  constructor(user, container3, delegate, renderers, dataSource, options3, instantiationService, contextKeyService, listService, configurationService) {
    const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options3);
    super(user, container3, delegate, renderers, dataSource, treeOptions);
    this.disposables.add(disposable);
    this.internals = new WorkbenchTreeInternals(this, options3, getTypeNavigationMode, options3.overrideStyles, contextKeyService, listService, configurationService);
    this.disposables.add(this.internals);
  }
  updateOptions(options3 = {}) {
    super.updateOptions(options3);
    if (options3.overrideStyles) {
      this.internals.updateStyleOverrides(options3.overrideStyles);
    }
    this.internals.updateOptions(options3);
  }
};

WorkbenchAsyncDataTree = __decorateClass([
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IListService),
  __decorateParam(9, IConfigurationService)
], WorkbenchAsyncDataTree);

var WorkbenchCompressibleAsyncDataTree = class extends CompressibleAsyncDataTree {
  get contextKeyService() {
    return this.internals.contextKeyService;
  }
  get useAltAsMultipleSelectionModifier() {
    return this.internals.useAltAsMultipleSelectionModifier;
  }
  get onDidOpen() {
    return this.internals.onDidOpen;
  }
  constructor(user, container3, virtualDelegate, compressionDelegate, renderers, dataSource, options3, instantiationService, contextKeyService, listService, configurationService) {
    const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options3);
    super(user, container3, virtualDelegate, compressionDelegate, renderers, dataSource, treeOptions);
    this.disposables.add(disposable);
    this.internals = new WorkbenchTreeInternals(this, options3, getTypeNavigationMode, options3.overrideStyles, contextKeyService, listService, configurationService);
    this.disposables.add(this.internals);
  }
  updateOptions(options3) {
    super.updateOptions(options3);
    this.internals.updateOptions(options3);
  }
};

WorkbenchCompressibleAsyncDataTree = __decorateClass([
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IListService),
  __decorateParam(10, IConfigurationService)
], WorkbenchCompressibleAsyncDataTree);

function getDefaultTreeFindMode(configurationService) {
  const value2 = configurationService.getValue(defaultFindModeSettingKey);
  if (value2 === "highlight") {
    return 0 /* Highlight */;
  } else if (value2 === "filter") {
    return 1 /* Filter */;
  }
  const deprecatedValue = configurationService.getValue(keyboardNavigationSettingKey);
  if (deprecatedValue === "simple" || deprecatedValue === "highlight") {
    return 0 /* Highlight */;
  } else if (deprecatedValue === "filter") {
    return 1 /* Filter */;
  }
  return void 0;
}

function getDefaultTreeFindMatchType(configurationService) {
  const value2 = configurationService.getValue(defaultFindMatchTypeSettingKey);
  if (value2 === "fuzzy") {
    return 0 /* Fuzzy */;
  } else if (value2 === "contiguous") {
    return 1 /* Contiguous */;
  }
  return void 0;
}

function workbenchTreeDataPreamble(accessor, options3) {
  const configurationService = accessor.get(IConfigurationService);
  const contextViewService = accessor.get(IContextViewService);
  const contextKeyService = accessor.get(IContextKeyService);
  const instantiationService = accessor.get(IInstantiationService);
  const getTypeNavigationMode = () => {
    const modeString = contextKeyService.getContextKeyValue(WorkbenchListTypeNavigationModeKey);
    if (modeString === "automatic") {
      return 0 /* Automatic */;
    } else if (modeString === "trigger") {
      return 1 /* Trigger */;
    }
    const modeBoolean = contextKeyService.getContextKeyValue(WorkbenchListAutomaticKeyboardNavigationLegacyKey);
    if (modeBoolean === false) {
      return 1 /* Trigger */;
    }
    const configString = configurationService.getValue(typeNavigationModeSettingKey);
    if (configString === "automatic") {
      return 0 /* Automatic */;
    } else if (configString === "trigger") {
      return 1 /* Trigger */;
    }
    return void 0;
  };
  const horizontalScrolling = options3.horizontalScrolling !== void 0 ? options3.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
  const [workbenchListOptions, disposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options3);
  const paddingBottom = options3.paddingBottom;
  const renderIndentGuides = options3.renderIndentGuides !== void 0 ? options3.renderIndentGuides : configurationService.getValue(treeRenderIndentGuidesKey);
  return {
    getTypeNavigationMode,
    disposable,
    // eslint-disable-next-line local/code-no-dangerous-type-assertions
    options: {
      // ...options, // TODO@Joao why is this not splatted here?
      keyboardSupport: false,
      ...workbenchListOptions,
      indent: typeof configurationService.getValue(treeIndentKey) === "number" ? configurationService.getValue(treeIndentKey) : void 0,
      renderIndentGuides,
      smoothScrolling: Boolean(configurationService.getValue(listSmoothScrolling)),
      defaultFindMode: options3.defaultFindMode ?? getDefaultTreeFindMode(configurationService),
      defaultFindMatchType: options3.defaultFindMatchType ?? getDefaultTreeFindMatchType(configurationService),
      horizontalScrolling,
      scrollByPage: Boolean(configurationService.getValue(scrollByPageKey)),
      paddingBottom,
      hideTwistiesOfChildlessElements: options3.hideTwistiesOfChildlessElements,
      expandOnlyOnTwistieClick: options3.expandOnlyOnTwistieClick ?? configurationService.getValue(treeExpandMode) === "doubleClick",
      contextViewProvider: contextViewService,
      findWidgetStyles: defaultFindWidgetStyles,
      enableStickyScroll: options3.enableStickyScroll ?? Boolean(configurationService.getValue(treeStickyScroll)),
      stickyScrollMaxItemCount: options3.stickyScrollMaxItemCount ?? Number(configurationService.getValue(treeStickyScrollMaxElements))
    }
  };
}

var WorkbenchTreeInternals = class {
  constructor(tree, options3, getTypeNavigationMode, overrideStyles2, contextKeyService, listService, configurationService) {
    this.tree = tree;
    this.disposables = [];
    this.contextKeyService = createScopedContextKeyService(contextKeyService, tree);
    this.disposables.push(createScrollObserver(this.contextKeyService, tree));
    this.listSupportsMultiSelect = WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
    this.listSupportsMultiSelect.set(options3.multipleSelectionSupport !== false);
    const listSelectionNavigation = WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
    listSelectionNavigation.set(Boolean(options3.selectionNavigation));
    this.listSupportFindWidget = WorkbenchListSupportsFind.bindTo(this.contextKeyService);
    this.listSupportFindWidget.set(options3.findWidgetEnabled ?? true);
    this.hasSelectionOrFocus = WorkbenchListHasSelectionOrFocus.bindTo(this.contextKeyService);
    this.hasDoubleSelection = WorkbenchListDoubleSelection.bindTo(this.contextKeyService);
    this.hasMultiSelection = WorkbenchListMultiSelection.bindTo(this.contextKeyService);
    this.treeElementCanCollapse = WorkbenchTreeElementCanCollapse.bindTo(this.contextKeyService);
    this.treeElementHasParent = WorkbenchTreeElementHasParent.bindTo(this.contextKeyService);
    this.treeElementCanExpand = WorkbenchTreeElementCanExpand.bindTo(this.contextKeyService);
    this.treeElementHasChild = WorkbenchTreeElementHasChild.bindTo(this.contextKeyService);
    this.treeFindOpen = WorkbenchTreeFindOpen.bindTo(this.contextKeyService);
    this.treeStickyScrollFocused = WorkbenchTreeStickyScrollFocused.bindTo(this.contextKeyService);
    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
    this.updateStyleOverrides(overrideStyles2);
    const updateCollapseContextKeys = () => {
      const focus = tree.getFocus()[0];
      if (!focus) {
        return;
      }
      const node = tree.getNode(focus);
      this.treeElementCanCollapse.set(node.collapsible && !node.collapsed);
      this.treeElementHasParent.set(!!tree.getParentElement(focus));
      this.treeElementCanExpand.set(node.collapsible && node.collapsed);
      this.treeElementHasChild.set(!!tree.getFirstElementChild(focus));
    };
    const interestingContextKeys = /* @__PURE__ */ new Set();
    interestingContextKeys.add(WorkbenchListTypeNavigationModeKey);
    interestingContextKeys.add(WorkbenchListAutomaticKeyboardNavigationLegacyKey);
    this.disposables.push(
      this.contextKeyService,
      listService.register(tree),
      tree.onDidChangeSelection(() => {
        const selection = tree.getSelection();
        const focus = tree.getFocus();
        this.contextKeyService.bufferChangeEvents(() => {
          this.hasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
          this.hasMultiSelection.set(selection.length > 1);
          this.hasDoubleSelection.set(selection.length === 2);
        });
      }),
      tree.onDidChangeFocus(() => {
        const selection = tree.getSelection();
        const focus = tree.getFocus();
        this.hasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
        updateCollapseContextKeys();
      }),
      tree.onDidChangeCollapseState(updateCollapseContextKeys),
      tree.onDidChangeModel(updateCollapseContextKeys),
      tree.onDidChangeFindOpenState((enabled) => this.treeFindOpen.set(enabled)),
      tree.onDidChangeStickyScrollFocused((focused) => this.treeStickyScrollFocused.set(focused)),
      configurationService.onDidChangeConfiguration((e) => {
        let newOptions = {};
        if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
          this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
        }
        if (e.affectsConfiguration(treeIndentKey)) {
          const indent = configurationService.getValue(treeIndentKey);
          newOptions = { ...newOptions, indent };
        }
        if (e.affectsConfiguration(treeRenderIndentGuidesKey) && options3.renderIndentGuides === void 0) {
          const renderIndentGuides = configurationService.getValue(treeRenderIndentGuidesKey);
          newOptions = { ...newOptions, renderIndentGuides };
        }
        if (e.affectsConfiguration(listSmoothScrolling)) {
          const smoothScrolling = Boolean(configurationService.getValue(listSmoothScrolling));
          newOptions = { ...newOptions, smoothScrolling };
        }
        if (e.affectsConfiguration(defaultFindModeSettingKey) || e.affectsConfiguration(keyboardNavigationSettingKey)) {
          const defaultFindMode = getDefaultTreeFindMode(configurationService);
          newOptions = { ...newOptions, defaultFindMode };
        }
        if (e.affectsConfiguration(typeNavigationModeSettingKey) || e.affectsConfiguration(keyboardNavigationSettingKey)) {
          const typeNavigationMode = getTypeNavigationMode();
          newOptions = { ...newOptions, typeNavigationMode };
        }
        if (e.affectsConfiguration(defaultFindMatchTypeSettingKey)) {
          const defaultFindMatchType = getDefaultTreeFindMatchType(configurationService);
          newOptions = { ...newOptions, defaultFindMatchType };
        }
        if (e.affectsConfiguration(horizontalScrollingKey) && options3.horizontalScrolling === void 0) {
          const horizontalScrolling = Boolean(configurationService.getValue(horizontalScrollingKey));
          newOptions = { ...newOptions, horizontalScrolling };
        }
        if (e.affectsConfiguration(scrollByPageKey)) {
          const scrollByPage = Boolean(configurationService.getValue(scrollByPageKey));
          newOptions = { ...newOptions, scrollByPage };
        }
        if (e.affectsConfiguration(treeExpandMode) && options3.expandOnlyOnTwistieClick === void 0) {
          newOptions = { ...newOptions, expandOnlyOnTwistieClick: configurationService.getValue(treeExpandMode) === "doubleClick" };
        }
        if (e.affectsConfiguration(treeStickyScroll) && options3.enableStickyScroll === void 0) {
          const enableStickyScroll = configurationService.getValue(treeStickyScroll);
          newOptions = { ...newOptions, enableStickyScroll };
        }
        if (e.affectsConfiguration(treeStickyScrollMaxElements) && options3.stickyScrollMaxItemCount === void 0) {
          const stickyScrollMaxItemCount = Math.max(1, configurationService.getValue(treeStickyScrollMaxElements));
          newOptions = { ...newOptions, stickyScrollMaxItemCount };
        }
        if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
          const mouseWheelScrollSensitivity = configurationService.getValue(mouseWheelScrollSensitivityKey);
          newOptions = { ...newOptions, mouseWheelScrollSensitivity };
        }
        if (e.affectsConfiguration(fastScrollSensitivityKey)) {
          const fastScrollSensitivity = configurationService.getValue(fastScrollSensitivityKey);
          newOptions = { ...newOptions, fastScrollSensitivity };
        }
        if (Object.keys(newOptions).length > 0) {
          tree.updateOptions(newOptions);
        }
      }),
      this.contextKeyService.onDidChangeContext((e) => {
        if (e.affectsSome(interestingContextKeys)) {
          tree.updateOptions({ typeNavigationMode: getTypeNavigationMode() });
        }
      })
    );
    this.navigator = new TreeResourceNavigator(tree, { configurationService, ...options3 });
    this.disposables.push(this.navigator);
  }
  get onDidOpen() {
    return this.navigator.onDidOpen;
  }
  get useAltAsMultipleSelectionModifier() {
    return this._useAltAsMultipleSelectionModifier;
  }
  updateOptions(options3) {
    if (options3.multipleSelectionSupport !== void 0) {
      this.listSupportsMultiSelect.set(!!options3.multipleSelectionSupport);
    }
  }
  updateStyleOverrides(overrideStyles2) {
    this.tree.style(overrideStyles2 ? getListStyles(overrideStyles2) : defaultListStyles);
  }
  dispose() {
    this.disposables = dispose(this.disposables);
  }
};

WorkbenchTreeInternals = __decorateClass([
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IListService),
  __decorateParam(6, IConfigurationService)
], WorkbenchTreeInternals);

var configurationRegistry3 = Registry.as(Extensions4.Configuration);

configurationRegistry3.registerConfiguration({
  id: "workbench",
  order: 7,
  title: localize(3098, null),
  type: "object",
  properties: {
    [multiSelectModifierSettingKey]: {
      type: "string",
      enum: ["ctrlCmd", "alt"],
      markdownEnumDescriptions: [
        localize(3091, null),
        localize(3090, null)
      ],
      default: "ctrlCmd",
      description: localize(3089, null)
    },
    [openModeSettingKey]: {
      type: "string",
      enum: ["singleClick", "doubleClick"],
      default: "singleClick",
      description: localize(3092, null)
    },
    [horizontalScrollingKey]: {
      type: "boolean",
      default: false,
      description: localize(3080, null)
    },
    [scrollByPageKey]: {
      type: "boolean",
      default: false,
      description: localize(3087, null)
    },
    [treeIndentKey]: {
      type: "number",
      default: 8,
      minimum: 4,
      maximum: 40,
      description: localize(3096, null)
    },
    [treeRenderIndentGuidesKey]: {
      type: "string",
      enum: ["none", "onHover", "always"],
      default: "onHover",
      description: localize(3093, null)
    },
    [listSmoothScrolling]: {
      type: "boolean",
      default: false,
      description: localize(3086, null)
    },
    [mouseWheelScrollSensitivityKey]: {
      type: "number",
      default: 1,
      markdownDescription: localize(3088, null)
    },
    [fastScrollSensitivityKey]: {
      type: "number",
      default: 5,
      markdownDescription: localize(3079, null)
    },
    [defaultFindModeSettingKey]: {
      type: "string",
      enum: ["highlight", "filter"],
      enumDescriptions: [
        localize(3077, null),
        localize(3076, null)
      ],
      default: "highlight",
      description: localize(3075, null)
    },
    [keyboardNavigationSettingKey]: {
      type: "string",
      enum: ["simple", "highlight", "filter"],
      enumDescriptions: [
        localize(3084, null),
        localize(3083, null),
        localize(3082, null)
      ],
      default: "highlight",
      description: localize(3081, null),
      deprecated: true,
      deprecationMessage: localize(3085, null)
    },
    [defaultFindMatchTypeSettingKey]: {
      type: "string",
      enum: ["fuzzy", "contiguous"],
      enumDescriptions: [
        localize(3074, null),
        localize(3073, null)
      ],
      default: "fuzzy",
      description: localize(3072, null)
    },
    [treeExpandMode]: {
      type: "string",
      enum: ["singleClick", "doubleClick"],
      default: "singleClick",
      description: localize(3078, null)
    },
    [treeStickyScroll]: {
      type: "boolean",
      default: true,
      description: localize(3094, null)
    },
    [treeStickyScrollMaxElements]: {
      type: "number",
      minimum: 1,
      default: 7,
      markdownDescription: localize(3095, null, "`#workbench.tree.enableStickyScroll#`")
    },
    [typeNavigationModeSettingKey]: {
      type: "string",
      enum: ["automatic", "trigger"],
      default: "automatic",
      markdownDescription: localize(3097, null)
    }
  }
});
export { createScopedContextKeyService, createScrollObserver, useAltAsMultipleSelectionModifier, toWorkbenchListOptions, getSelectionKeyboardEvent, createKeyboardNavigationEventFilter, getDefaultTreeFindMode, getDefaultTreeFindMatchType, workbenchTreeDataPreamble, IListService, ListService, RawWorkbenchListScrollAtBoundaryContextKey, WorkbenchListScrollAtTopContextKey, WorkbenchListScrollAtBottomContextKey, RawWorkbenchListFocusContextKey, WorkbenchTreeStickyScrollFocused, WorkbenchListSupportsMultiSelectContextKey, WorkbenchListFocusContextKey, WorkbenchListHasSelectionOrFocus, WorkbenchListDoubleSelection, WorkbenchListMultiSelection, WorkbenchListSelectionNavigation, WorkbenchListSupportsFind, WorkbenchTreeElementCanCollapse, WorkbenchTreeElementHasParent, WorkbenchTreeElementCanExpand, WorkbenchTreeElementHasChild, WorkbenchTreeFindOpen, WorkbenchListTypeNavigationModeKey, WorkbenchListAutomaticKeyboardNavigationLegacyKey, multiSelectModifierSettingKey, openModeSettingKey, horizontalScrollingKey, defaultFindModeSettingKey, typeNavigationModeSettingKey, keyboardNavigationSettingKey, scrollByPageKey, defaultFindMatchTypeSettingKey, treeIndentKey, treeRenderIndentGuidesKey, listSmoothScrolling, mouseWheelScrollSensitivityKey, fastScrollSensitivityKey, treeExpandMode, treeStickyScroll, treeStickyScrollMaxElements, MultipleSelectionController, WorkbenchList, WorkbenchPagedList, WorkbenchTable, ResourceNavigator, ListResourceNavigator, TableResourceNavigator, TreeResourceNavigator, WorkbenchObjectTree, WorkbenchCompressibleObjectTree, WorkbenchDataTree, WorkbenchAsyncDataTree, WorkbenchCompressibleAsyncDataTree, WorkbenchTreeInternals, configurationRegistry3 };
