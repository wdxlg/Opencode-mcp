// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/githubEndpoints.ts
import { URI } from "./module-0032.mjs";


// src/vs/platform/agentHost/common/githubEndpoints.ts
var GITHUB_DOT_COM_COPILOT_API_BASE_URI = "https://api.githubcopilot.com";

var GITHUB_DOT_COM_ENDPOINTS = {
  apiBaseUri: "https://api.github.com",
  graphQlUri: "https://api.github.com/graphql",
  oauthServer: "https://github.com/login/oauth",
  enterpriseHost: void 0
};

function deriveGitHubEndpoints(enterpriseUri) {
  if (!enterpriseUri) {
    return GITHUB_DOT_COM_ENDPOINTS;
  }
  let uri4;
  try {
    uri4 = URI.parse(enterpriseUri);
  } catch {
    return GITHUB_DOT_COM_ENDPOINTS;
  }
  const authority = uri4.authority;
  if (!authority) {
    return GITHUB_DOT_COM_ENDPOINTS;
  }
  if (authority === "github.com" || authority === "www.github.com" || authority === "api.github.com") {
    return GITHUB_DOT_COM_ENDPOINTS;
  }
  const scheme = uri4.scheme || "https";
  const isCloud = /\.ghe\.com$/.test(authority);
  return {
    apiBaseUri: isCloud ? `${scheme}://api.${authority}` : `${scheme}://${authority}/api/v3`,
    graphQlUri: isCloud ? `${scheme}://api.${authority}/graphql` : `${scheme}://${authority}/api/graphql`,
    oauthServer: `${scheme}://${authority}/login/oauth`,
    enterpriseHost: authority
  };
}
export { deriveGitHubEndpoints, GITHUB_DOT_COM_COPILOT_API_BASE_URI, GITHUB_DOT_COM_ENDPOINTS };
