// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/suggest/browser/terminalGitBashHelpers.ts



// src/vs/workbench/contrib/terminalContrib/suggest/browser/terminalGitBashHelpers.ts
function gitBashToWindowsPath(path, driveLetter) {
  const systemDrive = (driveLetter || "C:").toUpperCase();
  if (path === "/") {
    return `${systemDrive}\\`;
  }
  const match2 = path.match(/^\/([a-zA-Z])(\/.*)?$/);
  if (match2) {
    const drive = match2[1].toUpperCase();
    const rest = match2[2] ? match2[2].replace(/\//g, "\\") : "\\";
    return `${drive}:${rest}`;
  }
  return path.replace(/\//g, "\\");
}

function windowsToGitBashPath(path) {
  return path.replace(/^[a-zA-Z]:\\/, (match2) => `/${match2[0].toLowerCase()}/`).replace(/\\/g, "/");
}
export { gitBashToWindowsPath, windowsToGitBashPath };
