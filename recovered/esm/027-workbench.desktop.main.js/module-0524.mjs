// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/features/gutterFeature.ts
import { Disposable } from "./module-0012.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { derived, derivedDisposable, derivedWithSetter } from "./module-0054.mjs";
import { EventType, addDisposableListener, h } from "./module-0075.mjs";
import { LineRange, LineRangeSet } from "./module-0174.mjs";
import { Range2 } from "./module-0106.mjs";
import { appendRemoveOnDispose, applyStyle, prependRemoveOnDispose } from "./module-0478.mjs";
import { DiffEditorSash } from "./module-0497.mjs";
import { DetailedLineRangeMapping } from "./module-0179.mjs";
import { EditorGutter } from "./module-0523.mjs";
import { TextModelText } from "./module-0521.mjs";
import { TextEdit2 } from "./module-0178.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { observableValue } from "./module-0048.mjs";
import { WorkbenchHoverDelegate } from "./module-0520.mjs";
import { autorun, autorunWithStore } from "./module-0052.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { ActionRunnerWithContext } from "./module-0522.mjs";
import { OffsetRange } from "./module-0144.mjs";


// src/vs/editor/browser/widget/diffEditor/features/gutterFeature.ts
var emptyArr2 = [];

var width = 35;

var DiffEditorGutter = class extends Disposable {
  constructor(diffEditorRoot, _diffModel, _editors, _options, _sashLayout, _boundarySashes, _instantiationService, _contextKeyService, _menuService) {
    super();
    this._diffModel = _diffModel;
    this._editors = _editors;
    this._options = _options;
    this._sashLayout = _sashLayout;
    this._boundarySashes = _boundarySashes;
    this._instantiationService = _instantiationService;
    this._contextKeyService = _contextKeyService;
    this._menuService = _menuService;
    this._menu = this._register(this._menuService.createMenu(MenuId.DiffEditorHunkToolbar, this._contextKeyService));
    this._actions = observableFromEvent(this, this._menu.onDidChange, () => this._menu.getActions());
    this._hasActions = this._actions.map((a) => a.length > 0);
    this._showSash = derived(this, (reader) => this._options.renderSideBySide.read(reader) && this._hasActions.read(reader));
    this.width = derived(this, (reader) => this._hasActions.read(reader) ? width : 0);
    this.elements = h("div.gutter@gutter", { style: { position: "absolute", height: "100%", width: width + "px" } }, []);
    this._currentDiff = derived(this, (reader) => {
      const model = this._diffModel.read(reader);
      if (!model) {
        return void 0;
      }
      const mappings = model.diff.read(reader)?.mappings;
      const cursorPosition = this._editors.modifiedCursor.read(reader);
      if (!cursorPosition) {
        return void 0;
      }
      return mappings?.find((m) => m.lineRangeMapping.modified.contains(cursorPosition.lineNumber));
    });
    this._selectedDiffs = derived(this, (reader) => {
      const model = this._diffModel.read(reader);
      const diff4 = model?.diff.read(reader);
      if (!diff4) {
        return emptyArr2;
      }
      const selections = this._editors.modifiedSelections.read(reader);
      if (selections.every((s) => s.isEmpty())) {
        return emptyArr2;
      }
      const selectedLineNumbers = new LineRangeSet(selections.map((s) => LineRange.fromRangeInclusive(s)));
      const selectedMappings = diff4.mappings.filter(
        (m) => m.lineRangeMapping.innerChanges && selectedLineNumbers.intersects(m.lineRangeMapping.modified)
      );
      const result = selectedMappings.map((mapping2) => ({
        mapping: mapping2,
        rangeMappings: mapping2.lineRangeMapping.innerChanges.filter(
          (c) => selections.some((s) => Range2.areIntersecting(c.modifiedRange, s))
        )
      }));
      if (result.length === 0 || result.every((r2) => r2.rangeMappings.length === 0)) {
        return emptyArr2;
      }
      return result;
    });
    this._register(prependRemoveOnDispose(diffEditorRoot, this.elements.root));
    this._register(addDisposableListener(this.elements.root, "click", () => {
      this._editors.modified.focus();
    }));
    this._register(applyStyle(this.elements.root, { display: this._hasActions.map((a) => a ? "block" : "none") }));
    derivedDisposable(this, (reader) => {
      const showSash = this._showSash.read(reader);
      return !showSash ? void 0 : new DiffEditorSash(
        diffEditorRoot,
        this._sashLayout.dimensions,
        this._options.enableSplitViewResizing,
        this._boundarySashes,
        derivedWithSetter(
          this,
          (reader2) => this._sashLayout.sashLeft.read(reader2) - width,
          (v2, tx) => this._sashLayout.sashLeft.set(v2 + width, tx)
        ),
        () => this._sashLayout.resetSash()
      );
    }).recomputeInitiallyAndOnChange(this._store);
    const gutterItems = derived(this, (reader) => {
      const model = this._diffModel.read(reader);
      if (!model) {
        return [];
      }
      const diffs = model.diff.read(reader);
      if (!diffs) {
        return [];
      }
      const selection = this._selectedDiffs.read(reader);
      if (selection.length > 0) {
        const m = DetailedLineRangeMapping.fromRangeMappings(selection.flatMap((s) => s.rangeMappings));
        return [
          new DiffGutterItem(
            m,
            true,
            MenuId.DiffEditorSelectionToolbar,
            void 0,
            model.model.original.uri,
            model.model.modified.uri
          )
        ];
      }
      const currentDiff = this._currentDiff.read(reader);
      return diffs.mappings.map((m) => new DiffGutterItem(
        m.lineRangeMapping.withInnerChangesFromLineRanges(),
        m.lineRangeMapping === currentDiff?.lineRangeMapping,
        MenuId.DiffEditorHunkToolbar,
        void 0,
        model.model.original.uri,
        model.model.modified.uri
      ));
    });
    this._register(new EditorGutter(this._editors.modified, this.elements.root, {
      getIntersectingGutterItems: (range2, reader) => gutterItems.read(reader),
      createView: (item, target) => {
        return this._instantiationService.createInstance(DiffToolBar, item, target, this);
      }
    }));
    this._register(addDisposableListener(this.elements.gutter, EventType.MOUSE_WHEEL, (e) => {
      if (this._editors.modified.getOption(117 /* scrollbar */).handleMouseWheel) {
        this._editors.modified.delegateScrollFromMouseWheelEvent(e);
      }
    }, { passive: false }));
  }
  computeStagedValue(mapping2) {
    const c = mapping2.innerChanges ?? [];
    const modified = new TextModelText(this._editors.modifiedModel.get());
    const original = new TextModelText(this._editors.original.getModel());
    const edit3 = new TextEdit2(c.map((c2) => c2.toTextEdit(modified)));
    const value2 = edit3.apply(original);
    return value2;
  }
  layout(left) {
    this.elements.gutter.style.left = left + "px";
  }
};

