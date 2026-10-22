// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/telemetry/browser/terminalTelemetry.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { timeout } from "./module-0036.mjs";
import { Event2 } from "./module-0017.mjs";
import { isAuxiliaryWindow } from "./module-0002.mjs";
import { getWindowById } from "./module-0075.mjs";
import { TelemetryTrustedValue } from "./module-0887.mjs";
import { isString } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { ITerminalEditorService, ITerminalService } from "./module-1150.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { basename } from "./module-0026.mjs";


// src/vs/workbench/contrib/terminalContrib/telemetry/browser/terminalTelemetry.ts
var TerminalTelemetryContribution = class extends Disposable {
  constructor(lifecycleService, terminalService, terminalEditorService, _telemetryService) {
    super();
    this._telemetryService = _telemetryService;
    this._register(terminalService.onDidCreateInstance(async (instance2) => {
      const store = new DisposableStore();
      this._store.add(store);
      await Promise.race([
        // Wait for process ready so the shell launch config is fully resolved, then
        // allow another 10 seconds for the shell integration to be fully initialized
        instance2.processReady.then(() => {
          return timeout(1e4);
        }),
        // If the terminal is disposed, it's ready to report on immediately
        Event2.toPromise(instance2.onDisposed, store),
        // If the app is shutting down, flush
        Event2.toPromise(lifecycleService.onWillShutdown, store)
      ]);
      let isInAuxWindow = false;
      try {
        const input = terminalEditorService.getInputFromResource(instance2.resource);
        const windowId = input.group?.windowId;
        isInAuxWindow = !!(windowId && isAuxiliaryWindow(getWindowById(windowId, true).window));
      } catch {
      }
      this._logCreateInstance(instance2, isInAuxWindow);
      this._store.delete(store);
    }));
    this._register(terminalService.onAnyInstanceShellTypeChanged((instance2) => {
      this._logShellTypeChanged(instance2);
    }));
  }
  static {
    this.ID = "terminalTelemetry";
  }
  _logCreateInstance(instance2, isInAuxWindow) {
    const slc = instance2.shellLaunchConfig;
    const commandDetection = instance2.capabilities.get(2 /* CommandDetection */);
    this._telemetryService.publicLog2("terminal/createInstance", {
      location: instance2.target === 1 /* Panel */ ? "view" : instance2.target === 2 /* Editor */ ? isInAuxWindow ? "editor-auxwindow" : "editor" : "unknown",
      shellType: new TelemetryTrustedValue(getSanitizedShellType(slc)),
      promptType: new TelemetryTrustedValue(instance2.capabilities.get(6 /* PromptTypeDetection */)?.promptType),
      isCustomPtyImplementation: !!slc.customPtyImplementation,
      isExtensionOwnedTerminal: !!slc.isExtensionOwnedTerminal,
      isLoginShell: (isString(slc.args) ? slc.args.split(" ") : slc.args)?.some((arg) => arg === "-l" || arg === "--login") ?? false,
      isReconnect: !!slc.attachPersistentProcess,
      hasRemoteAuthority: instance2.hasRemoteAuthority,
      shellIntegrationQuality: commandDetection?.hasRichCommandDetection ? 2 : commandDetection ? 1 : 0,
      shellIntegrationInjected: instance2.usedShellIntegrationInjection,
      shellIntegrationInjectionFailureReason: instance2.shellIntegrationInjectionFailureReason,
      imageAddonLoaded: instance2.xterm?.isImageAddonLoaded ?? false,
      terminalSessionId: instance2.sessionId
    });
  }
  _logShellTypeChanged(instance2) {
    this._telemetryService.publicLog2("terminal/shellTypeChanged", {
      shellType: new TelemetryTrustedValue(instance2.shellType ?? "unknown"),
      terminalSessionId: instance2.sessionId
    });
  }
};

TerminalTelemetryContribution = __decorateClass([
  __decorateParam(0, ILifecycleService),
  __decorateParam(1, ITerminalService),
  __decorateParam(2, ITerminalEditorService),
  __decorateParam(3, ITelemetryService)
], TerminalTelemetryContribution);

