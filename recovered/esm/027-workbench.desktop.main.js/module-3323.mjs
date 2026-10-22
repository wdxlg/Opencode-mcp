// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/executeStrategy/richExecuteStrategy.ts
import { isNumber } from "./module-0010.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { trackIdleOnPrompt } from "./module-3317.mjs";
import { createAltBufferPromise, setupRecreatingStartMarker, stripCommandEchoAndPrompt } from "./module-3318.mjs";
import { isCI, isMacintosh } from "./module-0014.mjs";
import { isMultilineCommand } from "./module-3320.mjs";
import { CancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITerminalLogService } from "./module-1154.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/executeStrategy/richExecuteStrategy.ts
function isTerminalLaunchError2(value2) {
  return typeof value2 === "object" && value2 !== null && "message" in value2;
}

function formatExitCodeOrError2(exitCodeOrError) {
  if (isTerminalLaunchError2(exitCodeOrError)) {
    return `launch error: ${exitCodeOrError.message}${exitCodeOrError.code !== void 0 ? `, code=${exitCodeOrError.code}` : ""}`;
  }
  return `code=${exitCodeOrError}`;
}

function extractExitCode2(exitCodeOrError) {
  if (isNumber(exitCodeOrError)) {
    return exitCodeOrError;
  }
  if (isTerminalLaunchError2(exitCodeOrError)) {
    return exitCodeOrError.code;
  }
  return void 0;
}

