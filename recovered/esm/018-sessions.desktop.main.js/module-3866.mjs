// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/workbenchFactory.ts
import { IConfigurationService } from "./module-0132.mjs";
import { getClientArea } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { DOCK_DETAIL_PANEL_SETTING } from "./module-3662.mjs";
import { SinglePaneWorkbench } from "./module-3865.mjs";
import { Workbench } from "./module-3474.mjs";


// src/vs/sessions/browser/workbenchFactory.ts
function createSessionsWorkbench(parent, options3, serviceCollection, logService) {
  const configurationService = serviceCollection.get(IConfigurationService);
  const isPhoneLayout2 = getClientArea(mainWindow.document.body).width < 640;
  const singlePane = !(configurationService instanceof SyncDescriptor) && !isPhoneLayout2 && configurationService.getValue(DOCK_DETAIL_PANEL_SETTING) === true;
  return singlePane ? new SinglePaneWorkbench(parent, options3, serviceCollection, logService) : new Workbench(parent, options3, serviceCollection, logService);
}
export { createSessionsWorkbench };
