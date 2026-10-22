// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/sessionsPicker.ts
import { isActiveSessionStatus } from "./module-1767.mjs";


// src/vs/sessions/contrib/sessions/browser/sessionsPicker.ts
function groupSessionsForPicker(recentSessions, otherSessions, reader) {
  const needsInput = [];
  const unread = [];
  const recent = [];
  const other = [];
  const groupSession = (session, remaining) => {
    const status2 = session.status.read(reader);
    if (session.isArchived.read(reader)) {
      return;
    } else if (status2 === 2 /* NeedsInput */) {
      needsInput.push(session);
    } else if (!isActiveSessionStatus(status2) && !session.isRead.read(reader)) {
      unread.push(session);
    } else {
      remaining.push(session);
    }
  };
  for (const session of recentSessions) {
    groupSession(session, recent);
  }
  for (const session of otherSessions) {
    groupSession(session, other);
  }
  return { needsInput, unread, recent, other };
}
export { groupSessionsForPicker };
