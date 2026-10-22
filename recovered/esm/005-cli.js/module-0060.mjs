// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/cli.ts
import { resolveNLSConfiguration } from "./module-0058.mjs";
import { product } from "./module-0056.mjs";
import { configurePortable } from "./module-0054.mjs";
import { bootstrapESM } from "./module-0055.mjs";
import { cli_exports, init_cli } from "./module-0052.mjs";


// src/cli.ts
var nlsConfiguration = await resolveNLSConfiguration({ userLocale: "en", osLocale: "en", commit: product.commit, userDataPath: "", nlsMetadataPath: import.meta.dirname });

process.env["VSCODE_NLS_CONFIG"] = JSON.stringify(nlsConfiguration);

configurePortable(product);

process.env["VSCODE_CLI"] = "1";

await bootstrapESM();

await Promise.resolve().then(() => (init_cli(), cli_exports));
export { nlsConfiguration };