var shellTypeExecutableAllowList = /* @__PURE__ */ new Set([
  // Windows only
  "cmd" /* CommandPrompt */,
  "wsl" /* Wsl */,
  // Common Unix shells
  "bash" /* Bash */,
  "fish" /* Fish */,
  "pwsh" /* Pwsh */,
  "sh" /* Sh */,
  "ssh" /* Ssh */,
  "tmux" /* Tmux */,
  "zsh" /* Zsh */,
  // More shells
  "amm" /* Amm */,
  "ash" /* Ash */,
  "csh" /* Csh */,
  "dash" /* Dash */,
  "elvish" /* Elvish */,
  "ion" /* Ion */,
  "ksh" /* Ksh */,
  "mksh" /* Mksh */,
  "msh" /* Msh */,
  "nu" /* NuShell */,
  "rc" /* Plan9Shell */,
  "scsh" /* SchemeShell */,
  "tcsh" /* Tcsh */,
  "termux" /* Termux */,
  "xonsh" /* Xonsh */,
  // Lanugage REPLs
  "clj" /* Clojure */,
  "sbcl" /* CommonLispSbcl */,
  "crystal" /* Crystal */,
  "deno" /* Deno */,
  "iex" /* Elixir */,
  "erl" /* Erlang */,
  "fsi" /* FSharp */,
  "go" /* Go */,
  "ghci" /* HaskellGhci */,
  "jshell" /* Java */,
  "julia" /* Julia */,
  "lua" /* Lua */,
  "node" /* Node */,
  "ocaml" /* Ocaml */,
  "perl" /* Perl */,
  "php" /* Php */,
  "swipl" /* PrologSwipl */,
  "python" /* Python */,
  "R" /* R */,
  "irb" /* RubyIrb */,
  "scala" /* Scala */,
  "racket" /* SchemeRacket */,
  "gst" /* SmalltalkGnu */,
  "pharo" /* SmalltalkPharo */,
  "tclsh" /* Tcl */,
  "ts-node" /* TsNode */
]);

var shellTypeExecutableRegexAllowList = [
  { regex: /^(?:pwsh|powershell)-preview$/i, type: "pwsh-preview" /* PwshPreview */ },
  { regex: /^python(?:\d+(?:\.\d+)?)?$/i, type: "python" /* Python */ }
];

var shellTypePathRegexAllowList = [
  // Cygwin uses bash.exe, so look up based on the path
  { regex: /\\Cygwin(?:64)?\\.+\\bash\.exe$/i, type: "cygwin-bash" /* Cygwin */ },
  // Git bash uses bash.exe, so look up based on the path
  { regex: /\\Git\\.+\\bash\.exe$/i, type: "git-bash" /* GitBash */ },
  // Msys2 uses bash.exe, so look up based on the path
  { regex: /\\msys(?:32|64)\\.+\\(?:bash|msys2)\.exe$/i, type: "msys2-bash" /* Msys2 */ },
  // WindowsPowerShell should always be installed on this path, we cannot just look at the
  // executable name since powershell is the CLI on other platforms sometimes (eg. snap package)
  { regex: /\\WindowsPowerShell\\v1.0\\powershell.exe$/i, type: "windows-powershell" /* WindowsPowerShell */ },
  // WSL executables will represent some other shell in the end, but it's difficult to determine
  // when we log
  { regex: /\\Windows\\(?:System32|SysWOW64|Sysnative)\\(?:bash|wsl)\.exe$/i, type: "wsl" /* Wsl */ }
];

function getSanitizedShellType(slc) {
  if (!slc.executable) {
    return "unknown" /* Unknown */;
  }
  const executableFile = basename(slc.executable);
  const executableFileWithoutExt = executableFile.replace(/\.[^\.]+$/, "");
  for (const entry of shellTypePathRegexAllowList) {
    if (entry.regex.test(slc.executable)) {
      return entry.type;
    }
  }
  for (const entry of shellTypeExecutableRegexAllowList) {
    if (entry.regex.test(executableFileWithoutExt)) {
      return entry.type;
    }
  }
  if (shellTypeExecutableAllowList.has(executableFileWithoutExt)) {
    return executableFileWithoutExt;
  }
  return "unknown" /* Unknown */;
}
export { getSanitizedShellType, TerminalTelemetryContribution, shellTypeExecutableAllowList, shellTypeExecutableRegexAllowList, shellTypePathRegexAllowList };
