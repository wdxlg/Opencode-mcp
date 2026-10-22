// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/remote/common/remoteFileSystemProviderClient.ts
import { DiskFileSystemProviderClient } from "./module-3844.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Schemas } from "./module-0033.mjs";
import { getErrorMessage } from "./module-0004.mjs";


// src/vs/workbench/services/remote/common/remoteFileSystemProviderClient.ts
var REMOTE_FILE_SYSTEM_CHANNEL_NAME = "remoteFilesystem";

var RemoteFileSystemProviderClient = class _RemoteFileSystemProviderClient extends DiskFileSystemProviderClient {
  static register(remoteAgentService, fileService, logService) {
    const connection = remoteAgentService.getConnection();
    if (!connection) {
      return Disposable.None;
    }
    const disposables = new DisposableStore();
    const environmentPromise = (async () => {
      try {
        const environment = await remoteAgentService.getRawEnvironment();
        if (environment) {
          fileService.registerProvider(Schemas.vscodeRemote, disposables.add(new _RemoteFileSystemProviderClient(environment, connection)));
        } else {
          logService.error("Cannot register remote filesystem provider. Remote environment doesnot exist.");
        }
      } catch (error) {
        logService.error("Cannot register remote filesystem provider. Error while fetching remote environment.", getErrorMessage(error));
      }
    })();
    disposables.add(fileService.onWillActivateFileSystemProvider((e4) => {
      if (e4.scheme === Schemas.vscodeRemote) {
        e4.join(environmentPromise);
      }
    }));
    return disposables;
  }
  constructor(remoteAgentEnvironment, connection) {
    super(connection.getChannel(REMOTE_FILE_SYSTEM_CHANNEL_NAME), { pathCaseSensitive: remoteAgentEnvironment.os === 3 /* Linux */ });
  }
};
export { REMOTE_FILE_SYSTEM_CHANNEL_NAME, RemoteFileSystemProviderClient };
