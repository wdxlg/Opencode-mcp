// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackEditorInputContribution.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { FeedbackInputWidget } from "./module-3627.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { KeyCodeChord, Keybinding } from "./module-0021.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { addStandardDisposableListener, getWindow, isHTMLElement } from "./module-0075.mjs";
import { Range2 } from "./module-0106.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { Position } from "./module-0079.mjs";
import { Selection } from "./module-0107.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { createAgentFeedbackContext } from "./module-3587.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackEditorInputContribution.ts
var addFeedbackAtCurrentLineActionId = "agentFeedbackEditor.action.addAtCurrentLine";

var agentFeedbackHoverGlyphClassName = "agent-feedback-glyph";

var hasAgentFeedbackSessionForEditor = new RawContextKey("agentFeedbackEditor.hasSession", false);

var AgentFeedbackInputWidget = class extends Disposable {
  constructor(_editor, contextMenuService, keybindingService) {
    super();
    this._editor = _editor;
    this.allowEditorOverflow = false;
    this._position = null;
    const enterKeybinding = this._resolveKeybinding(keybindingService, false);
    const altEnterKeybinding = this._resolveKeybinding(keybindingService, true);
    this._core = this._register(new FeedbackInputWidget({
      placeholder: localize(4058, null),
      getMaxContentWidth: () => this._computeContentWidth(),
      primaryAction: {
        label: localize(4054, null),
        icon: Codicon.plus,
        keybindingLabel: localize(4060, null),
        menuKeybinding: enterKeybinding
      },
      secondaryAction: {
        label: localize(4055, null),
        icon: Codicon.send,
        keybindingLabel: localize(4059, null),
        menuKeybinding: altEnterKeybinding
      },
      contextMenuProvider: contextMenuService
    }));
    this.onDidTriggerAdd = this._core.onDidTriggerPrimary;
    this.onDidTriggerAddAndSubmit = this._core.onDidTriggerSecondary;
  }
  static {
    this._ID = "agentFeedback.inputWidget";
  }
  _resolveKeybinding(keybindingService, altKey) {
    const [resolvedKeybinding] = keybindingService.resolveKeybinding(new Keybinding([
      new KeyCodeChord(false, false, altKey, false, 3 /* Enter */)
    ]));
    if (!resolvedKeybinding) {
      throw new Error("Unable to resolve the feedback input keybinding");
    }
    return resolvedKeybinding;
  }
  getId() {
    return AgentFeedbackInputWidget._ID;
  }
  getDomNode() {
    return this._core.domNode;
  }
  getPosition() {
    return this._position;
  }
  get inputElement() {
    return this._core.inputElement;
  }
  setPosition(position2) {
    this._position = position2;
    this._editor.layoutOverlayWidget(this);
  }
  show() {
    this._core.show();
  }
  hide() {
    this._core.hide();
  }
  clearInput() {
    this._core.clearInput();
  }
  setPlaceholder(placeholder) {
    this._core.setPlaceholder(placeholder);
  }
  autoSize() {
    this._core.autoSize();
  }
  updateActionEnabled() {
    this._core.updateActionEnabled();
  }
  _computeContentWidth() {
    const layoutInfo = this._editor.getLayoutInfo();
    return Math.max(0, layoutInfo.width - layoutInfo.contentLeft);
  }
};

AgentFeedbackInputWidget = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IKeybindingService)
], AgentFeedbackInputWidget);

