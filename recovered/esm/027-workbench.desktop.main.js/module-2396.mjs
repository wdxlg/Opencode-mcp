// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/browser/inlineChatZoneWidget.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ZoneWidget } from "./module-0622.mjs";
import { observableValue } from "./module-0048.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { $, Dimension, addDisposableListener, getWindow } from "./module-0075.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { CTX_INLINE_CHAT_OUTER_CURSOR_POSITION, MENU_INLINE_CHAT_SIDE, MENU_INLINE_CHAT_WIDGET_SECONDARY } from "./module-2001.mjs";
import { autorun } from "./module-0052.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { EditorBasedInlineChatWidget } from "./module-2395.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { ChatMode } from "./module-1470.mjs";
import { Emitter } from "./module-0017.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { renderAsPlaintext, renderMarkdown } from "./module-0468.mjs";
import { ActionRunner } from "./module-0082.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { status } from "./module-0076.mjs";
import { assertType } from "./module-0010.mjs";
import { StableEditorBottomScrollState } from "./module-0447.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/inlineChat/browser/inlineChatZoneWidget.ts
var StatusPlaceholder = class _StatusPlaceholder extends Action2 {
  static {
    this.Id = "inlineChatWidget.statusPlaceholder";
  }
  static {
    this.CtxHasStatus = new RawContextKey("inlineChatHasStatus", false);
  }
  constructor() {
    super({
      id: _StatusPlaceholder.Id,
      title: "",
      precondition: ContextKeyExpr.false(),
      menu: {
        id: MenuId.ChatInput,
        when: ContextKeyExpr.and(ContextKeyExpr.equals(ChatContextKeys.location.key, "editor" /* EditorInline */), _StatusPlaceholder.CtxHasStatus),
        group: "navigation",
        order: Number.MAX_SAFE_INTEGER
      }
    });
  }
  run() {
  }
};

registerAction2(StatusPlaceholder);

