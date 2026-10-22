// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionGalleryManifest.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/extensionManagement/common/extensionGalleryManifest.ts
var IExtensionGalleryManifestService = createDecorator("IExtensionGalleryManifestService");

function getExtensionGalleryManifestResourceUri(manifest, type) {
  const [name, version2] = type.split("/");
  for (const resource of manifest.resources) {
    const [r2, v2] = resource.type.split("/");
    if (r2 !== name) {
      continue;
    }
    if (!version2 || v2 === version2) {
      return resource.id;
    }
    break;
  }
  return void 0;
}

var ExtensionGalleryServiceUrlConfigKey = "extensions.gallery.serviceUrl";
export { getExtensionGalleryManifestResourceUri, IExtensionGalleryManifestService, ExtensionGalleryServiceUrlConfigKey };
