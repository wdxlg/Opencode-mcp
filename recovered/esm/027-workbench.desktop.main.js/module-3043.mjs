// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/testCoverageView.ts
import { ViewAction, ViewPane } from "./module-1335.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { autorun } from "./module-0052.mjs";
import { ResourceLabels } from "./module-1323.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ITestCoverageService } from "./module-3024.mjs";
import { IStorageService } from "./module-0512.mjs";
import { Range2 } from "./module-0106.mjs";
import { BypassedFileCoverage, FileCoverage2, getTotalCoveragePercent } from "./module-1425.mjs";
import { memoize } from "./module-0250.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { WorkbenchCompressibleObjectTree } from "./module-0636.mjs";
import { basenameOrAuthority } from "./module-0034.mjs";
import { Position } from "./module-0079.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { Iterable } from "./module-0011.mjs";
import { onObservableChange } from "./module-3042.mjs";
import { findLast } from "./module-0006.mjs";
import { ICommandService } from "./module-0087.mjs";
import { assertNever } from "./module-0009.mjs";
import { $, append } from "./module-0075.mjs";
import { Action2, IMenuService, MenuId, registerAction2 } from "./module-0092.mjs";
import { ActionBar } from "./module-0477.mjs";
import { getActionBarActions } from "./module-0516.mjs";
import { ManagedTestCoverageBars } from "./module-3040.mjs";
import { createMatches } from "./module-0453.mjs";
import { ILabelService } from "./module-0641.mjs";
import { testingStatesToIcons, testingWasCovered } from "./module-3039.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Categories } from "./module-0847.mjs";
import { Codicon } from "./module-0085.mjs";
import { TestingContextKeys } from "./module-1428.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { TestId } from "./module-1207.mjs";
import { getLabelForItem, labels } from "./module-3037.mjs";


// src/vs/workbench/contrib/testing/browser/testCoverageView.ts
var TestCoverageView = class extends ViewPane {
  constructor(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, coverageService, storageService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.coverageService = coverageService;
    this.storageService = storageService;
    this.tree = this._register(new MutableDisposable());
    this.sortOrder = observableValue("sortOrder", 1 /* Location */);
    const storedOrder = this.storageService.getNumber("testing.coverageSortOrder", 1 /* WORKSPACE */);
    if (storedOrder !== void 0 && storedOrder >= 0 /* Coverage */ && storedOrder <= 2 /* Name */) {
      this.sortOrder.set(storedOrder, void 0);
    }
  }
  renderBody(container3) {
    super.renderBody(container3);
    this._register(autorun((reader) => {
      const order = this.sortOrder.read(reader);
      this.storageService.store("testing.coverageSortOrder", order, 1 /* WORKSPACE */, 1 /* MACHINE */);
    }));
    const labels2 = this._register(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility }));
    this._register(autorun((reader) => {
      const coverage = this.coverageService.selected.read(reader);
      if (coverage) {
        const t2 = this.tree.value ??= this.instantiationService.createInstance(TestCoverageTree, container3, labels2, this.sortOrder);
        t2.setInput(coverage, this.coverageService.filterToTest.read(reader));
      } else {
        this.tree.clear();
      }
    }));
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.tree.value?.layout(height, width2);
  }
  collapseAll() {
    this.tree.value?.collapseAll();
  }
};

TestCoverageView = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, ITestCoverageService),
  __decorateParam(11, IStorageService)
], TestCoverageView);

var fnNodeId = 0;

