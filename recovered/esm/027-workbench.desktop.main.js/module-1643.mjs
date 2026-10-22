// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/configuration/common/jsonEditing.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/services/configuration/common/jsonEditing.ts
var IJSONEditingService = createDecorator("jsonEditingService");

var JSONEditingError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
};
export { IJSONEditingService, JSONEditingError };
