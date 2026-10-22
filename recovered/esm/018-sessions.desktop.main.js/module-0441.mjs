// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/codeEditor/codeEditorWidget.ts
import { Disposable, dispose } from "./module-0012.mjs";
import { Emitter, createEventDeliveryQueue } from "./module-0017.mjs";
import { CodeEditorContributions } from "./module-0371.mjs";
import { MenuId } from "./module-0092.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { InternalEditorAction } from "./module-0372.mjs";
import { DragAndDropObserver, getWindow, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { EditorConfiguration } from "./module-0221.mjs";
import { EditorType } from "./module-0153.mjs";
import { WordOperations } from "./module-0123.mjs";
import { Position } from "./module-0079.mjs";
import { Range2 } from "./module-0106.mjs";
import { CursorColumns } from "./module-0110.mjs";
import { Selection } from "./module-0107.mjs";
import { isObject } from "./module-0010.mjs";
import { EditSources, TextModelEditSource } from "./module-0377.mjs";
import { filterFontDecorations, filterValidationDecorations } from "./module-0105.mjs";
import { hash } from "./module-0039.mjs";
import { applyFontInfo } from "./module-0213.mjs";
import { ViewModel } from "./module-0439.mjs";
import { DOMLineBreaksComputerFactory } from "./module-0370.mjs";
import { MonospaceLineBreaksComputerFactory } from "./module-0424.mjs";
import { localize } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { ViewUserInputEvents } from "./module-0283.mjs";
import { View } from "./module-0367.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IThemeService, registerThemingParticipant } from "./module-0287.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IUserInteractionService } from "./module-0366.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { TabFocus } from "./module-0219.mjs";
import { Schemas } from "./module-0033.mjs";
import { editorErrorForeground, editorHintForeground, editorInfoForeground, editorWarningForeground } from "./module-0229.mjs";
import { editorUnnecessaryCodeOpacity } from "./module-0288.mjs";


