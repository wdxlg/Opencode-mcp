// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/icons.ts
import { registerIcon, spinningLoading } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";
import { testStatesToIconColors, testStatesToRetiredIconColors, testingColorRunAction } from "./module-3038.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/workbench/contrib/testing/browser/icons.ts
var testingViewIcon = registerIcon("test-view-icon", Codicon.beaker, localize(21047, null));

var testingResultsIcon = registerIcon("test-results-icon", Codicon.checklist, localize(21034, null));

var testingRunIcon = registerIcon("testing-run-icon", Codicon.run, localize(21037, null));

var testingRerunIcon = registerIcon("testing-rerun-icon", Codicon.debugRerun, localize(21033, null));

var testingRunAllIcon = registerIcon("testing-run-all-icon", Codicon.runAll, localize(21035, null));

var testingDebugAllIcon = registerIcon("testing-debug-all-icon", Codicon.debugAltSmall, localize(21025, null));

var testingDebugIcon = registerIcon("testing-debug-icon", Codicon.debugAltSmall, localize(21026, null));

var testingCoverageIcon = registerIcon("testing-coverage-icon", Codicon.runCoverage, localize(21024, null));

var testingCoverageAllIcon = registerIcon("testing-coverage-all-icon", Codicon.runAllCoverage, localize(21036, null));

var testingCancelIcon = registerIcon("testing-cancel-icon", Codicon.debugStop, localize(21021, null));

var testingFilterIcon = registerIcon("testing-filter", Codicon.filter, localize(21019, null));

var testingHiddenIcon = registerIcon("testing-hidden", Codicon.eyeClosed, localize(21020, null));

var testingShowAsList = registerIcon("testing-show-as-list-icon", Codicon.listTree, localize(21038, null));

var testingShowAsTree = registerIcon("testing-show-as-list-icon", Codicon.listFlat, localize(21039, null));

var testingUpdateProfiles = registerIcon("testing-update-profiles", Codicon.gear, localize(21045, null));

var testingRefreshTests = registerIcon("testing-refresh-tests", Codicon.refresh, localize(21032, null));

var testingTurnContinuousRunOn = registerIcon("testing-turn-continuous-run-on", Codicon.eye, localize(21043, null));

var testingTurnContinuousRunOff = registerIcon("testing-turn-continuous-run-off", Codicon.eyeClosed, localize(21042, null));

var testingContinuousIsOn = registerIcon("testing-continuous-is-on", Codicon.eye, localize(21041, null));

var testingCancelRefreshTests = registerIcon("testing-cancel-refresh-tests", Codicon.stop, localize(21022, null));

var testingCoverageReport = registerIcon("testing-coverage", Codicon.coverage, localize(21023, null));

var testingWasCovered = registerIcon("testing-was-covered", Codicon.check, localize(21046, null));

var testingCoverageMissingBranch = registerIcon("testing-missing-branch", Codicon.question, localize(21029, null));

var testingStatesToIcons = /* @__PURE__ */ new Map([
  [6 /* Errored */, registerIcon("testing-error-icon", Codicon.issues, localize(21027, null))],
  [4 /* Failed */, registerIcon("testing-failed-icon", Codicon.error, localize(21028, null))],
  [3 /* Passed */, registerIcon("testing-passed-icon", Codicon.pass, localize(21030, null))],
  [1 /* Queued */, registerIcon("testing-queued-icon", Codicon.history, localize(21031, null))],
  [2 /* Running */, spinningLoading],
  [5 /* Skipped */, registerIcon("testing-skipped-icon", Codicon.debugStepOver, localize(21040, null))],
  [0 /* Unset */, registerIcon("testing-unset-icon", Codicon.circleOutline, localize(21044, null))]
]);

registerThemingParticipant((theme, collector) => {
  for (const [state, icon2] of testingStatesToIcons.entries()) {
    const color2 = testStatesToIconColors[state];
    const retiredColor = testStatesToRetiredIconColors[state];
    if (!color2) {
      continue;
    }
    collector.addRule(`.monaco-workbench ${ThemeIcon.asCSSSelector(icon2)} {
			color: ${theme.getColor(color2)} !important;
		}`);
    if (!retiredColor) {
      continue;
    }
    collector.addRule(`
			.test-explorer .computed-state.retired${ThemeIcon.asCSSSelector(icon2)},
			.testing-run-glyph.retired${ThemeIcon.asCSSSelector(icon2)}{
				color: ${theme.getColor(retiredColor)} !important;
			}
		`);
  }
  collector.addRule(`
		.monaco-editor .glyph-margin-widgets ${ThemeIcon.asCSSSelector(testingRunIcon)},
		.monaco-editor .glyph-margin-widgets ${ThemeIcon.asCSSSelector(testingRunAllIcon)},
		.monaco-editor .glyph-margin-widgets ${ThemeIcon.asCSSSelector(testingDebugIcon)},
		.monaco-editor .glyph-margin-widgets ${ThemeIcon.asCSSSelector(testingDebugAllIcon)} {
			color: ${theme.getColor(testingColorRunAction)};
		}
	`);
});
export { testingViewIcon, testingResultsIcon, testingRunIcon, testingRerunIcon, testingRunAllIcon, testingDebugAllIcon, testingDebugIcon, testingCoverageIcon, testingCoverageAllIcon, testingCancelIcon, testingFilterIcon, testingHiddenIcon, testingShowAsList, testingShowAsTree, testingUpdateProfiles, testingRefreshTests, testingTurnContinuousRunOn, testingTurnContinuousRunOff, testingContinuousIsOn, testingCancelRefreshTests, testingCoverageReport, testingWasCovered, testingCoverageMissingBranch, testingStatesToIcons };
