// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/files/common/diskFileSystemProviderClient.ts
import { __esm } from "./module-0000.mjs";
import { init_buffer } from "./module-0050.mjs";
import { init_errorMessage } from "./module-0047.mjs";
import { init_errors } from "./module-0010.mjs";
import { init_event } from "./module-0021.mjs";
import { init_lifecycle } from "./module-0018.mjs";
import { init_stream } from "./module-0049.mjs";
import { init_uuid } from "./module-0055.mjs";
import { init_files } from "./module-0072.mjs";
import { init_watcher } from "./module-0178.mjs";


// src/vs/platform/files/common/diskFileSystemProviderClient.ts
var LOCAL_FILE_SYSTEM_CHANNEL_NAME;

var init_diskFileSystemProviderClient = __esm({
  "src/vs/platform/files/common/diskFileSystemProviderClient.ts"() {
    init_buffer();
    init_errorMessage();
    init_errors();
    init_event();
    init_lifecycle();
    init_stream();
    init_uuid();
    init_files();
    init_watcher();
    LOCAL_FILE_SYSTEM_CHANNEL_NAME = "localFilesystem";
  }
});
export { LOCAL_FILE_SYSTEM_CHANNEL_NAME, init_diskFileSystemProviderClient };
