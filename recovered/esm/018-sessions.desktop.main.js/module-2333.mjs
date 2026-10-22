// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatTerminalToolProgressPart.ts
import { localize } from "./module-0001.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { TerminalContribCommandId } from "./module-1173.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { $, DisposableResizeObserver, EventHelper, EventType, addDisposableListener, clearNode, getComputedStyle, getWindow, h, hide, show } from "./module-0075.mjs";
import { createPixelSpinner } from "./module-1987.mjs";
import { getTerminalCommandDecorationState, getTerminalCommandDecorationTooltip } from "./module-2327.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { BaseChatToolInvocationSubPart } from "./module-2298.mjs";
import { isResponseVM } from "./module-0979.mjs";
import { migrateLegacyTerminalToolSpecificData } from "./module-1188.mjs";
import { URI } from "./module-0032.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ChatQueryTitlePart } from "./module-2274.mjs";
import { MarkdownString, isMarkdownString } from "./module-0462.mjs";
import { ActionBar } from "./module-0477.mjs";
import { stripIcons } from "./module-0461.mjs";
import { ChatMarkdownContentPart } from "./module-2273.mjs";
import { ChatProgressSubPart } from "./module-2264.mjs";
import { autorun } from "./module-0052.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { extractImagesFromToolInvocationOutputDetails } from "./module-1194.mjs";
import { ChatResourceGroupWidget } from "./module-2261.mjs";
import { isNumber } from "./module-0010.mjs";
import { Action } from "./module-0082.mjs";
import { Codicon } from "./module-0085.mjs";
import { TerminalToolAutoExpand } from "./module-2325.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITerminalChatService, ITerminalConfigurationService, ITerminalEditorService, ITerminalGroupService, ITerminalService } from "./module-1150.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { editorBackground } from "./module-0229.mjs";
import { PANEL_BACKGROUND } from "./module-0868.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { removeAnsiEscapeCodes } from "./module-0030.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { DetachedTerminalCommandMirror, DetachedTerminalSnapshotMirror } from "./module-2332.mjs";
import { timeout } from "./module-0036.mjs";
import { IAccessibleViewService } from "./module-0799.mjs";
import { ChatCollapsibleContentPart } from "./module-2116.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatTerminalToolProgressPart.ts
var MIN_OUTPUT_ROWS = 1;

var MAX_OUTPUT_ROWS = 8;

var MAX_COMMAND_TITLE_LENGTH = 50;

var MAX_OUTPUT_POLL_RETRIES = 10;

var OUTPUT_POLL_DELAY_MS = 100;

var MIN_DATA_EVENTS_FOR_REAL_OUTPUT = 2;

function formatTerminalDuration(durationMs) {
  if (durationMs < 1e3) {
    return localize(12256, null, Math.max(1, Math.round(durationMs)));
  }
  const seconds = durationMs / 1e3;
  return localize(12257, null, seconds < 10 ? seconds.toFixed(1) : Math.round(seconds));
}

var expandedStateByInvocation = /* @__PURE__ */ new WeakMap();

CommandsRegistry.registerCommand(TerminalContribCommandId.FocusChatInstanceAction, async (_accessor, progressPart) => {
  await progressPart?.focusTerminal();
});

CommandsRegistry.registerCommand(TerminalContribCommandId.ContinueInBackground, async (_accessor, progressPart) => {
  progressPart?.continueInBackground();
});

CommandsRegistry.registerCommand(TerminalContribCommandId.ToggleChatTerminalOutput, async (_accessor, progressPart) => {
  await progressPart?.toggleOutputFromAction();
});

var TerminalCommandDecoration = class extends Disposable {
  constructor(_options, _hoverService) {
    super();
    this._options = _options;
    this._hoverService = _hoverService;
    this._hoverRegistered = false;
    const decorationElements = h("span.chat-terminal-command-decoration@decoration", { role: "img", tabIndex: 0 });
    this._element = decorationElements.decoration;
    this._register(createPixelSpinner(this._element));
    this._attachElementToContainer();
  }
  _attachElementToContainer() {
    const container2 = this._options.getCommandBlock();
    if (!container2) {
      return;
    }
    const decoration3 = this._element;
    if (!decoration3.isConnected || decoration3.parentElement !== container2) {
      const icon2 = this._options.getIconElement();
      if (icon2 && icon2.parentElement === container2) {
        icon2.insertAdjacentElement("afterend", decoration3);
      } else {
        container2.insertBefore(decoration3, container2.firstElementChild ?? null);
      }
    }
    if (!this._hoverRegistered) {
      this._hoverRegistered = true;
      this._register(this._hoverService.setupDelayedHover(decoration3, () => ({
        content: this._getHoverText()
      })));
    }
  }
  _getHoverText() {
    const command4 = this._options.getResolvedCommand();
    const { effectiveCommand, storedState } = this._getDecorationInput(command4);
    return getTerminalCommandDecorationTooltip(effectiveCommand, storedState) || "";
  }
  update(command4) {
    this._attachElementToContainer();
    const decoration3 = this._element;
    const resolvedCommand = command4 ?? this._options.getResolvedCommand();
    this._apply(decoration3, resolvedCommand);
  }
  _apply(decoration3, command4) {
    const terminalData = this._options.terminalData;
    if (terminalData.isPty !== false && command4) {
      const existingState = terminalData.terminalCommandState ?? {};
      terminalData.terminalCommandState = {
        ...existingState,
        exitCode: command4.exitCode,
        timestamp: command4.timestamp ?? existingState.timestamp,
        duration: command4.duration ?? existingState.duration
      };
    } else if (terminalData.isPty !== false && !terminalData.terminalCommandState) {
      const now = Date.now();
      terminalData.terminalCommandState = { exitCode: void 0, timestamp: now };
    }
    const { effectiveCommand, storedState } = this._getDecorationInput(command4);
    const decorationState = getTerminalCommandDecorationState(effectiveCommand, storedState);
    const tooltip = getTerminalCommandDecorationTooltip(effectiveCommand, storedState);
    const isRunning = this._options.getIsRunning();
    decoration3.className = `chat-terminal-command-decoration ${"terminal-command-decoration" /* CommandDecoration */}`;
    if (isRunning) {
      const nonIconClasses = decorationState.classNames.filter((c) => c !== "codicon" /* Codicon */ && !c.startsWith("codicon-"));
      decoration3.classList.add("chat-terminal-running-spinner", ...nonIconClasses);
    } else {
      decoration3.classList.add("codicon" /* Codicon */, ...decorationState.classNames, ...ThemeIcon.asClassNameArray(decorationState.icon));
    }
    const isInteractive = !decoration3.classList.contains("default" /* Default */);
    decoration3.tabIndex = isInteractive ? 0 : -1;
    if (isInteractive) {
      decoration3.removeAttribute("aria-disabled");
    } else {
      decoration3.setAttribute("aria-disabled", "true");
    }
    const hoverText = tooltip || decorationState.hoverMessage;
    if (hoverText) {
      decoration3.setAttribute("aria-label", hoverText);
    } else {
      decoration3.removeAttribute("aria-label");
    }
  }
  _getDecorationInput(command4) {
    let storedState = this._options.terminalData.terminalCommandState;
    if (this._options.terminalData.isPty !== false) {
      return { effectiveCommand: command4, storedState };
    }
    const exitCode = this._options.getExitCode();
    storedState = exitCode === void 0 ? storedState : { ...storedState, exitCode };
    return {
      effectiveCommand: command4?.exitCode === void 0 && storedState?.exitCode !== void 0 ? void 0 : command4,
      storedState
    };
  }
};

TerminalCommandDecoration = __decorateClass([
  __decorateParam(1, IHoverService)
], TerminalCommandDecoration);

