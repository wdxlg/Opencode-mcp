// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/scmInput.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Action, ActionRunner } from "./module-0082.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { product_default } from "./module-0139.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { WorkbenchToolBar } from "./module-0519.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { Action2, IMenuService, MenuId, MenuItemAction, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { createActionViewItem, getFlatActionBarActions } from "./module-0516.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { DEFAULT_FONT_FAMILY } from "./module-0312.mjs";
import { getSimpleEditorOptions, setupSimpleEditorSelectionStyling } from "./module-1837.mjs";
import { EditorOptions } from "./module-0105.mjs";
import { $, Dimension, append, trackFocus } from "./module-0075.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { CodeActionController } from "./module-0566.mjs";
import { ColorDetector } from "./module-0578.mjs";
import { ContextMenuController } from "./module-0664.mjs";
import { CopyPasteController } from "./module-0555.mjs";
import { DragAndDropController } from "./module-0667.mjs";
import { DropIntoEditorController } from "./module-0671.mjs";
import { EditorDictation } from "./module-1351.mjs";
import { FormatOnType } from "./module-0690.mjs";
import { ContentHoverController } from "./module-0654.mjs";
import { GlyphHoverController } from "./module-0809.mjs";
import { InlineCompletionsController } from "./module-0796.mjs";
import { LinkDetector } from "./module-0822.mjs";
import { MenuPreventer } from "./module-1340.mjs";
import { MessageController } from "./module-0542.mjs";
import { PlaceholderTextContribution } from "./module-0832.mjs";
import { SelectionClipboardContributionID } from "./module-1361.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { SuggestController } from "./module-0758.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { DropdownWithPrimaryActionViewItem } from "./module-1932.mjs";
import { ThrottledDelayer } from "./module-0036.mjs";
import { EditOperation } from "./module-0162.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { format2 } from "./module-0030.mjs";
import { runOnChange } from "./module-0064.mjs";
import { autorun } from "./module-0052.mjs";
import { clamp } from "./module-0040.mjs";
import { IMarkdownRendererService, openLinkFromMarkdown } from "./module-0541.mjs";
import { ActionBar } from "./module-0477.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IModelService } from "./module-0080.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ISCMViewService } from "./module-1080.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID } from "./module-1476.mjs";


// src/vs/workbench/contrib/scm/browser/scmInput.ts
var SCMInputContextKeys = {
  SCMInputHasValidationMessage: new RawContextKey("scmInputHasValidationMessage", false)
};

var SCMInputWidgetActionRunner = class extends ActionRunner {
  constructor(input, storageService) {
    super();
    this.input = input;
    this.storageService = storageService;
    this._runningActions = /* @__PURE__ */ new Set();
  }
  get runningActions() {
    return this._runningActions;
  }
  async runAction(action) {
    try {
      if (this.runningActions.size !== 0) {
        this._cts?.cancel();
        if (action.id === "scm.input.cancelAction" /* CancelAction */) {
          return;
        }
      }
      const context2 = [];
      for (const group2 of this.input.repository.provider.groups) {
        context2.push({
          resourceGroupId: group2.id,
          resources: [...group2.resources.map((r2) => r2.sourceUri)]
        });
      }
      this._runningActions.add(action);
      this._cts = new CancellationTokenSource();
      await action.run(...[this.input.repository.provider.rootUri, context2, this._cts.token]);
    } finally {
      this._runningActions.delete(action);
      if (this._runningActions.size === 0) {
        const actionId = action.id === "scm.input.triggerSetup" /* SetupAction */ ? product_default.defaultChatAgent?.generateCommitMessageCommand ?? action.id : action.id;
        this.storageService.store("scm.input.lastActionId" /* LastActionId */, actionId, 0 /* PROFILE */, 0 /* USER */);
      }
    }
  }
};

SCMInputWidgetActionRunner = __decorateClass([
  __decorateParam(1, IStorageService)
], SCMInputWidgetActionRunner);

