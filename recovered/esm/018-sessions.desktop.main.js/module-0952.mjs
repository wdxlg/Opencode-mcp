// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/authentication/common/authentication.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/services/authentication/common/authentication.ts
var INTERNAL_AUTH_PROVIDER_PREFIX = "__";

var ACCOUNTS_AVATAR_SETTING = "workbench.accounts.showAvatar";

function isAuthenticationWwwAuthenticateRequest(obj) {
  return typeof obj === "object" && obj !== null && "wwwAuthenticate" in obj && typeof obj.wwwAuthenticate === "string";
}

function getDynamicAuthenticationProviderId(authorizationServer, resource) {
  return resource ? `${authorizationServer.toString(true)} ${resource.resource}` : authorizationServer.toString(true);
}

var IAuthenticationService = createDecorator("IAuthenticationService");

var IAuthenticationExtensionsService = createDecorator("IAuthenticationExtensionsService");
export { isAuthenticationWwwAuthenticateRequest, getDynamicAuthenticationProviderId, INTERNAL_AUTH_PROVIDER_PREFIX, ACCOUNTS_AVATAR_SETTING, IAuthenticationService, IAuthenticationExtensionsService };