var ChatTerminalToolProgressPart = class extends BaseChatToolInvocationSubPart {
  constructor(toolInvocation, terminalData, context2, renderer, editorPool, currentWidthDelegate, codeBlockStartIndex, _instantiationService, _terminalChatService, _terminalService, _contextKeyService, _chatWidgetService, _configurationService, _terminalEditorService, _terminalGroupService, _telemetryService) {
    super(toolInvocation);
    this._instantiationService = _instantiationService;
    this._terminalChatService = _terminalChatService;
    this._terminalService = _terminalService;
    this._contextKeyService = _contextKeyService;
    this._chatWidgetService = _chatWidgetService;
    this._configurationService = _configurationService;
    this._terminalEditorService = _terminalEditorService;
    this._terminalGroupService = _terminalGroupService;
    this._telemetryService = _telemetryService;
    // Toolbar state that drives action visibility (replaces context keys to avoid
    // accumulating listeners on the shared IContextKeyService when many parts exist)
    this._toolbarHasInstance = false;
    this._toolbarCanContinueInBackground = false;
    this._toolbarHasOutput = false;
    this._toolbarIsHiddenTerminal = false;
    this._toolbarOutputExpanded = false;
    this._actionBarActions = new DisposableStore();
    this._outputSourceListener = this._register(new MutableDisposable());
    this._userToggledOutput = false;
    this._isInThinkingContainer = false;
    this._usesCollapsibleWrapper = false;
    this._elementIndex = context2.elementIndex;
    this._contentIndex = context2.contentIndex;
    this._sessionResource = context2.element.sessionResource;
    this._forceExpandTerminalOutput = isResponseVM(context2.element) && context2.element.isTerminalCommand;
    terminalData = migrateLegacyTerminalToolSpecificData(terminalData);
    this._terminalData = terminalData;
    this._terminalCommandUri = terminalData.terminalCommandUri ? URI.revive(terminalData.terminalCommandUri) : void 0;
    this._isSerializedInvocation = toolInvocation.kind === "toolInvocationSerialized";
    const elements = h(".chat-terminal-content-part@container", [
      h(".chat-terminal-content-title@title", [
        h(".chat-terminal-command-block@commandBlock")
      ]),
      h(".chat-terminal-content-message@message")
    ]);
    this._titleElement = elements.title;
    this._durationElement = h("span.chat-terminal-duration").root;
    hide(this._durationElement);
    elements.title.append(this._durationElement);
    const command4 = (terminalData.commandLine.forDisplay ?? terminalData.commandLine.userEdited ?? terminalData.commandLine.toolEdited ?? terminalData.commandLine.original).trimStart();
    this._commandText = command4;
    this._terminalOutputContextKey = ChatContextKeys.inChatTerminalToolOutput.bindTo(this._contextKeyService);
    this._decoration = this._register(this._instantiationService.createInstance(TerminalCommandDecoration, {
      terminalData: this._terminalData,
      getCommandBlock: () => elements.commandBlock,
      getIconElement: () => void 0,
      getResolvedCommand: () => this._getResolvedCommand(),
      getIsRunning: () => this._isInvocationRunning(),
      getExitCode: () => this._outputSource?.exitCode
    }));
    const displayCommand = terminalData.presentationOverrides?.commandLine ?? command4;
    const displayLanguage = terminalData.presentationOverrides?.language ?? terminalData.language;
    const titlePart = this._register(_instantiationService.createInstance(
      ChatQueryTitlePart,
      elements.commandBlock,
      new MarkdownString([
        `\`\`\`${displayLanguage}`,
        `${displayCommand.replaceAll("```", "\\`\\`\\`")}`,
        `\`\`\``
      ].join("\n"), { supportThemeIcons: true }),
      void 0
    ));
    this._register(titlePart.onDidChangeHeight(() => {
      this._refreshCommandStatus();
    }));
    this._outputView = this._register(this._instantiationService.createInstance(
      ChatTerminalToolOutputSection,
      () => this._ensureTerminalInstance(),
      () => this._getResolvedCommand(),
      () => this._outputSource,
      () => this._terminalData.terminalCommandOutput,
      () => this._commandText,
      () => this._terminalData.terminalTheme,
      () => this._isInvocationRunning(),
      !!this._terminalData.terminalToolSessionId
    ));
    if (this._terminalData.terminalToolSessionId || this._terminalData.terminalCommandOutput) {
      elements.container.append(this._outputView.domNode);
    }
    this._register(this._outputView.onDidFocus(() => this._handleOutputFocus()));
    this._register(this._outputView.onDidBlur((e4) => this._handleOutputBlur(e4)));
    this._register(toDisposable(() => this._handleDispose()));
    const actionBarEl = h(".chat-terminal-action-bar@actionBar");
    elements.title.append(actionBarEl.root);
    this._actionBar = this._register(new ActionBar(actionBarEl.actionBar));
    this._register(this._actionBarActions);
    let didInitializeTerminalActions = false;
    const initializeTerminalActionsOnce = () => {
      if (didInitializeTerminalActions || this._store.isDisposed) {
        return;
      }
      didInitializeTerminalActions = true;
      this._initializeTerminalActions();
    };
    initializeTerminalActionsOnce();
    this._terminalService.whenConnected.then(() => {
      initializeTerminalActionsOnce();
    });
    const terminalToolSessionId = this._terminalData.terminalToolSessionId;
    if (terminalToolSessionId) {
      if (this._terminalData.isPty === false) {
        this._attachOutputSource();
      }
    }
    let pastTenseMessage;
    if (toolInvocation.pastTenseMessage) {
      pastTenseMessage = `${typeof toolInvocation.pastTenseMessage === "string" ? toolInvocation.pastTenseMessage : toolInvocation.pastTenseMessage.value}`;
    }
    const markdownContent = new MarkdownString(pastTenseMessage, {
      supportThemeIcons: true,
      isTrusted: isMarkdownString(toolInvocation.pastTenseMessage) ? toolInvocation.pastTenseMessage.isTrusted : false
    });
    const chatMarkdownContent = {
      kind: "markdownContent",
      content: markdownContent
    };
    const codeBlockRenderOptions = {
      hideToolbar: true,
      reserveWidth: 19,
      verticalPadding: 5,
      editorOptions: {
        wordWrap: "on"
      }
    };
    const markdownOptions = {
      codeBlockRenderOptions,
      accessibilityOptions: pastTenseMessage ? {
        statusMessage: localize(12283, null, stripIcons(pastTenseMessage))
      } : void 0
    };
    this.markdownPart = this._register(_instantiationService.createInstance(ChatMarkdownContentPart, chatMarkdownContent, context2, editorPool, false, codeBlockStartIndex, renderer, {}, currentWidthDelegate(), markdownOptions));
    elements.message.append(this.markdownPart.domNode);
    const progressPart = this._register(_instantiationService.createInstance(ChatProgressSubPart, elements.container, this.getIcon(), terminalData.autoApproveInfo));
    progressPart.domNode.classList.add("chat-terminal-progress-row");
    this._refreshCommandStatus();
    if (toolInvocation.kind === "toolInvocation") {
      this._register(autorun((reader) => {
        toolInvocation.state.read(reader);
        this._refreshCommandStatus();
      }));
    }
    const terminalToolsInThinking = this._configurationService.getValue("chat.agent.thinking.terminalTools" /* TerminalToolsInThinking */);
    const isSimpleTerminal = this._configurationService.getValue("chat.tools.terminal.simpleCollapsible" /* SimpleTerminalCollapsible */);
    const requiresConfirmation = toolInvocation.kind === "toolInvocation" && IChatToolInvocation.getConfirmationMessages(toolInvocation);
    this._isInThinkingContainer = terminalToolsInThinking && !requiresConfirmation;
    this._usesCollapsibleWrapper = this._isInThinkingContainer || isSimpleTerminal;
    if (this._usesCollapsibleWrapper) {
      this.domNode = this._createCollapsibleWrapper(progressPart.domNode, displayCommand, toolInvocation, context2);
    } else {
      this.domNode = progressPart.domNode;
    }
    this._renderImagePills(toolInvocation, context2, elements.container);
    const hasStoredOutput = !!terminalData.terminalCommandOutput;
    const storedExpandedState = expandedStateByInvocation.get(toolInvocation);
    const hasStoredExpandedState = expandedStateByInvocation.has(toolInvocation);
    if (storedExpandedState || !hasStoredExpandedState && this._forceExpandTerminalOutput || this._isInThinkingContainer && IChatToolInvocation.isComplete(toolInvocation) && hasStoredOutput) {
      void this._toggleOutput(true);
    }
    this._register(this._terminalChatService.registerProgressPart(this));
  }
  get codeblocks() {
    return this.markdownPart?.codeblocks ?? [];
  }
  get elementIndex() {
    return this._elementIndex;
  }
  get contentIndex() {
    return this._contentIndex;
  }
  get terminalToolSessionId() {
    return this._terminalData.terminalToolSessionId;
  }
  /**
   * Renders image attachment pills below the terminal output when the tool
   * result contains image data parts. For collapsible wrappers, the single
   * widget is reparented between inside/outside based on expanded state.
   */
  _renderImagePills(toolInvocation, context2, innerContainer) {
    const renderImages = () => {
      const extracted = extractImagesFromToolInvocationOutputDetails(toolInvocation, context2.element.sessionResource);
      const imageParts = extracted.map((img) => ({
        kind: "data",
        value: img.data.buffer,
        mimeType: img.mimeType,
        uri: img.uri
      }));
      if (imageParts.length === 0) {
        return;
      }
      const widget = this._register(this._instantiationService.createInstance(ChatResourceGroupWidget, imageParts, void 0));
      if (this._thinkingCollapsibleWrapper) {
        const wrapper = this._thinkingCollapsibleWrapper;
        const placeWidget = (expanded2) => {
          if (expanded2) {
            innerContainer.appendChild(widget.domNode);
          } else {
            wrapper.domNode.appendChild(widget.domNode);
          }
        };
        placeWidget(wrapper.expanded.get());
        this._register(autorun((reader) => {
          placeWidget(wrapper.expanded.read(reader));
        }));
      } else {
        innerContainer.appendChild(widget.domNode);
      }
    };
    if (toolInvocation.kind === "toolInvocationSerialized") {
      renderImages();
    } else {
      this._register(autorun((reader) => {
        const state = toolInvocation.state.read(reader);
        if (state.type === IChatToolInvocation.StateKind.Completed) {
          renderImages();
        }
      }));
    }
  }
  _createCollapsibleWrapper(contentElement, commandText, toolInvocation, context2) {
    const truncatedCommand = commandText.length > MAX_COMMAND_TITLE_LENGTH ? commandText.substring(0, MAX_COMMAND_TITLE_LENGTH) + "..." : commandText;
    const toolInvocationComplete = IChatToolInvocation.isComplete(toolInvocation);
    const isRunningInBackground = toolInvocationComplete && this._isInvocationRunning();
    const isComplete = toolInvocationComplete && !isRunningInBackground;
    const isSkipped = IChatToolInvocation.executionConfirmedOrDenied(toolInvocation)?.type === 5 /* Skipped */;
    const autoExpandFailures = this._configurationService.getValue("chat.tools.autoExpandFailures" /* AutoExpandToolFailures */);
    const hasError = autoExpandFailures && this._terminalData.terminalCommandState?.exitCode !== void 0 && this._terminalData.terminalCommandState.exitCode !== 0;
    const initialExpanded = !isComplete || hasError || this._forceExpandTerminalOutput;
    const wrapper = this._register(this._instantiationService.createInstance(
      ChatTerminalThinkingCollapsibleWrapper,
      truncatedCommand,
      this._terminalData.intention,
      this._terminalData.commandLine.isSandboxWrapped === true,
      contentElement,
      context2,
      initialExpanded,
      isComplete,
      isSkipped,
      isRunningInBackground,
      this._terminalData.isPty === false ? void 0 : () => this.focusTerminal()
    ));
    this._thinkingCollapsibleWrapper = wrapper;
    let isFirstRun = true;
    this._register(autorun((r2) => {
      const expanded2 = wrapper.expanded.read(r2);
      if (isFirstRun) {
        isFirstRun = false;
        return;
      }
      this._toggleOutput(expanded2);
    }));
    return wrapper.domNode;
  }
  expandCollapsibleWrapper() {
    this._thinkingCollapsibleWrapper?.expand();
  }
  markCollapsibleWrapperComplete() {
    this._thinkingCollapsibleWrapper?.markComplete();
  }
  async _initializeTerminalActions() {
    if (this._store.isDisposed) {
      return;
    }
    const terminalToolSessionId = this._terminalData.terminalToolSessionId;
    if (!terminalToolSessionId) {
      this._updateToolbarContextKeys();
      return;
    }
    if (this._terminalData.isPty === false) {
      this._attachOutputSource();
      this._updateToolbarContextKeys(void 0, terminalToolSessionId);
      return;
    }
    const attachInstance = async (instance2) => {
      if (this._store.isDisposed) {
        return;
      }
      if (!instance2) {
        if (this._isSerializedInvocation) {
          this._clearCommandAssociation();
        }
        this._updateToolbarContextKeys(void 0, terminalToolSessionId);
        return;
      }
      const isNewInstance = this._terminalInstance !== instance2;
      if (isNewInstance) {
        this._terminalInstance = instance2;
        this._registerInstanceListener(instance2);
      }
      this._updateToolbarContextKeys(instance2, terminalToolSessionId);
    };
    const initialInstance = await this._terminalChatService.getTerminalInstanceByToolSessionId(terminalToolSessionId);
    await attachInstance(initialInstance);
    if (!initialInstance) {
      this._updateToolbarContextKeys(void 0, terminalToolSessionId);
    }
    if (this._store.isDisposed) {
      return;
    }
    if (!this._terminalSessionRegistration) {
      const listener = this._terminalChatService.onDidRegisterTerminalInstanceWithToolSession(async (instance2) => {
        const registeredInstance = await this._terminalChatService.getTerminalInstanceByToolSessionId(terminalToolSessionId);
        if (instance2 !== registeredInstance) {
          return;
        }
        this._terminalSessionRegistration?.dispose();
        this._terminalSessionRegistration = void 0;
        await attachInstance(instance2);
      });
      this._terminalSessionRegistration = this._store.add(listener);
    }
  }
  /**
   * Updates the scoped context keys that drive toolbar action visibility.
   * The ActionBar is rebuilt with the correct set of visible actions.
   */
  _updateToolbarContextKeys(terminalInstance, terminalToolSessionId) {
    if (this._store.isDisposed) {
      return;
    }
    const resolvedCommand = this._getResolvedCommand(terminalInstance);
    this._toolbarHasInstance = !!terminalInstance;
    if (terminalInstance && terminalToolSessionId) {
      this._toolbarIsHiddenTerminal = this._terminalChatService.isBackgroundTerminal(terminalToolSessionId);
    } else {
      this._toolbarIsHiddenTerminal = false;
    }
    if (terminalInstance && terminalToolSessionId && !this._terminalData.isBackground && !this._terminalData.didContinueInBackground) {
      const isStillRunning = resolvedCommand?.exitCode === void 0 && this._terminalData.terminalCommandState?.exitCode === void 0;
      this._toolbarCanContinueInBackground = isStillRunning;
    } else {
      this._toolbarCanContinueInBackground = false;
    }
    if (!this._usesCollapsibleWrapper) {
      const hasSnapshot = !!this._terminalData.terminalCommandOutput || !!this._outputSource?.output;
      const hasOutput = !!resolvedCommand || hasSnapshot;
      this._toolbarHasOutput = hasOutput;
      if (hasOutput && !this._outputView.isExpanded) {
        const autoExpandFailures = this._configurationService.getValue("chat.tools.autoExpandFailures" /* AutoExpandToolFailures */);
        const exitCode = resolvedCommand?.exitCode ?? this._outputSource?.exitCode ?? this._terminalData.terminalCommandState?.exitCode;
        if (exitCode !== void 0 && exitCode !== 0 && autoExpandFailures) {
          this._toggleOutput(true);
        }
      }
    }
    this._updateToolbarActions();
    this._refreshCommandStatus(resolvedCommand);
  }
  _refreshCommandStatus(command4) {
    this._decoration.update(command4);
    const duration = command4?.duration ?? this._terminalData.terminalCommandState?.duration;
    if (!isNumber(duration) || duration < 0 || this._isInvocationRunning()) {
      hide(this._durationElement);
      return;
    }
    this._durationElement.textContent = formatTerminalDuration(duration);
    show(this._durationElement);
  }
  /**
   * Rebuilds the ActionBar actions based on current toolbar state.
   */
  _updateToolbarActions() {
    if (!this._actionBar || this._store.isDisposed) {
      return;
    }
    this._actionBar.clear();
    this._actionBarActions.clear();
    const actions = [];
    if (this._toolbarCanContinueInBackground) {
      const action = new Action(
        TerminalContribCommandId.ContinueInBackground,
        localize(12278, null),
        ThemeIcon.asClassName(Codicon.debugContinueSmall),
        true,
        () => this.continueInBackground()
      );
      this._actionBarActions.add(action);
      actions.push(action);
    }
    if (this._toolbarHasInstance) {
      const focusLabel = this._toolbarIsHiddenTerminal ? localize(12281, null) : localize(12279, null);
      const action = new Action(
        TerminalContribCommandId.FocusChatInstanceAction,
        focusLabel,
        ThemeIcon.asClassName(Codicon.openInProduct),
        true,
        () => this.focusTerminal()
      );
      this._actionBarActions.add(action);
      actions.push(action);
    }
    if (this._toolbarHasOutput && !this._usesCollapsibleWrapper) {
      const toggleIcon = this._toolbarOutputExpanded ? Codicon.chevronDown : Codicon.chevronRight;
      const toggleLabel = this._toolbarOutputExpanded ? localize(12280, null) : localize(12282, null);
      const action = new Action(
        TerminalContribCommandId.ToggleChatTerminalOutput,
        toggleLabel,
        ThemeIcon.asClassName(toggleIcon),
        true,
        () => this.toggleOutputFromAction()
      );
      this._actionBarActions.add(action);
      actions.push(action);
    }
    this._actionBar.push(actions, { icon: true, label: false });
  }
  _getResolvedCommand(instance2) {
    const target = instance2 ?? this._terminalInstance;
    if (!target) {
      return void 0;
    }
    return this._resolveCommand(target);
  }
  _isInvocationRunning() {
    const currentTerminalData = this.toolInvocation.toolSpecificData?.kind === "terminal" ? migrateLegacyTerminalToolSpecificData(this.toolInvocation.toolSpecificData) : this._terminalData;
    if (currentTerminalData.isPty === false) {
      if (this._outputSource?.exitCode !== void 0 || currentTerminalData.terminalCommandState?.exitCode !== void 0) {
        return false;
      }
      if (!IChatToolInvocation.isComplete(this.toolInvocation)) {
        return true;
      }
      return currentTerminalData.isBackground === true || currentTerminalData.didContinueInBackground === true;
    }
    const commandExitCode = this._getResolvedCommand()?.exitCode;
    if (commandExitCode !== void 0) {
      return false;
    }
    const storedExitCode = currentTerminalData.terminalCommandState?.exitCode;
    if (storedExitCode !== void 0) {
      return false;
    }
    if (!IChatToolInvocation.isComplete(this.toolInvocation)) {
      return true;
    }
    return currentTerminalData.isBackground === true || currentTerminalData.didContinueInBackground === true;
  }
  _clearCommandAssociation(options3) {
    this._terminalCommandUri = void 0;
    if (options3?.clearPersistentData) {
      if (this._terminalData.terminalCommandUri) {
        delete this._terminalData.terminalCommandUri;
      }
      if (this._terminalData.terminalToolSessionId) {
        delete this._terminalData.terminalToolSessionId;
      }
    }
    this._refreshCommandStatus();
  }
  /**
   * Determines whether the terminal output should auto-expand.
   * Returns false if already expanded, user has manually toggled, component is disposed,
   * or if the invocation was previously expanded (to preserve state across re-renders).
   */
  _shouldAutoExpand() {
    return !this._outputView.isExpanded && !this._userToggledOutput && !this._store.isDisposed && (!this._forceExpandTerminalOutput || !expandedStateByInvocation.has(this.toolInvocation)) && !expandedStateByInvocation.get(this.toolInvocation);
  }
  /**
   * Registers event listeners on the terminal instance to track command execution,
   * manage auto-expansion of output, and handle command completion.
   *
   * This method sets up:
   * - Command detection listeners for tracking command lifecycle
   * - Auto-expand logic based on command output and duration
   * - Instance disposal handling to clean up actions and state
   */
  _registerInstanceListener(terminalInstance) {
    const commandDetectionListener = this._register(new MutableDisposable());
    const tryResolveCommand = async () => {
      const resolvedCommand = this._resolveCommand(terminalInstance);
      this._updateToolbarContextKeys(terminalInstance, this._terminalData.terminalToolSessionId);
      return resolvedCommand;
    };
    const attachCommandDetection = async (commandDetection) => {
      commandDetectionListener.clear();
      if (!commandDetection) {
        const ahpSource = this._terminalData.terminalToolSessionId ? this._terminalChatService.getAhpCommandSource(this._terminalData.terminalToolSessionId) : void 0;
        if (ahpSource) {
          this._attachAhpCommandSource(terminalInstance, ahpSource, commandDetectionListener);
        }
        await tryResolveCommand();
        return;
      }
      const store = new DisposableStore();
      let receivedDataCount = 0;
      const hasRealOutput = () => {
        if (this._terminalData.terminalCommandOutput?.text?.trim()) {
          return true;
        }
        const command4 = this._getResolvedCommand(terminalInstance);
        if (!command4?.executedMarker || terminalInstance.isDisposed) {
          return false;
        }
        const buffer = terminalInstance.xterm?.raw.buffer.active;
        if (!buffer) {
          return false;
        }
        const cursorLine = buffer.baseY + buffer.cursorY;
        if (cursorLine > command4.executedMarker.line) {
          return true;
        }
        return receivedDataCount > MIN_DATA_EVENTS_FOR_REAL_OUTPUT;
      };
      const autoExpand = store.add(new TerminalToolAutoExpand({
        onCommandExecuted: Event2.map(commandDetection.onCommandExecuted, () => void 0),
        onCommandFinished: Event2.map(commandDetection.onCommandFinished, () => void 0),
        onWillData: terminalInstance.onWillData,
        shouldAutoExpand: () => this._shouldAutoExpand(),
        hasRealOutput
      }));
      store.add(autoExpand.onDidRequestExpand(() => {
        if (this._usesCollapsibleWrapper) {
          this.expandCollapsibleWrapper();
        }
        this._toggleOutput(true);
      }));
      store.add(terminalInstance.onWillData(() => {
        receivedDataCount++;
      }));
      store.add(commandDetection.onCommandExecuted(() => {
        this._updateToolbarContextKeys(terminalInstance, this._terminalData.terminalToolSessionId);
      }));
      store.add(commandDetection.onCommandFinished(() => {
        this._updateToolbarContextKeys(terminalInstance, this._terminalData.terminalToolSessionId);
        const resolvedCommand = this._getResolvedCommand(terminalInstance);
        this._handleCommandCompletion(resolvedCommand);
        if (resolvedCommand?.endMarker) {
          commandDetectionListener.clear();
        }
      }));
      commandDetectionListener.value = store;
      const resolvedImmediately = await tryResolveCommand();
      if (resolvedImmediately?.endMarker) {
        commandDetectionListener.clear();
        this._handleCommandCompletion(resolvedImmediately);
        return;
      }
    };
    attachCommandDetection(terminalInstance.capabilities.get(2 /* CommandDetection */));
    this._register(terminalInstance.capabilities.onDidAddCommandDetectionCapability((cd) => attachCommandDetection(cd)));
    const instanceListener = this._register(terminalInstance.onDisposed(() => {
      if (this._terminalInstance === terminalInstance) {
        this._terminalInstance = void 0;
      }
      this._clearCommandAssociation({ clearPersistentData: true });
      commandDetectionListener.clear();
      this._updateToolbarContextKeys(void 0, this._terminalData.terminalToolSessionId);
      instanceListener.dispose();
    }));
  }
  /**
   * Sets up listeners using an {@link IAhpTerminalCommandSource} when no local
   * `ICommandDetectionCapability` is available. Provides auto-expand, toolbar
   * context key updates, and command completion handling.
   */
  _attachAhpCommandSource(terminalInstance, ahpSource, commandDetectionListener) {
    const store = new DisposableStore();
    const hasRealOutput = () => {
      const command4 = this._getResolvedCommand(terminalInstance);
      if (command4?.hasOutput()) {
        return true;
      }
      return !!this._terminalData.terminalCommandOutput?.text?.trim();
    };
    const autoExpand = store.add(new TerminalToolAutoExpand({
      onCommandExecuted: Event2.map(ahpSource.onCommandExecuted, () => void 0),
      onCommandFinished: Event2.map(ahpSource.onCommandFinished, () => void 0),
      onWillData: terminalInstance.onWillData,
      shouldAutoExpand: () => this._shouldAutoExpand(),
      hasRealOutput
    }));
    store.add(autoExpand.onDidRequestExpand(() => {
      if (this._usesCollapsibleWrapper) {
        this.expandCollapsibleWrapper();
      }
      this._toggleOutput(true);
    }));
    store.add(ahpSource.onCommandExecuted((cmd) => {
      if (!this._terminalData.terminalCommandId && cmd.id) {
        this._terminalData.terminalCommandId = cmd.id;
        this._updateToolbarContextKeys(terminalInstance, this._terminalData.terminalToolSessionId);
      }
      if (this._outputView.isExpanded) {
        void this._toggleOutput(true);
      }
    }));
    store.add(ahpSource.onCommandFinished((cmd) => {
      if (this._terminalData.terminalCommandId === cmd.id) {
        this._updateToolbarContextKeys(terminalInstance, this._terminalData.terminalToolSessionId);
        const resolvedCommand2 = this._getResolvedCommand(terminalInstance);
        this._handleCommandCompletion(resolvedCommand2);
      }
    }));
    commandDetectionListener.value = store;
    const resolvedCommand = this._resolveCommand(terminalInstance);
    if (resolvedCommand?.endMarker) {
      this._handleCommandCompletion(resolvedCommand);
    }
  }
  /**
   * Handles the completion of a terminal command by updating the UI state.
   * This includes marking the collapsible wrapper as complete, auto-collapsing
   * successful commands, and keeping failed commands expanded.
   *
   * @param resolvedCommand The completed terminal command with exit code information.
   */
  _handleCommandCompletion(resolvedCommand) {
    this.markCollapsibleWrapperComplete();
    this._refreshCommandStatus(resolvedCommand);
    if (resolvedCommand?.exitCode === 0 && this._outputView.isExpanded && !this._userToggledOutput && !this._forceExpandTerminalOutput) {
      this._toggleOutput(false);
    }
    const autoExpandFailures = this._configurationService.getValue("chat.tools.autoExpandFailures" /* AutoExpandToolFailures */);
    if (autoExpandFailures && resolvedCommand?.exitCode !== void 0 && resolvedCommand.exitCode !== 0 && this._thinkingCollapsibleWrapper) {
      this.expandCollapsibleWrapper();
    }
  }
  async _toggleOutput(expanded2) {
    const didChange = await this._outputView.toggle(expanded2);
    const isExpanded = this._outputView.isExpanded;
    const hasOutputSection = !!this._outputView.domNode.parentElement;
    this._titleElement.classList.toggle("chat-terminal-content-title-no-bottom-radius", isExpanded && hasOutputSection);
    this._toolbarOutputExpanded = isExpanded;
    this._updateToolbarActions();
    if (didChange) {
      expandedStateByInvocation.set(this.toolInvocation, isExpanded);
    }
    return didChange;
  }
  async _ensureTerminalInstance() {
    if (this._terminalData.isPty === false) {
      return void 0;
    }
    if (this._terminalInstance?.isDisposed) {
      this._terminalInstance = void 0;
    }
    if (!this._terminalInstance && this._terminalData.terminalToolSessionId) {
      this._terminalInstance = await this._terminalChatService.getTerminalInstanceByToolSessionId(this._terminalData.terminalToolSessionId);
      if (this._terminalInstance?.isDisposed) {
        this._terminalInstance = void 0;
      }
    }
    return this._terminalInstance;
  }
  didRegisterOutputSource(terminalToolSessionId) {
    if (this._terminalData.isPty === false && this._terminalData.terminalToolSessionId === terminalToolSessionId) {
      this._attachOutputSource();
    }
  }
  _attachOutputSource() {
    const source = this._terminalChatService.getOutputSource(this._terminalData.terminalToolSessionId);
    if (!source || source === this._outputSource) {
      return;
    }
    this._outputSource = source;
    const store = new DisposableStore();
    const onCommandExecuted = store.add(new Emitter());
    const onCommandFinished = store.add(new Emitter());
    const autoExpand = store.add(new TerminalToolAutoExpand({
      onCommandExecuted: onCommandExecuted.event,
      onCommandFinished: onCommandFinished.event,
      onWillData: source.onDidChange,
      shouldAutoExpand: () => this._shouldAutoExpand(),
      hasRealOutput: () => !!source.output
    }));
    store.add(autoExpand.onDidRequestExpand(() => {
      if (this._usesCollapsibleWrapper) {
        this.expandCollapsibleWrapper();
      }
      void this._toggleOutput(true);
    }));
    store.add(source.onDidChange(() => {
      this._refreshCommandStatus();
      this._updateToolbarContextKeys(void 0, this._terminalData.terminalToolSessionId);
      void this._outputView.refresh();
      if (source.hasExited) {
        onCommandFinished.fire();
        this.markCollapsibleWrapperComplete();
      }
    }));
    this._outputSourceListener.value = store;
    onCommandExecuted.fire();
    if (source.hasExited) {
      onCommandFinished.fire();
    }
    this._refreshCommandStatus();
    this._updateToolbarContextKeys(void 0, this._terminalData.terminalToolSessionId);
    void this._outputView.refresh();
  }
  _handleOutputFocus() {
    this._terminalOutputContextKey.set(true);
    this._terminalChatService.setFocusedProgressPart(this);
    this._outputView.updateAriaLabel();
  }
  _handleOutputBlur(event) {
    const nextTarget = event.relatedTarget;
    if (this._outputView.containsElement(nextTarget)) {
      return;
    }
    this._terminalOutputContextKey.reset();
    this._terminalChatService.clearFocusedProgressPart(this);
  }
  _handleDispose() {
    this._terminalOutputContextKey.reset();
    this._terminalChatService.clearFocusedProgressPart(this);
  }
  getCommandAndOutputAsText() {
    return this._outputView.getCommandAndOutputAsText();
  }
  focusOutput() {
    this._outputView.focus();
  }
  _focusChatInput() {
    const widget = this._chatWidgetService.getWidgetBySessionResource(this._sessionResource);
    widget?.focusInput();
  }
  async focusTerminal() {
    if (this._terminalData.isPty === false) {
      return;
    }
    const instance2 = await this._ensureTerminalInstance();
    let target = "none";
    let location2 = "panel";
    if (instance2) {
      target = "instance";
      location2 = instance2.target === 2 /* Editor */ ? "editor" : "panel";
    } else if (this._terminalCommandUri) {
      target = "commandUri";
    }
    this._telemetryService.publicLog2("terminal/chatFocusInstance", { target, location: location2 });
    if (instance2) {
      this._terminalService.setActiveInstance(instance2);
      if (instance2.target === 2 /* Editor */) {
        this._terminalEditorService.openEditor(instance2);
      } else {
        await this._terminalGroupService.showPanel(true);
      }
      this._terminalService.setActiveInstance(instance2);
      await instance2.focusWhenReady(true);
      const command4 = this._getResolvedCommand(instance2);
      if (command4) {
        instance2.xterm?.markTracker.revealCommand(command4);
      }
      return;
    }
    if (this._terminalCommandUri) {
      this._terminalService.openResource(this._terminalCommandUri);
    }
  }
  continueInBackground() {
    const sessionId = this._terminalData.terminalToolSessionId;
    if (sessionId) {
      this._terminalChatService.continueInBackground(sessionId);
    }
  }
  markContinuedInBackground() {
    this._terminalData.didContinueInBackground = true;
    this._toolbarCanContinueInBackground = false;
    this._updateToolbarActions();
  }
  async toggleOutputFromAction() {
    this._userToggledOutput = true;
    this._telemetryService.publicLog2("terminal/chatToggleOutput", {
      previousExpanded: this._outputView.isExpanded
    });
    if (!this._outputView.isExpanded) {
      await this._toggleOutput(true);
      return;
    }
    await this._toggleOutput(false);
  }
  async toggleOutputFromKeyboard() {
    this._userToggledOutput = true;
    if (!this._outputView.isExpanded) {
      await this._toggleOutput(true);
      this.focusOutput();
      return;
    }
    await this._collapseOutputAndFocusInput();
  }
  async _collapseOutputAndFocusInput() {
    if (this._outputView.isExpanded) {
      await this._toggleOutput(false);
    }
    this._focusChatInput();
  }
  _resolveCommand(instance2) {
    if (instance2.isDisposed) {
      return void 0;
    }
    const targetId = this._terminalData.terminalCommandId;
    const commandDetection = instance2.capabilities.get(2 /* CommandDetection */);
    if (commandDetection && targetId) {
      const commands = commandDetection.commands;
      if (commands && commands.length > 0) {
        const fromHistory = commands.find((c) => c.id === targetId);
        if (fromHistory) {
          return fromHistory;
        }
      }
      const executing = commandDetection.executingCommandObject;
      if (executing && executing.id === targetId) {
        return executing;
      }
    }
    const sessionId = this._terminalData.terminalToolSessionId;
    if (sessionId) {
      const ahpSource = this._terminalChatService.getAhpCommandSource(sessionId);
      if (ahpSource) {
        if (targetId) {
          return ahpSource.getCommandById(targetId);
        }
        return ahpSource.executingCommandObject ?? ahpSource.commands[ahpSource.commands.length - 1];
      }
    }
    return void 0;
  }
};

