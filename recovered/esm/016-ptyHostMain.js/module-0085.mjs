// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/platform/terminal/common/xterm/shellIntegrationAddon.ts
import { Disposable, dispose, toDisposable } from "./module-0011.mjs";
import { TerminalCapabilityStore } from "./module-0076.mjs";
import { Emitter } from "./module-0021.mjs";
import { PartialCommandDetectionCapability } from "./module-0081.mjs";
import { removeAnsiEscapeCodesFromPrompt } from "./module-0024.mjs";
import { sanitizeCwd } from "./module-0066.mjs";
import { URI } from "./module-0017.mjs";
import { CwdDetectionCapability } from "./module-0080.mjs";
import { CommandDetectionCapability } from "./module-0079.mjs";
import { BufferMarkCapability } from "./module-0082.mjs";
import { ShellEnvDetectionCapability } from "./module-0083.mjs";
import { PromptTypeDetectionCapability } from "./module-0084.mjs";


// src/vs/platform/terminal/common/xterm/shellIntegrationAddon.ts
var ShellIntegrationAddon = class extends Disposable {
  constructor(_nonce, _disableTelemetry, _onDidExecuteText, _telemetryService, _logService) {
    super();
    this._nonce = _nonce;
    this._disableTelemetry = _disableTelemetry;
    this._onDidExecuteText = _onDidExecuteText;
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this.capabilities = this._register(new TerminalCapabilityStore());
    this._hasUpdatedTelemetry = false;
    this._commonProtocolDisposables = [];
    this._seenSequences = /* @__PURE__ */ new Set();
    this._status = 0 /* Off */;
    this._onDidChangeStatus = this._register(new Emitter());
    this.onDidChangeStatus = this._onDidChangeStatus.event;
    this._onDidChangeSeenSequences = this._register(new Emitter());
    this.onDidChangeSeenSequences = this._onDidChangeSeenSequences.event;
    this._register(toDisposable(() => {
      this._clearActivationTimeout();
      this._disposeCommonProtocol();
    }));
  }
  get seenSequences() {
    return this._seenSequences;
  }
  get status() {
    return this._status;
  }
  _disposeCommonProtocol() {
    dispose(this._commonProtocolDisposables);
    this._commonProtocolDisposables.length = 0;
  }
  activate(xterm) {
    this._terminal = xterm;
    this.capabilities.add(3 /* PartialCommandDetection */, this._register(new PartialCommandDetectionCapability(this._terminal, this._onDidExecuteText)));
    this._register(xterm.parser.registerOscHandler(633 /* VSCode */, (data) => this._handleVSCodeSequence(data)));
    this._register(xterm.parser.registerOscHandler(1337 /* ITerm */, (data) => this._doHandleITermSequence(data)));
    this._commonProtocolDisposables.push(
      xterm.parser.registerOscHandler(133 /* FinalTerm */, (data) => this._handleFinalTermSequence(data))
    );
    this._register(xterm.parser.registerOscHandler(7 /* SetCwd */, (data) => this._doHandleSetCwd(data)));
    this._register(xterm.parser.registerOscHandler(9 /* SetWindowsFriendlyCwd */, (data) => this._doHandleSetWindowsFriendlyCwd(data)));
    this._ensureCapabilitiesOrAddFailureTelemetry();
  }
  getMarkerId(terminal, vscodeMarkerId) {
    this._createOrGetBufferMarkDetection(terminal).getMark(vscodeMarkerId);
  }
  setNextCommandId(command, commandId) {
    if (this._terminal) {
      this._createOrGetCommandDetection(this._terminal).setNextCommandId(command, commandId);
    }
  }
  _markSequenceSeen(sequence) {
    if (!this._seenSequences.has(sequence)) {
      this._seenSequences.add(sequence);
      this._onDidChangeSeenSequences.fire(this._seenSequences);
    }
  }
  _handleFinalTermSequence(data) {
    const didHandle = this._doHandleFinalTermSequence(data);
    if (this._status === 0 /* Off */) {
      this._status = 1 /* FinalTerm */;
      this._onDidChangeStatus.fire(this._status);
    }
    return didHandle;
  }
  _doHandleFinalTermSequence(data) {
    if (!this._terminal) {
      return false;
    }
    const [command, ...args] = data.split(";");
    this._logService.trace(`ShellIntegrationAddon#_doHandleFinalTermSequence: received sequence ${command}`);
    this._markSequenceSeen(command);
    switch (command) {
      case "A" /* PromptStart */:
        this._createOrGetCommandDetection(this._terminal).handlePromptStart();
        return true;
      case "B" /* CommandStart */:
        this._createOrGetCommandDetection(this._terminal).handleCommandStart({ ignoreCommandLine: true });
        return true;
      case "C" /* CommandExecuted */:
        this._createOrGetCommandDetection(this._terminal).handleCommandExecuted();
        return true;
      case "D" /* CommandFinished */: {
        const exitCode = args.length === 1 ? parseInt(args[0]) : void 0;
        this._createOrGetCommandDetection(this._terminal).handleCommandFinished(exitCode);
        return true;
      }
    }
    return false;
  }
  _handleVSCodeSequence(data) {
    const didHandle = this._doHandleVSCodeSequence(data);
    if (!this._hasUpdatedTelemetry && didHandle) {
      this._telemetryService?.publicLog2("terminal/shellIntegrationActivationSucceeded");
      this._hasUpdatedTelemetry = true;
      this._clearActivationTimeout();
    }
    if (this._status !== 2 /* VSCode */) {
      this._status = 2 /* VSCode */;
      this._onDidChangeStatus.fire(this._status);
    }
    return didHandle;
  }
  async _ensureCapabilitiesOrAddFailureTelemetry() {
    if (!this._telemetryService || this._disableTelemetry) {
      return;
    }
    this._activationTimeout = setTimeout(() => {
      if (!this.capabilities.get(2 /* CommandDetection */) && !this.capabilities.get(0 /* CwdDetection */)) {
        this._telemetryService?.publicLog2("terminal/shellIntegrationActivationTimeout");
        this._logService.warn("Shell integration failed to add capabilities within 10 seconds");
      }
      this._hasUpdatedTelemetry = true;
    }, 1e4);
  }
  _clearActivationTimeout() {
    if (this._activationTimeout !== void 0) {
      clearTimeout(this._activationTimeout);
      this._activationTimeout = void 0;
    }
  }
  _doHandleVSCodeSequence(data) {
    if (!this._terminal) {
      return false;
    }
    const argsIndex = data.indexOf(";");
    const command = argsIndex === -1 ? data : data.substring(0, argsIndex);
    this._logService.trace(`ShellIntegrationAddon#_doHandleVSCodeSequence: received sequence ${command}`);
    this._markSequenceSeen(command);
    const args = argsIndex === -1 ? [] : data.substring(argsIndex + 1).split(";");
    switch (command) {
      case "A" /* PromptStart */:
        this._createOrGetCommandDetection(this._terminal).handlePromptStart();
        return true;
      case "B" /* CommandStart */:
        this._createOrGetCommandDetection(this._terminal).handleCommandStart();
        return true;
      case "C" /* CommandExecuted */:
        this._createOrGetCommandDetection(this._terminal).handleCommandExecuted();
        return true;
      case "D" /* CommandFinished */: {
        const arg0 = args[0];
        const exitCode = arg0 !== void 0 ? parseInt(arg0) : void 0;
        this._createOrGetCommandDetection(this._terminal).handleCommandFinished(exitCode);
        return true;
      }
      case "E" /* CommandLine */: {
        const arg0 = args[0];
        const arg1 = args[1];
        let commandLine;
        if (arg0 !== void 0) {
          commandLine = deserializeVSCodeOscMessage(arg0);
        } else {
          commandLine = "";
        }
        this._createOrGetCommandDetection(this._terminal).setCommandLine(commandLine, arg1 === this._nonce);
        return true;
      }
      case "F" /* ContinuationStart */: {
        this._createOrGetCommandDetection(this._terminal).handleContinuationStart();
        return true;
      }
      case "G" /* ContinuationEnd */: {
        this._createOrGetCommandDetection(this._terminal).handleContinuationEnd();
        return true;
      }
      case "EnvJson" /* EnvJson */: {
        const arg0 = args[0];
        const arg1 = args[1];
        if (arg0 !== void 0) {
          try {
            const env2 = JSON.parse(deserializeVSCodeOscMessage(arg0));
            this._createOrGetShellEnvDetection().setEnvironment(env2, arg1 === this._nonce);
          } catch (e) {
            this._logService.warn("Failed to parse environment from shell integration sequence", arg0);
          }
        }
        return true;
      }
      case "EnvSingleStart" /* EnvSingleStart */: {
        this._createOrGetShellEnvDetection().startEnvironmentSingleVar(args[0] === "1", args[1] === this._nonce);
        return true;
      }
      case "EnvSingleDelete" /* EnvSingleDelete */: {
        const arg0 = args[0];
        const arg1 = args[1];
        const arg2 = args[2];
        if (arg0 !== void 0 && arg1 !== void 0) {
          const env2 = deserializeVSCodeOscMessage(arg1);
          this._createOrGetShellEnvDetection().deleteEnvironmentSingleVar(arg0, env2, arg2 === this._nonce);
        }
        return true;
      }
      case "EnvSingleEntry" /* EnvSingleEntry */: {
        const arg0 = args[0];
        const arg1 = args[1];
        const arg2 = args[2];
        if (arg0 !== void 0 && arg1 !== void 0) {
          const env2 = deserializeVSCodeOscMessage(arg1);
          this._createOrGetShellEnvDetection().setEnvironmentSingleVar(arg0, env2, arg2 === this._nonce);
        }
        return true;
      }
      case "EnvSingleEnd" /* EnvSingleEnd */: {
        this._createOrGetShellEnvDetection().endEnvironmentSingleVar(args[0] === this._nonce);
        return true;
      }
      case "H" /* RightPromptStart */: {
        this._createOrGetCommandDetection(this._terminal).handleRightPromptStart();
        return true;
      }
      case "I" /* RightPromptEnd */: {
        this._createOrGetCommandDetection(this._terminal).handleRightPromptEnd();
        return true;
      }
      case "P" /* Property */: {
        const arg0 = args[0];
        const deserialized = arg0 !== void 0 ? deserializeVSCodeOscMessage(arg0) : "";
        const { key, value } = parseKeyValueAssignment(deserialized);
        if (value === void 0) {
          return true;
        }
        switch (key) {
          case "ContinuationPrompt": {
            this._updateContinuationPrompt(removeAnsiEscapeCodesFromPrompt(value));
            return true;
          }
          case "Cwd": {
            const nonce = args[1];
            this._updateCwd(value, nonce !== void 0 && nonce === this._nonce);
            return true;
          }
          case "IsWindows": {
            this._createOrGetCommandDetection(this._terminal).setIsWindowsPty(value === "True" ? true : false);
            return true;
          }
          case "HasRichCommandDetection": {
            this._createOrGetCommandDetection(this._terminal).setHasRichCommandDetection(value === "True" ? true : false);
            return true;
          }
          case "Prompt": {
            const sanitizedValue = value.replace(/\x1b\[[0-9;]*m/g, "");
            this._updatePromptTerminator(sanitizedValue);
            return true;
          }
          case "PromptType": {
            this._createOrGetPromptTypeDetection().setPromptType(value);
            return true;
          }
          case "Task": {
            this._createOrGetBufferMarkDetection(this._terminal);
            this.capabilities.get(2 /* CommandDetection */)?.setIsCommandStorageDisabled();
            return true;
          }
        }
      }
      case "SetMark" /* SetMark */: {
        this._createOrGetBufferMarkDetection(this._terminal).addMark(parseMarkSequence(args));
        return true;
      }
    }
    return false;
  }
  _updateContinuationPrompt(value) {
    if (!this._terminal) {
      return;
    }
    this._createOrGetCommandDetection(this._terminal).setContinuationPrompt(value);
  }
  _updatePromptTerminator(prompt) {
    if (!this._terminal) {
      return;
    }
    const lastPromptLine = prompt.substring(prompt.lastIndexOf("\n") + 1);
    const lastPromptLineTrimmed = lastPromptLine.trim();
    const promptTerminator = lastPromptLineTrimmed.length === 1 ? lastPromptLine : lastPromptLine.substring(lastPromptLine.lastIndexOf(" "));
    if (promptTerminator) {
      this._createOrGetCommandDetection(this._terminal).setPromptTerminator(promptTerminator, lastPromptLine);
    }
  }
  _updateCwd(value, isTrusted = true) {
    value = sanitizeCwd(value);
    this._createOrGetCwdDetection().updateCwd(value, isTrusted);
    const commandDetection = this.capabilities.get(2 /* CommandDetection */);
    commandDetection?.setCwd(value);
  }
  _doHandleITermSequence(data) {
    if (!this._terminal) {
      return false;
    }
    const [command] = data.split(";");
    this._markSequenceSeen(`${1337 /* ITerm */};${command}`);
    switch (command) {
      case "SetMark" /* SetMark */: {
        this._createOrGetBufferMarkDetection(this._terminal).addMark();
      }
      default: {
        const { key, value } = parseKeyValueAssignment(command);
        if (value === void 0) {
          return true;
        }
        switch (key) {
          case "CurrentDir" /* CurrentDir */:
            this._updateCwd(value, false);
            return true;
        }
      }
    }
    return false;
  }
  _doHandleSetWindowsFriendlyCwd(data) {
    if (!this._terminal) {
      return false;
    }
    const [command, ...args] = data.split(";");
    this._markSequenceSeen(`${9 /* SetWindowsFriendlyCwd */};${command}`);
    switch (command) {
      case "9":
        if (args.length) {
          this._updateCwd(args[0], false);
        }
        return true;
    }
    return false;
  }
  /**
   * Handles the sequence: `OSC 7 ; scheme://cwd ST`
   */
  _doHandleSetCwd(data) {
    if (!this._terminal) {
      return false;
    }
    const [command] = data.split(";");
    this._markSequenceSeen(`${7 /* SetCwd */};${command}`);
    if (command.match(/^file:\/\/.*\//)) {
      const uri = URI.parse(command);
      if (uri.path && uri.path.length > 0) {
        this._updateCwd(uri.path, false);
        return true;
      }
    }
    return false;
  }
  serialize() {
    if (!this._terminal || !this.capabilities.has(2 /* CommandDetection */)) {
      return {
        isWindowsPty: false,
        hasRichCommandDetection: false,
        commands: [],
        promptInputModel: void 0
      };
    }
    const result = this._createOrGetCommandDetection(this._terminal).serialize();
    return result;
  }
  deserialize(serialized) {
    if (!this._terminal) {
      throw new Error("Cannot restore commands before addon is activated");
    }
    const commandDetection = this._createOrGetCommandDetection(this._terminal);
    commandDetection.deserialize(serialized);
    if (commandDetection.cwd) {
      this._updateCwd(commandDetection.cwd, false);
    }
  }
  _createOrGetCwdDetection() {
    let cwdDetection = this.capabilities.get(0 /* CwdDetection */);
    if (!cwdDetection) {
      cwdDetection = this._register(new CwdDetectionCapability());
      this.capabilities.add(0 /* CwdDetection */, cwdDetection);
    }
    return cwdDetection;
  }
  _createOrGetCommandDetection(terminal) {
    let commandDetection = this.capabilities.get(2 /* CommandDetection */);
    if (!commandDetection) {
      commandDetection = this._register(new CommandDetectionCapability(terminal, this._logService));
      this.capabilities.add(2 /* CommandDetection */, commandDetection);
    }
    return commandDetection;
  }
  _createOrGetBufferMarkDetection(terminal) {
    let bufferMarkDetection = this.capabilities.get(4 /* BufferMarkDetection */);
    if (!bufferMarkDetection) {
      bufferMarkDetection = this._register(new BufferMarkCapability(terminal));
      this.capabilities.add(4 /* BufferMarkDetection */, bufferMarkDetection);
    }
    return bufferMarkDetection;
  }
  _createOrGetShellEnvDetection() {
    let shellEnvDetection = this.capabilities.get(5 /* ShellEnvDetection */);
    if (!shellEnvDetection) {
      shellEnvDetection = this._register(new ShellEnvDetectionCapability());
      this.capabilities.add(5 /* ShellEnvDetection */, shellEnvDetection);
    }
    return shellEnvDetection;
  }
  _createOrGetPromptTypeDetection() {
    let promptTypeDetection = this.capabilities.get(6 /* PromptTypeDetection */);
    if (!promptTypeDetection) {
      promptTypeDetection = this._register(new PromptTypeDetectionCapability());
      this.capabilities.add(6 /* PromptTypeDetection */, promptTypeDetection);
    }
    return promptTypeDetection;
  }
};

function deserializeVSCodeOscMessage(message) {
  return message.replaceAll(
    // Backslash ('\') followed by an escape operator: either another '\', or 'x' and two hex chars.
    /\\(\\|x([0-9a-f]{2}))/gi,
    // If it's a hex value, parse it to a character.
    // Otherwise the operator is '\', which we return literally, now unescaped.
    (_match, op, hex) => hex ? String.fromCharCode(parseInt(hex, 16)) : op
  );
}

function parseKeyValueAssignment(message) {
  const separatorIndex = message.indexOf("=");
  if (separatorIndex === -1) {
    return { key: message, value: void 0 };
  }
  return {
    key: message.substring(0, separatorIndex),
    value: message.substring(1 + separatorIndex)
  };
}

function parseMarkSequence(sequence) {
  let id2 = void 0;
  let hidden = false;
  for (const property of sequence) {
    if (property === void 0) {
      continue;
    }
    if (property === "Hidden") {
      hidden = true;
    }
    if (property.startsWith("Id=")) {
      id2 = property.substring(3);
    }
  }
  return { id: id2, hidden };
}
export { deserializeVSCodeOscMessage, parseKeyValueAssignment, parseMarkSequence, ShellIntegrationAddon };
