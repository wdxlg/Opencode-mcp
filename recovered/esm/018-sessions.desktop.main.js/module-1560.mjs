// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/quickInput.ts
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { severity_default } from "./module-0266.mjs";
import { Emitter, EventBufferer } from "./module-0017.mjs";
import { isIOS } from "./module-0014.mjs";
import { TimeoutTimer } from "./module-0036.mjs";
import { quickInputButtonToAction, quickInputButtonsToActionArrays, renderQuickInputDescription } from "./module-1559.mjs";
import { EventType, addDisposableListener, isHTMLElement, isMouseEvent, reset } from "./module-0075.mjs";
import { NO_KEY_MODS } from "./module-0536.mjs";
import { equals } from "./module-0007.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { IHoverService, WorkbenchHoverDelegate } from "./module-0520.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/platform/quickinput/browser/quickInput.ts
var inQuickInputContextKeyValue = "inQuickInput";

var InQuickInputContextKey = new RawContextKey(inQuickInputContextKeyValue, false, localize(3193, null));

var inQuickInputContext = ContextKeyExpr.has(inQuickInputContextKeyValue);

var quickInputAlignmentContextKeyValue = "quickInputAlignment";

var QuickInputAlignmentContextKey = new RawContextKey(quickInputAlignmentContextKeyValue, "top", localize(3197, null));

var quickInputTypeContextKeyValue = "quickInputType";

var QuickInputTypeContextKey = new RawContextKey(quickInputTypeContextKeyValue, void 0, localize(3199, null));

var endOfQuickInputBoxContextKeyValue = "cursorAtEndOfQuickInputBox";

var EndOfQuickInputBoxContextKey = new RawContextKey(endOfQuickInputBoxContextKeyValue, false, localize(3190, null));

var endOfQuickInputBoxContext = ContextKeyExpr.has(endOfQuickInputBoxContextKeyValue);

var backButton = {
  iconClass: ThemeIcon.asClassName(Codicon.quickInputBack),
  tooltip: localize(3195, null),
  handle: -1
  // TODO
};

