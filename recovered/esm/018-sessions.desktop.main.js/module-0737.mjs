// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/model/inlineCompletionsSource.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { observableReducerSettable } from "./module-0721.mjs";
import { recordChangesLazy } from "./module-0060.mjs";
import { StringEdit } from "./module-0193.mjs";
import { offsetEditFromContentChanges } from "./module-0404.mjs";
import { isDefined, isObject } from "./module-0010.mjs";
import { derived } from "./module-0054.mjs";
import { observableValue } from "./module-0048.mjs";
import { DataChannelForwardingTelemetryService, forwardToChannelIf, isCopilotLikeExtension } from "./module-0722.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { StructuredLogger, formatRecordableLogEntry } from "./module-0709.mjs";
import { RenameSymbolProcessor } from "./module-0736.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { findLastMax } from "./module-0006.mjs";
import { booleanComparator, compareBy, compareUndefinedSmallest, numberComparator } from "./module-0007.mjs";
import { wait } from "./module-0716.mjs";
import { provideInlineCompletions, runWhenCancelled } from "./module-0729.mjs";
import { TextModelValueReference } from "./module-0731.mjs";
import { InlineSuggestionItem } from "./module-0732.mjs";
import { runOnChange } from "./module-0064.mjs";
import { cloneAndChange } from "./module-0098.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { Command2 } from "./module-0164.mjs";
import { transaction } from "./module-0045.mjs";
import { isCompletionsEnabledFromObject } from "./module-0207.mjs";
import { sendInlineCompletionsEndOfLifeTelemetry } from "./module-0723.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { equalsIfDefined, thisEqualsC } from "./module-0042.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/model/inlineCompletionsSource.ts
var InlineCompletionsSource = class extends Disposable {
  constructor(_textModel, _versionId, _debounceValue, _cursorPosition, completionsEnablementSetting, _languageConfigurationService, _logService, _configurationService, _instantiationService, _contextKeyService, _textModelService) {
    super();
    this._textModel = _textModel;
    this._versionId = _versionId;
    this._debounceValue = _debounceValue;
    this._cursorPosition = _cursorPosition;
    this._languageConfigurationService = _languageConfigurationService;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._contextKeyService = _contextKeyService;
    this._textModelService = _textModelService;
    this._updateOperation = this._register(new MutableDisposable());
    this._state = observableReducerSettable(this, {
      initial: () => ({
        inlineCompletions: InlineCompletionsState.createEmpty(),
        suggestWidgetInlineCompletions: InlineCompletionsState.createEmpty()
      }),
      disposeFinal: (values) => {
        values.inlineCompletions.dispose();
        values.suggestWidgetInlineCompletions.dispose();
      },
      changeTracker: recordChangesLazy(() => ({ versionId: this._versionId })),
      update: (reader, previousValue, changes) => {
        const edit3 = StringEdit.compose(changes.changes.map((c) => c.change ? offsetEditFromContentChanges(c.change.changes) : StringEdit.empty).filter(isDefined));
        if (edit3.isEmpty()) {
          return previousValue;
        }
        try {
          return {
            inlineCompletions: previousValue.inlineCompletions.createStateWithAppliedEdit(edit3, this._textModel),
            suggestWidgetInlineCompletions: previousValue.suggestWidgetInlineCompletions.createStateWithAppliedEdit(edit3, this._textModel)
          };
        } finally {
          previousValue.inlineCompletions.dispose();
          previousValue.suggestWidgetInlineCompletions.dispose();
        }
      }
    });
    this.inlineCompletions = this._state.map(this, (v2) => v2.inlineCompletions);
    this.suggestWidgetInlineCompletions = this._state.map(this, (v2) => v2.suggestWidgetInlineCompletions);
    this._completionsEnabled = void 0;
    this.clearOperationOnTextModelChange = derived(this, (reader) => {
      this._versionId.read(reader);
      this._updateOperation.clear();
      return void 0;
    });
    this._loadingCount = observableValue(this, 0);
    this.loading = this._loadingCount.map(this, (v2) => v2 > 0);
    this._dataChannelTelemetryService = this._instantiationService.createInstance(DataChannelForwardingTelemetryService);
    this._loggingEnabled = observableConfigValue("editor.inlineSuggest.logFetch", false, this._configurationService).recomputeInitiallyAndOnChange(this._store);
    this._sendRequestData = observableConfigValue("editor.inlineSuggest.emptyResponseInformation", true, this._configurationService).recomputeInitiallyAndOnChange(this._store);
    this._structuredFetchLogger = this._register(this._instantiationService.createInstance(
      StructuredLogger.cast(),
      "editor.inlineSuggest.logFetch.commandId"
    ));
    this._renameProcessor = this._store.add(this._instantiationService.createInstance(RenameSymbolProcessor));
    this.clearOperationOnTextModelChange.recomputeInitiallyAndOnChange(this._store);
    if (completionsEnablementSetting) {
      this._updateCompletionsEnablement(completionsEnablementSetting);
      this._register(this._configurationService.onDidChangeConfiguration((e4) => {
        if (e4.affectsConfiguration(completionsEnablementSetting)) {
          this._updateCompletionsEnablement(completionsEnablementSetting);
        }
      }));
    }
    this._state.recomputeInitiallyAndOnChange(this._store);
  }
  static {
    this._requestId = 0;
  }
  _updateCompletionsEnablement(enalementSetting) {
    const result = this._configurationService.getValue(enalementSetting);
    if (!isObject(result)) {
      this._completionsEnabled = void 0;
    } else {
      this._completionsEnabled = result;
    }
  }
  _log(entry) {
    if (this._loggingEnabled.get()) {
      this._logService.info(formatRecordableLogEntry(entry));
    }
    this._structuredFetchLogger.log(entry);
  }
  fetch(providers2, providersLabel, context2, activeInlineCompletion, withDebounce, userJumpedToActiveCompletion, requestInfo) {
    const position2 = this._cursorPosition.get();
    const request2 = new UpdateRequest(position2, context2, this._textModel.getVersionId(), new Set(providers2));
    const target = context2.selectedSuggestionInfo ? this.suggestWidgetInlineCompletions.get() : this.inlineCompletions.get();
    if (this._updateOperation.value?.request.satisfies(request2)) {
      return this._updateOperation.value.promise;
    } else if (target?.request?.satisfies(request2)) {
      return Promise.resolve(true);
    }
    const updateOngoing = !!this._updateOperation.value;
    this._updateOperation.clear();
    const source = new CancellationTokenSource();
    const promise = (async () => {
      const store = new DisposableStore();
      this._loadingCount.set(this._loadingCount.get() + 1, void 0);
      let didDecrease = false;
      const decreaseLoadingCount = () => {
        if (!didDecrease) {
          didDecrease = true;
          this._loadingCount.set(this._loadingCount.get() - 1, void 0);
        }
      };
      const loadingReset = store.add(new RunOnceScheduler(() => decreaseLoadingCount(), 10 * 1e3));
      loadingReset.schedule();
      const inlineSuggestionsProviders = providers2.filter((p) => p.providerId);
      const requestResponseInfo = new RequestResponseData(context2, requestInfo, inlineSuggestionsProviders);
      try {
        const recommendedDebounceValue = this._debounceValue.get(this._textModel);
        const debounceValue = findLastMax(
          providers2.map((p) => p.debounceDelayMs),
          compareUndefinedSmallest(numberComparator)
        ) ?? recommendedDebounceValue;
        const shouldDebounce = updateOngoing || withDebounce && context2.triggerKind === 0 /* Automatic */;
        if (shouldDebounce) {
          await wait(debounceValue, source.token);
        }
        if (source.token.isCancellationRequested || this._store.isDisposed || this._textModel.getVersionId() !== request2.versionId) {
          requestResponseInfo.setNoSuggestionReasonIfNotSet("canceled:beforeFetch");
          return false;
        }
        const requestId = InlineCompletionsSource._requestId++;
        if (this._loggingEnabled.get() || this._structuredFetchLogger.isEnabled.get()) {
          this._log({
            sourceId: "InlineCompletions.fetch",
            kind: "start",
            requestId,
            modelUri: this._textModel.uri,
            modelVersion: this._textModel.getVersionId(),
            context: { triggerKind: context2.triggerKind, suggestInfo: context2.selectedSuggestionInfo ? true : void 0 },
            time: Date.now(),
            provider: providersLabel
          });
        }
        const startTime = /* @__PURE__ */ new Date();
        const providerResult = provideInlineCompletions(providers2, this._cursorPosition.get(), this._textModel, context2, requestInfo, this._languageConfigurationService);
        runWhenCancelled(source.token, () => providerResult.cancelAndDispose({ kind: "tokenCancellation" }));
        let shouldStopEarly = false;
        let producedSuggestion = false;
        const providerSuggestions = [];
        for await (const list2 of providerResult.lists) {
          if (!list2) {
            continue;
          }
          list2.addRef();
          store.add(toDisposable(() => list2.removeRef(list2.inlineSuggestionsData.length === 0 ? { kind: "empty" } : { kind: "notTaken" })));
          for (const item of list2.inlineSuggestionsData) {
            producedSuggestion = true;
            if (!context2.includeInlineEdits && (item.isInlineEdit || item.showInlineEditMenu)) {
              item.setNotShownReason("notInlineEditRequested");
              continue;
            }
            if (!context2.includeInlineCompletions && !(item.isInlineEdit || item.showInlineEditMenu)) {
              item.setNotShownReason("notInlineCompletionRequested");
              continue;
            }
            item.addPerformanceMarker("providerReturned");
            const targetUri = item.action?.uri;
            let targetModel;
            let disposable;
            if (targetUri && targetUri.toString() !== this._textModel.uri.toString()) {
              const modelRef = await this._textModelService.createModelReference(targetUri);
              targetModel = modelRef.object.textEditorModel;
              disposable = modelRef;
            } else {
              targetModel = this._textModel;
              disposable = void 0;
            }
            const ref = TextModelValueReference.snapshot(targetModel);
            const i2 = InlineSuggestionItem.create(item, ref);
            if (disposable) {
              const s = runOnChange(i2.identity.onDispose, () => {
                disposable?.dispose();
                s.dispose();
              });
            }
            item.addPerformanceMarker("itemCreated");
            providerSuggestions.push(i2);
            if (!i2.isInlineEdit && !i2.showInlineEditMenu && context2.triggerKind === 0 /* Automatic */) {
              if (i2.isVisible(this._textModel, this._cursorPosition.get())) {
                shouldStopEarly = true;
              }
            }
          }
          if (shouldStopEarly) {
            break;
          }
        }
        providerSuggestions.forEach((s) => s.addPerformanceMarker("providersResolved"));
        const suggestions = await Promise.all(providerSuggestions.map(async (s) => {
          return this._renameProcessor.proposeRenameRefactoring(this._textModel, s, context2);
        }));
        suggestions.forEach((s) => s.addPerformanceMarker("renameProcessed"));
        providerResult.cancelAndDispose({ kind: "lostRace" });
        if (this._loggingEnabled.get() || this._structuredFetchLogger.isEnabled.get()) {
          const didAllProvidersReturn = providerResult.didAllProvidersReturn;
          let error = void 0;
          if (source.token.isCancellationRequested || this._store.isDisposed || this._textModel.getVersionId() !== request2.versionId) {
            error = "canceled";
          }
          const result = suggestions.map((c) => {
            const comp = c.getSourceCompletion();
            if (comp.doNotLog) {
              return void 0;
            }
            const obj = {
              insertText: comp.insertText,
              range: comp.range,
              additionalTextEdits: comp.additionalTextEdits,
              uri: comp.uri,
              command: comp.command,
              gutterMenuLinkAction: comp.gutterMenuLinkAction,
              shownCommand: comp.shownCommand,
              completeBracketPairs: comp.completeBracketPairs,
              isInlineEdit: comp.isInlineEdit,
              showInlineEditMenu: comp.showInlineEditMenu,
              showRange: comp.showRange,
              warning: comp.warning,
              hint: comp.hint,
              supportsRename: comp.supportsRename,
              correlationId: comp.correlationId,
              jumpToPosition: comp.jumpToPosition
            };
            return {
              ...cloneAndChange(obj, (v2) => {
                if (Range2.isIRange(v2)) {
                  return Range2.lift(v2).toString();
                }
                if (Position.isIPosition(v2)) {
                  return Position.lift(v2).toString();
                }
                if (Command2.is(v2)) {
                  return { $commandId: v2.id };
                }
                return v2;
              }),
              $providerId: c.source.provider.providerId?.toString()
            };
          }).filter((result2) => result2 !== void 0);
          this._log({ sourceId: "InlineCompletions.fetch", kind: "end", requestId, durationMs: Date.now() - startTime.getTime(), error, result, time: Date.now(), didAllProvidersReturn });
        }
        requestResponseInfo.setRequestUuid(providerResult.contextWithUuid.requestUuid);
        if (producedSuggestion) {
          requestResponseInfo.setHasProducedSuggestion();
          if (suggestions.length > 0 && source.token.isCancellationRequested) {
            suggestions.forEach((s) => s.setNotShownReasonIfNotSet("canceled:whileAwaitingOtherProviders"));
          }
        } else {
          if (source.token.isCancellationRequested) {
            requestResponseInfo.setNoSuggestionReasonIfNotSet("canceled:whileFetching");
          } else {
            const completionsQuotaExceeded = this._contextKeyService.getContextKeyValue("completionsQuotaExceeded");
            requestResponseInfo.setNoSuggestionReasonIfNotSet(completionsQuotaExceeded ? "completionsQuotaExceeded" : "noSuggestion");
          }
        }
        const remainingTimeToWait = context2.earliestShownDateTime - Date.now();
        if (remainingTimeToWait > 0) {
          await wait(remainingTimeToWait, source.token);
        }
        suggestions.forEach((s) => s.addPerformanceMarker("minShowDelayPassed"));
        if (source.token.isCancellationRequested || this._store.isDisposed || this._textModel.getVersionId() !== request2.versionId || userJumpedToActiveCompletion.get()) {
          const notShownReason = source.token.isCancellationRequested ? "canceled:afterMinShowDelay" : this._store.isDisposed ? "canceled:disposed" : this._textModel.getVersionId() !== request2.versionId ? "canceled:documentChanged" : userJumpedToActiveCompletion.get() ? "canceled:userJumped" : "unknown";
          suggestions.forEach((s) => s.setNotShownReasonIfNotSet(notShownReason));
          return false;
        }
        const endTime = /* @__PURE__ */ new Date();
        this._debounceValue.update(this._textModel, endTime.getTime() - startTime.getTime());
        const cursorPosition = this._cursorPosition.get();
        this._updateOperation.clear();
        transaction((tx) => {
          const v2 = this._state.get();
          if (context2.selectedSuggestionInfo) {
            this._state.set({
              inlineCompletions: InlineCompletionsState.createEmpty(),
              suggestWidgetInlineCompletions: v2.suggestWidgetInlineCompletions.createStateWithAppliedResults(suggestions, request2, this._textModel, cursorPosition, activeInlineCompletion)
            }, tx);
          } else {
            this._state.set({
              inlineCompletions: v2.inlineCompletions.createStateWithAppliedResults(suggestions, request2, this._textModel, cursorPosition, activeInlineCompletion),
              suggestWidgetInlineCompletions: InlineCompletionsState.createEmpty()
            }, tx);
          }
          v2.inlineCompletions.dispose();
          v2.suggestWidgetInlineCompletions.dispose();
        });
      } finally {
        store.dispose();
        decreaseLoadingCount();
        this._sendInlineCompletionsRequestTelemetry(requestResponseInfo);
      }
      return true;
    })();
    const updateOperation = new UpdateOperation(request2, source, promise);
    this._updateOperation.value = updateOperation;
    return promise;
  }
  clear(tx) {
    if (this._store.isDisposed) {
      return;
    }
    this._updateOperation.clear();
    const v2 = this._state.get();
    this._state.set({
      inlineCompletions: InlineCompletionsState.createEmpty(),
      suggestWidgetInlineCompletions: InlineCompletionsState.createEmpty()
    }, tx);
    v2.inlineCompletions.dispose();
    v2.suggestWidgetInlineCompletions.dispose();
  }
  seedInlineCompletionsWithSuggestWidget() {
    const inlineCompletions = this.inlineCompletions.get();
    const suggestWidgetInlineCompletions = this.suggestWidgetInlineCompletions.get();
    if (!suggestWidgetInlineCompletions) {
      return;
    }
    transaction((tx) => {
      if (!inlineCompletions || (suggestWidgetInlineCompletions.request?.versionId ?? -1) > (inlineCompletions.request?.versionId ?? -1)) {
        inlineCompletions?.dispose();
        const s = this._state.get();
        this._state.set({
          inlineCompletions: suggestWidgetInlineCompletions.clone(),
          suggestWidgetInlineCompletions: InlineCompletionsState.createEmpty()
        }, tx);
        s.inlineCompletions.dispose();
        s.suggestWidgetInlineCompletions.dispose();
      }
      this.clearSuggestWidgetInlineCompletions(tx);
    });
  }
  /**
   * Seeds the inline completions with an external inline completion item.
   * Used when transplanting a completion from one model to another (cross-file edits).
   */
  seedWithCompletion(item, tx) {
    const s = this._state.get();
    this._state.set({
      inlineCompletions: new InlineCompletionsState([item], void 0),
      suggestWidgetInlineCompletions: InlineCompletionsState.createEmpty()
    }, tx);
    s.inlineCompletions.dispose();
    s.suggestWidgetInlineCompletions.dispose();
  }
  _sendInlineCompletionsRequestTelemetry(requestResponseInfo) {
    if (!this._sendRequestData.get() && !this._contextKeyService.getContextKeyValue("isRunningUnificationExperiment")) {
      return;
    }
    if (requestResponseInfo.requestUuid === void 0 || requestResponseInfo.hasProducedSuggestion) {
      return;
    }
    if (!isCompletionsEnabledFromObject(this._completionsEnabled, this._textModel.getLanguageId())) {
      return;
    }
    if (!requestResponseInfo.providers.some((p) => isCopilotLikeExtension(p.providerId?.extensionId))) {
      return;
    }
    const emptyEndOfLifeEvent = {
      opportunityId: requestResponseInfo.requestUuid,
      noSuggestionReason: requestResponseInfo.noSuggestionReason ?? "unknown",
      extensionId: "vscode-core",
      extensionVersion: "0.0.0",
      groupId: "empty",
      shown: false,
      skuPlan: requestResponseInfo.requestInfo.sku?.plan,
      skuType: requestResponseInfo.requestInfo.sku?.type,
      editorType: requestResponseInfo.requestInfo.editorType,
      requestReason: requestResponseInfo.requestInfo.reason,
      typingInterval: requestResponseInfo.requestInfo.typingInterval,
      typingIntervalCharacterCount: requestResponseInfo.requestInfo.typingIntervalCharacterCount,
      languageId: requestResponseInfo.requestInfo.languageId,
      selectedSuggestionInfo: !!requestResponseInfo.context.selectedSuggestionInfo,
      availableProviders: requestResponseInfo.providers.map((p) => p.providerId?.toString()).filter(isDefined).join(","),
      ...forwardToChannelIf(requestResponseInfo.providers.some((p) => isCopilotLikeExtension(p.providerId?.extensionId))),
      timeUntilProviderRequest: void 0,
      timeUntilProviderResponse: void 0,
      viewKind: void 0,
      preceeded: void 0,
      superseded: void 0,
      reason: void 0,
      acceptedAlternativeAction: void 0,
      correlationId: void 0,
      shownDuration: void 0,
      shownDurationUncollapsed: void 0,
      timeUntilShown: void 0,
      partiallyAccepted: void 0,
      partiallyAcceptedCountSinceOriginal: void 0,
      partiallyAcceptedRatioSinceOriginal: void 0,
      partiallyAcceptedCharactersSinceOriginal: void 0,
      cursorColumnDistance: void 0,
      cursorLineDistance: void 0,
      lineCountOriginal: void 0,
      lineCountModified: void 0,
      characterCountOriginal: void 0,
      characterCountModified: void 0,
      disjointReplacements: void 0,
      sameShapeReplacements: void 0,
      longDistanceHintVisible: void 0,
      longDistanceHintDistance: void 0,
      isForAnotherDocument: void 0,
      notShownReason: void 0,
      renameCreated: false,
      renameDuration: void 0,
      renameTimedOut: false,
      renameDroppedOtherEdits: void 0,
      renameDroppedRenameEdits: void 0,
      performanceMarkers: void 0,
      editKind: void 0
    };
    sendInlineCompletionsEndOfLifeTelemetry(this._dataChannelTelemetryService, emptyEndOfLifeEvent);
  }
  clearSuggestWidgetInlineCompletions(tx) {
    if (this._updateOperation.value?.request.context.selectedSuggestionInfo) {
      this._updateOperation.clear();
    }
  }
  cancelUpdate() {
    this._updateOperation.clear();
  }
};

