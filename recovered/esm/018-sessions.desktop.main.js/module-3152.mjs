// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/runInTerminalTool.ts
import { buildCommandDisplayText, extractCdPrefix, isFish, isPowerShell, isWindowsPowerShell, isZsh, normalizeTerminalCommandForDisplay } from "./module-3109.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITerminalSandboxService } from "./module-3125.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { isOpenCodeAutoApproveMode } from "./module-0965.mjs";
import { localize } from "./module-0001.mjs";
import { ILanguageModelToolsService, ToolDataSource } from "./module-0991.mjs";
import { Codicon } from "./module-0085.mjs";
import { SandboxOutputAnalyzer, outputLooksSandboxBlocked, outputLooksSandboxNetworkBlocked } from "./module-3149.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { OS } from "./module-0014.mjs";
import { ToolTerminalCreator } from "./module-3130.mjs";
import { TreeSitterCommandParser } from "./module-3134.mjs";
import { RunInTerminalToolTelemetry } from "./module-3131.mjs";
import { TerminalCommandArtifactCollector } from "./module-3148.mjs";
import { LargeOutputFileWriter } from "./module-3115.mjs";
import { CommandLineCdPrefixRewriter } from "./module-3143.mjs";
import { CommandLinePwshChainOperatorRewriter } from "./module-3145.mjs";
import { CommandLineSandboxRewriter } from "./module-3147.mjs";
import { CommandLineBackgroundDetachRewriter } from "./module-3146.mjs";
import { CommandLinePreventHistoryRewriter } from "./module-3144.mjs";
import { CommandLineFileWriteAnalyzer } from "./module-3139.mjs";
import { CommandLineAutoApproveAnalyzer } from "./module-3137.mjs";
import { CommandLineSandboxAnalyzer } from "./module-3140.mjs";
import { SandboxedCommandLinePresenter } from "./module-3128.mjs";
import { NodeCommandLinePresenter } from "./module-3116.mjs";
import { PythonCommandLinePresenter } from "./module-3117.mjs";
import { RubyCommandLinePresenter } from "./module-3118.mjs";
import { Event2 } from "./module-0017.mjs";
import { MarkdownString, appendEscapedMarkdownInlineCode, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { generateUuid } from "./module-0190.mjs";
import { getRecommendedToolsOverRunInTerminal } from "./module-3105.mjs";
import { isSessionAutoApproveLevel, isTerminalAutoApproveAllowed, isToolEligibleForTerminalAutoApproval } from "./module-3150.mjs";
import { basename, posix, win32 } from "./module-0026.mjs";
import { URI } from "./module-0032.mjs";
import { ChatModel } from "./module-1193.mjs";
import { ChatElicitationRequestPart } from "./module-2874.mjs";
import { CancellationError } from "./module-0004.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { clamp } from "./module-0040.mjs";
import { DeferredPromise, RunOnceScheduler, timeout } from "./module-0036.mjs";
import { OutputMonitor } from "./module-3142.mjs";
import { DEFAULT_IDLE_SILENCE_TIMEOUT_MS } from "./module-1162.mjs";
import { count } from "./module-0030.mjs";
import { getOutput } from "./module-3113.mjs";
import { compact } from "./module-3151.mjs";
import { getMediaMime } from "./module-0136.mjs";
import { LocalChatSessionUri, chatSessionResourceToId } from "./module-0962.mjs";
import { isNumber, isString } from "./module-0010.mjs";
import { constObservable } from "./module-0061.mjs";
import { autorun } from "./module-0052.mjs";
import { ChatQuestionCarouselData } from "./module-1192.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0973.mjs";
import { IFileService } from "./module-0269.mjs";
import { IHistoryService } from "./module-1493.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITerminalChatService, ITerminalService } from "./module-1150.mjs";
import { ITerminalLogService } from "./module-1155.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IAgentSessionsService } from "./module-1463.mjs";
import { IChatSessionsService } from "./module-0961.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { NoneExecuteStrategy } from "./module-3111.mjs";
import { BasicExecuteStrategy } from "./module-3110.mjs";
import { RichExecuteStrategy } from "./module-3112.mjs";
import { ITerminalProfileResolverService } from "./module-1174.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/runInTerminalTool.ts
var TERMINAL_SANDBOX_DOCUMENTATION_URL = "https://aka.ms/vscode-sandboxing";

var TOOL_REFERENCE_NAME = "runInTerminal";

var LEGACY_TOOL_REFERENCE_FULL_NAMES = ["runCommands/runInTerminal"];

var INPUT_NEEDED_NOTIFICATION_THROTTLE_MS = 5e3;

function createPowerShellModelDescription(shell, sandboxingOptions, includeElevationGuidance) {
  const isWinPwsh = isWindowsPowerShell(shell);
  const parts = [
    `This tool allows you to execute ${isWinPwsh ? "Windows PowerShell 5.1" : "PowerShell"} commands in a persistent terminal session, preserving environment variables, working directory, and other context across multiple commands.`,
    "",
    "Command Execution:",
    // IMPORTANT: PowerShell 5 does not support `&&` so always re-write them to `;`. Note that
    // the behavior of `&&` differs a little from `;` but in general it's fine
    isWinPwsh ? "- Use semicolons ; to chain commands on one line, NEVER use && even when asked explicitly" : "- Prefer ; when chaining commands on one line",
    "- Prefer pipelines | for object-based data flow",
    '- Never create a sub-shell (eg. powershell -c "command") unless explicitly asked',
    "",
    "Directory Management:",
    "- Prefer relative paths when navigating directories, only use absolute when the path is far away or the current cwd is not expected",
    "- By default (mode=sync), shell and cwd are reused by subsequent sync commands",
    "- Use $PWD or Get-Location for current directory",
    "- Use Push-Location/Pop-Location for directory stack",
    "",
    "Program Execution:",
    "- Supports .NET, Python, Node.js, and other executables",
    "- Install modules via Install-Module, Install-Package",
    "- Use Get-Command to verify cmdlet/function availability",
    "",
    "Execution Mode:",
    "- For ALL one-shot commands (builds, tests, installs, compilation, linting, downloads, scripts), use mode=sync and omit timeout. The tool waits for the command to complete and returns full output inline. This is the default and strongly preferred mode.",
    `- Use mode=async ONLY for processes that must keep running indefinitely while you do other work (servers, watchers, dev daemons). Async waits for an initial idle/output signal, then returns a terminal ID and output snapshot while the process continues running.`,
    `- In sync mode, the full output is returned when the command completes \u2014 you do NOT need to call ${"get_terminal_output" /* GetTerminalOutput */} afterward. Only use ${"get_terminal_output" /* GetTerminalOutput */} if the tool result explicitly says the command was moved to background, timed out, or needs input.`,
    "- Returns a terminal ID for checking status and runtime later",
    "- Use Start-Job for background PowerShell jobs",
    "",
    `Use ${"send_to_terminal" /* SendToTerminal */} to send commands or input to a terminal session.`
  ];
  if (sandboxingOptions.sandboxMode !== "off") {
    parts.push(...createSandboxLines(sandboxingOptions));
  }
  parts.push(
    "",
    "Output Management:",
    "- Output exceeding 20KB is saved to a temp file; the result includes the file path so you can read the full output with readFile or search it with grep",
    "- Use Select-Object, Where-Object, Format-Table to filter output",
    "- Use -First/-Last parameters to limit results",
    "- For pager commands, add | Out-String or | Format-List",
    "",
    "Best Practices:",
    "- Use proper cmdlet names instead of aliases in scripts",
    '- Quote paths with spaces: "C:\\Path With Spaces"',
    "- Prefer PowerShell cmdlets over external commands when available",
    "- Prefer idiomatic PowerShell like Get-ChildItem instead of dir or ls for file listings",
    "- Use Test-Path to check file/directory existence",
    "- Be specific with Select-Object properties to avoid excessive output",
    "- Avoid printing credentials unless absolutely required",
    ...includeElevationGuidance ? [
      "- Avoid commands that trigger an interactive elevation prompt, such as Start-Process -Verb RunAs or runas.exe. They block on a UAC/password prompt that cannot be answered in this mode, and secrets must never be routed through the model. If elevated privileges are required, tell the user to run the command themselves and stop \u2014 do NOT retry the command with variations."
    ] : [],
    `- NEVER run Start-Sleep or similar wait commands. You will be automatically notified on your next turn when async terminal commands or timed-out sync commands complete or need input. Do NOT poll for completion.`,
    "- NEVER pipe interactive commands through Select-Object, Where-Object, or other filters \u2014 this hides prompts and prevents the terminal from detecting when input is needed. Run interactive commands without pipes.",
    "",
    "Interactive Input Handling:",
    "- When a terminal command is waiting for interactive input, do NOT suggest alternatives or ask the user whether to proceed. Instead, use the vscode_askQuestions tool to collect the needed values from the user, then send them.",
    `- NEVER use vscode_askQuestions to request sensitive input such as passwords, passphrases, API keys, tokens, or other secrets \u2014 answers to that tool are sent through the model. If the prompt requires a secret, tell the user to type it directly into the terminal and stop; do not call vscode_askQuestions or ${"send_to_terminal" /* SendToTerminal */} for that prompt.`,
    `- Send exactly one answer per prompt using ${"send_to_terminal" /* SendToTerminal */}. Never send multiple answers in a single send.`,
    `- After each send, call ${"get_terminal_output" /* GetTerminalOutput */} to read the next prompt before sending the next answer.`,
    "- Continue one prompt at a time until the command finishes."
  );
  return parts.join("\n");
}

function createSandboxLines(sandboxingOptions) {
  const isNetworkAvailable = sandboxingOptions.sandboxMode === "on-network-available";
  const lines = [
    "",
    "Sandboxing:",
    isNetworkAvailable ? "- Commands run inside a sandbox by default. The sandbox keeps the filesystem mostly read-only." : "- Commands run inside a sandbox by default. The sandbox restricts two things independently: the filesystem and the network.",
    "- Filesystem: read-only outside the workspace and $TMPDIR, which stay read-write. Parts of $HOME are hidden for privacy, but common developer tools (git, package managers, language toolchains) still work because their $HOME config and cache paths are automatically made readable.",
    "- Use $TMPDIR for temporary files; /tmp may not be writable. On macOS and Linux the TMPDIR env var is set to a writable path.",
    "- If a command needs sandboxed write access to specific file paths outside workspace, pass requestFileValidationCheck with those paths. VS Code checks sandbox access before execution and returns Access Denied without running the command when access is unavailable."
  ];
  if (!isNetworkAvailable) {
    const deniedDomains = sandboxingOptions.networkDomains?.deniedDomains ?? [];
    const allowedDomains = sandboxingOptions.networkDomains?.allowedDomains ?? [];
    const deniedSet = new Set(deniedDomains);
    const effectiveAllowed = allowedDomains.filter((d) => !deniedSet.has(d));
    const retrySuffix = sandboxingOptions.retryWithAllowNetworkRequests ? " unless requestAllowNetwork=true is set" : "";
    if (effectiveAllowed.length === 0) {
      lines.push(`- Network: blocked in the sandbox; commands that need the network fail${retrySuffix}.`);
    } else {
      lines.push(`- Network: only these domains are reachable in the sandbox: ${effectiveAllowed.join(", ")}. Other domains fail${retrySuffix}.`);
    }
    if (deniedDomains.length > 0) {
      lines.push(`- These domains are explicitly blocked in the sandbox: ${deniedDomains.join(", ")}`);
    }
  }
  if (sandboxingOptions.retryWithAllowNetworkRequests || sandboxingOptions.allowToRunUnsandboxedCommands) {
    lines.push("- To get more access (each prompts the user \u2014 never ask the user for permission yourself):");
    if (sandboxingOptions.retryWithAllowNetworkRequests) {
      lines.push(
        "  - Need a blocked domain? Set requestAllowNetwork=true and provide requestAllowNetworkReason. This keeps the filesystem sandbox in place and only relaxes the network, so prefer it for network-only needs. Do this proactively when network use is obvious (git fetch/pull/push/clone; npm/yarn/pnpm/pip/cargo/go/brew installs; curl; wget), or reactively after a network failure (e.g. 'Network request failed', HTTP code 403)."
      );
    }
    if (sandboxingOptions.allowToRunUnsandboxedCommands) {
      const removesAllClause = sandboxingOptions.retryWithAllowNetworkRequests ? "This grants full filesystem AND network access by removing all sandbox protection, so for network-only needs prefer requestAllowNetwork and use this only when filesystem (or other non-network) access is also blocked." : "This grants full filesystem and network access by removing all sandbox protection, so use it only when the command truly needs it.";
      lines.push(
        `  - Need filesystem or other access the sandbox blocks? Set requestUnsandboxedExecution=true and provide requestUnsandboxedExecutionReason. ${removesAllClause} Do this proactively when it clearly needs it (writing/deleting files outside the workspace and $TMPDIR like $HOME, /usr, /etc; installing to system locations; elevated privileges), or reactively after a sandbox failure (e.g. 'Operation not permitted').`
      );
    }
  }
  if (!sandboxingOptions.allowToRunUnsandboxedCommands) {
    lines.push("- Running commands outside the sandbox is disabled by chat.agent.sandbox.allowUnsandboxedCommands. Do not set requestUnsandboxedExecution=true.");
  }
  return lines;
}

function createSandboxProperties(sandboxingOptions) {
  const isNetworkAvailable = sandboxingOptions.sandboxMode === "on-network-available";
  return {
    ...sandboxingOptions.allowToRunUnsandboxedCommands ? {
      requestUnsandboxedExecution: {
        type: "boolean",
        description: "Request that this command run outside the terminal sandbox. Only set this when the command clearly needs unsandboxed access. The user will be prompted before the command runs unsandboxed."
      },
      requestUnsandboxedExecutionReason: {
        type: "string",
        description: "A short explanation of why this command must run outside the terminal sandbox. Only provide this when requestUnsandboxedExecution is true."
      }
    } : {},
    ...isNetworkAvailable || !sandboxingOptions.retryWithAllowNetworkRequests ? {} : {
      requestAllowNetwork: {
        type: "boolean",
        description: "Request that this command remain in the terminal sandbox but run with unrestricted network access. Only set this when the command clearly needs network access but the required network access was blocked. The user will be prompted before network restrictions are relaxed."
      },
      requestAllowNetworkReason: {
        type: "string",
        description: "A short explanation of why this sandboxed command needs unrestricted network access. Only provide this when requestAllowNetwork is true."
      }
    },
    requestFileValidationCheck: {
      type: "array",
      description: "Sandbox write access checks to perform before running the command. Provide the file paths that the command needs to write.",
      items: {
        type: "string"
      }
    },
    requestFileValidationCheckReason: {
      type: "string",
      description: "A short explanation of why this sandboxed command needs these file paths. Only provide this when requestFileValidationCheck is not empty."
    }
  };
}

function createGenericDescription(sandboxingOptions, includeElevationGuidance) {
  const parts = [`
Command Execution:
- Use && to chain simple commands on one line
- Prefer pipelines | over temporary files for data flow
- Never create a sub-shell (eg. bash -c "command") unless explicitly asked

Directory Management:
- Prefer relative paths when navigating directories, only use absolute when the path is far away or the current cwd is not expected
- By default (mode=sync), shell and cwd are reused by subsequent sync commands
- Use $PWD for current directory references
- Consider using pushd/popd for directory stack management
- Supports directory shortcuts like ~ and -

Program Execution:
- Supports Python, Node.js, and other executables
- Install packages via package managers (brew, apt, etc.)
- Use which or command -v to verify command availability

Execution Mode:
- For ALL one-shot commands (builds, tests, installs, compilation, linting, downloads, scripts), use mode='sync' and omit timeout. The tool waits for the command to complete and returns full output inline. This is the default and strongly preferred mode.
- Use mode='async' ONLY for processes that must keep running indefinitely while you do other work (servers, watchers, dev daemons). Async waits for an initial idle/output signal, then returns a terminal ID and output snapshot while the process continues running.
- In sync mode, the full output is returned when the command completes \u2014 you do NOT need to call ${"get_terminal_output" /* GetTerminalOutput */} afterward. Only use ${"get_terminal_output" /* GetTerminalOutput */} if the tool result explicitly says the command was moved to background, timed out, or needs input.

Use ${"send_to_terminal" /* SendToTerminal */} to send commands or input to a terminal session.`];
  if (sandboxingOptions.sandboxMode !== "off") {
    parts.push(createSandboxLines(sandboxingOptions).join("\n"));
  }
  parts.push(`

Output Management:
- Output exceeding 20KB is saved to a temp file; the result includes the file path so you can read the full output with readFile or search it with grep
- Use head, tail, grep, awk to filter and limit output size
- For pager commands, disable paging: git --no-pager or add | cat
- Use wc -l to count lines before displaying large outputs

Best Practices:
- Quote variables: "$var" instead of $var to handle spaces
- Use find with -exec or xargs for file operations
- Be specific with commands to avoid excessive output
- Avoid printing credentials unless absolutely required
${includeElevationGuidance ? "- Avoid commands that require interactive privilege escalation, such as sudo/su/doas without a non-interactive flag (e.g. sudo -n). They block on a password prompt that cannot be answered in this mode, and secrets must never be routed through the model. If a command needs elevated privileges, tell the user to run it themselves in the terminal and stop \u2014 do NOT retry the command with variations.\n" : ""}- NEVER run sleep or similar wait commands in a terminal. You will be automatically notified on your next turn when async terminal commands or timed-out sync commands complete or need input. Do NOT poll for completion.
- NEVER pipe interactive commands through tail, head, grep, or other filters \u2014 this hides prompts and prevents the terminal from detecting when input is needed. Run interactive commands without pipes.

Interactive Input Handling:
- When a terminal command is waiting for interactive input, do NOT suggest alternatives or ask the user whether to proceed. Instead, use the vscode_askQuestions tool to collect the needed values from the user, then send them.
- NEVER use vscode_askQuestions to request sensitive input such as passwords, passphrases, API keys, tokens, or other secrets \u2014 answers to that tool are sent through the model. If the prompt requires a secret, tell the user to type it directly into the terminal and stop; do not call vscode_askQuestions or send_to_terminal for that prompt.
- Send exactly one answer per prompt using ${"send_to_terminal" /* SendToTerminal */}. Never send multiple answers in a single send.
- After each send, call ${"get_terminal_output" /* GetTerminalOutput */} to read the next prompt before sending the next answer.
- Continue one prompt at a time until the command finishes.`);
  return parts.join("");
}

function createBashModelDescription(sandboxingOptions, includeElevationGuidance) {
  return [
    "This tool allows you to execute shell commands in a persistent bash terminal session, preserving environment variables, working directory, and other context across multiple commands.",
    createGenericDescription(sandboxingOptions, includeElevationGuidance),
    "- Use [[ ]] for conditional tests instead of [ ]",
    "- Prefer $() over backticks for command substitution"
  ].join("\n");
}

function createZshModelDescription(sandboxingOptions, includeElevationGuidance) {
  return [
    "This tool allows you to execute shell commands in a persistent zsh terminal session, preserving environment variables, working directory, and other context across multiple commands.",
    createGenericDescription(sandboxingOptions, includeElevationGuidance),
    "- Use type to check command type (builtin, function, alias)",
    "- Use jobs, fg, bg for job control",
    "- Use [[ ]] for conditional tests instead of [ ]",
    "- Prefer $() over backticks for command substitution",
    "- Take advantage of zsh globbing features (**, extended globs). Note: unmatched globs fail by default (zsh: no matches found) \u2014 use a glob qualifier like *(N) or quote the glob if it should be literal",
    "",
    "zsh pitfalls \u2014 these WILL cause errors or hangs:",
    "- NEVER use bare == or === as separators (e.g. echo === triggers zsh equals expansion). Quote them: echo '==='",
    "- NEVER use status as a variable name (it is read-only in zsh). Use exit_code or ret instead"
  ].join("\n");
}

function createFishModelDescription(sandboxingOptions, includeElevationGuidance) {
  return [
    "This tool allows you to execute shell commands in a persistent fish terminal session, preserving environment variables, working directory, and other context across multiple commands.",
    createGenericDescription(sandboxingOptions, includeElevationGuidance),
    "- Use type to check command type (builtin, function, alias)",
    "- Use jobs, fg, bg for job control",
    "- Use test expressions for conditionals (no [[ ]] syntax)",
    "- Prefer command substitution with () syntax",
    "- Variables are arrays by default, use $var[1] for first element",
    "- Take advantage of fish's autosuggestions and completions"
  ].join("\n");
}

async function createRunInTerminalToolData(accessor) {
  const instantiationService = accessor.get(IInstantiationService);
  const terminalSandboxService = accessor.get(ITerminalSandboxService);
  const configurationService = accessor.get(IConfigurationService);
  const allowToRunUnsandboxedCommands = configurationService.getValue("chat.agent.sandbox.allowUnsandboxedCommands" /* AgentSandboxAllowUnsandboxedCommands */) === true;
  const retryWithAllowNetworkRequestsSetting = configurationService.getValue("chat.agent.sandbox.retryWithAllowNetworkRequests" /* AgentSandboxRetryWithAllowNetworkRequests */) === true;
  const includeElevationGuidance = configurationService.getValue("chat.tools.terminal.enableAutoApprove" /* EnableAutoApprove */) === true || isOpenCodeAutoApproveMode(configurationService);
  const profileFetcher = instantiationService.createInstance(TerminalProfileFetcher);
  const [shell, os, isSandboxEnabled, isSandboxAllowNetworkEnabled] = await Promise.all([
    profileFetcher.getCopilotShell(),
    profileFetcher.osBackend,
    terminalSandboxService.isEnabled(),
    terminalSandboxService.isSandboxAllowNetworkEnabled()
  ]);
  const sandboxingOptions = isSandboxEnabled ? isSandboxAllowNetworkEnabled ? {
    sandboxMode: "on-network-available",
    allowToRunUnsandboxedCommands,
    retryWithAllowNetworkRequests: false,
    networkDomains: void 0
  } : {
    sandboxMode: "on-network-restricted",
    allowToRunUnsandboxedCommands,
    retryWithAllowNetworkRequests: retryWithAllowNetworkRequestsSetting,
    networkDomains: terminalSandboxService.getResolvedNetworkDomains()
  } : {
    sandboxMode: "off"
  };
  let modelDescription;
  if (shell && os && isPowerShell(shell, os)) {
    modelDescription = createPowerShellModelDescription(shell, sandboxingOptions, includeElevationGuidance);
  } else if (shell && os && isZsh(shell, os)) {
    modelDescription = createZshModelDescription(sandboxingOptions, includeElevationGuidance);
  } else if (shell && os && isFish(shell, os)) {
    modelDescription = createFishModelDescription(sandboxingOptions, includeElevationGuidance);
  } else {
    modelDescription = createBashModelDescription(sandboxingOptions, includeElevationGuidance);
  }
  const sharedProperties = {
    command: {
      type: "string",
      description: "The command to run in the terminal."
    },
    explanation: {
      type: "string",
      description: "A one-sentence description of what the command does. This will be shown to the user before the command is run."
    },
    goal: {
      type: "string",
      description: 'A short description of the goal or purpose of the command (e.g., "Install dependencies", "Start development server").'
    }
  };
  const sandboxProperties = sandboxingOptions.sandboxMode === "off" ? {} : createSandboxProperties(sandboxingOptions);
  return {
    id: "run_in_terminal" /* RunInTerminal */,
    toolReferenceName: TOOL_REFERENCE_NAME,
    legacyToolReferenceFullNames: LEGACY_TOOL_REFERENCE_FULL_NAMES,
    displayName: localize(20561, null),
    modelDescription: `${modelDescription}

Execution mode:
- mode='sync' (strongly preferred): waits for the command to complete and returns full output inline. Use for ALL one-shot commands (builds, tests, installs, compilation, scripts). Omit timeout to let the command run to completion \u2014 the tool handles idle detection and input prompts automatically.
- mode='async': waits for an initial idle/output signal from the command, then returns a terminal ID and output snapshot while the process continues running. Use ONLY for processes that must keep running indefinitely (servers, watchers, daemons). Timeout caps how long to wait for the initial idle/output signal.

Timeout parameter: Usually omit timeout entirely for sync commands \u2014 the tool returns automatically on completion, input-needed, or cancellation. Only set a timeout as a safety net for commands you suspect might hang. Use 0 to explicitly indicate no timeout.

Sync output is final: When a sync command completes, the full output is returned inline \u2014 do NOT call ${"get_terminal_output" /* GetTerminalOutput */} afterward. Only use ${"get_terminal_output" /* GetTerminalOutput */} if the tool result explicitly indicates the command was moved to background, timed out, or needs input. Do NOT tell the user to check the terminal panel \u2014 all command output is already included in the tool result.

Terminal notifications: When an async command finishes or a sync command times out, you will be automatically notified on your next turn with the exit code and terminal output. You will also be notified if the terminal needs input. Do NOT poll or sleep to wait for completion.`,
    userDescription: localize(20562, null),
    source: ToolDataSource.Internal,
    icon: Codicon.terminal,
    inputSchema: {
      type: "object",
      properties: {
        ...sharedProperties,
        ...sandboxProperties,
        mode: {
          type: "string",
          enum: ["sync", "async"],
          enumDescriptions: [
            "Wait for command completion and return full output inline. Strongly preferred for all one-shot commands (builds, tests, installs, scripts).",
            "Wait for an initial idle/output signal, then return a terminal ID and output snapshot while the process continues running. Timeout caps how long to wait for the initial signal. Use ONLY for processes that must keep running indefinitely (servers, watchers, daemons)."
          ],
          description: "Execution mode for this command. Use sync (default) for nearly all commands."
        },
        isBackground: {
          type: "boolean",
          description: 'Legacy execution mode flag. Deprecated in favor of "mode". If true, equivalent to mode=async. If false, equivalent to mode=sync.'
        },
        timeout: {
          type: "number",
          description: "Optional. Usually omit entirely for sync commands \u2014 the tool waits for completion automatically. Only set a timeout (in milliseconds) as a safety net if you suspect the command might hang. If the timeout elapses, the command continues in the background and you get a terminal ID to check output later. Use 0 to explicitly indicate no timeout."
        }
      },
      required: ["command", "explanation", "goal", "mode"]
    }
  };
}

function shouldAutomaticallyRetrySandbox(options3) {
  return options3.retryAllowed && options3.didSandboxWrapCommand && options3.retryAlreadyRequested !== true && !options3.isPersistentSession && !options3.isBackgroundExecution && !options3.didTimeout && options3.exitCode !== 0 && options3.outputLooksRetryable(options3.output);
}

function shouldAutomaticallyRetryUnsandboxed(options3) {
  return shouldAutomaticallyRetrySandbox({
    retryAllowed: options3.allowUnsandboxedCommands,
    retryAlreadyRequested: options3.requestUnsandboxedExecution,
    didSandboxWrapCommand: options3.didSandboxWrapCommand,
    isPersistentSession: options3.isPersistentSession,
    isBackgroundExecution: options3.isBackgroundExecution,
    didTimeout: options3.didTimeout,
    exitCode: options3.exitCode,
    output: options3.output,
    // Network failures are handled by shouldAutomaticallyRetryAllowNetworkInSandboxed; do not automatically leave the sandbox for them.
    outputLooksRetryable: (output) => outputLooksSandboxBlocked(output) && !outputLooksSandboxNetworkBlocked(output)
  });
}

function shouldAutomaticallyRetryAllowNetworkInSandboxed(options3) {
  return shouldAutomaticallyRetrySandbox({
    retryAllowed: options3.retryWithAllowNetworkRequests,
    retryAlreadyRequested: options3.requestUnsandboxedExecution || options3.requestAllowNetwork,
    didSandboxWrapCommand: options3.didSandboxWrapCommand,
    isPersistentSession: options3.isPersistentSession,
    isBackgroundExecution: options3.isBackgroundExecution,
    didTimeout: options3.didTimeout,
    exitCode: options3.exitCode,
    output: options3.output,
    outputLooksRetryable: outputLooksSandboxNetworkBlocked
  });
}

function outputLooksBubblewrapHostRestricted(output) {
  return /bwrap:\s*No permissions to create new namespace/i.test(output.replace(/\s+/g, " "));
}

var telemetryIgnoredSequences = [
  "\x1B[I",
  // Focus in
  "\x1B[O"
  // Focus out
];

var altBufferMessage = "\n" + localize(20560, null);

function buildCompletionNotificationCommand(command4) {
  const firstNewline = command4.search(/\r|\n/);
  const hasMoreLines = firstNewline !== -1;
  const firstLine = hasMoreLines ? command4.substring(0, firstNewline) : command4;
  const normalized = normalizeTerminalCommandForDisplay(firstLine);
  if (normalized.length > 80) {
    return normalized.substring(0, 79) + "\u2026";
  }
  return hasMoreLines ? normalized + "\u2026" : normalized;
}

var RunInTerminalTool = class extends Disposable {
  constructor(_chatService, _configurationService, _fileService, _historyService, _instantiationService, _labelService, _languageModelToolsService, _remoteAgentService, _storageService, _terminalChatService, _logService, _terminalService, _terminalSandboxService, _workspaceContextService, _chatWidgetService, _agentSessionsService, _chatSessionsService, lifecycleService) {
    super();
    this._chatService = _chatService;
    this._configurationService = _configurationService;
    this._fileService = _fileService;
    this._historyService = _historyService;
    this._instantiationService = _instantiationService;
    this._labelService = _labelService;
    this._languageModelToolsService = _languageModelToolsService;
    this._remoteAgentService = _remoteAgentService;
    this._storageService = _storageService;
    this._terminalChatService = _terminalChatService;
    this._logService = _logService;
    this._terminalService = _terminalService;
    this._terminalSandboxService = _terminalSandboxService;
    this._workspaceContextService = _workspaceContextService;
    this._chatWidgetService = _chatWidgetService;
    this._agentSessionsService = _agentSessionsService;
    this._chatSessionsService = _chatSessionsService;
    this._archivedSessionListener = this._register(new MutableDisposable());
    this._sessionTerminalAssociations = new ResourceMap();
    this._sessionTerminalInstances = new ResourceMap();
    this._terminalsBeingDisposedBySessionCleanup = /* @__PURE__ */ new Set();
    /**
     * Tracks active background completion notifications per terminal instance ID.
     * When a new notification is registered for a terminal that already has one,
     * the previous notification (and its OutputMonitor) is disposed first to
     * prevent listener accumulation on the terminal's onDidInputData emitter.
     *
     * Keyed by `ITerminalInstance.instanceId` (stable per terminal) rather than
     * the per-invocation `termId` so that reusing the same foreground terminal
     * after an `inputNeeded` race disposes the prior OutputMonitor.
     */
    this._backgroundNotifications = this._register(new DisposableMap());
    /**
     * Set when VS Code is shutting down. Suppresses "terminal exited"
     * notifications that would otherwise be generated when background
     * terminals are disposed during shutdown and then persist as
     * undeliverable steering messages after restart.
     */
    this._isShuttingDown = false;
    /**
     * Per-instance disposables that unregister `_activeExecutions` entries from the
     * `ITerminalChatService` execution-id map. Keyed by the same `termId` as `_activeExecutions`
     * so registrations and active executions share a lifecycle.
     */
    this._executionRegistrations = this._register(new DisposableMap());
    this._register(lifecycleService.onWillShutdown(() => {
      this._isShuttingDown = true;
    }));
    this._osBackend = this._remoteAgentService.getEnvironment().then((remoteEnv) => remoteEnv?.os ?? OS);
    this._terminalToolCreator = this._instantiationService.createInstance(ToolTerminalCreator);
    this._treeSitterCommandParser = this._register(this._instantiationService.createInstance(TreeSitterCommandParser));
    this._telemetry = this._instantiationService.createInstance(RunInTerminalToolTelemetry);
    this._commandArtifactCollector = this._instantiationService.createInstance(TerminalCommandArtifactCollector);
    this._profileFetcher = this._instantiationService.createInstance(TerminalProfileFetcher);
    this._largeOutputFileWriter = this._register(this._instantiationService.createInstance(LargeOutputFileWriter));
    this._commandLineRewriters = [
      this._register(this._instantiationService.createInstance(CommandLineCdPrefixRewriter)),
      this._register(this._instantiationService.createInstance(CommandLinePwshChainOperatorRewriter, this._treeSitterCommandParser))
    ];
    if (this._enableCommandLineSandboxRewriting) {
      this._commandLineRewriters.push(this._register(this._instantiationService.createInstance(CommandLineSandboxRewriter, this._treeSitterCommandParser)));
    }
    this._commandLineRewriters.push(this._register(this._instantiationService.createInstance(CommandLineBackgroundDetachRewriter)));
    this._commandLineRewriters.push(this._register(this._instantiationService.createInstance(CommandLinePreventHistoryRewriter)));
    this._commandLineAnalyzers = [
      this._register(this._instantiationService.createInstance(CommandLineFileWriteAnalyzer, this._treeSitterCommandParser, (message, args2) => this._logService.info(`RunInTerminalTool#CommandLineFileWriteAnalyzer: ${message}`, args2))),
      this._register(this._instantiationService.createInstance(CommandLineAutoApproveAnalyzer, this._treeSitterCommandParser, this._telemetry, (message, args2) => this._logService.info(`RunInTerminalTool#CommandLineAutoApproveAnalyzer: ${message}`, args2)))
    ];
    if (this._enableCommandLineSandboxRewriting) {
      this._commandLineAnalyzers.push(this._register(this._instantiationService.createInstance(CommandLineSandboxAnalyzer)));
    }
    this._commandLinePresenters = [
      this._instantiationService.createInstance(SandboxedCommandLinePresenter),
      new NodeCommandLinePresenter(),
      new PythonCommandLinePresenter(),
      new RubyCommandLinePresenter()
    ];
    this._outputAnalyzers = [
      this._register(this._instantiationService.createInstance(SandboxOutputAnalyzer))
    ];
    this._register(Event2.runAndSubscribe(this._configurationService.onDidChangeConfiguration, (e4) => {
      if (!e4 || e4.affectsConfiguration("chat.tools.terminal.enableAutoApprove" /* EnableAutoApprove */)) {
        if (this._configurationService.getValue("chat.tools.terminal.enableAutoApprove" /* EnableAutoApprove */) !== true) {
          this._storageService.remove("chat.tools.terminal.autoApprove.warningAccepted" /* TerminalAutoApproveWarningAccepted */, -1 /* APPLICATION */);
        }
      }
    }));
    this._restoreTerminalAssociations();
    this._register(this._terminalService.onDidDisposeInstance((e4) => {
      this._removeTerminalAssociations(e4);
    }));
    this._register(this._chatService.onDidDisposeSession((e4) => {
      for (const resource of e4.sessionResources) {
        this._cleanupSessionTerminals(resource);
      }
      this._largeOutputFileWriter.cleanup();
    }));
  }
  static {
    this._activeExecutions = /* @__PURE__ */ new Map();
  }
  _setActiveExecution(termId, execution) {
    RunInTerminalTool._activeExecutions.set(termId, execution);
    this._executionRegistrations.set(termId, this._terminalChatService.registerTerminalInstanceWithExecutionId(termId, execution.instance));
  }
  _deleteActiveExecution(termId) {
    this._executionRegistrations.deleteAndDispose(termId);
    return RunInTerminalTool._activeExecutions.delete(termId);
  }
  static {
    /**
     * Terminal IDs being programmatically disposed (by `kill_terminal` or
     * automatic background-terminal cleanup). Used to suppress the redundant
     * "terminal exited" steering message in `_registerCompletionNotification`'s
     * `onDisposed` handler.
     */
    this._killedByTool = /* @__PURE__ */ new Set();
  }
  static getBackgroundOutput(id2) {
    const execution = RunInTerminalTool._activeExecutions.get(id2);
    if (!execution) {
      throw new Error("Invalid terminal ID");
    }
    return execution.getOutput();
  }
  /**
   * Gets an active terminal execution by ID. Returns undefined if not found.
   * Can be used to await the completion of a background terminal command.
   */
  static getExecution(id2) {
    return RunInTerminalTool._activeExecutions.get(id2);
  }
  /**
   * Removes an active terminal execution by ID and disposes it.
   * @returns true if the execution was found and removed, false otherwise.
   */
  static removeExecution(id2) {
    const execution = RunInTerminalTool._activeExecutions.get(id2);
    if (!execution) {
      return false;
    }
    execution.dispose();
    RunInTerminalTool._activeExecutions.delete(id2);
    return true;
  }
  /**
   * Marks a terminal ID as being killed by the `kill_terminal` tool so that
   * the `onDisposed` handler in `_registerCompletionNotification` skips the
   * redundant steering message.
   */
  static markKilledByTool(id2) {
    RunInTerminalTool._killedByTool.add(id2);
  }
  _resolveExecutionOptions(args2) {
    const mode = args2.mode ?? (args2.isBackground ? "async" : "sync");
    switch (mode) {
      case "async":
        return { mode: "async", persistentSession: true, waitStrategy: "idle" };
      case "sync":
      default:
        return { mode: "sync", persistentSession: false, waitStrategy: "completion" };
    }
  }
  get _allowUnsandboxedCommands() {
    return this._configurationService.getValue("chat.agent.sandbox.allowUnsandboxedCommands" /* AgentSandboxAllowUnsandboxedCommands */) === true;
  }
  get _retryWithAllowNetworkRequests() {
    return this._configurationService.getValue("chat.agent.sandbox.retryWithAllowNetworkRequests" /* AgentSandboxRetryWithAllowNetworkRequests */) === true;
  }
  get _allowSandboxAutoApprove() {
    return this._configurationService.getValue("chat.agent.sandbox.allowAutoApprove" /* AgentSandboxAllowAutoApprove */) === true;
  }
  _getAllowToRunUnsandboxedCommands(args2) {
    return (args2.allowToRunUnsandboxedCommands ?? this._allowUnsandboxedCommands) === true && this._allowUnsandboxedCommands;
  }
  _shouldRejectUnsandboxedExecutionRequest(isSandboxEnabled, allowUnsandboxedCommands, args2) {
    return isSandboxEnabled && args2.requestUnsandboxedExecution === true && !allowUnsandboxedCommands;
  }
  _shouldRejectAllowNetworkRequest(isSandboxEnabled, isSandboxAllowNetworkEnabled, args2) {
    return isSandboxEnabled && !isSandboxAllowNetworkEnabled && args2.requestAllowNetwork === true && !this._retryWithAllowNetworkRequests;
  }
  _getUnsandboxedExecutionDisabledMessage() {
    return localize(
      20551,
      null
    );
  }
  _getAllowNetworkRequestDisabledMessage() {
    return localize(
      20505,
      null
    );
  }
  async _getDeniedSandboxFileAccess(paths) {
    if (!paths?.length) {
      return [];
    }
    const result = await this._terminalSandboxService.checkFileAccess("write", paths);
    return result.denied;
  }
  _buildSandboxFileAccessDeniedMessage(deniedPaths) {
    const deniedPathsMessage = deniedPaths.map((path) => `write: ${path}`).join("\n");
    return localize(
      20532,
      null,
      deniedPathsMessage
    );
  }
  /**
   * Controls whether this tool wires up sandbox-specific command-line
   * behavior, including both the {@link CommandLineSandboxRewriter} and the
   * {@link CommandLineSandboxAnalyzer}. This is separate from
   * ITerminalSandboxService.isEnabled(), which reports the current terminal
   * sandboxing enablement for the running window.
   */
  get _enableCommandLineSandboxRewriting() {
    return true;
  }
  async handleToolStream(context2, _token) {
    const partialInput = context2.rawInput;
    if (partialInput && typeof partialInput === "object" && partialInput.command) {
      const truncatedCommand = buildCommandDisplayText(partialInput.command);
      const invocationMessage = new MarkdownString(localize(20540, null, escapeMarkdownSyntaxTokens(truncatedCommand)));
      return { invocationMessage };
    }
    return { invocationMessage: localize(20541, null) };
  }
  async prepareToolInvocation(context2, token) {
    const args2 = context2.parameters;
    const executionOptions = this._resolveExecutionOptions(args2);
    const chatSessionResource = context2.chatSessionResource;
    let instance2;
    if (chatSessionResource) {
      const toolTerminal = this._sessionTerminalAssociations.get(chatSessionResource);
      if (toolTerminal && !toolTerminal.isBackground) {
        instance2 = toolTerminal.instance;
      }
    }
    const [os, shell, cwd2, sandboxPrereqs] = await Promise.all([
      this._osBackend,
      this._profileFetcher.getCopilotShell(),
      (async () => {
        let cwd3 = await instance2?.getCwdResource();
        if (!cwd3) {
          const sessionModel = chatSessionResource ? this._chatService.getSession(chatSessionResource) : void 0;
          if (sessionModel?.workingDirectory) {
            cwd3 = sessionModel.workingDirectory;
          } else {
            const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot();
            const workspaceFolder = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
            cwd3 = workspaceFolder?.uri;
          }
        }
        return cwd3;
      })(),
      this._terminalSandboxService.checkForSandboxingPrereqs(false)
    ]);
    const language2 = os === 1 /* Windows */ ? "pwsh" : "sh";
    const isSandboxEnabled = sandboxPrereqs.enabled;
    const isSandboxAllowNetworkEnabled = isSandboxEnabled && await this._terminalSandboxService.isSandboxAllowNetworkEnabled();
    const allowUnsandboxedCommands = this._getAllowToRunUnsandboxedCommands(args2);
    const explicitUnsandboxRequest = isSandboxEnabled && allowUnsandboxedCommands && args2.requestUnsandboxedExecution === true;
    const explicitAllowNetworkRequest = isSandboxEnabled && !isSandboxAllowNetworkEnabled && this._retryWithAllowNetworkRequests && !explicitUnsandboxRequest && args2.requestAllowNetwork === true;
    let requiresUnsandboxConfirmation = explicitUnsandboxRequest;
    let requestUnsandboxedExecutionReason = explicitUnsandboxRequest ? args2.requestUnsandboxedExecutionReason : void 0;
    let requiresAllowNetworkConfirmation = explicitAllowNetworkRequest;
    let requestAllowNetworkReason = explicitAllowNetworkRequest ? args2.requestAllowNetworkReason : void 0;
    const missingDependencies = sandboxPrereqs.failedCheck === "dependencies" /* Dependencies */ && sandboxPrereqs.missingDependencies?.length ? sandboxPrereqs.missingDependencies : void 0;
    const canInstallMissingDependencies = !!missingDependencies && sandboxPrereqs.canInstallMissingDependencies === true;
    const sandboxRemediations = sandboxPrereqs.failedCheck === "bubblewrap" /* Bubblewrap */ && sandboxPrereqs.remediations?.length ? [...sandboxPrereqs.remediations] : void 0;
    const sandboxPrerequisiteFailure = sandboxPrereqs.failedCheck === "bubblewrap" /* Bubblewrap */ && !sandboxRemediations ? localize(20509, null) : missingDependencies && !canInstallMissingDependencies ? localize(20527, null, missingDependencies.join(", ")) : void 0;
    const terminalToolSessionId = generateUuid();
    const terminalCommandId = `tool-${generateUuid()}`;
    if (this._shouldRejectUnsandboxedExecutionRequest(isSandboxEnabled, allowUnsandboxedCommands, args2)) {
      const commandToDisplay2 = normalizeTerminalCommandForDisplay(args2.command);
      return {
        invocationMessage: new MarkdownString(localize(20550, null, escapeMarkdownSyntaxTokens(buildCommandDisplayText(commandToDisplay2)))),
        icon: Codicon.error,
        confirmationMessages: void 0,
        toolSpecificData: {
          kind: "terminal",
          terminalToolSessionId,
          terminalCommandId,
          commandLine: {
            original: args2.command,
            forDisplay: commandToDisplay2
          },
          cwd: cwd2,
          language: language2,
          isBackground: executionOptions.persistentSession,
          requestUnsandboxedExecution: false,
          requestUnsandboxedExecutionReason: void 0
        }
      };
    }
    if (this._shouldRejectAllowNetworkRequest(isSandboxEnabled, isSandboxAllowNetworkEnabled, args2)) {
      const commandToDisplay2 = normalizeTerminalCommandForDisplay(args2.command);
      return {
        invocationMessage: new MarkdownString(localize(20504, null, escapeMarkdownSyntaxTokens(buildCommandDisplayText(commandToDisplay2)))),
        icon: Codicon.error,
        confirmationMessages: void 0,
        toolSpecificData: {
          kind: "terminal",
          terminalToolSessionId,
          terminalCommandId,
          commandLine: {
            original: args2.command,
            forDisplay: commandToDisplay2
          },
          cwd: cwd2,
          language: language2,
          isBackground: executionOptions.persistentSession,
          requestAllowNetwork: false,
          requestAllowNetworkReason: void 0
        }
      };
    }
    const rewriteResult = await this._rewriteCommandLine(args2.command, {
      cwd: cwd2,
      shell,
      os,
      isBackground: executionOptions.persistentSession,
      requestUnsandboxedExecution: allowUnsandboxedCommands ? requiresUnsandboxConfirmation : false,
      requestUnsandboxedExecutionReason,
      requestAllowNetwork: explicitAllowNetworkRequest,
      requestAllowNetworkReason
    });
    const rewrittenCommand = rewriteResult.rewrittenCommand;
    const forDisplayCommand = rewriteResult.forDisplayCommand;
    const isSandboxWrapped = rewriteResult.isSandboxWrapped;
    requiresUnsandboxConfirmation = rewriteResult.requiresUnsandboxConfirmation;
    requestUnsandboxedExecutionReason = rewriteResult.requestUnsandboxedExecutionReason;
    requiresAllowNetworkConfirmation = rewriteResult.requiresAllowNetworkConfirmation;
    requestAllowNetworkReason = rewriteResult.requestAllowNetworkReason;
    const blockedDomains = rewriteResult.blockedDomains;
    const toolSpecificData = {
      kind: "terminal",
      terminalToolSessionId,
      terminalCommandId,
      commandLine: {
        original: args2.command,
        toolEdited: rewrittenCommand === args2.command ? void 0 : rewrittenCommand,
        forDisplay: forDisplayCommand ?? normalizeTerminalCommandForDisplay(rewrittenCommand ?? args2.command),
        isSandboxWrapped
      },
      cwd: cwd2,
      language: language2,
      isBackground: executionOptions.persistentSession,
      requestUnsandboxedExecution: requiresUnsandboxConfirmation,
      requestUnsandboxedExecutionReason,
      requestAllowNetwork: requiresAllowNetworkConfirmation,
      requestAllowNetworkReason,
      missingSandboxDependencies: missingDependencies,
      sandboxRemediations,
      sandboxPrerequisiteFailure
    };
    let sandboxPrerequisiteConfirmation = void 0;
    if (missingDependencies && canInstallMissingDependencies) {
      const depsList = missingDependencies.join(", ");
      sandboxPrerequisiteConfirmation = {
        title: localize(20525, null),
        message: new MarkdownString(localize(
          20523,
          null,
          depsList
        )),
        customOptions: [
          { id: "install", label: localize(20521, null), kind: "approve" /* Approve */ },
          { id: "cancel", label: localize(20518, null), kind: "deny" /* Deny */ }
        ]
      };
    }
    const alternativeRecommendation = getRecommendedToolsOverRunInTerminal(args2.command, this._languageModelToolsService);
    if (alternativeRecommendation) {
      toolSpecificData.alternativeRecommendation = alternativeRecommendation;
      return {
        confirmationMessages: void 0,
        presentation: "hidden" /* Hidden */,
        toolSpecificData
      };
    }
    const commandLine = forDisplayCommand ?? rewrittenCommand ?? args2.command;
    const isEligibleForAutoApproval = () => isToolEligibleForTerminalAutoApproval(TOOL_REFERENCE_NAME, this._configurationService, LEGACY_TOOL_REFERENCE_FULL_NAMES);
    const isAutoApproveEnabled = this._configurationService.getValue("chat.tools.terminal.enableAutoApprove" /* EnableAutoApprove */) === true;
    const isAutoApproveAllowed = isTerminalAutoApproveAllowed(TOOL_REFERENCE_NAME, this._configurationService, this._storageService, LEGACY_TOOL_REFERENCE_FULL_NAMES);
    const commandLineAnalyzerOptions = {
      commandLine,
      cwd: cwd2,
      os,
      shell,
      treeSitterLanguage: isPowerShell(shell, os) ? "powershell" /* PowerShell */ : "bash" /* Bash */,
      terminalToolSessionId,
      chatSessionResource,
      requiresUnsandboxConfirmation,
      requiresAllowNetworkConfirmation,
      hasSessionAutoApproval: !!chatSessionResource && this._terminalChatService.hasChatSessionAutoApproval(chatSessionResource)
    };
    const isSessionAutoApproved = chatSessionResource && isSessionAutoApproveLevel(chatSessionResource, this._configurationService);
    const commandLineAnalyzers = isSessionAutoApproved ? this._commandLineAnalyzers.filter((e4) => !(e instanceof CommandLineAutoApproveAnalyzer)) : this._commandLineAnalyzers;
    const commandLineAnalyzerResults = await Promise.all(commandLineAnalyzers.map((e4) => e4.analyze(commandLineAnalyzerOptions)));
    const disclaimersRaw = commandLineAnalyzerResults.map((e4) => e4.disclaimers).filter((e4) => !!e4).flatMap((e4) => e4);
    let disclaimer;
    if (disclaimersRaw.length > 0) {
      const disclaimerTexts = disclaimersRaw.map((d) => typeof d === "string" ? d : d.value);
      const hasMarkdownDisclaimer = disclaimersRaw.some((d) => typeof d !== "string");
      const mdOptions = hasMarkdownDisclaimer ? { supportThemeIcons: true, isTrusted: { enabledCommands: ["workbench.action.terminal.chat.openTerminalSettingsLink" /* OpenTerminalSettingsLink */] } } : { supportThemeIcons: true };
      disclaimer = new MarkdownString(`$(${Codicon.info.id}) ` + disclaimerTexts.join(" "), mdOptions);
    }
    const analyzersIsAutoApproveAllowed = commandLineAnalyzerResults.every((e4) => e4.isAutoApproveAllowed);
    const customActions = isEligibleForAutoApproval() && analyzersIsAutoApproveAllowed ? commandLineAnalyzerResults.map((e4) => e4.customActions ?? []).flat() : void 0;
    let shellType = basename(shell, ".exe");
    if (shellType === "powershell") {
      shellType = "pwsh";
    }
    const wouldBeAutoApproved = (
      // Does at least one analyzer auto approve
      commandLineAnalyzerResults.some((e4) => e4.isAutoApproved) && // No analyzer denies auto approval
      commandLineAnalyzerResults.every((e4) => e4.isAutoApproved !== false) && // All analyzers allow auto approval
      analyzersIsAutoApproveAllowed
    );
    const isAutoApprovedByRules = (
      // Is the setting enabled and the user has opted-in
      isAutoApproveAllowed && // Would be auto-approved based on rules
      wouldBeAutoApproved
    );
    const isSandboxAutoApproved = isSandboxEnabled && toolSpecificData.commandLine.isSandboxWrapped === true && !requiresAllowNetworkConfirmation && this._allowSandboxAutoApprove;
    const isFinalAutoApproved = isSandboxAutoApproved || isAutoApprovedByRules || commandLineAnalyzerResults.some((e4) => e4.forceAutoApproval);
    if (isFinalAutoApproved || isAutoApproveEnabled && commandLineAnalyzerResults.some((e4) => e4.autoApproveInfo)) {
      toolSpecificData.autoApproveInfo = commandLineAnalyzerResults.find((e4) => e4.autoApproveInfo)?.autoApproveInfo;
    }
    const commandToDisplay = (toolSpecificData.commandLine.forDisplay ?? toolSpecificData.commandLine.userEdited ?? toolSpecificData.commandLine.toolEdited ?? toolSpecificData.commandLine.original).trimStart();
    const extractedCd = extractCdPrefix(commandToDisplay, shell, os);
    let confirmationTitle;
    if (extractedCd && cwd2) {
      const isAbsolutePath2 = os === 1 /* Windows */ ? win32.isAbsolute(extractedCd.directory) : posix.isAbsolute(extractedCd.directory);
      const directoryUri = isAbsolutePath2 ? URI.from({ scheme: cwd2.scheme, authority: cwd2.authority, path: extractedCd.directory }) : URI.joinPath(cwd2, extractedCd.directory);
      const directoryLabel = this._labelService.getUriLabel(directoryUri);
      const cdPrefix = commandToDisplay.substring(0, commandToDisplay.length - extractedCd.command.length);
      toolSpecificData.confirmation = {
        commandLine: extractedCd.command,
        cwdLabel: directoryLabel,
        cdPrefix
      };
      confirmationTitle = localize(20513, null, shellType, directoryLabel);
    } else {
      toolSpecificData.confirmation = {
        commandLine: commandToDisplay
      };
      confirmationTitle = localize(20495, null, shellType);
    }
    const commandForPresenter = extractedCd?.command ?? commandToDisplay;
    let presenterInput = commandForPresenter;
    for (const presenter of this._commandLinePresenters) {
      const presenterResult = await presenter.present({ commandLine: { original: args2.command, forDisplay: presenterInput }, shell, os });
      if (presenterResult) {
        toolSpecificData.presentationOverrides = {
          commandLine: presenterResult.commandLine,
          language: presenterResult.language ?? void 0
        };
        if (extractedCd && toolSpecificData.confirmation?.cwdLabel) {
          if (presenterResult.languageDisplayName) {
            confirmationTitle = localize(20529, null, presenterResult.languageDisplayName, shellType, toolSpecificData.confirmation.cwdLabel);
          } else {
            confirmationTitle = localize(20530, null, shellType, toolSpecificData.confirmation.cwdLabel);
          }
        } else {
          if (presenterResult.languageDisplayName) {
            confirmationTitle = localize(20528, null, presenterResult.languageDisplayName, shellType);
          } else {
            confirmationTitle = localize(20531, null, shellType);
          }
        }
        if (!presenterResult.processOtherPresenters) {
          break;
        }
        presenterInput = presenterResult.commandLine;
      }
    }
    if (requiresUnsandboxConfirmation) {
      confirmationTitle = blockedDomains?.length ? localize(20552, null, shellType, TERMINAL_SANDBOX_DOCUMENTATION_URL, this._formatBlockedDomainsForTitle(blockedDomains)) : localize(20542, null, shellType, TERMINAL_SANDBOX_DOCUMENTATION_URL);
    } else if (requiresAllowNetworkConfirmation) {
      confirmationTitle = localize(20496, null, shellType);
    }
    const shouldShowConfirmation = !isFinalAutoApproved && (!isSessionAutoApproved || requiresAllowNetworkConfirmation) || context2.forceConfirmationReason !== void 0;
    const explanation = args2.explanation || localize(20511, null);
    const goal = args2.goal || localize(20512, null);
    const confirmationMessage = requiresUnsandboxConfirmation ? new MarkdownString(localize(
      20548,
      null,
      explanation,
      goal,
      requestUnsandboxedExecutionReason || localize(20549, null)
    )) : requiresAllowNetworkConfirmation ? new MarkdownString(localize(
      20502,
      null,
      explanation,
      goal,
      requestAllowNetworkReason || localize(20503, null)
    )) : new MarkdownString(localize(20510, null, explanation, goal));
    const confirmationMessages = shouldShowConfirmation ? {
      title: confirmationTitle,
      message: confirmationMessage,
      disclaimer,
      allowAutoConfirm: void 0,
      terminalCustomActions: customActions
    } : void 0;
    const rawDisplayCommand = toolSpecificData.commandLine.forDisplay ?? toolSpecificData.commandLine.toolEdited ?? toolSpecificData.commandLine.original;
    const displayCommand = rawDisplayCommand.length > 80 ? rawDisplayCommand.substring(0, 77) + "..." : rawDisplayCommand;
    const invocationMessage = toolSpecificData.commandLine.isSandboxWrapped ? new MarkdownString(localize(20515, null, escapeMarkdownSyntaxTokens(displayCommand))) : new MarkdownString(localize(20514, null, escapeMarkdownSyntaxTokens(displayCommand)));
    return {
      invocationMessage,
      icon: toolSpecificData.commandLine.isSandboxWrapped ? Codicon.terminalSecure : Codicon.terminal,
      confirmationMessages: sandboxPrerequisiteConfirmation ?? confirmationMessages,
      toolSpecificData
    };
  }
  _formatBlockedDomainsForTitle(blockedDomains) {
    if (blockedDomains.length === 1) {
      return `\`${blockedDomains[0]}\``;
    }
    return localize(20559, null, blockedDomains[0], blockedDomains.length - 1);
  }
  _getBlockedDomainReason(blockedDomains, deniedDomains = []) {
    if (deniedDomains.length === blockedDomains.length && deniedDomains.length > 0) {
      if (blockedDomains.length === 1) {
        return localize(20554, null, blockedDomains[0]);
      }
      return localize(20553, null, blockedDomains[0], blockedDomains.length - 1);
    }
    if (deniedDomains.length > 0) {
      if (blockedDomains.length === 1) {
        return localize(20556, null, blockedDomains[0]);
      }
      return localize(20555, null, blockedDomains[0], blockedDomains.length - 1);
    }
    if (blockedDomains.length === 1) {
      return localize(20558, null, blockedDomains[0]);
    }
    return localize(20557, null, blockedDomains[0], blockedDomains.length - 1);
  }
  async _rewriteCommandLine(commandLine, options3) {
    let rewrittenCommand = commandLine;
    let forDisplayCommand = void 0;
    let isSandboxWrapped = false;
    let requiresUnsandboxConfirmation = options3.requestUnsandboxedExecution;
    let requestUnsandboxedExecutionReason = options3.requestUnsandboxedExecution ? options3.requestUnsandboxedExecutionReason : void 0;
    let requiresAllowNetworkConfirmation = false;
    let requestAllowNetworkReason = options3.requestAllowNetwork ? options3.requestAllowNetworkReason : void 0;
    let blockedDomains;
    for (const rewriter of this._commandLineRewriters) {
      const rewriteResult = await rewriter.rewrite({
        commandLine: rewrittenCommand,
        cwd: options3.cwd,
        shell: options3.shell,
        os: options3.os,
        isBackground: options3.isBackground,
        requestUnsandboxedExecution: requiresUnsandboxConfirmation,
        requestAllowNetwork: options3.requestAllowNetwork
      });
      if (rewriteResult) {
        rewrittenCommand = rewriteResult.rewritten;
        forDisplayCommand = forDisplayCommand ?? rewriteResult.forDisplay;
        if (rewriteResult.isSandboxWrapped) {
          isSandboxWrapped = true;
        } else if (rewriteResult.isSandboxWrapped === false) {
          isSandboxWrapped = false;
        }
        if (rewriteResult.requiresUnsandboxConfirmation) {
          requiresUnsandboxConfirmation = true;
        }
        if (rewriteResult.requiresAllowNetworkConfirmation) {
          requiresAllowNetworkConfirmation = true;
        }
        if (rewriteResult.blockedDomains?.length) {
          blockedDomains = rewriteResult.blockedDomains;
          const blockedDomainReason = this._getBlockedDomainReason(rewriteResult.blockedDomains, rewriteResult.deniedDomains);
          if (rewriteResult.requiresAllowNetworkConfirmation) {
            requestAllowNetworkReason = blockedDomainReason;
          } else {
            requestUnsandboxedExecutionReason = blockedDomainReason;
          }
        }
        this._logService.info(`RunInTerminalTool: Command rewritten by ${rewriter.constructor.name}: ${rewriteResult.reasoning}`);
      }
    }
    return {
      rewrittenCommand,
      forDisplayCommand,
      isSandboxWrapped,
      requiresUnsandboxConfirmation,
      requestUnsandboxedExecutionReason,
      requiresAllowNetworkConfirmation,
      requestAllowNetworkReason: requiresAllowNetworkConfirmation ? requestAllowNetworkReason : void 0,
      blockedDomains
    };
  }
  async _confirmAutomaticSandboxRetry(retryKind, sessionResource, command4, shell, blockedDomains, riskAssessment, token) {
    const chatModel = sessionResource && this._chatService.getSession(sessionResource);
    if (!(chatModel instanceof ChatModel)) {
      return false;
    }
    if (sessionResource && isSessionAutoApproveLevel(sessionResource, this._configurationService)) {
      return true;
    }
    const request2 = chatModel.getRequests().at(-1);
    if (!request2) {
      return false;
    }
    let shellType = basename(shell, ".exe");
    if (shellType === "powershell") {
      shellType = "pwsh";
    }
    const store = new DisposableStore();
    return new Promise((resolve3) => {
      let resolved = false;
      const resolveOnce = (value2) => {
        if (resolved) {
          return;
        }
        resolved = true;
        store.dispose();
        resolve3(value2);
      };
      const confirmationMessage = retryKind === "allowNetwork" ? new MarkdownString(localize(
        20498,
        null,
        escapeMarkdownSyntaxTokens(buildCommandDisplayText(command4))
      )) : new MarkdownString(localize(
        20544,
        null,
        escapeMarkdownSyntaxTokens(buildCommandDisplayText(command4))
      ));
      const part = new ChatElicitationRequestPart(
        this._getAutomaticSandboxRetryTitle(retryKind, shellType, blockedDomains),
        confirmationMessage,
        "",
        localize(20494, null),
        localize(20563, null),
        async () => {
          resolveOnce(true);
          part.hide();
          return "accepted" /* Accepted */;
        },
        async () => {
          resolveOnce(false);
          part.hide();
          return "rejected" /* Rejected */;
        },
        void 0,
        void 0,
        () => resolveOnce(false),
        riskAssessment
      );
      chatModel.acceptResponseProgress(request2, part);
      store.add(token.onCancellationRequested(() => resolveOnce(false)));
      store.add({ dispose: () => part.hide() });
    });
  }
  _getAutomaticSandboxRetryTitle(retryKind, shellType, blockedDomains) {
    if (retryKind === "allowNetwork") {
      return blockedDomains?.length ? new MarkdownString(localize(20499, null, shellType, this._formatBlockedDomainsForTitle(blockedDomains))) : new MarkdownString(localize(20497, null, shellType));
    }
    return blockedDomains?.length ? new MarkdownString(localize(20545, null, shellType, this._formatBlockedDomainsForTitle(blockedDomains))) : new MarkdownString(localize(20543, null, shellType));
  }
  /**
   * Surface a confirmation dialog when the terminal is detected to be waiting
   * for sensitive input (password, passphrase, OTP, …). Sensitive prompts must
   * never be routed through the model — the user types the secret directly
   * into the terminal. The "Focus terminal" action reveals and focuses the
   * terminal; the "Cancel" action cancels the running command.
   *
   * Returns a disposable that hides any pending elicitation. The handler
   * itself dedupes concurrent elicitations so repeated polling cycles don't
   * spam the chat session.
   */
  _registerSensitiveInputElicitation(chatSessionResource, terminalInstance, outputMonitor, cancelExecution, onAutoCancelled) {
    const store = new DisposableStore();
    let pending;
    let autoCancelled = false;
    store.add(outputMonitor.onDidDetectSensitiveInputNeeded(() => {
      if (pending || autoCancelled) {
        return;
      }
      const isAutoApproved = chatSessionResource && isSessionAutoApproveLevel(chatSessionResource, this._configurationService);
      const chatModel = chatSessionResource && this._chatService.getSession(chatSessionResource);
      if (isAutoApproved) {
        autoCancelled = true;
        if (chatModel instanceof ChatModel) {
          const request3 = chatModel.getRequests().at(-1);
          if (request3) {
            const infoPart = new ChatElicitationRequestPart(
              new MarkdownString(localize(20534, null)),
              new MarkdownString(localize(20533, null)),
              "",
              localize(20536, null),
              "",
              async () => {
                infoPart.hide();
                return "accepted" /* Accepted */;
              },
              async () => {
                infoPart.hide();
                return "rejected" /* Rejected */;
              },
              void 0,
              void 0,
              void 0,
              void 0
            );
            chatModel.acceptResponseProgress(request3, infoPart);
          }
        }
        onAutoCancelled?.();
        cancelExecution();
        return;
      }
      if (!(chatModel instanceof ChatModel)) {
        this._terminalService.setActiveInstance(terminalInstance);
        this._terminalService.revealTerminal(terminalInstance, true).catch(() => {
        });
        terminalInstance.focus();
        return;
      }
      const request2 = chatModel.getRequests().at(-1);
      if (!request2) {
        return;
      }
      const part = new ChatElicitationRequestPart(
        new MarkdownString(localize(20539, null)),
        new MarkdownString(localize(20538, null)),
        "",
        localize(20537, null),
        localize(20535, null),
        async () => {
          pending = void 0;
          part.hide();
          try {
            this._terminalService.setActiveInstance(terminalInstance);
            await this._terminalService.revealTerminal(terminalInstance, true);
            terminalInstance.focus();
          } catch (err) {
            this._logService.warn(`RunInTerminalTool: failed to reveal terminal for sensitive input`, err);
          }
          return "accepted" /* Accepted */;
        },
        async () => {
          pending = void 0;
          part.hide();
          cancelExecution();
          return "rejected" /* Rejected */;
        },
        void 0,
        void 0,
        () => {
          pending = void 0;
        },
        void 0
      );
      pending = part;
      chatModel.acceptResponseProgress(request2, part);
    }));
    return store;
  }
  _acceptAutomaticSandboxRetryToolInvocationUpdate(retryKind, sessionResource, toolCallId, toolSpecificData, isComplete, toolResultMessage) {
    const chatModel = sessionResource && this._chatService.getSession(sessionResource);
    if (!(chatModel instanceof ChatModel)) {
      return;
    }
    const request2 = chatModel.getRequests().at(-1);
    if (!request2) {
      return;
    }
    const displayCommand = buildCommandDisplayText(toolSpecificData.commandLine.forDisplay ?? toolSpecificData.commandLine.toolEdited ?? toolSpecificData.commandLine.original);
    const progress = {
      kind: "externalToolInvocationUpdate",
      toolCallId,
      toolName: localize(20561, null),
      isComplete,
      invocationMessage: retryKind === "allowNetwork" ? new MarkdownString(localize(20500, null, escapeMarkdownSyntaxTokens(displayCommand))) : new MarkdownString(localize(20546, null, escapeMarkdownSyntaxTokens(displayCommand))),
      pastTenseMessage: toolResultMessage,
      toolSpecificData
    };
    chatModel.acceptResponseProgress(request2, progress);
  }
  async _runAutomaticSandboxRetry(options3) {
    const requestAllowNetwork = options3.retryKind === "allowNetwork";
    const requestUnsandboxedExecution = options3.retryKind === "unsandboxed" && options3.allowUnsandboxedCommands;
    const [os, shell] = await Promise.all([
      this._osBackend,
      this._profileFetcher.getCopilotShell()
    ]);
    const retryRewriteResult = await this._rewriteCommandLine(options3.args.command, {
      cwd: options3.toolSpecificData.cwd ? URI.revive(options3.toolSpecificData.cwd) : void 0,
      shell,
      os,
      isBackground: options3.isBackground,
      requestUnsandboxedExecution,
      requestUnsandboxedExecutionReason: requestUnsandboxedExecution ? options3.retryReason : void 0,
      requestAllowNetwork,
      requestAllowNetworkReason: requestAllowNetwork ? options3.retryReason : void 0
    });
    const rewrittenRetryReason = (requestAllowNetwork ? retryRewriteResult.requestAllowNetworkReason : retryRewriteResult.requestUnsandboxedExecutionReason) ?? options3.retryReason;
    const retryParameters = {
      ...options3.args,
      command: options3.args.command,
      allowToRunUnsandboxedCommands: options3.allowUnsandboxedCommands,
      requestUnsandboxedExecution,
      requestUnsandboxedExecutionReason: requestUnsandboxedExecution ? rewrittenRetryReason : void 0,
      requestAllowNetwork,
      requestAllowNetworkReason: requestAllowNetwork ? rewrittenRetryReason : void 0
    };
    const retryRiskAssessment = {
      toolId: "run_in_terminal" /* RunInTerminal */,
      parameters: {
        ...retryParameters,
        command: retryRewriteResult.rewrittenCommand
      }
    };
    const retryConfirmationCommand = options3.toolSpecificData.presentationOverrides?.commandLine ?? options3.command;
    const shouldRetry = await this._confirmAutomaticSandboxRetry(options3.retryKind, options3.invocation.context?.sessionResource, retryConfirmationCommand, shell, retryRewriteResult.blockedDomains, retryRiskAssessment, options3.token);
    if (!shouldRetry) {
      return void 0;
    }
    const retryToolSpecificData = {
      ...options3.toolSpecificData,
      terminalCommandId: `tool-${generateUuid()}`,
      commandLine: {
        original: options3.args.command,
        toolEdited: retryRewriteResult.rewrittenCommand === options3.args.command ? void 0 : retryRewriteResult.rewrittenCommand,
        forDisplay: retryRewriteResult.forDisplayCommand ?? normalizeTerminalCommandForDisplay(retryRewriteResult.rewrittenCommand ?? options3.args.command),
        isSandboxWrapped: retryRewriteResult.isSandboxWrapped
      },
      requestUnsandboxedExecution: requestUnsandboxedExecution || (requestAllowNetwork ? false : void 0),
      requestUnsandboxedExecutionReason: requestUnsandboxedExecution ? rewrittenRetryReason : void 0,
      requestAllowNetwork: requestAllowNetwork || void 0,
      requestAllowNetworkReason: requestAllowNetwork ? rewrittenRetryReason : void 0,
      terminalCommandUri: void 0,
      terminalCommandOutput: void 0,
      terminalTheme: void 0,
      terminalCommandState: void 0,
      didContinueInBackground: void 0
    };
    const retryToolCallId = `automatic-${options3.retryKind === "allowNetwork" ? "allow-network" : "unsandbox"}-retry-${generateUuid()}`;
    this._acceptAutomaticSandboxRetryToolInvocationUpdate(options3.retryKind, options3.invocation.context?.sessionResource, retryToolCallId, retryToolSpecificData, false);
    return await this.invoke({
      ...options3.invocation,
      parameters: retryParameters,
      toolSpecificData: retryToolSpecificData
    }, options3.countTokens, options3.progress, options3.token);
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const toolSpecificData = invocation.toolSpecificData;
    if (!toolSpecificData) {
      throw new Error("toolSpecificData must be provided for this tool");
    }
    if (!invocation.context) {
      throw new Error("Invocation context must be provided for this tool");
    }
    const commandId = toolSpecificData.terminalCommandId;
    if (toolSpecificData.alternativeRecommendation) {
      return {
        content: [{
          kind: "text",
          value: toolSpecificData.alternativeRecommendation
        }]
      };
    }
    const args2 = invocation.parameters;
    const allowUnsandboxedCommands = this._getAllowToRunUnsandboxedCommands(args2);
    // OpenCode: 沙盒是否生效只看「隔离沙箱」开关，不再因自动允许 / 全自动而关闭
    const isSandboxEnabled = await this._terminalSandboxService.isEnabled();
    if (this._shouldRejectUnsandboxedExecutionRequest(isSandboxEnabled, allowUnsandboxedCommands, args2)) {
      const message = this._getUnsandboxedExecutionDisabledMessage();
      return {
        toolResultError: message,
        toolResultDetails: {
          input: args2.command,
          output: [{ type: "embed", isText: true, value: message }],
          isError: true
        },
        content: [{
          kind: "text",
          value: message
        }]
      };
    }
    const sandboxPrerequisiteTerminalOptions = {
      createTerminal: async () => this._terminalService.createTerminal({}),
      focusTerminal: async (terminal2) => {
        this._terminalService.setActiveInstance(terminal2);
        await this._terminalService.revealTerminal(terminal2, true);
        terminal2.focus();
      }
    };
    if (toolSpecificData.sandboxPrerequisiteFailure) {
      return {
        content: [{ kind: "text", value: toolSpecificData.sandboxPrerequisiteFailure }]
      };
    }
    const isSandboxAllowNetworkEnabled = isSandboxEnabled && await this._terminalSandboxService.isSandboxAllowNetworkEnabled();
    if (this._shouldRejectAllowNetworkRequest(isSandboxEnabled, isSandboxAllowNetworkEnabled, args2)) {
      const message = this._getAllowNetworkRequestDisabledMessage();
      return {
        toolResultError: message,
        toolResultDetails: {
          input: args2.command,
          output: [{ type: "embed", isText: true, value: message }],
          isError: true
        },
        content: [{
          kind: "text",
          value: message
        }]
      };
    }
    if (toolSpecificData.missingSandboxDependencies?.length) {
      if (invocation.selectedCustomButton === "install") {
        const sessionResource = invocation.context.sessionResource;
        const { exitCode: exitCode2 } = await this._terminalSandboxService.installMissingSandboxDependencies(toolSpecificData.missingSandboxDependencies, sessionResource, token, sandboxPrerequisiteTerminalOptions);
        if (exitCode2 !== void 0 && exitCode2 !== 0) {
          return {
            content: [{
              kind: "text",
              value: localize(
                20520,
                null,
                exitCode2
              )
            }]
          };
        }
        if (exitCode2 === void 0) {
          return {
            content: [{
              kind: "text",
              value: localize(
                20526,
                null
              )
            }]
          };
        }
        const refreshedPrereqs = await this._terminalSandboxService.checkForSandboxingPrereqs(true);
        if (refreshedPrereqs.failedCheck !== void 0) {
          return {
            content: [{
              kind: "text",
              value: refreshedPrereqs.failedCheck === "bubblewrap" /* Bubblewrap */ && refreshedPrereqs.remediations?.length ? localize(20516, null) : refreshedPrereqs.failedCheck === "bubblewrap" /* Bubblewrap */ ? localize(20517, null) : localize(20524, null)
            }]
          };
        }
        this._logService.info("RunInTerminalTool: Sandbox dependency installation succeeded");
        return {
          content: [{
            kind: "text",
            value: localize(
              20522,
              null
            )
          }]
        };
      } else {
        this._logService.info("RunInTerminalTool: User cancelled sandbox dependency installation");
        return {
          content: [{
            kind: "text",
            value: localize(
              20519,
              null
            )
          }]
        };
      }
    }
    if (toolSpecificData.sandboxRemediations?.length) {
      const selectedRemediation = toolSpecificData.sandboxRemediations[0];
      const { exitCode: exitCode2 } = await this._terminalSandboxService.runSandboxRemediation(selectedRemediation, invocation.context.sessionResource, token, sandboxPrerequisiteTerminalOptions);
      if (exitCode2 !== 0) {
        return this._getBubblewrapUnsupportedResult();
      }
      const refreshedPrereqs = await this._terminalSandboxService.checkForSandboxingPrereqs(true);
      if (refreshedPrereqs.failedCheck !== void 0) {
        return this._getBubblewrapUnsupportedResult();
      }
      this._logService.info("RunInTerminalTool: Bubblewrap remediation and capability recheck succeeded, proceeding with command execution");
    }
    const executionOptions = this._resolveExecutionOptions(args2);
    this._logService.debug(`RunInTerminalTool: Invoking with options ${JSON.stringify(args2)}`);
    let toolResultMessage;
    if (args2.timeout !== void 0 && (Number.isNaN(args2.timeout) || args2.timeout < 0)) {
      return {
        content: [{
          kind: "text",
          value: "Error: timeout must be a non-negative number of milliseconds (use 0 for no timeout)."
        }]
      };
    }
    if (executionOptions.mode === "sync" && args2.timeout === void 0) {
      args2.timeout = 0;
    }
    const chatSessionResource = invocation.context.sessionResource;
    const shouldSendNotifications = !invocation.subAgentInvocationId;
    const command4 = toolSpecificData.commandLine.userEdited ?? toolSpecificData.commandLine.toolEdited ?? toolSpecificData.commandLine.original;
    const didUserEditCommand = toolSpecificData.commandLine.userEdited !== void 0 && toolSpecificData.commandLine.userEdited !== toolSpecificData.commandLine.original;
    const didToolEditCommand = !didUserEditCommand && toolSpecificData.commandLine.toolEdited !== void 0 && toolSpecificData.commandLine.toolEdited !== toolSpecificData.commandLine.original && // Only consider it a meaningful edit if the display form also differs from the
    // original. Cosmetic rewrites like prepending a space to prevent shell history
    // should not trigger the "tool simplified the command" note.
    normalizeTerminalCommandForDisplay(toolSpecificData.commandLine.toolEdited).trim() !== normalizeTerminalCommandForDisplay(toolSpecificData.commandLine.original).trim();
    const didSandboxWrapCommand = toolSpecificData.commandLine.isSandboxWrapped === true;
    const commandLineForMetadata = isSandboxEnabled ? toolSpecificData.commandLine.forDisplay ?? toolSpecificData.commandLine.original : void 0;
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    if (didSandboxWrapCommand) {
      const deniedAccess = await this._getDeniedSandboxFileAccess(args2.requestFileValidationCheck);
      if (deniedAccess.length > 0) {
        const message = this._buildSandboxFileAccessDeniedMessage(deniedAccess);
        return {
          toolResultError: message,
          toolResultDetails: {
            input: args2.command,
            output: [{ type: "embed", isText: true, value: message }],
            isError: true
          },
          content: [{
            kind: "text",
            value: message
          }]
        };
      }
    }
    let error;
    const automaticUnsandboxRetryReason = localize(20547, null);
    const automaticAllowNetworkRetryReason = localize(20501, null);
    const isNewSession2 = !executionOptions.persistentSession && !this._sessionTerminalAssociations.has(chatSessionResource);
    const timingStart = Date.now();
    const termId = generateUuid();
    const terminalToolSessionId = toolSpecificData.terminalToolSessionId;
    const store = new DisposableStore();
    this._logService.debug(`RunInTerminalTool: Creating ${executionOptions.persistentSession ? "background" : "foreground"} terminal. termId=${termId}, chatSessionResource=${chatSessionResource}`);
    const toolTerminal = await this._initTerminal(chatSessionResource, termId, terminalToolSessionId, executionOptions.persistentSession, token);
    this._handleTerminalVisibility(toolTerminal, chatSessionResource);
    const timingConnectMs = Date.now() - timingStart;
    const xterm = await toolTerminal.instance.xtermReadyPromise;
    if (!xterm) {
      throw new Error("Instance was disposed before xterm.js was ready");
    }
    const commandDetection = toolTerminal.instance.capabilities.get(2 /* CommandDetection */);
    let inputUserChars = 0;
    let inputUserSigint = false;
    store.add(xterm.raw.onData((data) => {
      if (!telemetryIgnoredSequences.includes(data)) {
        inputUserChars += data.length;
      }
      inputUserSigint ||= data === "";
    }));
    let terminalResult = "";
    let outputLineCount = -1;
    let exitCode;
    let altBufferResult;
    let didTimeout = false;
    let didIdleSilence = false;
    let didInputNeeded = false;
    let didSensitiveAutoCancelled = false;
    let isBackgroundExecution = executionOptions.persistentSession;
    let timeoutPromise;
    let timeoutRacePromise;
    let outputMonitor;
    let pollingResult;
    const executeCancellation = store.add(new CancellationTokenSource(token));
    const timeoutValue = args2.timeout !== void 0 ? clamp(args2.timeout, 0, Number.MAX_SAFE_INTEGER) : void 0;
    if (timeoutValue !== void 0 && timeoutValue > 0) {
      const shouldEnforceTimeout = executionOptions.waitStrategy === "idle" || this._configurationService.getValue("chat.tools.terminal.enforceTimeoutFromModel" /* EnforceTimeoutFromModel */) === true;
      if (shouldEnforceTimeout) {
        timeoutPromise = timeout(timeoutValue);
        timeoutRacePromise = timeoutPromise.then(
          () => ({ type: "timeout" })
        ).catch(() => ({ type: "timeout" }));
      }
    }
    let continueInBackgroundResolve;
    const continueInBackgroundPromise = new Promise((resolve3) => {
      continueInBackgroundResolve = resolve3;
    });
    if (terminalToolSessionId) {
      store.add(this._terminalChatService.onDidContinueInBackground((sessionId) => {
        if (sessionId === terminalToolSessionId) {
          const execution = RunInTerminalTool._activeExecutions.get(termId);
          execution?.setBackground?.();
          isBackgroundExecution = true;
          continueInBackgroundResolve?.();
        }
      }));
    }
    let executionPromise;
    try {
      const execution = this._instantiationService.createInstance(
        ActiveTerminalExecution,
        chatSessionResource,
        termId,
        toolTerminal,
        commandDetection,
        executionOptions.persistentSession
      );
      this._logService.info(`RunInTerminalTool: Using \`${execution.strategy.type}\` execute strategy for command \`${command4}\``);
      store.add(execution);
      this._setActiveExecution(termId, execution);
      const startMarkerPromise = Event2.toPromise(execution.strategy.onDidCreateStartMarker);
      const outputMonitorPollFn = executionOptions.persistentSession ? async (executionForPoll) => ({
        output: executionForPoll.getOutput(),
        state: "Idle" /* Idle */
      }) : void 0;
      store.add(execution.strategy.onDidCreateStartMarker((startMarker) => {
        if (!outputMonitor) {
          outputMonitor = this._instantiationService.createInstance(
            OutputMonitor,
            {
              instance: toolTerminal.instance,
              sessionResource: chatSessionResource,
              getOutput: (marker) => execution.getOutput(marker ?? startMarker)
            },
            outputMonitorPollFn,
            invocation.context,
            token,
            command4
          );
        }
      }));
      executionPromise = execution.start(command4, executeCancellation.token, commandId, commandLineForMetadata);
      if (executionOptions.waitStrategy === "idle") {
        this._logService.debug(`RunInTerminalTool: Starting persistent execution with idle wait strategy \`${command4}\``);
        await startMarkerPromise;
        let idleTimedOut = false;
        if (outputMonitor) {
          if (timeoutRacePromise) {
            const idleRace = await Promise.race([
              Event2.toPromise(outputMonitor.onDidFinishCommand).then(() => ({ type: "idle" })),
              timeoutRacePromise
            ]);
            if (idleRace.type === "timeout") {
              idleTimedOut = true;
              this._logService.debug(`RunInTerminalTool: Timeout reached waiting for idle signal, returning output collected so far`);
            } else {
              pollingResult = outputMonitor.pollingResult;
            }
          } else {
            await Event2.toPromise(outputMonitor.onDidFinishCommand);
            pollingResult = outputMonitor.pollingResult;
          }
        }
        await this._commandArtifactCollector.capture(toolSpecificData, toolTerminal.instance, commandId);
        if (token.isCancellationRequested) {
          throw new CancellationError();
        }
        const state = toolSpecificData.terminalCommandState ?? {};
        state.timestamp = state.timestamp ?? timingStart;
        toolSpecificData.terminalCommandState = state;
        let resultText2 = didSandboxWrapCommand ? `Command is now running in terminal with ID=${termId}` : didUserEditCommand ? `Note: The user manually edited the command to \`${command4}\`, and that command is now running in terminal with ID=${termId}` : didToolEditCommand ? `Note: The tool simplified the command to \`${command4}\`, and that command is now running in terminal with ID=${termId}` : `Command is running in terminal with ID=${termId}`;
        const backgroundOutput = pollingResult?.output ?? (idleTimedOut ? execution.getOutput() : void 0);
        const outputAnalyzerMessage2 = backgroundOutput ? await this._getOutputAnalyzerMessage(void 0, backgroundOutput, command4, didSandboxWrapCommand) : void 0;
        if (idleTimedOut) {
          resultText2 += `
 Timed out waiting for the command to become idle. The command is still running, with output:
`;
          if (outputAnalyzerMessage2) {
            resultText2 += `${outputAnalyzerMessage2}
`;
          }
          resultText2 += backgroundOutput ?? "";
        } else if (pollingResult && pollingResult.state === "Idle" /* Idle */) {
          resultText2 += `
 The command became idle with output:
`;
          if (outputAnalyzerMessage2) {
            resultText2 += `${outputAnalyzerMessage2}
`;
          }
          resultText2 += pollingResult.output;
          resultText2 += `
${this._buildInputNeededSteeringText(chatSessionResource, termId, "none")}`;
        } else if (pollingResult) {
          resultText2 += `
 The command is still running, with output:
`;
          if (outputAnalyzerMessage2) {
            resultText2 += `${outputAnalyzerMessage2}
`;
          }
          resultText2 += pollingResult.output;
        }
        const endCwd2 = await toolTerminal.instance.getCwdResource();
        return {
          toolMetadata: {
            exitCode: void 0,
            id: termId,
            terminalId: toolTerminal.instance.instanceId,
            cwd: endCwd2?.toString()
          },
          content: [{
            kind: "text",
            value: resultText2
          }]
        };
      } else {
        const raceCleanup = new DisposableStore();
        startMarkerPromise.then(() => {
          if (outputMonitor && !raceCleanup.isDisposed) {
            raceCleanup.add(this._registerSensitiveInputElicitation(
              chatSessionResource,
              toolTerminal.instance,
              outputMonitor,
              () => executeCancellation.cancel(),
              () => {
                didSensitiveAutoCancelled = true;
              }
            ));
          }
        });
        const raceCandidates = [
          executionPromise.then((result) => ({ type: "completed", result })),
          continueInBackgroundPromise.then(() => ({ type: "background" })),
          new Promise((resolve3) => {
            startMarkerPromise.then(() => {
              if (outputMonitor && !raceCleanup.isDisposed) {
                raceCleanup.add(outputMonitor.onDidDetectInputNeeded(() => resolve3({ type: "inputNeeded" })));
              }
            });
          })
        ];
        if (timeoutRacePromise) {
          raceCandidates.push(timeoutRacePromise);
        }
        const idleSilenceMs = this._configurationService.getValue("chat.tools.terminal.idleSilenceTimeoutMs" /* IdleSilenceTimeoutMs */) ?? DEFAULT_IDLE_SILENCE_TIMEOUT_MS;
        if (idleSilenceMs > 0) {
          const idleSilenceDeferred = new DeferredPromise();
          const idleSilenceScheduler = raceCleanup.add(new RunOnceScheduler(() => idleSilenceDeferred.complete({ type: "idleSilence" }), idleSilenceMs));
          raceCleanup.add(toolTerminal.instance.onData(() => idleSilenceScheduler.schedule()));
          idleSilenceScheduler.schedule();
          raceCandidates.push(idleSilenceDeferred.p);
        }
        let raceResult;
        try {
          raceResult = await Promise.race(raceCandidates);
        } finally {
          raceCleanup.dispose();
        }
        if (raceResult.type === "inputNeeded") {
          this._logService.debug(`RunInTerminalTool: Output monitor detected input needed in foreground terminal, returning output to agent`);
          error = "inputNeeded";
          didInputNeeded = true;
          const idleOutput = execution.getOutput();
          outputLineCount = idleOutput ? count(idleOutput.trim(), "\n") + 1 : 0;
          terminalResult = idleOutput ?? "";
        } else if (raceResult.type === "background") {
          this._logService.debug(`RunInTerminalTool: Continue in background triggered, returning output collected so far`);
          error = "continueInBackground";
          const backgroundOutput = execution.getOutput();
          outputLineCount = backgroundOutput ? count(backgroundOutput.trim(), "\n") + 1 : 0;
          terminalResult = backgroundOutput;
        } else if (raceResult.type === "timeout") {
          this._logService.debug(`RunInTerminalTool: Timeout reached, returning output collected so far`);
          error = "timeout";
          didTimeout = true;
          isBackgroundExecution = true;
          toolTerminal.isBackground = true;
          toolSpecificData.didContinueInBackground = true;
          this._sessionTerminalAssociations.delete(chatSessionResource);
          await this._associateProcessIdWithSession(toolTerminal.instance, chatSessionResource, termId, toolTerminal.shellIntegrationQuality, true);
          const timeoutOutput = execution.getOutput();
          outputLineCount = timeoutOutput ? count(timeoutOutput.trim(), "\n") + 1 : 0;
          terminalResult = timeoutOutput ?? "";
        } else if (raceResult.type === "idleSilence") {
          this._logService.debug(`RunInTerminalTool: Idle silence reached (${idleSilenceMs}ms), promoting to background`);
          error = "idleSilence";
          didIdleSilence = true;
          isBackgroundExecution = true;
          toolTerminal.isBackground = true;
          toolSpecificData.didContinueInBackground = true;
          this._sessionTerminalAssociations.delete(chatSessionResource);
          await this._associateProcessIdWithSession(toolTerminal.instance, chatSessionResource, termId, toolTerminal.shellIntegrationQuality, true);
          const idleSilenceOutput = execution.getOutput();
          outputLineCount = idleSilenceOutput ? count(idleSilenceOutput.trim(), "\n") + 1 : 0;
          terminalResult = idleSilenceOutput ?? "";
        } else {
          const executeResult = raceResult.result;
          toolTerminal.receivedUserInput = false;
          if (token.isCancellationRequested) {
            throw new CancellationError();
          }
          if (executeResult.didEnterAltBuffer) {
            const state = toolSpecificData.terminalCommandState ?? {};
            state.timestamp = state.timestamp ?? timingStart;
            toolSpecificData.terminalCommandState = state;
            toolResultMessage = altBufferMessage;
            outputLineCount = 0;
            error = executeResult.error ?? "alternateBuffer";
            const altBufferCwd = await toolTerminal.instance.getCwdResource();
            altBufferResult = {
              toolResultMessage,
              toolMetadata: {
                exitCode: void 0,
                id: termId,
                terminalId: toolTerminal.instance.instanceId,
                cwd: altBufferCwd?.toString()
              },
              content: [{
                kind: "text",
                value: altBufferMessage
              }]
            };
          } else {
            await this._commandArtifactCollector.capture(toolSpecificData, toolTerminal.instance, commandId);
            {
              const state = toolSpecificData.terminalCommandState ?? {};
              state.timestamp = state.timestamp ?? timingStart;
              if (executeResult.exitCode !== void 0) {
                state.exitCode = executeResult.exitCode;
                if (state.timestamp !== void 0) {
                  state.duration = state.duration ?? Math.max(0, Date.now() - state.timestamp);
                }
              }
              toolSpecificData.terminalCommandState = state;
            }
            this._logService.info(`RunInTerminalTool: Finished \`${execution.strategy.type}\` execute strategy with exitCode \`${executeResult.exitCode}\`, result.length \`${executeResult.output?.length}\`, error \`${executeResult.error}\``);
            outputLineCount = executeResult.output === void 0 ? 0 : count(executeResult.output.trim(), "\n") + 1;
            exitCode = executeResult.exitCode;
            error = executeResult.error;
            const resultArr = [];
            if (executeResult.output !== void 0) {
              resultArr.push(executeResult.output);
            }
            if (executeResult.additionalInformation) {
              resultArr.push(executeResult.additionalInformation);
            }
            terminalResult = resultArr.join("\n\n");
          }
        }
      }
    } catch (e4) {
      if (didTimeout && e4 instanceof CancellationError) {
        this._logService.debug(`RunInTerminalTool: Timeout reached, returning output collected so far`);
        error = "timeout";
        isBackgroundExecution = true;
        toolTerminal.isBackground = true;
        toolSpecificData.didContinueInBackground = true;
        this._sessionTerminalAssociations.delete(chatSessionResource);
        const timeoutOutput = getOutput(toolTerminal.instance, void 0);
        outputLineCount = timeoutOutput ? count(timeoutOutput.trim(), "\n") + 1 : 0;
        terminalResult = timeoutOutput ?? "";
      } else {
        this._logService.debug(`RunInTerminalTool: Threw exception`);
        if (e4 instanceof CancellationError) {
          await this._commandArtifactCollector.capture(toolSpecificData, toolTerminal.instance, commandId);
          const state = toolSpecificData.terminalCommandState ?? {};
          if (state.exitCode === void 0) {
            state.exitCode = -1;
            state.timestamp = state.timestamp ?? timingStart;
            state.duration = state.duration ?? Math.max(0, Date.now() - state.timestamp);
          }
          toolSpecificData.terminalCommandState = state;
        }
        RunInTerminalTool._activeExecutions.get(termId)?.dispose();
        this._deleteActiveExecution(termId);
        toolTerminal.instance.dispose();
        error = e4 instanceof CancellationError ? "canceled" : "unexpectedException";
        throw e4;
      }
    } finally {
      timeoutPromise?.cancel();
      if ((isBackgroundExecution || didInputNeeded) && executionPromise) {
        executionPromise.catch((e4) => {
          if (!(e4 instanceof CancellationError)) {
            this._logService.error(`RunInTerminalTool: Background execution error`, e4);
          }
        });
        if (shouldSendNotifications) {
          const alreadyNotifiedInputNeededOutput = didInputNeeded ? terminalResult : void 0;
          this._registerCompletionNotification(toolTerminal.instance, termId, chatSessionResource, command4, toolSpecificData, outputMonitor, alreadyNotifiedInputNeededOutput);
        } else {
          outputMonitor?.dispose();
        }
      } else {
        RunInTerminalTool._activeExecutions.get(termId)?.dispose();
        this._deleteActiveExecution(termId);
        outputMonitor?.dispose();
      }
      store.dispose();
      const timingExecuteMs = Date.now() - timingStart;
      this._telemetry.logInvoke(toolTerminal.instance, {
        terminalToolSessionId: toolSpecificData.terminalToolSessionId,
        didUserEditCommand,
        didToolEditCommand,
        isBackground: executionOptions.persistentSession,
        isSandboxWrapped: toolSpecificData.commandLine.isSandboxWrapped === true,
        requestUnsandboxedExecutionReason: args2.requestUnsandboxedExecutionReason,
        shellIntegrationQuality: toolTerminal.shellIntegrationQuality,
        error,
        isNewSession: isNewSession2,
        outputLineCount,
        exitCode,
        timingExecuteMs,
        timingConnectMs,
        inputUserChars,
        inputUserSigint,
        terminalExecutionIdleBeforeTimeout: pollingResult?.state === "Idle" /* Idle */,
        pollDurationMs: pollingResult?.pollDurationMs,
        inputToolManualAcceptCount: outputMonitor?.outputMonitorTelemetryCounters?.inputToolManualAcceptCount,
        inputToolManualRejectCount: outputMonitor?.outputMonitorTelemetryCounters?.inputToolManualRejectCount,
        inputToolManualChars: outputMonitor?.outputMonitorTelemetryCounters?.inputToolManualChars,
        inputToolAutoAcceptCount: outputMonitor?.outputMonitorTelemetryCounters?.inputToolAutoAcceptCount,
        inputToolAutoChars: outputMonitor?.outputMonitorTelemetryCounters?.inputToolAutoChars,
        inputToolManualShownCount: outputMonitor?.outputMonitorTelemetryCounters?.inputToolManualShownCount,
        inputToolFreeFormInputCount: outputMonitor?.outputMonitorTelemetryCounters?.inputToolFreeFormInputCount,
        inputToolFreeFormInputShownCount: outputMonitor?.outputMonitorTelemetryCounters?.inputToolFreeFormInputShownCount
      });
    }
    if (altBufferResult) {
      return altBufferResult;
    }
    if (didSandboxWrapCommand && outputLooksBubblewrapHostRestricted(terminalResult)) {
      return this._getBubblewrapHostRestrictedResult();
    }
    const shouldAutoRetryUnsandboxed = shouldAutomaticallyRetryUnsandboxed({
      allowUnsandboxedCommands,
      didSandboxWrapCommand,
      requestUnsandboxedExecution: args2.requestUnsandboxedExecution === true,
      isPersistentSession: executionOptions.persistentSession,
      isBackgroundExecution: isBackgroundExecution || didInputNeeded,
      didTimeout,
      exitCode,
      output: terminalResult
    });
    const shouldAutoRetryAllowNetwork = shouldAutomaticallyRetryAllowNetworkInSandboxed({
      retryWithAllowNetworkRequests: isSandboxEnabled && !isSandboxAllowNetworkEnabled && this._retryWithAllowNetworkRequests,
      didSandboxWrapCommand,
      requestUnsandboxedExecution: args2.requestUnsandboxedExecution === true,
      requestAllowNetwork: args2.requestAllowNetwork === true,
      isPersistentSession: executionOptions.persistentSession,
      isBackgroundExecution: isBackgroundExecution || didInputNeeded,
      didTimeout,
      exitCode,
      output: terminalResult
    });
    const automaticSandboxRetry = shouldAutoRetryAllowNetwork ? { retryKind: "allowNetwork", retryReason: automaticAllowNetworkRetryReason } : shouldAutoRetryUnsandboxed ? { retryKind: "unsandboxed", retryReason: automaticUnsandboxRetryReason } : void 0;
    if (automaticSandboxRetry) {
      const retryResult = await this._runAutomaticSandboxRetry({
        ...automaticSandboxRetry,
        invocation,
        countTokens: _countTokens,
        progress: _progress,
        token,
        args: args2,
        toolSpecificData,
        command: command4,
        allowUnsandboxedCommands,
        isBackground: executionOptions.persistentSession
      });
      if (retryResult) {
        return retryResult;
      }
    }
    this._terminalToolCreator.refreshShellIntegrationQuality(toolTerminal);
    this._logService.info(`RunInTerminalTool: shellIntegrationQuality=${toolTerminal.shellIntegrationQuality} at banner decision time`);
    if (!toolResultMessage && toolTerminal.shellIntegrationQuality === "none" /* None */) {
      toolResultMessage = "$(info) Enable [shell integration](https://code.visualstudio.com/docs/terminal/shell-integration) to improve command detection";
    }
    const resultText = [];
    if (!didSandboxWrapCommand) {
      if (didUserEditCommand) {
        resultText.push(`Note: The user manually edited the command to \`${command4}\` (terminal ID=${termId}), and this is the output of running that command instead:
`);
      } else if (didToolEditCommand) {
        const wasDetachedToBackground = /(^|\s)nohup\s|Start-Process\b/.test(command4);
        const stdinHint = wasDetachedToBackground ? ' Note that stdin is closed for detached background processes; do not try to send input via send_to_terminal \u2014 re-run with mode="sync" instead if interactive input is required.' : "";
        resultText.push(`Note: The tool simplified the command to \`${command4}\` (terminal ID=${termId}).${stdinHint} This is the output of running that command instead:
`);
      }
      if (isBackgroundExecution && !executionOptions.persistentSession) {
        resultText.push(`Note: This terminal execution was moved to the background using the ID ${termId}
`);
      }
    }
    if (didSensitiveAutoCancelled) {
      resultText.push(`Note: The command in terminal ID ${termId} was prompting for a password, passphrase, or other secret. The user is unavailable (the chat permission mode auto-allows tool calls, so no human can focus the terminal to type a secret) and the command has been cancelled. Stop, do NOT retry the command, do NOT call ${"send_to_terminal" /* SendToTerminal */}, and do NOT call vscode_askQuestions for the secret. Tell the user to run the command interactively when they are available.

`);
    } else if (didInputNeeded) {
      resultText.push(`Note: The command is running in terminal ID ${termId} and may be waiting for input.
${this._buildInputNeededSteeringText(chatSessionResource, termId, "none")}

`);
    } else if (didTimeout && timeoutValue !== void 0 && timeoutValue > 0) {
      const notificationHint = shouldSendNotifications ? " You will be automatically notified on your next turn when it completes." : "";
      resultText.push(`Note: Command timed out after ${timeoutValue}ms. The command may still be running in terminal ID ${termId}.${notificationHint}
${this._buildInputNeededSteeringText(chatSessionResource, termId, "timeout")}

`);
    } else if (didIdleSilence) {
      const notificationHint = shouldSendNotifications ? " You will be automatically notified on your next turn when it completes." : "";
      resultText.push(`Note: The command produced no new output for an extended period and was moved to background terminal ID ${termId}; the process is still running and has not been killed.${notificationHint}
${this._buildInputNeededSteeringText(chatSessionResource, termId, "idleSilence")}

`);
    }
    const outputAnalyzerMessage = await this._getOutputAnalyzerMessage(exitCode, terminalResult, command4, didSandboxWrapCommand);
    if (outputAnalyzerMessage) {
      resultText.push(`${outputAnalyzerMessage}
`);
    }
    let outputForResult = terminalResult;
    if (this._configurationService.getValue("chat.tools.terminal.outputCompaction" /* OutputCompaction */) === true) {
      try {
        const commandForCompaction = toolSpecificData.commandLine.forDisplay ?? command4;
        const report = compact(commandForCompaction, terminalResult);
        this._telemetry.logCompaction(report);
        if (report.applied) {
          outputForResult = report.compactedOutput;
        }
      } catch {
        this._telemetry.logCompactionFailed();
      }
    }
    const processedOutput = await this._largeOutputFileWriter.processOutput(outputForResult);
    resultText.push(processedOutput);
    const isError = exitCode !== void 0 && exitCode !== 0;
    const endCwd = await toolTerminal.instance.getCwdResource();
    const imageContent = await this._extractImagesFromOutput(terminalResult, endCwd);
    return {
      toolResultMessage,
      toolMetadata: {
        exitCode,
        id: termId,
        terminalId: toolTerminal.instance.instanceId,
        cwd: endCwd?.toString(),
        timedOut: didTimeout || void 0,
        timeoutMs: didTimeout ? timeoutValue : void 0,
        inputNeeded: didInputNeeded || void 0
      },
      toolResultDetails: isError ? {
        input: command4,
        output: [{ type: "embed", isText: true, value: outputForResult }],
        isError: true
      } : void 0,
      content: [
        {
          kind: "text",
          value: resultText.join("")
        },
        ...imageContent
      ]
    };
  }
  _getBubblewrapUnsupportedResult() {
    const settingId = "chat.agent.sandbox.enabled" /* AgentSandboxEnabled */;
    const message = localize(
      20507,
      null,
      settingId
    );
    const settingsCommandArgs = encodeURIComponent(JSON.stringify([`@id:${settingId}`]));
    const toolResultMessage = new MarkdownString(localize(
      20508,
      null,
      settingId,
      settingsCommandArgs
    ), { isTrusted: { enabledCommands: ["workbench.action.openSettings"] } });
    return {
      content: [{ kind: "text", value: message }],
      toolResultMessage
    };
  }
  _getBubblewrapHostRestrictedResult() {
    const settingId = "chat.agent.sandbox.enabled" /* AgentSandboxEnabled */;
    const message = localize(
      20506,
      null,
      settingId
    );
    return {
      content: [{ kind: "text", value: message }],
      toolResultMessage: message
    };
  }
  /**
   * Builds the steering text the model sees when the terminal tool suspects
   * the command may be waiting for input. The heuristic that triggers this
   * note can false-positive on long-running compute commands or shells sitting
   * on a secondary prompt (e.g. heredoc continuation `> `), so the text
   * explicitly:
   *   1. Tells the model this note is NOT a signal to end the turn.
   *   2. In auto-approve mode, leads with `send_to_terminal` for non-secret
   *      prompts to minimize round-trips, with a `get_terminal_output` fallback.
   *   3. In default mode, leads with `get_terminal_output` as the safe
   *      recovery action and offers `vscode_askQuestions` only for real
   *      non-secret prompts. Secret prompts (passwords, passphrases,
   *      tokens) must never be routed through `vscode_askQuestions`
   *      because answers to that tool are sent through the model — the
   *      user is told to type those values directly into the terminal.
   * `kill_terminal` is only advertised when the command may be hung
   * (`'timeout'` or `'idleSilence'`) — suggesting it in the general case
   * leads the model to terminate valid interactive sessions (e.g.
   * `npm init`) instead of driving them.
   */
  _buildInputNeededSteeringText(chatSessionResource, termId, hungHint) {
    const isAutoApproved = isSessionAutoApproveLevel(chatSessionResource, this._configurationService);
    const lines = [];
    lines.push(`This note is not a signal to end the turn \u2014 pick one of the actions below and continue.`);
    if (isAutoApproved) {
      lines.push(`  1. If the output clearly ends with a non-secret input prompt (Continue? (y/n), Enter selection, etc. \u2014 a normal shell prompt like \`$\` or \`#\` does NOT count), determine the answer and immediately call ${"send_to_terminal" /* SendToTerminal */} with id="${termId}" (which returns the next few lines of output). Repeat one prompt at a time. Never guess passwords, passphrases, tokens, or other secrets \u2014 if the prompt requires a secret you do not have, inform the user and stop.`);
      lines.push(`  2. If the command may still be producing output or the shell prompt has not returned, call ${"get_terminal_output" /* GetTerminalOutput */} with id="${termId}" to continue polling.`);
    } else {
      lines.push(`  1. If the command may still be producing output or the shell prompt has not returned, call ${"get_terminal_output" /* GetTerminalOutput */} with id="${termId}" to continue polling. This is the default and safest action when unsure.`);
      lines.push(`  2. Only if the output clearly ends with a real non-secret input prompt (Continue? (y/n), Enter selection, etc. \u2014 a normal shell prompt like \`$\` or \`#\` does NOT count), call the vscode_askQuestions tool to ask the user, then send each answer using ${"send_to_terminal" /* SendToTerminal */} with id="${termId}" (which returns the next few lines of output). Repeat one prompt at a time. NEVER route secret prompts (passwords, passphrases, tokens, API keys, etc.) through vscode_askQuestions \u2014 answers to that tool are sent through the model. For secret prompts, tell the user to type the value directly into the terminal and stop.`);
    }
    if (hungHint === "timeout") {
      lines.push(`  3. A timeout does not mean the command failed \u2014 call ${"get_terminal_output" /* GetTerminalOutput */} with id="${termId}" to continue polling. Only call ${"kill_terminal" /* KillTerminal */} if the command is genuinely hung and you need to retry with a different approach.`);
    } else if (hungHint === "idleSilence") {
      lines.push(`  3. Producing no output for an extended period does not mean the command failed \u2014 call ${"get_terminal_output" /* GetTerminalOutput */} with id="${termId}" to continue polling. Only call ${"kill_terminal" /* KillTerminal */} if the command is genuinely hung and you need to retry with a different approach.`);
    }
    return lines.join("\n");
  }
  async _getOutputAnalyzerMessage(exitCode, exitResult, commandLine, isSandboxWrapped) {
    for (const analyzer of this._outputAnalyzers) {
      const message = await analyzer.analyze({ exitCode, exitResult, commandLine, isSandboxWrapped });
      if (message) {
        return message;
      }
    }
    return void 0;
  }
  static {
    this._maxImageFileSize = 5 * 1024 * 1024;
  }
  /**
   * Scans terminal output for file paths that point to images and reads them.
   * Returns data content parts for any found images that exist on disk.
   */
  async _extractImagesFromOutput(output, cwd2) {
    const pathPattern = /[^\s/\\]*(?:[/\\][^\s/\\]*)+\.(?:png|jpe?g|gif|webp|bmp)/gi;
    const matches2 = /* @__PURE__ */ new Set();
    for (const line of output.split(/\r?\n/)) {
      if (line.length > 1e4) {
        continue;
      }
      for (const match2 of line.matchAll(pathPattern)) {
        matches2.add(match2[0]);
      }
    }
    if (matches2.size === 0) {
      return [];
    }
    const results = [];
    for (const filePath of matches2) {
      try {
        const mimeType = getMediaMime(filePath);
        if (!mimeType || !mimeType.startsWith("image/")) {
          continue;
        }
        let fileUri;
        if (/^\/|^[A-Za-z]:[\\\/]/.test(filePath)) {
          fileUri = URI.file(filePath);
        } else if (cwd2) {
          fileUri = URI.joinPath(cwd2, filePath);
        } else {
          continue;
        }
        const stat = await this._fileService.stat(fileUri).catch(() => void 0);
        if (!stat || stat.isDirectory || stat.size > RunInTerminalTool._maxImageFileSize) {
          continue;
        }
        const fileContent = await this._fileService.readFile(fileUri);
        results.push({
          kind: "data",
          value: {
            mimeType,
            data: fileContent.value
          },
          audience: [1 /* User */]
        });
      } catch {
      }
    }
    return results;
  }
  _handleTerminalVisibility(toolTerminal, chatSessionResource) {
    const chatSessionOpenInWidget = !!this._chatWidgetService.getWidgetBySessionResource(chatSessionResource);
    if (this._configurationService.getValue("chat.tools.terminal.outputLocation" /* OutputLocation */) === "terminal" && chatSessionOpenInWidget) {
      this._terminalService.setActiveInstance(toolTerminal.instance);
      this._terminalService.revealTerminal(toolTerminal.instance, true);
    }
  }
  // #region Terminal init
  /**
   * Initializes a terminal for command execution. For foreground mode, reuses existing cached
   * terminal from the session. For background mode, always creates a new terminal to allow
   * parallel execution.
   */
  async _initTerminal(chatSessionResource, termId, terminalToolSessionId, isBackground, token) {
    if (!isBackground) {
      const cachedTerminal = this._sessionTerminalAssociations.get(chatSessionResource);
      if (cachedTerminal && !cachedTerminal.isBackground && !cachedTerminal.instance.isDisposed) {
        if (cachedTerminal.instance.exitCode !== void 0) {
          this._logService.info(`RunInTerminalTool: Cached terminal shell has exited (code=${cachedTerminal.instance.exitCode}), creating a new terminal`);
          this._sessionTerminalAssociations.delete(chatSessionResource);
        } else {
          this._logService.debug(`RunInTerminalTool: Using cached terminal with session resource \`${chatSessionResource}\``);
          this._terminalToolCreator.refreshShellIntegrationQuality(cachedTerminal);
          this._terminalChatService.registerTerminalInstanceWithToolSession(terminalToolSessionId, cachedTerminal.instance);
          this._backgroundNotifications.deleteAndDispose(cachedTerminal.instance.instanceId);
          return cachedTerminal;
        }
      }
    }
    this._logService.debug(`RunInTerminalTool: Creating ${isBackground ? "background" : "foreground"} terminal with ID=${termId}`);
    const profile = await this._profileFetcher.getCopilotProfile();
    const os = await this._osBackend;
    const toolTerminal = await this._terminalToolCreator.createTerminal(profile, os, token);
    toolTerminal.isBackground = isBackground;
    this._terminalChatService.registerTerminalInstanceWithToolSession(terminalToolSessionId, toolTerminal.instance);
    this._terminalChatService.registerTerminalInstanceWithChatSession(chatSessionResource, toolTerminal.instance);
    this._registerInputListener(toolTerminal);
    this._addSessionTerminalAssociation(chatSessionResource, toolTerminal);
    if (token.isCancellationRequested) {
      toolTerminal.instance.dispose();
      throw new CancellationError();
    }
    await this._setupProcessIdAssociation(toolTerminal, chatSessionResource, termId, isBackground);
    return toolTerminal;
  }
  _registerInputListener(toolTerminal) {
    const disposable = toolTerminal.instance.onData((data) => {
      if (!telemetryIgnoredSequences.includes(data)) {
        toolTerminal.receivedUserInput = data.length > 0;
      }
    });
    Event2.once(toolTerminal.instance.onDisposed)(() => disposable.dispose());
  }
  // #endregion
  // #region Session management
  _restoreTerminalAssociations() {
    const storedAssociations = this._storageService.get("chat.terminalSessions" /* TerminalSession */, 1 /* WORKSPACE */, "{}");
    try {
      const associations = JSON.parse(storedAssociations);
      for (const instance2 of this._terminalService.instances) {
        if (instance2.processId) {
          const association = associations[instance2.processId];
          if (association) {
            const chatSessionResource = LocalChatSessionUri.forSession(association.sessionId);
            this._logService.debug(`RunInTerminalTool: Restored terminal association for PID ${instance2.processId}, session ${association.sessionId}`);
            const toolTerminal = {
              instance: instance2,
              shellIntegrationQuality: association.shellIntegrationQuality,
              isBackground: association.isBackground
            };
            this._addSessionTerminalAssociation(chatSessionResource, toolTerminal);
            this._terminalChatService.registerTerminalInstanceWithChatSession(chatSessionResource, instance2);
            if (association.id) {
              this._setActiveExecution(association.id, this._register(new RestoredTerminalExecution(instance2)));
            }
            Event2.once(instance2.onDisposed)(() => {
              this._removeProcessIdAssociation(instance2.processId);
              this._removeExecutionAssociations(instance2);
            });
          }
        }
      }
    } catch (error) {
      this._logService.debug(`RunInTerminalTool: Failed to restore terminal associations: ${error}`);
    }
  }
  async _setupProcessIdAssociation(toolTerminal, chatSessionResource, termId, isBackground) {
    await this._associateProcessIdWithSession(toolTerminal.instance, chatSessionResource, termId, toolTerminal.shellIntegrationQuality, isBackground);
    Event2.once(toolTerminal.instance.onDisposed)(() => {
      if (toolTerminal.instance.processId) {
        this._removeProcessIdAssociation(toolTerminal.instance.processId);
      }
    });
  }
  async _associateProcessIdWithSession(terminal2, chatSessionResource, id2, shellIntegrationQuality, isBackground) {
    try {
      const pid = await Promise.race([
        terminal2.processReady.then(() => terminal2.processId),
        timeout(5e3).then(() => {
          throw new Error("Timeout");
        })
      ]);
      if (isNumber(pid)) {
        const storedAssociations = this._storageService.get("chat.terminalSessions" /* TerminalSession */, 1 /* WORKSPACE */, "{}");
        const associations = JSON.parse(storedAssociations);
        const sessionId = chatSessionResourceToId(chatSessionResource);
        const existingAssociation = associations[pid] || {};
        associations[pid] = {
          ...existingAssociation,
          sessionId,
          shellIntegrationQuality,
          id: id2,
          isBackground
        };
        this._storageService.store("chat.terminalSessions" /* TerminalSession */, JSON.stringify(associations), 1 /* WORKSPACE */, 0 /* USER */);
        this._logService.debug(`RunInTerminalTool: Associated terminal PID ${pid} with session ${sessionId}`);
      }
    } catch (error) {
      this._logService.debug(`RunInTerminalTool: Failed to associate terminal with session: ${error}`);
    }
  }
  async _removeProcessIdAssociation(pid) {
    try {
      const storedAssociations = this._storageService.get("chat.terminalSessions" /* TerminalSession */, 1 /* WORKSPACE */, "{}");
      const associations = JSON.parse(storedAssociations);
      if (associations[pid]) {
        delete associations[pid];
        this._storageService.store("chat.terminalSessions" /* TerminalSession */, JSON.stringify(associations), 1 /* WORKSPACE */, 0 /* USER */);
        this._logService.debug(`RunInTerminalTool: Removed terminal association for PID ${pid}`);
      }
    } catch (error) {
      this._logService.debug(`RunInTerminalTool: Failed to remove terminal association: ${error}`);
    }
  }
  _cleanupSessionTerminals(chatSessionResource) {
    const sessionTerminals = this._sessionTerminalInstances.get(chatSessionResource);
    const toolTerminal = this._sessionTerminalAssociations.get(chatSessionResource);
    const terminalsToDispose = sessionTerminals ?? (toolTerminal ? /* @__PURE__ */ new Set([toolTerminal.instance]) : void 0);
    if (!terminalsToDispose || terminalsToDispose.size === 0) {
      return;
    }
    const shouldPreserveTerminalsForOutputLocation = this._configurationService.getValue("chat.tools.terminal.outputLocation" /* OutputLocation */) === "terminal";
    this._logService.debug(`RunInTerminalTool: Cleaning up ${terminalsToDispose.size} terminal(s) for ended chat session ${chatSessionResource}`);
    this._sessionTerminalAssociations.delete(chatSessionResource);
    this._sessionTerminalInstances.delete(chatSessionResource);
    for (const terminal2 of terminalsToDispose) {
      if (this._terminalService.foregroundInstances.includes(terminal2) || shouldPreserveTerminalsForOutputLocation) {
        this._logService.debug(`RunInTerminalTool: Skipping disposal of preserved terminal ${terminal2.instanceId} for session ${chatSessionResource}`);
        continue;
      }
      this._terminalsBeingDisposedBySessionCleanup.add(terminal2);
      terminal2.dispose();
    }
    const terminalToRemove = [];
    for (const [termId, execution] of RunInTerminalTool._activeExecutions.entries()) {
      if (terminalsToDispose.has(execution.instance)) {
        if (this._terminalService.foregroundInstances.includes(execution.instance) || shouldPreserveTerminalsForOutputLocation) {
          continue;
        }
        execution.dispose();
        terminalToRemove.push(termId);
      }
    }
    for (const termId of terminalToRemove) {
      this._deleteActiveExecution(termId);
    }
  }
  _addSessionTerminalAssociation(chatSessionResource, toolTerminal) {
    this._ensureArchivedSessionListener();
    let sessionTerminals = this._sessionTerminalInstances.get(chatSessionResource);
    if (!sessionTerminals) {
      sessionTerminals = /* @__PURE__ */ new Set();
      this._sessionTerminalInstances.set(chatSessionResource, sessionTerminals);
    }
    sessionTerminals.add(toolTerminal.instance);
    if (!toolTerminal.isBackground) {
      this._sessionTerminalAssociations.set(chatSessionResource, toolTerminal);
    }
  }
  _ensureArchivedSessionListener() {
    if (this._archivedSessionListener.value) {
      return;
    }
    this._archivedSessionListener.value = this._agentSessionsService.onDidChangeSessionArchivedState((session) => {
      if (session.isArchived()) {
        this._cleanupSessionTerminals(session.resource);
      }
    });
  }
  _removeTerminalAssociations(terminal2) {
    if (this._terminalsBeingDisposedBySessionCleanup.delete(terminal2)) {
      this._removeExecutionAssociations(terminal2);
      return;
    }
    for (const [sessionResource, toolTerminal] of this._sessionTerminalAssociations.entries()) {
      if (terminal2 === toolTerminal.instance) {
        this._sessionTerminalAssociations.delete(sessionResource);
      }
    }
    for (const [sessionResource, sessionTerminals] of this._sessionTerminalInstances.entries()) {
      if (!sessionTerminals.delete(terminal2)) {
        continue;
      }
      if (sessionTerminals.size === 0) {
        this._sessionTerminalInstances.delete(sessionResource);
      }
    }
    this._removeExecutionAssociations(terminal2);
  }
  _removeExecutionAssociations(terminal2) {
    const executionIdsToRemove = [];
    for (const [termId, execution] of RunInTerminalTool._activeExecutions.entries()) {
      if (execution.instance === terminal2) {
        execution.dispose();
        executionIdsToRemove.push(termId);
      }
    }
    for (const termId of executionIdsToRemove) {
      this._deleteActiveExecution(termId);
    }
  }
  /**
   * Registers a listener for command completion on a background terminal.
   * When a command finishes, sends a steering message to the chat session
   * so the agent is notified on its next turn.
   *
   * If an output monitor is provided, it is continued in background mode
   * to detect prompts-for-input while the terminal runs in the background.
   * The output monitor is cancelled and disposed when a command finishes.
   */
  _registerCompletionNotification(terminalInstance, termId, chatSessionResource, commandName, toolSpecificData, outputMonitor, alreadyNotifiedInputNeededOutput) {
    const notificationKey = terminalInstance.instanceId;
    this._backgroundNotifications.deleteAndDispose(notificationKey);
    const commandDetection = terminalInstance.capabilities.get(2 /* CommandDetection */);
    if (!commandDetection) {
      outputMonitor?.dispose();
      return;
    }
    const commandDisplay = appendEscapedMarkdownInlineCode(buildCompletionNotificationCommand(commandName));
    const sessionRef = this._chatService.acquireExistingSession(chatSessionResource, "RunInTerminalTool#completionNotification");
    if (!sessionRef) {
      this._logService.warn(`RunInTerminalTool: Cannot register completion notification for terminal ${termId} - session already disposed`);
      outputMonitor?.dispose();
      return;
    }
    const lastRequest2 = sessionRef.object.lastRequest;
    const sendOptions = {};
    if (lastRequest2) {
      sendOptions.userSelectedModelId = lastRequest2.modelId;
      sendOptions.modeInfo = lastRequest2.modeInfo;
      const previousAgentId = lastRequest2.response?.agent?.id;
      sendOptions.agentIdSilent = previousAgentId;
      const contribution = previousAgentId ? this._chatSessionsService.getChatSessionContribution(previousAgentId) : void 0;
      const autoAttachEnabled = contribution ? contribution.autoAttachReferences === true : true;
      if (autoAttachEnabled) {
        sendOptions.instructionContext = {
          modeKind: lastRequest2.modeInfo?.kind ?? "agent" /* Agent */,
          enabledTools: lastRequest2.userSelectedTools
        };
      }
      if (lastRequest2.userSelectedTools) {
        sendOptions.userSelectedTools = constObservable(lastRequest2.userSelectedTools);
      }
    }
    const store = new DisposableStore();
    let userIsReplyingDirectly = false;
    const disposeNotification = () => this._backgroundNotifications.deleteAndDispose(notificationKey);
    const handleSessionCancelled = () => {
      if (sessionRef.object.lastRequest?.response?.isCanceled) {
        disposeNotification();
        return true;
      }
      return false;
    };
    store.add(autorun((reader) => {
      const request2 = sessionRef.object.lastRequestObs.read(reader);
      if (!request2?.response) {
        return;
      }
      reader.store.add(request2.response.onDidChange((ev) => {
        if (ev.reason === "completedRequest" && request2.response.isCanceled) {
          disposeNotification();
        }
      }));
    }));
    if (outputMonitor) {
      let lastInputNeededOutput = alreadyNotifiedInputNeededOutput ?? "";
      let lastInputNeededNotificationTime = alreadyNotifiedInputNeededOutput !== void 0 ? Date.now() : 0;
      const bgCts = new CancellationTokenSource();
      store.add(toDisposable(() => {
        bgCts.cancel();
        bgCts.dispose();
      }));
      store.add(outputMonitor);
      outputMonitor.continueMonitoringAsync(bgCts.token);
      store.add(this._registerSensitiveInputElicitation(
        chatSessionResource,
        terminalInstance,
        outputMonitor,
        () => {
          const execution = RunInTerminalTool._activeExecutions.get(termId);
          execution?.dispose();
        }
      ));
      store.add(outputMonitor.onDidDetectInputNeeded(() => {
        if (userIsReplyingDirectly) {
          this._logService.debug(`RunInTerminalTool: Suppressing input-needed notification for terminal ${termId} because user is replying directly`);
          return;
        }
        if (terminalInstance.isDisposed) {
          this._logService.debug(`RunInTerminalTool: Suppressing input-needed notification for terminal ${termId} because the terminal is disposed`);
          return;
        }
        if (handleSessionCancelled()) {
          return;
        }
        const execution = RunInTerminalTool._activeExecutions.get(termId);
        if (!execution) {
          return;
        }
        const currentOutput = execution.getOutput();
        const now = Date.now();
        const isDuplicate = currentOutput === lastInputNeededOutput && now - lastInputNeededNotificationTime < INPUT_NEEDED_NOTIFICATION_THROTTLE_MS;
        if (isDuplicate) {
          return;
        }
        lastInputNeededOutput = currentOutput;
        lastInputNeededNotificationTime = now;
        const inputAction = this._buildInputNeededSteeringText(chatSessionResource, termId, "none");
        const message = `[Terminal ${termId} notification: command may be waiting for input \u2014 assess the output below.]
${inputAction}
Terminal output:
${currentOutput}`;
        this._logService.debug(`RunInTerminalTool: Input needed in background terminal ${termId}, notifying chat session`);
        this._chatService.sendRequest(chatSessionResource, message, {
          ...sendOptions,
          queue: "steering" /* Steering */,
          isSystemInitiated: true,
          systemInitiatedLabel: localize(20564, null, commandDisplay),
          terminalExecutionId: termId
        }).catch((e4) => {
          this._logService.warn(`RunInTerminalTool: Failed to send input-needed notification for terminal ${termId}`, e4);
        });
      }));
    }
    store.add(terminalInstance.onDidInputData(() => {
      if (userIsReplyingDirectly) {
        return;
      }
      userIsReplyingDirectly = true;
      this._dismissPendingCarouselsForTerminal(chatSessionResource, termId);
    }));
    store.add(sessionRef);
    store.add(commandDetection.onCommandFinished((command4) => {
      const execution = RunInTerminalTool._activeExecutions.get(termId);
      if (!execution) {
        disposeNotification();
        return;
      }
      if (handleSessionCancelled()) {
        return;
      }
      disposeNotification();
      const exitCode = command4.exitCode;
      const exitCodeText = exitCode !== void 0 && exitCode !== 0 ? ` with exit code ${exitCode}` : "";
      const currentOutput = execution.getOutput();
      const isUserVisible = this._terminalService.foregroundInstances.includes(terminalInstance);
      const message = isUserVisible ? `[Terminal ${termId} notification: command completed${exitCodeText}. Use send_to_terminal to send another command or kill_terminal to stop it.]
Terminal output:
${currentOutput}` : `[Terminal ${termId} notification: command completed${exitCodeText}. The terminal has been cleaned up.]
Terminal output:
${currentOutput}`;
      this._logService.debug(`RunInTerminalTool: Command completed in background terminal ${termId}, notifying chat session`);
      this._chatService.sendRequest(chatSessionResource, message, {
        ...sendOptions,
        queue: "steering" /* Steering */,
        isSystemInitiated: true,
        systemInitiatedLabel: localize(20565, null, commandDisplay),
        terminalExecutionId: termId
      }).catch((e4) => {
        this._logService.warn(`RunInTerminalTool: Failed to send completion notification for terminal ${termId}`, e4);
      });
      this._commandArtifactCollector.capture(toolSpecificData, terminalInstance, command4.id).then(() => {
        if (this._terminalService.foregroundInstances.includes(terminalInstance)) {
          this._logService.debug(`RunInTerminalTool: Background terminal ${termId} was revealed by user, skipping disposal`);
          return;
        }
        this._logService.debug(`RunInTerminalTool: Disposing finished background terminal ${termId}`);
        RunInTerminalTool._killedByTool.add(termId);
        execution.dispose();
        this._deleteActiveExecution(termId);
        terminalInstance.dispose();
      });
    }));
    const executionForDisposal = RunInTerminalTool._activeExecutions.get(termId);
    store.add(terminalInstance.onDisposed(() => {
      if (RunInTerminalTool._killedByTool.has(termId)) {
        disposeNotification();
        return;
      }
      if (this._isShuttingDown) {
        disposeNotification();
        return;
      }
      if (terminalInstance.exitReason === 3 /* User */) {
        this._logService.debug(`RunInTerminalTool: Background terminal ${termId} closed by user, suppressing steering message`);
        disposeNotification();
        return;
      }
      if (handleSessionCancelled()) {
        return;
      }
      const currentOutput = executionForDisposal?.getOutput() ?? "";
      const exitCode = terminalInstance.exitCode;
      const exitCodeText = exitCode !== void 0 && exitCode !== 0 ? ` with exit code ${exitCode}` : "";
      disposeNotification();
      const message = `[Terminal ${termId} notification: terminal exited${exitCodeText}. The terminal process ended before the command could complete normally; further commands cannot be sent to this terminal ID.]
Terminal output:
${currentOutput}`;
      this._logService.debug(`RunInTerminalTool: Background terminal ${termId} disposed${exitCodeText}, notifying chat session`);
      this._chatService.sendRequest(chatSessionResource, message, {
        ...sendOptions,
        queue: "steering" /* Steering */,
        isSystemInitiated: true,
        systemInitiatedLabel: localize(20566, null, commandDisplay),
        terminalExecutionId: termId
      }).catch((e4) => {
        this._logService.warn(`RunInTerminalTool: Failed to send terminal-exited notification for terminal ${termId}`, e4);
      });
    }));
    store.add(sessionRef.object.onDidChange((e4) => {
      if (e4.kind === "removeRequest") {
        this._logService.debug(`RunInTerminalTool: Request removed from session, cleaning up background terminal ${termId}`);
        RunInTerminalTool._activeExecutions.get(termId)?.dispose();
        this._deleteActiveExecution(termId);
        disposeNotification();
        terminalInstance.dispose();
      }
    }));
    this._backgroundNotifications.set(notificationKey, store);
  }
  /**
   * Find and dismiss any pending (not yet answered) question carousels that
   * are associated with the given terminal. This is called when the user
   * types directly into the terminal, bypassing the carousel UI.
   */
  _dismissPendingCarouselsForTerminal(chatSessionResource, termId) {
    const model = this._chatService.getSession(chatSessionResource);
    if (!model) {
      return;
    }
    const requests = model.getRequests();
    for (let i2 = requests.length - 1; i2 >= 0; i2--) {
      const response = requests[i2].response;
      if (!response) {
        continue;
      }
      const parts = response.response.value;
      for (let j = parts.length - 1; j >= 0; j--) {
        const part = parts[j];
        if (part instanceof ChatQuestionCarouselData && part.terminalId === termId && !part.isUsed) {
          this._logService.debug(`RunInTerminalTool: Dismissing pending carousel for terminal ${termId} because user typed directly in terminal`);
          part.data = {};
          part.isUsed = true;
          part.dismissedByTerminalInput = true;
          part.completion.complete({ answers: void 0 });
          return;
        }
      }
    }
  }
  // #endregion
};

RunInTerminalTool = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IHistoryService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, ILanguageModelToolsService),
  __decorateParam(7, IRemoteAgentService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, ITerminalChatService),
  __decorateParam(10, ITerminalLogService),
  __decorateParam(11, ITerminalService),
  __decorateParam(12, ITerminalSandboxService),
  __decorateParam(13, IWorkspaceContextService),
  __decorateParam(14, IChatWidgetService),
  __decorateParam(15, IAgentSessionsService),
  __decorateParam(16, IChatSessionsService),
  __decorateParam(17, ILifecycleService)
], RunInTerminalTool);