var QuickInput = class _QuickInput extends Disposable {
  constructor(ui) {
    super();
    this.ui = ui;
    this._visible = observableValue("visible", false);
    this._enabled = true;
    this._busy = false;
    this._ignoreFocusOut = false;
    this._leftButtons = [];
    this._rightButtons = [];
    this._inlineButtons = [];
    this._inputButtons = [];
    this.buttonsUpdated = false;
    this.noValidationMessage = _QuickInput.noPromptMessage;
    this._severity = severity_default.Ignore;
    this.onDidTriggerButtonEmitter = this._register(new Emitter());
    this.onDidHideEmitter = this._register(new Emitter());
    this.onWillHideEmitter = this._register(new Emitter());
    this.onDisposeEmitter = this._register(new Emitter());
    this.visibleDisposables = this._register(new DisposableStore());
    this.onDidTriggerButton = this.onDidTriggerButtonEmitter.event;
    this.onDidHide = this.onDidHideEmitter.event;
    this.onWillHide = this.onWillHideEmitter.event;
    this.onDispose = this.onDisposeEmitter.event;
  }
  static {
    this.noPromptMessage = localize(3191, null);
  }
  get visible() {
    return this._visible.get();
  }
  get title() {
    return this._title;
  }
  set title(title) {
    this._title = title;
    this.update();
  }
  get description() {
    return this._description;
  }
  set description(description) {
    this._description = description;
    this.update();
  }
  get step() {
    return this._steps;
  }
  set step(step) {
    this._steps = step;
    this.update();
  }
  get totalSteps() {
    return this._totalSteps;
  }
  set totalSteps(totalSteps) {
    this._totalSteps = totalSteps;
    this.update();
  }
  get enabled() {
    return this._enabled;
  }
  set enabled(enabled) {
    this._enabled = enabled;
    this.update();
  }
  get contextKey() {
    return this._contextKey;
  }
  set contextKey(contextKey) {
    this._contextKey = contextKey;
    this.update();
  }
  get busy() {
    return this._busy;
  }
  set busy(busy) {
    this._busy = busy;
    this.update();
  }
  get ignoreFocusOut() {
    return this._ignoreFocusOut;
  }
  set ignoreFocusOut(ignoreFocusOut) {
    const shouldUpdate = this._ignoreFocusOut !== ignoreFocusOut && !isIOS;
    this._ignoreFocusOut = ignoreFocusOut && !isIOS;
    if (shouldUpdate) {
      this.update();
    }
  }
  get titleButtons() {
    return this._leftButtons.length ? [...this._leftButtons, this._rightButtons] : this._rightButtons;
  }
  get buttons() {
    return [
      ...this._leftButtons,
      ...this._rightButtons,
      ...this._inlineButtons,
      ...this._inputButtons
    ];
  }
  set buttons(buttons) {
    const leftButtons = [];
    const rightButtons = [];
    const inlineButtons = [];
    const inputButtons = [];
    for (const button of buttons) {
      if (button === backButton) {
        leftButtons.push(button);
      } else {
        switch (button.location) {
          case 2 /* Inline */:
            inlineButtons.push(button);
            break;
          case 3 /* Input */:
            inputButtons.push(button);
            break;
          default:
            rightButtons.push(button);
            break;
        }
      }
    }
    this._leftButtons = leftButtons;
    this._rightButtons = rightButtons;
    this._inlineButtons = inlineButtons;
    this._inputButtons = inputButtons;
    this.buttonsUpdated = true;
    this.update();
  }
  get validationMessage() {
    return this._validationMessage;
  }
  set validationMessage(validationMessage) {
    this._validationMessage = validationMessage;
    this.update();
  }
  get severity() {
    return this._severity;
  }
  set severity(severity) {
    this._severity = severity;
    this.update();
  }
  show() {
    if (this.visible) {
      return;
    }
    this.visibleDisposables.add(
      this.ui.onDidTriggerButton((button) => {
        if (this.buttons.indexOf(button) !== -1) {
          this.onDidTriggerButtonEmitter.fire(button);
        }
      })
    );
    this.ui.show(this);
    this._visible.set(true, void 0);
    this._lastValidationMessage = void 0;
    this._lastSeverity = void 0;
    if (this.buttons.length) {
      this.buttonsUpdated = true;
    }
    this.update();
  }
  hide() {
    if (!this.visible) {
      return;
    }
    this.ui.hide();
  }
  didHide(reason = 3 /* Other */) {
    this._visible.set(false, void 0);
    this.visibleDisposables.clear();
    this.onDidHideEmitter.fire({ reason });
  }
  willHide(reason = 3 /* Other */) {
    this.onWillHideEmitter.fire({ reason });
  }
  update() {
    if (!this.visible) {
      return;
    }
    const title = this.getTitle();
    if (title && this.ui.title.textContent !== title) {
      this.ui.title.textContent = title;
    } else if (!title && this.ui.title.innerHTML !== "&nbsp;") {
      this.ui.title.innerText = "\xA0";
    }
    const description = this.getDescription();
    if (this.ui.description1.textContent !== description) {
      this.ui.description1.textContent = description;
    }
    if (this.ui.description2.textContent !== description) {
      this.ui.description2.textContent = description;
    }
    if (this.busy && !this.busyDelay) {
      this.busyDelay = new TimeoutTimer();
      this.busyDelay.setIfNotSet(() => {
        if (this.visible) {
          this.ui.progressBar.infinite();
          this.ui.progressBar.getContainer().removeAttribute("aria-hidden");
        }
      }, 800);
    }
    if (!this.busy && this.busyDelay) {
      this.ui.progressBar.stop();
      this.ui.progressBar.getContainer().setAttribute("aria-hidden", "true");
      this.busyDelay.cancel();
      this.busyDelay = void 0;
    }
    if (this.buttonsUpdated) {
      this.buttonsUpdated = false;
      const leftActions = quickInputButtonsToActionArrays(
        this._leftButtons,
        "left-button",
        (button) => this.onDidTriggerButtonEmitter.fire(button)
      );
      this.ui.leftActionBar.setActions(leftActions.primary, leftActions.secondary);
      const rightActions = quickInputButtonsToActionArrays(
        this._rightButtons,
        "right-button",
        (button) => this.onDidTriggerButtonEmitter.fire(button)
      );
      this.ui.rightActionBar.setActions(rightActions.primary, rightActions.secondary);
      const inlineActions = quickInputButtonsToActionArrays(
        this._inlineButtons,
        "inline-button",
        (button) => this.onDidTriggerButtonEmitter.fire(button)
      );
      this.ui.inlineActionBar.setActions(inlineActions.primary, inlineActions.secondary);
      const inputButtonOffset = this._inputButtons.length * 22;
      this.ui.countContainer.style.right = inputButtonOffset > 0 ? `${4 + inputButtonOffset}px` : "4px";
      this.ui.inputBox.actions = this._inputButtons.map((button, index2) => quickInputButtonToAction(
        button,
        `id-${index2}`,
        async () => this.onDidTriggerButtonEmitter.fire(button)
      ));
    }
    this.ui.ignoreFocusOut = this.ignoreFocusOut;
    this.ui.setEnabled(this.enabled);
    this.ui.setContextKey(this.contextKey);
    const validationMessage = this.validationMessage || this.noValidationMessage;
    if (this._lastValidationMessage !== validationMessage) {
      this._lastValidationMessage = validationMessage;
      reset(this.ui.message);
      if (validationMessage) {
        renderQuickInputDescription(validationMessage, this.ui.message, {
          callback: (content) => {
            this.ui.linkOpenerDelegate(content);
          },
          disposables: this.visibleDisposables
        });
      }
    }
    if (this._lastSeverity !== this.severity) {
      this._lastSeverity = this.severity;
      this.showMessageDecoration(this.severity);
    }
  }
  getTitle() {
    if (this.title && this.step) {
      return `${this.title} (${this.getSteps()})`;
    }
    if (this.title) {
      return this.title;
    }
    if (this.step) {
      return this.getSteps();
    }
    return "";
  }
  getDescription() {
    return this.description || "";
  }
  getSteps() {
    if (this.step && this.totalSteps) {
      return localize(3196, null, this.step, this.totalSteps);
    }
    if (this.step) {
      return String(this.step);
    }
    return "";
  }
  showMessageDecoration(severity) {
    this.ui.inputBox.showDecoration(severity);
    if (severity !== severity_default.Ignore) {
      const styles = this.ui.inputBox.stylesForType(severity);
      this.ui.message.style.color = styles.foreground ? `${styles.foreground}` : "";
      this.ui.message.style.backgroundColor = styles.background ? `${styles.background}` : "";
      this.ui.message.style.border = styles.border ? `1px solid ${styles.border}` : "";
      this.ui.message.style.marginBottom = "-2px";
    } else {
      this.ui.message.style.color = "";
      this.ui.message.style.backgroundColor = "";
      this.ui.message.style.border = "";
      this.ui.message.style.marginBottom = "";
    }
  }
  dispose() {
    this.hide();
    this.onDisposeEmitter.fire();
    super.dispose();
  }
};

