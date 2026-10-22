// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingExplanationWidget.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { $, addDisposableListener, clearNode, getTotalWidth } from "./module-0075.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Range2 } from "./module-0106.mjs";
import { ChatViewId } from "./module-0981.mjs";
import { themeColorFromId2 } from "./module-0287.mjs";
import { overviewRulerRangeHighlight } from "./module-0288.mjs";
import { autorun } from "./module-0052.mjs";
import { Event2 } from "./module-0017.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingExplanationWidget.ts
function getChangeTexts(change, diffInfo) {
  const originalLines = [];
  const modifiedLines = [];
  for (let i2 = change.original.startLineNumber; i2 < change.original.endLineNumberExclusive; i2++) {
    const line = diffInfo.originalModel.getLineContent(i2);
    originalLines.push(line);
  }
  for (let i2 = change.modified.startLineNumber; i2 < change.modified.endLineNumberExclusive; i2++) {
    const line = diffInfo.modifiedModel.getLineContent(i2);
    modifiedLines.push(line);
  }
  return {
    originalText: originalLines.join("\n"),
    modifiedText: modifiedLines.join("\n")
  };
}

function groupNearbyChanges(changes, lineThreshold = 5) {
  if (changes.length === 0) {
    return [];
  }
  const groups = [];
  let currentGroup = [changes[0]];
  for (let i2 = 1; i2 < changes.length; i2++) {
    const firstChange = currentGroup[0];
    const currentChange = changes[i2];
    const widgetLine = firstChange.modified.startLineNumber;
    const lastLine = currentChange.modified.startLineNumber;
    const verticalSpan = lastLine - widgetLine;
    if (verticalSpan <= lineThreshold) {
      currentGroup.push(currentChange);
    } else {
      groups.push(currentGroup);
      currentGroup = [currentChange];
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  return groups;
}

var ChatEditingExplanationWidget = class _ChatEditingExplanationWidget extends Disposable {
  constructor(_editor, _changes, diffInfo, _chatWidgetService, _viewsService, _chatSessionResource) {
    super();
    this._editor = _editor;
    this._changes = _changes;
    this._chatWidgetService = _chatWidgetService;
    this._viewsService = _viewsService;
    this._chatSessionResource = _chatSessionResource;
    this._id = `chat-explanation-widget-${_ChatEditingExplanationWidget._idPool++}`;
    this._explanationItems = /* @__PURE__ */ new Map();
    this._position = null;
    this._explanations = [];
    this._isExpanded = true;
    this._isAllRead = false;
    this._disposed = false;
    this._startLineNumber = 1;
    this._eventStore = this._register(new DisposableStore());
    this._uri = diffInfo.modifiedModel.uri;
    this._rangeHighlightDecoration = this._editor.createDecorationsCollection();
    this._explanations = this._changes.map((change) => {
      const { originalText, modifiedText } = getChangeTexts(change, diffInfo);
      return {
        startLineNumber: change.modified.startLineNumber,
        endLineNumber: change.modified.endLineNumberExclusive - 1,
        explanation: localize(10867, null),
        read: false,
        loading: true,
        originalText,
        modifiedText
      };
    });
    this._domNode = $("div.chat-explanation-widget");
    this._headerNode = $("div.chat-explanation-header");
    this._readIndicator = $("div.chat-explanation-read-indicator");
    this._updateReadIndicator();
    this._headerNode.appendChild(this._readIndicator);
    this._titleNode = $("span.chat-explanation-title");
    this._updateTitle();
    this._headerNode.appendChild(this._titleNode);
    this._headerNode.appendChild($("span.chat-explanation-spacer"));
    this._toggleButton = $("div.chat-explanation-toggle");
    this._updateToggleButton();
    this._headerNode.appendChild(this._toggleButton);
    this._dismissButton = $("div.chat-explanation-dismiss");
    this._dismissButton.appendChild(renderIcon(Codicon.closeSmall));
    this._dismissButton.title = localize(10864, null);
    this._headerNode.appendChild(this._dismissButton);
    this._domNode.appendChild(this._headerNode);
    this._bodyNode = $("div.chat-explanation-body");
    this._buildExplanationItems();
    this._domNode.appendChild(this._bodyNode);
    const arrow = $("div.chat-explanation-arrow");
    this._domNode.appendChild(arrow);
    this._setupEventHandlers();
    this._domNode.classList.add("visible");
    this._editor.addOverlayWidget(this);
  }
  static {
    this._idPool = 0;
  }
  _setupEventHandlers() {
    this._eventStore.add(addDisposableListener(this._readIndicator, "click", (e) => {
      e.stopPropagation();
      this._isAllRead = !this._isAllRead;
      for (const exp of this._explanations) {
        exp.read = this._isAllRead;
      }
      this._updateReadIndicator();
      this._updateExplanationItemsReadState();
    }));
    this._eventStore.add(addDisposableListener(this._toggleButton, "click", (e) => {
      e.stopPropagation();
      this._toggleExpanded();
    }));
    this._eventStore.add(addDisposableListener(this._headerNode, "click", () => {
      this._toggleExpanded();
    }));
    this._eventStore.add(addDisposableListener(this._dismissButton, "click", (e) => {
      e.stopPropagation();
      this._dismiss();
    }));
  }
  _toggleExpanded() {
    this._isExpanded = !this._isExpanded;
    this._bodyNode.classList.toggle("collapsed", !this._isExpanded);
    this._updateToggleButton();
    this._editor.layoutOverlayWidget(this);
  }
  _dismiss() {
    this._domNode.classList.add("fadeOut");
    const dispose2 = () => {
      this.dispose();
    };
    const handle2 = setTimeout(dispose2, 150);
    this._domNode.addEventListener("animationend", () => {
      clearTimeout(handle2);
      dispose2();
    }, { once: true });
  }
  _updateReadIndicator() {
    clearNode(this._readIndicator);
    const allRead = this._explanations.every((e) => e.read);
    const someRead = this._explanations.some((e) => e.read);
    this._isAllRead = allRead;
    if (allRead) {
      this._readIndicator.appendChild(renderIcon(Codicon.circle));
      this._readIndicator.classList.add("read");
      this._readIndicator.classList.remove("partial", "unread");
      this._readIndicator.title = localize(10872, null);
    } else if (someRead) {
      this._readIndicator.appendChild(renderIcon(Codicon.circleFilledCompact));
      this._readIndicator.classList.remove("read", "unread");
      this._readIndicator.classList.add("partial");
      this._readIndicator.title = localize(10870, null);
    } else {
      this._readIndicator.appendChild(renderIcon(Codicon.circleFilledCompact));
      this._readIndicator.classList.remove("read", "partial");
      this._readIndicator.classList.add("unread");
      this._readIndicator.title = localize(10871, null);
    }
  }
  _updateTitle() {
    const count2 = this._explanations.length;
    if (count2 === 1) {
      this._titleNode.textContent = localize(10874, null);
    } else {
      this._titleNode.textContent = localize(10873, null, count2);
    }
  }
  _updateToggleButton() {
    clearNode(this._toggleButton);
    if (this._isExpanded) {
      this._toggleButton.appendChild(renderIcon(Codicon.chevronUp));
      this._toggleButton.title = localize(10863, null);
    } else {
      this._toggleButton.appendChild(renderIcon(Codicon.chevronDown));
      this._toggleButton.title = localize(10865, null);
    }
  }
  _buildExplanationItems() {
    clearNode(this._bodyNode);
    this._explanationItems.clear();
    for (let i2 = 0; i2 < this._explanations.length; i2++) {
      const exp = this._explanations[i2];
      const item = $("div.chat-explanation-item");
      const lineInfo = $("span.chat-explanation-line-info");
      if (exp.startLineNumber === exp.endLineNumber) {
        lineInfo.textContent = localize(10868, null, exp.startLineNumber);
      } else {
        lineInfo.textContent = localize(10869, null, exp.startLineNumber, exp.endLineNumber);
      }
      item.appendChild(lineInfo);
      const text2 = $("span.chat-explanation-text");
      if (exp.loading) {
        const loadingIcon = renderIcon(ThemeIcon.modify(Codicon.loading, "spin"));
        loadingIcon.classList.add("chat-explanation-loading");
        text2.appendChild(loadingIcon);
        const loadingText = document.createTextNode(" " + exp.explanation);
        text2.appendChild(loadingText);
      } else {
        text2.textContent = exp.explanation;
      }
      item.appendChild(text2);
      const itemReadIndicator = $("div.chat-explanation-item-read");
      this._updateItemReadIndicator(itemReadIndicator, exp.read);
      item.appendChild(itemReadIndicator);
      const replyButton = $("div.chat-explanation-reply-button");
      replyButton.appendChild(renderIcon(Codicon.arrowRight));
      replyButton.title = localize(10866, null);
      item.appendChild(replyButton);
      this._eventStore.add(addDisposableListener(replyButton, "click", async (e) => {
        e.stopPropagation();
        const range2 = new Range2(exp.startLineNumber, 1, exp.endLineNumber, 1);
        let chatWidget;
        if (this._chatSessionResource) {
          chatWidget = await this._chatWidgetService.openSession(this._chatSessionResource);
        } else {
          await this._viewsService.openView(ChatViewId, true);
          chatWidget = this._chatWidgetService.lastFocusedWidget;
        }
        if (chatWidget) {
          chatWidget.attachmentModel.addContext(
            chatWidget.attachmentModel.asFileVariableEntry(this._uri, range2)
          );
        }
      }));
      this._eventStore.add(addDisposableListener(item, "click", (e) => {
        e.stopPropagation();
        exp.read = !exp.read;
        this._updateItemReadIndicator(itemReadIndicator, exp.read);
        this._updateReadIndicator();
      }));
      this._eventStore.add(addDisposableListener(item, "mouseenter", () => {
        const range2 = new Range2(exp.startLineNumber, 1, exp.endLineNumber, this._editor.getModel()?.getLineMaxColumn(exp.endLineNumber) ?? 1);
        this._rangeHighlightDecoration.set([
          // Line highlight with gutter decoration
          {
            range: range2,
            options: {
              description: "chat-explanation-range-highlight",
              className: "rangeHighlight",
              isWholeLine: true,
              linesDecorationsClassName: "chat-explanation-range-glyph"
            }
          },
          // Overview ruler indicator
          {
            range: range2,
            options: {
              description: "chat-explanation-range-highlight-overview",
              overviewRuler: {
                color: themeColorFromId2(overviewRulerRangeHighlight),
                position: 7 /* Full */
              }
            }
          }
        ]);
      }));
      this._eventStore.add(addDisposableListener(item, "mouseleave", () => {
        this._rangeHighlightDecoration.clear();
      }));
      this._explanationItems.set(i2, { item, readIndicator: itemReadIndicator, textElement: text2 });
      this._bodyNode.appendChild(item);
    }
  }
  /**
   * Sets the explanation for a change matching the given line number range.
   * @returns true if a matching explanation was found and updated
   */
  setExplanationByLineNumber(startLineNumber, endLineNumber, explanation) {
    for (let i2 = 0; i2 < this._explanations.length; i2++) {
      const exp = this._explanations[i2];
      if (exp.startLineNumber === startLineNumber && exp.endLineNumber === endLineNumber) {
        exp.explanation = explanation;
        exp.loading = false;
        this._updateExplanationText(i2);
        return true;
      }
    }
    return false;
  }
  /**
   * Gets the number of explanations in this widget.
   */
  get explanationCount() {
    return this._explanations.length;
  }
  _updateExplanationText(index2) {
    const itemData = this._explanationItems.get(index2);
    const exp = this._explanations[index2];
    if (itemData && exp) {
      clearNode(itemData.textElement);
      itemData.textElement.textContent = exp.explanation;
    }
  }
  _updateItemReadIndicator(element, read) {
    clearNode(element);
    if (read) {
      element.appendChild(renderIcon(Codicon.circle));
      element.classList.add("read");
      element.classList.remove("unread");
    } else {
      element.appendChild(renderIcon(Codicon.circleFilledCompact));
      element.classList.remove("read");
      element.classList.add("unread");
    }
  }
  _updateExplanationItemsReadState() {
    this._explanationItems.forEach(({ readIndicator }, index2) => {
      const exp = this._explanations[index2];
      this._updateItemReadIndicator(readIndicator, exp.read);
    });
  }
  /**
   * Updates the widget position and layout
   */
  layout(startLineNumber) {
    if (this._disposed) {
      return;
    }
    this._startLineNumber = startLineNumber;
    const lineHeight = this._editor.getOption(75 /* lineHeight */);
    const { contentLeft, contentWidth, verticalScrollbarWidth } = this._editor.getLayoutInfo();
    const scrollTop = this._editor.getScrollTop();
    const widgetWidth = getTotalWidth(this._domNode) || 280;
    this._position = {
      stackOrdinal: 2,
      preference: {
        top: this._editor.getTopForLineNumber(startLineNumber) - scrollTop - lineHeight,
        left: contentLeft + contentWidth - (2 * verticalScrollbarWidth + widgetWidth)
      }
    };
    this._editor.layoutOverlayWidget(this);
  }
  /**
   * Shows or hides the widget
   */
  toggle(show3) {
    this._domNode.classList.toggle("visible", show3);
    if (show3 && this._explanations.length > 0) {
      this.layout(this._explanations[0].startLineNumber);
    }
  }
  /**
   * Relayouts the widget at its current line number
   */
  relayout() {
    if (this._startLineNumber) {
      this.layout(this._startLineNumber);
    }
  }
  // IOverlayWidget implementation
  getId() {
    return this._id;
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return this._position;
  }
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    this._rangeHighlightDecoration.clear();
    this._editor.removeOverlayWidget(this);
    super.dispose();
  }
};

var ChatEditingExplanationWidgetManager = class extends Disposable {
  constructor(_editor, _chatWidgetService, _viewsService, modelManager, _modelUri) {
    super();
    this._editor = _editor;
    this._chatWidgetService = _chatWidgetService;
    this._viewsService = _viewsService;
    this._modelUri = _modelUri;
    this._widgets = [];
    this._visible = false;
    this._register(this._editor.onDidChangeModel(() => {
      const newUri = this._editor.getModel()?.uri;
      if (this._modelUri) {
        if (newUri && newUri.toString() === this._modelUri.toString()) {
          for (const widget of this._widgets) {
            widget.toggle(this._visible);
            widget.relayout();
          }
        } else {
          for (const widget of this._widgets) {
            widget.toggle(false);
          }
        }
      }
    }));
    this._register(autorun((r2) => {
      const state = modelManager.state.read(r2);
      const uriState = state.get(this._modelUri);
      if (uriState) {
        this._diffInfo = uriState.diffInfo;
        this._chatSessionResource = uriState.chatSessionResource;
        if (this._widgets.length === 0 && this._diffInfo) {
          this._createWidgets(this._diffInfo, this._chatSessionResource);
        }
        if (uriState.progress === "complete") {
          this._handleExplanations(this._modelUri, uriState.explanations);
        }
        this.show();
      } else {
        this.hide();
      }
    }));
  }
  _createWidgets(diffInfo, chatSessionResource) {
    if (diffInfo.identical || diffInfo.changes.length === 0) {
      return;
    }
    const groups = groupNearbyChanges(diffInfo.changes, 5);
    for (const group2 of groups) {
      const widget = new ChatEditingExplanationWidget(
        this._editor,
        group2,
        diffInfo,
        this._chatWidgetService,
        this._viewsService,
        chatSessionResource
      );
      this._widgets.push(widget);
      this._register(widget);
      widget.layout(group2[0].modified.startLineNumber);
    }
    this._register(Event2.any(this._editor.onDidScrollChange, this._editor.onDidLayoutChange)(() => {
      for (const widget of this._widgets) {
        widget.relayout();
      }
    }));
  }
  _handleExplanations(uri5, explanations) {
    if (!this._modelUri || uri5.toString() !== this._modelUri.toString()) {
      return;
    }
    for (const explanation of explanations) {
      for (const widget of this._widgets) {
        if (widget.setExplanationByLineNumber(
          explanation.startLineNumber,
          explanation.endLineNumber,
          explanation.explanation
        )) {
          break;
        }
      }
    }
  }
  /**
   * Shows all widgets
   */
  show() {
    this._visible = true;
    for (const widget of this._widgets) {
      widget.toggle(true);
      widget.relayout();
    }
  }
  /**
   * Hides all widgets
   */
  hide() {
    this._visible = false;
    for (const widget of this._widgets) {
      widget.toggle(false);
    }
  }
  _clearWidgets() {
    for (const widget of this._widgets) {
      widget.dispose();
    }
    this._widgets.length = 0;
  }
  dispose() {
    this._clearWidgets();
    super.dispose();
  }
};
export { getChangeTexts, groupNearbyChanges, ChatEditingExplanationWidget, ChatEditingExplanationWidgetManager };