// src/vs/editor/browser/widget/codeEditor/codeEditorWidget.ts
var CodeEditorWidget = class extends Disposable {
  constructor(domElement, _options, codeEditorWidgetOptions, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService, userInteractionService) {
    super();
    this.languageConfigurationService = languageConfigurationService;
    //#region Eventing
    this._deliveryQueue = createEventDeliveryQueue();
    this._contributions = this._register(new CodeEditorContributions());
    this._onDidDispose = this._register(new Emitter());
    this.onDidDispose = this._onDidDispose.event;
    this._onDidChangeModelContent = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidChangeModelContent = this._onDidChangeModelContent.event;
    this._onDidChangeModelLanguage = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidChangeModelLanguage = this._onDidChangeModelLanguage.event;
    this._onDidChangeModelLanguageConfiguration = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidChangeModelLanguageConfiguration = this._onDidChangeModelLanguageConfiguration.event;
    this._onDidChangeModelOptions = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidChangeModelOptions = this._onDidChangeModelOptions.event;
    this._onDidChangeModelDecorations = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidChangeModelDecorations = this._onDidChangeModelDecorations.event;
    this._onDidChangeLineHeight = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidChangeLineHeight = this._onDidChangeLineHeight.event;
    this._onDidChangeFont = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidChangeFont = this._onDidChangeFont.event;
    this._onDidChangeModelTokens = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidChangeModelTokens = this._onDidChangeModelTokens.event;
    this._onDidChangeConfiguration = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    this._onWillChangeModel = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onWillChangeModel = this._onWillChangeModel.event;
    this._onDidChangeModel = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidChangeModel = this._onDidChangeModel.event;
    this._onDidChangeCursorPosition = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidChangeCursorPosition = this._onDidChangeCursorPosition.event;
    this._onDidChangeCursorSelection = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidChangeCursorSelection = this._onDidChangeCursorSelection.event;
    this._onDidAttemptReadOnlyEdit = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onDidAttemptReadOnlyEdit = this._onDidAttemptReadOnlyEdit.event;
    this._onDidLayoutChange = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidLayoutChange = this._onDidLayoutChange.event;
    this._editorTextFocus = this._register(new BooleanEventEmitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidFocusEditorText = this._editorTextFocus.onDidChangeToTrue;
    this.onDidBlurEditorText = this._editorTextFocus.onDidChangeToFalse;
    this._editorWidgetFocus = this._register(new BooleanEventEmitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidFocusEditorWidget = this._editorWidgetFocus.onDidChangeToTrue;
    this.onDidBlurEditorWidget = this._editorWidgetFocus.onDidChangeToFalse;
    this._onWillType = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onWillType = this._onWillType.event;
    this._onDidType = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onDidType = this._onDidType.event;
    this._onDidCompositionStart = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onDidCompositionStart = this._onDidCompositionStart.event;
    this._onDidCompositionEnd = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onDidCompositionEnd = this._onDidCompositionEnd.event;
    this._onDidPaste = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onDidPaste = this._onDidPaste.event;
    this._onWillCopy = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onWillCopy = this._onWillCopy.event;
    this._onWillCut = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onWillCut = this._onWillCut.event;
    this._onWillPaste = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onWillPaste = this._onWillPaste.event;
    this._onMouseUp = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onMouseUp = this._onMouseUp.event;
    this._onMouseDown = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onMouseDown = this._onMouseDown.event;
    this._onMouseDrag = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onMouseDrag = this._onMouseDrag.event;
    this._onMouseDrop = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onMouseDrop = this._onMouseDrop.event;
    this._onMouseDropCanceled = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onMouseDropCanceled = this._onMouseDropCanceled.event;
    this._onDropIntoEditor = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onDropIntoEditor = this._onDropIntoEditor.event;
    this._onContextMenu = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onContextMenu = this._onContextMenu.event;
    this._onMouseMove = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onMouseMove = this._onMouseMove.event;
    this._onMouseLeave = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onMouseLeave = this._onMouseLeave.event;
    this._onMouseWheel = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onMouseWheel = this._onMouseWheel.event;
    this._onKeyUp = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onKeyUp = this._onKeyUp.event;
    this._onKeyDown = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
    this.onKeyDown = this._onKeyDown.event;
    this._onDidContentSizeChange = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidContentSizeChange = this._onDidContentSizeChange.event;
    this._onDidScrollChange = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidScrollChange = this._onDidScrollChange.event;
    this._onDidChangeViewZones = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidChangeViewZones = this._onDidChangeViewZones.event;
    this._onDidChangeHiddenAreas = this._register(new Emitter({ deliveryQueue: this._deliveryQueue }));
    this.onDidChangeHiddenAreas = this._onDidChangeHiddenAreas.event;
    this._updateCounter = 0;
    this._onWillTriggerEditorOperationEvent = this._register(new Emitter());
    this.onWillTriggerEditorOperationEvent = this._onWillTriggerEditorOperationEvent.event;
    this._onBeginUpdate = this._register(new Emitter());
    this.onBeginUpdate = this._onBeginUpdate.event;
    this._onEndUpdate = this._register(new Emitter());
    this.onEndUpdate = this._onEndUpdate.event;
    this._onBeforeExecuteEdit = this._register(new Emitter());
    this.onBeforeExecuteEdit = this._onBeforeExecuteEdit.event;
    this._actions = /* @__PURE__ */ new Map();
    this._bannerDomNode = null;
    this._dropIntoEditorDecorations = this.createDecorationsCollection();
    this.inComposition = false;
    codeEditorService.willCreateCodeEditor();
    const options3 = { ..._options };
    this._domElement = domElement;
    this._userInteractionService = userInteractionService;
    this._overflowWidgetsDomNode = options3.overflowWidgetsDomNode;
    delete options3.overflowWidgetsDomNode;
    this._id = ++EDITOR_ID;
    this._decorationTypeKeysToIds = {};
    this._decorationTypeSubtypes = {};
    this._telemetryData = codeEditorWidgetOptions.telemetryData;
    this._configuration = this._register(this._createConfiguration(
      codeEditorWidgetOptions.isSimpleWidget || false,
      codeEditorWidgetOptions.contextMenuId ?? (codeEditorWidgetOptions.isSimpleWidget ? MenuId.SimpleEditorContext : MenuId.EditorContext),
      options3,
      accessibilityService
    ));
    this._domElement.style?.setProperty("--editor-font-size", this._configuration.options.get(61 /* fontSize */) + "px");
    this._register(this._configuration.onDidChange((e4) => {
      this._onDidChangeConfiguration.fire(e4);
      const options4 = this._configuration.options;
      if (e4.hasChanged(165 /* layoutInfo */)) {
        const layoutInfo = options4.get(165 /* layoutInfo */);
        this._onDidLayoutChange.fire(layoutInfo);
      }
      if (e4.hasChanged(61 /* fontSize */)) {
        this._domElement.style.setProperty("--editor-font-size", options4.get(61 /* fontSize */) + "px");
      }
    }));
    this._contextKeyService = this._register(contextKeyService.createScoped(this._domElement));
    if (codeEditorWidgetOptions.contextKeyValues) {
      for (const [key3, value2] of Object.entries(codeEditorWidgetOptions.contextKeyValues)) {
        this._contextKeyService.createKey(key3, value2);
      }
    }
    this._notificationService = notificationService;
    this._codeEditorService = codeEditorService;
    this._commandService = commandService;
    this._themeService = themeService;
    this._register(new EditorContextKeysManager(this, this._contextKeyService));
    this._register(new EditorModeContext(this, this._contextKeyService, languageFeaturesService));
    this._instantiationService = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, this._contextKeyService])));
    this._modelData = null;
    this._contentWidgets = {};
    this._overlayWidgets = {};
    this._glyphMarginWidgets = {};
    let contributions;
    if (Array.isArray(codeEditorWidgetOptions.contributions)) {
      contributions = codeEditorWidgetOptions.contributions;
    } else {
      contributions = EditorExtensionsRegistry.getEditorContributions();
    }
    this._contributions.initialize(this, contributions, this._instantiationService);
    for (const action of EditorExtensionsRegistry.getEditorActions()) {
      if (this._actions.has(action.id)) {
        onUnexpectedError(new Error(`Cannot have two actions with the same id ${action.id}`));
        continue;
      }
      const internalAction = new InternalEditorAction(
        action.id,
        action.label,
        action.alias,
        action.metadata,
        action.precondition ?? void 0,
        (args2) => {
          return this._instantiationService.invokeFunction((accessor) => {
            return Promise.resolve(action.runEditorCommand(accessor, this, args2));
          });
        },
        this._contextKeyService
      );
      this._actions.set(internalAction.id, internalAction);
    }
    const isDropIntoEnabled = () => {
      return !this._configuration.options.get(104 /* readOnly */) && this._configuration.options.get(43 /* dropIntoEditor */).enabled;
    };
    this._register(new DragAndDropObserver(this._domElement, {
      onDragOver: (e4) => {
        if (!isDropIntoEnabled()) {
          return;
        }
        const target = this.getTargetAtClientPoint(e4.clientX, e4.clientY);
        if (target?.position) {
          this.showDropIndicatorAt(target.position);
        }
      },
      onDrop: async (e4) => {
        if (!isDropIntoEnabled()) {
          return;
        }
        this.removeDropIndicator();
        if (!e4.dataTransfer) {
          return;
        }
        const target = this.getTargetAtClientPoint(e4.clientX, e4.clientY);
        if (target?.position) {
          this._onDropIntoEditor.fire({ position: target.position, event: e4 });
        }
      },
      onDragLeave: () => {
        this.removeDropIndicator();
      },
      onDragEnd: () => {
        this.removeDropIndicator();
      }
    }));
    this._codeEditorService.addCodeEditor(this);
  }
  static {
    this.dropIntoEditorDecorationOptions = ModelDecorationOptions.register({
      description: "workbench-dnd-target",
      className: "dnd-target"
    });
  }
  //#endregion
  get isSimpleWidget() {
    return this._configuration.isSimpleWidget;
  }
  get contextMenuId() {
    return this._configuration.contextMenuId;
  }
  get contextKeyService() {
    return this._contextKeyService;
  }
  writeScreenReaderContent(reason) {
    this._modelData?.view.writeScreenReaderContent(reason);
  }
  _createConfiguration(isSimpleWidget, contextMenuId, options3, accessibilityService) {
    return new EditorConfiguration(isSimpleWidget, contextMenuId, options3, this._domElement, accessibilityService);
  }
  getId() {
    return this.getEditorType() + ":" + this._id;
  }
  getEditorType() {
    return EditorType.ICodeEditor;
  }
  dispose() {
    this._codeEditorService.removeCodeEditor(this);
    this._actions.clear();
    this._contentWidgets = {};
    this._overlayWidgets = {};
    this._removeDecorationTypes();
    this._postDetachModelCleanup(this._detachModel());
    this._onDidDispose.fire();
    super.dispose();
  }
  invokeWithinContext(fn) {
    return this._instantiationService.invokeFunction(fn);
  }
  updateOptions(newOptions) {
    this._configuration.updateOptions(newOptions || {});
  }
  getOptions() {
    return this._configuration.options;
  }
  getOption(id2) {
    return this._configuration.options.get(id2);
  }
  getRawOptions() {
    return this._configuration.getRawOptions();
  }
  getOverflowWidgetsDomNode() {
    return this._overflowWidgetsDomNode;
  }
  getConfiguredWordAtPosition(position2) {
    if (!this._modelData) {
      return null;
    }
    return WordOperations.getWordAtPosition(this._modelData.model, this._configuration.options.get(148 /* wordSeparators */), this._configuration.options.get(147 /* wordSegmenterLocales */), position2);
  }
  getValue(options3 = null) {
    if (!this._modelData) {
      return "";
    }
    const preserveBOM = options3 && options3.preserveBOM ? true : false;
    let eolPreference = 0 /* TextDefined */;
    if (options3 && options3.lineEnding && options3.lineEnding === "\n") {
      eolPreference = 1 /* LF */;
    } else if (options3 && options3.lineEnding && options3.lineEnding === "\r\n") {
      eolPreference = 2 /* CRLF */;
    }
    return this._modelData.model.getValue(eolPreference, preserveBOM);
  }
  setValue(newValue) {
    try {
      this._beginUpdate();
      if (!this._modelData) {
        return;
      }
      this._modelData.model.setValue(newValue);
    } finally {
      this._endUpdate();
    }
  }
  getModel() {
    if (!this._modelData) {
      return null;
    }
    return this._modelData.model;
  }
  setModel(_model = null) {
    try {
      this._beginUpdate();
      const model = _model;
      if (this._modelData === null && model === null) {
        return;
      }
      if (this._modelData && this._modelData.model === model) {
        return;
      }
      const e4 = {
        oldModelUrl: this._modelData?.model.uri || null,
        newModelUrl: model?.uri || null
      };
      this._onWillChangeModel.fire(e4);
      const hasTextFocus = this.hasTextFocus();
      const detachedModel = this._detachModel();
      this._attachModel(model);
      if (this.hasModel()) {
        if (hasTextFocus) {
          this.focus();
        }
      } else {
        this._editorTextFocus.setValue(false);
        this._editorWidgetFocus.setValue(false);
      }
      this._removeDecorationTypes();
      this._onDidChangeModel.fire(e4);
      this._postDetachModelCleanup(detachedModel);
      this._contributionsDisposable = this._contributions.onAfterModelAttached();
    } finally {
      this._endUpdate();
    }
  }
  _removeDecorationTypes() {
    this._decorationTypeKeysToIds = {};
    if (this._decorationTypeSubtypes) {
      for (const decorationType in this._decorationTypeSubtypes) {
        const subTypes = this._decorationTypeSubtypes[decorationType];
        for (const subType in subTypes) {
          this._removeDecorationType(decorationType + "-" + subType);
        }
      }
      this._decorationTypeSubtypes = {};
    }
  }
  getVisibleRanges() {
    if (!this._modelData) {
      return [];
    }
    return this._modelData.viewModel.getVisibleRanges();
  }
  getVisibleRangesPlusViewportAboveBelow() {
    if (!this._modelData) {
      return [];
    }
    return this._modelData.viewModel.getVisibleRangesPlusViewportAboveBelow();
  }
  getWhitespaces() {
    if (!this._modelData) {
      return [];
    }
    return this._modelData.viewModel.viewLayout.getWhitespaces();
  }
  static _getVerticalOffsetAfterPosition(modelData, modelLineNumber, modelColumn, includeViewZones) {
    const modelPosition = modelData.model.validatePosition({
      lineNumber: modelLineNumber,
      column: modelColumn
    });
    const viewPosition = modelData.viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
    return modelData.viewModel.viewLayout.getVerticalOffsetAfterLineNumber(viewPosition.lineNumber, includeViewZones);
  }
  getTopForLineNumber(lineNumber, includeViewZones = false) {
    if (!this._modelData) {
      return -1;
    }
    return CodeEditorWidget._getVerticalOffsetForPosition(this._modelData, lineNumber, 1, includeViewZones);
  }
  getTopForPosition(lineNumber, column) {
    if (!this._modelData) {
      return -1;
    }
    return CodeEditorWidget._getVerticalOffsetForPosition(this._modelData, lineNumber, column, false);
  }
  static _getVerticalOffsetForPosition(modelData, modelLineNumber, modelColumn, includeViewZones = false) {
    const modelPosition = modelData.model.validatePosition({
      lineNumber: modelLineNumber,
      column: modelColumn
    });
    const viewPosition = modelData.viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
    return modelData.viewModel.viewLayout.getVerticalOffsetForLineNumber(viewPosition.lineNumber, includeViewZones);
  }
  getBottomForLineNumber(lineNumber, includeViewZones = false) {
    if (!this._modelData) {
      return -1;
    }
    return CodeEditorWidget._getVerticalOffsetAfterPosition(this._modelData, lineNumber, Number.MAX_SAFE_INTEGER, includeViewZones);
  }
  getLineHeightForPosition(position2) {
    if (!this._modelData) {
      return -1;
    }
    const viewModel = this._modelData.viewModel;
    const coordinatesConverter = viewModel.coordinatesConverter;
    const pos = Position.lift(position2);
    if (coordinatesConverter.modelPositionIsVisible(pos)) {
      const viewPosition = coordinatesConverter.convertModelPositionToViewPosition(pos);
      return viewModel.viewLayout.getLineHeightForLineNumber(viewPosition.lineNumber);
    }
    return 0;
  }
  setHiddenAreas(ranges, source, forceUpdate) {
    this._modelData?.viewModel.setHiddenAreas(ranges.map((r2) => Range2.lift(r2)), source, forceUpdate);
  }
  getVisibleColumnFromPosition(rawPosition) {
    if (!this._modelData) {
      return rawPosition.column;
    }
    const position2 = this._modelData.model.validatePosition(rawPosition);
    const tabSize = this._modelData.model.getOptions().tabSize;
    return CursorColumns.visibleColumnFromColumn(this._modelData.model.getLineContent(position2.lineNumber), position2.column, tabSize) + 1;
  }
  getStatusbarColumn(rawPosition) {
    if (!this._modelData) {
      return rawPosition.column;
    }
    const position2 = this._modelData.model.validatePosition(rawPosition);
    const tabSize = this._modelData.model.getOptions().tabSize;
    return CursorColumns.toStatusbarColumn(this._modelData.model.getLineContent(position2.lineNumber), position2.column, tabSize);
  }
  getPosition() {
    if (!this._modelData) {
      return null;
    }
    return this._modelData.viewModel.getPosition();
  }
  setPosition(position2, source = "api") {
    if (!this._modelData) {
      return;
    }
    if (!Position.isIPosition(position2)) {
      throw new Error("Invalid arguments");
    }
    this._modelData.viewModel.setSelections(source, [{
      selectionStartLineNumber: position2.lineNumber,
      selectionStartColumn: position2.column,
      positionLineNumber: position2.lineNumber,
      positionColumn: position2.column
    }]);
  }
  _sendRevealRange(modelRange, verticalType, revealHorizontal, scrollType) {
    if (!this._modelData) {
      return;
    }
    if (!Range2.isIRange(modelRange)) {
      throw new Error("Invalid arguments");
    }
    const validatedModelRange = this._modelData.model.validateRange(modelRange);
    const viewRange = this._modelData.viewModel.coordinatesConverter.convertModelRangeToViewRange(validatedModelRange);
    this._modelData.viewModel.revealRange("api", revealHorizontal, viewRange, verticalType, scrollType);
  }
  revealAllCursors(revealHorizontal, minimalReveal) {
    if (!this._modelData) {
      return;
    }
    this._modelData.viewModel.revealAllCursors("api", revealHorizontal, minimalReveal);
  }
  revealLine(lineNumber, scrollType = 0 /* Smooth */) {
    this._revealLine(lineNumber, 0 /* Simple */, scrollType);
  }
  revealLineInCenter(lineNumber, scrollType = 0 /* Smooth */) {
    this._revealLine(lineNumber, 1 /* Center */, scrollType);
  }
  revealLineInCenterIfOutsideViewport(lineNumber, scrollType = 0 /* Smooth */) {
    this._revealLine(lineNumber, 2 /* CenterIfOutsideViewport */, scrollType);
  }
  revealLineNearTop(lineNumber, scrollType = 0 /* Smooth */) {
    this._revealLine(lineNumber, 5 /* NearTop */, scrollType);
  }
  _revealLine(lineNumber, revealType, scrollType) {
    if (typeof lineNumber !== "number") {
      throw new Error("Invalid arguments");
    }
    this._sendRevealRange(
      new Range2(lineNumber, 1, lineNumber, 1),
      revealType,
      false,
      scrollType
    );
  }
  revealPosition(position2, scrollType = 0 /* Smooth */) {
    this._revealPosition(
      position2,
      0 /* Simple */,
      true,
      scrollType
    );
  }
  revealPositionInCenter(position2, scrollType = 0 /* Smooth */) {
    this._revealPosition(
      position2,
      1 /* Center */,
      true,
      scrollType
    );
  }
  revealPositionInCenterIfOutsideViewport(position2, scrollType = 0 /* Smooth */) {
    this._revealPosition(
      position2,
      2 /* CenterIfOutsideViewport */,
      true,
      scrollType
    );
  }
  revealPositionNearTop(position2, scrollType = 0 /* Smooth */) {
    this._revealPosition(
      position2,
      5 /* NearTop */,
      true,
      scrollType
    );
  }
  _revealPosition(position2, verticalType, revealHorizontal, scrollType) {
    if (!Position.isIPosition(position2)) {
      throw new Error("Invalid arguments");
    }
    this._sendRevealRange(
      new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column),
      verticalType,
      revealHorizontal,
      scrollType
    );
  }
  getSelection() {
    if (!this._modelData) {
      return null;
    }
    return this._modelData.viewModel.getSelection();
  }
  getSelections() {
    if (!this._modelData) {
      return null;
    }
    return this._modelData.viewModel.getSelections();
  }
  setSelection(something, source = "api") {
    const isSelection = Selection.isISelection(something);
    const isRange = Range2.isIRange(something);
    if (!isSelection && !isRange) {
      throw new Error("Invalid arguments");
    }
    if (isSelection) {
      this._setSelectionImpl(something, source);
    } else if (isRange) {
      const selection = {
        selectionStartLineNumber: something.startLineNumber,
        selectionStartColumn: something.startColumn,
        positionLineNumber: something.endLineNumber,
        positionColumn: something.endColumn
      };
      this._setSelectionImpl(selection, source);
    }
  }
  _setSelectionImpl(sel, source) {
    if (!this._modelData) {
      return;
    }
    const selection = new Selection(sel.selectionStartLineNumber, sel.selectionStartColumn, sel.positionLineNumber, sel.positionColumn);
    this._modelData.viewModel.setSelections(source, [selection]);
  }
  revealLines(startLineNumber, endLineNumber, scrollType = 0 /* Smooth */) {
    this._revealLines(
      startLineNumber,
      endLineNumber,
      0 /* Simple */,
      scrollType
    );
  }
  revealLinesInCenter(startLineNumber, endLineNumber, scrollType = 0 /* Smooth */) {
    this._revealLines(
      startLineNumber,
      endLineNumber,
      1 /* Center */,
      scrollType
    );
  }
  revealLinesInCenterIfOutsideViewport(startLineNumber, endLineNumber, scrollType = 0 /* Smooth */) {
    this._revealLines(
      startLineNumber,
      endLineNumber,
      2 /* CenterIfOutsideViewport */,
      scrollType
    );
  }
  revealLinesNearTop(startLineNumber, endLineNumber, scrollType = 0 /* Smooth */) {
    this._revealLines(
      startLineNumber,
      endLineNumber,
      5 /* NearTop */,
      scrollType
    );
  }
  _revealLines(startLineNumber, endLineNumber, verticalType, scrollType) {
    if (typeof startLineNumber !== "number" || typeof endLineNumber !== "number") {
      throw new Error("Invalid arguments");
    }
    this._sendRevealRange(
      new Range2(startLineNumber, 1, endLineNumber, 1),
      verticalType,
      false,
      scrollType
    );
  }
  revealRange(range2, scrollType = 0 /* Smooth */, revealVerticalInCenter = false, revealHorizontal = true) {
    this._revealRange(
      range2,
      revealVerticalInCenter ? 1 /* Center */ : 0 /* Simple */,
      revealHorizontal,
      scrollType
    );
  }
  revealRangeInCenter(range2, scrollType = 0 /* Smooth */) {
    this._revealRange(
      range2,
      1 /* Center */,
      true,
      scrollType
    );
  }
  revealRangeInCenterIfOutsideViewport(range2, scrollType = 0 /* Smooth */) {
    this._revealRange(
      range2,
      2 /* CenterIfOutsideViewport */,
      true,
      scrollType
    );
  }
  revealRangeNearTop(range2, scrollType = 0 /* Smooth */) {
    this._revealRange(
      range2,
      5 /* NearTop */,
      true,
      scrollType
    );
  }
  revealRangeNearTopIfOutsideViewport(range2, scrollType = 0 /* Smooth */) {
    this._revealRange(
      range2,
      6 /* NearTopIfOutsideViewport */,
      true,
      scrollType
    );
  }
  revealRangeAtTop(range2, scrollType = 0 /* Smooth */) {
    this._revealRange(
      range2,
      3 /* Top */,
      true,
      scrollType
    );
  }
  _revealRange(range2, verticalType, revealHorizontal, scrollType) {
    if (!Range2.isIRange(range2)) {
      throw new Error("Invalid arguments");
    }
    this._sendRevealRange(
      Range2.lift(range2),
      verticalType,
      revealHorizontal,
      scrollType
    );
  }
  setSelections(ranges, source = "api", reason = 0 /* NotSet */) {
    if (!this._modelData) {
      return;
    }
    if (!ranges || ranges.length === 0) {
      throw new Error("Invalid arguments");
    }
    for (let i2 = 0, len = ranges.length; i2 < len; i2++) {
      if (!Selection.isISelection(ranges[i2])) {
        throw new Error("Invalid arguments");
      }
    }
    this._modelData.viewModel.setSelections(source, ranges, reason);
  }
  getContentWidth() {
    if (!this._modelData) {
      return -1;
    }
    return this._modelData.viewModel.viewLayout.getContentWidth();
  }
  getScrollWidth() {
    if (!this._modelData) {
      return -1;
    }
    return this._modelData.viewModel.viewLayout.getScrollWidth();
  }
  getScrollLeft() {
    if (!this._modelData) {
      return -1;
    }
    return this._modelData.viewModel.viewLayout.getCurrentScrollLeft();
  }
  getContentHeight() {
    if (!this._modelData) {
      return -1;
    }
    return this._modelData.viewModel.viewLayout.getContentHeight();
  }
  getScrollHeight() {
    if (!this._modelData) {
      return -1;
    }
    return this._modelData.viewModel.viewLayout.getScrollHeight();
  }
  getScrollTop() {
    if (!this._modelData) {
      return -1;
    }
    return this._modelData.viewModel.viewLayout.getCurrentScrollTop();
  }
  setScrollLeft(newScrollLeft, scrollType = 1 /* Immediate */) {
    if (!this._modelData) {
      return;
    }
    if (typeof newScrollLeft !== "number") {
      throw new Error("Invalid arguments");
    }
    this._modelData.viewModel.viewLayout.setScrollPosition({
      scrollLeft: newScrollLeft
    }, scrollType);
  }
  setScrollTop(newScrollTop, scrollType = 1 /* Immediate */) {
    if (!this._modelData) {
      return;
    }
    if (typeof newScrollTop !== "number") {
      throw new Error("Invalid arguments");
    }
    this._modelData.viewModel.viewLayout.setScrollPosition({
      scrollTop: newScrollTop
    }, scrollType);
  }
  setScrollPosition(position2, scrollType = 1 /* Immediate */) {
    if (!this._modelData) {
      return;
    }
    this._modelData.viewModel.viewLayout.setScrollPosition(position2, scrollType);
  }
  hasPendingScrollAnimation() {
    if (!this._modelData) {
      return false;
    }
    return this._modelData.viewModel.viewLayout.hasPendingScrollAnimation();
  }
  saveViewState() {
    if (!this._modelData) {
      return null;
    }
    const contributionsState = this._contributions.saveViewState();
    const cursorState = this._modelData.viewModel.saveCursorState();
    const viewState = this._modelData.viewModel.saveState();
    return {
      cursorState,
      viewState,
      contributionsState
    };
  }
  restoreViewState(s) {
    if (!this._modelData || !this._modelData.hasRealView) {
      return;
    }
    const codeEditorState = s;
    if (codeEditorState && codeEditorState.cursorState && codeEditorState.viewState) {
      const cursorState = codeEditorState.cursorState;
      if (Array.isArray(cursorState)) {
        if (cursorState.length > 0) {
          this._modelData.viewModel.restoreCursorState(cursorState);
        }
      } else {
        this._modelData.viewModel.restoreCursorState([cursorState]);
      }
      this._contributions.restoreViewState(codeEditorState.contributionsState || {});
      const reducedState = this._modelData.viewModel.reduceRestoreState(codeEditorState.viewState);
      this._modelData.view.restoreState(reducedState);
    }
  }
  handleInitialized() {
    this._getViewModel()?.visibleLinesStabilized();
  }
  onVisible() {
    this._modelData?.view.refreshFocusState();
  }
  onHide() {
    this._modelData?.view.refreshFocusState();
  }
  getContribution(id2) {
    return this._contributions.get(id2);
  }
  getActions() {
    return Array.from(this._actions.values());
  }
  getSupportedActions() {
    let result = this.getActions();
    result = result.filter((action) => action.isSupported());
    return result;
  }
  getAction(id2) {
    return this._actions.get(id2) || null;
  }
  trigger(source, handlerId, payload) {
    payload = payload || {};
    try {
      this._onWillTriggerEditorOperationEvent.fire({ source, handlerId, payload });
      this._beginUpdate();
      switch (handlerId) {
        case "compositionStart" /* CompositionStart */:
          this._startComposition();
          return;
        case "compositionEnd" /* CompositionEnd */:
          this._endComposition(source);
          return;
        case "type" /* Type */: {
          const args2 = payload;
          this._type(source, args2.text || "");
          return;
        }
        case "replacePreviousChar" /* ReplacePreviousChar */: {
          const args2 = payload;
          this._compositionType(source, args2.text || "", args2.replaceCharCnt || 0, 0, 0);
          return;
        }
        case "compositionType" /* CompositionType */: {
          const args2 = payload;
          this._compositionType(source, args2.text || "", args2.replacePrevCharCnt || 0, args2.replaceNextCharCnt || 0, args2.positionDelta || 0);
          return;
        }
        case "paste" /* Paste */: {
          const args2 = payload;
          this._paste(source, args2.text || "", args2.pasteOnNewLine || false, args2.multicursorText || null, args2.mode || null, args2.clipboardEvent);
          return;
        }
        case "cut" /* Cut */:
          this._cut(source);
          return;
      }
      const action = this.getAction(handlerId);
      if (action) {
        Promise.resolve(action.run(payload)).then(void 0, onUnexpectedError);
        return;
      }
      if (!this._modelData) {
        return;
      }
      if (this._triggerEditorCommand(source, handlerId, payload)) {
        return;
      }
      this._triggerCommand(handlerId, payload);
    } finally {
      this._endUpdate();
    }
  }
  _triggerCommand(handlerId, payload) {
    this._commandService.executeCommand(handlerId, payload);
  }
  _startComposition() {
    if (!this._modelData) {
      return;
    }
    this.inComposition = true;
    this._modelData.viewModel.startComposition();
    this._onDidCompositionStart.fire();
  }
  _endComposition(source) {
    if (!this._modelData) {
      return;
    }
    this.inComposition = false;
    this._modelData.viewModel.endComposition(source);
    this._onDidCompositionEnd.fire();
  }
  _type(source, text2) {
    if (!this._modelData || text2.length === 0) {
      return;
    }
    if (source === "keyboard") {
      this._onWillType.fire(text2);
    }
    this._modelData.viewModel.type(text2, source);
    if (source === "keyboard") {
      this._onDidType.fire(text2);
    }
  }
  _compositionType(source, text2, replacePrevCharCnt, replaceNextCharCnt, positionDelta) {
    if (!this._modelData) {
      return;
    }
    this._modelData.viewModel.compositionType(text2, replacePrevCharCnt, replaceNextCharCnt, positionDelta, source);
  }
  _paste(source, text2, pasteOnNewLine, multicursorText, mode, clipboardEvent) {
    if (!this._modelData) {
      return;
    }
    const viewModel = this._modelData.viewModel;
    const startPosition = viewModel.getSelection().getStartPosition();
    viewModel.paste(text2, pasteOnNewLine, multicursorText, source);
    const endPosition = viewModel.getSelection().getStartPosition();
    if (source === "keyboard") {
      this._onDidPaste.fire({
        clipboardEvent,
        range: new Range2(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column),
        languageId: mode
      });
    }
  }
  _cut(source) {
    if (!this._modelData) {
      return;
    }
    this._modelData.viewModel.cut(source);
  }
  _triggerEditorCommand(source, handlerId, payload) {
    const command4 = EditorExtensionsRegistry.getEditorCommand(handlerId);
    if (command4) {
      payload = payload || {};
      if (isObject(payload)) {
        payload.source = source;
      }
      this._instantiationService.invokeFunction((accessor) => {
        Promise.resolve(command4.runEditorCommand(accessor, this, payload)).then(void 0, onUnexpectedError);
      });
      return true;
    }
    return false;
  }
  _getViewModel() {
    if (!this._modelData) {
      return null;
    }
    return this._modelData.viewModel;
  }
  pushUndoStop() {
    if (!this._modelData) {
      return false;
    }
    if (this._configuration.options.get(104 /* readOnly */)) {
      return false;
    }
    this._modelData.model.pushStackElement();
    return true;
  }
  popUndoStop() {
    if (!this._modelData) {
      return false;
    }
    if (this._configuration.options.get(104 /* readOnly */)) {
      return false;
    }
    this._modelData.model.popStackElement();
    return true;
  }
  edit(edit3, reason) {
    return this.executeEdits(reason, edit3.replacements.map((e4) => ({ range: e4.range, text: e4.text })), void 0);
  }
  executeEdits(source, edits, endCursorState) {
    if (!this._modelData) {
      return false;
    }
    if (this._configuration.options.get(104 /* readOnly */)) {
      return false;
    }
    let cursorStateComputer;
    if (!endCursorState) {
      cursorStateComputer = () => null;
    } else if (Array.isArray(endCursorState)) {
      cursorStateComputer = () => endCursorState;
    } else {
      cursorStateComputer = endCursorState;
    }
    let sourceStr;
    let reason;
    if (source instanceof TextModelEditSource) {
      reason = source;
      sourceStr = source.metadata.source;
    } else {
      reason = EditSources.unknown({ name: source });
      sourceStr = source;
    }
    this._onBeforeExecuteEdit.fire({ source: sourceStr ?? void 0 });
    this._modelData.viewModel.executeEdits(sourceStr, edits, cursorStateComputer, reason);
    return true;
  }
  executeCommand(source, command4) {
    if (!this._modelData) {
      return;
    }
    this._modelData.viewModel.executeCommand(command4, source);
  }
  executeCommands(source, commands) {
    if (!this._modelData) {
      return;
    }
    this._modelData.viewModel.executeCommands(commands, source);
  }
  createDecorationsCollection(decorations) {
    return new EditorDecorationsCollection(this, decorations);
  }
  changeDecorations(callback) {
    if (!this._modelData) {
      return null;
    }
    return this._modelData.model.changeDecorations(callback, this._id);
  }
  getLineDecorations(lineNumber) {
    if (!this._modelData) {
      return null;
    }
    const options3 = this._configuration.options;
    return this._modelData.model.getLineDecorations(lineNumber, this._id, filterValidationDecorations(options3), filterFontDecorations(options3));
  }
  getDecorationsInRange(range2) {
    if (!this._modelData) {
      return null;
    }
    const options3 = this._configuration.options;
    return this._modelData.model.getDecorationsInRange(range2, this._id, filterValidationDecorations(options3), filterFontDecorations(options3));
  }
  getFontSizeAtPosition(position2) {
    if (!this._modelData) {
      return null;
    }
    return this._modelData.viewModel.getFontSizeAtPosition(position2);
  }
  /**
   * @deprecated
   */
  deltaDecorations(oldDecorations, newDecorations) {
    if (!this._modelData) {
      return [];
    }
    if (oldDecorations.length === 0 && newDecorations.length === 0) {
      return oldDecorations;
    }
    return this._modelData.model.deltaDecorations(oldDecorations, newDecorations, this._id);
  }
  removeDecorations(decorationIds) {
    if (!this._modelData || decorationIds.length === 0) {
      return;
    }
    this._modelData.model.changeDecorations((changeAccessor) => {
      changeAccessor.deltaDecorations(decorationIds, []);
    });
  }
  setDecorationsByType(description, decorationTypeKey, decorationOptions) {
    const newDecorationsSubTypes = {};
    const oldDecorationsSubTypes = this._decorationTypeSubtypes[decorationTypeKey] || {};
    this._decorationTypeSubtypes[decorationTypeKey] = newDecorationsSubTypes;
    const newModelDecorations = [];
    for (const decorationOption of decorationOptions) {
      let typeKey = decorationTypeKey;
      if (decorationOption.renderOptions) {
        const subType = hash(decorationOption.renderOptions).toString(16);
        typeKey = decorationTypeKey + "-" + subType;
        if (!oldDecorationsSubTypes[subType] && !newDecorationsSubTypes[subType]) {
          this._registerDecorationType(description, typeKey, decorationOption.renderOptions, decorationTypeKey);
        }
        newDecorationsSubTypes[subType] = true;
      }
      const opts = this._resolveDecorationOptions(typeKey, !!decorationOption.hoverMessage);
      if (decorationOption.hoverMessage) {
        opts.hoverMessage = decorationOption.hoverMessage;
      }
      newModelDecorations.push({ range: decorationOption.range, options: opts });
    }
    for (const subType in oldDecorationsSubTypes) {
      if (!newDecorationsSubTypes[subType]) {
        this._removeDecorationType(decorationTypeKey + "-" + subType);
      }
    }
    const oldDecorationsIds = this._decorationTypeKeysToIds[decorationTypeKey] || [];
    this.changeDecorations((accessor) => this._decorationTypeKeysToIds[decorationTypeKey] = accessor.deltaDecorations(oldDecorationsIds, newModelDecorations));
    return this._decorationTypeKeysToIds[decorationTypeKey] || [];
  }
  setDecorationsByTypeFast(decorationTypeKey, ranges) {
    const oldDecorationsSubTypes = this._decorationTypeSubtypes[decorationTypeKey] || {};
    for (const subType in oldDecorationsSubTypes) {
      this._removeDecorationType(decorationTypeKey + "-" + subType);
    }
    this._decorationTypeSubtypes[decorationTypeKey] = {};
    const opts = ModelDecorationOptions.createDynamic(this._resolveDecorationOptions(decorationTypeKey, false));
    const newModelDecorations = new Array(ranges.length);
    for (let i2 = 0, len = ranges.length; i2 < len; i2++) {
      newModelDecorations[i2] = { range: ranges[i2], options: opts };
    }
    const oldDecorationsIds = this._decorationTypeKeysToIds[decorationTypeKey] || [];
    this.changeDecorations((accessor) => this._decorationTypeKeysToIds[decorationTypeKey] = accessor.deltaDecorations(oldDecorationsIds, newModelDecorations));
  }
  removeDecorationsByType(decorationTypeKey) {
    const oldDecorationsIds = this._decorationTypeKeysToIds[decorationTypeKey];
    if (oldDecorationsIds) {
      this.changeDecorations((accessor) => accessor.deltaDecorations(oldDecorationsIds, []));
    }
    if (this._decorationTypeKeysToIds.hasOwnProperty(decorationTypeKey)) {
      delete this._decorationTypeKeysToIds[decorationTypeKey];
    }
    if (this._decorationTypeSubtypes.hasOwnProperty(decorationTypeKey)) {
      const items = this._decorationTypeSubtypes[decorationTypeKey];
      for (const subType of Object.keys(items)) {
        this._removeDecorationType(decorationTypeKey + "-" + subType);
      }
      delete this._decorationTypeSubtypes[decorationTypeKey];
    }
  }
  getLayoutInfo() {
    const options3 = this._configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    return layoutInfo;
  }
  createOverviewRuler(cssClassName) {
    if (!this._modelData || !this._modelData.hasRealView) {
      return null;
    }
    return this._modelData.view.createOverviewRuler(cssClassName);
  }
  getContainerDomNode() {
    return this._domElement;
  }
  getDomNode() {
    if (!this._modelData || !this._modelData.hasRealView) {
      return null;
    }
    return this._modelData.view.domNode.domNode;
  }
  delegateVerticalScrollbarPointerDown(browserEvent) {
    if (!this._modelData || !this._modelData.hasRealView) {
      return;
    }
    this._modelData.view.delegateVerticalScrollbarPointerDown(browserEvent);
  }
  delegateScrollFromMouseWheelEvent(browserEvent) {
    if (!this._modelData || !this._modelData.hasRealView) {
      return;
    }
    this._modelData.view.delegateScrollFromMouseWheelEvent(browserEvent);
  }
  layout(dimension, postponeRendering = false) {
    this._configuration.observeContainer(dimension);
    if (!postponeRendering) {
      this.render();
    }
  }
  focus() {
    if (!this._modelData || !this._modelData.hasRealView) {
      return;
    }
    this._modelData.view.focus();
  }
  hasTextFocus() {
    if (!this._modelData || !this._modelData.hasRealView) {
      return false;
    }
    return this._modelData.view.isFocused();
  }
  hasWidgetFocus() {
    if (!this._modelData || !this._modelData.hasRealView) {
      return false;
    }
    return this._modelData.view.isWidgetFocused();
  }
  addContentWidget(widget) {
    const widgetData = {
      widget,
      position: widget.getPosition()
    };
    if (this._contentWidgets.hasOwnProperty(widget.getId())) {
      console.warn("Overwriting a content widget with the same id:" + widget.getId());
    }
    this._contentWidgets[widget.getId()] = widgetData;
    if (this._modelData && this._modelData.hasRealView) {
      this._modelData.view.addContentWidget(widgetData);
    }
  }
  layoutContentWidget(widget) {
    const widgetId = widget.getId();
    if (this._contentWidgets.hasOwnProperty(widgetId)) {
      const widgetData = this._contentWidgets[widgetId];
      widgetData.position = widget.getPosition();
      if (this._modelData && this._modelData.hasRealView) {
        this._modelData.view.layoutContentWidget(widgetData);
      }
    }
  }
  removeContentWidget(widget) {
    const widgetId = widget.getId();
    if (this._contentWidgets.hasOwnProperty(widgetId)) {
      const widgetData = this._contentWidgets[widgetId];
      delete this._contentWidgets[widgetId];
      if (this._modelData && this._modelData.hasRealView) {
        this._modelData.view.removeContentWidget(widgetData);
      }
    }
  }
  addOverlayWidget(widget) {
    const widgetData = {
      widget,
      position: widget.getPosition()
    };
    if (this._overlayWidgets.hasOwnProperty(widget.getId())) {
      console.warn("Overwriting an overlay widget with the same id.");
    }
    this._overlayWidgets[widget.getId()] = widgetData;
    if (this._modelData && this._modelData.hasRealView) {
      this._modelData.view.addOverlayWidget(widgetData);
    }
  }
  layoutOverlayWidget(widget) {
    const widgetId = widget.getId();
    if (this._overlayWidgets.hasOwnProperty(widgetId)) {
      const widgetData = this._overlayWidgets[widgetId];
      widgetData.position = widget.getPosition();
      if (this._modelData && this._modelData.hasRealView) {
        this._modelData.view.layoutOverlayWidget(widgetData);
      }
    }
  }
  removeOverlayWidget(widget) {
    const widgetId = widget.getId();
    if (this._overlayWidgets.hasOwnProperty(widgetId)) {
      const widgetData = this._overlayWidgets[widgetId];
      delete this._overlayWidgets[widgetId];
      if (this._modelData && this._modelData.hasRealView) {
        this._modelData.view.removeOverlayWidget(widgetData);
      }
    }
  }
  addGlyphMarginWidget(widget) {
    const widgetData = {
      widget,
      position: widget.getPosition()
    };
    if (this._glyphMarginWidgets.hasOwnProperty(widget.getId())) {
      console.warn("Overwriting a glyph margin widget with the same id.");
    }
    this._glyphMarginWidgets[widget.getId()] = widgetData;
    if (this._modelData && this._modelData.hasRealView) {
      this._modelData.view.addGlyphMarginWidget(widgetData);
    }
  }
  layoutGlyphMarginWidget(widget) {
    const widgetId = widget.getId();
    if (this._glyphMarginWidgets.hasOwnProperty(widgetId)) {
      const widgetData = this._glyphMarginWidgets[widgetId];
      widgetData.position = widget.getPosition();
      if (this._modelData && this._modelData.hasRealView) {
        this._modelData.view.layoutGlyphMarginWidget(widgetData);
      }
    }
  }
  removeGlyphMarginWidget(widget) {
    const widgetId = widget.getId();
    if (this._glyphMarginWidgets.hasOwnProperty(widgetId)) {
      const widgetData = this._glyphMarginWidgets[widgetId];
      delete this._glyphMarginWidgets[widgetId];
      if (this._modelData && this._modelData.hasRealView) {
        this._modelData.view.removeGlyphMarginWidget(widgetData);
      }
    }
  }
  changeViewZones(callback) {
    if (!this._modelData || !this._modelData.hasRealView) {
      return;
    }
    this._modelData.view.change(callback);
  }
  getTargetAtClientPoint(clientX, clientY) {
    if (!this._modelData || !this._modelData.hasRealView) {
      return null;
    }
    return this._modelData.view.getTargetAtClientPoint(clientX, clientY);
  }
  getScrolledVisiblePosition(rawPosition) {
    if (!this._modelData || !this._modelData.hasRealView) {
      return null;
    }
    const position2 = this._modelData.model.validatePosition(rawPosition);
    const options3 = this._configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    const top2 = CodeEditorWidget._getVerticalOffsetForPosition(this._modelData, position2.lineNumber, position2.column) - this.getScrollTop();
    const left = this._modelData.view.getOffsetForColumn(position2.lineNumber, position2.column) + layoutInfo.glyphMarginWidth + layoutInfo.lineNumbersWidth + layoutInfo.decorationsWidth - this.getScrollLeft();
    const height = this.getLineHeightForPosition(position2);
    return {
      top: top2,
      left,
      height
    };
  }
  getOffsetForColumn(lineNumber, column) {
    if (!this._modelData || !this._modelData.hasRealView) {
      return -1;
    }
    return this._modelData.view.getOffsetForColumn(lineNumber, column);
  }
  getWidthOfLine(lineNumber) {
    if (!this._modelData || !this._modelData.hasRealView) {
      return -1;
    }
    return this._modelData.view.getLineWidth(lineNumber);
  }
  resetLineWidthCaches() {
    if (!this._modelData || !this._modelData.hasRealView) {
      return;
    }
    this._modelData.view.resetLineWidthCaches();
  }
  render(forceRedraw = false) {
    if (!this._modelData || !this._modelData.hasRealView) {
      return;
    }
    this._modelData.viewModel.batchEvents(() => {
      this._modelData.view.render(true, forceRedraw);
    });
  }
  renderAsync(forceRedraw = false) {
    if (!this._modelData || !this._modelData.hasRealView) {
      return;
    }
    this._modelData.viewModel.batchEvents(() => {
      this._modelData.view.render(false, forceRedraw);
    });
  }
  setAriaOptions(options3) {
    if (!this._modelData || !this._modelData.hasRealView) {
      return;
    }
    this._modelData.view.setAriaOptions(options3);
  }
  applyFontInfo(target) {
    applyFontInfo(target, this._configuration.options.get(59 /* fontInfo */));
  }
  setBanner(domNode, domNodeHeight) {
    if (this._bannerDomNode && this._domElement.contains(this._bannerDomNode)) {
      this._bannerDomNode.remove();
    }
    this._bannerDomNode = domNode;
    this._configuration.setReservedHeight(domNode ? domNodeHeight : 0);
    if (this._bannerDomNode) {
      this._domElement.prepend(this._bannerDomNode);
    }
  }
  _attachModel(model) {
    if (!model) {
      this._modelData = null;
      return;
    }
    const listenersToRemove = [];
    this._domElement.setAttribute("data-mode-id", model.getLanguageId());
    this._configuration.setIsDominatedByLongLines(model.isDominatedByLongLines());
    this._configuration.setModelLineCount(model.getLineCount());
    const attachedView = model.onBeforeAttached();
    const viewModel = new ViewModel(
      this._id,
      this._configuration,
      model,
      DOMLineBreaksComputerFactory.create(getWindow(this._domElement)),
      MonospaceLineBreaksComputerFactory.create(this._configuration.options),
      (callback) => scheduleAtNextAnimationFrame(getWindow(this._domElement), callback),
      this.languageConfigurationService,
      this._themeService,
      attachedView,
      {
        batchChanges: (cb) => {
          try {
            this._beginUpdate();
            return cb();
          } finally {
            this._endUpdate();
          }
        }
      }
    );
    listenersToRemove.push(model.onWillDispose(() => this.setModel(null)));
    listenersToRemove.push(viewModel.onEvent((e4) => {
      switch (e4.kind) {
        case 0 /* ContentSizeChanged */:
          this._onDidContentSizeChange.fire(e4);
          break;
        case 1 /* FocusChanged */:
          this._editorTextFocus.setValue(e4.hasFocus);
          break;
        case 2 /* WidgetFocusChanged */:
          this._editorWidgetFocus.setValue(e4.hasFocus);
          break;
        case 3 /* ScrollChanged */:
          this._onDidScrollChange.fire(e4);
          break;
        case 4 /* ViewZonesChanged */:
          this._onDidChangeViewZones.fire();
          break;
        case 5 /* HiddenAreasChanged */:
          this._onDidChangeHiddenAreas.fire();
          break;
        case 6 /* ReadOnlyEditAttempt */:
          this._onDidAttemptReadOnlyEdit.fire();
          break;
        case 7 /* CursorStateChanged */: {
          if (e4.reachedMaxCursorCount) {
            const multiCursorLimit = this.getOption(89 /* multiCursorLimit */);
            const message = localize(206, null, multiCursorLimit);
            this._notificationService.prompt(Severity2.Warning, message, [
              {
                label: "Find and Replace",
                run: () => {
                  this._commandService.executeCommand("editor.action.startFindReplaceAction");
                }
              },
              {
                label: localize(207, null),
                run: () => {
                  this._commandService.executeCommand("workbench.action.openSettings2", {
                    query: "editor.multiCursorLimit"
                  });
                }
              }
            ]);
          }
          const positions = [];
          for (let i2 = 0, len = e4.selections.length; i2 < len; i2++) {
            positions[i2] = e4.selections[i2].getPosition();
          }
          const e1 = {
            position: positions[0],
            secondaryPositions: positions.slice(1),
            reason: e4.reason,
            source: e4.source
          };
          this._onDidChangeCursorPosition.fire(e1);
          const e22 = {
            selection: e4.selections[0],
            secondarySelections: e4.selections.slice(1),
            modelVersionId: e4.modelVersionId,
            oldSelections: e4.oldSelections,
            oldModelVersionId: e4.oldModelVersionId,
            source: e4.source,
            reason: e4.reason
          };
          this._onDidChangeCursorSelection.fire(e22);
          break;
        }
        case 8 /* ModelDecorationsChanged */:
          this._onDidChangeModelDecorations.fire(e4.event);
          break;
        case 9 /* ModelLanguageChanged */:
          this._domElement.setAttribute("data-mode-id", model.getLanguageId());
          this._onDidChangeModelLanguage.fire(e4.event);
          break;
        case 10 /* ModelLanguageConfigurationChanged */:
          this._onDidChangeModelLanguageConfiguration.fire(e4.event);
          break;
        case 11 /* ModelContentChanged */:
          this._onDidChangeModelContent.fire(e4.event);
          break;
        case 12 /* ModelOptionsChanged */:
          this._onDidChangeModelOptions.fire(e4.event);
          break;
        case 13 /* ModelTokensChanged */:
          this._onDidChangeModelTokens.fire(e4.event);
          break;
        case 14 /* ModelLineHeightChanged */:
          this._onDidChangeLineHeight.fire(e4.event);
          break;
        case 15 /* ModelFontChangedEvent */:
          this._onDidChangeFont.fire(e4.event);
          break;
      }
    }));
    const [view, hasRealView] = this._createView(viewModel);
    if (hasRealView) {
      this._domElement.appendChild(view.domNode.domNode);
      let keys = Object.keys(this._contentWidgets);
      for (let i2 = 0, len = keys.length; i2 < len; i2++) {
        const widgetId = keys[i2];
        view.addContentWidget(this._contentWidgets[widgetId]);
      }
      keys = Object.keys(this._overlayWidgets);
      for (let i2 = 0, len = keys.length; i2 < len; i2++) {
        const widgetId = keys[i2];
        view.addOverlayWidget(this._overlayWidgets[widgetId]);
      }
      keys = Object.keys(this._glyphMarginWidgets);
      for (let i2 = 0, len = keys.length; i2 < len; i2++) {
        const widgetId = keys[i2];
        view.addGlyphMarginWidget(this._glyphMarginWidgets[widgetId]);
      }
      view.render(false, true);
      view.domNode.domNode.setAttribute("data-uri", model.uri.toString());
      listenersToRemove.push(view.onWillCopy((e4) => this._onWillCopy.fire(e4)));
      listenersToRemove.push(view.onWillCut((e4) => this._onWillCut.fire(e4)));
      listenersToRemove.push(view.onWillPaste((e4) => this._onWillPaste.fire(e4)));
    }
    this._modelData = new ModelData(model, viewModel, view, hasRealView, listenersToRemove, attachedView);
  }
  _createView(viewModel) {
    let commandDelegate;
    if (this.isSimpleWidget) {
      commandDelegate = {
        paste: (text2, pasteOnNewLine, multicursorText, mode) => {
          this._paste("keyboard", text2, pasteOnNewLine, multicursorText, mode);
        },
        type: (text2) => {
          this._type("keyboard", text2);
        },
        compositionType: (text2, replacePrevCharCnt, replaceNextCharCnt, positionDelta) => {
          this._compositionType("keyboard", text2, replacePrevCharCnt, replaceNextCharCnt, positionDelta);
        },
        startComposition: () => {
          this._startComposition();
        },
        endComposition: () => {
          this._endComposition("keyboard");
        },
        cut: () => {
          this._cut("keyboard");
        }
      };
    } else {
      commandDelegate = {
        paste: (text2, pasteOnNewLine, multicursorText, mode) => {
          const payload = { text: text2, pasteOnNewLine, multicursorText, mode };
          this._commandService.executeCommand("paste" /* Paste */, payload);
        },
        type: (text2) => {
          const payload = { text: text2 };
          this._commandService.executeCommand("type" /* Type */, payload);
        },
        compositionType: (text2, replacePrevCharCnt, replaceNextCharCnt, positionDelta) => {
          if (replaceNextCharCnt || positionDelta) {
            const payload = { text: text2, replacePrevCharCnt, replaceNextCharCnt, positionDelta };
            this._commandService.executeCommand("compositionType" /* CompositionType */, payload);
          } else {
            const payload = { text: text2, replaceCharCnt: replacePrevCharCnt };
            this._commandService.executeCommand("replacePreviousChar" /* ReplacePreviousChar */, payload);
          }
        },
        startComposition: () => {
          this._commandService.executeCommand("compositionStart" /* CompositionStart */, {});
        },
        endComposition: () => {
          this._commandService.executeCommand("compositionEnd" /* CompositionEnd */, {});
        },
        cut: () => {
          this._commandService.executeCommand("cut" /* Cut */, {});
        }
      };
    }
    const viewUserInputEvents = new ViewUserInputEvents(viewModel.coordinatesConverter);
    viewUserInputEvents.onKeyDown = (e4) => this._onKeyDown.fire(e4);
    viewUserInputEvents.onKeyUp = (e4) => this._onKeyUp.fire(e4);
    viewUserInputEvents.onContextMenu = (e4) => this._onContextMenu.fire(e4);
    viewUserInputEvents.onMouseMove = (e4) => this._onMouseMove.fire(e4);
    viewUserInputEvents.onMouseLeave = (e4) => this._onMouseLeave.fire(e4);
    viewUserInputEvents.onMouseDown = (e4) => this._onMouseDown.fire(e4);
    viewUserInputEvents.onMouseUp = (e4) => this._onMouseUp.fire(e4);
    viewUserInputEvents.onMouseDrag = (e4) => this._onMouseDrag.fire(e4);
    viewUserInputEvents.onMouseDrop = (e4) => this._onMouseDrop.fire(e4);
    viewUserInputEvents.onMouseDropCanceled = (e4) => this._onMouseDropCanceled.fire(e4);
    viewUserInputEvents.onMouseWheel = (e4) => this._onMouseWheel.fire(e4);
    const view = new View(
      this._domElement,
      this.getId(),
      commandDelegate,
      this._configuration,
      this._themeService.getColorTheme(),
      viewModel,
      viewUserInputEvents,
      this._overflowWidgetsDomNode,
      this._instantiationService,
      this._userInteractionService
    );
    return [view, true];
  }
  _postDetachModelCleanup(detachedModel) {
    detachedModel?.removeAllDecorationsWithOwnerId(this._id);
  }
  _detachModel() {
    this._contributionsDisposable?.dispose();
    this._contributionsDisposable = void 0;
    if (!this._modelData) {
      return null;
    }
    const model = this._modelData.model;
    const removeDomNode = this._modelData.hasRealView ? this._modelData.view.domNode.domNode : null;
    this._modelData.dispose();
    this._modelData = null;
    this._domElement.removeAttribute("data-mode-id");
    if (removeDomNode && this._domElement.contains(removeDomNode)) {
      removeDomNode.remove();
    }
    if (this._bannerDomNode && this._domElement.contains(this._bannerDomNode)) {
      this._bannerDomNode.remove();
    }
    return model;
  }
  _registerDecorationType(description, key3, options3, parentTypeKey) {
    this._codeEditorService.registerDecorationType(description, key3, options3, parentTypeKey, this);
  }
  _removeDecorationType(key3) {
    this._codeEditorService.removeDecorationType(key3);
  }
  _resolveDecorationOptions(typeKey, writable) {
    return this._codeEditorService.resolveDecorationOptions(typeKey, writable);
  }
  getTelemetryData() {
    return this._telemetryData;
  }
  hasModel() {
    return this._modelData !== null;
  }
  showDropIndicatorAt(position2) {
    const newDecorations = [{
      range: new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column),
      options: CodeEditorWidget.dropIntoEditorDecorationOptions
    }];
    this._dropIntoEditorDecorations.set(newDecorations);
    this.revealPosition(position2, 1 /* Immediate */);
  }
  removeDropIndicator() {
    this._dropIntoEditorDecorations.clear();
  }
  setContextValue(key3, value2) {
    this._contextKeyService.createKey(key3, value2);
  }
  _beginUpdate() {
    this._updateCounter++;
    if (this._updateCounter === 1) {
      this._onBeginUpdate.fire();
    }
  }
  _endUpdate() {
    this._updateCounter--;
    if (this._updateCounter === 0) {
      this._onEndUpdate.fire();
    }
  }
};

