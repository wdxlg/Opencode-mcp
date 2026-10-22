// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/terminal/node/terminalEnvironment.ts
import { isMacintosh, isWindows } from "./module-0013.mjs";
import { getWindowsBuildNumberAsync } from "./module-0197.mjs";
import { platform2 } from "./module-0014.mjs";
import { basename, join } from "./module-0018.mjs";
import { FileAccess } from "./module-0024.mjs";
import { format2 } from "./module-0021.mjs";
import { deserializeEnvironmentVariableCollections } from "./module-0195.mjs";
import { MergedEnvironmentVariableCollection } from "./module-0196.mjs";
import { isString } from "./module-0008.mjs";


// src/vs/platform/terminal/node/terminalEnvironment.ts
import * as os3 from "os";


// src/vs/platform/terminal/node/terminalEnvironment.ts
import { chmod, realpathSync as realpathSync2, mkdirSync } from "fs";

import { promisify as promisify2 } from "util";


// src/vs/platform/terminal/node/terminalEnvironment.ts
async function getShellIntegrationInjection(shellLaunchConfig, options, env2, logService, productService, skipStickyBit = false) {
  if (!options.shellIntegration.enabled) {
    return { type: "failure", reason: "injectionSettingDisabled" /* InjectionSettingDisabled */ };
  }
  if (!shellLaunchConfig.executable) {
    return { type: "failure", reason: "noExecutable" /* NoExecutable */ };
  }
  if (shellLaunchConfig.isFeatureTerminal && !shellLaunchConfig.forceShellIntegration) {
    return { type: "failure", reason: "featureTerminal" /* FeatureTerminal */ };
  }
  if (shellLaunchConfig.ignoreShellIntegration) {
    return { type: "failure", reason: "ignoreShellIntegrationFlag" /* IgnoreShellIntegrationFlag */ };
  }
  const windowsBuildNumber = isWindows ? await getWindowsBuildNumberAsync() : 0;
  if (isWindows && windowsBuildNumber < 18309) {
    return { type: "failure", reason: "unsupportedWindowsBuild" /* UnsupportedWindowsBuild */ };
  }
  const originalArgs = shellLaunchConfig.args;
  const shell = platform2 === "win32" ? basename(shellLaunchConfig.executable).toLowerCase() : basename(shellLaunchConfig.executable);
  const shellIntegrationScriptRoot = FileAccess.asFileUri("vs/workbench/contrib/terminal/common/scripts").fsPath;
  const type = "injection";
  let newArgs;
  const envMixin = {
    "VSCODE_INJECTION": "1"
  };
  if (options.shellIntegration.nonce) {
    envMixin["VSCODE_NONCE"] = options.shellIntegration.nonce;
  }
  const scopedDownShellEnvs = ["PATH", "VIRTUAL_ENV", "HOME", "SHELL", "PWD"];
  if (shellLaunchConfig.shellIntegrationEnvironmentReporting) {
    if (isWindows) {
      const enableWindowsEnvReporting = options.windowsUseConptyDll || windowsBuildNumber >= 22631 && shell !== "bash.exe";
      if (enableWindowsEnvReporting) {
        envMixin["VSCODE_SHELL_ENV_REPORTING"] = scopedDownShellEnvs.join(",");
      }
    } else {
      envMixin["VSCODE_SHELL_ENV_REPORTING"] = scopedDownShellEnvs.join(",");
    }
  }
  if (isWindows) {
    if (shell === "pwsh.exe" || shell === "powershell.exe") {
      envMixin["VSCODE_A11Y_MODE"] = options.isScreenReaderOptimized ? "1" : "0";
      if (!originalArgs || arePwshImpliedArgs(originalArgs)) {
        newArgs = shellIntegrationArgs.get("windows-pwsh" /* WindowsPwsh */);
      } else if (arePwshLoginArgs(originalArgs)) {
        newArgs = shellIntegrationArgs.get("windows-pwsh-login" /* WindowsPwshLogin */);
      }
      if (!newArgs) {
        return { type: "failure", reason: "unsupportedArgs" /* UnsupportedArgs */ };
      }
      newArgs = [...newArgs];
      newArgs[newArgs.length - 1] = format2(newArgs[newArgs.length - 1], shellIntegrationScriptRoot, "");
      envMixin["VSCODE_STABLE"] = productService.quality === "stable" ? "1" : "0";
      return { type, newArgs, envMixin };
    } else if (shell === "bash.exe") {
      if (!originalArgs || originalArgs.length === 0) {
        newArgs = shellIntegrationArgs.get("bash" /* Bash */);
      } else if (areZshBashFishLoginArgs(originalArgs)) {
        envMixin["VSCODE_SHELL_LOGIN"] = "1";
        addEnvMixinPathPrefix(options, envMixin, shell);
        newArgs = shellIntegrationArgs.get("bash" /* Bash */);
      }
      if (!newArgs) {
        return { type: "failure", reason: "unsupportedArgs" /* UnsupportedArgs */ };
      }
      newArgs = [...newArgs];
      newArgs[newArgs.length - 1] = format2(newArgs[newArgs.length - 1], shellIntegrationScriptRoot);
      envMixin["VSCODE_STABLE"] = productService.quality === "stable" ? "1" : "0";
      return { type, newArgs, envMixin };
    }
    logService.warn(`Shell integration cannot be enabled for executable "${shellLaunchConfig.executable}" and args`, shellLaunchConfig.args);
    return { type: "failure", reason: "unsupportedShell" /* UnsupportedShell */ };
  }
  switch (shell) {
    case "bash": {
      if (!originalArgs || originalArgs.length === 0) {
        newArgs = shellIntegrationArgs.get("bash" /* Bash */);
      } else if (areZshBashFishLoginArgs(originalArgs)) {
        envMixin["VSCODE_SHELL_LOGIN"] = "1";
        addEnvMixinPathPrefix(options, envMixin, shell);
        newArgs = shellIntegrationArgs.get("bash" /* Bash */);
      }
      if (!newArgs) {
        return { type: "failure", reason: "unsupportedArgs" /* UnsupportedArgs */ };
      }
      newArgs = [...newArgs];
      newArgs[newArgs.length - 1] = format2(newArgs[newArgs.length - 1], shellIntegrationScriptRoot);
      envMixin["VSCODE_STABLE"] = productService.quality === "stable" ? "1" : "0";
      return { type, newArgs, envMixin };
    }
    case "fish": {
      if (!originalArgs || originalArgs.length === 0) {
        newArgs = shellIntegrationArgs.get("fish" /* Fish */);
      } else if (areZshBashFishLoginArgs(originalArgs)) {
        newArgs = shellIntegrationArgs.get("fish-login" /* FishLogin */);
      } else if (originalArgs === shellIntegrationArgs.get("fish" /* Fish */) || originalArgs === shellIntegrationArgs.get("fish-login" /* FishLogin */)) {
        newArgs = originalArgs;
      }
      if (!newArgs) {
        return { type: "failure", reason: "unsupportedArgs" /* UnsupportedArgs */ };
      }
      addEnvMixinPathPrefix(options, envMixin, shell);
      newArgs = [...newArgs];
      newArgs[newArgs.length - 1] = format2(newArgs[newArgs.length - 1], shellIntegrationScriptRoot);
      return { type, newArgs, envMixin };
    }
    case "pwsh": {
      if (!originalArgs || arePwshImpliedArgs(originalArgs)) {
        newArgs = shellIntegrationArgs.get("pwsh" /* Pwsh */);
      } else if (arePwshLoginArgs(originalArgs)) {
        newArgs = shellIntegrationArgs.get("pwsh-login" /* PwshLogin */);
      }
      if (!newArgs) {
        return { type: "failure", reason: "unsupportedArgs" /* UnsupportedArgs */ };
      }
      newArgs = [...newArgs];
      newArgs[newArgs.length - 1] = format2(newArgs[newArgs.length - 1], shellIntegrationScriptRoot, "");
      envMixin["VSCODE_STABLE"] = productService.quality === "stable" ? "1" : "0";
      return { type, newArgs, envMixin };
    }
    case "zsh": {
      if (!originalArgs || originalArgs.length === 0) {
        newArgs = shellIntegrationArgs.get("zsh" /* Zsh */);
      } else if (areZshBashFishLoginArgs(originalArgs)) {
        newArgs = shellIntegrationArgs.get("zsh-login" /* ZshLogin */);
        addEnvMixinPathPrefix(options, envMixin, shell);
      } else if (originalArgs === shellIntegrationArgs.get("zsh" /* Zsh */) || originalArgs === shellIntegrationArgs.get("zsh-login" /* ZshLogin */)) {
        newArgs = originalArgs;
      }
      if (!newArgs) {
        return { type: "failure", reason: "unsupportedArgs" /* UnsupportedArgs */ };
      }
      newArgs = [...newArgs];
      newArgs[newArgs.length - 1] = format2(newArgs[newArgs.length - 1], shellIntegrationScriptRoot);
      let username;
      try {
        username = os3.userInfo().username;
      } catch {
        username = "unknown";
      }
      const realTmpDir = realpathSync2(os3.tmpdir());
      const zdotdir = join(realTmpDir, `${username}-${productService.applicationName}-zsh`);
      if (!skipStickyBit) {
        try {
          const chmodAsync = promisify2(chmod);
          await chmodAsync(zdotdir, 960);
        } catch (err) {
          if (!err.message.includes("ENOENT")) {
            logService.error(`Failed to set sticky bit on ${zdotdir}: ${err}`);
            return { type: "failure", reason: "failedToSetStickyBit" /* FailedToSetStickyBit */ };
          }
          try {
            mkdirSync(zdotdir, { recursive: true });
          } catch (err2) {
            logService.error(`Failed to create zdotdir at ${zdotdir}: ${err2}`);
            return { type: "failure", reason: "failedToCreateTmpDir" /* FailedToCreateTmpDir */ };
          }
          try {
            const chmodAsync = promisify2(chmod);
            await chmodAsync(zdotdir, 960);
          } catch (err2) {
            logService.error(`Failed to set sticky bit on ${zdotdir}: ${err2}`);
            return { type: "failure", reason: "failedToSetStickyBit" /* FailedToSetStickyBit */ };
          }
        }
      }
      envMixin["ZDOTDIR"] = zdotdir;
      const userZdotdir = env2?.ZDOTDIR ?? os3.homedir() ?? `~`;
      envMixin["USER_ZDOTDIR"] = userZdotdir;
      const filesToCopy = [];
      filesToCopy.push({
        source: join(shellIntegrationScriptRoot, "shellIntegration-rc.zsh"),
        dest: join(zdotdir, ".zshrc")
      });
      filesToCopy.push({
        source: join(shellIntegrationScriptRoot, "shellIntegration-profile.zsh"),
        dest: join(zdotdir, ".zprofile")
      });
      filesToCopy.push({
        source: join(shellIntegrationScriptRoot, "shellIntegration-env.zsh"),
        dest: join(zdotdir, ".zshenv")
      });
      filesToCopy.push({
        source: join(shellIntegrationScriptRoot, "shellIntegration-login.zsh"),
        dest: join(zdotdir, ".zlogin")
      });
      return { type, newArgs, envMixin, filesToCopy };
    }
  }
  logService.warn(`Shell integration cannot be enabled for executable "${shellLaunchConfig.executable}" and args`, shellLaunchConfig.args);
  return { type: "failure", reason: "unsupportedShell" /* UnsupportedShell */ };
}