var DeclarationCoverageNode = class {
  constructor(uri5, data, details) {
    this.uri = uri5;
    this.data = data;
    this.id = String(fnNodeId++);
    this.containedDetails = /* @__PURE__ */ new Set();
    this.children = [];
    if (data.location instanceof Range2) {
      for (const detail2 of details) {
        if (this.contains(detail2.location)) {
          this.containedDetails.add(detail2);
        }
      }
    }
  }
  get hits() {
    return this.data.count;
  }
  get label() {
    return this.data.name;
  }
  get location() {
    return this.data.location;
  }
  get tpc() {
    const attr = this.attributableCoverage();
    return attr && getTotalCoveragePercent(attr.statement, attr.branch, void 0);
  }
  /** Gets whether this function has a defined range and contains the given range. */
  contains(location2) {
    const own = this.data.location;
    return own instanceof Range2 && (location2 instanceof Range2 ? own.containsRange(location2) : own.containsPosition(location2));
  }
  attributableCoverage() {
    const { location: location2, count: count2 } = this.data;
    if (!(location2 instanceof Range2) || !count2) {
      return;
    }
    const statement = { covered: 0, total: 0 };
    const branch = { covered: 0, total: 0 };
    for (const detail2 of this.containedDetails) {
      if (detail2.type !== 1 /* Statement */) {
        continue;
      }
      statement.covered += detail2.count ? 1 : 0;
      statement.total++;
      if (detail2.branches) {
        for (const { count: count3 } of detail2.branches) {
          branch.covered += count3 ? 1 : 0;
          branch.total++;
        }
      }
    }
    return { statement, branch };
  }
};

__decorateClass([
  memoize
], DeclarationCoverageNode.prototype, "attributableCoverage", 1);

var RevealUncoveredDeclarations = class {
  constructor(n2) {
    this.n = n2;
    this.id = String(fnNodeId++);
  }
  get label() {
    return localize(21052, null, this.n);
  }
};

var CurrentlyFilteredTo = class {
  constructor(testItem) {
    this.testItem = testItem;
    this.id = String(fnNodeId++);
  }
  get label() {
    return localize(21051, null, this.testItem.label);
  }
};

var LoadingDetails = class {
  constructor() {
    this.id = String(fnNodeId++);
    this.label = localize(21053, null);
  }
};

var isFileCoverage = (c) => typeof c === "object" && "value" in c;

var isDeclarationCoverage = (c) => c instanceof DeclarationCoverageNode;

var shouldShowDeclDetailsOnExpand = (c) => isFileCoverage(c) && c.value instanceof FileCoverage2 && !!c.value.declaration?.total;

