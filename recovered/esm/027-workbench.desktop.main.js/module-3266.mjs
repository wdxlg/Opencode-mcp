// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/common/terminalEnvironment.ts
import { isMacintosh, isWindows, language } from "./module-0014.mjs";
import { isNumber, isString } from "./module-0010.mjs";
import { escapeNonWindowsPath, sanitizeCwd } from "./module-3060.mjs";
import { basename, isAbsolute, join } from "./module-0026.mjs";
import { sanitizeProcessEnvironment } from "./module-3265.mjs";
import { URI, uriToFsPath } from "./module-0032.mjs";


// src/vs/workbench/contrib/terminal/common/terminalEnvironment.ts
function mergeEnvironments(parent, other) {
  if (!other) {
    return;
  }
  if (isWindows) {
    for (const configKey in other) {
      let actualKey = configKey;
      for (const envKey in parent) {
        if (configKey.toLowerCase() === envKey.toLowerCase()) {
          actualKey = envKey;
          break;
        }
      }
      const value2 = other[configKey];
      if (value2 !== void 0) {
        _mergeEnvironmentValue(parent, actualKey, value2);
      }
    }
  } else {
    Object.keys(other).forEach((key3) => {
      const value2 = other[key3];
      if (value2 !== void 0) {
        _mergeEnvironmentValue(parent, key3, value2);
      }
    });
  }
}

function _mergeEnvironmentValue(env2, key3, value2) {
  if (isString(value2)) {
    env2[key3] = value2;
  } else {
    delete env2[key3];
  }
}

function addTerminalEnvironmentKeys(env2, version2, locale2, detectLocale) {
  env2["TERM_PROGRAM"] = "vscode";
  if (version2) {
    env2["TERM_PROGRAM_VERSION"] = version2;
  }
  if (shouldSetLangEnvVariable(env2, detectLocale)) {
    env2["LANG"] = getLangEnvVariable(locale2);
  }
  env2["COLORTERM"] = "truecolor";
}

function mergeNonNullKeys(env2, other) {
  if (!other) {
    return;
  }
  for (const key3 of Object.keys(other)) {
    const value2 = other[key3];
    if (value2 !== void 0 && value2 !== null) {
      env2[key3] = value2;
    }
  }
}

async function resolveConfigurationVariables(variableResolver, env2) {
  await Promise.all(Object.entries(env2).map(async ([key3, value2]) => {
    if (isString(value2)) {
      try {
        env2[key3] = await variableResolver(value2);
      } catch (e) {
        env2[key3] = value2;
      }
    }
  }));
  return env2;
}

function shouldSetLangEnvVariable(env2, detectLocale) {
  if (detectLocale === "on") {
    return true;
  }
  if (detectLocale === "auto") {
    const lang = env2["LANG"];
    return !lang || lang.search(/\.UTF\-8$/) === -1 && lang.search(/\.utf8$/) === -1 && lang.search(/\.euc.+/) === -1;
  }
  return false;
}

function getLangEnvVariable(locale2) {
  const parts = locale2 ? locale2.split("-") : [];
  const n2 = parts.length;
  if (n2 === 0) {
    return "en_US.UTF-8";
  }
  if (n2 === 1) {
    const languageVariants = {
      af: "ZA",
      am: "ET",
      be: "BY",
      bg: "BG",
      ca: "ES",
      cs: "CZ",
      da: "DK",
      // de: 'AT',
      // de: 'CH',
      de: "DE",
      el: "GR",
      // en: 'AU',
      // en: 'CA',
      // en: 'GB',
      // en: 'IE',
      // en: 'NZ',
      en: "US",
      es: "ES",
      et: "EE",
      eu: "ES",
      fi: "FI",
      // fr: 'BE',
      // fr: 'CA',
      // fr: 'CH',
      fr: "FR",
      he: "IL",
      hr: "HR",
      hu: "HU",
      hy: "AM",
      is: "IS",
      // it: 'CH',
      it: "IT",
      ja: "JP",
      kk: "KZ",
      ko: "KR",
      lt: "LT",
      // nl: 'BE',
      nl: "NL",
      no: "NO",
      pl: "PL",
      pt: "BR",
      // pt: 'PT',
      ro: "RO",
      ru: "RU",
      sk: "SK",
      sl: "SI",
      sr: "YU",
      sv: "SE",
      tr: "TR",
      uk: "UA",
      zh: "CN"
    };
    if (Object.prototype.hasOwnProperty.call(languageVariants, parts[0])) {
      parts.push(languageVariants[parts[0]]);
    }
  } else {
    parts[1] = parts[1].toUpperCase();
  }
  return parts.join("_") + ".UTF-8";
}

