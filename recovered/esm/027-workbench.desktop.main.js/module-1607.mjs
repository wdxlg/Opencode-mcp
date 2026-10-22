// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/menu/menu.ts
import { ActionBar } from "./module-0477.mjs";
import { isLinux, isMacintosh } from "./module-0014.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { $, Dimension, EventHelper, EventType, addDisposableListener, append, clearNode, getActiveElement, getWindow, isAncestor, isInShadowDOM } from "./module-0075.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { EmptySubmenuAction, Separator, SubmenuAction } from "./module-0082.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { ActionViewItem, BaseActionViewItem } from "./module-0476.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { isFirefox2 } from "./module-0018.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { stripIcons } from "./module-0461.mjs";
import { escape, ltrim, rtrim } from "./module-0030.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { layout } from "./module-0470.mjs";
import { getCodiconFontCharacters } from "./module-0083.mjs";
import { CONTEXT_VIEW_MENU_MOTION_SHADOW_VARIABLE } from "./module-0471.mjs";


// src/vs/base/browser/ui/menu/menu.ts
var MENU_MNEMONIC_REGEX = /\(&([^\s&])\)|(^|[^&])&([^\s&])/;

var MENU_ESCAPED_MNEMONIC_REGEX = /(&amp;)?(&amp;)([^\s&])/g;

var unthemedMenuStyles = {
  shadowColor: void 0,
  borderColor: void 0,
  foregroundColor: void 0,
  backgroundColor: void 0,
  selectionForegroundColor: void 0,
  selectionBackgroundColor: void 0,
  selectionBorderColor: void 0,
  separatorColor: void 0,
  scrollbarShadow: void 0,
  scrollbarSliderBackground: void 0,
  scrollbarSliderHoverBackground: void 0,
  scrollbarSliderActiveBackground: void 0
};

