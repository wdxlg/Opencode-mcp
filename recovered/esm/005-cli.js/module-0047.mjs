// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/platform/environment/node/stdin.ts
import { init_extpath, randomPath } from "./module-0024.mjs";
import { init_terminalEncoding, resolveTerminalEncoding } from "./module-0046.mjs";
import { Queue, init_async } from "./module-0030.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/environment/node/stdin.ts
import * as fs5 from "fs";

import { tmpdir as tmpdir2 } from "os";

function hasStdinWithoutTty() {
  try {
    return !process.stdin.isTTY;
  } catch {
  }
  return false;
}

function stdinDataListener(durationinMs) {
  return new Promise((resolve2) => {
    const dataListener = () => resolve2(true);
    setTimeout(() => {
      process.stdin.removeListener("data", dataListener);
      resolve2(false);
    }, durationinMs);
    process.stdin.once("data", dataListener);
  });
}

function getStdinFilePath() {
  return randomPath(tmpdir2(), "code-stdin", 3);
}

async function createStdInFile(targetPath) {
  await fs5.promises.appendFile(targetPath, "");
  await fs5.promises.chmod(targetPath, 384);
}

async function readFromStdin(targetPath, verbose, onEnd) {
  let [encoding, iconv] = await Promise.all([
    resolveTerminalEncoding(verbose),
    // respect terminal encoding when piping into file
    import("@vscode/iconv-lite-umd"),
    // lazy load encoding module for usage
    createStdInFile(targetPath)
    // make sure file exists right away (https://github.com/microsoft/vscode/issues/155341)
  ]);
  if (!iconv.default.encodingExists(encoding)) {
    console.log(`Unsupported terminal encoding: ${encoding}, falling back to UTF-8.`);
    encoding = "utf8";
  }
  const appendFileQueue = new Queue();
  const decoder = iconv.default.getDecoder(encoding);
  process.stdin.on("data", (chunk) => {
    const chunkStr = decoder.write(chunk);
    appendFileQueue.queue(() => fs5.promises.appendFile(targetPath, chunkStr));
  });
  process.stdin.on("end", () => {
    const end = decoder.end();
    appendFileQueue.queue(async () => {
      try {
        if (typeof end === "string") {
          await fs5.promises.appendFile(targetPath, end);
        }
      } finally {
        onEnd?.();
      }
    });
  });
}

var init_stdin = __esm({
  "src/vs/platform/environment/node/stdin.ts"() {
    init_async();
    init_extpath();
    init_terminalEncoding();
  }
});
export { hasStdinWithoutTty, stdinDataListener, getStdinFilePath, createStdInFile, readFromStdin, fs5, tmpdir2, init_stdin };
