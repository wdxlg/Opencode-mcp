// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/toolTerminalCreator.ts
import { Event2 } from "./module-0017.mjs";
import { hasKey, isNumber, isObject, isString } from "./module-0010.mjs";
import { getShellIntegrationTimeout } from "./module-3037.mjs";
import { CancellationError } from "./module-0004.mjs";
import { DeferredPromise, disposableTimeout, raceTimeout } from "./module-0036.mjs";
import { AiAgentEnvValue, AiAgentEnvVar } from "./module-3129.mjs";
import { isBash, isFish, isPowerShell, isZsh } from "./module-3109.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITerminalLogService } from "./module-1155.mjs";
import { ITerminalService } from "./module-1150.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/toolTerminalCreator.ts
var ToolTerminalCreator = class {
  constructor(_accessibilityService, _configurationService, _logService, _terminalService) {
    this._accessibilityService = _accessibilityService;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._terminalService = _terminalService;
  }
  static {
    /**
     * The shell preference cached for the lifetime of the window. This allows skipping previous
     * shell approaches that failed in previous runs to save time.
     */
    this._lastSuccessfulShell = 0 /* Unknown */;
  }
  async createTerminal(shellOrProfile, os, token) {
    const instance2 = await this._createCopilotTerminal(shellOrProfile, os);
    const toolTerminal = {
      instance: instance2,
      shellIntegrationQuality: "none" /* None */
    };
    let processReadyTimestamp = 0;
    const initResult = await Promise.any([
      instance2.processReady.then(() => processReadyTimestamp = Date.now()),
      Event2.toPromise(instance2.onExit)
    ]);
    if (!isNumber(initResult) && isObject(initResult) && hasKey(initResult, { message: true })) {
      throw new Error(initResult.message);
    }
    const siInjectionEnabled = this._configurationService.getValue("terminal.integrated.shellIntegration.enabled" /* ShellIntegrationEnabled */) === true;
    const waitTime = getShellIntegrationTimeout(
      this._configurationService,
      siInjectionEnabled,
      instance2.hasRemoteAuthority,
      processReadyTimestamp
    );
    if (ToolTerminalCreator._lastSuccessfulShell !== 2 /* Fallback */ || siInjectionEnabled) {
      this._logService.info(`ToolTerminalCreator#createTerminal: Waiting ${waitTime}ms for shell integration`);
      const shellIntegrationQuality = await this._waitForShellIntegration(instance2, waitTime);
      if (token.isCancellationRequested) {
        instance2.dispose();
        throw new CancellationError();
      }
      if (shellIntegrationQuality === "rich" /* Rich */) {
        const commandDetection = instance2.capabilities.get(2 /* CommandDetection */);
        if (commandDetection?.promptInputModel.state === 0 /* Unknown */) {
          this._logService.info(`ToolTerminalCreator#createTerminal: Waiting up to 2s for PromptInputModel state to change`);
          const didStart = await raceTimeout(Event2.toPromise(commandDetection.onCommandStarted), 2e3);
          if (!didStart) {
            this._logService.info(`ToolTerminalCreator#createTerminal: PromptInputModel state did not change within timeout`);
          }
        }
      }
      if (shellIntegrationQuality !== "none" /* None */) {
        ToolTerminalCreator._lastSuccessfulShell = 1 /* Default */;
        toolTerminal.shellIntegrationQuality = shellIntegrationQuality;
        return toolTerminal;
      }
    } else {
      this._logService.info(`ToolTerminalCreator#createTerminal: Skipping wait for shell integration - last successful launch type ${ToolTerminalCreator._lastSuccessfulShell}`);
    }
    ToolTerminalCreator._lastSuccessfulShell = 2 /* Fallback */;
    return toolTerminal;
  }
  /**
   * Synchronously update shell integration quality based on the terminal instance's current
   * capabilities. This is a defensive change to avoid no shell integration being sticky
   * https://github.com/microsoft/vscode/issues/260880
   *
   * Only upgrade quality just in case.
   */
  refreshShellIntegrationQuality(toolTerminal) {
    const commandDetection = toolTerminal.instance.capabilities.get(2 /* CommandDetection */);
    if (commandDetection) {
      if (toolTerminal.shellIntegrationQuality === "none" /* None */ || toolTerminal.shellIntegrationQuality === "basic" /* Basic */) {
        toolTerminal.shellIntegrationQuality = commandDetection.hasRichCommandDetection ? "rich" /* Rich */ : "basic" /* Basic */;
      }
    }
  }
  _createCopilotTerminal(shellOrProfile, os) {
    const shellPath = isString(shellOrProfile) ? shellOrProfile : shellOrProfile.path;
    const env2 = {
      // Let CLI tools detect that they are running inside an AI agent.
      // This allows programs to adapt their output (e.g. JSON instead of
      // ANSI, disable interactive prompts, skip animations).
      // See https://github.com/microsoft/vscode/issues/311734
      // `AI_AGENT` is the cross-vendor standard; `COPILOT_AGENT` is kept
      // for back-compat with CLIs that already adopted it.
      [AiAgentEnvVar]: AiAgentEnvValue,
      COPILOT_AGENT: "1",
      // Avoid making `git diff` interactive when called from copilot
      GIT_PAGER: "cat",
      // Prevent git from opening an editor for merge commits
      GIT_MERGE_AUTOEDIT: "no",
      // Prevent git from opening an editor (e.g. for commit --amend, rebase -i).
      // `:` is a POSIX shell built-in no-op (returns 0), works cross-platform
      // since git always invokes the editor via `sh -c`.
      GIT_EDITOR: ":",
      // Prevent apt/dpkg from opening interactive prompts (e.g. needrestart
      // "Which services should be restarted?" dialogs). The agent cannot
      // drive TUI prompts, so non-interactive mode picks safe defaults.
      DEBIAN_FRONTEND: "noninteractive"
    };
    const preventShellHistory = this._configurationService.getValue("chat.tools.terminal.preventShellHistory" /* PreventShellHistory */) === true;
    if (preventShellHistory) {
      if (isBash(shellPath, os) || isZsh(shellPath, os) || isFish(shellPath, os) || isPowerShell(shellPath, os)) {
        env2["VSCODE_PREVENT_SHELL_HISTORY"] = "1";
      }
    }
    if (isZsh(shellPath, os)) {
      env2["VSCODE_AGENT_ZSH_FIXUPS"] = "1";
    }
    const config = {
      icon: ThemeIcon.fromId(Codicon.chatSparkle.id),
      hideFromUser: true,
      forcePersist: true,
      env: env2
    };
    if (isString(shellOrProfile)) {
      config.executable = shellOrProfile;
    } else {
      config.executable = shellOrProfile.path;
      config.args = shellOrProfile.args;
      config.icon = shellOrProfile.icon ?? config.icon;
      config.color = shellOrProfile.color;
      config.env = {
        ...config.env,
        ...shellOrProfile.env
      };
    }
    return this._terminalService.createTerminal({ config });
  }
  _waitForShellIntegration(instance2, timeoutMs) {
    const store = new DisposableStore();
    const result = new DeferredPromise();
    const isScreenReaderOptimized = this._accessibilityService.isScreenReaderOptimized();
    const effectiveTimeoutMs = timeoutMs > 0 && isScreenReaderOptimized ? timeoutMs + 3e3 : timeoutMs;
    this._logService.info(`ToolTerminalCreator#_waitForShellIntegration: base ${timeoutMs}ms, effective ${effectiveTimeoutMs}ms, screenReaderOptimized=${isScreenReaderOptimized}`);
    const siNoneTimer = store.add(new MutableDisposable());
    siNoneTimer.value = disposableTimeout(() => {
      this._logService.info(`ToolTerminalCreator#_waitForShellIntegration: Timed out ${effectiveTimeoutMs}ms, using no SI`);
      result.complete("none" /* None */);
    }, effectiveTimeoutMs);
    if (instance2.capabilities.get(2 /* CommandDetection */)?.hasRichCommandDetection) {
      siNoneTimer.clear();
      this._logService.info(`ToolTerminalCreator#_waitForShellIntegration: Rich SI available immediately`);
      result.complete("rich" /* Rich */);
    } else {
      const onSetRichCommandDetection = store.add(this._terminalService.createOnInstanceCapabilityEvent(2 /* CommandDetection */, (e4) => e4.onSetRichCommandDetection));
      store.add(onSetRichCommandDetection.event((e4) => {
        if (e4.instance !== instance2) {
          return;
        }
        siNoneTimer.clear();
        this._logService.info(`ToolTerminalCreator#_waitForShellIntegration: Rich SI available eventually`);
        result.complete("rich" /* Rich */);
      }));
      const commandDetection = instance2.capabilities.get(2 /* CommandDetection */);
      if (commandDetection) {
        siNoneTimer.clear();
        store.add(disposableTimeout(() => {
          this._logService.info(`ToolTerminalCreator#_waitForShellIntegration: Timed out 200ms, using basic SI`);
          result.complete("basic" /* Basic */);
        }, 200));
      } else {
        store.add(instance2.capabilities.onDidAddCommandDetectionCapability((e4) => {
          siNoneTimer.clear();
          store.add(disposableTimeout(() => {
            this._logService.info(`ToolTerminalCreator#_waitForShellIntegration: Timed out 200ms, using basic SI (via listener)`);
            result.complete("basic" /* Basic */);
          }, 200));
        }));
      }
    }
    result.p.finally(() => {
      this._logService.info(`ToolTerminalCreator#_waitForShellIntegration: Promise complete, disposing store`);
      store.dispose();
    });
    return result.p;
  }
};

ToolTerminalCreator = __decorateClass([
  __decorateParam(0, IAccessibilityService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ITerminalLogService),
  __decorateParam(3, ITerminalService)
], ToolTerminalCreator);
export { ToolTerminalCreator };
