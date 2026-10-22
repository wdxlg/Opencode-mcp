// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/common/oauth.ts



// src/vs/base/common/oauth.ts
var WELL_KNOWN_ROUTE = "/.well-known";

var AUTH_PROTECTED_RESOURCE_METADATA_DISCOVERY_PATH = `${WELL_KNOWN_ROUTE}/oauth-protected-resource`;

var AUTH_SERVER_METADATA_DISCOVERY_PATH = `${WELL_KNOWN_ROUTE}/oauth-authorization-server`;

var OPENID_CONNECT_DISCOVERY_PATH = `${WELL_KNOWN_ROUTE}/openid-configuration`;

function isAuthorizationProtectedResourceMetadata(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const metadata = obj;
  if (!metadata.resource) {
    return false;
  }
  if (metadata.scopes_supported !== void 0 && !Array.isArray(metadata.scopes_supported)) {
    return false;
  }
  return true;
}

async function fetchResourceMetadata(targetResource, resourceMetadataUrl, options = {}) {
  const {
    sameOriginHeaders = {},
    fetch: fetchImpl = fetch
  } = options;
  const targetResourceUrlObj = new URL(targetResource);
  const fetchPrm = async (prmUrl, validateUrl) => {
    let headers = {
      "Accept": "application/json"
    };
    const resourceMetadataUrlObj = new URL(prmUrl);
    if (resourceMetadataUrlObj.origin === targetResourceUrlObj.origin) {
      headers = {
        ...headers,
        ...sameOriginHeaders
      };
    }
    const response = await fetchImpl(prmUrl, { method: "GET", headers });
    if (response.status !== 200) {
      let errorText;
      try {
        errorText = await response.text();
      } catch {
        errorText = response.statusText;
      }
      throw new Error(`Failed to fetch resource metadata from ${prmUrl}: ${response.status} ${errorText}`);
    }
    const body = await response.json();
    if (isAuthorizationProtectedResourceMetadata(body)) {
      const prmValue = new URL(body.resource).toString();
      const expectedResource = new URL(validateUrl).toString();
      if (prmValue !== expectedResource) {
        throw new Error(`Protected Resource Metadata 'resource' property value "${prmValue}" does not match expected value "${expectedResource}" for URL ${prmUrl}. Per RFC 9728, these MUST match. See https://datatracker.ietf.org/doc/html/rfc9728#PRConfigurationValidation`);
      }
      return body;
    } else {
      throw new Error(`Invalid resource metadata from ${prmUrl}. Expected to follow shape of https://datatracker.ietf.org/doc/html/rfc9728#name-protected-resource-metadata (Hints: is scopes_supported an array? Is resource a string?). Current payload: ${JSON.stringify(body)}`);
    }
  };
  const errors = [];
  if (resourceMetadataUrl) {
    try {
      const metadata = await fetchPrm(resourceMetadataUrl, targetResource);
      return { metadata, discoveryUrl: resourceMetadataUrl, errors };
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }
  const hasPathComponent = targetResourceUrlObj.pathname !== "/";
  const rootUrl = `${targetResourceUrlObj.origin}${AUTH_PROTECTED_RESOURCE_METADATA_DISCOVERY_PATH}`;
  if (hasPathComponent) {
    const pathAppendedUrl = `${rootUrl}${targetResourceUrlObj.pathname}`;
    try {
      const metadata = await fetchPrm(pathAppendedUrl, targetResource);
      return { metadata, discoveryUrl: pathAppendedUrl, errors };
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }
  try {
    const metadata = await fetchPrm(rootUrl, targetResourceUrlObj.origin);
    return { metadata, discoveryUrl: rootUrl, errors };
  } catch (e) {
    errors.push(e instanceof Error ? e : new Error(String(e)));
  }
  if (errors.length === 1) {
    throw errors[0];
  } else {
    throw new AggregateError(errors, "Failed to fetch resource metadata from all attempted URLs");
  }
}
export { isAuthorizationProtectedResourceMetadata, fetchResourceMetadata, WELL_KNOWN_ROUTE, AUTH_PROTECTED_RESOURCE_METADATA_DISCOVERY_PATH, AUTH_SERVER_METADATA_DISCOVERY_PATH, OPENID_CONNECT_DISCOVERY_PATH };
