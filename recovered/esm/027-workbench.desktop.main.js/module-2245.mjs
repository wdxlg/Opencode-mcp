// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostChatReferenceAttachment.ts
import { createChatReferenceVariableEntry } from "./module-0979.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostChatReferenceAttachment.ts
function restoreChatReferenceVariableEntryFromAttachment(attachment, messageText2) {
  const range2 = messageText2 !== void 0 ? textRangeToOffsetRange(messageText2, attachment.range) : void 0;
  return createChatReferenceVariableEntry(URI.parse(attachment.resource), attachment.endTurn, attachment.label, attachment._meta, range2);
}

function textRangeToOffsetRange(messageText2, range2) {
  if (!range2) {
    return void 0;
  }
  const start = positionToOffset(messageText2, range2.start.line, range2.start.character);
  const endExclusive = positionToOffset(messageText2, range2.end.line, range2.end.character);
  if (start < 0 || endExclusive > messageText2.length || start > endExclusive) {
    return void 0;
  }
  return { start, endExclusive };
}

function positionToOffset(text2, line, character) {
  let offset = 0;
  for (let currentLine = 0; currentLine < line; currentLine++) {
    const newline2 = text2.indexOf("\n", offset);
    if (newline2 === -1) {
      return text2.length;
    }
    offset = newline2 + 1;
  }
  return Math.min(offset + Math.max(0, character), text2.length);
}
export { restoreChatReferenceVariableEntryFromAttachment, textRangeToOffsetRange, positionToOffset };
