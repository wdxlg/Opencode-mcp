// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/debugSource.ts
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { DEBUG_SCHEME } from "./module-1058.mjs";
import { isUriString } from "./module-1060.mjs";
import { isAbsolute } from "./module-0026.mjs";


// src/vs/workbench/contrib/debug/common/debugSource.ts
var UNKNOWN_SOURCE_LABEL = localize(14862, null);

function getUriFromSource(raw, path, sessionId, uriIdentityService, logService) {
  const _getUriFromSource = (path2) => {
    if (typeof raw.sourceReference === "number" && raw.sourceReference > 0) {
      return URI.from({
        scheme: DEBUG_SCHEME,
        path: path2?.replace(/^\/+/g, "/"),
        // #174054
        query: `session=${sessionId}&ref=${raw.sourceReference}`
      });
    }
    if (path2 && isUriString(path2)) {
      return uriIdentityService.asCanonicalUri(URI.parse(path2));
    }
    if (path2 && isAbsolute(path2)) {
      return uriIdentityService.asCanonicalUri(URI.file(path2));
    }
    return uriIdentityService.asCanonicalUri(URI.from({
      scheme: DEBUG_SCHEME,
      path: path2,
      query: `session=${sessionId}`
    }));
  };
  try {
    return _getUriFromSource(path);
  } catch (err) {
    logService.error("Invalid path from debug adapter: " + path);
    return _getUriFromSource("/invalidDebugSource");
  }
}
export { getUriFromSource, UNKNOWN_SOURCE_LABEL };
