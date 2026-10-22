// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/repl.ts
import { $, Dimension, EventType, addStandardDisposableListener, append, clearNode, getActiveWindow, getWindow, isActiveElement } from "./module-0075.mjs";
import { FilterViewPane, ViewAction } from "./module-1335.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { Action2, IMenuService, MenuId, registerAction2 } from "./module-0092.mjs";
import { HistoryNavigator } from "./module-0599.mjs";
import { ReplFilter } from "./module-3017.mjs";
import { CONTEXT_DEBUG_STATE, CONTEXT_IN_DEBUG_REPL, CONTEXT_MULTI_SESSION_REPL, DEBUG_SCHEME, IDebugService, REPL_VIEW_ID, getStateLabel } from "./module-1057.mjs";
import { URI } from "./module-0032.mjs";
import { Variable3 } from "./module-1064.mjs";
import { Range2 } from "./module-0106.mjs";
import { CompletionItemKinds } from "./module-0164.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { EDITOR_FONT_DEFAULTS } from "./module-0101.mjs";
import { status } from "./module-0076.mjs";
import { removeAnsiEscapeCodes } from "./module-0030.mjs";
import { RunOnceScheduler, timeout } from "./module-0036.mjs";
import { ReplEvaluationResult, ReplGroup } from "./module-2400.mjs";
import { registerNavigableContainer } from "./module-1369.mjs";
import { MOUSE_CURSOR_TEXT_CSS_CLASS_NAME } from "./module-0299.mjs";
import { ReplAccessibilityProvider, ReplDataSource, ReplDelegate, ReplEvaluationInputsRenderer, ReplEvaluationResultsRenderer, ReplGroupRenderer, ReplOutputElementRenderer, ReplRawObjectsRenderer, ReplVariablesRenderer } from "./module-3018.mjs";
import { DebugExpressionRenderer } from "./module-2408.mjs";
import { WorkbenchAsyncDataTree } from "./module-0636.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { debugConsoleClearAll, debugConsoleEvaluationPrompt } from "./module-1891.mjs";
import { registerAndCreateHistoryNavigationContext } from "./module-0603.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { getSimpleCodeEditorWidgetOptions, getSimpleEditorOptions } from "./module-1837.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { resolveColorValue } from "./module-0226.mjs";
import { editorForeground } from "./module-0229.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IModelService } from "./module-0080.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITextResourcePropertiesService } from "./module-0204.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ILogService } from "./module-0095.mjs";
import { Emitter } from "./module-0017.mjs";
import { EditorAction, registerEditorAction } from "./module-0097.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { SuggestController } from "./module-0758.mjs";
import { IViewsService } from "./module-1246.mjs";
import { Codicon } from "./module-0085.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { FocusSessionActionViewItem } from "./module-3016.mjs";
import { resolveChildSession } from "./module-1059.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { DEBUG_COMMAND_CATEGORY, FOCUS_REPL_ID } from "./module-2406.mjs";


// src/vs/workbench/contrib/debug/browser/repl.ts
var $102 = $;

var HISTORY_STORAGE_KEY = "debug.repl.history";

var FILTER_HISTORY_STORAGE_KEY = "debug.repl.filterHistory";

var FILTER_VALUE_STORAGE_KEY = "debug.repl.filterValue";

var DECORATION_KEY3 = "replinputdecoration";

function revealLastElement(tree) {
  tree.scrollTop = tree.scrollHeight - tree.renderHeight;
}

var sessionsToIgnore = /* @__PURE__ */ new Set();

var identityProvider2 = { getId: (element) => element.getId() };

