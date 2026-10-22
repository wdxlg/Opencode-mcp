// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/update/common/update.ts
import { upcast } from "./module-0010.mjs";
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/update/common/update.ts
var State3 = {
  Uninitialized: upcast({ type: "uninitialized" /* Uninitialized */ }),
  Disabled: (reason) => ({ type: "disabled" /* Disabled */, reason }),
  Idle: (updateType, error, notAvailable) => ({ type: "idle" /* Idle */, updateType, error, notAvailable }),
  CheckingForUpdates: (explicit) => ({ type: "checking for updates" /* CheckingForUpdates */, explicit }),
  AvailableForDownload: (update, canInstall) => ({ type: "available for download" /* AvailableForDownload */, update, canInstall }),
  Downloading: (update, explicit, overwrite, downloadedBytes, totalBytes, startTime) => ({ type: "downloading" /* Downloading */, update, explicit, overwrite, downloadedBytes, totalBytes, startTime }),
  Downloaded: (update, explicit, overwrite) => ({ type: "downloaded" /* Downloaded */, update, explicit, overwrite }),
  Updating: (update, explicit, currentProgress, maxProgress) => ({ type: "updating" /* Updating */, update, explicit, currentProgress, maxProgress }),
  Ready: (update, explicit, overwrite) => ({ type: "ready" /* Ready */, update, explicit, overwrite }),
  Overwriting: (update, explicit) => ({ type: "overwriting" /* Overwriting */, update, explicit }),
  Cancelling: upcast({ type: "cancelling" /* Cancelling */ }),
  Restarting: (update) => ({ type: "restarting" /* Restarting */, update })
};

var IUpdateService = createDecorator("updateService");
export { State3, IUpdateService };
