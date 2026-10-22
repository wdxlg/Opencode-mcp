// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: node_modules/zod/v4/classic/coerce.js
import { __export, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { _coercedBigint, _coercedBoolean, _coercedDate, _coercedNumber, _coercedString } from "./module-0089.mjs";
import { ZodBigInt, ZodBoolean, ZodDate, ZodNumber, ZodString } from "./module-0092.mjs";


// node_modules/zod/v4/classic/coerce.js
var coerce_exports = {};

__export(coerce_exports, {
  bigint: () => bigint2,
  boolean: () => boolean3,
  date: () => date3,
  number: () => number3,
  string: () => string3
});

init_define_OPENCODE_BUILD_INFO();

function string3(params) {
  return _coercedString(ZodString, params);
}

function number3(params) {
  return _coercedNumber(ZodNumber, params);
}

function boolean3(params) {
  return _coercedBoolean(ZodBoolean, params);
}

function bigint2(params) {
  return _coercedBigint(ZodBigInt, params);
}

function date3(params) {
  return _coercedDate(ZodDate, params);
}
export { string3, number3, boolean3, bigint2, date3, coerce_exports };
