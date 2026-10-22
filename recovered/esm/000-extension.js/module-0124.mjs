// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: node_modules/@modelcontextprotocol/server/dist/dialects-DoSzNhcb.mjs
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// node_modules/@modelcontextprotocol/server/dist/dialects-DoSzNhcb.mjs
init_define_OPENCODE_BUILD_INFO();

var DRAFT_2020_12_URIS2 = /* @__PURE__ */ new Set(["https://json-schema.org/draft/2020-12/schema", "http://json-schema.org/draft/2020-12/schema"]);

var DRAFT_2019_09_URIS2 = /* @__PURE__ */ new Set(["https://json-schema.org/draft/2019-09/schema", "http://json-schema.org/draft/2019-09/schema"]);

var DRAFT_07_URIS2 = /* @__PURE__ */ new Set(["https://json-schema.org/draft-07/schema", "http://json-schema.org/draft-07/schema"]);

var DRAFT_06_URIS2 = /* @__PURE__ */ new Set(["https://json-schema.org/draft-06/schema", "http://json-schema.org/draft-06/schema"]);

function declares2019Dialect2($schema) {
  return typeof $schema === "string" && DRAFT_2019_09_URIS2.has($schema.replace(/#$/, ""));
}

function declaredDialect2(schema, remedy) {
  if (!("$schema" in schema) || typeof schema.$schema !== "string") return "2020-12";
  const declared = schema.$schema.replace(/#$/, "");
  if (DRAFT_2020_12_URIS2.has(declared)) return "2020-12";
  if (DRAFT_2019_09_URIS2.has(declared)) return "2019-09";
  if (DRAFT_07_URIS2.has(declared) || DRAFT_06_URIS2.has(declared)) return "draft-7";
  throw new Error(`JSON Schema declares an unsupported dialect ("$schema": "${schema.$schema.slice(0, 200)}"). The default validator supports JSON Schema 2020-12, 2019-09, draft-07, and draft-06; ${remedy}`);
}
export { declares2019Dialect2, declaredDialect2, DRAFT_2020_12_URIS2, DRAFT_2019_09_URIS2, DRAFT_07_URIS2, DRAFT_06_URIS2 };
