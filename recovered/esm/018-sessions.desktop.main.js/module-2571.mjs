// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatDebugEvents.ts



// src/vs/workbench/contrib/chat/common/chatDebugEvents.ts
function debugEventMatchesText(event, term) {
  if (event.kind.toLowerCase().includes(term)) {
    return true;
  }
  switch (event.kind) {
    case "toolCall":
      return event.toolName.toLowerCase().includes(term) || (event.input?.toLowerCase().includes(term) ?? false) || (event.output?.toLowerCase().includes(term) ?? false);
    case "modelTurn":
      return (event.model?.toLowerCase().includes(term) ?? false) || (event.requestName?.toLowerCase().includes(term) ?? false);
    case "generic":
      return event.name.toLowerCase().includes(term) || (event.details?.toLowerCase().includes(term) ?? false) || (event.category?.toLowerCase().includes(term) ?? false);
    case "subagentInvocation":
      return event.agentName.toLowerCase().includes(term) || (event.description?.toLowerCase().includes(term) ?? false);
    case "userMessage":
    case "agentResponse":
      return event.message.toLowerCase().includes(term) || event.sections.some((s) => s.name.toLowerCase().includes(term) || s.content.toLowerCase().includes(term));
  }
}

var timestampTokenPattern = /\b(?:before|after):\d{4}(?:-\d{2}(?:-\d{2}(?:t\d{1,2}(?::\d{2}(?::\d{2})?)?)?)?)?(\b|$)/g;

function parseTimeToken(text2, prefix) {
  const regex = new RegExp(`${prefix}:(\\d{4})(?:-(\\d{2})(?:-(\\d{2})(?:t(\\d{1,2})(?::(\\d{2})(?::(\\d{2}))?)?)?)?)?(?!\\w)`);
  const m = regex.exec(text2);
  if (!m) {
    return void 0;
  }
  const year2 = parseInt(m[1], 10);
  const month2 = m[2] !== void 0 ? parseInt(m[2], 10) - 1 : void 0;
  const day2 = m[3] !== void 0 ? parseInt(m[3], 10) : void 0;
  const hour2 = m[4] !== void 0 ? parseInt(m[4], 10) : void 0;
  const minute2 = m[5] !== void 0 ? parseInt(m[5], 10) : void 0;
  const second = m[6] !== void 0 ? parseInt(m[6], 10) : void 0;
  if (prefix === "before") {
    if (second !== void 0) {
      return new Date(year2, month2, day2, hour2, minute2, second, 999).getTime();
    } else if (minute2 !== void 0) {
      return new Date(year2, month2, day2, hour2, minute2, 59, 999).getTime();
    } else if (hour2 !== void 0) {
      return new Date(year2, month2, day2, hour2, 59, 59, 999).getTime();
    } else if (day2 !== void 0) {
      return new Date(year2, month2, day2, 23, 59, 59, 999).getTime();
    } else if (month2 !== void 0) {
      return new Date(year2, month2 + 1, 0, 23, 59, 59, 999).getTime();
    } else {
      return new Date(year2, 11, 31, 23, 59, 59, 999).getTime();
    }
  } else {
    return new Date(
      year2,
      month2 ?? 0,
      day2 ?? 1,
      hour2 ?? 0,
      minute2 ?? 0,
      second ?? 0,
      0
    ).getTime();
  }
}

function stripTimestampTokens(text2) {
  return text2.replace(timestampTokenPattern, "").trim();
}
export { debugEventMatchesText, parseTimeToken, stripTimestampTokens, timestampTokenPattern };
