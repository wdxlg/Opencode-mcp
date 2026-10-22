// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentSnapshotAttachmentMeta.ts
import { isString } from "./module-0008.mjs";


// src/vs/platform/agentHost/common/meta/agentSnapshotAttachmentMeta.ts
var HostSnapshotAttachmentMetadataKey = "vscode.agentHost.snapshotAttachment";

function toHostSnapshotAttachmentMeta(contentType) {
  return {
    [HostSnapshotAttachmentMetadataKey]: contentType ? { isSnapshot: true, contentType } : { isSnapshot: true }
  };
}

function readHostSnapshotAttachmentMeta(attachment) {
  const metadata = attachment._meta?.[HostSnapshotAttachmentMetadataKey];
  if (!isRecord4(metadata) || metadata.isSnapshot !== true) {
    return void 0;
  }
  const contentType = isString(metadata.contentType) ? metadata.contentType : void 0;
  return contentType ? { isSnapshot: true, contentType } : { isSnapshot: true };
}

function isHostSnapshotAttachment(attachment) {
  return attachment.type === "resource" /* Resource */ && readHostSnapshotAttachmentMeta(attachment) !== void 0;
}

function isRecord4(value) {
  return typeof value === "object" && value !== null;
}
export { toHostSnapshotAttachmentMeta, readHostSnapshotAttachmentMeta, isHostSnapshotAttachment, isRecord4, HostSnapshotAttachmentMetadataKey };
