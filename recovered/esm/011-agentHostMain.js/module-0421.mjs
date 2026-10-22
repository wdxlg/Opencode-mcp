// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/common/date.ts
import { Lazy } from "./module-0020.mjs";
import { LANGUAGE_DEFAULT } from "./module-0013.mjs";


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
  DateTimeFormat(locales, options) {
    return new Lazy(() => {
      try {
        return new Intl.DateTimeFormat(locales, options);
      } catch {
        return new Intl.DateTimeFormat(void 0, options);
      }
    });
  },
  Collator(locales, options) {
    return new Lazy(() => {
      try {
        return new Intl.Collator(locales, options);
      } catch {
        return new Intl.Collator(void 0, options);
      }
    });
  },
  Segmenter(locales, options) {
    return new Lazy(() => {
      try {
        return new Intl.Segmenter(locales, options);
      } catch {
        return new Intl.Segmenter(void 0, options);
      }
    });
  },
  Locale(tag, options) {
    return new Lazy(() => {
      try {
        return new Intl.Locale(tag, options);
      } catch {
        return new Intl.Locale(LANGUAGE_DEFAULT, options);
      }
    });
  },
  NumberFormat(locales, options) {
    return new Lazy(() => {
      try {
        return new Intl.NumberFormat(locales, options);
      } catch {
        return new Intl.NumberFormat(void 0, options);
      }
    });
  }
};
export { toLocalISOString, minute, hour, day, week, month, year, safeIntl };
