// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/agentHost/node/remoteAgentHostCliInstaller.ts
import { buildCLIDownloadUrl, buildCleanupOldCLIsCommand, buildFindFallbackCLICommand, getRemoteCLIBin, getRemoteCLIInstallRoot, isValidFallbackCLIPath, shellEscape } from "./module-0219.mjs";


// src/vs/platform/agentHost/node/remoteAgentHostCliInstaller.ts
async function ensureRemoteAgentHostCliInstalled(exec2, platform3, options) {
  return options.commit ? ensurePinnedCliInstalled(exec2, platform3, options, options.commit) : ensureLooseCliInstalled(exec2, platform3, options);
}

async function ensurePinnedCliInstalled(exec2, platform3, options, commit) {
  const cliBin = getRemoteCLIBin(options.serverDataFolderName, options.quality, commit);
  const installRoot = getRemoteCLIInstallRoot(options.serverDataFolderName);
  const logPrefix = options.logPrefix ?? "[RemoteAgentHostCliInstaller]";
  const { code: existsCode } = await exec2(`test -x ${cliBin}`, { ignoreExitCode: true });
  if (existsCode === 0) {
    options.logService.info(`${logPrefix} Reusing remote CLI at ${cliBin}`);
    const { code: touchCode } = await exec2(`touch -- ${cliBin}`, { ignoreExitCode: true });
    if (touchCode === 0) {
      await exec2(buildCleanupOldCLIsCommand(options.serverDataFolderName, options.quality), { ignoreExitCode: true });
    } else {
      options.logService.warn(`${logPrefix} Skipping CLI retention cleanup: touch exited ${touchCode}`);
    }
    return cliBin;
  }
  options.reportInstalling();
  const url = buildCLIDownloadUrl(platform3.os, platform3.arch, options.quality, commit);
  const installCommand = [
    `mkdir -p ${installRoot}`,
    `tmpdir=$(mktemp -d ${installRoot}/.cli-install-XXXXXX)`,
    `(cd "$tmpdir" && curl -fsSL ${shellEscape(url)} | tar xz)`,
    `mv "$tmpdir"/* ${cliBin}`,
    `chmod +x ${cliBin}`,
    `rm -rf "$tmpdir"`
  ].join(" && ");
  try {
    await exec2(installCommand);
    const { code: versionCode } = await exec2(`${cliBin} --version`, { ignoreExitCode: true });
    if (versionCode !== 0) {
      throw new Error(`CLI at ${cliBin} failed --version check after install (exit code ${versionCode})`);
    }
    options.logService.info(`${logPrefix} Installed remote CLI at ${cliBin}`);
    await exec2(buildCleanupOldCLIsCommand(options.serverDataFolderName, options.quality), { ignoreExitCode: true });
    return cliBin;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    options.logService.warn(`${logPrefix} Could not install matching CLI for commit ${commit}: ${message}. Looking for a fallback CLI...`);
    const fallback = await findFallbackCli(exec2, options);
    if (fallback) {
      options.logService.warn(`${logPrefix} Using fallback CLI at ${fallback} (does not match desktop commit ${commit}).`);
      return fallback;
    }
    throw error;
  }
}

async function ensureLooseCliInstalled(exec2, platform3, options) {
  const cliBin = getRemoteCLIBin(options.serverDataFolderName, options.quality);
  const installRoot = getRemoteCLIInstallRoot(options.serverDataFolderName);
  const logPrefix = options.logPrefix ?? "[RemoteAgentHostCliInstaller]";
  options.logService.warn(`${logPrefix} Desktop has no product commit; falling back to non-pinned CLI install at ${cliBin}.`);
  const updateExitCodeMarker = "__vscode_cli_update_exit_code__:";
  const { code, stdout } = await exec2(`${cliBin} --version && (${cliBin} update; update_code=$?; echo ${updateExitCodeMarker}$update_code; true)`, { ignoreExitCode: true });
  if (code === 0) {
    const updateExitCodeLine = stdout.split("\n").find((line) => line.startsWith(updateExitCodeMarker));
    const updateExitCode = updateExitCodeLine === void 0 ? void 0 : Number.parseInt(updateExitCodeLine.slice(updateExitCodeMarker.length), 10);
    if (updateExitCode !== void 0 && updateExitCode !== 0) {
      options.logService.warn(`${logPrefix} Could not refresh the dev-build remote CLI at ${cliBin}; reusing the existing executable: update exited ${updateExitCode}`);
    }
    options.logService.info(`${logPrefix} Reusing remote CLI at ${cliBin} (dev build, latest-version refresh attempted)`);
    return cliBin;
  }
  options.reportInstalling();
  const url = buildCLIDownloadUrl(platform3.os, platform3.arch, options.quality);
  await exec2([
    `mkdir -p ${installRoot}`,
    `curl -fsSL ${shellEscape(url)} | tar xz -C ${installRoot}`,
    `chmod +x ${cliBin}`
  ].join(" && "));
  options.logService.info(`${logPrefix} Installed remote CLI at ${cliBin}`);
  return cliBin;
}

async function findFallbackCli(exec2, options) {
  const logPrefix = options.logPrefix ?? "[RemoteAgentHostCliInstaller]";
  const { stdout } = await exec2(buildFindFallbackCLICommand(options.serverDataFolderName, options.quality), { ignoreExitCode: true });
  const rawCandidates = stdout.split("\n").map((candidate) => candidate.trim()).filter((candidate) => candidate.length > 0);
  for (const candidate of rawCandidates) {
    if (!isValidFallbackCLIPath(candidate, options.serverDataFolderName, options.quality)) {
      options.logService.info(`${logPrefix} Ignoring fallback CLI candidate with unexpected path shape: ${candidate}`);
      continue;
    }
    const { code } = await exec2(`${candidate} --version`, { ignoreExitCode: true });
    if (code === 0) {
      return candidate;
    }
    options.logService.info(`${logPrefix} Fallback CLI candidate ${candidate} failed --version check (exit ${code}).`);
  }
  return void 0;
}
export { ensureRemoteAgentHostCliInstalled, ensurePinnedCliInstalled, ensureLooseCliInstalled, findFallbackCli };
