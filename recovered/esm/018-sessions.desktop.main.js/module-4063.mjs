// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/electron-browser/fileCommands.ts
import { sequence } from "./module-0036.mjs";
import { Schemas } from "./module-0033.mjs";
import { getRemoteName, getRemoteServerRootPath } from "./module-0687.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/files/electron-browser/fileCommands.ts
function revealResourcesInOS(resources, nativeHostService, workspaceContextService) {
  if (resources.length) {
    sequence(resources.map((r2) => async () => {
      const localUri = toLocalFileUri(r2);
      if (localUri) {
        nativeHostService.showItemInFolder(localUri.fsPath);
      }
    }));
  } else if (workspaceContextService.getWorkspace().folders.length) {
    const localUri = toLocalFileUri(workspaceContextService.getWorkspace().folders[0].uri);
    if (localUri) {
      nativeHostService.showItemInFolder(localUri.fsPath);
    }
  }
}

function toLocalFileUri(resource) {
  switch (resource.scheme) {
    case Schemas.file:
    case Schemas.vscodeUserData:
      return resource.with({ scheme: Schemas.file });
    case Schemas.vscodeRemote: {
      const remoteName = getRemoteName(resource.authority);
      if (remoteName === "wsl") {
        const distro = getRemoteServerRootPath(resource.authority);
        if (distro) {
          return URI.from({ scheme: Schemas.file, authority: "wsl$", path: `/${distro}${resource.path}` });
        }
      }
      return void 0;
    }
    default:
      return void 0;
  }
}
export { revealResourcesInOS, toLocalFileUri };
