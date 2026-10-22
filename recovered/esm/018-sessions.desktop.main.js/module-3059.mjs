// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/terminal/common/capabilities/commandDetection/terminalCommand.ts
import { isString } from "./module-0010.mjs";
import { generateUuid } from "./module-0190.mjs";


// src/vs/platform/terminal/common/capabilities/commandDetection/terminalCommand.ts
var TerminalCommand = class _TerminalCommand {
  constructor(_xterm, _properties) {
    this._xterm = _xterm;
    this._properties = _properties;
  }
  get command() {
    return this._properties.command;
  }
  get commandLineConfidence() {
    return this._properties.commandLineConfidence;
  }
  get isTrusted() {
    return this._properties.isTrusted;
  }
  get timestamp() {
    return this._properties.timestamp;
  }
  get duration() {
    return this._properties.duration;
  }
  get promptStartMarker() {
    return this._properties.promptStartMarker;
  }
  get marker() {
    return this._properties.marker;
  }
  get endMarker() {
    return this._properties.endMarker;
  }
  set endMarker(value2) {
    this._properties.endMarker = value2;
  }
  get executedMarker() {
    return this._properties.executedMarker;
  }
  get aliases() {
    return this._properties.aliases;
  }
  get wasReplayed() {
    return this._properties.wasReplayed;
  }
  get cwd() {
    return this._properties.cwd;
  }
  get exitCode() {
    return this._properties.exitCode;
  }
  get commandStartLineContent() {
    return this._properties.commandStartLineContent;
  }
  get markProperties() {
    return this._properties.markProperties;
  }
  get executedX() {
    return this._properties.executedX;
  }
  get startX() {
    return this._properties.startX;
  }
  get id() {
    return this._properties.id;
  }
  static deserialize(xterm, serialized, isCommandStorageDisabled) {
    const buffer = xterm.buffer.normal;
    const marker = serialized.startLine !== void 0 ? xterm.registerMarker(serialized.startLine - (buffer.baseY + buffer.cursorY)) : void 0;
    if (!marker) {
      return void 0;
    }
    const promptStartMarker = serialized.promptStartLine !== void 0 ? xterm.registerMarker(serialized.promptStartLine - (buffer.baseY + buffer.cursorY)) : void 0;
    const endMarker = serialized.endLine !== void 0 ? xterm.registerMarker(serialized.endLine - (buffer.baseY + buffer.cursorY)) : void 0;
    const executedMarker = serialized.executedLine !== void 0 ? xterm.registerMarker(serialized.executedLine - (buffer.baseY + buffer.cursorY)) : void 0;
    const newCommand = new _TerminalCommand(xterm, {
      command: isCommandStorageDisabled ? "" : serialized.command,
      commandLineConfidence: serialized.commandLineConfidence ?? "low",
      isTrusted: serialized.isTrusted,
      id: serialized.id,
      promptStartMarker,
      marker,
      startX: serialized.startX,
      endMarker,
      executedMarker,
      executedX: serialized.executedX,
      timestamp: serialized.timestamp,
      duration: serialized.duration,
      cwd: serialized.cwd,
      commandStartLineContent: serialized.commandStartLineContent,
      exitCode: serialized.exitCode,
      markProperties: serialized.markProperties,
      aliases: void 0,
      wasReplayed: true
    });
    return newCommand;
  }
  serialize(isCommandStorageDisabled) {
    return {
      promptStartLine: this.promptStartMarker?.line,
      startLine: this.marker?.line,
      startX: void 0,
      endLine: this.endMarker?.line,
      executedLine: this.executedMarker?.line,
      executedX: this.executedX,
      command: isCommandStorageDisabled ? "" : this.command,
      commandLineConfidence: isCommandStorageDisabled ? "low" : this.commandLineConfidence,
      isTrusted: this.isTrusted,
      cwd: this.cwd,
      exitCode: this.exitCode,
      commandStartLineContent: this.commandStartLineContent,
      timestamp: this.timestamp,
      duration: this.duration,
      markProperties: this.markProperties,
      id: this.id
    };
  }
  extractCommandLine() {
    return extractCommandLine(this._xterm.buffer.active, this._xterm.cols, this.marker, this.startX, this.executedMarker, this.executedX);
  }
  getOutput() {
    if (!this.executedMarker || !this.endMarker) {
      return void 0;
    }
    const startLine = this.executedMarker.line;
    const endLine = this.endMarker.line;
    if (startLine === endLine) {
      return void 0;
    }
    let output = "";
    let currentLine = "";
    let line;
    const buffer = this._xterm.buffer.active;
    for (let i2 = startLine; i2 < endLine; i2++) {
      line = buffer.getLine(i2);
      if (!line) {
        continue;
      }
      const isWrapped = i2 + 1 < endLine ? !!buffer.getLine(i2 + 1)?.isWrapped : false;
      currentLine += line.translateToString(!isWrapped);
      if (!isWrapped) {
        output += currentLine + "\n";
        currentLine = "";
      }
    }
    if (currentLine.length > 0) {
      output += currentLine;
    }
    return output === "" ? void 0 : output;
  }
  getOutputMatch(outputMatcher) {
    if (!this.executedMarker || !this.endMarker) {
      return void 0;
    }
    const endLine = this.endMarker.line;
    if (endLine === -1) {
      return void 0;
    }
    const buffer = this._xterm.buffer.active;
    const startLine = Math.max(this.executedMarker.line, 0);
    const matcher = outputMatcher.lineMatcher;
    const linesToCheck = isString(matcher) ? 1 : outputMatcher.length || countNewLines(matcher);
    const lines = [];
    let match2;
    if (outputMatcher.anchor === "bottom") {
      for (let i2 = endLine - (outputMatcher.offset || 0); i2 >= startLine; i2--) {
        let wrappedLineStart = i2;
        const wrappedLineEnd = i2;
        while (wrappedLineStart >= startLine && buffer.getLine(wrappedLineStart)?.isWrapped) {
          wrappedLineStart--;
        }
        i2 = wrappedLineStart;
        lines.unshift(getXtermLineContent(buffer, wrappedLineStart, wrappedLineEnd, this._xterm.cols));
        if (!match2) {
          match2 = lines[0].match(matcher);
        }
        if (lines.length >= linesToCheck) {
          break;
        }
      }
    } else {
      for (let i2 = startLine + (outputMatcher.offset || 0); i2 < endLine; i2++) {
        const wrappedLineStart = i2;
        let wrappedLineEnd = i2;
        while (wrappedLineEnd + 1 < endLine && buffer.getLine(wrappedLineEnd + 1)?.isWrapped) {
          wrappedLineEnd++;
        }
        i2 = wrappedLineEnd;
        lines.push(getXtermLineContent(buffer, wrappedLineStart, wrappedLineEnd, this._xterm.cols));
        if (!match2) {
          match2 = lines[lines.length - 1].match(matcher);
        }
        if (lines.length >= linesToCheck) {
          break;
        }
      }
    }
    return match2 ? { regexMatch: match2, outputLines: lines } : void 0;
  }
  hasOutput() {
    return !this.executedMarker?.isDisposed && !this.endMarker?.isDisposed && !!(this.executedMarker && this.endMarker && this.executedMarker.line < this.endMarker.line);
  }
  getPromptRowCount() {
    return getPromptRowCount(this, this._xterm.buffer.active);
  }
  getCommandRowCount() {
    return getCommandRowCount(this);
  }
};

