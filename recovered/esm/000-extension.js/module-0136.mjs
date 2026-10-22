// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/jsonrpc-request-id-registry.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// src/jsonrpc-request-id-registry.ts
init_define_OPENCODE_BUILD_INFO();

function keyOf2(id) {
  return `${typeof id}:${String(id)}`;
}

function requestIdOf(message2) {
  if (!message2 || typeof message2 !== "object") return void 0;
  const candidate = message2;
  if (typeof candidate.method !== "string") return void 0;
  return typeof candidate.id === "string" || typeof candidate.id === "number" ? candidate.id : void 0;
}

function requestIdsOfRequest(body) {
  const messages2 = Array.isArray(body) ? body : [body];
  return messages2.flatMap((message2) => {
    const id = requestIdOf(message2);
    return id === void 0 ? [] : [id];
  });
}

var JsonRpcRequestIdRegistry = class {
  active = /* @__PURE__ */ new Set();
  claim(ids) {
    const seen = /* @__PURE__ */ new Set();
    for (const id of ids) {
      const key = keyOf2(id);
      if (seen.has(key) || this.active.has(key)) {
        return { ok: false, conflictId: id };
      }
      seen.add(key);
    }
    seen.forEach((key) => this.active.add(key));
    return { ok: true };
  }
  release(ids) {
    ids.forEach((id) => this.active.delete(keyOf2(id)));
  }
};
export { keyOf2, requestIdOf, requestIdsOfRequest, JsonRpcRequestIdRegistry };
