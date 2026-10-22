// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalExtensions.ts
import { Registry } from "./module-0090.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalExtensions.ts
function registerTerminalContribution(id2, ctor, canRunInDetachedTerminals = false) {
  TerminalContributionRegistry.INSTANCE.registerTerminalContribution({ id: id2, ctor, canRunInDetachedTerminals });
}

var TerminalExtensionsRegistry;

((TerminalExtensionsRegistry2) => {
  function getTerminalContributions() {
    return TerminalContributionRegistry.INSTANCE.getTerminalContributions();
  }
  TerminalExtensionsRegistry2.getTerminalContributions = getTerminalContributions;
})(TerminalExtensionsRegistry || (TerminalExtensionsRegistry = {}));

var TerminalContributionRegistry = class _TerminalContributionRegistry {
  constructor() {
    this._terminalContributions = [];
  }
  static {
    this.INSTANCE = new _TerminalContributionRegistry();
  }
  registerTerminalContribution(description) {
    this._terminalContributions.push(description);
  }
  getTerminalContributions() {
    return this._terminalContributions.slice(0);
  }
};

Registry.add("terminal.contributions" /* TerminalContributions */, TerminalContributionRegistry.INSTANCE);
export { registerTerminalContribution, TerminalExtensionsRegistry, TerminalContributionRegistry };
