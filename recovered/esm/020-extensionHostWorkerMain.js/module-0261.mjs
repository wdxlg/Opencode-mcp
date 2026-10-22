// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostCommands.ts
import { MainContext } from "./module-0025.mjs";
import { revive } from "./module-0074.mjs";
import { cloneAndChange } from "./module-0055.mjs";
import { Range } from "./module-0084.mjs";
import { CallHierarchyItem2, NotebookRange2, Position3, Range3, Selection2, TestItem, TestRunProfile, TypeHierarchyItem2, location } from "./module-0239.mjs";
import { Position } from "./module-0083.mjs";
import { URI } from "./module-0023.mjs";
import { VSBuffer } from "./module-0013.mjs";
import { CallHierarchyItem, Disposable2, TestRunProfileBase, TypeHierarchyItem } from "./module-0238.mjs";
import { Position2 } from "./module-0226.mjs";
import { Range2 } from "./module-0227.mjs";
import { Location2 } from "./module-0230.mjs";
import { NotebookRange } from "./module-0231.mjs";
import { SerializableObjectWithBuffers } from "./module-0024.mjs";
import { validateConstraint } from "./module-0009.mjs";
import { StopWatch } from "./module-0018.mjs";
import { isCancellationError } from "./module-0002.mjs";
import { toErrorMessage } from "./module-0041.mjs";
import { TelemetryTrustedValue } from "./module-0164.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0052.mjs";
import { ILogService } from "./module-0045.mjs";
import { IExtHostTelemetry } from "./module-0260.mjs";
import { createDecorator } from "./module-0038.mjs";
import { generateUuid } from "./module-0062.mjs";
import { isNonEmptyArray } from "./module-0004.mjs";
import { toDisposable } from "./module-0011.mjs";
import { Selection } from "./module-0232.mjs";
import { TestItemImpl } from "./module-0259.mjs";