var Repl = class extends FilterViewPane {
  constructor(options3, debugService, instantiationService, storageService, themeService, modelService, contextKeyService, codeEditorService, viewDescriptorService, contextMenuService, configurationService, textResourcePropertiesService, editorService, keybindingService, openerService, hoverService, menuService, languageFeaturesService, logService) {
    const filterText = storageService.get(FILTER_VALUE_STORAGE_KEY, 1 /* WORKSPACE */, "");
    super({
      ...options3,
      filterOptions: {
        placeholder: localize(14642, null),
        text: filterText,
        history: JSON.parse(storageService.get(FILTER_HISTORY_STORAGE_KEY, 1 /* WORKSPACE */, "[]"))
      }
    }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.debugService = debugService;
    this.storageService = storageService;
    this.modelService = modelService;
    this.configurationService = configurationService;
    this.textResourcePropertiesService = textResourcePropertiesService;
    this.editorService = editorService;
    this.keybindingService = keybindingService;
    this.languageFeaturesService = languageFeaturesService;
    this.logService = logService;
    this.previousTreeScrollHeight = 0;
    this.styleChangedWhenInvisible = false;
    this.modelChangeListener = Disposable.None;
    this.findIsOpen = false;
    this.menu = menuService.createMenu(MenuId.DebugConsoleContext, contextKeyService);
    this._register(this.menu);
    this.history = this._register(new HistoryNavigator(new Set(JSON.parse(this.storageService.get(HISTORY_STORAGE_KEY, 1 /* WORKSPACE */, "[]"))), 100));
    this.filter = new ReplFilter();
    this.filter.filterQuery = filterText;
    this.multiSessionRepl = CONTEXT_MULTI_SESSION_REPL.bindTo(contextKeyService);
    this.replOptions = this._register(this.instantiationService.createInstance(ReplOptions, this.id, () => this.getLocationBasedColors().background));
    this._register(this.replOptions.onDidChange(() => this.onDidStyleChange()));
    this._register(codeEditorService.registerDecorationType("repl-decoration", DECORATION_KEY3, {}));
    this.multiSessionRepl.set(this.isMultiSessionView);
    this.registerListeners();
  }
  static {
    this.REFRESH_DELAY = 50;
  }
  static {
    // delay in ms to refresh the repl for new elements to show
    this.URI = URI.parse(`${DEBUG_SCHEME}:replinput`);
  }
  registerListeners() {
    if (this.debugService.getViewModel().focusedSession) {
      this.onDidFocusSession(this.debugService.getViewModel().focusedSession);
    }
    this._register(this.debugService.getViewModel().onDidFocusSession((session) => {
      this.onDidFocusSession(session);
    }));
    this._register(this.debugService.getViewModel().onDidEvaluateLazyExpression(async (e) => {
      if (e instanceof Variable3 && this.tree?.hasNode(e)) {
        await this.tree.updateChildren(e, false, true);
        await this.tree.expand(e);
      }
    }));
    this._register(this.debugService.onWillNewSession(async (newSession) => {
      const input = this.tree?.getInput();
      if (!input || input.state === 0 /* Inactive */) {
        await this.selectSession(newSession);
      }
      this.multiSessionRepl.set(this.isMultiSessionView);
    }));
    this._register(this.debugService.onDidEndSession(async () => {
      await Promise.resolve();
      this.multiSessionRepl.set(this.isMultiSessionView);
    }));
    this._register(this.themeService.onDidColorThemeChange(() => {
      this.refreshReplElements(false);
      if (this.isVisible()) {
        this.updateInputDecoration();
      }
    }));
    this._register(this.onDidChangeBodyVisibility((visible) => {
      if (!visible) {
        return;
      }
      if (!this.model) {
        this.model = this.modelService.getModel(Repl.URI) || this.modelService.createModel("", null, Repl.URI, true);
      }
      const focusedSession = this.debugService.getViewModel().focusedSession;
      if (this.tree && this.tree.getInput() !== focusedSession) {
        this.onDidFocusSession(focusedSession);
      }
      this.setMode();
      this.replInput.setModel(this.model);
      this.updateInputDecoration();
      this.refreshReplElements(true);
      if (this.styleChangedWhenInvisible) {
        this.styleChangedWhenInvisible = false;
        if (this.tree?.getInput()) {
          this.tree.updateChildren(void 0, true, false);
        }
        this.onDidStyleChange();
      }
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("debug.console.wordWrap") && this.tree) {
        this.tree.dispose();
        this.treeContainer.innerText = "";
        clearNode(this.treeContainer);
        this.createReplTree();
      }
      if (e.affectsConfiguration("debug.console.acceptSuggestionOnEnter")) {
        const config = this.configurationService.getValue("debug");
        this.replInput.updateOptions({
          acceptSuggestionOnEnter: config.console.acceptSuggestionOnEnter === "on" ? "on" : "off"
        });
      }
    }));
    this._register(this.editorService.onDidActiveEditorChange(() => {
      this.setMode();
    }));
    this._register(this.filterWidget.onDidChangeFilterText(() => {
      this.filter.filterQuery = this.filterWidget.getFilterText();
      if (this.tree) {
        this.tree.refilter();
        revealLastElement(this.tree);
      }
    }));
  }
  async onDidFocusSession(session) {
    if (session) {
      sessionsToIgnore.delete(session);
      this.completionItemProvider?.dispose();
      if (session.capabilities.supportsCompletionsRequest) {
        this.completionItemProvider = this.languageFeaturesService.completionProvider.register({ scheme: DEBUG_SCHEME, pattern: "**/replinput", hasAccessToAllModels: true }, {
          _debugDisplayName: "debugConsole",
          triggerCharacters: session.capabilities.completionTriggerCharacters || ["."],
          provideCompletionItems: async (_, position2, _context, token) => {
            this.setHistoryNavigationEnablement(false);
            const model = this.replInput.getModel();
            if (model) {
              const text2 = model.getValue();
              const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
              const frameId = focusedStackFrame ? focusedStackFrame.frameId : void 0;
              const response = await session.completions(frameId, focusedStackFrame?.thread.threadId || 0, text2, position2, token);
              const suggestions = [];
              const computeRange = (length) => Range2.fromPositions(position2.delta(0, -length), position2);
              if (response && response.body && response.body.targets) {
                response.body.targets.forEach((item) => {
                  if (item && item.label) {
                    let insertTextRules = void 0;
                    let insertText = item.text || item.label;
                    if (typeof item.selectionStart === "number") {
                      insertTextRules = 4 /* InsertAsSnippet */;
                      const selectionLength = typeof item.selectionLength === "number" ? item.selectionLength : 0;
                      const placeholder = selectionLength > 0 ? "${1:" + insertText.substring(item.selectionStart, item.selectionStart + selectionLength) + "}$0" : "$0";
                      insertText = insertText.substring(0, item.selectionStart) + placeholder + insertText.substring(item.selectionStart + selectionLength);
                    }
                    const label3 = item.detail ? { label: item.label, description: item.detail } : item.label;
                    suggestions.push({
                      label: label3,
                      insertText,
                      kind: CompletionItemKinds.fromString(item.type || "property"),
                      filterText: item.start && item.length ? text2.substring(item.start, item.start + item.length).concat(item.label) : void 0,
                      range: computeRange(item.length || 0),
                      sortText: item.sortText,
                      insertTextRules
                    });
                  }
                });
              }
              if (this.configurationService.getValue("debug").console.historySuggestions) {
                const history = this.history.getHistory();
                const idxLength = String(history.length).length;
                history.forEach((h3, i2) => suggestions.push({
                  label: h3,
                  insertText: h3,
                  kind: 18 /* Text */,
                  range: computeRange(h3.length),
                  sortText: "ZZZ" + String(history.length - i2).padStart(idxLength, "0")
                }));
              }
              return { suggestions };
            }
            return Promise.resolve({ suggestions: [] });
          }
        });
      }
    }
    await this.selectSession();
  }
  getFilterStats() {
    return {
      total: this.tree?.getNode().children.length ?? 0,
      filtered: this.tree?.getNode().children.filter((c) => c.visible).length ?? 0
    };
  }
  get isReadonly() {
    const session = this.tree?.getInput();
    if (session && session.state !== 0 /* Inactive */) {
      return false;
    }
    return true;
  }
  showPreviousValue() {
    if (!this.isReadonly) {
      this.navigateHistory(true);
    }
  }
  showNextValue() {
    if (!this.isReadonly) {
      this.navigateHistory(false);
    }
  }
  focusFilter() {
    this.filterWidget.focus();
  }
  openFind() {
    this.tree?.openFind();
  }
  setMode() {
    if (!this.isVisible()) {
      return;
    }
    const activeEditorControl = this.editorService.activeTextEditorControl;
    if (isCodeEditor(activeEditorControl)) {
      this.modelChangeListener.dispose();
      this.modelChangeListener = activeEditorControl.onDidChangeModelLanguage(() => this.setMode());
      if (this.model && activeEditorControl.hasModel()) {
        this.model.setLanguage(activeEditorControl.getModel().getLanguageId());
      }
    }
  }
  onDidStyleChange() {
    if (!this.isVisible()) {
      this.styleChangedWhenInvisible = true;
      return;
    }
    if (this.styleElement) {
      this.replInput.updateOptions({
        fontSize: this.replOptions.replConfiguration.fontSize,
        lineHeight: this.replOptions.replConfiguration.lineHeight,
        fontFamily: this.replOptions.replConfiguration.fontFamily === "default" ? EDITOR_FONT_DEFAULTS.fontFamily : this.replOptions.replConfiguration.fontFamily
      });
      const replInputLineHeight = this.replInput.getOption(75 /* lineHeight */);
      this.styleElement.textContent = `
				.repl .repl-input-wrapper .repl-input-chevron {
					line-height: ${replInputLineHeight}px
				}

				.repl .repl-input-wrapper .monaco-editor .lines-content {
					background-color: ${this.replOptions.replConfiguration.backgroundColor};
				}
			`;
      const cssFontFamily = this.replOptions.replConfiguration.fontFamily === "default" ? "var(--monaco-monospace-font)" : this.replOptions.replConfiguration.fontFamily;
      this.container.style.setProperty(`--vscode-repl-font-family`, cssFontFamily);
      this.container.style.setProperty(`--vscode-repl-font-size`, `${this.replOptions.replConfiguration.fontSize}px`);
      this.container.style.setProperty(`--vscode-repl-font-size-for-twistie`, `${this.replOptions.replConfiguration.fontSizeForTwistie}px`);
      this.container.style.setProperty(`--vscode-repl-line-height`, this.replOptions.replConfiguration.cssLineHeight);
      this.tree?.rerender();
      if (this.bodyContentDimension) {
        this.layoutBodyContent(this.bodyContentDimension.height, this.bodyContentDimension.width);
      }
    }
  }
  navigateHistory(previous) {
    const historyInput = (previous ? this.history.previous() ?? this.history.first() : this.history.next()) ?? "";
    this.replInput.setValue(historyInput);
    status(historyInput);
    this.replInput.setPosition({ lineNumber: 1, column: historyInput.length + 1 });
    this.setHistoryNavigationEnablement(true);
  }
  async selectSession(session) {
    const treeInput = this.tree?.getInput();
    if (!session) {
      const focusedSession = this.debugService.getViewModel().focusedSession;
      if (focusedSession) {
        session = focusedSession;
      } else if (!treeInput || sessionsToIgnore.has(treeInput)) {
        session = this.debugService.getModel().getSessions(true).find((s) => !sessionsToIgnore.has(s));
      }
    }
    if (session) {
      this.replElementsChangeListener?.dispose();
      this.replElementsChangeListener = session.onDidChangeReplElements(() => {
        this.refreshReplElements(session.getReplElements().length === 0);
      });
      if (this.tree && treeInput !== session) {
        try {
          await this.tree.setInput(session);
        } catch (err) {
          this.logService.error(err);
        }
        revealLastElement(this.tree);
      }
    }
    this.replInput?.updateOptions({ readOnly: this.isReadonly });
    this.updateInputDecoration();
  }
  async clearRepl() {
    const session = this.tree?.getInput();
    if (session) {
      session.removeReplExpressions();
      if (session.state === 0 /* Inactive */) {
        sessionsToIgnore.add(session);
        await this.selectSession();
        this.multiSessionRepl.set(this.isMultiSessionView);
      }
    }
    this.replInput.focus();
  }
  acceptReplInput() {
    const session = this.tree?.getInput();
    if (session && !this.isReadonly) {
      session.addReplExpression(this.debugService.getViewModel().focusedStackFrame, this.replInput.getValue());
      revealLastElement(this.tree);
      this.history.add(this.replInput.getValue());
      this.replInput.setValue("");
      if (this.bodyContentDimension) {
        this.layoutBodyContent(this.bodyContentDimension.height, this.bodyContentDimension.width);
      }
    }
  }
  sendReplInput(input) {
    const session = this.tree?.getInput();
    if (session && !this.isReadonly) {
      session.addReplExpression(this.debugService.getViewModel().focusedStackFrame, input);
      revealLastElement(this.tree);
      this.history.add(input);
    }
  }
  getVisibleContent() {
    let text2 = "";
    if (this.model && this.tree) {
      const lineDelimiter4 = this.textResourcePropertiesService.getEOL(this.model.uri);
      const traverseAndAppend = (node) => {
        node.children.forEach((child) => {
          if (child.visible) {
            text2 += child.element.toString().trimRight() + lineDelimiter4;
            if (!child.collapsed && child.children.length) {
              traverseAndAppend(child);
            }
          }
        });
      };
      traverseAndAppend(this.tree.getNode());
    }
    return removeAnsiEscapeCodes(text2);
  }
  layoutBodyContent(height, width2) {
    this.bodyContentDimension = new Dimension(width2, height);
    const replInputHeight = Math.min(this.replInput.getContentHeight(), height);
    if (this.tree) {
      const lastElementVisible = this.tree.scrollTop + this.tree.renderHeight >= this.tree.scrollHeight;
      const treeHeight = height - replInputHeight;
      this.tree.getHTMLElement().style.height = `${treeHeight}px`;
      this.tree.layout(treeHeight, width2);
      if (lastElementVisible) {
        revealLastElement(this.tree);
      }
    }
    this.replInputContainer.style.height = `${replInputHeight}px`;
    this.replInput.layout({ width: width2 - 30, height: replInputHeight });
  }
  collapseAll() {
    this.tree?.collapseAll();
  }
  getDebugSession() {
    return this.tree?.getInput();
  }
  getReplInput() {
    return this.replInput;
  }
  getReplDataSource() {
    return this.replDataSource;
  }
  getFocusedElement() {
    return this.tree?.getFocus()?.[0];
  }
  focusTree() {
    this.tree?.domFocus();
  }
  async focus() {
    super.focus();
    await timeout(0);
    this.replInput.focus();
  }
  createActionViewItem(action) {
    if (action.id === selectReplCommandId) {
      const session = (this.tree ? this.tree.getInput() : void 0) ?? this.debugService.getViewModel().focusedSession;
      return this.instantiationService.createInstance(SelectReplActionViewItem, action, session);
    }
    return super.createActionViewItem(action);
  }
  get isMultiSessionView() {
    return this.debugService.getModel().getSessions(true).filter((s) => s.hasSeparateRepl() && !sessionsToIgnore.has(s)).length > 1;
  }
  get refreshScheduler() {
    const autoExpanded = /* @__PURE__ */ new Set();
    return new RunOnceScheduler(async () => {
      if (!this.tree || !this.tree.getInput() || !this.isVisible()) {
        return;
      }
      await this.tree.updateChildren(void 0, true, false, { diffIdentityProvider: identityProvider2 });
      const session = this.tree.getInput();
      if (session) {
        const autoExpandElements = async (elements) => {
          for (const element of elements) {
            if (element instanceof ReplGroup) {
              if (element.autoExpand && !autoExpanded.has(element.getId())) {
                autoExpanded.add(element.getId());
                await this.tree.expand(element);
              }
              if (!this.tree.isCollapsed(element)) {
                await autoExpandElements(element.getChildren());
              }
            }
          }
        };
        await autoExpandElements(session.getReplElements());
      }
      const { total, filtered } = this.getFilterStats();
      this.filterWidget.updateBadge(total === filtered || total === 0 ? void 0 : localize(14640, null, filtered, total));
    }, Repl.REFRESH_DELAY);
  }
  // --- Creation
  render() {
    super.render();
    this._register(registerNavigableContainer({
      name: "repl",
      focusNotifiers: [this, this.filterWidget],
      focusNextWidget: () => {
        const element = this.tree?.getHTMLElement();
        if (this.filterWidget.hasFocus()) {
          this.tree?.domFocus();
        } else if (element && isActiveElement(element)) {
          this.focus();
        }
      },
      focusPreviousWidget: () => {
        const element = this.tree?.getHTMLElement();
        if (this.replInput.hasTextFocus()) {
          this.tree?.domFocus();
        } else if (element && isActiveElement(element)) {
          this.focusFilter();
        }
      }
    }));
  }
  renderBody(parent) {
    super.renderBody(parent);
    this.container = append(parent, $102(".repl"));
    this.treeContainer = append(this.container, $102(`.repl-tree.${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`));
    this.createReplInput(this.container);
    this.createReplTree();
  }
  createReplTree() {
    this.replDelegate = new ReplDelegate(this.configurationService, this.replOptions);
    const wordWrap = this.configurationService.getValue("debug").console.wordWrap;
    this.treeContainer.classList.toggle("word-wrap", wordWrap);
    const expressionRenderer = this.instantiationService.createInstance(DebugExpressionRenderer);
    this.replDataSource = new ReplDataSource();
    const tree = this.tree = this.instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "DebugRepl",
      this.treeContainer,
      this.replDelegate,
      [
        this.instantiationService.createInstance(ReplVariablesRenderer, expressionRenderer),
        this.instantiationService.createInstance(ReplOutputElementRenderer, expressionRenderer),
        new ReplEvaluationInputsRenderer(),
        this.instantiationService.createInstance(ReplGroupRenderer, expressionRenderer),
        new ReplEvaluationResultsRenderer(expressionRenderer),
        new ReplRawObjectsRenderer(expressionRenderer)
      ],
      this.replDataSource,
      {
        filter: this.filter,
        accessibilityProvider: new ReplAccessibilityProvider(),
        identityProvider: identityProvider2,
        userSelection: true,
        mouseSupport: false,
        findWidgetEnabled: true,
        keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e.toString(true) },
        horizontalScrolling: !wordWrap,
        setRowLineHeight: false,
        supportDynamicHeights: wordWrap,
        overrideStyles: this.getLocationBasedColors().listOverrideStyles
      }
    );
    this._register(tree.onDidChangeContentHeight(() => {
      if (tree.scrollHeight !== this.previousTreeScrollHeight) {
        const lastElementWasVisible = tree.scrollTop + tree.renderHeight >= this.previousTreeScrollHeight - 2;
        if (lastElementWasVisible) {
          setTimeout(() => {
            revealLastElement(tree);
          }, 0);
        }
      }
      this.previousTreeScrollHeight = tree.scrollHeight;
    }));
    this._register(tree.onContextMenu((e) => this.onContextMenu(e)));
    this._register(tree.onDidChangeFindOpenState((open2) => this.findIsOpen = open2));
    let lastSelectedString;
    this._register(tree.onMouseClick(() => {
      if (this.findIsOpen) {
        return;
      }
      const selection = getWindow(this.treeContainer).getSelection();
      if (!selection || selection.type !== "Range" || lastSelectedString === selection.toString()) {
        this.replInput.focus();
      }
      lastSelectedString = selection ? selection.toString() : "";
    }));
    this.selectSession();
    this.styleElement = createStyleSheet(this.container, void 0, this._store);
    this.onDidStyleChange();
  }
  createReplInput(container3) {
    this.replInputContainer = append(container3, $102(".repl-input-wrapper"));
    append(this.replInputContainer, $102(".repl-input-chevron" + ThemeIcon.asCSSSelector(debugConsoleEvaluationPrompt)));
    const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this._register(registerAndCreateHistoryNavigationContext(this.scopedContextKeyService, this));
    this.setHistoryNavigationEnablement = (enabled) => {
      historyNavigationBackwardsEnablement.set(enabled);
      historyNavigationForwardsEnablement.set(enabled);
    };
    CONTEXT_IN_DEBUG_REPL.bindTo(this.scopedContextKeyService).set(true);
    this.scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
    const options3 = getSimpleEditorOptions(this.configurationService);
    options3.readOnly = true;
    options3.suggest = { showStatusBar: true };
    const config = this.configurationService.getValue("debug");
    options3.acceptSuggestionOnEnter = config.console.acceptSuggestionOnEnter === "on" ? "on" : "off";
    options3.ariaLabel = this.getAriaLabel();
    this.replInput = this.scopedInstantiationService.createInstance(CodeEditorWidget, this.replInputContainer, options3, getSimpleCodeEditorWidgetOptions());
    let lastContentHeight = -1;
    this._register(this.replInput.onDidChangeModelContent(() => {
      const model = this.replInput.getModel();
      this.setHistoryNavigationEnablement(!!model && model.getValue() === "");
      const contentHeight = this.replInput.getContentHeight();
      if (contentHeight !== lastContentHeight) {
        lastContentHeight = contentHeight;
        if (this.bodyContentDimension) {
          this.layoutBodyContent(this.bodyContentDimension.height, this.bodyContentDimension.width);
        }
      }
    }));
    this._register(this.replInput.onDidFocusEditorText(() => this.updateInputDecoration()));
    this._register(this.replInput.onDidBlurEditorText(() => this.updateInputDecoration()));
    this._register(addStandardDisposableListener(this.replInputContainer, EventType.FOCUS, () => this.replInputContainer.classList.add("synthetic-focus")));
    this._register(addStandardDisposableListener(this.replInputContainer, EventType.BLUR, () => this.replInputContainer.classList.remove("synthetic-focus")));
  }
  getAriaLabel() {
    let ariaLabel = localize(14634, null);
    if (!this.configurationService.getValue("accessibility.verbosity.debug" /* Debug */)) {
      return ariaLabel;
    }
    const keybinding = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* OpenAccessibilityHelp */)?.getAriaLabel();
    if (keybinding) {
      ariaLabel = localize(14630, null, ariaLabel, keybinding);
    } else {
      ariaLabel = localize(14631, null, ariaLabel);
    }
    return ariaLabel;
  }
  onContextMenu(e) {
    const actions = getFlatContextMenuActions(this.menu.getActions({ arg: e.element, shouldForwardArgs: false }));
    this.contextMenuService.showContextMenu({
      getAnchor: () => e.anchor,
      getActions: () => actions,
      getActionsContext: () => e.element
    });
  }
  // --- Update
  refreshReplElements(noDelay) {
    if (this.tree && this.isVisible()) {
      if (this.refreshScheduler.isScheduled()) {
        return;
      }
      this.refreshScheduler.schedule(noDelay ? 0 : void 0);
    }
  }
  updateInputDecoration() {
    if (!this.replInput) {
      return;
    }
    const decorations = [];
    if (this.isReadonly && this.replInput.hasTextFocus() && !this.replInput.getValue()) {
      const transparentForeground = resolveColorValue(editorForeground, this.themeService.getColorTheme())?.transparent(0.4);
      decorations.push({
        range: {
          startLineNumber: 0,
          endLineNumber: 0,
          startColumn: 0,
          endColumn: 1
        },
        renderOptions: {
          after: {
            contentText: localize(14641, null),
            color: transparentForeground ? transparentForeground.toString() : void 0
          }
        }
      });
    }
    this.replInput.setDecorationsByType("repl-decoration", DECORATION_KEY3, decorations);
  }
  saveState() {
    const replHistory = this.history.getHistory();
    if (replHistory.length) {
      this.storageService.store(HISTORY_STORAGE_KEY, JSON.stringify(replHistory), 1 /* WORKSPACE */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(HISTORY_STORAGE_KEY, 1 /* WORKSPACE */);
    }
    const filterHistory = this.filterWidget.getHistory();
    if (filterHistory.length) {
      this.storageService.store(FILTER_HISTORY_STORAGE_KEY, JSON.stringify(filterHistory), 1 /* WORKSPACE */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(FILTER_HISTORY_STORAGE_KEY, 1 /* WORKSPACE */);
    }
    const filterValue = this.filterWidget.getFilterText();
    if (filterValue) {
      this.storageService.store(FILTER_VALUE_STORAGE_KEY, filterValue, 1 /* WORKSPACE */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(FILTER_VALUE_STORAGE_KEY, 1 /* WORKSPACE */);
    }
    super.saveState();
  }
  dispose() {
    this.replInput?.dispose();
    this.replElementsChangeListener?.dispose();
    this.refreshScheduler.dispose();
    this.modelChangeListener.dispose();
    super.dispose();
  }
};

__decorateClass([
  memoize
], Repl.prototype, "refreshScheduler", 1);

Repl = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IModelService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, ICodeEditorService),
  __decorateParam(8, IViewDescriptorService),
  __decorateParam(9, IContextMenuService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, ITextResourcePropertiesService),
  __decorateParam(12, IEditorService),
  __decorateParam(13, IKeybindingService),
  __decorateParam(14, IOpenerService),
  __decorateParam(15, IHoverService),
  __decorateParam(16, IMenuService),
  __decorateParam(17, ILanguageFeaturesService),
  __decorateParam(18, ILogService)
], Repl);

