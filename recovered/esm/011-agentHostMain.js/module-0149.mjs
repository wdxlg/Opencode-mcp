// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/node/shell.ts
import { isLinux, isMacintosh, isWindows } from "./module-0013.mjs";
import { getWindowsShell } from "./module-0036.mjs";
import { getFirstAvailablePowerShellInstallation } from "./module-0150.mjs";


// src/vs/base/node/shell.ts
import { userInfo } from "os";


// src/vs/base/node/shell.ts
async function getSystemShell(os10, env2) {
  if (os10 === 1 /* Windows */) {
    if (isWindows) {
      return getSystemShellWindows();
    }
    return getWindowsShell(env2);
  }
  return getSystemShellUnixLike(os10, env2);
}

var _TERMINAL_DEFAULT_SHELL_UNIX_LIKE = null;

function getSystemShellUnixLike(os10, env2) {
  if (isLinux && os10 === 2 /* Macintosh */ || isMacintosh && os10 === 3 /* Linux */) {
    return "/bin/bash";
  }
  if (!_TERMINAL_DEFAULT_SHELL_UNIX_LIKE) {
    let unixLikeTerminal;
    if (isWindows) {
      unixLikeTerminal = "/bin/bash";
    } else {
      unixLikeTerminal = env2["SHELL"];
      if (!unixLikeTerminal) {
        try {
          unixLikeTerminal = userInfo().shell;
        } catch (err) {
        }
      }
      if (!unixLikeTerminal) {
        unixLikeTerminal = "sh";
      }
      if (unixLikeTerminal === "/bin/false") {
        unixLikeTerminal = "/bin/bash";
      }
    }
    _TERMINAL_DEFAULT_SHELL_UNIX_LIKE = unixLikeTerminal;
  }
  return _TERMINAL_DEFAULT_SHELL_UNIX_LIKE;
}

var _TERMINAL_DEFAULT_SHELL_WINDOWS = null;

async function getSystemShellWindows() {
  if (!_TERMINAL_DEFAULT_SHELL_WINDOWS) {
    _TERMINAL_DEFAULT_SHELL_WINDOWS = (await getFirstAvailablePowerShellInstallation()).exePath;
  }
  return _TERMINAL_DEFAULT_SHELL_WINDOWS;
}
export { getSystemShell, getSystemShellUnixLike, getSystemShellWindows, userInfo, _TERMINAL_DEFAULT_SHELL_UNIX_LIKE, _TERMINAL_DEFAULT_SHELL_WINDOWS };
