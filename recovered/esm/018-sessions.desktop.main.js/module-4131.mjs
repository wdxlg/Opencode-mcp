// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/electron-browser/terminal.contribution.ts
import { registerMainProcessRemoteService } from "./module-3826.mjs";
import { ILocalPtyService } from "./module-1155.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ITerminalProfileResolverService } from "./module-1174.mjs";
import { ElectronTerminalProfileResolverService } from "./module-4128.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { LocalTerminalBackendContribution } from "./module-4130.mjs";
import { TerminalNativeContribution } from "./module-4126.mjs";


// src/vs/workbench/contrib/terminal/electron-browser/terminal.contribution.ts
registerMainProcessRemoteService(ILocalPtyService, "localPty" /* LocalPty */);

registerSingleton(ITerminalProfileResolverService, ElectronTerminalProfileResolverService, 1 /* Delayed */);

var workbenchRegistry8 = Registry.as(Extensions10.Workbench);

registerWorkbenchContribution2(LocalTerminalBackendContribution.ID, LocalTerminalBackendContribution, WorkbenchPhase.BlockStartup);

workbenchRegistry8.registerWorkbenchContribution(TerminalNativeContribution, 3 /* Restored */);
export { workbenchRegistry8 };
