// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/sandboxConfigForSdk.ts



// src/vs/platform/agentHost/node/copilot/sandboxConfigForSdk.ts
function buildSandboxConfigForSdk(platform3, sandbox) {
  const enabledRaw = platform3 === "win32" ? sandbox?.["enabled.windows" /* WindowsEnabled */] : sandbox?.["enabled" /* Enabled */];
  if (enabledRaw !== "on" /* On */) {
    return void 0;
  }
  const fsRaw = platform3 === "win32" ? sandbox?.["fileSystem.windows" /* WindowsFileSystem */] : platform3 === "darwin" ? sandbox?.["fileSystem.mac" /* MacFileSystem */] : sandbox?.["fileSystem.linux" /* LinuxFileSystem */];
  const hasFileSystemPolicy = fsRaw !== void 0 && typeof fsRaw === "object";
  const fs18 = hasFileSystemPolicy ? fsRaw : {};
  const denied = new Set(fs18.denyRead ?? []);
  const readonly = /* @__PURE__ */ new Set();
  const readwrite = /* @__PURE__ */ new Set();
  for (const p of fs18.denyWrite ?? []) {
    if (!denied.has(p)) {
      readonly.add(p);
    }
  }
  for (const p of fs18.allowWrite ?? []) {
    if (!denied.has(p) && !readonly.has(p)) {
      readwrite.add(p);
    }
  }
  for (const p of fs18.allowRead ?? []) {
    if (!denied.has(p) && !readonly.has(p) && !readwrite.has(p)) {
      readonly.add(p);
    }
  }
  const allowNetwork = sandbox?.["allowNetwork" /* AllowNetwork */];
  const allowBypass = sandbox?.["allowUnsandboxedCommands" /* AllowUnsandboxedCommands */] ?? false;
  const sandboxConfig = {
    enabled: true,
    allowBypass,
    addCurrentWorkingDirectory: true,
    allowDevToolAccess: true,
    auth: {
      git: false,
      gh: false
    },
    userPolicy: {
      filesystem: {
        ...denied.size ? { deniedPaths: [...denied] } : {},
        ...readonly.size ? { readonlyPaths: [...readonly] } : {},
        ...readwrite.size ? { readwritePaths: [...readwrite] } : {},
        clearPolicyOnExit: true
      },
      network: {
        allowOutbound: typeof allowNetwork === "boolean" ? allowNetwork : false,
        allowLocalNetwork: true
      }
    }
  };
  return sandboxConfig;
}
export { buildSandboxConfigForSdk };
