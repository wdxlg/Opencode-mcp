// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testCoverageService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { bindContextKey, observableConfigValue } from "./module-0444.mjs";
import { TestingContextKeys } from "./module-1428.mjs";
import { Iterable } from "./module-0011.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { transaction } from "./module-0045.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ITestResultService } from "./module-1434.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IViewsService } from "./module-1246.mjs";


// src/vs/workbench/contrib/testing/common/testCoverageService.ts
var ITestCoverageService = createDecorator("testCoverageService");

var TestCoverageService = class extends Disposable {
  constructor(contextKeyService, resultService, configService, viewsService) {
    super();
    this.viewsService = viewsService;
    this.lastOpenCts = this._register(new MutableDisposable());
    this.selected = observableValue("testCoverage", void 0);
    this.filterToTest = observableValue("filterToTest", void 0);
    this.showInline = observableValue("inlineCoverage", false);
    const toolbarConfig = observableConfigValue("testing.coverageToolbarEnabled" /* CoverageToolbarEnabled */, true, configService);
    this._register(bindContextKey(
      TestingContextKeys.coverageToolbarEnabled,
      contextKeyService,
      (reader) => toolbarConfig.read(reader)
    ));
    this._register(bindContextKey(
      TestingContextKeys.inlineCoverageEnabled,
      contextKeyService,
      (reader) => this.showInline.read(reader)
    ));
    this._register(bindContextKey(
      TestingContextKeys.isTestCoverageOpen,
      contextKeyService,
      (reader) => !!this.selected.read(reader)
    ));
    this._register(bindContextKey(
      TestingContextKeys.hasPerTestCoverage,
      contextKeyService,
      (reader) => !Iterable.isEmpty(this.selected.read(reader)?.allPerTestIDs())
    ));
    this._register(bindContextKey(
      TestingContextKeys.isCoverageFilteredToTest,
      contextKeyService,
      (reader) => !!this.filterToTest.read(reader)
    ));
    this._register(resultService.onResultsChanged((evt) => {
      if ("completed" in evt) {
        const coverage = evt.completed.tasks.find((t2) => t2.coverage.get());
        if (coverage) {
          this.openCoverage(coverage, false);
        } else {
          this.closeCoverage();
        }
      } else if ("removed" in evt && this.selected.get()) {
        const taskId = this.selected.get()?.fromTaskId;
        if (evt.removed.some((e) => e.tasks.some((t2) => t2.id === taskId))) {
          this.closeCoverage();
        }
      }
    }));
  }
  /** @inheritdoc */
  async openCoverage(task, focus = true) {
    this.lastOpenCts.value?.cancel();
    const cts = this.lastOpenCts.value = new CancellationTokenSource();
    const coverage = task.coverage.get();
    if (!coverage) {
      return;
    }
    transaction((tx) => {
      this.filterToTest.set(void 0, tx);
      this.selected.set(coverage, tx);
    });
    if (focus && !cts.token.isCancellationRequested) {
      this.viewsService.openView("workbench.view.testCoverage" /* CoverageViewId */, true);
    }
  }
  /** @inheritdoc */
  closeCoverage() {
    this.selected.set(void 0, void 0);
  }
};

TestCoverageService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ITestResultService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IViewsService)
], TestCoverageService);
export { ITestCoverageService, TestCoverageService };
