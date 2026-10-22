// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/update/electron-main/notAvailableUpdateDialog.ts
import { __esm } from "./module-0000.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { init_platform, isMacintosh } from "./module-0006.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { init_update } from "./module-0201.mjs";


// src/vs/platform/update/electron-main/notAvailableUpdateDialog.ts
var NotAvailableUpdateDialog;

var init_notAvailableUpdateDialog = __esm({
  "src/vs/platform/update/electron-main/notAvailableUpdateDialog.ts"() {
    init_lifecycle();
    init_platform();
    init_nls();
    init_update();
    NotAvailableUpdateDialog = class extends Disposable {
      constructor(updateService, dialogMainService, windowsMainService) {
        super();
        this._register(updateService.onStateChange((state) => {
          if (state.type !== "idle" /* Idle */ || !state.notAvailable || state.error) {
            return;
          }
          if (!isMacintosh || windowsMainService.getWindowCount() > 0) {
            return;
          }
          dialogMainService.showMessageBox({
            type: "info",
            message: localize(3677, null)
          });
        }));
      }
    };
  }
});
export { NotAvailableUpdateDialog, init_notAvailableUpdateDialog };
