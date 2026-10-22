// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/localHistory/browser/localHistory.ts
import { safeIntl } from "./module-0120.mjs";
import { language } from "./module-0014.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/localHistory/browser/localHistory.ts
var localHistoryDateFormatter = void 0;

function getLocalHistoryDateFormatter() {
  if (!localHistoryDateFormatter) {
    const options3 = { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" };
    const formatter = safeIntl.DateTimeFormat(language, options3).value;
    localHistoryDateFormatter = {
      format: (date) => formatter.format(date)
    };
  }
  return localHistoryDateFormatter;
}

var LOCAL_HISTORY_MENU_CONTEXT_VALUE = "localHistory:item";

var LOCAL_HISTORY_MENU_CONTEXT_KEY = ContextKeyExpr.equals("timelineItem", LOCAL_HISTORY_MENU_CONTEXT_VALUE);

var LOCAL_HISTORY_ICON_ENTRY = registerIcon("localHistory-icon", Codicon.circleOutline, localize(16520, null));

var LOCAL_HISTORY_ICON_RESTORE = registerIcon("localHistory-restore", Codicon.check, localize(16521, null));
export { getLocalHistoryDateFormatter, localHistoryDateFormatter, LOCAL_HISTORY_MENU_CONTEXT_VALUE, LOCAL_HISTORY_MENU_CONTEXT_KEY, LOCAL_HISTORY_ICON_ENTRY, LOCAL_HISTORY_ICON_RESTORE };
