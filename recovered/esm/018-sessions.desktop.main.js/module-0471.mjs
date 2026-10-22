// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/contextview/contextview.ts
import { createStyleSheet } from "./module-0224.mjs";
import { $, addStandardDisposableListener, clearNode, getActiveWindow, getDomNodePagePosition, getDomNodeZoomLevel, getTotalHeight, getTotalWidth, getWindow, hide, isAncestor, isHTMLElement, show } from "./module-0075.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { isIOS } from "./module-0014.mjs";
import { BrowserFeatures } from "./module-0020.mjs";
import { layout2d } from "./module-0470.mjs";


// src/vs/base/browser/ui/contextview/contextview.ts
function isAnchor(obj) {
  const anchor = obj;
  return !!anchor && typeof anchor.x === "number" && typeof anchor.y === "number";
}

var CONTEXT_VIEW_MENU_MOTION_CLASS = "context-view-menu-motion";

var CONTEXT_VIEW_MENU_MOTION_CLOSING_CLASS = "context-view-menu-motion-closing";

var CONTEXT_VIEW_MENU_MOTION_CLOSE_ANIMATION_DURATION = 150;

var CONTEXT_VIEW_MENU_MOTION_ANCESTOR_CLASSES = ["modern-ui", "monaco-enable-motion"];

var CONTEXT_VIEW_CLOSE_ANIMATION_DURATION_VARIABLE = "--vscode-context-view-close-animation-duration";

var CONTEXT_VIEW_MENU_MOTION_SHADOW_VARIABLE = "--vscode-context-view-menu-motion-shadow";

var CONTEXT_VIEW_MENU_MOTION_CLOSE_START_OPACITY_VARIABLE = "--vscode-context-view-menu-motion-close-start-opacity";

var CONTEXT_VIEW_MENU_MOTION_CLOSE_START_TRANSFORM_VARIABLE = "--vscode-context-view-menu-motion-close-start-transform";

var CONTEXT_VIEW_MENU_MOTION_OPEN_DURATION_MS = 250;

var CONTEXT_VIEW_MENU_MOTION_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

var contextViewMenuCloseAnimation = {
  className: CONTEXT_VIEW_MENU_MOTION_CLOSING_CLASS,
  duration: CONTEXT_VIEW_MENU_MOTION_CLOSE_ANIMATION_DURATION,
  requiredAncestorClasses: CONTEXT_VIEW_MENU_MOTION_ANCESTOR_CLASSES
};

function getContextViewMenuMotionCss(enabledSelectorPrefix) {
  return (
    /* css */
    `
	${enabledSelectorPrefix} .context-view.${CONTEXT_VIEW_MENU_MOTION_CLASS} {
		animation: none;
		box-shadow: none;
		overflow: visible;
	}

	${enabledSelectorPrefix} .context-view.${CONTEXT_VIEW_MENU_MOTION_CLASS} > .monaco-scrollable-element {
		animation: context-view-menu-motion-open ${CONTEXT_VIEW_MENU_MOTION_OPEN_DURATION_MS}ms ${CONTEXT_VIEW_MENU_MOTION_EASING} backwards;
		box-shadow: var(${CONTEXT_VIEW_MENU_MOTION_SHADOW_VARIABLE});
		transform-origin: top left;
		will-change: opacity;
	}

	${enabledSelectorPrefix} .context-view.${CONTEXT_VIEW_MENU_MOTION_CLASS}.right > .monaco-scrollable-element {
		transform-origin: top right;
	}

	${enabledSelectorPrefix} .context-view.${CONTEXT_VIEW_MENU_MOTION_CLASS}.top > .monaco-scrollable-element {
		transform-origin: bottom left;
	}

	${enabledSelectorPrefix} .context-view.${CONTEXT_VIEW_MENU_MOTION_CLASS}.top.right > .monaco-scrollable-element {
		transform-origin: bottom right;
	}

	${enabledSelectorPrefix} .context-view.${CONTEXT_VIEW_MENU_MOTION_CLASS}.${CONTEXT_VIEW_MENU_MOTION_CLOSING_CLASS} > .monaco-scrollable-element {
		animation: context-view-menu-motion-close var(${CONTEXT_VIEW_CLOSE_ANIMATION_DURATION_VARIABLE}) ${CONTEXT_VIEW_MENU_MOTION_EASING} both;
		pointer-events: none;
	}

	@keyframes context-view-menu-motion-open {
		0% {
			opacity: 0;
			transform: scale(0.97);
		}

		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes context-view-menu-motion-close {
		0% {
			opacity: var(${CONTEXT_VIEW_MENU_MOTION_CLOSE_START_OPACITY_VARIABLE}, 1);
			transform: var(${CONTEXT_VIEW_MENU_MOTION_CLOSE_START_TRANSFORM_VARIABLE}, scale(1));
		}

		100% {
			opacity: 0;
			transform: scale(0.99);
		}
	}`
  );
}