DiffEditorGutter = __decorateClass([
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IMenuService)
], DiffEditorGutter);

var DiffGutterItem = class {
  constructor(mapping2, showAlways, menuId, rangeOverride, originalUri, modifiedUri) {
    this.mapping = mapping2;
    this.showAlways = showAlways;
    this.menuId = menuId;
    this.rangeOverride = rangeOverride;
    this.originalUri = originalUri;
    this.modifiedUri = modifiedUri;
  }
  get id() {
    return this.mapping.modified.toString();
  }
  get range() {
    return this.rangeOverride ?? this.mapping.modified;
  }
};

var DiffToolBar = class extends Disposable {
  constructor(_item, target, gutter, instantiationService) {
    super();
    this._item = _item;
    this._elements = h("div.gutterItem", { style: { height: "20px", width: "34px" } }, [
      h("div.background@background", {}, []),
      h("div.buttons@buttons", {}, [])
    ]);
    this._showAlways = this._item.map(this, (item) => item.showAlways);
    this._menuId = this._item.map(this, (item) => item.menuId);
    this._isSmall = observableValue(this, false);
    this._lastItemRange = void 0;
    this._lastViewRange = void 0;
    const hoverDelegate = this._register(instantiationService.createInstance(
      WorkbenchHoverDelegate,
      "element",
      { instantHover: true },
      { position: { hoverPosition: 1 /* RIGHT */ } }
    ));
    this._register(appendRemoveOnDispose(target, this._elements.root));
    this._register(autorun((reader) => {
      const showAlways = this._showAlways.read(reader);
      this._elements.root.classList.toggle("noTransition", true);
      this._elements.root.classList.toggle("showAlways", showAlways);
      setTimeout(() => {
        this._elements.root.classList.toggle("noTransition", false);
      }, 0);
    }));
    this._register(autorunWithStore((reader, store) => {
      this._elements.buttons.replaceChildren();
      const i2 = store.add(instantiationService.createInstance(MenuWorkbenchToolBar, this._elements.buttons, this._menuId.read(reader), {
        orientation: 1 /* VERTICAL */,
        hoverDelegate,
        toolbarOptions: {
          primaryGroup: (g) => g.startsWith("primary")
        },
        overflowBehavior: { maxItems: this._isSmall.read(reader) ? 1 : 3 },
        hiddenItemStrategy: 0 /* Ignore */,
        actionRunner: store.add(new ActionRunnerWithContext(() => {
          const item = this._item.read(void 0);
          const mapping2 = item.mapping;
          return {
            mapping: mapping2,
            originalWithModifiedChanges: gutter.computeStagedValue(mapping2),
            originalUri: item.originalUri,
            modifiedUri: item.modifiedUri
          };
        })),
        menuOptions: {
          shouldForwardArgs: true
        }
      }));
      store.add(i2.onDidChangeMenuItems(() => {
        if (this._lastItemRange) {
          this.layout(this._lastItemRange, this._lastViewRange);
        }
      }));
    }));
  }
  layout(itemRange, viewRange) {
    this._lastItemRange = itemRange;
    this._lastViewRange = viewRange;
    let itemHeight = this._elements.buttons.clientHeight;
    this._isSmall.set(this._item.get().mapping.original.startLineNumber === 1 && itemRange.length < 30, void 0);
    itemHeight = this._elements.buttons.clientHeight;
    const middleHeight = itemRange.length / 2 - itemHeight / 2;
    const margin = itemHeight;
    let effectiveCheckboxTop = itemRange.start + middleHeight;
    const preferredViewPortRange = OffsetRange.tryCreate(
      margin,
      viewRange.endExclusive - margin - itemHeight
    );
    const preferredParentRange = OffsetRange.tryCreate(
      itemRange.start + margin,
      itemRange.endExclusive - itemHeight - margin
    );
    if (preferredParentRange && preferredViewPortRange && preferredParentRange.start < preferredParentRange.endExclusive) {
      effectiveCheckboxTop = preferredViewPortRange.clip(effectiveCheckboxTop);
      effectiveCheckboxTop = preferredParentRange.clip(effectiveCheckboxTop);
    }
    this._elements.buttons.style.top = `${effectiveCheckboxTop - itemRange.start}px`;
  }
};

DiffToolBar = __decorateClass([
  __decorateParam(3, IInstantiationService)
], DiffToolBar);
export { emptyArr2, width, DiffEditorGutter, DiffGutterItem, DiffToolBar };
