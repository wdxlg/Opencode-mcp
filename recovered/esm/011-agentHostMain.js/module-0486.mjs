// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostConversationContext.ts



// src/vs/platform/agentHost/common/agentHostConversationContext.ts
function renderResponseMarkdown(parts) {
  const segments = [];
  for (const part of parts) {
    if (part.kind === "markdown" /* Markdown */) {
      const text = part.content.trim();
      if (text) {
        segments.push(text);
      }
    }
  }
  return segments.join("\n\n");
}

function buildConversationContext(turns, options) {
  const blocks = [];
  for (const turn of turns) {
    const userText = turn.message.text.trim();
    const responseText = renderResponseMarkdown(turn.responseParts);
    if (!userText && !responseText) {
      continue;
    }
    blocks.push(responseText ? `User request:
${userText}

Agent response:
${responseText}` : `User request:
${userText}`);
  }
  if (blocks.length === 0) {
    return void 0;
  }
  const conversation = blocks.join("\n\n---\n\n");
  const truncatedConversation = conversation.length > options.maxChars ? truncateMiddle(conversation, options.maxChars) : conversation;
  return `${options.framing ?? ""}${truncatedConversation}`;
}

function truncateMiddle(text, maxChars) {
  if (text.length <= maxChars) {
    return text;
  }
  const marker = "\n...\n";
  if (maxChars <= marker.length) {
    return text.slice(0, maxChars);
  }
  const keep = maxChars - marker.length;
  const head = Math.ceil(keep / 2);
  const tail = keep - head;
  return `${text.slice(0, head)}${marker}${text.slice(text.length - tail)}`;
}

function resolveLastNonLocalTurnId(turns, isLocal) {
  for (let i = turns.length - 1; i >= 0; i--) {
    const turn = turns[i];
    if (!isLocal(turn.id)) {
      return turn.id;
    }
  }
  return void 0;
}
export { renderResponseMarkdown, buildConversationContext, truncateMiddle, resolveLastNonLocalTurnId };
