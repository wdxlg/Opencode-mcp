// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/mcp/common/mcpGalleryManifest.ts
import { createDecorator } from "./module-0042.mjs";


// src/vs/platform/mcp/common/mcpGalleryManifest.ts
var IMcpGalleryManifestService = createDecorator("IMcpGalleryManifestService");

function getMcpGalleryManifestResourceUri(manifest, type2) {
  const [name, version] = type2.split("/");
  for (const resource of manifest.resources) {
    const [r, v] = resource.type.split("/");
    if (r !== name) {
      continue;
    }
    if (!version || v === version) {
      return resource.id;
    }
    break;
  }
  return void 0;
}
export { getMcpGalleryManifestResourceUri, IMcpGalleryManifestService };
