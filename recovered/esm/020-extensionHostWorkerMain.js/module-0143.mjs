// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/services/authentication/common/authentication.ts
import { createDecorator } from "./module-0038.mjs";


// src/vs/workbench/services/authentication/common/authentication.ts
var INTERNAL_AUTH_PROVIDER_PREFIX = "__";

function isAuthenticationWwwAuthenticateRequest(obj) {
  return typeof obj === "object" && obj !== null && "wwwAuthenticate" in obj && typeof obj.wwwAuthenticate === "string";
}

var IAuthenticationService = createDecorator("IAuthenticationService");

var IAuthenticationExtensionsService = createDecorator("IAuthenticationExtensionsService");
export { isAuthenticationWwwAuthenticateRequest, INTERNAL_AUTH_PROVIDER_PREFIX, IAuthenticationService, IAuthenticationExtensionsService };
