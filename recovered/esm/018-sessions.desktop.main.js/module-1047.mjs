// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionManagement/common/extensionManagement.ts
import { createDecorator, refineServiceDecorator } from "./module-0077.mjs";
import { IExtensionManagementService } from "./module-0874.mjs";


// src/vs/workbench/services/extensionManagement/common/extensionManagement.ts
var IProfileAwareExtensionManagementService = refineServiceDecorator(IExtensionManagementService);

var IExtensionManagementServerService = createDecorator("extensionManagementServerService");

var IWorkbenchExtensionManagementService = refineServiceDecorator(IProfileAwareExtensionManagementService);

var IWorkbenchExtensionEnablementService = createDecorator("extensionEnablementService");

var IWebExtensionsScannerService = createDecorator("IWebExtensionsScannerService");
export { IProfileAwareExtensionManagementService, IExtensionManagementServerService, IWorkbenchExtensionManagementService, IWorkbenchExtensionEnablementService, IWebExtensionsScannerService };
