// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/agentHost/node/wslRemoteAgentHostHelpers.ts
import { join } from "./module-0023.mjs";
import { buildAgentHostBaseCommand, buildCLIDownloadUrl, buildCleanupOldCLIsCommand, getRemoteCLIBin, getRemoteCLIDataDir, getRemoteCLIInstallRoot, shellEscape, validateAgentHostTelemetryLevel, validateShellToken } from "./module-0219.mjs";
import { AgentHostTelemetryLevelEnvKey } from "./module-0215.mjs";


// src/vs/platform/agentHost/node/wslRemoteAgentHostHelpers.ts
import * as cp3 from "child_process";

function getWslExePath() {
  const systemRoot = process.env["SystemRoot"];
  if (!systemRoot) {
    return "wsl.exe";
  }
  return join(systemRoot, "System32", "wsl.exe");
}

async function isWSLSupported() {
  if (process.platform !== "win32") {
    return false;
  }
  try {
    const result = await runWslCommand(["--status"], { timeout: 5e3 });
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

function runWslCommand(args, options) {
  return new Promise((resolve3, reject) => {
    const fullArgs = options?.distro ? ["-d", options.distro, ...args] : [...args];
    const child = cp3.spawn(getWslExePath(), fullArgs, {
      env: { ...process.env, WSL_UTF8: "1" },
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"]
    });
    const stdoutChunks = [];
    const stderrChunks = [];
    let settled = false;
    const timeout2 = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      try {
        child.kill("SIGKILL");
      } catch {
      }
      reject(new Error(`wsl.exe ${fullArgs.join(" ")} timed out after ${options?.timeout ?? 3e4}ms`));
    }, options?.timeout ?? 3e4);
    child.stdout?.on("data", (chunk) => stdoutChunks.push(chunk));
    child.stderr?.on("data", (chunk) => stderrChunks.push(chunk));
    child.on("error", (err) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout2);
      reject(err);
    });
    child.on("close", (exitCode) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout2);
      resolve3({
        stdout: decodeWslOutput(Buffer.concat(stdoutChunks)),
        stderr: decodeWslOutput(Buffer.concat(stderrChunks)),
        exitCode: exitCode ?? -1
      });
    });
  });
}

function decodeWslOutput(buffer2) {
  if (buffer2.length === 0) {
    return "";
  }
  if (buffer2.length >= 2 && buffer2[0] === 255 && buffer2[1] === 254) {
    return buffer2.toString("utf16le", 2);
  }
  const sampleLen = Math.min(buffer2.length, 16);
  if (sampleLen >= 4) {
    let zeros = 0;
    let total = 0;
    for (let i = 1; i < sampleLen; i += 2) {
      total++;
      if (buffer2[i] === 0) {
        zeros++;
      }
    }
    if (total > 0 && zeros / total >= 0.75) {
      let text2 = buffer2.toString("utf16le");
      if (text2.charCodeAt(0) === 65279) {
        text2 = text2.slice(1);
      }
      return text2;
    }
  }
  let text = buffer2.toString("utf8");
  if (text.charCodeAt(0) === 65279) {
    text = text.slice(1);
  }
  return text;
}

function parseWslListVerbose(output) {
  if (!output) {
    return [];
  }
  const stripped = output.charCodeAt(0) === 65279 ? output.slice(1) : output;
  const lines = stripped.split(/\r\n|\r|\n/);
  const distros = [];
  let headerSeen = false;
  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");
    if (!line.trim()) {
      continue;
    }
    if (!headerSeen) {
      const upper = line.trim().toUpperCase();
      if (upper.startsWith("NAME")) {
        headerSeen = true;
        continue;
      }
    }
    let working = line;
    let isDefault = false;
    if (working.startsWith("* ") || working.startsWith("*	")) {
      isDefault = true;
      working = working.slice(2);
    } else if (working.startsWith("  ") || working.startsWith(" 	")) {
      working = working.slice(2);
    } else if (working.startsWith(" ")) {
      working = working.slice(1);
    }
    const columns = working.trim().split(/\s+/);
    if (columns.length < 3) {
      continue;
    }
    const version = parseInt(columns[columns.length - 1], 10);
    if (version !== 2) {
      continue;
    }
    const state = columns[columns.length - 2];
    const name = columns.slice(0, columns.length - 2).join(" ");
    if (!name) {
      continue;
    }
    distros.push({
      name,
      isDefault,
      isRunning: state.toLowerCase() === "running",
      version: 2
    });
  }
  return distros;
}

function parseRunningDistros(output) {
  if (!output) {
    return [];
  }
  const stripped = output.charCodeAt(0) === 65279 ? output.slice(1) : output;
  return stripped.split(/\r\n|\r|\n/).map((line) => line.trim()).filter((line) => line.length > 0);
}

function composeAgentHostBootstrapScript(args) {
  const telemetryLevel = validateAgentHostTelemetryLevel(args.telemetryLevel ?? "off" /* OFF */);
  if (args.remoteAgentHostCommand) {
    return `export ${AgentHostTelemetryLevelEnvKey}=${telemetryLevel} && ${args.remoteAgentHostCommand}`;
  }
  const installRoot = getRemoteCLIInstallRoot(args.serverDataFolderName);
  const cliBin = getRemoteCLIBin(args.serverDataFolderName, args.quality, args.commit);
  const cliDataDir = getRemoteCLIDataDir(args.serverDataFolderName);
  const url = buildCLIDownloadUrl(args.os, args.arch, args.quality, args.commit);
  const launch = `exec ${buildAgentHostBaseCommand(cliBin, cliDataDir, telemetryLevel)}`;
  if (args.commit) {
    const cleanup = buildCleanupOldCLIsCommand(args.serverDataFolderName, args.quality);
    const installSteps = [
      `tmpdir=$(mktemp -d ${installRoot}/.cli-install-XXXXXX)`,
      `(cd "$tmpdir" && curl -fsSL ${shellEscape(url)} | tar xz)`,
      `mv "$tmpdir"/* ${cliBin}`,
      `chmod +x ${cliBin}`,
      `rm -rf "$tmpdir"`
    ].join(" && ");
    return [
      `mkdir -p ${installRoot}`,
      `if [ ! -x ${cliBin} ]; then ${installSteps}; fi`,
      `touch -- ${cliBin} 2>/dev/null || true`,
      `(${cleanup}) >/dev/null 2>&1 || true`,
      launch
    ].join(" && ");
  }
  const installLoose = `curl -fsSL ${shellEscape(url)} | tar xz -C ${installRoot} && chmod +x ${cliBin}`;
  return [
    `mkdir -p ${installRoot}`,
    `if [ ! -x ${cliBin} ]; then ${installLoose}; fi`,
    launch
  ].join(" && ");
}

function validateDistroName(name) {
  return validateShellToken(name, "WSL distro name");
}
export { getWslExePath, isWSLSupported, runWslCommand, decodeWslOutput, parseWslListVerbose, parseRunningDistros, composeAgentHostBootstrapScript, validateDistroName, cp3 };
