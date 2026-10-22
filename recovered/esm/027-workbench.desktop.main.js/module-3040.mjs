// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/testCoverageBars.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Lazy } from "./module-0028.mjs";
import { h } from "./module-0075.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { getTestingConfiguration, observeTestingConfiguration } from "./module-3023.mjs";
import { calculateDisplayedStat, displayPercent, getCoverageColor, percent } from "./module-3037.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHoverService } from "./module-0520.mjs";
import { safeIntl } from "./module-0120.mjs";
import { localize } from "./module-0001.mjs";
import { isDefined } from "./module-0010.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { observableValue } from "./module-0048.mjs";
import { autorun } from "./module-0052.mjs";
import { Registry } from "./module-0090.mjs";
import { ITestCoverageService } from "./module-3024.mjs";


// src/vs/workbench/contrib/testing/browser/testCoverageBars.ts
var ManagedTestCoverageBars = class extends Disposable {
  constructor(options3, configurationService, hoverService) {
    super();
    this.options = options3;
    this.configurationService = configurationService;
    this.hoverService = hoverService;
    this.el = new Lazy(() => {
      if (this.options.compact) {
        const el = h(".test-coverage-bars.compact", [
          h(".tpc@overall"),
          h(".bar@tpcBar")
        ]);
        this.attachHover(el.tpcBar, getOverallHoverText);
        return el;
      } else {
        const el = h(".test-coverage-bars", [
          h(".tpc@overall"),
          h(".bar@statement"),
          h(".bar@function"),
          h(".bar@branch")
        ]);
        this.attachHover(el.statement, stmtCoverageText);
        this.attachHover(el.function, fnCoverageText);
        this.attachHover(el.branch, branchCoverageText);
        return el;
      }
    });
    this.visibleStore = this._register(new DisposableStore());
    this.customHovers = [];
  }
  /** Gets whether coverage is currently visible for the resource. */
  get visible() {
    return !!this._coverage;
  }
  attachHover(target, factory) {
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), target, () => this._coverage && factory(this._coverage)));
  }
  setCoverageInfo(coverage) {
    const ds = this.visibleStore;
    if (!coverage) {
      if (this._coverage) {
        this._coverage = void 0;
        this.customHovers.forEach((c) => c.hide());
        ds.clear();
      }
      return;
    }
    if (!this._coverage) {
      const root = this.el.value.root;
      ds.add(toDisposable(() => root.remove()));
      this.options.container.appendChild(root);
      ds.add(this.configurationService.onDidChangeConfiguration((c) => {
        if (!this._coverage) {
          return;
        }
        if (c.affectsConfiguration("testing.displayedCoveragePercent" /* CoveragePercent */) || c.affectsConfiguration("testing.coverageBarThresholds" /* CoverageBarThresholds */)) {
          this.doRender(this._coverage);
        }
      }));
    }
    this._coverage = coverage;
    this.doRender(coverage);
  }
  doRender(coverage) {
    const el = this.el.value;
    const precision = this.options.compact ? 0 : 2;
    const thresholds = getTestingConfiguration(this.configurationService, "testing.coverageBarThresholds" /* CoverageBarThresholds */);
    const overallStat = calculateDisplayedStat(coverage, getTestingConfiguration(this.configurationService, "testing.displayedCoveragePercent" /* CoveragePercent */));
    if (this.options.overall !== false) {
      el.overall.textContent = displayPercent(overallStat, precision);
    } else {
      el.overall.style.display = "none";
    }
    if ("tpcBar" in el) {
      renderBar(el.tpcBar, overallStat, false, thresholds);
    } else {
      renderBar(el.statement, percent(coverage.statement), coverage.statement.total === 0, thresholds);
      renderBar(el.function, coverage.declaration && percent(coverage.declaration), coverage.declaration?.total === 0, thresholds);
      renderBar(el.branch, coverage.branch && percent(coverage.branch), coverage.branch?.total === 0, thresholds);
    }
  }
};

ManagedTestCoverageBars = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IHoverService)
], ManagedTestCoverageBars);

var barWidth = 16;

var renderBar = (bar, pct2, isZero, thresholds) => {
  if (pct2 === void 0) {
    bar.style.display = "none";
    return;
  }
  bar.style.display = "block";
  bar.style.width = `${barWidth}px`;
  bar.style.setProperty("--test-bar-width", `${Math.floor(pct2 * 16)}px`);
  if (isZero) {
    bar.style.color = "currentColor";
    bar.style.opacity = "0.5";
    return;
  }
  bar.style.color = getCoverageColor(pct2, thresholds);
  bar.style.opacity = "1";
};

var nf = safeIntl.NumberFormat();

var stmtCoverageText = (coverage) => localize(21050, null, nf.value.format(coverage.statement.covered), nf.value.format(coverage.statement.total), displayPercent(percent(coverage.statement)));

var fnCoverageText = (coverage) => coverage.declaration && localize(21049, null, nf.value.format(coverage.declaration.covered), nf.value.format(coverage.declaration.total), displayPercent(percent(coverage.declaration)));

var branchCoverageText = (coverage) => coverage.branch && localize(21048, null, nf.value.format(coverage.branch.covered), nf.value.format(coverage.branch.total), displayPercent(percent(coverage.branch)));

var getOverallHoverText = (coverage) => {
  const str = [
    stmtCoverageText(coverage),
    fnCoverageText(coverage),
    branchCoverageText(coverage)
  ].filter(isDefined).join("\n\n");
  return {
    markdown: new MarkdownString().appendText(str),
    markdownNotSupportedFallback: str
  };
};

var ExplorerTestCoverageBars = class extends ManagedTestCoverageBars {
  constructor(options3, configurationService, hoverService, testCoverageService) {
    super(options3, configurationService, hoverService);
    this.resource = observableValue(this, void 0);
    const isEnabled = observeTestingConfiguration(configurationService, "testing.showCoverageInExplorer" /* ShowCoverageInExplorer */);
    this._register(autorun(async (reader) => {
      let info;
      const coverage = testCoverageService.selected.read(reader);
      if (coverage && isEnabled.read(reader)) {
        const resource = this.resource.read(reader);
        if (resource) {
          info = coverage.getComputedForUri(resource);
        }
      }
      this.setCoverageInfo(info);
    }));
  }
  static {
    this.hasRegistered = false;
  }
  static register() {
    if (this.hasRegistered) {
      return;
    }
    this.hasRegistered = true;
    Registry.as("workbench.registry.explorer.fileContributions" /* FileContributionRegistry */).register({
      create(insta, container3) {
        return insta.createInstance(
          ExplorerTestCoverageBars,
          { compact: true, container: container3 }
        );
      }
    });
  }
  /** @inheritdoc */
  setResource(resource, transaction2) {
    this.resource.set(resource, transaction2);
  }
  setCoverageInfo(coverage) {
    super.setCoverageInfo(coverage);
    this.options.container?.classList.toggle("explorer-item-with-test-coverage", this.visible);
  }
};

ExplorerTestCoverageBars = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IHoverService),
  __decorateParam(3, ITestCoverageService)
], ExplorerTestCoverageBars);
export { ManagedTestCoverageBars, barWidth, renderBar, nf, stmtCoverageText, fnCoverageText, branchCoverageText, getOverallHoverText, ExplorerTestCoverageBars };
