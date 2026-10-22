// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webview/electron-browser/webview.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { IWebviewService } from "./module-1043.mjs";
import { ElectronWebviewService } from "./module-4157.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { OpenWebviewDeveloperToolsAction } from "./module-4146.mjs";


// src/vs/workbench/contrib/webview/electron-browser/webview.contribution.ts
registerSingleton(IWebviewService, ElectronWebviewService, 1 /* Delayed */);

registerAction2(OpenWebviewDeveloperToolsAction);
export {};