var AgentFeedbackEditorInputContribution = class extends Disposable {
  constructor(_editor, _agentFeedbackService, _codeEditorService, _contextKeyService, _instantiationService) {
    super();
    this._editor = _editor;
    this._agentFeedbackService = _agentFeedbackService;
    this._codeEditorService = _codeEditorService;
    this._contextKeyService = _contextKeyService;
    this._instantiationService = _instantiationService;
    this._visible = false;
    this._mouseDown = false;
    this._suppressSelectionChangeOnce = false;
    this._preferBelow = true;
    this._widgetListeners = this._store.add(new DisposableStore());
    this._hoverDecorations = this._editor.createDecorationsCollection();
    this._store.add({ dispose: () => this._hoverDecorations.clear() });
    this._hasAgentFeedbackSessionContext = hasAgentFeedbackSessionForEditor.bindTo(this._contextKeyService);
    this._store.add(this._editor.onDidChangeCursorSelection(() => this._onSelectionChanged()));
    this._store.add(this._editor.onDidChangeModel(() => this._onModelChanged()));
    this._store.add(this._editor.onDidScrollChange(() => {
      if (this._visible) {
        this._updatePosition();
      }
    }));
    this._store.add(this._editor.onDidLayoutChange(() => {
      if (this._visible && this._widget) {
        this._widget.autoSize();
        this._updatePosition();
      }
    }));
    this._store.add(this._editor.onMouseMove((e4) => this._onEditorMouseMove(e4)));
    this._store.add(this._editor.onMouseLeave(() => this._clearHoverGlyph()));
    this._store.add(this._editor.onMouseDown((e4) => {
      if (this._isWidgetTarget(e4.event.target)) {
        return;
      }
      if (this._isHoverGlyphTarget(e4)) {
        e4.event.preventDefault();
        e4.event.stopPropagation();
        const lineNumber = e4.target.position?.lineNumber;
        if (lineNumber !== void 0) {
          this._selectLine(lineNumber);
        }
        return;
      }
      this._mouseDown = true;
      this._autoHide();
    }));
    this._store.add(this._editor.onMouseUp((e4) => {
      this._mouseDown = false;
      if (this._isWidgetTarget(e4.event.target)) {
        return;
      }
      if (this._isHoverGlyphTarget(e4)) {
        return;
      }
      this._onSelectionChanged();
    }));
    this._store.add(this._editor.onDidBlurEditorWidget(() => {
      if (!this._visible) {
        return;
      }
      getWindow(this._editor.getDomNode()).setTimeout(() => {
        if (!this._visible) {
          return;
        }
        if (this._isWidgetTarget(getWindow(this._editor.getDomNode()).document.activeElement)) {
          return;
        }
        this._autoHide();
      }, 0);
    }));
    this._store.add(this._editor.onDidFocusEditorText(() => this._onSelectionChanged()));
    this._store.add(this._agentFeedbackService.onDidChangeFeedbackScope(() => {
      this._clearHoverGlyph();
      this._sessionResource = this._getSessionForModel();
      if (this._visible && this._widget) {
        if (!this._sessionResource) {
          this._autoHide();
        } else {
          this._widget.setPlaceholder(this._getPlaceholder());
        }
      }
    }));
    this._getSessionForModel();
  }
  static {
    this.ID = "agentFeedback.editorInputContribution";
  }
  _isWidgetTarget(target) {
    return !!this._widget && !!target && this._widget.getDomNode().contains(target);
  }
  _isHoverGlyphTarget(e4) {
    return isHTMLElement(e4.target.element) && e4.target.element.classList.contains(agentFeedbackHoverGlyphClassName);
  }
  _ensureWidget() {
    if (!this._widget) {
      this._widget = this._instantiationService.createInstance(AgentFeedbackInputWidget, this._editor);
      this._store.add(this._widget.onDidTriggerAdd(() => this._addFeedback()));
      this._store.add(this._widget.onDidTriggerAddAndSubmit(() => this._addFeedbackAndSubmit()));
      this._editor.addOverlayWidget(this._widget);
    }
    return this._widget;
  }
  _onModelChanged() {
    this._hide();
    this._clearHoverGlyph();
    this._suppressSelectionChangeOnce = false;
    this._sessionResource = void 0;
    this._getSessionForModel();
  }
  _onEditorMouseMove(e4) {
    if (this._visible || this._hasInputText()) {
      this._clearHoverGlyph();
      return;
    }
    this._updateHoverGlyph(e4.target.position?.lineNumber);
  }
  _updateHoverGlyph(lineNumber) {
    const model = this._editor.getModel();
    if (lineNumber === void 0 || !model || lineNumber < 1 || lineNumber > model.getLineCount()) {
      this._clearHoverGlyph();
      return;
    }
    if (model.getLineFirstNonWhitespaceColumn(lineNumber) === 0) {
      this._clearHoverGlyph();
      return;
    }
    if (this._hoverLineNumber === lineNumber) {
      return;
    }
    const sessionResource = this._getSessionForModel();
    if (!sessionResource) {
      this._clearHoverGlyph();
      return;
    }
    if (this._lineHasExistingFeedback(sessionResource, model.uri, lineNumber)) {
      this._clearHoverGlyph();
      return;
    }
    this._hoverLineNumber = lineNumber;
    this._hoverDecorations.set([{
      range: new Range2(lineNumber, 1, lineNumber, 1),
      options: {
        description: "agent-feedback-hover-glyph",
        lineNumberClassName: `${agentFeedbackHoverGlyphClassName} line-hover`,
        lineNumberHoverMessage: new MarkdownString(localize(4053, null))
      }
    }]);
  }
  _lineHasExistingFeedback(sessionResource, resourceUri, lineNumber) {
    return this._agentFeedbackService.getFeedback(sessionResource).some((feedback) => isEqual2(feedback.resourceUri, resourceUri) && lineNumber >= feedback.range.startLineNumber && lineNumber <= feedback.range.endLineNumber);
  }
  _clearHoverGlyph() {
    if (this._hoverLineNumber === void 0) {
      return;
    }
    this._hoverLineNumber = void 0;
    this._hoverDecorations.clear();
  }
  _onSelectionChanged() {
    if (this._suppressSelectionChangeOnce) {
      this._suppressSelectionChangeOnce = false;
      return;
    }
    if (this._mouseDown || !this._editor.hasTextFocus()) {
      return;
    }
    if (this._visible && this._hasInputText()) {
      return;
    }
    const selection = this._editor.getSelection();
    if (!selection || selection.isEmpty()) {
      this._autoHide();
      return;
    }
    const model = this._editor.getModel();
    if (!model) {
      this._autoHide();
      return;
    }
    const sessionResource = this._getSessionForModel();
    if (!sessionResource) {
      this._autoHide();
      return;
    }
    this._sessionResource = sessionResource;
    const preferBelow = selection.getDirection() === 0 /* LTR */;
    const anchorPosition = preferBelow ? selection.getEndPosition() : selection.getStartPosition();
    this._show(Range2.lift(selection), anchorPosition, preferBelow);
  }
  _show(range2, anchorPosition, preferBelow, focusInput = false) {
    const widget = this._ensureWidget();
    this._clearHoverGlyph();
    if (!this._visible) {
      this._visible = true;
      this._registerWidgetListeners(widget);
    }
    this._pinnedRange = range2;
    this._anchorPosition = anchorPosition;
    this._preferBelow = preferBelow;
    widget.setPlaceholder(this._getPlaceholder());
    widget.clearInput();
    widget.show();
    this._updatePosition();
    if (focusInput) {
      widget.inputElement.focus();
    }
  }
  _getPlaceholder() {
    const model = this._editor.getModel();
    const hasChanges = !!model && (this._agentFeedbackService.getSessionForFile(model.uri)?.changes.get().length ?? 0) > 0;
    return hasChanges ? localize(4058, null) : localize(4057, null);
  }
  _hide() {
    if (!this._visible) {
      return;
    }
    this._visible = false;
    this._pinnedRange = void 0;
    this._anchorPosition = void 0;
    this._widgetListeners.clear();
    if (this._widget) {
      this._widget.hide();
      this._widget.setPosition(null);
      this._widget.clearInput();
    }
  }
  _hasInputText() {
    return !!this._widget && this._widget.inputElement.value.trim().length > 0;
  }
  showAtCurrentLine(focusInput = true) {
    const position2 = this._editor.getPosition();
    if (!position2) {
      return;
    }
    this._showAtLine(position2.lineNumber, focusInput);
  }
  _showAtLine(lineNumber, focusInput) {
    if (this._visible && this._hasInputText()) {
      this.focusInput();
      return;
    }
    const model = this._editor.getModel();
    if (!model || lineNumber < 1 || lineNumber > model.getLineCount()) {
      this._autoHide();
      return;
    }
    const sessionResource = this._getSessionForModel();
    if (!sessionResource) {
      this._autoHide();
      return;
    }
    this._sessionResource = sessionResource;
    this._show(new Range2(lineNumber, 1, lineNumber, model.getLineMaxColumn(lineNumber)), new Position(lineNumber, 1), true, focusInput);
  }
  /**
   * Select the whole line as a result of clicking the gutter glyph. Selecting
   * the line triggers the selection-change handler which opens the feedback
   * input automatically, so we don't open it directly here. Empty lines are
   * ignored as there is nothing to give feedback on.
   */
  _selectLine(lineNumber) {
    if (this._visible && this._hasInputText()) {
      this.focusInput();
      return;
    }
    const model = this._editor.getModel();
    if (!model || lineNumber < 1 || lineNumber > model.getLineCount()) {
      return;
    }
    if (model.getLineFirstNonWhitespaceColumn(lineNumber) === 0) {
      return;
    }
    this._editor.setSelection(new Selection(lineNumber, 1, lineNumber, model.getLineMaxColumn(lineNumber)));
    this._editor.focus();
    this.focusInput();
  }
  _getSessionForModel() {
    const model = this._editor.getModel();
    if (!model || !this._contextKeyService.contextMatchesRules(ChatContextKeys.enabled)) {
      this._hasAgentFeedbackSessionContext.set(false);
      this._sessionResource = void 0;
      return void 0;
    }
    const sessionResource = this._agentFeedbackService.getFeedbackSessionResource(model.uri);
    this._hasAgentFeedbackSessionContext.set(!!sessionResource);
    this._sessionResource = sessionResource;
    return sessionResource;
  }
  /**
   * Hide the widget unless the user has typed text. When text is present the
   * widget is preserved so the user does not lose their in-progress feedback;
   * they can close it explicitly via Esc.
   */
  _autoHide() {
    if (this._hasInputText()) {
      return;
    }
    this._hide();
  }
  _registerWidgetListeners(widget) {
    this._widgetListeners.clear();
    const editorDomNode = this._editor.getDomNode();
    if (editorDomNode) {
      this._widgetListeners.add(addStandardDisposableListener(editorDomNode, "keydown", (e4) => {
        if (!this._visible) {
          return;
        }
        if (!this._editor.hasTextFocus()) {
          return;
        }
        if (e4.keyCode === 5 /* Ctrl */ || e4.keyCode === 4 /* Shift */ || e4.keyCode === 6 /* Alt */ || e4.keyCode === 57 /* Meta */) {
          return;
        }
        if (e4.keyCode === 9 /* Escape */) {
          this._hide();
          this._editor.focus();
          return;
        }
        if ((e4.ctrlKey || e4.metaKey) && e4.keyCode === 39 /* KeyI */) {
          e4.preventDefault();
          e4.stopPropagation();
          widget.inputElement.focus();
          return;
        }
        if (e4.ctrlKey || e4.altKey || e4.metaKey) {
          return;
        }
        if (e4.keyCode === 16 /* UpArrow */ || e4.keyCode === 18 /* DownArrow */ || e4.keyCode === 15 /* LeftArrow */ || e4.keyCode === 17 /* RightArrow */) {
          return;
        }
        if (!this._editor.getOption(104 /* readOnly */)) {
          return;
        }
        if (getWindow(widget.inputElement).document.activeElement !== widget.inputElement) {
          widget.inputElement.focus();
        }
      }));
    }
    this._widgetListeners.add(addStandardDisposableListener(widget.inputElement, "keydown", (e4) => {
      if (e4.keyCode === 9 /* Escape */) {
        e4.preventDefault();
        e4.stopPropagation();
        this._hide();
        this._editor.focus();
        return;
      }
      if (e4.keyCode === 3 /* Enter */ && e4.altKey) {
        e4.preventDefault();
        e4.stopPropagation();
        this._addFeedbackAndSubmit();
        return;
      }
      if (e4.keyCode === 3 /* Enter */) {
        e4.preventDefault();
        e4.stopPropagation();
        this._addFeedback();
        return;
      }
    }));
    this._widgetListeners.add(addStandardDisposableListener(widget.inputElement, "keypress", (e4) => {
      e4.stopPropagation();
    }));
    this._widgetListeners.add(addStandardDisposableListener(widget.inputElement, "input", () => {
      widget.autoSize();
      widget.updateActionEnabled();
      this._updatePosition();
    }));
    this._widgetListeners.add(addStandardDisposableListener(widget.inputElement, "blur", () => {
      const win = getWindow(widget.inputElement);
      win.setTimeout(() => {
        if (!this._visible) {
          return;
        }
        if (this._editor.hasWidgetFocus()) {
          return;
        }
        this._autoHide();
      }, 0);
    }));
  }
  focusInput() {
    if (this._visible && this._widget) {
      this._widget.inputElement.focus();
    }
  }
  _hideAndRefocusEditor() {
    this._suppressSelectionChangeOnce = true;
    this._hide();
    this._editor.focus();
  }
  _addFeedback() {
    if (!this._widget) {
      return false;
    }
    const text2 = this._widget.inputElement.value.trim();
    if (!text2) {
      return false;
    }
    const range2 = this._pinnedRange ?? this._editor.getSelection();
    const model = this._editor.getModel();
    if (!range2 || !model || !this._sessionResource) {
      return false;
    }
    this._agentFeedbackService.addFeedback(this._sessionResource, model.uri, range2, text2, void 0, createAgentFeedbackContext(this._editor, this._codeEditorService, model.uri, range2));
    this._hideAndRefocusEditor();
    return true;
  }
  _addFeedbackAndSubmit() {
    if (!this._widget) {
      return;
    }
    const text2 = this._widget.inputElement.value.trim();
    if (!text2) {
      return;
    }
    const range2 = this._pinnedRange ?? this._editor.getSelection();
    const model = this._editor.getModel();
    if (!range2 || !model || !this._sessionResource) {
      return;
    }
    const sessionResource = this._sessionResource;
    this._hideAndRefocusEditor();
    this._agentFeedbackService.addFeedbackAndSubmit(sessionResource, model.uri, range2, text2, void 0, createAgentFeedbackContext(this._editor, this._codeEditorService, model.uri, range2));
  }
  _updatePosition() {
    if (!this._widget || !this._visible) {
      return;
    }
    const lineHeight = this._editor.getOption(75 /* lineHeight */);
    const layoutInfo = this._editor.getLayoutInfo();
    const widgetDom = this._widget.getDomNode();
    const widgetHeight = widgetDom.offsetHeight || 30;
    const widgetWidth = widgetDom.offsetWidth || 150;
    const target = this._getPositioningTarget();
    if (!target) {
      this._autoHide();
      return;
    }
    const scrolledPosition = this._editor.getScrolledVisiblePosition(target.anchorPosition);
    if (!scrolledPosition) {
      this._widget.setPosition(null);
      return;
    }
    let top2;
    if (target.preferBelow) {
      top2 = scrolledPosition.top + lineHeight;
      if (top2 + widgetHeight > layoutInfo.height) {
        top2 = scrolledPosition.top - widgetHeight;
      }
    } else {
      top2 = scrolledPosition.top - widgetHeight;
      if (top2 < 0) {
        top2 = scrolledPosition.top + lineHeight;
      }
    }
    top2 = Math.max(0, Math.min(top2, layoutInfo.height - widgetHeight));
    const minLeft = layoutInfo.contentLeft;
    const maxLeft = Math.max(minLeft, layoutInfo.width - widgetWidth);
    const left = Math.max(minLeft, Math.min(scrolledPosition.left, maxLeft));
    this._widget.setPosition({ preference: { top: top2, left } });
  }
  _getPositioningTarget() {
    if (this._pinnedRange && this._anchorPosition) {
      return { anchorPosition: this._anchorPosition, preferBelow: this._preferBelow };
    }
    const selection = this._editor.getSelection();
    if (!selection || selection.isEmpty()) {
      return void 0;
    }
    const preferBelow = selection.getDirection() === 0 /* LTR */;
    return {
      anchorPosition: preferBelow ? selection.getEndPosition() : selection.getStartPosition(),
      preferBelow
    };
  }
  dispose() {
    if (this._widget) {
      this._editor.removeOverlayWidget(this._widget);
      this._widget.dispose();
      this._widget = void 0;
    }
    super.dispose();
  }
};

