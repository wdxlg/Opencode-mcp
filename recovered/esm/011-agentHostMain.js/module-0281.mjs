// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotAttachmentUtils.ts



// src/vs/platform/agentHost/node/copilot/copilotAttachmentUtils.ts
var attachmentDisplayKindParameter = "x-vscode-display-kind=";

var simpleAttachmentMimeType = "text/x-vscode-simple-attachment";

function addSimpleAttachmentDisplayKindToMimeType(attachment) {
  return addAttachmentDisplayKindToMimeType(attachment.displayKind);
}

function addAttachmentDisplayKindToMimeType(displayKind) {
  if (displayKind === void 0) {
    return "text/plain";
  }
  return `${simpleAttachmentMimeType}; ${attachmentDisplayKindParameter}${encodeURIComponent(displayKind)}`;
}

function readSimpleAttachmentDisplayKindFromMimeType(mimeType) {
  const parameter = mimeType.split(";").map((part) => part.trim()).find((part) => part.startsWith(attachmentDisplayKindParameter));
  if (!parameter) {
    return void 0;
  }
  try {
    return decodeURIComponent(parameter.slice(attachmentDisplayKindParameter.length));
  } catch {
    return void 0;
  }
}
export { addSimpleAttachmentDisplayKindToMimeType, addAttachmentDisplayKindToMimeType, readSimpleAttachmentDisplayKindFromMimeType, attachmentDisplayKindParameter, simpleAttachmentMimeType };
