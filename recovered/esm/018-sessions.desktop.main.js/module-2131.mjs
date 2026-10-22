// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalUri.ts
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalUri.ts
function parseTerminalUri(resource) {
  const [, workspaceId, instanceId] = resource.path.split("/");
  if (!workspaceId || !Number.parseInt(instanceId)) {
    throw new Error(`Could not parse terminal uri for resource ${resource}`);
  }
  return { workspaceId, instanceId: Number.parseInt(instanceId) };
}

function getTerminalUri(workspaceId, instanceId, title, commandId) {
  const params = new URLSearchParams();
  if (commandId) {
    params.set("command", commandId);
  }
  return URI.from({
    scheme: Schemas.vscodeTerminal,
    path: `/${workspaceId}/${instanceId}`,
    fragment: title || void 0,
    query: commandId ? params.toString() : void 0
  });
}

function getTerminalResourcesFromDragEvent(event) {
  const resources = event.dataTransfer?.getData("Terminals" /* Terminals */);
  if (resources) {
    const json = JSON.parse(resources);
    const result = [];
    for (const entry of json) {
      result.push(URI.parse(entry));
    }
    return result.length === 0 ? void 0 : result;
  }
  return void 0;
}

function getInstanceFromResource(instances, resource) {
  if (resource) {
    for (const instance2 of instances) {
      if (instance2.resource.path === resource.path) {
        return instance2;
      }
    }
  }
  return void 0;
}
export { parseTerminalUri, getTerminalUri, getTerminalResourcesFromDragEvent, getInstanceFromResource };
