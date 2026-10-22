// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/plugins/marketplaceReference.ts
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/common/plugins/marketplaceReference.ts
var _githubShorthandRe = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:#.+)?$/;

function readConfiguredMarketplaces(configurationService) {
  const userValues = configurationService.getValue("chat.plugins.marketplaces" /* PluginMarketplaces */) ?? [];
  const extraObj = configurationService.getValue("chat.plugins.extraMarketplaces" /* ExtraMarketplaces */) ?? {};
  const extraValues = Object.entries(extraObj).flatMap(([name, value2]) => {
    if (typeof value2 !== "string") {
      return [];
    }
    const encoded = parseExtraMarketplaceConfigValue(value2);
    const src = encoded?.source ?? value2;
    const autoUpdate = encoded?.autoUpdate;
    const isGithubShorthand = _githubShorthandRe.test(src);
    return [isGithubShorthand ? { name, autoUpdate, source: { source: "github", repo: src } } : { name, autoUpdate, source: { source: "git", url: src } }];
  });
  return {
    userValues,
    extraValues,
    effectiveValues: [...userValues, ...extraValues]
  };
}

function parseExtraMarketplaceConfigValue(value2) {
  try {
    const parsed = JSON.parse(value2);
    return parsed && typeof parsed === "object" && typeof parsed.source === "string" && typeof parsed.autoUpdate === "boolean" ? parsed : void 0;
  } catch {
    return void 0;
  }
}

function parseMarketplaceReferences(values) {
  const byCanonicalId = /* @__PURE__ */ new Map();
  for (const value2 of values) {
    let parsed;
    if (typeof value2 === "string") {
      parsed = parseMarketplaceReference(value2);
    } else if (value2 && typeof value2 === "object") {
      parsed = parseMarketplaceObjectEntry(value2);
    }
    if (parsed) {
      const existing = byCanonicalId.get(parsed.canonicalId);
      if (!existing) {
        byCanonicalId.set(parsed.canonicalId, parsed);
      } else if (parsed.autoUpdate !== void 0) {
        byCanonicalId.set(parsed.canonicalId, { ...existing, autoUpdate: parsed.autoUpdate });
      }
    }
  }
  return [...byCanonicalId.values()];
}

function parseMarketplaceObjectEntry(entry) {
  let sourceType;
  let repo;
  let url;
  let ref;
  if (entry.source && typeof entry.source === "object") {
    const nested = entry.source;
    sourceType = nested.source;
    repo = nested.repo;
    url = nested.url;
    ref = nested.ref;
  } else {
    sourceType = entry.source;
    repo = entry.repo;
    url = entry.url;
    ref = entry.ref;
  }
  let parsed;
  if (sourceType === "github" && typeof repo === "string") {
    parsed = parseMarketplaceReference(appendMarketplaceRef(repo, ref));
  } else if (sourceType === "git" && typeof url === "string") {
    parsed = parseMarketplaceReference(appendMarketplaceRef(url, ref));
  }
  if (parsed && typeof entry.name === "string" && entry.name.length > 0) {
    parsed = { ...parsed, displayLabel: entry.name };
  }
  if (parsed && typeof entry.autoUpdate === "boolean") {
    parsed = { ...parsed, autoUpdate: entry.autoUpdate };
  }
  return parsed;
}

function appendMarketplaceRef(value2, ref) {
  if (!ref) {
    return value2;
  }
  const fragmentIndex = value2.indexOf("#");
  const base = fragmentIndex === -1 ? value2 : value2.slice(0, fragmentIndex);
  return `${base}#${ref}`;
}

function deduplicateMarketplaceReferences(primary, secondary) {
  const byCanonicalId = /* @__PURE__ */ new Map();
  for (const ref of primary) {
    byCanonicalId.set(ref.canonicalId, ref);
  }
  for (const ref of secondary) {
    if (!byCanonicalId.has(ref.canonicalId)) {
      byCanonicalId.set(ref.canonicalId, ref);
    }
  }
  return [...byCanonicalId.values()];
}

function parseMarketplaceReference(value2) {
  const rawValue = value2.trim();
  if (!rawValue) {
    return void 0;
  }
  const uriReference = parseUriMarketplaceReference(rawValue);
  if (uriReference) {
    return uriReference;
  }
  const scpReference = parseScpMarketplaceReference(rawValue);
  if (scpReference) {
    return scpReference;
  }
  const shorthandMatch = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:#(.+))?$/.exec(rawValue);
  if (shorthandMatch) {
    const owner = shorthandMatch[1];
    const repo = shorthandMatch[2];
    const ref = shorthandMatch[3];
    return {
      rawValue,
      displayLabel: rawValue,
      cloneUrl: `https://github.com/${owner}/${repo}.git`,
      canonicalId: getGitHubCanonicalId(owner, repo, ref),
      cacheSegments: ["github.com", owner, repo, ...getRefCacheSegments(ref)],
      kind: "githubShorthand" /* GitHubShorthand */,
      ref,
      githubRepo: `${owner}/${repo}`
    };
  }
  return void 0;
}

