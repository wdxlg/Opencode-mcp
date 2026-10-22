// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexShellCommand.ts



// src/vs/platform/agentHost/node/codex/codexShellCommand.ts
function unwrapShellInvocation(command) {
  const match2 = /^\s*\S*sh(?:\.exe)?\s+-[a-z]*c\s+([\s\S]+)$/i.exec(command);
  if (!match2) {
    return command;
  }
  return unquoteShellArg(match2[1].trim());
}

function unquoteShellArg(arg) {
  if (arg.length >= 2 && arg[0] === "'" && arg[arg.length - 1] === "'") {
    return arg.slice(1, -1).replace(/'\\''/g, "'");
  }
  if (arg.length >= 2 && arg[0] === '"' && arg[arg.length - 1] === '"') {
    return arg.slice(1, -1).replace(/\\(["\\$`])/g, "$1");
  }
  return arg;
}
export { unwrapShellInvocation, unquoteShellArg };
