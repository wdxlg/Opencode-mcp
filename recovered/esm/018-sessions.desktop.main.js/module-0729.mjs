// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/model/provideInlineCompletions.ts
import { prefixedUuid } from "./module-0190.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { groupByMap } from "./module-0003.mjs";
import { DirectedGraph } from "./module-0728.mjs";
import { BugIndicatingError, onUnexpectedError, onUnexpectedExternalError } from "./module-0004.mjs";
import { CachedFunction } from "./module-0027.mjs";
import { TextReplacement } from "./module-0178.mjs";
import { Range2 } from "./module-0106.mjs";
import { inlineCompletionIsVisible } from "./module-0725.mjs";
import { ErrorResult, getReadonlyEmptyArray } from "./module-0716.mjs";
import { AsyncIterableProducer } from "./module-0036.mjs";
import { isDefined } from "./module-0010.mjs";
import { Disposable } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { Position } from "./module-0079.mjs";
import { SnippetParser, Text } from "./module-0544.mjs";
import { assertNever } from "./module-0009.mjs";
import { EditDeltaInfo } from "./module-0377.mjs";
import { StringReplacement } from "./module-0193.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { fixBracketsInLine } from "./module-0726.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/model/provideInlineCompletions.ts
function provideInlineCompletions(providers2, position2, model, context2, requestInfo, languageConfigurationService) {
  const requestUuid = prefixedUuid("icr");
  const cancellationTokenSource = new CancellationTokenSource();
  let cancelReason = void 0;
  const contextWithUuid = { ...context2, requestUuid };
  const defaultReplaceRange = getDefaultRange(position2, model);
  const providersByGroupId = groupByMap(providers2, (p) => p.groupId);
  const yieldsToGraph = DirectedGraph.from(providers2, (p) => {
    return p.yieldsToGroupIds?.flatMap((groupId) => providersByGroupId.get(groupId) ?? []) ?? [];
  });
  const { foundCycles } = yieldsToGraph.removeCycles();
  if (foundCycles.length > 0) {
    onUnexpectedExternalError(new Error(`Inline completions: cyclic yield-to dependency detected. Path: ${foundCycles.map((s) => s.toString ? s.toString() : "" + s).join(" -> ")}`));
  }
  let runningCount = 0;
  const queryProvider = new CachedFunction(async (provider) => {
    try {
      runningCount++;
      if (cancellationTokenSource.token.isCancellationRequested) {
        return void 0;
      }
      const yieldsTo = yieldsToGraph.getOutgoing(provider);
      for (const p of yieldsTo) {
        const result2 = await queryProvider.get(p);
        if (result2) {
          for (const item of result2.inlineSuggestions.items) {
            if (item.isInlineEdit || typeof item.insertText !== "string" && item.insertText !== void 0) {
              return void 0;
            }
            if (item.insertText !== void 0) {
              const t2 = new TextReplacement(Range2.lift(item.range) ?? defaultReplaceRange, item.insertText);
              if (inlineCompletionIsVisible(t2, void 0, model, position2)) {
                return void 0;
              }
            }
          }
        }
      }
      let result;
      const providerStartTime = Date.now();
      try {
        result = await provider.provideInlineCompletions(model, position2, contextWithUuid, cancellationTokenSource.token);
      } catch (e4) {
        onUnexpectedExternalError(e4);
        return void 0;
      }
      const providerEndTime = Date.now();
      if (!result) {
        return void 0;
      }
      const data = [];
      const list2 = new InlineSuggestionList(result, data, provider);
      list2.addRef();
      runWhenCancelled(cancellationTokenSource.token, () => {
        return list2.removeRef(cancelReason);
      });
      if (cancellationTokenSource.token.isCancellationRequested) {
        return void 0;
      }
      for (const item of result.items) {
        const r2 = toInlineSuggestData(item, list2, defaultReplaceRange, model, languageConfigurationService, contextWithUuid, requestInfo, { startTime: providerStartTime, endTime: providerEndTime });
        if (ErrorResult.is(r2)) {
          r2.logError();
          continue;
        }
        data.push(r2);
      }
      return list2;
    } finally {
      runningCount--;
    }
  });
  const inlineCompletionLists = AsyncIterableProducer.fromPromisesResolveOrder(providers2.map((p) => queryProvider.get(p))).filter(isDefined);
  return {
    contextWithUuid,
    get didAllProvidersReturn() {
      return runningCount === 0;
    },
    lists: inlineCompletionLists,
    cancelAndDispose: (reason) => {
      if (cancelReason !== void 0) {
        return;
      }
      cancelReason = reason;
      cancellationTokenSource.dispose(true);
    }
  };
}

