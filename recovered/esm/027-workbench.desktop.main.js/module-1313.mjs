// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/workspaceContains.ts
import { promiseWithResolvers } from "./module-0036.mjs";
import { joinPath } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { isCancellationError, onUnexpectedError } from "./module-0004.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISearchService } from "./module-0999.mjs";
import { QueryBuilder } from "./module-1312.mjs";
import { toWorkspaceFolder } from "./module-0509.mjs";


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
  const { promise, resolve: resolve3 } = promiseWithResolvers();
  const activate = (activationEvent) => resolve3({ activationEvent });
  const fileNamePromise = Promise.all(fileNames.map((fileName) => _activateIfFileName(host, fileName, activate))).then(() => {
  });
  const globPatternPromise = _activateIfGlobPatterns(host, desc.identifier, globPatterns, activate);
  Promise.all([fileNamePromise, globPatternPromise]).then(() => {
    resolve3(void 0);
  });
  return promise;
}

async function _activateIfFileName(host, fileName, activate) {
  for (const uri5 of host.folders) {
    if (await host.exists(joinPath(URI.revive(uri5), fileName))) {
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
  const timer = setTimeout(async () => {
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
  clearTimeout(timer);
  if (exists) {
    activate(`workspaceContains:${globPatterns.join(",")}`);
  }
}

function checkGlobFileExists(accessor, folders, includes2, token) {
  const instantiationService = accessor.get(IInstantiationService);
  const searchService = accessor.get(ISearchService);
  const queryBuilder = instantiationService.createInstance(QueryBuilder);
  const query = queryBuilder.file(folders.map((folder) => toWorkspaceFolder(URI.revive(folder))), {
    _reason: "checkExists",
    includePattern: includes2,
    exists: true
  });
  return searchService.fileSearch(query, token).then(
    (result) => {
      return !!result.limitHit;
    },
    (err) => {
      if (!isCancellationError(err)) {
        return Promise.reject(err);
      }
      return false;
    }
  );
}
export { checkActivateWorkspaceContainsExtension, _activateIfFileName, _activateIfGlobPatterns, checkGlobFileExists, WORKSPACE_CONTAINS_TIMEOUT };
