// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/externalUriOpener/common/externalUriOpener.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { ExternalUriOpenerService, IExternalUriOpenerService } from "./module-1295.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { externalUriOpenersConfigurationNode } from "./module-1292.mjs";


// src/vs/workbench/contrib/externalUriOpener/common/externalUriOpener.contribution.ts
registerSingleton(IExternalUriOpenerService, ExternalUriOpenerService, 1 /* Delayed */);

Registry.as(Extensions4.Configuration).registerConfiguration(externalUriOpenersConfigurationNode);
export {};
