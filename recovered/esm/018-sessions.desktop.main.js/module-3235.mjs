// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/suggest/browser/terminalSuggestAddon.ts
import { Disposable, MutableDisposable, combinedDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { terminalSymbolAliasIcon, terminalSymbolArgumentIcon, terminalSymbolBranchIcon, terminalSymbolCommitIcon, terminalSymbolEnumMember, terminalSymbolFileIcon, terminalSymbolFlagIcon, terminalSymbolFolderIcon, terminalSymbolInlineSuggestionIcon, terminalSymbolMethodIcon, terminalSymbolOptionIcon, terminalSymbolPullRequestDoneIcon, terminalSymbolPullRequestIcon, terminalSymbolRemoteIcon, terminalSymbolStashIcon, terminalSymbolSymbolTextIcon, terminalSymbolSymbolicLinkFileIcon, terminalSymbolSymbolicLinkFolderIcon, terminalSymbolTagIcon } from "./module-3233.mjs";
import { localize } from "./module-0001.mjs";
import { TerminalCompletionItem } from "./module-1276.mjs";
import { IntervalTimer, TimeoutTimer, createCancelablePromise } from "./module-0036.mjs";
import { TerminalSuggestTelemetry } from "./module-3232.mjs";
import { normalizeQuickSuggestionsConfig, terminalSuggestConfigSection } from "./module-1170.mjs";
import { Dimension, addDisposableListener, getActiveDocument, getActiveWindow, isAncestorOfActiveElement } from "./module-0075.mjs";
import { isString } from "./module-0010.mjs";
import { LineContext3 } from "./module-3227.mjs";
import { TerminalCompletionModel } from "./module-3231.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { GOLDEN_LINE_HEIGHT_RATIO } from "./module-0101.mjs";
import { SimpleSuggestWidget } from "./module-3230.mjs";
import { MenuId } from "./module-0092.mjs";
import { TerminalSuggestShownTracker } from "./module-3234.mjs";
import { commonPrefixLength2 } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalCompletionService } from "./module-1278.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITerminalConfigurationService } from "./module-1150.mjs";
import { ITerminalLogService } from "./module-1155.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/terminalContrib/suggest/browser/terminalSuggestAddon.ts
function isInlineCompletionSupported(shellType) {
  if (!shellType) {
    return false;
  }
  return shellType === "bash" /* Bash */ || shellType === "zsh" /* Zsh */ || shellType === "fish" /* Fish */ || shellType === "pwsh" /* PowerShell */ || shellType === "gitbash" /* GitBash */;
}

