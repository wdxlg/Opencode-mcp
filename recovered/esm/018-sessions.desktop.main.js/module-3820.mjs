// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/sessions.common.main.ts
import { getColorRegistry } from "./module-0226.mjs";
import { PANEL_BACKGROUND } from "./module-0868.mjs";
import { agentsPanelBackground } from "./module-1496.mjs";
import { TERMINAL_BACKGROUND_COLOR } from "./module-0869.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IUserDataSyncLogService } from "./module-1639.mjs";
import { UserDataSyncLogService } from "./module-1793.mjs";
import { IAllowedExtensionsService, IGlobalExtensionEnablementService } from "./module-0874.mjs";
import { AllowedExtensionsService } from "./module-1794.mjs";
import { IIgnoredExtensionsManagementService, IgnoredExtensionsManagementService } from "./module-1792.mjs";
import { GlobalExtensionEnablementService } from "./module-1638.mjs";
import { ExtensionStorageService, IExtensionStorageService } from "./module-1264.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { ContextViewService } from "./module-1785.mjs";
import { IListService, ListService } from "./module-0636.mjs";
import { IMarkerDecorationsService } from "./module-0209.mjs";
import { MarkerDecorationsService } from "./module-1786.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { MarkerService } from "./module-1787.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ContextKeyService } from "./module-1788.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { TextResourceConfigurationService } from "./module-1789.mjs";
import { IDownloadService } from "./module-1283.mjs";
import { DownloadService } from "./module-1790.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { OpenerService } from "./module-1791.mjs";
import { IWebWorkerService } from "./module-0161.mjs";
import { WebWorkerService } from "./module-1182.mjs";
import { IAllowedMcpServersService, IMcpGalleryService } from "./module-1196.mjs";
import { McpGalleryService } from "./module-1795.mjs";
import { AllowedMcpServersService } from "./module-1797.mjs";
import { ISessionsSetUpService, SessionsSetUpService } from "./module-1802.mjs";
import { ITestService } from "./module-1434.mjs";
import { NullTestProfileService, NullTestResultService, NullTestService } from "./module-2911.mjs";
import { ITestProfileService } from "./module-1428.mjs";
import { ITestResultService } from "./module-1433.mjs";
import { IDebugService } from "./module-1058.mjs";
import { NullDebugService, NullDebugVisualizerService } from "./module-2965.mjs";
import { IDebugVisualizerService } from "./module-1066.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { ExtensionsWorkbenchService } from "./module-3017.mjs";
import { IExtensionRecommendationNotificationService } from "./module-3018.mjs";
import { NullExtensionRecommendationNotificationService } from "./module-3019.mjs";


// src/vs/sessions/sessions.common.main.ts
getColorRegistry().updateDefaultColor(PANEL_BACKGROUND, agentsPanelBackground);

getColorRegistry().updateDefaultColor(TERMINAL_BACKGROUND_COLOR, agentsPanelBackground);

registerSingleton(IUserDataSyncLogService, UserDataSyncLogService, 1 /* Delayed */);

registerSingleton(IAllowedExtensionsService, AllowedExtensionsService, 1 /* Delayed */);

registerSingleton(IIgnoredExtensionsManagementService, IgnoredExtensionsManagementService, 1 /* Delayed */);

registerSingleton(IGlobalExtensionEnablementService, GlobalExtensionEnablementService, 1 /* Delayed */);

registerSingleton(IExtensionStorageService, ExtensionStorageService, 1 /* Delayed */);

registerSingleton(IContextViewService, ContextViewService, 1 /* Delayed */);

registerSingleton(IListService, ListService, 1 /* Delayed */);

registerSingleton(IMarkerDecorationsService, MarkerDecorationsService, 1 /* Delayed */);

registerSingleton(IMarkerService, MarkerService, 1 /* Delayed */);

registerSingleton(IContextKeyService, ContextKeyService, 1 /* Delayed */);

registerSingleton(ITextResourceConfigurationService, TextResourceConfigurationService, 1 /* Delayed */);

registerSingleton(IDownloadService, DownloadService, 1 /* Delayed */);

registerSingleton(IOpenerService, OpenerService, 1 /* Delayed */);

registerSingleton(IWebWorkerService, WebWorkerService, 1 /* Delayed */);

registerSingleton(IMcpGalleryService, McpGalleryService, 1 /* Delayed */);

registerSingleton(IAllowedMcpServersService, AllowedMcpServersService, 1 /* Delayed */);

registerSingleton(ISessionsSetUpService, SessionsSetUpService, 1 /* Delayed */);

registerSingleton(ITestService, NullTestService, 1 /* Delayed */);

registerSingleton(ITestProfileService, NullTestProfileService, 1 /* Delayed */);

registerSingleton(ITestResultService, NullTestResultService, 1 /* Delayed */);

registerSingleton(IDebugService, NullDebugService, 1 /* Delayed */);

registerSingleton(IDebugVisualizerService, NullDebugVisualizerService, 1 /* Delayed */);

registerSingleton(
  IExtensionsWorkbenchService,
  ExtensionsWorkbenchService,
  0 /* Eager */
  /* Auto updates extensions */
);

registerSingleton(IExtensionRecommendationNotificationService, NullExtensionRecommendationNotificationService, 1 /* Delayed */);
export {};
