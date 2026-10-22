// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/oauth.ts



// src/vs/base/common/oauth.ts
var WELL_KNOWN_ROUTE = "/.well-known";

var AUTH_PROTECTED_RESOURCE_METADATA_DISCOVERY_PATH = `${WELL_KNOWN_ROUTE}/oauth-protected-resource`;

var AUTH_SERVER_METADATA_DISCOVERY_PATH = `${WELL_KNOWN_ROUTE}/oauth-authorization-server`;

var OPENID_CONNECT_DISCOVERY_PATH = `${WELL_KNOWN_ROUTE}/openid-configuration`;

var urisToCheck = [
  "issuer",
  "authorization_endpoint",
  "token_endpoint",
  "registration_endpoint",
  "jwks_uri"
];

function isAuthorizationServerMetadata(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const metadata = obj;
  if (!metadata.issuer) {
    throw new Error("Authorization server metadata must have an issuer");
  }
  for (const uri4 of urisToCheck) {
    if (!metadata[uri4]) {
      continue;
    }
    if (typeof metadata[uri4] !== "string") {
      throw new Error(`Authorization server metadata '${uri4}' must be a string`);
    }
    if (!metadata[uri4].startsWith("https://") && !metadata[uri4].startsWith("http://")) {
      throw new Error(`Authorization server metadata '${uri4}' must start with http:// or https://`);
    }
  }
  return true;
}

function isAuthorizationTokenResponse(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const response = obj;
  return response.access_token !== void 0 && response.token_type !== void 0;
}

function parseWWWAuthenticateHeader(wwwAuthenticateHeaderValue) {
  const challenges = [];
  const tokens = [];
  let current = "";
  let inQuotes = false;
  for (let i2 = 0; i2 < wwwAuthenticateHeaderValue.length; i2++) {
    const char = wwwAuthenticateHeaderValue[i2];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === "," && !inQuotes) {
      if (current.trim()) {
        tokens.push(current.trim());
      }
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    tokens.push(current.trim());
  }
  let currentChallenge;
  for (const token of tokens) {
    const hasEquals = token.includes("=");
    if (!hasEquals) {
      if (currentChallenge) {
        challenges.push(currentChallenge);
      }
      currentChallenge = { scheme: token.trim(), params: {} };
    } else {
      const spaceIndex = token.indexOf(" ");
      if (spaceIndex > 0) {
        const beforeSpace = token.substring(0, spaceIndex);
        const afterSpace = token.substring(spaceIndex + 1);
        if (!beforeSpace.includes("=") && afterSpace.includes("=")) {
          if (currentChallenge) {
            challenges.push(currentChallenge);
          }
          currentChallenge = { scheme: beforeSpace.trim(), params: {} };
          const equalIndex = afterSpace.indexOf("=");
          if (equalIndex > 0) {
            const key3 = afterSpace.substring(0, equalIndex).trim();
            const value2 = afterSpace.substring(equalIndex + 1).trim().replace(/^"|"$/g, "");
            if (key3 && value2 !== void 0) {
              currentChallenge.params[key3] = value2;
            }
          }
          continue;
        }
      }
      if (currentChallenge) {
        const equalIndex = token.indexOf("=");
        if (equalIndex > 0) {
          const key3 = token.substring(0, equalIndex).trim();
          const value2 = token.substring(equalIndex + 1).trim().replace(/^"|"$/g, "");
          if (key3 && value2 !== void 0) {
            currentChallenge.params[key3] = value2;
          }
        }
      }
    }
  }
  if (currentChallenge) {
    challenges.push(currentChallenge);
  }
  return challenges;
}

function scopesMatch(scopes1, scopes2) {
  if (scopes1 === scopes2) {
    return true;
  }
  if (!scopes1 || !scopes2) {
    return false;
  }
  if (scopes1.length !== scopes2.length) {
    return false;
  }
  const sortedScopes1 = [...scopes1].sort();
  const sortedScopes2 = [...scopes2].sort();
  return sortedScopes1.every((scope, index2) => scope === sortedScopes2[index2]);
}

async function tryParseAuthServerMetadata(response) {
  if (response.status !== 200) {
    return void 0;
  }
  try {
    const body = await response.json();
    if (isAuthorizationServerMetadata(body)) {
      return body;
    }
  } catch {
  }
  return void 0;
}

async function getErrText(res) {
  try {
    return await res.text();
  } catch {
    return res.statusText;
  }
}

async function fetchAuthorizationServerMetadata(authorizationServer, options3 = {}) {
  const {
    additionalHeaders = {},
    fetch: fetchImpl = fetch
  } = options3;
  const authorizationServerUrl = new URL(authorizationServer);
  const extraPath = authorizationServerUrl.pathname === "/" ? "" : authorizationServerUrl.pathname;
  const errors = [];
  const doFetch = async (url) => {
    try {
      const rawResponse = await fetchImpl(url, {
        method: "GET",
        headers: {
          ...additionalHeaders,
          "Accept": "application/json"
        }
      });
      const metadata2 = await tryParseAuthServerMetadata(rawResponse);
      if (metadata2) {
        return metadata2;
      }
      errors.push(new Error(`Failed to fetch authorization server metadata from ${url}: ${rawResponse.status} ${await getErrText(rawResponse)}`));
      return void 0;
    } catch (e4) {
      errors.push(e4 instanceof Error ? e4 : new Error(String(e4)));
      return void 0;
    }
  };
  const pathToFetch = new URL(AUTH_SERVER_METADATA_DISCOVERY_PATH, authorizationServer).toString() + extraPath;
  let metadata = await doFetch(pathToFetch);
  if (metadata) {
    return { metadata, discoveryUrl: pathToFetch, errors };
  }
  const openidPathInsertionUrl = new URL(OPENID_CONNECT_DISCOVERY_PATH, authorizationServer).toString() + extraPath;
  metadata = await doFetch(openidPathInsertionUrl);
  if (metadata) {
    return { metadata, discoveryUrl: openidPathInsertionUrl, errors };
  }
  const openidPathAdditionUrl = authorizationServer.endsWith("/") ? authorizationServer + OPENID_CONNECT_DISCOVERY_PATH.substring(1) : authorizationServer + OPENID_CONNECT_DISCOVERY_PATH;
  metadata = await doFetch(openidPathAdditionUrl);
  if (metadata) {
    return { metadata, discoveryUrl: openidPathAdditionUrl, errors };
  }
  if (errors.length === 1) {
    throw errors[0];
  } else {
    throw new AggregateError(errors, "Failed to fetch authorization server metadata from all attempted URLs");
  }
}
export { isAuthorizationServerMetadata, isAuthorizationTokenResponse, parseWWWAuthenticateHeader, scopesMatch, tryParseAuthServerMetadata, getErrText, fetchAuthorizationServerMetadata, WELL_KNOWN_ROUTE, AUTH_PROTECTED_RESOURCE_METADATA_DISCOVERY_PATH, AUTH_SERVER_METADATA_DISCOVERY_PATH, OPENID_CONNECT_DISCOVERY_PATH, urisToCheck };
