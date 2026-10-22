// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineRewriter/commandLineBackgroundDetachRewriter.ts
import { Disposable } from "./module-0012.mjs";
import { isBash, isFish, isPowerShell, isZsh } from "./module-3320.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineRewriter/commandLineBackgroundDetachRewriter.ts
var CommandLineBackgroundDetachRewriter = class extends Disposable {
  constructor(_configurationService) {
    super();
    this._configurationService = _configurationService;
  }
  rewrite(options3) {
    if (!this._configurationService.getValue("chat.tools.terminal.detachBackgroundProcesses" /* DetachBackgroundProcesses */)) {
      return void 0;
    }
    const trimmedForCheck = options3.commandLine.trimEnd();
    const endsWithBareBackgroundAmp = /(?:^|[^&])&$/.test(trimmedForCheck);
    if (!options3.isBackground && !endsWithBareBackgroundAmp) {
      return void 0;
    }
    if (this._readsFromStdin(options3.commandLine)) {
      return void 0;
    }
    if (options3.os === 1 /* Windows */) {
      if (!options3.isBackground) {
        return void 0;
      }
      return this._rewriteForPowerShell(options3);
    }
    return this._rewriteForPosix(options3);
  }
  /**
   * Returns true when the command line invokes a program that is known to
   * require an interactive stdin. Detaching such a command would close stdin
   * and either hang the program or make it exit with an error.
   *
   * The check is intentionally conservative — only well-known interactive
   * front-ends are matched, and only when their command-line flags do not
   * obviously force non-interactive behaviour.
   */
  _readsFromStdin(commandLine) {
    const trimmed = commandLine.replace(/^\s*(?:[A-Z_][A-Z0-9_]*=\S+\s+)+/, "").replace(/^\s*cd\s+\S+\s*(?:&&|;)\s*/i, "").trimStart();
    if (/^(expect|passwd|vi|vim|nano|less|more|top|htop|sftp|ftp|telnet|gdb|lldb)\b/.test(trimmed)) {
      return true;
    }
    if (/^psql\b/.test(trimmed) && !/\s(-c|-f|--command|--file)\b/.test(trimmed)) {
      return true;
    }
    if (/^mysql\b/.test(trimmed) && !/\s(-e|--execute)\b/.test(trimmed)) {
      return true;
    }
    if (/^ssh\b/.test(trimmed) && !/\s-T\b/.test(trimmed) && !/\sssh\s+\S+\s+\S/.test(" " + trimmed)) {
      return true;
    }
    if (/^sudo\b/.test(trimmed) && !/\s-n\b/.test(trimmed) && !/\bSUDO_ASKPASS\b/.test(commandLine)) {
      return true;
    }
    return false;
  }
  _rewriteForPosix(options3) {
    const trimmed = options3.commandLine.trimEnd();
    const endsWithBackgroundAmp = /(?:^|[^&])&$/.test(trimmed);
    let commandToWrap = trimmed;
    if (this._needsShellCWrapper(trimmed)) {
      const innerCommand = endsWithBackgroundAmp ? trimmed.replace(/\s*&$/, "") : trimmed;
      if (isFish(options3.shell, options3.os)) {
        const escaped = innerCommand.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        commandToWrap = `${options3.shell} -c "${escaped}"`;
      } else {
        const escaped = innerCommand.replace(/'/g, `'\\''`);
        commandToWrap = `${options3.shell} -c '${escaped}'`;
      }
    }
    const needsTrailingAmp = !/(?:^|[^&])&$/.test(commandToWrap);
    const supportsDisown = isBash(options3.shell, options3.os) || isZsh(options3.shell, options3.os);
    const disownSuffix = supportsDisown ? " disown" : "";
    const rewritten = needsTrailingAmp ? `nohup ${commandToWrap} &${disownSuffix}` : `nohup ${commandToWrap}${disownSuffix}`;
    return {
      rewritten,
      reasoning: "Wrapped background command with nohup to survive terminal shutdown",
      forDisplay: options3.commandLine
    };
  }
  /**
   * Returns true when the command uses shell constructs that `nohup` cannot exec
   * directly. Such commands must be wrapped in `<shell> -c '...'` before being
   * passed to nohup.
   *
   * `nohup` only accepts a single simple external command (plus its arguments).
   * Anything that requires shell parsing — compound statements, builtins, shell
   * operators, or inline variable assignments — must go through a shell wrapper.
   */
  _needsShellCWrapper(commandLine) {
    const trimmed = commandLine.trimStart();
    return (
      // Bash compound command keywords — syntax constructs that are not executables.
      /^(for|while|until|if|case|select|function)\b/.test(trimmed) || // Shell builtins — these only run meaningfully inside the current shell; nohup
      // cannot exec them (eval, set, export, source, unset, declare, cd, exec, etc.).
      /^(eval|set|export|source|unset|declare|typeset|local|readonly|alias|cd|exec)\b/.test(trimmed) || // `. file` (dot-source builtin). Exclude `./script` (relative path) by requiring
      // whitespace after the dot.
      /^\.\s/.test(trimmed) || // Compound groupings: subshell `( ... )` or brace group `{ ...; }`.
      /^[{(]/.test(trimmed) || // Inline environment variable assignments before a command (e.g. `VAR=val cmd`).
      // nohup would try to exec `VAR=val` as a program name.
      /^[A-Za-z_][A-Za-z0-9_]*=/.test(trimmed) || // Shell operators: pipes, command chains (&&, ||), semicolons, or background
      // operators (&) in the middle of the command. nohup only execs the first
      // simple command; the rest would be lost or misinterpreted.
      // A single trailing `&` is handled separately (not matched here) since it's
      // just a background operator that nohup can coexist with.
      /(?:\|\||&&|[|;]|&(?!&)(?!\s*$))/.test(trimmed)
    );
  }
  _rewriteForPowerShell(options3) {
    if (!isPowerShell(options3.shell, options3.os)) {
      return void 0;
    }
    const escapedCommand = options3.commandLine.replace(/"/g, '\\"');
    return {
      rewritten: `Start-Process -WindowStyle Hidden -FilePath "${options3.shell}" -ArgumentList "-NoProfile", "-Command", "${escapedCommand}"`,
      reasoning: "Wrapped background command with Start-Process to survive terminal shutdown",
      forDisplay: options3.commandLine
    };
  }
};

CommandLineBackgroundDetachRewriter = __decorateClass([
  __decorateParam(0, IConfigurationService)
], CommandLineBackgroundDetachRewriter);
export { CommandLineBackgroundDetachRewriter };
