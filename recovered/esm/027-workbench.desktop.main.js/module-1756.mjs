// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/hover/browser/updatableHoverWidget.ts
import { isFunction, isString } from "./module-0010.mjs";
import { isHTMLElement } from "./module-0075.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { isManagedHoverTooltipMarkdownString } from "./module-0548.mjs";
import { localize } from "./module-0001.mjs";
import { isMarkdownString } from "./module-0462.mjs";


// src/vs/platform/hover/browser/updatableHoverWidget.ts
var ManagedHoverWidget = class {
  constructor(hoverDelegate, target, fadeInAnimation) {
    this.hoverDelegate = hoverDelegate;
    this.target = target;
    this.fadeInAnimation = fadeInAnimation;
  }
  onDidHide() {
    if (this._cancellationTokenSource) {
      this._cancellationTokenSource.dispose(true);
      this._cancellationTokenSource = void 0;
    }
  }
  async update(content2, focus, options3) {
    if (this._cancellationTokenSource) {
      this._cancellationTokenSource.dispose(true);
      this._cancellationTokenSource = void 0;
    }
    if (this.isDisposed) {
      return;
    }
    let resolvedContent;
    if (isString(content2) || isHTMLElement(content2) || content2 === void 0) {
      resolvedContent = content2;
    } else {
      this._cancellationTokenSource = new CancellationTokenSource();
      const token = this._cancellationTokenSource.token;
      let managedContent;
      if (isManagedHoverTooltipMarkdownString(content2)) {
        if (isFunction(content2.markdown)) {
          managedContent = content2.markdown(token).then((resolvedContent2) => resolvedContent2 ?? content2.markdownNotSupportedFallback);
        } else {
          managedContent = content2.markdown ?? content2.markdownNotSupportedFallback;
        }
      } else {
        managedContent = content2.element(token);
      }
      if (managedContent instanceof Promise) {
        if (!this._hoverWidget) {
          this.show(localize(3060, null), focus, options3);
        }
        resolvedContent = await managedContent;
      } else {
        resolvedContent = managedContent;
      }
      if (this.isDisposed || token.isCancellationRequested) {
        return;
      }
    }
    this.show(resolvedContent, focus, options3);
  }
  show(content2, focus, options3) {
    const oldHoverWidget = this._hoverWidget;
    if (this.hasContent(content2)) {
      const hoverOptions = {
        content: content2,
        target: this.target,
        actions: options3?.actions,
        linkHandler: options3?.linkHandler,
        trapFocus: options3?.trapFocus,
        appearance: {
          showPointer: this.hoverDelegate.placement === "element",
          skipFadeInAnimation: !this.fadeInAnimation || !!oldHoverWidget,
          // do not fade in if the hover is already showing
          showHoverHint: options3?.appearance?.showHoverHint
        },
        position: {
          hoverPosition: 2 /* BELOW */,
          anchorAlignment: options3?.position?.anchorAlignment
        }
      };
      this._hoverWidget = this.hoverDelegate.showHover(hoverOptions, focus);
    }
    oldHoverWidget?.dispose();
  }
  hasContent(content2) {
    if (!content2) {
      return false;
    }
    if (isMarkdownString(content2)) {
      return !!content2.value;
    }
    return true;
  }
  get isDisposed() {
    return this._hoverWidget?.isDisposed;
  }
  dispose() {
    this._hoverWidget?.dispose();
    this._cancellationTokenSource?.dispose(true);
    this._cancellationTokenSource = void 0;
  }
};
export { ManagedHoverWidget };
