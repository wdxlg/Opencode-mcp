// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingCodeEditorIntegration.ts
import { LinkedList } from "./module-0013.mjs";
import { DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { ChatEditingExplanationWidgetManager } from "./module-2682.mjs";
import { derived } from "./module-0054.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { isTextDiffEditorForEntry } from "./module-2691.mjs";
import { autorun } from "./module-0052.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { ctxCursorInChangeRange } from "./module-2051.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { AccessibleDiffViewer } from "./module-0480.mjs";
import { constObservable } from "./module-0061.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { diffAddDecoration, diffDeleteDecoration, diffWholeLineAddDecoration } from "./module-0481.mjs";
import { themeColorFromId } from "./module-0086.mjs";
import { minimapGutterAddedBackground, minimapGutterDeletedBackground, minimapGutterModifiedBackground, overviewRulerAddedForeground, overviewRulerDeletedForeground, overviewRulerModifiedForeground } from "./module-1080.mjs";
import { LineSource, RenderOptions, renderLines } from "./module-0486.mjs";
import { InlineDecoration } from "./module-0243.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { Event2 } from "./module-0017.mjs";
import { Selection } from "./module-0107.mjs";
import { localize } from "./module-0001.mjs";
import { isDiffEditorInput } from "./module-0926.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatEditingService } from "./module-1082.mjs";
import { IChatEditingExplanationModelManager } from "./module-2683.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IViewsService } from "./module-1246.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { MenuId } from "./module-0092.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { getTotalWidth } from "./module-0075.mjs";
import { LineRange } from "./module-0174.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingCodeEditorIntegration.ts
var ObjectPool = class {
  constructor() {
    this._free = new LinkedList();
  }
  dispose() {
    dispose(this._free);
  }
  get() {
    return this._free.shift();
  }
  putBack(obj) {
    this._free.push(obj);
  }
  get free() {
    return this._free;
  }
};

var ChatEditingCodeEditorIntegration = class {
  constructor(_entry, _editor, documentDiffInfo, renderDiffImmediately, _editorService, _accessibilitySignalsService, contextKeyService, instantiationService, _chatEditingService, _explanationModelManager, _chatWidgetService, _viewsService) {
    this._entry = _entry;
    this._editor = _editor;
    this._editorService = _editorService;
    this._accessibilitySignalsService = _accessibilitySignalsService;
    this._explanationModelManager = _explanationModelManager;
    this._chatWidgetService = _chatWidgetService;
    this._viewsService = _viewsService;
    this._currentIndex = observableValue(this, -1);
    this.currentIndex = this._currentIndex;
    this._store = new DisposableStore();
    this._diffHunksRenderStore = this._store.add(new DisposableStore());
    this._diffHunkWidgetPool = this._store.add(new ObjectPool());
    this._diffHunkWidgets = [];
    this._viewZones = [];
    this._accessibleDiffViewVisible = observableValue(this, false);
    this._diffLineDecorations = _editor.createDecorationsCollection();
    const codeEditorObs = observableCodeEditor(_editor);
    this._diffLineDecorations = this._editor.createDecorationsCollection();
    this._diffVisualDecorations = this._editor.createDecorationsCollection();
    this._store.add(new ChatEditingExplanationWidgetManager(
      this._editor,
      this._chatWidgetService,
      this._viewsService,
      this._explanationModelManager,
      this._entry.modifiedURI
    ));
    const enabledObs = derived((r2) => {
      if (!isEqual2(codeEditorObs.model.read(r2)?.uri, documentDiffInfo.read(r2).modifiedModel.uri)) {
        return false;
      }
      if (this._editor.getOption(70 /* inDiffEditor */) && !instantiationService.invokeFunction(isTextDiffEditorForEntry, _entry, this._editor)) {
        return false;
      }
      return true;
    });
    this._store.add(autorun((r2) => {
      if (!enabledObs.read(r2)) {
        this._diffLineDecorations.clear();
        return;
      }
      const data = [];
      const diff4 = documentDiffInfo.read(r2);
      for (const diffEntry of diff4.changes) {
        data.push({
          range: diffEntry.modified.toInclusiveRange() ?? new Range2(diffEntry.modified.startLineNumber, 1, diffEntry.modified.startLineNumber, Number.MAX_SAFE_INTEGER),
          options: ChatEditingCodeEditorIntegration._diffLineDecorationData
        });
      }
      this._diffLineDecorations.set(data);
    }));
    let lastModifyingRequestId;
    this._store.add(autorun((r2) => {
      if (enabledObs.read(r2) && !_entry.isCurrentlyBeingModifiedBy.read(r2) && lastModifyingRequestId !== _entry.lastModifyingRequestId && !documentDiffInfo.read(r2).identical) {
        lastModifyingRequestId = _entry.lastModifyingRequestId;
        const position2 = _editor.getPosition() ?? new Position(1, 1);
        const ranges = this._diffLineDecorations.getRanges();
        let initialIndex = ranges.findIndex((r3) => r3.containsPosition(position2));
        if (initialIndex < 0) {
          initialIndex = 0;
          for (; initialIndex < ranges.length - 1; initialIndex++) {
            const range2 = ranges[initialIndex];
            if (range2.endLineNumber >= position2.lineNumber) {
              break;
            }
          }
        }
        this._currentIndex.set(initialIndex, void 0);
        _editor.revealRange(ranges[initialIndex]);
      }
    }));
    this._store.add(autorun((r2) => {
      if (!enabledObs.read(r2)) {
        this._clearDiffRendering();
        return;
      }
      if (!_entry.isCurrentlyBeingModifiedBy.read(r2) || renderDiffImmediately) {
        const isDiffEditor2 = this._editor.getOption(70 /* inDiffEditor */);
        codeEditorObs.getOption(59 /* fontInfo */).read(r2);
        codeEditorObs.getOption(75 /* lineHeight */).read(r2);
        const reviewMode = _entry.reviewMode.read(r2);
        const diff4 = documentDiffInfo.read(r2);
        this._updateDiffRendering(diff4, reviewMode, isDiffEditor2);
      }
    }));
    const _ctxCursorInChangeRange = ctxCursorInChangeRange.bindTo(contextKeyService);
    this._store.add(autorun((r2) => {
      const position2 = codeEditorObs.positions.read(r2)?.at(0);
      if (!position2 || !enabledObs.read(r2)) {
        _ctxCursorInChangeRange.reset();
        return;
      }
      const diff4 = documentDiffInfo.read(r2);
      const changeAtCursor = diff4.changes.find((m) => m.modified.contains(position2.lineNumber) || m.modified.isEmpty && m.modified.startLineNumber === position2.lineNumber);
      _ctxCursorInChangeRange.set(!!changeAtCursor);
      if (changeAtCursor) {
        let signal;
        if (changeAtCursor.modified.isEmpty) {
          signal = AccessibilitySignal.diffLineDeleted;
        } else if (changeAtCursor.original.isEmpty) {
          signal = AccessibilitySignal.diffLineInserted;
        } else {
          signal = AccessibilitySignal.diffLineModified;
        }
        this._accessibilitySignalsService.playSignal(signal, { source: "chatEditingEditor.cursorPositionChanged" });
      }
    }));
    this._store.add(autorun((r2) => {
      const visible = this._accessibleDiffViewVisible.read(r2);
      if (!visible || !enabledObs.read(r2)) {
        return;
      }
      const accessibleDiffWidget = new AccessibleDiffViewContainer();
      _editor.addOverlayWidget(accessibleDiffWidget);
      r2.store.add(toDisposable(() => _editor.removeOverlayWidget(accessibleDiffWidget)));
      r2.store.add(instantiationService.createInstance(
        AccessibleDiffViewer,
        accessibleDiffWidget.getDomNode(),
        enabledObs,
        (visible2, tx) => this._accessibleDiffViewVisible.set(visible2, tx),
        constObservable(true),
        codeEditorObs.layoutInfo.map((v2, r3) => v2.width),
        codeEditorObs.layoutInfo.map((v2, r3) => v2.height),
        documentDiffInfo.map((diff4) => diff4.changes.slice()),
        instantiationService.createInstance(AccessibleDiffViewerModel, documentDiffInfo, _editor)
      ));
    }));
    let actualOptions;
    const restoreActualOptions = () => {
      if (actualOptions !== void 0) {
        this._editor.updateOptions(actualOptions);
        actualOptions = void 0;
      }
    };
    this._store.add(toDisposable(restoreActualOptions));
    const renderAsBeingModified = derived(this, (r2) => {
      return enabledObs.read(r2) && Boolean(_entry.isCurrentlyBeingModifiedBy.read(r2));
    });
    this._store.add(autorun((r2) => {
      const value2 = renderAsBeingModified.read(r2);
      if (value2) {
        actualOptions ??= {
          readOnly: this._editor.getOption(104 /* readOnly */),
          stickyScroll: this._editor.getOption(131 /* stickyScroll */),
          codeLens: this._editor.getOption(23 /* codeLens */),
          guides: this._editor.getOption(22 /* guides */)
        };
        this._editor.updateOptions({
          readOnly: true,
          stickyScroll: { enabled: false },
          codeLens: false,
          guides: { indentation: false, bracketPairs: false }
        });
      } else {
        restoreActualOptions();
      }
    }));
  }
  static {
    this._diffLineDecorationData = ModelDecorationOptions.register({ description: "diff-line-decoration" });
  }
  dispose() {
    this._clear();
    this._store.dispose();
  }
  _clear() {
    this._diffLineDecorations.clear();
    this._clearDiffRendering();
    this._currentIndex.set(-1, void 0);
  }
  // ---- diff rendering logic
  _clearDiffRendering() {
    this._editor.changeViewZones((viewZoneChangeAccessor) => {
      for (const id2 of this._viewZones) {
        viewZoneChangeAccessor.removeZone(id2);
      }
    });
    this._viewZones = [];
    this._diffHunksRenderStore.clear();
    for (const widget of this._diffHunkWidgetPool.free) {
      widget.remove();
    }
    this._diffVisualDecorations.clear();
  }
  _updateDiffRendering(diff4, reviewMode, diffMode) {
    const chatDiffAddDecoration = ModelDecorationOptions.createDynamic({
      ...diffAddDecoration,
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */
    });
    const chatDiffWholeLineAddDecoration = ModelDecorationOptions.createDynamic({
      ...diffWholeLineAddDecoration,
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */
    });
    const createOverviewDecoration = (overviewRulerColor, minimapColor) => {
      return ModelDecorationOptions.createDynamic({
        description: "chat-editing-decoration",
        overviewRuler: { color: themeColorFromId(overviewRulerColor), position: 1 /* Left */ },
        minimap: { color: themeColorFromId(minimapColor), position: 2 /* Gutter */ }
      });
    };
    const modifiedDecoration = createOverviewDecoration(overviewRulerModifiedForeground, minimapGutterModifiedBackground);
    const addedDecoration = createOverviewDecoration(overviewRulerAddedForeground, minimapGutterAddedBackground);
    const deletedDecoration = createOverviewDecoration(overviewRulerDeletedForeground, minimapGutterDeletedBackground);
    this._diffHunksRenderStore.clear();
    this._diffHunkWidgets.length = 0;
    const diffHunkDecorations = [];
    this._editor.changeViewZones((viewZoneChangeAccessor) => {
      for (const id2 of this._viewZones) {
        viewZoneChangeAccessor.removeZone(id2);
      }
      this._viewZones = [];
      const modifiedVisualDecorations = [];
      const mightContainNonBasicASCII = diff4.originalModel.mightContainNonBasicASCII();
      const mightContainRTL = diff4.originalModel.mightContainRTL();
      const renderOptions = RenderOptions.fromEditor(this._editor);
      const editorLineCount = this._editor.getModel()?.getLineCount();
      for (const diffEntry of diff4.changes) {
        const originalRange = diffEntry.original;
        diff4.originalModel.tokenization.forceTokenization(Math.max(1, originalRange.endLineNumberExclusive - 1));
        const source = new LineSource(
          originalRange.mapToLineArray((l) => diff4.originalModel.tokenization.getLineTokens(l)),
          [],
          mightContainNonBasicASCII,
          mightContainRTL
        );
        const decorations = [];
        if (reviewMode) {
          for (const i2 of diffEntry.innerChanges || []) {
            decorations.push(new InlineDecoration(
              i2.originalRange.delta(-(diffEntry.original.startLineNumber - 1)),
              diffDeleteDecoration.className,
              0 /* Regular */
            ));
            if (!(i2.originalRange.isEmpty() && i2.originalRange.startLineNumber === 1 && i2.modifiedRange.endLineNumber === editorLineCount) && !i2.modifiedRange.isEmpty()) {
              modifiedVisualDecorations.push({
                range: i2.modifiedRange,
                options: chatDiffAddDecoration
              });
            }
          }
        }
        const isCreatedContent = decorations.length === 1 && decorations[0].range.isEmpty() && diffEntry.original.startLineNumber === 1;
        if (!diffEntry.modified.isEmpty) {
          modifiedVisualDecorations.push({
            range: diffEntry.modified.toInclusiveRange(),
            options: chatDiffWholeLineAddDecoration
          });
        }
        if (diffEntry.original.isEmpty) {
          modifiedVisualDecorations.push({
            range: diffEntry.modified.toInclusiveRange(),
            options: addedDecoration
          });
        } else if (diffEntry.modified.isEmpty) {
          modifiedVisualDecorations.push({
            range: new Range2(diffEntry.modified.startLineNumber - 1, 1, diffEntry.modified.startLineNumber, 1),
            options: deletedDecoration
          });
        } else {
          modifiedVisualDecorations.push({
            range: diffEntry.modified.toInclusiveRange(),
            options: modifiedDecoration
          });
        }
        let extraLines = 0;
        if (reviewMode && !diffMode) {
          const domNode = document.createElement("div");
          domNode.className = "chat-editing-original-zone view-lines line-delete monaco-mouse-cursor-text";
          const result = renderLines(source, renderOptions, decorations, domNode);
          extraLines = result.heightInLines;
          if (!isCreatedContent) {
            const viewZoneData = {
              afterLineNumber: diffEntry.modified.startLineNumber - 1,
              heightInLines: result.heightInLines,
              domNode,
              ordinal: 5e4 + 2
              // more than https://github.com/microsoft/vscode/blob/bf52a5cfb2c75a7327c9adeaefbddc06d529dcad/src/vs/workbench/contrib/inlineChat/browser/inlineChatZoneWidget.ts#L42
            };
            this._viewZones.push(viewZoneChangeAccessor.addZone(viewZoneData));
          }
        }
        if (reviewMode || diffMode) {
          let widget = this._diffHunkWidgetPool.get();
          if (!widget) {
            widget = this._editor.invokeWithinContext((accessor) => {
              const instaService = accessor.get(IInstantiationService);
              return instaService.createInstance(DiffHunkWidget, this._editor, diff4, diffEntry, this._editor.getModel().getVersionId(), isCreatedContent ? 0 : extraLines);
            });
          } else {
            widget.update(diff4, diffEntry, this._editor.getModel().getVersionId(), isCreatedContent ? 0 : extraLines);
          }
          this._diffHunksRenderStore.add(toDisposable(() => {
            this._diffHunkWidgetPool.putBack(widget);
          }));
          widget.layout(diffEntry.modified.startLineNumber);
          this._diffHunkWidgets.push(widget);
          diffHunkDecorations.push({
            range: diffEntry.modified.toInclusiveRange() ?? new Range2(diffEntry.modified.startLineNumber, 1, diffEntry.modified.startLineNumber, Number.MAX_SAFE_INTEGER),
            options: {
              description: "diff-hunk-widget",
              stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */
            }
          });
        }
      }
      this._diffVisualDecorations.set(!diffMode ? modifiedVisualDecorations : []);
    });
    const diffHunkDecoCollection = this._editor.createDecorationsCollection(diffHunkDecorations);
    this._diffHunksRenderStore.add(toDisposable(() => {
      diffHunkDecoCollection.clear();
    }));
    for (const extraWidget of this._diffHunkWidgetPool.free) {
      extraWidget.remove();
    }
    const positionObs = observableFromEvent(this._editor.onDidChangeCursorPosition, (_) => this._editor.getPosition());
    const activeWidgetIdx = derived((r2) => {
      const position2 = positionObs.read(r2);
      if (!position2) {
        return -1;
      }
      const idx = diffHunkDecoCollection.getRanges().findIndex((r3) => r3.containsPosition(position2));
      return idx;
    });
    const toggleWidget = (activeWidget) => {
      const positionIdx = activeWidgetIdx.get();
      for (let i2 = 0; i2 < this._diffHunkWidgets.length; i2++) {
        const widget = this._diffHunkWidgets[i2];
        widget.toggle(widget === activeWidget || i2 === positionIdx);
      }
    };
    this._diffHunksRenderStore.add(autorun((r2) => {
      const idx = activeWidgetIdx.read(r2);
      const widget = this._diffHunkWidgets[idx];
      toggleWidget(widget);
    }));
    this._diffHunksRenderStore.add(this._editor.onMouseUp((e4) => {
      if (e4.target.type === 8 /* CONTENT_VIEW_ZONE */) {
        const zone = e4.target.detail;
        const idx = this._viewZones.findIndex((id2) => id2 === zone.viewZoneId);
        if (idx >= 0) {
          this._editor.setPosition(e4.target.position);
          this._editor.focus();
        }
      }
    }));
    this._diffHunksRenderStore.add(this._editor.onMouseMove((e4) => {
      if (e4.target.type === 12 /* OVERLAY_WIDGET */) {
        const id2 = e4.target.detail;
        const widget = this._diffHunkWidgets.find((w) => w.getId() === id2);
        toggleWidget(widget);
      } else if (e4.target.type === 8 /* CONTENT_VIEW_ZONE */) {
        const zone = e4.target.detail;
        const idx = this._viewZones.findIndex((id2) => id2 === zone.viewZoneId);
        toggleWidget(this._diffHunkWidgets[idx]);
      } else if (e4.target.position) {
        const { position: position2 } = e4.target;
        const idx = diffHunkDecoCollection.getRanges().findIndex((r2) => r2.containsPosition(position2));
        toggleWidget(this._diffHunkWidgets[idx]);
      } else {
        toggleWidget(void 0);
      }
    }));
    this._diffHunksRenderStore.add(Event2.any(this._editor.onDidScrollChange, this._editor.onDidLayoutChange)(() => {
      for (let i2 = 0; i2 < this._diffHunkWidgets.length; i2++) {
        const widget = this._diffHunkWidgets[i2];
        const range2 = diffHunkDecoCollection.getRange(i2);
        if (range2) {
          widget.layout(range2?.startLineNumber);
        } else {
          widget.dispose();
        }
      }
    }));
  }
  enableAccessibleDiffView() {
    this._accessibleDiffViewVisible.set(true, void 0);
  }
  // ---- navigation logic
  reveal(firstOrLast, preserveFocus) {
    const decorations = this._diffLineDecorations.getRanges().sort((a, b) => Range2.compareRangesUsingStarts(a, b));
    const index2 = firstOrLast ? 0 : decorations.length - 1;
    const range2 = decorations.at(index2);
    if (range2) {
      this._editor.setPosition(range2.getStartPosition());
      this._editor.revealRange(range2);
      if (!preserveFocus) {
        this._editor.focus();
      }
      this._currentIndex.set(index2, void 0);
    }
  }
  next(wrap) {
    return this._reveal(true, !wrap);
  }
  previous(wrap) {
    return this._reveal(false, !wrap);
  }
  _reveal(next, strict) {
    const position2 = this._editor.getPosition();
    if (!position2) {
      this._currentIndex.set(-1, void 0);
      return false;
    }
    const decorations = this._diffLineDecorations.getRanges().sort((a, b) => Range2.compareRangesUsingStarts(a, b));
    if (decorations.length === 0) {
      this._currentIndex.set(-1, void 0);
      return false;
    }
    let newIndex = -1;
    for (let i2 = 0; i2 < decorations.length; i2++) {
      const range2 = decorations[i2];
      if (range2.containsPosition(position2)) {
        newIndex = i2 + (next ? 1 : -1);
        break;
      } else if (Position.isBefore(position2, range2.getStartPosition())) {
        newIndex = next ? i2 : i2 - 1;
        break;
      }
    }
    if (strict && (newIndex < 0 || newIndex >= decorations.length)) {
      return false;
    }
    newIndex = (newIndex + decorations.length) % decorations.length;
    this._currentIndex.set(newIndex, void 0);
    const targetRange = decorations[newIndex];
    const targetPosition = next ? targetRange.getStartPosition() : targetRange.getEndPosition();
    this._editor.setPosition(targetPosition);
    this._editor.revealPositionInCenter(targetRange.getStartPosition().delta(-1));
    this._editor.focus();
    return true;
  }
  // --- hunks
  _findClosestWidget() {
    if (!this._editor.hasModel()) {
      return void 0;
    }
    const lineRelativeTop = this._editor.getTopForLineNumber(this._editor.getPosition().lineNumber) - this._editor.getScrollTop();
    let closestWidget;
    let closestDistance = Number.MAX_VALUE;
    for (const widget of this._diffHunkWidgets) {
      const widgetTop = widget.getPosition()?.preference?.top;
      if (widgetTop !== void 0) {
        const distance = Math.abs(widgetTop - lineRelativeTop);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestWidget = widget;
        }
      }
    }
    return closestWidget;
  }
  async rejectNearestChange(closestWidget) {
    closestWidget = closestWidget ?? this._findClosestWidget();
    if (closestWidget instanceof DiffHunkWidget) {
      await closestWidget.reject();
      this.next(true);
    }
  }
  async acceptNearestChange(closestWidget) {
    closestWidget = closestWidget ?? this._findClosestWidget();
    if (closestWidget instanceof DiffHunkWidget) {
      await closestWidget.accept();
      this.next(true);
    }
  }
  async toggleDiff(widget, show3) {
    if (!this._editor.hasModel()) {
      return;
    }
    let selection = this._editor.getSelection();
    if (widget instanceof DiffHunkWidget) {
      const lineNumber = widget.getStartLineNumber();
      const position2 = lineNumber ? new Position(lineNumber, 1) : void 0;
      if (position2 && !selection.containsPosition(position2)) {
        selection = Selection.fromPositions(position2);
      }
    }
    const isDiffEditor2 = this._editor.getOption(70 /* inDiffEditor */);
    if (show3 !== void 0 ? show3 : !isDiffEditor2) {
      const diffEditor = await this._editorService.openEditor({
        original: { resource: this._entry.originalURI },
        modified: { resource: this._entry.modifiedURI },
        options: { selection },
        label: localize(10824, null, basename2(this._entry.modifiedURI))
      });
      if (diffEditor && diffEditor.input) {
        diffEditor.getControl()?.setSelection(selection);
        const d = autorun((r2) => {
          const state = this._entry.state.read(r2);
          if (state === 1 /* Accepted */ || state === 2 /* Rejected */) {
            d.dispose();
            const editorIdents = [];
            for (const candidate of this._editorService.getEditors(0 /* MOST_RECENTLY_ACTIVE */)) {
              if (isDiffEditorInput(candidate.editor) && isEqual2(candidate.editor.original.resource, this._entry.originalURI) && isEqual2(candidate.editor.modified.resource, this._entry.modifiedURI)) {
                editorIdents.push(candidate);
              }
            }
            this._editorService.closeEditors(editorIdents);
          }
        });
      }
    } else {
      await this._editorService.openEditor({
        resource: this._entry.modifiedURI,
        options: {
          selection,
          selectionRevealType: 3 /* NearTopIfOutsideViewport */
        }
      });
    }
  }
};