var ActiveTerminalExecution = class extends Disposable {
  constructor(sessionResource, termId, toolTerminal, commandDetection, isBackground, _instantiationService) {
    super();
    this.sessionResource = sessionResource;
    this.termId = termId;
    this._instantiationService = _instantiationService;
    this._toolTerminal = toolTerminal;
    this._isBackground = isBackground;
    this._completionDeferred = new DeferredPromise();
    this.strategy = this._register(this._createStrategy(commandDetection));
    this._register(this.strategy.onDidCreateStartMarker((marker) => {
      if (marker) {
        this._startMarker = marker;
      }
    }));
  }
  /**
   * The promise that resolves when the execute strategy completes. Can be awaited to get the
   * full result with exit code.
   */
  get completionPromise() {
    return this._completionDeferred.p;
  }
  get isBackground() {
    return this._isBackground;
  }
  get startMarker() {
    return this._startMarker;
  }
  get instance() {
    return this._toolTerminal.instance;
  }
  _createStrategy(commandDetection) {
    const isSyncMode = !this._isBackground;
    switch (this._toolTerminal.shellIntegrationQuality) {
      case "none" /* None */:
        return this._instantiationService.createInstance(NoneExecuteStrategy, this._toolTerminal.instance, () => this._toolTerminal.receivedUserInput ?? false);
      case "basic" /* Basic */:
        return this._instantiationService.createInstance(BasicExecuteStrategy, this._toolTerminal.instance, () => this._toolTerminal.receivedUserInput ?? false, commandDetection);
      case "rich" /* Rich */:
        return this._instantiationService.createInstance(RichExecuteStrategy, this._toolTerminal.instance, commandDetection, isSyncMode);
    }
  }
  /**
   * Starts the command execution using the execute strategy.
   * @param commandLine The command to execute
   * @param token Cancellation token
   * @param commandId Optional command ID for linking
   * @returns The execution result
   */
  async start(commandLine, token, commandId, commandLineForMetadata) {
    try {
      const result = await this.strategy.execute(commandLine, token, commandId, commandLineForMetadata);
      this._completionDeferred.complete(result);
      return result;
    } catch (e4) {
      this._completionDeferred.error(e4);
      throw e4;
    }
  }
  /**
   * Switches this execution to foreground mode, meaning callers will await its completion.
   */
  setForeground() {
    this._isBackground = false;
  }
  /**
   * Switches this execution to background mode.
   */
  setBackground() {
    this._isBackground = true;
  }
  /**
   * Gets the current output from the terminal.
   */
  getOutput(marker) {
    return getOutput(this.instance, marker ?? this._startMarker);
  }
};