var SuggestAddon = class extends Disposable {
  constructor(_sessionId, shellType, _capabilities, _terminalSuggestWidgetVisibleContextKey, _terminalCompletionService, _configurationService, _instantiationService, _terminalConfigurationService, _logService) {
    super();
    this._sessionId = _sessionId;
    this._capabilities = _capabilities;
    this._terminalSuggestWidgetVisibleContextKey = _terminalSuggestWidgetVisibleContextKey;
    this._terminalCompletionService = _terminalCompletionService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._logService = _logService;
    this._promptInputModelSubscriptions = this._register(new MutableDisposable());
    this._enableWidget = true;
    this._isFilteringDirectories = false;
    this._cursorIndexDelta = 0;
    this._requestedCompletionsIndex = 0;
    this._lastUserDataTimestamp = 0;
    this._ignoreFocusEvents = false;
    this._requestCompletionsOnNextSync = false;
    this.isPasting = false;
    this._onBell = this._register(new Emitter());
    this.onBell = this._onBell.event;
    this._onAcceptedCompletion = this._register(new Emitter());
    this.onAcceptedCompletion = this._onAcceptedCompletion.event;
    this._onDidReceiveCompletions = this._register(new Emitter());
    this.onDidReceiveCompletions = this._onDidReceiveCompletions.event;
    this._onDidFontConfigurationChange = this._register(new Emitter());
    this.onDidFontConfigurationChange = this._onDidFontConfigurationChange.event;
    this._kindToIconMap = /* @__PURE__ */ new Map([
      [0 /* File */, terminalSymbolFileIcon],
      [1 /* Folder */, terminalSymbolFolderIcon],
      [8 /* SymbolicLinkFile */, terminalSymbolSymbolicLinkFileIcon],
      [9 /* SymbolicLinkFolder */, terminalSymbolSymbolicLinkFolderIcon],
      [2 /* Method */, terminalSymbolMethodIcon],
      [3 /* Alias */, terminalSymbolAliasIcon],
      [4 /* Argument */, terminalSymbolArgumentIcon],
      [5 /* Option */, terminalSymbolOptionIcon],
      [6 /* OptionValue */, terminalSymbolEnumMember],
      [7 /* Flag */, terminalSymbolFlagIcon],
      [10 /* Commit */, terminalSymbolCommitIcon],
      [11 /* Branch */, terminalSymbolBranchIcon],
      [12 /* Tag */, terminalSymbolTagIcon],
      [13 /* Stash */, terminalSymbolStashIcon],
      [14 /* Remote */, terminalSymbolRemoteIcon],
      [15 /* PullRequest */, terminalSymbolPullRequestIcon],
      [16 /* PullRequestDone */, terminalSymbolPullRequestDoneIcon],
      [100 /* InlineSuggestion */, terminalSymbolInlineSuggestionIcon],
      [101 /* InlineSuggestionAlwaysOnTop */, terminalSymbolInlineSuggestionIcon]
    ]);
    this._kindToKindLabelMap = /* @__PURE__ */ new Map([
      [0 /* File */, localize(20880, null)],
      [1 /* Folder */, localize(20882, null)],
      [8 /* SymbolicLinkFile */, localize(20892, null)],
      [9 /* SymbolicLinkFolder */, localize(20893, null)],
      [2 /* Method */, localize(20885, null)],
      [3 /* Alias */, localize(20876, null)],
      [4 /* Argument */, localize(20877, null)],
      [5 /* Option */, localize(20886, null)],
      [6 /* OptionValue */, localize(20887, null)],
      [7 /* Flag */, localize(20881, null)],
      [10 /* Commit */, localize(20879, null)],
      [11 /* Branch */, localize(20878, null)],
      [12 /* Tag */, localize(20894, null)],
      [13 /* Stash */, localize(20891, null)],
      [14 /* Remote */, localize(20890, null)],
      [15 /* PullRequest */, localize(20888, null)],
      [16 /* PullRequestDone */, localize(20889, null)],
      [100 /* InlineSuggestion */, localize(20883, null)],
      [101 /* InlineSuggestionAlwaysOnTop */, localize(20884, null)]
    ]);
    this._inlineCompletion = {
      label: "",
      // Right arrow is used to accept the completion. This is a common keybinding in pwsh, zsh
      // and fish.
      inputData: "\x1B[C",
      replacementRange: [0, 0],
      provider: "core:inlineSuggestion",
      detail: "Inline suggestion",
      kind: 100 /* InlineSuggestion */,
      kindLabel: "Inline suggestion",
      icon: this._kindToIconMap.get(100 /* InlineSuggestion */)
    };
    this._inlineCompletionItem = new TerminalCompletionItem(this._inlineCompletion);
    this._shouldSyncWhenReady = false;
    this.shellType = shellType;
    if (this.shellType) {
      this._shellTypeInit = Promise.resolve();
    } else {
      const intervalTimer = this._register(new IntervalTimer());
      const timeoutTimer = this._register(new TimeoutTimer());
      this._shellTypeInit = new Promise((r2) => {
        intervalTimer.cancelAndSet(() => {
          if (this.shellType) {
            r2();
          }
        }, 50);
        timeoutTimer.cancelAndSet(r2, 5e3);
      }).then(() => {
        this._store.delete(intervalTimer);
        this._store.delete(timeoutTimer);
      });
    }
    this._register(Event2.runAndSubscribe(this._capabilities.onDidChangeCapabilities, () => {
      const commandDetection = this._capabilities.get(2 /* CommandDetection */);
      if (commandDetection) {
        if (this._promptInputModel !== commandDetection.promptInputModel) {
          this._promptInputModel = commandDetection.promptInputModel;
          this._suggestTelemetry = this._register(this._instantiationService.createInstance(TerminalSuggestTelemetry, commandDetection, this._promptInputModel));
          this._promptInputModelSubscriptions.value = combinedDisposable(
            this._promptInputModel.onDidChangeInput((e4) => this._sync(e4)),
            this._promptInputModel.onDidFinishInput(() => {
              this.hideSuggestWidget(true);
            })
          );
          if (this._shouldSyncWhenReady) {
            this._sync(this._promptInputModel);
            this._shouldSyncWhenReady = false;
          }
        }
      } else {
        this._promptInputModel = void 0;
      }
    }));
    this._register(this._terminalConfigurationService.onConfigChanged(() => this._cachedFontInfo = void 0));
    this._register(Event2.runAndSubscribe(this._configurationService.onDidChangeConfiguration, (e4) => {
      if (!e4 || e4.affectsConfiguration("terminal.integrated.suggest.inlineSuggestion" /* InlineSuggestion */)) {
        const value2 = this._configurationService.getValue(terminalSuggestConfigSection).inlineSuggestion;
        this._inlineCompletionItem.isInvalid = value2 === "off";
        switch (value2) {
          case "alwaysOnTopExceptExactMatch": {
            this._inlineCompletion.kind = 100 /* InlineSuggestion */;
            break;
          }
          case "alwaysOnTop":
          default: {
            this._inlineCompletion.kind = 101 /* InlineSuggestionAlwaysOnTop */;
            break;
          }
        }
        this._model?.forceRefilterAll();
      }
    }));
  }
  static {
    this.lastAcceptedCompletionTimestamp = 0;
  }
  activate(xterm) {
    this._terminal = xterm;
    this._register(xterm.onKey(async (e4) => {
      this._lastUserData = e4.key;
      this._lastUserDataTimestamp = Date.now();
    }));
    this._register(xterm.onScroll(() => this.hideSuggestWidget(true)));
    this._register(xterm.onResize(() => this._relayoutOnResize()));
  }
  async _handleCompletionProviders(terminal2, token, explicitlyInvoked) {
    this._logService.trace("SuggestAddon#_handleCompletionProviders");
    if (!terminal2?.element || !this._enableWidget || !this._promptInputModel) {
      return;
    }
    if (!isAncestorOfActiveElement(terminal2.element)) {
      return;
    }
    await this._shellTypeInit;
    let doNotRequestExtensionCompletions = false;
    if (this._promptInputModel.value !== "" && this._lastUserDataTimestamp < SuggestAddon.lastAcceptedCompletionTimestamp) {
      doNotRequestExtensionCompletions = true;
    }
    this._currentPromptInputState = {
      value: this._promptInputModel.value,
      prefix: this._promptInputModel.prefix,
      suffix: this._promptInputModel.suffix,
      cursorIndex: this._promptInputModel.cursorIndex,
      ghostTextIndex: this._promptInputModel.ghostTextIndex
    };
    this._requestedCompletionsIndex = this._currentPromptInputState.cursorIndex;
    if (explicitlyInvoked && this._container) {
      const suggestWidget = this._ensureSuggestWidget(terminal2);
      const cursorPosition = this._getCursorPosition(terminal2);
      if (cursorPosition) {
        suggestWidget.showTriggered(true, cursorPosition);
      }
    }
    const quickSuggestionsConfig = normalizeQuickSuggestionsConfig(this._configurationService.getValue(terminalSuggestConfigSection).quickSuggestions);
    const allowFallbackCompletions = explicitlyInvoked || quickSuggestionsConfig.unknown === "on";
    this._logService.trace("SuggestAddon#_handleCompletionProviders provideCompletions");
    const ghostTextIndex = this._mostRecentPromptInputState?.ghostTextIndex === void 0 ? -1 : this._mostRecentPromptInputState?.ghostTextIndex;
    const promptValue = ghostTextIndex > -1 ? this._currentPromptInputState.value.substring(0, ghostTextIndex) : this._currentPromptInputState.value;
    const providedCompletions = await this._terminalCompletionService.provideCompletions(promptValue, this._currentPromptInputState.cursorIndex, allowFallbackCompletions, this.shellType, this._capabilities, token, false, doNotRequestExtensionCompletions, explicitlyInvoked);
    this._logService.trace("SuggestAddon#_handleCompletionProviders provideCompletions done");
    if (token.isCancellationRequested) {
      return;
    }
    this._onDidReceiveCompletions.fire();
    this._cursorIndexDelta = this._promptInputModel.cursorIndex - this._requestedCompletionsIndex;
    this._leadingLineContent = this._promptInputModel.prefix.substring(0, this._requestedCompletionsIndex + this._cursorIndexDelta);
    const completions = providedCompletions?.flat() || [];
    if (!explicitlyInvoked && !completions.length) {
      this.hideSuggestWidget(true);
      return;
    }
    const firstChar = this._leadingLineContent.length === 0 ? "" : this._leadingLineContent[0];
    if (this._leadingLineContent.includes(" ") || firstChar === "[") {
      this._leadingLineContent = this._promptInputModel.prefix;
    }
    let normalizedLeadingLineContent = this._leadingLineContent;
    this._isFilteringDirectories = completions.some((e4) => e4.kind === 1 /* Folder */);
    if (this._isFilteringDirectories) {
      const firstDir = completions.find((e4) => e4.kind === 1 /* Folder */);
      const textLabel = isString(firstDir?.label) ? firstDir.label : firstDir?.label.label;
      const labelSep = textLabel?.match(/(?<sep>[\\\/])/)?.groups?.sep;
      if (labelSep) {
        this._pathSeparator = labelSep;
      }
      if (this._pathSeparator) {
        normalizedLeadingLineContent = normalizePathSeparator(normalizedLeadingLineContent, this._pathSeparator);
      }
    }
    this._refreshInlineCompletion(completions);
    for (const completion of completions) {
      if (!completion.icon) {
        if (completion.kind !== void 0) {
          completion.icon = this._kindToIconMap.get(completion.kind);
          completion.kindLabel = this._kindToKindLabelMap.get(completion.kind);
        } else {
          completion.icon = terminalSymbolSymbolTextIcon;
        }
      }
    }
    const lineContext = new LineContext3(normalizedLeadingLineContent, this._cursorIndexDelta);
    const items = completions.filter((c) => !!c.label).map((c) => new TerminalCompletionItem(c, this._pathSeparator));
    if (isInlineCompletionSupported(this.shellType)) {
      items.push(this._inlineCompletionItem);
    }
    this._logService.trace("TerminalCompletionService#_collectCompletions create model");
    const model = new TerminalCompletionModel(
      items,
      lineContext
    );
    this._logService.trace("TerminalCompletionService#_collectCompletions create model done");
    if (token.isCancellationRequested) {
      this._completionRequestTimestamp = void 0;
      return;
    }
    this._showCompletions(model, explicitlyInvoked);
  }
  setContainerWithOverflow(container2) {
    const containerChanged = this._container !== container2;
    const parentChanged = this._suggestWidget?.element.domNode.parentElement !== container2;
    if (!containerChanged && !parentChanged) {
      return;
    }
    this._container = container2;
    if (this._suggestWidget) {
      container2.appendChild(this._suggestWidget.element.domNode);
    }
  }
  setScreen(screen) {
    this._screen = screen;
  }
  toggleExplainMode() {
    this._suggestWidget?.toggleExplainMode();
  }
  toggleSuggestionFocus() {
    this._suggestWidget?.toggleDetailsFocus();
  }
  toggleSuggestionDetails() {
    this._suggestWidget?.toggleDetails();
  }
  resetWidgetSize() {
    this._suggestWidget?.resetWidgetSize();
  }
  async requestCompletions(explicitlyInvoked) {
    this._logService.trace("SuggestAddon#requestCompletions");
    if (!this._promptInputModel) {
      this._shouldSyncWhenReady = true;
      return;
    }
    if (this.isPasting) {
      return;
    }
    if (this._cancellationTokenSource) {
      this._cancellationTokenSource.cancel();
      this._cancellationTokenSource.dispose();
    }
    this._cancellationTokenSource = new CancellationTokenSource();
    const token = this._cancellationTokenSource.token;
    this._completionRequestTimestamp = Date.now();
    await this._handleCompletionProviders(this._terminal, token, explicitlyInvoked);
    if (!this._terminalSuggestWidgetVisibleContextKey.get()) {
      this._completionRequestTimestamp = void 0;
    }
  }
  _addPropertiesToInlineCompletionItem(completions) {
    const inlineCompletionLabel = (isString(this._inlineCompletionItem.completion.label) ? this._inlineCompletionItem.completion.label : this._inlineCompletionItem.completion.label.label).trim();
    const inlineCompletionMatchIndex = completions.findIndex((c) => isString(c.label) ? c.label === inlineCompletionLabel : c.label.label === inlineCompletionLabel);
    if (inlineCompletionMatchIndex !== -1) {
      const richCompletionMatchingInline = completions.splice(inlineCompletionMatchIndex, 1)[0];
      this._inlineCompletionItem.completion.label = richCompletionMatchingInline.label;
      this._inlineCompletionItem.completion.detail = richCompletionMatchingInline.detail;
      this._inlineCompletionItem.completion.documentation = richCompletionMatchingInline.documentation;
    } else if (this._inlineCompletionItem.completion) {
      this._inlineCompletionItem.completion.detail = void 0;
      this._inlineCompletionItem.completion.documentation = void 0;
    }
  }
  _requestTriggerCharQuickSuggestCompletions() {
    if (!this._wasLastInputVerticalArrowKey() && !this._wasLastInputTabKey()) {
      if (!this._wasLastInputIncludedEscape() || this._terminalSuggestWidgetVisibleContextKey.get()) {
        this.requestCompletions();
        return true;
      }
    }
    return false;
  }
  _checkProviderTriggerCharacters(char) {
    for (const provider of this._terminalCompletionService.providers) {
      if (!provider.triggerCharacters) {
        continue;
      }
      for (const triggerChar of provider.triggerCharacters) {
        if (char === triggerChar) {
          return true;
        }
      }
    }
    return false;
  }
  _wasLastInputRightArrowKey() {
    return !!this._lastUserData?.match(/^\x1b[\[O]?C$/);
  }
  _wasLastInputVerticalArrowKey() {
    return !!this._lastUserData?.match(/^\x1b[\[O]?[A-B]$/);
  }
  /**
   * Whether the last input included the escape character. Typically this will mean it was more
   * than just a simple character, such as arrow keys, home, end, etc.
   */
  _wasLastInputIncludedEscape() {
    return !!this._lastUserData?.includes("\x1B");
  }
  _wasLastInputArrowKey() {
    return !!this._lastUserData?.match(/^\x1b[\[O]?[A-D]$/);
  }
  _wasLastInputTabKey() {
    return this._lastUserData === "	";
  }
  _sync(promptInputState) {
    const config = this._configurationService.getValue(terminalSuggestConfigSection);
    const quickSuggestions = normalizeQuickSuggestionsConfig(config.quickSuggestions);
    {
      let sent = false;
      if (this._requestCompletionsOnNextSync) {
        this._requestCompletionsOnNextSync = false;
        sent = this._requestTriggerCharQuickSuggestCompletions();
      }
      if (!this._mostRecentPromptInputState || promptInputState.cursorIndex > this._mostRecentPromptInputState.cursorIndex) {
        if (!this._terminalSuggestWidgetVisibleContextKey.get()) {
          const commandLineHasSpace = promptInputState.prefix.trim().match(/\s/);
          if (!commandLineHasSpace && quickSuggestions.commands === "on" || commandLineHasSpace && quickSuggestions.arguments === "on") {
            if (promptInputState.prefix.match(/[^\s]$/)) {
              sent = this._requestTriggerCharQuickSuggestCompletions();
            }
          }
        }
        if (config.suggestOnTriggerCharacters && !sent) {
          const prefix = promptInputState.prefix;
          if (
            // Only trigger on `-` if it's after a space. This is required to not clear
            // completions when typing the `-` in `git cherry-pick`
            prefix?.match(/\s[\-]$/) || // Only trigger on `\` and `/` if it's a directory. Not doing so causes problems
            // with git branches in particular
            this._isFilteringDirectories && prefix?.match(/[\\\/]$/)
          ) {
            sent = this._requestTriggerCharQuickSuggestCompletions();
          }
          if (!sent) {
            for (const provider of this._terminalCompletionService.providers) {
              if (!provider.triggerCharacters) {
                continue;
              }
              for (const char of provider.triggerCharacters) {
                if (prefix?.endsWith(char)) {
                  sent = this._requestTriggerCharQuickSuggestCompletions();
                  break;
                }
              }
            }
          }
        }
      }
      if (this._mostRecentPromptInputState && promptInputState.cursorIndex < this._mostRecentPromptInputState.cursorIndex && promptInputState.cursorIndex > 0) {
        if (this._terminalSuggestWidgetVisibleContextKey.get()) {
          if (config.suggestOnTriggerCharacters && !sent && this._mostRecentPromptInputState.cursorIndex > 0) {
            const char = this._mostRecentPromptInputState.value[this._mostRecentPromptInputState.cursorIndex - 1];
            if (char && // Only trigger on `\` and `/` if it's a directory. Not doing so causes problems
            // with git branches in particular
            (this._isFilteringDirectories && char.match(/[\\\/]$/) || // Check if the character is a trigger character from providers
            this._checkProviderTriggerCharacters(char))) {
              sent = this._requestTriggerCharQuickSuggestCompletions();
            }
          }
        }
      }
    }
    if (this._wasLastInputRightArrowKey() && this._mostRecentPromptInputState?.ghostTextIndex !== -1 && promptInputState.ghostTextIndex === -1 && this._mostRecentPromptInputState?.value === promptInputState.value) {
      this.hideSuggestWidget(false);
    }
    this._mostRecentPromptInputState = promptInputState;
    if (!this._promptInputModel || !this._terminal || !this._suggestWidget || this._leadingLineContent === void 0) {
      return;
    }
    const previousPromptInputState = this._currentPromptInputState;
    this._currentPromptInputState = promptInputState;
    if (this._currentPromptInputState.cursorIndex > 1 && this._currentPromptInputState.value.at(this._currentPromptInputState.cursorIndex - 1) === " ") {
      if (!this._wasLastInputArrowKey()) {
        this.hideSuggestWidget(false);
        return;
      }
    }
    if (this._currentPromptInputState && this._currentPromptInputState.cursorIndex < this._leadingLineContent.length) {
      if (this._currentPromptInputState.cursorIndex <= 0 || previousPromptInputState?.value[this._currentPromptInputState.cursorIndex]?.match(/[\\\/\s]/)) {
        this.hideSuggestWidget(false);
        return;
      }
    }
    if (this._terminalSuggestWidgetVisibleContextKey.get()) {
      this._cursorIndexDelta = this._currentPromptInputState.cursorIndex - this._requestedCompletionsIndex;
      let normalizedLeadingLineContent = this._currentPromptInputState.value.substring(0, this._requestedCompletionsIndex + this._cursorIndexDelta);
      if (this._isFilteringDirectories && this._pathSeparator) {
        normalizedLeadingLineContent = normalizePathSeparator(normalizedLeadingLineContent, this._pathSeparator);
      }
      const lineContext = new LineContext3(normalizedLeadingLineContent, this._cursorIndexDelta);
      this._suggestWidget.setLineContext(lineContext);
    }
    this._refreshInlineCompletion(this._model?.items.map((i2) => i2.completion) || []);
    if (!this._suggestWidget.hasCompletions()) {
      this.hideSuggestWidget(false);
      return;
    }
    const cursorPosition = this._getCursorPosition(this._terminal);
    if (!cursorPosition) {
      return;
    }
    this._suggestWidget.showSuggestions(0, false, true, cursorPosition);
  }
  _refreshInlineCompletion(completions) {
    if (!isInlineCompletionSupported(this.shellType)) {
      return;
    }
    const oldIsInvalid = this._inlineCompletionItem.isInvalid;
    if (!this._currentPromptInputState || this._currentPromptInputState.ghostTextIndex === -1) {
      this._inlineCompletionItem.isInvalid = true;
    } else {
      this._inlineCompletionItem.isInvalid = false;
      const spaceIndex = this._currentPromptInputState.value.lastIndexOf(" ", this._currentPromptInputState.ghostTextIndex - 1);
      const replacementIndex = spaceIndex === -1 ? 0 : spaceIndex + 1;
      const suggestion = this._currentPromptInputState.value.substring(replacementIndex);
      this._inlineCompletion.label = suggestion;
      const end = this._currentPromptInputState.cursorIndex - this._cursorIndexDelta;
      this._inlineCompletion.replacementRange = [replacementIndex, end];
      this._addPropertiesToInlineCompletionItem(completions);
      const x = new TerminalCompletionItem(this._inlineCompletion, this._pathSeparator);
      this._inlineCompletionItem.idx = x.idx;
      this._inlineCompletionItem.score = x.score;
      this._inlineCompletionItem.labelLow = x.labelLow;
      this._inlineCompletionItem.textLabel = x.textLabel;
      this._inlineCompletionItem.fileExtLow = x.fileExtLow;
      this._inlineCompletionItem.labelLowExcludeFileExt = x.labelLowExcludeFileExt;
      this._inlineCompletionItem.labelLowNormalizedPath = x.labelLowNormalizedPath;
      this._inlineCompletionItem.punctuationPenalty = x.punctuationPenalty;
      this._inlineCompletionItem.word = x.word;
      this._model?.forceRefilterAll();
    }
    if (this._inlineCompletionItem.isInvalid !== oldIsInvalid) {
      this._model?.forceRefilterAll();
    }
  }
  _getTerminalDimensions() {
    const cssCellDims = this._terminal._core._renderService.dimensions.css.cell;
    return {
      width: cssCellDims.width,
      height: cssCellDims.height
    };
  }
  _getCursorPosition(terminal2) {
    const dimensions = this._getTerminalDimensions();
    if (!dimensions.width || !dimensions.height) {
      return void 0;
    }
    const xtermBox = this._screen.getBoundingClientRect();
    return {
      left: xtermBox.left + terminal2.buffer.active.cursorX * dimensions.width,
      top: xtermBox.top + terminal2.buffer.active.cursorY * dimensions.height,
      height: dimensions.height
    };
  }
  _getFontInfo() {
    if (this._cachedFontInfo) {
      return this._cachedFontInfo;
    }
    const core2 = this._terminal._core;
    const font = this._terminalConfigurationService.getFont(getActiveWindow(), core2);
    let lineHeight = font.lineHeight;
    const fontSize = font.fontSize;
    const fontFamily = font.fontFamily;
    const letterSpacing = font.letterSpacing;
    const fontWeight = this._configurationService.getValue("editor.fontWeight");
    lineHeight = lineHeight * fontSize;
    lineHeight = Math.round(lineHeight);
    const minTerminalLineHeight = GOLDEN_LINE_HEIGHT_RATIO * fontSize;
    if (lineHeight < minTerminalLineHeight) {
      lineHeight = minTerminalLineHeight;
    }
    const fontInfo = {
      fontSize,
      lineHeight,
      fontWeight: fontWeight.toString(),
      letterSpacing,
      fontFamily
    };
    this._cachedFontInfo = fontInfo;
    return fontInfo;
  }
  _getAdvancedExplainModeDetails() {
    return `promptInputModel: ${this._promptInputModel?.getCombinedString()}`;
  }
  _showCompletions(model, explicitlyInvoked) {
    this._logService.trace("SuggestAddon#_showCompletions");
    if (!this._terminal?.element || !this._container) {
      return;
    }
    const suggestWidget = this._ensureSuggestWidget(this._terminal);
    this._logService.trace("SuggestAddon#_showCompletions setCompletionModel");
    suggestWidget.setCompletionModel(model);
    if (!this._promptInputModel || !explicitlyInvoked && model.items.length === 0) {
      return;
    }
    this._model = model;
    const cursorPosition = this._getCursorPosition(this._terminal);
    if (!cursorPosition) {
      return;
    }
    if (this._completionRequestTimestamp !== void 0) {
      const completionLatency = Date.now() - this._completionRequestTimestamp;
      if (this._suggestTelemetry && this._discoverability) {
        const firstShown = this._discoverability.getFirstShown(this.shellType);
        this._discoverability.updateShown();
        this._suggestTelemetry.logCompletionLatency(this._sessionId, completionLatency, firstShown);
      }
      this._completionRequestTimestamp = void 0;
    }
    this._logService.trace("SuggestAddon#_showCompletions suggestWidget.showSuggestions");
    suggestWidget.showSuggestions(0, false, !explicitlyInvoked, cursorPosition);
  }
  _ensureSuggestWidget(terminal2) {
    if (!this._suggestWidget) {
      this._suggestWidget = this._register(this._instantiationService.createInstance(
        SimpleSuggestWidget,
        this._container,
        this._instantiationService.createInstance(PersistedWidgetSize2),
        {
          statusBarMenuId: MenuId.MenubarTerminalSuggestStatusMenu,
          showStatusBarSettingId: "terminal.integrated.suggest.showStatusBar" /* ShowStatusBar */,
          selectionModeSettingId: "terminal.integrated.suggest.selectionMode" /* SelectionMode */,
          preventDetailsPlacements: [1 /* West */]
        },
        this._getFontInfo.bind(this),
        this._onDidFontConfigurationChange.event.bind(this),
        this._getAdvancedExplainModeDetails.bind(this)
      ));
      this._register(this._suggestWidget.onDidSelect(async (e4) => this.acceptSelectedSuggestion(e4)));
      this._register(this._suggestWidget.onDidHide(() => this._terminalSuggestWidgetVisibleContextKey.reset()));
      this._register(this._suggestWidget.onDidShow(() => this._terminalSuggestWidgetVisibleContextKey.set(true)));
      this._register(this._suggestWidget.onDidFocus(() => this._terminal?.focus()));
      this._register(this._configurationService.onDidChangeConfiguration(
        (e4) => {
          if (e4.affectsConfiguration("terminal.integrated.fontFamily" /* FontFamily */) || e4.affectsConfiguration("terminal.integrated.fontSize" /* FontSize */) || e4.affectsConfiguration("terminal.integrated.lineHeight" /* LineHeight */) || e4.affectsConfiguration("terminal.integrated.fontFamily" /* FontFamily */) || e4.affectsConfiguration("editor.fontSize") || e4.affectsConfiguration("editor.fontFamily")) {
            this._onDidFontConfigurationChange.fire();
          }
        }
      ));
      this._register(this._suggestWidget.onDidFocus(async (e4) => {
        if (this._ignoreFocusEvents) {
          return;
        }
        const focusedItem = e4.item;
        const focusedIndex = e4.index;
        if (focusedItem === this._focusedItem) {
          return;
        }
        this._currentSuggestionDetails?.cancel();
        this._currentSuggestionDetails = void 0;
        this._focusedItem = focusedItem;
        if (focusedItem && (!focusedItem.completion.documentation || !focusedItem.completion.detail)) {
          this._currentSuggestionDetails = createCancelablePromise(async (token) => {
            try {
              await focusedItem.resolve(token);
            } catch (error) {
              this._logService.warn(`Failed to resolve suggestion details for item ${focusedItem} at index ${focusedIndex}`, error);
            }
          });
          this._currentSuggestionDetails.then(() => {
            if (focusedItem !== this._focusedItem || !this._suggestWidget?.list || focusedIndex >= this._suggestWidget.list.length) {
              return;
            }
            this._ignoreFocusEvents = true;
            this._suggestWidget.list.splice(focusedIndex, 1, [focusedItem]);
            this._suggestWidget.list.setFocus([focusedIndex]);
            this._ignoreFocusEvents = false;
          });
        }
      }));
      const element = this._terminal?.element?.querySelector(".xterm-helper-textarea");
      if (element) {
        this._register(addDisposableListener(getActiveDocument(), "click", (event) => {
          const target = event.target;
          if (this._terminal?.element?.contains(target)) {
            this._suggestWidget?.hide();
          }
        }));
      }
      this._register(this._suggestWidget.onDidShow(() => this._updateDiscoverabilityState()));
      this._register(this._suggestWidget.onDidBlurDetails((e4) => {
        const elt = e4.relatedTarget;
        if (this._terminal?.element?.contains(elt)) {
          return;
        }
        this._suggestWidget?.hide();
      }));
      this._terminalSuggestWidgetVisibleContextKey.set(false);
    }
    return this._suggestWidget;
  }
  _updateDiscoverabilityState() {
    if (!this._discoverability) {
      this._discoverability = this._register(this._instantiationService.createInstance(TerminalSuggestShownTracker, this.shellType));
    }
    if (!this._suggestWidget || this._discoverability?.done) {
      return;
    }
    this._discoverability?.update(this._suggestWidget.element.domNode);
  }
  resetDiscoverability() {
    this._discoverability?.resetState();
  }
  selectPreviousSuggestion() {
    this._suggestWidget?.selectPrevious();
  }
  selectPreviousPageSuggestion() {
    this._suggestWidget?.selectPreviousPage();
  }
  selectNextSuggestion() {
    this._suggestWidget?.selectNext();
  }
  selectNextPageSuggestion() {
    this._suggestWidget?.selectNextPage();
  }
  acceptSelectedSuggestion(suggestion, respectRunOnEnter) {
    if (!suggestion) {
      suggestion = this._suggestWidget?.getFocusedItem();
    }
    const initialPromptInputState = this._mostRecentPromptInputState;
    if (!suggestion?.item || !initialPromptInputState || this._leadingLineContent === void 0 || !this._model) {
      this._suggestTelemetry?.acceptCompletion(this._sessionId, void 0, this._mostRecentPromptInputState?.value);
      return;
    }
    SuggestAddon.lastAcceptedCompletionTimestamp = Date.now();
    this._suggestWidget?.hide();
    const currentPromptInputState = this._currentPromptInputState ?? initialPromptInputState;
    const startIndex = suggestion.item.completion.replacementRange?.[0] ?? currentPromptInputState.cursorIndex;
    const replacementText = currentPromptInputState.value.substring(startIndex, currentPromptInputState.cursorIndex);
    let rightSideReplacementText = "";
    if (
      // The line didn't end with ghost text
      (currentPromptInputState.ghostTextIndex === -1 || currentPromptInputState.ghostTextIndex > currentPromptInputState.cursorIndex) && // There is more than one charatcer
      currentPromptInputState.value.length > currentPromptInputState.cursorIndex + 1 && // THe next character is not a space
      currentPromptInputState.value.at(currentPromptInputState.cursorIndex) !== " "
    ) {
      const spaceIndex = currentPromptInputState.value.substring(currentPromptInputState.cursorIndex, currentPromptInputState.ghostTextIndex === -1 ? void 0 : currentPromptInputState.ghostTextIndex).indexOf(" ");
      rightSideReplacementText = currentPromptInputState.value.substring(currentPromptInputState.cursorIndex, spaceIndex === -1 ? void 0 : currentPromptInputState.cursorIndex + spaceIndex);
    }
    const completion = suggestion.item.completion;
    let resultSequence = completion.inputData;
    if (resultSequence === void 0) {
      let completionText = isString(completion.label) ? completion.label : completion.label.label;
      if ((completion.kind === 1 /* Folder */ || completion.isFileOverride) && completionText.includes(" ")) {
        completionText = completionText.replaceAll(" ", "\\ ");
      }
      let runOnEnter = false;
      if (respectRunOnEnter) {
        const runOnEnterConfig = this._configurationService.getValue(terminalSuggestConfigSection).runOnEnter;
        switch (runOnEnterConfig) {
          case "always": {
            runOnEnter = true;
            break;
          }
          case "exactMatch": {
            runOnEnter = replacementText.toLowerCase() === completionText.toLowerCase();
            break;
          }
          case "exactMatchIgnoreExtension": {
            runOnEnter = replacementText.toLowerCase() === completionText.toLowerCase();
            if (completion.isFileOverride) {
              runOnEnter ||= replacementText.toLowerCase() === completionText.toLowerCase().replace(/\.[^\.]+$/, "");
            }
            break;
          }
        }
      }
      const commonPrefixLen = commonPrefixLength2(replacementText, completionText);
      const commonPrefix = replacementText.substring(replacementText.length - 1 - commonPrefixLen, replacementText.length - 1);
      const completionSuffix = completionText.substring(commonPrefixLen);
      if (currentPromptInputState.suffix.length > 0 && currentPromptInputState.prefix.endsWith(commonPrefix) && currentPromptInputState.suffix.startsWith(completionSuffix)) {
        resultSequence = "\x1BOC".repeat(completionText.length - commonPrefixLen);
      } else {
        resultSequence = [
          // Backspace (left) to remove all additional input
          "\x7F".repeat(replacementText.length - commonPrefixLen),
          // Delete (right) to remove any additional text in the same word
          "\x1B[3~".repeat(rightSideReplacementText.length),
          // Write the completion
          completionSuffix,
          // Run on enter if needed
          runOnEnter ? "\r" : ""
        ].join("");
      }
    }
    if (completion.kind === 1 /* Folder */) {
      SuggestAddon.lastAcceptedCompletionTimestamp = 0;
    }
    const config = this._configurationService.getValue(terminalSuggestConfigSection);
    if (config.insertTrailingSpace && completion.kind !== 1 /* Folder */ && completion.kind !== 9 /* SymbolicLinkFolder */) {
      resultSequence += " ";
      this._lastUserDataTimestamp = Date.now();
      this._requestCompletionsOnNextSync = true;
    }
    this._onAcceptedCompletion.fire(resultSequence);
    this._suggestTelemetry?.acceptCompletion(this._sessionId, completion, this._mostRecentPromptInputState?.value);
    this.hideSuggestWidget(true);
  }
  hideSuggestWidget(cancelAnyRequest) {
    this._discoverability?.resetTimer();
    if (cancelAnyRequest) {
      this._cancellationTokenSource?.dispose(true);
      this._cancellationTokenSource = void 0;
      this._currentSuggestionDetails?.cancel();
      this._currentSuggestionDetails = void 0;
    }
    this._currentPromptInputState = void 0;
    this._leadingLineContent = void 0;
    this._focusedItem = void 0;
    this._suggestWidget?.hide();
  }
  _relayoutOnResize() {
    if (!this._terminalSuggestWidgetVisibleContextKey.get() || !this._terminal) {
      return;
    }
    const cursorPosition = this._getCursorPosition(this._terminal);
    if (!cursorPosition) {
      this.hideSuggestWidget(true);
      return;
    }
    this._suggestWidget?.relayout(cursorPosition);
  }
};

SuggestAddon = __decorateClass([
  __decorateParam(4, ITerminalCompletionService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, ITerminalConfigurationService),
  __decorateParam(8, ITerminalLogService)
], SuggestAddon);

var PersistedWidgetSize2 = class {
  constructor(_storageService) {
    this._storageService = _storageService;
    this._key = "terminal.integrated.suggestSize" /* TerminalSuggestSize */;
  }
  restore() {
    const raw = this._storageService.get(this._key, 0 /* PROFILE */) ?? "";
    try {
      const obj = JSON.parse(raw);
      if (Dimension.is(obj)) {
        return Dimension.lift(obj);
      }
    } catch {
    }
    return void 0;
  }
  store(size3) {
    this._storageService.store(this._key, JSON.stringify(size3), 0 /* PROFILE */, 1 /* MACHINE */);
  }
  reset() {
    this._storageService.remove(this._key, 0 /* PROFILE */);
  }
};

PersistedWidgetSize2 = __decorateClass([
  __decorateParam(0, IStorageService)
], PersistedWidgetSize2);

function normalizePathSeparator(path, sep2) {
  if (sep2 === "/") {
    return path.replaceAll("\\", "/");
  }
  return path.replaceAll("/", "\\");
}
export { isInlineCompletionSupported, normalizePathSeparator, SuggestAddon, PersistedWidgetSize2 };
