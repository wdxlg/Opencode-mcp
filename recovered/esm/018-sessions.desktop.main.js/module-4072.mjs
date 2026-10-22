// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/ports.ts



// src/vs/base/common/ports.ts
function randomPort() {
  const min = 1025;
  const max = 65535;
  return min + Math.floor((max - min) * Math.random());
}
export { randomPort };