CodeEditorWidget = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ICodeEditorService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, INotificationService),
  __decorateParam(9, IAccessibilityService),
  __decorateParam(10, ILanguageConfigurationService),
  __decorateParam(11, ILanguageFeaturesService),
  __decorateParam(12, IUserInteractionService)
], CodeEditorWidget);

var EDITOR_ID = 0;

var ModelData = class {
  constructor(model, viewModel, view, hasRealView, listenersToRemove, attachedView) {
    this.model = model;
    this.viewModel = viewModel;
    this.view = view;
    this.hasRealView = hasRealView;
    this.listenersToRemove = listenersToRemove;
    this.attachedView = attachedView;
  }
  dispose() {
    dispose(this.listenersToRemove);
    this.model.onBeforeDetached(this.attachedView);
    if (this.hasRealView) {
      this.view.dispose();
    }
    this.viewModel.dispose();
  }
};

var BooleanEventEmitter = class extends Disposable {
  constructor(_emitterOptions) {
    super();
    this._emitterOptions = _emitterOptions;
    this._onDidChangeToTrue = this._register(new Emitter(this._emitterOptions));
    this.onDidChangeToTrue = this._onDidChangeToTrue.event;
    this._onDidChangeToFalse = this._register(new Emitter(this._emitterOptions));
    this.onDidChangeToFalse = this._onDidChangeToFalse.event;
    this._value = 0 /* NotSet */;
  }
  setValue(_value) {
    const value2 = _value ? 2 /* True */ : 1 /* False */;
    if (this._value === value2) {
      return;
    }
    this._value = value2;
    if (this._value === 2 /* True */) {
      this._onDidChangeToTrue.fire();
    } else if (this._value === 1 /* False */) {
      this._onDidChangeToFalse.fire();
    }
  }
};

