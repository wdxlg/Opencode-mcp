// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/onboarding/browser/spotlight/spotlightOverlay.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { $, EventType, addDisposableListener, append, getActiveElement, getWindow, isHTMLElement, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { Emitter } from "./module-0017.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { localize } from "./module-0001.mjs";
import { layout2d } from "./module-0470.mjs";
import { isMarkdownString } from "./module-0462.mjs";
import { renderMarkdown } from "./module-0468.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";


// src/vs/workbench/contrib/onboarding/browser/spotlight/spotlightOverlay.ts
var DEFAULT_HOLE_PADDING = 6;

var POINTER_SIZE = 10;

var POINTER_GAP = POINTER_SIZE;

var POINTER_EDGE_MARGIN = 16;

var SpotlightOverlay = class extends Disposable {
  constructor(_container, _resizeObserverCtor = getWindow(_container).ResizeObserver) {
    super();
    this._container = _container;
    this._resizeObserverCtor = _resizeObserverCtor;
    this._descriptionRenderStore = this._register(new DisposableStore());
    /** Listeners scoped to the currently shown step (re-layout sources). */
    this._stepListeners = this._register(new DisposableStore());
    this._onDidClickNext = this._register(new Emitter());
    this.onDidClickNext = this._onDidClickNext.event;
    this._onDidClickPrevious = this._register(new Emitter());
    this.onDidClickPrevious = this._onDidClickPrevious.event;
    this._onDidSkip = this._register(new Emitter());
    this.onDidSkip = this._onDidSkip.event;
    this._options = {};
    this._hasShown = false;
    this._root = append(this._container, $(".spotlight-overlay"));
    this._root.style.display = "none";
    this._blockers = [
      append(this._root, $(".spotlight-blocker")),
      append(this._root, $(".spotlight-blocker")),
      append(this._root, $(".spotlight-blocker")),
      append(this._root, $(".spotlight-blocker"))
    ];
    this._hole = append(this._root, $(".spotlight-hole"));
    this._hole.setAttribute("aria-hidden", "true");
    this._pointer = append(this._root, $(".spotlight-callout-pointer"));
    this._pointer.setAttribute("aria-hidden", "true");
    this._callout = append(this._root, $(".spotlight-callout"));
    this._callout.setAttribute("role", "dialog");
    this._callout.setAttribute("aria-modal", "true");
    this._callout.tabIndex = -1;
    const header2 = append(this._callout, $(".spotlight-callout-header"));
    this._title = append(header2, $("h2.spotlight-callout-title"));
    this._title.id = "spotlight-callout-title";
    this._callout.setAttribute("aria-labelledby", this._title.id);
    this._description = append(this._callout, $(".spotlight-callout-description"));
    this._description.id = "spotlight-callout-description";
    this._callout.setAttribute("aria-describedby", this._description.id);
    const footer = append(this._callout, $(".spotlight-callout-footer"));
    this._counter = append(footer, $(".spotlight-callout-counter"));
    const actions = append(footer, $(".spotlight-callout-actions"));
    this._skipButton = this._register(new Button(actions, { ...defaultButtonStyles, secondary: true }));
    this._skipButton.label = localize(17926, null);
    this._skipButton.setTitle(localize(17927, null));
    this._register(this._skipButton.onDidClick(() => this._onDidSkip.fire("skipButton" /* SkipButton */)));
    this._backButton = this._register(new Button(actions, { ...defaultButtonStyles, secondary: true }));
    this._backButton.label = localize(17923, null);
    this._register(this._backButton.onDidClick(() => this._onDidClickPrevious.fire()));
    this._nextButton = this._register(new Button(actions, { ...defaultButtonStyles }));
    this._nextButton.label = localize(17928, null);
    this._register(this._nextButton.onDidClick(() => this._onDidClickNext.fire("button")));
    for (const button of [this._skipButton, this._backButton, this._nextButton]) {
      this._register(button.onDidEscape(() => this._onDidSkip.fire("escapeKey" /* EscapeKey */)));
    }
    this._register(addDisposableListener(this._callout, EventType.KEY_DOWN, (e4) => this._onKeyDown(e4)));
    this._register({ dispose: () => this._restoreFocus() });
  }
  /** Show `content` spotlighting `target`. */
  show(target, content, options3 = {}) {
    if (!this._hasShown) {
      this._hasShown = true;
      this._previousFocus = isHTMLElement(getActiveElement()) ? getActiveElement() : void 0;
    }
    this._target = target;
    this._options = options3;
    this._renderContent(content);
    const externalUiParticipates = !!options3.targetOverlayVisible || !!options3.allowTargetInteraction || !!options3.advanceOnTargetClick || !!options3.hideNext;
    this._root.classList.toggle("target-overlay-visible", externalUiParticipates);
    this._callout.setAttribute("aria-modal", externalUiParticipates ? "false" : "true");
    this._root.style.display = "";
    this._stepListeners.clear();
    const targetWindow = getWindow(this._container);
    const observer = new this._resizeObserverCtor(() => this.scheduleLayout());
    observer.observe(target);
    observer.observe(this._container);
    this._stepListeners.add({ dispose: () => observer.disconnect() });
    this._stepListeners.add(addDisposableListener(targetWindow, EventType.RESIZE, () => this.scheduleLayout()));
    this._stepListeners.add(addDisposableListener(targetWindow, EventType.SCROLL, () => this.scheduleLayout(), true));
    this._stepListeners.add(toDisposable(() => {
      this._scheduledLayout?.dispose();
      this._scheduledLayout = void 0;
    }));
    const advanceOnTargetClick = !!options3.advanceOnTargetClick;
    const hideNext = advanceOnTargetClick || !!options3.hideNext;
    this._nextButton.element.style.display = hideNext ? "none" : "";
    if (advanceOnTargetClick) {
      this._stepListeners.add(addDisposableListener(target, EventType.CLICK, () => this._onDidClickNext.fire("target")));
    }
    if (options3.allowTargetInteraction || advanceOnTargetClick || options3.hideNext) {
      this._stepListeners.add(addDisposableListener(target, EventType.KEY_DOWN, (e4) => this._onKeyDown(e4)));
    }
    this.layout();
    (hideNext ? target : this._nextButton.element).focus();
  }
  /** Hide the current step while another target is being resolved. */
  hide() {
    this._stepListeners.clear();
    this._root.style.display = "none";
    this._root.classList.remove("target-overlay-visible");
    this._target = void 0;
    this._options = {};
  }
  /** Recompute the hole and callout positions for the current target. */
  layout() {
    const target = this._target;
    if (!target || this._root.style.display === "none") {
      return;
    }
    const targetWindow = getWindow(this._container);
    const viewportWidth = targetWindow.document.documentElement.clientWidth;
    const viewportHeight = targetWindow.document.documentElement.clientHeight;
    const rect = target.getBoundingClientRect();
    const padding = this._options.padding ?? DEFAULT_HOLE_PADDING;
    const holeLeft = Math.max(0, rect.left - padding);
    const holeTop = Math.max(0, rect.top - padding);
    const holeWidth = Math.min(viewportWidth - holeLeft, rect.width + padding * 2);
    const holeHeight = Math.min(viewportHeight - holeTop, rect.height + padding * 2);
    this._hole.style.left = `${holeLeft}px`;
    this._hole.style.top = `${holeTop}px`;
    this._hole.style.width = `${holeWidth}px`;
    this._hole.style.height = `${holeHeight}px`;
    if (this._options.allowTargetInteraction || this._options.advanceOnTargetClick) {
      const right = holeLeft + holeWidth;
      const bottom = holeTop + holeHeight;
      this._layoutBlocker(this._blockers[0], 0, 0, viewportWidth, holeTop);
      this._layoutBlocker(this._blockers[1], right, holeTop, viewportWidth - right, holeHeight);
      this._layoutBlocker(this._blockers[2], 0, bottom, viewportWidth, viewportHeight - bottom);
      this._layoutBlocker(this._blockers[3], 0, holeTop, holeLeft, holeHeight);
    } else {
      this._layoutBlocker(this._blockers[0], 0, 0, viewportWidth, viewportHeight);
      for (let i2 = 1; i2 < this._blockers.length; i2++) {
        this._blockers[i2].style.display = "none";
      }
    }
    this._layoutCallout({ top: holeTop, left: holeLeft, width: holeWidth, height: holeHeight }, viewportWidth, viewportHeight);
  }
  _layoutBlocker(blocker, left, top2, width2, height) {
    blocker.style.display = "";
    blocker.style.left = `${left}px`;
    blocker.style.top = `${top2}px`;
    blocker.style.right = "auto";
    blocker.style.bottom = "auto";
    blocker.style.width = `${Math.max(0, width2)}px`;
    blocker.style.height = `${Math.max(0, height)}px`;
  }
  _layoutCallout(anchor, viewportWidth, viewportHeight) {
    const viewport = { top: 0, left: 0, width: viewportWidth, height: viewportHeight };
    const view = { width: this._callout.offsetWidth, height: this._callout.offsetHeight };
    const { anchorAxisAlignment, anchorPosition, anchorAlignment } = this._resolvePlacement(this._options.placement ?? "auto");
    const result = layout2d(viewport, view, anchor, { anchorAxisAlignment, anchorPosition, anchorAlignment });
    const left = anchorAxisAlignment === 0 /* VERTICAL */ ? this._centerCallout(anchor, view.width, viewportWidth) : result.left;
    const callout = { top: result.top, left, width: view.width, height: view.height };
    const pointerSide = this._getPointerSide(anchor, callout, anchorAxisAlignment);
    const offsetCallout = this._offsetCalloutForPointer(callout, pointerSide, viewportWidth, viewportHeight);
    this._callout.style.top = `${offsetCallout.top}px`;
    this._callout.style.left = `${offsetCallout.left}px`;
    this._layoutPointer(anchor, offsetCallout, pointerSide);
  }
  _centerCallout(anchor, calloutWidth, viewportWidth) {
    const centered = anchor.left + anchor.width / 2 - calloutWidth / 2;
    return Math.max(0, Math.min(centered, viewportWidth - calloutWidth));
  }
  _getPointerSide(anchor, callout, anchorAxisAlignment) {
    const targetCenterX = anchor.left + anchor.width / 2;
    const targetCenterY = anchor.top + anchor.height / 2;
    const calloutCenterX = callout.left + callout.width / 2;
    const calloutCenterY = callout.top + callout.height / 2;
    return anchorAxisAlignment === 0 /* VERTICAL */ ? calloutCenterY < targetCenterY ? "bottom" : "top" : calloutCenterX < targetCenterX ? "right" : "left";
  }
  _offsetCalloutForPointer(callout, side, viewportWidth, viewportHeight) {
    switch (side) {
      case "bottom":
        return { ...callout, top: Math.max(0, callout.top - POINTER_GAP) };
      case "top":
        return { ...callout, top: Math.min(viewportHeight - callout.height, callout.top + POINTER_GAP) };
      case "right":
        return { ...callout, left: Math.max(0, callout.left - POINTER_GAP) };
      case "left":
        return { ...callout, left: Math.min(viewportWidth - callout.width, callout.left + POINTER_GAP) };
    }
  }
  _layoutPointer(anchor, callout, side) {
    const targetCenterX = anchor.left + anchor.width / 2;
    const targetCenterY = anchor.top + anchor.height / 2;
    const pointerOffset = POINTER_SIZE / 2;
    this._pointer.classList.remove("top", "right", "bottom", "left");
    this._pointer.classList.add(side);
    if (side === "top" || side === "bottom") {
      const pointerCenterX = this._clamp(targetCenterX, callout.left + POINTER_EDGE_MARGIN, callout.left + callout.width - POINTER_EDGE_MARGIN);
      this._pointer.style.left = `${pointerCenterX - pointerOffset}px`;
      this._pointer.style.top = `${side === "bottom" ? callout.top + callout.height - pointerOffset : callout.top - pointerOffset}px`;
      return;
    }
    const pointerCenterY = this._clamp(targetCenterY, callout.top + POINTER_EDGE_MARGIN, callout.top + callout.height - POINTER_EDGE_MARGIN);
    this._pointer.style.left = `${side === "right" ? callout.left + callout.width - pointerOffset : callout.left - pointerOffset}px`;
    this._pointer.style.top = `${pointerCenterY - pointerOffset}px`;
  }
  _clamp(value2, min, max) {
    return Math.max(min, Math.min(value2, max));
  }
  _resolvePlacement(placement) {
    switch (placement) {
      case "above":
        return { anchorAxisAlignment: 0 /* VERTICAL */, anchorPosition: 1 /* ABOVE */, anchorAlignment: 0 /* LEFT */ };
      case "left":
        return { anchorAxisAlignment: 1 /* HORIZONTAL */, anchorPosition: 0 /* BELOW */, anchorAlignment: 1 /* RIGHT */ };
      case "right":
        return { anchorAxisAlignment: 1 /* HORIZONTAL */, anchorPosition: 0 /* BELOW */, anchorAlignment: 0 /* LEFT */ };
      case "below":
      case "auto":
      default:
        return { anchorAxisAlignment: 0 /* VERTICAL */, anchorPosition: 0 /* BELOW */, anchorAlignment: 0 /* LEFT */ };
    }
  }
  _renderContent(content) {
    this._title.textContent = content.title;
    this._descriptionRenderStore.clear();
    this._description.replaceChildren();
    if (isMarkdownString(content.description)) {
      const rendered = this._descriptionRenderStore.add(renderMarkdown(content.description));
      this._description.appendChild(rendered.element);
    } else {
      this._description.textContent = content.description;
    }
    this._counter.textContent = localize(17924, null, content.stepIndex + 1, content.stepCount);
    this._skipButton.element.style.display = content.isLastStep ? "none" : "";
    this._backButton.element.style.display = content.canGoBack ? "" : "none";
    this._nextButton.label = content.isLastStep ? localize(17925, null) : localize(17928, null);
  }
  _onKeyDown(e4) {
    const event = new StandardKeyboardEvent(e4);
    if (event.equals(9 /* Escape */)) {
      event.stopPropagation();
      event.preventDefault();
      this._onDidSkip.fire("escapeKey" /* EscapeKey */);
      return;
    }
    if (event.equals(2 /* Tab */) || event.equals(1024 /* Shift */ | 2 /* Tab */)) {
      this._trapFocus(event);
    }
  }
  _trapFocus(event) {
    const focusable = this._collectFocusable();
    if (focusable.length === 0) {
      return;
    }
    const active = getActiveElement();
    const currentIndex = focusable.findIndex((element) => element === active);
    let nextIndex;
    if (currentIndex === -1) {
      nextIndex = event.shiftKey ? focusable.length - 1 : 0;
    } else {
      const delta2 = event.shiftKey ? -1 : 1;
      nextIndex = (currentIndex + delta2 + focusable.length) % focusable.length;
    }
    event.preventDefault();
    event.stopPropagation();
    focusable[nextIndex].focus();
  }
  /**
   * The focusable elements participating in the focus trap, in DOM order: the
   * spotlighted target (when it is interactive or the Next button is hidden), then any
   * interactive content in the (possibly markdown) description, then the visible
   * action buttons. Including the target keeps the spotlighted control
   * keyboard-reachable, and querying the description keeps markdown links
   * reachable despite `aria-modal`.
   */
  _collectFocusable() {
    const targetFocusables = (this._options.allowTargetInteraction || this._options.advanceOnTargetClick || this._options.hideNext) && this._target ? [this._target, ...this._target.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')] : [];
    const descriptionFocusables = Array.from(
      // eslint-disable-next-line no-restricted-syntax -- querying our own callout description subtree for focusable markdown content (e.g. links)
      this._description.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
    );
    const buttons = [this._skipButton, this._backButton, this._nextButton].filter((button) => button.element.style.display !== "none").map((button) => button.element);
    return [...targetFocusables, ...descriptionFocusables, ...buttons].filter((element) => this._isTabbable(element));
  }
  _isTabbable(element) {
    if (!element.isConnected || element.getAttribute("aria-hidden") === "true" || element.tabIndex === -1 || element.hasAttribute("disabled")) {
      return false;
    }
    const style = getWindow(this._container).getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  }
  scheduleLayout() {
    if (this._scheduledLayout) {
      return;
    }
    const targetWindow = getWindow(this._container);
    this._scheduledLayout = scheduleAtNextAnimationFrame(targetWindow, () => {
      this._scheduledLayout = void 0;
      this.layout();
    });
  }
  _restoreFocus() {
    const previous = this._previousFocus;
    this._previousFocus = void 0;
    if (previous && previous.isConnected) {
      previous.focus();
    }
  }
  dispose() {
    this._root.remove();
    super.dispose();
  }
};
export { DEFAULT_HOLE_PADDING, POINTER_SIZE, POINTER_GAP, POINTER_EDGE_MARGIN, SpotlightOverlay };
