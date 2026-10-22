// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
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

function sanitizeCwd(cwd3) {
  if (cwd3.match(/^['"].*['"]$/)) {
    cwd3 = cwd3.substring(1, cwd3.length - 1);
  }
  if (OS === 1 /* Windows */ && cwd3 && cwd3[1] === ":") {
    return cwd3[0].toUpperCase() + cwd3.substring(1);
  }
  return cwd3;
}
export { escapeNonWindowsPath, sanitizeCwd };
