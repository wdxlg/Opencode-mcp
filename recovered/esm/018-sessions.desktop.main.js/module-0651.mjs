// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/contentHoverRendered.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Position } from "./module-0079.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { Range2 } from "./module-0106.mjs";
import { EditorHoverStatusBar } from "./module-0590.mjs";
import { RenderedHoverParts } from "./module-0575.mjs";
import { EventType, addDisposableListener } from "./module-0075.mjs";
import { ColorHover, HoverColorPickerParticipant } from "./module-0618.mjs";
import { HoverCopyButton } from "./module-0606.mjs";
import { MarkdownHoverParticipant } from "./module-0608.mjs";
import { InlayHintsHover } from "./module-0650.mjs";
import { localize } from "./module-0001.mjs";
import { BugIndicatingError } from "./module-0004.mjs";


// src/vs/editor/contrib/hover/browser/contentHoverRendered.ts
var RenderedContentHover = class extends Disposable {
  constructor(editor, hoverResult, participants, context2, keybindingService, hoverService, clipboardService) {
    super();
    const parts = hoverResult.hoverParts;
    this._renderedHoverParts = this._register(new RenderedContentHoverParts(
      editor,
      participants,
      parts,
      context2,
      keybindingService,
      hoverService,
      clipboardService
    ));
    const contentHoverComputerOptions = hoverResult.options;
    const anchor = contentHoverComputerOptions.anchor;
    const { showAtPosition, showAtSecondaryPosition } = RenderedContentHover.computeHoverPositions(editor, anchor.range, parts);
    this.shouldAppearBeforeContent = parts.some((m) => m.isBeforeContent);
    this.showAtPosition = showAtPosition;
    this.showAtSecondaryPosition = showAtSecondaryPosition;
    this.initialMousePosX = anchor.initialMousePosX;
    this.initialMousePosY = anchor.initialMousePosY;
    this.shouldFocus = contentHoverComputerOptions.shouldFocus;
    this.source = contentHoverComputerOptions.source;
  }
  get domNode() {
    return this._renderedHoverParts.domNode;
  }
  get domNodeHasChildren() {
    return this._renderedHoverParts.domNodeHasChildren;
  }
  get focusedHoverPartIndex() {
    return this._renderedHoverParts.focusedHoverPartIndex;
  }
  get hoverPartsCount() {
    return this._renderedHoverParts.hoverPartsCount;
  }
  focusHoverPartWithIndex(index2) {
    this._renderedHoverParts.focusHoverPartWithIndex(index2);
  }
  getAccessibleWidgetContent() {
    return this._renderedHoverParts.getAccessibleContent();
  }
  getAccessibleWidgetContentAtIndex(index2) {
    return this._renderedHoverParts.getAccessibleHoverContentAtIndex(index2);
  }
  async updateHoverVerbosityLevel(action, index2, focus) {
    this._renderedHoverParts.updateHoverVerbosityLevel(action, index2, focus);
  }
  doesHoverAtIndexSupportVerbosityAction(index2, action) {
    return this._renderedHoverParts.doesHoverAtIndexSupportVerbosityAction(index2, action);
  }
  isColorPickerVisible() {
    return this._renderedHoverParts.isColorPickerVisible();
  }
  static computeHoverPositions(editor, anchorRange, hoverParts) {
    let startColumnBoundary = 1;
    if (editor.hasModel()) {
      const viewModel = editor._getViewModel();
      const coordinatesConverter = viewModel.coordinatesConverter;
      const anchorViewRange = coordinatesConverter.convertModelRangeToViewRange(anchorRange);
      const anchorViewMinColumn = viewModel.getLineMinColumn(anchorViewRange.startLineNumber);
      const anchorViewRangeStart = new Position(anchorViewRange.startLineNumber, anchorViewMinColumn);
      startColumnBoundary = coordinatesConverter.convertViewPositionToModelPosition(anchorViewRangeStart).column;
    }
    const anchorStartLineNumber = anchorRange.startLineNumber;
    let secondaryPositionColumn = anchorRange.startColumn;
    let forceShowAtRange;
    for (const hoverPart of hoverParts) {
      const hoverPartRange = hoverPart.range;
      const hoverPartRangeOnAnchorStartLine = hoverPartRange.startLineNumber === anchorStartLineNumber;
      const hoverPartRangeOnAnchorEndLine = hoverPartRange.endLineNumber === anchorStartLineNumber;
      const hoverPartRangeIsOnAnchorLine = hoverPartRangeOnAnchorStartLine && hoverPartRangeOnAnchorEndLine;
      if (hoverPartRangeIsOnAnchorLine) {
        const hoverPartStartColumn = hoverPartRange.startColumn;
        const minSecondaryPositionColumn = Math.min(secondaryPositionColumn, hoverPartStartColumn);
        secondaryPositionColumn = Math.max(minSecondaryPositionColumn, startColumnBoundary);
      }
      if (hoverPart.forceShowAtRange) {
        forceShowAtRange = hoverPartRange;
      }
    }
    let showAtPosition;
    let showAtSecondaryPosition;
    if (forceShowAtRange) {
      const forceShowAtPosition = forceShowAtRange.getStartPosition();
      showAtPosition = forceShowAtPosition;
      showAtSecondaryPosition = forceShowAtPosition;
    } else {
      showAtPosition = anchorRange.getStartPosition();
      showAtSecondaryPosition = new Position(anchorStartLineNumber, secondaryPositionColumn);
    }
    return {
      showAtPosition,
      showAtSecondaryPosition
    };
  }
};

