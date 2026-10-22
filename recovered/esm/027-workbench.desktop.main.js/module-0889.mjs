// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/externalServices/common/serviceMachineId.ts
import { generateUuid, isUUID } from "./module-0190.mjs";
import { VSBuffer } from "./module-0038.mjs";


// src/vs/platform/externalServices/common/serviceMachineId.ts
async function getServiceMachineId(environmentService, fileService, storageService) {
  let uuid = storageService ? storageService.get("storage.serviceMachineId", -1 /* APPLICATION */) || null : null;
  if (uuid) {
    return uuid;
  }
  try {
    const contents = await fileService.readFile(environmentService.serviceMachineIdResource);
    const value2 = contents.value.toString();
    uuid = isUUID(value2) ? value2 : null;
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
export { getServiceMachineId };
