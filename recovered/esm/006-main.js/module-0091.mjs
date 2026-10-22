// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/date.ts
import { __esm } from "./module-0000.mjs";
import { init_nls } from "./module-0005.mjs";
import { init_lazy } from "./module-0025.mjs";
import { init_platform } from "./module-0006.mjs";


// src/vs/base/common/date.ts
function toLocalISOString(date) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0") + "T" + String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0") + "." + (date.getMilliseconds() / 1e3).toFixed(3).slice(2, 5) + "Z";
}

var minute, hour, day, week, month, year;

var init_date = __esm({
  "src/vs/base/common/date.ts"() {
    init_nls();
    init_lazy();
    init_platform();
    minute = 60;
    hour = minute * 60;
    day = hour * 24;
    week = day * 7;
    month = day * 30;
    year = day * 365;
  }
});
export { toLocalISOString, minute, hour, day, week, month, year, init_date };