var TestCoverageTree = class extends Disposable {
  constructor(container3, labels2, sortOrder, instantiationService, editorService, commandService) {
    super();
    this.inputDisposables = this._register(new DisposableStore());
    container3.classList.add("testing-stdtree");
    this.tree = instantiationService.createInstance(
      WorkbenchCompressibleObjectTree,
      "TestCoverageView",
      container3,
      new TestCoverageTreeListDelegate(),
      [
        instantiationService.createInstance(FileCoverageRenderer, labels2),
        instantiationService.createInstance(DeclarationCoverageRenderer),
        instantiationService.createInstance(BasicRenderer),
        instantiationService.createInstance(CurrentlyFilteredToRenderer)
      ],
      {
        expandOnlyOnTwistieClick: true,
        sorter: new Sorter(sortOrder),
        keyboardNavigationLabelProvider: {
          getCompressedNodeKeyboardNavigationLabel(elements) {
            return elements.map((e) => this.getKeyboardNavigationLabel(e)).join("/");
          },
          getKeyboardNavigationLabel(e) {
            return isFileCoverage(e) ? basenameOrAuthority(e.value.uri) : e.label;
          }
        },
        accessibilityProvider: {
          getAriaLabel(element) {
            if (isFileCoverage(element)) {
              const name = basenameOrAuthority(element.value.uri);
              return localize(21054, null, name, (element.value.tpc * 100).toFixed(2));
            } else {
              return element.label;
            }
          },
          getWidgetAriaLabel() {
            return localize(21055, null);
          }
        },
        identityProvider: new TestCoverageIdentityProvider()
      }
    );
    this._register(autorun((reader) => {
      sortOrder.read(reader);
      this.tree.resort(null, true);
    }));
    this._register(this.tree);
    this._register(this.tree.onDidChangeCollapseState((e) => {
      const el = e.node.element;
      if (!e.node.collapsed && !e.node.children.length && el && shouldShowDeclDetailsOnExpand(el)) {
        if (el.value.hasSynchronousDetails) {
          this.tree.setChildren(el, [{ element: new LoadingDetails(), incompressible: true }]);
        }
        el.value.details().then((details) => this.updateWithDetails(el, details));
      }
    }));
    this._register(this.tree.onDidOpen((e) => {
      let resource;
      let selection;
      if (e.element) {
        if (isFileCoverage(e.element) && !e.element.children?.size) {
          resource = e.element.value.uri;
        } else if (isDeclarationCoverage(e.element)) {
          resource = e.element.uri;
          selection = e.element.location;
        } else if (e.element instanceof CurrentlyFilteredTo) {
          commandService.executeCommand("testing.coverageFilterToTest" /* CoverageFilterToTest */);
          return;
        }
      }
      if (!resource) {
        return;
      }
      editorService.openEditor({
        resource,
        options: {
          selection: selection instanceof Position ? Range2.fromPositions(selection, selection) : selection,
          revealIfOpened: true,
          selectionRevealType: 3 /* NearTopIfOutsideViewport */,
          preserveFocus: e.editorOptions.preserveFocus,
          pinned: e.editorOptions.pinned,
          source: 1 /* USER */
        }
      }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
    }));
  }
  setInput(coverage, showOnlyTest) {
    this.inputDisposables.clear();
    let tree = coverage.tree;
    if (showOnlyTest) {
      tree = coverage.filterTreeForTest(showOnlyTest);
    }
    const files = [];
    for (let node of tree.nodes) {
      while (!(node.value instanceof FileCoverage2) && node.children?.size === 1) {
        node = Iterable.first(node.children.values());
      }
      files.push(node);
    }
    const toChild = (value2) => {
      const isFile2 = !value2.children?.size;
      return {
        element: value2,
        incompressible: isFile2,
        collapsed: isFile2,
        // directories can be expanded, and items with function info can be expanded
        collapsible: !isFile2 || !!value2.value?.declaration?.total,
        children: value2.children && Iterable.map(value2.children?.values(), toChild)
      };
    };
    this.inputDisposables.add(onObservableChange(coverage.didAddCoverage, (nodes) => {
      const toRender = findLast(nodes, (n2) => this.tree.hasElement(n2));
      if (toRender) {
        this.tree.setChildren(
          toRender,
          Iterable.map(toRender.children?.values() || [], toChild),
          { diffIdentityProvider: { getId: (el) => el.value.id } }
        );
      }
    }));
    let children = Iterable.map(files, toChild);
    const filteredTo = showOnlyTest && coverage.result.getTestById(showOnlyTest.toString());
    if (filteredTo) {
      children = Iterable.concat(
        Iterable.single({
          element: new CurrentlyFilteredTo(filteredTo),
          incompressible: true
        }),
        children
      );
    }
    this.tree.setChildren(null, children);
  }
  layout(height, width2) {
    this.tree.layout(height, width2);
  }
  collapseAll() {
    this.tree.collapseAll();
  }
  updateWithDetails(el, details) {
    if (!this.tree.hasElement(el)) {
      return;
    }
    const decl = [];
    for (const fn of details) {
      if (fn.type !== 0 /* Declaration */) {
        continue;
      }
      let arr = decl;
      while (true) {
        const parent = arr.find((p) => p.containedDetails.has(fn));
        if (parent) {
          arr = parent.children;
        } else {
          break;
        }
      }
      arr.push(new DeclarationCoverageNode(el.value.uri, fn, details));
    }
    const makeChild = (fn) => ({
      element: fn,
      incompressible: true,
      collapsed: true,
      collapsible: fn.children.length > 0,
      children: fn.children.map(makeChild)
    });
    this.tree.setChildren(el, decl.map(makeChild));
  }
};

TestCoverageTree = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, ICommandService)
], TestCoverageTree);