var InteractionEmitter = class extends Emitter {
  constructor(_contributions, deliveryQueue) {
    super({ deliveryQueue });
    this._contributions = _contributions;
  }
  fire(event) {
    this._contributions.onBeforeInteractionEvent();
    super.fire(event);
  }
};

var EditorContextKeysManager = class extends Disposable {
  constructor(editor, contextKeyService) {
    super();
    this._editor = editor;
    contextKeyService.createKey("editorId", editor.getId());
    this._editorSimpleInput = EditorContextKeys.editorSimpleInput.bindTo(contextKeyService);
    this._editorFocus = EditorContextKeys.focus.bindTo(contextKeyService);
    this._textInputFocus = EditorContextKeys.textInputFocus.bindTo(contextKeyService);
    this._editorTextFocus = EditorContextKeys.editorTextFocus.bindTo(contextKeyService);
    this._tabMovesFocus = EditorContextKeys.tabMovesFocus.bindTo(contextKeyService);
    this._editorReadonly = EditorContextKeys.readOnly.bindTo(contextKeyService);
    this._inDiffEditor = EditorContextKeys.inDiffEditor.bindTo(contextKeyService);
    this._editorColumnSelection = EditorContextKeys.columnSelection.bindTo(contextKeyService);
    this._hasMultipleSelections = EditorContextKeys.hasMultipleSelections.bindTo(contextKeyService);
    this._hasNonEmptySelection = EditorContextKeys.hasNonEmptySelection.bindTo(contextKeyService);
    this._canUndo = EditorContextKeys.canUndo.bindTo(contextKeyService);
    this._canRedo = EditorContextKeys.canRedo.bindTo(contextKeyService);
    this._register(this._editor.onDidChangeConfiguration(() => this._updateFromConfig()));
    this._register(this._editor.onDidChangeCursorSelection(() => this._updateFromSelection()));
    this._register(this._editor.onDidFocusEditorWidget(() => this._updateFromFocus()));
    this._register(this._editor.onDidBlurEditorWidget(() => this._updateFromFocus()));
    this._register(this._editor.onDidFocusEditorText(() => this._updateFromFocus()));
    this._register(this._editor.onDidBlurEditorText(() => this._updateFromFocus()));
    this._register(this._editor.onDidChangeModel(() => this._updateFromModel()));
    this._register(this._editor.onDidChangeConfiguration(() => this._updateFromModel()));
    this._register(TabFocus.onDidChangeTabFocus((tabFocusMode) => this._tabMovesFocus.set(tabFocusMode)));
    this._updateFromConfig();
    this._updateFromSelection();
    this._updateFromFocus();
    this._updateFromModel();
    this._editorSimpleInput.set(this._editor.isSimpleWidget);
  }
  _updateFromConfig() {
    const options3 = this._editor.getOptions();
    this._tabMovesFocus.set(options3.get(164 /* tabFocusMode */) || TabFocus.getTabFocusMode());
    this._editorReadonly.set(options3.get(104 /* readOnly */));
    this._inDiffEditor.set(options3.get(70 /* inDiffEditor */));
    this._editorColumnSelection.set(options3.get(28 /* columnSelection */));
  }
  _updateFromSelection() {
    const selections = this._editor.getSelections();
    if (!selections) {
      this._hasMultipleSelections.reset();
      this._hasNonEmptySelection.reset();
    } else {
      this._hasMultipleSelections.set(selections.length > 1);
      this._hasNonEmptySelection.set(selections.some((s) => !s.isEmpty()));
    }
  }
  _updateFromFocus() {
    this._editorFocus.set(this._editor.hasWidgetFocus() && !this._editor.isSimpleWidget);
    this._editorTextFocus.set(this._editor.hasTextFocus() && !this._editor.isSimpleWidget);
    this._textInputFocus.set(this._editor.hasTextFocus());
  }
  _updateFromModel() {
    const model = this._editor.getModel();
    this._canUndo.set(Boolean(model && model.canUndo()));
    this._canRedo.set(Boolean(model && model.canRedo()));
  }
};

