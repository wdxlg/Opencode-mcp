// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/runtime/mcp-server.js
// Original module marker: node_modules/zod/v4/classic/coerce.js
import { __export } from "./module-0000.mjs";
import { _coercedBigint, _coercedBoolean, _coercedDate, _coercedNumber, _coercedString } from "./module-0069.mjs";
import { ZodBigInt, ZodBoolean, ZodDate, ZodNumber, ZodString } from "./module-0074.mjs";


// node_modules/zod/v4/classic/coerce.js
var coerce_exports = {};

__export(coerce_exports, {
  bigint: () => bigint3,
  boolean: () => boolean3,
  date: () => date4,
  number: () => number3,
  string: () => string3
});

function string3(params) {
  return _coercedString(ZodString, params);
}

function number3(params) {
  return _coercedNumber(ZodNumber, params);
}

function boolean3(params) {
  return _coercedBoolean(ZodBoolean, params);
}

function bigint3(params) {
  return _coercedBigint(ZodBigInt, params);
}

function date4(params) {
  return _coercedDate(ZodDate, params);
}
export { string3, number3, boolean3, bigint3, date4, coerce_exports };