var TestCoverageTreeListDelegate = class {
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    if (isFileCoverage(element)) {
      return FileCoverageRenderer.ID;
    }
    if (isDeclarationCoverage(element)) {
      return DeclarationCoverageRenderer.ID;
    }
    if (element instanceof LoadingDetails || element instanceof RevealUncoveredDeclarations) {
      return BasicRenderer.ID;
    }
    if (element instanceof CurrentlyFilteredTo) {
      return CurrentlyFilteredToRenderer.ID;
    }
    assertNever(element);
  }
};

var Sorter = class {
  constructor(order) {
    this.order = order;
  }
  compare(a, b) {
    const order = this.order.get();
    if (isFileCoverage(a) && isFileCoverage(b)) {
      switch (order) {
        case 1 /* Location */:
        case 2 /* Name */:
          return a.value.uri.toString().localeCompare(b.value.uri.toString());
        case 0 /* Coverage */:
          return b.value.tpc - a.value.tpc;
      }
    } else if (isDeclarationCoverage(a) && isDeclarationCoverage(b)) {
      switch (order) {
        case 1 /* Location */:
          return Position.compare(
            a.location instanceof Range2 ? a.location.getStartPosition() : a.location,
            b.location instanceof Range2 ? b.location.getStartPosition() : b.location
          );
        case 2 /* Name */:
          return a.label.localeCompare(b.label);
        case 0 /* Coverage */: {
          const attrA = a.tpc;
          const attrB = b.tpc;
          return attrA !== void 0 && attrB !== void 0 && attrB - attrA || +b.hits - +a.hits || a.label.localeCompare(b.label);
        }
      }
    } else {
      return 0;
    }
  }
};

var CurrentlyFilteredToRenderer = class {
  constructor(menuService, contextKeyService) {
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.templateId = CurrentlyFilteredToRenderer.ID;
  }
  static {
    this.ID = "C";
  }
  renderCompressedElements(node, index2, templateData) {
    this.renderInner(node.element.elements[node.element.elements.length - 1], templateData);
  }
  renderTemplate(container3) {
    container3.classList.add("testing-stdtree-container");
    const label3 = append(container3, $(".label"));
    const menu = this.menuService.getMenuActions(MenuId.TestCoverageFilterItem, this.contextKeyService, {
      shouldForwardArgs: true
    });
    const actions = new ActionBar(container3);
    actions.push(getActionBarActions(menu, "inline").primary, { icon: true, label: false });
    actions.domNode.style.display = "block";
    return { label: label3, actions };
  }
  renderElement(element, index2, templateData) {
    this.renderInner(element.element, templateData);
  }
  disposeTemplate(templateData) {
    templateData.actions.dispose();
  }
  renderInner(element, container3) {
    container3.label.innerText = element.label;
  }
};

CurrentlyFilteredToRenderer = __decorateClass([
  __decorateParam(0, IMenuService),
  __decorateParam(1, IContextKeyService)
], CurrentlyFilteredToRenderer);

