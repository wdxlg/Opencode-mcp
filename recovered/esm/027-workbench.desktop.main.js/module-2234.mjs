// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentElementAttachments.ts



// src/vs/platform/agentHost/common/meta/agentElementAttachments.ts
var AgentHostElementAttachmentDisplayKind = "element";

var AgentHostElementAttachmentMetadataKey = "vscode.agentHost.elementAttachment";

function toElementAttachmentMeta(correlationId) {
  return {
    [AgentHostElementAttachmentMetadataKey]: { correlationId }
  };
}

function getElementAttachmentCorrelationId(attachment) {
  const metadata = attachment._meta?.[AgentHostElementAttachmentMetadataKey];
  if (!metadata || typeof metadata !== "object" || !("correlationId" in metadata) || typeof metadata.correlationId !== "string") {
    return void 0;
  }
  return metadata.correlationId;
}
export { toElementAttachmentMeta, getElementAttachmentCorrelationId, AgentHostElementAttachmentDisplayKind, AgentHostElementAttachmentMetadataKey };
