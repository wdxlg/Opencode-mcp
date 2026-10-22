// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/quickInputController.ts
import { $, EventType, addDisposableGenericMouseDownListener, addDisposableGenericMouseMoveListener, addDisposableGenericMouseUpListener, addDisposableListener, append, getActiveWindow, getWindow, hasParentWithClass, isAncestor, isAncestorOfActiveElement, isHTMLElement, onDidRegisterWindow, onWillUnregisterWindow, reset, trackFocus } from "./module-0075.mjs";
import { Disposable, MutableDisposable, dispose } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { EndOfQuickInputBoxContextKey, InQuickInputContextKey, InputBox2, QuickInputAlignmentContextKey, QuickInputTypeContextKey, QuickPick, QuickWidget, backButton } from "./module-1501.mjs";
import { mainWindow } from "./module-0002.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { ToolBar } from "./module-0503.mjs";
import { TriStateCheckbox, createToggleActionViewItemProvider } from "./module-0549.mjs";
import { localize } from "./module-0001.mjs";
import { defaultCheckboxStyles } from "./module-0513.mjs";
import { QuickInputBox } from "./module-1730.mjs";
import { CountBadge } from "./module-0638.mjs";
import { Button } from "./module-0546.mjs";
import { ProgressBar } from "./module-1331.mjs";
import { QuickInputList } from "./module-1731.mjs";
import { platform, setTimeout0 } from "./module-0014.mjs";
import { QuickInputTreeController } from "./module-1739.mjs";
import { isModifierKey } from "./module-0019.mjs";
import { autorun } from "./module-0052.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { isString } from "./module-0010.mjs";
import { severity_default } from "./module-0266.mjs";
import { QuickTree } from "./module-1740.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { getAnchorRect } from "./module-0471.mjs";
import { layout2d } from "./module-0470.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { getWindowControlsStyle } from "./module-0515.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { getZoomFactor } from "./module-0018.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/platform/quickinput/browser/quickInputController.ts
var $22 = $;

var VIEWSTATE_STORAGE_KEY = "workbench.quickInput.viewState";

var QUICK_INPUT_MOTION_CLOSING_CLASS = "quick-input-widget-closing";

var QUICK_INPUT_OVERLAY_CLASS = "quick-input-widget-overlay";

var QUICK_INPUT_CLOSE_ANIMATION_DURATION = 150;

var QUICK_INPUT_MOTION_ANCESTOR_CLASSES = ["modern-ui", "monaco-enable-motion"];