ChatEditingCodeEditorIntegration = __decorateClass([
  __decorateParam(4, IEditorService),
  __decorateParam(5, IAccessibilitySignalService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IChatEditingService),
  __decorateParam(9, IChatEditingExplanationModelManager),
  __decorateParam(10, IChatWidgetService),
  __decorateParam(11, IViewsService)
], ChatEditingCodeEditorIntegration);

var DiffHunkWidget = class {
  constructor(_editor, _diffInfo, _change, _versionId, _lineDelta, instaService) {
    this._editor = _editor;
    this._diffInfo = _diffInfo;
    this._change = _change;
    this._versionId = _versionId;
    this._lineDelta = _lineDelta;
    this._id = `diff-change-widget-${DiffHunkWidget._idPool++}`;
    this._store = new DisposableStore();
    this._removed = false;
    this._domNode = document.createElement("div");
    this._domNode.className = "chat-diff-change-content-widget";
    const toolbar = instaService.createInstance(MenuWorkbenchToolBar, this._domNode, MenuId.ChatEditingEditorHunk, {
      telemetrySource: "chatEditingEditorHunk",
      hiddenItemStrategy: -1 /* NoHide */,
      toolbarOptions: { primaryGroup: () => true },
      menuOptions: {
        renderShortTitle: true,
        arg: this
      },
      actionViewItemProvider: (action, options3) => {
        const isPrimary = action.id === "chatEditor.action.acceptHunk";
        if (!action.class) {
          return new class extends ActionViewItem {
            constructor() {
              super(void 0, action, { ...options3, keybindingNotRenderedWithLabel: true, icon: false, label: true });
            }
            render(container2) {
              super.render(container2);
              if (isPrimary) {
                this.element?.classList.add("primary");
              }
            }
          }();
        }
        return void 0;
      }
    });
    this._store.add(toolbar);
    this._store.add(toolbar.actionRunner.onWillRun((_) => _editor.focus()));
    this._editor.addOverlayWidget(this);
  }
  static {
    this._idPool = 0;
  }
  update(diffInfo, change, versionId, lineDelta) {
    this._diffInfo = diffInfo;
    this._change = change;
    this._versionId = versionId;
    this._lineDelta = lineDelta;
  }
  dispose() {
    this._store.dispose();
    this._editor.removeOverlayWidget(this);
    this._removed = true;
  }
  getId() {
    return this._id;
  }
  layout(startLineNumber) {
    const lineHeight = this._editor.getOption(75 /* lineHeight */);
    const { contentLeft, contentWidth, verticalScrollbarWidth } = this._editor.getLayoutInfo();
    const scrollTop = this._editor.getScrollTop();
    this._position = {
      stackOrdinal: 1,
      preference: {
        top: this._editor.getTopForLineNumber(startLineNumber) - scrollTop - lineHeight * this._lineDelta,
        left: contentLeft + contentWidth - (2 * verticalScrollbarWidth + getTotalWidth(this._domNode))
      }
    };
    if (this._removed) {
      this._removed = false;
      this._editor.addOverlayWidget(this);
    } else {
      this._editor.layoutOverlayWidget(this);
    }
    this._lastStartLineNumber = startLineNumber;
  }
  remove() {
    this._editor.removeOverlayWidget(this);
    this._removed = true;
  }
  toggle(show3) {
    this._domNode.classList.toggle("hover", show3);
    if (this._lastStartLineNumber) {
      this.layout(this._lastStartLineNumber);
    }
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return this._position ?? null;
  }
  getStartLineNumber() {
    return this._lastStartLineNumber;
  }
  // ---
  async reject() {
    if (this._versionId !== this._editor.getModel()?.getVersionId()) {
      return false;
    }
    return await this._diffInfo.undo(this._change);
  }
  async accept() {
    if (this._versionId !== this._editor.getModel()?.getVersionId()) {
      return false;
    }
    return this._diffInfo.keep(this._change);
  }
};

