// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/customView/browser/customView.ts
import { Disposable } from "./module-0012.mjs";
import { constObservable } from "./module-0061.mjs";


// src/vs/sessions/services/customView/browser/customView.ts
var AbstractCustomView = class extends Disposable {
  constructor() {
    super(...arguments);
    /** Optional secondary line below the title. */
    this.description = constObservable(void 0);
    /**
     * Width the content is capped to. Defaults to the same measure the session
     * views use.
     */
    this.maxWidth = void 0;
  }
  focus() {
  }
};
export { AbstractCustomView };