var SCMInputWidgetToolbar = class extends WorkbenchToolBar {
  constructor(container3, options3, menuService, contextKeyService, contextMenuService, commandService, keybindingService, storageService, telemetryService) {
    super(container3, options3, menuService, contextKeyService, contextMenuService, keybindingService, commandService, telemetryService);
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.storageService = storageService;
    this._dropdownActions = [];
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._disposables = this._register(new MutableDisposable());
    this._dropdownAction = new Action(
      "scmInputMoreActions",
      localize(18917, null),
      "codicon-chevron-down"
    );
    this._cancelAction = new MenuItemAction({
      id: "scm.input.cancelAction" /* CancelAction */,
      title: localize(18915, null),
      icon: Codicon.stopCircle
    }, void 0, void 0, void 0, void 0, contextKeyService, commandService);
  }
  get dropdownActions() {
    return this._dropdownActions;
  }
  get dropdownAction() {
    return this._dropdownAction;
  }
  setInput(input) {
    this._disposables.value = new DisposableStore();
    const contextKeyService = this.contextKeyService.createOverlay([
      ["scmProvider", input.repository.provider.providerId],
      ["scmProviderRootUri", input.repository.provider.rootUri?.toString()],
      ["scmProviderHasRootUri", !!input.repository.provider.rootUri]
    ]);
    const menu = this._disposables.value.add(this.menuService.createMenu(MenuId.SCMInputBox, contextKeyService, { emitEventsForSubmenuChanges: true }));
    const isEnabled = () => {
      return input.repository.provider.groups.some((g) => g.resources.length > 0);
    };
    const updateToolbar = () => {
      const actions = getFlatActionBarActions(menu.getActions({ shouldForwardArgs: true }));
      for (const action of actions) {
        action.enabled = isEnabled();
      }
      this._dropdownAction.enabled = isEnabled();
      let primaryAction = void 0;
      if (this.actionRunner.runningActions.size !== 0) {
        primaryAction = this._cancelAction;
      } else if (actions.length === 1) {
        primaryAction = actions[0];
      } else if (actions.length > 1) {
        const lastActionId = this.storageService.get("scm.input.lastActionId" /* LastActionId */, 0 /* PROFILE */, "");
        primaryAction = actions.find((a) => a.id === lastActionId) ?? actions[0];
      }
      this._dropdownActions = actions.length === 1 ? [] : actions;
      super.setActions(primaryAction ? [primaryAction] : [], []);
      this._onDidChange.fire();
    };
    this._disposables.value.add(menu.onDidChange(() => updateToolbar()));
    this._disposables.value.add(input.repository.provider.onDidChangeResources(() => updateToolbar()));
    this._disposables.value.add(this.storageService.onDidChangeValue(0 /* PROFILE */, "scm.input.lastActionId" /* LastActionId */, this._disposables.value)(() => updateToolbar()));
    this.actionRunner = this._disposables.value.add(new SCMInputWidgetActionRunner(input, this.storageService));
    this._disposables.value.add(this.actionRunner.onWillRun((e) => {
      if (this.actionRunner.runningActions.size === 0) {
        super.setActions([this._cancelAction], []);
        this._onDidChange.fire();
      }
    }));
    this._disposables.value.add(this.actionRunner.onDidRun((e) => {
      if (this.actionRunner.runningActions.size === 0) {
        updateToolbar();
      }
    }));
    updateToolbar();
  }
};

SCMInputWidgetToolbar = __decorateClass([
  __decorateParam(2, IMenuService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, ITelemetryService)
], SCMInputWidgetToolbar);