var QuickPick = class _QuickPick extends QuickInput {
  constructor(ui) {
    super(ui);
    this._value = "";
    this.onDidChangeValueEmitter = this._register(new Emitter());
    this.onWillAcceptEmitter = this._register(new Emitter());
    this.onDidAcceptEmitter = this._register(new Emitter());
    this.onDidCustomEmitter = this._register(new Emitter());
    this._items = [];
    this.itemsUpdated = false;
    this._canSelectMany = false;
    this._canAcceptInBackground = false;
    this._matchOnDescription = false;
    this._matchOnDetail = false;
    this._matchOnLabel = true;
    this._matchOnLabelMode = "fuzzy";
    this._sortByLabel = true;
    this._keepScrollPosition = false;
    this._itemActivation = 1 /* FIRST */;
    this._activeItems = [];
    this.activeItemsUpdated = false;
    this.activeItemsToConfirm = [];
    this.onDidChangeActiveEmitter = this._register(new Emitter());
    this._selectedItems = [];
    this.selectedItemsUpdated = false;
    this.selectedItemsToConfirm = [];
    this.onDidChangeSelectionEmitter = this._register(new Emitter());
    this.onDidTriggerItemButtonEmitter = this._register(new Emitter());
    this.onDidTriggerSeparatorButtonEmitter = this._register(new Emitter());
    this.valueSelectionUpdated = true;
    this._ok = "default";
    this._customButton = false;
    this._customButtonSecondary = false;
    this._focusEventBufferer = new EventBufferer();
    this.type = "quickPick" /* QuickPick */;
    this.filterValue = (value2) => value2;
    this.onDidChangeValue = this.onDidChangeValueEmitter.event;
    this.onWillAccept = this.onWillAcceptEmitter.event;
    this.onDidAccept = this.onDidAcceptEmitter.event;
    this.onDidCustom = this.onDidCustomEmitter.event;
    this.onDidChangeActive = this.onDidChangeActiveEmitter.event;
    this.onDidChangeSelection = this.onDidChangeSelectionEmitter.event;
    this.onDidTriggerItemButton = this.onDidTriggerItemButtonEmitter.event;
    this.onDidTriggerSeparatorButton = this.onDidTriggerSeparatorButtonEmitter.event;
    this.noValidationMessage = void 0;
  }
  static {
    this.DEFAULT_ARIA_LABEL = localize(3198, null);
  }
  get quickNavigate() {
    return this._quickNavigate;
  }
  set quickNavigate(quickNavigate) {
    this._quickNavigate = quickNavigate;
    this.update();
  }
  get value() {
    return this._value;
  }
  set value(value2) {
    this.doSetValue(value2);
  }
  doSetValue(value2, skipUpdate) {
    if (this._value !== value2) {
      this._value = value2;
      if (!skipUpdate) {
        this.update();
      }
      if (this.visible) {
        const didFilter = this.ui.list.filter(this.filterValue(this._value));
        if (didFilter) {
          this.trySelectFirst();
        }
      }
      this.onDidChangeValueEmitter.fire(this._value);
    }
  }
  set ariaLabel(ariaLabel) {
    this._ariaLabel = ariaLabel;
    this.update();
  }
  get ariaLabel() {
    return this._ariaLabel;
  }
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(placeholder) {
    this._placeholder = placeholder;
    this.update();
  }
  get prompt() {
    return this.noValidationMessage;
  }
  set prompt(prompt) {
    this.noValidationMessage = prompt;
    this.update();
  }
  get items() {
    return this._items;
  }
  get scrollTop() {
    return this.ui.list.scrollTop;
  }
  set scrollTop(scrollTop) {
    this.ui.list.scrollTop = scrollTop;
  }
  set items(items) {
    this._items = items;
    this.itemsUpdated = true;
    this.update();
  }
  get canSelectMany() {
    return this._canSelectMany;
  }
  set canSelectMany(canSelectMany) {
    this._canSelectMany = canSelectMany;
    this.update();
  }
  get canAcceptInBackground() {
    return this._canAcceptInBackground;
  }
  set canAcceptInBackground(canAcceptInBackground) {
    this._canAcceptInBackground = canAcceptInBackground;
  }
  get matchOnDescription() {
    return this._matchOnDescription;
  }
  set matchOnDescription(matchOnDescription) {
    this._matchOnDescription = matchOnDescription;
    this.update();
  }
  get matchOnDetail() {
    return this._matchOnDetail;
  }
  set matchOnDetail(matchOnDetail) {
    this._matchOnDetail = matchOnDetail;
    this.update();
  }
  get matchOnLabel() {
    return this._matchOnLabel;
  }
  set matchOnLabel(matchOnLabel) {
    this._matchOnLabel = matchOnLabel;
    this.update();
  }
  get matchOnLabelMode() {
    return this._matchOnLabelMode;
  }
  set matchOnLabelMode(matchOnLabelMode) {
    this._matchOnLabelMode = matchOnLabelMode;
    this.update();
  }
  get sortByLabel() {
    return this._sortByLabel;
  }
  set sortByLabel(sortByLabel) {
    this._sortByLabel = sortByLabel;
    this.update();
  }
  get keepScrollPosition() {
    return this._keepScrollPosition;
  }
  set keepScrollPosition(keepScrollPosition) {
    this._keepScrollPosition = keepScrollPosition;
  }
  get itemActivation() {
    return this._itemActivation;
  }
  set itemActivation(itemActivation) {
    this._itemActivation = itemActivation;
  }
  get activeItems() {
    return this._activeItems;
  }
  set activeItems(activeItems) {
    this._activeItems = activeItems;
    this.activeItemsUpdated = true;
    this.update();
  }
  get selectedItems() {
    return this._selectedItems;
  }
  set selectedItems(selectedItems) {
    this._selectedItems = selectedItems;
    this.selectedItemsUpdated = true;
    this.update();
  }
  get keyMods() {
    if (this._quickNavigate) {
      return NO_KEY_MODS;
    }
    return this.ui.keyMods;
  }
  get valueSelection() {
    const selection = this.ui.inputBox.getSelection();
    if (!selection) {
      return void 0;
    }
    return [selection.start, selection.end];
  }
  set valueSelection(valueSelection) {
    this._valueSelection = valueSelection;
    this.valueSelectionUpdated = true;
    this.update();
  }
  get customButton() {
    return this._customButton;
  }
  set customButton(showCustomButton) {
    this._customButton = showCustomButton;
    this.update();
  }
  get customLabel() {
    return this._customButtonLabel;
  }
  set customLabel(label3) {
    this._customButtonLabel = label3;
    this.update();
  }
  get customHover() {
    return this._customButtonHover;
  }
  set customHover(hover) {
    this._customButtonHover = hover;
    this.update();
  }
  get customButtonSecondary() {
    return this._customButtonSecondary;
  }
  set customButtonSecondary(secondary) {
    this._customButtonSecondary = secondary ?? false;
    this.update();
  }
  get ok() {
    return this._ok;
  }
  set ok(showOkButton) {
    this._ok = showOkButton;
    this.update();
  }
  get okLabel() {
    return this._okLabel ?? localize(3194, null);
  }
  set okLabel(okLabel) {
    this._okLabel = okLabel;
    this.update();
  }
  inputHasFocus() {
    return this.visible ? this.ui.inputBox.hasFocus() : false;
  }
  focusOnInput() {
    this.ui.inputBox.setFocus();
  }
  get hideInput() {
    return !!this._hideInput;
  }
  set hideInput(hideInput) {
    this._hideInput = hideInput;
    this.update();
  }
  get hideCountBadge() {
    return !!this._hideCountBadge;
  }
  set hideCountBadge(hideCountBadge) {
    this._hideCountBadge = hideCountBadge;
    this.update();
  }
  get hideCheckAll() {
    return !!this._hideCheckAll;
  }
  set hideCheckAll(hideCheckAll) {
    this._hideCheckAll = hideCheckAll;
    this.update();
  }
  trySelectFirst() {
    if (!this.canSelectMany) {
      this.ui.list.focus(1 /* First */);
    }
  }
  show() {
    if (!this.visible) {
      this.visibleDisposables.add(
        this.ui.inputBox.onDidChange((value2) => {
          this.doSetValue(
            value2,
            true
            /* skip update since this originates from the UI */
          );
        })
      );
      this.visibleDisposables.add(this.ui.onDidAccept(() => {
        if (this.canSelectMany) {
          if (!this.ui.list.getCheckedElements().length) {
            this._selectedItems = [];
            this.onDidChangeSelectionEmitter.fire(this.selectedItems);
          }
        } else if (this.activeItems[0]) {
          this._selectedItems = [this.activeItems[0]];
          this.onDidChangeSelectionEmitter.fire(this.selectedItems);
        }
        this.handleAccept(false);
      }));
      this.visibleDisposables.add(this.ui.onDidCustom(() => {
        this.onDidCustomEmitter.fire();
      }));
      this.visibleDisposables.add(this._focusEventBufferer.wrapEvent(
        this.ui.list.onDidChangeFocus,
        // Only fire the last event
        (_, e4) => e4
      )((focusedItems) => {
        if (this.activeItemsUpdated) {
          return;
        }
        if (this.activeItemsToConfirm !== this._activeItems && equals(focusedItems, this._activeItems, (a, b) => a === b)) {
          return;
        }
        this._activeItems = focusedItems;
        this.onDidChangeActiveEmitter.fire(focusedItems);
      }));
      this.visibleDisposables.add(this.ui.list.onDidChangeSelection(({ items: selectedItems, event }) => {
        if (this.canSelectMany && !selectedItems.some((i2) => i2.pickable === false)) {
          if (selectedItems.length) {
            this.ui.list.setSelectedElements([]);
          }
          return;
        }
        if (this.selectedItemsToConfirm !== this._selectedItems && equals(selectedItems, this._selectedItems, (a, b) => a === b)) {
          return;
        }
        this._selectedItems = selectedItems;
        this.onDidChangeSelectionEmitter.fire(selectedItems);
        if (selectedItems.length) {
          this.handleAccept(
            isMouseEvent(event) && event.button === 1
            /* mouse middle click */
          );
        }
      }));
      this.visibleDisposables.add(this.ui.list.onChangedCheckedElements((checkedItems) => {
        if (!this.canSelectMany || !this.visible) {
          return;
        }
        if (this.selectedItemsToConfirm !== this._selectedItems && equals(checkedItems, this._selectedItems, (a, b) => a === b)) {
          return;
        }
        this._selectedItems = checkedItems;
        this.onDidChangeSelectionEmitter.fire(checkedItems);
      }));
      this.visibleDisposables.add(this.ui.list.onButtonTriggered((event) => this.onDidTriggerItemButtonEmitter.fire(event)));
      this.visibleDisposables.add(this.ui.list.onSeparatorButtonTriggered((event) => this.onDidTriggerSeparatorButtonEmitter.fire(event)));
      this.visibleDisposables.add(this.registerQuickNavigation());
      this.valueSelectionUpdated = true;
    }
    super.show();
  }
  handleAccept(inBackground) {
    let veto = false;
    this.onWillAcceptEmitter.fire({ veto: () => veto = true });
    if (!veto) {
      this.onDidAcceptEmitter.fire({ inBackground });
    }
  }
  registerQuickNavigation() {
    return addDisposableListener(this.ui.container, EventType.KEY_UP, (e4) => {
      if (this.canSelectMany || !this._quickNavigate) {
        return;
      }
      const keyboardEvent = new StandardKeyboardEvent(e4);
      const keyCode = keyboardEvent.keyCode;
      const quickNavKeys = this._quickNavigate.keybindings;
      const wasTriggerKeyPressed = quickNavKeys.some((k) => {
        const chords = k.getChords();
        if (chords.length > 1) {
          return false;
        }
        if (chords[0].shiftKey && keyCode === 4 /* Shift */) {
          if (keyboardEvent.ctrlKey || keyboardEvent.altKey || keyboardEvent.metaKey) {
            return false;
          }
          return true;
        }
        if (chords[0].altKey && keyCode === 6 /* Alt */) {
          return true;
        }
        if (chords[0].ctrlKey && keyCode === 5 /* Ctrl */) {
          return true;
        }
        if (chords[0].metaKey && keyCode === 57 /* Meta */) {
          return true;
        }
        return false;
      });
      if (wasTriggerKeyPressed) {
        if (this.activeItems[0]) {
          this._selectedItems = [this.activeItems[0]];
          this.onDidChangeSelectionEmitter.fire(this.selectedItems);
          this.handleAccept(false);
        }
        this._quickNavigate = void 0;
      }
    });
  }
  update() {
    if (!this.visible) {
      return;
    }
    const scrollTopBefore = this.keepScrollPosition ? this.scrollTop : 0;
    const hasDescription = !!this.description;
    const visibilities = {
      title: !!this.title || !!this.step || !!this.titleButtons.length,
      description: hasDescription,
      checkAll: this.canSelectMany && !this._hideCheckAll,
      checkBox: this.canSelectMany,
      inputBox: !this._hideInput,
      progressBar: !this._hideInput || hasDescription,
      visibleCount: true,
      count: this.canSelectMany && !this._hideCountBadge,
      ok: this.ok === "default" ? this.canSelectMany : this.ok,
      list: true,
      message: !!this.validationMessage || !!this.prompt,
      customButton: this.customButton
    };
    this.ui.setVisibilities(visibilities);
    super.update();
    if (this.ui.inputBox.value !== this.value) {
      this.ui.inputBox.value = this.value;
    }
    if (this.valueSelectionUpdated) {
      this.valueSelectionUpdated = false;
      this.ui.inputBox.select(this._valueSelection && { start: this._valueSelection[0], end: this._valueSelection[1] });
    }
    if (this.ui.inputBox.placeholder !== (this.placeholder || "")) {
      this.ui.inputBox.placeholder = this.placeholder || "";
    }
    let ariaLabel = this.ariaLabel;
    if (!ariaLabel && visibilities.inputBox) {
      ariaLabel = this.placeholder;
      if (this.title) {
        ariaLabel = ariaLabel ? `${ariaLabel} - ${this.title}` : this.title;
      }
      if (!ariaLabel) {
        ariaLabel = _QuickPick.DEFAULT_ARIA_LABEL;
      }
    }
    if (this.ui.list.ariaLabel !== ariaLabel) {
      this.ui.list.ariaLabel = ariaLabel ?? null;
    }
    if (this.ui.inputBox.ariaLabel !== ariaLabel) {
      this.ui.inputBox.ariaLabel = ariaLabel ?? "input";
    }
    this.ui.list.matchOnDescription = this.matchOnDescription;
    this.ui.list.matchOnDetail = this.matchOnDetail;
    this.ui.list.matchOnLabel = this.matchOnLabel;
    this.ui.list.matchOnLabelMode = this.matchOnLabelMode;
    this.ui.list.sortByLabel = this.sortByLabel;
    if (this.itemsUpdated) {
      this.itemsUpdated = false;
      this._focusEventBufferer.bufferEvents(() => {
        this.ui.list.setElements(this.items);
        this.ui.list.shouldLoop = !this.canSelectMany;
        this.ui.list.filter(this.filterValue(this.ui.inputBox.value));
        switch (this._itemActivation) {
          case 0 /* NONE */:
            this._itemActivation = 1 /* FIRST */;
            break;
          case 2 /* SECOND */:
            this.ui.list.focus(2 /* Second */);
            this._itemActivation = 1 /* FIRST */;
            break;
          case 3 /* LAST */:
            this.ui.list.focus(3 /* Last */);
            this._itemActivation = 1 /* FIRST */;
            break;
          default:
            this.trySelectFirst();
            break;
        }
      });
    }
    if (this.ui.container.classList.contains("show-checkboxes") !== !!this.canSelectMany) {
      if (this.canSelectMany) {
        this.ui.list.clearFocus();
      } else {
        this.trySelectFirst();
      }
    }
    if (this.activeItemsUpdated) {
      this.activeItemsUpdated = false;
      this.activeItemsToConfirm = this._activeItems;
      this.ui.list.setFocusedElements(this.activeItems);
      if (this.activeItemsToConfirm === this._activeItems) {
        this.activeItemsToConfirm = null;
      }
    }
    if (this.selectedItemsUpdated) {
      this.selectedItemsUpdated = false;
      this.selectedItemsToConfirm = this._selectedItems;
      if (this.canSelectMany) {
        this.ui.list.setCheckedElements(this.selectedItems);
      } else {
        this.ui.list.setSelectedElements(this.selectedItems);
      }
      if (this.selectedItemsToConfirm === this._selectedItems) {
        this.selectedItemsToConfirm = null;
      }
    }
    this.ui.ok.label = this.okLabel || "";
    this.ui.customButton.label = this.customLabel || "";
    this.ui.customButton.element.title = this.customHover || "";
    this.ui.customButton.secondary = this.customButtonSecondary || false;
    if (!visibilities.inputBox) {
      this.ui.list.domFocus();
      if (this.canSelectMany) {
        this.ui.list.focus(1 /* First */);
      }
    }
    if (this.keepScrollPosition) {
      this.scrollTop = scrollTopBefore;
    }
  }
  focus(focus) {
    this.ui.list.focus(focus);
    if (this.canSelectMany) {
      this.ui.list.domFocus();
    }
  }
  accept(inBackground) {
    if (inBackground && !this._canAcceptInBackground) {
      return;
    }
    if (this.activeItems[0] && !this._canSelectMany) {
      this._selectedItems = [this.activeItems[0]];
      this.onDidChangeSelectionEmitter.fire(this.selectedItems);
    }
    this.handleAccept(inBackground ?? false);
  }
};

