// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/randomService.ts
import { createDecorator } from "./module-0077.mjs";
import { generateUuid } from "./module-0190.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/randomService.ts
var IRandomService = createDecorator("randomService");

var RandomService = class {
  generateUuid() {
    return generateUuid();
  }
  /** Namespace should be 3 letter. */
  generatePrefixedUuid(namespace) {
    return `${namespace}-${this.generateUuid()}`;
  }
};
export { IRandomService, RandomService };