var SCMInputWidgetEditorOptions = class {
  constructor(overflowWidgetsDomNode, configurationService) {
    this.overflowWidgetsDomNode = overflowWidgetsDomNode;
    this.configurationService = configurationService;
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this.defaultInputFontFamily = DEFAULT_FONT_FAMILY;
    this._disposables = new DisposableStore();
    const onDidChangeConfiguration = Event2.filter(
      this.configurationService.onDidChangeConfiguration,
      (e) => {
        return e.affectsConfiguration("editor.accessibilitySupport") || e.affectsConfiguration("editor.cursorBlinking") || e.affectsConfiguration("editor.cursorStyle") || e.affectsConfiguration("editor.cursorWidth") || e.affectsConfiguration("editor.emptySelectionClipboard") || e.affectsConfiguration("editor.fontFamily") || e.affectsConfiguration("editor.roundedSelection") || e.affectsConfiguration("editor.rulers") || e.affectsConfiguration("editor.wordWrap") || e.affectsConfiguration("editor.wordSegmenterLocales") || e.affectsConfiguration("scm.inputFontFamily") || e.affectsConfiguration("scm.inputFontSize");
      },
      this._disposables
    );
    this._disposables.add(onDidChangeConfiguration(() => this._onDidChange.fire()));
  }
  getEditorConstructionOptions() {
    return {
      ...getSimpleEditorOptions(this.configurationService),
      ...this.getEditorOptions(),
      dragAndDrop: true,
      dropIntoEditor: { enabled: true },
      formatOnType: true,
      lineDecorationsWidth: 6,
      overflowWidgetsDomNode: this.overflowWidgetsDomNode,
      padding: { top: 2, bottom: 2 },
      quickSuggestions: false,
      renderWhitespace: "none",
      scrollbar: {
        alwaysConsumeMouseWheel: false,
        vertical: "hidden"
      },
      wrappingIndent: "none",
      wrappingStrategy: "advanced"
    };
  }
  getEditorOptions() {
    const fontFamily = this._getEditorFontFamily();
    const fontSize = this._getEditorFontSize();
    const lineHeight = this._getEditorLineHeight(fontSize);
    const wordSegmenterLocales = this.configurationService.getValue("editor.wordSegmenterLocales");
    const accessibilitySupport = this.configurationService.getValue("editor.accessibilitySupport");
    const cursorBlinking = this.configurationService.getValue("editor.cursorBlinking");
    const cursorStyle = this.configurationService.getValue("editor.cursorStyle");
    const cursorWidth = this.configurationService.getValue("editor.cursorWidth") ?? 1;
    const emptySelectionClipboard = this.configurationService.getValue("editor.emptySelectionClipboard") === true;
    const roundedSelection = this.configurationService.getValue("editor.roundedSelection") === true;
    return { ...this._getEditorLanguageConfiguration(), accessibilitySupport, cursorBlinking, cursorStyle, cursorWidth, fontFamily, fontSize, lineHeight, emptySelectionClipboard, roundedSelection, wordSegmenterLocales };
  }
  _getEditorFontFamily() {
    const inputFontFamily = this.configurationService.getValue("scm.inputFontFamily").trim();
    if (inputFontFamily.toLowerCase() === "editor") {
      return this.configurationService.getValue("editor.fontFamily").trim();
    }
    if (inputFontFamily.length !== 0 && inputFontFamily.toLowerCase() !== "default") {
      return inputFontFamily;
    }
    return this.defaultInputFontFamily;
  }
  _getEditorFontSize() {
    return this.configurationService.getValue("scm.inputFontSize");
  }
  _getEditorLanguageConfiguration() {
    const rulersConfig = this.configurationService.inspect("editor.rulers", { overrideIdentifier: "scminput" });
    const rulers = rulersConfig.overrideIdentifiers?.includes("scminput") ? EditorOptions.rulers.validate(rulersConfig.value) : [];
    const wordWrapConfig = this.configurationService.inspect("editor.wordWrap", { overrideIdentifier: "scminput" });
    const wordWrap = wordWrapConfig.overrideIdentifiers?.includes("scminput") ? EditorOptions.wordWrap.validate(wordWrapConfig.value) : "on";
    return { rulers, wordWrap };
  }
  _getEditorLineHeight(fontSize) {
    return Math.round(fontSize * 1.5);
  }
  dispose() {
    this._disposables.dispose();
    this._onDidChange.dispose();
  }
};

