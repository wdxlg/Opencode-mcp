// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webview/browser/webviewFindWidget.ts
import { SimpleFindWidget } from "./module-2377.mjs";
import { KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED } from "./module-1042.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/contrib/webview/browser/webviewFindWidget.ts
var WebviewFindWidget = class extends SimpleFindWidget {
  constructor(_delegate2, contextViewService, contextKeyService, hoverService, keybindingService, configurationService, accessibilityService) {
    super({
      showCommonFindToggles: false,
      checkImeCompletionState: _delegate2.checkImeCompletionState,
      enableSash: true
    }, contextViewService, contextKeyService, hoverService, keybindingService, configurationService, accessibilityService);
    this._delegate = _delegate2;
    this._findWidgetFocused = KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED.bindTo(contextKeyService);
    this._register(_delegate2.hasFindResult((hasResult) => {
      this.updateButtons(hasResult);
      this.focusFindBox();
    }));
    this._register(_delegate2.onDidStopFind(() => {
      this.updateButtons(false);
    }));
  }
  async _getResultCount(dataChanged) {
    return void 0;
  }
  find(previous) {
    const val = this.inputValue;
    if (val) {
      this._delegate.find(val, previous);
    }
  }
  hide(animated = true) {
    super.hide(animated);
    this._delegate.stopFind(true);
    this._delegate.focus();
  }
  _onInputChanged() {
    const val = this.inputValue;
    if (val) {
      this._delegate.updateFind(val);
    } else {
      this._delegate.stopFind(false);
    }
    return false;
  }
  _onFocusTrackerFocus() {
    this._findWidgetFocused.set(true);
  }
  _onFocusTrackerBlur() {
    this._findWidgetFocused.reset();
  }
  _onFindInputFocusTrackerFocus() {
  }
  _onFindInputFocusTrackerBlur() {
  }
  findFirst() {
  }
};

WebviewFindWidget = __decorateClass([
  __decorateParam(1, IContextViewService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IAccessibilityService)
], WebviewFindWidget);
export { WebviewFindWidget };
