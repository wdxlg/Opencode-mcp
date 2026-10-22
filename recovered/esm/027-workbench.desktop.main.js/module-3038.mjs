// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/theme.ts
import { opaque, registerColor, transparent } from "./module-0226.mjs";
import { listErrorForeground, listWarningForeground } from "./module-0232.mjs";
import { localize } from "./module-0001.mjs";
import { diffInserted, diffRemoved, editorBackground, editorErrorForeground, editorForeground, editorInfoForeground } from "./module-0229.mjs";
import { contrastBorder } from "./module-0227.mjs";
import { chartsGreen, chartsRed } from "./module-0231.mjs";
import { activityErrorBadgeBackground, activityErrorBadgeForeground, badgeBackground, badgeForeground } from "./module-0228.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";


// src/vs/workbench/contrib/testing/browser/theme.ts
var testingColorIconFailed = registerColor("testing.iconFailed", listErrorForeground, localize(21239, null));

var testingColorIconErrored = registerColor("testing.iconErrored", listErrorForeground, localize(21237, null));

var testingColorIconPassed = registerColor("testing.iconPassed", {
  dark: "#73c991",
  light: "#73c991",
  hcDark: "#73c991",
  hcLight: "#007100"
}, localize(21241, null));

var testingColorRunAction = registerColor("testing.runAction", testingColorIconPassed, localize(21258, null));

var testingColorIconQueued = registerColor("testing.iconQueued", listWarningForeground, localize(21243, null));

var testingColorIconUnset = registerColor("testing.iconUnset", "#848484", localize(21247, null));

var testingColorIconSkipped = registerColor("testing.iconSkipped", "#848484", localize(21245, null));