var SCMInputWidget = class {
  constructor(container3, overflowWidgetsDomNode, contextKeyService, instantiationService, modelService, keybindingService, configurationService, scmViewService, contextViewService, openerService, accessibilityService, markdownRendererService) {
    this.modelService = modelService;
    this.keybindingService = keybindingService;
    this.configurationService = configurationService;
    this.scmViewService = scmViewService;
    this.contextViewService = contextViewService;
    this.openerService = openerService;
    this.accessibilityService = accessibilityService;
    this.markdownRendererService = markdownRendererService;
    this.disposables = new DisposableStore();
    this.repositoryDisposables = new DisposableStore();
    this.validationHasFocus = false;
    // This is due to "Setup height change listener on next tick" above
    // https://github.com/microsoft/vscode/issues/108067
    this.lastLayoutWasTrash = false;
    this.shouldFocusAfterLayout = false;
    this.element = append(container3, $(".scm-editor"));
    this.editorContainer = append(this.element, $(".scm-editor-container"));
    this.toolbarContainer = append(this.element, $(".scm-editor-toolbar"));
    this.contextKeyService = this.disposables.add(contextKeyService.createScoped(this.element));
    this.repositoryIdContextKey = this.contextKeyService.createKey("scmRepository", void 0);
    this.validationMessageContextKey = SCMInputContextKeys.SCMInputHasValidationMessage.bindTo(this.contextKeyService);
    this.inputEditorOptions = new SCMInputWidgetEditorOptions(overflowWidgetsDomNode, this.configurationService);
    this.disposables.add(this.inputEditorOptions.onDidChange(this.onDidChangeEditorOptions, this));
    this.disposables.add(this.inputEditorOptions);
    const codeEditorWidgetOptions = {
      contributions: EditorExtensionsRegistry.getSomeEditorContributions([
        CodeActionController.ID,
        ColorDetector.ID,
        ContextMenuController.ID,
        CopyPasteController.ID,
        DragAndDropController.ID,
        DropIntoEditorController.ID,
        EditorDictation.ID,
        FormatOnType.ID,
        ContentHoverController.ID,
        GlyphHoverController.ID,
        InlineCompletionsController.ID,
        LinkDetector.ID,
        MenuPreventer.ID,
        MessageController.ID,
        PlaceholderTextContribution.ID,
        SelectionClipboardContributionID,
        SnippetController2.ID,
        SuggestController.ID
      ]),
      isSimpleWidget: true
    };
    const services = new ServiceCollection([IContextKeyService, this.contextKeyService]);
    const instantiationService2 = instantiationService.createChild(services, this.disposables);
    const editorConstructionOptions = this.inputEditorOptions.getEditorConstructionOptions();
    this.inputEditor = instantiationService2.createInstance(CodeEditorWidget, this.editorContainer, editorConstructionOptions, codeEditorWidgetOptions);
    this.disposables.add(this.inputEditor);
    this.disposables.add(this.inputEditor.onDidFocusEditorText(() => {
      if (this.input?.repository) {
        this.scmViewService.focus(this.input.repository);
      }
      this.element.classList.add("synthetic-focus");
      this.renderValidation();
    }));
    this.disposables.add(this.inputEditor.onDidBlurEditorText(() => {
      this.element.classList.remove("synthetic-focus");
      setTimeout(() => {
        if (!this.validation || !this.validationHasFocus) {
          this.clearValidation();
        }
      }, 0);
    }));
    this.disposables.add(this.inputEditor.onDidBlurEditorWidget(() => {
      CopyPasteController.get(this.inputEditor)?.clearWidgets();
      DropIntoEditorController.get(this.inputEditor)?.clearWidgets();
    }));
    const firstLineKey = this.contextKeyService.createKey("scmInputIsInFirstPosition", false);
    const lastLineKey = this.contextKeyService.createKey("scmInputIsInLastPosition", false);
    this.disposables.add(this.inputEditor.onDidChangeCursorPosition(({ position: position2 }) => {
      const viewModel = this.inputEditor._getViewModel();
      const lastLineNumber = viewModel.getLineCount();
      const lastLineCol = viewModel.getLineLength(lastLineNumber) + 1;
      const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(position2);
      firstLineKey.set(viewPosition.lineNumber === 1 && viewPosition.column === 1);
      lastLineKey.set(viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol);
    }));
    this.disposables.add(this.inputEditor.onDidScrollChange((e) => {
      this.toolbarContainer.classList.toggle("scroll-decoration", e.scrollTop > 0);
    }));
    Event2.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("scm.showInputActionButton"))(() => this.layout(), this, this.disposables);
    this.onDidChangeContentHeight = Event2.signal(Event2.filter(this.inputEditor.onDidContentSizeChange, (e) => e.contentHeightChanged, this.disposables));
    this.toolbar = instantiationService2.createInstance(SCMInputWidgetToolbar, this.toolbarContainer, {
      actionViewItemProvider: (action, options3) => {
        if (action instanceof MenuItemAction && this.toolbar.dropdownActions.length > 1) {
          return instantiationService.createInstance(DropdownWithPrimaryActionViewItem, action, this.toolbar.dropdownAction, this.toolbar.dropdownActions, "", { actionRunner: this.toolbar.actionRunner, hoverDelegate: options3.hoverDelegate });
        }
        return createActionViewItem(instantiationService, action, options3);
      },
      hiddenItemStrategy: -1 /* NoHide */,
      menuOptions: {
        shouldForwardArgs: true
      }
    });
    this.disposables.add(this.toolbar.onDidChange(() => this.layout()));
    this.disposables.add(this.toolbar);
  }
  static {
    this.ValidationTimeouts = {
      [2 /* Information */]: 5e3,
      [1 /* Warning */]: 8e3,
      [0 /* Error */]: 1e4
    };
  }
  get input() {
    return this.model?.input;
  }
  set input(input) {
    if (input === this.input) {
      return;
    }
    this.clearValidation();
    this.element.classList.remove("synthetic-focus");
    this.repositoryDisposables.clear();
    this.repositoryIdContextKey.set(input?.repository.id);
    if (!input) {
      this.inputEditor.setModel(void 0);
      this.model = void 0;
      return;
    }
    const textModel = input.repository.provider.inputBoxTextModel;
    this.inputEditor.setModel(textModel);
    if (this.configurationService.getValue("editor.wordBasedSuggestions", { resource: textModel.uri }) !== "off") {
      this.configurationService.updateValue("editor.wordBasedSuggestions", "off", { resource: textModel.uri }, 8 /* MEMORY */);
    }
    const validationDelayer = new ThrottledDelayer(200);
    const validate = async () => {
      const position2 = this.inputEditor.getSelection()?.getStartPosition();
      const offset = position2 && textModel.getOffsetAt(position2);
      const value2 = textModel.getValue();
      this.setValidation(await input.validateInput(value2, offset || 0));
    };
    const triggerValidation = () => validationDelayer.trigger(validate);
    this.repositoryDisposables.add(validationDelayer);
    this.repositoryDisposables.add(this.inputEditor.onDidChangeCursorPosition(triggerValidation));
    const opts = this.modelService.getCreationOptions(textModel.getLanguageId(), textModel.uri, textModel.isForSimpleWidget);
    const onEnter = Event2.filter(this.inputEditor.onKeyDown, (e) => e.keyCode === 3 /* Enter */, this.repositoryDisposables);
    this.repositoryDisposables.add(onEnter(() => textModel.detectIndentation(opts.insertSpaces, opts.tabSize)));
    textModel.setValue(input.value);
    this.repositoryDisposables.add(input.onDidChange(({ value: value2, reason }) => {
      const currentValue = textModel.getValue();
      if (value2 === currentValue) {
        return;
      }
      textModel.pushStackElement();
      textModel.pushEditOperations(null, [EditOperation.replaceMove(textModel.getFullModelRange(), value2)], () => []);
      const position2 = reason === 0 /* HistoryPrevious */ ? textModel.getFullModelRange().getStartPosition() : textModel.getFullModelRange().getEndPosition();
      this.inputEditor.setPosition(position2);
      this.inputEditor.revealPositionInCenterIfOutsideViewport(position2);
    }));
    this.repositoryDisposables.add(input.onDidChangeFocus(() => this.focus()));
    this.repositoryDisposables.add(input.onDidChangeValidationMessage((e) => this.setValidation(e, { focus: true, timeout: true })));
    this.repositoryDisposables.add(input.onDidChangeValidateInput((e) => triggerValidation()));
    this.repositoryDisposables.add(input.onDidClearValidation(() => this.clearValidation()));
    this.repositoryDisposables.add(textModel.onDidChangeContent(() => {
      input.setValue(textModel.getValue(), true);
      triggerValidation();
    }));
    const accessibilityVerbosityConfig = observableConfigValue(
      "accessibility.verbosity.sourceControl" /* SourceControl */,
      true,
      this.configurationService
    );
    const getAriaLabel = (placeholder, verbosity) => {
      verbosity = verbosity ?? accessibilityVerbosityConfig.get();
      if (!verbosity || !this.accessibilityService.isScreenReaderOptimized()) {
        return placeholder;
      }
      const kbLabel = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* OpenAccessibilityHelp */)?.getLabel();
      return kbLabel ? localize(18913, null, placeholder, kbLabel) : localize(18914, null, placeholder);
    };
    const getPlaceholderText = () => {
      const binding = this.keybindingService.lookupKeybinding("scm.acceptInput");
      const label3 = binding ? binding.getLabel() : isMacintosh ? "Cmd+Enter" : "Ctrl+Enter";
      return format2(input.placeholder, label3);
    };
    const updatePlaceholderText = () => {
      const placeholder = getPlaceholderText();
      const ariaLabel = getAriaLabel(placeholder);
      this.inputEditor.updateOptions({ ariaLabel, placeholder });
    };
    this.repositoryDisposables.add(input.onDidChangePlaceholder(updatePlaceholderText));
    this.repositoryDisposables.add(this.keybindingService.onDidUpdateKeybindings(updatePlaceholderText));
    this.repositoryDisposables.add(runOnChange(accessibilityVerbosityConfig, (verbosity) => {
      const placeholder = getPlaceholderText();
      const ariaLabel = getAriaLabel(placeholder, verbosity);
      this.inputEditor.updateOptions({ ariaLabel });
    }));
    updatePlaceholderText();
    let commitTemplate = "";
    this.repositoryDisposables.add(autorun((reader) => {
      if (!input.visible) {
        return;
      }
      const oldCommitTemplate = commitTemplate;
      commitTemplate = input.repository.provider.commitTemplate.read(reader);
      const value2 = textModel.getValue();
      if (value2 && value2 !== oldCommitTemplate) {
        return;
      }
      textModel.setValue(commitTemplate);
    }));
    const updateEnablement = (enabled) => {
      this.inputEditor.updateOptions({ readOnly: !enabled });
    };
    this.repositoryDisposables.add(input.onDidChangeEnablement((enabled) => updateEnablement(enabled)));
    updateEnablement(input.enabled);
    this.toolbar.setInput(input);
    this.model = { input, textModel };
  }
  get selections() {
    return this.inputEditor.getSelections();
  }
  set selections(selections) {
    if (selections) {
      this.inputEditor.setSelections(selections);
    }
  }
  setValidation(validation, options3) {
    if (this._validationTimer) {
      clearTimeout(this._validationTimer);
      this._validationTimer = void 0;
    }
    this.validation = validation;
    this.renderValidation();
    if (options3?.focus && !this.hasFocus()) {
      this.focus();
    }
    if (validation && options3?.timeout) {
      this._validationTimer = setTimeout(() => this.setValidation(void 0), SCMInputWidget.ValidationTimeouts[validation.type]);
    }
  }
  getContentHeight() {
    const lineHeight = this.inputEditor.getOption(75 /* lineHeight */);
    const { top: top2, bottom } = this.inputEditor.getOption(96 /* padding */);
    const inputMinLinesConfig = this.configurationService.getValue("scm.inputMinLineCount");
    const inputMinLines = typeof inputMinLinesConfig === "number" ? clamp(inputMinLinesConfig, 1, 50) : 1;
    const editorMinHeight = inputMinLines * lineHeight + top2 + bottom;
    const inputMaxLinesConfig = this.configurationService.getValue("scm.inputMaxLineCount");
    const inputMaxLines = typeof inputMaxLinesConfig === "number" ? clamp(inputMaxLinesConfig, 1, 50) : 10;
    const editorMaxHeight = inputMaxLines * lineHeight + top2 + bottom;
    return clamp(this.inputEditor.getContentHeight(), editorMinHeight, editorMaxHeight);
  }
  layout() {
    const editorHeight = this.getContentHeight();
    const toolbarWidth = this.getToolbarWidth();
    const dimension = new Dimension(this.element.clientWidth - toolbarWidth, editorHeight);
    if (dimension.width < 0) {
      this.lastLayoutWasTrash = true;
      return;
    }
    this.lastLayoutWasTrash = false;
    this.inputEditor.layout(dimension);
    this.renderValidation();
    const showInputActionButton = this.configurationService.getValue("scm.showInputActionButton") === true;
    this.toolbarContainer.classList.toggle("hidden", !showInputActionButton || this.toolbar?.isEmpty() === true);
    if (this.shouldFocusAfterLayout) {
      this.shouldFocusAfterLayout = false;
      this.focus();
    }
  }
  focus() {
    if (this.lastLayoutWasTrash) {
      this.lastLayoutWasTrash = false;
      this.shouldFocusAfterLayout = true;
      return;
    }
    this.inputEditor.focus();
    this.element.classList.add("synthetic-focus");
  }
  hasFocus() {
    return this.inputEditor.hasTextFocus();
  }
  onDidChangeEditorOptions() {
    this.inputEditor.updateOptions(this.inputEditorOptions.getEditorOptions());
  }
  renderValidation() {
    this.clearValidation();
    this.element.classList.toggle("validation-info", this.validation?.type === 2 /* Information */);
    this.element.classList.toggle("validation-warning", this.validation?.type === 1 /* Warning */);
    this.element.classList.toggle("validation-error", this.validation?.type === 0 /* Error */);
    if (!this.validation || !this.inputEditor.hasTextFocus()) {
      return;
    }
    this.validationMessageContextKey.set(true);
    const disposables = new DisposableStore();
    this.validationContextView = this.contextViewService.showContextView({
      getAnchor: () => this.element,
      render: (container3) => {
        this.element.style.borderBottomLeftRadius = "0";
        this.element.style.borderBottomRightRadius = "0";
        const validationContainer = append(container3, $(".scm-editor-validation-container"));
        validationContainer.classList.toggle("validation-info", this.validation.type === 2 /* Information */);
        validationContainer.classList.toggle("validation-warning", this.validation.type === 1 /* Warning */);
        validationContainer.classList.toggle("validation-error", this.validation.type === 0 /* Error */);
        validationContainer.style.width = `${this.element.clientWidth + 2}px`;
        const element = append(validationContainer, $(".scm-editor-validation"));
        const message = this.validation.message;
        if (typeof message === "string") {
          element.textContent = message;
        } else {
          const tracker2 = trackFocus(element);
          disposables.add(tracker2);
          disposables.add(tracker2.onDidFocus(() => this.validationHasFocus = true));
          disposables.add(tracker2.onDidBlur(() => {
            this.validationHasFocus = false;
            this.element.style.borderBottomLeftRadius = "2px";
            this.element.style.borderBottomRightRadius = "2px";
            this.contextViewService.hideContextView();
          }));
          const renderedMarkdown = this.markdownRendererService.render(message, {
            actionHandler: (link2, mdStr) => {
              openLinkFromMarkdown(this.openerService, link2, mdStr.isTrusted);
              this.element.style.borderBottomLeftRadius = "2px";
              this.element.style.borderBottomRightRadius = "2px";
              this.contextViewService.hideContextView();
            }
          });
          disposables.add(renderedMarkdown);
          element.appendChild(renderedMarkdown.element);
        }
        const actionsContainer = append(validationContainer, $(".scm-editor-validation-actions"));
        const actionbar = new ActionBar(actionsContainer);
        const action = new Action("scmInputWidget.validationMessage.close", localize(18912, null), ThemeIcon.asClassName(Codicon.close), true, () => {
          this.contextViewService.hideContextView();
          this.element.style.borderBottomLeftRadius = "2px";
          this.element.style.borderBottomRightRadius = "2px";
        });
        disposables.add(actionbar);
        actionbar.push(action, { icon: true, label: false });
        return Disposable.None;
      },
      onHide: () => {
        this.validationHasFocus = false;
        this.element.style.borderBottomLeftRadius = "2px";
        this.element.style.borderBottomRightRadius = "2px";
        disposables.dispose();
      },
      anchorAlignment: 0 /* LEFT */
    });
  }
  getToolbarWidth() {
    const showInputActionButton = this.configurationService.getValue("scm.showInputActionButton");
    if (!this.toolbar || !showInputActionButton || this.toolbar?.isEmpty() === true) {
      return 0;
    }
    return this.toolbar.dropdownActions.length === 0 ? 26 : 39;
  }
  clearValidation() {
    this.validationContextView?.close();
    this.validationContextView = void 0;
    this.validationHasFocus = false;
    this.validationMessageContextKey.set(false);
  }
  dispose() {
    this.input = void 0;
    this.repositoryDisposables.dispose();
    this.clearValidation();
    clearTimeout(this._validationTimer);
    this.disposables.dispose();
  }
};

