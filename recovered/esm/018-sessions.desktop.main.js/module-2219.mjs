// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionReferenceAttachment.ts
import { chatSessionResourceToId } from "./module-0962.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionReferenceAttachment.ts
var AgentHostSessionReferenceAttachmentDisplayKind = "sessionReference";

var AgentHostSessionReferenceTrajectoryAttachmentDisplayKind = "sessionReferenceTrajectory";

var AgentHostSessionReferenceAttachmentMetadataKey = "vscode.agentHost.sessionReference";

function toSessionReferenceModelRepresentation(label3, sessionResource, trajectoryPath) {
  const sessionID = chatSessionResourceToId(sessionResource);
  const lines = [
    `Attached chat session: ${label3}`,
    `Session ID: ${sessionID}`,
    `Session resource: ${sessionResource.toString()}`
  ];
  if (trajectoryPath) {
    lines.push(`Session events file attached: ${trajectoryPath}`);
  }
  return lines.join("\n");
}

function toSessionReferenceAttachmentMeta(sessionResource) {
  return {
    [AgentHostSessionReferenceAttachmentMetadataKey]: {
      sessionResource: sessionResource.toString(),
      sessionID: chatSessionResourceToId(sessionResource)
    }
  };
}

function restoreSessionReferenceVariableEntryFromAttachment(attachment) {
  if (attachment.displayKind !== AgentHostSessionReferenceAttachmentDisplayKind) {
    return void 0;
  }
  const metadata = getSessionReferenceAttachmentMetadata(attachment);
  if (!metadata) {
    return void 0;
  }
  try {
    const sessionResource = URI.parse(metadata.sessionResource);
    return {
      kind: "sessionReference",
      id: sessionResource.toString(),
      name: attachment.label,
      value: sessionResource,
      _meta: attachment._meta
    };
  } catch {
    return void 0;
  }
}

function getSessionReferenceAttachmentMetadata(attachment) {
  const meta = attachment._meta;
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return void 0;
  }
  const metadata = meta[AgentHostSessionReferenceAttachmentMetadataKey];
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return void 0;
  }
  const typedMetadata = metadata;
  const sessionResource = typedMetadata.sessionResource;
  if (typeof sessionResource !== "string") {
    return void 0;
  }
  const sessionID = typedMetadata.sessionID;
  if (typeof sessionID !== "string") {
    return void 0;
  }
  return {
    sessionResource,
    sessionID
  };
}

function isSessionReferenceTrajectoryAttachment(attachment) {
  return attachment.displayKind === AgentHostSessionReferenceTrajectoryAttachmentDisplayKind;
}
export { toSessionReferenceModelRepresentation, toSessionReferenceAttachmentMeta, restoreSessionReferenceVariableEntryFromAttachment, getSessionReferenceAttachmentMetadata, isSessionReferenceTrajectoryAttachment, AgentHostSessionReferenceAttachmentDisplayKind, AgentHostSessionReferenceTrajectoryAttachmentDisplayKind, AgentHostSessionReferenceAttachmentMetadataKey };
