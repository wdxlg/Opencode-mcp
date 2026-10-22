// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/node/powershell.ts
import { Promises2, SymlinkSupport } from "./module-0033.mjs";
import { join } from "./module-0019.mjs";


// src/vs/base/node/powershell.ts
import * as os from "os";

var IntRegex = /^\d+$/;

var PwshMsixRegex = /^Microsoft.PowerShell_.*/;

var PwshPreviewMsixRegex = /^Microsoft.PowerShellPreview_.*/;

var processArch;

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

var osArch;

if (process.env["PROCESSOR_ARCHITEW6432"]) {
  osArch = process.env["PROCESSOR_ARCHITEW6432"] === "ARM64" ? 2 /* ARM */ : 0 /* x64 */;
} else if (process.env["PROCESSOR_ARCHITECTURE"] === "ARM64") {
  osArch = 2 /* ARM */;
} else if (process.env["PROCESSOR_ARCHITECTURE"] === "X86") {
  osArch = 1 /* x86 */;
} else {
  osArch = 0 /* x64 */;
}

var PossiblePowerShellExe = class {
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
  const powerShellInstallBaseDir = join(programFilesPath, "PowerShell");
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
    const exePath = join(powerShellInstallBaseDir, item, "pwsh.exe");
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
  const msixAppDir = join(process.env.LOCALAPPDATA, "Microsoft", "WindowsApps");
  if (!await SymlinkSupport.existsDirectory(msixAppDir)) {
    return null;
  }
  const { pwshMsixDirRegex, pwshMsixName } = findPreview ? { pwshMsixDirRegex: PwshPreviewMsixRegex, pwshMsixName: "PowerShell Preview (Store)" } : { pwshMsixDirRegex: PwshMsixRegex, pwshMsixName: "PowerShell (Store)" };
  for (const subdir of await Promises2.readdir(msixAppDir)) {
    if (pwshMsixDirRegex.test(subdir)) {
      const pwshMsixPath = join(msixAppDir, subdir, "pwsh.exe");
      return new PossiblePowerShellExe(pwshMsixPath, pwshMsixName);
    }
  }
  return null;
}

function findPSCoreDotnetGlobalTool() {
  const dotnetGlobalToolExePath = join(os.homedir(), ".dotnet", "tools", "pwsh.exe");
  return new PossiblePowerShellExe(dotnetGlobalToolExePath, ".NET Core PowerShell Global Tool");
}

function findPSCoreScoopInstallation() {
  const scoopAppsDir = join(os.homedir(), "scoop", "apps");
  const scoopPwsh = join(scoopAppsDir, "pwsh", "current", "pwsh.exe");
  return new PossiblePowerShellExe(scoopPwsh, "PowerShell (Scoop)");
}

function findWinPS() {
  const winPSPath = join(
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
export { getProgramFilesPath, findPSCoreWindowsInstallation, findPSCoreMsix, findPSCoreDotnetGlobalTool, findPSCoreScoopInstallation, findWinPS, enumerateDefaultPowerShellInstallations, enumeratePowerShellInstallations, getFirstAvailablePowerShellInstallation, os, IntRegex, PwshMsixRegex, PwshPreviewMsixRegex, processArch, osArch, PossiblePowerShellExe };
