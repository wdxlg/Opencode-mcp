// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/constants.ts
import { localize } from "./module-0001.mjs";
import { stripIcons } from "./module-0461.mjs";


// src/vs/workbench/contrib/testing/common/constants.ts
var testStateNames = {
  [6 /* Errored */]: localize(21305, null),
  [4 /* Failed */]: localize(21306, null),
  [3 /* Passed */]: localize(21307, null),
  [1 /* Queued */]: localize(21308, null),
  [2 /* Running */]: localize(21309, null),
  [5 /* Skipped */]: localize(21310, null),
  [0 /* Unset */]: localize(21311, null)
};

var labelForTestInState = (label3, state) => localize(21304, null, stripIcons(label3), testStateNames[state]);

var testConfigurationGroupNames = {
  [4 /* Debug */]: localize(21302, null),
  [2 /* Run */]: localize(21303, null),
  [8 /* Coverage */]: localize(21301, null)
};
export { testStateNames, labelForTestInState, testConfigurationGroupNames };