DiffHunkWidget = __decorateClass([
  __decorateParam(5, IInstantiationService)
], DiffHunkWidget);

var AccessibleDiffViewContainer = class {
  constructor() {
    this._domNode = document.createElement("div");
    this._domNode.className = "accessible-diff-view";
    this._domNode.style.width = "100%";
    this._domNode.style.position = "absolute";
  }
  getId() {
    return "chatEdits.accessibleDiffView";
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return {
      preference: { top: 0, left: 0 },
      stackOrdinal: 1
    };
  }
};

var AccessibleDiffViewerModel = class {
  constructor(_documentDiffInfo, _editor) {
    this._documentDiffInfo = _documentDiffInfo;
    this._editor = _editor;
  }
  getOriginalModel() {
    return this._documentDiffInfo.get().originalModel;
  }
  getOriginalOptions() {
    return this._editor.getOptions();
  }
  originalReveal(range2) {
    const changes = this._documentDiffInfo.get().changes;
    const idx = changes.findIndex((value2) => value2.original.intersect(LineRange.fromRange(range2)));
    if (idx >= 0) {
      range2 = changes[idx].modified.toInclusiveRange() ?? range2;
    }
    this.modifiedReveal(range2);
  }
  getModifiedModel() {
    return this._editor.getModel();
  }
  getModifiedOptions() {
    return this._editor.getOptions();
  }
  modifiedReveal(range2) {
    if (range2) {
      this._editor.revealRange(range2);
      this._editor.setSelection(range2);
    }
    this._editor.focus();
  }
  modifiedSetSelection(range2) {
    this._editor.setSelection(range2);
  }
  modifiedFocus() {
    this._editor.focus();
  }
  getModifiedPosition() {
    return this._editor.getPosition() ?? void 0;
  }
};
export { ObjectPool, ChatEditingCodeEditorIntegration, DiffHunkWidget, AccessibleDiffViewContainer, AccessibleDiffViewerModel };
