// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/opener/browser/link.ts
import { Disposable } from "./module-0012.mjs";
import { $, EventHelper, append, clearNode } from "./module-0075.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { Event2 } from "./module-0017.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/platform/opener/browser/link.ts
var Link = class extends Disposable {
  constructor(container2, _link, options3 = {}, _hoverService, openerService) {
    super();
    this._link = _link;
    this._hoverService = _hoverService;
    this._enabled = true;
    this.el = append(container2, $("a.monaco-link", {
      tabIndex: _link.tabIndex ?? 0,
      href: _link.href
    }, _link.label));
    this.hoverDelegate = options3.hoverDelegate ?? getDefaultHoverDelegate("mouse");
    this.setTooltip(_link.title);
    this.el.setAttribute("role", "button");
    const onClickEmitter = this._register(new DomEmitter(this.el, "click"));
    const onKeyDown = this._register(new DomEmitter(this.el, "keydown"));
    const onKeyActivate = Event2.chain(
      onKeyDown.event,
      ($129) => $129.map((e4) => new StandardKeyboardEvent(e4)).filter((e4) => e4.keyCode === 3 /* Enter */ || e4.keyCode === 10 /* Space */)
    );
    const onTap = this._register(new DomEmitter(this.el, EventType2.Tap)).event;
    this._register(Gesture.addTarget(this.el));
    const onOpen = Event2.any(onClickEmitter.event, onKeyActivate, onTap);
    this._register(onOpen((e4) => {
      if (!this.enabled) {
        return;
      }
      EventHelper.stop(e4, true);
      if (options3?.opener) {
        options3.opener(this._link.href);
      } else {
        openerService.open(this._link.href, { allowCommands: true });
      }
    }));
    this.enabled = true;
  }
  get enabled() {
    return this._enabled;
  }
  set enabled(enabled) {
    if (enabled) {
      this.el.setAttribute("aria-disabled", "false");
      this.el.tabIndex = 0;
      this.el.style.pointerEvents = "auto";
      this.el.style.opacity = "1";
      this.el.style.cursor = "pointer";
      this._enabled = false;
    } else {
      this.el.setAttribute("aria-disabled", "true");
      this.el.tabIndex = -1;
      this.el.style.pointerEvents = "none";
      this.el.style.opacity = "0.4";
      this.el.style.cursor = "default";
      this._enabled = true;
    }
    this._enabled = enabled;
  }
  set link(link2) {
    if (typeof link2.label === "string") {
      this.el.textContent = link2.label;
    } else {
      clearNode(this.el);
      this.el.appendChild(link2.label);
    }
    this.el.href = link2.href;
    if (typeof link2.tabIndex !== "undefined") {
      this.el.tabIndex = link2.tabIndex;
    }
    this.setTooltip(link2.title);
    this._link = link2;
  }
  setTooltip(title) {
    if (!this.hover && title) {
      this.hover = this._register(this._hoverService.setupManagedHover(this.hoverDelegate, this.el, title));
    } else if (this.hover) {
      this.hover.update(title);
    }
  }
};

Link = __decorateClass([
  __decorateParam(3, IHoverService),
  __decorateParam(4, IOpenerService)
], Link);
export { Link };