var RichExecuteStrategy = class extends Disposable {
  constructor(_instance, _commandDetection, _isSyncMode, _configurationService, _logService) {
    super();
    this._instance = _instance;
    this._commandDetection = _commandDetection;
    this._isSyncMode = _isSyncMode;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this.type = "rich";
    this._startMarker = this._register(new MutableDisposable());
    this._onDidCreateStartMarker = this._register(new Emitter());
    this.onDidCreateStartMarker = this._onDidCreateStartMarker.event;
    /**
     * Tracks per-execute() DisposableStores so they can be cleaned up if the
     * strategy is disposed mid-flight, AND removed from this collection on
     * successful completion to avoid accumulating stale references when
     * execute() is invoked many times on the same strategy instance.
     */
    this._executionStores = this._register(new DisposableStore());
  }
  async execute(commandLine, token, commandId, commandLineForMetadata) {
    const store = new DisposableStore();
    this._executionStores.add(store);
    try {
      if (this._instance.isDisposed) {
        this._log("Terminal already disposed at strategy entry");
        throw new Error("The terminal was closed");
      }
      if (this._instance.exitCode !== void 0) {
        this._log(`Terminal pty already exited at strategy entry (code=${this._instance.exitCode})`);
        return {
          output: void 0,
          exitCode: this._instance.exitCode,
          additionalInformation: `Command exited with code ${this._instance.exitCode}`
        };
      }
      const idlePollInterval = this._configurationService.getValue("chat.tools.terminal.idlePollInterval" /* IdlePollInterval */) ?? 1e3;
      const staleMarker = this._commandDetection.executingCommandObject?.marker;
      const onCommandFinishedFiltered = staleMarker ? Event2.filter(this._commandDetection.onCommandFinished, (e) => e.marker !== staleMarker, store) : this._commandDetection.onCommandFinished;
      const onDone = Promise.race([
        Event2.toPromise(onCommandFinishedFiltered, store).then((e) => {
          this._log("onDone via end event");
          return {
            "type": "success",
            command: e
          };
        }),
        Event2.toPromise(token.onCancellationRequested, store).then(() => {
          this._log("onDone via cancellation");
        }),
        Event2.toPromise(this._instance.onDisposed, store).then(() => {
          this._log("onDone via terminal disposal");
          return { type: "disposal" };
        }),
        Event2.toPromise(this._instance.onExit, store).then((exitCodeOrError) => {
          this._log(`onDone via process exit (${formatExitCodeOrError2(exitCodeOrError)})`);
          return { type: "processExit", exitCodeOrError };
        }),
        // For sync mode, track idle-on-prompt as a race candidate so that
        // commands complete when the terminal returns to a prompt. For async
        // mode this is unnecessary — the OutputMonitor handles idle detection
        // and the strategy result is not awaited.
        ...this._isSyncMode ? [
          trackIdleOnPrompt(this._instance, idlePollInterval, store, idlePollInterval, this._logService, { disableFallbacks: true }).then(() => {
            this._log("onDone via idle prompt");
          })
        ] : []
      ]);
      this._log("Waiting for xterm");
      const xterm = await this._instance.xtermReadyPromise;
      if (!xterm) {
        throw new Error("Xterm is not available");
      }
      const alternateBufferPromise = createAltBufferPromise(xterm, store, this._log.bind(this));
      const markerRecreation = setupRecreatingStartMarker(
        xterm,
        this._startMarker,
        (m) => this._onDidCreateStartMarker.fire(m),
        store,
        this._log.bind(this)
      );
      this._log(`Executing command line \`${commandLine}\``);
      markerRecreation.dispose();
      const forceBracketedPasteMode = isMacintosh || isMultilineCommand(commandLine);
      this._instance.runCommand(commandLine, true, commandId, forceBracketedPasteMode, commandLineForMetadata);
      this._log("Waiting for done event");
      const onDoneResult = await Promise.race([onDone, alternateBufferPromise.then(() => ({ type: "alternateBuffer" }))]);
      if (onDoneResult && onDoneResult.type === "disposal") {
        throw new Error("The terminal was closed");
      }
      if (onDoneResult && onDoneResult.type === "alternateBuffer") {
        this._log("Detected alternate buffer entry, skipping output capture");
        return {
          output: void 0,
          exitCode: void 0,
          error: "alternateBuffer",
          didEnterAltBuffer: true
        };
      }
      const finishedCommand = onDoneResult && onDoneResult.type === "success" ? onDoneResult.command : void 0;
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      const endMarker = store.add(xterm.raw.registerMarker());
      let output;
      const additionalInformationLines = [];
      if (finishedCommand) {
        const commandOutput = finishedCommand?.getOutput();
        if (commandOutput !== void 0) {
          this._log("Fetched output via finished command");
          output = stripCommandEchoAndPrompt(commandOutput, commandLine, this._log.bind(this));
        }
      }
      if (output === void 0) {
        try {
          const startMarkerDisposed = this._startMarker.value?.line === -1;
          output = xterm.getContentsAsText(this._startMarker.value, endMarker);
          this._log("Fetched output via markers");
          if (output !== void 0) {
            output = stripCommandEchoAndPrompt(output, commandLine, this._log.bind(this));
          }
          if (startMarkerDisposed) {
            this._log("Start marker was disposed (output exceeded scrollback), output may be truncated from the beginning");
            additionalInformationLines.push("Output exceeded terminal scrollback; beginning of output was lost");
          }
        } catch {
          this._log("Failed to fetch output via markers");
          additionalInformationLines.push("Failed to retrieve command output");
        }
      }
      if (output !== void 0 && output.trim().length === 0) {
        additionalInformationLines.push("Command produced no output");
      }
      let exitCode = finishedCommand?.exitCode;
      if (exitCode === void 0 && onDoneResult && onDoneResult.type === "processExit") {
        exitCode = extractExitCode2(onDoneResult.exitCodeOrError);
      }
      if (isNumber(exitCode) && exitCode > 0) {
        additionalInformationLines.push(`Command exited with code ${exitCode}`);
      }
      return {
        output,
        additionalInformation: additionalInformationLines.length > 0 ? additionalInformationLines.join("\n") : void 0,
        exitCode
      };
    } finally {
      this._executionStores.delete(store);
    }
  }
  _log(message) {
    const msg = `RunInTerminalTool#Rich: ${message}`;
    if (isCI) {
      this._logService.info(msg);
    } else {
      this._logService.debug(msg);
    }
  }
};

RichExecuteStrategy = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ITerminalLogService)
], RichExecuteStrategy);
export { isTerminalLaunchError2, formatExitCodeOrError2, extractExitCode2, RichExecuteStrategy };
