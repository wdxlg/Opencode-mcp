// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/runtime/mcp-server.js
// Original module marker: node_modules/@modelcontextprotocol/server/dist/index.mjs
import { fromJsonSchema } from "./module-0083.mjs";
import { AjvJsonSchemaValidator } from "./module-0084.mjs";


// node_modules/@modelcontextprotocol/server/dist/index.mjs
var _defaultValidator;

function fromJsonSchema2(schema, validator) {
  return fromJsonSchema(schema, validator ?? (_defaultValidator ??= new AjvJsonSchemaValidator()));
}
export { fromJsonSchema2, _defaultValidator };