async function getCwd(shell, userHome, variableResolver, root, customCwd, logService) {
  if (shell.cwd) {
    const unresolved = typeof shell.cwd === "object" ? shell.cwd.fsPath : shell.cwd;
    const resolved = await _resolveCwd(unresolved, variableResolver);
    return sanitizeCwd(resolved || unresolved);
  }
  let cwd2;
  if (!shell.ignoreConfigurationCwd && customCwd) {
    if (variableResolver) {
      customCwd = await _resolveCwd(customCwd, variableResolver, logService);
    }
    if (customCwd) {
      if (isAbsolute(customCwd)) {
        cwd2 = customCwd;
      } else if (root) {
        cwd2 = join(root.fsPath, customCwd);
      }
    }
  }
  if (!cwd2) {
    cwd2 = root ? root.fsPath : userHome || "";
  }
  return sanitizeCwd(cwd2);
}

async function _resolveCwd(cwd2, variableResolver, logService) {
  if (variableResolver) {
    try {
      return await variableResolver(cwd2);
    } catch (e) {
      logService?.error("Could not resolve terminal cwd", e);
      return void 0;
    }
  }
  return cwd2;
}

function createVariableResolver(lastActiveWorkspace, env2, configurationResolverService) {
  if (!configurationResolverService) {
    return void 0;
  }
  return (str) => configurationResolverService.resolveWithEnvironment(env2, lastActiveWorkspace, str);
}

async function createTerminalEnvironment(shellLaunchConfig, envFromConfig, variableResolver, version2, detectLocale, baseEnv) {
  const env2 = {};
  if (shellLaunchConfig.strictEnv) {
    mergeNonNullKeys(env2, shellLaunchConfig.env);
  } else {
    mergeNonNullKeys(env2, baseEnv);
    const allowedEnvFromConfig = { ...envFromConfig };
    if (variableResolver) {
      if (allowedEnvFromConfig) {
        await resolveConfigurationVariables(variableResolver, allowedEnvFromConfig);
      }
      if (shellLaunchConfig.env) {
        await resolveConfigurationVariables(variableResolver, shellLaunchConfig.env);
      }
    }
    if (isMacintosh) {
      if (env2["VSCODE_NODE_OPTIONS"]) {
        env2["NODE_OPTIONS"] = env2["VSCODE_NODE_OPTIONS"];
        delete env2["VSCODE_NODE_OPTIONS"];
      }
      if (env2["VSCODE_NODE_REPL_EXTERNAL_MODULE"]) {
        env2["NODE_REPL_EXTERNAL_MODULE"] = env2["VSCODE_NODE_REPL_EXTERNAL_MODULE"];
        delete env2["VSCODE_NODE_REPL_EXTERNAL_MODULE"];
      }
    }
    sanitizeProcessEnvironment(env2, "VSCODE_IPC_HOOK_CLI");
    mergeEnvironments(env2, allowedEnvFromConfig);
    mergeEnvironments(env2, shellLaunchConfig.env);
    addTerminalEnvironmentKeys(env2, version2, language, detectLocale);
  }
  return env2;
}

