// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/node/powershell.ts
import { init_path, join4 } from "./module-0008.mjs";
import { Promises2, SymlinkSupport, init_pfs } from "./module-0036.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/base/node/powershell.ts
import * as os2 from "os";

function getProgramFilesPath({ useAlternateBitness = false } = {}) {
  if (!useAlternateBitness) {
    return process.env.ProgramFiles || null;
  }
  if (processArch === 0 /* x64 */) {
    return process.env["ProgramFiles(x86)"] || null;
  }
  if (osArch === 0 /* x64 */) {
    return process.env.ProgramW6432 || null;
  }
  return null;
}

async function findPSCoreWindowsInstallation({ useAlternateBitness = false, findPreview = false } = {}) {
  const programFilesPath = getProgramFilesPath({ useAlternateBitness });
  if (!programFilesPath) {
    return null;
  }
  const powerShellInstallBaseDir = join4(programFilesPath, "PowerShell");
  if (!await SymlinkSupport.existsDirectory(powerShellInstallBaseDir)) {
    return null;
  }
  let highestSeenVersion = -1;
  let pwshExePath = null;
  for (const item of await Promises2.readdir(powerShellInstallBaseDir)) {
    let currentVersion = -1;
    if (findPreview) {
      const dashIndex = item.indexOf("-");
      if (dashIndex < 0) {
        continue;
      }
      const intPart = item.substring(0, dashIndex);
      if (!IntRegex.test(intPart) || item.substring(dashIndex + 1) !== "preview") {
        continue;
      }
      currentVersion = parseInt(intPart, 10);
    } else {
      if (!IntRegex.test(item)) {
        continue;
      }
      currentVersion = parseInt(item, 10);
    }
    if (currentVersion <= highestSeenVersion) {
      continue;
    }
    const exePath = join4(powerShellInstallBaseDir, item, "pwsh.exe");
    if (!await SymlinkSupport.existsFile(exePath)) {
      continue;
    }
    pwshExePath = exePath;
    highestSeenVersion = currentVersion;
  }
  if (!pwshExePath) {
    return null;
  }
  const bitness = programFilesPath.includes("x86") ? " (x86)" : "";
  const preview = findPreview ? " Preview" : "";
  return new PossiblePowerShellExe(pwshExePath, `PowerShell${preview}${bitness}`, true);
}

async function findPSCoreMsix({ findPreview } = {}) {
  if (!process.env.LOCALAPPDATA) {
    return null;
  }
  const msixAppDir = join4(process.env.LOCALAPPDATA, "Microsoft", "WindowsApps");
  if (!await SymlinkSupport.existsDirectory(msixAppDir)) {
    return null;
  }
  const { pwshMsixDirRegex, pwshMsixName } = findPreview ? { pwshMsixDirRegex: PwshPreviewMsixRegex, pwshMsixName: "PowerShell Preview (Store)" } : { pwshMsixDirRegex: PwshMsixRegex, pwshMsixName: "PowerShell (Store)" };
  for (const subdir of await Promises2.readdir(msixAppDir)) {
    if (pwshMsixDirRegex.test(subdir)) {
      const pwshMsixPath = join4(msixAppDir, subdir, "pwsh.exe");
      return new PossiblePowerShellExe(pwshMsixPath, pwshMsixName);
    }
  }
  return null;
}

function findPSCoreDotnetGlobalTool() {
  const dotnetGlobalToolExePath = join4(os2.homedir(), ".dotnet", "tools", "pwsh.exe");
  return new PossiblePowerShellExe(dotnetGlobalToolExePath, ".NET Core PowerShell Global Tool");
}

function findPSCoreScoopInstallation() {
  const scoopAppsDir = join4(os2.homedir(), "scoop", "apps");
  const scoopPwsh = join4(scoopAppsDir, "pwsh", "current", "pwsh.exe");
  return new PossiblePowerShellExe(scoopPwsh, "PowerShell (Scoop)");
}