ChatTerminalToolProgressPart = __decorateClass([
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, ITerminalChatService),
  __decorateParam(9, ITerminalService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IChatWidgetService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, ITerminalEditorService),
  __decorateParam(14, ITerminalGroupService),
  __decorateParam(15, ITelemetryService)
], ChatTerminalToolProgressPart);

var ChatTerminalToolOutputSection = class extends Disposable {
  constructor(_ensureTerminalInstance, _resolveCommand, _getOutputSource, _getTerminalCommandOutput, _getCommandText, _getStoredTheme, _isInvocationRunning, _hasTerminalSession, _accessibleViewService, _instantiationService, _terminalConfigurationService, _contextKeyService) {
    super();
    this._ensureTerminalInstance = _ensureTerminalInstance;
    this._resolveCommand = _resolveCommand;
    this._getOutputSource = _getOutputSource;
    this._getTerminalCommandOutput = _getTerminalCommandOutput;
    this._getCommandText = _getCommandText;
    this._getStoredTheme = _getStoredTheme;
    this._isInvocationRunning = _isInvocationRunning;
    this._hasTerminalSession = _hasTerminalSession;
    this._accessibleViewService = _accessibleViewService;
    this._instantiationService = _instantiationService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._contextKeyService = _contextKeyService;
    this._isAtBottom = true;
    this._isProgrammaticScroll = false;
    this._onDidFocusEmitter = this._register(new Emitter());
    this._onDidBlurEmitter = this._register(new Emitter());
    const containerElements = h(".chat-terminal-output-container@container", [
      h(".chat-terminal-output-body@body", [
        h(".chat-terminal-output-content@content", [
          h(".chat-terminal-output-terminal@terminal"),
          h(".chat-terminal-output-empty@empty")
        ])
      ])
    ]);
    this.domNode = containerElements.container;
    this.domNode.classList.add("collapsed");
    this._outputBody = containerElements.body;
    this._contentContainer = containerElements.content;
    this._terminalContainer = containerElements.terminal;
    this._emptyElement = containerElements.empty;
    this._contentContainer.appendChild(this._emptyElement);
    this._register(addDisposableListener(this.domNode, EventType.FOCUS_IN, () => this._onDidFocusEmitter.fire()));
    this._register(addDisposableListener(this.domNode, EventType.FOCUS_OUT, (event) => this._onDidBlurEmitter.fire(event)));
    const resizeObserver = this._register(new DisposableResizeObserver("ChatTerminalToolProgressPart.handleResize", () => this._handleResize()));
    this._register(resizeObserver.observe(this.domNode));
    const backgroundColor = ChatContextKeys.inChatEditor.getValue(this._contextKeyService) ? editorBackground : PANEL_BACKGROUND;
    this.domNode.style.backgroundColor = asCssVariable(backgroundColor);
  }
  get isExpanded() {
    return this.domNode.classList.contains("expanded");
  }
  get onDidFocus() {
    return this._onDidFocusEmitter.event;
  }
  get onDidBlur() {
    return this._onDidBlurEmitter.event;
  }
  async toggle(expanded2) {
    const currentlyExpanded = this.isExpanded;
    if (expanded2 === currentlyExpanded) {
      if (expanded2) {
        await this._updateTerminalContent();
      }
      return false;
    }
    if (!expanded2) {
      this._setExpanded(false);
      this._isAtBottom = true;
      return true;
    }
    if (!this._scrollableContainer) {
      await this._createScrollableContainer();
    }
    await this._updateTerminalContent();
    this._setExpanded(true);
    await this._layoutMirrorWidth();
    this._layoutOutput();
    this._scrollOutputToBottom();
    this._scheduleOutputRelayout();
    return true;
  }
  async refresh() {
    if (this.isExpanded) {
      await this._updateTerminalContent();
    }
  }
  focus() {
    this._scrollableContainer?.getDomNode().focus();
  }
  containsElement(element) {
    return !!element && this.domNode.contains(element);
  }
  updateAriaLabel() {
    if (!this._scrollableContainer) {
      return;
    }
    const command4 = this._resolveCommand();
    const commandText = command4?.command ?? this._getCommandText();
    if (!commandText) {
      return;
    }
    const ariaLabel = localize(12275, null, commandText);
    const scrollableDomNode = this._scrollableContainer.getDomNode();
    scrollableDomNode.setAttribute("role", "region");
    const accessibleViewHint = this._accessibleViewService.getOpenAriaHint("accessibility.verbosity.terminalChatOutput" /* TerminalChatOutput */);
    const label3 = accessibleViewHint ? ariaLabel + ", " + accessibleViewHint : ariaLabel;
    scrollableDomNode.setAttribute("aria-label", label3);
  }
  getCommandAndOutputAsText() {
    const command4 = this._resolveCommand();
    const commandText = command4?.command ?? this._getCommandText();
    if (!commandText) {
      return void 0;
    }
    const commandHeader = localize(12274, null, commandText);
    if (command4) {
      const rawOutput = command4.getOutput();
      if (!rawOutput || rawOutput.trim().length === 0) {
        return `${commandHeader}
${localize(12272, null)}`;
      }
      const lines = rawOutput.split("\n");
      return `${commandHeader}
${lines.join("\n").trimEnd()}`;
    }
    const source = this._getOutputSource();
    const snapshot = source ? { text: source.output } : this._getTerminalCommandOutput();
    if (!snapshot) {
      return `${commandHeader}
${localize(12277, null)}`;
    }
    const plain = removeAnsiEscapeCodes(snapshot.text ?? "");
    if (!plain.trim().length) {
      return `${commandHeader}
${localize(12272, null)}`;
    }
    let outputText = plain.trimEnd();
    if (snapshot.truncated) {
      outputText += `
${localize(12276, null)}`;
    }
    return `${commandHeader}
${outputText}`;
  }
  _setExpanded(expanded2) {
    this.domNode.classList.toggle("expanded", expanded2);
    this.domNode.classList.toggle("collapsed", !expanded2);
  }
  async _createScrollableContainer() {
    this._scrollableContainer = this._register(new DomScrollableElement(this._outputBody, {
      vertical: 2 /* Hidden */,
      horizontal: 2 /* Hidden */,
      handleMouseWheel: true
    }));
    const scrollableDomNode = this._scrollableContainer.getDomNode();
    scrollableDomNode.tabIndex = 0;
    this.domNode.appendChild(scrollableDomNode);
    this.updateAriaLabel();
    this._register(addDisposableListener(this.domNode, EventType.MOUSE_ENTER, () => {
      this._scrollableContainer?.updateOptions({ horizontal: 1 /* Auto */ });
    }));
    this._register(addDisposableListener(this.domNode, EventType.MOUSE_LEAVE, () => {
      this._scrollableContainer?.updateOptions({ horizontal: 2 /* Hidden */ });
    }));
    this._register(addDisposableListener(this.domNode, EventType.FOCUS_IN, () => {
      this._scrollableContainer?.updateOptions({ horizontal: 1 /* Auto */ });
    }));
    this._register(addDisposableListener(this.domNode, EventType.FOCUS_OUT, () => {
      this._scrollableContainer?.updateOptions({ horizontal: 2 /* Hidden */ });
    }));
    this._register(this._scrollableContainer.onScroll(() => {
      if (this._isProgrammaticScroll) {
        return;
      }
      this._isAtBottom = this._computeIsAtBottom();
    }));
  }
  async _updateTerminalContent() {
    const outputSource = this._getOutputSource();
    if (outputSource) {
      this._disposeLiveMirror();
      if (outputSource.output) {
        await this._renderSnapshotOutput({ text: outputSource.output });
      } else if (!outputSource.hasExited) {
        this._hideEmptyMessage();
        this._layoutOutput(0);
      } else {
        this._showEmptyMessage(localize(12272, null));
        this._layoutOutput(0);
      }
      return;
    }
    const liveTerminalInstance = await this._resolveLiveTerminal();
    const command4 = liveTerminalInstance ? this._resolveCommand() : void 0;
    const snapshot = this._getTerminalCommandOutput();
    if (liveTerminalInstance && command4) {
      const handled = await this._renderLiveOutput(liveTerminalInstance, command4);
      if (handled) {
        return;
      }
    }
    this._disposeLiveMirror();
    if (snapshot) {
      await this._renderSnapshotOutput(snapshot);
      return;
    }
    if (!this._hasTerminalSession) {
      return;
    }
    if (this._isInvocationRunning()) {
      this._hideEmptyMessage();
      this._layoutOutput(0);
      return;
    }
    this._renderUnavailableMessage(liveTerminalInstance);
  }
  async _renderLiveOutput(liveTerminalInstance, command4) {
    if (this._mirror) {
      return true;
    }
    await liveTerminalInstance.xtermReadyPromise;
    if (this._store.isDisposed || liveTerminalInstance.isDisposed || !liveTerminalInstance.xterm) {
      this._disposeLiveMirror();
      return false;
    }
    const mirror = this._register(this._instantiationService.createInstance(DetachedTerminalCommandMirror, liveTerminalInstance.xterm, command4));
    this._mirror = mirror;
    this._register(mirror.onDidChangeRowHeight(() => this._handleMirrorRowHeightChange()));
    this._register(mirror.onDidUpdate((result2) => {
      if (result2.lineCount && result2.lineCount > 0) {
        this._hideEmptyMessage();
      }
      this._layoutOutput(result2.lineCount);
      if (this._isAtBottom) {
        this._scrollOutputToBottom();
      }
    }));
    this._register(mirror.onDidInput((data) => {
      if (!liveTerminalInstance.isDisposed) {
        liveTerminalInstance.sendText(data, false);
      }
    }));
    await mirror.attach(this._terminalContainer);
    await this._layoutMirrorWidth(mirror);
    let result = await mirror.renderCommand();
    let commandFinished = !!command4.endMarker;
    let hasOutput = result && result.lineCount && result.lineCount > 0;
    if (!hasOutput) {
      for (let retry2 = 0; retry2 < MAX_OUTPUT_POLL_RETRIES && !hasOutput; retry2++) {
        await timeout(OUTPUT_POLL_DELAY_MS);
        if (this._store.isDisposed) {
          return true;
        }
        result = await mirror.renderCommand();
        hasOutput = result && result.lineCount && result.lineCount > 0;
        commandFinished = !!command4.endMarker;
        if (commandFinished) {
          break;
        }
      }
    }
    if (!hasOutput) {
      if (commandFinished) {
        this._showEmptyMessage(localize(12272, null));
      }
    } else {
      this._hideEmptyMessage();
    }
    this._layoutOutput(result?.lineCount ?? 0);
    return true;
  }
  async _renderSnapshotOutput(snapshot) {
    if (this._snapshotMirror) {
      this._snapshotMirror.setOutput(snapshot);
      await this._layoutMirrorWidth(this._snapshotMirror);
      const result2 = await this._snapshotMirror.render();
      this._layoutOutput(result2?.lineCount ?? snapshot.lineCount ?? this._lastRenderedLineCount ?? 0);
      return;
    }
    if (this._store.isDisposed) {
      return;
    }
    clearNode(this._terminalContainer);
    this._snapshotMirror = this._register(this._instantiationService.createInstance(DetachedTerminalSnapshotMirror, snapshot, this._getStoredTheme));
    this._register(this._snapshotMirror.onDidChangeRowHeight(() => this._handleMirrorRowHeightChange()));
    await this._snapshotMirror.attach(this._terminalContainer);
    this._snapshotMirror.setOutput(snapshot);
    await this._layoutMirrorWidth(this._snapshotMirror);
    const result = await this._snapshotMirror.render();
    const hasText = !!snapshot.text && snapshot.text.length > 0;
    if (hasText) {
      this._hideEmptyMessage();
    } else {
      this._showEmptyMessage(localize(12272, null));
    }
    const lineCount = result?.lineCount ?? snapshot.lineCount ?? 0;
    this._layoutOutput(lineCount);
  }
  _renderUnavailableMessage(liveTerminalInstance) {
    clearNode(this._terminalContainer);
    this._lastRenderedLineCount = void 0;
    if (!liveTerminalInstance) {
      this._showEmptyMessage(localize(12273, null));
    } else {
      this._showEmptyMessage(localize(12271, null));
    }
  }
  async _resolveLiveTerminal() {
    const instance2 = await this._ensureTerminalInstance();
    return instance2 && !instance2.isDisposed ? instance2 : void 0;
  }
  _showEmptyMessage(message) {
    this._emptyElement.textContent = message;
    this._terminalContainer.classList.add("chat-terminal-output-terminal-no-output");
    this.domNode.classList.add("chat-terminal-output-container-no-output");
  }
  _hideEmptyMessage() {
    this._emptyElement.textContent = "";
    this._terminalContainer.classList.remove("chat-terminal-output-terminal-no-output");
    this.domNode.classList.remove("chat-terminal-output-container-no-output");
  }
  _disposeLiveMirror() {
    if (this._mirror) {
      this._mirror.dispose();
      this._mirror = void 0;
    }
  }
  _scheduleOutputRelayout() {
    getWindow(this.domNode).requestAnimationFrame(() => {
      this._layoutOutput();
      this._scrollOutputToBottom();
    });
  }
  /**
   * The mirror's painted cell metrics changed: the first render replaces the pre-render
   * font estimate, and later renders can reflect DPR changes. Re-run layout so the box
   * height and wrap width match what xterm actually painted.
   */
  _handleMirrorRowHeightChange() {
    void this._layoutMirrorWidth();
    this._layoutOutput();
  }
  _handleResize() {
    if (!this._scrollableContainer) {
      return;
    }
    if (this.isExpanded) {
      void this._layoutMirrorWidth();
      this._layoutOutput();
      this._scrollOutputToBottom();
    } else {
      this._scrollableContainer.scanDomNode();
    }
  }
  /**
   * Resizes the mirror's column count to fill the currently available width. No-op while the
   * width is unmeasurable (e.g. collapsed); the mirror keeps its current cols until the next
   * layout opportunity.
   */
  async _layoutMirrorWidth(mirror = this._snapshotMirror ?? this._mirror) {
    if (!mirror) {
      return;
    }
    const width2 = this._terminalContainer.clientWidth || this._outputBody.clientWidth || this.domNode.clientWidth || (this.domNode.parentElement?.clientWidth ?? 0);
    if (width2 <= 0) {
      return;
    }
    const result = await mirror.layout(width2);
    if (!this._store.isDisposed && result?.lineCount !== void 0) {
      this._layoutOutput(result.lineCount);
    }
  }
  _layoutOutput(lineCount) {
    if (!this._scrollableContainer) {
      return;
    }
    if (lineCount !== void 0) {
      this._lastRenderedLineCount = lineCount;
    } else {
      lineCount = this._lastRenderedLineCount;
    }
    this._scrollableContainer.scanDomNode();
    if (!this.isExpanded || lineCount === void 0) {
      return;
    }
    const scrollableDomNode = this._scrollableContainer.getDomNode();
    const rowHeight = this._computeRowHeightPx();
    const padding = this._getOutputPadding();
    let maxRows = MAX_OUTPUT_ROWS;
    const containerMaxHeight = Number.parseFloat(getComputedStyle(this.domNode).maxHeight);
    if (!Number.isNaN(containerMaxHeight)) {
      maxRows = Math.max(Math.min(maxRows, Math.floor((containerMaxHeight - padding) / rowHeight)), MIN_OUTPUT_ROWS);
    }
    const contentRows = Math.min(Math.max(lineCount, MIN_OUTPUT_ROWS), maxRows);
    scrollableDomNode.style.height = `${contentRows * rowHeight + padding}px`;
    this._scrollableContainer.scanDomNode();
  }
  _computeIsAtBottom() {
    if (!this._scrollableContainer) {
      return true;
    }
    const dimensions = this._scrollableContainer.getScrollDimensions();
    const scrollPosition = this._scrollableContainer.getScrollPosition();
    const threshold = 5;
    return scrollPosition.scrollTop >= dimensions.scrollHeight - dimensions.height - threshold;
  }
  _scrollOutputToBottom() {
    if (!this._scrollableContainer) {
      return;
    }
    this._isProgrammaticScroll = true;
    const dimensions = this._scrollableContainer.getScrollDimensions();
    this._scrollableContainer.setScrollPosition({ scrollTop: dimensions.scrollHeight });
    this._isProgrammaticScroll = false;
  }
  _getOutputPadding() {
    const style = getComputedStyle(this._outputBody);
    const paddingTop = Number.parseFloat(style.paddingTop || "0");
    const paddingBottom = Number.parseFloat(style.paddingBottom || "0");
    return paddingTop + paddingBottom;
  }
  _computeRowHeightPx() {
    const mirrorRowHeight = (this._snapshotMirror ?? this._mirror)?.getRowHeightPx();
    if (mirrorRowHeight !== void 0) {
      return mirrorRowHeight;
    }
    const window2 = getWindow(this.domNode);
    const font = this._terminalConfigurationService.getFont(window2);
    const hasCharHeight = isNumber(font.charHeight) && font.charHeight > 0;
    const hasFontSize = isNumber(font.fontSize) && font.fontSize > 0;
    const hasLineHeight = isNumber(font.lineHeight) && font.lineHeight > 0;
    const charHeight = (hasCharHeight ? font.charHeight : hasFontSize ? font.fontSize : 1) ?? 1;
    const lineHeight = hasLineHeight ? font.lineHeight : 1;
    const rowHeight = Math.ceil(charHeight * lineHeight);
    return Math.max(rowHeight, 1);
  }
};

