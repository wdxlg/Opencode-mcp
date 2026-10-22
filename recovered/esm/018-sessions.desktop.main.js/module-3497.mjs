// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/sessionStatusIcon.ts
import { $, clearNode, getWindow, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { isActiveSessionStatus } from "./module-1767.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { createPixelSpinner } from "./module-1987.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { ISessionsListModelService } from "./module-3496.mjs";


// src/vs/sessions/browser/sessionStatusIcon.ts
var $109 = $;

var ICON_SWAP_FADE_MS = 180;

var ICON_FADING_OUT_ATTR = "iconFadingOut";

var PIXEL_SPINNER_GRID_KEY = "__pixel_spinner_grid__";

var PIXEL_SPINNER_RING_KEY = "__pixel_spinner_ring__";

var SessionStatusIcon = class extends Disposable {
  constructor(_container, _accessibilityService, _sessionsListModelService) {
    super();
    this._container = _container;
    this._accessibilityService = _accessibilityService;
    this._sessionsListModelService = _sessionsListModelService;
    /** Owns the removal timers for outgoing icons mid cross-fade. */
    this._swapStore = this._register(new DisposableStore());
    this._iconDisposables = this._register(new DisposableMap());
    if (!this._container.style.position) {
      this._container.style.position = "relative";
    }
    this._register(this._accessibilityService.onDidChangeReducedMotion(() => {
      if (this._lastInputs) {
        this._render(this._lastInputs);
      }
    }));
  }
  /**
   * Updates the rendered status. Cross-fades when the glyph/variant changes
   * within one session; a different session resource snaps to the new icon.
   */
  setStatus(status2, isRead, isArchived, completedStateIcon, sessionResource) {
    const sessionResourceKey = sessionResource?.toString();
    if (sessionResourceKey !== void 0 && sessionResourceKey !== this._currentSessionResource) {
      this.reset();
      this._currentSessionResource = sessionResourceKey;
    }
    const inputs = { status: status2, isRead, isArchived, completedStateIcon };
    this._lastInputs = inputs;
    this._render(inputs);
  }
  /**
   * Clears the cached glyph so the next {@link setStatus} renders without a
   * cross-fade. Use when the host is rebound to a different session.
   */
  reset() {
    this._currentCacheKey = void 0;
    this._currentSessionResource = void 0;
    this._lastInputs = void 0;
    this._swapStore.clear();
    this._iconDisposables.clearAndDisposeAll();
    clearNode(this._container);
  }
  _render(inputs) {
    const { status: status2, isRead, isArchived, completedStateIcon } = inputs;
    const isSpinner = isActiveSessionStatus(status2) && !this._accessibilityService.isMotionReduced();
    let cacheKey2;
    let color2;
    let createIcon;
    if (isSpinner) {
      const isNeedsInput = status2 === 2 /* NeedsInput */;
      const variant = isNeedsInput ? "ring" : "grid";
      cacheKey2 = isNeedsInput ? PIXEL_SPINNER_RING_KEY : PIXEL_SPINNER_GRID_KEY;
      color2 = isNeedsInput ? asCssVariable("list.warningForeground") : asCssVariable("textLink.foreground");
      createIcon = () => {
        const spinner = createPixelSpinner(void 0, { variant });
        return { element: spinner.element, disposable: spinner };
      };
    } else {
      const icon2 = this._sessionsListModelService.getStatusIcon(status2, isRead, isArchived, completedStateIcon);
      cacheKey2 = ThemeIcon.asCSSSelector(icon2);
      color2 = icon2.color ? asCssVariable(icon2.color.id) : "";
      createIcon = () => ({ element: $109(`span${cacheKey2}`) });
    }
    this._container.classList.toggle("session-icon-pulse", status2 === 2 /* NeedsInput */);
    if (this._currentCacheKey === cacheKey2) {
      this._recolorActiveIcon(color2);
      return;
    }
    const animate2 = this._currentCacheKey !== void 0;
    this._currentCacheKey = cacheKey2;
    const { element: iconElement, disposable: iconDisposable } = createIcon();
    iconElement.style.color = color2;
    this._swapIcon(iconElement, animate2, iconDisposable);
  }
  /** Updates the color of the current (non fading-out) icon without rebuilding it. */
  _recolorActiveIcon(color2) {
    for (const child of Array.from(this._container.children)) {
      if (child.dataset[ICON_FADING_OUT_ATTR] !== "1") {
        child.style.color = color2;
        break;
      }
    }
  }
  /**
   * Swaps the container contents to `newChild` with a brief opacity cross-fade.
   * Outgoing children are taken out of normal flow (`position: absolute`) so the
   * new child can settle into its slot during the fade. Safe to call repeatedly:
   * each outgoing element is marked so a follow-up swap never re-processes it.
   */
  _swapIcon(newChild, animate2, disposable) {
    if (!animate2) {
      this._iconDisposables.clearAndDisposeAll();
      clearNode(this._container);
      this._container.appendChild(newChild);
      if (disposable) {
        this._iconDisposables.set(newChild, disposable);
      }
      return;
    }
    for (const existing of Array.from(this._container.children)) {
      if (existing.dataset[ICON_FADING_OUT_ATTR] === "1") {
        continue;
      }
      existing.dataset[ICON_FADING_OUT_ATTR] = "1";
      existing.style.position = "absolute";
      existing.style.top = "0";
      existing.style.left = "0";
      existing.style.transition = `opacity ${ICON_SWAP_FADE_MS}ms ease`;
      scheduleAtNextAnimationFrame(getWindow(existing), () => {
        existing.style.opacity = "0";
      });
      disposableTimeout(() => {
        existing.remove();
        this._iconDisposables.deleteAndDispose(existing);
      }, ICON_SWAP_FADE_MS + 40, this._swapStore);
    }
    newChild.style.opacity = "0";
    newChild.style.transition = `opacity ${ICON_SWAP_FADE_MS}ms ease`;
    this._container.appendChild(newChild);
    if (disposable) {
      this._iconDisposables.set(newChild, disposable);
    }
    scheduleAtNextAnimationFrame(getWindow(newChild), () => {
      newChild.style.opacity = "1";
    });
  }
};

SessionStatusIcon = __decorateClass([
  __decorateParam(1, IAccessibilityService),
  __decorateParam(2, ISessionsListModelService)
], SessionStatusIcon);
export { $109, ICON_SWAP_FADE_MS, ICON_FADING_OUT_ATTR, PIXEL_SPINNER_GRID_KEY, PIXEL_SPINNER_RING_KEY, SessionStatusIcon };
