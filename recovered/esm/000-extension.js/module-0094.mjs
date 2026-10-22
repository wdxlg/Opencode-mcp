// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: node_modules/zod/v4/classic/iso.js
import { __export, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { $constructor } from "./module-0078.mjs";
import { $ZodISODate, $ZodISODateTime, $ZodISODuration, $ZodISOTime } from "./module-0082.mjs";
import { ZodStringFormat } from "./module-0092.mjs";
import { _isoDate, _isoDateTime, _isoDuration, _isoTime } from "./module-0089.mjs";


// node_modules/zod/v4/classic/iso.js
var iso_exports = {};

__export(iso_exports, {
  ZodISODate: () => ZodISODate,
  ZodISODateTime: () => ZodISODateTime,
  ZodISODuration: () => ZodISODuration,
  ZodISOTime: () => ZodISOTime,
  date: () => date2,
  datetime: () => datetime2,
  duration: () => duration2,
  time: () => time2
});

init_define_OPENCODE_BUILD_INFO();

var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
  $ZodISODateTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});

function datetime2(params) {
  return _isoDateTime(ZodISODateTime, params);
}

var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
  $ZodISODate.init(inst, def);
  ZodStringFormat.init(inst, def);
});

function date2(params) {
  return _isoDate(ZodISODate, params);
}

var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
  $ZodISOTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});

function time2(params) {
  return _isoTime(ZodISOTime, params);
}

var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
  $ZodISODuration.init(inst, def);
  ZodStringFormat.init(inst, def);
});

function duration2(params) {
  return _isoDuration(ZodISODuration, params);
}
export { datetime2, date2, time2, duration2, iso_exports, ZodISODateTime, ZodISODate, ZodISOTime, ZodISODuration };
