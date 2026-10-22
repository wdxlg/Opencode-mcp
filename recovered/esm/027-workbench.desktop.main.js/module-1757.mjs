// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/hover/browser/hoverService.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { KeyChord } from "./module-0019.mjs";
import { EventType, addDisposableListener, getActiveElement, getWindow, isAncestor, isAncestorOfActiveElement, isEditableElement, isHTMLElement } from "./module-0075.mjs";
import { TimeoutTimer, timeout } from "./module-0036.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { HoverWidget2 } from "./module-1755.mjs";
import { isNumber, isString } from "./module-0010.mjs";
import { mainWindow } from "./module-0002.mjs";
import { ContextView } from "./module-0471.mjs";
import { ManagedHoverWidget } from "./module-1756.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { stripIcons } from "./module-0461.mjs";
import { isManagedHoverTooltipMarkdownString } from "./module-0548.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IHoverService } from "./module-0520.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";
import { editorHoverBorder } from "./module-0229.mjs";


// src/vs/platform/hover/browser/hoverService.ts
var MAX_HOVER_NESTING_DEPTH = 3;

var HoverService = class extends Disposable {
  constructor(_instantiationService, _configurationService, contextMenuService, _keybindingService, _layoutService, _accessibilityService) {
    super();
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._keybindingService = _keybindingService;
    this._layoutService = _layoutService;
    this._accessibilityService = _accessibilityService;
    /**
     * Stack of currently visible hovers. The last entry is the topmost hover.
     * This enables nested hovers where hovering inside a hover can show another hover.
     */
    this._hoverStack = [];
    this._currentDelayedHoverWasShown = false;
    this._delayedHovers = /* @__PURE__ */ new Map();
    this._managedHovers = /* @__PURE__ */ new Map();
    this._register(contextMenuService.onDidShowContextMenu(() => this.hideHover()));
    this._register(KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: "workbench.action.showHover",
      weight: 0 /* EditorCore */,
      primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 39 /* KeyI */),
      handler: () => {
        this._showAndFocusHoverForActiveElement();
      }
    }));
  }
  /**
   * Gets the current (topmost) hover from the stack, if any.
   */
  get _currentHover() {
    return this._hoverStack.at(-1)?.hover;
  }
  /**
   * Gets the current (topmost) hover options from the stack, if any.
   */
  get _currentHoverOptions() {
    return this._hoverStack.at(-1)?.options;
  }
  /**
   * Returns whether the target element is inside any of the hovers in the stack.
   * If it is, returns the index of the containing hover, otherwise returns -1.
   */
  _getContainingHoverIndex(target) {
    const targetElements = isHTMLElement(target) ? [target] : target.targetElements;
    for (let i2 = this._hoverStack.length - 1; i2 >= 0; i2--) {
      for (const targetElement of targetElements) {
        if (isAncestor(targetElement, this._hoverStack[i2].hover.domNode)) {
          return i2;
        }
      }
    }
    return -1;
  }
  showInstantHover(options3, focus, skipLastFocusedUpdate, dontShow) {
    const hover = this._createHover(options3, skipLastFocusedUpdate);
    if (!hover) {
      return void 0;
    }
    this._showHover(hover, options3, focus);
    return hover.hover;
  }
  showDelayedHover(options3, lifecycleOptions) {
    if (options3.id === void 0) {
      options3.id = getHoverIdFromContent(options3.content);
    }
    if (!this._currentDelayedHover || this._currentDelayedHoverWasShown) {
      if (this._currentHover?.isLocked && this._getContainingHoverIndex(options3.target) < 0) {
        return void 0;
      }
      if (getHoverOptionsIdentity(this._currentHoverOptions) === getHoverOptionsIdentity(options3)) {
        return this._currentHover;
      }
      if (this._currentHover && !this._currentHover.isDisposed && this._currentDelayedHoverGroupId !== void 0 && this._currentDelayedHoverGroupId === lifecycleOptions?.groupId) {
        return this.showInstantHover({
          ...options3,
          appearance: {
            ...options3.appearance,
            skipFadeInAnimation: true
          }
        });
      }
    } else if (this._currentDelayedHover && getHoverOptionsIdentity(this._currentHoverOptions) === getHoverOptionsIdentity(options3)) {
      return this._currentDelayedHover;
    }
    const hover = this._createHover(options3, void 0);
    if (!hover) {
      this._currentDelayedHover = void 0;
      this._currentDelayedHoverWasShown = false;
      this._currentDelayedHoverGroupId = void 0;
      return void 0;
    }
    this._currentDelayedHover = hover.hover;
    this._currentDelayedHoverWasShown = false;
    this._currentDelayedHoverGroupId = lifecycleOptions?.groupId;
    const delay = lifecycleOptions?.reducedDelay ? this._configurationService.getValue("workbench.hover.reducedDelay") : this._configurationService.getValue("workbench.hover.delay");
    timeout(delay).then(() => {
      if (hover.hover && !hover.hover.isDisposed) {
        this._currentDelayedHoverWasShown = true;
        this._showHover(hover, options3);
      }
    });
    return hover.hover;
  }
  setupDelayedHover(target, options3, lifecycleOptions) {
    const resolveHoverOptions = (e) => {
      const resolved = {
        ...typeof options3 === "function" ? options3() : options3,
        target
      };
      if (resolved.style === 2 /* Mouse */ && e) {
        resolved.target = resolveMouseStyleHoverTarget(target, e);
      }
      return resolved;
    };
    return this._setupDelayedHover(target, resolveHoverOptions, lifecycleOptions);
  }
  setupDelayedHoverAtMouse(target, options3, lifecycleOptions) {
    const resolveHoverOptions = (e) => ({
      ...typeof options3 === "function" ? options3() : options3,
      target: e ? resolveMouseStyleHoverTarget(target, e) : target
    });
    return this._setupDelayedHover(target, resolveHoverOptions, lifecycleOptions);
  }
  _setupDelayedHover(target, resolveHoverOptions, lifecycleOptions) {
    const store = new DisposableStore();
    store.add(addDisposableListener(target, EventType.MOUSE_OVER, (e) => {
      this.showDelayedHover(resolveHoverOptions(e), {
        groupId: lifecycleOptions?.groupId,
        reducedDelay: lifecycleOptions?.reducedDelay
      });
    }));
    if (lifecycleOptions?.setupKeyboardEvents) {
      store.add(addDisposableListener(target, EventType.KEY_DOWN, (e) => {
        const evt = new StandardKeyboardEvent(e);
        if (evt.equals(10 /* Space */) || evt.equals(3 /* Enter */)) {
          this.showInstantHover(resolveHoverOptions(), true);
        }
      }));
    }
    this._delayedHovers.set(target, { show: (focus) => {
      this.showInstantHover(resolveHoverOptions(), focus);
    } });
    store.add(toDisposable(() => this._delayedHovers.delete(target)));
    return store;
  }
  _createHover(options3, skipLastFocusedUpdate) {
    this._currentDelayedHover?.dispose();
    this._currentDelayedHover = void 0;
    if (options3.content === "") {
      return void 0;
    }
    if (options3.id === void 0) {
      options3.id = getHoverIdFromContent(options3.content);
    }
    const containingHoverIndex = this._getContainingHoverIndex(options3.target);
    const isNesting = containingHoverIndex >= 0;
    if (isNesting) {
      if (this._hoverStack.length >= MAX_HOVER_NESTING_DEPTH) {
        return void 0;
      }
    } else {
      if (this._currentHover?.isLocked) {
        return void 0;
      }
      if (getHoverOptionsIdentity(this._currentHoverOptions) === getHoverOptionsIdentity(options3)) {
        return void 0;
      }
    }
    this._lastHoverOptions = options3;
    const trapFocus = options3.trapFocus || this._accessibilityService.isScreenReaderOptimized();
    const activeElement = getActiveElement();
    let lastFocusedElementBeforeOpen;
    if (!skipLastFocusedUpdate) {
      if (trapFocus && activeElement) {
        if (!activeElement.classList.contains("monaco-hover")) {
          lastFocusedElementBeforeOpen = activeElement;
        }
      }
    }
    const hoverDisposables = new DisposableStore();
    const hover = this._instantiationService.createInstance(HoverWidget2, options3);
    if (options3.persistence?.sticky) {
      hover.isLocked = true;
    }
    if (options3.position?.hoverPosition && !isNumber(options3.position.hoverPosition)) {
      options3.target = {
        targetElements: isHTMLElement(options3.target) ? [options3.target] : options3.target.targetElements,
        x: options3.position.hoverPosition.x + 10
      };
    }
    hover.onDispose(() => {
      const stackIndex = this._hoverStack.findIndex((entry) => entry.hover === hover);
      if (stackIndex >= 0) {
        const entry = this._hoverStack[stackIndex];
        const hoverWasFocused = isAncestorOfActiveElement(hover.domNode);
        if (hoverWasFocused && entry.lastFocusedElementBeforeOpen) {
          entry.lastFocusedElementBeforeOpen.focus();
        }
        while (this._hoverStack.length > stackIndex + 1) {
          const nestedEntry = this._hoverStack.pop();
          nestedEntry.contextView.dispose();
          nestedEntry.hover.dispose();
        }
        this._hoverStack.splice(stackIndex, 1);
        entry.contextView.dispose();
      }
      hoverDisposables.dispose();
    }, void 0, hoverDisposables);
    if (!options3.container) {
      const targetElement = isHTMLElement(options3.target) ? options3.target : options3.target.targetElements[0];
      options3.container = this._layoutService.getContainer(getWindow(targetElement));
    }
    hoverDisposables.add(addDisposableListener(getWindow(options3.container).document, EventType.MOUSE_DOWN, (e) => {
      if (!isAncestor(e.target, hover.domNode)) {
        this._hideHoverAndDescendants(hover);
      }
    }));
    if (!options3.persistence?.sticky) {
      if ("targetElements" in options3.target) {
        for (const element of options3.target.targetElements) {
          hoverDisposables.add(addDisposableListener(element, EventType.CLICK, () => this._hideHoverAndDescendants(hover)));
        }
      } else {
        hoverDisposables.add(addDisposableListener(options3.target, EventType.CLICK, () => this._hideHoverAndDescendants(hover)));
      }
      const focusedElement = getActiveElement();
      if (focusedElement) {
        const focusedElementDocument = getWindow(focusedElement).document;
        hoverDisposables.add(addDisposableListener(focusedElement, EventType.KEY_DOWN, (e) => this._keyDown(e, hover, !!options3.persistence?.hideOnKeyDown)));
        hoverDisposables.add(addDisposableListener(focusedElementDocument, EventType.KEY_DOWN, (e) => this._keyDown(e, hover, !!options3.persistence?.hideOnKeyDown)));
        hoverDisposables.add(addDisposableListener(focusedElement, EventType.KEY_UP, (e) => this._keyUp(e, hover)));
        hoverDisposables.add(addDisposableListener(focusedElementDocument, EventType.KEY_UP, (e) => this._keyUp(e, hover)));
      }
    }
    if ("IntersectionObserver" in mainWindow) {
      const observer = new IntersectionObserver((e) => this._intersectionChange(e, hover), { threshold: 0 });
      const firstTargetElement = "targetElements" in options3.target ? options3.target.targetElements[0] : options3.target;
      observer.observe(firstTargetElement);
      hoverDisposables.add(toDisposable(() => observer.disconnect()));
    }
    return { hover, lastFocusedElementBeforeOpen, store: hoverDisposables };
  }
  _showHover(result, options3, focus) {
    const { hover, lastFocusedElementBeforeOpen, store } = result;
    const containingHoverIndex = this._getContainingHoverIndex(options3.target);
    const isNesting = containingHoverIndex >= 0;
    if (!isNesting) {
      this._hideAllHovers();
    } else {
      for (let i2 = this._hoverStack.length - 1; i2 > containingHoverIndex; i2--) {
        this._hoverStack[i2].hover.dispose();
      }
      this._hoverStack.length = containingHoverIndex + 1;
    }
    if (isNesting) {
      for (let i2 = 0; i2 <= containingHoverIndex; i2++) {
        store.add(this._hoverStack[i2].hover.addMouseTrackingElement(hover.domNode));
      }
    }
    const container3 = options3.container ?? this._layoutService.getContainer(getWindow(isHTMLElement(options3.target) ? options3.target : options3.target.targetElements[0]));
    const contextView = new ContextView(container3, 1 /* ABSOLUTE */);
    const stackEntry = {
      hover,
      options: options3,
      contextView,
      lastFocusedElementBeforeOpen
    };
    this._hoverStack.push(stackEntry);
    const delegate = new HoverContextViewDelegate(hover, focus, this._hoverStack.length);
    contextView.show(delegate);
    store.add(hover.onRequestLayout(() => contextView.layout()));
    if (focus || options3.persistence?.sticky) {
      const targetWindow = getWindow(container3);
      store.add(addDisposableListener(targetWindow, EventType.RESIZE, () => contextView.layout()));
    }
    if (options3.onDidHide) {
      const onDidHide = options3.onDidHide;
      store.add(toDisposable(() => onDidHide()));
    }
    options3.onDidShow?.();
  }
  /**
   * Hides a specific hover and all hovers nested inside it.
   */
  _hideHoverAndDescendants(hover) {
    const stackIndex = this._hoverStack.findIndex((entry) => entry.hover === hover);
    if (stackIndex < 0) {
      if (hover === this._currentDelayedHover) {
        this._cancelPendingDelayedHover();
      }
      return;
    }
    for (let i2 = this._hoverStack.length - 1; i2 >= stackIndex; i2--) {
      this._hoverStack[i2].hover.dispose();
    }
    this._hoverStack.length = stackIndex;
  }
  /**
   * Cancels a delayed hover that was created but whose delay has not elapsed yet, so it
   * never gets shown.
   */
  _cancelPendingDelayedHover() {
    if (!this._currentDelayedHover || this._currentDelayedHoverWasShown) {
      return;
    }
    this._currentDelayedHover.dispose();
    this._currentDelayedHover = void 0;
    this._currentDelayedHoverGroupId = void 0;
  }
  /**
   * Hides all hovers in the stack.
   */
  _hideAllHovers() {
    for (let i2 = this._hoverStack.length - 1; i2 >= 0; i2--) {
      this._hoverStack[i2].hover.dispose();
    }
    this._hoverStack.length = 0;
  }
  hideHover(force) {
    if (!force && this._currentHover?.isLocked) {
      return;
    }
    this._cancelPendingDelayedHover();
    if (this._hoverStack.length === 0) {
      return;
    }
    this.doHideHover();
  }
  doHideHover() {
    const length = this._hoverStack.length;
    this._hoverStack[length - 1]?.hover.dispose();
    this._hoverStack.length = length - 1;
  }
  _intersectionChange(entries2, hover) {
    const entry = entries2[entries2.length - 1];
    if (!entry.isIntersecting) {
      hover.dispose();
    }
  }
  showAndFocusLastHover() {
    if (!this._lastHoverOptions) {
      return;
    }
    this.showInstantHover(this._lastHoverOptions, true, true);
  }
  _showAndFocusHoverForActiveElement() {
    let activeElement = getActiveElement();
    while (activeElement) {
      const hover = this._delayedHovers.get(activeElement) ?? this._managedHovers.get(activeElement);
      if (hover) {
        hover.show(true);
        return;
      }
      activeElement = activeElement.parentElement;
    }
  }
  _keyDown(e, hover, hideOnKeyDown) {
    if (e.key === "Alt") {
      for (const entry of this._hoverStack) {
        entry.hover.isLocked = true;
      }
      return;
    }
    const event = new StandardKeyboardEvent(e);
    const keybinding = this._keybindingService.resolveKeyboardEvent(event);
    if (keybinding.getSingleModifierDispatchChords().some((value2) => !!value2) || this._keybindingService.softDispatch(event, event.target).kind !== 0 /* NoMatchingKb */) {
      return;
    }
    if (hideOnKeyDown && (!this._currentHoverOptions?.trapFocus || e.key !== "Tab")) {
      const stackEntry = this._hoverStack.find((entry) => entry.hover === hover);
      this._hideHoverAndDescendants(hover);
      stackEntry?.lastFocusedElementBeforeOpen?.focus();
    }
  }
  _keyUp(e, hover) {
    if (e.key === "Alt") {
      for (const entry of this._hoverStack) {
        if (!entry.options.persistence?.sticky) {
          entry.hover.isLocked = false;
        }
      }
      const anyMouseIn = this._hoverStack.some((entry) => entry.hover.isMouseIn);
      if (!anyMouseIn) {
        const topEntry = this._hoverStack[this._hoverStack.length - 1];
        this._hideAllHovers();
        topEntry?.lastFocusedElementBeforeOpen?.focus();
      }
    }
  }
  // TODO: Investigate performance of this function. There seems to be a lot of content created
  //       and thrown away on start up
  setupManagedHover(hoverDelegate, targetElement, content2, options3) {
    if (hoverDelegate.showNativeHover) {
      return setupNativeHover(targetElement, content2);
    }
    targetElement.setAttribute("custom-hover", "true");
    if (targetElement.title !== "") {
      console.warn("HTML element already has a title attribute, which will conflict with the custom hover. Please remove the title attribute.");
      targetElement.title = "";
    }
    let hoverPreparation;
    let hoverWidget;
    const hideHover = (disposeWidget, disposePreparation) => {
      const hadHover = hoverWidget !== void 0;
      if (disposeWidget) {
        hoverWidget?.dispose();
        hoverWidget = void 0;
      }
      if (disposePreparation) {
        hoverPreparation?.dispose();
        hoverPreparation = void 0;
      }
      if (hadHover) {
        hoverDelegate.onDidHideHover?.();
        hoverWidget = void 0;
      }
    };
    const triggerShowHover = (delay, focus, target, trapFocus) => {
      return new TimeoutTimer(async () => {
        if (!hoverWidget || hoverWidget.isDisposed) {
          hoverWidget = new ManagedHoverWidget(hoverDelegate, target || targetElement, delay > 0);
          await hoverWidget.update(typeof content2 === "function" ? content2() : content2, focus, { ...options3, trapFocus });
        }
      }, delay);
    };
    const store = new DisposableStore();
    let isMouseDown = false;
    store.add(addDisposableListener(targetElement, EventType.MOUSE_DOWN, () => {
      isMouseDown = true;
      hideHover(true, true);
    }, true));
    store.add(addDisposableListener(targetElement, EventType.MOUSE_UP, () => {
      isMouseDown = false;
    }, true));
    store.add(addDisposableListener(targetElement, EventType.MOUSE_LEAVE, (e) => {
      isMouseDown = false;
      hideHover(false, e.fromElement === targetElement);
    }, true));
    store.add(addDisposableListener(targetElement, EventType.MOUSE_OVER, (e) => {
      if (hoverPreparation) {
        return;
      }
      const mouseOverStore = new DisposableStore();
      const target = {
        targetElements: [targetElement],
        dispose: () => {
        }
      };
      if (hoverDelegate.placement === void 0 || hoverDelegate.placement === "mouse") {
        const onMouseMove = (e2) => {
          target.x = e2.x + 10;
          if (!eventIsRelatedToTarget(e2, targetElement)) {
            hideHover(true, true);
          }
        };
        mouseOverStore.add(addDisposableListener(targetElement, EventType.MOUSE_MOVE, onMouseMove, true));
      }
      hoverPreparation = mouseOverStore;
      if (!eventIsRelatedToTarget(e, targetElement)) {
        return;
      }
      mouseOverStore.add(triggerShowHover(typeof hoverDelegate.delay === "function" ? hoverDelegate.delay(content2) : hoverDelegate.delay, false, target));
    }, true));
    const onFocus = (e) => {
      if (isMouseDown || hoverPreparation) {
        return;
      }
      if (hoverWidget?.isDisposed) {
        hoverWidget = void 0;
      }
      const fromHover = isHTMLElement(e.relatedTarget) && e.relatedTarget.closest(".monaco-hover");
      if (fromHover || !e.relatedTarget) {
        return;
      }
      if (!eventIsRelatedToTarget(e, targetElement)) {
        return;
      }
      const target = {
        targetElements: [targetElement],
        dispose: () => {
        }
      };
      const toDispose = new DisposableStore();
      const onBlur = () => hideHover(true, true);
      toDispose.add(addDisposableListener(targetElement, EventType.BLUR, onBlur, true));
      toDispose.add(triggerShowHover(typeof hoverDelegate.delay === "function" ? hoverDelegate.delay(content2) : hoverDelegate.delay, false, target));
      hoverPreparation = toDispose;
    };
    if (!isEditableElement(targetElement)) {
      store.add(addDisposableListener(targetElement, EventType.FOCUS, onFocus, true));
    }
    const hover = {
      show: (focus) => {
        hideHover(false, true);
        triggerShowHover(0, focus, void 0, focus);
      },
      hide: () => {
        hideHover(true, true);
      },
      update: async (newContent, hoverOptions) => {
        content2 = newContent;
        options3 = hoverOptions;
        await hoverWidget?.update(content2, void 0, options3);
      },
      dispose: () => {
        this._managedHovers.delete(targetElement);
        store.dispose();
        hideHover(true, true);
      }
    };
    this._managedHovers.set(targetElement, hover);
    return hover;
  }
  showManagedHover(target) {
    const hover = this._managedHovers.get(target);
    if (hover) {
      hover.show(true);
    }
  }
  dispose() {
    this._managedHovers.forEach((hover) => hover.dispose());
    super.dispose();
  }
};

