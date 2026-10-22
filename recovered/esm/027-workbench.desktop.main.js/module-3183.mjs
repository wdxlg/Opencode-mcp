// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/breakpoints.ts
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/workbench/contrib/debug/common/breakpoints.ts
var Breakpoints = class {
  constructor(breakpointContribution, contextKeyService) {
    this.breakpointContribution = breakpointContribution;
    this.contextKeyService = contextKeyService;
    this.breakpointsWhen = typeof breakpointContribution.when === "string" ? ContextKeyExpr.deserialize(breakpointContribution.when) : void 0;
  }
  get language() {
    return this.breakpointContribution.language;
  }
  get enabled() {
    return !this.breakpointsWhen || this.contextKeyService.contextMatchesRules(this.breakpointsWhen);
  }
};

Breakpoints = __decorateClass([
  __decorateParam(1, IContextKeyService)
], Breakpoints);
export { Breakpoints };