var InputBox2 = class extends QuickInput {
  constructor() {
    super(...arguments);
    this._value = "";
    this.valueSelectionUpdated = true;
    this._password = false;
    this.onDidValueChangeEmitter = this._register(new Emitter());
    this.onDidAcceptEmitter = this._register(new Emitter());
    this.type = "inputBox" /* InputBox */;
    this.onDidChangeValue = this.onDidValueChangeEmitter.event;
    this.onDidAccept = this.onDidAcceptEmitter.event;
  }
  get value() {
    return this._value;
  }
  set value(value2) {
    this._value = value2 || "";
    this.update();
  }
  get valueSelection() {
    const selection = this.ui.inputBox.getSelection();
    if (!selection) {
      return void 0;
    }
    return [selection.start, selection.end];
  }
  set valueSelection(valueSelection) {
    this._valueSelection = valueSelection;
    this.valueSelectionUpdated = true;
    this.update();
  }
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(placeholder) {
    this._placeholder = placeholder;
    this.update();
  }
  get ariaLabel() {
    return this._ariaLabel;
  }
  set ariaLabel(ariaLabel) {
    this._ariaLabel = ariaLabel;
    this.update();
  }
  get password() {
    return this._password;
  }
  set password(password) {
    this._password = password;
    this.update();
  }
  get prompt() {
    return this._prompt;
  }
  set prompt(prompt) {
    this._prompt = prompt;
    this.noValidationMessage = prompt ? localize(3192, null, prompt) : QuickInput.noPromptMessage;
    this.update();
  }
  show() {
    if (!this.visible) {
      this.visibleDisposables.add(
        this.ui.inputBox.onDidChange((value2) => {
          if (value2 === this.value) {
            return;
          }
          this._value = value2;
          this.onDidValueChangeEmitter.fire(value2);
        })
      );
      this.visibleDisposables.add(this.ui.onDidAccept(() => this.onDidAcceptEmitter.fire()));
      this.valueSelectionUpdated = true;
    }
    super.show();
  }
  accept() {
    this.onDidAcceptEmitter.fire();
  }
  update() {
    if (!this.visible) {
      return;
    }
    this.ui.container.classList.remove("hidden-input");
    const visibilities = {
      title: !!this.title || !!this.step || !!this.titleButtons.length,
      description: !!this.description || !!this.step,
      inputBox: true,
      message: true,
      progressBar: true
    };
    this.ui.setVisibilities(visibilities);
    super.update();
    if (this.ui.inputBox.value !== this.value) {
      this.ui.inputBox.value = this.value;
    }
    if (this.valueSelectionUpdated) {
      this.valueSelectionUpdated = false;
      this.ui.inputBox.select(this._valueSelection && { start: this._valueSelection[0], end: this._valueSelection[1] });
    }
    if (this.ui.inputBox.placeholder !== (this.placeholder || "")) {
      this.ui.inputBox.placeholder = this.placeholder || "";
    }
    if (this.ui.inputBox.password !== this.password) {
      this.ui.inputBox.password = this.password;
    }
    let ariaLabel = this.ariaLabel;
    if (!ariaLabel && visibilities.inputBox) {
      ariaLabel = this.placeholder ? this.title ? `${this.placeholder} - ${this.title}` : this.placeholder : this.title ? this.title : "input";
    }
    if (this.ui.inputBox.ariaLabel !== ariaLabel) {
      this.ui.inputBox.ariaLabel = ariaLabel || "input";
    }
  }
};

