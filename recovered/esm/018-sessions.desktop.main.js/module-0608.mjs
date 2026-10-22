// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/markdownHoverParticipant.ts
import { $, append } from "./module-0075.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { MarkdownString, isEmptyMarkdownString } from "./module-0462.mjs";
import { DECREASE_HOVER_VERBOSITY_ACTION_ID, HIDE_LONG_LINE_WARNING_HOVER_ACTION_ID, INCREASE_HOVER_VERBOSITY_ACTION_ID } from "./module-0579.mjs";
import { Range2 } from "./module-0106.mjs";
import { asArray, compareBy, numberComparator } from "./module-0007.mjs";
import { AsyncIterableProducer } from "./module-0036.mjs";
import { getHoverProviderResultsAsAsyncIterable } from "./module-0607.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IHoverService, WorkbenchHoverDelegate } from "./module-0520.mjs";
import { ICommandService } from "./module-0087.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { ClickAction, KeyDownAction } from "./module-0469.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { onUnexpectedExternalError } from "./module-0004.mjs";
import { RenderedHoverParts } from "./module-0575.mjs";


// src/vs/editor/contrib/hover/browser/markdownHoverParticipant.ts
var $7 = $;

var increaseHoverVerbosityIcon = registerIcon("hover-increase-verbosity", Codicon.addSmall, localize(1312, null));

var decreaseHoverVerbosityIcon = registerIcon("hover-decrease-verbosity", Codicon.removeSmall, localize(1310, null));

var MarkdownHover = class {
  constructor(owner, range2, contents, isBeforeContent, ordinal, source = void 0) {
    this.owner = owner;
    this.range = range2;
    this.contents = contents;
    this.isBeforeContent = isBeforeContent;
    this.ordinal = ordinal;
    this.source = source;
  }
  isValidForHoverAnchor(anchor) {
    return anchor.type === 1 /* Range */ && this.range.startColumn <= anchor.range.startColumn && this.range.endColumn >= anchor.range.endColumn;
  }
};

var HoverSource = class {
  constructor(hover, hoverProvider, hoverPosition) {
    this.hover = hover;
    this.hoverProvider = hoverProvider;
    this.hoverPosition = hoverPosition;
  }
  supportsVerbosityAction(hoverVerbosityAction) {
    switch (hoverVerbosityAction) {
      case 0 /* Increase */:
        return this.hover.canIncreaseVerbosity ?? false;
      case 1 /* Decrease */:
        return this.hover.canDecreaseVerbosity ?? false;
    }
  }
};

