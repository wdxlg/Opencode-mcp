// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostGitService.ts
import { createDecorator } from "./module-0044.mjs";
import { LRUCache } from "./module-0006.mjs";
import { Sequencer } from "./module-0027.mjs";


// src/vs/platform/agentHost/common/agentHostGitService.ts
var META_DIFF_BASE_BRANCH = "agentHost.diffBaseBranch";

function resolveDiffBaseBranchName(persistedBaseBranch, sessionGitStateBaseBranch) {
  const branchName = persistedBaseBranch ?? sessionGitStateBaseBranch;
  if (!branchName) {
    return void 0;
  }
  return branchName.replace(/^refs\/remotes\/origin\//, "").replace(/^origin\//, "");
}

var EMPTY_TREE_OBJECT = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

var IAgentHostGitService = createDecorator("agentHostGitService");

var PrimaryWorktreeRootResolver = class {
  constructor(_gitService) {
    this._gitService = _gitService;
    this._roots = new LRUCache(100);
    this._sequencer = new Sequencer();
  }
  async resolve(checkoutRoot) {
    const key = checkoutRoot.toString();
    const cached = this._roots.get(key);
    if (cached) {
      return cached;
    }
    return this._sequencer.queue(async () => {
      const cached2 = this._roots.get(key);
      if (cached2) {
        return cached2;
      }
      const roots = await this._gitService.getWorktreeRoots(checkoutRoot);
      const primaryRoot = roots[0];
      if (!primaryRoot) {
        return void 0;
      }
      this._roots.set(key, primaryRoot);
      for (const root of roots) {
        this._roots.set(root.toString(), primaryRoot);
      }
      return primaryRoot;
    });
  }
};

var primaryWorktreeRootResolvers = /* @__PURE__ */ new WeakMap();

function tryResolvePrimaryWorktreeRoot(gitService, checkoutRoot) {
  let resolver = primaryWorktreeRootResolvers.get(gitService);
  if (!resolver) {
    resolver = new PrimaryWorktreeRootResolver(gitService);
    primaryWorktreeRootResolvers.set(gitService, resolver);
  }
  return resolver.resolve(checkoutRoot);
}

function getBranchPriority(branch, currentBranch, defaultBranch) {
  if (branch === currentBranch) {
    return 0;
  }
  if (branch === defaultBranch) {
    return 1;
  }
  return 2;
}

function parseUpstreamBranchName(upstreamBranchName) {
  const separatorIndex = upstreamBranchName?.indexOf("/") ?? -1;
  if (!upstreamBranchName || separatorIndex <= 0 || separatorIndex === upstreamBranchName.length - 1) {
    return void 0;
  }
  return {
    remote: upstreamBranchName.substring(0, separatorIndex),
    branch: upstreamBranchName.substring(separatorIndex + 1)
  };
}

function getBranchCompletions(branches, options) {
  const normalizedQuery = options?.query?.toLowerCase();
  const filtered = normalizedQuery ? branches.filter((branch) => branch.toLowerCase().includes(normalizedQuery)) : [...branches];
  filtered.sort((a, b) => getBranchPriority(a, options?.currentBranch, options?.defaultBranch) - getBranchPriority(b, options?.currentBranch, options?.defaultBranch));
  return options?.limit ? filtered.slice(0, options.limit) : filtered;
}
export { resolveDiffBaseBranchName, tryResolvePrimaryWorktreeRoot, getBranchPriority, parseUpstreamBranchName, getBranchCompletions, META_DIFF_BASE_BRANCH, EMPTY_TREE_OBJECT, IAgentHostGitService, PrimaryWorktreeRootResolver, primaryWorktreeRootResolvers };
