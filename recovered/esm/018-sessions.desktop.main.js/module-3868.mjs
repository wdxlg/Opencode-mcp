// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/menu/menubar.ts
import { $, EventType, ModifierKeyEmitter, addDisposableListener, getDomNodeZoomLevel, getWindow, isAncestor, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { Disposable, DisposableStore, dispose } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { ActionRunner, Separator, SubmenuAction } from "./module-0082.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { asArray } from "./module-0007.mjs";
import { MENU_ESCAPED_MNEMONIC_REGEX, MENU_MNEMONIC_REGEX, Menu, cleanMnemonic } from "./module-3867.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { escape, ltrim, rtrim } from "./module-0030.mjs";
import { isFullscreen } from "./module-0018.mjs";
import { mainWindow } from "./module-0002.mjs";
import { ScanCodeUtils } from "./module-0019.mjs";


// src/vs/base/browser/ui/menu/menubar.ts
var $127 = $;

var MenuBar = class _MenuBar extends Disposable {
  constructor(container2, options3, menuStyle) {
    super();
    this.container = container2;
    this.options = options3;
    this.menuStyle = menuStyle;
    // Input-related
    this._mnemonicsInUse = false;
    this.openedViaKeyboard = false;
    this.awaitingAltRelease = false;
    this.ignoreNextMouseUp = false;
    this.updatePending = false;
    this.numMenusShown = 0;
    this.overflowLayoutScheduled = void 0;
    this.menuDisposables = this._register(new DisposableStore());
    this.container.setAttribute("role", "menubar");
    if (this.isCompact) {
      this.container.classList.add("compact");
    }
    this.menus = [];
    this.mnemonics = /* @__PURE__ */ new Map();
    this._focusState = 1 /* VISIBLE */;
    this._onVisibilityChange = this._register(new Emitter());
    this._onFocusStateChange = this._register(new Emitter());
    this.createOverflowMenu();
    this.menuUpdater = this._register(new RunOnceScheduler(() => this.update(), 200));
    this.actionRunner = this.options.actionRunner ?? this._register(new ActionRunner());
    this._register(this.actionRunner.onWillRun(() => {
      this.setUnfocusedState();
    }));
    this._register(ModifierKeyEmitter.getInstance().event(this.onModifierKeyToggled, this));
    this._register(addDisposableListener(this.container, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      let eventHandled = true;
      const key3 = !!e4.key ? e4.key.toLocaleLowerCase() : "";
      const tabNav = isMacintosh && !this.isCompact;
      if (event.equals(15 /* LeftArrow */) || tabNav && event.equals(2 /* Tab */ | 1024 /* Shift */)) {
        this.focusPrevious();
      } else if (event.equals(17 /* RightArrow */) || tabNav && event.equals(2 /* Tab */)) {
        this.focusNext();
      } else if (event.equals(9 /* Escape */) && this.isFocused && !this.isOpen) {
        this.setUnfocusedState();
      } else if (!this.isOpen && !event.ctrlKey && this.options.enableMnemonics && this.mnemonicsInUse && this.mnemonics.has(key3)) {
        const menuIndex = this.mnemonics.get(key3);
        this.onMenuTriggered(menuIndex, false);
      } else {
        eventHandled = false;
      }
      if (!this.isCompact && (event.equals(2 /* Tab */ | 1024 /* Shift */) || event.equals(2 /* Tab */))) {
        event.preventDefault();
      }
      if (eventHandled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }));
    const window2 = getWindow(this.container);
    this._register(addDisposableListener(window2, EventType.MOUSE_DOWN, () => {
      if (this.isFocused) {
        this.setUnfocusedState();
      }
    }));
    this._register(addDisposableListener(this.container, EventType.FOCUS_IN, (e4) => {
      const event = e4;
      if (event.relatedTarget) {
        if (!this.container.contains(event.relatedTarget)) {
          this.focusToReturn = event.relatedTarget;
        }
      }
    }));
    this._register(addDisposableListener(this.container, EventType.FOCUS_OUT, (e4) => {
      const event = e4;
      if (!event.relatedTarget) {
        this.setUnfocusedState();
      } else if (event.relatedTarget && !this.container.contains(event.relatedTarget)) {
        this.focusToReturn = void 0;
        this.setUnfocusedState();
      }
    }));
    this._register(addDisposableListener(window2, EventType.KEY_DOWN, (e4) => {
      if (!this.options.enableMnemonics || !e4.altKey || e4.ctrlKey || e4.defaultPrevented) {
        return;
      }
      const key3 = e4.key.toLocaleLowerCase();
      if (!this.mnemonics.has(key3)) {
        return;
      }
      this.mnemonicsInUse = true;
      this.updateMnemonicVisibility(true);
      const menuIndex = this.mnemonics.get(key3);
      this.onMenuTriggered(menuIndex, false);
    }));
    this.setUnfocusedState();
  }
  static {
    this.OVERFLOW_INDEX = -1;
  }
  push(arg) {
    const menus = asArray(arg);
    menus.forEach((menuBarMenu) => {
      const menuIndex = this.menus.length;
      const cleanMenuLabel = cleanMnemonic(menuBarMenu.label);
      const mnemonicMatches = MENU_MNEMONIC_REGEX.exec(menuBarMenu.label);
      if (mnemonicMatches) {
        const mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];
        this.registerMnemonic(this.menus.length, mnemonic);
      }
      if (this.isCompact) {
        this.menus.push(menuBarMenu);
      } else {
        const buttonElement = $127("div.menubar-menu-button", { "role": "menuitem", "tabindex": -1, "aria-label": cleanMenuLabel, "aria-haspopup": true });
        const titleElement = $127("div.menubar-menu-title", { "role": "none", "aria-hidden": true });
        buttonElement.appendChild(titleElement);
        this.container.insertBefore(buttonElement, this.overflowMenu.buttonElement);
        this.updateLabels(titleElement, buttonElement, menuBarMenu.label);
        this._register(addDisposableListener(buttonElement, EventType.KEY_UP, (e4) => {
          const event = new StandardKeyboardEvent(e4);
          let eventHandled = true;
          if ((event.equals(18 /* DownArrow */) || event.equals(3 /* Enter */)) && !this.isOpen) {
            this.focusedMenu = { index: menuIndex };
            this.openedViaKeyboard = true;
            this.focusState = 3 /* OPEN */;
          } else {
            eventHandled = false;
          }
          if (eventHandled) {
            event.preventDefault();
            event.stopPropagation();
          }
        }));
        this._register(Gesture.addTarget(buttonElement));
        this._register(addDisposableListener(buttonElement, EventType2.Tap, (e4) => {
          if (this.isOpen && this.focusedMenu && this.focusedMenu.holder && isAncestor(e4.initialTarget, this.focusedMenu.holder)) {
            return;
          }
          this.ignoreNextMouseUp = false;
          this.onMenuTriggered(menuIndex, true);
          e4.preventDefault();
          e4.stopPropagation();
        }));
        this._register(addDisposableListener(buttonElement, EventType.MOUSE_DOWN, (e4) => {
          const mouseEvent = new StandardMouseEvent(getWindow(buttonElement), e4);
          if (!mouseEvent.leftButton) {
            e4.preventDefault();
            return;
          }
          if (!this.isOpen) {
            this.ignoreNextMouseUp = true;
            this.onMenuTriggered(menuIndex, true);
          } else if (!this.menuHolderAttached) {
            this.setUnfocusedState();
            this.ignoreNextMouseUp = true;
            this.onMenuTriggered(menuIndex, true);
          } else {
            this.ignoreNextMouseUp = false;
          }
          e4.preventDefault();
          e4.stopPropagation();
        }));
        this._register(addDisposableListener(buttonElement, EventType.MOUSE_UP, (e4) => {
          if (e4.defaultPrevented) {
            return;
          }
          if (!this.ignoreNextMouseUp) {
            if (this.isFocused) {
              this.onMenuTriggered(menuIndex, true);
            }
          } else {
            this.ignoreNextMouseUp = false;
          }
        }));
        this._register(addDisposableListener(buttonElement, EventType.MOUSE_ENTER, () => {
          if (this.isOpen && !this.isCurrentMenu(menuIndex)) {
            buttonElement.focus();
            this.cleanupCustomMenu();
            this.showCustomMenu(menuIndex, false);
          } else if (this.isFocused && !this.isOpen) {
            this.focusedMenu = { index: menuIndex };
            buttonElement.focus();
          }
        }));
        this.menus.push({
          label: menuBarMenu.label,
          actions: menuBarMenu.actions,
          buttonElement,
          titleElement
        });
      }
    });
  }
  createOverflowMenu() {
    const label3 = this.isCompact ? localize(26, null) : localize(27, null);
    const buttonElement = $127("div.menubar-menu-button", { "role": "menuitem", "tabindex": this.isCompact ? 0 : -1, "aria-label": label3, "aria-haspopup": true });
    const titleElement = $127("div.menubar-menu-title.toolbar-toggle-more" + ThemeIcon.asCSSSelector(Codicon.menuBarMore), { "role": "none", "aria-hidden": true });
    buttonElement.appendChild(titleElement);
    this.container.appendChild(buttonElement);
    buttonElement.style.visibility = "hidden";
    this._register(addDisposableListener(buttonElement, EventType.KEY_UP, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      let eventHandled = true;
      const triggerKeys = [3 /* Enter */];
      if (!this.isCompact) {
        triggerKeys.push(18 /* DownArrow */);
      } else {
        triggerKeys.push(10 /* Space */);
        if (this.options.compactMode?.horizontal === 0 /* Right */) {
          triggerKeys.push(17 /* RightArrow */);
        } else if (this.options.compactMode?.horizontal === 1 /* Left */) {
          triggerKeys.push(15 /* LeftArrow */);
        }
      }
      if (triggerKeys.some((k) => event.equals(k)) && !this.isOpen) {
        this.focusedMenu = { index: _MenuBar.OVERFLOW_INDEX };
        this.openedViaKeyboard = true;
        this.focusState = 3 /* OPEN */;
      } else {
        eventHandled = false;
      }
      if (eventHandled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }));
    this._register(Gesture.addTarget(buttonElement));
    this._register(addDisposableListener(buttonElement, EventType2.Tap, (e4) => {
      if (this.isOpen && this.focusedMenu && this.focusedMenu.holder && isAncestor(e4.initialTarget, this.focusedMenu.holder)) {
        return;
      }
      this.ignoreNextMouseUp = false;
      this.onMenuTriggered(_MenuBar.OVERFLOW_INDEX, true);
      e4.preventDefault();
      e4.stopPropagation();
    }));
    this._register(addDisposableListener(buttonElement, EventType.MOUSE_DOWN, (e4) => {
      const mouseEvent = new StandardMouseEvent(getWindow(buttonElement), e4);
      if (!mouseEvent.leftButton) {
        e4.preventDefault();
        return;
      }
      if (!this.isOpen) {
        this.ignoreNextMouseUp = true;
        this.onMenuTriggered(_MenuBar.OVERFLOW_INDEX, true);
      } else if (!this.menuHolderAttached) {
        this.setUnfocusedState();
        this.ignoreNextMouseUp = true;
        this.onMenuTriggered(_MenuBar.OVERFLOW_INDEX, true);
      } else {
        this.ignoreNextMouseUp = false;
      }
      e4.preventDefault();
      e4.stopPropagation();
    }));
    this._register(addDisposableListener(buttonElement, EventType.MOUSE_UP, (e4) => {
      if (e4.defaultPrevented) {
        return;
      }
      if (!this.ignoreNextMouseUp) {
        if (this.isFocused) {
          this.onMenuTriggered(_MenuBar.OVERFLOW_INDEX, true);
        }
      } else {
        this.ignoreNextMouseUp = false;
      }
    }));
    this._register(addDisposableListener(buttonElement, EventType.MOUSE_ENTER, () => {
      if (this.isOpen && !this.isCurrentMenu(_MenuBar.OVERFLOW_INDEX)) {
        this.overflowMenu.buttonElement.focus();
        this.cleanupCustomMenu();
        this.showCustomMenu(_MenuBar.OVERFLOW_INDEX, false);
      } else if (this.isFocused && !this.isOpen) {
        this.focusedMenu = { index: _MenuBar.OVERFLOW_INDEX };
        buttonElement.focus();
      }
    }));
    this.overflowMenu = {
      buttonElement,
      titleElement,
      label: "More",
      actions: []
    };
  }
  updateMenu(menu) {
    const menuToUpdate = this.menus.filter((menuBarMenu) => menuBarMenu.label === menu.label);
    if (menuToUpdate && menuToUpdate.length) {
      menuToUpdate[0].actions = menu.actions;
    }
  }
  dispose() {
    super.dispose();
    this.menus.forEach((menuBarMenu) => {
      menuBarMenu.titleElement?.remove();
      menuBarMenu.buttonElement?.remove();
    });
    this.overflowMenu.titleElement.remove();
    this.overflowMenu.buttonElement.remove();
    dispose(this.overflowLayoutScheduled);
    this.overflowLayoutScheduled = void 0;
  }
  blur() {
    this.setUnfocusedState();
  }
  /**
   * Resets the menu bar back to its resting (unfocused) state unless a menu
   * is actually visible. This self-heals a stale open/focused state that can
   * occur on Windows after the window loses and regains focus (for example
   * through a screenshot overlay or Alt+Tab): the state machine keeps
   * believing a menu is open although its holder has already been removed,
   * which would otherwise swallow the next clicks on the menu buttons.
   */
  resetFocus() {
    if (!this.menuHolderAttached) {
      this.setUnfocusedState();
    }
  }
  getWidth() {
    if (!this.isCompact && this.menus) {
      const left = this.menus[0].buttonElement.getBoundingClientRect().left;
      const right = this.hasOverflow ? this.overflowMenu.buttonElement.getBoundingClientRect().right : this.menus[this.menus.length - 1].buttonElement.getBoundingClientRect().right;
      return right - left;
    }
    return 0;
  }
  getHeight() {
    return this.container.clientHeight;
  }
  toggleFocus() {
    if (!this.isFocused && this.options.visibility !== "hidden") {
      this.mnemonicsInUse = true;
      this.focusedMenu = { index: this.numMenusShown > 0 ? 0 : _MenuBar.OVERFLOW_INDEX };
      this.focusState = 2 /* FOCUSED */;
    } else if (!this.isOpen) {
      this.setUnfocusedState();
    }
  }
  updateOverflowAction() {
    if (!this.menus || !this.menus.length) {
      return;
    }
    const overflowMenuOnlyClass = "overflow-menu-only";
    this.container.classList.toggle(overflowMenuOnlyClass, false);
    const sizeAvailable = this.container.offsetWidth;
    let currentSize = 0;
    let full = this.isCompact;
    const prevNumMenusShown = this.numMenusShown;
    this.numMenusShown = 0;
    const showableMenus = this.menus.filter((menu) => menu.buttonElement !== void 0 && menu.titleElement !== void 0);
    for (const menuBarMenu of showableMenus) {
      if (!full) {
        const size3 = menuBarMenu.buttonElement.offsetWidth;
        if (currentSize + size3 > sizeAvailable) {
          full = true;
        } else {
          currentSize += size3;
          this.numMenusShown++;
          if (this.numMenusShown > prevNumMenusShown) {
            menuBarMenu.buttonElement.style.visibility = "visible";
          }
        }
      }
      if (full) {
        menuBarMenu.buttonElement.style.visibility = "hidden";
      }
    }
    if (this.numMenusShown - 1 <= showableMenus.length / 4) {
      for (const menuBarMenu of showableMenus) {
        menuBarMenu.buttonElement.style.visibility = "hidden";
      }
      full = true;
      this.numMenusShown = 0;
      currentSize = 0;
    }
    if (this.isCompact) {
      this.overflowMenu.actions = [];
      for (let idx = this.numMenusShown; idx < this.menus.length; idx++) {
        this.overflowMenu.actions.push(new SubmenuAction(`menubar.submenu.${this.menus[idx].label}`, this.menus[idx].label, this.menus[idx].actions || []));
      }
      const compactMenuActions = this.options.getCompactMenuActions?.();
      if (compactMenuActions && compactMenuActions.length) {
        this.overflowMenu.actions.push(new Separator());
        this.overflowMenu.actions.push(...compactMenuActions);
      }
      this.overflowMenu.buttonElement.style.visibility = "visible";
    } else if (full) {
      while (currentSize + this.overflowMenu.buttonElement.offsetWidth > sizeAvailable && this.numMenusShown > 0) {
        this.numMenusShown--;
        const size3 = showableMenus[this.numMenusShown].buttonElement.offsetWidth;
        showableMenus[this.numMenusShown].buttonElement.style.visibility = "hidden";
        currentSize -= size3;
      }
      this.overflowMenu.actions = [];
      for (let idx = this.numMenusShown; idx < showableMenus.length; idx++) {
        this.overflowMenu.actions.push(new SubmenuAction(`menubar.submenu.${showableMenus[idx].label}`, showableMenus[idx].label, showableMenus[idx].actions || []));
      }
      if (this.overflowMenu.buttonElement.nextElementSibling !== showableMenus[this.numMenusShown].buttonElement) {
        this.overflowMenu.buttonElement.remove();
        this.container.insertBefore(this.overflowMenu.buttonElement, showableMenus[this.numMenusShown].buttonElement);
      }
      this.overflowMenu.buttonElement.style.visibility = "visible";
    } else {
      this.overflowMenu.buttonElement.remove();
      this.container.appendChild(this.overflowMenu.buttonElement);
      this.overflowMenu.buttonElement.style.visibility = "hidden";
    }
    this.container.classList.toggle(overflowMenuOnlyClass, this.numMenusShown === 0);
  }
  updateLabels(titleElement, buttonElement, label3) {
    const cleanMenuLabel = cleanMnemonic(label3);
    if (this.options.enableMnemonics) {
      const cleanLabel = escape(label3);
      MENU_ESCAPED_MNEMONIC_REGEX.lastIndex = 0;
      let escMatch = MENU_ESCAPED_MNEMONIC_REGEX.exec(cleanLabel);
      while (escMatch && escMatch[1]) {
        escMatch = MENU_ESCAPED_MNEMONIC_REGEX.exec(cleanLabel);
      }
      const replaceDoubleEscapes = (str) => str.replace(/&amp;&amp;/g, "&amp;");
      if (escMatch) {
        titleElement.textContent = "";
        titleElement.append(
          ltrim(replaceDoubleEscapes(cleanLabel.substr(0, escMatch.index)), " "),
          $127("mnemonic", { "aria-hidden": "true" }, escMatch[3]),
          rtrim(replaceDoubleEscapes(cleanLabel.substr(escMatch.index + escMatch[0].length)), " ")
        );
      } else {
        titleElement.textContent = replaceDoubleEscapes(cleanLabel).trim();
      }
    } else {
      titleElement.textContent = cleanMenuLabel.replace(/&&/g, "&");
    }
    const mnemonicMatches = MENU_MNEMONIC_REGEX.exec(label3);
    if (mnemonicMatches) {
      const mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];
      if (this.options.enableMnemonics) {
        buttonElement.setAttribute("aria-keyshortcuts", "Alt+" + mnemonic.toLocaleLowerCase());
      } else {
        buttonElement.removeAttribute("aria-keyshortcuts");
      }
    }
  }
  update(options3) {
    if (options3) {
      this.options = options3;
    }
    if (this.isFocused) {
      this.updatePending = true;
      return;
    }
    this.menus.forEach((menuBarMenu) => {
      if (!menuBarMenu.buttonElement || !menuBarMenu.titleElement) {
        return;
      }
      this.updateLabels(menuBarMenu.titleElement, menuBarMenu.buttonElement, menuBarMenu.label);
    });
    if (!this.overflowLayoutScheduled) {
      this.overflowLayoutScheduled = scheduleAtNextAnimationFrame(getWindow(this.container), () => {
        this.updateOverflowAction();
        this.overflowLayoutScheduled = void 0;
      });
    }
    this.setUnfocusedState();
  }
  registerMnemonic(menuIndex, mnemonic) {
    this.mnemonics.set(mnemonic.toLocaleLowerCase(), menuIndex);
  }
  hideMenubar() {
    if (this.container.style.display !== "none") {
      this.container.style.display = "none";
      this._onVisibilityChange.fire(false);
    }
  }
  showMenubar() {
    if (this.container.style.display !== "flex") {
      this.container.style.display = "flex";
      this._onVisibilityChange.fire(true);
      this.updateOverflowAction();
    }
  }
  get focusState() {
    return this._focusState;
  }
  set focusState(value2) {
    if (this._focusState >= 2 /* FOCUSED */ && value2 < 2 /* FOCUSED */) {
      if (this.updatePending) {
        this.menuUpdater.schedule();
        this.updatePending = false;
      }
    }
    if (value2 === this._focusState) {
      return;
    }
    const isVisible = this.isVisible;
    const isOpen = this.isOpen;
    const isFocused = this.isFocused;
    this._focusState = value2;
    switch (value2) {
      case 0 /* HIDDEN */:
        if (isVisible) {
          this.hideMenubar();
        }
        if (isOpen) {
          this.cleanupCustomMenu();
        }
        if (isFocused) {
          this.focusedMenu = void 0;
          if (this.focusToReturn) {
            this.focusToReturn.focus();
            this.focusToReturn = void 0;
          }
        }
        break;
      case 1 /* VISIBLE */:
        if (!isVisible) {
          this.showMenubar();
        }
        if (isOpen) {
          this.cleanupCustomMenu();
        }
        if (isFocused) {
          if (this.focusedMenu) {
            if (this.focusedMenu.index === _MenuBar.OVERFLOW_INDEX) {
              this.overflowMenu.buttonElement.blur();
            } else {
              this.menus[this.focusedMenu.index].buttonElement?.blur();
            }
          }
          this.focusedMenu = void 0;
          if (this.focusToReturn) {
            this.focusToReturn.focus();
            this.focusToReturn = void 0;
          }
        }
        break;
      case 2 /* FOCUSED */:
        if (!isVisible) {
          this.showMenubar();
        }
        if (isOpen) {
          this.cleanupCustomMenu();
        }
        if (this.focusedMenu) {
          if (this.focusedMenu.index === 0 && this.numMenusShown === 0) {
            this.focusedMenu.index = _MenuBar.OVERFLOW_INDEX;
          }
          if (this.focusedMenu.index === _MenuBar.OVERFLOW_INDEX) {
            this.overflowMenu.buttonElement.focus();
          } else {
            this.menus[this.focusedMenu.index].buttonElement?.focus();
          }
        }
        break;
      case 3 /* OPEN */:
        if (!isVisible) {
          this.showMenubar();
        }
        if (this.focusedMenu) {
          this.cleanupCustomMenu();
          this.showCustomMenu(this.focusedMenu.index, this.openedViaKeyboard);
        }
        break;
    }
    this._focusState = value2;
    this._onFocusStateChange.fire(this.focusState >= 2 /* FOCUSED */);
  }
  get isVisible() {
    return this.focusState >= 1 /* VISIBLE */;
  }
  get isFocused() {
    return this.focusState >= 2 /* FOCUSED */;
  }
  get isOpen() {
    return this.focusState >= 3 /* OPEN */;
  }
  get hasOverflow() {
    return this.isCompact || this.numMenusShown < this.menus.length;
  }
  get isCompact() {
    return this.options.compactMode !== void 0;
  }
  setUnfocusedState() {
    if (this.options.visibility === "toggle" || this.options.visibility === "hidden") {
      this.focusState = 0 /* HIDDEN */;
    } else if (this.options.visibility === "classic" && isFullscreen(mainWindow)) {
      this.focusState = 0 /* HIDDEN */;
    } else {
      this.focusState = 1 /* VISIBLE */;
    }
    this.ignoreNextMouseUp = false;
    this.mnemonicsInUse = false;
    this.updateMnemonicVisibility(false);
  }
  focusPrevious() {
    if (!this.focusedMenu || this.numMenusShown === 0) {
      return;
    }
    let newFocusedIndex = (this.focusedMenu.index - 1 + this.numMenusShown) % this.numMenusShown;
    if (this.focusedMenu.index === _MenuBar.OVERFLOW_INDEX) {
      newFocusedIndex = this.numMenusShown - 1;
    } else if (this.focusedMenu.index === 0 && this.hasOverflow) {
      newFocusedIndex = _MenuBar.OVERFLOW_INDEX;
    }
    if (newFocusedIndex === this.focusedMenu.index) {
      return;
    }
    if (this.isOpen) {
      this.cleanupCustomMenu();
      this.showCustomMenu(newFocusedIndex);
    } else if (this.isFocused) {
      this.focusedMenu.index = newFocusedIndex;
      if (newFocusedIndex === _MenuBar.OVERFLOW_INDEX) {
        this.overflowMenu.buttonElement.focus();
      } else {
        this.menus[newFocusedIndex].buttonElement?.focus();
      }
    }
  }
  focusNext() {
    if (!this.focusedMenu || this.numMenusShown === 0) {
      return;
    }
    let newFocusedIndex = (this.focusedMenu.index + 1) % this.numMenusShown;
    if (this.focusedMenu.index === _MenuBar.OVERFLOW_INDEX) {
      newFocusedIndex = 0;
    } else if (this.focusedMenu.index === this.numMenusShown - 1) {
      newFocusedIndex = _MenuBar.OVERFLOW_INDEX;
    }
    if (newFocusedIndex === this.focusedMenu.index) {
      return;
    }
    if (this.isOpen) {
      this.cleanupCustomMenu();
      this.showCustomMenu(newFocusedIndex);
    } else if (this.isFocused) {
      this.focusedMenu.index = newFocusedIndex;
      if (newFocusedIndex === _MenuBar.OVERFLOW_INDEX) {
        this.overflowMenu.buttonElement.focus();
      } else {
        this.menus[newFocusedIndex].buttonElement?.focus();
      }
    }
  }
  updateMnemonicVisibility(visible) {
    if (this.menus) {
      this.menus.forEach((menuBarMenu) => {
        if (menuBarMenu.titleElement && menuBarMenu.titleElement.children.length) {
          const child = menuBarMenu.titleElement.children.item(0);
          if (child) {
            child.style.textDecoration = this.options.alwaysOnMnemonics || visible ? "underline" : "";
          }
        }
      });
    }
  }
  get mnemonicsInUse() {
    return this._mnemonicsInUse;
  }
  set mnemonicsInUse(value2) {
    this._mnemonicsInUse = value2;
  }
  get shouldAltKeyFocus() {
    if (isMacintosh) {
      return false;
    }
    if (!this.options.disableAltFocus) {
      return true;
    }
    if (this.options.visibility === "toggle") {
      return true;
    }
    return false;
  }
  get onVisibilityChange() {
    return this._onVisibilityChange.event;
  }
  get onFocusStateChange() {
    return this._onFocusStateChange.event;
  }
  /**
   * Whether a menu is actually open and visible: its holder has been created
   * and attached. The state machine can transiently or stalely report a menu
   * as open without any visible menu (for example when the overflow actions
   * are not ready yet), which would swallow subsequent clicks, so callers use
   * this to detect and self-heal.
   */
  get menuHolderAttached() {
    return Boolean(this.focusedMenu?.holder);
  }
  onMenuTriggered(menuIndex, clicked) {
    if (this.isOpen) {
      if (this.isCurrentMenu(menuIndex)) {
        this.setUnfocusedState();
      } else {
        this.cleanupCustomMenu();
        this.showCustomMenu(menuIndex, this.openedViaKeyboard);
        if (!this.menuHolderAttached) {
          this.setUnfocusedState();
        }
      }
    } else {
      this.focusedMenu = { index: menuIndex };
      this.openedViaKeyboard = !clicked;
      this.focusState = 3 /* OPEN */;
      if (!this.menuHolderAttached) {
        this.setUnfocusedState();
      }
    }
  }
  onModifierKeyToggled(modifierKeyStatus) {
    const allModifiersReleased = !modifierKeyStatus.altKey && !modifierKeyStatus.ctrlKey && !modifierKeyStatus.shiftKey && !modifierKeyStatus.metaKey;
    if (this.options.visibility === "hidden") {
      return;
    }
    if (modifierKeyStatus.event && this.shouldAltKeyFocus) {
      if (ScanCodeUtils.toEnum(modifierKeyStatus.event.code) === 159 /* AltLeft */) {
        modifierKeyStatus.event.preventDefault();
      }
    }
    if (this.isFocused && modifierKeyStatus.lastKeyPressed === "alt" && modifierKeyStatus.altKey) {
      this.setUnfocusedState();
      this.mnemonicsInUse = false;
      this.awaitingAltRelease = true;
    }
    if (allModifiersReleased && modifierKeyStatus.lastKeyPressed === "alt" && modifierKeyStatus.lastKeyReleased === "alt") {
      if (!this.awaitingAltRelease) {
        if (!this.isFocused && this.shouldAltKeyFocus) {
          this.mnemonicsInUse = true;
          this.focusedMenu = { index: this.numMenusShown > 0 ? 0 : _MenuBar.OVERFLOW_INDEX };
          this.focusState = 2 /* FOCUSED */;
        } else if (!this.isOpen) {
          this.setUnfocusedState();
        }
      }
    }
    if (!modifierKeyStatus.altKey && modifierKeyStatus.lastKeyReleased === "alt") {
      this.awaitingAltRelease = false;
    }
    if (this.options.enableMnemonics && this.menus && !this.isOpen) {
      this.updateMnemonicVisibility(!this.awaitingAltRelease && modifierKeyStatus.altKey || this.mnemonicsInUse);
    }
  }
  isCurrentMenu(menuIndex) {
    if (!this.focusedMenu) {
      return false;
    }
    return this.focusedMenu.index === menuIndex;
  }
  cleanupCustomMenu() {
    if (this.focusedMenu) {
      if (this.focusedMenu.index === _MenuBar.OVERFLOW_INDEX) {
        this.overflowMenu.buttonElement.focus();
      } else {
        this.menus[this.focusedMenu.index].buttonElement?.focus();
      }
      if (this.focusedMenu.holder) {
        this.focusedMenu.holder.parentElement?.classList.remove("open");
        this.focusedMenu.holder.remove();
      }
      this.focusedMenu.widget?.dispose();
      this.focusedMenu = { index: this.focusedMenu.index };
    }
    this.menuDisposables.clear();
  }
  showCustomMenu(menuIndex, selectFirst = true) {
    const actualMenuIndex = menuIndex >= this.numMenusShown ? _MenuBar.OVERFLOW_INDEX : menuIndex;
    const customMenu = actualMenuIndex === _MenuBar.OVERFLOW_INDEX ? this.overflowMenu : this.menus[actualMenuIndex];
    if (!customMenu.actions || !customMenu.buttonElement || !customMenu.titleElement) {
      return;
    }
    const menuHolder = $127("div.menubar-menu-items-holder", { "title": "" });
    customMenu.buttonElement.classList.add("open");
    const titleBoundingRect = customMenu.titleElement.getBoundingClientRect();
    const titleBoundingRectZoom = getDomNodeZoomLevel(customMenu.titleElement);
    if (this.options.compactMode?.horizontal === 0 /* Right */) {
      menuHolder.style.left = `${titleBoundingRect.left + this.container.clientWidth}px`;
    } else if (this.options.compactMode?.horizontal === 1 /* Left */) {
      const windowWidth = getWindow(this.container).innerWidth;
      menuHolder.style.right = `${windowWidth - titleBoundingRect.left}px`;
      menuHolder.style.left = "auto";
    } else {
      menuHolder.style.left = `${titleBoundingRect.left * titleBoundingRectZoom}px`;
    }
    if (this.options.compactMode?.vertical === 0 /* Above */) {
      menuHolder.style.top = `${titleBoundingRect.top - this.menus.length * 30 + this.container.clientHeight}px`;
    } else if (this.options.compactMode?.vertical === 1 /* Below */) {
      menuHolder.style.top = `${titleBoundingRect.top}px`;
    } else {
      menuHolder.style.top = `${titleBoundingRect.bottom * titleBoundingRectZoom}px`;
    }
    customMenu.buttonElement.appendChild(menuHolder);
    const menuOptions = {
      getKeyBinding: this.options.getKeybinding,
      actionRunner: this.actionRunner,
      enableMnemonics: this.options.alwaysOnMnemonics || this.mnemonicsInUse && this.options.enableMnemonics,
      ariaLabel: customMenu.buttonElement.getAttribute("aria-label") ?? void 0,
      expandDirection: this.isCompact ? this.options.compactMode : { horizontal: 0 /* Right */, vertical: 1 /* Below */ },
      useEventAsContext: true
    };
    const menuWidget = this.menuDisposables.add(new Menu(menuHolder, customMenu.actions, menuOptions, this.menuStyle));
    this.menuDisposables.add(menuWidget.onDidCancel(() => {
      this.focusState = 2 /* FOCUSED */;
    }));
    if (actualMenuIndex !== menuIndex) {
      menuWidget.trigger(menuIndex - this.numMenusShown);
    } else {
      menuWidget.focus(selectFirst);
    }
    this.focusedMenu = {
      index: actualMenuIndex,
      holder: menuHolder,
      widget: menuWidget
    };
  }
};
export { $127, MenuBar };
