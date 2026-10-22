// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexProfileImage.ts
import { Disposable } from "./module-0010.mjs";
import { InMemoryFileSystemProvider } from "./module-0283.mjs";
import { Sequencer } from "./module-0027.mjs";
import { CODEX_PROFILE_IMAGE_SCHEME, MAX_CODEX_PROFILE_IMAGE_BYTES } from "./module-0370.mjs";
import { URI } from "./module-0023.mjs";


// src/vs/platform/agentHost/node/codex/codexProfileImage.ts
import { createHash as createHash3 } from "crypto";

var CHATGPT_ACCOUNTS_URL = "https://chatgpt.com/backend-api/wham/accounts/check";

var CHATGPT_PROFILE_URL = "https://chatgpt.com/backend-api/wham/profiles/me";

var CHATGPT_ORIGIN = "https://chatgpt.com";

var PROFILE_IMAGE_REQUEST_TIMEOUT_MS = 1e4;

var PROFILE_IMAGE_MAX_REDIRECTS = 5;

var SUPPORTED_PROFILE_IMAGE_MEDIA_TYPES = /* @__PURE__ */ new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

var CodexProfileImageStore = class extends Disposable {
  constructor(fileService) {
    super();
    this._provider = this._register(new InMemoryFileSystemProvider());
    this._mutationSequencer = new Sequencer();
    this._provider.setReadOnly(true);
    this._register(fileService.registerProvider(CODEX_PROFILE_IMAGE_SCHEME, this._provider));
  }
  clear() {
    return this._mutationSequencer.queue(() => this._clear());
  }
  update(image) {
    return this._mutationSequencer.queue(() => this._update(image));
  }
  async _clear() {
    const reference = this._reference;
    this._reference = void 0;
    if (reference) {
      await this._deleteResource(reference);
    }
  }
  async _update(image) {
    if (!image) {
      await this._clear();
      return void 0;
    }
    const nonce = createHash3("sha256").update(image.mediaType).update(image.bytes).digest("hex");
    if (this._reference?.nonce === nonce) {
      return this._reference;
    }
    const resource = URI.from({ scheme: CODEX_PROFILE_IMAGE_SCHEME, path: `/profile-${nonce}.${getProfileImageExtension(image.mediaType)}` });
    if (this._reference) {
      const previousReference = this._reference;
      this._reference = void 0;
      await this._deleteResource(previousReference);
    }
    await this._provider.writeFile(resource, image.bytes, { create: true, overwrite: true, append: false, unlock: false, atomic: false });
    this._reference = {
      uri: resource.toString(),
      contentType: image.mediaType,
      sizeHint: image.bytes.byteLength,
      nonce
    };
    return this._reference;
  }
  _deleteResource(reference) {
    return this._provider.delete(URI.parse(reference.uri), { recursive: false, useTrash: false, atomic: false });
  }
};

async function fetchCodexProfileImage(accessToken, fetchFn) {
  const accountId = getChatGPTAccountId(accessToken);
  const headers = { ...getAuthenticatedHeaders(accessToken, accountId), Accept: "application/json" };
  const profile = await fetchJson(CHATGPT_PROFILE_URL, headers, fetchFn);
  const profileImageUrl = getChatGPTProfileImageUrl(profile) ?? getCodexProfileImageUrl(await fetchJson(CHATGPT_ACCOUNTS_URL, headers, fetchFn), accountId);
  if (!profileImageUrl) {
    return void 0;
  }
  const inlineImage = parseSupportedProfileImageDataUri(profileImageUrl);
  if (inlineImage) {
    return inlineImage;
  }
  let resolvedImageUrl;
  try {
    resolvedImageUrl = new URL(profileImageUrl, CHATGPT_ORIGIN);
  } catch {
    return void 0;
  }
  if (resolvedImageUrl.protocol !== "https:") {
    return void 0;
  }
  const imageResponse = await fetchProfileImageResponse(resolvedImageUrl, accessToken, accountId, fetchFn);
  if (!imageResponse) {
    return void 0;
  }
  if (!imageResponse.ok) {
    await cancelResponseBody(imageResponse);
    return void 0;
  }
  const mediaType = imageResponse.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (!mediaType || !SUPPORTED_PROFILE_IMAGE_MEDIA_TYPES.has(mediaType)) {
    await cancelResponseBody(imageResponse);
    return void 0;
  }
  const contentLength = Number(imageResponse.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_CODEX_PROFILE_IMAGE_BYTES) {
    await cancelResponseBody(imageResponse);
    return void 0;
  }
  const bytes = await readProfileImageBytes(imageResponse);
  if (!bytes) {
    return void 0;
  }
  return { mediaType, bytes };
}

function getChatGPTProfileImageUrl(value) {
  if (!isObject3(value) || !isObject3(value.profile)) {
    return void 0;
  }
  return typeof value.profile.profile_picture_url === "string" && value.profile.profile_picture_url.trim() ? value.profile.profile_picture_url.trim() : void 0;
}

function getCodexProfileImageUrl(value, accountId) {
  if (!isObject3(value)) {
    return void 0;
  }
  const response = value;
  if (!Array.isArray(response.accounts)) {
    return void 0;
  }
  const accounts = response.accounts.filter(isObject3);
  let account = accountId ? accounts.find((candidate) => candidate.id === accountId) : void 0;
  if (!account && Array.isArray(response.account_ordering)) {
    const orderedAccountId = response.account_ordering.find((candidate) => typeof candidate === "string");
    account = accounts.find((candidate) => candidate.id === orderedAccountId);
  }
  account ??= accounts[0];
  return typeof account?.profile_picture_url === "string" && account.profile_picture_url.trim() ? account.profile_picture_url.trim() : void 0;
}