AgentFeedbackEditorInputContribution = __decorateClass([
  __decorateParam(1, IAgentFeedbackService),
  __decorateParam(2, ICodeEditorService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IInstantiationService)
], AgentFeedbackEditorInputContribution);

var AddFeedbackAtCurrentLineAction = class extends Action2 {
  constructor() {
    super({
      id: addFeedbackAtCurrentLineActionId,
      title: localize2(4056, "Add Feedback at Current Line"),
      category: CHAT_CATEGORY,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, hasAgentFeedbackSessionForEditor),
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, hasAgentFeedbackSessionForEditor)
      }
    });
  }
  run(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const editor = codeEditorService.getFocusedCodeEditor() ?? codeEditorService.getActiveCodeEditor();
    const contribution = editor?.getContribution(AgentFeedbackEditorInputContribution.ID);
    contribution?.showAtCurrentLine(true);
  }
};

registerAction2(AddFeedbackAtCurrentLineAction);

registerEditorContribution(AgentFeedbackEditorInputContribution.ID, AgentFeedbackEditorInputContribution, 3 /* Eventually */);
export { addFeedbackAtCurrentLineActionId, agentFeedbackHoverGlyphClassName, hasAgentFeedbackSessionForEditor, AgentFeedbackInputWidget, AgentFeedbackEditorInputContribution, AddFeedbackAtCurrentLineAction };
