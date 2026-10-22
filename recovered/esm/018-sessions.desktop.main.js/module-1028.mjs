// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/plugins/strictKnownMarketplaces.ts
import { parseMarketplaceReference } from "./module-1026.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/common/plugins/strictKnownMarketplaces.ts
function getStrictKnownMarketplaces(value2) {
  if (!Array.isArray(value2)) {
    return void 0;
  }
  return value2.filter((entry) => typeof entry === "object" && entry !== null && typeof entry.source === "string");
}

function isMarketplaceReferenceAllowed(allowlist, ref) {
  if (allowlist === void 0) {
    return true;
  }
  if (allowlist.length === 0) {
    return false;
  }
  return allowlist.some((entry) => matchesAllowlistEntry(entry, ref));
}

function matchesAllowlistEntry(entry, ref) {
  switch (entry.source) {
    case "github": {
      if (typeof entry.repo !== "string" || entry.path !== void 0) {
        return false;
      }
      const candidate = parseMarketplaceReference(appendRef(entry.repo, entry.ref));
      return !!candidate && candidate.canonicalId === ref.canonicalId;
    }
    case "git": {
      if (typeof entry.url !== "string" || entry.path !== void 0) {
        return false;
      }
      const candidate = parseMarketplaceReference(appendRef(entry.url, entry.ref));
      return !!candidate && candidate.canonicalId === ref.canonicalId;
    }
    case "url": {
      if (typeof entry.url !== "string") {
        return false;
      }
      const candidate = parseMarketplaceReference(appendRef(entry.url, entry.ref));
      return !!candidate && candidate.canonicalId === ref.canonicalId;
    }
    case "npm": {
      return false;
    }
    case "file":
    case "directory": {
      if (ref.kind !== "localFileUri" /* LocalFileUri */ || !ref.localRepositoryUri || typeof entry.path !== "string") {
        return false;
      }
      return isEqual2(ref.localRepositoryUri, URI.file(entry.path));
    }
    case "hostPattern": {
      if (typeof entry.hostPattern !== "string") {
        return false;
      }
      const host = extractHost(ref);
      return !!host && testPattern(entry.hostPattern, host);
    }
    case "pathPattern": {
      if (typeof entry.pathPattern !== "string" || ref.kind !== "localFileUri" /* LocalFileUri */ || !ref.localRepositoryUri) {
        return false;
      }
      return testPattern(entry.pathPattern, ref.localRepositoryUri.fsPath);
    }
    default:
      return false;
  }
}

function appendRef(value2, ref) {
  if (!ref) {
    return value2;
  }
  const fragmentIndex = value2.indexOf("#");
  const base = fragmentIndex === -1 ? value2 : value2.slice(0, fragmentIndex);
  return `${base}#${ref}`;
}

function extractHost(ref) {
  if (ref.kind === "githubShorthand" /* GitHubShorthand */) {
    return "github.com";
  }
  if (ref.kind !== "gitUri" /* GitUri */) {
    return void 0;
  }
  const scpMatch = /^[\w._-]+@([\w.-]+):/.exec(ref.cloneUrl);
  if (scpMatch) {
    return scpMatch[1].toLowerCase();
  }
  try {
    let authority = URI.parse(ref.cloneUrl).authority.toLowerCase();
    const at = authority.lastIndexOf("@");
    if (at !== -1) {
      authority = authority.slice(at + 1);
    }
    const colon = authority.indexOf(":");
    if (colon !== -1) {
      authority = authority.slice(0, colon);
    }
    return authority || void 0;
  } catch {
    return void 0;
  }
}

function testPattern(pattern, value2) {
  try {
    return new RegExp(pattern).test(value2);
  } catch {
    return false;
  }
}
export { getStrictKnownMarketplaces, isMarketplaceReferenceAllowed, matchesAllowlistEntry, appendRef, extractHost, testPattern };