var QuickWidget = class extends QuickInput {
  constructor() {
    super(...arguments);
    this.type = "quickWidget" /* QuickWidget */;
    this._widgetUpdated = false;
  }
  get widget() {
    return this._widget;
  }
  set widget(widget) {
    if (this._widget !== widget) {
      this._widget = widget;
      this._widgetUpdated = true;
      this.update();
    }
  }
  update() {
    if (!this.visible) {
      return;
    }
    this.ui.setVisibilities({
      title: !!this.title || !!this.step || !!this.titleButtons.length,
      description: !!this.description || !!this.step
    });
    if (this._widgetUpdated) {
      this._widgetUpdated = false;
      if (this._widget) {
        reset(this.ui.widget, this._widget);
      } else {
        reset(this.ui.widget);
      }
    }
    super.update();
  }
};

var QuickInputHoverDelegate = class extends WorkbenchHoverDelegate {
  constructor(configurationService, hoverService) {
    super("mouse", void 0, (options3) => this.getOverrideOptions(options3), configurationService, hoverService);
  }
  getOverrideOptions(options3) {
    const showHoverHint = (isHTMLElement(options3.content) ? options3.content.textContent ?? "" : typeof options3.content === "string" ? options3.content : options3.content.value).includes("\n");
    return {
      persistence: {
        hideOnKeyDown: false
      },
      appearance: {
        showHoverHint,
        skipFadeInAnimation: true
      }
    };
  }
};

QuickInputHoverDelegate = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IHoverService)
], QuickInputHoverDelegate);
export { inQuickInputContextKeyValue, InQuickInputContextKey, inQuickInputContext, quickInputAlignmentContextKeyValue, QuickInputAlignmentContextKey, quickInputTypeContextKeyValue, QuickInputTypeContextKey, endOfQuickInputBoxContextKeyValue, EndOfQuickInputBoxContextKey, endOfQuickInputBoxContext, backButton, QuickInput, QuickPick, InputBox2, QuickWidget, QuickInputHoverDelegate };
