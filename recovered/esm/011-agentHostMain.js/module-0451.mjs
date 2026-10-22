// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostSessionRepositories.ts
import { Limiter } from "./module-0027.mjs";
import { extUriBiasedIgnorePathCase } from "./module-0025.mjs";


// src/vs/platform/agentHost/node/agentHostSessionRepositories.ts
var REPOSITORY_ROOT_RESOLUTION_CONCURRENCY = 5;

async function resolveSessionRepositories(workingDirectories, gitService, onRootError) {
  const limiter = new Limiter(REPOSITORY_ROOT_RESOLUTION_CONCURRENCY);
  let resolvedRoots;
  try {
    resolvedRoots = await Promise.all(workingDirectories.map((workingDirectory) => limiter.queue(async () => {
      try {
        return { workingDirectory, repositoryRoot: await gitService.getRepositoryRoot(workingDirectory) };
      } catch (err) {
        if (!onRootError) {
          throw err;
        }
        onRootError(workingDirectory, err);
        return { workingDirectory, repositoryRoot: void 0 };
      }
    })));
  } finally {
    limiter.dispose();
  }
  const gitRepositories = [];
  const nonGitDirectories = [];
  const seenRepositoryKeys = /* @__PURE__ */ new Set();
  for (const { workingDirectory, repositoryRoot } of resolvedRoots) {
    if (!repositoryRoot) {
      nonGitDirectories.push(workingDirectory);
      continue;
    }
    const repositoryKey = extUriBiasedIgnorePathCase.getComparisonKey(repositoryRoot);
    if (seenRepositoryKeys.has(repositoryKey)) {
      continue;
    }
    seenRepositoryKeys.add(repositoryKey);
    gitRepositories.push(repositoryRoot);
  }
  return { gitRepositories, nonGitDirectories };
}
export { resolveSessionRepositories, REPOSITORY_ROOT_RESOLUTION_CONCURRENCY };