var QuickInputController = class extends Disposable {
  constructor(options3, layoutService, instantiationService, contextKeyService, storageService, contextMenuService) {
    super();
    this.options = options3;
    this.layoutService = layoutService;
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.contextMenuService = contextMenuService;
    this.enabled = true;
    this.onDidAcceptEmitter = this._register(new Emitter());
    this.onDidCustomEmitter = this._register(new Emitter());
    this.onDidTriggerButtonEmitter = this._register(new Emitter());
    this.keyMods = { ctrlCmd: false, alt: false, shift: false };
    this.controller = null;
    this.onShowEmitter = this._register(new Emitter());
    this.onShow = this.onShowEmitter.event;
    this.onHideEmitter = this._register(new Emitter());
    this.onHide = this.onHideEmitter.event;
    this.closeAnimation = this._register(new MutableDisposable());
    this._alignment = observableValue(this, "top");
    this.alignment = this._alignment;
    this.backButton = backButton;
    this.inQuickInputContext = InQuickInputContextKey.bindTo(contextKeyService);
    this.quickInputTypeContext = QuickInputTypeContextKey.bindTo(contextKeyService);
    this.endOfQuickInputBoxContext = EndOfQuickInputBoxContextKey.bindTo(contextKeyService);
    this.idPrefix = options3.idPrefix;
    this._container = options3.container;
    this.styles = options3.styles;
    this._register(Event2.runAndSubscribe(onDidRegisterWindow, ({ window: window2, disposables }) => this.registerKeyModsListeners(window2, disposables), { window: mainWindow, disposables: this._store }));
    this._register(onWillUnregisterWindow((window2) => {
      if (this.ui && getWindow(this.ui.container) === window2) {
        this.reparentUI(this.layoutService.mainContainer);
        this.layout(this.layoutService.mainContainerDimension, this.layoutService.mainContainerOffset.quickPickTop);
      }
    }));
    this.viewState = this.loadViewState();
  }
  static {
    this.MAX_WIDTH = 600;
  }
  get currentQuickInput() {
    return this.controller ?? void 0;
  }
  get container() {
    return this._container;
  }
  registerKeyModsListeners(window2, disposables) {
    const listener = (e) => {
      this.keyMods.ctrlCmd = e.ctrlKey || e.metaKey;
      this.keyMods.alt = e.altKey;
      this.keyMods.shift = e.shiftKey;
    };
    for (const event of [EventType.KEY_DOWN, EventType.KEY_UP, EventType.MOUSE_DOWN]) {
      disposables.add(addDisposableListener(window2, event, listener, true));
    }
  }
  getUI(showInActiveContainer) {
    if (this.ui) {
      if (showInActiveContainer) {
        if (getWindow(this._container) !== getWindow(this.layoutService.activeContainer)) {
          this.reparentUI(this.layoutService.activeContainer);
          this.layout(this.layoutService.activeContainerDimension, this.layoutService.activeContainerOffset.quickPickTop);
        }
      }
      return this.ui;
    }
    const container3 = append(this._container, $22(".quick-input-widget.show-file-icons"));
    container3.tabIndex = -1;
    container3.style.display = "none";
    const styleSheet = createStyleSheet(container3);
    const titleBar = append(container3, $22(".quick-input-titlebar"));
    const leftActionBar = this._register(new ToolBar(titleBar, this.contextMenuService, {
      hoverDelegate: this.options.hoverDelegate,
      actionViewItemProvider: createToggleActionViewItemProvider(this.styles.toggle),
      icon: true,
      label: false
    }));
    leftActionBar.getElement().classList.add("quick-input-left-action-bar");
    const title = append(titleBar, $22(".quick-input-title"));
    const rightActionBar = this._register(new ToolBar(titleBar, this.contextMenuService, {
      hoverDelegate: this.options.hoverDelegate,
      actionViewItemProvider: createToggleActionViewItemProvider(this.styles.toggle),
      icon: true,
      label: false
    }));
    rightActionBar.getElement().classList.add("quick-input-right-action-bar");
    const headerContainer = append(container3, $22(".quick-input-header"));
    const checkAll = this._register(new TriStateCheckbox(localize(3209, null), false, { ...defaultCheckboxStyles, size: 15 }));
    append(headerContainer, checkAll.domNode);
    this._register(checkAll.onChange(() => {
      const checked = checkAll.checked;
      list2.setAllVisibleChecked(checked === true);
    }));
    this._register(addDisposableListener(checkAll.domNode, EventType.CLICK, (e) => {
      if (e.x || e.y) {
        inputBox.setFocus();
      }
    }));
    const description2 = append(headerContainer, $22(".quick-input-description"));
    const inputContainer = append(headerContainer, $22(".quick-input-and-message"));
    const filterContainer = append(inputContainer, $22(".quick-input-filter"));
    const inputBox = this._register(new QuickInputBox(filterContainer, this.styles.inputBox, this.styles.toggle));
    inputBox.setAttribute("aria-describedby", `${this.idPrefix}message`);
    const visibleCountContainer = append(filterContainer, $22(".quick-input-visible-count"));
    visibleCountContainer.setAttribute("aria-live", "polite");
    visibleCountContainer.setAttribute("aria-atomic", "true");
    const visibleCount = this._register(new CountBadge(visibleCountContainer, { countFormat: localize(3211, null) }, this.styles.countBadge));
    const countContainer = append(filterContainer, $22(".quick-input-count"));
    countContainer.setAttribute("aria-live", "polite");
    const count2 = this._register(new CountBadge(countContainer, { countFormat: localize(3210, null) }, this.styles.countBadge));
    const inlineActionBar = this._register(new ToolBar(headerContainer, this.contextMenuService, {
      hoverDelegate: this.options.hoverDelegate,
      actionViewItemProvider: createToggleActionViewItemProvider(this.styles.toggle),
      icon: true,
      label: false
    }));
    inlineActionBar.getElement().classList.add("quick-input-inline-action-bar");
    const okContainer = append(headerContainer, $22(".quick-input-action"));
    const ok2 = this._register(new Button(okContainer, this.styles.button));
    ok2.label = localize(3206, null);
    this._register(ok2.onDidClick((e) => {
      this.onDidAcceptEmitter.fire();
    }));
    const customButtonContainer = append(headerContainer, $22(".quick-input-action"));
    const customButton = this._register(new Button(customButtonContainer, { ...this.styles.button, supportIcons: true }));
    customButton.label = localize(3205, null);
    this._register(customButton.onDidClick((e) => {
      this.onDidCustomEmitter.fire();
    }));
    const message = append(inputContainer, $22(`#${this.idPrefix}message.quick-input-message`));
    const progressBar = this._register(new ProgressBar(container3, this.styles.progressBar));
    progressBar.getContainer().classList.add("quick-input-progress");
    const widget = append(container3, $22(".quick-input-html-widget"));
    widget.tabIndex = -1;
    const description1 = append(container3, $22(".quick-input-description"));
    const listId = this.idPrefix + "list";
    const list2 = this._register(this.instantiationService.createInstance(QuickInputList, container3, this.options.hoverDelegate, this.options.linkOpenerDelegate, listId, this.styles));
    inputBox.setAttribute("aria-controls", listId);
    this._register(list2.onDidChangeFocus(() => {
      if (inputBox.hasFocus()) {
        const activeDescendant = list2.getActiveDescendant();
        if (activeDescendant) {
          inputBox.setAttribute("aria-activedescendant", activeDescendant);
          inputBox.setListFocusMode(true);
        } else {
          inputBox.removeAttribute("aria-activedescendant");
          inputBox.setListFocusMode(false);
        }
      }
    }));
    this._register(list2.onChangedAllVisibleChecked((checked) => {
      checkAll.checked = checked;
    }));
    this._register(list2.onChangedVisibleCount((c) => {
      visibleCount.setCount(c);
    }));
    this._register(list2.onChangedCheckedCount((c) => {
      setTimeout0(() => count2.setCount(c));
    }));
    this._register(list2.onLeave(() => {
      setTimeout(() => {
        if (!this.controller) {
          return;
        }
        inputBox.setFocus();
        if (this.controller instanceof QuickPick && this.controller.canSelectMany) {
          list2.clearFocus();
        }
      }, 0);
    }));
    const tree = this._register(this.instantiationService.createInstance(
      QuickInputTreeController,
      container3,
      this.options.hoverDelegate,
      this.styles
    ));
    this._register(tree.tree.onDidChangeFocus(() => {
      if (inputBox.hasFocus()) {
        const activeDescendant = tree.getActiveDescendant();
        if (activeDescendant) {
          inputBox.setAttribute("aria-activedescendant", activeDescendant);
          inputBox.setListFocusMode(true);
        } else {
          inputBox.removeAttribute("aria-activedescendant");
          inputBox.setListFocusMode(false);
        }
      }
    }));
    this._register(tree.onLeave(() => {
      setTimeout(() => {
        if (!this.controller) {
          return;
        }
        inputBox.setFocus();
        tree.tree.setFocus([]);
      }, 0);
    }));
    this._register(tree.onDidAccept(() => {
      this.onDidAcceptEmitter.fire();
    }));
    this._register(tree.tree.onDidChangeContentHeight(() => this.updateLayout()));
    const focusTracker = trackFocus(container3);
    this._register(focusTracker);
    this._register(addDisposableListener(container3, EventType.FOCUS, (e) => {
      const ui = this.getUI();
      if (isAncestor(e.relatedTarget, ui.inputContainer)) {
        const value2 = ui.inputBox.isSelectionAtEnd();
        if (this.endOfQuickInputBoxContext.get() !== value2) {
          this.endOfQuickInputBoxContext.set(value2);
        }
      }
      if (isAncestor(e.relatedTarget, ui.container)) {
        return;
      }
      this.inQuickInputContext.set(true);
      this.previousFocusElement = isHTMLElement(e.relatedTarget) ? e.relatedTarget : void 0;
    }, true));
    this._register(focusTracker.onDidBlur(() => {
      if (!this.getUI().ignoreFocusOut && !this.options.ignoreFocusOut()) {
        this.hide(1 /* Blur */);
      }
      this.inQuickInputContext.set(false);
      this.endOfQuickInputBoxContext.set(false);
      this.previousFocusElement = void 0;
    }));
    this._register(inputBox.onKeyDown((e) => {
      const value2 = this.getUI().inputBox.isSelectionAtEnd();
      if (this.endOfQuickInputBoxContext.get() !== value2) {
        this.endOfQuickInputBoxContext.set(value2);
      }
      if (!isModifierKey(e.keyCode)) {
        inputBox.removeAttribute("aria-activedescendant");
        inputBox.setListFocusMode(false);
      }
    }));
    this._register(addDisposableListener(container3, EventType.FOCUS, (e) => {
      inputBox.setFocus();
    }));
    this.dndController = this._register(this.instantiationService.createInstance(
      QuickInputDragAndDropController,
      this._container,
      container3,
      [
        {
          node: titleBar,
          includeChildren: true,
          excludeNodes: [leftActionBar.getElement(), rightActionBar.getElement()]
        },
        {
          node: headerContainer,
          includeChildren: false
        }
      ],
      this.viewState
    ));
    this._register(autorun((reader) => {
      const dndViewState = this.dndController?.dndViewState.read(reader);
      if (!dndViewState) {
        return;
      }
      if (dndViewState.top !== void 0 && dndViewState.left !== void 0) {
        this.viewState = {
          ...this.viewState,
          top: dndViewState.top,
          left: dndViewState.left
        };
      } else {
        this.viewState = void 0;
      }
      this.updateLayout();
      if (dndViewState.done) {
        this.saveViewState(this.viewState);
      }
    }));
    this._register(autorun((reader) => {
      this._alignment.set(this.dndController.alignment.read(reader), void 0);
    }));
    this.ui = {
      container: container3,
      styleSheet,
      leftActionBar,
      titleBar,
      title,
      description1,
      description2,
      widget,
      rightActionBar,
      inlineActionBar,
      checkAll,
      inputContainer,
      filterContainer,
      inputBox,
      visibleCountContainer,
      visibleCount,
      countContainer,
      count: count2,
      okContainer,
      ok: ok2,
      message,
      customButtonContainer,
      customButton,
      list: list2,
      tree,
      progressBar,
      onDidAccept: this.onDidAcceptEmitter.event,
      onDidCustom: this.onDidCustomEmitter.event,
      onDidTriggerButton: this.onDidTriggerButtonEmitter.event,
      ignoreFocusOut: false,
      keyMods: this.keyMods,
      show: (controller) => this.show(controller),
      hide: () => this.hide(),
      setVisibilities: (visibilities) => this.setVisibilities(visibilities),
      setEnabled: (enabled) => this.setEnabled(enabled),
      setContextKey: (contextKey) => this.options.setContextKey(contextKey),
      linkOpenerDelegate: (content2) => this.options.linkOpenerDelegate(content2)
    };
    this.updateStyles();
    return this.ui;
  }
  reparentUI(container3) {
    if (this.ui) {
      this._container = container3;
      append(this._container, this.ui.container);
      this.dndController?.reparentUI(this._container);
    }
  }
  pick(picks, options3 = {}, token = CancellationToken.None) {
    return new Promise((doResolve, reject) => {
      let resolve3 = (result) => {
        resolve3 = doResolve;
        options3.onKeyMods?.(input.keyMods);
        doResolve(result);
      };
      if (token.isCancellationRequested) {
        resolve3(void 0);
        return;
      }
      const input = this.createQuickPick({ useSeparators: true });
      let activeItem;
      const disposables = [
        input,
        input.onDidAccept(() => {
          if (input.canSelectMany) {
            resolve3(input.selectedItems.slice());
            input.hide();
          } else {
            const result = input.activeItems[0];
            if (result) {
              resolve3(result);
              input.hide();
            }
          }
        }),
        input.onDidChangeActive((items) => {
          const focused = items[0];
          if (focused && options3.onDidFocus) {
            options3.onDidFocus(focused);
          }
        }),
        input.onDidChangeSelection((items) => {
          if (!input.canSelectMany) {
            const result = items[0];
            if (result) {
              resolve3(result);
              input.hide();
            }
          }
        }),
        input.onDidTriggerItemButton((event) => options3.onDidTriggerItemButton && options3.onDidTriggerItemButton({
          ...event,
          removeItem: () => {
            const index2 = input.items.indexOf(event.item);
            if (index2 !== -1) {
              const items = input.items.slice();
              const removed = items.splice(index2, 1);
              const activeItems = input.activeItems.filter((activeItem2) => activeItem2 !== removed[0]);
              const keepScrollPositionBefore = input.keepScrollPosition;
              input.keepScrollPosition = true;
              input.items = items;
              if (activeItems) {
                input.activeItems = activeItems;
              }
              input.keepScrollPosition = keepScrollPositionBefore;
            }
          }
        })),
        input.onDidTriggerSeparatorButton((event) => options3.onDidTriggerSeparatorButton?.(event)),
        input.onDidChangeValue((value2) => {
          if (activeItem && !value2 && (input.activeItems.length !== 1 || input.activeItems[0] !== activeItem)) {
            input.activeItems = [activeItem];
          }
        }),
        token.onCancellationRequested(() => {
          input.hide();
        }),
        input.onDidHide(() => {
          dispose(disposables);
          resolve3(void 0);
        })
      ];
      input.title = options3.title;
      if (options3.value) {
        input.value = options3.value;
      }
      input.canSelectMany = !!options3.canPickMany;
      input.placeholder = options3.placeHolder;
      input.prompt = options3.prompt;
      input.ignoreFocusOut = !!options3.ignoreFocusLost;
      input.matchOnDescription = !!options3.matchOnDescription;
      input.matchOnDetail = !!options3.matchOnDetail;
      if (options3.sortByLabel !== void 0) {
        input.sortByLabel = options3.sortByLabel;
      }
      input.matchOnLabel = options3.matchOnLabel === void 0 || options3.matchOnLabel;
      input.quickNavigate = options3.quickNavigate;
      input.hideInput = !!options3.hideInput;
      input.contextKey = options3.contextKey;
      input.anchor = options3.anchor;
      input.anchorPosition = options3.anchorPosition;
      input.busy = true;
      Promise.all([picks, options3.activeItem]).then(([items, _activeItem]) => {
        activeItem = _activeItem;
        input.busy = false;
        input.items = items;
        if (input.canSelectMany) {
          input.selectedItems = items.filter((item) => item.type !== "separator" && item.picked);
        }
        if (activeItem) {
          input.activeItems = [activeItem];
        }
      });
      input.show();
      Promise.resolve(picks).then(void 0, (err) => {
        reject(err);
        input.hide();
      });
    });
  }
  setValidationOnInput(input, validationResult) {
    if (validationResult && isString(validationResult)) {
      input.severity = severity_default.Error;
      input.validationMessage = validationResult;
    } else if (validationResult && !isString(validationResult)) {
      input.severity = validationResult.severity;
      input.validationMessage = validationResult.content;
    } else {
      input.severity = severity_default.Ignore;
      input.validationMessage = void 0;
    }
  }
  input(options3 = {}, token = CancellationToken.None) {
    return new Promise((resolve3) => {
      if (token.isCancellationRequested) {
        resolve3(void 0);
        return;
      }
      const input = this.createInputBox();
      const validateInput = options3.validateInput || (() => Promise.resolve(void 0));
      const onDidValueChange = Event2.debounce(input.onDidChangeValue, (last, cur) => cur, 100);
      let validationValue = options3.value || "";
      let validation = Promise.resolve(validateInput(validationValue));
      const disposables = [
        input,
        onDidValueChange((value2) => {
          if (value2 !== validationValue) {
            validation = Promise.resolve(validateInput(value2));
            validationValue = value2;
          }
          validation.then((result) => {
            if (value2 === validationValue) {
              this.setValidationOnInput(input, result);
            }
          });
        }),
        input.onDidAccept(() => {
          const value2 = input.value;
          if (value2 !== validationValue) {
            validation = Promise.resolve(validateInput(value2));
            validationValue = value2;
          }
          validation.then((result) => {
            if (!result || !isString(result) && result.severity !== severity_default.Error) {
              resolve3(value2);
              input.hide();
            } else if (value2 === validationValue) {
              this.setValidationOnInput(input, result);
            }
          });
        }),
        token.onCancellationRequested(() => {
          input.hide();
        }),
        input.onDidHide(() => {
          dispose(disposables);
          resolve3(void 0);
        })
      ];
      input.title = options3.title;
      input.value = options3.value || "";
      input.valueSelection = options3.valueSelection;
      input.prompt = options3.prompt;
      input.placeholder = options3.placeHolder;
      input.password = !!options3.password;
      input.ignoreFocusOut = !!options3.ignoreFocusLost;
      input.show();
    });
  }
  createQuickPick(options3 = { useSeparators: false }) {
    const ui = this.getUI(true);
    return new QuickPick(ui);
  }
  createInputBox() {
    const ui = this.getUI(true);
    return new InputBox2(ui);
  }
  setAlignment(alignment) {
    if (this.controller?.anchor) {
      return;
    }
    this.dndController?.setAlignment(alignment);
  }
  createQuickWidget() {
    const ui = this.getUI(true);
    return new QuickWidget(ui);
  }
  createQuickTree() {
    const ui = this.getUI(true);
    return new QuickTree(ui);
  }
  show(controller) {
    this.completeCloseAnimation();
    const ui = this.getUI(true);
    const oldController = this.controller;
    this.controller = controller;
    oldController?.didHide();
    if (isHTMLElement(controller.anchor)) {
      const anchorWindow = getWindow(controller.anchor);
      if (getWindow(this._container) !== anchorWindow) {
        this.reparentUI(this.layoutService.getContainer(anchorWindow));
      }
    }
    this.setEnabled(true);
    ui.leftActionBar.setActions([]);
    ui.title.textContent = "";
    ui.description1.textContent = "";
    ui.description2.textContent = "";
    reset(ui.widget);
    ui.rightActionBar.setActions([]);
    ui.inlineActionBar.setActions([]);
    ui.checkAll.checked = false;
    ui.inputBox.placeholder = "";
    ui.inputBox.password = false;
    ui.inputBox.showDecoration(severity_default.Ignore);
    ui.visibleCount.setCount(0);
    ui.count.setCount(0);
    ui.countContainer.style.right = "4px";
    reset(ui.message);
    ui.progressBar.stop();
    ui.progressBar.getContainer().setAttribute("aria-hidden", "true");
    ui.list.setElements([]);
    ui.list.matchOnDescription = false;
    ui.list.matchOnDetail = false;
    ui.list.matchOnLabel = true;
    ui.list.sortByLabel = true;
    ui.tree.updateFilterOptions({
      matchOnDescription: false,
      matchOnLabel: true
    });
    ui.tree.sortByLabel = true;
    ui.ignoreFocusOut = false;
    ui.inputBox.toggles = void 0;
    ui.inputBox.actions = void 0;
    ui.inputBox.setHeight(void 0);
    const backKeybindingLabel = this.options.backKeybindingLabel();
    backButton.tooltip = backKeybindingLabel ? localize(3208, null, backKeybindingLabel) : localize(3207, null);
    this.overlayLayoutCorrection = void 0;
    ui.container.classList.toggle(QUICK_INPUT_OVERLAY_CLASS, controller.anchorPosition === "overlay");
    ui.container.style.display = "";
    this.updateLayout();
    this.dndController?.setEnabled(!controller.anchor);
    this.dndController?.layoutContainer();
    if (controller.anchor) {
      this._alignment.set("custom", void 0);
    } else {
      this._alignment.set(this.dndController?.alignment.get() ?? "top", void 0);
    }
    this.onShowEmitter.fire();
    ui.inputBox.setFocus();
    this.quickInputTypeContext.set(controller.type);
  }
  isVisible() {
    return !!this.controller;
  }
  setVisibilities(visibilities) {
    const ui = this.getUI();
    ui.title.style.display = visibilities.title ? "" : "none";
    ui.description1.style.display = visibilities.description && (visibilities.inputBox || visibilities.checkAll) ? "" : "none";
    ui.description2.style.display = visibilities.description && !(visibilities.inputBox || visibilities.checkAll) ? "" : "none";
    ui.checkAll.domNode.style.display = visibilities.checkAll ? "" : "none";
    ui.inputContainer.style.display = visibilities.inputBox ? "" : "none";
    ui.filterContainer.style.display = visibilities.inputBox ? "" : "none";
    ui.visibleCountContainer.style.display = visibilities.visibleCount ? "" : "none";
    ui.countContainer.style.display = visibilities.count ? "" : "none";
    ui.okContainer.style.display = visibilities.ok ? "" : "none";
    ui.customButtonContainer.style.display = visibilities.customButton ? "" : "none";
    ui.message.style.display = visibilities.message ? "" : "none";
    ui.progressBar.getContainer().style.display = visibilities.progressBar ? "" : "none";
    ui.list.displayed = !!visibilities.list;
    ui.tree.displayed = !!visibilities.tree;
    ui.container.classList.toggle("show-checkboxes", !!visibilities.checkBox);
    ui.container.classList.toggle("hidden-input", !visibilities.inputBox && !visibilities.description);
    this.overlayLayoutCorrection = void 0;
    this.updateLayout();
  }
  setEnabled(enabled) {
    if (enabled !== this.enabled) {
      this.enabled = enabled;
      const ui = this.getUI();
      for (let i2 = 0; i2 < ui.leftActionBar.getItemsLength(); i2++) {
        const action = ui.leftActionBar.getItemAction(i2);
        if (action) {
          action.enabled = enabled;
        }
      }
      for (let i2 = 0; i2 < ui.rightActionBar.getItemsLength(); i2++) {
        const action = ui.rightActionBar.getItemAction(i2);
        if (action) {
          action.enabled = enabled;
        }
      }
      if (enabled) {
        ui.checkAll.enable();
      } else {
        ui.checkAll.disable();
      }
      ui.inputBox.enabled = enabled;
      ui.ok.enabled = enabled;
      ui.list.enabled = enabled;
    }
  }
  hide(reason) {
    const controller = this.controller;
    if (!controller) {
      return;
    }
    controller.willHide(reason);
    const container3 = this.ui?.container;
    const focusChanged = container3 && !isAncestorOfActiveElement(container3);
    this.controller = null;
    this.onHideEmitter.fire();
    if (container3) {
      if (!container3.classList.contains(QUICK_INPUT_OVERLAY_CLASS) && hasParentWithClass(container3, QUICK_INPUT_MOTION_ANCESTOR_CLASSES)) {
        container3.inert = true;
        container3.classList.add(QUICK_INPUT_MOTION_CLOSING_CLASS);
        this.closeAnimation.value = disposableTimeout(() => this.completeCloseAnimation(), QUICK_INPUT_CLOSE_ANIMATION_DURATION);
      } else {
        container3.style.display = "none";
      }
    }
    if (!focusChanged) {
      let currentElement = this.previousFocusElement;
      while (currentElement && !currentElement.offsetParent) {
        currentElement = currentElement.parentElement ?? void 0;
      }
      if (currentElement?.offsetParent) {
        currentElement.focus();
        this.previousFocusElement = void 0;
      } else {
        this.options.returnFocus();
      }
    }
    controller.didHide(reason);
  }
  completeCloseAnimation() {
    if (!this.closeAnimation.value) {
      return;
    }
    this.closeAnimation.clear();
    const container3 = this.ui?.container;
    if (container3) {
      container3.inert = false;
      container3.classList.remove(QUICK_INPUT_MOTION_CLOSING_CLASS);
      container3.style.display = "none";
    }
  }
  dispose() {
    this.completeCloseAnimation();
    super.dispose();
  }
  focus() {
    if (this.isVisible()) {
      const ui = this.getUI();
      if (ui.inputBox.enabled) {
        ui.inputBox.setFocus();
      } else {
        ui.list.domFocus();
      }
    }
  }
  toggle() {
    if (!this.isVisible()) {
      return;
    }
    if (this.controller instanceof QuickPick && this.controller.canSelectMany) {
      this.getUI().list.toggleCheckbox();
    } else if (this.controller instanceof QuickTree) {
      this.getUI().tree.toggleCheckbox();
    }
  }
  toggleHover() {
    if (this.isVisible() && this.controller instanceof QuickPick) {
      this.getUI().list.toggleHover();
    }
  }
  navigate(next, quickNavigate) {
    if (this.isVisible() && this.getUI().list.displayed) {
      this.getUI().list.focus(next ? 4 /* Next */ : 5 /* Previous */);
      if (quickNavigate && this.controller instanceof QuickPick) {
        this.controller.quickNavigate = quickNavigate;
      }
    }
  }
  async accept(keyMods = { alt: false, ctrlCmd: false, shift: false }) {
    this.keyMods.alt = keyMods.alt;
    this.keyMods.ctrlCmd = keyMods.ctrlCmd;
    this.keyMods.shift = keyMods.shift;
    this.onDidAcceptEmitter.fire();
  }
  async back() {
    this.onDidTriggerButtonEmitter.fire(this.backButton);
  }
  async cancel(reason) {
    this.hide(reason);
  }
  layout(dimension, titleBarOffset) {
    this.dimension = dimension;
    this.titleBarOffset = titleBarOffset;
    this.overlayLayoutCorrection = void 0;
    this.updateLayout();
  }
  updateLayout() {
    if (this.ui && this.isVisible()) {
      const style = this.ui.container.style;
      let width2 = Math.min(this.dimension.width * 0.62, QuickInputController.MAX_WIDTH);
      style.width = width2 + "px";
      let listHeight = this.dimension && this.dimension.height * 0.4;
      let overlayAnchor;
      if (this.controller?.anchor) {
        const target = this.controller.anchor;
        const isElement = isHTMLElement(target);
        const anchorWindow = isElement ? getWindow(target) : getActiveWindow();
        const container3 = this.layoutService.getContainer(anchorWindow).getBoundingClientRect();
        const verticalPadding = 6 + 26 + 16;
        let anchor = getAnchorRect(target);
        let preferredAnchorPosition = 1 /* ABOVE */;
        let listHeightRatio = 0.2;
        let maxListHeight = 200;
        if (this.controller.anchorPosition === "overlay") {
          overlayAnchor = anchor;
          this.ui.inputBox.setHeight(anchor.height);
          width2 = anchor.width;
          listHeightRatio = 0.4;
          anchor = { ...anchor, height: 0 };
          maxListHeight = Math.min(400, container3.bottom - anchor.top - verticalPadding);
          preferredAnchorPosition = 0 /* BELOW */;
        } else {
          width2 = 380;
        }
        listHeight = this.dimension ? Math.min(this.dimension.height * listHeightRatio, maxListHeight) : maxListHeight;
        const containerHeight = Math.floor(listHeight) + verticalPadding;
        const { top: top2, left, right, bottom, anchorAlignment, anchorPosition } = layout2d(container3, { width: width2, height: containerHeight }, anchor, { anchorPosition: preferredAnchorPosition });
        if (anchorAlignment === 1 /* RIGHT */) {
          style.right = `${right}px`;
          style.left = "initial";
        } else {
          style.left = `${left}px`;
          style.right = "initial";
        }
        if (anchorPosition === 1 /* ABOVE */) {
          style.bottom = `${bottom}px`;
          style.top = "initial";
        } else {
          style.top = `${top2}px`;
          style.bottom = "initial";
        }
        style.width = `${width2}px`;
        style.height = "";
      } else {
        style.top = `${this.viewState?.top !== void 0 ? Math.round(this.dimension.height * this.viewState.top) : this.titleBarOffset}px`;
        style.left = `${Math.round(this.dimension.width * (this.viewState?.left ?? 0.5) - width2 / 2)}px`;
        style.right = "";
        style.bottom = "";
        style.height = "";
      }
      if (overlayAnchor) {
        this.alignOverlayInput(overlayAnchor);
      }
      this.ui.inputBox.layout();
      this.ui.list.layout(listHeight);
      this.ui.tree.layout(listHeight);
    }
  }
  alignOverlayInput(anchor) {
    const style = this.ui.container.style;
    let correction = this.overlayLayoutCorrection;
    if (!correction || correction.anchor.left !== anchor.left || correction.anchor.top !== anchor.top || correction.anchor.width !== anchor.width || correction.anchor.height !== anchor.height) {
      this.ui.inputBox.layout();
      const input = this.ui.filterContainer.getBoundingClientRect();
      correction = this.overlayLayoutCorrection = {
        anchor,
        left: anchor.left - input.left,
        right: input.right - (anchor.left + anchor.width),
        top: anchor.top - input.top,
        bottom: input.bottom - (anchor.top + anchor.height),
        width: anchor.width - input.width
      };
    }
    style.width = `${parseFloat(style.width) + correction.width}px`;
    if (style.left !== "initial") {
      style.left = `${parseFloat(style.left) + correction.left}px`;
    } else {
      style.right = `${parseFloat(style.right) + correction.right}px`;
    }
    if (style.top !== "initial") {
      style.top = `${parseFloat(style.top) + correction.top}px`;
    } else {
      style.bottom = `${parseFloat(style.bottom) + correction.bottom}px`;
    }
  }
  applyStyles(styles) {
    this.styles = styles;
    this.updateStyles();
  }
  updateStyles() {
    if (this.ui) {
      const {
        quickInputTitleBackground: quickInputTitleBackground2,
        quickInputBackground: quickInputBackground2,
        quickInputForeground: quickInputForeground2,
        widgetBorder: widgetBorder2
      } = this.styles.widget;
      this.ui.titleBar.style.backgroundColor = quickInputTitleBackground2 ?? "";
      this.ui.container.style.backgroundColor = quickInputBackground2 ?? "";
      this.ui.container.style.color = quickInputForeground2 ?? "";
      this.ui.container.style.border = widgetBorder2 ? `1px solid ${widgetBorder2}` : "";
      this.ui.list.style(this.styles.list);
      this.ui.tree.tree.style(this.styles.list);
      const content2 = [];
      if (this.styles.pickerGroup.pickerGroupBorder) {
        content2.push(`.quick-input-list .quick-input-list-entry { border-top-color:  ${this.styles.pickerGroup.pickerGroupBorder}; }`);
      }
      if (this.styles.pickerGroup.pickerGroupForeground) {
        content2.push(`.quick-input-list .quick-input-list-separator { color:  ${this.styles.pickerGroup.pickerGroupForeground}; }`);
      }
      if (this.styles.pickerGroup.pickerGroupForeground) {
        content2.push(`.quick-input-list .quick-input-list-separator-as-item { color: var(--vscode-descriptionForeground); }`);
      }
      if (this.styles.keybindingLabel.keybindingLabelBackground || this.styles.keybindingLabel.keybindingLabelBorder || this.styles.keybindingLabel.keybindingLabelBottomBorder || this.styles.keybindingLabel.keybindingLabelShadow || this.styles.keybindingLabel.keybindingLabelForeground) {
        content2.push(".quick-input-list .monaco-keybinding > .monaco-keybinding-key {");
        if (this.styles.keybindingLabel.keybindingLabelBackground) {
          content2.push(`background-color: ${this.styles.keybindingLabel.keybindingLabelBackground};`);
        }
        if (this.styles.keybindingLabel.keybindingLabelBorder) {
          content2.push(`border-color: ${this.styles.keybindingLabel.keybindingLabelBorder};`);
        }
        if (this.styles.keybindingLabel.keybindingLabelBottomBorder) {
          content2.push(`border-bottom-color: ${this.styles.keybindingLabel.keybindingLabelBottomBorder};`);
        }
        if (this.styles.keybindingLabel.keybindingLabelShadow) {
          content2.push(`box-shadow: inset 0 -1px 0 ${this.styles.keybindingLabel.keybindingLabelShadow};`);
        }
        if (this.styles.keybindingLabel.keybindingLabelForeground) {
          content2.push(`color: ${this.styles.keybindingLabel.keybindingLabelForeground};`);
        }
        content2.push("}");
      }
      const newStyles = content2.join("\n");
      if (newStyles !== this.ui.styleSheet.textContent) {
        this.ui.styleSheet.textContent = newStyles;
      }
    }
  }
  loadViewState() {
    try {
      const data = JSON.parse(this.storageService.get(VIEWSTATE_STORAGE_KEY, -1 /* APPLICATION */, "{}"));
      if (data.top !== void 0 || data.left !== void 0) {
        return data;
      }
    } catch {
    }
    return void 0;
  }
  saveViewState(viewState) {
    const isMainWindow = this.layoutService.activeContainer === this.layoutService.mainContainer;
    if (!isMainWindow) {
      return;
    }
    if (viewState !== void 0) {
      this.storageService.store(VIEWSTATE_STORAGE_KEY, JSON.stringify(viewState), -1 /* APPLICATION */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(VIEWSTATE_STORAGE_KEY, -1 /* APPLICATION */);
    }
  }
};

QuickInputController = __decorateClass([
  __decorateParam(1, ILayoutService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IContextMenuService)
], QuickInputController);

var QuickInputDragAndDropController = class extends Disposable {
  constructor(_container, _quickInputContainer, _quickInputDragAreas, initialViewState, _layoutService, contextKeyService, configurationService) {
    super();
    this._container = _container;
    this._quickInputContainer = _quickInputContainer;
    this._quickInputDragAreas = _quickInputDragAreas;
    this._layoutService = _layoutService;
    this.configurationService = configurationService;
    this.dndViewState = observableValue(this, void 0);
    this._enabled = true;
    this._snapThreshold = 20;
    this._snapLineHorizontalRatio = 0.25;
    this._alignment = observableValue(this, "top");
    this.alignment = this._alignment;
    this._quickInputAlignmentContext = QuickInputAlignmentContextKey.bindTo(contextKeyService);
    const customWindowControls = getWindowControlsStyle(this.configurationService) === "custom" /* CUSTOM */;
    this._controlsOnLeft = customWindowControls && platform === 1 /* Mac */;
    this._controlsOnRight = customWindowControls && (platform === 3 /* Windows */ || platform === 2 /* Linux */);
    this._registerLayoutListener();
    this.registerMouseListeners();
    this.dndViewState.set({ ...initialViewState, done: true }, void 0);
    if (initialViewState?.top !== void 0 && initialViewState?.left !== void 0) {
      this._setAlignmentState(void 0);
    }
  }
  reparentUI(container3) {
    this._container = container3;
  }
  layoutContainer(dimension = this._layoutService.activeContainerDimension) {
    if (!this._enabled) {
      return;
    }
    const state = this.dndViewState.get();
    const dragAreaRect = this._quickInputContainer.getBoundingClientRect();
    if (state?.top !== void 0 && state?.left !== void 0) {
      const a = Math.round(state.left * 100) / 100;
      const b = dimension.width;
      const c = dragAreaRect.width;
      const d = a * b - c / 2;
      this._layout(state.top * dimension.height, d);
    }
  }
  setEnabled(enabled) {
    this._enabled = enabled;
    this._quickInputContainer.classList.toggle("no-drag", !enabled);
  }
  _setAlignmentState(value2) {
    this._quickInputAlignmentContext.set(value2);
    this._alignment.set(value2 ?? "custom", void 0);
  }
  setAlignment(alignment, done = true) {
    if (alignment === "top") {
      this.dndViewState.set({
        top: this._getTopSnapValue() / this._container.clientHeight,
        left: (this._getCenterXSnapValue() + this._quickInputContainer.clientWidth / 2) / this._container.clientWidth,
        done
      }, void 0);
      this._setAlignmentState("top");
    } else if (alignment === "center") {
      this.dndViewState.set({
        top: this._getCenterYSnapValue() / this._container.clientHeight,
        left: (this._getCenterXSnapValue() + this._quickInputContainer.clientWidth / 2) / this._container.clientWidth,
        done
      }, void 0);
      this._setAlignmentState("center");
    } else {
      this.dndViewState.set({ top: alignment.top, left: alignment.left, done }, void 0);
      this._setAlignmentState(void 0);
    }
  }
  _registerLayoutListener() {
    this._register(Event2.filter(this._layoutService.onDidLayoutContainer, (e) => e.container === this._container)((e) => this.layoutContainer(e.dimension)));
  }
  registerMouseListeners() {
    const dragArea = this._quickInputContainer;
    this._register(addDisposableGenericMouseUpListener(dragArea, (event) => {
      if (!this._enabled) {
        return;
      }
      const originEvent = new StandardMouseEvent(getWindow(dragArea), event);
      if (originEvent.detail !== 2) {
        return;
      }
      const area = this._quickInputDragAreas.find(({ node, includeChildren }) => includeChildren ? isAncestor(originEvent.target, node) : originEvent.target === node);
      if (!area || area.excludeNodes?.some((node) => isAncestor(originEvent.target, node))) {
        return;
      }
      this.dndViewState.set({ top: void 0, left: void 0, done: true }, void 0);
      this._setAlignmentState("top");
    }));
    this._register(addDisposableGenericMouseDownListener(dragArea, (e) => {
      if (!this._enabled) {
        return;
      }
      const activeWindow = getWindow(this._layoutService.activeContainer);
      const originEvent = new StandardMouseEvent(activeWindow, e);
      const area = this._quickInputDragAreas.find(({ node, includeChildren }) => includeChildren ? isAncestor(originEvent.target, node) : originEvent.target === node);
      if (!area || area.excludeNodes?.some((node) => isAncestor(originEvent.target, node))) {
        return;
      }
      const dragAreaRect = this._quickInputContainer.getBoundingClientRect();
      const dragOffsetX = originEvent.browserEvent.clientX - dragAreaRect.left;
      const dragOffsetY = originEvent.browserEvent.clientY - dragAreaRect.top;
      let isMovingQuickInput = false;
      const mouseMoveListener = addDisposableGenericMouseMoveListener(activeWindow, (e2) => {
        const mouseMoveEvent = new StandardMouseEvent(activeWindow, e2);
        mouseMoveEvent.preventDefault();
        if (!isMovingQuickInput) {
          isMovingQuickInput = true;
        }
        this._layout(e2.clientY - dragOffsetY, e2.clientX - dragOffsetX);
      });
      const mouseUpListener = addDisposableGenericMouseUpListener(activeWindow, (e2) => {
        if (isMovingQuickInput) {
          const state = this.dndViewState.get();
          this.dndViewState.set({ top: state?.top, left: state?.left, done: true }, void 0);
        }
        mouseMoveListener.dispose();
        mouseUpListener.dispose();
      });
    }));
  }
  _layout(topCoordinate, leftCoordinate) {
    const snapCoordinateYTop = this._getTopSnapValue();
    const snapCoordinateY = this._getCenterYSnapValue();
    const snapCoordinateX = this._getCenterXSnapValue();
    topCoordinate = Math.max(0, Math.min(topCoordinate, this._container.clientHeight - this._quickInputContainer.clientHeight));
    if (topCoordinate < this._layoutService.activeContainerOffset.top) {
      if (this._controlsOnLeft) {
        leftCoordinate = Math.max(leftCoordinate, 80 / getZoomFactor(getActiveWindow()));
      } else if (this._controlsOnRight) {
        leftCoordinate = Math.min(leftCoordinate, this._container.clientWidth - this._quickInputContainer.clientWidth - 140 / getZoomFactor(getActiveWindow()));
      }
    }
    const snappingToTop = Math.abs(topCoordinate - snapCoordinateYTop) < this._snapThreshold;
    topCoordinate = snappingToTop ? snapCoordinateYTop : topCoordinate;
    const snappingToCenter = Math.abs(topCoordinate - snapCoordinateY) < this._snapThreshold;
    topCoordinate = snappingToCenter ? snapCoordinateY : topCoordinate;
    const top2 = topCoordinate / this._container.clientHeight;
    leftCoordinate = Math.max(0, Math.min(leftCoordinate, this._container.clientWidth - this._quickInputContainer.clientWidth));
    const snappingToCenterX = Math.abs(leftCoordinate - snapCoordinateX) < this._snapThreshold;
    leftCoordinate = snappingToCenterX ? snapCoordinateX : leftCoordinate;
    const b = this._container.clientWidth;
    const c = this._quickInputContainer.clientWidth;
    const d = leftCoordinate;
    const left = (d + c / 2) / b;
    this.dndViewState.set({ top: top2, left, done: false }, void 0);
    if (snappingToCenterX) {
      if (snappingToTop) {
        this._setAlignmentState("top");
        return;
      } else if (snappingToCenter) {
        this._setAlignmentState("center");
        return;
      }
    }
    this._setAlignmentState(void 0);
  }
  _getTopSnapValue() {
    return this._layoutService.activeContainerOffset.quickPickTop;
  }
  _getCenterYSnapValue() {
    return Math.round(this._container.clientHeight * this._snapLineHorizontalRatio);
  }
  _getCenterXSnapValue() {
    return Math.round(this._container.clientWidth / 2) - Math.round(this._quickInputContainer.clientWidth / 2);
  }
};

QuickInputDragAndDropController = __decorateClass([
  __decorateParam(4, ILayoutService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IConfigurationService)
], QuickInputDragAndDropController);
export { $22, VIEWSTATE_STORAGE_KEY, QUICK_INPUT_MOTION_CLOSING_CLASS, QUICK_INPUT_OVERLAY_CLASS, QUICK_INPUT_CLOSE_ANIMATION_DURATION, QUICK_INPUT_MOTION_ANCESTOR_CLASSES, QuickInputController, QuickInputDragAndDropController };
