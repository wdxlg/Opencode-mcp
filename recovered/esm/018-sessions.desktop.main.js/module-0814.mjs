// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlayHints/browser/inlayHintsContribution.ts
import { registerEditorContribution } from "./module-0097.mjs";
import { InlayHintsController } from "./module-0649.mjs";
import { HoverParticipantRegistry } from "./module-0575.mjs";
import { InlayHintsHover } from "./module-0650.mjs";


// src/vs/editor/contrib/inlayHints/browser/inlayHintsContribution.ts
registerEditorContribution(InlayHintsController.ID, InlayHintsController, 1 /* AfterFirstRender */);

HoverParticipantRegistry.register(InlayHintsHover);
export {};
