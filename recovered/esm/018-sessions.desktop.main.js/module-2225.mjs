// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionManagement/common/extensionsIcons.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { registerColor } from "./module-0226.mjs";
import { textLinkForeground } from "./module-0227.mjs";


// src/vs/workbench/services/extensionManagement/common/extensionsIcons.ts
var extensionDefaultIcon = registerIcon("extension-default-icon", Codicon.extensionsLarge, localize(23000, null));

var verifiedPublisherIcon = registerIcon("extensions-verified-publisher", Codicon.verifiedFilled, localize(23002, null));

var extensionVerifiedPublisherIconColor = registerColor("extensionIcon.verifiedForeground", textLinkForeground, localize(23001, null), false);
export { extensionDefaultIcon, verifiedPublisherIcon, extensionVerifiedPublisherIconColor };