InlineCompletionsSource = __decorateClass([
  __decorateParam(5, ILanguageConfigurationService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, ITextModelService)
], InlineCompletionsSource);

var UpdateRequest = class {
  constructor(position2, context2, versionId, providers2) {
    this.position = position2;
    this.context = context2;
    this.versionId = versionId;
    this.providers = providers2;
  }
  satisfies(other) {
    return this.position.equals(other.position) && equalsIfDefined(this.context.selectedSuggestionInfo, other.context.selectedSuggestionInfo, thisEqualsC()) && (other.context.triggerKind === 0 /* Automatic */ || this.context.triggerKind === 1 /* Explicit */) && this.versionId === other.versionId && isSubset(other.providers, this.providers);
  }
  get isExplicitRequest() {
    return this.context.triggerKind === 1 /* Explicit */;
  }
};

var RequestResponseData = class {
  constructor(context2, requestInfo, providers2) {
    this.context = context2;
    this.requestInfo = requestInfo;
    this.providers = providers2;
    this.hasProducedSuggestion = false;
  }
  setRequestUuid(uuid) {
    this.requestUuid = uuid;
  }
  setNoSuggestionReasonIfNotSet(type) {
    this.noSuggestionReason ??= type;
  }
  setHasProducedSuggestion() {
    this.hasProducedSuggestion = true;
  }
};

