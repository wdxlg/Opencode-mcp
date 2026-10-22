// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/codeBlockPart.ts
import { $, Dimension, addDisposableListener, append, clearNode, getTotalHeight, hide, reset, show } from "./module-0075.mjs";
import { Disposable, MutableDisposable, combinedDisposable, thenRegisterOrDispose } from "./module-0012.mjs";
import { StaticResourceContextKey } from "./module-0950.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { getSimpleEditorOptions } from "./module-1813.mjs";
import { localize } from "./module-0001.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { Button } from "./module-0546.mjs";
import { WordHighlighterContribution } from "./module-0860.mjs";
import { Event2 } from "./module-0017.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { generateUuid } from "./module-0190.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { MenuPreventer } from "./module-1339.mjs";
import { SelectionClipboardContributionID } from "./module-1360.mjs";
import { ContextMenuController } from "./module-0664.mjs";
import { ViewportSemanticTokensContribution } from "./module-0844.mjs";
import { BracketMatchingController } from "./module-0531.mjs";
import { SmartSelectController } from "./module-0846.mjs";
import { ContentHoverController } from "./module-0654.mjs";
import { GlyphHoverController } from "./module-0809.mjs";
import { MessageController } from "./module-0542.mjs";
import { GotoDefinitionAtPositionEditorContribution } from "./module-0802.mjs";
import { SuggestController } from "./module-0758.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { ColorDetector } from "./module-0578.mjs";
import { LinkDetector } from "./module-0822.mjs";
import { InspectEditorTokensController } from "./module-2252.mjs";
import { EDITOR_FONT_DEFAULTS } from "./module-0101.mjs";
import { isRequestVM, isResponseVM } from "./module-0979.mjs";
import { Codicon } from "./module-0085.mjs";
import { Range2 } from "./module-0106.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IEditorProgressService, emptyProgressRunner } from "./module-0446.mjs";
import { ResourceLabel } from "./module-1322.mjs";
import { DiffEditorWidget } from "./module-0527.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { assertType } from "./module-0010.mjs";
import { renderFormattedText } from "./module-0597.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { DefaultModelSHA1Computer } from "./module-1612.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { TextModelText } from "./module-0521.mjs";
import { TextEdit } from "./module-0164.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IDialogService } from "./module-0267.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/codeBlockPart.ts
var $45 = $;

var defaultCodeblockPadding = 10;

var defaultChatScrollbarSize = 7;