function runWhenCancelled(token, callback) {
  if (token.isCancellationRequested) {
    callback();
    return Disposable.None;
  } else {
    const listener = token.onCancellationRequested(() => {
      listener.dispose();
      callback();
    });
    return { dispose: () => listener.dispose() };
  }
}

function toInlineSuggestData(inlineCompletion, source, defaultReplaceRange, textModel, languageConfigurationService, context2, requestInfo, providerRequestInfo) {
  let action;
  const uri4 = inlineCompletion.uri ? URI.revive(inlineCompletion.uri) : void 0;
  if (inlineCompletion.jumpToPosition !== void 0) {
    action = {
      kind: "jumpTo",
      position: Position.lift(inlineCompletion.jumpToPosition),
      uri: uri4
    };
  } else if (inlineCompletion.insertText !== void 0) {
    let insertText;
    let snippetInfo;
    let range2 = inlineCompletion.range ? Range2.lift(inlineCompletion.range) : defaultReplaceRange;
    if (typeof inlineCompletion.insertText === "string") {
      insertText = inlineCompletion.insertText;
      if (languageConfigurationService && inlineCompletion.completeBracketPairs) {
        insertText = closeBrackets(
          insertText,
          range2.getStartPosition(),
          textModel,
          languageConfigurationService
        );
        const diff4 = insertText.length - inlineCompletion.insertText.length;
        if (diff4 !== 0) {
          range2 = new Range2(range2.startLineNumber, range2.startColumn, range2.endLineNumber, range2.endColumn + diff4);
        }
      }
      snippetInfo = void 0;
    } else if ("snippet" in inlineCompletion.insertText) {
      const preBracketCompletionLength = inlineCompletion.insertText.snippet.length;
      if (languageConfigurationService && inlineCompletion.completeBracketPairs) {
        inlineCompletion.insertText.snippet = closeBrackets(
          inlineCompletion.insertText.snippet,
          range2.getStartPosition(),
          textModel,
          languageConfigurationService
        );
        const diff4 = inlineCompletion.insertText.snippet.length - preBracketCompletionLength;
        if (diff4 !== 0) {
          range2 = new Range2(range2.startLineNumber, range2.startColumn, range2.endLineNumber, range2.endColumn + diff4);
        }
      }
      const snippet = new SnippetParser().parse(inlineCompletion.insertText.snippet);
      if (snippet.children.length === 1 && snippet.children[0] instanceof Text) {
        insertText = snippet.children[0].value;
        snippetInfo = void 0;
      } else {
        insertText = snippet.toString();
        snippetInfo = {
          snippet: inlineCompletion.insertText.snippet,
          range: range2
        };
      }
    } else {
      assertNever(inlineCompletion.insertText);
    }
    action = {
      kind: "edit",
      range: range2,
      insertText,
      snippetInfo,
      uri: uri4,
      alternativeAction: void 0
    };
  } else {
    action = void 0;
    if (!inlineCompletion.hint) {
      return ErrorResult.message("Inline completion has no insertText, jumpToPosition nor hint.");
    }
  }
  return new InlineSuggestData(
    action,
    inlineCompletion.hint,
    inlineCompletion.additionalTextEdits || getReadonlyEmptyArray(),
    inlineCompletion,
    source,
    context2,
    inlineCompletion.isInlineEdit ?? false,
    inlineCompletion.supportsRename ?? false,
    requestInfo,
    providerRequestInfo,
    inlineCompletion.correlationId
  );
}

