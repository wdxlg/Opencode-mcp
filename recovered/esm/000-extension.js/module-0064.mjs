// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-native-refs.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/external-mcp-native-refs.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_crypto9 = require("node:crypto");

var NATIVE_REF_TTL_MS = 5 * 60 * 1e3;

var MAX_REFS = 10;

var refs = /* @__PURE__ */ new Map();

function sweep(now) {
  for (const [ref, entry] of refs) if (entry.expires <= now) refs.delete(ref);
}

function rememberNativeConfig(raw, now = Date.now()) {
  sweep(now);
  while (refs.size >= MAX_REFS) refs.delete(refs.keys().next().value);
  const ref = `native-${(0, import_node_crypto9.randomUUID)()}`;
  refs.set(ref, { raw, expires: now + NATIVE_REF_TTL_MS });
  return ref;
}

function recallNativeConfig(ref, now = Date.now()) {
  sweep(now);
  const entry = typeof ref === "string" ? refs.get(ref) : void 0;
  if (!entry) throw new Error("\u539F\u751F\u914D\u7F6E\u7684\u6682\u5B58\u5DF2\u8FC7\u671F\uFF085 \u5206\u949F\uFF09\u6216\u65E0\u6548\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u300C\u5F00\u653E\u5DF2\u6709\u670D\u52A1\u7ED9 Bridge\u2026\u300D\u3002");
  return entry.raw;
}

function forgetNativeConfig(ref) {
  refs.delete(ref);
}

function redactedNativeView(servers) {
  const lines = [];
  for (const [name, value] of Object.entries(servers)) {
    const config2 = value && typeof value === "object" ? value : {};
    lines.push(`${name}\uFF1A`);
    if (typeof config2.url === "string") {
      let origin = "(\u65E0\u6548\u5730\u5740)";
      try {
        const url2 = new URL(config2.url);
        origin = `${url2.protocol}//${url2.host}`;
      } catch {
      }
      lines.push(`  Streamable HTTP \xB7 ${origin}\uFF08\u5B8C\u6574\u5730\u5740\u6309\u654F\u611F\u503C\u4FDD\u5B58\uFF09`);
    } else {
      lines.push(`  stdio \xB7 ${typeof config2.command === "string" ? config2.command : "(\u65E0\u547D\u4EE4)"}`);
      lines.push(`  ${Array.isArray(config2.args) ? config2.args.length : 0} \u4E2A\u53C2\u6570\uFF08\u654F\u611F\u503C\u4E0D\u663E\u793A\uFF09`);
    }
    for (const [label, map] of [["Header", config2.headers], ["\u73AF\u5883\u53D8\u91CF", config2.env]]) {
      if (map && typeof map === "object") for (const key of Object.keys(map)) lines.push(`  ${label} ${key}\uFF1A\uFF08\u6765\u81EA\u539F\u751F\u914D\u7F6E\uFF0C\u5DF2\u9690\u85CF\uFF09`);
    }
  }
  return lines.join("\n");
}
export { sweep, rememberNativeConfig, recallNativeConfig, forgetNativeConfig, redactedNativeView, import_node_crypto9, NATIVE_REF_TTL_MS, MAX_REFS, refs };
