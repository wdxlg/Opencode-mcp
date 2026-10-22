// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/debug/node/debugAdapter.ts
import { localize } from "./module-0013.mjs";
import { AbstractDebugAdapter } from "./module-0305.mjs";
import { isAbsolute, join } from "./module-0019.mjs";
import { Promises2 } from "./module-0033.mjs";
import { deepClone, mixin } from "./module-0042.mjs";
import { isLinux, isMacintosh, isWindows } from "./module-0014.mjs";
import { killTree } from "./module-0334.mjs";
import { equalsIgnoreCase } from "./module-0023.mjs";


// src/vs/workbench/contrib/debug/node/debugAdapter.ts
import * as cp3 from "child_process";

import * as net from "net";

var windowsBatchUnquotedCharacters = "#$*+-./:?@\\_";

var windowsBatchInvalidCharacters = /[\0\r\n]/;

var windowsBatchControlCharacter = /\p{Cc}/u;

function windowsBatchArgumentNeedsQuotes(argument) {
  if (!argument || argument.endsWith("\\")) {
    return true;
  }
  for (const character of argument) {
    const codePoint = character.codePointAt(0);
    const isAsciiAlphaNumeric = codePoint >= 48 && codePoint <= 57 || codePoint >= 65 && codePoint <= 90 || codePoint >= 97 && codePoint <= 122;
    if (codePoint <= 127 && !isAsciiAlphaNumeric && !windowsBatchUnquotedCharacters.includes(character) || windowsBatchControlCharacter.test(character)) {
      return true;
    }
  }
  return false;
}

function escapeWindowsBatchArgument(argument, forceQuotes = false) {
  const quote2 = forceQuotes || windowsBatchArgumentNeedsQuotes(argument);
  let result = quote2 ? '"' : "";
  let backslashes = 0;
  for (const character of argument) {
    if (character === "\\") {
      backslashes++;
    } else {
      if (character === '"') {
        result += "\\".repeat(backslashes);
        result += '"';
      } else if (character === "%") {
        result += "%%cd:~,";
      }
      backslashes = 0;
    }
    result += character;
  }
  if (quote2) {
    result += "\\".repeat(backslashes);
    result += '"';
  }
  return result;
}

function prepareWindowsBatchCommand(command, args2) {
  if (command.includes('"') || windowsBatchInvalidCharacters.test(command) || args2.some((argument) => windowsBatchInvalidCharacters.test(argument))) {
    throw new Error(localize(14869, null));
  }
  const shellCommand = [
    escapeWindowsBatchArgument(command, true),
    ...args2.map((argument) => escapeWindowsBatchArgument(argument))
  ].join(" ");
  return ["/e:ON", "/v:OFF", "/d", "/c", `"${shellCommand}"`];
}

var StreamDebugAdapter = class _StreamDebugAdapter extends AbstractDebugAdapter {
  constructor() {
    super();
    this.rawData = Buffer.allocUnsafe(0);
    this.contentLength = -1;
  }
  static {
    this.TWO_CRLF = "\r\n\r\n";
  }
  static {
    this.HEADER_LINESEPARATOR = /\r?\n/;
  }
  static {
    // allow for non-RFC 2822 conforming line separators
    this.HEADER_FIELDSEPARATOR = /: */;
  }
  connect(readable, writable) {
    this.outputStream = writable;
    this.rawData = Buffer.allocUnsafe(0);
    this.contentLength = -1;
    readable.on("data", (data) => this.handleData(data));
  }
  sendMessage(message) {
    if (this.outputStream) {
      const json = JSON.stringify(message);
      this.outputStream.write(`Content-Length: ${Buffer.byteLength(json, "utf8")}${_StreamDebugAdapter.TWO_CRLF}${json}`, "utf8");
    }
  }
  handleData(data) {
    this.rawData = Buffer.concat([this.rawData, data]);
    while (true) {
      if (this.contentLength >= 0) {
        if (this.rawData.length >= this.contentLength) {
          const message = this.rawData.toString("utf8", 0, this.contentLength);
          this.rawData = this.rawData.slice(this.contentLength);
          this.contentLength = -1;
          if (message.length > 0) {
            try {
              this.acceptMessage(JSON.parse(message));
            } catch (e) {
              this._onError.fire(new Error((e.message || e) + "\n" + message));
            }
          }
          continue;
        }
      } else {
        const idx = this.rawData.indexOf(_StreamDebugAdapter.TWO_CRLF);
        if (idx !== -1) {
          const header = this.rawData.toString("utf8", 0, idx);
          const lines = header.split(_StreamDebugAdapter.HEADER_LINESEPARATOR);
          for (const h of lines) {
            const kvPair = h.split(_StreamDebugAdapter.HEADER_FIELDSEPARATOR);
            if (kvPair[0] === "Content-Length") {
              this.contentLength = Number(kvPair[1]);
            }
          }
          this.rawData = this.rawData.slice(idx + _StreamDebugAdapter.TWO_CRLF.length);
          continue;
        }
      }
      break;
    }
  }
};