// src/vs/workbench/api/common/extHostCommands.ts
var ExtHostCommands = class {
  constructor(extHostRpc, logService, extHostTelemetry) {
    this._commands = /* @__PURE__ */ new Map();
    this._apiCommands = /* @__PURE__ */ new Map();
    this.#proxy = extHostRpc.getProxy(MainContext.MainThreadCommands);
    this._logService = logService;
    this.#extHostTelemetry = extHostTelemetry;
    this.#telemetry = extHostRpc.getProxy(MainContext.MainThreadTelemetry);
    this.converter = new CommandsConverter(
      this,
      (id2) => {
        const candidate = this._apiCommands.get(id2);
        return candidate?.result === ApiCommandResult.Void ? candidate : void 0;
      },
      logService
    );
    this._argumentProcessors = [
      {
        processArgument(a) {
          return revive(a);
        }
      },
      {
        processArgument(arg) {
          return cloneAndChange(arg, function(obj) {
            if (Range.isIRange(obj)) {
              return Range3.to(obj);
            }
            if (Position.isIPosition(obj)) {
              return Position3.to(obj);
            }
            if (Range.isIRange(obj.range) && URI.isUri(obj.uri)) {
              return location.to(obj);
            }
            if (obj instanceof VSBuffer) {
              return obj.buffer.buffer.slice(obj.buffer.byteOffset, obj.buffer.byteOffset + obj.buffer.byteLength);
            }
            if (!Array.isArray(obj)) {
              return obj;
            }
          });
        }
      }
    ];
  }
  #proxy;
  #telemetry;
  #extHostTelemetry;
  registerArgumentProcessor(processor) {
    this._argumentProcessors.push(processor);
  }
  registerApiCommand(apiCommand) {
    const registration = this.registerCommand(false, apiCommand.id, async (...apiArgs) => {
      const internalArgs = apiCommand.args.map((arg, i) => {
        if (!arg.validate(apiArgs[i])) {
          throw new Error(`Invalid argument '${arg.name}' when running '${apiCommand.id}', received: ${typeof apiArgs[i] === "object" ? JSON.stringify(apiArgs[i], null, "	") : apiArgs[i]} `);
        }
        return arg.convert(apiArgs[i]);
      });
      const internalResult = await this.executeCommand(apiCommand.internalId, ...internalArgs);
      return apiCommand.result.convert(internalResult, apiArgs, this.converter);
    }, void 0, {
      description: apiCommand.description,
      args: apiCommand.args,
      returns: apiCommand.result.description
    });
    this._apiCommands.set(apiCommand.id, apiCommand);
    return new Disposable2(() => {
      registration.dispose();
      this._apiCommands.delete(apiCommand.id);
    });
  }
  registerCommand(global, id2, callback, thisArg, metadata, extension) {
    this._logService.trace("ExtHostCommands#registerCommand", id2);
    if (!id2.trim().length) {
      throw new Error("invalid id");
    }
    if (this._commands.has(id2)) {
      throw new Error(`command '${id2}' already exists`);
    }
    this._commands.set(id2, { callback, thisArg, metadata, extension });
    if (global) {
      this.#proxy.$registerCommand(id2);
    }
    return new Disposable2(() => {
      if (this._commands.delete(id2)) {
        if (global) {
          this.#proxy.$unregisterCommand(id2);
        }
      }
    });
  }
  executeCommand(id2, ...args) {
    this._logService.trace("ExtHostCommands#executeCommand", id2);
    return this._doExecuteCommand(id2, args, true);
  }
  async _doExecuteCommand(id2, args, retry) {
    if (this._commands.has(id2)) {
      this.#proxy.$fireCommandActivationEvent(id2);
      return this._executeContributedCommand(id2, args, false);
    } else {
      let hasBuffers = false;
      const toArgs = cloneAndChange(args, function(value) {
        if (value instanceof Position2) {
          return Position3.from(value);
        } else if (value instanceof Range2) {
          return Range3.from(value);
        } else if (value instanceof Location2) {
          return location.from(value);
        } else if (NotebookRange.isNotebookRange(value)) {
          return NotebookRange2.from(value);
        } else if (value instanceof ArrayBuffer) {
          hasBuffers = true;
          return VSBuffer.wrap(new Uint8Array(value));
        } else if (value instanceof Uint8Array) {
          hasBuffers = true;
          return VSBuffer.wrap(value);
        } else if (value instanceof VSBuffer) {
          hasBuffers = true;
          return value;
        }
        if (!Array.isArray(value)) {
          return value;
        }
      });
      try {
        const result = await this.#proxy.$executeCommand(id2, hasBuffers ? new SerializableObjectWithBuffers(toArgs) : toArgs, retry);
        return revive(result);
      } catch (e) {
        if (e instanceof Error && e.message === "$executeCommand:retry") {
          return this._doExecuteCommand(id2, args, false);
        } else {
          throw e;
        }
      }
    }
  }
  async _executeContributedCommand(id2, args, annotateError) {
    const command = this._commands.get(id2);
    if (!command) {
      throw new Error("Unknown command");
    }
    const { callback, thisArg, metadata } = command;
    if (metadata?.args) {
      for (let i = 0; i < metadata.args.length; i++) {
        try {
          validateConstraint(args[i], metadata.args[i].constraint);
        } catch (err) {
          throw new Error(`Running the contributed command: '${id2}' failed. Illegal argument '${metadata.args[i].name}' - ${metadata.args[i].description}`);
        }
      }
    }
    const stopWatch = StopWatch.create();
    try {
      return await callback.apply(thisArg, args);
    } catch (err) {
      if (id2 === this.converter.delegatingCommandId) {
        const actual = this.converter.getActualCommand(...args);
        if (actual) {
          id2 = actual.command;
        }
      }
      if (!isCancellationError(err)) {
        this._logService.error(err, id2, command.extension?.identifier);
      }
      if (!annotateError) {
        throw err;
      }
      if (command.extension?.identifier) {
        const reported = this.#extHostTelemetry.onExtensionError(command.extension.identifier, err);
        this._logService.trace("forwarded error to extension?", reported, command.extension?.identifier);
      }
      throw new class CommandError extends Error {
        constructor() {
          super(toErrorMessage(err));
          this.id = id2;
          this.source = command.extension?.displayName ?? command.extension?.name;
        }
      }();
    } finally {
      this._reportTelemetry(command, id2, stopWatch.elapsed());
    }
  }
  _reportTelemetry(command, id2, duration) {
    if (!command.extension) {
      return;
    }
    if (id2.startsWith("code.copilot.logStructured")) {
      return;
    }
    this.#telemetry.$publicLog2("Extension:ActionExecuted", {
      extensionId: command.extension.identifier.value,
      id: new TelemetryTrustedValue(id2),
      duration
    });
  }
  $executeContributedCommand(id2, ...args) {
    this._logService.trace("ExtHostCommands#$executeContributedCommand", id2);
    const cmdHandler = this._commands.get(id2);
    if (!cmdHandler) {
      return Promise.reject(new Error(`Contributed command '${id2}' does not exist.`));
    } else {
      args = args.map((arg) => this._argumentProcessors.reduce((r2, p) => p.processArgument(r2, cmdHandler.extension), arg));
      return this._executeContributedCommand(id2, args, true);
    }
  }
  getCommands(filterUnderscoreCommands = false) {
    this._logService.trace("ExtHostCommands#getCommands", filterUnderscoreCommands);
    return this.#proxy.$getCommands().then((result) => {
      if (filterUnderscoreCommands) {
        result = result.filter((command) => command[0] !== "_");
      }
      return result;
    });
  }
  $getContributedCommandMetadata() {
    const result = /* @__PURE__ */ Object.create(null);
    for (const [id2, command] of this._commands) {
      const { metadata } = command;
      if (metadata) {
        result[id2] = metadata;
      }
    }
    return Promise.resolve(result);
  }
};

ExtHostCommands = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IExtHostTelemetry)
], ExtHostCommands);

var IExtHostCommands = createDecorator("IExtHostCommands");

