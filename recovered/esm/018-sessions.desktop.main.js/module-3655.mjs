// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/git/common/utils.ts
import { equalsIgnoreCase } from "./module-0030.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/git/common/utils.ts
var DEFAULT_GITHUB_HOSTS = ["github.com", "www.github.com"];

function getGitHubRemoteInfo(repositoryState, supportedHosts = DEFAULT_GITHUB_HOSTS) {
  for (const remote of getOrderedRemotes(repositoryState)) {
    if (remote.fetchUrl) {
      const repository = getGitHubRepositoryFromRemoteUrl(remote.fetchUrl, supportedHosts);
      if (repository) {
        return repository;
      }
    }
  }
  return void 0;
}

function getGitHubRepositoryFromRemoteUrl(remoteUrl, supportedHosts = DEFAULT_GITHUB_HOSTS) {
  const remote = parseRemoteUrl(remoteUrl);
  if (!remote) {
    return void 0;
  }
  const host = equalsIgnoreCase(remote.scheme, "ssh") ? remote.host : remote.rawHost;
  if (!supportedHosts.map(normalizeHost).some((supportedHost) => equalsIgnoreCase(host, supportedHost))) {
    return void 0;
  }
  const segments = remote.path.replace(/^\/+/, "").replace(/\/+$/, "").replace(/\.git$/i, "").split("/");
  return segments.length === 2 && segments[0] && segments[1] ? { owner: segments[0], repo: segments[1] } : void 0;
}

function normalizeHost(host) {
  return host.trim().replace(/:\d+$/, "");
}

function getOrderedRemotes(repositoryState) {
  if (repositoryState.remotes.length < 2) {
    return repositoryState.remotes;
  }
  const remotes = /* @__PURE__ */ new Map();
  const remoteIndex = repositoryState.remotes.findIndex((r2) => r2.name === repositoryState.HEAD?.upstream?.remote);
  if (remoteIndex !== -1) {
    const fetchUrl = repositoryState.remotes[remoteIndex].fetchUrl;
    if (fetchUrl) {
      remotes.set(repositoryState.remotes[remoteIndex].name, repositoryState.remotes[remoteIndex]);
    }
  }
  const originIndex = repositoryState.remotes.findIndex((r2) => r2.name === "origin");
  if (originIndex !== -1) {
    const fetchUrl = repositoryState.remotes[originIndex].fetchUrl;
    if (fetchUrl) {
      remotes.set(repositoryState.remotes[originIndex].name, repositoryState.remotes[originIndex]);
    }
  }
  for (const remote of repositoryState.remotes) {
    if (!remotes.has(remote.name)) {
      remotes.set(remote.name, remote);
    }
  }
  return Array.from(remotes.values());
}

function parseRemoteUrl(fetchUrl) {
  fetchUrl = fetchUrl.trim();
  try {
    if (/^[\w\d\-]+@/i.test(fetchUrl)) {
      const parts = fetchUrl.split(":");
      if (parts.length !== 2) {
        return void 0;
      }
      fetchUrl = "ssh://" + parts[0] + "/" + parts[1];
    }
    const repoUrl = URI.parse(fetchUrl);
    const authority = repoUrl.authority;
    const path = repoUrl.path;
    if (!(equalsIgnoreCase(repoUrl.scheme, "ssh") || equalsIgnoreCase(repoUrl.scheme, "https") || equalsIgnoreCase(repoUrl.scheme, "http"))) {
      return;
    }
    const splitAuthority = authority.split("@");
    if (splitAuthority.length > 2) {
      return void 0;
    }
    const extractedHost = splitAuthority.at(-1);
    if (!extractedHost) {
      return;
    }
    const rawHost = extractedHost.toLowerCase().replace(/:\d+$/, "");
    const normalizedHost = rawHost.replace(/^[\w\-]+-/, "").replace(/-[\w\-]+$/, "");
    return { scheme: repoUrl.scheme, host: normalizedHost, rawHost, path };
  } catch (err) {
    return void 0;
  }
}
export { getGitHubRemoteInfo, getGitHubRepositoryFromRemoteUrl, normalizeHost, getOrderedRemotes, parseRemoteUrl, DEFAULT_GITHUB_HOSTS };
