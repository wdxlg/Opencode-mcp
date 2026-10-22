// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/animatedCounterWidget.ts
import { Disposable } from "./module-0012.mjs";
import { Throttler } from "./module-0036.mjs";
import { $ } from "./module-0075.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/browser/animatedCounterWidget.ts
var AnimatedCounterWidget = class extends Disposable {
  constructor(container2, _options, _accessibilityService) {
    super();
    this._options = _options;
    this._accessibilityService = _accessibilityService;
    this._hasRendered = false;
    this._updateThrottler = this._register(new Throttler());
    const { cssClassName, duration } = _options;
    this._element = cssClassName ? $(`div.monaco-animated-counter.${cssClassName}`) : $("div.monaco-animated-counter");
    this._element.appendChild($(`div`));
    container2.appendChild(this._element);
    this._animationOptions = {
      duration: duration ?? 240,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "both"
    };
    this._register(autorun((reader) => {
      const count2 = this._options.count.read(reader);
      this._updateThrottler.queue(() => this._update(count2));
    }));
  }
  async _update(count2) {
    if (!this._element || this._element.children.length === 0) {
      return;
    }
    const outgoingElement = this._element.children[0];
    if (count2 === void 0) {
      outgoingElement.textContent = "";
      this._count = void 0;
      this._hasRendered = false;
      return;
    }
    const incomingElementText = `${this._options.prefix ?? ""}${count2}`;
    if (this._options.duration === 0 || !this._hasRendered || this._accessibilityService.isMotionReduced()) {
      outgoingElement.textContent = incomingElementText;
      this._count = count2;
      this._hasRendered = true;
      return;
    }
    const previousWidth = this._element.getBoundingClientRect().width;
    const incomingElement = $(`div`, void 0, incomingElementText);
    this._element?.appendChild(incomingElement);
    const nextWidth = incomingElement.getBoundingClientRect().width;
    if (Math.abs(previousWidth - nextWidth) > 0.5) {
      this._element.animate([
        { width: `${previousWidth}px` },
        { width: `${nextWidth}px` }
      ], this._animationOptions);
    }
    const directionOption = this._options.direction ?? "topToBottom";
    const directionTopBottom = directionOption === "topToBottom" ? count2 > (this._count ?? 0) : count2 < (this._count ?? 0);
    const enterFrom = directionTopBottom ? "-100%" : "100%";
    const exitTo = directionTopBottom ? "100%" : "-100%";
    incomingElement.animate([
      { transform: `translateY(${enterFrom})`, opacity: 0 },
      { transform: "translateY(0)", opacity: 1 }
    ], this._animationOptions);
    const exit = outgoingElement.animate([
      { transform: "translateY(0)", opacity: 1 },
      { transform: `translateY(${exitTo})`, opacity: 0 }
    ], this._animationOptions);
    await new Promise((resolve3) => {
      let didCleanup = false;
      const cleanup = () => {
        if (didCleanup) {
          return;
        }
        didCleanup = true;
        this._count = count2;
        this._element?.removeChild(outgoingElement);
        resolve3();
      };
      exit.addEventListener("cancel", cleanup);
      exit.addEventListener("finish", cleanup);
    });
  }
};

AnimatedCounterWidget = __decorateClass([
  __decorateParam(2, IAccessibilityService)
], AnimatedCounterWidget);
export { AnimatedCounterWidget };
