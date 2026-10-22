// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/viewsWelcome/chatViewsWelcome.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Registry } from "./module-0090.mjs";


// src/vs/workbench/contrib/chat/browser/viewsWelcome/chatViewsWelcome.ts
var ChatViewsWelcomeContributionRegistry = class extends Disposable {
  constructor() {
    super(...arguments);
    this.descriptors = [];
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
  }
  register(descriptor) {
    this.descriptors.push(descriptor);
    this._onDidChange.fire();
  }
  get() {
    return this.descriptors;
  }
};

var chatViewsWelcomeRegistry = new ChatViewsWelcomeContributionRegistry();

Registry.add("workbench.registry.chat.viewsWelcome" /* ChatViewsWelcomeRegistry */, chatViewsWelcomeRegistry);
export { ChatViewsWelcomeContributionRegistry, chatViewsWelcomeRegistry };
