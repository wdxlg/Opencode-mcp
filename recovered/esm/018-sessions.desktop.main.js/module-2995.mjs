// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/commands/common/commands.contribution.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ILogService } from "./module-0095.mjs";
import { safeStringify } from "./module-0098.mjs";


// src/vs/workbench/contrib/commands/common/commands.contribution.ts
var RunCommands = class extends Action2 {
  constructor() {
    super({
      id: "runCommands",
      title: localize2(13929, "Run Commands"),
      f1: false,
      metadata: {
        description: localize(13931, null),
        args: [
          {
            name: "args",
            schema: {
              type: "object",
              required: ["commands"],
              properties: {
                commands: {
                  type: "array",
                  description: localize(13930, null),
                  items: {
                    anyOf: [
                      {
                        $ref: "vscode://schemas/keybindings#/definitions/commandNames"
                      },
                      {
                        type: "string"
                      },
                      {
                        type: "object",
                        required: ["command"],
                        properties: {
                          command: {
                            "anyOf": [
                              {
                                $ref: "vscode://schemas/keybindings#/definitions/commandNames"
                              },
                              {
                                type: "string"
                              }
                            ]
                          }
                        },
                        $ref: "vscode://schemas/keybindings#/definitions/commandsSchemas"
                      }
                    ]
                  }
                }
              }
            }
          }
        ]
      }
    });
  }
  // dev decisions:
  // - this command takes a single argument-object because
  //	- keybinding definitions don't allow running commands with several arguments
  //  - and we want to be able to take on different other arguments in future, e.g., `runMode : 'serial' | 'concurrent'`
  async run(accessor, args2) {
    const notificationService = accessor.get(INotificationService);
    if (!this._isCommandArgs(args2)) {
      notificationService.error(localize(13932, null));
      return;
    }
    if (args2.commands.length === 0) {
      notificationService.warn(localize(13933, null));
      return;
    }
    const commandService = accessor.get(ICommandService);
    const logService = accessor.get(ILogService);
    let i2 = 0;
    try {
      for (; i2 < args2.commands.length; ++i2) {
        const cmd = args2.commands[i2];
        logService.debug(`runCommands: executing ${i2}-th command: ${safeStringify(cmd)}`);
        await this._runCommand(commandService, cmd);
        logService.debug(`runCommands: executed ${i2}-th command`);
      }
    } catch (err) {
      logService.debug(`runCommands: executing ${i2}-th command resulted in an error: ${err instanceof Error ? err.message : safeStringify(err)}`);
      notificationService.error(err);
    }
  }
  _isCommandArgs(args2) {
    if (!args2 || typeof args2 !== "object") {
      return false;
    }
    if (!("commands" in args2) || !Array.isArray(args2.commands)) {
      return false;
    }
    for (const cmd of args2.commands) {
      if (typeof cmd === "string") {
        continue;
      }
      if (typeof cmd === "object" && typeof cmd.command === "string") {
        continue;
      }
      return false;
    }
    return true;
  }
  _runCommand(commandService, cmd) {
    let commandID, commandArgs;
    if (typeof cmd === "string") {
      commandID = cmd;
    } else {
      commandID = cmd.command;
      commandArgs = cmd.args;
    }
    if (commandArgs === void 0) {
      return commandService.executeCommand(commandID);
    } else {
      if (Array.isArray(commandArgs)) {
        return commandService.executeCommand(commandID, ...commandArgs);
      } else {
        return commandService.executeCommand(commandID, commandArgs);
      }
    }
  }
};

registerAction2(RunCommands);
export { RunCommands };
