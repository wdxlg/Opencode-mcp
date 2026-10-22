// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/externalServices/common/serviceMachineId.ts
import { generateUuid, init_uuid, isUUID } from "./module-0055.mjs";
import { VSBuffer, init_buffer } from "./module-0050.mjs";
import { __esm } from "./module-0000.mjs";
import { init_storage2 } from "./module-0079.mjs";


// src/vs/platform/externalServices/common/serviceMachineId.ts
async function getServiceMachineId(environmentService, fileService, storageService) {
  let uuid = storageService ? storageService.get("storage.serviceMachineId", -1 /* APPLICATION */) || null : null;
  if (uuid) {
    return uuid;
  }
  try {
    const contents = await fileService.readFile(environmentService.serviceMachineIdResource);
    const value = contents.value.toString();
    uuid = isUUID(value) ? value : null;
  } catch (e) {
    uuid = null;
  }
  if (!uuid) {
    uuid = generateUuid();
    try {
      await fileService.writeFile(environmentService.serviceMachineIdResource, VSBuffer.fromString(uuid));
    } catch (error) {
    }
  }
  storageService?.store("storage.serviceMachineId", uuid, -1 /* APPLICATION */, 1 /* MACHINE */);
  return uuid;
}

var init_serviceMachineId = __esm({
  "src/vs/platform/externalServices/common/serviceMachineId.ts"() {
    init_buffer();
    init_uuid();
    init_storage2();
  }
});
export { getServiceMachineId, init_serviceMachineId };
