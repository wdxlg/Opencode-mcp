// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/commandLineHelpers.ts
import { URI } from "./module-0023.mjs";
import { extUriBiasedIgnorePathCase } from "./module-0025.mjs";


// src/vs/platform/agentHost/common/commandLineHelpers.ts
function extractCdPrefix(commandLine, isPowerShell2) {
  const cdPrefixMatch = commandLine.match(
    isPowerShell2 ? /^(?:cd(?: \/d)?|Set-Location(?: -Path)?) (?<dir>"[^"]*"|[^\s]+) *(?:&&|;|\r?\n)\s*(?<suffix>[\s\S]+)$/i : /^cd (?<dir>"[^"]*"|[^\s]+) *(?:&&|\r?\n)\s*(?<suffix>[\s\S]+)$/
  );
  const cdDir = cdPrefixMatch?.groups?.dir;
  const cdSuffix = cdPrefixMatch?.groups?.suffix;
  if (cdDir && cdSuffix) {
    let cdDirPath = cdDir;
    if (cdDirPath.startsWith('"') && cdDirPath.endsWith('"')) {
      cdDirPath = cdDirPath.slice(1, -1);
    }
    return { directory: cdDirPath, command: cdSuffix };
  }
  return void 0;
}

function stripRedundantCdPrefix(toolName, parameters, workingDirectory) {
  if (!workingDirectory || !parameters) {
    return false;
  }
  const isBash = toolName === "bash";
  const isPowerShell2 = toolName === "powershell";
  if (!isBash && !isPowerShell2) {
    return false;
  }
  const command = parameters.command;
  if (typeof command !== "string") {
    return false;
  }
  const extracted = extractCdPrefix(command, isPowerShell2);
  if (!extracted) {
    return false;
  }
  if (!sameDirectory(extracted.directory, workingDirectory)) {
    return false;
  }
  parameters.command = extracted.command;
  return true;
}

function sameDirectory(extractedDir, workingDirectory) {
  if (!extractedDir) {
    return false;
  }
  const trim = (p) => p.replace(/[\\/]+$/, "");
  const trimmedExtracted = trim(extractedDir);
  const trimmedWd = trim(workingDirectory.fsPath);
  if (!trimmedExtracted || !trimmedWd) {
    return false;
  }
  let extractedUri;
  let wdUri;
  try {
    extractedUri = URI.file(trimmedExtracted);
    wdUri = URI.file(trimmedWd);
  } catch {
    return false;
  }
  return extUriBiasedIgnorePathCase.isEqual(extractedUri, wdUri);
}
export { extractCdPrefix, stripRedundantCdPrefix, sameDirectory };
