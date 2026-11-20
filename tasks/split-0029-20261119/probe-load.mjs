import { createRequire } from "node:module";
globalThis.require = createRequire(import.meta.url);
globalThis.__filename = new URL("../../opencode/resources/app/extensions/opencode/runtime/agent-host.js", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
globalThis.__dirname = globalThis.__filename.replace(/[\\/][^\\/]*$/, "");
const m = await import("../../recovered/esm/002-agent-host.js/module-0029.mjs");
console.log("LOADED", typeof m.runOpenAICompatibleAgent, Object.keys(m).length);
