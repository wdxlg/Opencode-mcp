// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/terminalCommandArtifactCollector.ts
import { getCommandOutputSnapshot } from "./module-2357.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalLogService } from "./module-1154.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/terminalCommandArtifactCollector.ts
var TerminalCommandArtifactCollector = class {
  constructor(_logService) {
    this._logService = _logService;
  }
  async capture(toolSpecificData, instance2, commandId) {
    if (commandId) {
      try {
        toolSpecificData.terminalCommandUri = this._createTerminalCommandUri(instance2, commandId);
      } catch (error) {
        this._logService.warn(`RunInTerminalTool: Failed to create terminal command URI for ${commandId}`, error);
      }
      const command4 = await this._tryGetCommand(instance2, commandId);
      if (command4) {
        toolSpecificData.terminalCommandState = {
          exitCode: command4.exitCode,
          timestamp: command4.timestamp,
          duration: command4.duration
        };
        const snapshot = await this._captureCommandOutput(instance2, command4);
        if (snapshot) {
          toolSpecificData.terminalCommandOutput = snapshot;
        }
        this._applyTheme(toolSpecificData, instance2);
        return;
      }
      const partialSnapshot = await this._capturePartialCommandOutput(instance2, commandId);
      if (partialSnapshot) {
        toolSpecificData.terminalCommandOutput = partialSnapshot;
        this._logService.debug(`RunInTerminalTool: Captured partial command output for ${commandId}`);
      }
    }
    this._applyTheme(toolSpecificData, instance2);
  }
  async _captureCommandOutput(instance2, command4) {
    try {
      await instance2.xtermReadyPromise;
    } catch {
      return void 0;
    }
    const xterm = instance2.xterm;
    if (!xterm) {
      return void 0;
    }
    return getCommandOutputSnapshot(xterm, command4, (reason, error) => {
      const suffix = reason === "fallback" ? " (fallback)" : "";
      this._logService.debug(`RunInTerminalTool: Failed to snapshot command output${suffix}`, error);
    });
  }
  /**
   * Captures output from a partial/current command that hasn't finished yet.
   * This is used when the command is cancelled mid-execution.
   */
  async _capturePartialCommandOutput(instance2, commandId) {
    try {
      await instance2.xtermReadyPromise;
    } catch {
      return void 0;
    }
    const xterm = instance2.xterm;
    if (!xterm) {
      return void 0;
    }
    const commandDetection = instance2.capabilities.get(2 /* CommandDetection */);
    const currentCommand = commandDetection?.currentCommand;
    if (currentCommand && currentCommand.id === commandId) {
      const executedMarker = currentCommand.commandExecutedMarker;
      if (executedMarker && !executedMarker.isDisposed) {
        try {
          const raw = xterm.raw;
          const buffer = raw.buffer.active;
          const endLine = buffer.baseY + buffer.cursorY;
          const startLine = executedMarker.line;
          const lineCount = Math.max(endLine - startLine, 0);
          if (lineCount > 0) {
            const text2 = await xterm.getRangeAsVT(executedMarker, void 0, true);
            if (text2) {
              return { text: text2, lineCount };
            }
          }
        } catch (error) {
          this._logService.debug(`RunInTerminalTool: Failed to capture partial command output`, error);
        }
      }
    }
    return void 0;
  }
  _applyTheme(toolSpecificData, instance2) {
    const theme = instance2.xterm?.getXtermTheme();
    if (theme) {
      toolSpecificData.terminalTheme = { background: theme.background, foreground: theme.foreground };
    }
  }
  _createTerminalCommandUri(instance2, commandId) {
    const params = new URLSearchParams(instance2.resource.query);
    params.set("command", commandId);
    return instance2.resource.with({ query: params.toString() });
  }
  async _tryGetCommand(instance2, commandId) {
    const commandDetection = instance2.capabilities.get(2 /* CommandDetection */);
    return commandDetection?.commands.find((c) => c.id === commandId);
  }
};

TerminalCommandArtifactCollector = __decorateClass([
  __decorateParam(0, ITerminalLogService)
], TerminalCommandArtifactCollector);
export { TerminalCommandArtifactCollector };
