// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/testingProgressUiService.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { ExplorerTestCoverageBars } from "./module-3040.mjs";
import { getTestingConfiguration } from "./module-3023.mjs";
import { isFailedState } from "./module-1430.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITestResultService } from "./module-1434.mjs";
import { ITestCoverageService } from "./module-3024.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IViewsService } from "./module-1246.mjs";


// src/vs/workbench/contrib/testing/browser/testingProgressUiService.ts
var TestingProgressTrigger = class extends Disposable {
  constructor(resultService, testCoverageService, configurationService, viewsService) {
    super();
    this.configurationService = configurationService;
    this.viewsService = viewsService;
    this._register(resultService.onResultsChanged((e) => {
      if ("started" in e) {
        this.attachAutoOpenForNewResults(e.started);
      }
    }));
    const barContributionRegistration = autorun((reader) => {
      const hasCoverage = !!testCoverageService.selected.read(reader);
      if (!hasCoverage) {
        return;
      }
      barContributionRegistration.dispose();
      ExplorerTestCoverageBars.register();
    });
    this._register(barContributionRegistration);
  }
  static {
    this.ID = "workbench.contrib.testing.progressTrigger";
  }
  attachAutoOpenForNewResults(result) {
    if (result.request.preserveFocus === true) {
      return;
    }
    const cfg = getTestingConfiguration(this.configurationService, "testing.automaticallyOpenTestResults" /* OpenResults */);
    if (cfg === "neverOpen" /* NeverOpen */) {
      return;
    }
    if (cfg === "openExplorerOnTestStart" /* OpenExplorerOnTestStart */) {
      return this.openExplorerView();
    }
    if (cfg === "openOnTestStart" /* OpenOnTestStart */) {
      return this.openResultsView();
    }
    const disposable = new DisposableStore();
    disposable.add(result.onComplete(() => disposable.dispose()));
    disposable.add(result.onChange((e) => {
      if (e.reason === 1 /* OwnStateChange */ && isFailedState(e.item.ownComputedState)) {
        this.openResultsView();
        disposable.dispose();
      }
    }));
  }
  openExplorerView() {
    this.viewsService.openView("workbench.view.testing" /* ExplorerViewId */, false);
  }
  openResultsView() {
    this.viewsService.openView("workbench.panel.testResults.view" /* ResultsViewId */, false);
  }
};

TestingProgressTrigger = __decorateClass([
  __decorateParam(0, ITestResultService),
  __decorateParam(1, ITestCoverageService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IViewsService)
], TestingProgressTrigger);
export { TestingProgressTrigger };