function getChatGPTAccountId(accessToken) {
  const encodedPayload = accessToken.split(".", 3)[1];
  if (!encodedPayload) {
    return void 0;
  }
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!isObject3(payload)) {
      return void 0;
    }
    const auth = payload["https://api.openai.com/auth"];
    if (!isObject3(auth)) {
      return void 0;
    }
    const accountId = auth.chatgpt_account_id ?? auth.account_id;
    return typeof accountId === "string" && accountId ? accountId : void 0;
  } catch {
    return void 0;
  }
}

function getAuthenticatedHeaders(accessToken, accountId) {
  return {
    Authorization: `Bearer ${accessToken}`,
    ...accountId ? { "ChatGPT-Account-Id": accountId } : {},
    originator: "vscode_codex"
  };
}

function isAuthenticatedImageHost(url2) {
  if (url2.port && url2.port !== "443") {
    return false;
  }
  const host = url2.hostname.toLowerCase();
  return host === "chatgpt.com" || host.endsWith(".chatgpt.com") && host !== "ab.chatgpt.com" || host === "openai.com" || host.endsWith(".openai.com");
}

async function fetchProfileImageResponse(initialUrl, accessToken, accountId, fetchFn) {
  let url2 = initialUrl;
  const signal = AbortSignal.timeout(PROFILE_IMAGE_REQUEST_TIMEOUT_MS);
  for (let redirectCount = 0; redirectCount <= PROFILE_IMAGE_MAX_REDIRECTS; redirectCount++) {
    if (url2.protocol !== "https:") {
      return void 0;
    }
    let response;
    try {
      response = await fetchFn(url2, {
        headers: isAuthenticatedImageHost(url2) ? { ...getAuthenticatedHeaders(accessToken, accountId), Accept: "image/*" } : { Accept: "image/*" },
        redirect: "manual",
        signal
      });
    } catch {
      return void 0;
    }
    if (!isRedirectStatus(response.status)) {
      return response;
    }
    const location = response.headers.get("location");
    if (!location || redirectCount === PROFILE_IMAGE_MAX_REDIRECTS) {
      await cancelResponseBody(response);
      return void 0;
    }
    let redirectedUrl;
    try {
      redirectedUrl = new URL(location, url2);
    } catch {
      await cancelResponseBody(response);
      return void 0;
    }
    await cancelResponseBody(response);
    url2 = redirectedUrl;
  }
  return void 0;
}

function isRedirectStatus(status) {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

async function cancelResponseBody(response) {
  try {
    await response.body?.cancel();
  } catch {
  }
}

async function readProfileImageBytes(response) {
  if (!response.body) {
    return void 0;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      size += value.byteLength;
      if (size > MAX_CODEX_PROFILE_IMAGE_BYTES) {
        await reader.cancel();
        return void 0;
      }
      chunks.push(value);
    }
  } catch {
    return void 0;
  } finally {
    reader.releaseLock();
  }
  if (size === 0) {
    return void 0;
  }
  return chunks.length === 1 ? Buffer.from(chunks[0]) : Buffer.concat(chunks, size);
}

async function fetchJson(url2, headers, fetchFn) {
  try {
    const response = await fetchFn(url2, {
      headers,
      signal: AbortSignal.timeout(PROFILE_IMAGE_REQUEST_TIMEOUT_MS)
    });
    return response.ok ? await response.json() : void 0;
  } catch {
    return void 0;
  }
}

function parseSupportedProfileImageDataUri(value) {
  if (value.length > Math.ceil(MAX_CODEX_PROFILE_IMAGE_BYTES * 4 / 3) + 64) {
    return void 0;
  }
  const match2 = /^data:(image\/(?:avif|gif|jpeg|png|webp));base64,([a-zA-Z0-9+/]*={0,2})$/.exec(value);
  if (!match2 || !SUPPORTED_PROFILE_IMAGE_MEDIA_TYPES.has(match2[1])) {
    return void 0;
  }
  const bytes = Buffer.from(match2[2], "base64");
  return bytes.byteLength > 0 && bytes.byteLength <= MAX_CODEX_PROFILE_IMAGE_BYTES ? { mediaType: match2[1], bytes } : void 0;
}

function getProfileImageExtension(mediaType) {
  return mediaType === "image/jpeg" ? "jpg" : mediaType.slice("image/".length);
}

function isObject3(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export { fetchCodexProfileImage, getChatGPTProfileImageUrl, getCodexProfileImageUrl, getChatGPTAccountId, getAuthenticatedHeaders, isAuthenticatedImageHost, fetchProfileImageResponse, isRedirectStatus, cancelResponseBody, readProfileImageBytes, fetchJson, parseSupportedProfileImageDataUri, getProfileImageExtension, isObject3, createHash3, CHATGPT_ACCOUNTS_URL, CHATGPT_PROFILE_URL, CHATGPT_ORIGIN, PROFILE_IMAGE_REQUEST_TIMEOUT_MS, PROFILE_IMAGE_MAX_REDIRECTS, SUPPORTED_PROFILE_IMAGE_MEDIA_TYPES, CodexProfileImageStore };
