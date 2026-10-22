// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/multiDiffEditor/diffEditorItemTemplate.ts
import { VirtualizedItemBinding, VirtualizedItemTemplate } from "./module-2460.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { EventHelper, EventType, addDisposableListener, getWindow, h, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { DiffEditorWidget } from "./module-0527.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { Button } from "./module-0546.mjs";
import { autorun } from "./module-0052.mjs";
import { Codicon } from "./module-0085.mjs";
import { globalTransaction } from "./module-0045.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { MenuId } from "./module-0092.mjs";
import { ActionRunnerWithContext } from "./module-0522.mjs";
import { createActionViewItem } from "./module-0516.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/editor/browser/widget/multiDiffEditor/diffEditorItemTemplate.ts
var DiffEditorItemTemplate = class extends VirtualizedItemTemplate {
  constructor(_container, _overflowWidgetsDomNode, _workbenchUIElementFactory, _optionsOverride, _instantiationService, _parentContextKeyService) {
    super();
    this._container = _container;
    this._overflowWidgetsDomNode = _overflowWidgetsDomNode;
    this._workbenchUIElementFactory = _workbenchUIElementFactory;
    this._optionsOverride = _optionsOverride;
    this._instantiationService = _instantiationService;
    this._verticalStateUpdate = this._register(new MutableDisposable());
    this._observedEditorContentHeight = 500;
    this._isSettingData = false;
    this._viewModel = observableValue(this, void 0);
    this._collapsed = derived(this, (reader) => this._viewModel.read(reader)?.collapsed.read(reader));
    this._editorContentHeight = observableValue(this, 500);
    this.size = derived(this, (reader) => {
      const collapsed2 = this._collapsed.read(reader);
      return (collapsed2 ? 0 : this._editorContentHeight.read(reader)) + this._outerEditorHeight;
    });
    this._modifiedContentWidth = observableValue(this, 0);
    this._modifiedWidth = observableValue(this, 0);
    this._originalContentWidth = observableValue(this, 0);
    this._originalWidth = observableValue(this, 0);
    this.maxScroll = derived(this, (reader) => {
      const scroll1 = this._modifiedContentWidth.read(reader) - this._modifiedWidth.read(reader);
      const scroll2 = this._originalContentWidth.read(reader) - this._originalWidth.read(reader);
      if (scroll1 > scroll2) {
        return { maxScroll: scroll1, width: this._modifiedWidth.read(reader) };
      } else {
        return { maxScroll: scroll2, width: this._originalWidth.read(reader) };
      }
    });
    this._elements = h("div.multiDiffEntry", [
      h("div.header@header", [
        h("div.header-content", [
          h("div.collapse-button@collapseButton"),
          h("div.file-path", [
            // eslint-disable-next-line local/code-no-any-casts, @typescript-eslint/no-explicit-any
            h("div.title.modified.show-file-icons@primaryPath", []),
            h("div.status.deleted@status", ["R"]),
            // eslint-disable-next-line local/code-no-any-casts, @typescript-eslint/no-explicit-any
            h("div.title.original.show-file-icons@secondaryPath", [])
          ]),
          h("div.actions@actions")
        ])
      ]),
      h("div.editorParent", [
        h("div.editorContainer@editor")
      ])
    ]);
    this.editor = this._register(this._instantiationService.createInstance(DiffEditorWidget, this._elements.editor, {
      overflowWidgetsDomNode: this._overflowWidgetsDomNode,
      fixedOverflowWidgets: true
    }, {
      runWithOriginalEditorScrollAnchor: (anchorLineNumber, update) => this._runWithEditorScrollAnchor(
        () => this._outerEditorHeight + this._getOriginalEditorLineTop(anchorLineNumber),
        update
      ),
      runWithModifiedEditorScrollAnchor: (anchorLineNumber, update) => this._runWithEditorScrollAnchor(
        () => this._outerEditorHeight + this._getModifiedEditorLineTop(anchorLineNumber),
        update
      )
    }));
    this.isModifedFocused = observableCodeEditor(this.editor.getModifiedEditor()).isFocused;
    this.isOriginalFocused = observableCodeEditor(this.editor.getOriginalEditor()).isFocused;
    this.isFocused = derived(this, (reader) => this.isModifedFocused.read(reader) || this.isOriginalFocused.read(reader));
    this._resourceLabel = this._workbenchUIElementFactory.createResourceLabel ? this._register(this._workbenchUIElementFactory.createResourceLabel(this._elements.primaryPath, "primary" /* Primary */)) : void 0;
    this._resourceLabel2 = this._workbenchUIElementFactory.createResourceLabel ? this._register(this._workbenchUIElementFactory.createResourceLabel(this._elements.secondaryPath, "secondary" /* Secondary */)) : void 0;
    this._dataStore = this._register(new DisposableStore());
    this._headerHeight = 40;
    const btn = this._register(new Button(this._elements.collapseButton, {}));
    this._register(autorun((reader) => {
      btn.element.className = "";
      btn.icon = this._collapsed.read(reader) ? Codicon.chevronRight : Codicon.chevronDown;
    }));
    this._register(btn.onDidClick(() => {
      this._viewModel.get()?.collapsed.set(!this._collapsed.get(), void 0);
    }));
    if (this._workbenchUIElementFactory.handleHeaderMiddleClick) {
      this._register(addDisposableListener(this._elements.header, EventType.AUXCLICK, (e) => {
        if (e.button !== 1) {
          return;
        }
        const viewModel = this._viewModel.get();
        const resource = viewModel?.modifiedUri ?? viewModel?.originalUri;
        if (resource && this._workbenchUIElementFactory.handleHeaderMiddleClick?.(resource)) {
          EventHelper.stop(e, true);
        }
      }));
    }
    if (this._workbenchUIElementFactory.headerClickToCollapse) {
      this._elements.header.tabIndex = 0;
      this._elements.header.setAttribute("role", "button");
      this._register(addDisposableListener(this._elements.header, EventType.CLICK, (e) => {
        const target = e.target;
        if (!(target instanceof Element)) {
          return;
        }
        if (target.closest(".actions") || target.closest(".collapse-button")) {
          return;
        }
        this._viewModel.get()?.collapsed.set(!this._collapsed.get(), void 0);
      }));
      this._register(addDisposableListener(this._elements.header, EventType.KEY_DOWN, (e) => {
        if (e.key === "Enter" || e.key === " ") {
          const target = e.target;
          if (target instanceof Element && (target.closest(".actions") || target.closest(".collapse-button"))) {
            return;
          }
          e.preventDefault();
          this._viewModel.get()?.collapsed.set(!this._collapsed.get(), void 0);
        }
      }));
    }
    this._register(autorun((reader) => {
      const collapsed2 = this._collapsed.read(reader);
      this._elements.editor.style.display = collapsed2 ? "none" : "block";
      if (this._workbenchUIElementFactory.headerClickToCollapse) {
        this._elements.header.setAttribute("aria-expanded", String(!collapsed2));
      }
    }));
    this._register(this.editor.getModifiedEditor().onDidLayoutChange((e) => {
      const width2 = this.editor.getModifiedEditor().getLayoutInfo().contentWidth;
      this._modifiedWidth.set(width2, void 0);
    }));
    this._register(this.editor.getOriginalEditor().onDidLayoutChange((e) => {
      const width2 = this.editor.getOriginalEditor().getLayoutInfo().contentWidth;
      this._originalWidth.set(width2, void 0);
    }));
    this._register(this.editor.onDidContentSizeChange((e) => {
      globalTransaction((tx) => {
        this._modifiedContentWidth.set(this.editor.getModifiedEditor().getContentWidth(), tx);
        this._originalContentWidth.set(this.editor.getOriginalEditor().getContentWidth(), tx);
      });
      const viewModel = this._viewModel.get();
      if (this._isSettingData || !viewModel?.diffEditorViewModel.isDiffUpToDate.get()) {
        return;
      }
      this._observedEditorContentHeight = e.contentHeight;
      this._scheduleVerticalStateUpdate();
    }));
    this._register(autorun((reader) => {
      const isActive2 = this._viewModel.read(reader)?.isActive.read(reader);
      this._elements.root.classList.toggle("active", isActive2);
    }));
    this._container.appendChild(this._elements.root);
    this._outerEditorHeight = this._headerHeight;
    this._contextKeyService = this._register(_parentContextKeyService.createScoped(this._elements.actions));
    const ctxAllUnchangedRegionsShown = EditorContextKeys.multiDiffEditorItemAllUnchangedRegionsShown.bindTo(this._contextKeyService);
    this._register(autorun((reader) => {
      ctxAllUnchangedRegionsShown.set(this.editor.allUnchangedRegionsShown.read(reader));
    }));
    const instantiationService = this._register(this._instantiationService.createChild(new ServiceCollection([IContextKeyService, this._contextKeyService])));
    this._register(instantiationService.createInstance(MenuWorkbenchToolBar, this._elements.actions, MenuId.MultiDiffEditorFileToolbar, {
      actionRunner: this._register(new ActionRunnerWithContext(() => this._viewModel.get()?.modifiedUri ?? this._viewModel.get()?.originalUri)),
      highlightToggledItems: true,
      menuOptions: {
        shouldForwardArgs: true
      },
      toolbarOptions: { primaryGroup: (g) => g.startsWith("navigation") },
      actionViewItemProvider: (action, options3) => this._workbenchUIElementFactory.createToolbarActionViewItem?.(action, options3) ?? createActionViewItem(instantiationService, action, options3)
    }));
  }
  setScrollLeft(left) {
    if (this._modifiedContentWidth.get() - this._modifiedWidth.get() > this._originalContentWidth.get() - this._originalWidth.get()) {
      this.editor.getModifiedEditor().setScrollLeft(left);
    } else {
      this.editor.getOriginalEditor().setScrollLeft(left);
    }
  }
  getExpandedContentHeight() {
    return this._editorContentHeight.get() + this._outerEditorHeight;
  }
  createBinding(item, context2) {
    this._bindingContext = context2;
    try {
      this.setItem(item, context2.initialSize);
    } catch (error) {
      try {
        this.setItem(void 0);
      } finally {
        this._bindingContext = void 0;
      }
      throw error;
    }
    return new DiffEditorItemBinding(item, this);
  }
  _runWithEditorScrollAnchor(getItemOffset, update) {
    const context2 = this._bindingContext;
    if (!context2) {
      throw new BugIndicatingError("Cannot preserve a diff editor scroll anchor without an active item binding");
    }
    context2.runWithScrollAnchor(
      getItemOffset,
      (tx) => {
        update();
        this._verticalStateUpdate.clear();
        this._observedEditorContentHeight = this.editor.getContentHeight();
        this._editorContentHeight.set(this._observedEditorContentHeight, tx);
      }
    );
  }
  _getOriginalEditorLineTop(lineNumber) {
    const originalEditor = this.editor.getOriginalEditor();
    return lineNumber > originalEditor.getModel().getLineCount() ? originalEditor.getContentHeight() : originalEditor.getTopForLineNumber(lineNumber);
  }
  _getModifiedEditorLineTop(lineNumber) {
    const modifiedEditor = this.editor.getModifiedEditor();
    return lineNumber > modifiedEditor.getModel().getLineCount() ? modifiedEditor.getContentHeight() : modifiedEditor.getTopForLineNumber(lineNumber);
  }
  setItem(item, initialSize = 0) {
    this._verticalStateUpdate.clear();
    const optionsOverride = this._optionsOverride;
    function updateOptions(options3) {
      return {
        ...options3,
        ...optionsOverride?.get(),
        scrollBeyondLastLine: false,
        hideUnchangedRegions: {
          enabled: true
        },
        scrollbar: {
          vertical: "hidden",
          horizontal: "hidden",
          handleMouseWheel: false,
          useShadows: false
        },
        renderOverviewRuler: false,
        fixedOverflowWidgets: true,
        overviewRulerBorder: false
      };
    }
    if (!item) {
      this._isSettingData = true;
      try {
        globalTransaction((tx) => {
          this._viewModel.set(void 0, tx);
          this.editor.setDiffModel(null, tx);
          this._dataStore.clear();
        });
      } finally {
        this._isSettingData = false;
      }
      return;
    }
    const value2 = item.documentDiffItem;
    const editorContentHeight = Math.max(0, Math.max(initialSize, item.lastTemplateData.get().expandedContentHeight) - this._outerEditorHeight);
    this._observedEditorContentHeight = editorContentHeight;
    this._isSettingData = true;
    try {
      globalTransaction((tx) => {
        this._editorContentHeight.set(editorContentHeight, tx);
        this._resourceLabel?.setUri(item.modifiedUri ?? item.originalUri, { strikethrough: item.modifiedUri === void 0 });
        let isRenamed = false;
        let isDeleted = false;
        let isAdded = false;
        let flag = "";
        if (item.modifiedUri && item.originalUri && item.modifiedUri.path !== item.originalUri.path) {
          flag = "R";
          isRenamed = true;
        } else if (!item.modifiedUri) {
          flag = "D";
          isDeleted = true;
        } else if (!item.originalUri) {
          flag = "A";
          isAdded = true;
        }
        this._elements.status.classList.toggle("renamed", isRenamed);
        this._elements.status.classList.toggle("deleted", isDeleted);
        this._elements.status.classList.toggle("added", isAdded);
        this._elements.status.innerText = flag;
        this._resourceLabel2?.setUri(isRenamed ? item.originalUri : void 0, { strikethrough: true });
        this._dataStore.clear();
        this._viewModel.set(item, tx);
        this.editor.updateOptions(updateOptions(value2.options ?? {}));
        this.editor.setDiffModel(item.diffEditorViewModelRef, tx);
      });
    } finally {
      this._isSettingData = false;
    }
    this._dataStore.add(autorun((reader) => {
      const viewModel = item.diffEditorViewModel;
      if (!viewModel.isDiffUpToDate.read(reader)) {
        return;
      }
      const hasChanges = (viewModel.diff.read(reader)?.mappings.length ?? 0) > 0;
      if (hasChanges && viewModel.unchangedRegions.read(reader).length > 0) {
        return;
      }
      this._observedEditorContentHeight = this.editor.getContentHeight();
      this._scheduleVerticalStateUpdate();
    }));
    if (value2.onOptionsDidChange) {
      this._dataStore.add(value2.onOptionsDidChange(() => {
        this.editor.updateOptions(updateOptions(value2.options ?? {}));
      }));
    }
    if (optionsOverride) {
      this._dataStore.add(autorun((reader) => {
        optionsOverride.read(reader);
        this.editor.updateOptions(updateOptions(value2.options ?? {}));
      }));
    }
    if (item.documentDiffItem.contextKeys) {
      for (const [key3, value3] of Object.entries(item.documentDiffItem.contextKeys)) {
        this._contextKeyService.createKey(key3, value3);
      }
    }
  }
  render(verticalRange, width2, editorScroll, viewPort) {
    this._elements.root.style.visibility = "visible";
    this._elements.root.style.top = `${verticalRange.start}px`;
    this._elements.root.style.height = `${verticalRange.length}px`;
    this._elements.root.style.width = `${width2}px`;
    this._elements.root.style.position = "absolute";
    const maxDelta = verticalRange.length - this._headerHeight;
    const delta2 = Math.max(0, Math.min(viewPort.start - verticalRange.start, maxDelta));
    this._elements.header.style.transform = `translateY(${delta2}px)`;
    globalTransaction((tx) => {
      this.editor.layout({
        width: width2 - 2 * 8 - 2 * 1,
        height: verticalRange.length - this._outerEditorHeight
      });
    });
    this.editor.getOriginalEditor().setScrollTop(editorScroll);
    this._flushVerticalState();
    this._elements.header.classList.toggle("shadow", delta2 > 0 || editorScroll > 0);
    this._elements.header.classList.toggle("collapsed", delta2 === maxDelta);
  }
  _scheduleVerticalStateUpdate() {
    if (this._verticalStateUpdate.value) {
      return;
    }
    this._verticalStateUpdate.value = scheduleAtNextAnimationFrame(getWindow(this._elements.root), () => this._flushVerticalState());
  }
  _flushVerticalState() {
    this._verticalStateUpdate.clear();
    globalTransaction((tx) => {
      this._editorContentHeight.set(this._observedEditorContentHeight, tx);
    });
  }
  hide() {
    this._elements.root.style.top = `-100000px`;
    this._elements.root.style.visibility = "hidden";
  }
  unbind(item) {
    if (this._viewModel.get() !== item) {
      throw new BugIndicatingError("Cannot unbind a diff editor template from a different item");
    }
    this.setItem(void 0);
    this._bindingContext = void 0;
  }
};

DiffEditorItemTemplate = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextKeyService)
], DiffEditorItemTemplate);

var DiffEditorItemBinding = class extends VirtualizedItemBinding {
  constructor(item, _template) {
    super(item);
    this._template = _template;
    this.size = _template.size;
    this.maxScroll = _template.maxScroll;
    this.shouldKeepAlive = _template.isFocused;
    this.editor = _template.editor;
  }
  render(renderedRange, scrollOffset, width2, renderedViewport) {
    this._template.render(renderedRange, width2, scrollOffset, renderedViewport);
  }
  hide() {
    this._template.hide();
  }
  setScrollLeft(scrollLeft) {
    this._template.setScrollLeft(scrollLeft);
  }
  getExpandedContentHeight() {
    return this._template.getExpandedContentHeight();
  }
  dispose() {
    if (this._store.isDisposed) {
      return;
    }
    this._template.unbind(this.item);
    super.dispose();
  }
};
export { DiffEditorItemTemplate, DiffEditorItemBinding };
