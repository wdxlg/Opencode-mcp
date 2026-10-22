// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/executeStrategy/basicExecuteStrategy.ts
import { isNumber } from "./module-0010.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { trackIdleOnPrompt, waitForIdle } from "./module-3317.mjs";
import { createAltBufferPromise, setupRecreatingStartMarker, stripCommandEchoAndPrompt } from "./module-3318.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { isMultilineCommand } from "./module-3320.mjs";
import { CancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITerminalLogService } from "./module-1154.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/executeStrategy/basicExecuteStrategy.ts
function isTerminalLaunchError(value2) {
  return typeof value2 === "object" && value2 !== null && "message" in value2;
}

function formatExitCodeOrError(exitCodeOrError) {
  if (isTerminalLaunchError(exitCodeOrError)) {
    return `launch error: ${exitCodeOrError.message}${exitCodeOrError.code !== void 0 ? `, code=${exitCodeOrError.code}` : ""}`;
  }
  return `code=${exitCodeOrError}`;
}

function extractExitCode(exitCodeOrError) {
  if (isNumber(exitCodeOrError)) {
    return exitCodeOrError;
  }
  if (isTerminalLaunchError(exitCodeOrError)) {
    return exitCodeOrError.code;
  }
  return void 0;
}

var BasicExecuteStrategy = class extends Disposable {
  constructor(_instance, _hasReceivedUserInput, _commandDetection, _configurationService, _logService) {
    super();
    this._instance = _instance;
    this._hasReceivedUserInput = _hasReceivedUserInput;
    this._commandDetection = _commandDetection;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this.type = "basic";
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
  async execute(commandLine, token, commandId, _commandLineForMetadata) {
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
      const idlePromptPromise = trackIdleOnPrompt(this._instance, idlePollInterval, store, idlePollInterval, this._logService);
      const onDone = Promise.race([
        Event2.toPromise(onCommandFinishedFiltered, store).then((e) => {
          this._log("onDone 1 of 2 via end event, waiting for short idle prompt");
          return idlePromptPromise.then(() => {
            this._log("onDone 2 of 2 via short idle prompt");
            return {
              "type": "success",
              command: e
            };
          });
        }),
        Event2.toPromise(token.onCancellationRequested, store).then(() => {
          this._log("onDone via cancellation");
        }),
        Event2.toPromise(this._instance.onDisposed, store).then(() => {
          this._log("onDone via terminal disposal");
          return { type: "disposal" };
        }),
        Event2.toPromise(this._instance.onExit, store).then((exitCodeOrError) => {
          this._log(`onDone via process exit (${formatExitCodeOrError(exitCodeOrError)})`);
          return { type: "processExit", exitCodeOrError };
        }),
        // A longer idle prompt event is used here as a catch all for unexpected cases where
        // the end event doesn't fire for some reason.
        trackIdleOnPrompt(this._instance, idlePollInterval * 3, store, idlePollInterval, this._logService).then(() => {
          this._log("onDone long idle prompt");
        })
      ]);
      this._log("Waiting for xterm");
      const xterm = await this._instance.xtermReadyPromise;
      if (!xterm) {
        throw new Error("Xterm is not available");
      }
      const alternateBufferPromise = createAltBufferPromise(xterm, store, this._log.bind(this));
      this._log("Waiting for idle");
      await waitForIdle(this._instance.onData, idlePollInterval);
      const markerRecreation = setupRecreatingStartMarker(
        xterm,
        this._startMarker,
        (m) => this._onDidCreateStartMarker.fire(m),
        store,
        this._log.bind(this)
      );
      if (this._hasReceivedUserInput()) {
        if (this._commandDetection.executingCommandObject !== void 0) {
          this._log("Previous command still executing with pending input, sending SIGINT before retrying");
          await this._instance.sendText("", false);
          await waitForIdle(this._instance.onData, 100);
        } else {
          this._log("Prompt is idle; clearing pending input with Ctrl+U instead of SIGINT");
          await this._instance.sendText("", false);
          await waitForIdle(this._instance.onData, 100);
        }
      }
      if (commandId) {
        this._log(`In basic execute strategy: skipping pre-bound command id ${commandId} because basic shell integration executes via sendText`);
      }
      this._log(`Executing command line \`${commandLine}\``);
      markerRecreation.dispose();
      const forceBracketedPasteMode = isMacintosh || isMultilineCommand(commandLine);
      this._instance.sendText(commandLine, true, forceBracketedPasteMode);
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
      if (finishedCommand) {
        this._log(`Finished command id=${finishedCommand.id ?? "none"} for requested=${commandId ?? "none"}`);
      } else if (commandId) {
        this._log(`No finished command surfaced for requested=${commandId}`);
      }
      if (!(onDoneResult && onDoneResult.type === "processExit")) {
        this._log("Waiting for idle");
        await waitForIdle(this._instance.onData, idlePollInterval);
      }
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
        exitCode = extractExitCode(onDoneResult.exitCodeOrError);
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
    this._logService.debug(`RunInTerminalTool#Basic: ${message}`);
  }
};

BasicExecuteStrategy = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ITerminalLogService)
], BasicExecuteStrategy);
export { isTerminalLaunchError, formatExitCodeOrError, extractExitCode, BasicExecuteStrategy };