var CommandsConverter = class {
  // --- conversion between internal and api commands
  constructor(_commands, _lookupApiCommand, _logService) {
    this._commands = _commands;
    this._lookupApiCommand = _lookupApiCommand;
    this._logService = _logService;
    this.delegatingCommandId = `__vsc${generateUuid()}`;
    this._cache = /* @__PURE__ */ new Map();
    this._cachIdPool = 0;
    this._commands.registerCommand(true, this.delegatingCommandId, this._executeConvertedCommand, this);
  }
  toInternal(command, disposables) {
    if (!command) {
      return void 0;
    }
    const result = {
      $ident: void 0,
      id: command.command,
      title: command.title,
      tooltip: command.tooltip
    };
    if (!command.command) {
      return result;
    }
    const apiCommand = this._lookupApiCommand(command.command);
    if (apiCommand) {
      result.id = apiCommand.internalId;
      result.arguments = apiCommand.args.map((arg, i) => arg.convert(command.arguments && command.arguments[i]));
    } else if (isNonEmptyArray(command.arguments)) {
      const id2 = `${command.command} /${++this._cachIdPool}`;
      this._cache.set(id2, command);
      disposables.add(toDisposable(() => {
        this._cache.delete(id2);
        this._logService.trace("CommandsConverter#DISPOSE", id2);
      }));
      result.$ident = id2;
      result.id = this.delegatingCommandId;
      result.arguments = [id2];
      this._logService.trace("CommandsConverter#CREATE", command.command, id2);
    }
    return result;
  }
  fromInternal(command) {
    if (typeof command.$ident === "string") {
      return this._cache.get(command.$ident);
    } else {
      return {
        command: command.id,
        title: command.title,
        arguments: command.arguments
      };
    }
  }
  getActualCommand(...args) {
    return this._cache.get(args[0]);
  }
  _executeConvertedCommand(...args) {
    const actualCmd = this.getActualCommand(...args);
    this._logService.trace("CommandsConverter#EXECUTE", args[0], actualCmd ? actualCmd.command : "MISSING");
    if (!actualCmd) {
      return Promise.reject(`Actual command not found, wanted to execute ${args[0]}`);
    }
    return this._commands.executeCommand(actualCmd.command, ...actualCmd.arguments || []);
  }
};

var ApiCommandArgument = class _ApiCommandArgument {
  constructor(name2, description, validate, convert) {
    this.name = name2;
    this.description = description;
    this.validate = validate;
    this.convert = convert;
  }
  static {
    this.Uri = new _ApiCommandArgument("uri", "Uri of a text document", (v) => URI.isUri(v), (v) => v);
  }
  static {
    this.Position = new _ApiCommandArgument("position", "A position in a text document", (v) => Position2.isPosition(v), Position3.from);
  }
  static {
    this.Range = new _ApiCommandArgument("range", "A range in a text document", (v) => Range2.isRange(v), Range3.from);
  }
  static {
    this.Selection = new _ApiCommandArgument("selection", "A selection in a text document", (v) => Selection.isSelection(v), Selection2.from);
  }
  static {
    this.Number = new _ApiCommandArgument("number", "", (v) => typeof v === "number", (v) => v);
  }
  static {
    this.String = new _ApiCommandArgument("string", "", (v) => typeof v === "string", (v) => v);
  }
  static Arr(element) {
    return new _ApiCommandArgument(
      `${element.name}_array`,
      `Array of ${element.name}, ${element.description}`,
      (v) => Array.isArray(v) && v.every((e) => element.validate(e)),
      (v) => v.map((e) => element.convert(e))
    );
  }
  static {
    this.CallHierarchyItem = new _ApiCommandArgument("item", "A call hierarchy item", (v) => v instanceof CallHierarchyItem, CallHierarchyItem2.from);
  }
  static {
    this.TypeHierarchyItem = new _ApiCommandArgument("item", "A type hierarchy item", (v) => v instanceof TypeHierarchyItem, TypeHierarchyItem2.from);
  }
  static {
    this.TestItem = new _ApiCommandArgument("testItem", "A VS Code TestItem", (v) => v instanceof TestItemImpl, TestItem.from);
  }
  static {
    this.TestProfile = new _ApiCommandArgument("testProfile", "A VS Code test profile", (v) => v instanceof TestRunProfileBase, TestRunProfile.from);
  }
  optional() {
    return new _ApiCommandArgument(
      this.name,
      `(optional) ${this.description}`,
      (value) => value === void 0 || value === null || this.validate(value),
      (value) => value === void 0 ? void 0 : value === null ? null : this.convert(value)
    );
  }
  with(name2, description) {
    return new _ApiCommandArgument(name2 ?? this.name, description ?? this.description, this.validate, this.convert);
  }
};

var ApiCommandResult = class _ApiCommandResult {
  constructor(description, convert) {
    this.description = description;
    this.convert = convert;
  }
  static {
    this.Void = new _ApiCommandResult("no result", (v) => v);
  }
};

var ApiCommand = class {
  constructor(id2, internalId, description, args, result) {
    this.id = id2;
    this.internalId = internalId;
    this.description = description;
    this.args = args;
    this.result = result;
  }
};
export { ExtHostCommands, IExtHostCommands, CommandsConverter, ApiCommandArgument, ApiCommandResult, ApiCommand };
