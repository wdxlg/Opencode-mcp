// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/localAgentHostMetadata.ts
import { AGENT_HOST_ENDPOINT_REGISTRY_SCHEMA_VERSION, getAgentHostEndpointIdentityHashInput } from "./module-0416.mjs";
import { PROTOCOL_VERSION } from "./module-0405.mjs";
import { join } from "./module-0018.mjs";


// src/vs/platform/agentHost/node/localAgentHostMetadata.ts
import { execFile } from "child_process";

import { createHash as createHash4, randomBytes as randomBytes2 } from "crypto";

import * as fs13 from "fs";

import * as os8 from "os";


// src/vs/platform/agentHost/node/localAgentHostMetadata.ts
var metadataDirectoryName = "agent-host";

var endpointDirectoryName = "local-endpoint";

var entriesDirectoryName = "entries";

function createLocalAgentHostEndpointMetadata(userDataPath) {
  const instanceId = randomBytes2(16).toString("base64url");
  return {
    schemaVersion: AGENT_HOST_ENDPOINT_REGISTRY_SCHEMA_VERSION,
    type: "editor",
    pid: process.pid,
    instanceId,
    endpoint: { type: "socket", path: getEndpointPath(userDataPath, instanceId) },
    connectionToken: randomBytes2(32).toString("base64url"),
    protocolVersion: PROTOCOL_VERSION
  };
}

async function prepareLocalAgentHostEndpointMetadataDirectory(userDataPath) {
  await prepareOwnerOnlyDirectory(getMetadataDirectory(userDataPath));
  await prepareOwnerOnlyDirectory(getEntriesDirectory(userDataPath));
}

async function prepareOwnerOnlyDirectory(directory) {
  await fs13.promises.mkdir(directory, { recursive: true, mode: 448 });
  const stat3 = await fs13.promises.lstat(directory);
  if (!stat3.isDirectory() || stat3.isSymbolicLink()) {
    throw new Error(`Local agent host endpoint directory is not a directory: ${directory}`);
  }
  if (process.platform === "win32") {
    await applyWindowsOwnerOnlyAcl(directory);
  } else {
    if (process.getuid && stat3.uid !== process.getuid()) {
      throw new Error(`Local agent host endpoint directory is not owned by the current user: ${directory}`);
    }
    await fs13.promises.chmod(directory, 448);
  }
}

async function prepareLocalAgentHostEndpointSocketDirectory(userDataPath) {
  if (process.platform !== "win32") {
    const directory = getSocketDirectory(userDataPath);
    await fs13.promises.mkdir(directory, { recursive: true, mode: 448 });
    const stat3 = await fs13.promises.lstat(directory);
    if (!stat3.isDirectory() || stat3.isSymbolicLink()) {
      throw new Error(`Local agent host endpoint socket directory is not a directory: ${directory}`);
    }
    if (process.getuid && stat3.uid !== process.getuid()) {
      throw new Error(`Local agent host endpoint socket directory is not owned by the current user: ${directory}`);
    }
    await fs13.promises.chmod(directory, 448);
  }
}

async function publishLocalAgentHostEndpointMetadata(userDataPath, metadata, logService) {
  await prepareLocalAgentHostEndpointMetadataDirectory(userDataPath);
  const entriesDirectory = getEntriesDirectory(userDataPath);
  const entryPath = join(entriesDirectory, getAgentHostEndpointEntryFileName(metadata));
  await writeEntryFileAtomicAsync(entriesDirectory, entryPath, metadata, logService);
}

function cleanupLocalAgentHostEndpointMetadataSync(userDataPath, owner, logService) {
  const entryPath = join(getEntriesDirectory(userDataPath), getAgentHostEndpointEntryFileName(owner));
  try {
    fs13.rmSync(entryPath, { force: true });
  } catch (error) {
    logService?.error(`[AgentHost] Failed to remove our local agent host endpoint entry ${entryPath}`, error);
  }
}

function cleanupLocalAgentHostEndpointSocketSync(endpointPath) {
  if (process.platform !== "win32") {
    fs13.rmSync(endpointPath, { force: true });
  }
}

function getMetadataDirectory(userDataPath) {
  return join(userDataPath, metadataDirectoryName, endpointDirectoryName);
}

