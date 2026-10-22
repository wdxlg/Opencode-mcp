// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessionInputBanners/browser/sessionInputBannerWidget.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode, getActiveElement } from "./module-0075.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Button, ButtonWithDropdown } from "./module-0546.mjs";
import { toAction } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { Codicon } from "./module-0085.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { chartsOrange } from "./module-0231.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IContextMenuService } from "./module-0488.mjs";


// src/vs/sessions/contrib/sessionInputBanners/browser/sessionInputBannerWidget.ts
var SHOW_WORKING_DELAY_MS = 1e3;

var SessionInputBannerWidget = class extends Disposable {
  constructor(banner, hoverService, contextMenuService) {
    super();
    this.hoverService = hoverService;
    this.contextMenuService = contextMenuService;
    this._buttons = [];
    this._showWorkingAnimation = this._register(new MutableDisposable());
    this._content = this._register(new MutableDisposable());
    this._runningPrimaryAction = false;
    this._disposed = false;
    this._working = false;
    this._banners = [];
    this._activeIndex = 0;
    this.domNode = $(".session-input-banner");
    this.domNode.setAttribute("role", "status");
    this.setBanners(Array.isArray(banner) ? banner : [banner]);
  }
  setBanners(banners) {
    const focus = this._captureFocus();
    const activeId = this._banners[this._activeIndex]?.id;
    this._banners = banners;
    const nextActiveIndex = activeId ? banners.findIndex((banner) => banner.id === activeId) : -1;
    this._activeIndex = nextActiveIndex >= 0 ? nextActiveIndex : Math.min(this._activeIndex, Math.max(0, banners.length - 1));
    this._render(focus);
  }
  _render(focus = this._captureFocus()) {
    const store = this._content.value = new DisposableStore();
    this._buttons.length = 0;
    this._previousButton = void 0;
    this._nextButton = void 0;
    this._dismissButton = void 0;
    clearNode(this.domNode);
    const banner = this._banners[this._activeIndex];
    this.domNode.classList.toggle("empty", !banner);
    if (!banner) {
      this.domNode.removeAttribute("aria-label");
      this._restoreFocus(focus);
      return;
    }
    this.domNode.classList.toggle("accent-orange", banner.accent);
    this.domNode.setAttribute("aria-label", banner.ariaLabel);
    if (this._banners.length > 1) {
      this._renderNavigation(store);
    }
    if (banner.reference) {
      const reference = append(this.domNode, $("span.session-input-banner-reference"));
      reference.textContent = banner.reference.label;
      store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), reference, banner.reference.hover));
    }
    const icon2 = append(this.domNode, $(".session-input-banner-icon"));
    icon2.setAttribute("aria-hidden", "true");
    icon2.appendChild(renderIcon(banner.icon));
    const textEl = append(this.domNode, $("span.session-input-banner-text"));
    textEl.textContent = banner.text;
    store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), textEl, banner.text));
    const actions = append(this.domNode, $(".session-input-banner-actions"));
    const bannerIdentity = banner.id ?? banner;
    for (const [actionIndex, action] of banner.actions.entries()) {
      const actionIdentity = action.id ?? action.label;
      const options3 = this._buttonOptions(action, banner);
      const button = action.dropdownActions?.length ? store.add(new ButtonWithDropdown(actions, {
        ...options3,
        actions: action.dropdownActions.map((dropdownAction, dropdownIndex) => toAction({
          id: dropdownAction.id ?? `session.inputBanner.${actionIndex}.${dropdownIndex}`,
          label: dropdownAction.label,
          run: () => this._runAction(bannerIdentity, dropdownAction.id ?? dropdownAction.label)
        })),
        addPrimaryActionToDropdown: false,
        contextMenuProvider: this.contextMenuService
      })) : store.add(new Button(actions, options3));
      button.element.classList.add("session-input-banner-action");
      button.label = action.label;
      button.setTitle(action.label);
      button.setAriaLabel(`${banner.ariaLabel} ${action.label}`);
      if (button instanceof ButtonWithDropdown) {
        button.dropdownButton.setAriaLabel(localize(5297, null, action.label));
      }
      this._buttons.push({ button, primary: !!action.primary });
      store.add(button.onDidClick(() => {
        void this._runAction(bannerIdentity, actionIdentity).catch(onUnexpectedError);
      }));
    }
    if (banner.dismiss && banner.dismissTooltip) {
      const dismiss = append(this.domNode, $("button.session-input-banner-dismiss"));
      this._dismissButton = dismiss;
      dismiss.type = "button";
      dismiss.setAttribute("aria-label", banner.dismissTooltip);
      dismiss.appendChild(renderIcon(Codicon.close));
      store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), dismiss, banner.dismissTooltip));
      store.add(addDisposableListener(dismiss, EventType.CLICK, (e4) => {
        EventHelper.stop(e4, true);
        banner.dismiss?.();
      }));
    }
    this._setPrimaryButtonsEnabled(!this._working && !this._runningPrimaryAction);
    this._restoreFocus(focus);
  }
  _captureFocus() {
    const activeElement = getActiveElement();
    const focusFallback = this._banners[this._activeIndex]?.focusAfterDismiss;
    if (this._previousButton?.element === activeElement) {
      return { kind: "previous", focusFallback };
    }
    if (this._nextButton?.element === activeElement) {
      return { kind: "next", focusFallback };
    }
    if (this._dismissButton === activeElement) {
      return { kind: "dismiss", focusAfterDismiss: this._banners[this._activeIndex]?.focusAfterDismiss };
    }
    for (let index2 = 0; index2 < this._buttons.length; index2++) {
      const button = this._buttons[index2].button;
      if (button instanceof ButtonWithDropdown) {
        if (button.primaryButton.element === activeElement) {
          return { kind: "action", index: index2, dropdown: false, focusFallback };
        }
        if (button.dropdownButton.element === activeElement) {
          return { kind: "action", index: index2, dropdown: true, focusFallback };
        }
      } else if (button.element === activeElement) {
        return { kind: "action", index: index2, dropdown: false, focusFallback };
      }
    }
    return void 0;
  }
  _restoreFocus(focus) {
    if (!focus) {
      return;
    }
    switch (focus.kind) {
      case "previous":
        if (this._previousButton ?? this._buttons[0]?.button) {
          (this._previousButton ?? this._buttons[0].button).focus();
        } else {
          focus.focusFallback?.();
        }
        break;
      case "next":
        if (this._nextButton ?? this._buttons[0]?.button) {
          (this._nextButton ?? this._buttons[0].button).focus();
        } else {
          focus.focusFallback?.();
        }
        break;
      case "dismiss":
        if (this._dismissButton) {
          this._dismissButton.focus();
        } else {
          focus.focusAfterDismiss?.();
        }
        break;
      case "action": {
        const button = this._buttons[focus.index]?.button;
        if (button instanceof ButtonWithDropdown && focus.dropdown) {
          button.dropdownButton.focus();
        } else if (button) {
          button?.focus();
        } else {
          focus.focusFallback?.();
        }
        break;
      }
    }
  }
  _renderNavigation(store) {
    const navigation = append(this.domNode, $(".session-input-banner-navigation"));
    const previous = store.add(new Button(navigation, {
      ...this._navigationButtonOptions(localize(5300, null))
    }));
    previous.element.classList.add("session-input-banner-navigation-button", "previous");
    previous.icon = Codicon.chevronLeft;
    this._previousButton = previous;
    store.add(previous.onDidClick(() => this._move(-1, "previous")));
    const position2 = append(navigation, $("span.session-input-banner-position"));
    position2.textContent = localize(5299, null, this._activeIndex + 1, this._banners.length);
    const next = store.add(new Button(navigation, {
      ...this._navigationButtonOptions(localize(5298, null))
    }));
    next.element.classList.add("session-input-banner-navigation-button", "next");
    next.icon = Codicon.chevronRight;
    this._nextButton = next;
    store.add(next.onDidClick(() => this._move(1, "next")));
  }
  _navigationButtonOptions(ariaLabel) {
    return {
      ...defaultButtonStyles,
      ariaLabel,
      supportIcons: true,
      buttonBackground: void 0,
      buttonHoverBackground: void 0,
      buttonForeground: void 0,
      buttonBorder: void 0
    };
  }
  _move(delta2, focusClass) {
    this._activeIndex = (this._activeIndex + delta2 + this._banners.length) % this._banners.length;
    this._render();
    (focusClass === "previous" ? this._previousButton : this._nextButton)?.focus();
  }
  _buttonOptions(action, banner) {
    return {
      ...defaultButtonStyles,
      ...action.primary && banner.accent ? {
        buttonBackground: asCssVariable(chartsOrange),
        buttonHoverBackground: `color-mix(in srgb, ${asCssVariable(chartsOrange)} 88%, black)`,
        buttonBorder: asCssVariable(chartsOrange)
      } : {},
      ...action.primary ? {} : {
        buttonBackground: void 0,
        buttonHoverBackground: void 0,
        buttonForeground: void 0,
        buttonSecondaryBackground: void 0,
        buttonSecondaryHoverBackground: void 0,
        buttonSecondaryForeground: void 0,
        buttonSecondaryBorder: void 0
      },
      secondary: !action.primary
    };
  }
  async _runAction(bannerIdentity, actionIdentity) {
    let action = this._findAction(bannerIdentity, actionIdentity);
    if (!action) {
      return;
    }
    if (!action.primary) {
      await action.run();
      return;
    }
    if (this._runningPrimaryAction) {
      return;
    }
    this._runningPrimaryAction = true;
    this._setPrimaryButtonsEnabled(false);
    try {
      if (action.waitUntilReady && !await this._waitUntilReady(action.waitUntilReady)) {
        return;
      }
      action = this._findAction(bannerIdentity, actionIdentity);
      if (this._disposed || !action) {
        return;
      }
      await action.run();
    } finally {
      this._setPrimaryButtonsEnabled(true);
      this._runningPrimaryAction = false;
    }
  }
  _findAction(bannerIdentity, actionIdentity) {
    const banner = this._banners[this._activeIndex];
    if ((banner?.id ?? banner) !== bannerIdentity) {
      return void 0;
    }
    for (const action of banner.actions) {
      if ((action.id ?? action.label) === actionIdentity) {
        return action;
      }
      const dropdownAction = action.dropdownActions?.find((candidate) => (candidate.id ?? candidate.label) === actionIdentity);
      if (dropdownAction) {
        return dropdownAction;
      }
    }
    return void 0;
  }
  async _waitUntilReady(waitUntilReady) {
    this.domNode.setAttribute("aria-busy", "true");
    this._showWorkingAnimation.value = disposableTimeout(() => this.domNode.classList.add("working"), SHOW_WORKING_DELAY_MS);
    try {
      return await waitUntilReady();
    } finally {
      this._showWorkingAnimation.clear();
      this.domNode.classList.remove("working");
      this.domNode.setAttribute("aria-busy", "false");
    }
  }
  setWorking(working) {
    this._working = working;
    this.domNode.classList.toggle("working", working);
    this.domNode.setAttribute("aria-busy", String(working));
    this._setPrimaryButtonsEnabled(!working);
  }
  _setPrimaryButtonsEnabled(enabled) {
    if (this._disposed) {
      return;
    }
    for (const { button, primary } of this._buttons) {
      if (primary) {
        button.enabled = enabled;
      }
    }
  }
  dispose() {
    this._disposed = true;
    super.dispose();
  }
};

SessionInputBannerWidget = __decorateClass([
  __decorateParam(1, IHoverService),
  __decorateParam(2, IContextMenuService)
], SessionInputBannerWidget);
export { SHOW_WORKING_DELAY_MS, SessionInputBannerWidget };
