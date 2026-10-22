// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/extensions/common/workspaceContains.ts
import { promiseWithResolvers } from "./module-0029.mjs";
import { joinPath } from "./module-0027.mjs";
import { URI } from "./module-0025.mjs";
import { CancellationTokenSource } from "./module-0018.mjs";
import { isCancellationError, onUnexpectedError } from "./module-0003.mjs";


// src/vs/workbench/services/extensions/common/workspaceContains.ts
var WORKSPACE_CONTAINS_TIMEOUT = 7e3;

function checkActivateWorkspaceContainsExtension(host, desc) {
  const activationEvents = desc.activationEvents;
  if (!activationEvents) {
    return Promise.resolve(void 0);
  }
  const fileNames = [];
  const globPatterns = [];
  for (const activationEvent of activationEvents) {
    if (/^workspaceContains:/.test(activationEvent)) {
      const fileNameOrGlob = activationEvent.substr("workspaceContains:".length);
      if (fileNameOrGlob.indexOf("*") >= 0 || fileNameOrGlob.indexOf("?") >= 0 || host.forceUsingSearch) {
        globPatterns.push(fileNameOrGlob);
      } else {
        fileNames.push(fileNameOrGlob);
      }
    }
  }
  if (fileNames.length === 0 && globPatterns.length === 0) {
    return Promise.resolve(void 0);
  }
  const { promise, resolve: resolve2 } = promiseWithResolvers();
  const activate = (activationEvent) => resolve2({ activationEvent });
  const fileNamePromise = Promise.all(fileNames.map((fileName) => _activateIfFileName(host, fileName, activate))).then(() => {
  });
  const globPatternPromise = _activateIfGlobPatterns(host, desc.identifier, globPatterns, activate);
  Promise.all([fileNamePromise, globPatternPromise]).then(() => {
    resolve2(void 0);
  });
  return promise;
}

async function _activateIfFileName(host, fileName, activate) {
  for (const uri2 of host.folders) {
    if (await host.exists(joinPath(URI.revive(uri2), fileName))) {
      activate(`workspaceContains:${fileName}`);
      return;
    }
  }
}

async function _activateIfGlobPatterns(host, extensionId, globPatterns, activate) {
  if (globPatterns.length === 0) {
    return Promise.resolve(void 0);
  }
  const tokenSource = new CancellationTokenSource();
  const searchP = host.checkExists(host.folders, globPatterns, tokenSource.token);
  const timer2 = setTimeout(async () => {
    tokenSource.cancel();
    host.logService.info(`Not activating extension '${extensionId.value}': Timed out while searching for 'workspaceContains' pattern ${globPatterns.join(",")}`);
  }, WORKSPACE_CONTAINS_TIMEOUT);
  let exists = false;
  try {
    exists = await searchP;
  } catch (err) {
    if (!isCancellationError(err)) {
      onUnexpectedError(err);
    }
  }
  tokenSource.dispose();
  clearTimeout(timer2);
  if (exists) {
    activate(`workspaceContains:${globPatterns.join(",")}`);
  }
}
export { checkActivateWorkspaceContainsExtension, _activateIfFileName, _activateIfGlobPatterns, WORKSPACE_CONTAINS_TIMEOUT };