var Menu = class _Menu extends ActionBar {
  constructor(container3, actions, options3, menuStyles) {
    container3.classList.add("monaco-menu-container");
    container3.setAttribute("role", "presentation");
    const menuElement = document.createElement("div");
    menuElement.classList.add("monaco-menu");
    menuElement.setAttribute("role", "presentation");
    super(menuElement, {
      orientation: 1 /* VERTICAL */,
      actionViewItemProvider: (action) => this.doGetActionViewItem(action, options3, parentData),
      context: options3.context,
      actionRunner: options3.actionRunner,
      ariaLabel: options3.ariaLabel,
      ariaRole: "menu",
      focusOnlyEnabledItems: true,
      triggerKeys: { keys: [3 /* Enter */, ...isMacintosh || isLinux ? [10 /* Space */] : []], keyDown: true }
    });
    this.menuStyles = menuStyles;
    this.menuElement = menuElement;
    this.actionsList.tabIndex = 0;
    this.initializeOrUpdateStyleSheet(container3, menuStyles);
    this._register(Gesture.addTarget(menuElement));
    this._register(addDisposableListener(menuElement, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(2 /* Tab */)) {
        e.preventDefault();
      }
    }));
    if (options3.enableMnemonics) {
      this._register(addDisposableListener(menuElement, EventType.KEY_DOWN, (e) => {
        const key3 = e.key.toLocaleLowerCase();
        const actions2 = this.mnemonics.get(key3);
        if (actions2 !== void 0) {
          EventHelper.stop(e, true);
          if (actions2.length === 1) {
            if (actions2[0] instanceof SubmenuMenuActionViewItem && actions2[0].container) {
              this.focusItemByElement(actions2[0].container);
            }
            actions2[0].onClick(e);
          }
          if (actions2.length > 1) {
            const action = actions2.shift();
            if (action && action.container) {
              this.focusItemByElement(action.container);
              actions2.push(action);
            }
            this.mnemonics.set(key3, actions2);
          }
        }
      }));
    }
    if (isLinux) {
      this._register(addDisposableListener(menuElement, EventType.KEY_DOWN, (e) => {
        const event = new StandardKeyboardEvent(e);
        if (event.equals(14 /* Home */) || event.equals(11 /* PageUp */)) {
          this.focusedItem = this.viewItems.length - 1;
          this.focusNext();
          EventHelper.stop(e, true);
        } else if (event.equals(13 /* End */) || event.equals(12 /* PageDown */)) {
          this.focusedItem = 0;
          this.focusPrevious();
          EventHelper.stop(e, true);
        }
      }));
    }
    this._register(addDisposableListener(this.domNode, EventType.MOUSE_OUT, (e) => {
      const relatedTarget = e.relatedTarget;
      if (!isAncestor(relatedTarget, this.domNode)) {
        this.focusedItem = void 0;
        this.updateFocus();
        e.stopPropagation();
      }
    }));
    this._register(addDisposableListener(this.actionsList, EventType.MOUSE_MOVE, (e) => {
      if (e.movementX === 0 && e.movementY === 0) {
        return;
      }
      let target = e.target;
      if (!target || !isAncestor(target, this.actionsList) || target === this.actionsList) {
        return;
      }
      while (target.parentElement !== this.actionsList && target.parentElement !== null) {
        target = target.parentElement;
      }
      if (target.classList.contains("action-item")) {
        const lastFocusedItem = this.focusedItem;
        if (lastFocusedItem !== void 0 && this.actionsList.children[lastFocusedItem] === target) {
          return;
        }
        this.setFocusedItem(target);
        if (lastFocusedItem !== this.focusedItem) {
          this.updateFocus();
        }
      }
    }));
    this._register(Gesture.addTarget(this.actionsList));
    this._register(addDisposableListener(this.actionsList, EventType2.Tap, (e) => {
      let target = e.initialTarget;
      if (!target || !isAncestor(target, this.actionsList) || target === this.actionsList) {
        return;
      }
      while (target.parentElement !== this.actionsList && target.parentElement !== null) {
        target = target.parentElement;
      }
      if (target.classList.contains("action-item")) {
        const lastFocusedItem = this.focusedItem;
        this.setFocusedItem(target);
        if (lastFocusedItem !== this.focusedItem) {
          this.updateFocus();
        }
      }
    }));
    const parentData = {
      parent: this
    };
    this.mnemonics = /* @__PURE__ */ new Map();
    this.scrollableElement = this._register(new DomScrollableElement(menuElement, {
      alwaysConsumeMouseWheel: true,
      horizontal: 2 /* Hidden */,
      vertical: 3 /* Visible */,
      verticalScrollbarSize: 7,
      handleMouseWheel: true,
      useShadows: true
    }));
    const scrollElement = this.scrollableElement.getDomNode();
    scrollElement.style.position = "";
    this.styleScrollElement(scrollElement, menuStyles);
    this._register(addDisposableListener(menuElement, EventType2.Change, (e) => {
      EventHelper.stop(e, true);
      const scrollTop = this.scrollableElement.getScrollPosition().scrollTop;
      this.scrollableElement.setScrollPosition({ scrollTop: scrollTop - e.translationY });
    }));
    this._register(addDisposableListener(scrollElement, EventType.MOUSE_UP, (e) => {
      e.preventDefault();
    }));
    const window2 = getWindow(container3);
    menuElement.style.maxHeight = `${Math.max(10, window2.innerHeight - container3.getBoundingClientRect().top - 35)}px`;
    actions = actions.filter((a, idx) => {
      if (options3.submenuIds?.has(a.id)) {
        console.warn(`Found submenu cycle: ${a.id}`);
        return false;
      }
      if (a instanceof Separator) {
        if (idx === actions.length - 1 || idx === 0) {
          return false;
        }
        const prevAction = actions[idx - 1];
        if (prevAction instanceof Separator) {
          return false;
        }
      }
      return true;
    });
    this.push(actions, { icon: true, label: true, isMenu: true });
    container3.appendChild(this.scrollableElement.getDomNode());
    this.scrollableElement.scanDomNode();
    this.viewItems.filter((item) => !(item instanceof MenuSeparatorActionViewItem)).forEach((item, index2, array3) => {
      item.updatePositionInSet(index2 + 1, array3.length);
    });
  }
  initializeOrUpdateStyleSheet(container3, style) {
    if (!this.styleSheet) {
      if (isInShadowDOM(container3)) {
        this.styleSheet = createStyleSheet(container3);
      } else {
        if (!_Menu.globalStyleSheet) {
          _Menu.globalStyleSheet = createStyleSheet();
        }
        this.styleSheet = _Menu.globalStyleSheet;
      }
    }
    this.styleSheet.textContent = getMenuWidgetCSS(style, isInShadowDOM(container3));
  }
  styleScrollElement(scrollElement, style) {
    const fgColor = style.foregroundColor ?? "";
    const bgColor = style.backgroundColor ?? "";
    const borderRadius = "var(--vscode-cornerRadius-large)";
    scrollElement.style.borderRadius = borderRadius;
    scrollElement.style.color = fgColor;
    scrollElement.style.backgroundColor = bgColor;
  }
  getContainer() {
    return this.scrollableElement.getDomNode();
  }
  get onScroll() {
    return this.scrollableElement.onScroll;
  }
  get scrollOffset() {
    return this.menuElement.scrollTop;
  }
  trigger(index2) {
    if (index2 <= this.viewItems.length && index2 >= 0) {
      const item = this.viewItems[index2];
      if (item instanceof SubmenuMenuActionViewItem) {
        super.focus(index2);
        item.open(true);
      } else if (item instanceof BaseMenuActionViewItem) {
        super.run(item._action, item._context);
      } else {
        return;
      }
    }
  }
  focusItemByElement(element) {
    const lastFocusedItem = this.focusedItem;
    this.setFocusedItem(element);
    if (lastFocusedItem !== this.focusedItem) {
      this.updateFocus();
    }
  }
  setFocusedItem(element) {
    for (let i2 = 0; i2 < this.actionsList.children.length; i2++) {
      const elem = this.actionsList.children[i2];
      if (element === elem) {
        this.focusedItem = i2;
        break;
      }
    }
  }
  updateFocus(fromRight) {
    super.updateFocus(fromRight, true, true);
    if (typeof this.focusedItem !== "undefined") {
      this.scrollableElement.setScrollPosition({
        scrollTop: Math.round(this.menuElement.scrollTop)
      });
    }
  }
  doGetActionViewItem(action, options3, parentData) {
    if (action instanceof Separator) {
      return new MenuSeparatorActionViewItem(options3.context, action, { icon: true }, this.menuStyles);
    } else if (action instanceof SubmenuAction) {
      const menuActionViewItem = new SubmenuMenuActionViewItem(action, action.actions, parentData, { ...options3, submenuIds: /* @__PURE__ */ new Set([...options3.submenuIds || [], action.id]) }, this.menuStyles);
      if (options3.enableMnemonics) {
        const mnemonic = menuActionViewItem.getMnemonic();
        if (mnemonic && menuActionViewItem.isEnabled()) {
          const actionViewItems = this.mnemonics.get(mnemonic);
          if (actionViewItems !== void 0) {
            actionViewItems.push(menuActionViewItem);
          } else {
            this.mnemonics.set(mnemonic, [menuActionViewItem]);
          }
        }
      }
      return menuActionViewItem;
    } else {
      const keybindingLabel2 = options3.getKeyBinding?.(action)?.getLabel();
      const menuItemOptions = {
        enableMnemonics: options3.enableMnemonics,
        useEventAsContext: options3.useEventAsContext,
        keybinding: keybindingLabel2
      };
      const menuActionViewItem = new BaseMenuActionViewItem(options3.context, action, menuItemOptions, this.menuStyles);
      if (options3.enableMnemonics) {
        const mnemonic = menuActionViewItem.getMnemonic();
        if (mnemonic && menuActionViewItem.isEnabled()) {
          const actionViewItems = this.mnemonics.get(mnemonic);
          if (actionViewItems !== void 0) {
            actionViewItems.push(menuActionViewItem);
          } else {
            this.mnemonics.set(mnemonic, [menuActionViewItem]);
          }
        }
      }
      return menuActionViewItem;
    }
  }
};