var PartialTerminalCommand = class {
  constructor(_xterm, id2) {
    this._xterm = _xterm;
    this.id = id2 ?? generateUuid();
  }
  serialize(cwd2) {
    if (!this.commandStartMarker) {
      return void 0;
    }
    return {
      promptStartLine: this.promptStartMarker?.line,
      startLine: this.commandStartMarker.line,
      startX: this.commandStartX,
      endLine: void 0,
      executedLine: void 0,
      executedX: void 0,
      command: "",
      commandLineConfidence: "low",
      isTrusted: true,
      cwd: cwd2,
      exitCode: void 0,
      commandStartLineContent: void 0,
      timestamp: 0,
      duration: 0,
      markProperties: void 0,
      id: this.id
    };
  }
  promoteToFullCommand(cwd2, exitCode, ignoreCommandLine, markProperties) {
    if (exitCode === void 0 && this.command === void 0) {
      this.command = "";
    }
    if (this.command !== void 0 && !this.command.startsWith("\\") || ignoreCommandLine) {
      return new TerminalCommand(this._xterm, {
        command: ignoreCommandLine ? "" : this.command || "",
        commandLineConfidence: ignoreCommandLine ? "low" : this.commandLineConfidence || "low",
        isTrusted: !!this.isTrusted,
        id: this.id,
        promptStartMarker: this.promptStartMarker,
        marker: this.commandStartMarker,
        startX: this.commandStartX,
        endMarker: this.commandFinishedMarker,
        executedMarker: this.commandExecutedMarker,
        executedX: this.commandExecutedX,
        timestamp: Date.now(),
        duration: this.commandDuration || 0,
        cwd: cwd2,
        exitCode,
        commandStartLineContent: this.commandStartLineContent,
        markProperties
      });
    }
    return void 0;
  }
  markExecutedTime() {
    if (this.commandExecutedTimestamp === void 0) {
      this.commandExecutedTimestamp = Date.now();
    }
  }
  markFinishedTime() {
    if (this.commandDuration === void 0 && this.commandExecutedTimestamp !== void 0) {
      this.commandDuration = Date.now() - this.commandExecutedTimestamp;
    }
  }
  extractCommandLine() {
    return extractCommandLine(this._xterm.buffer.active, this._xterm.cols, this.commandStartMarker, this.commandStartX, this.commandExecutedMarker, this.commandExecutedX);
  }
  getPromptRowCount() {
    return getPromptRowCount(this, this._xterm.buffer.active);
  }
  getCommandRowCount() {
    return getCommandRowCount(this);
  }
};

