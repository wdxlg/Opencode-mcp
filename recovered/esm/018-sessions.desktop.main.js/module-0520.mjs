// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/hover/browser/hover.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { addStandardDisposableListener, isHTMLElement } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/platform/hover/browser/hover.ts
var IHoverService = createDecorator("hoverService");

var WorkbenchHoverDelegate = class extends Disposable {
  constructor(placement, hoverOptions, overrideOptions = {}, configurationService, hoverService) {
    super();
    this.placement = placement;
    this.hoverOptions = hoverOptions;
    this.overrideOptions = overrideOptions;
    this.configurationService = configurationService;
    this.hoverService = hoverService;
    this.lastHoverHideTime = 0;
    this.timeLimit = 200;
    this.hoverDisposables = this._register(new DisposableStore());
    this._delay = this.configurationService.getValue("workbench.hover.delay");
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("workbench.hover.delay")) {
        this._delay = this.configurationService.getValue("workbench.hover.delay");
      }
    }));
  }
  get delay() {
    if (this.isInstantlyHovering()) {
      return 0;
    }
    if (this.hoverOptions?.dynamicDelay) {
      return (content) => this.hoverOptions?.dynamicDelay?.(content) ?? this._delay;
    }
    return this._delay;
  }
  showHover(options3, focus) {
    const overrideOptions = typeof this.overrideOptions === "function" ? this.overrideOptions(options3, focus) : this.overrideOptions;
    this.hoverDisposables.clear();
    const targets = isHTMLElement(options3.target) ? [options3.target] : options3.target.targetElements;
    for (const target of targets) {
      this.hoverDisposables.add(addStandardDisposableListener(target, "keydown", (e4) => {
        if (e4.equals(9 /* Escape */)) {
          this.hoverService.hideHover();
        }
      }));
    }
    const id2 = isHTMLElement(options3.content) ? void 0 : typeof options3.content === "string" ? options3.content.toString() : options3.content.value;
    return this.hoverService.showInstantHover({
      ...options3,
      ...overrideOptions,
      persistence: {
        hideOnKeyDown: true,
        ...overrideOptions.persistence
      },
      id: id2,
      appearance: {
        ...options3.appearance,
        compact: true,
        skipFadeInAnimation: this.isInstantlyHovering(),
        ...overrideOptions.appearance
      }
    }, focus);
  }
  isInstantlyHovering() {
    return !!this.hoverOptions?.instantHover && Date.now() - this.lastHoverHideTime < this.timeLimit;
  }
  setInstantHoverTimeLimit(timeLimit) {
    if (!this.hoverOptions?.instantHover) {
      throw new Error("Instant hover is not enabled");
    }
    this.timeLimit = timeLimit;
  }
  onDidHideHover() {
    this.hoverDisposables.clear();
    if (this.hoverOptions?.instantHover) {
      this.lastHoverHideTime = Date.now();
    }
  }
};

WorkbenchHoverDelegate = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IHoverService)
], WorkbenchHoverDelegate);

var nativeHoverDelegate = {
  showHover: function() {
    throw new Error("Native hover function not implemented.");
  },
  delay: 0,
  showNativeHover: true
};
export { IHoverService, WorkbenchHoverDelegate, nativeHoverDelegate };
