// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/extensionManagement/common/configRemotes.ts
import { URI } from "./module-0032.mjs";


// src/vs/platform/extensionManagement/common/configRemotes.ts
var SshProtocolMatcher = /^([^@:]+@)?([^:]+):/;

var SshUrlMatcher = /^([^@:]+@)?([^:]+):(.+)$/;

var AuthorityMatcher = /^([^@]+@)?([^:]+)(:\d+)?$/;

var SecondLevelDomainMatcher = /([^@:.]+\.[^@:.]+)(:\d+)?$/;

var RemoteMatcher2 = /^\s*url\s*=\s*(.+\S)\s*$/mg;

var AnyButDot = /[^.]/g;

var AllowedSecondLevelDomains = [
  "github.com",
  "bitbucket.org",
  "visualstudio.com",
  "gitlab.com",
  "heroku.com",
  "azurewebsites.net",
  "ibm.com",
  "amazon.com",
  "amazonaws.com",
  "cloudapp.net",
  "rhcloud.com",
  "google.com",
  "azure.com"
];

function stripLowLevelDomains(domain) {
  const match2 = domain.match(SecondLevelDomainMatcher);
  return match2 ? match2[1] : null;
}

function extractDomain(url) {
  if (url.indexOf("://") === -1) {
    const match2 = url.match(SshProtocolMatcher);
    if (match2) {
      return stripLowLevelDomains(match2[2]);
    } else {
      return null;
    }
  }
  try {
    const uri5 = URI.parse(url);
    if (uri5.authority) {
      return stripLowLevelDomains(uri5.authority);
    }
  } catch (e) {
  }
  return null;
}

function getDomainsOfRemotes(text2, allowedDomains) {
  const domains = /* @__PURE__ */ new Set();
  let match2;
  while (match2 = RemoteMatcher2.exec(text2)) {
    const domain = extractDomain(match2[1]);
    if (domain) {
      domains.add(domain);
    }
  }
  const allowedDomainsSet = new Set(allowedDomains);
  return Array.from(domains).map((key3) => allowedDomainsSet.has(key3) ? key3 : key3.replace(AnyButDot, "a"));
}

function stripPort(authority) {
  const match2 = authority.match(AuthorityMatcher);
  return match2 ? match2[2] : null;
}

function normalizeRemote(host, path, stripEndingDotGit) {
  if (host && path) {
    if (stripEndingDotGit && path.endsWith(".git")) {
      path = path.substr(0, path.length - 4);
    }
    return path.indexOf("/") === 0 ? `${host}${path}` : `${host}/${path}`;
  }
  return null;
}

function extractRemote(url, stripEndingDotGit) {
  if (url.indexOf("://") === -1) {
    const match2 = url.match(SshUrlMatcher);
    if (match2) {
      return normalizeRemote(match2[2], match2[3], stripEndingDotGit);
    }
  }
  try {
    const uri5 = URI.parse(url);
    if (uri5.authority) {
      return normalizeRemote(stripPort(uri5.authority), uri5.path, stripEndingDotGit);
    }
  } catch (e) {
  }
  return null;
}

function getRemotes(text2, stripEndingDotGit = false) {
  const remotes = [];
  let match2;
  while (match2 = RemoteMatcher2.exec(text2)) {
    const remote = extractRemote(match2[1], stripEndingDotGit);
    if (remote) {
      remotes.push(remote);
    }
  }
  return remotes;
}
export { stripLowLevelDomains, extractDomain, getDomainsOfRemotes, stripPort, normalizeRemote, extractRemote, getRemotes, SshProtocolMatcher, SshUrlMatcher, AuthorityMatcher, SecondLevelDomainMatcher, RemoteMatcher2, AnyButDot, AllowedSecondLevelDomains };