var EditorModeContext = class extends Disposable {
  constructor(_editor, _contextKeyService, _languageFeaturesService) {
    super();
    this._editor = _editor;
    this._contextKeyService = _contextKeyService;
    this._languageFeaturesService = _languageFeaturesService;
    this._langId = EditorContextKeys.languageId.bindTo(_contextKeyService);
    this._hasCompletionItemProvider = EditorContextKeys.hasCompletionItemProvider.bindTo(_contextKeyService);
    this._hasCodeActionsProvider = EditorContextKeys.hasCodeActionsProvider.bindTo(_contextKeyService);
    this._hasCodeLensProvider = EditorContextKeys.hasCodeLensProvider.bindTo(_contextKeyService);
    this._hasDefinitionProvider = EditorContextKeys.hasDefinitionProvider.bindTo(_contextKeyService);
    this._hasDeclarationProvider = EditorContextKeys.hasDeclarationProvider.bindTo(_contextKeyService);
    this._hasImplementationProvider = EditorContextKeys.hasImplementationProvider.bindTo(_contextKeyService);
    this._hasTypeDefinitionProvider = EditorContextKeys.hasTypeDefinitionProvider.bindTo(_contextKeyService);
    this._hasHoverProvider = EditorContextKeys.hasHoverProvider.bindTo(_contextKeyService);
    this._hasDocumentHighlightProvider = EditorContextKeys.hasDocumentHighlightProvider.bindTo(_contextKeyService);
    this._hasDocumentSymbolProvider = EditorContextKeys.hasDocumentSymbolProvider.bindTo(_contextKeyService);
    this._hasReferenceProvider = EditorContextKeys.hasReferenceProvider.bindTo(_contextKeyService);
    this._hasRenameProvider = EditorContextKeys.hasRenameProvider.bindTo(_contextKeyService);
    this._hasSignatureHelpProvider = EditorContextKeys.hasSignatureHelpProvider.bindTo(_contextKeyService);
    this._hasInlayHintsProvider = EditorContextKeys.hasInlayHintsProvider.bindTo(_contextKeyService);
    this._hasDocumentFormattingProvider = EditorContextKeys.hasDocumentFormattingProvider.bindTo(_contextKeyService);
    this._hasDocumentSelectionFormattingProvider = EditorContextKeys.hasDocumentSelectionFormattingProvider.bindTo(_contextKeyService);
    this._hasMultipleDocumentFormattingProvider = EditorContextKeys.hasMultipleDocumentFormattingProvider.bindTo(_contextKeyService);
    this._hasMultipleDocumentSelectionFormattingProvider = EditorContextKeys.hasMultipleDocumentSelectionFormattingProvider.bindTo(_contextKeyService);
    this._isInEmbeddedEditor = EditorContextKeys.isInEmbeddedEditor.bindTo(_contextKeyService);
    const update = () => this._update();
    this._register(_editor.onDidChangeModel(update));
    this._register(_editor.onDidChangeModelLanguage(update));
    this._register(_languageFeaturesService.completionProvider.onDidChange(update));
    this._register(_languageFeaturesService.codeActionProvider.onDidChange(update));
    this._register(_languageFeaturesService.codeLensProvider.onDidChange(update));
    this._register(_languageFeaturesService.definitionProvider.onDidChange(update));
    this._register(_languageFeaturesService.declarationProvider.onDidChange(update));
    this._register(_languageFeaturesService.implementationProvider.onDidChange(update));
    this._register(_languageFeaturesService.typeDefinitionProvider.onDidChange(update));
    this._register(_languageFeaturesService.hoverProvider.onDidChange(update));
    this._register(_languageFeaturesService.documentHighlightProvider.onDidChange(update));
    this._register(_languageFeaturesService.documentSymbolProvider.onDidChange(update));
    this._register(_languageFeaturesService.referenceProvider.onDidChange(update));
    this._register(_languageFeaturesService.renameProvider.onDidChange(update));
    this._register(_languageFeaturesService.documentFormattingEditProvider.onDidChange(update));
    this._register(_languageFeaturesService.documentRangeFormattingEditProvider.onDidChange(update));
    this._register(_languageFeaturesService.signatureHelpProvider.onDidChange(update));
    this._register(_languageFeaturesService.inlayHintsProvider.onDidChange(update));
    update();
  }
  dispose() {
    super.dispose();
  }
  reset() {
    this._contextKeyService.bufferChangeEvents(() => {
      this._langId.reset();
      this._hasCompletionItemProvider.reset();
      this._hasCodeActionsProvider.reset();
      this._hasCodeLensProvider.reset();
      this._hasDefinitionProvider.reset();
      this._hasDeclarationProvider.reset();
      this._hasImplementationProvider.reset();
      this._hasTypeDefinitionProvider.reset();
      this._hasHoverProvider.reset();
      this._hasDocumentHighlightProvider.reset();
      this._hasDocumentSymbolProvider.reset();
      this._hasReferenceProvider.reset();
      this._hasRenameProvider.reset();
      this._hasDocumentFormattingProvider.reset();
      this._hasDocumentSelectionFormattingProvider.reset();
      this._hasSignatureHelpProvider.reset();
      this._isInEmbeddedEditor.reset();
    });
  }
  _update() {
    const model = this._editor.getModel();
    if (!model) {
      this.reset();
      return;
    }
    this._contextKeyService.bufferChangeEvents(() => {
      this._langId.set(model.getLanguageId());
      this._hasCompletionItemProvider.set(this._languageFeaturesService.completionProvider.has(model));
      this._hasCodeActionsProvider.set(this._languageFeaturesService.codeActionProvider.has(model));
      this._hasCodeLensProvider.set(this._languageFeaturesService.codeLensProvider.has(model));
      this._hasDefinitionProvider.set(this._languageFeaturesService.definitionProvider.has(model));
      this._hasDeclarationProvider.set(this._languageFeaturesService.declarationProvider.has(model));
      this._hasImplementationProvider.set(this._languageFeaturesService.implementationProvider.has(model));
      this._hasTypeDefinitionProvider.set(this._languageFeaturesService.typeDefinitionProvider.has(model));
      this._hasHoverProvider.set(this._languageFeaturesService.hoverProvider.has(model));
      this._hasDocumentHighlightProvider.set(this._languageFeaturesService.documentHighlightProvider.has(model));
      this._hasDocumentSymbolProvider.set(this._languageFeaturesService.documentSymbolProvider.has(model));
      this._hasReferenceProvider.set(this._languageFeaturesService.referenceProvider.has(model));
      this._hasRenameProvider.set(this._languageFeaturesService.renameProvider.has(model));
      this._hasSignatureHelpProvider.set(this._languageFeaturesService.signatureHelpProvider.has(model));
      this._hasInlayHintsProvider.set(this._languageFeaturesService.inlayHintsProvider.has(model));
      this._hasDocumentFormattingProvider.set(this._languageFeaturesService.documentFormattingEditProvider.has(model) || this._languageFeaturesService.documentRangeFormattingEditProvider.has(model));
      this._hasDocumentSelectionFormattingProvider.set(this._languageFeaturesService.documentRangeFormattingEditProvider.has(model));
      this._hasMultipleDocumentFormattingProvider.set(this._languageFeaturesService.documentFormattingEditProvider.all(model).length + this._languageFeaturesService.documentRangeFormattingEditProvider.all(model).length > 1);
      this._hasMultipleDocumentSelectionFormattingProvider.set(this._languageFeaturesService.documentRangeFormattingEditProvider.all(model).length > 1);
      this._isInEmbeddedEditor.set(model.uri.scheme === Schemas.walkThroughSnippet || model.uri.scheme === Schemas.vscodeChatCodeBlock);
    });
  }
};

