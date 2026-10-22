// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/largeOutputFileWriter.ts
import { Disposable } from "./module-0012.mjs";
import { MAX_OUTPUT_LENGTH, truncateLargeOutput } from "./module-3113.mjs";
import { generateUuid } from "./module-0190.mjs";
import { getTerminalOutputDirectory } from "./module-3114.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITerminalLogService } from "./module-1155.mjs";
import { IEnvironmentService } from "./module-0508.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/largeOutputFileWriter.ts
var LargeOutputFileWriter = class extends Disposable {
  constructor(_fileService, _logService, _environmentService) {
    super();
    this._fileService = _fileService;
    this._logService = _logService;
    this._environmentService = _environmentService;
    this._tempFiles = /* @__PURE__ */ new Set();
  }
  /**
   * If the output exceeds MAX_OUTPUT_LENGTH, writes it to a temp file and
   * returns a truncated message with the file path. Otherwise returns the
   * output unchanged.
   */
  async processOutput(output) {
    if (output.length <= MAX_OUTPUT_LENGTH) {
      return output;
    }
    const filePath = await this._writeToTempFile(output);
    if (!filePath) {
      return truncateLargeOutput(output);
    }
    return truncateLargeOutput(output, filePath);
  }
  async _writeToTempFile(output) {
    try {
      const fileName = `copilot-terminal-output-${generateUuid()}.txt`;
      const dirUri = getTerminalOutputDirectory(this._environmentService.cacheHome);
      const fileUri = URI.joinPath(dirUri, fileName);
      const fileContent = this._prettyPrintIfJson(output);
      await this._fileService.writeFile(fileUri, VSBuffer.fromString(fileContent));
      this._tempFiles.add(fileUri);
      this._logService.debug(`LargeOutputFileWriter: wrote ${Math.ceil(output.length / 1024)}KB to ${fileUri.fsPath}`);
      return fileUri.fsPath;
    } catch (e4) {
      this._logService.debug(`LargeOutputFileWriter: failed to write temp file: ${e4}`);
      return void 0;
    }
  }
  _prettyPrintIfJson(output) {
    const trimmed = output.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
      return output;
    }
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch {
      return output;
    }
  }
  /**
   * Cleans up all tracked temp files. Called on session end.
   */
  cleanup() {
    for (const fileUri of this._tempFiles) {
      this._fileService.del(fileUri).catch(() => {
      });
    }
    this._tempFiles.clear();
  }
  dispose() {
    this.cleanup();
    super.dispose();
  }
};

LargeOutputFileWriter = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ITerminalLogService),
  __decorateParam(2, IEnvironmentService)
], LargeOutputFileWriter);
export { LargeOutputFileWriter };