var ReplOptions = class extends Disposable {
  constructor(viewId, backgroundColorDelegate, configurationService, themeService, viewDescriptorService) {
    super();
    this.backgroundColorDelegate = backgroundColorDelegate;
    this.configurationService = configurationService;
    this.themeService = themeService;
    this.viewDescriptorService = viewDescriptorService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._register(this.themeService.onDidColorThemeChange((e) => this.update()));
    this._register(this.viewDescriptorService.onDidChangeLocation((e) => {
      if (e.views.some((v2) => v2.id === viewId)) {
        this.update();
      }
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("debug.console.lineHeight") || e.affectsConfiguration("debug.console.fontSize") || e.affectsConfiguration("debug.console.fontFamily")) {
        this.update();
      }
    }));
    this.update();
  }
  static {
    this.lineHeightEm = 1.4;
  }
  get replConfiguration() {
    return this._replConfig;
  }
  update() {
    const debugConsole2 = this.configurationService.getValue("debug").console;
    this._replConfig = {
      fontSize: debugConsole2.fontSize,
      fontFamily: debugConsole2.fontFamily,
      lineHeight: debugConsole2.lineHeight ? debugConsole2.lineHeight : ReplOptions.lineHeightEm * debugConsole2.fontSize,
      cssLineHeight: debugConsole2.lineHeight ? `${debugConsole2.lineHeight}px` : `${ReplOptions.lineHeightEm}em`,
      backgroundColor: this.themeService.getColorTheme().getColor(this.backgroundColorDelegate()),
      fontSizeForTwistie: debugConsole2.fontSize * ReplOptions.lineHeightEm / 2 - 8
    };
    this._onDidChange.fire();
  }
};

