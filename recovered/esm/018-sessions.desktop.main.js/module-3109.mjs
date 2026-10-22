// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/runInTerminalHelpers.ts
import { posix, win32 } from "./module-0026.mjs";
import { coalesce } from "./module-0007.mjs";
import { Separator } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { isAutoApproveRule } from "./module-3108.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/runInTerminalHelpers.ts
function isPowerShell(envShell, os) {
  if (os === 1 /* Windows */) {
    return /^(?:powershell|pwsh)(?:-preview)?$/i.test(win32.basename(envShell).replace(/\.exe$/i, ""));
  }
  return /^(?:powershell|pwsh)(?:-preview)?$/.test(posix.basename(envShell));
}

function isWindowsPowerShell(envShell) {
  return envShell.endsWith("System32\\WindowsPowerShell\\v1.0\\powershell.exe");
}

function isZsh(envShell, os) {
  if (os === 1 /* Windows */) {
    return /^zsh(?:\.exe)?$/i.test(win32.basename(envShell));
  }
  return /^zsh$/.test(posix.basename(envShell));
}

function isBash(envShell, os) {
  if (os === 1 /* Windows */) {
    return /^bash(?:\.exe)?$/i.test(win32.basename(envShell));
  }
  return /^bash$/.test(posix.basename(envShell));
}

function isFish(envShell, os) {
  if (os === 1 /* Windows */) {
    return /^fish(?:\.exe)?$/i.test(win32.basename(envShell));
  }
  return /^fish$/.test(posix.basename(envShell));
}