var FileCoverageRenderer = class {
  constructor(labels2, labelService, instantiationService) {
    this.labels = labels2;
    this.labelService = labelService;
    this.instantiationService = instantiationService;
    this.templateId = FileCoverageRenderer.ID;
  }
  static {
    this.ID = "F";
  }
  /** @inheritdoc */
  renderTemplate(container3) {
    const templateDisposables = new DisposableStore();
    container3.classList.add("testing-stdtree-container", "test-coverage-list-item");
    return {
      container: container3,
      bars: templateDisposables.add(this.instantiationService.createInstance(ManagedTestCoverageBars, { compact: false, container: container3 })),
      label: templateDisposables.add(this.labels.create(container3, {
        supportHighlights: true
      })),
      elementsDisposables: templateDisposables.add(new DisposableStore()),
      templateDisposables
    };
  }
  /** @inheritdoc */
  renderElement(node, _index, templateData) {
    this.doRender(node.element, templateData, node.filterData);
  }
  /** @inheritdoc */
  renderCompressedElements(node, _index, templateData) {
    this.doRender(node.element.elements, templateData, node.filterData);
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
  /** @inheritdoc */
  doRender(element, templateData, filterData) {
    templateData.elementsDisposables.clear();
    const stat = element instanceof Array ? element[element.length - 1] : element;
    const file = stat.value;
    const name = element instanceof Array ? element.map((e) => basenameOrAuthority(e.value.uri)) : basenameOrAuthority(file.uri);
    if (file instanceof BypassedFileCoverage) {
      templateData.bars.setCoverageInfo(void 0);
    } else {
      templateData.elementsDisposables.add(autorun((reader) => {
        stat.value?.didChange.read(reader);
        templateData.bars.setCoverageInfo(file);
      }));
      templateData.bars.setCoverageInfo(file);
    }
    templateData.label.setResource({ resource: file.uri, name }, {
      fileKind: stat.children?.size ? 1 /* FOLDER */ : 0 /* FILE */,
      matches: createMatches(filterData),
      separator: this.labelService.getSeparator(file.uri.scheme, file.uri.authority),
      extraClasses: ["label"]
    });
  }
};

FileCoverageRenderer = __decorateClass([
  __decorateParam(1, ILabelService),
  __decorateParam(2, IInstantiationService)
], FileCoverageRenderer);

var DeclarationCoverageRenderer = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
    this.templateId = DeclarationCoverageRenderer.ID;
  }
  static {
    this.ID = "N";
  }
  /** @inheritdoc */
  renderTemplate(container3) {
    const templateDisposables = new DisposableStore();
    container3.classList.add("test-coverage-list-item", "testing-stdtree-container");
    const icon2 = append(container3, $(".state"));
    const label3 = append(container3, $(".label"));
    return {
      container: container3,
      bars: templateDisposables.add(this.instantiationService.createInstance(ManagedTestCoverageBars, { compact: false, container: container3 })),
      templateDisposables,
      icon: icon2,
      label: label3
    };
  }
  /** @inheritdoc */
  renderElement(node, _index, templateData) {
    this.doRender(node.element, templateData, node.filterData);
  }
  /** @inheritdoc */
  renderCompressedElements(node, _index, templateData) {
    this.doRender(node.element.elements[node.element.elements.length - 1], templateData, node.filterData);
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
  /** @inheritdoc */
  doRender(element, templateData, _filterData) {
    const covered = !!element.hits;
    const icon2 = covered ? testingWasCovered : testingStatesToIcons.get(0 /* Unset */);
    templateData.container.classList.toggle("not-covered", !covered);
    templateData.icon.className = `computed-state ${ThemeIcon.asClassName(icon2)}`;
    templateData.label.innerText = element.label;
    templateData.bars.setCoverageInfo(element.attributableCoverage());
  }
};

DeclarationCoverageRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], DeclarationCoverageRenderer);

var BasicRenderer = class _BasicRenderer {
  constructor() {
    this.templateId = _BasicRenderer.ID;
  }
  static {
    this.ID = "B";
  }
  renderCompressedElements(node, _index, container3) {
    this.renderInner(node.element.elements[node.element.elements.length - 1], container3);
  }
  renderTemplate(container3) {
    return container3;
  }
  renderElement(node, index2, container3) {
    this.renderInner(node.element, container3);
  }
  disposeTemplate() {
  }
  renderInner(element, container3) {
    container3.innerText = element.label;
  }
};

var TestCoverageIdentityProvider = class {
  getId(element) {
    return isFileCoverage(element) ? element.value.uri.toString() : element.id;
  }
};

