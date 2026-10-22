// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/node/crypto.ts
import { createSingleCallFunction, init_functional } from "./module-0011.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/base/node/crypto.ts
import * as crypto2 from "crypto";

import * as fs10 from "fs";

async function checksum(path4, sha256hash) {
  const checksumPromise = new Promise((resolve3, reject) => {
    const input = fs10.createReadStream(path4);
    const hash3 = crypto2.createHash("sha256");
    input.pipe(hash3);
    const done = createSingleCallFunction((err, result) => {
      input.removeAllListeners();
      hash3.removeAllListeners();
      input.destroy();
      if (err) {
        reject(err);
      } else {
        resolve3(result);
      }
    });
    input.once("error", done);
    input.once("end", done);
    hash3.once("error", done);
    hash3.once("data", (data) => done(void 0, data.toString("hex")));
  });
  const hash2 = await checksumPromise;
  if (hash2 !== sha256hash) {
    throw new Error("Hash mismatch");
  }
}

var init_crypto = __esm({
  "src/vs/base/node/crypto.ts"() {
    init_functional();
  }
});
export { checksum, crypto2, fs10, init_crypto };