ReplOptions = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IViewDescriptorService)
], ReplOptions);

var AcceptReplInputAction = class extends EditorAction {
  constructor() {
    super({
      id: "repl.action.acceptInput",
      label: localize2(14625, "Debug Console: Accept Input"),
      precondition: CONTEXT_IN_DEBUG_REPL,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 3 /* Enter */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor, editor) {
    SuggestController.get(editor)?.cancelSuggestWidget();
    const repl = getReplView(accessor.get(IViewsService));
    repl?.acceptReplInput();
  }
};

var FilterReplAction = class extends ViewAction {
  constructor() {
    super({
      viewId: REPL_VIEW_ID,
      id: "repl.action.filter",
      title: localize(14637, null),
      precondition: CONTEXT_IN_DEBUG_REPL,
      keybinding: [{
        when: EditorContextKeys.textInputFocus,
        primary: 2048 /* CtrlCmd */ | 36 /* KeyF */,
        weight: 100 /* EditorContrib */
      }]
    });
  }
  runInView(accessor, repl) {
    repl.focusFilter();
  }
};

var FindReplAction = class extends ViewAction {
  constructor() {
    super({
      viewId: REPL_VIEW_ID,
      id: "repl.action.find",
      title: localize(14638, null),
      precondition: CONTEXT_IN_DEBUG_REPL,
      keybinding: [{
        when: ContextKeyExpr.or(CONTEXT_IN_DEBUG_REPL, ContextKeyExpr.equals("focusedView", "workbench.panel.repl.view")),
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 36 /* KeyF */,
        weight: 100 /* EditorContrib */
      }],
      icon: Codicon.search,
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.equals("view", REPL_VIEW_ID),
        order: 15
      }, {
        id: MenuId.DebugConsoleContext,
        group: "z_commands",
        order: 25
      }]
    });
  }
  runInView(accessor, view) {
    view.openFind();
  }
};

