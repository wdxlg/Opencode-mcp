// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/environment/node/wait.ts
import { init_extpath, randomPath } from "./module-0028.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/environment/node/wait.ts
import { writeFileSync as writeFileSync3 } from "fs";

import { tmpdir as tmpdir4 } from "os";

function createWaitMarkerFileSync(verbose) {
  const randomWaitMarkerPath = randomPath(tmpdir4());
  try {
    writeFileSync3(randomWaitMarkerPath, "");
    if (verbose) {
      console.log(`Marker file for --wait created: ${randomWaitMarkerPath}`);
    }
    return randomWaitMarkerPath;
  } catch (err) {
    if (verbose) {
      console.error(`Failed to create marker file for --wait: ${err}`);
    }
    return void 0;
  }
}

var init_wait = __esm({
  "src/vs/platform/environment/node/wait.ts"() {
    init_extpath();
  }
});
export { createWaitMarkerFileSync, writeFileSync3, tmpdir4, init_wait };