function findWinPS() {
  const winPSPath = join4(
    process.env.windir,
    processArch === 1 /* x86 */ && osArch !== 1 /* x86 */ ? "SysNative" : "System32",
    "WindowsPowerShell",
    "v1.0",
    "powershell.exe"
  );
  return new PossiblePowerShellExe(winPSPath, "Windows PowerShell", true);
}

async function* enumerateDefaultPowerShellInstallations() {
  let pwshExe = await findPSCoreWindowsInstallation();
  if (pwshExe) {
    yield pwshExe;
  }
  pwshExe = await findPSCoreWindowsInstallation({ useAlternateBitness: true });
  if (pwshExe) {
    yield pwshExe;
  }
  pwshExe = await findPSCoreMsix();
  if (pwshExe) {
    yield pwshExe;
  }
  pwshExe = findPSCoreDotnetGlobalTool();
  if (pwshExe) {
    yield pwshExe;
  }
  pwshExe = await findPSCoreWindowsInstallation({ findPreview: true });
  if (pwshExe) {
    yield pwshExe;
  }
  pwshExe = await findPSCoreMsix({ findPreview: true });
  if (pwshExe) {
    yield pwshExe;
  }
  pwshExe = await findPSCoreWindowsInstallation({ useAlternateBitness: true, findPreview: true });
  if (pwshExe) {
    yield pwshExe;
  }
  pwshExe = await findPSCoreScoopInstallation();
  if (pwshExe) {
    yield pwshExe;
  }
  pwshExe = findWinPS();
  if (pwshExe) {
    yield pwshExe;
  }
}

async function* enumeratePowerShellInstallations() {
  for await (const defaultPwsh of enumerateDefaultPowerShellInstallations()) {
    if (await defaultPwsh.exists()) {
      yield defaultPwsh;
    }
  }
}

async function getFirstAvailablePowerShellInstallation() {
  for await (const pwsh of enumeratePowerShellInstallations()) {
    return pwsh;
  }
  return null;
}

var IntRegex, PwshMsixRegex, PwshPreviewMsixRegex, processArch, osArch, PossiblePowerShellExe;

var init_powershell = __esm({
  "src/vs/base/node/powershell.ts"() {
    init_path();
    init_pfs();
    IntRegex = /^\d+$/;
    PwshMsixRegex = /^Microsoft.PowerShell_.*/;
    PwshPreviewMsixRegex = /^Microsoft.PowerShellPreview_.*/;
    switch (process.arch) {
      case "ia32":
        processArch = 1 /* x86 */;
        break;
      case "arm":
      case "arm64":
        processArch = 2 /* ARM */;
        break;
      default:
        processArch = 0 /* x64 */;
        break;
    }
    if (process.env["PROCESSOR_ARCHITEW6432"]) {
      osArch = process.env["PROCESSOR_ARCHITEW6432"] === "ARM64" ? 2 /* ARM */ : 0 /* x64 */;
    } else if (process.env["PROCESSOR_ARCHITECTURE"] === "ARM64") {
      osArch = 2 /* ARM */;
    } else if (process.env["PROCESSOR_ARCHITECTURE"] === "X86") {
      osArch = 1 /* x86 */;
    } else {
      osArch = 0 /* x64 */;
    }
    PossiblePowerShellExe = class {
      constructor(exePath, displayName, knownToExist) {
        this.exePath = exePath;
        this.displayName = displayName;
        this.knownToExist = knownToExist;
      }
      async exists() {
        if (this.knownToExist === void 0) {
          this.knownToExist = await SymlinkSupport.existsFile(this.exePath);
        }
        return this.knownToExist;
      }
    };
  }
});
export { getProgramFilesPath, findPSCoreWindowsInstallation, findPSCoreMsix, findPSCoreDotnetGlobalTool, findPSCoreScoopInstallation, findWinPS, enumerateDefaultPowerShellInstallations, enumeratePowerShellInstallations, getFirstAvailablePowerShellInstallation, os2, IntRegex, PwshMsixRegex, PwshPreviewMsixRegex, processArch, osArch, PossiblePowerShellExe, init_powershell };
