// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/onboardingTours/browser/gitHubRepositoryResolver.ts
import { getGitHubRepositoryFromRemoteUrl } from "./module-3655.mjs";
import { dirname2, isEqual2, joinPath } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { toFileOperationResult } from "./module-0269.mjs";


// src/vs/sessions/contrib/onboardingTours/browser/gitHubRepositoryResolver.ts
var MAX_PARENT_LOOKUPS = 50;

async function resolveGitHubRepositoryFromGitConfig(fileService, workspaceUri, supportedHosts) {
  const configUri = await findGitConfig(fileService, workspaceUri);
  if (!configUri) {
    return void 0;
  }
  const content = await readFileIfExists(fileService, configUri);
  return content ? parseGitHubRepositoryFromGitConfig(content, supportedHosts) : void 0;
}

function parseGitHubRepositoryFromGitConfig(content, supportedHosts) {
  const remotes = [];
  let remoteName;
  for (const line of content.split(/\r?\n/)) {
    const section = /^\s*\[\s*remote\s+"([^"]+)"\s*\]\s*$/i.exec(line);
    if (section) {
      remoteName = section[1];
      continue;
    }
    if (/^\s*\[/.test(line)) {
      remoteName = void 0;
      continue;
    }
    const url = remoteName ? /^\s*url\s*=\s*(.+?)\s*$/i.exec(line)?.[1] : void 0;
    if (url && remoteName) {
      remotes.push({ name: remoteName, url: stripQuotes(url) });
    }
  }
  remotes.sort((a, b) => Number(b.name === "origin") - Number(a.name === "origin"));
  for (const remote of remotes) {
    const repository = getGitHubRepositoryFromRemoteUrl(remote.url, supportedHosts);
    if (repository) {
      return repository;
    }
  }
  return void 0;
}

async function findGitConfig(fileService, workspaceUri) {
  let current = workspaceUri;
  for (let i2 = 0; i2 < MAX_PARENT_LOOKUPS; i2++) {
    const dotGit = joinPath(current, ".git");
    const stat = await statIfExists(fileService, dotGit);
    if (stat) {
      if (stat.isDirectory) {
        return joinPath(dotGit, "config");
      }
      const dotGitContent = await readFileIfExists(fileService, dotGit);
      const gitDirPath = dotGitContent ? /^\s*gitdir:\s*(.+?)\s*$/im.exec(dotGitContent)?.[1] : void 0;
      if (gitDirPath) {
        const gitDir = resolveGitPath(current, gitDirPath);
        const commonDirPath = await readFileIfExists(fileService, joinPath(gitDir, "commondir"));
        const configRoot = commonDirPath ? resolveGitPath(gitDir, commonDirPath.trim()) : gitDir;
        return joinPath(configRoot, "config");
      }
    }
    const parent = dirname2(current);
    if (isEqual2(parent, current)) {
      break;
    }
    current = parent;
  }
  return void 0;
}

function resolveGitPath(base, value2) {
  const path = value2.trim();
  if (/^[a-zA-Z]:[\\/]/.test(path)) {
    return URI.file(path);
  }
  const normalizedPath = path.replace(/\\/g, "/");
  if (normalizedPath.startsWith("/")) {
    return base.scheme === Schemas.file ? URI.file(path) : base.with({ path: normalizedPath });
  }
  return joinPath(base, normalizedPath);
}

async function statIfExists(fileService, resource) {
  try {
    return await fileService.stat(resource);
  } catch (error) {
    if (toFileOperationResult(error) === 1 /* FILE_NOT_FOUND */) {
      return void 0;
    }
    throw error;
  }
}

async function readFileIfExists(fileService, resource) {
  try {
    return (await fileService.readFile(resource)).value.toString();
  } catch (error) {
    if (toFileOperationResult(error) === 1 /* FILE_NOT_FOUND */) {
      return void 0;
    }
    throw error;
  }
}

function stripQuotes(value2) {
  return value2.length >= 2 && value2.startsWith('"') && value2.endsWith('"') ? value2.slice(1, -1) : value2;
}
export { resolveGitHubRepositoryFromGitConfig, parseGitHubRepositoryFromGitConfig, findGitConfig, resolveGitPath, statIfExists, readFileIfExists, stripQuotes, MAX_PARENT_LOOKUPS };
