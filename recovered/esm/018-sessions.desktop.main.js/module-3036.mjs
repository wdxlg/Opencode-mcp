// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/terminal/common/terminalEnvironment.ts
import { OS } from "./module-0014.mjs";


// src/vs/platform/terminal/common/terminalEnvironment.ts
function escapeNonWindowsPath(path, shellType) {
  let newPath = path;
  if (newPath.includes("\\")) {
    newPath = newPath.replace(/\\/g, "\\\\");
  }
  let escapeConfig;
  switch (shellType) {
    case "bash" /* Bash */:
    case "sh" /* Sh */:
    case "zsh" /* Zsh */:
    case "gitbash" /* GitBash */:
      escapeConfig = {
        bothQuotes: (path2) => `$'${path2.replace(/'/g, "\\'")}'`,
        singleQuotes: (path2) => `'${path2.replace(/'/g, "\\'")}'`,
        noSingleQuotes: (path2) => `'${path2}'`
      };
      break;
    case "fish" /* Fish */:
      escapeConfig = {
        bothQuotes: (path2) => `"${path2.replace(/"/g, '\\"')}"`,
        singleQuotes: (path2) => `'${path2.replace(/'/g, "\\'")}'`,
        noSingleQuotes: (path2) => `'${path2}'`
      };
      break;
    case "pwsh" /* PowerShell */:
      escapeConfig = {
        bothQuotes: (path2) => `"${path2.replace(/"/g, '`"')}"`,
        singleQuotes: (path2) => `'${path2.replace(/'/g, "''")}'`,
        noSingleQuotes: (path2) => `'${path2}'`
      };
      break;
    default:
      escapeConfig = {
        bothQuotes: (path2) => `$'${path2.replace(/'/g, "\\'")}'`,
        singleQuotes: (path2) => `'${path2.replace(/'/g, "\\'")}'`,
        noSingleQuotes: (path2) => `'${path2}'`
      };
      break;
  }
  const bannedChars = /[\`\$\|\&\>\~\#\!\^\*\;\<]/g;
  newPath = newPath.replace(bannedChars, "");
  if (newPath.includes("'") && newPath.includes('"')) {
    return escapeConfig.bothQuotes(newPath);
  } else if (newPath.includes("'")) {
    return escapeConfig.singleQuotes(newPath);
  } else {
    return escapeConfig.noSingleQuotes(newPath);
  }
}

function collapseTildePath(path, userHome, separator2) {
  if (!path) {
    return "";
  }
  if (!userHome) {
    return path;
  }
  if (userHome.match(/[\/\\]$/)) {
    userHome = userHome.slice(0, userHome.length - 1);
  }
  const normalizedPath = path.replace(/\\/g, "/").toLowerCase();
  const normalizedUserHome = userHome.replace(/\\/g, "/").toLowerCase();
  if (!normalizedPath.includes(normalizedUserHome)) {
    return path;
  }
  return `~${separator2}${path.slice(userHome.length + 1)}`;
}

function sanitizeCwd(cwd2) {
  if (cwd2.match(/^['"].*['"]$/)) {
    cwd2 = cwd2.substring(1, cwd2.length - 1);
  }
  if (OS === 1 /* Windows */ && cwd2 && cwd2[1] === ":") {
    return cwd2[0].toUpperCase() + cwd2.substring(1);
  }
  return cwd2;
}

function shouldUseEnvironmentVariableCollection(slc) {
  return !slc.strictEnv;
}
export { escapeNonWindowsPath, collapseTildePath, sanitizeCwd, shouldUseEnvironmentVariableCollection };
