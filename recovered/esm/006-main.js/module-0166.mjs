// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/node/shell.ts
import { init_platform, isLinux, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { getWindowsShell, init_processes2 } from "./module-0165.mjs";
import { getFirstAvailablePowerShellInstallation, init_powershell } from "./module-0164.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/base/node/shell.ts
import { userInfo } from "os";

async function getSystemShell(os6, env2) {
  if (os6 === 1 /* Windows */) {
    if (isWindows2) {
      return getSystemShellWindows();
    }
    return getWindowsShell(env2);
  }
  return getSystemShellUnixLike(os6, env2);
}

function getSystemShellUnixLike(os6, env2) {
  if (isLinux && os6 === 2 /* Macintosh */ || isMacintosh && os6 === 3 /* Linux */) {
    return "/bin/bash";
  }
  if (!_TERMINAL_DEFAULT_SHELL_UNIX_LIKE) {
    let unixLikeTerminal;
    if (isWindows2) {
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

async function getSystemShellWindows() {
  if (!_TERMINAL_DEFAULT_SHELL_WINDOWS) {
    _TERMINAL_DEFAULT_SHELL_WINDOWS = (await getFirstAvailablePowerShellInstallation()).exePath;
  }
  return _TERMINAL_DEFAULT_SHELL_WINDOWS;
}

var _TERMINAL_DEFAULT_SHELL_UNIX_LIKE, _TERMINAL_DEFAULT_SHELL_WINDOWS;

var init_shell = __esm({
  "src/vs/base/node/shell.ts"() {
    init_platform();
    init_powershell();
    init_processes2();
    _TERMINAL_DEFAULT_SHELL_UNIX_LIKE = null;
    _TERMINAL_DEFAULT_SHELL_WINDOWS = null;
  }
});
export { getSystemShell, getSystemShellUnixLike, getSystemShellWindows, userInfo, _TERMINAL_DEFAULT_SHELL_UNIX_LIKE, _TERMINAL_DEFAULT_SHELL_WINDOWS, init_shell };
