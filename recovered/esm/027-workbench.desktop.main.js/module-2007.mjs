// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/browser/inlineChatAffordanceWidget.ts
import { MenuEntryActionViewItem } from "./module-0516.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { MenuId, MenuItemAction } from "./module-0092.mjs";
import { CodeActionController } from "./module-0566.mjs";
import { autorun } from "./module-0052.mjs";
import { Codicon } from "./module-0085.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { ICommandService } from "./module-0087.mjs";
import { $, reset } from "./module-0075.mjs";
import { Emitter } from "./module-0017.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { quickFixCommandId } from "./module-0559.mjs";
import { ACTION_ASK_IN_CHAT, ACTION_START } from "./module-2001.mjs";
import { computeIndentLevel } from "./module-0294.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/inlineChat/browser/inlineChatAffordanceWidget.ts
var QuickFixActionViewItem = class extends MenuEntryActionViewItem {
  #lightBulbStore = this._store.add(new MutableDisposable());
  #currentTitle;
  #editor;
  constructor(action, editor, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, accessibilityService, commandService) {
    const wrappedAction = new class extends MenuItemAction {
      constructor() {
        super(action.item, action.alt?.item, {}, action.hideActions, action.menuKeybinding, contextKeyService, commandService);
        this.elementGetter = () => void 0;
      }
      async run(...args2) {
        const controller = CodeActionController.get(editor);
        const info = controller?.lightBulbState.get();
        const element = this.elementGetter();
        if (controller && info && element) {
          const { bottom, left } = element.getBoundingClientRect();
          await controller.showCodeActions(info.trigger, info.actions, { x: left, y: bottom });
        }
      }
    }();
    super(wrappedAction, { draggable: false }, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, accessibilityService);
    this.#editor = editor;
    wrappedAction.elementGetter = () => this.element;
  }
  render(container3) {
    super.render(container3);
    this.#updateFromLightBulb();
  }
  getTooltip() {
    return this.#currentTitle ?? super.getTooltip();
  }
  #updateFromLightBulb() {
    const controller = CodeActionController.get(this.#editor);
    if (!controller) {
      return;
    }
    const store = new DisposableStore();
    this.#lightBulbStore.value = store;
    store.add(autorun((reader) => {
      const info = controller.lightBulbState.read(reader);
      if (this.label) {
        const icon2 = info?.icon ?? Codicon.lightBulb;
        const iconClasses = ThemeIcon.asClassNameArray(icon2);
        this.label.className = "";
        this.label.classList.add("codicon", "action-label", ...iconClasses);
      }
      this.#currentTitle = info?.title;
      this.updateTooltip();
    }));
  }
};

QuickFixActionViewItem = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IAccessibilityService),
  __decorateParam(8, ICommandService)
], QuickFixActionViewItem);

var LabelWithKeybindingActionViewItem = class extends MenuEntryActionViewItem {
  #kbLabel;
  constructor(action, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, accessibilityService) {
    super(action, { draggable: false }, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, accessibilityService);
    this.options.label = true;
    this.options.icon = false;
    this.#kbLabel = keybindingService.lookupKeybinding(action.id)?.getLabel() ?? void 0;
  }
  updateLabel() {
    if (this.label) {
      reset(
        this.label,
        this.action.label,
        ...this.#kbLabel ? [$("span.inline-chat-keybinding", void 0, this.#kbLabel)] : []
      );
    }
  }
};

LabelWithKeybindingActionViewItem = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IAccessibilityService)
], LabelWithKeybindingActionViewItem);

