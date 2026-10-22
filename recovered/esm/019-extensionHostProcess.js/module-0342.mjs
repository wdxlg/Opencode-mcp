// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/debug/node/terminals.ts
import { isWindows } from "./module-0014.mjs";
import { getDriveLetter } from "./module-0024.mjs";


// src/vs/workbench/contrib/debug/node/terminals.ts
import * as cp4 from "child_process";

function spawnAsPromised(command, args2) {
  return new Promise((resolve2, reject) => {
    let stdout = "";
    const child = cp4.spawn(command, args2);
    if (child.pid) {
      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });
    }
    child.on("error", (err) => {
      reject(err);
    });
    child.on("close", (code) => {
      resolve2(stdout);
    });
  });
}

async function hasChildProcesses(processId) {
  if (processId) {
    if (isWindows) {
      const windowsProcessTree = await import("@vscode/windows-process-tree");
      return new Promise((resolve2) => {
        windowsProcessTree.getProcessTree(processId, (processTree) => {
          resolve2(!!processTree && processTree.children.length > 0);
        });
      });
    } else {
      return spawnAsPromised("/usr/bin/pgrep", ["-lP", String(processId)]).then((stdout) => {
        const r2 = stdout.trim();
        if (r2.length === 0 || r2.indexOf(" tmux") >= 0) {
          return false;
        } else {
          return true;
        }
      }, (error) => {
        return true;
      });
    }
  }
  return Promise.resolve(true);
}

function prepareCommand(shell, args2, argsCanBeInterpretedByShell, cwd2, env2) {
  shell = shell.trim().toLowerCase();
  let shellType;
  if (shell.indexOf("powershell") >= 0 || shell.indexOf("pwsh") >= 0) {
    shellType = 1 /* powershell */;
  } else if (shell.indexOf("cmd.exe") >= 0) {
    shellType = 0 /* cmd */;
  } else if (shell.indexOf("bash") >= 0) {
    shellType = 2 /* bash */;
  } else if (isWindows) {
    shellType = 0 /* cmd */;
  } else {
    shellType = 2 /* bash */;
  }
  let quote2;
  let command = " ";
  switch (shellType) {
    case 1 /* powershell */:
      quote2 = (s) => {
        s = s.replace(/\'/g, "''");
        if (s.length > 0 && s.charAt(s.length - 1) === "\\") {
          return `'${s}\\'`;
        }
        return `'${s}'`;
      };
      if (cwd2) {
        const driveLetter = getDriveLetter(cwd2);
        if (driveLetter) {
          command += `${driveLetter}:; `;
        }
        command += `cd ${quote2(cwd2)}; `;
      }
      if (env2) {
        for (const key in env2) {
          const value = env2[key];
          if (value === null) {
            command += `Remove-Item env:${key}; `;
          } else {
            command += `\${env:${key}}='${value.replace(/['\u2018\u2019]/g, (quote3) => quote3 + quote3)}'; `;
          }
        }
      }
      if (args2.length > 0) {
        const arg = args2.shift();
        const cmd = argsCanBeInterpretedByShell ? arg : quote2(arg);
        command += cmd[0] === "'" ? `& ${cmd} ` : `${cmd} `;
        for (const a of args2) {
          command += a === "<" || a === ">" || argsCanBeInterpretedByShell ? a : quote2(a);
          command += " ";
        }
      }
      break;
    case 0 /* cmd */:
      quote2 = (s) => {
        s = s.replace(/\"/g, '""');
        s = s.replace(/([><!^&|])/g, "^$1");
        return ' "'.split("").some((char) => s.includes(char)) || s.length === 0 ? `"${s}"` : s;
      };
      if (cwd2) {
        const driveLetter = getDriveLetter(cwd2);
        if (driveLetter) {
          command += `${driveLetter}: && `;
        }
        command += `cd ${quote2(cwd2)} && `;
      }
      if (env2) {
        command += 'cmd /C "';
        for (const key in env2) {
          let value = env2[key];
          if (value === null) {
            command += `set "${key}=" && `;
          } else {
            value = value.replace(/[&^|<>]/g, (s) => `^${s}`);
            command += `set "${key}=${value}" && `;
          }
        }
      }
      for (const a of args2) {
        command += a === "<" || a === ">" || argsCanBeInterpretedByShell ? a : quote2(a);
        command += " ";
      }
      if (env2) {
        command += '"';
      }
      break;
    case 2 /* bash */: {
      quote2 = (s) => {
        s = s.replace(/(["'\\\$!><#()\[\]*&^| ;{}?`])/g, "\\$1");
        return s.length === 0 ? `""` : s;
      };
      const hardQuote = (s) => {
        return /[^\w@%\/+=,.:^-]/.test(s) ? `'${s.replace(/'/g, "'\\''")}'` : s;
      };
      if (cwd2) {
        command += `cd ${quote2(cwd2)} ; `;
      }
      if (env2) {
        command += "/usr/bin/env";
        for (const key in env2) {
          const value = env2[key];
          if (value === null) {
            command += ` -u ${hardQuote(key)}`;
          } else {
            command += ` ${hardQuote(`${key}=${value}`)}`;
          }
        }
        command += " ";
      }
      for (const a of args2) {
        command += a === "<" || a === ">" || argsCanBeInterpretedByShell ? a : quote2(a);
        command += " ";
      }
      break;
    }
  }
  return command;
}
export { spawnAsPromised, hasChildProcesses, prepareCommand, cp4 };