function addEnvMixinPathPrefix(options, envMixin, shell) {
  if ((isMacintosh || shell === "fish") && options.environmentVariableCollections) {
    const deserialized = deserializeEnvironmentVariableCollections(options.environmentVariableCollections);
    const merged = new MergedEnvironmentVariableCollection(deserialized);
    const pathEntry = merged.getVariableMap({ workspaceFolder: options.workspaceFolder }).get("PATH");
    const prependToPath = [];
    if (pathEntry) {
      for (const mutator of pathEntry) {
        if (mutator.type === 3 /* Prepend */) {
          prependToPath.push(mutator.value);
        }
      }
    }
    if (prependToPath.length > 0) {
      envMixin["VSCODE_PATH_PREFIX"] = prependToPath.join("");
    }
  }
}

var shellIntegrationArgs = /* @__PURE__ */ new Map();

shellIntegrationArgs.set("windows-pwsh" /* WindowsPwsh */, ["-noexit", "-command", 'try { . "{0}\\shellIntegration.ps1" } catch {}{1}']);

shellIntegrationArgs.set("windows-pwsh-login" /* WindowsPwshLogin */, ["-l", "-noexit", "-command", 'try { . "{0}\\shellIntegration.ps1" } catch {}{1}']);

shellIntegrationArgs.set("pwsh" /* Pwsh */, ["-noexit", "-command", '. "{0}/shellIntegration.ps1"{1}']);

