// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostBangCommand.ts



// src/vs/platform/agentHost/node/agentHostBangCommand.ts
var BANG_COMMAND_PREFIX = "!";

function parseBangCommand(prompt) {
  if (!prompt.startsWith(BANG_COMMAND_PREFIX)) {
    return void 0;
  }
  const command = prompt.slice(BANG_COMMAND_PREFIX.length).trim();
  return command.length > 0 ? command : void 0;
}
export { parseBangCommand, BANG_COMMAND_PREFIX };