var CodeBlockPart = class extends Disposable {
  constructor(editorOptions, menuId, delegate, overflowWidgetsDomNode, isSimpleWidget = false, instantiationService, contextKeyService, modelService, languageService, configurationService, accessibilityService, logService, textModelService) {
    super();
    this.editorOptions = editorOptions;
    this.menuId = menuId;
    this.isSimpleWidget = isSimpleWidget;
    this.modelService = modelService;
    this.languageService = languageService;
    this.configurationService = configurationService;
    this.accessibilityService = accessibilityService;
    this.logService = logService;
    this.textModelService = textModelService;
    this.currentScrollWidth = 0;
    this._isHovered = false;
    this._isDropdownVisible = false;
    this.isDisposed = false;
    this.element = $45(".interactive-result-code-block");
    this.resourceContextKey = instantiationService.createInstance(StaticResourceContextKey);
    this.contextKeyService = this._register(contextKeyService.createScoped(this.element));
    const scopedInstantiationService = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, this.contextKeyService])));
    const editorElement = append(this.element, $45(".interactive-result-editor"));
    this.editor = this.createEditor(scopedInstantiationService, editorElement, {
      ...getSimpleEditorOptions(this.configurationService),
      readOnly: true,
      lineNumbers: "off",
      selectOnLineNumbers: true,
      scrollBeyondLastLine: false,
      lineDecorationsWidth: 8,
      dragAndDrop: false,
      padding: { top: this.verticalPadding, bottom: this.verticalPadding },
      mouseWheelZoom: false,
      scrollbar: {
        vertical: "hidden",
        alwaysConsumeMouseWheel: false
      },
      definitionLinkOpensInPeek: false,
      gotoLocation: {
        multiple: "goto",
        multipleDeclarations: "goto",
        multipleDefinitions: "goto",
        multipleImplementations: "goto"
      },
      ariaLabel: localize(12186, null),
      overflowWidgetsDomNode,
      tabFocusMode: true,
      ...this.getEditorOptionsFromConfig()
    });
    const toolbarElement = append(this.element, $45(".interactive-result-code-block-toolbar"));
    this._toolbarElement = toolbarElement;
    const editorScopedService = this._register(this.editor.contextKeyService.createScoped(toolbarElement));
    const editorScopedInstantiationService = this._register(scopedInstantiationService.createChild(new ServiceCollection([IContextKeyService, editorScopedService])));
    this._toolbarFactory = () => editorScopedInstantiationService.createInstance(MenuWorkbenchToolBar, toolbarElement, menuId, {
      menuOptions: {
        shouldForwardArgs: true
      }
    });
    const vulnsContainer = append(this.element, $45(".interactive-result-vulns"));
    const vulnsHeaderElement = append(vulnsContainer, $45(".interactive-result-vulns-header", void 0));
    this.vulnsButton = this._register(new Button(vulnsHeaderElement, {
      buttonBackground: void 0,
      buttonBorder: void 0,
      buttonForeground: void 0,
      buttonHoverBackground: void 0,
      buttonSecondaryBackground: void 0,
      buttonSecondaryForeground: void 0,
      buttonSecondaryHoverBackground: void 0,
      buttonSeparator: void 0,
      supportIcons: true
    }));
    this.vulnsListElement = append(vulnsContainer, $45("ul.interactive-result-vulns-list"));
    this._register(this.vulnsButton.onDidClick(() => {
      const element = this.currentCodeBlockData.element;
      element.vulnerabilitiesListExpanded = !element.vulnerabilitiesListExpanded;
      this.vulnsButton.label = this.getVulnerabilitiesLabel();
      this.element.classList.toggle("chat-vulnerabilities-collapsed", !element.vulnerabilitiesListExpanded);
      this.layout();
    }));
    this._isHovered = false;
    this._register(addDisposableListener(this.element, "mouseenter", () => {
      this._isHovered = true;
      toolbarElement.classList.add("force-visibility");
      this._ensureToolbar();
    }));
    this._register(addDisposableListener(this.element, "mouseleave", () => {
      this._isHovered = false;
      if (!this._isDropdownVisible) {
        toolbarElement.classList.remove("force-visibility");
      }
    }));
    this._configureForScreenReader();
    this._register(this.accessibilityService.onDidChangeScreenReaderOptimized(() => this._configureForScreenReader()));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectedKeys.has("accessibility.verbosity.panelChat" /* Chat */)) {
        this._configureForScreenReader();
      }
    }));
    this._register(this.editorOptions.onDidChange(() => {
      this.editor.updateOptions(this.getEditorOptionsFromConfig());
    }));
    this._register(this.editor.onDidScrollChange((e4) => {
      this.currentScrollWidth = e4.scrollWidth;
    }));
    this._register(this.editor.onDidContentSizeChange((e4) => {
      if (e4.contentHeightChanged) {
        this.layout();
      }
    }));
    this._register(this.editor.onDidBlurEditorWidget(() => {
      this.element.classList.remove("focused");
      WordHighlighterContribution.get(this.editor)?.stopHighlighting();
      this.clearWidgets();
    }));
    this._register(this.editor.onDidFocusEditorWidget(() => {
      this.element.classList.add("focused");
      this._ensureToolbar();
      WordHighlighterContribution.get(this.editor)?.restoreViewState(true);
    }));
    this._register(Event2.any(
      this.editor.onDidChangeModel,
      this.editor.onDidChangeModelContent
    )(() => {
      if (this.currentCodeBlockData) {
        this.updateContexts(this.currentCodeBlockData);
      }
    }));
    if (delegate.onDidScroll) {
      this._register(delegate.onDidScroll((e4) => {
        this.clearWidgets();
      }));
    }
    this._textModel = this._register(this.modelService.createModel(
      "",
      null,
      URI.from({ scheme: Schemas.vscodeChatCodeBlock, path: generateUuid() }),
      this.isSimpleWidget
    ));
    thenRegisterOrDispose(this.textModelService.createModelReference(this._textModel.uri), this._store);
    this.editor.setModel(this._textModel);
  }
  /**
   * Compute a pool reuse key for a code block. When the same key is used
   * across render cycles the pool will try to return the same CodeBlockPart,
   * which lets the setText append-optimisation avoid a full model reset.
   */
  static poolKey(elementId, codeBlockIndex) {
    return `${elementId}/${codeBlockIndex}`;
  }
  get verticalPadding() {
    return this.currentCodeBlockData?.renderOptions?.verticalPadding ?? defaultCodeblockPadding;
  }
  dispose() {
    this.isDisposed = true;
    super.dispose();
  }
  get uri() {
    return this.editor.getModel()?.uri;
  }
  createEditor(instantiationService, parent, options3) {
    return this._register(instantiationService.createInstance(CodeEditorWidget, parent, options3, {
      isSimpleWidget: this.isSimpleWidget,
      contributions: EditorExtensionsRegistry.getSomeEditorContributions([
        MenuPreventer.ID,
        SelectionClipboardContributionID,
        ContextMenuController.ID,
        WordHighlighterContribution.ID,
        ViewportSemanticTokensContribution.ID,
        BracketMatchingController.ID,
        SmartSelectController.ID,
        ContentHoverController.ID,
        GlyphHoverController.ID,
        MessageController.ID,
        GotoDefinitionAtPositionEditorContribution.ID,
        SuggestController.ID,
        SnippetController2.ID,
        ColorDetector.ID,
        LinkDetector.ID,
        InspectEditorTokensController.ID
      ])
    }));
  }
  focus() {
    this.editor.focus();
  }
  updatePaddingForLayout() {
    const horizontalScrollbarVisible = this.currentScrollWidth > this.editor.getLayoutInfo().contentWidth;
    const scrollbarHeight = this.editor.getLayoutInfo().horizontalScrollbarHeight;
    const bottomPadding = horizontalScrollbarVisible ? Math.max(this.verticalPadding - scrollbarHeight, 2) : this.verticalPadding;
    this.editor.updateOptions({ padding: { top: this.verticalPadding, bottom: bottomPadding } });
  }
  _ensureToolbar() {
    if (this.isDisposed) {
      return void 0;
    }
    if (this.currentCodeBlockData?.renderOptions?.hideToolbar) {
      return void 0;
    }
    if (!this.toolbar) {
      const factory = this._toolbarFactory;
      if (!factory) {
        return void 0;
      }
      this._toolbarFactory = void 0;
      const toolbar = this._register(factory());
      this.toolbar = toolbar;
      this._register(toolbar.onDidChangeDropdownVisibility((e4) => {
        this._isDropdownVisible = e4;
        this._toolbarElement.classList.toggle("force-visibility", e4 || this._isHovered);
      }));
      if (this._pendingToolbarAriaLabel !== void 0) {
        toolbar.setAriaLabel(this._pendingToolbarAriaLabel);
        this._pendingToolbarAriaLabel = void 0;
      }
      if (this._pendingToolbarContext !== void 0) {
        toolbar.context = this._pendingToolbarContext;
        this._pendingToolbarContext = void 0;
      }
    }
    return this.toolbar;
  }
  _configureForScreenReader() {
    const hideToolbar = !!this.currentCodeBlockData?.renderOptions?.hideToolbar;
    if (this.accessibilityService.isScreenReaderOptimized()) {
      if (hideToolbar) {
        hide(this._toolbarElement);
      } else {
        this._toolbarElement.style.display = "block";
        if (this.currentCodeBlockData) {
          this._ensureToolbar();
        }
      }
    } else if (hideToolbar) {
      hide(this._toolbarElement);
    } else {
      this._toolbarElement.style.display = "";
    }
  }
  getEditorOptionsFromConfig() {
    const renderOptions = this.currentCodeBlockData?.renderOptions;
    const scrollbar = renderOptions?.maxHeightInLines ? { vertical: "auto", verticalScrollbarSize: defaultChatScrollbarSize, ...renderOptions?.editorOptions?.scrollbar } : void 0;
    return {
      wordWrap: this.editorOptions.configuration.resultEditor.wordWrap,
      fontLigatures: this.editorOptions.configuration.resultEditor.fontLigatures,
      bracketPairColorization: this.editorOptions.configuration.resultEditor.bracketPairColorization,
      fontFamily: this.editorOptions.configuration.resultEditor.fontFamily === "default" ? EDITOR_FONT_DEFAULTS.fontFamily : this.editorOptions.configuration.resultEditor.fontFamily,
      fontSize: this.editorOptions.configuration.resultEditor.fontSize,
      fontWeight: this.editorOptions.configuration.resultEditor.fontWeight,
      lineHeight: this.editorOptions.configuration.resultEditor.lineHeight,
      ...renderOptions?.editorOptions,
      ...scrollbar ? { scrollbar } : {}
    };
  }
  layout(width2 = this.lastLayoutWidth) {
    if (width2 === void 0) {
      return;
    }
    this.lastLayoutWidth = width2;
    const contentHeight = this.getContentHeight();
    let height = contentHeight;
    if (this.currentCodeBlockData?.renderOptions?.maxHeightInLines) {
      height = Math.min(contentHeight, this.editor.getOption(75 /* lineHeight */) * this.currentCodeBlockData?.renderOptions?.maxHeightInLines);
    }
    const editorBorder = 2;
    width2 = width2 - editorBorder - (this.currentCodeBlockData?.renderOptions?.reserveWidth ?? 0);
    this.editor.layout(
      { width: isRequestVM(this.currentCodeBlockData?.element) ? width2 * 0.9 : width2, height },
      /* postponeRendering */
      true
    );
    this.updatePaddingForLayout();
  }
  getContentHeight() {
    return this.editor.getContentHeight();
  }
  render(data, width2) {
    this.currentCodeBlockData = data;
    if (data.parentContextKeyService) {
      this.contextKeyService.updateParent(data.parentContextKeyService);
    }
    if (this.getEditorOptionsFromConfig().wordWrap === "on") {
      this.layout(width2);
    }
    const didUpdate = this.updateEditor(data);
    if (!didUpdate || this.isDisposed || this.currentCodeBlockData !== data) {
      return;
    }
    this.editor.updateOptions({
      ...this.getEditorOptionsFromConfig()
    });
    if (!this.editor.getOption(8 /* ariaLabel */)) {
      this.editor.updateOptions({
        ariaLabel: localize(12187, null, data.codeBlockIndex + 1)
      });
    }
    this.layout(width2);
    const toolbarAriaLabel = localize(12188, null, data.codeBlockIndex + 1);
    if (this.toolbar) {
      this.toolbar.setAriaLabel(toolbarAriaLabel);
    } else {
      this._pendingToolbarAriaLabel = toolbarAriaLabel;
    }
    if (data.renderOptions?.hideToolbar) {
      hide(this._toolbarElement);
    } else {
      show(this._toolbarElement);
      if (this.accessibilityService.isScreenReaderOptimized()) {
        this._ensureToolbar();
      }
    }
    if (data.vulns?.length && isResponseVM(data.element)) {
      clearNode(this.vulnsListElement);
      this.element.classList.remove("no-vulns");
      this.element.classList.toggle("chat-vulnerabilities-collapsed", !data.element.vulnerabilitiesListExpanded);
      append(this.vulnsListElement, ...data.vulns.map((v2) => $45("li", void 0, $45("span.chat-vuln-title", void 0, v2.title), " " + v2.description)));
      this.vulnsButton.label = this.getVulnerabilitiesLabel();
    } else {
      this.element.classList.add("no-vulns");
    }
    if (this._isHovered) {
      this._toolbarElement.classList.add("force-visibility");
    }
    this.layout();
    this.editor.renderAsync(true);
  }
  reset() {
    this.clearWidgets();
    this.currentCodeBlockData = void 0;
  }
  onDidRemount() {
    if (this.currentCodeBlockData) {
      this.editor.renderAsync(true);
    }
  }
  clearWidgets() {
    ContentHoverController.get(this.editor)?.hideContentHover();
    GlyphHoverController.get(this.editor)?.hideGlyphHover();
  }
  updateEditor(data) {
    if (this.isDisposed || this.currentCodeBlockData !== data) {
      return false;
    }
    this.setText(data.text);
    this.setLanguage(data.languageId);
    this.updateContexts(data);
    return true;
  }
  getVulnerabilitiesLabel() {
    if (!this.currentCodeBlockData || !this.currentCodeBlockData.vulns) {
      return "";
    }
    const referencesLabel = this.currentCodeBlockData.vulns.length > 1 ? localize(12197, null, this.currentCodeBlockData.vulns.length) : localize(12198, null, 1);
    const icon2 = (element) => element.vulnerabilitiesListExpanded ? Codicon.chevronDown : Codicon.chevronRight;
    return `${referencesLabel} $(${icon2(this.currentCodeBlockData.element).id})`;
  }
  updateContexts(data) {
    const textModel = this.editor.getModel();
    if (!textModel) {
      return;
    }
    const context2 = {
      code: textModel.getTextBuffer().getValueInRange(textModel.getFullModelRange(), 0 /* TextDefined */),
      codeBlockIndex: data.codeBlockIndex,
      element: data.element,
      languageId: textModel.getLanguageId(),
      codemapperUri: data.codemapperUri,
      chatSessionResource: data.chatSessionResource
    };
    if (this.toolbar) {
      this.toolbar.context = context2;
    } else {
      this._pendingToolbarContext = context2;
    }
    this.resourceContextKey.set(textModel.uri);
  }
  setText(newText) {
    const currentText = this._textModel.getValue(1 /* LF */);
    if (newText === currentText) {
      return;
    }
    if (newText.startsWith(currentText)) {
      const text2 = newText.slice(currentText.length);
      const lastLine = this._textModel.getLineCount();
      const lastCol = this._textModel.getLineMaxColumn(lastLine);
      this._textModel.applyEdits([{ range: new Range2(lastLine, lastCol, lastLine, lastCol), text: text2 }]);
    } else {
      this.logService.trace("[CodeBlockPart] setText could not optimize, falling back to setValue");
      this._textModel.setValue(newText);
    }
  }
  setLanguage(languageId) {
    const vscodeLanguageId = this.languageService.getLanguageIdByLanguageName(languageId);
    if (vscodeLanguageId && vscodeLanguageId !== this._textModel.getLanguageId()) {
      this._textModel.setLanguage(vscodeLanguageId);
    } else if (!vscodeLanguageId && this._textModel.getLanguageId() !== PLAINTEXT_LANGUAGE_ID) {
      this._textModel.setLanguage(PLAINTEXT_LANGUAGE_ID);
    }
  }
};

