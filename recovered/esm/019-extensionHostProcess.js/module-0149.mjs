// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/authentication/common/authentication.ts
import { createDecorator2 } from "./module-0048.mjs";


// src/vs/workbench/services/authentication/common/authentication.ts
var INTERNAL_AUTH_PROVIDER_PREFIX = "__";

function isAuthenticationWwwAuthenticateRequest(obj) {
  return typeof obj === "object" && obj !== null && "wwwAuthenticate" in obj && typeof obj.wwwAuthenticate === "string";
}

var IAuthenticationService = createDecorator2("IAuthenticationService");

var IAuthenticationExtensionsService = createDecorator2("IAuthenticationExtensionsService");
export { isAuthenticationWwwAuthenticateRequest, INTERNAL_AUTH_PROVIDER_PREFIX, IAuthenticationService, IAuthenticationExtensionsService };
