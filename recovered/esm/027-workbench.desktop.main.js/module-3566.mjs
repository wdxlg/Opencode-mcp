// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughPart.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { EditorPane } from "./module-1089.mjs";
import { DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { WalkThroughInput } from "./module-3564.mjs";
import { addDisposableListener, isHTMLAnchorElement, isHTMLButtonElement, isHTMLElement, size } from "./module-0075.mjs";
import { URI } from "./module-0032.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { safeSetInnerHtml } from "./module-0466.mjs";
import { deepClone } from "./module-0098.mjs";
import { isObject } from "./module-0010.mjs";
import { escape } from "./module-0030.mjs";
import { UILabelProvider } from "./module-0504.mjs";
import { OS } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";


// src/vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughPart.ts
var WALK_THROUGH_FOCUS = new RawContextKey("interactivePlaygroundFocus", false);

var UNBOUND_COMMAND = localize(22267, null);

var WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY = "walkThroughEditorViewState";

var WalkThroughPart = class extends EditorPane {
  constructor(group2, telemetryService, themeService, textResourceConfigurationService, instantiationService, openerService, keybindingService, storageService, contextKeyService, configurationService, notificationService, extensionService, editorGroupService) {
    super(WalkThroughPart.ID, group2, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.openerService = openerService;
    this.keybindingService = keybindingService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.notificationService = notificationService;
    this.extensionService = extensionService;
    this.disposables = new DisposableStore();
    this.contentDisposables = [];
    this.editorFocus = WALK_THROUGH_FOCUS.bindTo(this.contextKeyService);
    this.editorMemento = this.getEditorMemento(editorGroupService, textResourceConfigurationService, WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY);
  }
  static {
    this.ID = "workbench.editor.walkThroughPart";
  }
  createEditor(container3) {
    this.content = document.createElement("div");
    this.content.classList.add("welcomePageFocusElement");
    this.content.tabIndex = 0;
    this.content.style.outlineStyle = "none";
    this.scrollbar = new DomScrollableElement(this.content, {
      horizontal: 1 /* Auto */,
      vertical: 1 /* Auto */
    });
    this.disposables.add(this.scrollbar);
    container3.appendChild(this.scrollbar.getDomNode());
    this.registerFocusHandlers();
    this.registerClickHandler();
    this.disposables.add(this.scrollbar.onScroll((e) => this.updatedScrollPosition()));
  }
  updatedScrollPosition() {
    const scrollDimensions = this.scrollbar.getScrollDimensions();
    const scrollPosition = this.scrollbar.getScrollPosition();
    const scrollHeight = scrollDimensions.scrollHeight;
    if (scrollHeight && this.input instanceof WalkThroughInput) {
      const scrollTop = scrollPosition.scrollTop;
      const height = scrollDimensions.height;
      this.input.relativeScrollPosition(scrollTop / scrollHeight, (scrollTop + height) / scrollHeight);
    }
  }
  onTouchChange(event) {
    event.preventDefault();
    event.stopPropagation();
    const scrollPosition = this.scrollbar.getScrollPosition();
    this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop - event.translationY });
  }
  addEventListener(element, type, listener, useCapture) {
    element.addEventListener(type, listener, useCapture);
    return toDisposable(() => {
      element.removeEventListener(type, listener, useCapture);
    });
  }
  registerFocusHandlers() {
    this.disposables.add(this.addEventListener(this.content, "mousedown", (e) => {
      this.focus();
    }));
    this.disposables.add(this.addEventListener(this.content, "focus", (e) => {
      this.editorFocus.set(true);
    }));
    this.disposables.add(this.addEventListener(this.content, "blur", (e) => {
      this.editorFocus.reset();
    }));
    this.disposables.add(this.addEventListener(this.content, "focusin", (e) => {
      if (isHTMLElement(e.target) && e.target.classList.contains("zone-widget-container")) {
        const scrollPosition = this.scrollbar.getScrollPosition();
        this.content.scrollTop = scrollPosition.scrollTop;
        this.content.scrollLeft = scrollPosition.scrollLeft;
      }
      if (isHTMLElement(e.target)) {
        this.lastFocus = e.target;
      }
    }));
  }
  registerClickHandler() {
    this.disposables.add(this.addEventListener(this.content, "click", (event) => {
      for (let node = event.target; node; node = node.parentNode) {
        if (isHTMLAnchorElement(node) && node.href) {
          const baseElement = node.ownerDocument.getElementsByTagName("base")[0] || this.window.location;
          if (baseElement && node.href.indexOf(baseElement.href) >= 0 && node.hash) {
            const scrollTarget = this.content.querySelector(node.hash);
            const innerContent = this.content.firstElementChild;
            if (scrollTarget && innerContent) {
              const targetTop = scrollTarget.getBoundingClientRect().top - 20;
              const containerTop = innerContent.getBoundingClientRect().top;
              this.scrollbar.setScrollPosition({ scrollTop: targetTop - containerTop });
            }
          } else {
            this.open(URI.parse(node.href));
          }
          event.preventDefault();
          break;
        } else if (isHTMLButtonElement(node)) {
          const href = node.getAttribute("data-href");
          if (href) {
            this.open(URI.parse(href));
          }
          break;
        } else if (node === event.currentTarget) {
          break;
        }
      }
    }));
  }
  open(uri5) {
    if (uri5.scheme === "command" && uri5.path === "git.clone" && !CommandsRegistry.getCommand("git.clone")) {
      this.notificationService.info(localize(22266, null));
      return;
    }
    this.openerService.open(this.addFrom(uri5), { allowCommands: true });
  }
  addFrom(uri5) {
    if (uri5.scheme !== "command" || !(this.input instanceof WalkThroughInput)) {
      return uri5;
    }
    const query = uri5.query ? JSON.parse(uri5.query) : {};
    query.from = this.input.getTelemetryFrom();
    return uri5.with({ query: JSON.stringify(query) });
  }
  layout(dimension) {
    this.size = dimension;
    size(this.content, dimension.width, dimension.height);
    this.updateSizeClasses();
    this.contentDisposables.forEach((disposable) => {
      if (disposable instanceof CodeEditorWidget) {
        disposable.layout();
      }
    });
    const walkthroughInput = this.input instanceof WalkThroughInput && this.input;
    if (walkthroughInput && walkthroughInput.layout) {
      walkthroughInput.layout(dimension);
    }
    this.scrollbar.scanDomNode();
  }
  updateSizeClasses() {
    const innerContent = this.content.firstElementChild;
    if (this.size && innerContent) {
      innerContent.classList.toggle("max-height-685px", this.size.height <= 685);
    }
  }
  focus() {
    super.focus();
    let active = this.content.ownerDocument.activeElement;
    while (active && active !== this.content) {
      active = active.parentElement;
    }
    if (!active) {
      (this.lastFocus || this.content).focus();
    }
    this.editorFocus.set(true);
  }
  arrowUp() {
    const scrollPosition = this.scrollbar.getScrollPosition();
    this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop - this.getArrowScrollHeight() });
  }
  arrowDown() {
    const scrollPosition = this.scrollbar.getScrollPosition();
    this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop + this.getArrowScrollHeight() });
  }
  getArrowScrollHeight() {
    let fontSize = this.configurationService.getValue("editor.fontSize");
    if (typeof fontSize !== "number" || fontSize < 1) {
      fontSize = 12;
    }
    return 3 * fontSize;
  }
  pageUp() {
    const scrollDimensions = this.scrollbar.getScrollDimensions();
    const scrollPosition = this.scrollbar.getScrollPosition();
    this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop - scrollDimensions.height });
  }
  pageDown() {
    const scrollDimensions = this.scrollbar.getScrollDimensions();
    const scrollPosition = this.scrollbar.getScrollPosition();
    this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop + scrollDimensions.height });
  }
  setInput(input, options3, context2, token) {
    const store = new DisposableStore();
    this.contentDisposables.push(store);
    this.content.innerText = "";
    return super.setInput(input, options3, context2, token).then(async () => {
      if (input.resource.path.endsWith(".md")) {
        await this.extensionService.whenInstalledExtensionsRegistered();
      }
      return input.resolve();
    }).then((model) => {
      if (token.isCancellationRequested) {
        return;
      }
      const content2 = model.main;
      if (!input.resource.path.endsWith(".md")) {
        this.safeSetInnerHtml(this.content, content2);
        this.updateSizeClasses();
        this.decorateContent();
        this.contentDisposables.push(this.keybindingService.onDidUpdateKeybindings(() => this.decorateContent()));
        input.onReady?.(this.content.firstElementChild, store);
        this.scrollbar.scanDomNode();
        this.loadTextEditorViewState(input);
        this.updatedScrollPosition();
        return;
      }
      const innerContent = document.createElement("div");
      innerContent.classList.add("walkThroughContent");
      const markdown = this.expandMacros(content2);
      this.safeSetInnerHtml(innerContent, markdown);
      this.content.appendChild(innerContent);
      model.snippets.forEach((snippet, i2) => {
        const model2 = snippet.textEditorModel;
        if (!model2) {
          return;
        }
        const id2 = `snippet-${model2.uri.fragment}`;
        const div = innerContent.querySelector(`#${id2.replace(/[\\.]/g, "\\$&")}`);
        const options4 = this.getEditorOptions(model2.getLanguageId());
        const telemetryData = {
          target: this.input instanceof WalkThroughInput ? this.input.getTelemetryFrom() : void 0,
          snippet: i2
        };
        const editor = this.instantiationService.createInstance(CodeEditorWidget, div, options4, {
          telemetryData
        });
        editor.setModel(model2);
        this.contentDisposables.push(editor);
        const updateHeight = (initial) => {
          const position2 = editor.getPosition();
          const lineHeight = position2 ? editor.getLineHeightForPosition(position2) : editor.getOption(75 /* lineHeight */);
          const height = `${Math.max(model2.getLineCount() + 1, 4) * lineHeight}px`;
          if (div.style.height !== height) {
            div.style.height = height;
            editor.layout();
            if (!initial) {
              this.scrollbar.scanDomNode();
            }
          }
        };
        updateHeight(true);
        this.contentDisposables.push(editor.onDidChangeModelContent(() => updateHeight(false)));
        this.contentDisposables.push(editor.onDidChangeCursorPosition((e) => {
          const innerContent2 = this.content.firstElementChild;
          if (innerContent2) {
            const targetTop = div.getBoundingClientRect().top;
            const containerTop = innerContent2.getBoundingClientRect().top;
            const lineHeight = editor.getLineHeightForPosition(e.position);
            const lineTop = targetTop + (e.position.lineNumber - 1) * lineHeight - containerTop;
            const lineBottom = lineTop + lineHeight;
            const scrollDimensions = this.scrollbar.getScrollDimensions();
            const scrollPosition = this.scrollbar.getScrollPosition();
            const scrollTop = scrollPosition.scrollTop;
            const height = scrollDimensions.height;
            if (scrollTop > lineTop) {
              this.scrollbar.setScrollPosition({ scrollTop: lineTop });
            } else if (scrollTop < lineBottom - height) {
              this.scrollbar.setScrollPosition({ scrollTop: lineBottom - height });
            }
          }
        }));
        this.contentDisposables.push(this.configurationService.onDidChangeConfiguration((e) => {
          if (e.affectsConfiguration("editor") && snippet.textEditorModel) {
            editor.updateOptions(this.getEditorOptions(snippet.textEditorModel.getLanguageId()));
          }
        }));
      });
      this.updateSizeClasses();
      this.multiCursorModifier();
      this.contentDisposables.push(this.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("editor.multiCursorModifier")) {
          this.multiCursorModifier();
        }
      }));
      input.onReady?.(innerContent, store);
      this.scrollbar.scanDomNode();
      this.loadTextEditorViewState(input);
      this.updatedScrollPosition();
      this.contentDisposables.push(Gesture.addTarget(innerContent));
      this.contentDisposables.push(addDisposableListener(innerContent, EventType2.Change, (e) => this.onTouchChange(e)));
    });
  }
  safeSetInnerHtml(node, content2) {
    safeSetInnerHtml(node, content2, {
      allowedAttributes: {
        augment: [
          "id",
          "class",
          "style",
          "data-command",
          "data-href"
        ]
      }
    });
  }
  getEditorOptions(language2) {
    const config = deepClone(this.configurationService.getValue("editor", { overrideIdentifier: language2 }));
    return {
      ...isObject(config) ? config : /* @__PURE__ */ Object.create(null),
      scrollBeyondLastLine: false,
      scrollbar: {
        verticalScrollbarSize: 14,
        horizontal: "auto",
        useShadows: true,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        alwaysConsumeMouseWheel: false
      },
      overviewRulerLanes: 3,
      fixedOverflowWidgets: false,
      lineNumbersMinChars: 1,
      minimap: { enabled: false }
    };
  }
  expandMacros(input) {
    return input.replace(/kb\(([a-z.\d\-]+)\)/gi, (match2, kb) => {
      const keybinding = this.keybindingService.lookupKeybinding(kb);
      const shortcut = keybinding ? keybinding.getLabel() || "" : UNBOUND_COMMAND;
      return `<span class="shortcut">${escape(shortcut)}</span>`;
    });
  }
  decorateContent() {
    const keys = this.content.querySelectorAll(".shortcut[data-command]");
    Array.prototype.forEach.call(keys, (key3) => {
      const command4 = key3.getAttribute("data-command");
      const keybinding = command4 && this.keybindingService.lookupKeybinding(command4);
      const label3 = keybinding ? keybinding.getLabel() || "" : UNBOUND_COMMAND;
      while (key3.firstChild) {
        key3.firstChild.remove();
      }
      key3.appendChild(document.createTextNode(label3));
    });
    const ifkeys = this.content.querySelectorAll(".if_shortcut[data-command]");
    Array.prototype.forEach.call(ifkeys, (key3) => {
      const command4 = key3.getAttribute("data-command");
      const keybinding = command4 && this.keybindingService.lookupKeybinding(command4);
      key3.style.display = !keybinding ? "none" : "";
    });
  }
  multiCursorModifier() {
    const labels2 = UILabelProvider.modifierLabels[OS];
    const value2 = this.configurationService.getValue("editor.multiCursorModifier");
    const modifier = labels2[value2 === "ctrlCmd" ? OS === 2 /* Macintosh */ ? "metaKey" : "ctrlKey" : "altKey"];
    const keys = this.content.querySelectorAll(".multi-cursor-modifier");
    Array.prototype.forEach.call(keys, (key3) => {
      while (key3.firstChild) {
        key3.firstChild.remove();
      }
      key3.appendChild(document.createTextNode(modifier));
    });
  }
  saveTextEditorViewState(input) {
    const scrollPosition = this.scrollbar.getScrollPosition();
    this.editorMemento.saveEditorState(this.group, input, {
      viewState: {
        scrollTop: scrollPosition.scrollTop,
        scrollLeft: scrollPosition.scrollLeft
      }
    });
  }
  loadTextEditorViewState(input) {
    const state = this.editorMemento.loadEditorState(this.group, input);
    if (state) {
      this.scrollbar.setScrollPosition(state.viewState);
    }
  }
  clearInput() {
    if (this.input instanceof WalkThroughInput) {
      this.saveTextEditorViewState(this.input);
    }
    this.contentDisposables = dispose(this.contentDisposables);
    super.clearInput();
  }
  saveState() {
    if (this.input instanceof WalkThroughInput) {
      this.saveTextEditorViewState(this.input);
    }
    super.saveState();
  }
  dispose() {
    this.editorFocus.reset();
    this.contentDisposables = dispose(this.contentDisposables);
    this.disposables.dispose();
    super.dispose();
  }
};

WalkThroughPart = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, ITextResourceConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IOpenerService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, INotificationService),
  __decorateParam(11, IExtensionService),
  __decorateParam(12, IEditorGroupsService)
], WalkThroughPart);
export { WALK_THROUGH_FOCUS, UNBOUND_COMMAND, WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY, WalkThroughPart };
