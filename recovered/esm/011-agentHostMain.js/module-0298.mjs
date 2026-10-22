// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostSlashCompletion.ts
import { matchesFuzzy2 } from "./module-0109.mjs";


// src/vs/platform/agentHost/node/agentHostSlashCompletion.ts
function extractLeadingSlashToken(text, offset) {
  if (text.length === 0 || text.charCodeAt(0) !== 47) {
    return void 0;
  }
  let end = 1;
  while (end < text.length) {
    if (isSlashTokenWhitespace(text.charCodeAt(end))) {
      break;
    }
    end++;
  }
  if (offset < 0 || offset > end) {
    return void 0;
  }
  const token = text.slice(0, end);
  return { token, typed: token.slice(1), rangeStart: 0, rangeEnd: end };
}

function extractWhitespaceDelimitedSlashToken(text, offset) {
  if (text.length === 0 || offset < 0 || offset > text.length) {
    return void 0;
  }
  let start = offset;
  while (start > 0 && !isSlashTokenWhitespace(text.charCodeAt(start - 1))) {
    start--;
  }
  if (start >= text.length || text.charCodeAt(start) !== 47) {
    return void 0;
  }
  let end = start + 1;
  while (end < text.length && !isSlashTokenWhitespace(text.charCodeAt(end))) {
    end++;
  }
  if (offset > end) {
    return void 0;
  }
  const token = text.slice(start, end);
  return { token, typed: token.slice(1), rangeStart: start, rangeEnd: end };
}

function matchesSlashCompletion(typed, name) {
  if (typed.length === 0 || name.toLowerCase().startsWith(typed.toLowerCase())) {
    return true;
  }
  return typed.length > 1 && matchesFuzzy2(typed, name) !== null;
}

function isSlashTokenWhitespace(ch) {
  return ch === 32 || ch === 9 || ch === 10 || ch === 13;
}
export { extractLeadingSlashToken, extractWhitespaceDelimitedSlashToken, matchesSlashCompletion, isSlashTokenWhitespace };