var InlineChatAffordanceWidget = class extends Disposable {
  constructor(editor, selection, instantiationService) {
    super();
    this.#id = `inline-chat-content-widget-${InlineChatAffordanceWidget.#idPool++}`;
    this.#position = null;
    this.#isVisible = false;
    this.#onDidRunAction = this._store.add(new Emitter());
    this.onDidRunAction = this.#onDidRunAction.event;
    this.allowEditorOverflow = true;
    this.suppressMouseDown = false;
    this.#editor = editor;
    this.#domNode = $(".inline-chat-content-widget");
    const toolbar = this._store.add(instantiationService.createInstance(MenuWorkbenchToolBar, this.#domNode, MenuId.InlineChatEditorAffordance, {
      telemetrySource: "inlineChatEditorAffordance",
      hiddenItemStrategy: 0 /* Ignore */,
      menuOptions: { renderShortTitle: true },
      toolbarOptions: { primaryGroup: () => true, useSeparatorsInPrimaryActions: true },
      actionViewItemProvider: (action) => {
        if (action instanceof MenuItemAction && action.id === quickFixCommandId) {
          return instantiationService.createInstance(QuickFixActionViewItem, action, this.#editor);
        }
        if (action instanceof MenuItemAction && (action.id === ACTION_START || action.id === ACTION_ASK_IN_CHAT || action.id === "inlineChat.fixDiagnostics")) {
          return instantiationService.createInstance(LabelWithKeybindingActionViewItem, action);
        }
        return void 0;
      }
    }));
    this._store.add(toolbar.actionRunner.onDidRun((e) => {
      this.#onDidRunAction.fire(e.action.id);
      this.#hide();
    }));
    this._store.add(autorun((r2) => {
      const sel = selection.read(r2);
      if (sel) {
        this.#show(sel);
      } else {
        this.#hide();
      }
    }));
    this._store.add(this.#editor.onDidScrollChange(() => {
      const sel = selection.get();
      if (!sel) {
        return;
      }
      const isInViewport = this.#isPositionInViewport();
      if (isInViewport && !this.#isVisible) {
        this.#show(sel);
      } else if (!isInViewport && this.#isVisible) {
        this.#hide();
      }
    }));
  }
  static #idPool = 0;
  #id;
  #domNode;
  #position;
  #isVisible;
  #onDidRunAction;
  #editor;
  #show(selection) {
    if (selection.isEmpty()) {
      this.#showAtLineStart(selection.getPosition().lineNumber);
    } else {
      this.#showAtSelection(selection);
    }
    if (this.#isVisible) {
      this.#editor.layoutContentWidget(this);
    } else {
      this.#editor.addContentWidget(this);
      this.#isVisible = true;
    }
  }
  #showAtSelection(selection) {
    const cursorPosition = selection.getPosition();
    const direction = selection.getDirection();
    const preference = direction === 1 /* RTL */ ? 1 /* ABOVE */ : 2 /* BELOW */;
    this.#position = {
      position: cursorPosition,
      preference: [preference]
    };
  }
  #showAtLineStart(lineNumber) {
    const model = this.#editor.getModel();
    if (!model) {
      return;
    }
    const tabSize = model.getOptions().tabSize;
    const fontInfo = this.#editor.getOptions().get(59 /* fontInfo */);
    const lineContent = model.getLineContent(lineNumber);
    const indent = computeIndentLevel(lineContent, tabSize);
    const lineHasSpace = indent < 0 ? true : fontInfo.spaceWidth * indent > 22;
    let effectiveLineNumber = lineNumber;
    if (!lineHasSpace) {
      const isLineEmptyOrIndented = (ln) => {
        const content2 = model.getLineContent(ln);
        return /^\s*$|^\s+/.test(content2);
      };
      const lineCount = model.getLineCount();
      if (lineNumber > 1 && isLineEmptyOrIndented(lineNumber - 1)) {
        effectiveLineNumber = lineNumber - 1;
      } else if (lineNumber < lineCount && isLineEmptyOrIndented(lineNumber + 1)) {
        effectiveLineNumber = lineNumber + 1;
      }
    }
    const effectiveColumnNumber = /^\S\s*$/.test(model.getLineContent(effectiveLineNumber)) ? 2 : 1;
    this.#position = {
      position: { lineNumber: effectiveLineNumber, column: effectiveColumnNumber },
      preference: [0 /* EXACT */]
    };
  }
  #isPositionInViewport() {
    const widgetPosition = this.#position?.position;
    if (!widgetPosition) {
      return false;
    }
    const visibleRanges = this.#editor.getVisibleRanges();
    const isLineVisible = visibleRanges.some(
      (range2) => widgetPosition.lineNumber >= range2.startLineNumber && widgetPosition.lineNumber <= range2.endLineNumber
    );
    if (!isLineVisible) {
      return false;
    }
    const scrolledPos = this.#editor.getScrolledVisiblePosition(widgetPosition);
    if (!scrolledPos) {
      return false;
    }
    const layoutInfo = this.#editor.getOptions().get(165 /* layoutInfo */);
    return scrolledPos.left >= 0 && scrolledPos.left <= layoutInfo.width;
  }
  #hide() {
    if (this.#isVisible) {
      this.#isVisible = false;
      this.#editor.removeContentWidget(this);
    }
  }
  getId() {
    return this.#id;
  }
  getDomNode() {
    return this.#domNode;
  }
  getPosition() {
    return this.#position;
  }
  beforeRender() {
    const position2 = this.#editor.getPosition();
    const lineHeight = position2 ? this.#editor.getLineHeightForPosition(position2) : this.#editor.getOption(75 /* lineHeight */);
    this.#domNode.style.setProperty("--vscode-inline-chat-affordance-height", `${lineHeight}px`);
    return null;
  }
  dispose() {
    if (this.#isVisible) {
      this.#editor.removeContentWidget(this);
    }
    super.dispose();
  }
};

InlineChatAffordanceWidget = __decorateClass([
  __decorateParam(2, IInstantiationService)
], InlineChatAffordanceWidget);
export { QuickFixActionViewItem, LabelWithKeybindingActionViewItem, InlineChatAffordanceWidget };
