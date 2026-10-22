// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/date.ts
import { Lazy } from "./module-0001.mjs";
import { LANGUAGE_DEFAULT } from "./module-0016.mjs";


// src/vs/base/common/date.ts
var minute = 60;

var hour = minute * 60;

var day = hour * 24;

var week = day * 7;

var month = day * 30;

var year = day * 365;

function toLocalISOString(date) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0") + "T" + String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0") + "." + (date.getMilliseconds() / 1e3).toFixed(3).slice(2, 5) + "Z";
}

var safeIntl = {
  DateTimeFormat(locales, options2) {
    return new Lazy(() => {
      try {
        return new Intl.DateTimeFormat(locales, options2);
      } catch {
        return new Intl.DateTimeFormat(void 0, options2);
      }
    });
  },
  Collator(locales, options2) {
    return new Lazy(() => {
      try {
        return new Intl.Collator(locales, options2);
      } catch {
        return new Intl.Collator(void 0, options2);
      }
    });
  },
  Segmenter(locales, options2) {
    return new Lazy(() => {
      try {
        return new Intl.Segmenter(locales, options2);
      } catch {
        return new Intl.Segmenter(void 0, options2);
      }
    });
  },
  Locale(tag2, options2) {
    return new Lazy(() => {
      try {
        return new Intl.Locale(tag2, options2);
      } catch {
        return new Intl.Locale(LANGUAGE_DEFAULT, options2);
      }
    });
  },
  NumberFormat(locales, options2) {
    return new Lazy(() => {
      try {
        return new Intl.NumberFormat(locales, options2);
      } catch {
        return new Intl.NumberFormat(void 0, options2);
      }
    });
  }
};
export { toLocalISOString, minute, hour, day, week, month, year, safeIntl };