var MarkdownHoverParticipant = class {
  constructor(_editor, _markdownRendererService, _configurationService, _languageFeaturesService, _keybindingService, _hoverService, _commandService) {
    this._editor = _editor;
    this._markdownRendererService = _markdownRendererService;
    this._configurationService = _configurationService;
    this._languageFeaturesService = _languageFeaturesService;
    this._keybindingService = _keybindingService;
    this._hoverService = _hoverService;
    this._commandService = _commandService;
    this.hoverOrdinal = 3;
  }
  createLoadingMessage(anchor) {
    return new MarkdownHover(this, anchor.range, [new MarkdownString().appendText(localize(1314, null))], false, 2e3);
  }
  computeSync(anchor, lineDecorations) {
    if (!this._editor.hasModel() || anchor.type !== 1 /* Range */) {
      return [];
    }
    const model = this._editor.getModel();
    const lineNumber = anchor.range.startLineNumber;
    const maxColumn = model.getLineMaxColumn(lineNumber);
    const result = [];
    let index2 = 1e3;
    const lineLength = model.getLineLength(lineNumber);
    const languageId = model.getLanguageIdAtPosition(anchor.range.startLineNumber, anchor.range.startColumn);
    const stopRenderingLineAfter = this._editor.getOption(133 /* stopRenderingLineAfter */);
    const maxTokenizationLineLength = this._configurationService.getValue("editor.maxTokenizationLineLength", {
      overrideIdentifier: languageId
    });
    const showLongLineWarning = this._editor.getOption(69 /* hover */).showLongLineWarning;
    let stopRenderingMessage = false;
    if (stopRenderingLineAfter >= 0 && lineLength > stopRenderingLineAfter && anchor.range.startColumn >= stopRenderingLineAfter) {
      stopRenderingMessage = true;
      if (showLongLineWarning) {
        result.push(new MarkdownHover(this, anchor.range, [{
          value: localize(
            1315,
            null,
            HIDE_LONG_LINE_WARNING_HOVER_ACTION_ID
          ),
          isTrusted: true
        }], false, index2++));
      }
    }
    if (!stopRenderingMessage && typeof maxTokenizationLineLength === "number" && lineLength >= maxTokenizationLineLength) {
      if (showLongLineWarning) {
        result.push(new MarkdownHover(this, anchor.range, [{
          value: localize(
            1316,
            null,
            HIDE_LONG_LINE_WARNING_HOVER_ACTION_ID
          ),
          isTrusted: true
        }], false, index2++));
      }
    }
    let isBeforeContent = false;
    for (const d of lineDecorations) {
      const startColumn = d.range.startLineNumber === lineNumber ? d.range.startColumn : 1;
      const endColumn = d.range.endLineNumber === lineNumber ? d.range.endColumn : maxColumn;
      const hoverMessage = d.options.hoverMessage;
      if (!hoverMessage || isEmptyMarkdownString(hoverMessage)) {
        continue;
      }
      if (d.options.beforeContentClassName) {
        isBeforeContent = true;
      }
      const range2 = new Range2(anchor.range.startLineNumber, startColumn, anchor.range.startLineNumber, endColumn);
      result.push(new MarkdownHover(this, range2, asArray(hoverMessage), isBeforeContent, index2++));
    }
    return result;
  }
  computeAsync(anchor, lineDecorations, source, token) {
    if (!this._editor.hasModel() || anchor.type !== 1 /* Range */) {
      return AsyncIterableProducer.EMPTY;
    }
    const model = this._editor.getModel();
    const hoverProviderRegistry = this._languageFeaturesService.hoverProvider;
    if (!hoverProviderRegistry.has(model)) {
      return AsyncIterableProducer.EMPTY;
    }
    return this._getMarkdownHovers(hoverProviderRegistry, model, anchor, token);
  }
  async *_getMarkdownHovers(hoverProviderRegistry, model, anchor, token) {
    const position2 = anchor.range.getStartPosition();
    const hoverProviderResults = getHoverProviderResultsAsAsyncIterable(hoverProviderRegistry, model, position2, token);
    for await (const item of hoverProviderResults) {
      if (!isEmptyMarkdownString(item.hover.contents)) {
        const range2 = item.hover.range ? Range2.lift(item.hover.range) : anchor.range;
        const hoverSource = new HoverSource(item.hover, item.provider, position2);
        yield new MarkdownHover(this, range2, item.hover.contents, false, item.ordinal, hoverSource);
      }
    }
  }
  renderHoverParts(context2, hoverParts) {
    this._renderedHoverParts = new MarkdownRenderedHoverParts(
      hoverParts,
      context2.fragment,
      this,
      this._editor,
      this._commandService,
      this._keybindingService,
      this._hoverService,
      this._configurationService,
      this._markdownRendererService,
      context2.onContentsChanged
    );
    return this._renderedHoverParts;
  }
  handleScroll(e4) {
    this._renderedHoverParts?.handleScroll(e4);
  }
  getAccessibleContent(hoverPart) {
    return this._renderedHoverParts?.getAccessibleContent(hoverPart) ?? "";
  }
  doesMarkdownHoverAtIndexSupportVerbosityAction(index2, action) {
    return this._renderedHoverParts?.doesMarkdownHoverAtIndexSupportVerbosityAction(index2, action) ?? false;
  }
  updateMarkdownHoverVerbosityLevel(action, index2) {
    return Promise.resolve(this._renderedHoverParts?.updateMarkdownHoverPartVerbosityLevel(action, index2));
  }
};

MarkdownHoverParticipant = __decorateClass([
  __decorateParam(1, IMarkdownRendererService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ILanguageFeaturesService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, ICommandService)
], MarkdownHoverParticipant);

var RenderedMarkdownHoverPart = class {
  constructor(hoverPart, hoverElement, disposables, actionsContainer) {
    this.hoverPart = hoverPart;
    this.hoverElement = hoverElement;
    this.disposables = disposables;
    this.actionsContainer = actionsContainer;
  }
  get hoverAccessibleContent() {
    return this.hoverElement.innerText.trim();
  }
  dispose() {
    this.disposables.dispose();
  }
};

