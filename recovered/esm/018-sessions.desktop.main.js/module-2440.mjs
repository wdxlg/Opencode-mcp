// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/multiDiffEditor/multiDiffEditorWidgetImpl.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { MultiDiffEditorLogger, formatDiffItemKey, formatUri } from "./module-2439.mjs";
import { derived } from "./module-0054.mjs";
import { observableValue } from "./module-0048.mjs";
import { CompressedVirtualizedScrollView } from "./module-2438.mjs";
import { VirtualizedItemManager } from "./module-2435.mjs";
import { DiffEditorItemTemplate } from "./module-2436.mjs";
import { mapObservableArrayCached } from "./module-0059.mjs";
import { transaction } from "./module-0045.mjs";
import { h } from "./module-0075.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { autorun, autorunWithStore } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { Selection } from "./module-0107.mjs";


// src/vs/editor/browser/widget/multiDiffEditor/multiDiffEditorWidgetImpl.ts
var MultiDiffEditorWidgetImpl = class extends Disposable {
  constructor(_element, _dimension, _viewModel, _workbenchUIElementFactory, _diffLayoutOptions, _diffEditorOptions, _parentContextKeyService, _parentInstantiationService, logService) {
    super();
    this._element = _element;
    this._dimension = _dimension;
    this._viewModel = _viewModel;
    this._workbenchUIElementFactory = _workbenchUIElementFactory;
    this._diffLayoutOptions = _diffLayoutOptions;
    this._diffEditorOptions = _diffEditorOptions;
    this._parentContextKeyService = _parentContextKeyService;
    this._parentInstantiationService = _parentInstantiationService;
    /**
     * When `true`, the automatic "select the first change" initialization that
     * runs once the view model finishes loading does not move keyboard focus
     * into the editor. Driven by {@link setPreserveFocusOnLoad} so a
     * `preserveFocus` open (e.g. restored in the background or on a session
     * switch) does not steal focus, while a normal user-initiated open does.
     */
    this._preserveFocusOnLoad = false;
    this._logger = this._register(new MultiDiffEditorLogger(logService));
    this._optionsOverride = derived(this, (reader) => {
      return { ...this._diffEditorOptions, ...this._diffLayoutOptions.read(reader) };
    });
    this._spaceBetweenPx = observableValue(this, 0);
    let viewItemsInfo;
    let viewItems;
    this._scrollView = this._register(new CompressedVirtualizedScrollView(
      this._element,
      this._dimension,
      this._spaceBetweenPx,
      (context2) => {
        const sourceItems = derived(this, (reader) => this._viewModel.read(reader)?.items.read(reader) ?? []);
        const manager = this._register(new VirtualizedItemManager(sourceItems, context2, {
          getId: (item) => item,
          getTemplateId: () => "diffEditor",
          getUnboundSize: (item) => derived(item, (reader) => item.collapsed.read(reader) ? 40 : item.lastTemplateData.read(reader).expandedContentHeight),
          createTemplate: () => this._instantiationService.createInstance(
            DiffEditorItemTemplate,
            context2.contentDomNode,
            context2.overflowWidgetsDomNode,
            this._workbenchUIElementFactory,
            this._optionsOverride
          ),
          onDidBind: (binding) => {
            const selections = binding.item.lastTemplateData.get().selections;
            this._logger.log("acquired editor template", {
              file: formatUri(binding.item.modifiedUri ?? binding.item.originalUri),
              collapsed: binding.item.collapsed.get(),
              expectedExpandedContentHeight: binding.item.lastTemplateData.get().expandedContentHeight,
              selections: selections?.length ?? 0
            });
            if (selections) {
              binding.editor.setSelections(selections);
            }
          },
          onWillUnbind: (binding, tx) => {
            this._logger.log("releasing editor template", {
              file: formatUri(binding.item.modifiedUri ?? binding.item.originalUri),
              contentHeight: binding.size.get()
            });
            binding.item.lastTemplateData.set({
              expandedContentHeight: binding.getExpandedContentHeight(),
              selections: binding.editor.getSelections() ?? void 0
            }, tx);
          }
        }));
        const adaptedItems = mapObservableArrayCached(this, manager.virtualizedItems, (item, store) => {
          const adaptedItem = store.add(new VirtualizedViewItem(item, context2.scrollLeft, this._logger));
          const data = this._lastDocStates?.[adaptedItem.getKey()];
          if (data) {
            transaction((tx) => adaptedItem.setViewState(data, tx));
          }
          return adaptedItem;
        }).recomputeInitiallyAndOnChange(this._store);
        viewItemsInfo = derived(this, (reader) => {
          const items = adaptedItems.read(reader);
          const map = new Map(items.map((item) => [item.viewModel, item]));
          const restoredDocStates = items.filter((item) => this._lastDocStates?.[item.getKey()] !== void 0).length;
          this._logger.log("view items updated", {
            items: items.length,
            restoredDocStates
          });
          return { items, getItem: (d) => map.get(d) };
        });
        viewItems = viewItemsInfo.map(this, (items) => items.items);
        return viewItems;
      }
    ));
    this._viewItemsInfo = viewItemsInfo;
    this._viewItems = viewItems;
    this.scrollTop = this._scrollView.scrollTop;
    this.scrollLeft = this._scrollView.scrollLeft;
    this.layoutDebugState = derived(this, (reader) => {
      const layout2 = this._scrollView.layout.read(reader);
      const items = this._viewItems.read(reader);
      const geometryEdit = this._scrollView.lastGeometryEdit.read(reader);
      return {
        scrollLeft: this.scrollLeft.read(reader),
        scrollDimensions: this._scrollView.scrollDimensions.read(reader),
        layout: {
          revision: layout2.revision,
          scrollTop: layout2.scrollTop,
          logicalScrollHeight: layout2.logicalScrollHeight,
          scrollHeight: layout2.scrollHeight,
          renderedHeight: layout2.renderedHeight,
          leadingScrollSlack: layout2.leadingScrollSlack,
          trailingScrollSlack: layout2.trailingScrollSlack,
          contentViewport: serializeOffsetRange(layout2.contentViewport),
          renderedViewport: serializeOffsetRange(layout2.renderedViewport),
          hiddenContentHeightAboveViewport: layout2.hiddenContentHeightAboveViewport
        },
        geometryEdit: geometryEdit ? {
          ...geometryEdit,
          edits: geometryEdit.edits.map((edit3) => ({
            oldRange: serializeOffsetRange(edit3.oldRange),
            newRange: serializeOffsetRange(edit3.newRange)
          }))
        } : void 0,
        items: items.map((item, index2) => item.getLayoutDebugState(reader, layout2.items[index2]))
      };
    });
    this._elements = h("div.monaco-component.multiDiffEditor", {}, [
      this._scrollView.domNode,
      h("div.placeholder@placeholder", {}, [h("div")])
    ]);
    this.activeControl = derived(this, (reader) => {
      const activeDiffItem = this._viewModel.read(reader)?.activeDiffItem.read(reader);
      if (!activeDiffItem) {
        return void 0;
      }
      const viewItem = this._viewItemsInfo.read(reader).getItem(activeDiffItem);
      return viewItem.template.read(reader)?.editor;
    });
    this._contextKeyService = this._register(this._parentContextKeyService.createScoped(this._element));
    this._instantiationService = this._register(this._parentInstantiationService.createChild(
      new ServiceCollection([IContextKeyService, this._contextKeyService])
    ));
    this._contextKeyService.createKey(EditorContextKeys.inMultiDiffEditor.key, true);
    this._lastDocStates = {};
    this._register(autorunWithStore((reader, store) => {
      const viewModel = this._viewModel.read(reader);
      if (viewModel && viewModel.contextKeys) {
        for (const [key3, value2] of Object.entries(viewModel.contextKeys)) {
          const contextKey = this._contextKeyService.createKey(key3, void 0);
          contextKey.set(value2);
          store.add(toDisposable(() => contextKey.reset()));
        }
      }
    }));
    const ctxAllCollapsed2 = this._parentContextKeyService.createKey(EditorContextKeys.multiDiffEditorAllCollapsed.key, false);
    this._register(autorun((reader) => {
      const viewModel = this._viewModel.read(reader);
      if (viewModel) {
        const allCollapsed = viewModel.items.read(reader).every((item) => item.collapsed.read(reader));
        ctxAllCollapsed2.set(allCollapsed);
      }
    }));
    const ctxRenderSideBySide = this._parentContextKeyService.createKey(EditorContextKeys.multiDiffEditorRenderSideBySide.key, true);
    this._register(autorun((reader) => {
      const renderSideBySide = this._diffLayoutOptions.read(reader)?.renderSideBySide;
      if (renderSideBySide !== void 0) {
        ctxRenderSideBySide.set(renderSideBySide);
      }
    }));
    this._logger.logStateChanges({
      viewModel: this._viewModel,
      items: this._viewItems,
      spaceBetweenPx: this._spaceBetweenPx.get(),
      getScrollTop: () => this._scrollView.getScrollPosition().scrollTop,
      isPreserveFocusOnLoad: () => this._preserveFocusOnLoad
    });
    const placeholderMessage = derived((reader) => {
      const items = this._viewItems.read(reader);
      if (items.length > 0) {
        return void 0;
      }
      const vm = this._viewModel.read(reader);
      return !vm || vm.isLoading.read(reader) ? localize(267, null) : localize(268, null);
    });
    this._register(autorun((reader) => {
      const message = placeholderMessage.read(reader);
      this._elements.placeholder.innerText = message ?? "";
      this._elements.placeholder.classList.toggle("visible", !!message);
    }));
    this._register(autorun((reader) => {
      this._scrollView.scrollDimensions.read(reader);
      this._applyPendingScrollState();
    }));
    _element.replaceChildren(this._elements.root);
    this._register(toDisposable(() => {
      _element.replaceChildren();
    }));
    this._register(autorun((reader) => {
      const viewModel = this._viewModel.read(reader);
      if (!viewModel) {
        return;
      }
      if (!viewModel.isLoading.read(reader)) {
        const items = viewModel.items.read(reader);
        if (items.length === 0) {
          return;
        }
        const activeDiffItem = viewModel.activeDiffItem.read(reader);
        if (activeDiffItem) {
          return;
        }
        if (this._restorePendingActiveDiffItem(viewModel, items)) {
          return;
        }
        this._logger.log("no active diff item after loading, selecting first change", { items: items.length });
        this._navigateToChange("next", !this._preserveFocusOnLoad);
      }
    }));
  }
  setScrollState(scrollState) {
    this._pendingScrollState = scrollState;
    this._applyPendingScrollState();
  }
  /**
   * Applies a restored scroll offset once the scrollable dimensions can
   * accommodate it; retries on subsequent dimension updates until it sticks (so
   * a fresh/reloaded widget whose content height is not yet known does not clamp
   * the offset to 0). Consumed once it lands.
   */
  _applyPendingScrollState() {
    const pending = this._pendingScrollState;
    if (!pending) {
      return;
    }
    this._scrollView.setScrollPosition({ scrollLeft: pending.left, scrollTop: pending.top });
    const applied = this._scrollView.getScrollPosition();
    const topLanded = pending.top === void 0 || applied.scrollTop >= pending.top;
    const leftLanded = pending.left === void 0 || applied.scrollLeft >= pending.left;
    if (topLanded && leftLanded) {
      this._pendingScrollState = void 0;
    }
    this._logger.log("applied pending scroll state", {
      requested: pending,
      applied: { top: applied.scrollTop, left: applied.scrollLeft },
      landed: topLanded && leftLanded
    });
  }
  /**
   * Clears any pending restoration state (documents, active item, scroll). Called
   * when a new model is installed without a view state, so it cannot inherit the
   * previous model's state for overlapping diff keys.
   */
  clearPendingRestorationState() {
    this._logger.log("cleared pending restoration state", {
      hadDocStates: !!this._lastDocStates,
      hadActiveDiffItemKey: !!this._lastActiveDiffItemKey,
      hadScrollState: !!this._pendingScrollState
    });
    this._lastDocStates = void 0;
    this._lastActiveDiffItemKey = void 0;
    this._pendingScrollState = void 0;
  }
  /**
   * Controls whether the automatic first-change selection that runs once the
   * view model finishes loading preserves focus instead of moving it into the
   * editor. Set to `true` for `preserveFocus` opens so focus is not stolen
   * from elsewhere.
   */
  setPreserveFocusOnLoad(preserveFocus) {
    this._preserveFocusOnLoad = preserveFocus;
  }
  getRootElement() {
    return this._elements.root;
  }
  getContextKeyService() {
    return this._contextKeyService;
  }
  getScopedInstantiationService() {
    return this._instantiationService;
  }
  reveal(resource, options3) {
    const viewItems = this._viewItems.get();
    const index2 = viewItems.findIndex(
      (item) => item.viewModel.originalUri?.toString() === resource.original?.toString() && item.viewModel.modifiedUri?.toString() === resource.modified?.toString()
    );
    if (index2 === -1) {
      throw new BugIndicatingError("Resource not found in diff editor");
    }
    const viewItem = viewItems[index2];
    this._viewModel.get().activeDiffItem.setCache(viewItem.viewModel, void 0);
    let scrollTop = 0;
    for (let i2 = 0; i2 < index2; i2++) {
      scrollTop += viewItems[i2].contentHeight.get() + this._spaceBetweenPx.get();
    }
    this._logger.log("reveal", {
      file: viewItem.getLabel(),
      index: index2,
      scrollTop: `${this._scrollView.getScrollPosition().scrollTop} -> ${scrollTop}`,
      range: options3?.range
    });
    this._scrollView.setScrollPosition({ scrollTop });
    const diffEditor = viewItem.template.get()?.editor;
    const editor = "original" in resource ? diffEditor?.getOriginalEditor() : diffEditor?.getModifiedEditor();
    if (editor && options3?.range) {
      editor.revealRangeInCenter(options3.range);
      highlightRange(editor, options3.range);
    }
  }
  getViewState() {
    const viewState = {
      scrollState: {
        top: this.scrollTop.get(),
        left: this.scrollLeft.get()
      },
      docStates: Object.fromEntries(this._viewItems.get().map((i2) => [i2.getKey(), i2.getViewState()])),
      activeDiffItemKey: this._viewModel.get()?.activeDiffItem.get()?.getKey()
    };
    if (this._logger.isEnabled) {
      const docStates = Object.values(viewState.docStates ?? {});
      this._logger.log("get view state", {
        scrollTop: viewState.scrollState.top,
        scrollLeft: viewState.scrollState.left,
        docStates: docStates.length,
        collapsed: docStates.filter((s) => s.collapsed).length,
        activeDiffItem: formatDiffItemKey(viewState.activeDiffItemKey)
      });
    }
    return viewState;
  }
  setViewState(viewState, tx) {
    if (this._logger.isEnabled) {
      const docStates = Object.values(viewState.docStates ?? {});
      this._logger.log("set view state", {
        scrollTop: viewState.scrollState.top,
        scrollLeft: viewState.scrollState.left,
        docStates: docStates.length,
        collapsed: docStates.filter((s) => s.collapsed).length,
        activeDiffItem: formatDiffItemKey(viewState.activeDiffItemKey),
        viewItems: this._viewItems.get().length
      });
    }
    this.setScrollState(viewState.scrollState);
    this._lastDocStates = viewState.docStates;
    this._lastActiveDiffItemKey = viewState.activeDiffItemKey;
    const applyDocStates = (tx2) => {
      if (viewState.docStates) {
        for (const i2 of this._viewItems.get()) {
          const state = viewState.docStates[i2.getKey()];
          if (state) {
            i2.setViewState(state, tx2);
          }
        }
      }
    };
    if (tx) {
      applyDocStates(tx);
    } else {
      transaction(applyDocStates);
    }
    const viewModel = this._viewModel.get();
    if (viewModel) {
      this._restorePendingActiveDiffItem(viewModel, viewModel.items.get());
    }
  }
  /**
   * Restores the persisted active diff item (if any) onto the view model, so the
   * automatic first-change navigation is skipped. On an explicit (non-preserve-focus)
   * open it also moves focus into the restored item's editor, mirroring the
   * first-change navigation it replaces. Returns whether it was applied.
   */
  _restorePendingActiveDiffItem(viewModel, items) {
    const key3 = this._lastActiveDiffItemKey;
    if (key3 === void 0 || items.length === 0) {
      return false;
    }
    this._lastActiveDiffItemKey = void 0;
    const target = items.find((i2) => i2.getKey() === key3);
    if (!target) {
      if (this._logger.isEnabled) {
        this._logger.log("persisted active diff item not found", {
          key: formatDiffItemKey(key3),
          availableKeys: items.map((i2) => formatDiffItemKey(i2.getKey()))
        });
      }
      return false;
    }
    this._logger.log("restored active diff item", { file: target.modifiedUri ?? target.originalUri, preserveFocus: this._preserveFocusOnLoad });
    viewModel.activeDiffItem.setCache(target, void 0);
    if (!this._preserveFocusOnLoad) {
      this._viewItemsInfo.get().getItem(target).template.get()?.editor.focus();
    }
    return true;
  }
  findDocumentDiffItem(resource) {
    const item = this._viewItems.get().find(
      (v2) => v2.viewModel.diffEditorViewModel.model.modified.uri.toString() === resource.toString() || v2.viewModel.diffEditorViewModel.model.original.uri.toString() === resource.toString()
    );
    return item?.viewModel.documentDiffItem;
  }
  tryGetCodeEditor(resource) {
    const item = this._viewItems.get().find(
      (v2) => v2.viewModel.diffEditorViewModel.model.modified.uri.toString() === resource.toString() || v2.viewModel.diffEditorViewModel.model.original.uri.toString() === resource.toString()
    );
    const editor = item?.template.get()?.editor;
    if (!editor) {
      return void 0;
    }
    if (item.viewModel.diffEditorViewModel.model.modified.uri.toString() === resource.toString()) {
      return { diffEditor: editor, editor: editor.getModifiedEditor() };
    } else {
      return { diffEditor: editor, editor: editor.getOriginalEditor() };
    }
  }
  goToNextChange() {
    this._navigateToChange("next");
  }
  goToPreviousChange() {
    this._navigateToChange("previous");
  }
  _navigateToChange(direction, focusEditor = true) {
    const viewItems = this._viewItems.get();
    if (viewItems.length === 0) {
      return;
    }
    const activeViewModel = this._viewModel.get()?.activeDiffItem.get();
    const currentIndex = activeViewModel ? viewItems.findIndex((v2) => v2.viewModel === activeViewModel) : -1;
    this._logger.log("navigate to change", { direction, focusEditor, currentIndex, items: viewItems.length });
    if (currentIndex === -1) {
      this._goToFile(0, "first", focusEditor);
      return;
    }
    const currentItem = viewItems[currentIndex];
    if (currentItem.viewModel.collapsed.get()) {
      this._logger.log("expanding collapsed item to navigate within it", { file: currentItem.getLabel() });
      currentItem.viewModel.collapsed.set(false, void 0);
    }
    const editor = currentItem.template.get()?.editor;
    if (editor?.getDiffComputationResult()?.changes2?.length) {
      const pos = editor.getModifiedEditor().getPosition()?.lineNumber || 1;
      const changes = editor.getDiffComputationResult().changes2;
      const hasNext = direction === "next" ? changes.some((c) => c.modified.startLineNumber > pos) : changes.some((c) => c.modified.endLineNumberExclusive <= pos);
      if (hasNext) {
        editor.goToDiff(direction);
        return;
      }
    }
    const nextIndex = (currentIndex + (direction === "next" ? 1 : -1) + viewItems.length) % viewItems.length;
    this._goToFile(nextIndex, direction === "next" ? "first" : "last", focusEditor);
  }
  _goToFile(index2, position2, focusEditor = true) {
    const item = this._viewItems.get()[index2];
    const wasCollapsed = item.viewModel.collapsed.get();
    this._logger.log("go to file", { file: item.getLabel(), index: index2, position: position2, focusEditor, wasCollapsed });
    if (wasCollapsed) {
      item.viewModel.collapsed.set(false, void 0);
    }
    this.reveal({ original: item.viewModel.originalUri, modified: item.viewModel.modifiedUri });
    const editor = item.template.get()?.editor;
    if (editor?.getDiffComputationResult()?.changes2?.length) {
      if (position2 === "first") {
        editor.revealFirstDiff();
      } else {
        const lastChange = editor.getDiffComputationResult().changes2.at(-1);
        const modifiedEditor = editor.getModifiedEditor();
        modifiedEditor.setPosition({ lineNumber: lastChange.modified.startLineNumber, column: 1 });
        modifiedEditor.revealLineInCenter(lastChange.modified.startLineNumber);
      }
    }
    if (focusEditor) {
      editor?.focus();
    }
  }
};