var EditorDecorationsCollection = class {
  constructor(_editor, decorations) {
    this._editor = _editor;
    this._decorationIds = [];
    this._isChangingDecorations = false;
    if (Array.isArray(decorations) && decorations.length > 0) {
      this.set(decorations);
    }
  }
  get length() {
    return this._decorationIds.length;
  }
  onDidChange(listener, thisArgs, disposables) {
    return this._editor.onDidChangeModelDecorations((e4) => {
      if (this._isChangingDecorations) {
        return;
      }
      listener.call(thisArgs, e4);
    }, disposables);
  }
  getRange(index2) {
    if (!this._editor.hasModel()) {
      return null;
    }
    if (index2 >= this._decorationIds.length) {
      return null;
    }
    return this._editor.getModel().getDecorationRange(this._decorationIds[index2]);
  }
  getRanges() {
    if (!this._editor.hasModel()) {
      return [];
    }
    const model = this._editor.getModel();
    const result = [];
    for (const decorationId of this._decorationIds) {
      const range2 = model.getDecorationRange(decorationId);
      if (range2) {
        result.push(range2);
      }
    }
    return result;
  }
  has(decoration3) {
    return this._decorationIds.includes(decoration3.id);
  }
  clear() {
    if (this._decorationIds.length === 0) {
      return;
    }
    this.set([]);
  }
  set(newDecorations) {
    try {
      this._isChangingDecorations = true;
      this._editor.changeDecorations((accessor) => {
        this._decorationIds = accessor.deltaDecorations(this._decorationIds, newDecorations);
      });
    } finally {
      this._isChangingDecorations = false;
    }
    return this._decorationIds;
  }
  append(newDecorations) {
    let newDecorationIds = [];
    try {
      this._isChangingDecorations = true;
      this._editor.changeDecorations((accessor) => {
        newDecorationIds = accessor.deltaDecorations([], newDecorations);
        this._decorationIds = this._decorationIds.concat(newDecorationIds);
      });
    } finally {
      this._isChangingDecorations = false;
    }
    return newDecorationIds;
  }
};

