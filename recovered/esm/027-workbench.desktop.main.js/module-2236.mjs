// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/meta/browserViewAttachments.ts
import { isString } from "./module-0010.mjs";


// src/vs/platform/agentHost/common/meta/browserViewAttachments.ts
var BrowserViewAttachmentDisplayKind = "browser";

var BrowserViewAttachmentMetadataKey = "browserView";

function isBrowserViewAttachment(attachment) {
  return attachment.type === "simple" /* Simple */ && attachment.displayKind === BrowserViewAttachmentDisplayKind;
}

function getBrowserViewAttachmentMetadata(attachment) {
  if (!isBrowserViewAttachment(attachment)) {
    return void 0;
  }
  const metadata = attachment._meta?.[BrowserViewAttachmentMetadataKey];
  if (!isRecord5(metadata) || !isString(metadata.browserId) || !isString(metadata.browserUri)) {
    return void 0;
  }
  return { browserId: metadata.browserId, browserUri: metadata.browserUri };
}

function isRecord5(value2) {
  return typeof value2 === "object" && value2 !== null;
}
export { isBrowserViewAttachment, getBrowserViewAttachmentMetadata, isRecord5, BrowserViewAttachmentDisplayKind, BrowserViewAttachmentMetadataKey };