var contextViewMenuMotionStyleSheet;

function ensureContextViewMenuMotionStyleSheet() {
  if (!contextViewMenuMotionStyleSheet) {
    contextViewMenuMotionStyleSheet = createStyleSheet(void 0, (style) => {
      style.textContent = getContextViewMenuMotionCss(".modern-ui.monaco-enable-motion");
    });
  }
}

function getAnchorRect(anchor) {
  if (isHTMLElement(anchor)) {
    const elementPosition = getDomNodePagePosition(anchor);
    const zoom = getDomNodeZoomLevel(anchor);
    return {
      top: elementPosition.top * zoom,
      left: elementPosition.left * zoom,
      width: elementPosition.width * zoom,
      height: elementPosition.height * zoom
    };
  } else if (isAnchor(anchor)) {
    return {
      top: anchor.y,
      left: anchor.x,
      width: anchor.width || 1,
      height: anchor.height || 2
    };
  } else {
    return {
      top: anchor.posy,
      left: anchor.posx,
      // We are about to position the context view where the mouse
      // cursor is. To prevent the view being exactly under the mouse
      // when showing and thus potentially triggering an action within,
      // we treat the mouse location like a small sized block element.
      width: 2,
      height: 2
    };
  }
}

var ContextView = class _ContextView extends Disposable {
  constructor(container2, domPosition) {
    super();
    this.container = null;
    this.useFixedPosition = false;
    this.useShadowDOM = false;
    this.delegate = null;
    this.toDisposeOnClean = Disposable.None;
    this.toDisposeOnSetContainer = Disposable.None;
    this.shadowRoot = null;
    this.shadowRootHostElement = null;
    ensureContextViewMenuMotionStyleSheet();
    this.view = $(".context-view");
    hide(this.view);
    this.setContainer(container2, domPosition);
    this._register(toDisposable(() => this.setContainer(null, 1 /* ABSOLUTE */)));
  }
  static {
    this.BUBBLE_UP_EVENTS = ["click", "keydown", "focus", "blur"];
  }
  static {
    this.BUBBLE_DOWN_EVENTS = ["click"];
  }
  setContainer(container2, domPosition) {
    this.useFixedPosition = domPosition !== 1 /* ABSOLUTE */;
    const usedShadowDOM = this.useShadowDOM;
    this.useShadowDOM = domPosition === 3 /* FIXED_SHADOW */;
    if (container2 === this.container && usedShadowDOM === this.useShadowDOM) {
      return;
    }
    if (this.container) {
      this.toDisposeOnSetContainer.dispose();
      this.view.remove();
      if (this.shadowRoot) {
        this.shadowRoot = null;
        this.shadowRootHostElement?.remove();
        this.shadowRootHostElement = null;
      }
      this.container = null;
    }
    if (container2) {
      this.container = container2;
      if (this.useShadowDOM) {
        this.shadowRootHostElement = $(".shadow-root-host");
        Object.assign(this.shadowRootHostElement.style, {
          position: "fixed",
          top: "0",
          left: "0",
          width: "0",
          height: "0"
        });
        this.container.appendChild(this.shadowRootHostElement);
        this.shadowRoot = this.shadowRootHostElement.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = SHADOW_ROOT_CSS;
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(this.view);
        this.shadowRoot.appendChild($("slot"));
      } else {
        this.container.appendChild(this.view);
      }
      const toDisposeOnSetContainer = new DisposableStore();
      _ContextView.BUBBLE_UP_EVENTS.forEach((event) => {
        toDisposeOnSetContainer.add(addStandardDisposableListener(this.container, event, (e4) => {
          this.onDOMEvent(e4, false);
        }));
      });
      _ContextView.BUBBLE_DOWN_EVENTS.forEach((event) => {
        toDisposeOnSetContainer.add(addStandardDisposableListener(this.container, event, (e4) => {
          this.onDOMEvent(e4, true);
        }, true));
      });
      this.toDisposeOnSetContainer = toDisposeOnSetContainer;
    }
  }
  show(delegate) {
    this.completeHideAnimation();
    if (this.isVisible()) {
      this.hide(void 0, true);
    }
    clearNode(this.view);
    this.view.className = "context-view monaco-component";
    this.view.style.top = "0px";
    this.view.style.left = "0px";
    const zIndex = `${2575 + (delegate.layer ?? 0)}`;
    this.view.style.zIndex = zIndex;
    if (this.shadowRootHostElement) {
      this.shadowRootHostElement.style.zIndex = zIndex;
    }
    this.view.style.position = this.useFixedPosition ? "fixed" : "absolute";
    show(this.view);
    this.toDisposeOnClean = delegate.render(this.view) || Disposable.None;
    this.delegate = delegate;
    this.doLayout();
    this.delegate.focus?.();
  }
  getViewElement() {
    return this.view;
  }
  layout() {
    if (!this.isVisible()) {
      return;
    }
    if (this.delegate.canRelayout === false && !(isIOS && BrowserFeatures.pointerEvents)) {
      this.hide();
      return;
    }
    this.delegate?.layout?.();
    this.doLayout();
  }
  doLayout() {
    if (!this.isVisible()) {
      return;
    }
    const anchor = getAnchorRect(this.delegate.getAnchor());
    const containerWindow = this.container ? getWindow(this.container) : getActiveWindow();
    const viewport = { top: containerWindow.pageYOffset, left: containerWindow.pageXOffset, width: containerWindow.innerWidth, height: containerWindow.innerHeight };
    this.view.classList.toggle("fixed", this.useFixedPosition);
    this.view.style.top = "0px";
    this.view.style.left = "0px";
    const positioningOrigin = getDomNodePagePosition(this.view);
    const view = { width: getTotalWidth(this.view), height: getTotalHeight(this.view) };
    const anchorPosition = this.delegate.anchorPosition;
    const anchorAlignment = this.delegate.anchorAlignment;
    const anchorAxisAlignment = this.delegate.anchorAxisAlignment;
    const layoutResult = layout2d(viewport, view, anchor, { anchorAlignment, anchorPosition, anchorAxisAlignment });
    const { top: top2, left } = layoutResult;
    this.view.classList.remove("top", "bottom", "left", "right");
    this.view.classList.add(layoutResult.anchorPosition === 0 /* BELOW */ ? "bottom" : "top");
    this.view.classList.add(layoutResult.anchorAlignment === 0 /* LEFT */ ? "left" : "right");
    this.view.style.top = `${top2 - positioningOrigin.top}px`;
    this.view.style.left = `${left - positioningOrigin.left}px`;
    this.view.style.width = "initial";
  }
  hide(data, skipAnimation = false) {
    if (this.hidingContextView) {
      if (skipAnimation) {
        this.completeHideAnimation();
      }
      return;
    }
    const delegate = this.delegate;
    this.delegate = null;
    if (!delegate) {
      return;
    }
    const toDispose = this.toDisposeOnClean;
    this.toDisposeOnClean = Disposable.None;
    delegate.onHide?.(data);
    const closeAnimation = delegate.closeAnimation;
    if (!skipAnimation && closeAnimation && closeAnimation.duration > 0 && this.hasRequiredAncestorClasses(closeAnimation.requiredAncestorClasses)) {
      this.view.style.setProperty(CONTEXT_VIEW_CLOSE_ANIMATION_DURATION_VARIABLE, `${closeAnimation.duration}ms`);
      this.prepareMenuCloseAnimation();
      this.view.inert = true;
      this.view.classList.add(closeAnimation.className);
      const timeout2 = setTimeout(() => this.completeHideAnimation(), closeAnimation.duration);
      this.hidingContextView = {
        disposable: toDisposable(() => clearTimeout(timeout2)),
        toDispose,
        className: closeAnimation.className
      };
      return;
    }
    toDispose.dispose();
    hide(this.view);
  }
  isVisible() {
    return !!this.delegate;
  }
  completeHideAnimation() {
    const hidingContextView = this.hidingContextView;
    if (!hidingContextView) {
      return;
    }
    this.hidingContextView = void 0;
    hidingContextView.disposable.dispose();
    this.view.classList.remove(hidingContextView.className);
    this.view.style.removeProperty(CONTEXT_VIEW_CLOSE_ANIMATION_DURATION_VARIABLE);
    this.view.style.removeProperty(CONTEXT_VIEW_MENU_MOTION_CLOSE_START_OPACITY_VARIABLE);
    this.view.style.removeProperty(CONTEXT_VIEW_MENU_MOTION_CLOSE_START_TRANSFORM_VARIABLE);
    hidingContextView.toDispose.dispose();
    hide(this.view);
    this.view.inert = false;
  }
  prepareMenuCloseAnimation() {
    if (!this.view.classList.contains(CONTEXT_VIEW_MENU_MOTION_CLASS)) {
      return;
    }
    const surface = Array.from(this.view.children).find((element) => isHTMLElement(element) && element.classList.contains("monaco-scrollable-element"));
    if (!isHTMLElement(surface)) {
      return;
    }
    const computedStyle = getWindow(surface).getComputedStyle(surface);
    this.view.style.setProperty(CONTEXT_VIEW_MENU_MOTION_CLOSE_START_OPACITY_VARIABLE, computedStyle.opacity);
    this.view.style.setProperty(CONTEXT_VIEW_MENU_MOTION_CLOSE_START_TRANSFORM_VARIABLE, computedStyle.transform);
  }
  hasRequiredAncestorClasses(classNames2) {
    if (!classNames2?.length) {
      return true;
    }
    for (let candidate = this.view; candidate; ) {
      const current = candidate;
      if (classNames2.every((className2) => current.classList.contains(className2))) {
        return true;
      }
      if (current.parentElement) {
        candidate = current.parentElement;
      } else {
        const root = current.getRootNode();
        candidate = root instanceof ShadowRoot && isHTMLElement(root.host) ? root.host : null;
      }
    }
    return false;
  }
  onDOMEvent(e4, onCapture) {
    if (this.delegate) {
      if (this.delegate.onDOMEvent) {
        this.delegate.onDOMEvent(e4, getWindow(e4).document.activeElement);
      } else if (onCapture && !isAncestor(e4.target, this.container)) {
        this.hide();
      }
    }
  }
  dispose() {
    this.hide();
    this.completeHideAnimation();
    super.dispose();
  }
};

