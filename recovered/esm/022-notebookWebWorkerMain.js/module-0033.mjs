// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/notebook/common/services/notebookWebWorkerMain.js
// Original module marker: src/vs/base/common/date.ts
import { Lazy } from "./module-0017.mjs";
import { LANGUAGE_DEFAULT } from "./module-0011.mjs";


// src/vs/base/common/date.ts
var minute = 60;

var hour = minute * 60;

var day = hour * 24;

var week = day * 7;

var month = day * 30;

var year = day * 365;

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
export { minute, hour, day, week, month, year, safeIntl };
