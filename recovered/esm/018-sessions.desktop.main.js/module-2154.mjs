// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/codexAccount.ts
import { URI } from "./module-0032.mjs";


// src/vs/platform/agentHost/common/codexAccount.ts
var CODEX_ACCOUNT_META_KEY = "vscode.codexAccount";

var CODEX_ACCOUNT_SIGN_IN_REQUEST_KEY = "vscode.codexAccount.signInRequest";

var CODEX_ACCOUNT_SIGN_OUT_REQUEST_KEY = "vscode.codexAccount.signOutRequest";

var CODEX_PROFILE_IMAGE_SCHEME = "vscode-codex-profile-image";

var MAX_CODEX_PROFILE_IMAGE_BYTES = 1024 * 1024;

var SUPPORTED_CODEX_PROFILE_IMAGE_MEDIA_TYPES = /* @__PURE__ */ new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

function readCodexAccountInfo(state) {
  const metaValue = state?._meta?.[CODEX_ACCOUNT_META_KEY];
  const value2 = state?.config?.values[CODEX_ACCOUNT_META_KEY] ?? metaValue;
  if (!value2 || typeof value2 !== "object") {
    return { status: "unknown" };
  }
  const account = value2;
  if (account.status !== "unknown" && account.status !== "downloading" && account.status !== "signedIn" && account.status !== "signedOut" && account.status !== "unavailable" && account.status !== "error") {
    return { status: "unknown" };
  }
  const rateLimit = account.rateLimit;
  const validRateLimit = rateLimit && typeof rateLimit === "object" && typeof rateLimit.usedPercent === "number" && Number.isFinite(rateLimit.usedPercent) && rateLimit.usedPercent >= 0 && rateLimit.usedPercent <= 100 && (rateLimit.windowDurationMins === void 0 || typeof rateLimit.windowDurationMins === "number" && Number.isFinite(rateLimit.windowDurationMins) && rateLimit.windowDurationMins > 0) && (rateLimit.resetsAt === void 0 || typeof rateLimit.resetsAt === "number" && Number.isFinite(rateLimit.resetsAt) && rateLimit.resetsAt > 0);
  return {
    status: account.status,
    email: typeof account.email === "string" ? account.email : void 0,
    planType: typeof account.planType === "string" ? account.planType : void 0,
    profileImage: readProfileImageReference(account.profileImage),
    requiresOpenaiAuth: typeof account.requiresOpenaiAuth === "boolean" ? account.requiresOpenaiAuth : void 0,
    rateLimit: validRateLimit ? {
      usedPercent: rateLimit.usedPercent,
      windowDurationMins: rateLimit.windowDurationMins,
      resetsAt: rateLimit.resetsAt
    } : void 0,
    authUrl: typeof account.authUrl === "string" ? account.authUrl : void 0,
    authUrlNonce: typeof account.authUrlNonce === "string" ? account.authUrlNonce : void 0
  };
}

function readProfileImageReference(value2) {
  if (!value2 || typeof value2 !== "object") {
    return void 0;
  }
  const reference = value2;
  if (typeof reference.contentType !== "string" || !SUPPORTED_CODEX_PROFILE_IMAGE_MEDIA_TYPES.has(reference.contentType) || typeof reference.sizeHint !== "number" || !Number.isInteger(reference.sizeHint) || reference.sizeHint <= 0 || reference.sizeHint > MAX_CODEX_PROFILE_IMAGE_BYTES || typeof reference.nonce !== "string" || !/^[a-f0-9]{64}$/.test(reference.nonce) || !isProfileImageResourceUri(reference.uri, reference.contentType, reference.nonce)) {
    return void 0;
  }
  return {
    uri: reference.uri,
    contentType: reference.contentType,
    sizeHint: reference.sizeHint,
    nonce: reference.nonce
  };
}

function isProfileImageResourceUri(value2, contentType, nonce) {
  if (typeof value2 !== "string") {
    return false;
  }
  try {
    const uri4 = URI.parse(value2);
    const extension = contentType === "image/jpeg" ? "jpg" : contentType.slice("image/".length);
    return uri4.scheme === CODEX_PROFILE_IMAGE_SCHEME && !uri4.authority && uri4.path === `/profile-${nonce}.${extension}` && !uri4.query && !uri4.fragment;
  } catch {
    return false;
  }
}
export { readCodexAccountInfo, readProfileImageReference, isProfileImageResourceUri, CODEX_ACCOUNT_META_KEY, CODEX_ACCOUNT_SIGN_IN_REQUEST_KEY, CODEX_ACCOUNT_SIGN_OUT_REQUEST_KEY, CODEX_PROFILE_IMAGE_SCHEME, MAX_CODEX_PROFILE_IMAGE_BYTES, SUPPORTED_CODEX_PROFILE_IMAGE_MEDIA_TYPES };