ChatTerminalToolOutputSection = __decorateClass([
  __decorateParam(8, IAccessibleViewService),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, ITerminalConfigurationService),
  __decorateParam(11, IContextKeyService)
], ChatTerminalToolOutputSection);

var ChatTerminalThinkingCollapsibleWrapper = class extends ChatCollapsibleContentPart {
  constructor(commandText, intention, isSandboxWrapped, contentElement, context2, initialExpanded, isComplete, isSkipped, isRunningInBackground, onFocusTerminal, hoverService, configurationService) {
    const intentionText = intention && !isSkipped ? intention : void 0;
    const stateTitle = isSkipped ? localize(12268, null, commandText) : isRunningInBackground ? localize(12263, null, commandText) : isComplete ? localize(12258, null, commandText) : localize(12261, null, commandText);
    const title = intentionText ? isRunningInBackground ? `${intentionText} ${commandText}${localize(12255, null)}` : `${intentionText} ${commandText}` : stateTitle;
    super(title, context2, void 0, hoverService, configurationService);
    this._showLinkDisposables = this._register(new MutableDisposable());
    this._terminalContentElement = contentElement;
    this._commandText = commandText;
    this._intention = intentionText;
    this._isSandboxWrapped = isSandboxWrapped;
    this._isComplete = isComplete;
    this._isSkipped = isSkipped;
    this._isRunningInBackground = isRunningInBackground;
    this._onFocusTerminal = onFocusTerminal;
    this.domNode.classList.add("chat-terminal-thinking-collapsible");
    if (isComplete) {
      this.icon = Codicon.check;
    }
    this._setCodeFormattedTitle();
    this._updateShowLink();
    this.setExpanded(initialExpanded);
  }
  shouldAnimateContent() {
    return true;
  }
  _setCodeFormattedTitle() {
    if (!this._collapseButton) {
      return;
    }
    const labelElement = this._collapseButton.labelElement;
    labelElement.textContent = "";
    const suffixText = this._isSandboxWrapped ? this._isRunningInBackground ? localize(12265, null) : localize(12266, null) : this._isRunningInBackground ? localize(12255, null) : void 0;
    this.domNode.classList.toggle("chat-terminal-has-intention", !!this._intention);
    if (this._intention) {
      const row = $("span.chat-terminal-label-flex");
      const intentionElement = $("span.chat-terminal-intention");
      intentionElement.textContent = this._intention;
      const commandElement = $("span.chat-terminal-command");
      const codeElement2 = document.createElement("code");
      codeElement2.textContent = this._commandText;
      commandElement.appendChild(codeElement2);
      row.appendChild(intentionElement);
      row.appendChild(commandElement);
      if (suffixText) {
        const suffixElement = $("span.chat-terminal-label-suffix");
        suffixElement.textContent = suffixText;
        row.appendChild(suffixElement);
      }
      labelElement.appendChild(row);
      return;
    }
    const prefixText = this._isSandboxWrapped ? this._isSkipped ? localize(12270, null) : this._isComplete ? localize(12260, null) : localize(12264, null) : this._isSkipped ? localize(12269, null) : this._isComplete ? localize(12259, null) : localize(12262, null);
    labelElement.appendChild(document.createTextNode(prefixText));
    const codeElement = document.createElement("code");
    codeElement.textContent = this._commandText;
    labelElement.appendChild(codeElement);
    if (suffixText) {
      labelElement.appendChild(document.createTextNode(suffixText));
    }
  }
  _updateShowLink() {
    this._showLinkElement?.remove();
    this._showLinkElement = void 0;
    this._showLinkDisposables.value = void 0;
    if (!this._isRunningInBackground || !this._onFocusTerminal || !this._collapseButton) {
      return;
    }
    const labelElement = this._collapseButton.labelElement;
    const store = new DisposableStore();
    this._showLinkDisposables.value = store;
    const container2 = $("span.chat-terminal-show-link-container");
    container2.appendChild(document.createTextNode(" \u2014 "));
    const showLink = $("span.chat-terminal-show-link");
    showLink.textContent = localize(12267, null);
    showLink.role = "button";
    showLink.tabIndex = 0;
    store.add(addDisposableListener(showLink, EventType.CLICK, (e4) => {
      EventHelper.stop(e4, true);
      this._onFocusTerminal?.();
    }));
    store.add(addDisposableListener(showLink, EventType.KEY_DOWN, (e4) => {
      const keyboardEvent = new StandardKeyboardEvent(e4);
      if (keyboardEvent.equals(3 /* Enter */) || keyboardEvent.equals(10 /* Space */)) {
        EventHelper.stop(e4, true);
        this._onFocusTerminal?.();
      }
    }));
    container2.appendChild(showLink);
    labelElement.appendChild(container2);
    this._showLinkElement = container2;
  }
  markComplete() {
    if (this._isComplete) {
      return;
    }
    this._isComplete = true;
    this._isRunningInBackground = false;
    this.icon = Codicon.check;
    this._setCodeFormattedTitle();
    this._updateShowLink();
  }
  initContent() {
    const listWrapper = $(".chat-used-context-list.chat-terminal-thinking-content");
    listWrapper.appendChild(this._terminalContentElement);
    return listWrapper;
  }
  expand() {
    this.setExpanded(true);
  }
  hasSameContent(_other, _followingContent, _element) {
    return false;
  }
};

ChatTerminalThinkingCollapsibleWrapper = __decorateClass([
  __decorateParam(10, IHoverService),
  __decorateParam(11, IConfigurationService)
], ChatTerminalThinkingCollapsibleWrapper);
export { formatTerminalDuration, MIN_OUTPUT_ROWS, MAX_OUTPUT_ROWS, MAX_COMMAND_TITLE_LENGTH, MAX_OUTPUT_POLL_RETRIES, OUTPUT_POLL_DELAY_MS, MIN_DATA_EVENTS_FOR_REAL_OUTPUT, expandedStateByInvocation, TerminalCommandDecoration, ChatTerminalToolProgressPart, ChatTerminalToolOutputSection, ChatTerminalThinkingCollapsibleWrapper };