var MarkdownRenderedHoverParts = class {
  constructor(hoverParts, hoverPartsContainer, _hoverParticipant, _editor, _commandService, _keybindingService, _hoverService, _configurationService, _markdownRendererService, _onFinishedRendering) {
    this._hoverParticipant = _hoverParticipant;
    this._editor = _editor;
    this._commandService = _commandService;
    this._keybindingService = _keybindingService;
    this._hoverService = _hoverService;
    this._configurationService = _configurationService;
    this._markdownRendererService = _markdownRendererService;
    this._onFinishedRendering = _onFinishedRendering;
    this._ongoingHoverOperations = /* @__PURE__ */ new Map();
    this._disposables = new DisposableStore();
    this.renderedHoverParts = this._renderHoverParts(hoverParts, hoverPartsContainer, this._onFinishedRendering);
    this._disposables.add(toDisposable(() => {
      this.renderedHoverParts.forEach((renderedHoverPart) => {
        renderedHoverPart.dispose();
      });
      this._ongoingHoverOperations.forEach((operation) => {
        operation.tokenSource.dispose(true);
      });
    }));
  }
  _renderHoverParts(hoverParts, hoverPartsContainer, onFinishedRendering) {
    hoverParts.sort(compareBy((hover) => hover.ordinal, numberComparator));
    return hoverParts.map((hoverPart) => {
      const renderedHoverPart = this._renderHoverPart(hoverPart, onFinishedRendering);
      hoverPartsContainer.appendChild(renderedHoverPart.hoverElement);
      return renderedHoverPart;
    });
  }
  _renderHoverPart(hoverPart, onFinishedRendering) {
    const renderedMarkdownPart = this._renderMarkdownHover(hoverPart, onFinishedRendering);
    const renderedMarkdownElement = renderedMarkdownPart.hoverElement;
    const hoverSource = hoverPart.source;
    const disposables = new DisposableStore();
    disposables.add(renderedMarkdownPart);
    if (!hoverSource) {
      return new RenderedMarkdownHoverPart(hoverPart, renderedMarkdownElement, disposables);
    }
    const canIncreaseVerbosity = hoverSource.supportsVerbosityAction(0 /* Increase */);
    const canDecreaseVerbosity = hoverSource.supportsVerbosityAction(1 /* Decrease */);
    if (!canIncreaseVerbosity && !canDecreaseVerbosity) {
      return new RenderedMarkdownHoverPart(hoverPart, renderedMarkdownElement, disposables);
    }
    const actionsContainer = $7("div.verbosity-actions");
    renderedMarkdownElement.prepend(actionsContainer);
    const actionsContainerInner = $7("div.verbosity-actions-inner");
    actionsContainer.append(actionsContainerInner);
    disposables.add(this._renderHoverExpansionAction(actionsContainerInner, 0 /* Increase */, canIncreaseVerbosity));
    disposables.add(this._renderHoverExpansionAction(actionsContainerInner, 1 /* Decrease */, canDecreaseVerbosity));
    return new RenderedMarkdownHoverPart(hoverPart, renderedMarkdownElement, disposables, actionsContainerInner);
  }
  _renderMarkdownHover(markdownHover, onFinishedRendering) {
    const renderedMarkdownHover = renderMarkdown2(
      this._editor,
      markdownHover,
      this._markdownRendererService,
      onFinishedRendering
    );
    return renderedMarkdownHover;
  }
  _renderHoverExpansionAction(container2, action, actionEnabled) {
    const store = new DisposableStore();
    const isActionIncrease = action === 0 /* Increase */;
    const actionElement = append(container2, $7(ThemeIcon.asCSSSelector(isActionIncrease ? increaseHoverVerbosityIcon : decreaseHoverVerbosityIcon)));
    actionElement.tabIndex = 0;
    const hoverDelegate = store.add(new WorkbenchHoverDelegate("mouse", void 0, { target: container2, position: { hoverPosition: 0 /* LEFT */ } }, this._configurationService, this._hoverService));
    store.add(this._hoverService.setupManagedHover(hoverDelegate, actionElement, labelForHoverVerbosityAction(this._keybindingService, action)));
    if (!actionEnabled) {
      actionElement.classList.add("disabled");
      return store;
    }
    actionElement.classList.add("enabled");
    const actionFunction = () => this._commandService.executeCommand(action === 0 /* Increase */ ? INCREASE_HOVER_VERBOSITY_ACTION_ID : DECREASE_HOVER_VERBOSITY_ACTION_ID, { focus: true });
    store.add(new ClickAction(actionElement, actionFunction));
    store.add(new KeyDownAction(actionElement, actionFunction, [3 /* Enter */, 10 /* Space */]));
    return store;
  }
  handleScroll(e4) {
    this.renderedHoverParts.forEach((renderedHoverPart) => {
      const actionsContainerInner = renderedHoverPart.actionsContainer;
      if (!actionsContainerInner) {
        return;
      }
      const hoverElement = renderedHoverPart.hoverElement;
      const topOfHoverScrollPosition = e4.scrollTop;
      const bottomOfHoverScrollPosition = topOfHoverScrollPosition + e4.height;
      const topOfRenderedPart = hoverElement.offsetTop;
      const hoverElementHeight = hoverElement.clientHeight;
      const bottomOfRenderedPart = topOfRenderedPart + hoverElementHeight;
      const iconsHeight = 22;
      let top2;
      if (bottomOfRenderedPart <= bottomOfHoverScrollPosition || topOfRenderedPart >= bottomOfHoverScrollPosition) {
        top2 = hoverElementHeight - iconsHeight;
      } else {
        top2 = bottomOfHoverScrollPosition - topOfRenderedPart - iconsHeight;
      }
      actionsContainerInner.style.top = `${top2}px`;
    });
  }
  async updateMarkdownHoverPartVerbosityLevel(action, index2) {
    const model = this._editor.getModel();
    if (!model) {
      return void 0;
    }
    const hoverRenderedPart = this._getRenderedHoverPartAtIndex(index2);
    const hoverSource = hoverRenderedPart?.hoverPart.source;
    if (!hoverRenderedPart || !hoverSource?.supportsVerbosityAction(action)) {
      return void 0;
    }
    const newHover = await this._fetchHover(hoverSource, model, action);
    if (!newHover) {
      return void 0;
    }
    const newHoverSource = new HoverSource(newHover, hoverSource.hoverProvider, hoverSource.hoverPosition);
    const initialHoverPart = hoverRenderedPart.hoverPart;
    const newHoverPart = new MarkdownHover(
      this._hoverParticipant,
      initialHoverPart.range,
      newHover.contents,
      initialHoverPart.isBeforeContent,
      initialHoverPart.ordinal,
      newHoverSource
    );
    const newHoverRenderedPart = this._updateRenderedHoverPart(index2, newHoverPart);
    if (!newHoverRenderedPart) {
      return void 0;
    }
    return {
      hoverPart: newHoverPart,
      hoverElement: newHoverRenderedPart.hoverElement
    };
  }
  getAccessibleContent(hoverPart) {
    const renderedHoverPartIndex = this.renderedHoverParts.findIndex((renderedHoverPart2) => renderedHoverPart2.hoverPart === hoverPart);
    if (renderedHoverPartIndex === -1) {
      return void 0;
    }
    const renderedHoverPart = this._getRenderedHoverPartAtIndex(renderedHoverPartIndex);
    if (!renderedHoverPart) {
      return void 0;
    }
    const hoverElementInnerText = renderedHoverPart.hoverElement.innerText;
    const accessibleContent = hoverElementInnerText.replace(/[^\S\n\r]+/gu, " ");
    return accessibleContent;
  }
  doesMarkdownHoverAtIndexSupportVerbosityAction(index2, action) {
    const hoverRenderedPart = this._getRenderedHoverPartAtIndex(index2);
    const hoverSource = hoverRenderedPart?.hoverPart.source;
    if (!hoverRenderedPart || !hoverSource?.supportsVerbosityAction(action)) {
      return false;
    }
    return true;
  }
  async _fetchHover(hoverSource, model, action) {
    let verbosityDelta = action === 0 /* Increase */ ? 1 : -1;
    const provider = hoverSource.hoverProvider;
    const ongoingHoverOperation = this._ongoingHoverOperations.get(provider);
    if (ongoingHoverOperation) {
      ongoingHoverOperation.tokenSource.cancel();
      verbosityDelta += ongoingHoverOperation.verbosityDelta;
    }
    const tokenSource = new CancellationTokenSource();
    this._ongoingHoverOperations.set(provider, { verbosityDelta, tokenSource });
    const context2 = { verbosityRequest: { verbosityDelta, previousHover: hoverSource.hover } };
    let hover;
    try {
      hover = await Promise.resolve(provider.provideHover(model, hoverSource.hoverPosition, tokenSource.token, context2));
    } catch (e4) {
      onUnexpectedExternalError(e4);
    }
    tokenSource.dispose();
    this._ongoingHoverOperations.delete(provider);
    return hover;
  }
  _updateRenderedHoverPart(index2, hoverPart) {
    if (index2 >= this.renderedHoverParts.length || index2 < 0) {
      return void 0;
    }
    const renderedHoverPart = this._renderHoverPart(hoverPart, this._onFinishedRendering);
    const currentRenderedHoverPart = this.renderedHoverParts[index2];
    const currentRenderedMarkdown = currentRenderedHoverPart.hoverElement;
    const renderedMarkdown = renderedHoverPart.hoverElement;
    const renderedChildrenElements = Array.from(renderedMarkdown.children);
    currentRenderedMarkdown.replaceChildren(...renderedChildrenElements);
    const newRenderedHoverPart = new RenderedMarkdownHoverPart(
      hoverPart,
      currentRenderedMarkdown,
      renderedHoverPart.disposables,
      renderedHoverPart.actionsContainer
    );
    currentRenderedHoverPart.dispose();
    this.renderedHoverParts[index2] = newRenderedHoverPart;
    return newRenderedHoverPart;
  }
  _getRenderedHoverPartAtIndex(index2) {
    return this.renderedHoverParts[index2];
  }
  dispose() {
    this._disposables.dispose();
  }
};