var ReplCopyAllAction = class extends EditorAction {
  constructor() {
    super({
      id: "repl.action.copyAll",
      label: localize(14626, null),
      alias: "Debug Console Copy All",
      precondition: CONTEXT_IN_DEBUG_REPL
    });
  }
  run(accessor, editor) {
    const clipboardService = accessor.get(IClipboardService);
    const repl = getReplView(accessor.get(IViewsService));
    if (repl) {
      return clipboardService.writeText(repl.getVisibleContent());
    }
  }
};

registerEditorAction(AcceptReplInputAction);

registerEditorAction(ReplCopyAllAction);

registerAction2(FilterReplAction);

registerAction2(FindReplAction);

var SelectReplActionViewItem = class extends FocusSessionActionViewItem {
  getSessions() {
    return this.debugService.getModel().getSessions(true).filter((s) => s.hasSeparateRepl() && !sessionsToIgnore.has(s));
  }
  mapFocusedSessionToSelected(focusedSession) {
    while (focusedSession.parentSession && !focusedSession.hasSeparateRepl()) {
      focusedSession = focusedSession.parentSession;
    }
    return focusedSession;
  }
};

function getReplView(viewsService) {
  return viewsService.getActiveViewWithId(REPL_VIEW_ID) ?? void 0;
}