CodeBlockPart = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IModelService),
  __decorateParam(8, ILanguageService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IAccessibilityService),
  __decorateParam(11, ILogService),
  __decorateParam(12, ITextModelService)
], CodeBlockPart);

var ChatCodeBlockContentProvider = class extends Disposable {
  constructor(textModelService, _modelService) {
    super();
    this._modelService = _modelService;
    this._register(textModelService.registerTextModelContentProvider(Schemas.vscodeChatCodeBlock, {
      provideTextContent: (resource) => {
        return Promise.resolve(this._modelService.getModel(resource));
      }
    }));
  }
};

ChatCodeBlockContentProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IModelService)
], ChatCodeBlockContentProvider);

var CodeCompareBlockPart = class extends Disposable {
  constructor(options3, menuId, delegate, overflowWidgetsDomNode, isSimpleWidget = false, instantiationService, contextKeyService, modelService, configurationService, accessibilityService, labelService, openerService) {
    super();
    this.options = options3;
    this.menuId = menuId;
    this.isSimpleWidget = isSimpleWidget;
    this.modelService = modelService;
    this.configurationService = configurationService;
    this.accessibilityService = accessibilityService;
    this.labelService = labelService;
    this.openerService = openerService;
    this._lastDiffEditorViewModel = this._store.add(new MutableDisposable());
    this.currentScrollWidth = 0;
    this.currentHorizontalPadding = 0;
    this.element = $45(".interactive-result-code-block");
    this.element.classList.add("compare");
    this.messageElement = append(this.element, $45(".message"));
    this.messageElement.setAttribute("role", "status");
    this.messageElement.tabIndex = 0;
    this.contextKeyService = this._register(contextKeyService.createScoped(this.element));
    const scopedInstantiationService = this._register(instantiationService.createChild(new ServiceCollection(
      [IContextKeyService, this.contextKeyService],
      [IEditorProgressService, new class {
        show(_total, _delay) {
          return emptyProgressRunner;
        }
        async showWhile(promise, _delay) {
          await promise;
        }
      }()]
    )));
    const editorHeader = this.editorHeader = append(this.element, $45(".interactive-result-header.show-file-icons"));
    const editorElement = append(this.element, $45(".interactive-result-editor"));
    this.diffEditor = this.createDiffEditor(scopedInstantiationService, editorElement, {
      ...getSimpleEditorOptions(this.configurationService),
      lineNumbers: "on",
      selectOnLineNumbers: true,
      scrollBeyondLastLine: false,
      lineDecorationsWidth: 12,
      dragAndDrop: false,
      padding: { top: defaultCodeblockPadding, bottom: defaultCodeblockPadding },
      mouseWheelZoom: false,
      scrollbar: {
        vertical: "hidden",
        alwaysConsumeMouseWheel: false
      },
      definitionLinkOpensInPeek: false,
      gotoLocation: {
        multiple: "goto",
        multipleDeclarations: "goto",
        multipleDefinitions: "goto",
        multipleImplementations: "goto"
      },
      ariaLabel: localize(12186, null),
      overflowWidgetsDomNode,
      ...this.getEditorOptionsFromConfig()
    });
    this.resourceLabel = this._register(scopedInstantiationService.createInstance(ResourceLabel, editorHeader, { supportIcons: true }));
    const editorScopedService = this._register(this.diffEditor.getModifiedEditor().contextKeyService.createScoped(editorHeader));
    const editorScopedInstantiationService = this._register(scopedInstantiationService.createChild(new ServiceCollection([IContextKeyService, editorScopedService])));
    this.toolbar = this._register(editorScopedInstantiationService.createInstance(MenuWorkbenchToolBar, editorHeader, menuId, {
      menuOptions: {
        shouldForwardArgs: true
      }
    }));
    this._configureForScreenReader();
    this._register(this.accessibilityService.onDidChangeScreenReaderOptimized(() => this._configureForScreenReader()));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectedKeys.has("accessibility.verbosity.panelChat" /* Chat */)) {
        this._configureForScreenReader();
      }
    }));
    this._register(this.options.onDidChange(() => {
      this.diffEditor.updateOptions(this.getEditorOptionsFromConfig());
    }));
    this._register(this.diffEditor.getModifiedEditor().onDidScrollChange((e4) => {
      this.currentScrollWidth = e4.scrollWidth;
    }));
    this._register(this.diffEditor.getModifiedEditor().onDidBlurEditorWidget(() => {
      this.element.classList.remove("focused");
      WordHighlighterContribution.get(this.diffEditor.getModifiedEditor())?.stopHighlighting();
      this.clearWidgets();
    }));
    this._register(this.diffEditor.getModifiedEditor().onDidFocusEditorWidget(() => {
      this.element.classList.add("focused");
      WordHighlighterContribution.get(this.diffEditor.getModifiedEditor())?.restoreViewState(true);
    }));
    if (delegate.onDidScroll) {
      this._register(delegate.onDidScroll((e4) => {
        this.clearWidgets();
      }));
    }
  }
  get uri() {
    return this.diffEditor.getModifiedEditor().getModel()?.uri;
  }
  createDiffEditor(instantiationService, parent, options3) {
    const widgetOptions = {
      isSimpleWidget: this.isSimpleWidget,
      contributions: EditorExtensionsRegistry.getSomeEditorContributions([
        MenuPreventer.ID,
        SelectionClipboardContributionID,
        ContextMenuController.ID,
        WordHighlighterContribution.ID,
        ViewportSemanticTokensContribution.ID,
        BracketMatchingController.ID,
        SmartSelectController.ID,
        ContentHoverController.ID,
        GlyphHoverController.ID,
        GotoDefinitionAtPositionEditorContribution.ID
      ])
    };
    return this._register(instantiationService.createInstance(DiffEditorWidget, parent, {
      scrollbar: { useShadows: false, alwaysConsumeMouseWheel: false, ignoreHorizontalScrollbarInContentHeight: true },
      renderMarginRevertIcon: false,
      diffCodeLens: false,
      scrollBeyondLastLine: false,
      stickyScroll: { enabled: false },
      originalAriaLabel: localize(12196, null),
      modifiedAriaLabel: localize(12195, null),
      diffAlgorithm: "advanced",
      readOnly: false,
      isInEmbeddedEditor: true,
      useInlineViewWhenSpaceIsLimited: true,
      experimental: {
        useTrueInlineView: true
      },
      renderSideBySideInlineBreakpoint: 300,
      renderOverviewRuler: false,
      compactMode: true,
      hideUnchangedRegions: { enabled: true, contextLineCount: 1 },
      renderGutterMenu: false,
      lineNumbersMinChars: 1,
      ...options3
    }, { originalEditor: widgetOptions, modifiedEditor: widgetOptions }));
  }
  focus() {
    this.diffEditor.focus();
  }
  updatePaddingForLayout() {
    const horizontalScrollbarVisible = this.currentScrollWidth > this.diffEditor.getModifiedEditor().getLayoutInfo().contentWidth;
    const scrollbarHeight = this.diffEditor.getModifiedEditor().getLayoutInfo().horizontalScrollbarHeight;
    const bottomPadding = horizontalScrollbarVisible ? Math.max(defaultCodeblockPadding - scrollbarHeight, 2) : defaultCodeblockPadding;
    this.diffEditor.updateOptions({ padding: { top: defaultCodeblockPadding, bottom: bottomPadding } });
  }
  _configureForScreenReader() {
    const toolbarElt = this.toolbar.getElement();
    toolbarElt.style.display = "block";
    if (this.accessibilityService.isScreenReaderOptimized()) {
      toolbarElt.ariaLabel = localize(12185, null);
    }
  }
  getEditorOptionsFromConfig() {
    return {
      wordWrap: this.options.configuration.resultEditor.wordWrap,
      fontLigatures: this.options.configuration.resultEditor.fontLigatures,
      bracketPairColorization: this.options.configuration.resultEditor.bracketPairColorization,
      fontFamily: this.options.configuration.resultEditor.fontFamily === "default" ? EDITOR_FONT_DEFAULTS.fontFamily : this.options.configuration.resultEditor.fontFamily,
      fontSize: this.options.configuration.resultEditor.fontSize,
      fontWeight: this.options.configuration.resultEditor.fontWeight,
      lineHeight: this.options.configuration.resultEditor.lineHeight
    };
  }
  layout(width2 = this.lastLayoutWidth) {
    if (width2 === void 0) {
      return;
    }
    this.lastLayoutWidth = width2;
    const editorBorder = 2;
    const toolbar = getTotalHeight(this.editorHeader);
    const content = this.diffEditor.getModel() ? this.diffEditor.getContentHeight() : getTotalHeight(this.messageElement);
    const dimension = new Dimension(width2 - editorBorder - this.currentHorizontalPadding * 2, toolbar + content);
    this.element.style.width = `${dimension.width}px`;
    this.diffEditor.layout(dimension.with(void 0, content - editorBorder));
    this.updatePaddingForLayout();
  }
  async render(data, width2, token) {
    this.currentHorizontalPadding = data.horizontalPadding || 0;
    if (data.parentContextKeyService) {
      this.contextKeyService.updateParent(data.parentContextKeyService);
    }
    if (this.options.configuration.resultEditor.wordWrap === "on") {
      this.layout(width2);
    }
    await this.updateEditor(data, token);
    this.layout(width2);
    this.diffEditor.updateOptions({
      ariaLabel: localize(12189, null),
      readOnly: !!data.isReadOnly
    });
    this.resourceLabel.element.setFile(data.edit.uri, {
      fileKind: 0 /* FILE */,
      fileDecorations: { colors: true, badges: false }
    });
  }
  reset() {
    this.clearWidgets();
  }
  clearWidgets() {
    ContentHoverController.get(this.diffEditor.getOriginalEditor())?.hideContentHover();
    ContentHoverController.get(this.diffEditor.getModifiedEditor())?.hideContentHover();
    GlyphHoverController.get(this.diffEditor.getOriginalEditor())?.hideGlyphHover();
    GlyphHoverController.get(this.diffEditor.getModifiedEditor())?.hideGlyphHover();
  }
  async updateEditor(data, token) {
    if (!isResponseVM(data.element)) {
      return;
    }
    const isEditApplied = Boolean(data.edit.state?.applied ?? 0);
    ChatContextKeys.editApplied.bindTo(this.contextKeyService).set(isEditApplied);
    this.element.classList.toggle("no-diff", isEditApplied);
    if (isEditApplied) {
      assertType(data.edit.state?.applied);
      const uriLabel = this.labelService.getUriLabel(data.edit.uri, { relative: true, noPrefix: true });
      let template2;
      if (data.edit.state.applied === 1) {
        template2 = localize(12190, null, uriLabel);
      } else if (data.edit.state.applied < 0) {
        template2 = localize(12192, null, uriLabel);
      } else {
        template2 = localize(12191, null, data.edit.state.applied, uriLabel);
      }
      const message = renderFormattedText(template2, {
        renderCodeSegments: true,
        actionHandler: {
          callback: () => {
            this.openerService.open(data.edit.uri, { fromUserGesture: true, allowCommands: false });
          },
          disposables: this._store
        }
      });
      reset(this.messageElement, message);
    }
    const diffData = await data.diffData;
    if (token.isCancellationRequested) {
      return;
    }
    if (!isEditApplied && diffData) {
      const viewModel = this.diffEditor.createViewModel({
        original: diffData.original,
        modified: diffData.modified
      });
      await viewModel.waitForDiff();
      if (token.isCancellationRequested) {
        return;
      }
      const listener = Event2.any(diffData.original.onWillDispose, diffData.modified.onWillDispose)(() => {
        this.diffEditor.setModel(null);
      });
      this.diffEditor.setModel(viewModel);
      this._lastDiffEditorViewModel.value = combinedDisposable(listener, viewModel);
    } else {
      this.diffEditor.setModel(null);
      this._lastDiffEditorViewModel.value = void 0;
    }
    this.toolbar.context = {
      edit: data.edit,
      element: data.element,
      diffEditor: this.diffEditor,
      toggleDiffViewMode: () => {
        const isCurrentlyInline = !!this.diffEditor.getModifiedEditor().contextKeyService.getContextKeyValue(EditorContextKeys.diffEditorInlineMode.key);
        const renderSideBySide = isCurrentlyInline;
        this.diffEditor.updateOptions({
          renderSideBySide,
          // Make it not-compact in side by side mode, otherwise we may not actually
          // show it side-by-side if it's a simple diff https://github.com/microsoft/vscode/blob/0632563332c7c08656fb47c97bc4328d62ee1d80/src/vs/editor/browser/widget/diffEditor/diffEditorOptions.ts#L35-L39
          compactMode: !renderSideBySide,
          useInlineViewWhenSpaceIsLimited: false
        });
        this.layout();
      }
    };
  }
};

