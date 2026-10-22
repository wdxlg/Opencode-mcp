// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/scm.service.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { ISCMService, ISCMViewService } from "./module-1081.mjs";
import { SCMService } from "./module-2961.mjs";
import { SCMViewService } from "./module-2963.mjs";


// src/vs/workbench/contrib/scm/browser/scm.service.contribution.ts
registerSingleton(ISCMService, SCMService, 1 /* Delayed */);

registerSingleton(ISCMViewService, SCMViewService, 1 /* Delayed */);
export {};