var selectReplCommandId = "workbench.action.debug.selectRepl";

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: selectReplCommandId,
      viewId: REPL_VIEW_ID,
      title: localize(14639, null),
      f1: false,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", REPL_VIEW_ID), CONTEXT_MULTI_SESSION_REPL),
        order: 20
      }
    });
  }
  async runInView(accessor, view, session) {
    const debugService = accessor.get(IDebugService);
    if (session && session.state !== 0 /* Inactive */ && session !== debugService.getViewModel().focusedSession) {
      session = resolveChildSession(session, debugService.getModel().getSessions());
      await debugService.focusStackFrame(void 0, void 0, session, { explicit: true });
    }
    await view.selectSession(session);
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "workbench.debug.panel.action.clearReplAction",
      viewId: REPL_VIEW_ID,
      title: localize2(14627, "Clear Console"),
      metadata: {
        description: localize2(14628, "Clears all program output from your debug REPL")
      },
      f1: true,
      icon: debugConsoleClearAll,
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.equals("view", REPL_VIEW_ID),
        order: 30
      }, {
        id: MenuId.DebugConsoleContext,
        group: "z_commands",
        order: 20
      }],
      keybinding: [{
        primary: 0,
        mac: { primary: 2048 /* CtrlCmd */ | 41 /* KeyK */ },
        // Weight is higher than work workbench contributions so the keybinding remains
        // highest priority when chords are registered afterwards
        weight: 200 /* WorkbenchContrib */ + 1,
        when: ContextKeyExpr.equals("focusedView", "workbench.panel.repl.view")
      }]
    });
  }
  runInView(_accessor, view) {
    const accessibilitySignalService = _accessor.get(IAccessibilitySignalService);
    view.clearRepl();
    accessibilitySignalService.playSignal(AccessibilitySignal.clear);
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "debug.collapseRepl",
      title: localize(14629, null),
      viewId: REPL_VIEW_ID,
      menu: {
        id: MenuId.DebugConsoleContext,
        group: "z_commands",
        order: 10
      }
    });
  }
  runInView(_accessor, view) {
    view.collapseAll();
    view.focus();
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "debug.replPaste",
      title: localize(14636, null),
      viewId: REPL_VIEW_ID,
      precondition: CONTEXT_DEBUG_STATE.notEqualsTo(getStateLabel(0 /* Inactive */)),
      menu: {
        id: MenuId.DebugConsoleContext,
        group: "2_cutcopypaste",
        order: 30
      }
    });
  }
  async runInView(accessor, view) {
    const clipboardService = accessor.get(IClipboardService);
    const clipboardText = await clipboardService.readText();
    if (clipboardText) {
      const replInput = view.getReplInput();
      replInput.setValue(replInput.getValue().concat(clipboardText));
      view.focus();
      const model = replInput.getModel();
      const lineNumber = model ? model.getLineCount() : 0;
      const column = model?.getLineMaxColumn(lineNumber);
      if (typeof lineNumber === "number" && typeof column === "number") {
        replInput.setPosition({ lineNumber, column });
      }
    }
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "workbench.debug.action.copyAll",
      title: localize(14633, null),
      viewId: REPL_VIEW_ID,
      menu: {
        id: MenuId.DebugConsoleContext,
        group: "2_cutcopypaste",
        order: 20
      }
    });
  }
  async runInView(accessor, view) {
    const clipboardService = accessor.get(IClipboardService);
    await clipboardService.writeText(view.getVisibleContent());
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "debug.replCopy",
      title: localize(14632, null),
      menu: {
        id: MenuId.DebugConsoleContext,
        group: "2_cutcopypaste",
        order: 10
      }
    });
  }
  async run(accessor, element) {
    const clipboardService = accessor.get(IClipboardService);
    const debugService = accessor.get(IDebugService);
    const nativeSelection = getActiveWindow().getSelection();
    const selectedText = nativeSelection?.toString();
    if (selectedText && selectedText.length > 0) {
      return clipboardService.writeText(selectedText);
    } else if (element) {
      const retValue = await this.tryEvaluateAndCopy(debugService, element);
      const textToCopy = retValue || removeAnsiEscapeCodes(element.toString());
      return clipboardService.writeText(textToCopy);
    }
  }
  async tryEvaluateAndCopy(debugService, element) {
    if (!(element instanceof ReplEvaluationResult)) {
      return;
    }
    const stackFrame = debugService.getViewModel().focusedStackFrame;
    const session = debugService.getViewModel().focusedSession;
    if (!stackFrame || !session || !session.capabilities.supportsClipboardContext) {
      return;
    }
    try {
      const evaluation = await session.evaluate(element.originalExpression, stackFrame.frameId, "clipboard");
      return evaluation?.body.result;
    } catch (e) {
      return;
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: FOCUS_REPL_ID,
      category: DEBUG_COMMAND_CATEGORY,
      title: localize2(14635, "Focus on Debug Console View")
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const repl = await viewsService.openView(REPL_VIEW_ID);
    await repl?.focus();
  }
});
export { revealLastElement, getReplView, $102, HISTORY_STORAGE_KEY, FILTER_HISTORY_STORAGE_KEY, FILTER_VALUE_STORAGE_KEY, DECORATION_KEY3, sessionsToIgnore, identityProvider2, Repl, ReplOptions, AcceptReplInputAction, FilterReplAction, FindReplAction, ReplCopyAllAction, SelectReplActionViewItem, selectReplCommandId };
