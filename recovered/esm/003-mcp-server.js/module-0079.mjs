// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/runtime/mcp-server.js
// Original module marker: node_modules/zod/v4/classic/compat.js
import { config } from "./module-0006.mjs";


// node_modules/zod/v4/classic/compat.js
var ZodIssueCode = {
  invalid_type: "invalid_type",
  too_big: "too_big",
  too_small: "too_small",
  invalid_format: "invalid_format",
  not_multiple_of: "not_multiple_of",
  unrecognized_keys: "unrecognized_keys",
  invalid_union: "invalid_union",
  invalid_key: "invalid_key",
  invalid_element: "invalid_element",
  invalid_value: "invalid_value",
  custom: "custom"
};

function setErrorMap(map2) {
  config({
    customError: map2
  });
}

function getErrorMap() {
  return config().customError;
}

var ZodFirstPartyTypeKind;

/* @__PURE__ */ (function(ZodFirstPartyTypeKind2) {
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
export { setErrorMap, getErrorMap, ZodIssueCode, ZodFirstPartyTypeKind };