ActiveTerminalExecution = __decorateClass([
  __decorateParam(5, IInstantiationService)
], ActiveTerminalExecution);

var RestoredTerminalExecution = class extends Disposable {
  constructor(instance2) {
    super();
    this.instance = instance2;
    this.completionPromise = Promise.resolve({ output: void 0, error: "restoredTerminalExecutionNotAwaitable" });
  }
  getOutput(marker) {
    return getOutput(this.instance, marker);
  }
};

var TerminalProfileFetcher = class {
  constructor(_configurationService, _terminalProfileResolverService, _remoteAgentService, _fileService, _logService) {
    this._configurationService = _configurationService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._remoteAgentService = _remoteAgentService;
    this._fileService = _fileService;
    this._logService = _logService;
    this.osBackend = this._remoteAgentService.getEnvironment().then((remoteEnv) => remoteEnv?.os ?? OS);
  }
  static {
    this._posixShellFallbacks = ["/bin/bash", "/usr/bin/bash", "/bin/sh"];
  }
  async getCopilotProfile() {
    const os = await this.osBackend;
    const customChatAgentProfile = this._getChatTerminalProfile(os);
    if (customChatAgentProfile) {
      return customChatAgentProfile;
    }
    const defaultProfile = await this._terminalProfileResolverService.getDefaultProfile({
      os,
      remoteAuthority: this._remoteAgentService.getConnection()?.remoteAuthority
    });
    if (basename(defaultProfile.path) === "cmd.exe") {
      return {
        ...defaultProfile,
        path: "C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
        profileName: "PowerShell"
      };
    }
    if (defaultProfile.path === "/bin/sh") {
      return {
        ...defaultProfile,
        path: "/bin/bash",
        profileName: "bash"
      };
    }
    if (os !== 1 /* Windows */) {
      const shellExists = await this._shellExists(defaultProfile.path);
      if (!shellExists) {
        const fallbackPath = await this._findFallbackShell();
        if (fallbackPath) {
          this._logService.warn(`TerminalProfileFetcher: resolved shell "${defaultProfile.path}" does not exist, falling back to "${fallbackPath}"`);
          return {
            ...defaultProfile,
            path: fallbackPath,
            profileName: basename(fallbackPath),
            icon: void 0
          };
        }
      }
    }
    return { ...defaultProfile, icon: void 0 };
  }
  async _shellExists(shellPath) {
    try {
      const remoteAuthority = this._remoteAgentService.getConnection()?.remoteAuthority;
      const resource = remoteAuthority ? URI.file(shellPath).with({ scheme: "vscode-remote", authority: remoteAuthority }) : URI.file(shellPath);
      return await this._fileService.exists(resource);
    } catch {
      return false;
    }
  }
  async _findFallbackShell() {
    for (const candidate of TerminalProfileFetcher._posixShellFallbacks) {
      if (await this._shellExists(candidate)) {
        return candidate;
      }
    }
    return void 0;
  }
  async getCopilotShell() {
    return (await this.getCopilotProfile()).path;
  }
  _getChatTerminalProfile(os) {
    let profileSetting;
    switch (os) {
      case 1 /* Windows */:
        profileSetting = "chat.tools.terminal.terminalProfile.windows" /* TerminalProfileWindows */;
        break;
      case 2 /* Macintosh */:
        profileSetting = "chat.tools.terminal.terminalProfile.osx" /* TerminalProfileMacOs */;
        break;
      case 3 /* Linux */:
      default:
        profileSetting = "chat.tools.terminal.terminalProfile.linux" /* TerminalProfileLinux */;
        break;
    }
    const profile = this._configurationService.getValue(profileSetting);
    if (this._isValidChatAgentTerminalProfile(profile)) {
      return profile;
    }
    return void 0;
  }
  _isValidChatAgentTerminalProfile(profile) {
    if (profile === null || profile === void 0 || typeof profile !== "object") {
      return false;
    }
    if ("path" in profile && isString(profile.path)) {
      return true;
    }
    return false;
  }
};

TerminalProfileFetcher = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ITerminalProfileResolverService),
  __decorateParam(2, IRemoteAgentService),
  __decorateParam(3, IFileService),
  __decorateParam(4, ITerminalLogService)
], TerminalProfileFetcher);
export { createPowerShellModelDescription, createSandboxLines, createSandboxProperties, createGenericDescription, createBashModelDescription, createZshModelDescription, createFishModelDescription, createRunInTerminalToolData, shouldAutomaticallyRetrySandbox, shouldAutomaticallyRetryUnsandboxed, shouldAutomaticallyRetryAllowNetworkInSandboxed, outputLooksBubblewrapHostRestricted, buildCompletionNotificationCommand, TERMINAL_SANDBOX_DOCUMENTATION_URL, TOOL_REFERENCE_NAME, LEGACY_TOOL_REFERENCE_FULL_NAMES, INPUT_NEEDED_NOTIFICATION_THROTTLE_MS, telemetryIgnoredSequences, altBufferMessage, RunInTerminalTool, ActiveTerminalExecution, RestoredTerminalExecution, TerminalProfileFetcher };
