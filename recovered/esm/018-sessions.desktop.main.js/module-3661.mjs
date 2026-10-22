// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/common/agentHostSessionWorkspace.ts
import { match } from "./module-0857.mjs";
import { basename2, extUri } from "./module-0034.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/sessions/common/agentHostSessionWorkspace.ts
function matchesAnyBranchProtectionPattern(branchName, patterns) {
  if (!patterns) {
    return false;
  }
  for (const pattern of patterns) {
    const trimmed = pattern.trim();
    if (trimmed && match(trimmed, branchName)) {
      return true;
    }
  }
  return false;
}

function readBranchProtectionPatterns(configurationService, resource) {
  const raw = configurationService.getValue("git.branchProtection", { resource }) ?? [];
  const list2 = Array.isArray(raw) ? raw : [raw];
  return list2.map((p) => typeof p === "string" ? p.trim() : "").filter((p) => p !== "");
}

function agentHostSessionWorkspaceKey(workspace) {
  const folder = workspace?.folders[0];
  if (!workspace || !folder) {
    return void 0;
  }
  const folderKeys = workspace.folders.map((f) => {
    const repo = f.gitRepository;
    return [
      extUri.getComparisonKey(f.root),
      f.workingDirectory ? extUri.getComparisonKey(f.workingDirectory) : "",
      repo?.branchName ?? "",
      repo?.baseBranchName ?? "",
      String(repo?.baseBranchProtected ?? ""),
      String(repo?.hasGitHubRemote ?? ""),
      repo?.upstreamBranchName ?? "",
      String(repo?.incomingChanges ?? ""),
      String(repo?.outgoingChanges ?? ""),
      String(repo?.uncommittedChanges ?? "")
    ].join("");
  });
  return [workspace.label, ...folderKeys].join("\n");
}

function buildAgentHostSessionWorkspace(project, workingDirectories, options3, gitHubInfo, gitState) {
  const baseBranchName = gitState?.baseBranchName;
  const baseBranchProtected = baseBranchName !== void 0 ? matchesAnyBranchProtectionPattern(baseBranchName, options3.branchProtectionPatterns) : void 0;
  const hasGitHubRemote = gitState?.hasGitHubRemote;
  const upstreamBranchName = gitState?.upstreamBranchName;
  const incomingChanges = gitState?.incomingChanges;
  const outgoingChanges = gitState?.outgoingChanges;
  const uncommittedChanges = gitState?.uncommittedChanges;
  const branchName = gitState?.branchName;
  const gitFields = { branchName, baseBranchName, baseBranchProtected, hasGitHubRemote, upstreamBranchName, incomingChanges, outgoingChanges, uncommittedChanges };
  const primary = workingDirectories?.[0];
  const additionalFolders = (workingDirectories ?? []).slice(1).map((dir) => {
    const name = basename2(dir) || dir.path;
    return { root: dir, workingDirectory: dir, name, description: options3.description };
  });
  if (project) {
    const workTreeUri = extUri.isEqual(primary, project.uri) ? void 0 : primary;
    const label4 = options3.providerLabel ? `${project.displayName} [${options3.providerLabel}]` : project.displayName;
    return {
      uri: project.uri,
      label: label4,
      description: options3.description,
      icon: Codicon.repo,
      group: options3.group,
      folders: [{
        root: project.uri,
        workingDirectory: primary ?? project.uri,
        name: project.displayName,
        description: options3.description,
        gitRepository: { uri: project.uri, workTreeUri, gitHubInfo, ...gitFields }
      }, ...additionalFolders],
      requiresWorkspaceTrust: options3.requiresWorkspaceTrust,
      isVirtualWorkspace: false,
      typeIcon: options3.typeIcon
    };
  }
  if (!primary) {
    return void 0;
  }
  const folderName = basename2(primary) || primary.path;
  const label3 = options3.providerLabel ? `${folderName} [${options3.providerLabel}]` : folderName;
  return {
    uri: primary,
    label: label3,
    description: options3.description,
    icon: options3.fallbackIcon,
    group: options3.group,
    folders: [{
      root: primary,
      workingDirectory: primary,
      name: folderName,
      description: options3.description,
      gitRepository: { uri: primary, workTreeUri: void 0, gitHubInfo, ...gitFields }
    }, ...additionalFolders],
    requiresWorkspaceTrust: options3.requiresWorkspaceTrust,
    isVirtualWorkspace: false,
    typeIcon: options3.typeIcon
  };
}
export { matchesAnyBranchProtectionPattern, readBranchProtectionPatterns, agentHostSessionWorkspaceKey, buildAgentHostSessionWorkspace };