HoverService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, ILayoutService),
  __decorateParam(5, IAccessibilityService)
], HoverService);

function getHoverOptionsIdentity(options3) {
  if (options3 === void 0) {
    return void 0;
  }
  return options3?.id ?? options3;
}

function getHoverIdFromContent(content2) {
  if (isHTMLElement(content2)) {
    return void 0;
  }
  if (typeof content2 === "string") {
    return content2.toString();
  }
  return content2.value;
}

function getStringContent(contentOrFactory) {
  const content2 = typeof contentOrFactory === "function" ? contentOrFactory() : contentOrFactory;
  if (isString(content2)) {
    return stripIcons(content2);
  }
  if (isManagedHoverTooltipMarkdownString(content2)) {
    return content2.markdownNotSupportedFallback;
  }
  return void 0;
}

function setupNativeHover(targetElement, content2) {
  function updateTitle(title) {
    if (title) {
      targetElement.setAttribute("title", title);
    } else {
      targetElement.removeAttribute("title");
    }
  }
  updateTitle(getStringContent(content2));
  return {
    update: (content3) => updateTitle(getStringContent(content3)),
    show: () => {
    },
    hide: () => {
    },
    dispose: () => updateTitle(void 0)
  };
}

var HoverContextViewDelegate = class {
  constructor(_hover, _focus = false, stackDepth = 1) {
    this._hover = _hover;
    this._focus = _focus;
    this.layer = stackDepth;
  }
  get anchorPosition() {
    return this._hover.anchor;
  }
  render(container3) {
    this._hover.render(container3);
    if (this._focus) {
      this._hover.focus();
    }
    return this._hover;
  }
  getAnchor() {
    return {
      x: this._hover.x,
      y: this._hover.y
    };
  }
  layout() {
    this._hover.layout();
  }
};

function eventIsRelatedToTarget(event, target) {
  return isHTMLElement(event.target) && getHoverTargetElement(event.target, target) === target;
}

function getHoverTargetElement(element, stopElement) {
  stopElement = stopElement ?? getWindow(element).document.body;
  while (!element.hasAttribute("custom-hover") && element !== stopElement) {
    element = element.parentElement;
  }
  return element;
}

function resolveMouseStyleHoverTarget(target, e) {
  return {
    targetElements: [target],
    x: e.x + 10
  };
}

registerSingleton(IHoverService, HoverService, 1 /* Delayed */);

registerThemingParticipant((theme, collector) => {
  const hoverBorder = theme.getColor(editorHoverBorder);
  if (hoverBorder) {
    collector.addRule(`.monaco-hover.workbench-hover .hover-row:not(:first-child):not(:empty) { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
    collector.addRule(`.monaco-hover.workbench-hover hr { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
  }
});
export { getHoverOptionsIdentity, getHoverIdFromContent, getStringContent, setupNativeHover, eventIsRelatedToTarget, getHoverTargetElement, resolveMouseStyleHoverTarget, MAX_HOVER_NESTING_DEPTH, HoverService, HoverContextViewDelegate };
