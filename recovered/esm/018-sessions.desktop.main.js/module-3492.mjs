// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/sessionReadOnlyBanner.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";


// src/vs/sessions/browser/parts/sessionReadOnlyBanner.ts
var SessionReadOnlyBanner = class extends Disposable {
  constructor() {
    super();
    this._visible = false;
    this._actionDisposables = this._register(new DisposableStore());
    this.domNode = $(".session-readonly-banner");
    this.domNode.setAttribute("role", "status");
    const icon2 = append(this.domNode, $(".session-readonly-banner-icon"));
    icon2.appendChild(renderIcon(Codicon.lock));
    this._text = append(this.domNode, $("span.session-readonly-banner-text"));
    this._actionContainer = append(this.domNode, $("span.session-readonly-banner-action"));
    this.setContent({ message: localize(3845, null) });
    this.setVisible(false);
  }
  get visible() {
    return this._visible;
  }
  setVisible(visible) {
    this._visible = visible;
    this.domNode.classList.toggle("hidden", !visible);
  }
  setContent(content) {
    this._text.textContent = content.message;
    this._actionDisposables.clear();
    clearNode(this._actionContainer);
    if (content.action) {
      const link2 = append(this._actionContainer, $("a.session-readonly-banner-action-link"));
      link2.textContent = content.action.label;
      link2.setAttribute("role", "button");
      link2.tabIndex = 0;
      const run = content.action.run;
      this._actionDisposables.add(addDisposableListener(link2, EventType.CLICK, (e4) => {
        EventHelper.stop(e4, true);
        run();
      }));
      this._actionDisposables.add(addDisposableListener(link2, EventType.KEY_DOWN, (e4) => {
        const event = new StandardKeyboardEvent(e4);
        if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
          EventHelper.stop(e4, true);
          run();
        }
      }));
    }
  }
};
export { SessionReadOnlyBanner };