function parseUriMarketplaceReference(rawValue) {
  let uri4;
  try {
    uri4 = URI.parse(rawValue);
  } catch {
    return void 0;
  }
  const scheme = uri4.scheme.toLowerCase();
  if (scheme === "file" && /^file:\/\//i.test(rawValue)) {
    if (uri4.fragment) {
      return void 0;
    }
    const localRepositoryUri = URI.file(uri4.fsPath);
    return {
      rawValue,
      displayLabel: localRepositoryUri.fsPath,
      cloneUrl: rawValue,
      canonicalId: `file:${localRepositoryUri.toString().toLowerCase()}`,
      cacheSegments: [],
      kind: "localFileUri" /* LocalFileUri */,
      localRepositoryUri
    };
  }
  if (scheme !== "http" && scheme !== "https" && scheme !== "ssh") {
    return void 0;
  }
  if (!uri4.authority) {
    return void 0;
  }
  const ref = uri4.fragment || void 0;
  const cloneUri = uri4.fragment ? uri4.with({ fragment: "" }) : uri4;
  const sanitizedAuthority = sanitizePathSegment(uri4.authority.toLowerCase());
  const trimmedPath = uri4.path.replace(/\/+/g, "/").replace(/\/+$/g, "").replace(/^\/+/, "");
  if (!trimmedPath) {
    return {
      rawValue,
      displayLabel: rawValue,
      cloneUrl: cloneUri.toString(),
      canonicalId: appendRefSuffix(`git:${uri4.authority.toLowerCase()}/`, ref),
      cacheSegments: [sanitizedAuthority, ...getRefCacheSegments(ref)],
      kind: "gitUri" /* GitUri */,
      ref
    };
  }
  const gitSuffix = ".git";
  const pathHasGitSuffix = trimmedPath.toLowerCase().endsWith(gitSuffix);
  const pathWithoutGit = pathHasGitSuffix ? trimmedPath.slice(0, trimmedPath.length - gitSuffix.length) : trimmedPath;
  const pathSegments = pathWithoutGit.split("/").map(sanitizePathSegment);
  const canonicalPath = pathHasGitSuffix ? trimmedPath.toLowerCase() : `${trimmedPath.toLowerCase()}${gitSuffix}`;
  const githubRepo = extractGitHubRepo(uri4.authority, pathWithoutGit);
  let canonicalId;
  if (githubRepo) {
    const [owner, repo] = githubRepo.split("/");
    canonicalId = getGitHubCanonicalId(owner, repo, ref);
  } else {
    canonicalId = appendRefSuffix(`git:${uri4.authority.toLowerCase()}/${canonicalPath}`, ref);
  }
  return {
    rawValue,
    displayLabel: rawValue,
    cloneUrl: cloneUri.toString(),
    canonicalId,
    cacheSegments: [sanitizedAuthority, ...pathSegments, ...getRefCacheSegments(ref)],
    kind: "gitUri" /* GitUri */,
    ref,
    githubRepo
  };
}

function parseScpMarketplaceReference(rawValue) {
  const match2 = /^([^@\s]+)@([^:\s]+):(.+?\.git)(?:#(.+))?$/i.exec(rawValue);
  if (!match2) {
    return void 0;
  }
  const gitSuffix = ".git";
  const authority = match2[2];
  const pathWithGit = match2[3].replace(/^\/+/, "");
  const ref = match2[4];
  if (!pathWithGit.toLowerCase().endsWith(gitSuffix)) {
    return void 0;
  }
  const pathWithoutGit = pathWithGit.slice(0, -gitSuffix.length);
  const pathSegments = pathWithoutGit.split("/").map(sanitizePathSegment);
  const githubRepo = extractGitHubRepo(authority, pathWithoutGit);
  let canonicalId;
  if (githubRepo) {
    const [owner, repo] = githubRepo.split("/");
    canonicalId = getGitHubCanonicalId(owner, repo, ref);
  } else {
    canonicalId = appendRefSuffix(`git:${authority.toLowerCase()}/${pathWithGit.toLowerCase()}`, ref);
  }
  return {
    rawValue,
    displayLabel: rawValue,
    cloneUrl: `${match2[1]}@${authority}:${pathWithGit}`,
    canonicalId,
    cacheSegments: [sanitizePathSegment(authority.toLowerCase()), ...pathSegments, ...getRefCacheSegments(ref)],
    kind: "gitUri" /* GitUri */,
    ref,
    githubRepo
  };
}

function extractGitHubRepo(authority, pathWithoutGit) {
  if (authority.toLowerCase() !== "github.com") {
    return void 0;
  }
  const parts = pathWithoutGit.split("/");
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0]}/${parts[1]}`;
  }
  return void 0;
}

function getGitHubCanonicalId(owner, repo, ref) {
  return appendRefSuffix(`github:${owner.toLowerCase()}/${repo.toLowerCase()}`, ref);
}

function appendRefSuffix(canonicalId, ref) {
  return ref ? `${canonicalId}#${encodeURIComponent(ref)}` : canonicalId;
}

function getRefCacheSegments(ref) {
  return ref ? [`ref_${encodeURIComponent(ref)}`] : [];
}

function sanitizePathSegment(value2) {
  return value2.replace(/[\\/:*?"<>|]/g, "_");
}
export { readConfiguredMarketplaces, parseExtraMarketplaceConfigValue, parseMarketplaceReferences, parseMarketplaceObjectEntry, appendMarketplaceRef, deduplicateMarketplaceReferences, parseMarketplaceReference, parseUriMarketplaceReference, parseScpMarketplaceReference, extractGitHubRepo, getGitHubCanonicalId, appendRefSuffix, getRefCacheSegments, sanitizePathSegment, _githubShorthandRe };