function isSubset(set1, set2) {
  return [...set1].every((item) => set2.has(item));
}

var UpdateOperation = class {
  constructor(request2, cancellationTokenSource, promise) {
    this.request = request2;
    this.cancellationTokenSource = cancellationTokenSource;
    this.promise = promise;
  }
  dispose() {
    this.cancellationTokenSource.cancel();
  }
};

var InlineCompletionsState = class _InlineCompletionsState extends Disposable {
  constructor(inlineCompletions, request2) {
    super();
    this.inlineCompletions = inlineCompletions;
    this.request = request2;
    for (const inlineCompletion of this.inlineCompletions) {
      inlineCompletion.addRef();
    }
    this._register({
      dispose: () => {
        for (const inlineCompletion of this.inlineCompletions) {
          inlineCompletion.removeRef();
        }
      }
    });
  }
  static createEmpty() {
    return new _InlineCompletionsState([], void 0);
  }
  _findById(id2) {
    return this.inlineCompletions.find((i2) => i2.identity === id2);
  }
  _findByHash(hash2) {
    return this.inlineCompletions.find((i2) => i2.hash === hash2);
  }
  /**
   * Applies the edit on the state.
  */
  createStateWithAppliedEdit(edit3, textModel) {
    const newInlineCompletions = this.inlineCompletions.map((i2) => i2.withEdit(edit3, textModel)).filter(isDefined);
    return new _InlineCompletionsState(newInlineCompletions, this.request);
  }
  createStateWithAppliedResults(updatedSuggestions, request2, textModel, cursorPosition, itemIdToPreserveAtTop) {
    let itemToPreserve = void 0;
    if (itemIdToPreserveAtTop) {
      const itemToPreserveCandidate = this._findById(itemIdToPreserveAtTop);
      if (itemToPreserveCandidate && itemToPreserveCandidate.canBeReused(textModel, request2.position)) {
        itemToPreserve = itemToPreserveCandidate;
        const updatedItemToPreserve = updatedSuggestions.find((i2) => i2.hash === itemToPreserveCandidate.hash);
        if (updatedItemToPreserve) {
          updatedSuggestions = moveToFront(updatedItemToPreserve, updatedSuggestions);
        } else {
          updatedSuggestions = [itemToPreserveCandidate, ...updatedSuggestions];
        }
      }
    }
    const preferInlineCompletions = itemToPreserve ? !itemToPreserve.isInlineEdit : updatedSuggestions.some((i2) => !i2.isInlineEdit && i2.isVisible(textModel, cursorPosition));
    let updatedItems = [];
    for (const i2 of updatedSuggestions) {
      const oldItem = this._findByHash(i2.hash);
      let item;
      if (oldItem && oldItem !== i2) {
        item = i2.withIdentity(oldItem.identity);
        i2.setIsPreceeded(oldItem);
        oldItem.setEndOfLifeReason({ kind: 2 /* Ignored */, userTypingDisagreed: false, supersededBy: i2.getSourceCompletion() });
      } else {
        item = i2;
      }
      if (preferInlineCompletions !== item.isInlineEdit) {
        updatedItems.push(item);
      }
    }
    updatedItems.sort(compareBy((i2) => i2.showInlineEditMenu, booleanComparator));
    updatedItems = distinctByKey(updatedItems, (i2) => i2.semanticId);
    return new _InlineCompletionsState(updatedItems, request2);
  }
  clone() {
    return new _InlineCompletionsState(this.inlineCompletions, this.request);
  }
};

function distinctByKey(items, key3) {
  const seen = /* @__PURE__ */ new Set();
  return items.filter((item) => {
    const k = key3(item);
    if (seen.has(k)) {
      return false;
    }
    seen.add(k);
    return true;
  });
}

function moveToFront(item, items) {
  const index2 = items.indexOf(item);
  if (index2 > -1) {
    return [item, ...items.slice(0, index2), ...items.slice(index2 + 1)];
  }
  return items;
}
export { isSubset, distinctByKey, moveToFront, InlineCompletionsSource, UpdateRequest, RequestResponseData, UpdateOperation, InlineCompletionsState };
