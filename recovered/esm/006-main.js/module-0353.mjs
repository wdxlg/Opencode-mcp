// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/url/common/trustedDomains.ts
import { URI, init_uri } from "./module-0030.mjs";
import { init_urlGlob, testUrlMatchesGlob } from "./module-0352.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/url/common/trustedDomains.ts
function isURLDomainTrusted(url, trustedDomains) {
  url = URI.parse(normalizeURL2(url.toString(true).replace(/\\/g, "/")));
  trustedDomains = trustedDomains.map((domain) => normalizeURL2(domain.replace(/\\/g, "/")));
  if (isLocalhostAuthority(url.authority)) {
    return true;
  }
  for (let i = 0; i < trustedDomains.length; i++) {
    if (trustedDomains[i] === "*") {
      return true;
    }
    if (testUrlMatchesGlob(url, trustedDomains[i])) {
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

function isLocalhostAuthority(authority) {
  return rLocalhost.test(authority) || r127.test(authority) || rIPv6Localhost.test(authority);
}

var rLocalhost, r127, rIPv6Localhost;

var init_trustedDomains = __esm({
  "src/vs/platform/url/common/trustedDomains.ts"() {
    init_uri();
    init_urlGlob();
    rLocalhost = /^(.+\.)?localhost(:\d+)?$/i;
    r127 = /^127\.0\.0\.1(:\d+)?$/;
    rIPv6Localhost = /^(\[::1\]|\[0:0:0:0:0:0:0:1\])(:\d+)?$/;
  }
});
export { isURLDomainTrusted, normalizeURL2, isLocalhostAuthority, rLocalhost, r127, rIPv6Localhost, init_trustedDomains };
