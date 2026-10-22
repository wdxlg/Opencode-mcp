// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/webContentExtractor/electron-browser/webContentExtractorService.ts
import { registerMainProcessRemoteService, registerSharedProcessRemoteService } from "./module-3729.mjs";
import { ISharedWebContentExtractorService, IWebContentExtractorService } from "./module-2044.mjs";


// src/vs/platform/webContentExtractor/electron-browser/webContentExtractorService.ts
registerMainProcessRemoteService(IWebContentExtractorService, "webContentExtractor");

registerSharedProcessRemoteService(ISharedWebContentExtractorService, "sharedWebContentExtractor");
export {};
