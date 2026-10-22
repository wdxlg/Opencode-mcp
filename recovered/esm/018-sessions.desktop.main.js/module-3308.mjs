// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/markdown/common/markdownColors.ts
import { registerColor } from "./module-0226.mjs";
import { editorErrorForeground, editorInfoForeground, editorWarningForeground } from "./module-0229.mjs";
import { localize } from "./module-0001.mjs";
import { chartsGreen, chartsPurple } from "./module-0231.mjs";


// src/vs/workbench/contrib/markdown/common/markdownColors.ts
var markdownAlertNoteColor = registerColor(
  "markdownAlert.note.foreground",
  editorInfoForeground,
  localize(16618, null)
);

var markdownAlertTipColor = registerColor(
  "markdownAlert.tip.foreground",
  chartsGreen,
  localize(16619, null)
);

var markdownAlertImportantColor = registerColor(
  "markdownAlert.important.foreground",
  chartsPurple,
  localize(16617, null)
);

var markdownAlertWarningColor = registerColor(
  "markdownAlert.warning.foreground",
  editorWarningForeground,
  localize(16620, null)
);

var markdownAlertCautionColor = registerColor(
  "markdownAlert.caution.foreground",
  editorErrorForeground,
  localize(16616, null)
);
export { markdownAlertNoteColor, markdownAlertTipColor, markdownAlertImportantColor, markdownAlertWarningColor, markdownAlertCautionColor };