var BaseMenuActionViewItem = class extends BaseActionViewItem {
  constructor(ctx, action, options3, menuStyle) {
    options3 = {
      ...options3,
      isMenu: true,
      icon: options3.icon !== void 0 ? options3.icon : false,
      label: options3.label !== void 0 ? options3.label : true
    };
    super(action, action, options3);
    this.menuStyle = menuStyle;
    this.options = options3;
    this.cssClass = "";
    if (this.options.label && options3.enableMnemonics) {
      const label3 = this.action.label;
      if (label3) {
        const matches2 = MENU_MNEMONIC_REGEX.exec(label3);
        if (matches2) {
          this.mnemonic = (!!matches2[1] ? matches2[1] : matches2[3]).toLocaleLowerCase();
        }
      }
    }
    this.runOnceToEnableMouseUp = new RunOnceScheduler(() => {
      if (!this.element) {
        return;
      }
      this._register(addDisposableListener(this.element, EventType.MOUSE_UP, (e) => {
        EventHelper.stop(e, true);
        if (isFirefox2) {
          const mouseEvent = new StandardMouseEvent(getWindow(this.element), e);
          if (mouseEvent.rightButton) {
            return;
          }
          this.onClick(e);
        } else {
          setTimeout(() => {
            this.onClick(e);
          }, 0);
        }
      }));
      this._register(addDisposableListener(this.element, EventType.CONTEXT_MENU, (e) => {
        EventHelper.stop(e, true);
      }));
    }, 100);
    this._register(this.runOnceToEnableMouseUp);
  }
  render(container3) {
    super.render(container3);
    if (!this.element) {
      return;
    }
    this.container = container3;
    this.item = append(this.element, $("a.action-menu-item"));
    if (this._action.id === Separator.ID) {
      this.item.setAttribute("role", "presentation");
    } else {
      this.item.setAttribute("role", "menuitem");
      if (this.mnemonic) {
        this.item.setAttribute("aria-keyshortcuts", `${this.mnemonic}`);
      }
    }
    this.check = append(this.item, $("span.menu-item-check" + ThemeIcon.asCSSSelector(Codicon.menuSelection)));
    this.check.setAttribute("role", "none");
    this.label = append(this.item, $("span.action-label"));
    if (this.options.label && this.options.keybinding) {
      append(this.item, $("span.keybinding")).textContent = this.options.keybinding;
    }
    this.runOnceToEnableMouseUp.schedule();
    this.updateClass();
    this.updateLabel();
    this.updateTooltip();
    this.updateEnabled();
    this.updateChecked();
    this.applyStyle();
  }
  blur() {
    super.blur();
    this.applyStyle();
  }
  focus() {
    super.focus();
    this.item?.focus();
    this.applyStyle();
  }
  updatePositionInSet(pos, setSize) {
    if (this.item) {
      this.item.setAttribute("aria-posinset", `${pos}`);
      this.item.setAttribute("aria-setsize", `${setSize}`);
    }
  }
  updateLabel() {
    if (!this.label) {
      return;
    }
    if (this.options.label) {
      clearNode(this.label);
      let label3 = stripIcons(this.action.label);
      if (label3) {
        const cleanLabel = cleanMnemonic(label3);
        if (!this.options.enableMnemonics) {
          label3 = cleanLabel;
        }
        this.label.setAttribute("aria-label", cleanLabel.replace(/&&/g, "&"));
        const matches2 = MENU_MNEMONIC_REGEX.exec(label3);
        if (matches2) {
          label3 = escape(label3);
          MENU_ESCAPED_MNEMONIC_REGEX.lastIndex = 0;
          let escMatch = MENU_ESCAPED_MNEMONIC_REGEX.exec(label3);
          while (escMatch && escMatch[1]) {
            escMatch = MENU_ESCAPED_MNEMONIC_REGEX.exec(label3);
          }
          const replaceDoubleEscapes = (str) => str.replace(/&amp;&amp;/g, "&amp;");
          if (escMatch) {
            this.label.append(
              ltrim(replaceDoubleEscapes(label3.substr(0, escMatch.index)), " "),
              $(
                "u",
                { "aria-hidden": "true" },
                escMatch[3]
              ),
              rtrim(replaceDoubleEscapes(label3.substr(escMatch.index + escMatch[0].length)), " ")
            );
          } else {
            this.label.textContent = replaceDoubleEscapes(label3).trim();
          }
          this.item?.setAttribute("aria-keyshortcuts", (!!matches2[1] ? matches2[1] : matches2[3]).toLocaleLowerCase());
        } else {
          this.label.textContent = label3.replace(/&&/g, "&").trim();
        }
      }
    }
  }
  updateTooltip() {
  }
  updateClass() {
    if (this.cssClass && this.item) {
      this.item.classList.remove(...this.cssClass.split(" "));
    }
    if (this.options.icon && this.label) {
      this.cssClass = this.action.class || "";
      this.label.classList.add("icon");
      if (this.cssClass) {
        this.label.classList.add(...this.cssClass.split(" "));
      }
      this.updateEnabled();
    } else if (this.label) {
      this.label.classList.remove("icon");
    }
  }
  updateEnabled() {
    if (this.action.enabled) {
      if (this.element) {
        this.element.classList.remove("disabled");
        this.element.removeAttribute("aria-disabled");
      }
      if (this.item) {
        this.item.classList.remove("disabled");
        this.item.removeAttribute("aria-disabled");
        this.item.tabIndex = 0;
      }
    } else {
      if (this.element) {
        this.element.classList.add("disabled");
        this.element.setAttribute("aria-disabled", "true");
      }
      if (this.item) {
        this.item.classList.add("disabled");
        this.item.setAttribute("aria-disabled", "true");
      }
    }
  }
  updateChecked() {
    if (!this.item) {
      return;
    }
    const checked = this.action.checked;
    this.item.classList.toggle("checked", !!checked);
    if (checked !== void 0) {
      this.item.setAttribute("role", "menuitemcheckbox");
      this.item.setAttribute("aria-checked", checked ? "true" : "false");
    } else {
      this.item.setAttribute("role", "menuitem");
      this.item.setAttribute("aria-checked", "");
    }
  }
  getMnemonic() {
    return this.mnemonic;
  }
  applyStyle() {
    const isSelected = this.element && this.element.classList.contains("focused");
    const fgColor = isSelected && this.menuStyle.selectionForegroundColor ? this.menuStyle.selectionForegroundColor : this.menuStyle.foregroundColor;
    const bgColor = isSelected && this.menuStyle.selectionBackgroundColor ? this.menuStyle.selectionBackgroundColor : void 0;
    const outline = isSelected && this.menuStyle.selectionBorderColor ? `1px solid ${this.menuStyle.selectionBorderColor}` : "";
    const outlineOffset = isSelected && this.menuStyle.selectionBorderColor ? `-1px` : "";
    if (this.item) {
      this.item.style.color = fgColor ?? "";
      this.item.style.backgroundColor = bgColor ?? "";
      this.item.style.outline = outline;
      this.item.style.outlineOffset = outlineOffset;
    }
    if (this.check) {
      this.check.style.color = fgColor ?? "";
    }
  }
};