function normalizeTerminalCommandForDisplay(commandLine) {
  return commandLine.replace(/\\(["'\/])/g, "$1");
}

function buildCommandDisplayText(command4) {
  const normalized = normalizeTerminalCommandForDisplay(command4).replace(/\r\n|\r|\n/g, " ");
  return normalized.length > 80 ? normalized.substring(0, 77) + "..." : normalized;
}

function normalizeCommandForExecution(command4) {
  return command4.replace(/\r\n|\r|\n/g, " ").trim();
}

function isMultilineCommand(command4) {
  const normalized = command4.replace(/\r\n|\r/g, "\n");
  return /(?<!\\)\n/.test(normalized);
}

function generateAutoApproveActions(commandLine, subCommands, autoApproveResult, options3) {
  const actions = [];
  const canCreateAutoApproval = autoApproveResult.subCommandResults.every((e4) => e4.result !== "denied") && autoApproveResult.commandLineResult.result !== "denied";
  if (canCreateAutoApproval) {
    const unapprovedSubCommands = subCommands.filter((_, index2) => {
      return autoApproveResult.subCommandResults[index2].result !== "approved";
    });
    const neverAutoApproveCommands = /* @__PURE__ */ new Set([
      // Shell interpreters
      "bash",
      "sh",
      "zsh",
      "fish",
      "ksh",
      "csh",
      "tcsh",
      "dash",
      "pwsh",
      "powershell",
      "powershell.exe",
      "cmd",
      "cmd.exe",
      // Script interpreters
      "python",
      "python3",
      "node",
      "ruby",
      "perl",
      "php",
      "lua",
      // Direct execution commands
      "eval",
      "exec",
      "source",
      "sudo",
      "su",
      "doas",
      // Network tools that can download and execute code
      "curl",
      "wget",
      "invoke-restmethod",
      "invoke-webrequest",
      "irm",
      "iwr"
    ]);
    const commandsWithSubcommands = /* @__PURE__ */ new Set(["git", "npm", "npx", "yarn", "docker", "kubectl", "cargo", "dotnet", "mvn", "gradle"]);
    const commandsWithSubSubCommands = /* @__PURE__ */ new Set(["npm run", "yarn run"]);
    const findNextNonFlagArg = (parts, startIndex) => {
      for (let i2 = startIndex; i2 < parts.length; i2++) {
        if (!parts[i2].startsWith("-")) {
          return i2;
        }
      }
      return void 0;
    };
    const subCommandsToSuggest = Array.from(new Set(coalesce(unapprovedSubCommands.map((command4) => {
      const parts = command4.trim().split(/\s+/);
      const baseCommand = parts[0].toLowerCase();
      if (neverAutoApproveCommands.has(baseCommand)) {
        return void 0;
      }
      if (commandsWithSubcommands.has(baseCommand)) {
        const subCommandIndex = findNextNonFlagArg(parts, 1);
        if (subCommandIndex !== void 0) {
          const baseSubCommand = `${parts[0]} ${parts[subCommandIndex]}`.toLowerCase();
          if (commandsWithSubSubCommands.has(baseSubCommand)) {
            const subSubCommandIndex = findNextNonFlagArg(parts, subCommandIndex + 1);
            if (subSubCommandIndex !== void 0) {
              return parts.slice(0, subSubCommandIndex + 1).join(" ");
            }
            return void 0;
          } else {
            return parts.slice(0, subCommandIndex + 1).join(" ");
          }
        }
        return void 0;
      } else {
        return parts[0];
      }
    }))));
    if (subCommandsToSuggest.length > 0) {
      let subCommandLabel;
      if (subCommandsToSuggest.length === 1) {
        subCommandLabel = `\`${subCommandsToSuggest[0]} \u2026\``;
      } else {
        subCommandLabel = `Commands ${subCommandsToSuggest.map((e4) => `\`${e4} \u2026\``).join(", ")}`;
      }
      if (!options3?.skipSessionScoped) {
        actions.push({
          label: `Allow ${subCommandLabel} in this Session`,
          data: {
            type: "newRule",
            rule: subCommandsToSuggest.map((key3) => ({
              key: key3,
              value: true,
              scope: "session"
            }))
          }
        });
      }
      actions.push({
        label: `Allow ${subCommandLabel} in this Workspace`,
        data: {
          type: "newRule",
          rule: subCommandsToSuggest.map((key3) => ({
            key: key3,
            value: true,
            scope: "workspace"
          }))
        }
      });
      actions.push({
        label: `Always Allow ${subCommandLabel}`,
        data: {
          type: "newRule",
          rule: subCommandsToSuggest.map((key3) => ({
            key: key3,
            value: true,
            scope: "user"
          }))
        }
      });
    }
    if (actions.length > 0) {
      actions.push(new Separator());
    }
    const firstSubcommandFirstWord = unapprovedSubCommands.length > 0 ? unapprovedSubCommands[0].split(" ")[0] : "";
    if (firstSubcommandFirstWord !== commandLine && !commandsWithSubcommands.has(commandLine) && !commandsWithSubSubCommands.has(commandLine)) {
      if (!options3?.skipSessionScoped) {
        actions.push({
          label: localize(20454, null),
          data: {
            type: "newRule",
            rule: {
              key: `/^${escapeRegExpCharacters(commandLine)}$/`,
              value: {
                approve: true,
                matchCommandLine: true
              },
              scope: "session"
            }
          }
        });
      }
      actions.push({
        label: localize(20455, null),
        data: {
          type: "newRule",
          rule: {
            key: `/^${escapeRegExpCharacters(commandLine)}$/`,
            value: {
              approve: true,
              matchCommandLine: true
            },
            scope: "workspace"
          }
        }
      });
      actions.push({
        label: localize(20453, null),
        data: {
          type: "newRule",
          rule: {
            key: `/^${escapeRegExpCharacters(commandLine)}$/`,
            value: {
              approve: true,
              matchCommandLine: true
            },
            scope: "user"
          }
        }
      });
    }
  }
  if (actions.length > 0) {
    actions.push(new Separator());
  }
  if (!options3?.skipSessionScoped) {
    actions.push({
      label: localize(20450, null),
      tooltip: localize(20451, null),
      data: {
        type: "sessionApproval"
      }
    });
    actions.push(new Separator());
  }
  actions.push({
    label: localize(20452, null),
    data: {
      type: "configure"
    }
  });
  return actions;
}

function dedupeRules(rules) {
  return rules.filter((result, index2, array3) => {
    if (!isAutoApproveRule(result.rule)) {
      return false;
    }
    const sourceText = result.rule.sourceText;
    return array3.findIndex((r2) => isAutoApproveRule(r2.rule) && r2.rule.sourceText === sourceText) === index2;
  });
}

function extractCdPrefix(commandLine, shell, os) {
  const isPwsh = isPowerShell(shell, os);
  const cdPrefixMatch = commandLine.match(
    isPwsh ? /^(?:cd(?: \/d)?|Set-Location(?: -Path)?) (?<dir>[^\s]+) ?(?:&&|;)\s+(?<suffix>.+)$/i : /^cd (?<dir>[^\s]+) &&\s+(?<suffix>.+)$/
  );
  const cdDir = cdPrefixMatch?.groups?.dir;
  const cdSuffix = cdPrefixMatch?.groups?.suffix;
  if (cdDir && cdSuffix) {
    let cdDirPath = cdDir;
    if (cdDirPath.startsWith('"') && cdDirPath.endsWith('"')) {
      cdDirPath = cdDirPath.slice(1, -1);
    }
    return { directory: cdDirPath, command: cdSuffix };
  }
  return void 0;
}
export { isPowerShell, isWindowsPowerShell, isZsh, isBash, isFish, normalizeTerminalCommandForDisplay, buildCommandDisplayText, normalizeCommandForExecution, isMultilineCommand, generateAutoApproveActions, dedupeRules, extractCdPrefix };
