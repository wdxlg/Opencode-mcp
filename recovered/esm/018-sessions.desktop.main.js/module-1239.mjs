// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/url/common/trustedDomains.ts
import { URI } from "./module-0032.mjs";
import { testUrlMatchesGlob } from "./module-1238.mjs";


// src/vs/platform/url/common/trustedDomains.ts
function isURLDomainTrusted(url, trustedDomains) {
  url = URI.parse(normalizeURL2(url.toString(true).replace(/\\/g, "/")));
  trustedDomains = trustedDomains.map((domain) => normalizeURL2(domain.replace(/\\/g, "/")));
  if (isLocalhostAuthority(url.authority)) {
    return true;
  }
  for (let i2 = 0; i2 < trustedDomains.length; i2++) {
    if (trustedDomains[i2] === "*") {
      return true;
    }
    if (testUrlMatchesGlob(url, trustedDomains[i2])) {
      return true;
    }
  }
  return false;
}

function normalizeURL2(url) {
  const caseInsensitiveAuthorities = ["github.com"];
  try {
    const parsed = typeof url === "string" ? URI.parse(url, true) : url;
    if (caseInsensitiveAuthorities.includes(parsed.authority)) {
      return parsed.with({ path: parsed.path.toLowerCase() }).toString(true);
    } else {
      return parsed.toString(true);
    }
  } catch {
    return url.toString();
  }
}

var rLocalhost = /^(.+\.)?localhost(:\d+)?$/i;

var r127 = /^127\.0\.0\.1(:\d+)?$/;

var rIPv6Localhost = /^(\[::1\]|\[0:0:0:0:0:0:0:1\])(:\d+)?$/;

function isLocalhostAuthority(authority) {
  return rLocalhost.test(authority) || r127.test(authority) || rIPv6Localhost.test(authority);
}

var r0000 = /^0\.0\.0\.0(:\d+)?$/;

var rIPv6AllInterfaces = /^(\[::\]|\[0:0:0:0:0:0:0:0\])(:\d+)?$/;

function isAllInterfacesAuthority(authority) {
  return r0000.test(authority) || rIPv6AllInterfaces.test(authority);
}
export { isURLDomainTrusted, normalizeURL2, isLocalhostAuthority, isAllInterfacesAuthority, rLocalhost, r127, rIPv6Localhost, r0000, rIPv6AllInterfaces };
