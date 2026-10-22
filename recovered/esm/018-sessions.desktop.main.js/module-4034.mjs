// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/webContentExtractor/electron-browser/webContentExtractorService.ts
import { registerMainProcessRemoteService, registerSharedProcessRemoteService } from "./module-3826.mjs";
import { ISharedWebContentExtractorService, IWebContentExtractorService } from "./module-2039.mjs";


// src/vs/platform/webContentExtractor/electron-browser/webContentExtractorService.ts
registerMainProcessRemoteService(IWebContentExtractorService, "webContentExtractor");

registerSharedProcessRemoteService(ISharedWebContentExtractorService, "sharedWebContentExtractor");
export {};
