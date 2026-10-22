// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/meteredConnection/browser/meteredConnectionStatus.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMeteredConnectionService } from "./module-1021.mjs";
import { IStatusbarService } from "./module-0893.mjs";


// src/vs/workbench/contrib/meteredConnection/browser/meteredConnectionStatus.ts
var MeteredConnectionStatusContribution = class extends Disposable {
  constructor(meteredConnectionService, statusbarService) {
    super();
    this.meteredConnectionService = meteredConnectionService;
    this.statusbarService = statusbarService;
    this.statusBarEntry = this._register(new MutableDisposable());
    this.updateStatusBarEntry(this.meteredConnectionService.isConnectionMetered);
    this._register(this.meteredConnectionService.onDidChangeIsConnectionMetered((isMetered) => {
      this.updateStatusBarEntry(isMetered);
    }));
  }
  static {
    this.ID = "workbench.contrib.meteredConnectionStatus";
  }
  updateStatusBarEntry(isMetered) {
    if (isMetered) {
      if (!this.statusBarEntry.value) {
        this.statusBarEntry.value = this.statusbarService.addEntry(
          this.getStatusBarEntry(),
          MeteredConnectionStatusContribution.ID,
          1 /* RIGHT */,
          -Number.MAX_VALUE
          // Show at the far right
        );
      }
    } else {
      this.statusBarEntry.clear();
    }
  }
  getStatusBarEntry() {
    return {
      name: localize(17363, null),
      text: "$(radio-tower)",
      ariaLabel: localize(17364, null),
      tooltip: localize(17366, null),
      kind: "warning",
      command: {
        id: "workbench.action.configureMeteredConnection",
        title: localize(17365, null)
      },
      showInAllWindows: true
    };
  }
};

MeteredConnectionStatusContribution = __decorateClass([
  __decorateParam(0, IMeteredConnectionService),
  __decorateParam(1, IStatusbarService)
], MeteredConnectionStatusContribution);
export { MeteredConnectionStatusContribution };