var SHADOW_ROOT_CSS = (
  /* css */
  `
	:host {
		all: initial; /* 1st rule so subsequent properties are reset. */
	}

	.codicon[class*='codicon-'] {
		font: normal normal normal 16px/1 codicon;
		display: inline-block;
		text-decoration: none;
		text-rendering: auto;
		text-align: center;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
	}

	:host {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "HelveticaNeue-Light", system-ui, "Ubuntu", "Droid Sans", sans-serif;
	}

	:host-context(.mac) { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
	:host-context(.mac:lang(zh-Hans)) { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", sans-serif; }
	:host-context(.mac:lang(zh-Hant)) { font-family: -apple-system, BlinkMacSystemFont, "PingFang TC", sans-serif; }
	:host-context(.mac:lang(ja)) { font-family: -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic Pro", sans-serif; }
	:host-context(.mac:lang(ko)) { font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Nanum Gothic", "AppleGothic", sans-serif; }

	:host-context(.windows) { font-family: "Segoe WPC", "Segoe UI", sans-serif; }
	:host-context(.windows:lang(zh-Hans)) { font-family: "Segoe WPC", "Segoe UI", "Microsoft YaHei", sans-serif; }
	:host-context(.windows:lang(zh-Hant)) { font-family: "Segoe WPC", "Segoe UI", "Microsoft Jhenghei", sans-serif; }
	:host-context(.windows:lang(ja)) { font-family: "Segoe WPC", "Segoe UI", "Yu Gothic UI", "Meiryo UI", sans-serif; }
	:host-context(.windows:lang(ko)) { font-family: "Segoe WPC", "Segoe UI", "Malgun Gothic", "Dotom", sans-serif; }

	:host-context(.linux) { font-family: system-ui, "Ubuntu", "Droid Sans", sans-serif; }
	:host-context(.linux:lang(zh-Hans)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans SC", "Source Han Sans CN", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(zh-Hant)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans TC", "Source Han Sans TW", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(ja)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans J", "Source Han Sans JP", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(ko)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans K", "Source Han Sans JR", "Source Han Sans", "UnDotum", "FBaekmuk Gulim", sans-serif; }
	${getContextViewMenuMotionCss(":host-context(.modern-ui.monaco-enable-motion)")}
`
);
export { isAnchor, getContextViewMenuMotionCss, ensureContextViewMenuMotionStyleSheet, getAnchorRect, CONTEXT_VIEW_MENU_MOTION_CLASS, CONTEXT_VIEW_MENU_MOTION_CLOSING_CLASS, CONTEXT_VIEW_MENU_MOTION_CLOSE_ANIMATION_DURATION, CONTEXT_VIEW_MENU_MOTION_ANCESTOR_CLASSES, CONTEXT_VIEW_CLOSE_ANIMATION_DURATION_VARIABLE, CONTEXT_VIEW_MENU_MOTION_SHADOW_VARIABLE, CONTEXT_VIEW_MENU_MOTION_CLOSE_START_OPACITY_VARIABLE, CONTEXT_VIEW_MENU_MOTION_CLOSE_START_TRANSFORM_VARIABLE, CONTEXT_VIEW_MENU_MOTION_OPEN_DURATION_MS, CONTEXT_VIEW_MENU_MOTION_EASING, contextViewMenuCloseAnimation, contextViewMenuMotionStyleSheet, ContextView, SHADOW_ROOT_CSS };