function renderMarkdownHovers(context2, markdownHovers, editor, markdownRendererService) {
  markdownHovers.sort(compareBy((hover) => hover.ordinal, numberComparator));
  const renderedHoverParts = [];
  for (const markdownHover of markdownHovers) {
    const renderedHoverPart = renderMarkdown2(
      editor,
      markdownHover,
      markdownRendererService,
      context2.onContentsChanged
    );
    context2.fragment.appendChild(renderedHoverPart.hoverElement);
    renderedHoverParts.push(renderedHoverPart);
  }
  return new RenderedHoverParts(renderedHoverParts);
}

function renderMarkdown2(editor, markdownHover, markdownRendererService, onFinishedRendering) {
  const disposables = new DisposableStore();
  const renderedMarkdown = $7("div.hover-row");
  const renderedMarkdownContents = $7("div.hover-row-contents");
  renderedMarkdown.appendChild(renderedMarkdownContents);
  const markdownStrings = markdownHover.contents;
  for (const markdownString of markdownStrings) {
    if (isEmptyMarkdownString(markdownString)) {
      continue;
    }
    const markdownHoverElement = $7("div.markdown-hover");
    const hoverContentsElement = append(markdownHoverElement, $7("div.hover-contents"));
    const renderedContents = disposables.add(markdownRendererService.render(markdownString, {
      context: editor,
      asyncRenderCallback: () => {
        hoverContentsElement.className = "hover-contents code-hover-contents";
        onFinishedRendering();
      }
    }));
    hoverContentsElement.appendChild(renderedContents.element);
    renderedMarkdownContents.appendChild(markdownHoverElement);
  }
  const renderedHoverPart = {
    hoverPart: markdownHover,
    hoverElement: renderedMarkdown,
    dispose() {
      disposables.dispose();
    }
  };
  return renderedHoverPart;
}

function labelForHoverVerbosityAction(keybindingService, action) {
  switch (action) {
    case 0 /* Increase */:
      return keybindingService.appendKeybinding(localize(1313, null), INCREASE_HOVER_VERBOSITY_ACTION_ID);
    case 1 /* Decrease */:
      return keybindingService.appendKeybinding(localize(1311, null), DECREASE_HOVER_VERBOSITY_ACTION_ID);
  }
}
export { renderMarkdownHovers, renderMarkdown2, labelForHoverVerbosityAction, $7, increaseHoverVerbosityIcon, decreaseHoverVerbosityIcon, MarkdownHover, HoverSource, MarkdownHoverParticipant, RenderedMarkdownHoverPart, MarkdownRenderedHoverParts };
