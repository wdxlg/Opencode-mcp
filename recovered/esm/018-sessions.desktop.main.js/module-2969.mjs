// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/log/browser/log.ts
import { relativePath } from "./module-0034.mjs";


// src/vs/platform/log/browser/log.ts
async function getLogs(fileService, environmentService) {
  const result = [];
  await doGetLogs(fileService, result, environmentService.logsHome, environmentService.logsHome);
  return result;
}

async function doGetLogs(fileService, logs, curFolder, logsHome) {
  const stat = await fileService.resolve(curFolder);
  for (const { resource, isDirectory } of stat.children || []) {
    if (isDirectory) {
      await doGetLogs(fileService, logs, resource, logsHome);
    } else {
      const contents = (await fileService.readFile(resource)).value.toString();
      if (contents) {
        const path = relativePath(logsHome, resource);
        if (path) {
          logs.push({ relativePath: path, contents });
        }
      }
    }
  }
}
export { getLogs, doGetLogs };
