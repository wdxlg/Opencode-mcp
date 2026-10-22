// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/placeholderText/browser/placeholderText.contribution.ts
import { registerEditorContribution } from "./module-0097.mjs";
import { PlaceholderTextContribution } from "./module-0832.mjs";
import { wrapInReloadableClass1 } from "./module-0833.mjs";
import { registerColor } from "./module-0226.mjs";
import { ghostTextForeground } from "./module-0288.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/editor/contrib/placeholderText/browser/placeholderText.contribution.ts
registerEditorContribution(PlaceholderTextContribution.ID, wrapInReloadableClass1(() => PlaceholderTextContribution), 0 /* Eager */);

registerColor("editor.placeholder.foreground", ghostTextForeground, localize(1519, null));
export {};
