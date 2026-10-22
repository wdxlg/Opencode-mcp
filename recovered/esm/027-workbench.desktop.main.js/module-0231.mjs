// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/theme/common/colors/chartsColors.ts
import { registerColor, transparent } from "./module-0226.mjs";
import { foreground } from "./module-0227.mjs";
import { localize } from "./module-0001.mjs";
import { editorErrorForeground, editorInfoForeground, editorWarningForeground } from "./module-0229.mjs";
import { minimapFindMatch } from "./module-0230.mjs";


// src/vs/platform/theme/common/colors/chartsColors.ts
var chartsForeground = registerColor(
  "charts.foreground",
  foreground,
  localize(3326, null)
);

var chartsLines = registerColor(
  "charts.lines",
  transparent(foreground, 0.5),
  localize(3328, null)
);

var chartsRed = registerColor(
  "charts.red",
  editorErrorForeground,
  localize(3331, null)
);

var chartsBlue = registerColor(
  "charts.blue",
  editorInfoForeground,
  localize(3325, null)
);

var chartsYellow = registerColor(
  "charts.yellow",
  editorWarningForeground,
  localize(3332, null)
);

var chartsOrange = registerColor(
  "charts.orange",
  minimapFindMatch,
  localize(3329, null)
);

var chartsGreen = registerColor(
  "charts.green",
  { dark: "#89D185", light: "#388A34", hcDark: "#89D185", hcLight: "#374e06" },
  localize(3327, null)
);

var chartsPurple = registerColor(
  "charts.purple",
  { dark: "#B180D7", light: "#652D90", hcDark: "#B180D7", hcLight: "#652D90" },
  localize(3330, null)
);
export { chartsForeground, chartsLines, chartsRed, chartsBlue, chartsYellow, chartsOrange, chartsGreen, chartsPurple };