var SubmenuMenuActionViewItem = class extends BaseMenuActionViewItem {
  constructor(action, submenuActions, parentData, submenuOptions, menuStyles) {
    super(action, action, submenuOptions, menuStyles);
    this.submenuActions = submenuActions;
    this.parentData = parentData;
    this.submenuOptions = submenuOptions;
    this.mysubmenu = null;
    this.submenuDisposables = this._register(new DisposableStore());
    this.mouseOver = false;
    this.expandDirection = submenuOptions && submenuOptions.expandDirection !== void 0 ? submenuOptions.expandDirection : { horizontal: 0 /* Right */, vertical: 1 /* Below */ };
    this.showScheduler = new RunOnceScheduler(() => {
      if (this.mouseOver) {
        this.cleanupExistingSubmenu(false);
        this.createSubmenu(false);
      }
    }, 250);
    this.hideScheduler = new RunOnceScheduler(() => {
      if (this.element && (!isAncestor(getActiveElement(), this.element) && this.parentData.submenu === this.mysubmenu)) {
        this.parentData.parent.focus(false);
        this.cleanupExistingSubmenu(true);
      }
    }, 750);
  }
  render(container3) {
    super.render(container3);
    if (!this.element) {
      return;
    }
    if (this.item) {
      this.item.classList.add("monaco-submenu-item");
      this.item.tabIndex = 0;
      this.item.setAttribute("aria-haspopup", "true");
      this.updateAriaExpanded("false");
      this.submenuIndicator = append(this.item, $("span.submenu-indicator" + ThemeIcon.asCSSSelector(Codicon.menuSubmenu)));
      this.submenuIndicator.setAttribute("aria-hidden", "true");
    }
    this._register(addDisposableListener(this.element, EventType.KEY_UP, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(17 /* RightArrow */) || event.equals(3 /* Enter */)) {
        EventHelper.stop(e, true);
        this.createSubmenu(true);
      }
    }));
    this._register(addDisposableListener(this.element, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (getActiveElement() === this.item) {
        if (event.equals(17 /* RightArrow */) || event.equals(3 /* Enter */)) {
          EventHelper.stop(e, true);
        }
      }
    }));
    this._register(addDisposableListener(this.element, EventType.MOUSE_MOVE, (e) => {
      if (e.movementX === 0 && e.movementY === 0) {
        return;
      }
      if (!this.mouseOver) {
        this.mouseOver = true;
        this.showScheduler.schedule();
      }
    }));
    this._register(addDisposableListener(this.element, EventType.MOUSE_LEAVE, (e) => {
      this.mouseOver = false;
    }));
    this._register(addDisposableListener(this.element, EventType.FOCUS_OUT, (e) => {
      if (this.element && !isAncestor(getActiveElement(), this.element)) {
        this.hideScheduler.schedule();
      }
    }));
    this._register(this.parentData.parent.onScroll(() => {
      if (this.parentData.submenu === this.mysubmenu) {
        this.parentData.parent.focus(false);
        this.cleanupExistingSubmenu(true);
      }
    }));
  }
  updateEnabled() {
  }
  open(selectFirst) {
    this.cleanupExistingSubmenu(false);
    this.createSubmenu(selectFirst);
  }
  onClick(e) {
    EventHelper.stop(e, true);
    this.cleanupExistingSubmenu(false);
    this.createSubmenu(true);
  }
  cleanupExistingSubmenu(force) {
    if (this.parentData.submenu && (force || this.parentData.submenu !== this.mysubmenu)) {
      try {
        this.parentData.submenu.dispose();
      } catch {
      }
      this.parentData.submenu = void 0;
      this.updateAriaExpanded("false");
      if (this.submenuContainer) {
        this.submenuDisposables.clear();
        this.submenuContainer = void 0;
      }
    }
  }
  calculateSubmenuMenuLayout(windowDimensions, submenu, entry, expandDirection) {
    const ret = { top: 0, left: 0 };
    ret.left = layout(windowDimensions.width, submenu.width, { position: expandDirection.horizontal === 0 /* Right */ ? 0 /* Before */ : 1 /* After */, offset: entry.left, size: entry.width }).position;
    if (ret.left >= entry.left && ret.left < entry.left + entry.width) {
      if (entry.left + 10 + submenu.width <= windowDimensions.width) {
        ret.left = entry.left + 10;
      }
      entry.top += 10;
      entry.height = 0;
    }
    ret.top = layout(windowDimensions.height, submenu.height, { position: 0 /* Before */, offset: entry.top, size: 0 }).position;
    if (ret.top + submenu.height === entry.top && ret.top + entry.height + submenu.height <= windowDimensions.height) {
      ret.top += entry.height;
    }
    return ret;
  }
  createSubmenu(selectFirstItem = true) {
    if (!this.element) {
      return;
    }
    if (!this.parentData.submenu) {
      this.updateAriaExpanded("true");
      this.submenuContainer = append(this.element, $("div.monaco-submenu"));
      this.submenuContainer.classList.add("menubar-menu-items-holder", "context-view");
      const computedStyles = getWindow(this.parentData.parent.domNode).getComputedStyle(this.parentData.parent.domNode);
      const paddingTop = parseFloat(computedStyles.paddingTop || "0") || 0;
      this.submenuContainer.style.position = "fixed";
      this.submenuContainer.style.top = "0";
      this.submenuContainer.style.left = "0";
      this.submenuContainer.style.zIndex = "1";
      this.parentData.submenu = new Menu(this.submenuContainer, this.submenuActions.length ? this.submenuActions : [new EmptySubmenuAction()], this.submenuOptions, this.menuStyle);
      const entryBox = this.element.getBoundingClientRect();
      const entryBoxUpdated = {
        top: entryBox.top - paddingTop,
        left: entryBox.left,
        height: entryBox.height + 2 * paddingTop,
        width: entryBox.width
      };
      const viewBox = this.submenuContainer.getBoundingClientRect();
      const window2 = getWindow(this.element);
      const { top: top2, left } = this.calculateSubmenuMenuLayout(new Dimension(window2.innerWidth, window2.innerHeight), Dimension.lift(viewBox), entryBoxUpdated, this.expandDirection);
      this.submenuContainer.style.left = `${left - viewBox.left}px`;
      this.submenuContainer.style.top = `${top2 - viewBox.top}px`;
      this.submenuDisposables.add(addDisposableListener(this.submenuContainer, EventType.KEY_UP, (e) => {
        const event = new StandardKeyboardEvent(e);
        if (event.equals(15 /* LeftArrow */)) {
          EventHelper.stop(e, true);
          this.parentData.parent.focus();
          this.cleanupExistingSubmenu(true);
        }
      }));
      this.submenuDisposables.add(addDisposableListener(this.submenuContainer, EventType.KEY_DOWN, (e) => {
        const event = new StandardKeyboardEvent(e);
        if (event.equals(15 /* LeftArrow */)) {
          EventHelper.stop(e, true);
        }
      }));
      this.submenuDisposables.add(this.parentData.submenu.onDidCancel(() => {
        this.parentData.parent.focus();
        this.cleanupExistingSubmenu(true);
      }));
      this.parentData.submenu.focus(selectFirstItem);
      this.mysubmenu = this.parentData.submenu;
    } else {
      this.parentData.submenu.focus(false);
    }
  }
  updateAriaExpanded(value2) {
    if (this.item) {
      this.item?.setAttribute("aria-expanded", value2);
    }
  }
  applyStyle() {
    super.applyStyle();
    const isSelected = this.element && this.element.classList.contains("focused");
    const fgColor = isSelected && this.menuStyle.selectionForegroundColor ? this.menuStyle.selectionForegroundColor : this.menuStyle.foregroundColor;
    if (this.submenuIndicator) {
      this.submenuIndicator.style.color = fgColor ?? "";
    }
  }
  dispose() {
    super.dispose();
    this.hideScheduler.dispose();
    if (this.mysubmenu) {
      this.mysubmenu.dispose();
      this.mysubmenu = null;
    }
    if (this.submenuContainer) {
      this.submenuContainer = void 0;
    }
  }
};