var InlineSuggestData = class _InlineSuggestData {
  constructor(_action, hint, additionalTextEdits, sourceInlineCompletion, source, context2, isInlineEdit, supportsRename, _requestInfo, _providerRequestInfo, _correlationId) {
    this._action = _action;
    this.hint = hint;
    this.additionalTextEdits = additionalTextEdits;
    this.sourceInlineCompletion = sourceInlineCompletion;
    this.source = source;
    this.context = context2;
    this.isInlineEdit = isInlineEdit;
    this.supportsRename = supportsRename;
    this._requestInfo = _requestInfo;
    this._providerRequestInfo = _providerRequestInfo;
    this._correlationId = _correlationId;
    this._didShow = false;
    this._timeUntilShown = void 0;
    this._timeUntilActuallyShown = void 0;
    this._showStartTime = void 0;
    this._shownDuration = 0;
    this._showUncollapsedStartTime = void 0;
    this._showUncollapsedDuration = 0;
    this._notShownReason = void 0;
    this._didReportEndOfLife = false;
    this._lastSetEndOfLifeReason = void 0;
    this._isPreceeded = false;
    this._partiallyAcceptedCount = 0;
    this._partiallyAcceptedSinceOriginal = { characters: 0, ratio: 0, count: 0 };
    this._renameInfo = void 0;
    this._editKind = void 0;
    this.performance = new InlineSuggestionsPerformance();
    this._viewData = { editorType: _requestInfo.editorType };
  }
  static createForTest(action, targetUri) {
    const mockInlineCompletion = {
      insertText: action?.kind === "edit" ? action.insertText : "",
      range: action?.kind === "edit" ? action.range : void 0,
      isInlineEdit: true
    };
    const mockProvider = {
      provideInlineCompletions: () => ({ items: [] }),
      disposeInlineCompletions: () => {
      }
    };
    const mockSource = new InlineSuggestionList(
      { items: [mockInlineCompletion] },
      [],
      mockProvider
    );
    const mockContext = {
      triggerKind: 1 /* Explicit */,
      selectedSuggestionInfo: void 0,
      requestUuid: "test-" + Date.now(),
      earliestShownDateTime: 0,
      includeInlineCompletions: true,
      includeInlineEdits: false,
      requestIssuedDateTime: Date.now()
    };
    const mockRequestInfo = {
      startTime: Date.now(),
      sku: void 0,
      editorType: "textEditor" /* TextEditor */,
      languageId: "plaintext",
      availableProviders: [],
      reason: "",
      typingInterval: 0,
      typingIntervalCharacterCount: 0
    };
    const mockProviderRequestInfo = {
      startTime: Date.now(),
      endTime: Date.now()
    };
    return new _InlineSuggestData(
      action,
      void 0,
      [],
      mockInlineCompletion,
      mockSource,
      mockContext,
      true,
      false,
      mockRequestInfo,
      mockProviderRequestInfo,
      void 0
    );
  }
  get action() {
    return this._action;
  }
  get showInlineEditMenu() {
    return this.sourceInlineCompletion.showInlineEditMenu ?? false;
  }
  get partialAccepts() {
    return this._partiallyAcceptedSinceOriginal;
  }
  async reportInlineEditShown(commandService, updatedInsertText, viewKind, viewData, editKind, timeWhenShown) {
    this.updateShownDuration(viewKind);
    if (this._didShow || this._didReportEndOfLife) {
      return;
    }
    this.addPerformanceMarker("shown");
    this._didShow = true;
    this._editKind = editKind;
    this._viewData.viewKind = viewKind;
    this._viewData.renderData = viewData;
    this._timeUntilShown = timeWhenShown - this._requestInfo.startTime;
    this._timeUntilActuallyShown = Date.now() - this._requestInfo.startTime;
    const editDeltaInfo = new EditDeltaInfo(viewData.lineCountModified, viewData.lineCountOriginal, viewData.characterCountModified, viewData.characterCountOriginal);
    this.source.provider.handleItemDidShow?.(this.source.inlineSuggestions, this.sourceInlineCompletion, updatedInsertText, editDeltaInfo);
    if (this.sourceInlineCompletion.shownCommand) {
      await commandService.executeCommand(this.sourceInlineCompletion.shownCommand.id, ...this.sourceInlineCompletion.shownCommand.arguments || []);
    }
  }
  reportPartialAccept(acceptedCharacters, info, partialAcceptance) {
    this._partiallyAcceptedCount++;
    this._partiallyAcceptedSinceOriginal.characters += partialAcceptance.characters;
    this._partiallyAcceptedSinceOriginal.ratio = Math.min(this._partiallyAcceptedSinceOriginal.ratio + (1 - this._partiallyAcceptedSinceOriginal.ratio) * partialAcceptance.ratio, 1);
    this._partiallyAcceptedSinceOriginal.count += partialAcceptance.count;
    this.source.provider.handlePartialAccept?.(
      this.source.inlineSuggestions,
      this.sourceInlineCompletion,
      acceptedCharacters,
      info
    );
  }
  /**
   * Sends the end of life event to the provider.
   * If no reason is provided, the last set reason is used.
   * If no reason was set, the default reason is used.
  */
  reportEndOfLife(reason) {
    if (this._didReportEndOfLife) {
      return;
    }
    this._didReportEndOfLife = true;
    this.reportInlineEditHidden();
    if (!reason) {
      reason = this._lastSetEndOfLifeReason ?? { kind: 2 /* Ignored */, userTypingDisagreed: false, supersededBy: void 0 };
    }
    if (reason.kind === 1 /* Rejected */ && !this._didShow) {
      reason = { kind: 2 /* Ignored */, userTypingDisagreed: false, supersededBy: void 0 };
    }
    if (reason.kind === 1 /* Rejected */ && this.source.provider.handleRejection) {
      this.source.provider.handleRejection(this.source.inlineSuggestions, this.sourceInlineCompletion);
    }
    if (this.source.provider.handleEndOfLifetime) {
      const summary = {
        requestUuid: this.context.requestUuid,
        correlationId: this._correlationId,
        selectedSuggestionInfo: !!this.context.selectedSuggestionInfo,
        partiallyAccepted: this._partiallyAcceptedCount,
        partiallyAcceptedCountSinceOriginal: this._partiallyAcceptedSinceOriginal.count,
        partiallyAcceptedRatioSinceOriginal: this._partiallyAcceptedSinceOriginal.ratio,
        partiallyAcceptedCharactersSinceOriginal: this._partiallyAcceptedSinceOriginal.characters,
        shown: this._didShow,
        shownDuration: this._shownDuration,
        shownDurationUncollapsed: this._showUncollapsedDuration,
        editKind: this._editKind?.toString(),
        preceeded: this._isPreceeded,
        timeUntilShown: this._timeUntilShown,
        timeUntilActuallyShown: this._timeUntilActuallyShown,
        timeUntilProviderRequest: this._providerRequestInfo.startTime - this._requestInfo.startTime,
        timeUntilProviderResponse: this._providerRequestInfo.endTime - this._requestInfo.startTime,
        editorType: this._viewData.editorType,
        languageId: this._requestInfo.languageId,
        requestReason: this._requestInfo.reason,
        viewKind: this._viewData.viewKind,
        notShownReason: this._notShownReason,
        performanceMarkers: this.performance.toString(),
        renameCreated: this._renameInfo?.createdRename,
        renameDuration: this._renameInfo?.duration,
        renameTimedOut: this._renameInfo?.timedOut,
        renameDroppedOtherEdits: this._renameInfo?.droppedOtherEdits,
        renameDroppedRenameEdits: this._renameInfo?.droppedRenameEdits,
        typingInterval: this._requestInfo.typingInterval,
        typingIntervalCharacterCount: this._requestInfo.typingIntervalCharacterCount,
        skuPlan: this._requestInfo.sku?.plan,
        skuType: this._requestInfo.sku?.type,
        availableProviders: this._requestInfo.availableProviders.map((p) => p.toString()).join(","),
        ...this._viewData.renderData?.getData()
      };
      this.source.provider.handleEndOfLifetime(this.source.inlineSuggestions, this.sourceInlineCompletion, reason, summary);
    }
  }
  setIsPreceeded(partialAccepts) {
    this._isPreceeded = true;
    if (this._partiallyAcceptedSinceOriginal.characters !== 0 || this._partiallyAcceptedSinceOriginal.ratio !== 0 || this._partiallyAcceptedSinceOriginal.count !== 0) {
      console.warn("Expected partiallyAcceptedCountSinceOriginal to be { characters: 0, rate: 0, partialAcceptances: 0 } before setIsPreceeded.");
    }
    this._partiallyAcceptedSinceOriginal = partialAccepts;
  }
  setNotShownReason(reason) {
    this._notShownReason ??= reason;
  }
  /**
   * Sets the end of life reason, but does not send the event to the provider yet.
  */
  setEndOfLifeReason(reason) {
    this.reportInlineEditHidden();
    this._lastSetEndOfLifeReason = reason;
  }
  updateShownDuration(viewKind) {
    const timeNow = Date.now();
    if (!this._showStartTime) {
      this._showStartTime = timeNow;
    }
    const isCollapsed = viewKind === "collapsed" /* Collapsed */;
    if (!isCollapsed && this._showUncollapsedStartTime === void 0) {
      this._showUncollapsedStartTime = timeNow;
    }
    if (isCollapsed && this._showUncollapsedStartTime !== void 0) {
      this._showUncollapsedDuration += timeNow - this._showUncollapsedStartTime;
    }
  }
  reportInlineEditHidden() {
    if (this._showStartTime === void 0) {
      return;
    }
    const timeNow = Date.now();
    this._shownDuration += timeNow - this._showStartTime;
    this._showStartTime = void 0;
    if (this._showUncollapsedStartTime === void 0) {
      return;
    }
    this._showUncollapsedDuration += timeNow - this._showUncollapsedStartTime;
    this._showUncollapsedStartTime = void 0;
  }
  setRenameProcessingInfo(info) {
    if (this._renameInfo) {
      throw new BugIndicatingError("Rename info has already been set.");
    }
    this._renameInfo = info;
  }
  withAction(action) {
    this._action = action;
    return this;
  }
  addPerformanceMarker(marker) {
    this.performance.mark(marker);
  }
};

