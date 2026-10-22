// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineAnalyzer/commandLineFileWriteAnalyzer.ts
import { Disposable } from "./module-0012.mjs";
import { posix, win32 } from "./module-0026.mjs";
import { URI } from "./module-0032.mjs";
import { isString } from "./module-0010.mjs";
import { extUri, normalizePath } from "./module-0034.mjs";
import { containsCmdDelayedExpansion } from "./module-3138.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineAnalyzer/commandLineFileWriteAnalyzer.ts
var nullDevice = /* @__PURE__ */ Symbol("null device");

var CommandLineFileWriteAnalyzer = class extends Disposable {
  constructor(_treeSitterCommandParser, _log2, _configurationService, _labelService, _workspaceContextService) {
    super();
    this._treeSitterCommandParser = _treeSitterCommandParser;
    this._log = _log2;
    this._configurationService = _configurationService;
    this._labelService = _labelService;
    this._workspaceContextService = _workspaceContextService;
  }
  async analyze(options3) {
    let fileWrites;
    try {
      fileWrites = await this._getFileWrites(options3);
    } catch (e4) {
      console.error(e4);
      this._log("Failed to get file writes via grammar", options3.treeSitterLanguage);
      return {
        isAutoApproveAllowed: false
      };
    }
    return this._getResult(options3, fileWrites);
  }
  async _getFileWrites(options3) {
    let fileWrites = [];
    const capturedFileWrites = (await this._treeSitterCommandParser.getFileWrites(options3.treeSitterLanguage, options3.commandLine)).map(this._mapNullDevice.bind(this, options3));
    const commandFileWrites = (await this._treeSitterCommandParser.getCommandFileWrites(options3.treeSitterLanguage, options3.commandLine)).map(this._mapNullDevice.bind(this, options3));
    const allCapturedFileWrites = [...capturedFileWrites, ...commandFileWrites];
    if (allCapturedFileWrites.length) {
      const cwd2 = options3.cwd;
      if (cwd2) {
        this._log("Detected cwd", cwd2.toString());
        fileWrites = allCapturedFileWrites.map((e4) => {
          if (e4 === nullDevice) {
            return e4;
          }
          if (/^['"].*['"]$/.test(e4)) {
            e4 = this._stripSurroundingQuotes(e4);
          }
          const isAbsolute2 = options3.os === 1 /* Windows */ ? win32.isAbsolute(e4) : posix.isAbsolute(e4);
          if (isAbsolute2) {
            return cwd2.with({ path: e4 });
          }
          return URI.joinPath(cwd2, e4);
        });
      } else {
        this._log("Cwd could not be detected");
        fileWrites = allCapturedFileWrites;
      }
    }
    this._log("File writes detected", fileWrites.map((e4) => e4.toString()));
    return fileWrites;
  }
  _stripSurroundingQuotes(text2) {
    let result = text2;
    while (result.startsWith('"') && result.endsWith('"') || result.startsWith("'") && result.endsWith("'")) {
      result = result.slice(1, -1);
    }
    return result;
  }
  _mapNullDevice(options3, rawFileWrite) {
    if (options3.treeSitterLanguage === "powershell" /* PowerShell */) {
      return rawFileWrite === "$null" ? nullDevice : rawFileWrite;
    }
    return rawFileWrite === "/dev/null" ? nullDevice : rawFileWrite;
  }
  _getResult(options3, fileWrites) {
    let isAutoApproveAllowed = true;
    if (fileWrites.length > 0) {
      const blockDetectedFileWrites = this._configurationService.getValue("chat.tools.terminal.blockDetectedFileWrites" /* BlockDetectedFileWrites */);
      switch (blockDetectedFileWrites) {
        case "all": {
          isAutoApproveAllowed = false;
          this._log('File writes blocked due to "all" setting');
          break;
        }
        case "outsideWorkspace": {
          const workspaceFolders = this._workspaceContextService.getWorkspace().folders;
          if (workspaceFolders.length > 0) {
            for (const fileWrite of fileWrites) {
              if (fileWrite === nullDevice) {
                this._log("File write to null device allowed", URI.isUri(fileWrite) ? fileWrite.toString() : fileWrite);
                continue;
              }
              if (isString(fileWrite)) {
                const isAbsolute2 = options3.os === 1 /* Windows */ ? win32.isAbsolute(fileWrite) : posix.isAbsolute(fileWrite);
                if (!isAbsolute2) {
                  isAutoApproveAllowed = false;
                  this._log("File write blocked due to unknown terminal cwd", fileWrite);
                  break;
                }
              }
              const fileUri = normalizePath(URI.isUri(fileWrite) ? fileWrite : URI.file(fileWrite));
              if (fileUri.fsPath.match(/[$\(\){}`~%]/) || containsCmdDelayedExpansion(fileUri.fsPath)) {
                isAutoApproveAllowed = false;
                this._log("File write blocked due to likely containing a variable, sub-command, or tilde/environment-variable expansion", fileUri.toString());
                break;
              }
              const isInsideWorkspace = workspaceFolders.some(
                (folder) => folder.uri.scheme === fileUri.scheme && extUri.isEqualOrParent(fileUri, folder.uri)
              );
              if (!isInsideWorkspace) {
                if (options3.hasSessionAutoApproval && this._isInTempDirectory(fileUri.path, options3.os)) {
                  continue;
                }
                isAutoApproveAllowed = false;
                this._log("File write blocked outside workspace", fileUri.toString());
                break;
              }
            }
          } else {
            const hasOnlyNullDevices = fileWrites.every((fw) => fw === nullDevice);
            if (!hasOnlyNullDevices) {
              isAutoApproveAllowed = false;
              this._log("File writes blocked - no workspace folders");
            }
          }
          break;
        }
        case "never":
        default: {
          break;
        }
      }
    }
    const disclaimers = [];
    if (fileWrites.length > 0) {
      const fileWritesList = fileWrites.map((fw) => `\`${URI.isUri(fw) ? this._labelService.getUriLabel(fw) : fw === nullDevice ? "/dev/null" : fw.toString()}\``).join(", ");
      if (!isAutoApproveAllowed) {
        disclaimers.push(localize(20470, null, fileWritesList));
      } else {
        disclaimers.push(localize(20471, null, fileWritesList));
      }
    }
    return {
      isAutoApproveAllowed,
      disclaimers
    };
  }
  /**
   * Returns true if the given URI path points inside an OS temporary directory.
   * On posix systems this matches `/tmp/`. On Windows this matches any `temp`
   * or `tmp` directory segment (case-insensitive), which covers the canonical
   * user temp (`...\AppData\Local\Temp\`), system temp (`C:\Windows\Temp\`),
   * and common dev conventions like `C:\Temp\` and `C:\tmp\`.
   */
  _isInTempDirectory(uriPath, os) {
    if (os === 1 /* Windows */) {
      return /[\\/]te?mp[\\/].+/i.test(uriPath);
    }
    return uriPath.startsWith("/tmp/");
  }
};

CommandLineFileWriteAnalyzer = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, IWorkspaceContextService)
], CommandLineFileWriteAnalyzer);
export { nullDevice, CommandLineFileWriteAnalyzer };
