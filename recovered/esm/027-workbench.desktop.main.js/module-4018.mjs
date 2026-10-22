// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/electron-browser/terminal.contribution.ts
import { registerMainProcessRemoteService } from "./module-3729.mjs";
import { ILocalPtyService } from "./module-1154.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ITerminalProfileResolverService } from "./module-1173.mjs";
import { ElectronTerminalProfileResolverService } from "./module-4015.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { LocalTerminalBackendContribution } from "./module-4017.mjs";
import { TerminalNativeContribution } from "./module-4013.mjs";


// src/vs/workbench/contrib/terminal/electron-browser/terminal.contribution.ts
registerMainProcessRemoteService(ILocalPtyService, "localPty" /* LocalPty */);

registerSingleton(ITerminalProfileResolverService, ElectronTerminalProfileResolverService, 1 /* Delayed */);

var workbenchRegistry11 = Registry.as(Extensions10.Workbench);

registerWorkbenchContribution2(LocalTerminalBackendContribution.ID, LocalTerminalBackendContribution, WorkbenchPhase.BlockStartup);

workbenchRegistry11.registerWorkbenchContribution(TerminalNativeContribution, 3 /* Restored */);
export { workbenchRegistry11 };
