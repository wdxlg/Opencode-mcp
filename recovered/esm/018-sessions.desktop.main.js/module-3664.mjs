// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostSessionArtifacts.ts
import { URI } from "./module-0032.mjs";
import { parseGitHubPullRequestUrl } from "./module-3606.mjs";
import { parseGitHubIssueUrl } from "./module-3659.mjs";
import { readSessionArtifacts } from "./module-3663.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostSessionArtifacts.ts
var kindByType = /* @__PURE__ */ new Map([
  ["pullRequest" /* PullRequest */, "pullRequest" /* PullRequest */],
  ["issue" /* Issue */, "issue" /* Issue */],
  ["commit" /* Commit */, "commit" /* Commit */],
  ["website" /* Website */, "website" /* Website */],
  ["file" /* File */, "file" /* File */],
  ["resource" /* Resource */, "resource" /* Resource */]
]);

function parseUri(value2) {
  if (!value2) {
    return void 0;
  }
  try {
    return URI.parse(value2, true);
  } catch {
    return void 0;
  }
}

function toSessionArtifact(artifact) {
  const kind = kindByType.get(artifact.type);
  if (!kind) {
    return void 0;
  }
  const link2 = parseUri(artifact.link);
  const uri4 = parseUri(artifact.uri);
  if (!link2 && !uri4 && !artifact.commitHash) {
    return void 0;
  }
  return {
    id: artifact.id,
    kind,
    label: artifact.label,
    isArtifact: artifact.isArtifact,
    ...link2 ? { link: link2 } : {},
    ...uri4 ? { uri: uri4 } : {},
    ...artifact.commitHash ? { commitHash: artifact.commitHash } : {},
    ...artifact.isGitHub !== void 0 ? { isGitHub: artifact.isGitHub } : {}
  };
}

function linkKey(link2) {
  return link2.replace(/\/+$/, "").toLowerCase();
}

function getPresentedArtifacts(partition, surfacedLinks) {
  return partition.entries.filter((entry) => !entry.gitHubLink || !surfacedLinks.has(linkKey(entry.gitHubLink))).map((entry) => entry.artifact);
}

function gitHubLink(artifact) {
  if (artifact.isGitHub !== true || !artifact.link) {
    return void 0;
  }
  if (artifact.type === "pullRequest" /* PullRequest */) {
    return parseGitHubPullRequestUrl(artifact.link) ? artifact.link : void 0;
  }
  if (artifact.type === "issue" /* Issue */) {
    return parseGitHubIssueUrl(artifact.link) ? artifact.link : void 0;
  }
  return void 0;
}

function partitionSessionArtifacts(meta) {
  const entries2 = [];
  const pullRequestUrls = [];
  const pullRequestTitles = /* @__PURE__ */ new Map();
  const issueUrls = [];
  for (const artifact of readSessionArtifacts(meta)) {
    const mapped = toSessionArtifact(artifact);
    if (!mapped) {
      continue;
    }
    const link2 = gitHubLink(artifact);
    entries2.push(link2 ? { artifact: mapped, gitHubLink: link2 } : { artifact: mapped });
    if (!link2 || !artifact.isArtifact) {
      continue;
    }
    if (artifact.type === "issue" /* Issue */) {
      issueUrls.push(link2);
      continue;
    }
    const key3 = linkKey(link2);
    if (mapped.label && !pullRequestTitles.has(key3)) {
      pullRequestTitles.set(key3, mapped.label);
    }
    pullRequestUrls.push(link2);
  }
  return { entries: entries2, pullRequestUrls, pullRequestTitles, issueUrls };
}

function dedupeLinks(...groups) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const group2 of groups) {
    for (const link2 of group2 ?? []) {
      const key3 = link2.replace(/\/+$/, "").toLowerCase();
      if (!seen.has(key3)) {
        seen.add(key3);
        result.push(link2);
      }
    }
  }
  return result;
}
export { parseUri, toSessionArtifact, linkKey, getPresentedArtifacts, gitHubLink, partitionSessionArtifacts, dedupeLinks, kindByType };
