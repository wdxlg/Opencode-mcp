// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatProgressFormatting.ts
import { fromNow, safeIntl } from "./module-0120.mjs";
import { language } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/common/chatProgressFormatting.ts
var dayInMilliseconds = 24 * 60 * 60 * 1e3;

var chatRequestTimeFormatter = safeIntl.DateTimeFormat(language, {
  hour: "numeric",
  minute: "2-digit"
});

var chatRequestFullDateTimeFormatter = safeIntl.DateTimeFormat(language, {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

function formatElapsedTime(ms) {
  const totalSeconds = Math.floor(ms / 1e3);
  if (totalSeconds < 60) {
    return localize(12931, null, totalSeconds);
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return localize(12930, null, minutes, seconds);
}

function formatChatResponseElapsedTime(elapsedMs) {
  return typeof elapsedMs === "number" && elapsedMs >= 1e3 ? formatElapsedTime(elapsedMs) : void 0;
}

function formatChatRequestTimestamp(timestamp) {
  if (timestamp === void 0 || !Number.isFinite(timestamp) || timestamp <= 0) {
    return void 0;
  }
  const date = new Date(timestamp);
  const age = Date.now() - timestamp;
  const isRelative = age > dayInMilliseconds;
  return {
    text: isRelative ? fromNow(timestamp, false, true) : chatRequestTimeFormatter.value.format(date),
    fullText: chatRequestFullDateTimeFormatter.value.format(date),
    dateTime: date.toISOString(),
    isRelative
  };
}

function formatChatResponseDetails(details, timing) {
  const parts = timing ? [timing] : [];
  if (details) {
    parts.push(details);
  }
  return parts.join(" \u2022 ");
}
export { formatElapsedTime, formatChatResponseElapsedTime, formatChatRequestTimestamp, formatChatResponseDetails, dayInMilliseconds, chatRequestTimeFormatter, chatRequestFullDateTimeFormatter };
