// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/common/ports.ts
import { __esm } from "./module-0000.mjs";


// src/vs/base/common/ports.ts
function randomPort() {
  const min = 1025;
  const max = 65535;
  return min + Math.floor((max - min) * Math.random());
}

var init_ports = __esm({
  "src/vs/base/common/ports.ts"() {
  }
});
export { randomPort, init_ports };