var InlineChatZoneWidget = class extends ZoneWidget {
  constructor(location2, options3, editors, clearDelegate, instaService, actionViewItemService, logService, contextKeyService) {
    super(editors.editor, InlineChatZoneWidget.#options);
    this.status = observableValue(this, "");
    this.#terminationStore = new DisposableStore();
    this.notebookEditor = editors.notebookEditor;
    this.#logService = logService;
    this.#terminationCard = $("div.inline-chat-terminated-card.hidden");
    this.#terminationMarkdownContainer = $("div.markdown-scroll-container");
    this.#terminationMarkdownMessage = $("div.markdown-message");
    this.#terminationMarkdownContainer.appendChild(this.#terminationMarkdownMessage);
    this.#terminationMarkdownScrollable = this._disposables.add(new DomScrollableElement(this.#terminationMarkdownContainer, {
      consumeMouseWheelIfScrollbarIsNeeded: true,
      horizontal: 2 /* Hidden */,
      vertical: 1 /* Auto */
    }));
    this.#terminationCard.appendChild(this.#terminationMarkdownScrollable.getDomNode());
    const contentRow = $("div.content-row");
    this.#terminationToolbar = $("div.toolbar");
    contentRow.appendChild(this.#terminationToolbar);
    this.#terminationCard.appendChild(contentRow);
    this._disposables.add(this.#terminationStore);
    this.#ctxCursorPosition = CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.bindTo(contextKeyService);
    this.#ctxHasStatus = StatusPlaceholder.CtxHasStatus.bindTo(contextKeyService);
    this._disposables.add(toDisposable(() => {
      this.#ctxCursorPosition.reset();
      this.#ctxHasStatus.reset();
    }));
    this._disposables.add(autorun((r2) => {
      this.#ctxHasStatus.set(!!this.status.read(r2));
    }));
    InlineChatZoneWidget.#instances.add(this);
    this._disposables.add(toDisposable(() => {
      InlineChatZoneWidget.#instances.delete(this);
      if (InlineChatZoneWidget.#instances.size === 0) {
        InlineChatZoneWidget.#factoryRegistration?.dispose();
        InlineChatZoneWidget.#factoryRegistration = void 0;
      }
    }));
    this._disposables.add(autorun((r2) => {
      this.status.read(r2);
      InlineChatZoneWidget.#statusDidChange.fire();
    }));
    if (!InlineChatZoneWidget.#factoryRegistration) {
      InlineChatZoneWidget.#factoryRegistration = actionViewItemService.register(MenuId.ChatInput, StatusPlaceholder.Id, (action, options4) => {
        const item = new class extends ActionViewItem {
          render(container3) {
            super.render(container3);
            container3.classList.add("status-placeholder");
            const targetWindow = getWindow(container3);
            let handle2 = targetWindow.requestAnimationFrame(() => {
              handle2 = 0;
              const widget = InlineChatZoneWidget.#findByDom(container3);
              if (widget) {
                this._store.add(autorun((r2) => {
                  const value2 = widget.status.read(r2) ?? "";
                  this.action.label = value2;
                  this.updateLabel();
                }));
              }
            });
            this._store.add(toDisposable(() => {
              if (handle2) {
                targetWindow.cancelAnimationFrame(handle2);
              }
            }));
          }
        }(void 0, action, { ...options4, icon: false, label: true });
        return item;
      }, InlineChatZoneWidget.#statusDidChange.event);
    }
    this.widget = instaService.createInstance(EditorBasedInlineChatWidget, location2, this.editor, {
      secondaryMenuId: MENU_INLINE_CHAT_WIDGET_SECONDARY,
      inZoneWidget: true,
      chatWidgetViewOptions: {
        menus: {
          telemetrySource: "interactiveEditorWidget-toolbar",
          inputSideToolbar: MENU_INLINE_CHAT_SIDE
        },
        clear: clearDelegate,
        ...options3,
        rendererOptions: {
          renderTextEditsAsSummary: (uri5) => {
            return isEqual2(uri5, editors.editor.getModel()?.uri);
          },
          renderDetectedCommandsWithRequest: true,
          ...options3?.rendererOptions
        },
        defaultMode: ChatMode.Ask
      }
    });
    this._disposables.add(this.widget);
    let revealFn;
    this._disposables.add(this.widget.chatWidget.onWillMaybeChangeHeight(() => {
      if (this.position) {
        revealFn = this.#createZoneAndScrollRestoreFn(this.position);
      }
    }));
    this._disposables.add(this.widget.onDidChangeHeight(() => {
      if (this.position && !this._usesResizeHeight) {
        revealFn ??= this.#createZoneAndScrollRestoreFn(this.position);
        const height = this.#computeHeight();
        this._relayout(height.linesValue);
        revealFn?.();
        revealFn = void 0;
      }
    }));
    this.create();
    this._disposables.add(autorun((r2) => {
      const isBusy = this.widget.requestInProgress.read(r2);
      this.domNode.firstElementChild?.classList.toggle("busy", isBusy);
    }));
    this._disposables.add(addDisposableListener(this.domNode, "click", (e) => {
      if (!this.editor.hasWidgetFocus() && !this.widget.hasFocus()) {
        this.editor.focus();
      }
    }, true));
    const updateCursorIsAboveContextKey = () => {
      if (!this.position || !this.editor.hasModel()) {
        this.#ctxCursorPosition.reset();
      } else if (this.position.lineNumber === this.editor.getPosition().lineNumber) {
        this.#ctxCursorPosition.set("above");
      } else if (this.position.lineNumber + 1 === this.editor.getPosition().lineNumber) {
        this.#ctxCursorPosition.set("below");
      } else {
        this.#ctxCursorPosition.reset();
      }
    };
    this._disposables.add(this.editor.onDidChangeCursorPosition((e) => updateCursorIsAboveContextKey()));
    this._disposables.add(this.editor.onDidFocusEditorText((e) => updateCursorIsAboveContextKey()));
    updateCursorIsAboveContextKey();
  }
  static #options = {
    showFrame: true,
    frameWidth: 1,
    // frameColor: 'var(--vscode-inlineChat-border)',
    isResizeable: true,
    showArrow: false,
    isAccessible: true,
    className: "inline-chat-widget",
    keepEditorSelection: true,
    showInHiddenAreas: true,
    ordinal: 5e4
  };
  static #instances = /* @__PURE__ */ new Set();
  static #statusDidChange = new Emitter();
  static #factoryRegistration;
  static #findByDom(element) {
    const widgetDom = element.closest(".inline-chat-widget");
    if (widgetDom) {
      for (const instance2 of InlineChatZoneWidget.#instances) {
        if (instance2.domNode === widgetDom) {
          return instance2;
        }
      }
    }
    return void 0;
  }
  #ctxCursorPosition;
  #ctxHasStatus;
  #dimension;
  #logService;
  #terminationCard;
  #terminationMarkdownContainer;
  #terminationMarkdownMessage;
  #terminationMarkdownScrollable;
  #terminationToolbar;
  #terminationStore;
  _fillContainer(container3) {
    container3.style.setProperty("--vscode-inlineChat-background", "var(--vscode-editor-background)");
    container3.appendChild(this.widget.domNode);
    container3.appendChild(this.#terminationCard);
  }
  showTerminationCard(message, instaService) {
    this.#terminationStore.clear();
    const markdownMessage = typeof message === "string" ? new MarkdownString(message, { supportThemeIcons: true }) : message;
    const text2 = renderAsPlaintext(typeof message === "string" ? new MarkdownString(message) : message);
    this.#terminationMarkdownMessage.replaceChildren();
    const rendered = this.#terminationStore.add(renderMarkdown(markdownMessage));
    this.#terminationMarkdownMessage.appendChild(rendered.element);
    this.#terminationMarkdownScrollable.getDomNode().classList.remove("hidden");
    this.#terminationMarkdownScrollable.scanDomNode();
    const editor = this.editor;
    const actionRunner = this.#terminationStore.add(new class extends ActionRunner {
      async runAction(action, context2) {
        editor.focus();
        return super.runAction(action, context2);
      }
    }());
    this.#terminationToolbar.replaceChildren();
    this.#terminationStore.add(instaService.createInstance(MenuWorkbenchToolBar, this.#terminationToolbar, MenuId.ChatEditorInlineExecute, {
      telemetrySource: "inlineChatZone.terminationToolbar",
      hiddenItemStrategy: 0 /* Ignore */,
      actionRunner,
      toolbarOptions: {
        primaryGroup: () => true,
        useSeparatorsInPrimaryActions: true
      },
      menuOptions: { renderShortTitle: true }
    }));
    this.widget.domNode.style.display = "none";
    this.#terminationCard.classList.remove("hidden");
    status(text2);
    if (this.position) {
      const revealFn = this.#createZoneAndScrollRestoreFn(this.position);
      const height = this.#computeHeight();
      this._relayout(height.linesValue);
      revealFn();
    }
  }
  hideTerminationCard() {
    this.#terminationStore.clear();
    this.#terminationCard.classList.add("hidden");
    this.widget.domNode.style.display = "";
    if (this.position) {
      const revealFn = this.#createZoneAndScrollRestoreFn(this.position);
      const height = this.#computeHeight();
      this._relayout(height.linesValue);
      revealFn();
    }
  }
  get isShowingTerminationCard() {
    return !this.#terminationCard.classList.contains("hidden");
  }
  _doLayout(heightInPixel) {
    this.#updatePadding();
    const info = this.editor.getLayoutInfo();
    const width2 = info.contentWidth - info.verticalScrollbarWidth;
    this.#dimension = new Dimension(width2, heightInPixel);
    this.widget.layout(this.#dimension);
    if (this.isShowingTerminationCard) {
      const maxHeight = Math.max(50, heightInPixel - 40);
      this.#terminationMarkdownScrollable.getDomNode().style.maxHeight = `${maxHeight}px`;
      this.#terminationMarkdownContainer.style.maxHeight = `${maxHeight}px`;
      this.#terminationMarkdownScrollable.scanDomNode();
    }
  }
  #computeHeight() {
    const editorHeight = this.notebookEditor?.getLayoutInfo().height ?? this.editor.getLayoutInfo().height;
    let innerHeight;
    if (this.isShowingTerminationCard) {
      innerHeight = this.#terminationCard.offsetHeight || 80;
    } else {
      innerHeight = this.widget.contentHeight;
    }
    const contentHeight = this._decoratingElementsHeight() + Math.min(innerHeight, Math.max(this.widget.minHeight, editorHeight * 0.42));
    const heightInLines = contentHeight / this.editor.getOption(75 /* lineHeight */);
    return { linesValue: heightInLines, pixelsValue: contentHeight };
  }
  _getResizeBounds() {
    const lineHeight = this.editor.getOption(75 /* lineHeight */);
    const decoHeight = this._decoratingElementsHeight();
    const minHeightPx = decoHeight + this.widget.minHeight;
    const maxHeightPx = decoHeight + this.widget.contentHeight;
    return {
      minLines: minHeightPx / lineHeight,
      maxLines: maxHeightPx / lineHeight
    };
  }
  _onWidth(_widthInPixel) {
    if (this.#dimension) {
      this._doLayout(this.#dimension.height);
    }
  }
  show(position2) {
    assertType(this.container);
    this.#updatePadding();
    const revealZone = this.#createZoneAndScrollRestoreFn(position2);
    super.show(position2, this.#computeHeight().linesValue);
    this.widget.chatWidget.setVisible(true);
    this.widget.focus();
    revealZone();
  }
  #updatePadding() {
    assertType(this.container);
    const info = this.editor.getLayoutInfo();
    const marginWithoutIndentation = info.glyphMarginWidth + info.lineNumbersWidth + info.decorationsWidth;
    this.container.style.paddingLeft = `${marginWithoutIndentation}px`;
  }
  reveal(position2) {
    const stickyScroll = this.editor.getOption(131 /* stickyScroll */);
    const magicValue = stickyScroll.enabled ? stickyScroll.maxLineCount : 0;
    this.editor.revealLines(position2.lineNumber + magicValue, position2.lineNumber + magicValue, 1 /* Immediate */);
    this.updatePositionAndHeight(position2);
  }
  updatePositionAndHeight(position2) {
    const revealZone = this.#createZoneAndScrollRestoreFn(position2);
    super.updatePositionAndHeight(position2, !this._usesResizeHeight ? this.#computeHeight().linesValue : void 0);
    revealZone();
  }
  #createZoneAndScrollRestoreFn(position2) {
    const scrollState = StableEditorBottomScrollState.capture(this.editor);
    const lineNumber = position2.lineNumber <= 1 ? 1 : 1 + position2.lineNumber;
    return () => {
      scrollState.restore(this.editor);
      const scrollTop = this.editor.getScrollTop();
      const lineTop = this.editor.getTopForLineNumber(lineNumber);
      const zoneTop = lineTop - this.#computeHeight().pixelsValue;
      const editorHeight = this.editor.getLayoutInfo().height;
      const lineBottom = this.editor.getBottomForLineNumber(lineNumber);
      let newScrollTop = zoneTop;
      let forceScrollTop = false;
      if (lineBottom >= scrollTop + editorHeight) {
        newScrollTop = lineBottom - editorHeight;
        forceScrollTop = true;
      }
      if (newScrollTop < scrollTop || forceScrollTop) {
        this.#logService.trace("[IE] REVEAL zone", { zoneTop, lineTop, lineBottom, scrollTop, newScrollTop, forceScrollTop });
        this.editor.setScrollTop(newScrollTop, 1 /* Immediate */);
      }
    };
  }
  revealRange(range2, isLastLine) {
  }
  hide() {
    const scrollState = StableEditorBottomScrollState.capture(this.editor);
    this.#ctxCursorPosition.reset();
    this.#terminationStore.clear();
    this.#terminationCard.classList.add("hidden");
    this.widget.domNode.style.display = "";
    this.widget.chatWidget.setVisible(false);
    super.hide();
    status(localize(16170, null));
    scrollState.restore(this.editor);
  }
};

InlineChatZoneWidget = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IActionViewItemService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IContextKeyService)
], InlineChatZoneWidget);
export { StatusPlaceholder, InlineChatZoneWidget };