async function preparePathForShell(resource, executable, title, shellType, backend, os, isWindowsFrontend = isWindows) {
  let originalPath;
  if (isString(resource)) {
    originalPath = resource;
  } else {
    originalPath = resource.fsPath;
    if (isWindowsFrontend && os !== 1 /* Windows */) {
      originalPath = originalPath.replace(/\\/g, "/");
    } else if (!isWindowsFrontend && os === 1 /* Windows */) {
      originalPath = originalPath.replace(/\//g, "\\");
    }
  }
  if (!executable) {
    return originalPath;
  }
  const hasSpace = originalPath.includes(" ");
  const hasParens = originalPath.includes("(") || originalPath.includes(")");
  const pathBasename = basename(executable, ".exe");
  const isPowerShell2 = pathBasename === "pwsh" || title === "pwsh" || pathBasename === "powershell" || title === "powershell";
  if (isPowerShell2 && (hasSpace || originalPath.includes("'"))) {
    return `& '${originalPath.replace(/'/g, "''")}'`;
  }
  if (hasParens && isPowerShell2) {
    return `& '${originalPath}'`;
  }
  if (os === 1 /* Windows */) {
    if (shellType !== void 0) {
      if (shellType === "gitbash" /* GitBash */) {
        return escapeNonWindowsPath(originalPath.replace(/\\/g, "/"), shellType);
      } else if (shellType === "wsl" /* Wsl */) {
        return backend?.getWslPath(originalPath, "win-to-unix") || originalPath;
      } else if (hasSpace) {
        return `"${originalPath}"`;
      }
      return originalPath;
    }
    const lowerExecutable = executable.toLowerCase();
    if (lowerExecutable.includes("wsl") || lowerExecutable.includes("bash.exe") && !lowerExecutable.toLowerCase().includes("git")) {
      return backend?.getWslPath(originalPath, "win-to-unix") || originalPath;
    } else if (hasSpace) {
      return `"${originalPath}"`;
    }
    return originalPath;
  }
  return escapeNonWindowsPath(originalPath, shellType);
}

function getWorkspaceForTerminal(cwd2, workspaceContextService, historyService) {
  const cwdUri = isString(cwd2) ? URI.parse(cwd2) : cwd2;
  let workspaceFolder = cwdUri ? workspaceContextService.getWorkspaceFolder(cwdUri) ?? void 0 : void 0;
  if (!workspaceFolder) {
    const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot();
    workspaceFolder = activeWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
  }
  return workspaceFolder;
}

async function getUriLabelForShell(uri5, backend, shellType, os, isWindowsFrontend = isWindows) {
  let path = isString(uri5) ? uri5 : uri5.fsPath;
  if (os === 1 /* Windows */) {
    if (shellType === "wsl" /* Wsl */) {
      return backend.getWslPath(path.replaceAll("/", "\\"), "win-to-unix");
    } else if (shellType === "gitbash" /* GitBash */) {
      return path.replaceAll("\\", "/").replace(/^([a-zA-Z]):\//, "/$1/");
    } else {
      path = isString(uri5) ? path : uriToFsPath(uri5, true);
      return !isWindowsFrontend ? path.replaceAll("/", "\\") : path;
    }
  } else {
    return isWindowsFrontend ? path.replaceAll("\\", "/") : path;
  }
}

function getShellIntegrationTimeout(configurationService, siInjectionEnabled, isRemote, processReadyTimestamp) {
  const timeoutValue = configurationService.getValue("terminal.integrated.shellIntegration.timeout" /* ShellIntegrationTimeout */);
  let timeoutMs;
  if (isNumber(timeoutValue) && timeoutValue === -2 /* DisableForTests */) {
    timeoutMs = 0;
  } else if (!isNumber(timeoutValue) || timeoutValue < 0) {
    timeoutMs = siInjectionEnabled ? 5e3 : isRemote ? 3e3 : 2e3;
  } else if (timeoutValue === 0) {
    timeoutMs = 0;
  } else {
    timeoutMs = Math.max(timeoutValue, 500);
  }
  if (processReadyTimestamp !== void 0) {
    const elapsed = Date.now() - processReadyTimestamp;
    timeoutMs = Math.max(0, timeoutMs - elapsed);
  }
  return timeoutMs;
}
export { mergeEnvironments, _mergeEnvironmentValue, addTerminalEnvironmentKeys, mergeNonNullKeys, resolveConfigurationVariables, shouldSetLangEnvVariable, getLangEnvVariable, getCwd, _resolveCwd, createVariableResolver, createTerminalEnvironment, preparePathForShell, getWorkspaceForTerminal, getUriLabelForShell, getShellIntegrationTimeout };
