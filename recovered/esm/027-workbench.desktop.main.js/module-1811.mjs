// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/contextview/browser/contextViewService.ts
import { Disposable } from "./module-0012.mjs";
import { ContextView } from "./module-0471.mjs";
import { getWindow } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILayoutService } from "./module-0551.mjs";


// src/vs/platform/contextview/browser/contextViewService.ts
var ContextViewHandler = class extends Disposable {
  constructor(layoutService) {
    super();
    this.layoutService = layoutService;
    this.contextView = this._register(new ContextView(this.layoutService.mainContainer, 1 /* ABSOLUTE */));
    this.layout();
    this._register(layoutService.onDidLayoutContainer(() => this.layout()));
  }
  // ContextView
  showContextView(delegate, container3, shadowRoot, useWindowContainerForShadowRoot) {
    let domPosition;
    if (container3) {
      if (container3 === this.layoutService.getContainer(getWindow(container3))) {
        domPosition = 1 /* ABSOLUTE */;
      } else if (shadowRoot) {
        domPosition = 3 /* FIXED_SHADOW */;
      } else {
        domPosition = 2 /* FIXED */;
      }
    } else {
      domPosition = 1 /* ABSOLUTE */;
    }
    const contextViewContainer = useWindowContainerForShadowRoot && container3 ? this.layoutService.getContainer(getWindow(container3)) : container3 ?? this.layoutService.activeContainer;
    this.contextView.setContainer(contextViewContainer, domPosition);
    this.contextView.show(delegate);
    const openContextView = {
      close: () => {
        if (this.openContextView === openContextView) {
          this.hideContextView();
        }
      }
    };
    this.openContextView = openContextView;
    return openContextView;
  }
  layout() {
    this.contextView.layout();
  }
  hideContextView(data) {
    this.contextView.hide(data);
    this.openContextView = void 0;
  }
};

ContextViewHandler = __decorateClass([
  __decorateParam(0, ILayoutService)
], ContextViewHandler);

var ContextViewService = class extends ContextViewHandler {
  getContextViewElement() {
    return this.contextView.getViewElement();
  }
};
export { ContextViewHandler, ContextViewService };
