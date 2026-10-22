// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/remote/common/remoteHosts.ts



// src/vs/platform/remote/common/remoteHosts.ts
function getRemoteName(authority) {
  if (!authority) {
    return void 0;
  }
  const pos = authority.indexOf("+");
  if (pos < 0) {
    return authority;
  }
  return authority.substr(0, pos);
}
export { getRemoteName };