var NetworkDebugAdapter = class extends StreamDebugAdapter {
  startSession() {
    return new Promise((resolve2, reject) => {
      let connected = false;
      this.socket = this.createConnection(() => {
        this.connect(this.socket, this.socket);
        resolve2();
        connected = true;
      });
      this.socket.on("close", () => {
        if (connected) {
          this._onError.fire(new Error("connection closed"));
        } else {
          reject(new Error("connection closed"));
        }
      });
      this.socket.on("error", (error) => {
        if (error instanceof AggregateError) {
          error = error.errors[0];
        }
        if (connected) {
          this._onError.fire(error);
        } else {
          reject(error);
        }
      });
    });
  }
  async stopSession() {
    await this.cancelPendingRequests();
    if (this.socket) {
      this.socket.end();
      this.socket = void 0;
    }
  }
};

var SocketDebugAdapter = class extends NetworkDebugAdapter {
  constructor(adapterServer) {
    super();
    this.adapterServer = adapterServer;
  }
  createConnection(connectionListener) {
    return net.createConnection(this.adapterServer.port, this.adapterServer.host || "127.0.0.1", connectionListener);
  }
};

var NamedPipeDebugAdapter = class extends NetworkDebugAdapter {
  constructor(adapterServer) {
    super();
    this.adapterServer = adapterServer;
  }
  createConnection(connectionListener) {
    return net.createConnection(this.adapterServer.path, connectionListener);
  }
};

