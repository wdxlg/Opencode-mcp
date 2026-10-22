// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/emergencyAlert/electron-browser/emergencyAlert.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { IntervalTimer } from "./module-0036.mjs";
import { mainWindow } from "./module-0002.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IRequestService, asJson } from "./module-0946.mjs";
import { arch, platform2 } from "./module-0015.mjs";
import { equals } from "./module-0007.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IBannerService } from "./module-1622.mjs";
import { IProductService } from "./module-0873.mjs";
import { ILogService } from "./module-0095.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/emergencyAlert/electron-browser/emergencyAlert.contribution.ts
var POLLING_INTERVAL = 60 * 60 * 1e3;

var BANNER_ID = "emergencyAlert.banner";

var EmergencyAlert = class extends Disposable {
  constructor(bannerService, requestService, productService, logService) {
    super();
    this.bannerService = bannerService;
    this.requestService = requestService;
    this.productService = productService;
    this.logService = logService;
    const emergencyAlertUrl = productService.emergencyAlertUrl;
    if (!emergencyAlertUrl) {
      return;
    }
    this.fetchAlerts(emergencyAlertUrl);
    const pollingTimer = this._register(new IntervalTimer());
    pollingTimer.cancelAndSet(() => this.fetchAlerts(emergencyAlertUrl), POLLING_INTERVAL, mainWindow);
  }
  static {
    this.ID = "workbench.contrib.emergencyAlert";
  }
  async fetchAlerts(url) {
    try {
      await this.doFetchAlerts(url);
    } catch (e) {
      this.logService.error(e);
    }
  }
  async doFetchAlerts(url) {
    const requestResult = await this.requestService.request({ type: "GET", url, disableCache: true, timeout: 2e4, callSite: "emergencyAlert.doFetchAlerts" }, CancellationToken.None);
    if (requestResult.res.statusCode !== 200) {
      throw new Error(`Failed to fetch emergency alerts: HTTP ${requestResult.res.statusCode}`);
    }
    const emergencyAlerts = await asJson(requestResult);
    if (!emergencyAlerts || !Array.isArray(emergencyAlerts.alerts)) {
      this.dismissAlert();
      return;
    }
    const matchingAlert = emergencyAlerts.alerts.find(
      (alert2) => alert2.commit === this.productService.commit && (!alert2.platform || alert2.platform === platform2) && (!alert2.arch || alert2.arch === arch)
    );
    if (!matchingAlert) {
      this.dismissAlert();
      return;
    }
    if (this.currentAlertMessage === matchingAlert.message && equals(this.currentAlertActions ?? [], matchingAlert.actions ?? [], (a, b) => a.label === b.label && a.href === b.href)) {
      return;
    }
    this.currentAlertMessage = matchingAlert.message;
    this.currentAlertActions = matchingAlert.actions;
    this.bannerService.show({
      id: BANNER_ID,
      icon: Codicon.warning,
      message: matchingAlert.message,
      actions: matchingAlert.actions
    });
  }
  dismissAlert() {
    if (this.currentAlertMessage !== void 0) {
      this.currentAlertMessage = void 0;
      this.currentAlertActions = void 0;
      this.bannerService.hide(BANNER_ID);
    }
  }
};

EmergencyAlert = __decorateClass([
  __decorateParam(0, IBannerService),
  __decorateParam(1, IRequestService),
  __decorateParam(2, IProductService),
  __decorateParam(3, ILogService)
], EmergencyAlert);

registerWorkbenchContribution2(EmergencyAlert.ID, EmergencyAlert, WorkbenchPhase.Eventually);
export { POLLING_INTERVAL, BANNER_ID, EmergencyAlert };