registerAction2(class TestCoverageChangePerTestFilterAction extends Action2 {
  constructor() {
    super({
      id: "testing.coverageFilterToTest" /* CoverageFilterToTest */,
      category: Categories.Test,
      title: localize2(21056, "Filter Coverage by Test"),
      icon: Codicon.filter,
      toggled: {
        icon: Codicon.filterFilled,
        condition: TestingContextKeys.isCoverageFilteredToTest
      },
      menu: [
        { id: MenuId.CommandPalette, when: TestingContextKeys.hasPerTestCoverage },
        { id: MenuId.TestCoverageFilterItem, group: "inline" },
        {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.and(TestingContextKeys.hasPerTestCoverage, ContextKeyExpr.equals("view", "workbench.view.testCoverage" /* CoverageViewId */)),
          group: "navigation"
        }
      ]
    });
  }
  run(accessor) {
    const coverageService = accessor.get(ITestCoverageService);
    const quickInputService = accessor.get(IQuickInputService);
    const coverage = coverageService.selected.get();
    if (!coverage) {
      return;
    }
    const tests = [...coverage.allPerTestIDs()].map(TestId.fromString);
    const commonPrefix = TestId.getLengthOfCommonPrefix(tests.length, (i2) => tests[i2]);
    const result = coverage.result;
    const previousSelection = coverageService.filterToTest.get();
    const previousSelectionStr = previousSelection?.toString();
    const items = [
      { label: labels.allTests, id: void 0 },
      { type: "separator" },
      ...tests.map((testId) => ({ ...getLabelForItem(result, testId, commonPrefix), testId }))
    ];
    quickInputService.pick(items, {
      activeItem: items.find((item) => "testId" in item && item.testId?.toString() === previousSelectionStr),
      placeHolder: labels.pickShowCoverage,
      onDidFocus: (entry) => {
        coverageService.filterToTest.set(entry.testId, void 0);
      }
    }).then((selected) => {
      coverageService.filterToTest.set(selected ? selected.testId : previousSelection, void 0);
    });
  }
});

registerAction2(class TestCoverageChangeSortingAction extends ViewAction {
  constructor() {
    super({
      id: "testing.coverageViewChangeSorting" /* CoverageViewChangeSorting */,
      viewId: "workbench.view.testCoverage" /* CoverageViewId */,
      title: localize2(21057, "Change Sort Order"),
      icon: Codicon.sortPrecedence,
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.equals("view", "workbench.view.testCoverage" /* CoverageViewId */),
        group: "navigation",
        order: 1
      }
    });
  }
  runInView(accessor, view) {
    const disposables = new DisposableStore();
    const quickInput = disposables.add(accessor.get(IQuickInputService).createQuickPick());
    const items = [
      { label: localize(21061, null), value: 1 /* Location */, description: localize(21062, null) },
      { label: localize(21059, null), value: 0 /* Coverage */, description: localize(21060, null) },
      { label: localize(21063, null), value: 2 /* Name */, description: localize(21064, null) }
    ];
    quickInput.placeholder = localize(21065, null);
    quickInput.items = items;
    quickInput.show();
    disposables.add(quickInput.onDidHide(() => disposables.dispose()));
    disposables.add(quickInput.onDidAccept(() => {
      const picked = quickInput.selectedItems[0]?.value;
      if (picked !== void 0) {
        view.sortOrder.set(picked, void 0);
        quickInput.dispose();
      }
    }));
  }
});

registerAction2(class TestCoverageCollapseAllAction extends ViewAction {
  constructor() {
    super({
      id: "testing.coverageViewCollapseAll" /* CoverageViewCollapseAll */,
      viewId: "workbench.view.testCoverage" /* CoverageViewId */,
      title: localize2(21058, "Collapse All Coverage"),
      icon: Codicon.collapseAll,
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.equals("view", "workbench.view.testCoverage" /* CoverageViewId */),
        group: "navigation",
        order: 2
      }
    });
  }
  runInView(_accessor, view) {
    view.collapseAll();
  }
});
export { TestCoverageView, fnNodeId, DeclarationCoverageNode, RevealUncoveredDeclarations, CurrentlyFilteredTo, LoadingDetails, isFileCoverage, isDeclarationCoverage, shouldShowDeclDetailsOnExpand, TestCoverageTree, TestCoverageTreeListDelegate, Sorter, CurrentlyFilteredToRenderer, FileCoverageRenderer, DeclarationCoverageRenderer, BasicRenderer, TestCoverageIdentityProvider };