SCMInputWidget = __decorateClass([
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IModelService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, ISCMViewService),
  __decorateParam(8, IContextViewService),
  __decorateParam(9, IOpenerService),
  __decorateParam(10, IAccessibilityService),
  __decorateParam(11, IMarkdownRendererService)
], SCMInputWidget);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "scm.input.triggerSetup" /* SetupAction */,
      title: localize(18916, null),
      icon: Codicon.sparkle,
      f1: false,
      menu: {
        id: MenuId.SCMInputBox,
        when: ContextKeyExpr.and(
          ChatContextKeys.Setup.hidden.negate(),
          ChatContextKeys.Setup.disabledInWorkspace.negate(),
          ChatContextKeys.Setup.completed.negate(),
          ContextKeyExpr.equals("scmProvider", "git")
        )
      }
    });
  }
  async run(accessor, ...args2) {
    const commandService = accessor.get(ICommandService);
    const result = await commandService.executeCommand(CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID);
    if (!result) {
      return;
    }
    const command4 = product_default.defaultChatAgent?.generateCommitMessageCommand;
    if (!command4) {
      return;
    }
    await commandService.executeCommand(command4, ...args2);
  }
});

setupSimpleEditorSelectionStyling(".scm-view .scm-editor-container");
export { SCMInputContextKeys, SCMInputWidgetActionRunner, SCMInputWidgetToolbar, SCMInputWidgetEditorOptions, SCMInputWidget };
