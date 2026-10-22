// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/pullRequestSessionCreation.ts



// src/vs/sessions/contrib/github/browser/pullRequestSessionCreation.ts
async function createAndOpenPullRequestSession(createSession, showSession, onDidShowSession) {
  return createSession((session) => {
    showSession(session.resource);
    onDidShowSession();
  });
}
export { createAndOpenPullRequestSession };