MultiDiffEditorWidgetImpl = __decorateClass([
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, ILogService)
], MultiDiffEditorWidgetImpl);

function highlightRange(targetEditor, range2) {
  const modelNow = targetEditor.getModel();
  const decorations = targetEditor.createDecorationsCollection([{ range: range2, options: { description: "symbol-navigate-action-highlight", className: "symbolHighlight" } }]);
  setTimeout(() => {
    if (targetEditor.getModel() === modelNow) {
      decorations.clear();
    }
  }, 350);
}

function serializeOffsetRange(range2) {
  return { start: range2.start, endExclusive: range2.endExclusive };
}

var VirtualizedViewItem = class extends Disposable {
  constructor(_managedItem, _scrollLeft, _logger) {
    super();
    this._managedItem = _managedItem;
    this._scrollLeft = _scrollLeft;
    this._logger = _logger;
    this.size = _managedItem.size;
    this.contentHeight = this.size;
    this.maxScroll = _managedItem.maxScroll;
    this.template = _managedItem.template;
    this.binding = _managedItem.binding;
    this.viewModel = _managedItem.item;
    this._isFocused = derived(this, (reader) => this.template.read(reader)?.isFocused.read(reader) ?? false);
    this.viewModel.setIsFocused(this._isFocused, void 0);
    this._register(autorun((reader) => {
      const scrollLeft = this._scrollLeft.read(reader);
      this.binding.read(reader)?.setScrollLeft(scrollLeft);
    }));
  }
  get collapsed() {
    return this.viewModel.collapsed;
  }
  getLayoutDebugState(reader, layout2) {
    const binding = this.binding.read(reader);
    return {
      key: this.getKey(),
      label: this.getLabel(),
      originalUri: this.viewModel.originalUri?.toString() ?? null,
      modifiedUri: this.viewModel.modifiedUri?.toString() ?? null,
      collapsed: this.collapsed.read(reader),
      hasTemplate: binding !== void 0,
      verticalState: {
        contentHeight: this.size.read(reader),
        itemViewportOffset: layout2.scrollOffset
      },
      maxScroll: this.maxScroll.read(reader).maxScroll,
      layout: {
        contentRange: serializeOffsetRange(layout2.contentRange),
        renderedRange: serializeOffsetRange(layout2.renderedRange),
        maxScrollOffset: layout2.maxScrollOffset,
        scrollOffset: layout2.scrollOffset,
        visibility: layout2.visibility
      }
    };
  }
  toString() {
    return `VirtualViewItem(${this.viewModel.documentDiffItem.modified?.uri.toString()})`;
  }
  getKey() {
    return this.viewModel.getKey();
  }
  /** Short, log friendly name of this item. */
  getLabel() {
    return formatUri(this.viewModel.modifiedUri ?? this.viewModel.originalUri);
  }
  getViewState() {
    transaction((tx) => {
      this._updateTemplateData(tx);
    });
    return {
      collapsed: this.viewModel.collapsed.get(),
      selections: this.viewModel.lastTemplateData.get().selections
    };
  }
  setViewState(viewState, tx) {
    this._logger.log("item view state restored", { file: this.getLabel(), collapsed: viewState.collapsed, selections: viewState.selections?.length ?? 0 });
    this.viewModel.collapsed.set(viewState.collapsed, tx);
    this._updateTemplateData(tx);
    const data = this.viewModel.lastTemplateData.get();
    const selections = viewState.selections?.map(Selection.liftSelection);
    this.viewModel.lastTemplateData.set({
      ...data,
      selections
    }, tx);
    const binding = this.binding.get();
    if (binding && selections) {
      binding.editor.setSelections(selections);
    }
  }
  _updateTemplateData(tx) {
    const binding = this.binding.get();
    if (!binding) {
      return;
    }
    this.viewModel.lastTemplateData.set({
      expandedContentHeight: binding.getExpandedContentHeight(),
      selections: binding.editor.getSelections() ?? void 0
    }, tx);
  }
  hide() {
    this._managedItem.hide();
  }
  render(verticalSpace, offset, width2, viewPort, context2) {
    this._managedItem.render(verticalSpace, offset, width2, viewPort, context2);
  }
};
export { highlightRange, serializeOffsetRange, MultiDiffEditorWidgetImpl, VirtualizedViewItem };