var testingPeekBorder = registerColor("testing.peekBorder", {
  dark: editorErrorForeground,
  light: editorErrorForeground,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(21257, null));

var testingMessagePeekBorder = registerColor("testing.messagePeekBorder", {
  dark: editorInfoForeground,
  light: editorInfoForeground,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(21255, null));

var testingPeekHeaderBackground = registerColor("testing.peekHeaderBackground", {
  dark: transparent(editorErrorForeground, 0.1),
  light: transparent(editorErrorForeground, 0.1),
  hcDark: null,
  hcLight: null
}, localize(21257, null));

var testingPeekMessageHeaderBackground = registerColor("testing.messagePeekHeaderBackground", {
  dark: transparent(editorInfoForeground, 0.1),
  light: transparent(editorInfoForeground, 0.1),
  hcDark: null,
  hcLight: null
}, localize(21256, null));

var testingCoveredBackground = registerColor("testing.coveredBackground", {
  dark: diffInserted,
  light: diffInserted,
  hcDark: null,
  hcLight: null
}, localize(21233, null));

var testingCoveredBorder = registerColor("testing.coveredBorder", {
  dark: transparent(testingCoveredBackground, 0.75),
  light: transparent(testingCoveredBackground, 0.75),
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(21234, null));

var testingCoveredGutterBackground = registerColor("testing.coveredGutterBackground", {
  dark: transparent(diffInserted, 0.6),
  light: transparent(diffInserted, 0.6),
  hcDark: chartsGreen,
  hcLight: chartsGreen
}, localize(21235, null));

var testingUncoveredBranchBackground = registerColor("testing.uncoveredBranchBackground", {
  dark: opaque(transparent(diffRemoved, 2), editorBackground),
  light: opaque(transparent(diffRemoved, 2), editorBackground),
  hcDark: null,
  hcLight: null
}, localize(21261, null));

var testingUncoveredBackground = registerColor("testing.uncoveredBackground", {
  dark: diffRemoved,
  light: diffRemoved,
  hcDark: null,
  hcLight: null
}, localize(21259, null));

var testingUncoveredBorder = registerColor("testing.uncoveredBorder", {
  dark: transparent(testingUncoveredBackground, 0.75),
  light: transparent(testingUncoveredBackground, 0.75),
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(21260, null));

var testingUncoveredGutterBackground = registerColor("testing.uncoveredGutterBackground", {
  dark: transparent(diffRemoved, 1.5),
  light: transparent(diffRemoved, 1.5),
  hcDark: chartsRed,
  hcLight: chartsRed
}, localize(21262, null));

var testingCoveredMinimapBackground = registerColor("testing.coveredMinimapBackground", {
  dark: transparent(diffInserted, 0.6),
  light: transparent(diffInserted, 0.6),
  hcDark: chartsGreen,
  hcLight: chartsGreen
}, localize(21236, null));

var testingUncoveredMinimapBackground = registerColor("testing.uncoveredMinimapBackground", {
  dark: transparent(diffRemoved, 1.5),
  light: transparent(diffRemoved, 1.5),
  hcDark: chartsRed,
  hcLight: chartsRed
}, localize(21263, null));

var testingCoverCountBadgeBackground = registerColor("testing.coverCountBadgeBackground", badgeBackground, localize(21231, null));

var testingCoverCountBadgeForeground = registerColor("testing.coverCountBadgeForeground", badgeForeground, localize(21232, null));

var messageBadgeBackground = registerColor(
  "testing.message.error.badgeBackground",
  activityErrorBadgeBackground,
  localize(21249, null)
);

registerColor(
  "testing.message.error.badgeBorder",
  messageBadgeBackground,
  localize(21250, null)
);

registerColor(
  "testing.message.error.badgeForeground",
  activityErrorBadgeForeground,
  localize(21251, null)
);

registerColor(
  "testing.message.error.lineBackground",
  null,
  localize(21252, null)
);

registerColor(
  "testing.message.info.decorationForeground",
  transparent(editorForeground, 0.5),
  localize(21253, null)
);

registerColor(
  "testing.message.info.lineBackground",
  null,
  localize(21254, null)
);

var testStatesToIconColors = {
  [6 /* Errored */]: testingColorIconErrored,
  [4 /* Failed */]: testingColorIconFailed,
  [3 /* Passed */]: testingColorIconPassed,
  [1 /* Queued */]: testingColorIconQueued,
  [0 /* Unset */]: testingColorIconUnset,
  [5 /* Skipped */]: testingColorIconSkipped
};

var testingRetiredColorIconErrored = registerColor("testing.iconErrored.retired", transparent(testingColorIconErrored, 0.7), localize(21238, null));

var testingRetiredColorIconFailed = registerColor("testing.iconFailed.retired", transparent(testingColorIconFailed, 0.7), localize(21240, null));

var testingRetiredColorIconPassed = registerColor("testing.iconPassed.retired", transparent(testingColorIconPassed, 0.7), localize(21242, null));

var testingRetiredColorIconQueued = registerColor("testing.iconQueued.retired", transparent(testingColorIconQueued, 0.7), localize(21244, null));

var testingRetiredColorIconUnset = registerColor("testing.iconUnset.retired", transparent(testingColorIconUnset, 0.7), localize(21248, null));

var testingRetiredColorIconSkipped = registerColor("testing.iconSkipped.retired", transparent(testingColorIconSkipped, 0.7), localize(21246, null));

var testStatesToRetiredIconColors = {
  [6 /* Errored */]: testingRetiredColorIconErrored,
  [4 /* Failed */]: testingRetiredColorIconFailed,
  [3 /* Passed */]: testingRetiredColorIconPassed,
  [1 /* Queued */]: testingRetiredColorIconQueued,
  [0 /* Unset */]: testingRetiredColorIconUnset,
  [5 /* Skipped */]: testingRetiredColorIconSkipped
};

registerThemingParticipant((theme, collector) => {
  const editorBg = theme.getColor(editorBackground);
  collector.addRule(`
	.coverage-deco-inline.coverage-deco-hit.coverage-deco-hovered {
		background: ${theme.getColor(testingCoveredBackground)?.transparent(1.3)};
		outline-color: ${theme.getColor(testingCoveredBorder)?.transparent(2)};
	}
	.coverage-deco-inline.coverage-deco-miss.coverage-deco-hovered {
		background: ${theme.getColor(testingUncoveredBackground)?.transparent(1.3)};
		outline-color: ${theme.getColor(testingUncoveredBorder)?.transparent(2)};
	}
		`);
  if (editorBg) {
    const missBadgeBackground = theme.getColor(testingUncoveredBackground)?.transparent(2).makeOpaque(editorBg);
    const errorBadgeBackground = theme.getColor(messageBadgeBackground)?.makeOpaque(editorBg);
    collector.addRule(`
			.coverage-deco-branch-miss-indicator::before {
				border-color: ${missBadgeBackground?.transparent(1.3)};
				background-color: ${missBadgeBackground};
			}
			.monaco-workbench .test-error-content-widget .inner{
				background: ${errorBadgeBackground};
			}
			.monaco-workbench .test-error-content-widget .inner .arrow svg {
				fill: ${errorBadgeBackground};
			}
		`);
  }
});
export { testingColorIconFailed, testingColorIconErrored, testingColorIconPassed, testingColorRunAction, testingColorIconQueued, testingColorIconUnset, testingColorIconSkipped, testingPeekBorder, testingMessagePeekBorder, testingPeekHeaderBackground, testingPeekMessageHeaderBackground, testingCoveredBackground, testingCoveredBorder, testingCoveredGutterBackground, testingUncoveredBranchBackground, testingUncoveredBackground, testingUncoveredBorder, testingUncoveredGutterBackground, testingCoveredMinimapBackground, testingUncoveredMinimapBackground, testingCoverCountBadgeBackground, testingCoverCountBadgeForeground, messageBadgeBackground, testStatesToIconColors, testingRetiredColorIconErrored, testingRetiredColorIconFailed, testingRetiredColorIconPassed, testingRetiredColorIconQueued, testingRetiredColorIconUnset, testingRetiredColorIconSkipped, testStatesToRetiredIconColors };