function getEntriesDirectory(userDataPath) {
  return join(getMetadataDirectory(userDataPath), entriesDirectoryName);
}

function getAgentHostEndpointEntryFileName(identity2) {
  const hash2 = createHash4("sha256").update(getAgentHostEndpointIdentityHashInput(identity2), "utf8").digest("hex");
  return `${hash2}.json`;
}

function getSocketDirectory(userDataPath) {
  const owner = process.getuid?.().toString() ?? "";
  const hash2 = createHash4("sha256").update(`${owner}:${userDataPath}`).digest("hex").slice(0, 12);
  return join(os8.tmpdir(), `vscode-ah-${hash2}`);
}

function getEndpointPath(userDataPath, instanceId) {
  if (process.platform === "win32") {
    const userDataHash = createHash4("sha256").update(userDataPath).digest("hex");
    return `\\\\.\\pipe\\vscode-agent-host-${userDataHash}-${instanceId}`;
  }
  return join(getSocketDirectory(userDataPath), `${instanceId}.sock`);
}

async function writeEntryFileAtomicAsync(entriesDirectory, entryPath, metadata, logService) {
  const temporaryPath = join(entriesDirectory, `${randomBytes2(16).toString("hex")}.tmp`);
  const handle = await fs13.promises.open(temporaryPath, "wx", 384);
  try {
    await handle.writeFile(JSON.stringify(metadata), "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    await renameReplacingAsync(temporaryPath, entryPath, logService);
  } finally {
    await fs13.promises.rm(temporaryPath, { force: true }).catch(() => {
    });
  }
}

async function renameReplacingAsync(from, to, logService) {
  try {
    await fs13.promises.rename(from, to);
  } catch (error) {
    if (process.platform === "win32" && isWindowsRenameContention(error)) {
      logService?.info(`[AgentHost] Replacing our own local agent host endpoint entry ${to} after a rename contention`);
      await fs13.promises.rm(to, { force: true });
      await fs13.promises.rename(from, to);
      return;
    }
    throw error;
  }
}

function isWindowsRenameContention(error) {
  const code = error?.code;
  return code === "EPERM" || code === "EACCES" || code === "EEXIST";
}

async function applyWindowsOwnerOnlyAcl(path) {
  const systemRoot = process.env.SystemRoot ?? process.env.WINDIR;
  if (!systemRoot) {
    throw new Error("Unable to resolve the Windows system directory for local agent host metadata.");
  }
  const systemDirectory = join(systemRoot, "System32");
  const whoAmI = await runWindowsCommand(join(systemDirectory, "whoami.exe"), ["/user", "/fo", "csv", "/nh"]);
  const sid = whoAmI.match(/S-\d+(?:-\d+)+/)?.[0];
  if (!sid) {
    throw new Error("Unable to determine the current Windows user SID for local agent host metadata.");
  }
  const icacls = join(systemDirectory, "icacls.exe");
  await runWindowsCommand(icacls, [path, "/reset"]);
  await runWindowsCommand(icacls, [
    path,
    "/inheritance:r",
    "/grant:r",
    `*${sid}:(OI)(CI)F`,
    "*S-1-5-18:(OI)(CI)F",
    "*S-1-5-32-544:(OI)(CI)F"
  ]);
}

function runWindowsCommand(command, args) {
  return new Promise((resolve3, reject) => {
    execFile(command, [...args], { encoding: "utf8", windowsHide: true }, (error, stdout) => error ? reject(error) : resolve3(String(stdout)));
  });
}
export { createLocalAgentHostEndpointMetadata, prepareLocalAgentHostEndpointMetadataDirectory, prepareOwnerOnlyDirectory, prepareLocalAgentHostEndpointSocketDirectory, publishLocalAgentHostEndpointMetadata, cleanupLocalAgentHostEndpointMetadataSync, cleanupLocalAgentHostEndpointSocketSync, getMetadataDirectory, getEntriesDirectory, getAgentHostEndpointEntryFileName, getSocketDirectory, getEndpointPath, writeEntryFileAtomicAsync, renameReplacingAsync, isWindowsRenameContention, applyWindowsOwnerOnlyAcl, runWindowsCommand, execFile, createHash4, randomBytes2, fs13, os8, metadataDirectoryName, endpointDirectoryName, entriesDirectoryName };
