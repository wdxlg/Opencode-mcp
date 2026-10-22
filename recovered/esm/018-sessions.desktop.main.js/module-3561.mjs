// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/newSessionComposerService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/sessions/contrib/chat/browser/newSessionComposerService.ts
var NEW_SESSION_PROMPT_TYPING_DURATION_MS = 2500;

var INewSessionComposerService = createDecorator("newSessionComposerService");

var NewSessionComposerService = class extends Disposable {
  constructor() {
    super(...arguments);
    this._composers = /* @__PURE__ */ new Set();
    this._activeComposer = observableValue(this, void 0);
    this.activeComposer = this._activeComposer;
  }
  registerComposer(composer) {
    this._composers.add(composer);
    this._activeComposer.set(composer, void 0);
    return toDisposable(() => {
      this._composers.delete(composer);
      if (this._activeComposer.get() === composer) {
        this._activeComposer.set(Array.from(this._composers).at(-1), void 0);
      }
    });
  }
};

registerSingleton(INewSessionComposerService, NewSessionComposerService, 1 /* Delayed */);
export { NEW_SESSION_PROMPT_TYPING_DURATION_MS, INewSessionComposerService, NewSessionComposerService };