function extractCommandLine(buffer, cols, commandStartMarker, commandStartX, commandExecutedMarker, commandExecutedX) {
  if (!commandStartMarker || !commandExecutedMarker || commandStartX === void 0 || commandExecutedX === void 0) {
    return "";
  }
  let content = "";
  for (let i2 = commandStartMarker.line; i2 <= commandExecutedMarker.line; i2++) {
    const line = buffer.getLine(i2);
    if (line) {
      content += line.translateToString(true, i2 === commandStartMarker.line ? commandStartX : 0, i2 === commandExecutedMarker.line ? commandExecutedX : cols);
    }
  }
  return content;
}

function getXtermLineContent(buffer, lineStart, lineEnd, cols) {
  const maxLineLength = Math.max(2048 / cols * 2);
  lineEnd = Math.min(lineEnd, lineStart + maxLineLength);
  let content = "";
  for (let i2 = lineStart; i2 <= lineEnd; i2++) {
    const line = buffer.getLine(i2);
    if (line) {
      content += line.translateToString(true, 0, cols);
    }
  }
  return content;
}

function countNewLines(regex) {
  if (!regex.multiline) {
    return 1;
  }
  const source = regex.source;
  let count2 = 1;
  let i2 = source.indexOf("\\n");
  while (i2 !== -1) {
    count2++;
    i2 = source.indexOf("\\n", i2 + 1);
  }
  return count2;
}

function getPromptRowCount(command4, buffer) {
  const marker = isFullTerminalCommand(command4) ? command4.marker : command4.commandStartMarker;
  if (!marker || !command4.promptStartMarker) {
    return 1;
  }
  let promptRowCount = 1;
  let promptStartLine = command4.promptStartMarker.line;
  while (promptStartLine < marker.line && (buffer.getLine(promptStartLine)?.translateToString(true) ?? "").length === 0) {
    promptStartLine++;
  }
  promptRowCount = marker.line - promptStartLine + 1;
  return promptRowCount;
}

function getCommandRowCount(command4) {
  const marker = isFullTerminalCommand(command4) ? command4.marker : command4.commandStartMarker;
  const executedMarker = isFullTerminalCommand(command4) ? command4.executedMarker : command4.commandExecutedMarker;
  if (!marker || !executedMarker) {
    return 1;
  }
  const commandExecutedLine = Math.max(executedMarker.line, marker.line);
  let commandRowCount = commandExecutedLine - marker.line + 1;
  const executedX = isFullTerminalCommand(command4) ? command4.executedX : command4.commandExecutedX;
  if (executedX === 0) {
    commandRowCount--;
  }
  return commandRowCount;
}

function isFullTerminalCommand(command4) {
  return !!command4.hasOutput;
}
export { extractCommandLine, getXtermLineContent, countNewLines, getPromptRowCount, getCommandRowCount, isFullTerminalCommand, TerminalCommand, PartialTerminalCommand };
