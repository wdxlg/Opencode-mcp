// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/date.ts
import { localize } from "./module-0001.mjs";
import { Lazy } from "./module-0028.mjs";
import { LANGUAGE_DEFAULT } from "./module-0014.mjs";


// src/vs/base/common/date.ts
var minute = 60;

var hour = minute * 60;

var day = hour * 24;

var week = day * 7;

var month = day * 30;

var year = day * 365;

function fromNow(date, appendAgoLabel, useFullTimeWords, disallowNow) {
  if (typeof date === "undefined") {
    return localize(85, null);
  }
  if (typeof date !== "number") {
    date = date.getTime();
  }
  const seconds = Math.round(((/* @__PURE__ */ new Date()).getTime() - date) / 1e3);
  if (seconds < -30) {
    return localize(59, null, fromNow((/* @__PURE__ */ new Date()).getTime() + seconds * 1e3, false));
  }
  if (!disallowNow && seconds < 30) {
    return localize(76, null);
  }
  let value2;
  if (seconds < minute) {
    value2 = seconds;
    if (appendAgoLabel) {
      if (value2 === 1) {
        return useFullTimeWords ? localize(83, null, value2) : localize(82, null, value2);
      } else {
        return useFullTimeWords ? localize(79, null, value2) : localize(78, null, value2);
      }
    } else {
      if (value2 === 1) {
        return useFullTimeWords ? localize(84, null, value2) : localize(81, null, value2);
      } else {
        return useFullTimeWords ? localize(80, null, value2) : localize(77, null, value2);
      }
    }
  }
  if (seconds < hour) {
    value2 = Math.round(seconds / minute);
    if (appendAgoLabel) {
      if (value2 === 1) {
        return useFullTimeWords ? localize(66, null, value2) : localize(65, null, value2);
      } else {
        return useFullTimeWords ? localize(62, null, value2) : localize(61, null, value2);
      }
    } else {
      if (value2 === 1) {
        return useFullTimeWords ? localize(67, null, value2) : localize(64, null, value2);
      } else {
        return useFullTimeWords ? localize(63, null, value2) : localize(60, null, value2);
      }
    }
  }
  if (seconds < day) {
    value2 = Math.round(seconds / hour);
    if (appendAgoLabel) {
      if (value2 === 1) {
        return useFullTimeWords ? localize(57, null, value2) : localize(56, null, value2);
      } else {
        return useFullTimeWords ? localize(53, null, value2) : localize(52, null, value2);
      }
    } else {
      if (value2 === 1) {
        return useFullTimeWords ? localize(58, null, value2) : localize(55, null, value2);
      } else {
        return useFullTimeWords ? localize(54, null, value2) : localize(51, null, value2);
      }
    }
  }
  if (seconds < week) {
    value2 = Math.round(seconds / day);
    if (appendAgoLabel) {
      return value2 === 1 ? localize(50, null, value2) : localize(48, null, value2);
    } else {
      return value2 === 1 ? localize(49, null, value2) : localize(47, null, value2);
    }
  }
  if (seconds < month) {
    value2 = Math.round(seconds / week);
    if (appendAgoLabel) {
      if (value2 === 1) {
        return useFullTimeWords ? localize(92, null, value2) : localize(91, null, value2);
      } else {
        return useFullTimeWords ? localize(88, null, value2) : localize(87, null, value2);
      }
    } else {
      if (value2 === 1) {
        return useFullTimeWords ? localize(93, null, value2) : localize(90, null, value2);
      } else {
        return useFullTimeWords ? localize(89, null, value2) : localize(86, null, value2);
      }
    }
  }
  if (seconds < year) {
    value2 = Math.round(seconds / month);
    if (appendAgoLabel) {
      if (value2 === 1) {
        return useFullTimeWords ? localize(74, null, value2) : localize(73, null, value2);
      } else {
        return useFullTimeWords ? localize(70, null, value2) : localize(69, null, value2);
      }
    } else {
      if (value2 === 1) {
        return useFullTimeWords ? localize(75, null, value2) : localize(72, null, value2);
      } else {
        return useFullTimeWords ? localize(71, null, value2) : localize(68, null, value2);
      }
    }
  }
  value2 = Math.round(seconds / year);
  if (appendAgoLabel) {
    if (value2 === 1) {
      return useFullTimeWords ? localize(100, null, value2) : localize(99, null, value2);
    } else {
      return useFullTimeWords ? localize(96, null, value2) : localize(95, null, value2);
    }
  } else {
    if (value2 === 1) {
      return useFullTimeWords ? localize(101, null, value2) : localize(98, null, value2);
    } else {
      return useFullTimeWords ? localize(97, null, value2) : localize(94, null, value2);
    }
  }
}

function getDurationString(ms, useFullTimeWords) {
  const seconds = Math.abs(ms / 1e3);
  if (seconds < 1) {
    return useFullTimeWords ? localize(108, null, ms) : localize(107, null, ms);
  }
  if (seconds < minute) {
    return useFullTimeWords ? localize(110, null, Math.round(ms) / 1e3) : localize(109, null, Math.round(ms) / 1e3);
  }
  if (seconds < hour) {
    return useFullTimeWords ? localize(106, null, Math.round(ms / (1e3 * minute))) : localize(105, null, Math.round(ms / (1e3 * minute)));
  }
  if (seconds < day) {
    return useFullTimeWords ? localize(104, null, Math.round(ms / (1e3 * hour))) : localize(103, null, Math.round(ms / (1e3 * hour)));
  }
  return localize(102, null, Math.round(ms / (1e3 * day)));
}

function toLocalISOString(date) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0") + "T" + String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0") + "." + (date.getMilliseconds() / 1e3).toFixed(3).slice(2, 5) + "Z";
}

var safeIntl = {
  DateTimeFormat(locales, options3) {
    return new Lazy(() => {
      try {
        return new Intl.DateTimeFormat(locales, options3);
      } catch {
        return new Intl.DateTimeFormat(void 0, options3);
      }
    });
  },
  Collator(locales, options3) {
    return new Lazy(() => {
      try {
        return new Intl.Collator(locales, options3);
      } catch {
        return new Intl.Collator(void 0, options3);
      }
    });
  },
  Segmenter(locales, options3) {
    return new Lazy(() => {
      try {
        return new Intl.Segmenter(locales, options3);
      } catch {
        return new Intl.Segmenter(void 0, options3);
      }
    });
  },
  Locale(tag2, options3) {
    return new Lazy(() => {
      try {
        return new Intl.Locale(tag2, options3);
      } catch {
        return new Intl.Locale(LANGUAGE_DEFAULT, options3);
      }
    });
  },
  NumberFormat(locales, options3) {
    return new Lazy(() => {
      try {
        return new Intl.NumberFormat(locales, options3);
      } catch {
        return new Intl.NumberFormat(void 0, options3);
      }
    });
  }
};
export { fromNow, getDurationString, toLocalISOString, minute, hour, day, week, month, year, safeIntl };