var ExecutableDebugAdapter = class _ExecutableDebugAdapter extends StreamDebugAdapter {
  constructor(adapterExecutable, debugType) {
    super();
    this.adapterExecutable = adapterExecutable;
    this.debugType = debugType;
  }
  async startSession() {
    const command = this.adapterExecutable.command;
    const args2 = this.adapterExecutable.args;
    const options2 = this.adapterExecutable.options || {};
    try {
      if (command) {
        if (isAbsolute(command)) {
          const commandExists = await Promises2.exists(command);
          if (!commandExists) {
            throw new Error(localize(14867, null, command));
          }
        } else {
          if (command.indexOf("/") < 0 && command.indexOf("\\") < 0) {
          }
        }
      } else {
        throw new Error(localize(
          14868,
          null,
          this.debugType
        ));
      }
      let env2 = process.env;
      if (options2.env && Object.keys(options2.env).length > 0) {
        env2 = mixin(deepClone(process.env), options2.env);
      }
      if (command === "node") {
        if (Array.isArray(args2) && args2.length > 0) {
          const isElectron2 = !!process.env["ELECTRON_RUN_AS_NODE"] || !!process.versions["electron"];
          const forkOptions = {
            env: env2,
            execArgv: isElectron2 ? ["-e", "delete process.env.ELECTRON_RUN_AS_NODE;require(process.argv[1])"] : [],
            silent: true
          };
          if (options2.cwd) {
            forkOptions.cwd = options2.cwd;
          }
          const child = cp3.fork(args2[0], args2.slice(1), forkOptions);
          if (!child.pid) {
            throw new Error(localize(14870, null, args2[0]));
          }
          this.serverProcess = child;
        } else {
          throw new Error(localize(14871, null));
        }
      } else {
        let spawnCommand = command;
        let spawnArgs = args2;
        const spawnOptions = {
          env: env2
        };
        if (options2.cwd) {
          spawnOptions.cwd = options2.cwd;
        }
        if (isWindows && /\.(bat|cmd)$/i.test(command)) {
          spawnOptions.windowsVerbatimArguments = true;
          spawnCommand = process.env["ComSpec"] || "cmd.exe";
          spawnArgs = prepareWindowsBatchCommand(command, args2);
        }
        this.serverProcess = cp3.spawn(spawnCommand, spawnArgs, spawnOptions);
      }
      this.serverProcess.on("error", (err) => {
        this._onError.fire(err);
      });
      this.serverProcess.on("exit", (code, signal) => {
        this._onExit.fire(code);
      });
      this.serverProcess.stdout.on("close", () => {
        this._onError.fire(new Error("read error"));
      });
      this.serverProcess.stdout.on("error", (error) => {
        this._onError.fire(error);
      });
      this.serverProcess.stdin.on("error", (error) => {
        this._onError.fire(error);
      });
      this.serverProcess.stderr.resume();
      this.connect(this.serverProcess.stdout, this.serverProcess.stdin);
    } catch (err) {
      this._onError.fire(err);
    }
  }
  async stopSession() {
    if (!this.serverProcess) {
      return Promise.resolve(void 0);
    }
    await this.cancelPendingRequests();
    if (isWindows) {
      return killTree(this.serverProcess.pid, true).catch(() => {
        this.serverProcess?.kill();
      });
    } else {
      this.serverProcess.kill("SIGTERM");
      return Promise.resolve(void 0);
    }
  }
  static extract(platformContribution, extensionFolderPath) {
    if (!platformContribution) {
      return void 0;
    }
    const result = /* @__PURE__ */ Object.create(null);
    if (platformContribution.runtime) {
      if (platformContribution.runtime.indexOf("./") === 0) {
        result.runtime = join(extensionFolderPath, platformContribution.runtime);
      } else {
        result.runtime = platformContribution.runtime;
      }
    }
    if (platformContribution.runtimeArgs) {
      result.runtimeArgs = platformContribution.runtimeArgs;
    }
    if (platformContribution.program) {
      if (!isAbsolute(platformContribution.program)) {
        result.program = join(extensionFolderPath, platformContribution.program);
      } else {
        result.program = platformContribution.program;
      }
    }
    if (platformContribution.args) {
      result.args = platformContribution.args;
    }
    const contribution = platformContribution;
    if (contribution.win) {
      result.win = _ExecutableDebugAdapter.extract(contribution.win, extensionFolderPath);
    }
    if (contribution.winx86) {
      result.winx86 = _ExecutableDebugAdapter.extract(contribution.winx86, extensionFolderPath);
    }
    if (contribution.windows) {
      result.windows = _ExecutableDebugAdapter.extract(contribution.windows, extensionFolderPath);
    }
    if (contribution.osx) {
      result.osx = _ExecutableDebugAdapter.extract(contribution.osx, extensionFolderPath);
    }
    if (contribution.linux) {
      result.linux = _ExecutableDebugAdapter.extract(contribution.linux, extensionFolderPath);
    }
    return result;
  }
  static platformAdapterExecutable(extensionDescriptions, debugType) {
    let result = /* @__PURE__ */ Object.create(null);
    debugType = debugType.toLowerCase();
    for (const ed of extensionDescriptions) {
      if (ed.contributes) {
        const debuggers = ed.contributes["debuggers"];
        if (debuggers && debuggers.length > 0) {
          debuggers.filter((dbg) => typeof dbg.type === "string" && equalsIgnoreCase(dbg.type, debugType)).forEach((dbg) => {
            const extractedDbg = _ExecutableDebugAdapter.extract(dbg, ed.extensionLocation.fsPath);
            result = mixin(result, extractedDbg, ed.isBuiltin);
          });
        }
      }
    }
    let platformInfo;
    if (isWindows && !process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432")) {
      platformInfo = result.winx86 || result.win || result.windows;
    } else if (isWindows) {
      platformInfo = result.win || result.windows;
    } else if (isMacintosh) {
      platformInfo = result.osx;
    } else if (isLinux) {
      platformInfo = result.linux;
    }
    platformInfo = platformInfo || result;
    const program = platformInfo.program || result.program;
    const args2 = platformInfo.args || result.args;
    const runtime = platformInfo.runtime || result.runtime;
    const runtimeArgs = platformInfo.runtimeArgs || result.runtimeArgs;
    if (runtime) {
      return {
        type: "executable",
        command: runtime,
        args: (runtimeArgs || []).concat(typeof program === "string" ? [program] : []).concat(args2 || [])
      };
    } else if (program) {
      return {
        type: "executable",
        command: program,
        args: args2 || []
      };
    }
    return void 0;
  }
};
export { windowsBatchArgumentNeedsQuotes, escapeWindowsBatchArgument, prepareWindowsBatchCommand, cp3, net, windowsBatchUnquotedCharacters, windowsBatchInvalidCharacters, windowsBatchControlCharacter, StreamDebugAdapter, NetworkDebugAdapter, SocketDebugAdapter, NamedPipeDebugAdapter, ExecutableDebugAdapter };
