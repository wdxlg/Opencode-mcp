// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/configuration.ts
import { localize } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions14 } from "./module-1112.mjs";
import { observableFromEvent } from "./module-0057.mjs";


// src/vs/workbench/contrib/testing/common/configuration.ts
var testingConfiguration = {
  id: "testing",
  order: 21,
  title: localize(21264, null),
  type: "object",
  properties: {
    ["testing.automaticallyOpenPeekView" /* AutoOpenPeekView */]: {
      description: localize(21266, null),
      enum: [
        "failureAnywhere" /* FailureAnywhere */,
        "failureInVisibleDocument" /* FailureVisible */,
        "never" /* Never */
      ],
      default: "never" /* Never */,
      enumDescriptions: [
        localize(21267, null),
        localize(21268, null),
        localize(21269, null)
      ]
    },
    ["testing.showAllMessages" /* ShowAllMessages */]: {
      description: localize(21299, null),
      type: "boolean",
      default: false
    },
    ["testing.automaticallyOpenPeekViewDuringAutoRun" /* AutoOpenPeekViewDuringContinuousRun */]: {
      description: localize(21270, null),
      type: "boolean",
      default: false
    },
    ["testing.countBadge" /* CountBadge */]: {
      description: localize(21271, null),
      enum: [
        "failed" /* Failed */,
        "off" /* Off */,
        "passed" /* Passed */,
        "skipped" /* Skipped */
      ],
      enumDescriptions: [
        localize(21272, null),
        localize(21273, null),
        localize(21274, null),
        localize(21275, null)
      ],
      default: "failed" /* Failed */
    },
    ["testing.followRunningTest" /* FollowRunningTest */]: {
      description: localize(21288, null),
      type: "boolean",
      default: false
    },
    ["testing.defaultGutterClickAction" /* DefaultGutterClickAction */]: {
      description: localize(21279, null),
      enum: [
        "run" /* Run */,
        "debug" /* Debug */,
        "runWithCoverage" /* Coverage */,
        "contextMenu" /* ContextMenu */
      ],
      enumDescriptions: [
        localize(21283, null),
        localize(21282, null),
        localize(21281, null),
        localize(21280, null)
      ],
      default: "run" /* Run */
    },
    ["testing.gutterEnabled" /* GutterEnabled */]: {
      description: localize(21289, null),
      type: "boolean",
      default: true
    },
    ["testing.saveBeforeTest" /* SaveBeforeTest */]: {
      description: localize(21298, null),
      type: "boolean",
      default: true
    },
    ["testing.automaticallyOpenTestResults" /* OpenResults */]: {
      enum: [
        "neverOpen" /* NeverOpen */,
        "openOnTestStart" /* OpenOnTestStart */,
        "openOnTestFailure" /* OpenOnTestFailure */,
        "openExplorerOnTestStart" /* OpenExplorerOnTestStart */
      ],
      enumDescriptions: [
        localize(21291, null),
        localize(21294, null),
        localize(21293, null),
        localize(21292, null)
      ],
      default: "openOnTestStart",
      description: localize(21290, null)
    },
    ["testing.alwaysRevealTestOnStateChange" /* AlwaysRevealTestOnStateChange */]: {
      markdownDescription: localize(21265, null, "`#testing.followRunningTest#`"),
      type: "boolean",
      default: false
    },
    ["testing.showCoverageInExplorer" /* ShowCoverageInExplorer */]: {
      description: localize(21300, null),
      type: "boolean",
      default: true
    },
    ["testing.displayedCoveragePercent" /* CoveragePercent */]: {
      markdownDescription: localize(21284, null),
      default: "totalCoverage" /* TotalCoverage */,
      enum: [
        "totalCoverage" /* TotalCoverage */,
        "statement" /* Statement */,
        "minimum" /* Minimum */
      ],
      enumDescriptions: [
        localize(21287, null),
        localize(21286, null),
        localize(21285, null)
      ]
    },
    ["testing.coverageBarThresholds" /* CoverageBarThresholds */]: {
      markdownDescription: localize(21276, null),
      default: { red: 0, yellow: 60, green: 90 },
      properties: {
        red: { type: "number", minimum: 0, maximum: 100, default: 0 },
        yellow: { type: "number", minimum: 0, maximum: 100, default: 60 },
        green: { type: "number", minimum: 0, maximum: 100, default: 90 }
      }
    },
    ["testing.coverageToolbarEnabled" /* CoverageToolbarEnabled */]: {
      description: localize(21278, null),
      type: "boolean",
      default: false
      // todo@connor4312: disabled by default until UI sync
    },
    ["testing.coverageMinimapEnabled" /* CoverageMinimapEnabled */]: {
      description: localize(21277, null),
      type: "boolean",
      default: true
    },
    ["testing.resultsView.layout" /* ResultsViewLayout */]: {
      description: localize(21295, null),
      enum: [
        "treeRight" /* TreeRight */,
        "treeLeft" /* TreeLeft */
      ],
      enumDescriptions: [
        localize(21297, null),
        localize(21296, null)
      ],
      default: "treeRight" /* TreeRight */
    }
  }
};

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "testing.openTesting",
  migrateFn: (value2) => {
    return [["testing.automaticallyOpenTestResults" /* OpenResults */, { value: value2 }]];
  }
}]);

var getTestingConfiguration = (config, key3) => config.getValue(key3);

var observeTestingConfiguration = (config, key3) => observableFromEvent(config.onDidChangeConfiguration, () => getTestingConfiguration(config, key3));
export { testingConfiguration, getTestingConfiguration, observeTestingConfiguration };