shellIntegrationArgs.set("pwsh-login" /* PwshLogin */, ["-l", "-noexit", "-command", '. "{0}/shellIntegration.ps1"']);

shellIntegrationArgs.set("zsh" /* Zsh */, ["-i"]);

shellIntegrationArgs.set("zsh-login" /* ZshLogin */, ["-il"]);

shellIntegrationArgs.set("bash" /* Bash */, ["--init-file", "{0}/shellIntegration-bash.sh"]);

shellIntegrationArgs.set("fish" /* Fish */, ["--init-command", 'source "{0}/shellIntegration.fish"']);

shellIntegrationArgs.set("fish-login" /* FishLogin */, ["-l", "--init-command", 'source "{0}/shellIntegration.fish"']);

var pwshLoginArgs = ["-login", "-l"];

var shLoginArgs = ["--login", "-l"];

var shInteractiveArgs = ["-i", "--interactive"];

var pwshImpliedArgs = ["-nol", "-nologo"];

function arePwshLoginArgs(originalArgs) {
  if (isString(originalArgs)) {
    return pwshLoginArgs.includes(originalArgs.toLowerCase());
  } else {
    return originalArgs.length === 1 && pwshLoginArgs.includes(originalArgs[0].toLowerCase()) || originalArgs.length === 2 && (pwshLoginArgs.includes(originalArgs[0].toLowerCase()) || pwshLoginArgs.includes(originalArgs[1].toLowerCase())) && (pwshImpliedArgs.includes(originalArgs[0].toLowerCase()) || pwshImpliedArgs.includes(originalArgs[1].toLowerCase()));
  }
}

function arePwshImpliedArgs(originalArgs) {
  if (isString(originalArgs)) {
    return pwshImpliedArgs.includes(originalArgs.toLowerCase());
  } else {
    return originalArgs.length === 0 || originalArgs?.length === 1 && pwshImpliedArgs.includes(originalArgs[0].toLowerCase());
  }
}

function areZshBashFishLoginArgs(originalArgs) {
  if (!isString(originalArgs)) {
    originalArgs = originalArgs.filter((arg) => !shInteractiveArgs.includes(arg.toLowerCase()));
  }
  return isString(originalArgs) && shLoginArgs.includes(originalArgs.toLowerCase()) || !isString(originalArgs) && originalArgs.length === 1 && shLoginArgs.includes(originalArgs[0].toLowerCase());
}
export { getShellIntegrationInjection, addEnvMixinPathPrefix, arePwshLoginArgs, arePwshImpliedArgs, areZshBashFishLoginArgs, os3, chmod, realpathSync2, mkdirSync, promisify2, shellIntegrationArgs, pwshLoginArgs, shLoginArgs, shInteractiveArgs, pwshImpliedArgs };