var MenuSeparatorActionViewItem = class extends ActionViewItem {
  constructor(context2, action, options3, menuStyles) {
    super(context2, action, options3);
    this.menuStyles = menuStyles;
  }
  render(container3) {
    super.render(container3);
    if (this.label) {
      this.label.style.borderBottomColor = this.menuStyles.separatorColor ? `${this.menuStyles.separatorColor}` : "";
    }
  }
};

function cleanMnemonic(label3) {
  const regex = MENU_MNEMONIC_REGEX;
  const matches2 = regex.exec(label3);
  if (!matches2) {
    return label3;
  }
  const mnemonicInText = !matches2[1];
  return label3.replace(regex, mnemonicInText ? "$2$3" : "").trim();
}

function formatRule(c) {
  const fontCharacter = getCodiconFontCharacters()[c.id];
  return `.codicon-${c.id}:before { content: '\\${fontCharacter.toString(16)}'; }`;
}

function getMenuWidgetCSS(style, isForShadowDom) {
  const borderColor = style.borderColor ?? "var(--vscode-menu-border)";
  const menuShadow = `var(--vscode-shadow-lg${style.shadowColor ? `, 0 0 12px ${style.shadowColor}` : ""})`;
  let result = (
    /* css */
    `
.monaco-menu {
	font-size: 13px;
	border-radius: var(--vscode-cornerRadius-large);
	border: var(--vscode-strokeThickness) solid ${borderColor};
	min-width: 160px;
}

${formatRule(Codicon.menuSelection)}
${formatRule(Codicon.menuSubmenu)}

.monaco-menu .monaco-action-bar {
	text-align: right;
	overflow: hidden;
	white-space: nowrap;
}

.monaco-menu .monaco-action-bar .actions-container {
	display: flex;
	margin: 0 auto;
	padding: 0;
	width: 100%;
	justify-content: flex-end;
}

.monaco-menu .monaco-action-bar.vertical .actions-container {
	display: inline-block;
}

.monaco-menu .monaco-action-bar.reverse .actions-container {
	flex-direction: row-reverse;
}

.monaco-menu .monaco-action-bar .action-item {
	cursor: pointer;
	display: inline-block;
	transition: transform 50ms ease;
	position: relative;  /* DO NOT REMOVE - this is the key to preventing the ghosting icon bug in Chrome 42 */
}

.monaco-menu .monaco-action-bar .action-item.disabled {
	cursor: default;
}

.monaco-menu .monaco-action-bar .action-item .icon,
.monaco-menu .monaco-action-bar .action-item .codicon {
	display: inline-block;
}

.monaco-menu .monaco-action-bar .action-item .codicon {
	display: flex;
	align-items: center;
}

.monaco-menu .monaco-action-bar .action-label {
	font-size: 11px;
	margin-right: 4px;
}

.monaco-menu .monaco-action-bar .action-item.disabled .action-label,
.monaco-menu .monaco-action-bar .action-item.disabled .action-label:hover {
	color: var(--vscode-disabledForeground);
}

/* Vertical actions */

.monaco-menu .monaco-action-bar.vertical {
	text-align: left;
}

.monaco-menu .monaco-action-bar.vertical .action-item {
	display: block;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator {
	display: block;
	border-bottom: 1px solid var(--vscode-menu-separatorBackground);
	padding-top: 1px;
	padding: 30px;
}

.monaco-menu .secondary-actions .monaco-action-bar .action-label {
	margin-left: 6px;
}

/* Action Items */
.monaco-menu .monaco-action-bar .action-item.select-container {
	overflow: hidden; /* somehow the dropdown overflows its container, we prevent it here to not push */
	flex: 1;
	max-width: 170px;
	min-width: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 10px;
}

.monaco-menu .monaco-action-bar.vertical {
	margin-left: 0;
	overflow: visible;
}

.monaco-menu .monaco-action-bar.vertical .actions-container {
	display: block;
}

.monaco-menu .monaco-action-bar.vertical .action-item {
	padding: 0;
	transform: none;
	display: flex;
}

.monaco-menu .monaco-action-bar.vertical .action-item.active {
	transform: none;
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item {
	flex: 1 1 auto;
	display: flex;
	height: 24px;
	align-items: center;
	position: relative;
	margin: 0 4px;
	border-radius: var(--vscode-cornerRadius-medium);
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item:hover .keybinding,
.monaco-menu .monaco-action-bar.vertical .action-menu-item:focus .keybinding {
	opacity: unset;
}

.monaco-menu .monaco-action-bar.vertical .action-label {
	flex: 1 1 auto;
	text-decoration: none;
	padding: 0 1em;
	background: none;
	font-size: 12px;
	line-height: 1;
}

.monaco-menu .monaco-action-bar.vertical .keybinding,
.monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	display: inline-block;
	flex: 2 1 auto;
	padding: 0 1em;
	text-align: right;
	font-size: 12px;
	line-height: 1;
	opacity: 0.7;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	height: 100%;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator.codicon {
	font-size: 16px !important;
	display: flex;
	align-items: center;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator.codicon::before {
	margin-left: auto;
	margin-right: -20px;
}

.monaco-menu .monaco-action-bar.vertical .action-item.disabled .keybinding,
.monaco-menu .monaco-action-bar.vertical .action-item.disabled .submenu-indicator {
	opacity: 0.4;
}

.monaco-menu .monaco-action-bar.vertical .action-label:not(.separator) {
	display: inline-block;
	box-sizing: border-box;
	margin: 0;
}

.monaco-menu .monaco-action-bar.vertical .action-item {
	position: static;
	overflow: visible;
}

.monaco-menu .monaco-action-bar.vertical .action-item .monaco-submenu {
	position: absolute;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator {
	width: 100%;
	height: 0px !important;
	opacity: 1;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator.text {
	padding: 0.7em 1em 0.1em 1em;
	font-weight: bold;
	opacity: 1;
}

.monaco-menu .monaco-action-bar.vertical .action-label:hover {
	color: inherit;
}

.monaco-menu .monaco-action-bar.vertical .menu-item-check {
	position: absolute;
	visibility: hidden;
	width: 1em;
	height: 100%;
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item.checked .menu-item-check {
	visibility: visible;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* Context Menu */

.context-view.monaco-menu-container {
	${CONTEXT_VIEW_MENU_MOTION_SHADOW_VARIABLE}: ${menuShadow};
	outline: 0;
	border: none;
	animation: fadeIn 0.083s linear;
	-webkit-app-region: no-drag;
	box-shadow: var(${CONTEXT_VIEW_MENU_MOTION_SHADOW_VARIABLE});
	border-radius: var(--vscode-cornerRadius-large);
	overflow: hidden;
}

.context-view.monaco-menu-container :focus,
.context-view.monaco-menu-container .monaco-action-bar.vertical:focus,
.context-view.monaco-menu-container .monaco-action-bar.vertical :focus {
	outline: 0;
}

.hc-black .context-view.monaco-menu-container,
.hc-light .context-view.monaco-menu-container,
:host-context(.hc-black) .context-view.monaco-menu-container,
:host-context(.hc-light) .context-view.monaco-menu-container {
	${CONTEXT_VIEW_MENU_MOTION_SHADOW_VARIABLE}: none;
	box-shadow: none;
}

.hc-black .monaco-menu .monaco-action-bar.vertical .action-item.focused,
.hc-light .monaco-menu .monaco-action-bar.vertical .action-item.focused,
:host-context(.hc-black) .monaco-menu .monaco-action-bar.vertical .action-item.focused,
:host-context(.hc-light) .monaco-menu .monaco-action-bar.vertical .action-item.focused {
	background: none;
}

/* Show the menu item selection border only for keyboard navigation. Pointer-driven focus typically does not set :focus-visible, so suppress the border in that case. */
.monaco-menu .monaco-action-bar.vertical .action-menu-item:focus:not(:focus-visible) {
	outline: none !important;
	outline-offset: 0 !important;
}

/* High contrast themes always show the selection border to indicate the focused item, regardless of input modality. The duplicated .monaco-menu raises specificity above the keyboard-only suppression rule above so this wins independent of declaration order. */
.hc-black .monaco-menu.monaco-menu .monaco-action-bar.vertical .action-item.focused > .action-menu-item,
.hc-light .monaco-menu.monaco-menu .monaco-action-bar.vertical .action-item.focused > .action-menu-item {
	outline: 1px solid var(--vscode-menu-selectionBorder) !important;
	outline-offset: -1px !important;
}

/* Keep :host-context separate because WebKit otherwise rejects the valid selectors above. */
:host-context(.hc-black) .monaco-menu.monaco-menu .monaco-action-bar.vertical .action-item.focused > .action-menu-item,
:host-context(.hc-light) .monaco-menu.monaco-menu .monaco-action-bar.vertical .action-item.focused > .action-menu-item {
	outline: 1px solid var(--vscode-menu-selectionBorder) !important;
	outline-offset: -1px !important;
}

/* Vertical Action Bar Styles */

.monaco-menu .monaco-action-bar.vertical {
	padding: 4px 0;
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item {
	height: 24px;
}

.monaco-menu .monaco-action-bar.vertical .action-label:not(.separator),
.monaco-menu .monaco-action-bar.vertical .keybinding {
	font-size: inherit;
	padding: 0 2em;
	max-height: 100%;
}

.monaco-menu .monaco-action-bar.vertical .menu-item-check {
	font-size: inherit;
	width: 2em;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator {
	font-size: inherit;
	margin: 5px 0 !important;
	padding: 0;
	border-radius: 0;
}

.linux .monaco-menu .monaco-action-bar.vertical .action-label.separator,
:host-context(.linux) .monaco-menu .monaco-action-bar.vertical .action-label.separator {
	margin-left: 0;
	margin-right: 0;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	font-size: 60%;
	padding: 0 1.8em;
}

.linux .monaco-menu .monaco-action-bar.vertical .submenu-indicator,
:host-context(.linux) .monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	height: 100%;
	mask-size: 10px 10px;
	-webkit-mask-size: 10px 10px;
}

.monaco-menu .action-item {
	cursor: default;
}`
  );
  if (isForShadowDom) {
    result += `
			/* Arrows */
			.monaco-scrollable-element > .scrollbar > .scra {
				cursor: pointer;
				font-size: 11px !important;
			}

			.monaco-scrollable-element > .visible {
				opacity: 1;

				/* Background rule added for IE9 - to allow clicks on dom node */
				background:rgba(0,0,0,0);

				transition: opacity 100ms linear;
			}
			.monaco-scrollable-element > .invisible {
				opacity: 0;
				pointer-events: none;
			}
			.monaco-scrollable-element > .invisible.fade {
				transition: opacity 800ms linear;
			}

			/* Scrollable Content Inset Shadow */
			.monaco-scrollable-element > .shadow {
				position: absolute;
				display: none;
			}
			.monaco-scrollable-element > .shadow.top {
				display: block;
				top: 0;
				left: 3px;
				height: 3px;
				width: 100%;
			}
			.monaco-scrollable-element > .shadow.left {
				display: block;
				top: 3px;
				left: 0;
				height: 100%;
				width: 3px;
			}
			.monaco-scrollable-element > .shadow.top-left-corner {
				display: block;
				top: 0;
				left: 0;
				height: 3px;
				width: 3px;
			}
			/* Fix for https://github.com/microsoft/vscode/issues/103170 */
			.monaco-menu .action-item .monaco-submenu {
				z-index: 1;
			}
		`;
    const scrollbarShadowColor = style.scrollbarShadow;
    if (scrollbarShadowColor) {
      result += `
				.monaco-scrollable-element > .shadow.top {
					box-shadow: ${scrollbarShadowColor} 0 6px 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.left {
					box-shadow: ${scrollbarShadowColor} 6px 0 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.top.left {
					box-shadow: ${scrollbarShadowColor} 6px 6px 6px -6px inset;
				}
			`;
    }
    const scrollbarSliderBackgroundColor = style.scrollbarSliderBackground;
    if (scrollbarSliderBackgroundColor) {
      result += `
				.monaco-scrollable-element > .scrollbar > .slider {
					background: ${scrollbarSliderBackgroundColor};
				}
			`;
    }
    const scrollbarSliderHoverBackgroundColor = style.scrollbarSliderHoverBackground;
    if (scrollbarSliderHoverBackgroundColor) {
      result += `
				.monaco-scrollable-element > .scrollbar > .slider:hover {
					background: ${scrollbarSliderHoverBackgroundColor};
				}
			`;
    }
    const scrollbarSliderActiveBackgroundColor = style.scrollbarSliderActiveBackground;
    if (scrollbarSliderActiveBackgroundColor) {
      result += `
				.monaco-scrollable-element > .scrollbar > .slider.active {
					background: ${scrollbarSliderActiveBackgroundColor};
				}
			`;
    }
  }
  return result;
}
export { cleanMnemonic, formatRule, getMenuWidgetCSS, MENU_MNEMONIC_REGEX, MENU_ESCAPED_MNEMONIC_REGEX, unthemedMenuStyles, Menu, BaseMenuActionViewItem, SubmenuMenuActionViewItem, MenuSeparatorActionViewItem };