var squigglyStart = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 3' enable-background='new 0 0 6 3' height='3' width='6'><g fill='`);

var squigglyEnd = encodeURIComponent(`'><polygon points='5.5,0 2.5,3 1.1,3 4.1,0'/><polygon points='4,0 6,2 6,0.6 5.4,0'/><polygon points='0,2 1,3 2.4,3 0,0.6'/></g></svg>`);

function getSquigglySVGData(color2) {
  return squigglyStart + encodeURIComponent(color2.toString()) + squigglyEnd;
}

var dotdotdotStart = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" height="3" width="12"><g fill="`);

var dotdotdotEnd = encodeURIComponent(`"><circle cx="1" cy="1" r="1"/><circle cx="5" cy="1" r="1"/><circle cx="9" cy="1" r="1"/></g></svg>`);

function getDotDotDotSVGData(color2) {
  return dotdotdotStart + encodeURIComponent(color2.toString()) + dotdotdotEnd;
}

registerThemingParticipant((theme, collector) => {
  const errorForeground2 = theme.getColor(editorErrorForeground);
  if (errorForeground2) {
    collector.addRule(`.monaco-editor .${"squiggly-error" /* EditorErrorDecoration */} { background: url("data:image/svg+xml,${getSquigglySVGData(errorForeground2)}") repeat-x bottom left; }`);
    collector.addRule(`:root { --monaco-editor-error-decoration: url("data:image/svg+xml,${getSquigglySVGData(errorForeground2)}"); }`);
  }
  const warningForeground = theme.getColor(editorWarningForeground);
  if (warningForeground) {
    collector.addRule(`.monaco-editor .${"squiggly-warning" /* EditorWarningDecoration */} { background: url("data:image/svg+xml,${getSquigglySVGData(warningForeground)}") repeat-x bottom left; }`);
    collector.addRule(`:root { --monaco-editor-warning-decoration: url("data:image/svg+xml,${getSquigglySVGData(warningForeground)}"); }`);
  }
  const infoForeground = theme.getColor(editorInfoForeground);
  if (infoForeground) {
    collector.addRule(`.monaco-editor .${"squiggly-info" /* EditorInfoDecoration */} { background: url("data:image/svg+xml,${getSquigglySVGData(infoForeground)}") repeat-x bottom left; }`);
    collector.addRule(`:root { --monaco-editor-info-decoration: url("data:image/svg+xml,${getSquigglySVGData(infoForeground)}"); }`);
  }
  const hintForeground = theme.getColor(editorHintForeground);
  if (hintForeground) {
    collector.addRule(`.monaco-editor .${"squiggly-hint" /* EditorHintDecoration */} { background: url("data:image/svg+xml,${getDotDotDotSVGData(hintForeground)}") no-repeat bottom left; }`);
    collector.addRule(`:root { --monaco-editor-hint-decoration: url("data:image/svg+xml,${getDotDotDotSVGData(hintForeground)}"); }`);
  }
  const unnecessaryForeground = theme.getColor(editorUnnecessaryCodeOpacity);
  if (unnecessaryForeground) {
    collector.addRule(`.monaco-editor.showUnused .${"squiggly-inline-unnecessary" /* EditorUnnecessaryInlineDecoration */} { opacity: ${unnecessaryForeground.rgba.a}; }`);
    collector.addRule(`:root { --monaco-editor-unnecessary-decoration-opacity: ${unnecessaryForeground.rgba.a}; }`);
  }
});
export { getSquigglySVGData, getDotDotDotSVGData, CodeEditorWidget, EDITOR_ID, ModelData, BooleanEventEmitter, InteractionEmitter, EditorContextKeysManager, EditorModeContext, EditorDecorationsCollection, squigglyStart, squigglyEnd, dotdotdotStart, dotdotdotEnd };