CodeCompareBlockPart = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IModelService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IAccessibilityService),
  __decorateParam(10, ILabelService),
  __decorateParam(11, IOpenerService)
], CodeCompareBlockPart);

var DefaultChatTextEditor = class {
  constructor(modelService, editorService, dialogService) {
    this.modelService = modelService;
    this.editorService = editorService;
    this.dialogService = dialogService;
    this._sha1 = new DefaultModelSHA1Computer();
  }
  async apply(response, item, diffEditor) {
    if (!response.response.value.includes(item)) {
      return;
    }
    if (item.state?.applied) {
      return;
    }
    if (!diffEditor) {
      for (const candidate of this.editorService.listDiffEditors()) {
        if (!candidate.getContainerDomNode().isConnected) {
          continue;
        }
        const model = candidate.getModel();
        if (!model || !isEqual2(model.original.uri, item.uri) || model.modified.uri.scheme !== Schemas.vscodeChatCodeCompareBlock) {
          diffEditor = candidate;
          break;
        }
      }
    }
    const edits = diffEditor ? await this._applyWithDiffEditor(diffEditor, item) : await this._apply(item);
    response.setEditApplied(item, edits);
  }
  async _applyWithDiffEditor(diffEditor, item) {
    const model = diffEditor.getModel();
    if (!model) {
      return 0;
    }
    const diff4 = diffEditor.getDiffComputationResult();
    if (!diff4 || diff4.identical) {
      return 0;
    }
    if (!await this._checkSha1(model.original, item)) {
      return 0;
    }
    const modified = new TextModelText(model.modified);
    const edits = diff4.changes2.map((i2) => i2.toRangeMapping().toTextEdit(modified).toSingleEditOperation());
    model.original.pushStackElement();
    model.original.pushEditOperations(null, edits, () => null);
    model.original.pushStackElement();
    return edits.length;
  }
  async _apply(item) {
    const ref = await this.modelService.createModelReference(item.uri);
    try {
      if (!await this._checkSha1(ref.object.textEditorModel, item)) {
        return 0;
      }
      ref.object.textEditorModel.pushStackElement();
      let total = 0;
      for (const group2 of item.edits) {
        const edits = group2.map(TextEdit.asEditOperation);
        ref.object.textEditorModel.pushEditOperations(null, edits, () => null);
        total += edits.length;
      }
      ref.object.textEditorModel.pushStackElement();
      return total;
    } finally {
      ref.dispose();
    }
  }
  async _checkSha1(model, item) {
    if (item.state?.sha1 && this._sha1.computeSHA1(model) && this._sha1.computeSHA1(model) !== item.state.sha1) {
      const result = await this.dialogService.confirm({
        message: localize(12193, null),
        detail: localize(12194, null)
      });
      if (!result.confirmed) {
        return false;
      }
    }
    return true;
  }
  discard(response, item) {
    if (!response.response.value.includes(item)) {
      return;
    }
    if (item.state?.applied) {
      return;
    }
    response.setEditApplied(item, -1);
  }
};

DefaultChatTextEditor = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, IDialogService)
], DefaultChatTextEditor);
export { $45, defaultCodeblockPadding, defaultChatScrollbarSize, CodeBlockPart, ChatCodeBlockContentProvider, CodeCompareBlockPart, DefaultChatTextEditor };
