// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/onboarding/common/onboardingRegistry.ts
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/onboarding/common/onboardingRegistry.ts
var OnboardingScenarioRegistry = class {
  constructor() {
    this._scenarios = /* @__PURE__ */ new Map();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
  }
  register(scenario) {
    const id2 = scenario.id;
    if (this._scenarios.has(id2)) {
      throw new Error(`An onboarding scenario with id '${id2}' is already registered.`);
    }
    this._scenarios.set(id2, scenario);
    this._onDidChange.fire();
    return {
      dispose: () => {
        if (this._scenarios.get(id2) === scenario) {
          this._scenarios.delete(id2);
          this._onDidChange.fire();
        }
      }
    };
  }
  getScenarios() {
    return Array.from(this._scenarios.values());
  }
  getScenario(id2) {
    return this._scenarios.get(id2);
  }
};

var onboardingScenarioRegistry = new OnboardingScenarioRegistry();
export { OnboardingScenarioRegistry, onboardingScenarioRegistry };
