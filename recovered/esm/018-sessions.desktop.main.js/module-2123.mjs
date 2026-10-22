// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/explorerFileContrib.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Registry } from "./module-0090.mjs";


// src/vs/workbench/contrib/files/browser/explorerFileContrib.ts
var ExplorerFileContributionRegistry = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidRegisterDescriptor = this._register(new Emitter());
    this.onDidRegisterDescriptor = this._onDidRegisterDescriptor.event;
    this.descriptors = [];
  }
  /** @inheritdoc */
  register(descriptor) {
    this.descriptors.push(descriptor);
    this._onDidRegisterDescriptor.fire(descriptor);
  }
  /**
   * Creates a new instance of all registered contributions.
   */
  create(insta, container2, store) {
    return this.descriptors.map((d) => {
      const i2 = d.create(insta, container2);
      store.add(i2);
      return i2;
    });
  }
};

var explorerFileContribRegistry = new ExplorerFileContributionRegistry();

Registry.add("workbench.registry.explorer.fileContributions" /* FileContributionRegistry */, explorerFileContribRegistry);
export { ExplorerFileContributionRegistry, explorerFileContribRegistry };