var InlineSuggestionsPerformance = class {
  constructor() {
    this.markers = [];
    this.markers.push({ name: "start", timeStamp: Date.now() });
  }
  mark(marker) {
    this.markers.push({ name: marker, timeStamp: Date.now() });
  }
  toString() {
    const deltas = [];
    for (let i2 = 1; i2 < this.markers.length; i2++) {
      const delta2 = this.markers[i2].timeStamp - this.markers[i2 - 1].timeStamp;
      deltas.push({ [this.markers[i2].name]: delta2 });
    }
    return JSON.stringify(deltas);
  }
};

var InlineSuggestionList = class {
  constructor(inlineSuggestions, inlineSuggestionsData, provider) {
    this.inlineSuggestions = inlineSuggestions;
    this.inlineSuggestionsData = inlineSuggestionsData;
    this.provider = provider;
    this.refCount = 0;
  }
  addRef() {
    this.refCount++;
  }
  removeRef(reason = { kind: "other" }) {
    this.refCount--;
    if (this.refCount === 0) {
      for (const item of this.inlineSuggestionsData) {
        item.reportEndOfLife();
      }
      this.provider.disposeInlineCompletions(this.inlineSuggestions, reason);
    } else if (this.refCount < 0) {
      onUnexpectedError(new BugIndicatingError(
        `InlineSuggestionList (provider=${this.provider.providerId?.toString()}) refCount went negative (${this.refCount}) \u2014 more removeRef than addRef calls.`
      ));
    }
  }
};

function getDefaultRange(position2, model) {
  const word = model.getWordAtPosition(position2);
  const maxColumn = model.getLineMaxColumn(position2.lineNumber);
  return word ? new Range2(position2.lineNumber, word.startColumn, position2.lineNumber, maxColumn) : Range2.fromPositions(position2, position2.with(void 0, maxColumn));
}

function closeBrackets(text2, position2, model, languageConfigurationService) {
  const currentLine = model.getLineContent(position2.lineNumber);
  const edit3 = StringReplacement.replace(new OffsetRange(position2.column - 1, currentLine.length), text2);
  const proposedLineTokens = model.tokenization.tokenizeLinesAt(position2.lineNumber, [edit3.replace(currentLine)]);
  const textTokens = proposedLineTokens?.[0].sliceZeroCopy(edit3.getRangeAfterReplace());
  if (!textTokens) {
    return text2;
  }
  const fixedText = fixBracketsInLine(textTokens, languageConfigurationService);
  return fixedText;
}
export { provideInlineCompletions, runWhenCancelled, toInlineSuggestData, getDefaultRange, closeBrackets, InlineSuggestData, InlineSuggestionsPerformance, InlineSuggestionList };