RenderedContentHover = __decorateClass([
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IClipboardService)
], RenderedContentHover);

var RenderedStatusBar = class {
  constructor(fragment, _statusBar) {
    this._statusBar = _statusBar;
    fragment.appendChild(this._statusBar.hoverElement);
  }
  get hoverElement() {
    return this._statusBar.hoverElement;
  }
  get actions() {
    return this._statusBar.actions;
  }
  dispose() {
    this._statusBar.dispose();
  }
};

var RenderedContentHoverParts = class extends Disposable {
  constructor(editor, participants, hoverParts, context2, keybindingService, _hoverService, _clipboardService) {
    super();
    this._hoverService = _hoverService;
    this._clipboardService = _clipboardService;
    this._renderedParts = [];
    this._perPartDisposables = /* @__PURE__ */ new Map();
    this._focusedHoverPartIndex = -1;
    this._context = context2;
    this._fragment = document.createDocumentFragment();
    this._register(this._renderParts(participants, hoverParts, context2, keybindingService, this._hoverService));
    this._register(this._registerListenersOnRenderedParts());
    this._register(this._createEditorDecorations(editor, hoverParts));
    this._updateMarkdownAndColorParticipantInfo(participants);
  }
  static {
    this._DECORATION_OPTIONS = ModelDecorationOptions.register({
      description: "content-hover-highlight",
      className: "hoverHighlight"
    });
  }
  _createEditorDecorations(editor, hoverParts) {
    if (hoverParts.length === 0) {
      return Disposable.None;
    }
    let highlightRange2 = hoverParts[0].range;
    for (const hoverPart of hoverParts) {
      const hoverPartRange = hoverPart.range;
      highlightRange2 = Range2.plusRange(highlightRange2, hoverPartRange);
    }
    const highlightDecoration = editor.createDecorationsCollection();
    highlightDecoration.set([{
      range: highlightRange2,
      options: RenderedContentHoverParts._DECORATION_OPTIONS
    }]);
    return toDisposable(() => {
      highlightDecoration.clear();
    });
  }
  _renderParts(participants, hoverParts, hoverContext, keybindingService, hoverService) {
    const statusBar = new EditorHoverStatusBar(keybindingService, hoverService);
    const hoverRenderingContext = {
      fragment: this._fragment,
      statusBar,
      ...hoverContext
    };
    const disposables = new DisposableStore();
    disposables.add(statusBar);
    for (const participant of participants) {
      const renderedHoverParts = this._renderHoverPartsForParticipant(hoverParts, participant, hoverRenderingContext);
      disposables.add(renderedHoverParts);
      for (const renderedHoverPart of renderedHoverParts.renderedHoverParts) {
        this._renderedParts.push({
          type: "hoverPart",
          participant,
          hoverPart: renderedHoverPart.hoverPart,
          hoverElement: renderedHoverPart.hoverElement
        });
      }
    }
    const renderedStatusBar = this._renderStatusBar(this._fragment, statusBar);
    if (renderedStatusBar) {
      disposables.add(renderedStatusBar);
      this._renderedParts.push({
        type: "statusBar",
        hoverElement: renderedStatusBar.hoverElement,
        actions: renderedStatusBar.actions
      });
    }
    return disposables;
  }
  _renderHoverPartsForParticipant(hoverParts, participant, hoverRenderingContext) {
    const hoverPartsForParticipant = hoverParts.filter((hoverPart) => hoverPart.owner === participant);
    const hasHoverPartsForParticipant = hoverPartsForParticipant.length > 0;
    if (!hasHoverPartsForParticipant) {
      return new RenderedHoverParts([]);
    }
    return participant.renderHoverParts(hoverRenderingContext, hoverPartsForParticipant);
  }
  _renderStatusBar(fragment, statusBar) {
    if (!statusBar.hasContent) {
      return void 0;
    }
    return new RenderedStatusBar(fragment, statusBar);
  }
  _registerListenersOnRenderedParts() {
    this._renderedParts.forEach((renderedPart, index2) => {
      this._createListenersForPart(index2, renderedPart);
    });
    return toDisposable(() => {
      for (const d of this._perPartDisposables.values()) {
        d.dispose();
      }
      this._perPartDisposables.clear();
    });
  }
  _createListenersForPart(index2, renderedPart) {
    const partDisposables = new DisposableStore();
    const element = renderedPart.hoverElement;
    element.tabIndex = 0;
    partDisposables.add(addDisposableListener(element, EventType.FOCUS_IN, (event) => {
      event.stopPropagation();
      this._focusedHoverPartIndex = index2;
    }));
    partDisposables.add(addDisposableListener(element, EventType.FOCUS_OUT, (event) => {
      event.stopPropagation();
      this._focusedHoverPartIndex = -1;
    }));
    if (renderedPart.type === "hoverPart" && !(renderedPart.hoverPart instanceof ColorHover) && !renderedPart.participant.hideCopyButton) {
      partDisposables.add(new HoverCopyButton(
        element,
        () => renderedPart.participant.getAccessibleContent(renderedPart.hoverPart),
        this._clipboardService,
        this._hoverService
      ));
    }
    this._perPartDisposables.set(index2, partDisposables);
  }
  _updateMarkdownAndColorParticipantInfo(participants) {
    const markdownHoverParticipant = participants.find((p) => {
      return p instanceof MarkdownHoverParticipant && !(p instanceof InlayHintsHover);
    });
    if (markdownHoverParticipant) {
      this._markdownHoverParticipant = markdownHoverParticipant;
    }
    this._colorHoverParticipant = participants.find((p) => p instanceof HoverColorPickerParticipant);
  }
  focusHoverPartWithIndex(index2) {
    if (index2 < 0 || index2 >= this._renderedParts.length) {
      return;
    }
    this._renderedParts[index2].hoverElement.focus();
  }
  getAccessibleContent() {
    const content = [];
    for (let i2 = 0; i2 < this._renderedParts.length; i2++) {
      content.push(this.getAccessibleHoverContentAtIndex(i2));
    }
    return content.join("\n\n");
  }
  getAccessibleHoverContentAtIndex(index2) {
    const renderedPart = this._renderedParts[index2];
    if (!renderedPart) {
      return "";
    }
    if (renderedPart.type === "statusBar") {
      const statusBarDescription = [localize(1277, null)];
      for (const action of renderedPart.actions) {
        const keybinding = action.actionKeybindingLabel;
        if (keybinding) {
          statusBarDescription.push(localize(1278, null, action.actionLabel, keybinding));
        } else {
          statusBarDescription.push(localize(1279, null, action.actionLabel));
        }
      }
      return statusBarDescription.join("\n");
    }
    return renderedPart.participant.getAccessibleContent(renderedPart.hoverPart);
  }
  async updateHoverVerbosityLevel(action, index2, focus) {
    if (!this._markdownHoverParticipant) {
      return;
    }
    let rangeOfIndicesToUpdate;
    if (index2 >= 0) {
      rangeOfIndicesToUpdate = { start: index2, endExclusive: index2 + 1 };
    } else {
      rangeOfIndicesToUpdate = this._findRangeOfMarkdownHoverParts(this._markdownHoverParticipant);
    }
    for (let i2 = rangeOfIndicesToUpdate.start; i2 < rangeOfIndicesToUpdate.endExclusive; i2++) {
      const normalizedMarkdownHoverIndex = this._normalizedIndexToMarkdownHoverIndexRange(this._markdownHoverParticipant, i2);
      if (normalizedMarkdownHoverIndex === void 0) {
        continue;
      }
      const renderedPart = await this._markdownHoverParticipant.updateMarkdownHoverVerbosityLevel(action, normalizedMarkdownHoverIndex);
      if (!renderedPart) {
        continue;
      }
      const prevDisposable = this._perPartDisposables.get(i2);
      if (prevDisposable) {
        prevDisposable.dispose();
        this._perPartDisposables.delete(i2);
      }
      this._renderedParts[i2] = {
        type: "hoverPart",
        participant: this._markdownHoverParticipant,
        hoverPart: renderedPart.hoverPart,
        hoverElement: renderedPart.hoverElement
      };
      this._createListenersForPart(i2, this._renderedParts[i2]);
    }
    if (focus) {
      if (index2 >= 0) {
        this.focusHoverPartWithIndex(index2);
      } else {
        this._context.focus();
      }
    }
    this._context.onContentsChanged();
  }
  doesHoverAtIndexSupportVerbosityAction(index2, action) {
    if (!this._markdownHoverParticipant) {
      return false;
    }
    const normalizedMarkdownHoverIndex = this._normalizedIndexToMarkdownHoverIndexRange(this._markdownHoverParticipant, index2);
    if (normalizedMarkdownHoverIndex === void 0) {
      return false;
    }
    return this._markdownHoverParticipant.doesMarkdownHoverAtIndexSupportVerbosityAction(normalizedMarkdownHoverIndex, action);
  }
  isColorPickerVisible() {
    return this._colorHoverParticipant?.isColorPickerVisible() ?? false;
  }
  _normalizedIndexToMarkdownHoverIndexRange(markdownHoverParticipant, index2) {
    const renderedPart = this._renderedParts[index2];
    if (!renderedPart || renderedPart.type !== "hoverPart") {
      return void 0;
    }
    const isHoverPartMarkdownHover = renderedPart.participant === markdownHoverParticipant;
    if (!isHoverPartMarkdownHover) {
      return void 0;
    }
    const firstIndexOfMarkdownHovers = this._renderedParts.findIndex(
      (renderedPart2) => renderedPart2.type === "hoverPart" && renderedPart2.participant === markdownHoverParticipant
    );
    if (firstIndexOfMarkdownHovers === -1) {
      throw new BugIndicatingError();
    }
    return index2 - firstIndexOfMarkdownHovers;
  }
  _findRangeOfMarkdownHoverParts(markdownHoverParticipant) {
    const copiedRenderedParts = this._renderedParts.slice();
    const firstIndexOfMarkdownHovers = copiedRenderedParts.findIndex((renderedPart) => renderedPart.type === "hoverPart" && renderedPart.participant === markdownHoverParticipant);
    const inversedLastIndexOfMarkdownHovers = copiedRenderedParts.reverse().findIndex((renderedPart) => renderedPart.type === "hoverPart" && renderedPart.participant === markdownHoverParticipant);
    const lastIndexOfMarkdownHovers = inversedLastIndexOfMarkdownHovers >= 0 ? copiedRenderedParts.length - inversedLastIndexOfMarkdownHovers : inversedLastIndexOfMarkdownHovers;
    return { start: firstIndexOfMarkdownHovers, endExclusive: lastIndexOfMarkdownHovers + 1 };
  }
  get domNode() {
    return this._fragment;
  }
  get domNodeHasChildren() {
    return this._fragment.hasChildNodes();
  }
  get focusedHoverPartIndex() {
    return this._focusedHoverPartIndex;
  }
  get hoverPartsCount() {
    return this._renderedParts.length;
  }
};

RenderedContentHoverParts = __decorateClass([
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IClipboardService)
], RenderedContentHoverParts);
export { RenderedContentHover, RenderedStatusBar, RenderedContentHoverParts };
