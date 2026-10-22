// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/executeStrategy/noneExecuteStrategy.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { CancellationError } from "./module-0004.mjs";
import { createAltBufferPromise, setupRecreatingStartMarker, stripCommandEchoAndPrompt } from "./module-3318.mjs";
import { waitForIdle, waitForIdleWithPromptHeuristics } from "./module-3317.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { isMultilineCommand } from "./module-3320.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITerminalLogService } from "./module-1154.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/executeStrategy/noneExecuteStrategy.ts
var NoneExecuteStrategy = class extends Disposable {
  constructor(_instance, _hasReceivedUserInput, _configurationService, _logService) {
    super();
    this._instance = _instance;
    this._hasReceivedUserInput = _hasReceivedUserInput;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this.type = "none";
    this._startMarker = this._register(new MutableDisposable());
    this._onDidCreateStartMarker = this._register(new Emitter());
    this.onDidCreateStartMarker = this._onDidCreateStartMarker.event;
  }
  async execute(commandLine, token, _commandId, _commandLineForMetadata) {
    const store = new DisposableStore();
    try {
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      this._log("Waiting for xterm");
      const xterm = await this._instance.xtermReadyPromise;
      if (!xterm) {
        throw new Error("Xterm is not available");
      }
      const alternateBufferPromise = createAltBufferPromise(xterm, store, this._log.bind(this));
      const idlePollInterval = this._configurationService.getValue("chat.tools.terminal.idlePollInterval" /* IdlePollInterval */) ?? 1e3;
      this._log("Waiting for idle");
      await waitForIdle(this._instance.onData, idlePollInterval);
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      const markerRecreation = setupRecreatingStartMarker(
        xterm,
        this._startMarker,
        (m) => this._onDidCreateStartMarker.fire(m),
        store,
        this._log.bind(this)
      );
      if (this._hasReceivedUserInput()) {
        this._log("Sending Ctrl+U to clear any pending input before sending command");
        await this._instance.sendText("", false);
        await waitForIdle(this._instance.onData, 100);
      }
      this._log(`Executing command line \`${commandLine}\``);
      markerRecreation.dispose();
      const startLine = this._startMarker.value?.line;
      const forceBracketedPasteMode = isMacintosh || isMultilineCommand(commandLine);
      this._instance.sendText(commandLine, true, forceBracketedPasteMode);
      if (startLine !== void 0) {
        this._log("Waiting for cursor to move past start line");
        const cursorMovedPromise = new Promise((resolve3) => {
          const check = () => {
            const buffer = xterm.raw.buffer.active;
            const cursorLine = buffer.baseY + buffer.cursorY;
            if (cursorLine > startLine) {
              resolve3();
            }
          };
          const listener = this._instance.onData(() => check());
          store.add(listener);
          check();
        });
        const cursorMoveTimeout = new Promise((resolve3) => {
          const handle2 = setTimeout(() => resolve3("timeout"), 1e3);
          store.add({ dispose: () => clearTimeout(handle2) });
        });
        const raceResult = await Promise.race([cursorMovedPromise, cursorMoveTimeout]);
        if (raceResult === "timeout") {
          this._log("Cursor did not move past start line before timeout, proceeding with idle detection");
        }
      }
      this._log("Waiting for idle with prompt heuristics");
      const promptResultOrAltBuffer = await Promise.race([
        waitForIdleWithPromptHeuristics(this._instance.onData, this._instance, idlePollInterval, idlePollInterval * 10),
        alternateBufferPromise.then(() => "alternateBuffer")
      ]);
      if (promptResultOrAltBuffer === "alternateBuffer") {
        this._log("Detected alternate buffer entry, skipping output capture");
        return {
          output: void 0,
          additionalInformation: void 0,
          exitCode: void 0,
          error: "alternateBuffer",
          didEnterAltBuffer: true
        };
      }
      const promptResult = promptResultOrAltBuffer;
      this._log(`Prompt detection result: ${promptResult.detected ? "detected" : "not detected"} - ${promptResult.reason}`);
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      const endMarker = store.add(xterm.raw.registerMarker());
      let output;
      const additionalInformationLines = [];
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
      if (output !== void 0 && output.trim().length === 0) {
        additionalInformationLines.push("Command produced no output");
      }
      return {
        output,
        additionalInformation: additionalInformationLines.length > 0 ? additionalInformationLines.join("\n") : void 0,
        exitCode: void 0
      };
    } finally {
      store.dispose();
    }
  }
  _log(message) {
    this._logService.debug(`RunInTerminalTool#None: ${message}`);
  }
};

NoneExecuteStrategy = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ITerminalLogService)
], NoneExecuteStrategy);
export { NoneExecuteStrategy };
