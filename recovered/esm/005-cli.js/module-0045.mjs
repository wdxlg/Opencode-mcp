// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/code/node/cliArgs.ts
import { __esm } from "./module-0000.mjs";


// src/vs/code/node/cliArgs.ts
function combineUriFlags(args) {
  const result = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") {
      result.push(...args.slice(i));
      break;
    }
    if ((arg === "--folder-uri" || arg === "--file-uri") && i + 1 < args.length && !args[i + 1].startsWith("-")) {
      result.push(`${arg}=${args[i + 1]}`);
      i++;
    } else {
      result.push(arg);
    }
  }
  return result;
}

var init_cliArgs = __esm({
  "src/vs/code/node/cliArgs.ts"() {
  }
});
export { combineUriFlags, init_cliArgs };
