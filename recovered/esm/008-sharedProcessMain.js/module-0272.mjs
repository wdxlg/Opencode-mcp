// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/base/node/osDisplayProtocolInfo.ts
import { env } from "./module-0016.mjs";
import { join } from "./module-0023.mjs";


// src/vs/base/node/osDisplayProtocolInfo.ts
import { constants as FSConstants2, promises as FSPromises2 } from "fs";

var XDG_SESSION_TYPE = "XDG_SESSION_TYPE";

var WAYLAND_DISPLAY = "WAYLAND_DISPLAY";

var XDG_RUNTIME_DIR2 = "XDG_RUNTIME_DIR";

async function getDisplayProtocol(errorLogger) {
  const xdgSessionType = env[XDG_SESSION_TYPE];
  if (xdgSessionType) {
    return xdgSessionType === "wayland" /* Wayland */ || xdgSessionType === "x11" /* X11 */ ? xdgSessionType : "unknown" /* Unknown */;
  } else {
    const waylandDisplay = env[WAYLAND_DISPLAY];
    if (!waylandDisplay) {
      return "x11" /* X11 */;
    } else {
      const xdgRuntimeDir = env[XDG_RUNTIME_DIR2];
      if (!xdgRuntimeDir) {
        return "unknown" /* Unknown */;
      } else {
        const waylandServerPipe = join(xdgRuntimeDir, "wayland-0");
        try {
          await FSPromises2.access(waylandServerPipe, FSConstants2.R_OK);
          return "wayland" /* Wayland */;
        } catch (err) {
          errorLogger(err);
          return "unknown" /* Unknown */;
        }
      }
    }
  }
}

function getCodeDisplayProtocol(displayProtocol, ozonePlatform) {
  if (!ozonePlatform) {
    return displayProtocol === "wayland" /* Wayland */ ? "xwayland" /* XWayland */ : "x11" /* X11 */;
  } else {
    switch (ozonePlatform) {
      case "auto":
        return displayProtocol;
      case "x11":
        return displayProtocol === "wayland" /* Wayland */ ? "xwayland" /* XWayland */ : "x11" /* X11 */;
      case "wayland":
        return "wayland" /* Wayland */;
      default:
        return "unknown" /* Unknown */;
    }
  }
}
export { getDisplayProtocol, getCodeDisplayProtocol, FSConstants2, FSPromises2, XDG_SESSION_TYPE, WAYLAND_DISPLAY, XDG_RUNTIME_DIR2 };
